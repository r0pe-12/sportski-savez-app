<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateStudentProfileRequest;
use App\Models\Student;
use App\Services\AuditLogger;
use App\Services\PrivateFileStorage;
use App\Services\StudentHistoryService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class StudentProfileController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private StudentHistoryService $history,
        private PrivateFileStorage $storage,
        private AuditLogger $audit,
    ) {}

    public function showOwn(): Response
    {
        $student = $this->currentStudent();

        return $this->renderProfile($student, isOwn: true);
    }

    public function show(Student $student): Response
    {
        $this->authorize('viewProfile', $student);

        return $this->renderProfile($student, isOwn: false);
    }

    public function update(UpdateStudentProfileRequest $request): RedirectResponse
    {
        $student = $this->currentStudent();
        $student->update($request->validated());

        $this->audit->log('student.profile_updated', $student, ['fields' => array_keys($request->validated())]);

        return back();
    }

    private function renderProfile(Student $student, bool $isOwn): Response
    {
        $student->loadMissing('school');

        $photoUrl = $student->photo_path
            ? $this->storage->temporaryUrl($student->photo_path, 5)
            : null;

        return Inertia::render($isOwn ? 'students/profile' : 'students/show', [
            'student' => [
                'id' => $student->id,
                'name' => $student->name,
                'email' => $student->email,
                'phone' => $student->phone,
                'jmb' => $student->jmb,
                'grade' => $student->grade,
                'birth_date' => $student->birth_date?->toDateString(),
                'verification_status' => $student->verification_status?->value,
                'school' => $student->school?->only(['id', 'name', 'code']),
                'photo_url' => $photoUrl,
                'history' => $this->history->forStudent($student),
                'medals' => $this->history->medalCountsFor($student),
            ],
        ]);
    }

    private function currentStudent(): Student
    {
        $user = auth()->user();
        if (! $user || ! $user->isStudent()) {
            abort(404);
        }

        return Student::findOrFail($user->id);
    }
}
