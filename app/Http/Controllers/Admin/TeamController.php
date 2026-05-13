<?php

namespace App\Http\Controllers\Admin;

use App\Enums\TeamStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\RejectTeamRequest;
use App\Models\Competition;
use App\Models\School;
use App\Models\Team;
use App\Services\Exceptions\TeamSubmissionException;
use App\Services\TeamRegistrationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TeamController extends Controller
{
    public function __construct(private TeamRegistrationService $service) {}

    public function index(Request $request): Response
    {
        $status = $request->string('status')->toString() ?: null;
        $competitionId = $request->integer('competition_id') ?: null;
        $schoolId = $request->integer('school_id') ?: null;

        $query = Team::with(['competition.sport', 'school', 'professor'])
            ->orderByDesc('created_at');

        if ($status !== null && TeamStatus::tryFrom($status) !== null) {
            $query->where('status', $status);
        }

        if ($competitionId !== null) {
            $query->where('competition_id', $competitionId);
        }

        if ($schoolId !== null) {
            $query->where('school_id', $schoolId);
        }

        $teams = $query->paginate(25)->withQueryString();

        return Inertia::render('admin/teams/index', [
            'teams' => $teams,
            'competitions' => Competition::orderBy('name')->get(['id', 'name']),
            'schools' => School::orderBy('name')->get(['id', 'name']),
            'filters' => [
                'status' => $status,
                'competition_id' => $competitionId,
                'school_id' => $schoolId,
            ],
        ]);
    }

    public function show(Team $team): Response
    {
        $team->load([
            'competition.sport',
            'school',
            'professor',
            'members.student',
            'members.medicalCertificate',
        ]);

        return Inertia::render('admin/teams/show', [
            'team' => $team,
        ]);
    }

    public function approve(Team $team): RedirectResponse
    {
        try {
            $this->service->approve($team);
        } catch (TeamSubmissionException $e) {
            return back()->withErrors(['general' => $e->getMessage()]);
        }

        return back()->with('flash', 'Ekipa odobrena.');
    }

    public function reject(RejectTeamRequest $request, Team $team): RedirectResponse
    {
        try {
            $this->service->reject($team, $request->validated('reason'));
        } catch (TeamSubmissionException $e) {
            return back()->withErrors(['general' => $e->getMessage()]);
        }

        return back()->with('flash', 'Ekipa odbijena.');
    }
}
