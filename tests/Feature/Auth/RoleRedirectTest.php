<?php

use App\Models\Professor;
use App\Models\Student;
use App\Models\User;

it('admin redirects to /admin after login', function () {
    $admin = User::factory()->admin()->create(['password' => bcrypt('password')]);
    $response = $this->post('/login', ['email' => $admin->email, 'password' => 'password']);
    $response->assertRedirect('/admin');
});

it('professor redirects to /dashboard after login', function () {
    $prof = Professor::factory()->create(['password' => bcrypt('password')]);
    $response = $this->post('/login', ['email' => $prof->email, 'password' => 'password']);
    $response->assertRedirect('/dashboard');
});

it('student redirects to /profile after login', function () {
    $student = Student::factory()->create(['password' => bcrypt('password')]);
    $response = $this->post('/login', ['email' => $student->email, 'password' => 'password']);
    $response->assertRedirect('/profile');
});
