<?php

namespace Database\Factories;

use App\Enums\SportType;
use App\Models\Sport;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/** @extends Factory<Sport> */
class SportFactory extends Factory
{
    public function definition(): array
    {
        $name = fake()->randomElement(['Fudbal', 'Košarka', 'Odbojka', 'Rukomet', 'Atletika', 'Plivanje']);

        return [
            'slug' => Str::slug($name).'-'.fake()->unique()->numberBetween(1, 9999),
            'name' => $name,
            'type' => SportType::Team,
            'members_count' => 5,
            'substitutes_count' => 3,
            'rules_description' => null,
        ];
    }

    public function team(int $members = 5, int $subs = 3): static
    {
        return $this->state(fn () => ['type' => SportType::Team, 'members_count' => $members, 'substitutes_count' => $subs]);
    }

    public function individual(): static
    {
        return $this->state(fn () => ['type' => SportType::Individual, 'members_count' => 1, 'substitutes_count' => 0]);
    }
}
