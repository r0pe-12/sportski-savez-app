<?php

namespace App\Adapters\EDnevnik;

use App\Adapters\EDnevnik\Dto\EDnevnikStudentDto;
use App\Adapters\EDnevnik\Exceptions\EDnevnikNotFoundException;
use App\Contracts\EDnevnikAdapter;
use App\Models\Student;
use Carbon\CarbonImmutable;
use Illuminate\Support\Str;

class FakeEDnevnikAdapter implements EDnevnikAdapter
{
    /**
     * Determinističko ponašanje:
     * - JMB koji počinje sa "99999" → throw NotFound
     * - JMB koji počinje sa "00000" → mismatched (razred izmijenjen)
     * - Inače: vraća podatke koje matchuju lokalnu bazu (verified case)
     */
    public function fetchStudentByJmb(string $jmb): EDnevnikStudentDto
    {
        if (Str::startsWith($jmb, '99999')) {
            throw new EDnevnikNotFoundException("Student with JMB {$jmb} not found in eDnevnik.");
        }

        $student = Student::withoutGlobalScope('student')
            ->where('jmb', $jmb)
            ->first();

        if (! $student) {
            throw new EDnevnikNotFoundException("Student with JMB {$jmb} not found in local DB (for fake adapter).");
        }

        $parts = explode(' ', (string) $student->name, 2);
        $ime = $parts[0] ?? '';
        $prezime = $parts[1] ?? '';

        $razred = $student->grade ?? '7-1';
        if (Str::startsWith($jmb, '00000')) {
            $razred = '9-9';
        }

        return new EDnevnikStudentDto(
            jmb: $jmb,
            ime: $ime,
            prezime: $prezime,
            sifraSkole: $student->school?->code ?? 'OS-UNKNOWN',
            razred: $razred,
            redovan: true,
            datumZadnjegStatusa: CarbonImmutable::now()->subDays(7),
        );
    }
}
