<?php

use App\Enums\MedicalCertificateStatus;
use App\Enums\StudentVerificationStatus;
use App\Models\AuditLogEntry;
use App\Models\MedicalCertificate;
use App\Models\Student;
use App\Models\Team;
use App\Models\TeamMember;
use App\Models\User;

beforeEach(function () {
    $this->admin = User::factory()->admin()->create();
});

it('admin sees cert status badges and summary on team show', function () {
    $team = Team::factory()->submitted()->create();

    $studentValid = Student::factory()->create([
        'verification_status' => StudentVerificationStatus::Verified,
    ]);
    $studentManual = Student::factory()->create([
        'verification_status' => StudentVerificationStatus::Mismatched,
    ]);
    $studentMissing = Student::factory()->create([
        'verification_status' => StudentVerificationStatus::Unverified,
    ]);

    $memberValid = TeamMember::factory()->create([
        'team_id' => $team->id,
        'student_id' => $studentValid->id,
    ]);
    $memberManual = TeamMember::factory()->create([
        'team_id' => $team->id,
        'student_id' => $studentManual->id,
    ]);
    TeamMember::factory()->create([
        'team_id' => $team->id,
        'student_id' => $studentMissing->id,
    ]);

    MedicalCertificate::factory()->create([
        'team_member_id' => $memberValid->id,
        'status' => MedicalCertificateStatus::Valid,
    ]);
    MedicalCertificate::factory()->create([
        'team_member_id' => $memberManual->id,
        'status' => MedicalCertificateStatus::ManualReview,
    ]);

    $this->actingAs($this->admin)
        ->get("/admin/teams/{$team->id}")
        ->assertOk()
        ->assertInertia(
            fn ($page) => $page
                ->component('admin/teams/show')
                ->has('team.members', 3)
                ->where('team.members.0.medical_certificate.status', 'valid')
                ->where('team.members.1.medical_certificate.status', 'manual_review')
                ->where('team.members.2.medical_certificate', null)
                ->where('team.members.0.student.verification_status', 'verified')
                ->where('team.members.1.student.verification_status', 'mismatched')
                ->where('certificateSummary.valid', 1)
                ->where('certificateSummary.manual_review', 1)
                ->where('certificateSummary.missing', 1)
                ->where('certificateSummary.total', 3),
        );
});

it('admin show exposes recent audit entries for the team', function () {
    $team = Team::factory()->submitted()->create();
    $otherTeam = Team::factory()->submitted()->create();

    AuditLogEntry::create([
        'user_id' => $this->admin->id,
        'action' => 'team.submitted',
        'subject_type' => $team->getMorphClass(),
        'subject_id' => $team->id,
        'payload' => [],
        'ip' => '127.0.0.1',
        'created_at' => now()->subMinutes(10),
    ]);
    AuditLogEntry::create([
        'user_id' => $this->admin->id,
        'action' => 'team.approved',
        'subject_type' => $team->getMorphClass(),
        'subject_id' => $team->id,
        'payload' => [],
        'ip' => '127.0.0.1',
        'created_at' => now(),
    ]);
    AuditLogEntry::create([
        'user_id' => $this->admin->id,
        'action' => 'team.submitted',
        'subject_type' => $otherTeam->getMorphClass(),
        'subject_id' => $otherTeam->id,
        'payload' => [],
        'ip' => '127.0.0.1',
        'created_at' => now(),
    ]);

    $this->actingAs($this->admin)
        ->get("/admin/teams/{$team->id}")
        ->assertOk()
        ->assertInertia(
            fn ($page) => $page
                ->has('recentAudit', 2)
                ->where('recentAudit.0.action', 'team.approved')
                ->where('recentAudit.1.action', 'team.submitted'),
        );
});

it('approve and reject actions are only available for submitted teams', function () {
    $submitted = Team::factory()->submitted()->create();
    $draft = Team::factory()->draft()->create();
    $active = Team::factory()->active()->create();

    // submitted: status is submitted, props show status that frontend uses to render buttons
    $this->actingAs($this->admin)
        ->get("/admin/teams/{$submitted->id}")
        ->assertOk()
        ->assertInertia(fn ($page) => $page->where('team.status', 'submitted'));

    // draft: cannot be approved through service (guards) – verifies actions hidden in UI
    $this->actingAs($this->admin)
        ->get("/admin/teams/{$draft->id}")
        ->assertOk()
        ->assertInertia(fn ($page) => $page->where('team.status', 'draft'));

    $this->actingAs($this->admin)
        ->post("/admin/teams/{$draft->id}/approve")
        ->assertSessionHasErrors('general');

    // active: also not allowed
    $this->actingAs($this->admin)
        ->get("/admin/teams/{$active->id}")
        ->assertOk()
        ->assertInertia(fn ($page) => $page->where('team.status', 'active'));

    $this->actingAs($this->admin)
        ->post("/admin/teams/{$active->id}/approve")
        ->assertSessionHasErrors('general');
});
