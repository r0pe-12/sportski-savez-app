<?php

namespace App\Enums;

enum MedicalCertificateStatus: string
{
    case Pending = 'pending';
    case Valid = 'valid';
    case Expired = 'expired';
    case Invalid = 'invalid';
    case ManualReview = 'manual_review';
    case Superseded = 'superseded';

    /** @return array<self> */
    public function nextStates(): array
    {
        return match ($this) {
            self::Pending => [self::Valid, self::Expired, self::Invalid, self::ManualReview],
            self::Valid => [self::Expired, self::Superseded],
            self::Expired => [self::Superseded],
            self::Invalid => [self::Superseded],
            self::ManualReview => [self::Valid, self::Invalid, self::Superseded],
            self::Superseded => [],
        };
    }
}
