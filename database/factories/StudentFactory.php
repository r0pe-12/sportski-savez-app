<?php

namespace Database\Factories;

use App\Enums\StudentVerificationStatus;
use App\Enums\UserRole;
use App\Models\School;
use App\Models\Student;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/** @extends Factory<Student> */
class StudentFactory extends Factory
{
    protected $model = Student::class;

    public function definition(): array
    {
        $birth = fake()->dateTimeBetween('-15 years', '-7 years');

        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => Hash::make('password'),
            'remember_token' => Str::random(10),
            'role' => UserRole::Student,
            'school_id' => School::factory(),
            'jmb' => self::generateJmb($birth),
            'grade' => fake()->randomElement(['5-1', '5-2', '6-1', '7-1', '8-1', '8-2', '9-1']),
            'birth_date' => $birth,
            'verification_status' => StudentVerificationStatus::Unverified,
            'parental_consent' => true,
            'parental_consent_at' => now(),
        ];
    }

    public function forSchool(School $school): static
    {
        return $this->state(fn () => ['school_id' => $school->id]);
    }

    public function verified(): static
    {
        return $this->state(fn () => ['verification_status' => StudentVerificationStatus::Verified]);
    }

    public function mismatched(): static
    {
        return $this->state(fn () => ['verification_status' => StudentVerificationStatus::Mismatched]);
    }

    /**
     * Generiše 13-cifren JMB. NIJE algoritmu validna kontrolna cifra — samo regex format match.
     * Algoritamska validacija je TODO za pilot (vidjeti spec sekcija 16).
     */
    private static function generateJmb(\DateTimeInterface $birth): string
    {
        $dd = $birth->format('d');
        $mm = $birth->format('m');
        $yyy = substr($birth->format('Y'), 1);
        $rb = (string) fake()->numberBetween(0, 99999);
        $rb = str_pad($rb, 5, '0', STR_PAD_LEFT);
        $k = (string) fake()->numberBetween(0, 9);

        return $dd.$mm.$yyy.$rb.$k; // 2+2+3+5+1 = 13
    }
}
