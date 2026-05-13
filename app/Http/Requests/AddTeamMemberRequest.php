<?php

namespace App\Http\Requests;

use App\Enums\TeamStatus;
use App\Models\TeamMember;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class AddTeamMemberRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('addMember', $this->route('team'));
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        $team = $this->route('team');

        return [
            'student_id' => [
                'required',
                'exists:users,id,role,student,school_id,'.$team->school_id,
                Rule::unique('team_members', 'student_id')->where(fn ($q) => $q->where('team_id', $team->id)),
                Rule::notIn(
                    TeamMember::query()
                        ->whereHas('team', fn ($q) => $q
                            ->where('competition_id', $team->competition_id)
                            ->whereIn('status', [
                                TeamStatus::Draft->value,
                                TeamStatus::Submitted->value,
                                TeamStatus::Active->value,
                            ])
                            ->where('id', '!=', $team->id))
                        ->pluck('student_id')
                        ->all()
                ),
            ],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $v) {
            $team = $this->route('team');
            $sport = $team->competition->sport;
            $maxMembers = $sport->members_count + $sport->substitutes_count;

            if ($team->members()->count() >= $maxMembers) {
                $v->errors()->add('student_id', "Maksimalan broj članova ({$maxMembers}) već postignut.");
            }
        });
    }
}
