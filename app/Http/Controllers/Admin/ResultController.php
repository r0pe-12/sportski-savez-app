<?php

namespace App\Http\Controllers\Admin;

use App\Enums\MedalType;
use App\Enums\SportType;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\BulkResultsRequest;
use App\Models\Competition;
use App\Models\Result;
use App\Models\Team;
use App\Models\TeamMember;
use App\Services\ResultEntryService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ResultController extends Controller
{
    use AuthorizesRequests;

    public function __construct(private ResultEntryService $service) {}

    public function index(Competition $competition): Response
    {
        $this->authorize('viewAny', Result::class);

        $isTeam = $competition->sport->type === SportType::Team;

        $subjects = $isTeam
            ? $competition->teams()
                ->with('school')
                ->whereIn('status', ['active', 'completed'])
                ->get()
            : TeamMember::whereHas('team', fn ($q) => $q->where('competition_id', $competition->id))
                ->with(['student', 'team.school'])
                ->get();

        $existing = Result::where('competition_id', $competition->id)
            ->get()
            ->keyBy(fn ($r) => $r->subject_type.':'.$r->subject_id);

        return Inertia::render('admin/results/enter', [
            'competition' => $competition->load('sport'),
            'subjects' => $subjects,
            'existing' => $existing,
            'subjectType' => $isTeam ? 'Team' : 'TeamMember',
        ]);
    }

    public function store(BulkResultsRequest $request, Competition $competition): RedirectResponse
    {
        foreach ($request->validated('results') as $row) {
            $medal = MedalType::from($row['medal_type']);

            if ($row['subject_type'] === 'Team') {
                $team = Team::find($row['subject_id']);
                if ($team && $team->competition_id === $competition->id) {
                    $this->service->recordTeamResult($team, $row['placement'], $medal);
                }
            } else {
                $member = TeamMember::find($row['subject_id']);
                if ($member && $member->team->competition_id === $competition->id) {
                    $this->service->recordIndividualResult($member, $row['placement'], $medal);
                }
            }
        }

        return back()->with('flash', 'Rezultati zabilježeni.');
    }
}
