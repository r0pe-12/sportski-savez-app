<?php

use App\Models\AuditLogEntry;
use App\Models\Professor;
use App\Models\School;

it('audit log records user registration', function () {
    $school = School::factory()->create();

    $this->post('/register', [
        'name' => 'X X', 'email' => 'x@test.com',
        'password' => 'Password123!', 'password_confirmation' => 'Password123!',
        'role' => 'professor', 'school_id' => $school->id,
    ]);

    expect(AuditLogEntry::where('action', 'user.registered')->exists())->toBeTrue();
});

it('audit log records login', function () {
    $prof = Professor::factory()->create(['password' => bcrypt('password')]);

    $this->post('/login', ['email' => $prof->email, 'password' => 'password']);

    expect(AuditLogEntry::where('action', 'user.logged_in')
        ->where('user_id', $prof->id)
        ->exists())->toBeTrue();
});

it('audit log records logout', function () {
    $prof = Professor::factory()->create();

    $this->actingAs($prof)->post('/logout');

    expect(AuditLogEntry::where('action', 'user.logged_out')
        ->where('user_id', $prof->id)
        ->exists())->toBeTrue();
});
