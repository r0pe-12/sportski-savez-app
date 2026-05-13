<?php

namespace App\Adapters\Ocr;

use App\Adapters\Ocr\Dto\OcrResult;
use App\Contracts\OcrAdapter;
use Carbon\CarbonImmutable;
use Illuminate\Support\Str;

class FakeOcrAdapter implements OcrAdapter
{
    /**
     * File-name konvencija: {ime}_{prezime}_{YYYY-MM-DD}.{ext}
     * - ime/prezime dobijemo Title Case-om
     * - YYYY-MM-DD je expires_at
     * - issued_at = expires_at - 1 godina
     * - Ako filename ne matchuje, vraćamo low confidence (manual review)
     */
    public function extract(string $path, string $originalFilename): OcrResult
    {
        $stem = pathinfo($originalFilename, PATHINFO_FILENAME);

        if (! preg_match('/^([a-zA-ZčČćĆđĐšŠžŽ]+)_([a-zA-ZčČćĆđĐšŠžŽ]+)_(\d{4}-\d{2}-\d{2})$/u', $stem, $m)) {
            return new OcrResult(
                extractedName: null,
                issuedAt: null,
                expiresAt: null,
                confidence: 0.35,
                rawResponse: 'FAKE_NO_MATCH',
            );
        }

        $name = Str::title($m[1]).' '.$this->restoreDiacritics(Str::title($m[2]));
        $expires = CarbonImmutable::createFromFormat('Y-m-d', $m[3])->startOfDay();
        $issued = $expires->subYear();

        return new OcrResult(
            extractedName: $name,
            issuedAt: $issued,
            expiresAt: $expires,
            confidence: 0.95,
            rawResponse: 'FAKE_MATCH',
        );
    }

    /**
     * Simulira OCR koji prepoznaje Montenegro/Serbian dijakritike na poznatim
     * sufiksima prezimena. Fake adapter — ne pokušava biti precizan,
     * samo deterministički za testove i demo.
     */
    private function restoreDiacritics(string $surname): string
    {
        // -ovic / -evic / -ic → -ović / -ević / -ić (Title Case)
        return preg_replace(
            ['/ovic$/u', '/evic$/u', '/ic$/u'],
            ['ović', 'ević', 'ić'],
            $surname
        );
    }
}
