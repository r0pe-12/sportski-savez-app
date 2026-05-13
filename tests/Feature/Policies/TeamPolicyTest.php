<?php

use App\Enums\TeamStatus;
use App\Models\Professor;
use App\Models\Student;
use App\Models\Team;

it('professor can create team', function () {
    $prof = Professor::factory()->create(['verified_at' => now()]);
    expect($prof->can('create', Team::class))->toBeTrue();
});

it('unverified professor cannot create team', function () {
    $prof = Professor::factory()->unverifiedProfessor()->create();
    expect($prof->can('create', Team::class))->toBeFalse();
});

it('student cannot create team', function () {
    expect(Student::factory()->create()->can('create', Team::class))->toBeFalse();
});

it('professor can view + update own draft team', function () {
    $prof = Professor::factory()->create();
    $team = Team::factory()->create([
        'professor_id' => $prof->id,
        'school_id' => $prof->school_id,
        'status' => TeamStatus::Draft,
    ]);

    expect($prof->can('view', $team))->toBeTrue();
    expect($prof->can('update', $team))->toBeTrue();
});

it('professor cannot update team in non-draft state', function () {
    $prof = Professor::factory()->create();
    $team = Team::factory()->create([
        'professor_id' => $prof->id,
        'school_id' => $prof->school_id,
        'status' => TeamStatus::Submitted,
    ]);

    expect($prof->can('update', $team))->toBeFalse();
});

it('professor cannot access other professor team from different school', function () {
    $other = Professor::factory()->create();
    $team = Team::factory()->create([
        'professor_id' => $other->id,
        'school_id' => $other->school_id,
    ]);
    $mine = Professor::factory()->create();

    expect($mine->can('view', $team))->toBeFalse();
});
