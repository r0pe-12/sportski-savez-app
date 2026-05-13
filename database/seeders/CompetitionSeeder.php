<?php

namespace Database\Seeders;

use App\Enums\CompetitionStatus;
use App\Models\Competition;
use App\Models\Sport;
use Illuminate\Database\Seeder;

class CompetitionSeeder extends Seeder
{
    public function run(): void
    {
        $kosarka = Sport::where('slug', 'kosarka')->first();
        $fudbal = Sport::where('slug', 'fudbal')->first();
        $atletika = Sport::where('slug', 'atletika')->first();

        if (! $kosarka || ! $fudbal || ! $atletika) {
            $this->command?->warn('SportSeeder mora biti pokrenut prije CompetitionSeeder. Skipping.');

            return;
        }

        $rows = [
            ['slug' => 'dp-os-kosarka-2026', 'name' => 'DP OŠ Košarka 2026', 'sport_id' => $kosarka->id, 'start_date' => now()->addMonths(1), 'end_date' => now()->addMonths(1)->addDays(3), 'location' => 'Podgorica', 'status' => CompetitionStatus::Open, 'year' => 2026],
            ['slug' => 'dp-os-fudbal-2026', 'name' => 'DP OŠ Fudbal 2026', 'sport_id' => $fudbal->id, 'start_date' => now()->addMonths(2), 'end_date' => now()->addMonths(2)->addDays(5), 'location' => 'Bijelo Polje', 'status' => CompetitionStatus::Open, 'year' => 2026],
            ['slug' => 'dp-os-atletika-2025', 'name' => 'DP OŠ Atletika 2025', 'sport_id' => $atletika->id, 'start_date' => now()->subMonths(3), 'end_date' => now()->subMonths(3)->addDays(2), 'location' => 'Herceg Novi', 'status' => CompetitionStatus::Completed, 'year' => 2025],
        ];

        foreach ($rows as $row) {
            Competition::updateOrCreate(['slug' => $row['slug']], $row);
        }
    }
}
