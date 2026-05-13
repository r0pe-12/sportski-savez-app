<?php

namespace App\Observers;

use App\Models\Competition;
use Illuminate\Support\Facades\Cache;

class CompetitionObserver
{
    public function saved(Competition $competition): void
    {
        Cache::forget('competitions.upcoming');
        Cache::forget('competitions.public');
    }

    public function deleted(Competition $competition): void
    {
        Cache::forget('competitions.upcoming');
        Cache::forget('competitions.public');
    }
}
