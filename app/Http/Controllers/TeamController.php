<?php

namespace App\Http\Controllers;

use App\Enums\TeamStatus;
use App\Http\Requests\SubmitTeamRequest;
use App\Models\Team;
use App\Services\AuditLogger;
use App\Services\Exceptions\TeamSubmissionException;
use App\Services\TeamRegistrationService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

/**
 * T2.1c slice: review + submit + cancel (UC5 backend).
 * Note: full CRUD (index/create/store/edit/update/destroy) is owned by T2.1a
 * and will be added during merge.
 */
class TeamController extends Controller
{
    use AuthorizesRequests;

    public function __construct(private AuditLogger $audit) {}

    public function review(Team $team): Response
    {
        $this->authorize('view', $team);

        $team->load([
            'competition.sport',
            'school',
            'members.student',
            'members.medicalCertificate',
        ]);

        return Inertia::render('teams/review', [
            'team' => $team,
        ]);
    }

    public function submit(
        SubmitTeamRequest $request,
        Team $team,
        TeamRegistrationService $service,
    ): RedirectResponse {
        try {
            $service->submit($team, $request->validated('signature'), (string) $request->ip());
        } catch (TeamSubmissionException $e) {
            return back()->withErrors(['signature' => $e->getMessage()]);
        }

        return redirect('/teams')
            ->with('flash', 'Ekipa je predata.');
    }

    /**
     * Profesor povlači draft (cancelled) ili submitted (withdrawn) prijavu.
     */
    public function cancel(Team $team): RedirectResponse
    {
        $this->authorize('cancel', $team);

        $newStatus = $team->status === TeamStatus::Submitted
            ? TeamStatus::Withdrawn
            : TeamStatus::Cancelled;

        $team->update(['status' => $newStatus]);

        $this->audit->log("team.{$newStatus->value}", $team);

        return redirect('/teams')
            ->with('flash', $newStatus === TeamStatus::Withdrawn ? 'Prijava povučena.' : 'Prijava otkazana.');
    }
}
