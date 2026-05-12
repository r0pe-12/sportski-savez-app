<?php

namespace App\Http\Controllers;

use App\Models\AiDnevnikSesija;
use Inertia\Inertia;
use Inertia\Response;

class AiDnevnikController extends Controller
{
    public function show(): Response
    {
        $fazeSaSesijama = AiDnevnikSesija::orderedByBroj()
            ->get()
            ->groupBy('faza');

        return Inertia::render('ai-dnevnik', [
            'fazeSaSesijama' => $fazeSaSesijama,
        ]);
    }
}
