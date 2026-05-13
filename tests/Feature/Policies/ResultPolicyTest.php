<?php

use App\Models\Competition;
use App\Models\Professor;
use App\Models\Result;
use App\Models\School;
use App\Models\Sport;
use App\Models\Student;
use App\Models\Team;
use App\Models\TeamMember;
use App\Models\User;

it('admin can CRU results', function () {
    $admin = User::factory()->admin()->create();
    $sport = Sport::factory()->team()->create(['slug' => 'rp-admin-sport']);
    $comp = Competition::factory()->create(['sport_id' => $sport->id, 'slug' => 'rp-admin-comp']);
    $team = Team::factory()->create(['competition_id' => $comp->id]);
    $result = Result::factory()->forTeam($team)->create();

    expect($admin->can('create', Result::class))->toBeTrue();
    expect($admin->can('update', $result))->toBeTrue();
    expect($admin->can('view', $result))->toBeTrue();
    expect($admin->can('delete', $result))->toBeTrue();
});

it('professor cannot create or update result', function () {
    $prof = Professor::factory()->create();

    expect($prof->can('create', Result::class))->toBeFalse();
});

it('member student can view own team result', function () {
    $school = School::factory()->create();
    $student = Student::factory()->forSchool($school)->create();
    $sport = Sport::factory()->team()->create(['slug' => 'rp-stud-sport']);
    $comp = Competition::factory()->create(['sport_id' => $sport->id, 'slug' => 'rp-stud-comp']);
    $team = Team::factory()->create(['competition_id' => $comp->id, 'school_id' => $school->id]);
    TeamMember::factory()->create(['team_id' => $team->id, 'student_id' => $student->id]);
    $result = Result::factory()->forTeam($team)->create();

    expect($student->can('view', $result))->toBeTrue();
});

it('professor of team can view team result', function () {
    $school = School::factory()->create();
    $prof = Professor::factory()->create(['school_id' => $school->id]);
    $sport = Sport::factory()->team()->create(['slug' => 'rp-prof-sport']);
    $comp = Competition::factory()->create(['sport_id' => $sport->id, 'slug' => 'rp-prof-comp']);
    $team = Team::factory()->create([
        'competition_id' => $comp->id,
        'school_id' => $school->id,
        'professor_id' => $prof->id,
    ]);
    $result = Result::factory()->forTeam($team)->create();

    expect($prof->can('view', $result))->toBeTrue();
});

it('non-member student cannot view foreign team result', function () {
    $otherSchool = School::factory()->create();
    $student = Student::factory()->forSchool($otherSchool)->create();
    $sport = Sport::factory()->team()->create(['slug' => 'rp-foreign-sport']);
    $comp = Competition::factory()->create(['sport_id' => $sport->id, 'slug' => 'rp-foreign-comp']);
    $team = Team::factory()->create(['competition_id' => $comp->id]);
    $result = Result::factory()->forTeam($team)->create();

    expect($student->can('view', $result))->toBeFalse();
});
