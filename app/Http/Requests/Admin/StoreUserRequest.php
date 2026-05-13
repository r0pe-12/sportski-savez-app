<?php

namespace App\Http\Requests\Admin;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', User::class) ?? false;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'role' => ['required', Rule::in([UserRole::Admin->value, UserRole::Professor->value, UserRole::Student->value])],
            'school_id' => ['nullable', 'exists:schools,id', 'required_unless:role,admin'],
            'jmb' => ['nullable', 'regex:/^\d{13}$/', 'unique:users,jmb', 'required_if:role,student'],
            'grade' => ['nullable', 'string', 'max:10', 'required_if:role,student'],
            'birth_date' => ['nullable', 'date', 'required_if:role,student'],
            'verified_at_now' => ['nullable', 'boolean'],
        ];
    }
}
