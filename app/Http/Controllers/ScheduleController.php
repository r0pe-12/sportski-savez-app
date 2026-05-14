<?php

namespace App\Http\Controllers;

use App\Models\Competition;
use App\Models\Sport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class ScheduleController extends Controller
{
    public function index(Request $request): Response
    {
        $sportId = $request->integer('sport_id');
        $status = $request->string('status')->toString();

        $key = 'schedule.public.'.md5(serialize([$sportId, $status]));

        // VAŽNO: cache ne smije čuvati Eloquent Collection objekat (serialize/deserialize
        // problem sa __PHP_Incomplete_Class kad se klase ne učitaju u određenim
        // request-ima). Konvertuj u plain array prije caching-a.
        $competitions = Cache::remember($key, now()->addMinutes(5), function () use ($sportId, $status) {
            $q = Competition::with('sport')
                ->withCount('teams')
                ->orderBy('start_date');

            if ($sportId) {
                $q->where('sport_id', $sportId);
            }
            if ($status) {
                $q->where('status', $status);
            }

            return $q->get()->map(fn (Competition $c): array => [
                'id' => $c->id,
                'slug' => $c->slug,
                'name' => $c->name,
                'start_date' => $c->start_date?->toIso8601String(),
                'end_date' => $c->end_date?->toIso8601String(),
                'location' => $c->location,
                'status' => $c->status->value,
                'year' => $c->year,
                'teams_count' => $c->teams_count,
                'sport' => $c->sport ? [
                    'id' => $c->sport->id,
                    'name' => $c->sport->name,
                    'type' => $c->sport->type->value,
                ] : null,
            ])->all();
        });

        return Inertia::render('schedule/index', [
            'competitions' => $competitions,
            'sports' => Sport::orderBy('name')->get(['id', 'name', 'type']),
            'filters' => [
                'sport_id' => $sportId,
                'status' => $status,
            ],
        ]);
    }
}
