<?php

namespace App\Services;

use App\Adapters\EDnevnik\Dto\EDnevnikStudentDto;
use App\Models\Student;
use App\Services\EDnevnik\VerificationResult;

class EDnevnikVerificationService
{
    /**
     * Poređenje lokalnog Student-a sa podacima vraćenim iz eDnevnik adaptera.
     *
     * Razdvajamo `name` na prvi razmak: prvi token je ime, ostatak je prezime.
     * Sva poređenja stringova su case-insensitive i trim-ovana.
     */
    public function compare(Student $local, EDnevnikStudentDto $remote): VerificationResult
    {
        $parts = explode(' ', trim((string) $local->name), 2);
        $localIme = $parts[0] ?? '';
        $localPrezime = $parts[1] ?? '';

        $mismatches = [];

        if (! $this->ciEquals($localIme, $remote->ime)) {
            $mismatches['ime'] = ['local' => $localIme, 'remote' => $remote->ime];
        }

        if (! $this->ciEquals($localPrezime, $remote->prezime)) {
            $mismatches['prezime'] = ['local' => $localPrezime, 'remote' => $remote->prezime];
        }

        if ((string) $local->grade !== $remote->razred) {
            $mismatches['razred'] = ['local' => (string) $local->grade, 'remote' => $remote->razred];
        }

        $localCode = $local->school?->code ?? '';
        if ($localCode !== $remote->sifraSkole) {
            $mismatches['sifra_skole'] = [
                'local' => $localCode,
                'remote' => $remote->sifraSkole,
            ];
        }

        return new VerificationResult(
            verified: count($mismatches) === 0,
            mismatches: $mismatches,
        );
    }

    private function ciEquals(string $a, string $b): bool
    {
        return mb_strtolower(trim($a)) === mb_strtolower(trim($b));
    }
}
