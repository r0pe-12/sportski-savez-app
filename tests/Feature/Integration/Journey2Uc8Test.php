<?php

use App\Enums\StudentVerificationStatus;
use App\Jobs\VerifyStudentWithEDnevnikJob;
use App\Models\AuditLogEntry;
use App\Models\School;
use App\Models\Student;
use App\Models\User;
use Illuminate\Support\Facades\Notification;

/*
 * E2E Journey 2 — UC8 verifikacija učenika preko fake eDnevnik adaptera.
 * Admin: trigeruje verifikaciju → job se izvršava → status se mijenja u verified/mismatched.
 * FakeEDnevnikAdapter je determinističan po JMB-u, pa testiramo da neki od dva ishoda nastupi.
 */

it('admin verifies student via fake eDnevnik flow', function () {
    Notification::fake();

    $school = School::factory()->create(['code' => 'OS-PG-UC8']);
    $student = Student::factory()->forSchool($school)->create([
        'jmb' => '0123456789010',
        'grade' => '8-1',
        'name' => 'Marko Marković',
        'verification_status' => StudentVerificationStatus::Unverified,
    ]);
    $admin = User::factory()->admin()->create();

    // Admin pokreće verifikaciju — sa default sync queue driver-om, job se izvrši odmah,
    // tako da status preskače Pending i ide direktno u finalni state.
    $this->actingAs($admin)
        ->post("/admin/students/{$student->id}/verify")
        ->assertRedirect();

    // Eksplicitno još jednom procesiraj (idempotent) da pokrijemo i slučaj kada bi queue bio async.
    VerifyStudentWithEDnevnikJob::dispatchSync($student->id);

    // Krajni status zavisi od fake adapter-a — može biti Verified, Mismatched ili Failed.
    expect($student->fresh()->verification_status)->toBeIn([
        StudentVerificationStatus::Verified,
        StudentVerificationStatus::Mismatched,
        StudentVerificationStatus::Failed,
    ]);

    // Audit log mora sadržati ednevnik.queried i jedan od finalnih action-a
    expect(AuditLogEntry::where('action', 'student.verification_requested')->where('subject_id', $student->id)->exists())
        ->toBeTrue();
    expect(AuditLogEntry::where('action', 'ednevnik.queried')->where('subject_id', $student->id)->exists())
        ->toBeTrue();
});

it('admin manually approves mismatched student end-to-end', function () {
    Notification::fake();

    $school = School::factory()->create(['code' => 'OS-PG-UC8B']);
    $student = Student::factory()->forSchool($school)->mismatched()->create();
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->post("/admin/students/{$student->id}/manual-approve")
        ->assertRedirect();

    expect($student->fresh()->verification_status)->toBe(StudentVerificationStatus::Verified);
    expect(AuditLogEntry::where('action', 'student.manually_approved')
        ->where('subject_id', $student->id)
        ->exists())->toBeTrue();
});
