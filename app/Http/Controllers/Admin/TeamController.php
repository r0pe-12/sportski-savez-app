<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\RejectTeamRequest;
use App\Models\Team;
use App\Services\Exceptions\TeamSubmissionException;
use App\Services\TeamRegistrationService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class TeamController extends Controller
{
    public function __construct(private TeamRegistrationService $service) {}

    public function index(): Response
    {
        $teams = Team::with(['competition.sport', 'school', 'professor'])
            ->orderByDesc('created_at')
            ->paginate(25);

        return Inertia::render('admin/teams/index', [
            'teams' => $teams,
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
