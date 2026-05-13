<?php

namespace App\Http\Requests\Admin;

use App\Enums\CompetitionStatus;
use App\Models\Competition;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCompetitionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', Competition::class) ?? false;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'slug' => ['required', 'string', 'max:80', 'unique:competitions,slug'],
            'name' => ['required', 'string', 'max:200'],
            'sport_id' => ['required', 'exists:sports,id'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'location' => ['required', 'string', 'max:100'],
            'status' => ['required', Rule::in(array_map(fn ($c) => $c->value, CompetitionStatus::cases()))],
            'year' => ['required', 'integer', 'min:2024', 'max:2100'],
        ];
    }
}
