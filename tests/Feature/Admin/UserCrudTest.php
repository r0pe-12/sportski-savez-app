<?php

use App\Enums\UserRole;
use App\Models\Professor;
use App\Models\School;
use App\Models\User;

beforeEach(function () {
    $this->admin = User::factory()->admin()->create();
    $this->school = School::factory()->create();
});

it('admin can list users', function () {
    Professor::factory()->count(3)->create();

    $this->withoutVite()
        ->actingAs($this->admin)
        ->get('/admin/users')
        ->assertOk()
        ->assertInertia(fn ($p) => $p->component('admin/users/index')->has('users.data', 4)); // +1 admin
});

it('admin can create professor', function () {
    $this->actingAs($this->admin)->post('/admin/users', [
        'name' => 'Novi Profesor',
        'email' => 'np@savez.test',
        'password' => 'Password123!',
        'role' => 'professor',
        'school_id' => $this->school->id,
    ])->assertRedirect('/admin/users');

    expect(User::where('email', 'np@savez.test')->first()->role)->toBe(UserRole::Professor);
});

it('admin can update user', function () {
    $prof = Professor::factory()->create();

    $this->actingAs($this->admin)
        ->put("/admin/users/{$prof->id}", [
            'name' => 'Promijenjeno Ime',
            'email' => $prof->email,
            'role' => 'professor',
            'school_id' => $prof->school_id,
        ])->assertRedirect('/admin/users');

    expect($prof->fresh()->name)->toBe('Promijenjeno Ime');
});

it('admin can soft delete user', function () {
    $prof = Professor::factory()->create();

    $this->actingAs($this->admin)
        ->delete("/admin/users/{$prof->id}")
        ->assertRedirect('/admin/users');

    expect(User::find($prof->id))->toBeNull();
    expect(User::withTrashed()->find($prof->id))->not->toBeNull();
});

it('professor cannot access admin/users routes', function () {
    $prof = Professor::factory()->create();

    $this->actingAs($prof)->get('/admin/users')->assertForbidden();
    $this->actingAs($prof)->post('/admin/users', [])->assertForbidden();
});

it('admin cannot delete themselves', function () {
    $this->actingAs($this->admin)
        ->delete("/admin/users/{$this->admin->id}")
        ->assertForbidden();
});
