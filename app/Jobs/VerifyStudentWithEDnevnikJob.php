<?php

namespace App\Jobs;

use App\Adapters\EDnevnik\Exceptions\EDnevnikNotFoundException;
use App\Adapters\EDnevnik\Exceptions\EDnevnikUnavailableException;
use App\Contracts\EDnevnikAdapter;
use App\Enums\StudentVerificationStatus;
use App\Enums\UserRole;
use App\Models\Student;
use App\Models\User;
use App\Notifications\StudentMismatchedNotification;
use App\Notifications\StudentVerifiedNotification;
use App\Services\AuditLogger;
use App\Services\EDnevnikVerificationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Notification;

class VerifyStudentWithEDnevnikJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public int $backoff = 30;

    public function __construct(public int $studentId)
    {
        $this->onQueue('ednevnik');
    }

    public function handle(
        EDnevnikAdapter $adapter,
        EDnevnikVerificationService $service,
        AuditLogger $audit,
    ): void {
        $student = Student::withoutGlobalScope('student')->find($this->studentId);
        if (! $student instanceof Student) {
            return;
        }

        $audit->log('ednevnik.queried', $student, ['jmb' => $student->jmb]);

        try {
            $remote = $adapter->fetchStudentByJmb($student->jmb);
        } catch (EDnevnikNotFoundException) {
            $student->update(['verification_status' => StudentVerificationStatus::Failed]);
            $audit->log('student.verification_failed', $student, ['reason' => 'not_found']);

            return;
        } catch (EDnevnikUnavailableException $e) {
            // queue retry mehanizam će reprovisirati job
            throw $e;
        }

        $result = $service->compare($student, $remote);
        $admins = User::where('role', UserRole::Admin->value)->get();

        if ($result->verified) {
            $student->update(['verification_status' => StudentVerificationStatus::Verified]);
            $audit->log('student.verified', $student, ['source' => 'ednevnik']);
            Notification::send($admins, new StudentVerifiedNotification($student));

            return;
        }

        $student->update(['verification_status' => StudentVerificationStatus::Mismatched]);
        $audit->log('student.mismatched', $student, ['mismatches' => $result->mismatches]);
        Notification::send($admins, new StudentMismatchedNotification($student, $result->mismatches));
    }
}
