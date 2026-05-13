<?php

use App\Enums\SportType;
use App\Models\Sport;

it('creates a team sport via factory', function () {
    $sport = Sport::factory()->team(7, 5)->create(['name' => 'Rukomet', 'slug' => 'rukomet-test']);
    expect($sport->type)->toBe(SportType::Team);
    expect($sport->members_count)->toBe(7);
});

it('individual sport has 1 member', function () {
    $sport = Sport::factory()->individual()->create(['slug' => 'atletika-test']);
    expect($sport->type)->toBe(SportType::Individual);
    expect($sport->members_count)->toBe(1);
});

it('soft deletes a sport', function () {
    $sport = Sport::factory()->create(['slug' => 'fudbal-test']);
    $sport->delete();
    expect(Sport::find($sport->id))->toBeNull();
    expect(Sport::withTrashed()->find($sport->id))->not->toBeNull();
});
