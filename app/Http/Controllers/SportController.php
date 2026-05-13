<?php

namespace App\Http\Controllers;

use App\Models\Sport;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class SportController extends Controller
{
    public function index(): Response
    {
        $sports = Cache::remember('sports.active', now()->addHour(), function () {
            return Sport::orderBy('name')->get();
        });

        return Inertia::render('sports/index', ['sports' => $sports]);
    }

    public function show(Sport $sport): Response
    {
        return Inertia::render('sports/show', ['sport' => $sport]);
    }
}
