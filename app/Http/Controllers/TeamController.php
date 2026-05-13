<?php

namespace App\Http\Controllers;

use App\Enums\TeamStatus;
use App\Http\Requests\StoreTeamRequest;
use App\Http\Requests\SubmitTeamRequest;
use App\Http\Requests\UpdateTeamRequest;
use App\Models\Competition;
use App\Models\Student;
use App\Models\Team;
use App\Models\User;
use App\Services\AuditLogger;
use App\Services\Exceptions\TeamSubmissionException;
use App\Services\TeamRegistrationService;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class TeamController extends Controller
{
    use AuthorizesRequests;

    public function __construct(private AuditLogger $audit) {}

    public function index(): Response
    {
        $teams = $this->currentUser()->isAdmin()
            ? Team::with('competition.sport', 'school', 'professor')->orderByDesc('created_at')->paginate(25)
            : Team::with('competition.sport', 'school')
                ->where('professor_id', $this->currentUser()->id)
                ->orderByDesc('created_at')
                ->paginate(25);

        return Inertia::render('teams/index', ['teams' => $teams]);
    }

    public function create(): Response
    {
        $this->authorize('create', Team::class);

        return Inertia::render('teams/create', [
            'competitions' => Competition::with('sport')
                ->whereIn('status', ['open_registration'])
                ->orderBy('start_date')
                ->get(),
        ]);
    }

    public function store(StoreTeamRequest $request): RedirectResponse
    {
        $team = Team::create([
            'school_id' => $request->user()->school_id,
            'competition_id' => $request->validated('competition_id'),
            'professor_id' => $request->user()->id,
            'status' => TeamStatus::Draft,
        ]);

        $this->audit->log('team.created', $team, ['competition_id' => $team->competition_id]);

        return redirect()->route('teams.edit', $team);
    }

    public function edit(Team $team): Response
    {
        $this->authorize('view', $team);

        return Inertia::render('teams/edit', [
            'team' => $team->load('competition.sport', 'school', 'members.student', 'members.medicalCertificate'),
            'availableStudents' => $this->availableStudentsFor($team),
        ]);
    }

    public function update(UpdateTeamRequest $request, Team $team): RedirectResponse
    {
        // Placeholder za autosave — u draft state-u sve mutacije idu kroz TeamMemberController
        return back();
    }

    public function destroy(Team $team): RedirectResponse
    {
        $this->authorize('cancel', $team);

        $team->update(['status' => TeamStatus::Cancelled]);
        $this->audit->log('team.cancelled', $team);

        return redirect()->route('teams.index');
    }

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

        return redirect()->route('teams.index')
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

        return redirect()->route('teams.index')
            ->with('flash', $newStatus === TeamStatus::Withdrawn ? 'Prijava povučena.' : 'Prijava otkazana.');
    }

    /** @return Collection<int, Student> */
    private function availableStudentsFor(Team $team): Collection
    {
        return Student::query()
            ->where('school_id', $team->school_id)
            ->whereNotIn('id', $team->members()->pluck('student_id'))
            ->whereDoesntHave('teamMemberships.team', function ($q) use ($team) {
                $q->where('competition_id', $team->competition_id)
                    ->whereIn('status', [
                        TeamStatus::Draft->value,
                        TeamStatus::Submitted->value,
                        TeamStatus::Active->value,
                    ]);
            })
            ->orderBy('name')
            ->get(['id', 'name', 'grade', 'verification_status']);
    }

    private function currentUser(): User
    {
        /** @var User $user */
        $user = auth()->user();

        return $user;
    }
}
