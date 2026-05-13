<?php

use App\Enums\TeamStatus;
use App\Models\Competition;
use App\Models\Professor;
use App\Models\Result;
use App\Models\Sport;
use App\Models\Team;
use App\Models\User;

beforeEach(function () {
    $this->admin = User::factory()->admin()->create();
    $this->sport = Sport::factory()->team()->create(['slug' => 'result-sport']);
    $this->comp = Competition::factory()->create(['sport_id' => $this->sport->id, 'slug' => 'result-comp']);
});

it('admin sees results entry page with active teams', function () {
    Team::factory()->count(3)->create(['competition_id' => $this->comp->id, 'status' => TeamStatus::Active]);

    $this->actingAs($this->admin)
        ->get("/admin/competitions/{$this->comp->id}/results")
        ->assertOk()
        ->assertInertia(fn ($p) => $p->component('admin/results/enter')->has('subjects', 3));
});

it('admin submits bulk team results and teams become completed', function () {
    $teams = Team::factory()->count(3)->create([
        'competition_id' => $this->comp->id,
        'status' => TeamStatus::Active,
    ]);

    $payload = [
        'results' => [
            ['subject_type' => 'Team', 'subject_id' => $teams[0]->id, 'placement' => 1, 'medal_type' => 'gold'],
            ['subject_type' => 'Team', 'subject_id' => $teams[1]->id, 'placement' => 2, 'medal_type' => 'silver'],
            ['subject_type' => 'Team', 'subject_id' => $teams[2]->id, 'placement' => 3, 'medal_type' => 'bronze'],
        ],
    ];

    $this->actingAs($this->admin)
        ->post("/admin/competitions/{$this->comp->id}/results", $payload)
        ->assertRedirect();

    expect(Result::count())->toBe(3);
    expect($teams[0]->fresh()->status)->toBe(TeamStatus::Completed);
    expect($teams[1]->fresh()->status)->toBe(TeamStatus::Completed);
    expect($teams[2]->fresh()->status)->toBe(TeamStatus::Completed);
});

it('rejects placement below 1', function () {
    $team = Team::factory()->create(['competition_id' => $this->comp->id, 'status' => TeamStatus::Active]);

    $this->actingAs($this->admin)->post("/admin/competitions/{$this->comp->id}/results", [
        'results' => [['subject_type' => 'Team', 'subject_id' => $team->id, 'placement' => 0, 'medal_type' => 'gold']],
    ])->assertSessionHasErrors();
});

it('rejects invalid medal_type', function () {
    $team = Team::factory()->create(['competition_id' => $this->comp->id, 'status' => TeamStatus::Active]);

    $this->actingAs($this->admin)->post("/admin/competitions/{$this->comp->id}/results", [
        'results' => [['subject_type' => 'Team', 'subject_id' => $team->id, 'placement' => 1, 'medal_type' => 'platinum']],
    ])->assertSessionHasErrors();
});

it('professor cannot enter results', function () {
    $prof = Professor::factory()->create();
    $team = Team::factory()->create(['competition_id' => $this->comp->id, 'status' => TeamStatus::Active]);

    $this->actingAs($prof)->post("/admin/competitions/{$this->comp->id}/results", [
        'results' => [['subject_type' => 'Team', 'subject_id' => $team->id, 'placement' => 1, 'medal_type' => 'gold']],
    ])->assertForbidden();
});

it('updating existing result does not create duplicate', function () {
    $team = Team::factory()->create(['competition_id' => $this->comp->id, 'status' => TeamStatus::Active]);

    $this->actingAs($this->admin)->post("/admin/competitions/{$this->comp->id}/results", [
        'results' => [['subject_type' => 'Team', 'subject_id' => $team->id, 'placement' => 2, 'medal_type' => 'silver']],
    ])->assertRedirect();

    $this->actingAs($this->admin)->post("/admin/competitions/{$this->comp->id}/results", [
        'results' => [['subject_type' => 'Team', 'subject_id' => $team->id, 'placement' => 1, 'medal_type' => 'gold']],
    ])->assertRedirect();

    expect(Result::count())->toBe(1);
});
