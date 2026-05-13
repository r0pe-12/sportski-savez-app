<?php

use App\Models\Competition;
use App\Models\Professor;
use App\Models\Sport;
use App\Models\User;

it('everyone can view competition', function () {
    $sport = Sport::factory()->create(['slug' => 'comp-policy-sport']);
    $c = Competition::factory()->create(['sport_id' => $sport->id, 'slug' => 'cps-1']);

    expect(Professor::factory()->create()->can('view', $c))->toBeTrue();
});

it('only admin can CRUD competition', function () {
    $sport = Sport::factory()->create(['slug' => 'admin-only-sport']);
    $c = Competition::factory()->create(['sport_id' => $sport->id, 'slug' => 'admin-only-comp']);

    expect(User::factory()->admin()->create()->can('update', $c))->toBeTrue();
    expect(User::factory()->admin()->create()->can('delete', $c))->toBeTrue();
    expect(Professor::factory()->create()->can('delete', $c))->toBeFalse();
});
