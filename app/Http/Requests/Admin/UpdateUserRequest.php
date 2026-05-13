<?php

namespace App\Http\Requests\Admin;

use App\Enums\UserRole;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('update', $this->route('user')) ?? false;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        $user = $this->route('user');

        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', Rule::unique('users', 'email')->ignore($user->id)],
            'role' => ['required', Rule::in([UserRole::Admin->value, UserRole::Professor->value, UserRole::Student->value])],
            'school_id' => ['nullable', 'exists:schools,id', 'required_unless:role,admin'],
            'jmb' => ['nullable', 'regex:/^\d{13}$/', Rule::unique('users', 'jmb')->ignore($user->id)],
            'grade' => ['nullable', 'string', 'max:10'],
            'birth_date' => ['nullable', 'date'],
            'verified_at' => ['nullable', 'date'],
        ];
    }
}
