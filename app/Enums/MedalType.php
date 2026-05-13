<?php

namespace App\Enums;

enum MedalType: string
{
    case Gold = 'gold';
    case Silver = 'silver';
    case Bronze = 'bronze';
    case Participation = 'participation';

    public static function fromPlacement(int $placement): self
    {
        return match ($placement) {
            1 => self::Gold,
            2 => self::Silver,
            3 => self::Bronze,
            default => self::Participation,
        };
    }
}
