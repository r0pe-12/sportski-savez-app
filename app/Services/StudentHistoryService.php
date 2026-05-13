<?php

namespace App\Services;

use App\Models\Student;
use App\Models\TeamMember;
use Illuminate\Support\Collection;

class StudentHistoryService
{
    /** @return Collection<int, array<string, mixed>> */
    public function forStudent(Student $student): Collection
    {
        $members = TeamMember::with(['team.competition.sport', 'results', 'team.results'])
            ->where('student_id', $student->id)
            ->get();

        return $members->map(function (TeamMember $m): array {
            $teamResult = $m->team->results->first();
            $memberResult = $m->results->first();
            $result = $memberResult ?? $teamResult;

            return [
                'team_id' => $m->team->id,
                'competition' => [
                    'id' => $m->team->competition->id,
                    'slug' => $m->team->competition->slug,
                    'name' => $m->team->competition->name,
                    'start_date' => $m->team->competition->start_date?->toDateString(),
                ],
                'sport' => [
                    'name' => $m->team->competition->sport->name,
                    'type' => $m->team->competition->sport->type->value,
                ],
                'team_status' => $m->team->status->value,
                'result' => $result ? [
                    'placement' => $result->placement,
                    'medal_type' => $result->medal_type->value,
                ] : null,
            ];
        })->sortByDesc('competition.start_date')->values();
    }

    /** @return array<string, int> */
    public function medalCountsFor(Student $student): array
    {
        $history = $this->forStudent($student);

        $counts = ['gold' => 0, 'silver' => 0, 'bronze' => 0, 'participation' => 0];
        foreach ($history as $entry) {
            if ($entry['result']) {
                $counts[$entry['result']['medal_type']]++;
            }
        }

        return $counts;
    }
}
