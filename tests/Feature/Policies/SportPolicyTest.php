<?php

use App\Models\Professor;
use App\Models\Sport;
use App\Models\Student;
use App\Models\User;

it('everyone can view sports', function () {
    $sport = Sport::factory()->create(['slug' => 'view-sport']);

    expect(User::factory()->admin()->create()->can('view', $sport))->toBeTrue();
    expect(Professor::factory()->create()->can('view', $sport))->toBeTrue();
    expect(Student::factory()->create()->can('view', $sport))->toBeTrue();
});

it('only admin can create/update sport', function () {
    $sport = Sport::factory()->create(['slug' => 'crud-sport']);

    expect(User::factory()->admin()->create()->can('update', $sport))->toBeTrue();
    expect(Professor::factory()->create()->can('update', $sport))->toBeFalse();
});

it('nobody can hard-delete sport (only deactivate via soft delete)', function () {
    $sport = Sport::factory()->create(['slug' => 'delete-sport']);
    expect(User::factory()->admin()->create()->can('delete', $sport))->toBeFalse();
    expect(User::factory()->admin()->create()->can('deactivate', $sport))->toBeTrue();
});
