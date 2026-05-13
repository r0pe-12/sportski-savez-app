<?php

use App\Models\AuditLogEntry;
use App\Models\User;

it('creates audit log entry with UUID', function () {
    $user = User::factory()->admin()->create();
    $entry = AuditLogEntry::create([
        'user_id' => $user->id,
        'action' => 'test.action',
        'payload' => ['key' => 'value'],
        'ip' => '127.0.0.1',
        'user_agent' => 'PestTest',
        'created_at' => now(),
    ]);

    expect($entry->id)->toMatch('/^[0-9a-f-]{36}$/');
    expect($entry->payload)->toBe(['key' => 'value']);
});

it('refuses updates (immutable)', function () {
    $entry = AuditLogEntry::create([
        'action' => 'test',
        'created_at' => now(),
    ]);

    expect(fn () => $entry->update(['action' => 'changed']))
        ->toThrow(LogicException::class, 'append-only');
});

it('refuses deletes (immutable)', function () {
    $entry = AuditLogEntry::create([
        'action' => 'test',
        'created_at' => now(),
    ]);

    expect(fn () => $entry->delete())
        ->toThrow(LogicException::class, 'append-only');
});
