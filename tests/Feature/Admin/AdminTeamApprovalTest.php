<?php

use App\Enums\TeamStatus;
use App\Models\Professor;
use App\Models\Team;
use App\Models\User;
use Illuminate\Support\Facades\Notification;

beforeEach(function () {
    Notification::fake();
    $this->admin = User::factory()->admin()->create();
});

it('admin approves submitted team', function () {
    $team = Team::factory()->submitted()->create();

    $this->actingAs($this->admin)
        ->post("/admin/teams/{$team->id}/approve")
        ->assertRedirect();

    expect($team->fresh()->status)->toBe(TeamStatus::Active);
});

it('admin rejects with reason', function () {
    $team = Team::factory()->submitted()->create();

    $this->actingAs($this->admin)
        ->post("/admin/teams/{$team->id}/reject", ['reason' => 'Nedovoljno članova'])
        ->assertRedirect();

    expect($team->fresh()->status)->toBe(TeamStatus::Rejected);
    expect($team->fresh()->rejection_reason)->toBe('Nedovoljno članova');
});

it('admin reject requires reason min 5 chars', function () {
    $team = Team::factory()->submitted()->create();

    $this->actingAs($this->admin)
        ->post("/admin/teams/{$team->id}/reject", ['reason' => 'X'])
        ->assertSessionHasErrors('reason');

    expect($team->fresh()->status)->toBe(TeamStatus::Submitted);
});

it('admin reject requires reason field', function () {
    $team = Team::factory()->submitted()->create();

    $this->actingAs($this->admin)
        ->post("/admin/teams/{$team->id}/reject", [])
        ->assertSessionHasErrors('reason');
});

it('admin approve fails for non-submitted team', function () {
    $team = Team::factory()->draft()->create();

    $this->actingAs($this->admin)
        ->post("/admin/teams/{$team->id}/approve")
        ->assertSessionHasErrors('general');

    expect($team->fresh()->status)->toBe(TeamStatus::Draft);
});

it('non-admin cannot approve a team', function () {
    $professor = Professor::factory()->create();
    $team = Team::factory()->submitted()->create();

    $this->actingAs($professor)
        ->post("/admin/teams/{$team->id}/approve")
        ->assertForbidden();
});

it('admin can view teams index', function () {
    Team::factory()->count(3)->create();

    $this->actingAs($this->admin)
        ->get('/admin/teams')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('admin/teams/index'));
});

it('admin can view team detail', function () {
    $team = Team::factory()->submitted()->create();

    $this->actingAs($this->admin)
        ->get("/admin/teams/{$team->id}")
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('admin/teams/show'));
});
