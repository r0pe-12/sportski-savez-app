<?php

use App\Enums\StudentVerificationStatus;
use App\Jobs\VerifyStudentWithEDnevnikJob;
use App\Models\AuditLogEntry;
use App\Models\Professor;
use App\Models\School;
use App\Models\Student;
use App\Models\User;
use Illuminate\Support\Facades\Bus;

beforeEach(function () {
    $this->admin = User::factory()->admin()->create();
    $this->school = School::factory()->create(['code' => 'OS-PG-001']);
});

it('admin can list students', function () {
    Student::factory()->forSchool($this->school)->count(3)->create();

    $this->withoutVite()
        ->actingAs($this->admin)
        ->get('/admin/students')
        ->assertOk()
        ->assertInertia(fn ($p) => $p->component('admin/students/index')->has('students.data', 3));
});

it('admin can view student verification page', function () {
    $student = Student::factory()->forSchool($this->school)->create();

    $this->withoutVite()
        ->actingAs($this->admin)
        ->get("/admin/students/{$student->id}/verify")
        ->assertOk()
        ->assertInertia(fn ($p) => $p->component('admin/students/verify')->where('student.id', $student->id));
});

it('admin can trigger verification dispatches job and sets pending', function () {
    Bus::fake();
    $student = Student::factory()->forSchool($this->school)->create(['jmb' => '0101010250200']);

    $this->actingAs($this->admin)
        ->post("/admin/students/{$student->id}/verify")
        ->assertRedirect();

    expect($student->fresh()->verification_status)->toBe(StudentVerificationStatus::Pending);
    Bus::assertDispatched(VerifyStudentWithEDnevnikJob::class, fn ($job) => $job->studentId === $student->id);
});

it('admin can manually approve mismatched student', function () {
    $student = Student::factory()->forSchool($this->school)->mismatched()->create();

    $this->actingAs($this->admin)
        ->post("/admin/students/{$student->id}/manual-approve")
        ->assertRedirect();

    expect($student->fresh()->verification_status)->toBe(StudentVerificationStatus::Verified);
    expect(AuditLogEntry::where('action', 'student.manually_approved')->where('subject_id', $student->id)->exists())
        ->toBeTrue();
});

it('admin can reset verification', function () {
    $student = Student::factory()->forSchool($this->school)->verified()->create();

    $this->actingAs($this->admin)
        ->post("/admin/students/{$student->id}/reset-verification")
        ->assertRedirect();

    expect($student->fresh()->verification_status)->toBe(StudentVerificationStatus::Unverified);
});

it('professor cannot access verification routes', function () {
    $prof = Professor::factory()->create(['school_id' => $this->school->id]);
    $student = Student::factory()->forSchool($this->school)->create();

    $this->actingAs($prof)->post("/admin/students/{$student->id}/verify")->assertForbidden();
    $this->actingAs($prof)->post("/admin/students/{$student->id}/manual-approve")->assertForbidden();
    $this->actingAs($prof)->post("/admin/students/{$student->id}/reset-verification")->assertForbidden();
    $this->actingAs($prof)->get('/admin/students')->assertForbidden();
});

it('guest cannot access verification routes', function () {
    $student = Student::factory()->forSchool($this->school)->create();

    $this->get('/admin/students')->assertRedirect();
    $this->post("/admin/students/{$student->id}/verify")->assertRedirect();
});

it('verify route writes student.verification_requested audit', function () {
    Bus::fake();
    $student = Student::factory()->forSchool($this->school)->create();

    $this->actingAs($this->admin)->post("/admin/students/{$student->id}/verify");

    expect(AuditLogEntry::where('action', 'student.verification_requested')
        ->where('subject_id', $student->id)
        ->exists())->toBeTrue();
});

it('show page exposes lastMismatches from latest mismatched audit', function () {
    $student = Student::factory()->forSchool($this->school)->mismatched()->create();
    AuditLogEntry::create([
        'user_id' => $this->admin->id,
        'action' => 'student.mismatched',
        'subject_type' => $student->getMorphClass(),
        'subject_id' => $student->id,
        'payload' => ['mismatches' => ['razred' => ['local' => '8-1', 'remote' => '9-9']]],
        'created_at' => now(),
    ]);

    $this->withoutVite()
        ->actingAs($this->admin)
        ->get("/admin/students/{$student->id}/verify")
        ->assertOk()
        ->assertInertia(fn ($p) => $p->where('lastMismatches.razred.local', '8-1')
            ->where('lastMismatches.razred.remote', '9-9'));
});
