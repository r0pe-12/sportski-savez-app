<?php

use App\Enums\UserRole;
use App\Models\Professor;
use App\Models\School;
use App\Models\Student;
use App\Models\User;

it('User has role enum cast', function () {
    $user = User::factory()->admin()->create();
    expect($user->role)->toBe(UserRole::Admin);
});

it('Student global scope filters role=student', function () {
    User::factory()->admin()->create();
    Student::factory()->create();
    Student::factory()->create();

    expect(Student::count())->toBe(2);
    expect(User::count())->toBe(3);
});

it('Professor scope and belongs to school', function () {
    $school = School::factory()->create();
    $prof = Professor::factory()->forSchool($school)->create();

    expect($prof->school->id)->toBe($school->id);
    expect($prof->role)->toBe(UserRole::Professor);
});

it('Student has jmb regex validation in factory', function () {
    $student = Student::factory()->create();
    expect($student->jmb)->toMatch('/^\d{13}$/');
});
