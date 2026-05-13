<?php

use App\Enums\MedicalCertificateStatus;
use App\Jobs\ExpireMedicalCertificatesJob;
use App\Models\MedicalCertificate;

it('marks valid certs with past expires_at as expired', function () {
    $cert = MedicalCertificate::factory()->create([
        'status' => MedicalCertificateStatus::Valid,
        'expires_at' => now()->subDay(),
    ]);
    $stillValid = MedicalCertificate::factory()->create([
        'status' => MedicalCertificateStatus::Valid,
        'expires_at' => now()->addMonth(),
    ]);

    ExpireMedicalCertificatesJob::dispatchSync();

    expect($cert->fresh()->status)->toBe(MedicalCertificateStatus::Expired);
    expect($stillValid->fresh()->status)->toBe(MedicalCertificateStatus::Valid);
});

it('does not touch non-valid certs', function () {
    $pending = MedicalCertificate::factory()->pending()->create([
        'expires_at' => now()->subDay(),
    ]);
    $superseded = MedicalCertificate::factory()->create([
        'status' => MedicalCertificateStatus::Superseded,
        'expires_at' => now()->subDay(),
    ]);

    ExpireMedicalCertificatesJob::dispatchSync();

    expect($pending->fresh()->status)->toBe(MedicalCertificateStatus::Pending);
    expect($superseded->fresh()->status)->toBe(MedicalCertificateStatus::Superseded);
});
