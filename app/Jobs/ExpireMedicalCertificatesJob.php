<?php

namespace App\Jobs;

use App\Enums\MedicalCertificateStatus;
use App\Models\MedicalCertificate;
use App\Services\AuditLogger;
use App\Services\MedicalCertificateStateMachine;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class ExpireMedicalCertificatesJob implements ShouldQueue
{
    use Queueable;

    public function handle(AuditLogger $audit, MedicalCertificateStateMachine $sm): void
    {
        $expired = MedicalCertificate::where('status', MedicalCertificateStatus::Valid)
            ->whereDate('expires_at', '<', now())
            ->get();

        foreach ($expired as $cert) {
            $sm->markExpired($cert);
            $audit->log('certificate.expired_by_cron', $cert);
        }
    }
}
