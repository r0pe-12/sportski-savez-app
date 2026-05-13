<?php

use App\Models\Competition;
use App\Models\Professor;
use App\Models\Sport;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/*
 * Performance smoke testovi — pokrivaju ključne paginirane / listing rute pod opterećenjem.
 * Threshold-i su konzervativni (slow CI envs) — ako presporo, T3.1+ optimizacije su potrebne.
 */

beforeEach(function () {
    $this->withoutVite();
});

it('schedule page with 50 competitions loads under 1s', function () {
    $sport = Sport::factory()->team()->create(['slug' => 'perf-sport']);
    Competition::factory()->count(50)->create(['sport_id' => $sport->id]);
    $prof = Professor::factory()->create();

    $start = microtime(true);
    $this->actingAs($prof)->get('/schedule')->assertOk();
    $elapsed = microtime(true) - $start;

    expect($elapsed)->toBeLessThan(1.0);
});

it('audit log with 1000 entries paginates under 1.5s', function () {
    $admin = User::factory()->admin()->create();

    // Bulk insert direktno — AuditLogEntry nema HasFactory trait (model je append-only).
    $rows = [];
    $now = now();
    for ($i = 0; $i < 1000; $i++) {
        $rows[] = [
            'id' => (string) Str::uuid(),
            'user_id' => $admin->id,
            'action' => match ($i % 4) {
                0 => 'team.created',
                1 => 'student.verified',
                2 => 'certificate.uploaded',
                default => 'team.approved',
            },
            'subject_type' => null,
            'subject_id' => null,
            'payload' => json_encode(['key' => 'value']),
            'ip' => '127.0.0.1',
            'user_agent' => 'PerformanceTest/1.0',
            'created_at' => $now->copy()->subMinutes($i)->toDateTimeString(),
        ];
    }
    // Insert u batch-ovima da izbjegnemo SQLite limit varijabli
    foreach (array_chunk($rows, 200) as $chunk) {
        DB::table('audit_log')->insert($chunk);
    }

    $start = microtime(true);
    $this->actingAs($admin)->get('/admin/audit-log')->assertOk();
    $elapsed = microtime(true) - $start;

    expect($elapsed)->toBeLessThan(1.5);
});

it('admin users list with 100 users loads under 1s', function () {
    $admin = User::factory()->admin()->create();
    User::factory()->count(100)->create();

    $start = microtime(true);
    $this->actingAs($admin)->get('/admin/users')->assertOk();
    $elapsed = microtime(true) - $start;

    expect($elapsed)->toBeLessThan(1.0);
});
