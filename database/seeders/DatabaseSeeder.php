<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(AdminUserSeeder::class);
        $this->call(AiDnevnikSeeder::class);
        $this->call(CompetitionSeeder::class);
        $this->call(ProfessorSeeder::class);
        $this->call(ResultSeeder::class);
        $this->call(SchoolSeeder::class);
        $this->call(SportSeeder::class);
        $this->call(StudentSeeder::class);
        $this->call(TeamSeeder::class);
    }
}
