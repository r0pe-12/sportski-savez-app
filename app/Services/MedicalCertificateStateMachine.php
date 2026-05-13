<?php

namespace App\Services;

use App\Enums\MedicalCertificateStatus;
use App\Models\MedicalCertificate;
use Carbon\CarbonInterface;

class MedicalCertificateStateMachine
{
    public function transitionTo(MedicalCertificate $cert, MedicalCertificateStatus $next): void
    {
        if (! in_array($next, $cert->status->nextStates(), true)) {
            throw new \DomainException(
                "Invalid transition from {$cert->status->value} to {$next->value}."
            );
        }
        $cert->update(['status' => $next]);
    }

    public function markValid(MedicalCertificate $cert, CarbonInterface $expiresAt, string $extractedName, float $confidence): void
    {
        $this->transitionTo($cert, MedicalCertificateStatus::Valid);
        $cert->update([
            'expires_at' => $expiresAt,
            'extracted_name' => $extractedName,
            'ocr_confidence' => $confidence,
        ]);
    }

    public function markExpired(MedicalCertificate $cert): void
    {
        $this->transitionTo($cert, MedicalCertificateStatus::Expired);
    }

    public function markInvalid(MedicalCertificate $cert, string $reason = ''): void
    {
        $this->transitionTo($cert, MedicalCertificateStatus::Invalid);
        $cert->update(['ocr_raw_response' => $reason]);
    }

    public function markManualReview(MedicalCertificate $cert, string $reason = ''): void
    {
        $this->transitionTo($cert, MedicalCertificateStatus::ManualReview);
        $cert->update(['ocr_raw_response' => $reason]);
    }

    public function markSuperseded(MedicalCertificate $cert): void
    {
        $this->transitionTo($cert, MedicalCertificateStatus::Superseded);
    }
}
