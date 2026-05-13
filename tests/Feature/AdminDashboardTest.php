<?php

use App\Enums\MedicalCertificateStatus;
use App\Enums\StudentVerificationStatus;
use App\Models\AuditLogEntry;
use App\Models\Competition;
use App\Models\MedicalCertificate;
use App\Models\Professor;
use App\Models\School;
use App\Models\Student;
use App\Models\Team;
use App\Models\TeamMember;
use App\Models\User;

it('admin sees stats, pending lists and recent audit on dashboard', function () {
    $admin = User::factory()->admin()->create();

    // Submitted ekipa koja čeka odobrenje
    Team::factory()->submitted()->create();

    // Cert za ručnu provjeru
    $member = TeamMember::factory()->create();
    MedicalCertificate::factory()->create([
        'team_member_id' => $member->id,
        'status' => MedicalCertificateStatus::ManualReview,
    ]);

    // Mismatched učenik
    Student::factory()->create([
        'verification_status' => StudentVerificationStatus::Mismatched,
    ]);

    // Audit zapis
    AuditLogEntry::create([
        'action' => 'team.submitted',
        'user_id' => $admin->id,
        'created_at' => now(),
    ]);

    $this->actingAs($admin)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(
            fn ($page) => $page
                ->component('dashboard')
                ->where('role', 'admin')
                ->has('stats.users.total')
                ->where('stats.teams.submitted', 1)
                ->where('stats.certificates.manual_review', 1)
                ->where('stats.students.mismatched', 1)
                ->has('pending.submittedTeams', 1)
                ->has('pending.manualCertificates', 1)
                ->has('pending.mismatchedStudents', 1)
                ->has('recentAudit', 1)
                ->where('recentAudit.0.action', 'team.submitted')
        );
});

it('professor sees simple welcome dashboard without admin stats', function () {
    $professor = Professor::factory()->create();

    $this->actingAs($professor)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(
            fn ($page) => $page
                ->component('dashboard')
                ->where('role', 'professor')
                ->missing('stats')
                ->missing('pending')
                ->missing('recentAudit')
        );
});

it('admin dashboard limits pending lists to 5 entries', function () {
    $admin = User::factory()->admin()->create();

    // Reuse jedne competition da minimizujemo factory pozive; ekipe imaju unique
    // (competition_id, school_id) pa svakoj treba zasebna škola.
    $competition = Competition::factory()->create();

    for ($i = 0; $i < 7; $i++) {
        $school = School::factory()->create();
        Team::factory()
            ->submitted()
            ->for($school)
            ->for($competition)
            ->for(Professor::factory()->for($school), 'professor')
            ->create();
    }

    $this->actingAs($admin)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(
            fn ($page) => $page
                ->component('dashboard')
                ->where('stats.teams.submitted', 7)
                ->has('pending.submittedTeams', 5)
        );
});

it('guests are redirected to login', function () {
    $this->get(route('dashboard'))->assertRedirect(route('login'));
});
