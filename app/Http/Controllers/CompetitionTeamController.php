<?php

namespace App\Http\Controllers;

use App\Enums\CompetitionStatus;
use App\Enums\TeamStatus;
use App\Models\Competition;
use App\Models\Team;
use App\Services\AuditLogger;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class CompetitionTeamController extends Controller
{
    use AuthorizesRequests;

    public function __construct(private AuditLogger $audit) {}

    /**
     * Direktna prijava ekipe sa stranice takmičenja.
     * UC5 streamline — sport i takmičenje su već poznati iz konteksta.
     */
    public function store(Request $request, Competition $competition): RedirectResponse
    {
        $this->authorize('create', Team::class);

        $user = $request->user();

        if ($competition->status !== CompetitionStatus::Open) {
            throw ValidationException::withMessages([
                'competition' => 'Registracija za ovo takmičenje nije otvorena.',
            ]);
        }

        if ($user->school_id === null) {
            throw ValidationException::withMessages([
                'competition' => 'Vaš nalog nije povezan sa školom.',
            ]);
        }

        $existing = Team::where('competition_id', $competition->id)
            ->where('school_id', $user->school_id)
            ->first();

        if ($existing !== null) {
            return redirect()->route(
                $existing->status === TeamStatus::Draft ? 'teams.edit' : 'teams.review',
                $existing
            );
        }

        $team = Team::create([
            'school_id' => $user->school_id,
            'competition_id' => $competition->id,
            'professor_id' => $user->id,
            'status' => TeamStatus::Draft,
        ]);

        $this->audit->log('team.created', $team, [
            'competition_id' => $team->competition_id,
            'source' => 'competition_page',
        ]);

        return redirect()->route('teams.edit', $team)
            ->with('flash', 'Draft ekipa kreirana. Dodajte članove.');
    }
}
