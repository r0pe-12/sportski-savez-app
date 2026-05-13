<?php

namespace App\Http\Controllers\Admin;

use App\Enums\StudentVerificationStatus;
use App\Http\Controllers\Controller;
use App\Jobs\VerifyStudentWithEDnevnikJob;
use App\Models\AuditLogEntry;
use App\Models\Student;
use App\Services\AuditLogger;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class StudentVerificationController extends Controller
{
    use AuthorizesRequests;

    public function __construct(private AuditLogger $audit) {}

    public function index(): Response
    {
        $this->authorize('viewAny', Student::class);

        return Inertia::render('admin/students/index', [
            'students' => Student::with('school')
                ->orderBy('verification_status')
                ->orderBy('name')
                ->paginate(50),
        ]);
    }

    public function show(Student $student): Response
    {
        $this->authorize('view', $student);

        $lastMismatch = AuditLogEntry::where('action', 'student.mismatched')
            ->where('subject_type', $student->getMorphClass())
            ->where('subject_id', $student->id)
            ->orderByDesc('created_at')
            ->first();

        return Inertia::render('admin/students/verify', [
            'student' => $student->load('school'),
            'lastMismatches' => $lastMismatch?->payload['mismatches'] ?? null,
        ]);
    }

    public function verify(Student $student): RedirectResponse
    {
        $this->authorize('viewAny', Student::class);

        $student->update(['verification_status' => StudentVerificationStatus::Pending]);
        $this->audit->log('student.verification_requested', $student);
        VerifyStudentWithEDnevnikJob::dispatch($student->id);

        return back();
    }

    public function manualApprove(Student $student): RedirectResponse
    {
        $this->authorize('viewAny', Student::class);

        $student->update(['verification_status' => StudentVerificationStatus::Verified]);
        $this->audit->log('student.manually_approved', $student);

        return back();
    }

    public function resetVerification(Student $student): RedirectResponse
    {
        $this->authorize('viewAny', Student::class);

        $student->update(['verification_status' => StudentVerificationStatus::Unverified]);
        $this->audit->log('student.verification_reset', $student);

        return back();
    }
}
