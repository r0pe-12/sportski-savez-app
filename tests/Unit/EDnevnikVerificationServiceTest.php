<?php

use App\Adapters\EDnevnik\Dto\EDnevnikStudentDto;
use App\Models\School;
use App\Models\Student;
use App\Services\EDnevnikVerificationService;
use Carbon\CarbonImmutable;

it('compares all fields and returns verified when match', function () {
    $school = School::factory()->create(['code' => 'OS-PG-001']);
    $student = Student::factory()->forSchool($school)->create([
        'name' => 'Marko Marković', 'grade' => '8-1', 'jmb' => '0101010250010',
    ]);

    $remote = new EDnevnikStudentDto(
        '0101010250010', 'Marko', 'Marković', 'OS-PG-001', '8-1', true, CarbonImmutable::now()
    );

    $result = app(EDnevnikVerificationService::class)->compare($student, $remote);
    expect($result->verified)->toBeTrue();
    expect($result->mismatches)->toBeEmpty();
});

it('detects grade mismatch', function () {
    $school = School::factory()->create(['code' => 'OS-PG-001']);
    $student = Student::factory()->forSchool($school)->create([
        'name' => 'Ana Anić', 'grade' => '8-1', 'jmb' => '0202020250011',
    ]);

    $remote = new EDnevnikStudentDto(
        '0202020250011', 'Ana', 'Anić', 'OS-PG-001', '9-9', true, CarbonImmutable::now()
    );

    $result = app(EDnevnikVerificationService::class)->compare($student, $remote);
    expect($result->verified)->toBeFalse();
    expect($result->mismatches)->toHaveKey('razred');
});

it('detects multiple field mismatches', function () {
    $school = School::factory()->create(['code' => 'OS-PG-001']);
    $student = Student::factory()->forSchool($school)->create([
        'name' => 'Petar Petrović', 'grade' => '7-1', 'jmb' => '0303030250012',
    ]);

    $remote = new EDnevnikStudentDto(
        '0303030250012', 'Pavle', 'Petrović', 'OS-PG-002', '8-1', true, CarbonImmutable::now()
    );

    $result = app(EDnevnikVerificationService::class)->compare($student, $remote);
    expect($result->mismatches)->toHaveKeys(['ime', 'razred', 'sifra_skole']);
});

it('is case-insensitive on name and surname', function () {
    $school = School::factory()->create(['code' => 'OS-PG-001']);
    $student = Student::factory()->forSchool($school)->create([
        'name' => 'marko marković', 'grade' => '8-1', 'jmb' => '0404040250013',
    ]);

    $remote = new EDnevnikStudentDto(
        '0404040250013', 'MARKO', 'MARKOVIĆ', 'OS-PG-001', '8-1', true, CarbonImmutable::now()
    );

    $result = app(EDnevnikVerificationService::class)->compare($student, $remote);
    expect($result->verified)->toBeTrue();
});
