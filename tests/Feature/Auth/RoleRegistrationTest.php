<?php

use App\Enums\UserRole;
use App\Models\School;
use App\Models\User;

it('registers a professor with school', function () {
    $school = School::factory()->create();

    $response = $this->post('/register', [
        'name' => 'Marko Marković',
        'email' => 'marko@test.com',
        'password' => 'Password123!',
        'password_confirmation' => 'Password123!',
        'role' => 'professor',
        'school_id' => $school->id,
    ]);

    $response->assertRedirect();
    $user = User::where('email', 'marko@test.com')->first();
    expect($user->role)->toBe(UserRole::Professor);
    expect($user->school_id)->toBe($school->id);
});

it('registers a student with school and jmb', function () {
    $school = School::factory()->create();

    $response = $this->post('/register', [
        'name' => 'Ana Anić',
        'email' => 'ana@test.com',
        'password' => 'Password123!',
        'password_confirmation' => 'Password123!',
        'role' => 'student',
        'school_id' => $school->id,
        'jmb' => '0101010250001',
        'grade' => '8-2',
        'birth_date' => '2010-01-01',
        'parental_consent' => true,
    ]);

    $response->assertRedirect();
    $user = User::where('email', 'ana@test.com')->first();
    expect($user->role)->toBe(UserRole::Student);
    expect($user->jmb)->toBe('0101010250001');
});

it('rejects registration with invalid JMB', function () {
    $school = School::factory()->create();

    $response = $this->post('/register', [
        'name' => 'X', 'email' => 'x@test.com',
        'password' => 'Password123!', 'password_confirmation' => 'Password123!',
        'role' => 'student',
        'school_id' => $school->id,
        'jmb' => '123',
        'grade' => '8-1', 'birth_date' => '2010-01-01',
        'parental_consent' => true,
    ]);

    $response->assertSessionHasErrors('jmb');
});

it('rejects student without parental consent', function () {
    $school = School::factory()->create();

    $response = $this->post('/register', [
        'name' => 'X', 'email' => 'x@test.com',
        'password' => 'Password123!', 'password_confirmation' => 'Password123!',
        'role' => 'student',
        'school_id' => $school->id,
        'jmb' => '0101010250001',
        'grade' => '8-1', 'birth_date' => '2010-01-01',
        'parental_consent' => false,
    ]);

    $response->assertSessionHasErrors('parental_consent');
});

it('admin role cannot be created through public register', function () {
    $response = $this->post('/register', [
        'name' => 'X', 'email' => 'x@test.com',
        'password' => 'Password123!', 'password_confirmation' => 'Password123!',
        'role' => 'admin',
    ]);

    $response->assertSessionHasErrors('role');
});
