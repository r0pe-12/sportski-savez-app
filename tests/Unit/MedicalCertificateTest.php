<?php

use App\Enums\MedicalCertificateStatus;
use App\Models\MedicalCertificate;

it('certificate is valid by default factory', function () {
    $cert = MedicalCertificate::factory()->create();
    expect($cert->isValid())->toBeTrue();
});

it('expired state has past expires_at', function () {
    $cert = MedicalCertificate::factory()->expired()->create();
    expect($cert->expires_at->isPast())->toBeTrue();
    expect($cert->status)->toBe(MedicalCertificateStatus::Expired);
});

it('certificate transitions follow spec 7.4.2', function () {
    expect(MedicalCertificateStatus::Pending->nextStates())
        ->toContain(MedicalCertificateStatus::Valid, MedicalCertificateStatus::Expired, MedicalCertificateStatus::Invalid, MedicalCertificateStatus::ManualReview);

    expect(MedicalCertificateStatus::Superseded->nextStates())->toBeEmpty();
});
