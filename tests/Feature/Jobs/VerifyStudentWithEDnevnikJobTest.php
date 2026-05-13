<?php

use App\Enums\StudentVerificationStatus;
use App\Jobs\VerifyStudentWithEDnevnikJob;
use App\Models\AuditLogEntry;
use App\Models\School;
use App\Models\Student;
use App\Models\User;
use App\Notifications\StudentMismatchedNotification;
use App\Notifications\StudentVerifiedNotification;
use Illuminate\Support\Facades\Notification;

it('marks student verified when adapter returns matching data', function () {
    Notification::fake();
    $admin = User::factory()->admin()->create();
    $school = School::factory()->create(['code' => 'OS-PG-001']);
    $student = Student::factory()->forSchool($school)->create([
        'name' => 'Marko Marković', 'grade' => '8-1', 'jmb' => '0101010250100',
        'verification_status' => StudentVerificationStatus::Unverified,
    ]);

    VerifyStudentWithEDnevnikJob::dispatchSync($student->id);

    expect($student->fresh()->verification_status)->toBe(StudentVerificationStatus::Verified);
    Notification::assertSentTo($admin, StudentVerifiedNotification::class);
});

it('marks mismatched when adapter returns different grade', function () {
    Notification::fake();
    $admin = User::factory()->admin()->create();
    $school = School::factory()->create(['code' => 'OS-PG-001']);
    $student = Student::factory()->forSchool($school)->create([
        'name' => 'Ana Anić', 'grade' => '8-1', 'jmb' => '0000000000101',
        // JMB počinje sa 00000 → FakeEDnevnikAdapter vraća razred=9-9 (mismatched)
    ]);

    VerifyStudentWithEDnevnikJob::dispatchSync($student->id);

    expect($student->fresh()->verification_status)->toBe(StudentVerificationStatus::Mismatched);
    Notification::assertSentTo($admin, StudentMismatchedNotification::class);
});

it('marks failed when adapter throws NotFound', function () {
    $school = School::factory()->create(['code' => 'OS-PG-001']);
    $student = Student::factory()->forSchool($school)->create([
        'jmb' => '9999999999999', // FakeEDnevnik baca NotFound za 99999*
    ]);

    VerifyStudentWithEDnevnikJob::dispatchSync($student->id);

    expect($student->fresh()->verification_status)->toBe(StudentVerificationStatus::Failed);
});

it('writes ednevnik.queried audit on every run', function () {
    Notification::fake();
    $school = School::factory()->create(['code' => 'OS-PG-001']);
    $student = Student::factory()->forSchool($school)->create([
        'name' => 'Marko Marković', 'grade' => '8-1', 'jmb' => '0101010250101',
    ]);

    VerifyStudentWithEDnevnikJob::dispatchSync($student->id);

    expect(AuditLogEntry::where('action', 'ednevnik.queried')->where('subject_id', $student->id)->exists())->toBeTrue();
    expect(AuditLogEntry::where('action', 'student.verified')->where('subject_id', $student->id)->exists())->toBeTrue();
});

it('writes student.verification_failed audit when not found', function () {
    $school = School::factory()->create(['code' => 'OS-PG-001']);
    $student = Student::factory()->forSchool($school)->create([
        'jmb' => '9999988887777',
    ]);

    VerifyStudentWithEDnevnikJob::dispatchSync($student->id);

    $entry = AuditLogEntry::where('action', 'student.verification_failed')
        ->where('subject_id', $student->id)
        ->first();
    expect($entry)->not->toBeNull();
    expect($entry->payload['reason'] ?? null)->toBe('not_found');
});

it('writes student.mismatched audit with mismatches payload', function () {
    Notification::fake();
    $school = School::factory()->create(['code' => 'OS-PG-001']);
    $student = Student::factory()->forSchool($school)->create([
        'name' => 'Ana Anić', 'grade' => '8-1', 'jmb' => '0000011112222',
    ]);

    VerifyStudentWithEDnevnikJob::dispatchSync($student->id);

    $entry = AuditLogEntry::where('action', 'student.mismatched')
        ->where('subject_id', $student->id)
        ->first();
    expect($entry)->not->toBeNull();
    expect($entry->payload['mismatches'] ?? null)->toBeArray()->toHaveKey('razred');
});

it('returns silently when student id does not exist', function () {
    Notification::fake();
    VerifyStudentWithEDnevnikJob::dispatchSync(999999);
    expect(true)->toBeTrue();
});
