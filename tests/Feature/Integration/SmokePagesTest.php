<?php

use App\Models\Professor;
use App\Models\School;
use App\Models\Sport;
use App\Models\Student;
use App\Models\User;

/*
 * Smoke testovi za sve ključne stranice — verifikuje da rute rade (assertOk) za očekivane role.
 *
 * Pest 4 Browser plugin nije konfigurisan, pa koristimo Feature get() testove kao fallback (plan napomena Task 1 Step 1).
 */

beforeEach(function () {
    $this->withoutVite();
});

it('login page renders', function () {
    $this->get('/login')->assertOk();
});

it('register page renders', function () {
    School::factory()->create();
    $this->get('/register')->assertOk();
});

it('admin dashboard pages load without errors', function () {
    $admin = User::factory()->admin()->create();

    $urls = [
        '/dashboard',
        '/admin/users',
        '/admin/schools',
        '/admin/sports',
        '/admin/competitions',
        '/admin/teams',
        '/admin/students',
        '/admin/audit-log',
    ];

    foreach ($urls as $url) {
        $this->actingAs($admin)->get($url)->assertOk();
    }
});

it('professor dashboard + teams + schedule load', function () {
    $prof = Professor::factory()->create();

    $urls = ['/dashboard', '/teams', '/teams/create', '/schedule', '/sports'];

    foreach ($urls as $url) {
        $this->actingAs($prof)->get($url)->assertOk();
    }
});

it('student profile + schedule load', function () {
    $student = Student::factory()->create();

    $urls = ['/profile', '/schedule', '/sports'];

    foreach ($urls as $url) {
        $this->actingAs($student)->get($url)->assertOk();
    }
});

it('public sport show page renders', function () {
    $student = Student::factory()->create();
    $sport = Sport::factory()->team()->create(['slug' => 'smoke-sport']);

    $this->actingAs($student)->get("/sports/{$sport->slug}")->assertOk();
});

it('ai-dnevnik public page renders', function () {
    $this->get('/ai-dnevnik')->assertOk();
});
