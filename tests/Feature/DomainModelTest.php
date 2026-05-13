<?php

use App\Enums\TeamStatus;
use App\Models\Competition;
use App\Models\Professor;
use App\Models\School;
use App\Models\Sport;
use App\Models\Student;
use App\Models\Team;
use App\Models\TeamMember;

it('full domain graph eager loads', function () {
    $school = School::factory()->create();
    $sport = Sport::factory()->team(5, 3)->create(['slug' => 'fudbal-graph']);
    $comp = Competition::factory()->create(['sport_id' => $sport->id, 'slug' => 'comp-graph']);
    $prof = Professor::factory()->forSchool($school)->create();
    $team = Team::factory()->create([
        'school_id' => $school->id,
        'competition_id' => $comp->id,
        'professor_id' => $prof->id,
    ]);

    $students = Student::factory()->count(3)->forSchool($school)->create();
    foreach ($students as $student) {
        TeamMember::factory()->create(['team_id' => $team->id, 'student_id' => $student->id]);
    }

    $loaded = Team::with(['members.student', 'competition.sport', 'school', 'professor'])->find($team->id);

    expect($loaded->status)->toBe(TeamStatus::Draft);
    expect($loaded->members)->toHaveCount(3);
    expect($loaded->members->first()->student)->not->toBeNull();
    expect($loaded->competition->sport->id)->toBe($sport->id);
    expect($loaded->school->id)->toBe($school->id);
    expect($loaded->professor->id)->toBe($prof->id);
});
