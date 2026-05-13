<?php

use App\Enums\TeamStatus;
use App\Models\Competition;
use App\Models\Professor;
use App\Models\Sport;
use App\Models\Student;
use App\Models\Team;

beforeEach(function () {
    $this->prof = Professor::factory()->create(['verified_at' => now()]);
    $this->sport = Sport::factory()->team(5, 3)->create(['slug' => 'kosarka-uc5']);
    $this->comp = Competition::factory()->create(['sport_id' => $this->sport->id, 'slug' => 'comp-uc5']);
});

it('professor sees create page with competitions list', function () {
    $this->actingAs($this->prof)
        ->get('/teams/create')
        ->assertOk()
        ->assertInertia(fn ($p) => $p->component('teams/create')->has('competitions'));
});

it('professor creates draft team', function () {
    $this->actingAs($this->prof)->post('/teams', [
        'competition_id' => $this->comp->id,
    ])->assertRedirect();

    $team = Team::where('professor_id', $this->prof->id)->first();
    expect($team)->not->toBeNull();
    expect($team->status)->toBe(TeamStatus::Draft);
    expect($team->school_id)->toBe($this->prof->school_id);
});

it('unverified professor cannot create team', function () {
    $unverified = Professor::factory()->unverifiedProfessor()->create();

    $this->actingAs($unverified)->post('/teams', [
        'competition_id' => $this->comp->id,
    ])->assertForbidden();
});

it('cannot create duplicate team for same competition + school', function () {
    Team::factory()->create([
        'professor_id' => $this->prof->id,
        'school_id' => $this->prof->school_id,
        'competition_id' => $this->comp->id,
    ]);

    $this->actingAs($this->prof)->post('/teams', [
        'competition_id' => $this->comp->id,
    ])->assertSessionHasErrors('competition_id');
});

it('student cannot create team', function () {
    $student = Student::factory()->create();
    $this->actingAs($student)->post('/teams', ['competition_id' => $this->comp->id])->assertForbidden();
});
