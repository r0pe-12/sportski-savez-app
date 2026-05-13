<?php

use App\Enums\MedalType;
use App\Enums\TeamStatus;
use App\Models\Competition;
use App\Models\Result;
use App\Models\Sport;
use App\Models\Student;
use App\Models\Team;
use App\Models\TeamMember;
use App\Models\User;
use Illuminate\Support\Facades\Notification;

/*
 * E2E Journey 3 — UC10 unos rezultata + UC3 prikaz medalje na profilu učenika.
 * Admin unosi placement+medal_type za ekipu → team postaje Completed → učenik vidi medalju
 * + history zapis na svom /profile.
 */

beforeEach(function () {
    $this->withoutVite();
    Notification::fake();
});

it('admin enters results and student sees medal on profile', function () {
    $sport = Sport::factory()->team()->create(['slug' => 'e2e-result-sport']);
    $comp = Competition::factory()->past()->create([
        'sport_id' => $sport->id,
        'slug' => 'e2e-result-comp',
    ]);
    $team = Team::factory()->create([
        'competition_id' => $comp->id,
        'status' => TeamStatus::Active,
    ]);
    $student = Student::factory()->create();
    TeamMember::factory()->create([
        'team_id' => $team->id,
        'student_id' => $student->id,
    ]);
    $admin = User::factory()->admin()->create();

    // Admin unosi rezultat
    $this->actingAs($admin)
        ->post("/admin/competitions/{$comp->id}/results", [
            'results' => [
                ['subject_type' => 'Team', 'subject_id' => $team->id, 'placement' => 1, 'medal_type' => 'gold'],
            ],
        ])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    expect($team->fresh()->status)->toBe(TeamStatus::Completed);
    expect(Result::where('subject_id', $team->id)->first()->medal_type)->toBe(MedalType::Gold);

    // Logout, login učenik, prikaz medalja
    $this->post('/logout');
    $response = $this->actingAs($student)->get('/profile');

    $response->assertOk()
        ->assertInertia(fn ($p) => $p
            ->component('students/profile')
            ->where('student.medals.gold', 1)
            ->where('student.medals.silver', 0)
            ->where('student.medals.bronze', 0)
        );
});

it('student sees zero medals when no results entered', function () {
    $student = Student::factory()->create();

    $this->actingAs($student)
        ->get('/profile')
        ->assertOk()
        ->assertInertia(fn ($p) => $p
            ->component('students/profile')
            ->where('student.medals.gold', 0)
            ->where('student.medals.silver', 0)
            ->where('student.medals.bronze', 0)
        );
});

it('history reflects team completion with result', function () {
    $sport = Sport::factory()->team()->create(['slug' => 'e2e-history-sport']);
    $comp = Competition::factory()->past()->create([
        'sport_id' => $sport->id,
        'slug' => 'e2e-history-comp',
        'name' => 'Test Takmičenje 2026',
    ]);
    $team = Team::factory()->create([
        'competition_id' => $comp->id,
        'status' => TeamStatus::Active,
    ]);
    $student = Student::factory()->create();
    TeamMember::factory()->create([
        'team_id' => $team->id,
        'student_id' => $student->id,
    ]);
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->post("/admin/competitions/{$comp->id}/results", [
            'results' => [
                ['subject_type' => 'Team', 'subject_id' => $team->id, 'placement' => 2, 'medal_type' => 'silver'],
            ],
        ])
        ->assertRedirect();

    $this->post('/logout');
    $this->actingAs($student)
        ->get('/profile')
        ->assertOk()
        ->assertInertia(fn ($p) => $p
            ->where('student.history.0.result.placement', 2)
            ->where('student.history.0.result.medal_type', 'silver')
            ->where('student.history.0.competition.name', 'Test Takmičenje 2026')
        );
});
