<?php

namespace Database\Factories;

use App\Enums\MedalType;
use App\Models\Competition;
use App\Models\Result;
use App\Models\Team;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Result> */
class ResultFactory extends Factory
{
    public function definition(): array
    {
        return [
            'competition_id' => Competition::factory(),
            'subject_type' => Team::class,
            'subject_id' => Team::factory(),
            'placement' => 1,
            'medal_type' => MedalType::Gold,
        ];
    }

    public function gold(): static
    {
        return $this->state(fn () => ['placement' => 1, 'medal_type' => MedalType::Gold]);
    }

    public function silver(): static
    {
        return $this->state(fn () => ['placement' => 2, 'medal_type' => MedalType::Silver]);
    }

    public function forTeam(Team $team): static
    {
        return $this->state(fn () => [
            'subject_type' => Team::class,
            'subject_id' => $team->id,
            'competition_id' => $team->competition_id,
        ]);
    }
}
