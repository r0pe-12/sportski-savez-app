<?php

namespace App\Jobs;

use App\Contracts\OcrAdapter;
use App\Enums\MedicalCertificateStatus;
use App\Models\MedicalCertificate;
use App\Services\AuditLogger;
use App\Services\MedicalCertificateStateMachine;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class ValidateMedicalCertificateJob implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public int $backoff = 30;

    public function __construct(public int $certificateId)
    {
        $this->onQueue('ocr');
    }

    public function handle(OcrAdapter $ocr, AuditLogger $audit, MedicalCertificateStateMachine $sm): void
    {
        $cert = MedicalCertificate::find($this->certificateId);
        if (! $cert || $cert->status !== MedicalCertificateStatus::Pending) {
            return; // već procesiran ili obrisan (race)
        }

        $result = $ocr->extract($cert->path, $cert->original_filename);

        if ($result->needsManualReview()) {
            $sm->markManualReview($cert, 'OCR confidence too low: '.$result->confidence);
            $audit->log('certificate.manual_review', $cert, $result->toArray());

            return;
        }

        if ($result->expiresAt === null || $result->extractedName === null) {
            $sm->markInvalid($cert, 'OCR returned incomplete data');
            $audit->log('certificate.invalidated', $cert, $result->toArray());

            return;
        }

        if ($result->isExpired()) {
            $cert->update([
                'expires_at' => $result->expiresAt,
                'issued_at' => $result->issuedAt,
                'extracted_name' => $result->extractedName,
                'ocr_confidence' => $result->confidence,
            ]);
            $sm->markExpired($cert);
            $audit->log('certificate.expired', $cert, $result->toArray());

            return;
        }

        $sm->markValid($cert, $result->expiresAt, $result->extractedName, $result->confidence);
        $cert->update(['issued_at' => $result->issuedAt]);
        $audit->log('certificate.validated', $cert, $result->toArray());
    }
}
