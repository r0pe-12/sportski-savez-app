<?php

namespace App\Http\Requests;

use App\Models\Team;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTeamRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', Team::class);
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'competition_id' => [
                'required',
                'exists:competitions,id',
                Rule::unique('teams', 'competition_id')->where(
                    fn ($q) => $q->where('school_id', $this->user()->school_id)
                ),
            ],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'competition_id.unique' => 'Već postoji prijava vaše škole za ovo takmičenje.',
        ];
    }
}
