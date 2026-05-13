<?php

namespace App\Http\Controllers;

use App\Http\Requests\UploadStudentPhotoRequest;
use App\Models\Student;
use App\Services\AuditLogger;
use App\Services\PrivateFileStorage;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\RedirectResponse;

class StudentPhotoController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private PrivateFileStorage $storage,
        private AuditLogger $audit,
    ) {}

    public function store(UploadStudentPhotoRequest $request, Student $student): RedirectResponse
    {
        $path = $this->storage->storeFor($student, $request->file('photo'), 'photos');
        $student->update(['photo_path' => $path]);
        $this->audit->log('student.photo_uploaded', $student);

        return back();
    }

    public function destroy(Student $student): RedirectResponse
    {
        $this->authorize('uploadPhoto', $student);

        $student->update(['photo_path' => null]);
        $this->audit->log('student.photo_removed', $student);

        return back();
    }
}
