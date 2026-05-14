<?php

namespace App\Http\Controllers;

use App\Enums\CompetitionStatus;
use App\Models\Competition;
use App\Models\Team;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CompetitionController extends Controller
{
    public function show(Request $request, Competition $competition): Response
    {
        $competition->load('sport', 'teams.school');

        $user = $request->user();

        $professorTeam = null;
        $canRegisterTeam = false;
        $registerDisabledReason = null;

        if ($user !== null && $user->isProfessor()) {
            $professorTeam = Team::where('competition_id', $competition->id)
                ->where('professor_id', $user->id)
                ->select('id', 'status')
                ->first();

            if ($professorTeam === null) {
                if ($user->verified_at === null) {
                    $registerDisabledReason = 'Vaš nalog još nije verifikovan od strane administratora.';
                } elseif ($user->school_id === null) {
                    $registerDisabledReason = 'Vaš nalog nije povezan sa školom.';
                } elseif ($competition->status !== CompetitionStatus::Open) {
                    $registerDisabledReason = 'Registracija za ovo takmičenje nije otvorena.';
                } elseif (Team::where('competition_id', $competition->id)
                    ->where('school_id', $user->school_id)
                    ->exists()
                ) {
                    $registerDisabledReason = 'Vaša škola već ima prijavljenu ekipu na ovom takmičenju.';
                } else {
                    $canRegisterTeam = true;
                }
            }
        }

        return Inertia::render('competitions/show', [
            'competition' => $competition,
            'professorTeam' => $professorTeam,
            'canRegisterTeam' => $canRegisterTeam,
            'registerDisabledReason' => $registerDisabledReason,
        ]);
    }
}
