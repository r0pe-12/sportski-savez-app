<?php

namespace App\Enums;

enum SportType: string
{
    case Team = 'team_sport';
    case Individual = 'individual_sport';

    public function isTeam(): bool
    {
        return $this === self::Team;
    }
}
