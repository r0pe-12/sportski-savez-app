<?php

namespace Database\Factories;

use App\Enums\CompetitionStatus;
use App\Models\Competition;
use App\Models\Sport;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/** @extends Factory<Competition> */
class CompetitionFactory extends Factory
{
    public function definition(): array
    {
        $year = (int) date('Y');
        $name = 'Državno prvenstvo OŠ '.$year;

        return [
            'slug' => Str::slug($name).'-'.fake()->unique()->numberBetween(1, 9999),
            'name' => $name,
            'sport_id' => Sport::factory(),
            'start_date' => fake()->dateTimeBetween('+1 month', '+3 months'),
            'end_date' => fake()->dateTimeBetween('+3 months', '+4 months'),
            'location' => fake()->randomElement(['Podgorica', 'Bijelo Polje', 'Herceg Novi']),
            'status' => CompetitionStatus::Open,
            'year' => $year,
        ];
    }

    public function past(): static
    {
        return $this->state(fn () => [
            'start_date' => now()->subMonths(2),
            'end_date' => now()->subMonths(1),
            'status' => CompetitionStatus::Completed,
        ]);
    }

    public function upcoming(): static
    {
        return $this->state(fn () => [
            'start_date' => now()->addMonths(2),
            'end_date' => now()->addMonths(3),
            'status' => CompetitionStatus::Open,
        ]);
    }
}
