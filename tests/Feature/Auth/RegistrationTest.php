<?php

use App\Models\School;
use Laravel\Fortify\Features;

beforeEach(function () {
    $this->skipUnlessFortifyHas(Features::registration());
});

test('registration screen can be rendered', function () {
    $response = $this->get(route('register'));

    $response->assertOk();
});

test('new users can register', function () {
    $school = School::factory()->create();

    $response = $this->post(route('register.store'), [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'Password123!',
        'password_confirmation' => 'Password123!',
        'role' => 'professor',
        'school_id' => $school->id,
    ]);

    $this->assertAuthenticated();
    // Professor redirects to /dashboard per role-based LoginResponse.
    $response->assertRedirect('/dashboard');
});
