<?php

use App\Enums\MedicalCertificateStatus;
use App\Jobs\ValidateMedicalCertificateJob;
use App\Models\MedicalCertificate;

it('marks certificate valid for proper filename and future date', function () {
    $cert = MedicalCertificate::factory()->pending()->create([
        'original_filename' => 'petar_petrovic_2028-12-31.pdf',
        'path' => 'fake/path.pdf',
    ]);

    ValidateMedicalCertificateJob::dispatchSync($cert->id);

    expect($cert->fresh()->status)->toBe(MedicalCertificateStatus::Valid);
});

it('marks expired for past filename date', function () {
    $cert = MedicalCertificate::factory()->pending()->create([
        'original_filename' => 'ana_anic_2020-01-01.pdf',
        'path' => 'fake/path.pdf',
    ]);

    ValidateMedicalCertificateJob::dispatchSync($cert->id);

    expect($cert->fresh()->status)->toBe(MedicalCertificateStatus::Expired);
});

it('marks manual_review when OCR confidence is low', function () {
    $cert = MedicalCertificate::factory()->pending()->create([
        'original_filename' => 'random_garbage.pdf',
        'path' => 'fake/path.pdf',
    ]);

    ValidateMedicalCertificateJob::dispatchSync($cert->id);

    expect($cert->fresh()->status)->toBe(MedicalCertificateStatus::ManualReview);
});

it('does nothing if cert already processed', function () {
    $cert = MedicalCertificate::factory()->create([
        'status' => MedicalCertificateStatus::Valid,
        'original_filename' => 'petar_petrovic_2028-12-31.pdf',
        'path' => 'fake/path.pdf',
    ]);

    ValidateMedicalCertificateJob::dispatchSync($cert->id);

    expect($cert->fresh()->status)->toBe(MedicalCertificateStatus::Valid);
});

it('does nothing if cert deleted before processing', function () {
    expect(fn () => ValidateMedicalCertificateJob::dispatchSync(999999))
        ->not->toThrow(Throwable::class);
});
