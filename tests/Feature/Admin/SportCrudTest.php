<?php

use App\Models\Professor;
use App\Models\Sport;
use App\Models\User;

beforeEach(fn () => $this->admin = User::factory()->admin()->create());

it('admin can list sports', function () {
    Sport::factory()->count(3)->create();

    $this->actingAs($this->admin)
        ->get('/admin/sports')
        ->assertOk()
        ->assertInertia(fn ($p) => $p->component('admin/sports/index'));
});

it('admin can create team sport', function () {
    $this->actingAs($this->admin)->post('/admin/sports', [
        'slug' => 'odbojka-test',
        'name' => 'Odbojka',
        'type' => 'team_sport',
        'members_count' => 6,
        'substitutes_count' => 6,
    ])->assertRedirect('/admin/sports');

    expect(Sport::where('slug', 'odbojka-test')->exists())->toBeTrue();
});

it('admin can update sport', function () {
    $sport = Sport::factory()->create(['slug' => 'sport-update']);

    $this->actingAs($this->admin)->put("/admin/sports/{$sport->id}", [
        'slug' => $sport->slug,
        'name' => 'Novi naziv',
        'type' => $sport->type->value,
        'members_count' => $sport->members_count,
        'substitutes_count' => $sport->substitutes_count,
    ])->assertRedirect('/admin/sports');

    expect($sport->fresh()->name)->toBe('Novi naziv');
});

it('soft delete deactivates sport (spec 7.2)', function () {
    $sport = Sport::factory()->create(['slug' => 'sport-deact']);

    $this->actingAs($this->admin)
        ->delete("/admin/sports/{$sport->id}")
        ->assertRedirect('/admin/sports');

    expect(Sport::find($sport->id))->toBeNull();
    expect(Sport::withTrashed()->find($sport->id))->not->toBeNull();
});

it('professor cannot CRUD sport', function () {
    $prof = Professor::factory()->create();
    $this->actingAs($prof)->post('/admin/sports', [])->assertForbidden();
});

it('professor can view sports listing (public read)', function () {
    Sport::factory()->count(2)->create();
    $prof = Professor::factory()->create();

    $this->actingAs($prof)
        ->get('/sports')
        ->assertOk()
        ->assertInertia(fn ($p) => $p->component('sports/index'));
});
