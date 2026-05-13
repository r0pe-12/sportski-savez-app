<?php

namespace App\Enums;

enum CompetitionStatus: string
{
    case Draft = 'draft';
    case Open = 'open_registration';
    case InProgress = 'in_progress';
    case Completed = 'completed';
}
