<?php

use App\Enums\TeamStatus;
use App\Models\Team;
use App\Models\TeamMember;

it('team is created in Draft status with UUID', function () {
    $team = Team::factory()->create();
    expect($team->status)->toBe(TeamStatus::Draft);
    expect($team->team_uuid)->toMatch('/^[0-9a-f-]{36}$/');
});

it('team has members, competition, school, professor relations', function () {
    $team = Team::factory()->create();
    TeamMember::factory()->count(3)->create(['team_id' => $team->id]);

    $loaded = Team::with(['members', 'competition', 'school', 'professor'])->find($team->id);
    expect($loaded->members)->toHaveCount(3);
    expect($loaded->competition)->not->toBeNull();
    expect($loaded->school)->not->toBeNull();
    expect($loaded->professor)->not->toBeNull();
});

it('TeamStatus transitions follow spec 7.4.1', function () {
    $draft = TeamStatus::Draft;
    expect($draft->nextStates())->toContain(TeamStatus::Submitted, TeamStatus::Cancelled);

    $submitted = TeamStatus::Submitted;
    expect($submitted->nextStates())->toContain(TeamStatus::Active);

    expect(TeamStatus::Completed->isTerminal())->toBeTrue();
    expect(TeamStatus::Draft->isTerminal())->toBeFalse();
});
