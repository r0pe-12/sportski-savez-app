<?php

namespace App\Contracts;

use App\Adapters\EDnevnik\Dto\EDnevnikStudentDto;
use App\Adapters\EDnevnik\Exceptions\EDnevnikNotFoundException;
use App\Adapters\EDnevnik\Exceptions\EDnevnikUnavailableException;

interface EDnevnikAdapter
{
    /**
     * Dohvat učenika iz eDnevnik-a po JMB-u.
     *
     * @throws EDnevnikNotFoundException
     * @throws EDnevnikUnavailableException
     */
    public function fetchStudentByJmb(string $jmb): EDnevnikStudentDto;
}
