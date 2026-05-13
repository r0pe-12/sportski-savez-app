<?php

use App\Adapters\EDnevnik\Dto\EDnevnikStudentDto;
use App\Adapters\EDnevnik\Exceptions\EDnevnikNotFoundException;
use App\Contracts\EDnevnikAdapter;
use App\Models\Student;

beforeEach(fn () => $this->adapter = app(EDnevnikAdapter::class));

it('returns verified data for seeded JMB', function () {
    Student::factory()->create(['jmb' => '0101010250001']);
    $dto = $this->adapter->fetchStudentByJmb('0101010250001');

    expect($dto)->toBeInstanceOf(EDnevnikStudentDto::class);
    expect($dto->jmb)->toBe('0101010250001');
    expect($dto->redovan)->toBeTrue();
});

it('throws NotFound for unknown JMB', function () {
    expect(fn () => $this->adapter->fetchStudentByJmb('9999999999999'))
        ->toThrow(EDnevnikNotFoundException::class);
});

it('returns mismatched data for specific test JMB pattern', function () {
    Student::factory()->create(['jmb' => '0000000000001', 'grade' => '8-2']);
    $dto = $this->adapter->fetchStudentByJmb('0000000000001');

    expect($dto->razred)->not->toBe('8-2');
});

it('returns data even when student exists locally with different data (mismatch testing)', function () {
    Student::factory()->create([
        'jmb' => '0101010250002',
        'name' => 'Lokalno Ime',
    ]);
    $dto = $this->adapter->fetchStudentByJmb('0101010250002');

    expect($dto->ime.' '.$dto->prezime)->toBe('Lokalno Ime');
});
