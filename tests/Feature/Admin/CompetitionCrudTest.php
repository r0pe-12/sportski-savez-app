<?php

use App\Models\Competition;
use App\Models\Professor;
use App\Models\Sport;
use App\Models\User;

beforeEach(fn () => $this->admin = User::factory()->admin()->create());

it('admin can list competitions', function () {
    Competition::factory()->count(2)->create();

    $this->actingAs($this->admin)
        ->get('/admin/competitions')
        ->assertOk()
        ->assertInertia(fn ($p) => $p->component('admin/competitions/index'));
});

it('admin can create competition', function () {
    $sport = Sport::factory()->team()->create(['slug' => 'fudbal-comp-create']);

    $this->actingAs($this->admin)->post('/admin/competitions', [
        'slug' => 'test-comp-2026',
        'name' => 'Test 2026',
        'sport_id' => $sport->id,
        'start_date' => '2026-09-01',
        'end_date' => '2026-09-05',
        'location' => 'Podgorica',
        'status' => 'open_registration',
        'year' => 2026,
    ])->assertRedirect('/admin/competitions');

    expect(Competition::where('slug', 'test-comp-2026')->exists())->toBeTrue();
});

it('rejects end_date before start_date', function () {
    $sport = Sport::factory()->team()->create(['slug' => 'fudbal-comp-reject']);

    $this->actingAs($this->admin)->post('/admin/competitions', [
        'slug' => 'bad-comp', 'name' => 'Bad', 'sport_id' => $sport->id,
        'start_date' => '2026-09-10', 'end_date' => '2026-09-05',
        'location' => 'X', 'status' => 'open_registration', 'year' => 2026,
    ])->assertSessionHasErrors('end_date');
});

it('professor cannot CRUD competition', function () {
    $prof = Professor::factory()->create();
    $this->actingAs($prof)->post('/admin/competitions', [])->assertForbidden();
});
