<?php

namespace App\Http\Controllers;

use App\Models\Competition;
use App\Models\MedicalCertificate;
use App\Models\Result;
use App\Models\School;
use App\Models\Sport;
use App\Models\Team;
use App\Models\TeamMember;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Fortify\Features;

class WelcomeController extends Controller
{
    public function index(): Response
    {
        $payload = Cache::remember('welcome.landing.v1', now()->addMinutes(5), function (): array {
            return [
                'sports' => Sport::query()
                    ->orderBy('name')
                    ->get(['id', 'slug', 'name', 'type'])
                    ->map(fn (Sport $sport): array => [
                        'id' => $sport->id,
                        'slug' => $sport->slug,
                        'name' => $sport->name,
                        'type' => $sport->type->value,
                    ])
                    ->all(),
                'upcoming_competitions' => Competition::query()
                    ->with('sport:id,name,type')
                    ->where('start_date', '>=', now()->startOfDay())
                    ->orderBy('start_date')
                    ->limit(3)
                    ->get(['id', 'slug', 'name', 'sport_id', 'start_date', 'location', 'status'])
                    ->map(fn (Competition $competition): array => [
                        'id' => $competition->id,
                        'slug' => $competition->slug,
                        'name' => $competition->name,
                        'start_date' => $competition->start_date?->toIso8601String(),
                        'location' => $competition->location,
                        'status' => $competition->status->value,
                        'sport' => $competition->sport ? [
                            'id' => $competition->sport->id,
                            'name' => $competition->sport->name,
                            'type' => $competition->sport->type->value,
                        ] : null,
                    ])
                    ->all(),
                'stats' => [
                    'schools' => School::query()->count(),
                    'team_members' => TeamMember::query()->count(),
                    'teams' => Team::query()->count(),
                    'competitions' => Competition::query()->count(),
                    'results' => Result::query()->count(),
                    'certificates' => MedicalCertificate::query()->count(),
                ],
            ];
        });

        return Inertia::render('welcome', [
            'canRegister' => Features::enabled(Features::registration()),
            ...$payload,
        ]);
    }
}
