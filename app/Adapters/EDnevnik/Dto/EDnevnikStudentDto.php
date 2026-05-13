<?php

namespace App\Adapters\EDnevnik\Dto;

use Carbon\CarbonInterface;

readonly class EDnevnikStudentDto
{
    public function __construct(
        public string $jmb,
        public string $ime,
        public string $prezime,
        public string $sifraSkole,
        public string $razred,
        public bool $redovan,
        public CarbonInterface $datumZadnjegStatusa,
    ) {}
}
