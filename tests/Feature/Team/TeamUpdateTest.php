<?php

use App\Enums\TeamStatus;
use App\Models\Professor;
use App\Models\Team;

beforeEach(function () {
    $this->prof = Professor::factory()->create(['verified_at' => now()]);
    $this->team = Team::factory()->create([
        'professor_id' => $this->prof->id,
        'school_id' => $this->prof->school_id,
        'status' => TeamStatus::Draft,
    ]);
});

it('professor can patch draft team (autosave)', function () {
    $this->actingAs($this->prof)
        ->patch("/teams/{$this->team->id}", [])
        ->assertRedirect();
});

it('professor cannot patch submitted team', function () {
    $this->team->update(['status' => TeamStatus::Submitted]);

    $this->actingAs($this->prof)
        ->patch("/teams/{$this->team->id}", [])
        ->assertForbidden();
});

it('professor cannot patch other professor team', function () {
    $other = Professor::factory()->create();
    $this->actingAs($other)
        ->patch("/teams/{$this->team->id}", [])
        ->assertForbidden();
});
