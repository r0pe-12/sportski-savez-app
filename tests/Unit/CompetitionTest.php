<?php

use App\Enums\CompetitionStatus;
use App\Models\Competition;
use App\Models\Sport;

it('competition belongs to a sport', function () {
    $sport = Sport::factory()->team()->create(['slug' => 'fudbal-c1']);
    $comp = Competition::factory()->create(['sport_id' => $sport->id, 'slug' => 'comp-fudbal-1']);

    expect($comp->sport->id)->toBe($sport->id);
});

it('past competition has Completed status', function () {
    $comp = Competition::factory()->past()->create(['slug' => 'past-comp']);
    expect($comp->status)->toBe(CompetitionStatus::Completed);
});
