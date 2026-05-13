<?php

namespace App\Observers;

use App\Models\Sport;
use Illuminate\Support\Facades\Cache;

class SportObserver
{
    public function saved(Sport $sport): void
    {
        Cache::forget('sports.active');
    }

    public function deleted(Sport $sport): void
    {
        Cache::forget('sports.active');
    }
}
