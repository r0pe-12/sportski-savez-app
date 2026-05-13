<?php

use App\Enums\MedalType;
use App\Enums\TeamStatus;
use App\Models\AuditLogEntry;
use App\Models\Competition;
use App\Models\Result;
use App\Models\Sport;
use App\Models\Team;
use App\Models\TeamMember;
use App\Services\ResultEntryService;

beforeEach(function () {
    $this->service = app(ResultEntryService::class);
    $this->sport = Sport::factory()->team()->create(['slug' => 'res-team-sport']);
    $this->comp = Competition::factory()->create(['sport_id' => $this->sport->id, 'slug' => 'res-comp']);
});

it('records team result with gold medal for placement 1', function () {
    $team = Team::factory()->create([
        'competition_id' => $this->comp->id,
        'status' => TeamStatus::Active,
    ]);

    $this->service->recordTeamResult($team, 1, MedalType::Gold);

    $result = Result::where('subject_type', Team::class)->where('subject_id', $team->id)->first();
    expect($result)->not->toBeNull();
    expect($result->medal_type)->toBe(MedalType::Gold);
    expect($team->fresh()->status)->toBe(TeamStatus::Completed);
});

it('records individual result and auto-completes team when all members have results', function () {
    $sport = Sport::factory()->individual()->create(['slug' => 'res-indiv-sport']);
    $comp = Competition::factory()->create(['sport_id' => $sport->id, 'slug' => 'res-indiv-comp']);
    $team = Team::factory()->create([
        'competition_id' => $comp->id,
        'status' => TeamStatus::Active,
    ]);
    $members = TeamMember::factory()->count(2)->create(['team_id' => $team->id]);

    foreach ($members as $i => $member) {
        $this->service->recordIndividualResult($member, $i + 1, MedalType::fromPlacement($i + 1));
    }

    expect($team->fresh()->status)->toBe(TeamStatus::Completed);
});

it('updates existing result without duplicates', function () {
    $team = Team::factory()->create([
        'competition_id' => $this->comp->id,
        'status' => TeamStatus::Active,
    ]);

    $this->service->recordTeamResult($team, 2, MedalType::Silver);
    $this->service->recordTeamResult($team, 1, MedalType::Gold);

    $count = Result::where('subject_type', Team::class)->where('subject_id', $team->id)->count();
    expect($count)->toBe(1);

    $result = Result::where('subject_type', Team::class)->where('subject_id', $team->id)->first();
    expect($result->medal_type)->toBe(MedalType::Gold);
    expect($result->placement)->toBe(1);
});

it('writes audit log entry when recording team result', function () {
    $team = Team::factory()->create([
        'competition_id' => $this->comp->id,
        'status' => TeamStatus::Active,
    ]);

    $this->service->recordTeamResult($team, 1, MedalType::Gold);

    expect(AuditLogEntry::where('action', 'result.entered')->count())->toBe(1);
});
