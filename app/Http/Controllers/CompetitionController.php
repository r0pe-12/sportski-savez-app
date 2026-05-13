<?php

namespace App\Http\Controllers;

use App\Models\Competition;
use Inertia\Inertia;
use Inertia\Response;

class CompetitionController extends Controller
{
    public function show(Competition $competition): Response
    {
        return Inertia::render('competitions/show', [
            'competition' => $competition->load('sport', 'teams.school'),
        ]);
    }
}
