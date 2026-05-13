<?php

use App\Models\AuditLogEntry;
use App\Models\Professor;
use App\Models\User;

beforeEach(fn () => $this->admin = User::factory()->admin()->create());

it('admin views audit log index', function () {
    AuditLogEntry::create(['action' => 'test.action', 'created_at' => now()]);

    $this->actingAs($this->admin)
        ->get('/admin/audit-log')
        ->assertOk()
        ->assertInertia(fn ($p) => $p->component('admin/audit-log/index'));
});

it('professor cannot view (403)', function () {
    $this->actingAs(Professor::factory()->create())
        ->get('/admin/audit-log')
        ->assertForbidden();
});

it('filters by user', function () {
    $u1 = User::factory()->admin()->create();
    AuditLogEntry::create(['action' => 'a1', 'user_id' => $u1->id, 'created_at' => now()]);
    AuditLogEntry::create(['action' => 'a2', 'user_id' => null, 'created_at' => now()]);

    $this->actingAs($this->admin)
        ->get("/admin/audit-log?user_id={$u1->id}")
        ->assertOk()
        ->assertInertia(fn ($p) => $p->has('entries.data', 1));
});

it('filters by action prefix', function () {
    AuditLogEntry::create(['action' => 'team.created', 'created_at' => now()]);
    AuditLogEntry::create(['action' => 'team.updated', 'created_at' => now()]);
    AuditLogEntry::create(['action' => 'student.verified', 'created_at' => now()]);

    $this->actingAs($this->admin)
        ->get('/admin/audit-log?action=team')
        ->assertOk()
        ->assertInertia(fn ($p) => $p->has('entries.data', 2));
});

it('filters by date range', function () {
    AuditLogEntry::create(['action' => 'old', 'created_at' => now()->subDays(10)]);
    AuditLogEntry::create(['action' => 'recent', 'created_at' => now()->subDay()]);

    $from = now()->subDays(3)->toDateString();
    $this->actingAs($this->admin)
        ->get("/admin/audit-log?from={$from}")
        ->assertOk()
        ->assertInertia(fn ($p) => $p->has('entries.data', 1));
});

it('shows entry detail with full payload', function () {
    $entry = AuditLogEntry::create([
        'action' => 'team.submitted',
        'payload' => ['signature' => 'X', 'member_count' => 5],
        'created_at' => now(),
    ]);

    $this->actingAs($this->admin)
        ->get("/admin/audit-log/{$entry->id}")
        ->assertOk()
        ->assertInertia(fn ($p) => $p->component('admin/audit-log/show')
            ->where('entry.payload.signature', 'X'));
});
