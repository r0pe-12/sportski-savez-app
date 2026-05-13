<?php

namespace Database\Seeders;

use App\Enums\TeamStatus;
use App\Models\Competition;
use App\Models\Professor;
use App\Models\School;
use App\Models\Student;
use App\Models\Team;
use App\Models\TeamMember;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class TeamSeeder extends Seeder
{
    public function run(): void
    {
        $competitions = Competition::all();
        if ($competitions->isEmpty()) {
            $this->command?->warn('CompetitionSeeder mora biti pokrenut prije TeamSeeder. Skipping.');

            return;
        }

        foreach ($competitions as $comp) {
            $schools = School::take(3)->get();
            foreach ($schools as $school) {
                $professor = Professor::withoutGlobalScope('professor')
                    ->where('school_id', $school->id)
                    ->where('verified_at', '!=', null)
                    ->first();

                if (! $professor) {
                    continue;
                }

                $uuidSeed = "demo-{$comp->id}-{$school->id}";
                $team = Team::firstOrCreate(
                    ['team_uuid' => Str::uuid5(Str::uuid4()->toString(), $uuidSeed)],
                    [
                        'school_id' => $school->id,
                        'competition_id' => $comp->id,
                        'professor_id' => $professor->id,
                        'status' => $comp->status->value === 'completed' ? TeamStatus::Completed : TeamStatus::Draft,
                    ]
                );

                if ($team->members()->count() === 0) {
                    $students = Student::withoutGlobalScope('student')
                        ->where('school_id', $school->id)
                        ->take($comp->sport->members_count)
                        ->get();

                    foreach ($students as $student) {
                        TeamMember::firstOrCreate([
                            'team_id' => $team->id,
                            'student_id' => $student->id,
                        ]);
                    }
                }
            }
        }
    }
}
