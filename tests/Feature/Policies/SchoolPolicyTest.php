<?php

use App\Models\Professor;
use App\Models\School;
use App\Models\Student;
use App\Models\User;

it('admin can CRUD any school', function () {
    $admin = User::factory()->admin()->create();
    $school = School::factory()->create();

    expect($admin->can('view', $school))->toBeTrue();
    expect($admin->can('create', School::class))->toBeTrue();
    expect($admin->can('update', $school))->toBeTrue();
    expect($admin->can('delete', $school))->toBeTrue();
});

it('professor can view own school but not others', function () {
    $prof = Professor::factory()->create();
    $other = School::factory()->create();

    expect($prof->can('view', $prof->school))->toBeTrue();
    expect($prof->can('view', $other))->toBeFalse();
    expect($prof->can('create', School::class))->toBeFalse();
});

it('student can view own school', function () {
    $student = Student::factory()->create();
    expect($student->can('view', $student->school))->toBeTrue();
});
