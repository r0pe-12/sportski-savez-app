<?php

use App\Models\Sport;
use Illuminate\Support\Facades\Cache;

it('sports cache is cleared on sport save', function () {
    // Prime the cache
    Sport::factory()->create(['slug' => 'cache-prime']);
    Cache::remember('sports.active', now()->addHour(), fn () => Sport::all());

    expect(Cache::has('sports.active'))->toBeTrue();

    // New sport save should invalidate it via observer
    Sport::factory()->create(['slug' => 'cache-new']);

    expect(Cache::has('sports.active'))->toBeFalse();
});

it('sports cache rebuilds after invalidation', function () {
    Sport::factory()->create(['slug' => 'rebuild-1']);
    Cache::remember('sports.active', now()->addHour(), fn () => Sport::all());

    Sport::factory()->create(['slug' => 'rebuild-2']);

    // Posle observer-a, cache je forget-ovan
    expect(Cache::has('sports.active'))->toBeFalse();
});
