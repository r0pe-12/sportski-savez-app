<?php

use App\Models\Professor;
use App\Models\Student;
use App\Models\User;
use Illuminate\Support\Facades\Route;

beforeEach(function () {
    Route::middleware(['web', 'auth', 'role:admin'])
        ->get('/test/admin-only', fn () => 'ok')
        ->name('test.admin-only');
});

it('admin can access admin-only route', function () {
    $admin = User::factory()->admin()->create();
    $this->actingAs($admin)->get('/test/admin-only')->assertOk();
});

it('professor cannot access admin-only route', function () {
    $prof = Professor::factory()->create();
    $this->actingAs($prof)->get('/test/admin-only')->assertForbidden();
});

it('student cannot access admin-only route', function () {
    $student = Student::factory()->create();
    $this->actingAs($student)->get('/test/admin-only')->assertForbidden();
});

it('multiple roles allowed', function () {
    Route::middleware(['web', 'auth', 'role:professor,student'])
        ->get('/test/non-admin', fn () => 'ok');

    $prof = Professor::factory()->create();
    $this->actingAs($prof)->get('/test/non-admin')->assertOk();
});
