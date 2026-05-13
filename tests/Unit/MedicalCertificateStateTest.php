<?php

use App\Enums\MedicalCertificateStatus;
use App\Models\MedicalCertificate;
use App\Services\MedicalCertificateStateMachine;

beforeEach(function () {
    $this->sm = app(MedicalCertificateStateMachine::class);
});

it('pending → valid allowed', function () {
    $cert = MedicalCertificate::factory()->pending()->create();
    $this->sm->markValid($cert, now()->addYear(), 'Petar Petrović', 0.95);

    expect($cert->fresh()->status)->toBe(MedicalCertificateStatus::Valid);
});

it('valid → pending throws', function () {
    $cert = MedicalCertificate::factory()->create();
    expect(fn () => $this->sm->transitionTo($cert, MedicalCertificateStatus::Pending))
        ->toThrow(DomainException::class);
});

it('any → superseded when replaced', function () {
    $cert = MedicalCertificate::factory()->create();
    $this->sm->markSuperseded($cert);
    expect($cert->fresh()->status)->toBe(MedicalCertificateStatus::Superseded);
});

it('valid certificate can transition to expired and superseded', function () {
    $cert = MedicalCertificate::factory()->create();
    $this->sm->markExpired($cert);
    expect($cert->fresh()->status)->toBe(MedicalCertificateStatus::Expired);

    $this->sm->markSuperseded($cert);
    expect($cert->fresh()->status)->toBe(MedicalCertificateStatus::Superseded);
});

it('manual_review can be approved as valid', function () {
    $cert = MedicalCertificate::factory()->pending()->create();
    $this->sm->markManualReview($cert, 'low confidence');
    expect($cert->fresh()->status)->toBe(MedicalCertificateStatus::ManualReview);

    $this->sm->markValid($cert, now()->addYear(), 'Petar Petrović', 1.0);
    expect($cert->fresh()->status)->toBe(MedicalCertificateStatus::Valid);
});
