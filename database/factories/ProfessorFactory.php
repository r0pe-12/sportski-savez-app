<?php

namespace Database\Factories;

use App\Enums\UserRole;
use App\Models\Professor;
use App\Models\School;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/** @extends Factory<Professor> */
class ProfessorFactory extends Factory
{
    protected $model = Professor::class;

    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => Hash::make('password'),
            'remember_token' => Str::random(10),
            'role' => UserRole::Professor,
            'school_id' => School::factory(),
            'phone' => '+382 '.fake()->numerify('## ### ###'),
            'verified_at' => now(),
        ];
    }

    public function unverifiedProfessor(): static
    {
        return $this->state(fn () => ['verified_at' => null]);
    }

    public function forSchool(School $school): static
    {
        return $this->state(fn () => ['school_id' => $school->id]);
    }
}
