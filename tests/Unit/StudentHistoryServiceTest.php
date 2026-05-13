<?php

use App\Models\Competition;
use App\Models\Result;
use App\Models\Sport;
use App\Models\Student;
use App\Models\Team;
use App\Models\TeamMember;
use App\Services\StudentHistoryService;

it('returns history sorted desc by date', function () {
    $student = Student::factory()->create();
    $sport = Sport::factory()->team()->create(['slug' => 'hist-sport']);

    $older = Competition::factory()->past()->create([
        'sport_id' => $sport->id,
        'slug' => 'hist-old',
        'start_date' => now()->subMonths(3),
        'end_date' => now()->subMonths(3)->addDays(2),
    ]);
    $newer = Competition::factory()->past()->create([
        'sport_id' => $sport->id,
        'slug' => 'hist-new',
        'start_date' => now()->subMonths(1),
        'end_date' => now()->subMonths(1)->addDays(2),
    ]);

    foreach ([$older, $newer] as $comp) {
        $team = Team::factory()->create(['competition_id' => $comp->id]);
        TeamMember::factory()->create(['team_id' => $team->id, 'student_id' => $student->id]);
        Result::factory()->forTeam($team)->gold()->create();
    }

    $history = app(StudentHistoryService::class)->forStudent($student);

    expect($history)->toHaveCount(2);
    expect($history->first()['competition']['slug'])->toBe('hist-new');
});

it('counts medals correctly', function () {
    $student = Student::factory()->create();

    // 2 zlatne, 1 srebrna
    foreach (range(1, 3) as $i) {
        $team = Team::factory()->create();
        TeamMember::factory()->create(['team_id' => $team->id, 'student_id' => $student->id]);
        Result::factory()->forTeam($team)->state([
            'medal_type' => $i === 3 ? 'silver' : 'gold',
            'placement' => $i === 3 ? 2 : 1,
        ])->create();
    }

    $medals = app(StudentHistoryService::class)->medalCountsFor($student);
    expect($medals['gold'])->toBe(2);
    expect($medals['silver'])->toBe(1);
    expect($medals['bronze'])->toBe(0);
    expect($medals['participation'])->toBe(0);
});

it('returns empty history for student with no participation', function () {
    $student = Student::factory()->create();

    $history = app(StudentHistoryService::class)->forStudent($student);
    $medals = app(StudentHistoryService::class)->medalCountsFor($student);

    expect($history)->toHaveCount(0);
    expect($medals)->toEqual(['gold' => 0, 'silver' => 0, 'bronze' => 0, 'participation' => 0]);
});

it('shows team result when no member-specific result exists', function () {
    $student = Student::factory()->create();
    $team = Team::factory()->create();
    TeamMember::factory()->create(['team_id' => $team->id, 'student_id' => $student->id]);
    Result::factory()->forTeam($team)->silver()->create();

    $history = app(StudentHistoryService::class)->forStudent($student);

    expect($history)->toHaveCount(1);
    expect($history->first()['result']['medal_type'])->toBe('silver');
    expect($history->first()['result']['placement'])->toBe(2);
});

it('returns null result when team has no result yet', function () {
    $student = Student::factory()->create();
    $team = Team::factory()->create();
    TeamMember::factory()->create(['team_id' => $team->id, 'student_id' => $student->id]);

    $history = app(StudentHistoryService::class)->forStudent($student);

    expect($history)->toHaveCount(1);
    expect($history->first()['result'])->toBeNull();
});
