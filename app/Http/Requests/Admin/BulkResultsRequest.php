<?php

namespace App\Http\Requests\Admin;

use App\Enums\MedalType;
use App\Models\Result;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class BulkResultsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', Result::class) ?? false;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'results' => ['required', 'array', 'min:1'],
            'results.*.subject_type' => ['required', Rule::in(['Team', 'TeamMember'])],
            'results.*.subject_id' => ['required', 'integer'],
            'results.*.placement' => ['required', 'integer', 'min:1'],
            'results.*.medal_type' => ['required', Rule::in(array_map(fn ($m) => $m->value, MedalType::cases()))],
        ];
    }
}
