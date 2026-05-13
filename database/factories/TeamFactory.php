<?php

namespace Database\Factories;

use App\Enums\TeamStatus;
use App\Models\Competition;
use App\Models\Professor;
use App\Models\School;
use App\Models\Team;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/** @extends Factory<Team> */
class TeamFactory extends Factory
{
    public function definition(): array
    {
        return [
            'team_uuid' => (string) Str::uuid(),
            'school_id' => School::factory(),
            'competition_id' => Competition::factory(),
            'professor_id' => Professor::factory(),
            'status' => TeamStatus::Draft,
        ];
    }

    public function draft(): static
    {
        return $this->state(fn () => ['status' => TeamStatus::Draft]);
    }

    public function submitted(): static
    {
        return $this->state(fn () => [
            'status' => TeamStatus::Submitted,
            'signature' => 'Petar Petrović',
            'signed_at' => now(),
            'signature_ip' => '127.0.0.1',
        ]);
    }

    public function active(): static
    {
        return $this->state(fn () => ['status' => TeamStatus::Active]);
    }
}
