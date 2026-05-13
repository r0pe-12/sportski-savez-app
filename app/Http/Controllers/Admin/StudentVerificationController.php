<?php

namespace App\Http\Controllers\Admin;

use App\Enums\StudentVerificationStatus;
use App\Http\Controllers\Controller;
use App\Jobs\VerifyStudentWithEDnevnikJob;
use App\Models\AuditLogEntry;
use App\Models\School;
use App\Models\Student;
use App\Services\AuditLogger;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StudentVerificationController extends Controller
{
    use AuthorizesRequests;

    public function __construct(private AuditLogger $audit) {}

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Student::class);

        $q = trim($request->string('q')->toString());
        $schoolId = $request->integer('school_id') ?: null;
        $status = $request->string('status')->toString() ?: null;

        $query = Student::with('school')
            ->orderBy('verification_status')
            ->orderBy('name');

        if ($q !== '') {
            $query->where(function ($w) use ($q): void {
                $w->where('name', 'like', "%{$q}%")
                    ->orWhere('jmb', 'like', "%{$q}%");
            });
        }

        if ($schoolId !== null) {
            $query->where('school_id', $schoolId);
        }

        if ($status !== null && StudentVerificationStatus::tryFrom($status) !== null) {
            $query->where('verification_status', $status);
        }

        $students = $query->paginate(25)->withQueryString();

        return Inertia::render('admin/students/index', [
            'students' => $students,
            'schools' => School::orderBy('name')->get(['id', 'name']),
            'filters' => [
                'q' => $q !== '' ? $q : null,
                'school_id' => $schoolId,
                'status' => $status,
            ],
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
