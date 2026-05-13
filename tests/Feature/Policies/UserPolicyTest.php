<?php

use App\Models\Professor;
use App\Models\Student;
use App\Models\User;

it('admin can do anything on User', function () {
    $admin = User::factory()->admin()->create();
    $other = Student::factory()->create();

    expect($admin->can('viewAny', User::class))->toBeTrue();
    expect($admin->can('view', $other))->toBeTrue();
    expect($admin->can('update', $other))->toBeTrue();
    expect($admin->can('delete', $other))->toBeTrue();
});

it('professor can view students in same school', function () {
    $prof = Professor::factory()->create();
    $sameSchool = Student::factory()->forSchool($prof->school)->create();
    $otherSchool = Student::factory()->create();

    expect($prof->can('view', $sameSchool))->toBeTrue();
    expect($prof->can('view', $otherSchool))->toBeFalse();
});

it('student can only view own', function () {
    $student = Student::factory()->create();
    $other = Student::factory()->create();

    expect($student->can('view', $student))->toBeTrue();
    expect($student->can('view', $other))->toBeFalse();
});

it('admin cannot delete self', function () {
    $admin = User::factory()->admin()->create();
    expect($admin->can('delete', $admin))->toBeFalse();
});
