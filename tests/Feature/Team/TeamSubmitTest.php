<?php

use App\Enums\MedicalCertificateStatus;
use App\Enums\TeamStatus;
use App\Models\Competition;
use App\Models\MedicalCertificate;
use App\Models\Professor;
use App\Models\Sport;
use App\Models\Student;
use App\Models\Team;
use App\Models\TeamMember;
use Illuminate\Support\Facades\Notification;

beforeEach(function () {
    Notification::fake();

    $this->prof = Professor::factory()->create(['verified_at' => now(), 'name' => 'Marko Marković']);
    $sport = Sport::factory()->team(2, 0)->create(['slug' => 'submit-sport']);
    $comp = Competition::factory()->create(['sport_id' => $sport->id, 'slug' => 'submit-comp']);
    $this->team = Team::factory()->create([
        'professor_id' => $this->prof->id,
        'school_id' => $this->prof->school_id,
        'competition_id' => $comp->id,
        'status' => TeamStatus::Draft,
    ]);
    for ($i = 0; $i < 2; $i++) {
        $s = Student::factory()->forSchool($this->prof->school)->create();
        $m = TeamMember::factory()->create(['team_id' => $this->team->id, 'student_id' => $s->id]);
        MedicalCertificate::factory()->create([
            'team_member_id' => $m->id,
            'status' => MedicalCertificateStatus::Valid,
        ]);
    }
});

it('submit succeeds with valid signature and all certs valid', function () {
    $this->actingAs($this->prof)
        ->post("/teams/{$this->team->id}/submit", ['signature' => 'Marko Marković'])
        ->assertRedirect('/teams');

    expect($this->team->fresh()->status)->toBe(TeamStatus::Submitted);
});

it('submit rejects bad signature', function () {
    $this->actingAs($this->prof)
        ->post("/teams/{$this->team->id}/submit", ['signature' => 'Pogresno'])
        ->assertSessionHasErrors('signature');

    expect($this->team->fresh()->status)->toBe(TeamStatus::Draft);
});

it('submit blocks when cert invalid', function () {
    $this->team->members->first()->medicalCertificate->update([
        'status' => MedicalCertificateStatus::Expired,
    ]);

    $this->actingAs($this->prof)
        ->post("/teams/{$this->team->id}/submit", ['signature' => 'Marko Marković'])
        ->assertSessionHasErrors();

    expect($this->team->fresh()->status)->toBe(TeamStatus::Draft);
});

it('submit forbidden for non-owner professor', function () {
    $otherProf = Professor::factory()->create();

    $this->actingAs($otherProf)
        ->post("/teams/{$this->team->id}/submit", ['signature' => 'Marko Marković'])
        ->assertForbidden();
});

it('submit requires signature field', function () {
    $this->actingAs($this->prof)
        ->post("/teams/{$this->team->id}/submit", [])
        ->assertSessionHasErrors('signature');
});

it('review page is rendered for team owner', function () {
    $this->actingAs($this->prof)
        ->get("/teams/{$this->team->id}/review")
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('teams/review'));
});

it('review page is forbidden for non-owner professor', function () {
    $otherProf = Professor::factory()->create();

    $this->actingAs($otherProf)
        ->get("/teams/{$this->team->id}/review")
        ->assertForbidden();
});

it('cancel draft transitions to cancelled', function () {
    $this->actingAs($this->prof)
        ->post("/teams/{$this->team->id}/cancel")
        ->assertRedirect('/teams');

    expect($this->team->fresh()->status)->toBe(TeamStatus::Cancelled);
});

it('cancel submitted transitions to withdrawn', function () {
    $this->team->update(['status' => TeamStatus::Submitted]);

    $this->actingAs($this->prof)
        ->post("/teams/{$this->team->id}/cancel")
        ->assertRedirect('/teams');

    expect($this->team->fresh()->status)->toBe(TeamStatus::Withdrawn);
});
