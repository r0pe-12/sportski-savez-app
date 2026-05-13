<?php

use App\Enums\StudentVerificationStatus;
use App\Enums\TeamStatus;
use App\Models\Competition;
use App\Models\School;
use App\Models\Student;
use App\Models\Team;
use App\Models\User;

beforeEach(function () {
    $this->admin = User::factory()->admin()->create();
});

// ============================================================
// Fix A — /admin/teams filters
// ============================================================

it('admin teams index filters by status=submitted', function () {
    Team::factory()->submitted()->count(2)->create();
    Team::factory()->draft()->count(3)->create();
    Team::factory()->active()->count(1)->create();

    $this->withoutVite()
        ->actingAs($this->admin)
        ->get('/admin/teams?status=submitted')
        ->assertOk()
        ->assertInertia(fn ($p) => $p->component('admin/teams/index')
            ->has('teams.data', 2)
            ->where('filters.status', 'submitted')
            ->where(
                'teams.data',
                fn ($rows) => collect($rows)->every(fn ($row) => $row['status'] === TeamStatus::Submitted->value),
            ),
        );
});

it('admin teams index filters by competition_id', function () {
    $compA = Competition::factory()->create();
    $compB = Competition::factory()->create();
    Team::factory()->count(2)->create(['competition_id' => $compA->id]);
    Team::factory()->count(3)->create(['competition_id' => $compB->id]);

    $this->withoutVite()
        ->actingAs($this->admin)
        ->get("/admin/teams?competition_id={$compA->id}")
        ->assertOk()
        ->assertInertia(fn ($p) => $p->component('admin/teams/index')
            ->has('teams.data', 2)
            ->where('filters.competition_id', $compA->id),
        );
});

it('admin teams index filters by school_id', function () {
    $schoolA = School::factory()->create();
    $schoolB = School::factory()->create();
    Team::factory()->count(1)->create(['school_id' => $schoolA->id]);
    Team::factory()->count(4)->create(['school_id' => $schoolB->id]);

    $this->withoutVite()
        ->actingAs($this->admin)
        ->get("/admin/teams?school_id={$schoolA->id}")
        ->assertOk()
        ->assertInertia(fn ($p) => $p->component('admin/teams/index')
            ->has('teams.data', 1)
            ->where('filters.school_id', $schoolA->id),
        );
});

it('admin teams index ignores invalid status value', function () {
    Team::factory()->submitted()->count(2)->create();
    Team::factory()->draft()->count(3)->create();

    $this->withoutVite()
        ->actingAs($this->admin)
        ->get('/admin/teams?status=bogus')
        ->assertOk()
        ->assertInertia(fn ($p) => $p->component('admin/teams/index')
            ->has('teams.data', 5),
        );
});

it('admin teams index exposes filter option lists', function () {
    Competition::factory()->count(2)->create();
    School::factory()->count(3)->create();

    $this->withoutVite()
        ->actingAs($this->admin)
        ->get('/admin/teams')
        ->assertOk()
        ->assertInertia(fn ($p) => $p->component('admin/teams/index')
            ->has('competitions')
            ->has('schools'),
        );
});

// ============================================================
// Fix B — /admin/students search + filters
// ============================================================

it('admin students index searches by name with ?q=', function () {
    $school = School::factory()->create();
    Student::factory()->forSchool($school)->create(['name' => 'Učenik Jedan']);
    Student::factory()->forSchool($school)->create(['name' => 'Učenik Dva']);
    Student::factory()->forSchool($school)->create(['name' => 'Marko Marković']);

    $this->withoutVite()
        ->actingAs($this->admin)
        ->get('/admin/students?q='.urlencode('Učenik'))
        ->assertOk()
        ->assertInertia(fn ($p) => $p->component('admin/students/index')
            ->has('students.data', 2)
            ->where('filters.q', 'Učenik'),
        );
});

it('admin students index searches by JMB substring', function () {
    $school = School::factory()->create();
    Student::factory()->forSchool($school)->create([
        'name' => 'Petar Petrović',
        'jmb' => '0101010250200',
    ]);
    Student::factory()->forSchool($school)->create([
        'name' => 'Ana Anić',
        'jmb' => '0202020250200',
    ]);

    $this->withoutVite()
        ->actingAs($this->admin)
        ->get('/admin/students?q=0101010')
        ->assertOk()
        ->assertInertia(fn ($p) => $p->component('admin/students/index')
            ->has('students.data', 1)
            ->where('students.data.0.name', 'Petar Petrović'),
        );
});

it('admin students index filters by school_id', function () {
    $schoolA = School::factory()->create();
    $schoolB = School::factory()->create();
    Student::factory()->forSchool($schoolA)->count(2)->create();
    Student::factory()->forSchool($schoolB)->count(4)->create();

    $this->withoutVite()
        ->actingAs($this->admin)
        ->get("/admin/students?school_id={$schoolA->id}")
        ->assertOk()
        ->assertInertia(fn ($p) => $p->component('admin/students/index')
            ->has('students.data', 2),
        );
});

it('admin students index filters by status=mismatched', function () {
    $school = School::factory()->create();
    Student::factory()->forSchool($school)->mismatched()->count(2)->create();
    Student::factory()->forSchool($school)->verified()->count(3)->create();

    $this->withoutVite()
        ->actingAs($this->admin)
        ->get('/admin/students?status=mismatched')
        ->assertOk()
        ->assertInertia(fn ($p) => $p->component('admin/students/index')
            ->has('students.data', 2)
            ->where('filters.status', 'mismatched')
            ->where(
                'students.data',
                fn ($rows) => collect($rows)->every(
                    fn ($row) => $row['verification_status'] === StudentVerificationStatus::Mismatched->value,
                ),
            ),
        );
});

it('admin students index ignores invalid status value', function () {
    $school = School::factory()->create();
    Student::factory()->forSchool($school)->count(3)->create();

    $this->withoutVite()
        ->actingAs($this->admin)
        ->get('/admin/students?status=garbage')
        ->assertOk()
        ->assertInertia(fn ($p) => $p->component('admin/students/index')
            ->has('students.data', 3),
        );
});

it('admin students index exposes schools list and current filters', function () {
    School::factory()->count(2)->create();

    $this->withoutVite()
        ->actingAs($this->admin)
        ->get('/admin/students?q=foo&status=verified')
        ->assertOk()
        ->assertInertia(fn ($p) => $p->component('admin/students/index')
            ->has('schools')
            ->where('filters.q', 'foo')
            ->where('filters.status', 'verified'),
        );
});
