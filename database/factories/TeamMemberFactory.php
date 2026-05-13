<?php

namespace Database\Factories;

use App\Models\Student;
use App\Models\Team;
use App\Models\TeamMember;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<TeamMember> */
class TeamMemberFactory extends Factory
{
    public function definition(): array
    {
        return [
            'team_id' => Team::factory(),
            'student_id' => Student::factory(),
            'position' => null,
        ];
    }

    public function captain(): static
    {
        return $this->state(fn () => ['position' => 'kapiten']);
    }
}
