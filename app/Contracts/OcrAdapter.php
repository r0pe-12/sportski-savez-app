<?php

namespace App\Contracts;

use App\Adapters\Ocr\Dto\OcrResult;

interface OcrAdapter
{
    /**
     * Ekstrahuje podatke iz dokumenta.
     *
     * @param  string  $path  Path u storage disk-u.
     * @param  string  $originalFilename  Ime fajla koje korisnik uploadovao
     *                                    (fake adapter koristi za hint).
     */
    public function extract(string $path, string $originalFilename): OcrResult;
}
