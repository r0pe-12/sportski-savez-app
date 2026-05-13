<?php

namespace Database\Seeders;

use App\Enums\SportType;
use App\Models\Sport;
use Illuminate\Database\Seeder;

class SportSeeder extends Seeder
{
    public function run(): void
    {
        $sports = [
            ['slug' => 'fudbal', 'name' => 'Fudbal', 'type' => SportType::Team, 'members_count' => 11, 'substitutes_count' => 5],
            ['slug' => 'kosarka', 'name' => 'Košarka', 'type' => SportType::Team, 'members_count' => 5, 'substitutes_count' => 5],
            ['slug' => 'odbojka', 'name' => 'Odbojka', 'type' => SportType::Team, 'members_count' => 6, 'substitutes_count' => 6],
            ['slug' => 'rukomet', 'name' => 'Rukomet', 'type' => SportType::Team, 'members_count' => 7, 'substitutes_count' => 5],
            ['slug' => 'atletika', 'name' => 'Atletika', 'type' => SportType::Individual, 'members_count' => 1, 'substitutes_count' => 0],
            ['slug' => 'plivanje', 'name' => 'Plivanje', 'type' => SportType::Individual, 'members_count' => 1, 'substitutes_count' => 0],
            ['slug' => 'stoni-tenis', 'name' => 'Stoni tenis', 'type' => SportType::Individual, 'members_count' => 1, 'substitutes_count' => 0],
            ['slug' => 'sah', 'name' => 'Šah', 'type' => SportType::Individual, 'members_count' => 1, 'substitutes_count' => 0],
            ['slug' => 'karate', 'name' => 'Karate', 'type' => SportType::Individual, 'members_count' => 1, 'substitutes_count' => 0],
        ];

        foreach ($sports as $row) {
            Sport::updateOrCreate(['slug' => $row['slug']], $row);
        }
    }
}
