<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\Professor;
use App\Models\School;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class ProfessorSeeder extends Seeder
{
    public function run(): void
    {
        $schools = School::all();
        if ($schools->isEmpty()) {
            $this->command?->warn('SchoolSeeder mora biti pokrenut prije ProfessorSeeder. Skipping.');

            return;
        }

        foreach ($schools as $school) {
            $code = strtolower($school->code);
            Professor::withoutGlobalScope('professor')->updateOrCreate(
                ['email' => "prof.{$code}.1@savez.test"],
                [
                    'name' => "Profesor 1 ({$school->code})",
                    'password' => Hash::make('password'),
                    'role' => UserRole::Professor,
                    'school_id' => $school->id,
                    'verified_at' => now(),
                    'email_verified_at' => now(),
                ]
            );

            Professor::withoutGlobalScope('professor')->updateOrCreate(
                ['email' => "prof.{$code}.2@savez.test"],
                [
                    'name' => "Profesor 2 ({$school->code})",
                    'password' => Hash::make('password'),
                    'role' => UserRole::Professor,
                    'school_id' => $school->id,
                    'verified_at' => null, // ovaj nije verified
                    'email_verified_at' => now(),
                ]
            );
        }
    }
}
