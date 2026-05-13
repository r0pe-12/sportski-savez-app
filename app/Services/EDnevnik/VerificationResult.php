<?php

namespace App\Services\EDnevnik;

/**
 * Rezultat poređenja lokalnog Student-a sa remote EDnevnikStudentDto.
 */
readonly class VerificationResult
{
    /**
     * @param  array<string, array{local: string, remote: string}>  $mismatches
     */
    public function __construct(
        public bool $verified,
        public array $mismatches,
    ) {}
}
