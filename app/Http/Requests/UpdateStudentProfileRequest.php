<?php

namespace App\Http\Requests;

use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateStudentProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        $student = $this->targetStudent();

        return $student !== null && $this->user()?->can('updateLimited', $student);
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        $student = $this->targetStudent();
        $isAdmin = (bool) $this->user()?->isAdmin();

        $rules = [
            'phone' => ['sometimes', 'nullable', 'string', 'max:30'],
            'email' => ['sometimes', 'email', Rule::unique('users', 'email')->ignore($student?->id)],
        ];

        if ($isAdmin) {
            $rules['name'] = ['sometimes', 'string', 'max:255'];
            $rules['grade'] = ['sometimes', 'string', 'max:10'];
            $rules['jmb'] = ['sometimes', 'regex:/^\d{13}$/', Rule::unique('users', 'jmb')->ignore($student?->id)];
        }

        return $rules;
    }

    private function targetStudent(): ?Student
    {
        $routeStudent = $this->route('student');
        if ($routeStudent instanceof Student) {
            return $routeStudent;
        }

        $user = $this->user();
        if ($user instanceof Student) {
            return $user;
        }

        if ($user instanceof User && $user->isStudent()) {
            return Student::find($user->id);
        }

        return null;
    }
}
