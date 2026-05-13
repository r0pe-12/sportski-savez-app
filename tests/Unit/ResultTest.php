<?php

use App\Enums\MedalType;
use App\Models\Result;
use App\Models\Team;

it('result morphs to a team subject', function () {
    $team = Team::factory()->create();
    $result = Result::factory()->forTeam($team)->gold()->create();

    expect($result->subject)->toBeInstanceOf(Team::class);
    expect($result->subject->id)->toBe($team->id);
    expect($result->medal_type)->toBe(MedalType::Gold);
});

it('MedalType::fromPlacement returns correct medal', function () {
    expect(MedalType::fromPlacement(1))->toBe(MedalType::Gold);
    expect(MedalType::fromPlacement(2))->toBe(MedalType::Silver);
    expect(MedalType::fromPlacement(3))->toBe(MedalType::Bronze);
    expect(MedalType::fromPlacement(10))->toBe(MedalType::Participation);
});
