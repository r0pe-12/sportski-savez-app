<?php

namespace App\Adapters\Ocr\Dto;

use Carbon\CarbonInterface;

readonly class OcrResult
{
    public function __construct(
        public ?string $extractedName,
        public ?CarbonInterface $issuedAt,
        public ?CarbonInterface $expiresAt,
        public float $confidence,
        public string $rawResponse = '',
    ) {}

    public function isExpired(): bool
    {
        return $this->expiresAt?->isPast() ?? false;
    }

    public function needsManualReview(): bool
    {
        return $this->confidence < (float) config('ocr.manual_review_threshold', 0.6);
    }

    /** @return array<string, mixed> */
    public function toArray(): array
    {
        return [
            'extracted_name' => $this->extractedName,
            'issued_at' => $this->issuedAt?->toDateString(),
            'expires_at' => $this->expiresAt?->toDateString(),
            'confidence' => $this->confidence,
        ];
    }
}
