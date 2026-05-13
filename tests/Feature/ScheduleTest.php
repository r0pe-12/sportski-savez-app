<?php

use App\Models\Competition;
use App\Models\Professor;
use App\Models\Sport;

beforeEach(function () {
    $this->prof = Professor::factory()->create();
    $this->sport = Sport::factory()->team()->create(['slug' => 'sched-sport']);
});

it('professor sees schedule with all competitions', function () {
    Competition::factory()->count(3)->create(['sport_id' => $this->sport->id]);

    $this->actingAs($this->prof)
        ->get('/schedule')
        ->assertOk()
        ->assertInertia(fn ($p) => $p->component('schedule/index')->has('competitions', 3));
});

it('filters by sport', function () {
    $otherSport = Sport::factory()->individual()->create(['slug' => 'sched-other']);
    Competition::factory()->count(2)->create(['sport_id' => $this->sport->id]);
    Competition::factory()->count(1)->create(['sport_id' => $otherSport->id]);

    $this->actingAs($this->prof)
        ->get("/schedule?sport_id={$this->sport->id}")
        ->assertOk()
        ->assertInertia(fn ($p) => $p->has('competitions', 2));
});

it('guest cannot view (auth required)', function () {
    $this->get('/schedule')->assertRedirect('/login');
});
