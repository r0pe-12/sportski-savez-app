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

            return $q->get();
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
