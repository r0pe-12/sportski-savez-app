<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Enums\UserRole;
use App\Models\Professor;
use App\Models\Student;
use App\Models\User;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, mixed>  $input
     */
    public function create(array $input): User
    {
        $validated = Validator::make($input, [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => $this->passwordRules(),
            'role' => ['required', Rule::in([UserRole::Professor->value, UserRole::Student->value])],
            'school_id' => ['required', 'exists:schools,id'],
            'jmb' => ['required_if:role,student', 'nullable', 'regex:/^\d{13}$/', 'unique:users,jmb'],
            'grade' => ['required_if:role,student', 'nullable', 'string', 'max:10'],
            'birth_date' => ['required_if:role,student', 'nullable', 'date', 'before:today'],
            'parental_consent' => ['nullable', 'required_if:role,student', 'accepted_if:role,student'],
        ])->validate();

        $role = UserRole::from($validated['role']);

        return match ($role) {
            UserRole::Professor => Professor::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => $validated['password'],
                'school_id' => $validated['school_id'],
            ]),
            UserRole::Student => Student::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => $validated['password'],
                'school_id' => $validated['school_id'],
                'jmb' => $validated['jmb'],
                'grade' => $validated['grade'],
                'birth_date' => $validated['birth_date'],
                'parental_consent' => true,
                'parental_consent_at' => now(),
            ]),
            UserRole::Admin => throw new \LogicException('Admin role cannot be created through public registration.'),
        };
    }
}
