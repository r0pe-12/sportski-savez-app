<?php

use App\Models\Professor;
use App\Models\School;
use App\Models\User;

beforeEach(fn () => $this->admin = User::factory()->admin()->create());

it('admin can list schools', function () {
    School::factory()->count(3)->create();

    $this->withoutVite()
        ->actingAs($this->admin)
        ->get('/admin/schools')
        ->assertOk()
        ->assertInertia(fn ($p) => $p->component('admin/schools/index')->has('schools.data', 3));
});

it('admin can create school', function () {
    $this->actingAs($this->admin)->post('/admin/schools', [
        'code' => 'OS-PG-099',
        'name' => 'OŠ "Test Test"',
        'city' => 'Podgorica',
    ])->assertRedirect('/admin/schools');

    expect(School::where('code', 'OS-PG-099')->exists())->toBeTrue();
});

it('admin can update school', function () {
    $school = School::factory()->create();

    $this->actingAs($this->admin)->put("/admin/schools/{$school->id}", [
        'code' => $school->code,
        'name' => 'Promijenjeno',
        'city' => $school->city,
    ])->assertRedirect('/admin/schools');

    expect($school->fresh()->name)->toBe('Promijenjeno');
});

it('admin can soft delete school', function () {
    $school = School::factory()->create();

    $this->actingAs($this->admin)
        ->delete("/admin/schools/{$school->id}")
        ->assertRedirect('/admin/schools');

    expect(School::find($school->id))->toBeNull();
});

it('professor cannot CRUD schools', function () {
    $prof = Professor::factory()->create();
    $this->actingAs($prof)->get('/admin/schools')->assertForbidden();
});
