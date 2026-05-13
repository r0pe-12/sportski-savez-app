<?php

namespace App\Http\Requests\Admin;

use App\Enums\SportType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('update', $this->route('sport')) ?? false;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'slug' => ['required', 'string', 'max:50', Rule::unique('sports', 'slug')->ignore($this->route('sport')->id)],
            'name' => ['required', 'string', 'max:100'],
            'type' => ['required', Rule::in([SportType::Team->value, SportType::Individual->value])],
            'members_count' => ['required', 'integer', 'min:1', 'max:30'],
            'substitutes_count' => ['required', 'integer', 'min:0', 'max:30'],
            'rules_description' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
