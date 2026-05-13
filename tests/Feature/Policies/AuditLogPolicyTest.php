<?php

use App\Models\AuditLogEntry;
use App\Models\Professor;
use App\Models\User;

it('admin can view audit log', function () {
    $admin = User::factory()->admin()->create();
    expect($admin->can('viewAny', AuditLogEntry::class))->toBeTrue();
});

it('professor cannot view audit log', function () {
    $prof = Professor::factory()->create();
    expect($prof->can('viewAny', AuditLogEntry::class))->toBeFalse();
});

it('nobody can update or delete audit log entry', function () {
    $admin = User::factory()->admin()->create();
    $entry = AuditLogEntry::create(['action' => 'x', 'created_at' => now()]);

    expect($admin->can('update', $entry))->toBeFalse();
    expect($admin->can('delete', $entry))->toBeFalse();
});
