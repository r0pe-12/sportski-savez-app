<?php

use App\Models\School;
use App\Models\User;
use App\Services\AuditLogger;

it('logs an entry with user, subject, payload', function () {
    $user = User::factory()->admin()->create();
    $school = School::factory()->create();

    $this->actingAs($user);

    $entry = app(AuditLogger::class)->log('school.created', $school, ['code' => $school->code]);

    expect($entry->action)->toBe('school.created');
    expect($entry->user_id)->toBe($user->id);
    expect($entry->subject_type)->toBe($school->getMorphClass());
    expect($entry->subject_id)->toBe($school->id);
    expect($entry->payload)->toBe(['code' => $school->code]);
});

it('captures IP and user agent from request', function () {
    $entry = app(AuditLogger::class)->log('system.action');

    expect($entry->ip)->not->toBeNull();
});

it('logs without user when guest', function () {
    $entry = app(AuditLogger::class)->log('public.action');
    expect($entry->user_id)->toBeNull();
    expect($entry->action)->toBe('public.action');
});

it('logs without subject when omitted', function () {
    $entry = app(AuditLogger::class)->log('system.boot');
    expect($entry->subject_type)->toBeNull();
});
