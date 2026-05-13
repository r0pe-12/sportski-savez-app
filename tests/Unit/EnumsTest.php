<?php

use App\Enums\CompetitionStatus;
use App\Enums\MedalType;
use App\Enums\MedicalCertificateStatus;
use App\Enums\SportType;
use App\Enums\StudentVerificationStatus;
use App\Enums\TeamStatus;
use App\Enums\UserRole;

it('UserRole has 3 cases', function () {
    expect(UserRole::cases())->toHaveCount(3);
    expect(UserRole::Admin->value)->toBe('admin');
    expect(UserRole::Professor->value)->toBe('professor');
    expect(UserRole::Student->value)->toBe('student');
});

it('SportType has 2 cases', function () {
    expect(SportType::cases())->toHaveCount(2);
    expect(SportType::Team->value)->toBe('team_sport');
    expect(SportType::Individual->value)->toBe('individual_sport');
});

it('TeamStatus has 7 cases per spec 7.4.1', function () {
    expect(TeamStatus::cases())->toHaveCount(7);
    expect(array_map(fn ($c) => $c->value, TeamStatus::cases()))
        ->toEqualCanonicalizing([
            'draft', 'submitted', 'active',
            'rejected', 'cancelled', 'withdrawn', 'completed',
        ]);
});

it('MedicalCertificateStatus has 6 cases per spec 7.4.2', function () {
    expect(MedicalCertificateStatus::cases())->toHaveCount(6);
    expect(array_map(fn ($c) => $c->value, MedicalCertificateStatus::cases()))
        ->toEqualCanonicalizing([
            'pending', 'valid', 'expired', 'invalid', 'manual_review', 'superseded',
        ]);
});

it('StudentVerificationStatus has 5 cases per spec 7.4.3', function () {
    expect(StudentVerificationStatus::cases())->toHaveCount(5);
    expect(array_map(fn ($c) => $c->value, StudentVerificationStatus::cases()))
        ->toEqualCanonicalizing([
            'unverified', 'pending', 'verified', 'mismatched', 'failed',
        ]);
});

it('MedalType has 4 cases per spec 17.2', function () {
    expect(MedalType::cases())->toHaveCount(4);
    expect(array_map(fn ($c) => $c->value, MedalType::cases()))
        ->toEqualCanonicalizing(['gold', 'silver', 'bronze', 'participation']);
});

it('CompetitionStatus has 4 cases', function () {
    expect(CompetitionStatus::cases())->toHaveCount(4);
});
