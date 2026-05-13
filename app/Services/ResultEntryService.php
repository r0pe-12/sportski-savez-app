<?php

namespace App\Services;

use App\Enums\MedalType;
use App\Enums\TeamStatus;
use App\Models\Result;
use App\Models\Team;
use App\Models\TeamMember;
use App\Notifications\ResultEnteredNotification;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;

class ResultEntryService
{
    public function __construct(private AuditLogger $audit) {}

    public function recordTeamResult(Team $team, int $placement, MedalType $medal): Result
    {
        return DB::transaction(function () use ($team, $placement, $medal) {
            $result = Result::updateOrCreate(
                [
                    'competition_id' => $team->competition_id,
                    'subject_type' => Team::class,
                    'subject_id' => $team->id,
                ],
                ['placement' => $placement, 'medal_type' => $medal]
            );

            if ($team->status === TeamStatus::Active) {
                $team->update(['status' => TeamStatus::Completed]);
            }

            $this->audit->log('result.entered', $result, [
                'placement' => $placement,
                'medal' => $medal->value,
                'team_id' => $team->id,
            ]);

            $this->notifyTeam($team, $result);

            return $result;
        });
    }

    public function recordIndividualResult(TeamMember $member, int $placement, MedalType $medal): Result
    {
        return DB::transaction(function () use ($member, $placement, $medal) {
            $result = Result::updateOrCreate(
                [
                    'competition_id' => $member->team->competition_id,
                    'subject_type' => TeamMember::class,
                    'subject_id' => $member->id,
                ],
                ['placement' => $placement, 'medal_type' => $medal]
            );

            $this->maybeCompleteTeam($member->team);

            $this->audit->log('result.entered', $result, [
                'placement' => $placement,
                'medal' => $medal->value,
                'team_member_id' => $member->id,
            ]);

            $this->notifyMember($member, $result);

            return $result;
        });
    }

    private function maybeCompleteTeam(Team $team): void
    {
        $totalMembers = $team->members()->count();
        $withResults = $team->members()
            ->whereHas('results', fn ($q) => $q->where('competition_id', $team->competition_id))
            ->count();

        if ($totalMembers > 0 && $totalMembers === $withResults && $team->status === TeamStatus::Active) {
            $team->update(['status' => TeamStatus::Completed]);
        }
    }

    private function notifyTeam(Team $team, Result $result): void
    {
        $recipients = collect([$team->professor])
            ->merge($team->members()->with('student')->get()->map(fn ($m) => $m->student))
            ->filter();

        Notification::send($recipients, new ResultEnteredNotification($result));
    }

    private function notifyMember(TeamMember $member, Result $result): void
    {
        Notification::send(
            collect([$member->team->professor, $member->student])->filter(),
            new ResultEnteredNotification($result)
        );
    }
}
