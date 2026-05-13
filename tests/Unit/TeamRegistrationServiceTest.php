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
use App\Models\User;
use App\Notifications\TeamSubmittedNotification;
use App\Services\Exceptions\TeamSubmissionException;
use App\Services\TeamRegistrationService;
use Illuminate\Support\Facades\Notification;

beforeEach(function () {
    Notification::fake();

    $this->service = app(TeamRegistrationService::class);
    $this->prof = Professor::factory()->create(['verified_at' => now(), 'name' => 'Marko Marković']);
    $this->sport = Sport::factory()->team(2, 1)->create(['slug' => 'sub-sport']);
    $this->competition = Competition::factory()->create(['sport_id' => $this->sport->id, 'slug' => 'sub-comp']);
    $this->team = Team::factory()->create([
        'professor_id' => $this->prof->id,
        'school_id' => $this->prof->school_id,
        'competition_id' => $this->competition->id,
        'status' => TeamStatus::Draft,
    ]);

    // 2 člana (matches members_count = 2)
    $this->members = collect(range(1, 2))->map(function () {
        $student = Student::factory()->forSchool($this->prof->school)->create();
        $member = TeamMember::factory()->create(['team_id' => $this->team->id, 'student_id' => $student->id]);
        MedicalCertificate::factory()->create([
            'team_member_id' => $member->id,
            'status' => MedicalCertificateStatus::Valid,
        ]);

        return $member;
    });
});

it('submits team when all conditions met', function () {
    $this->service->submit($this->team, 'Marko Marković', '127.0.0.1');

    $fresh = $this->team->fresh();
    expect($fresh->status)->toBe(TeamStatus::Submitted);
    expect($fresh->signature)->toBe('Marko Marković');
    expect($fresh->signed_at)->not->toBeNull();
    expect($fresh->signature_ip)->toBe('127.0.0.1');
});

it('rejects when signature does not match professor name', function () {
    expect(fn () => $this->service->submit($this->team, 'Pogresno Ime', '127.0.0.1'))
        ->toThrow(TeamSubmissionException::class, 'Potpis');
});

it('rejects when not enough members', function () {
    $this->members->first()->delete();

    expect(fn () => $this->service->submit($this->team, 'Marko Marković', '127.0.0.1'))
        ->toThrow(TeamSubmissionException::class, 'broj članova');
});

it('rejects when too many members', function () {
    $maxMembers = $this->sport->members_count + $this->sport->substitutes_count;
    // Add one over the max
    for ($i = 0; $i < ($maxMembers - $this->members->count() + 1); $i++) {
        $student = Student::factory()->forSchool($this->prof->school)->create();
        $member = TeamMember::factory()->create(['team_id' => $this->team->id, 'student_id' => $student->id]);
        MedicalCertificate::factory()->create([
            'team_member_id' => $member->id,
            'status' => MedicalCertificateStatus::Valid,
        ]);
    }

    expect(fn () => $this->service->submit($this->team, 'Marko Marković', '127.0.0.1'))
        ->toThrow(TeamSubmissionException::class, 'broj članova');
});

it('rejects when any member has non-valid certificate', function () {
    $this->members->first()->medicalCertificate->update([
        'status' => MedicalCertificateStatus::Expired,
    ]);

    expect(fn () => $this->service->submit($this->team, 'Marko Marković', '127.0.0.1'))
        ->toThrow(TeamSubmissionException::class, 'potvrd');
});

it('rejects when team not in Draft state', function () {
    $this->team->update(['status' => TeamStatus::Submitted]);

    expect(fn () => $this->service->submit($this->team, 'Marko Marković', '127.0.0.1'))
        ->toThrow(TeamSubmissionException::class);
});

it('sends notifications on successful submit', function () {
    $admin = User::factory()->admin()->create();

    $this->service->submit($this->team, 'Marko Marković', '127.0.0.1');

    // Total count: 1 to professor (via $team->professor) + 1 per admin
    Notification::assertSentTimes(TeamSubmittedNotification::class, 2);
    Notification::assertSentTo($admin, TeamSubmittedNotification::class);
});

it('approves submitted team', function () {
    $this->service->submit($this->team, 'Marko Marković', '127.0.0.1');
    $team = $this->team->fresh();

    $result = $this->service->approve($team);

    expect($result->status)->toBe(TeamStatus::Active);
});

it('rejects approval when team is not submitted', function () {
    expect(fn () => $this->service->approve($this->team))
        ->toThrow(TeamSubmissionException::class);
});

it('rejects submitted team with reason', function () {
    $this->service->submit($this->team, 'Marko Marković', '127.0.0.1');
    $team = $this->team->fresh();

    $result = $this->service->reject($team, 'Nedovoljno članova');

    expect($result->status)->toBe(TeamStatus::Rejected);
    expect($result->rejection_reason)->toBe('Nedovoljno članova');
});
