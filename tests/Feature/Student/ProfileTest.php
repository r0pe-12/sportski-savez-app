<?php

use App\Models\Professor;
use App\Models\Student;
use App\Models\User;

beforeEach(function () {
    $this->withoutVite();
});

it('student views own profile via /profile', function () {
    $student = Student::factory()->create();

    $this->actingAs($student)
        ->get('/profile')
        ->assertOk()
        ->assertInertia(fn ($p) => $p->component('students/profile')->has('student.history')->has('student.medals'));
});

it('professor views student profile via /students/{id}', function () {
    $prof = Professor::factory()->create();
    $student = Student::factory()->forSchool($prof->school)->create();

    $this->actingAs($prof)
        ->get("/students/{$student->id}")
        ->assertOk()
        ->assertInertia(fn ($p) => $p->component('students/show'));
});

it('professor cannot view other school student', function () {
    $prof = Professor::factory()->create();
    $student = Student::factory()->create();

    $this->actingAs($prof)
        ->get("/students/{$student->id}")
        ->assertForbidden();
});

it('admin views any student profile via /students/{id}', function () {
    $admin = User::factory()->admin()->create();
    $student = Student::factory()->create();

    $this->actingAs($admin)
        ->get("/students/{$student->id}")
        ->assertOk()
        ->assertInertia(fn ($p) => $p->component('students/show'));
});

it('student cannot view other student via /students/{id}', function () {
    $a = Student::factory()->create();
    $b = Student::factory()->create();

    $this->actingAs($a)
        ->get("/students/{$b->id}")
        ->assertForbidden();
});

it('student updates own limited fields', function () {
    $student = Student::factory()->create();

    $this->actingAs($student)->patch('/profile', [
        'phone' => '+382 67 123456',
    ])->assertRedirect();

    expect($student->fresh()->phone)->toBe('+382 67 123456');
});

it('student cannot update JMB or grade via /profile', function () {
    $student = Student::factory()->create(['jmb' => '1234567890123', 'grade' => '5-1']);

    $this->actingAs($student)->patch('/profile', [
        'jmb' => '9999999999999',
        'grade' => '5-5',
    ]);

    expect($student->fresh()->jmb)->toBe('1234567890123');
    expect($student->fresh()->grade)->toBe('5-1');
});

it('non-student authenticated user cannot access /profile', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)->get('/profile')->assertNotFound();
});

it('guest cannot access /profile', function () {
    $this->get('/profile')->assertRedirect();
});

it('audit log records student profile update', function () {
    $student = Student::factory()->create();

    $this->actingAs($student)->patch('/profile', ['phone' => '+382 67 111222']);

    $this->assertDatabaseHas('audit_log', [
        'user_id' => $student->id,
        'action' => 'student.profile_updated',
    ]);
});
