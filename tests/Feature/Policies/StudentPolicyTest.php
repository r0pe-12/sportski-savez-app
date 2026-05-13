<?php

use App\Models\Professor;
use App\Models\Student;
use App\Models\User;

it('student views own profile', function () {
    $student = Student::factory()->create();
    expect($student->can('viewProfile', $student))->toBeTrue();
});

it('student cannot view other student profile', function () {
    $a = Student::factory()->create();
    $b = Student::factory()->create();
    expect($a->can('viewProfile', $b))->toBeFalse();
});

it('professor views own school student profile', function () {
    $prof = Professor::factory()->create();
    $sameSchool = Student::factory()->forSchool($prof->school)->create();
    $otherSchool = Student::factory()->create();

    expect($prof->can('viewProfile', $sameSchool))->toBeTrue();
    expect($prof->can('viewProfile', $otherSchool))->toBeFalse();
});

it('admin views all student profiles', function () {
    $admin = User::factory()->admin()->create();
    expect($admin->can('viewProfile', Student::factory()->create()))->toBeTrue();
});

it('student updates own limited fields only', function () {
    $student = Student::factory()->create();
    expect($student->can('updateLimited', $student))->toBeTrue();
});

it('student cannot update other student', function () {
    expect(Student::factory()->create()->can('updateLimited', Student::factory()->create()))->toBeFalse();
});

it('admin can update any student limited fields', function () {
    $admin = User::factory()->admin()->create();
    $student = Student::factory()->create();
    expect($admin->can('updateLimited', $student))->toBeTrue();
});

it('student can upload own photo', function () {
    $student = Student::factory()->create();
    expect($student->can('uploadPhoto', $student))->toBeTrue();
});

it('student cannot upload other student photo', function () {
    expect(Student::factory()->create()->can('uploadPhoto', Student::factory()->create()))->toBeFalse();
});

it('admin can upload any student photo', function () {
    $admin = User::factory()->admin()->create();
    expect($admin->can('uploadPhoto', Student::factory()->create()))->toBeTrue();
});
