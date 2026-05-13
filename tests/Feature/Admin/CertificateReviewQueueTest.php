<?php

use App\Enums\MedicalCertificateStatus;
use App\Models\AuditLogEntry;
use App\Models\MedicalCertificate;
use App\Models\Professor;
use App\Models\School;
use App\Models\Team;
use App\Models\TeamMember;
use App\Models\User;

beforeEach(function () {
    $this->admin = User::factory()->admin()->create();
});

it('admin sees index defaulting to manual_review certificates only', function () {
    MedicalCertificate::factory()->create([
        'status' => MedicalCertificateStatus::ManualReview,
    ]);
    MedicalCertificate::factory()->create([
        'status' => MedicalCertificateStatus::ManualReview,
    ]);
    MedicalCertificate::factory()->create([
        'status' => MedicalCertificateStatus::Valid,
    ]);
    MedicalCertificate::factory()->pending()->create();

    $this->actingAs($this->admin)
        ->get('/admin/certificates')
        ->assertOk()
        ->assertInertia(
            fn ($page) => $page
                ->component('admin/certificates/index')
                ->where('filters.status', 'manual_review')
                ->has('certificates.data', 2),
        );
});

it('admin can filter by status', function () {
    MedicalCertificate::factory()->create([
        'status' => MedicalCertificateStatus::ManualReview,
    ]);
    MedicalCertificate::factory()->invalid()->create();
    MedicalCertificate::factory()->invalid()->create();

    $this->actingAs($this->admin)
        ->get('/admin/certificates?status=invalid')
        ->assertOk()
        ->assertInertia(
            fn ($page) => $page
                ->where('filters.status', 'invalid')
                ->has('certificates.data', 2),
        );
});

it('status=all returns all certificates', function () {
    MedicalCertificate::factory()->count(2)->create([
        'status' => MedicalCertificateStatus::ManualReview,
    ]);
    MedicalCertificate::factory()->count(2)->create([
        'status' => MedicalCertificateStatus::Valid,
    ]);

    $this->actingAs($this->admin)
        ->get('/admin/certificates?status=all')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->has('certificates.data', 4));
});

it('admin can filter by school', function () {
    $schoolA = School::factory()->create();
    $schoolB = School::factory()->create();

    $teamA = Team::factory()->create(['school_id' => $schoolA->id]);
    $teamB = Team::factory()->create(['school_id' => $schoolB->id]);

    $memberA = TeamMember::factory()->create(['team_id' => $teamA->id]);
    $memberB = TeamMember::factory()->create(['team_id' => $teamB->id]);

    MedicalCertificate::factory()->create([
        'team_member_id' => $memberA->id,
        'status' => MedicalCertificateStatus::ManualReview,
    ]);
    MedicalCertificate::factory()->create([
        'team_member_id' => $memberB->id,
        'status' => MedicalCertificateStatus::ManualReview,
    ]);

    $this->actingAs($this->admin)
        ->get("/admin/certificates?school_id={$schoolA->id}")
        ->assertOk()
        ->assertInertia(fn ($page) => $page->has('certificates.data', 1));
});

it('admin can reject a manual_review certificate', function () {
    $cert = MedicalCertificate::factory()->create([
        'status' => MedicalCertificateStatus::ManualReview,
    ]);

    $this->actingAs($this->admin)
        ->post("/admin/certificates/{$cert->id}/reject")
        ->assertRedirect();

    expect($cert->fresh()->status)->toBe(MedicalCertificateStatus::Invalid);
    expect(
        AuditLogEntry::where('action', 'certificate.rejected')
            ->where('subject_id', $cert->id)
            ->exists(),
    )->toBeTrue();
});

it('admin can reject a pending certificate', function () {
    $cert = MedicalCertificate::factory()->pending()->create();

    $this->actingAs($this->admin)
        ->post("/admin/certificates/{$cert->id}/reject")
        ->assertRedirect();

    expect($cert->fresh()->status)->toBe(MedicalCertificateStatus::Invalid);
});

it('admin cannot reject a valid certificate', function () {
    $cert = MedicalCertificate::factory()->create([
        'status' => MedicalCertificateStatus::Valid,
    ]);

    $this->actingAs($this->admin)
        ->post("/admin/certificates/{$cert->id}/reject")
        ->assertForbidden();

    expect($cert->fresh()->status)->toBe(MedicalCertificateStatus::Valid);
});

it('professor cannot access admin index', function () {
    $this->actingAs(Professor::factory()->create())
        ->get('/admin/certificates')
        ->assertForbidden();
});

it('professor cannot reject', function () {
    $cert = MedicalCertificate::factory()->create([
        'status' => MedicalCertificateStatus::ManualReview,
    ]);

    $this->actingAs(Professor::factory()->create())
        ->post("/admin/certificates/{$cert->id}/reject")
        ->assertForbidden();

    expect($cert->fresh()->status)->toBe(MedicalCertificateStatus::ManualReview);
});

it('guest is redirected from admin index', function () {
    $this->get('/admin/certificates')->assertRedirect('/login');
});
