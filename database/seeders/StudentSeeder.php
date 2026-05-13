<?php

namespace Database\Seeders;

use App\Enums\StudentVerificationStatus;
use App\Enums\UserRole;
use App\Models\School;
use App\Models\Student;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class StudentSeeder extends Seeder
{
    public function run(): void
    {
        $schools = School::all();
        if ($schools->isEmpty()) {
            $this->command?->warn('SchoolSeeder mora biti pokrenut prije StudentSeeder. Skipping.');

            return;
        }

        $i = 1;
        foreach ($schools as $school) {
            for ($n = 1; $n <= 10; $n++) {
                $jmb = str_pad((string) $i, 13, '0', STR_PAD_LEFT);
                $i++;

                Student::withoutGlobalScope('student')->updateOrCreate(
                    ['jmb' => $jmb],
                    [
                        'name' => "Učenik {$n} ({$school->code})",
                        'email' => "student.{$jmb}@savez.test",
                        'password' => Hash::make('password'),
                        'role' => UserRole::Student,
                        'school_id' => $school->id,
                        'grade' => fake()->randomElement(['7-1', '8-1', '8-2', '9-1']),
                        'birth_date' => fake()->dateTimeBetween('-14 years', '-10 years'),
                        'verification_status' => $n <= 5 ? StudentVerificationStatus::Verified : StudentVerificationStatus::Unverified,
                        'parental_consent' => true,
                        'parental_consent_at' => now(),
                        'email_verified_at' => now(),
                    ]
                );
            }
        }
    }
}
