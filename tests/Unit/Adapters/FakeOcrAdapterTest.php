<?php

use App\Adapters\Ocr\Dto\OcrResult;
use App\Contracts\OcrAdapter;

beforeEach(fn () => $this->adapter = app(OcrAdapter::class));

it('extracts name and dates from filename convention', function () {
    $result = $this->adapter->extract('storage/dummy', 'petar_petrovic_2027-06-15.pdf');

    expect($result)->toBeInstanceOf(OcrResult::class);
    expect($result->extractedName)->toBe('Petar Petrović');
    expect($result->expiresAt->toDateString())->toBe('2027-06-15');
    expect($result->confidence)->toBeGreaterThan(0.8);
});

it('returns expired when filename date is in past', function () {
    $result = $this->adapter->extract('storage/dummy', 'ana_anic_2020-01-01.pdf');
    expect($result->isExpired())->toBeTrue();
});

it('returns low confidence (manual review) for invalid filename', function () {
    $result = $this->adapter->extract('storage/dummy', 'random_garbage.pdf');
    expect($result->confidence)->toBeLessThan(0.5);
    expect($result->needsManualReview())->toBeTrue();
});

it('handles non-PDF MIME', function () {
    $result = $this->adapter->extract('storage/dummy', 'marko_markovic_2027-09-01.jpg');
    expect($result->extractedName)->toBe('Marko Marković');
});
