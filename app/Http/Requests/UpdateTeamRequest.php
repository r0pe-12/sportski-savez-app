<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTeamRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('team'));
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        // Trenutno team nema mutable fields u draft state-u osim members
        // (members idu kroz TeamMemberController). Ovaj patch je placeholder za autosave.
        return [];
    }
}
