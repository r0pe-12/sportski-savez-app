<?php

namespace Database\Seeders;

use App\Enums\MedalType;
use App\Enums\TeamStatus;
use App\Models\Competition;
use App\Models\Result;
use App\Models\Team;
use Illuminate\Database\Seeder;

class ResultSeeder extends Seeder
{
    public function run(): void
    {
        $competitions = Competition::where('status', 'completed')->get();
        foreach ($competitions as $comp) {
            $teams = Team::where('competition_id', $comp->id)
                ->where('status', TeamStatus::Completed->value)
                ->take(3)
                ->get();

            foreach ($teams as $i => $team) {
                $placement = $i + 1;
                Result::firstOrCreate(
                    [
                        'competition_id' => $comp->id,
                        'subject_type' => Team::class,
                        'subject_id' => $team->id,
                    ],
                    [
                        'placement' => $placement,
                        'medal_type' => MedalType::fromPlacement($placement),
                    ]
                );
            }
        }
    }
}
