<?php

namespace Database\Seeders;

use App\Models\School;
use Illuminate\Database\Seeder;

class SchoolSeeder extends Seeder
{
    public function run(): void
    {
        $schools = [
            ['code' => 'OS-PG-001', 'name' => 'OŠ "Sutjeska"', 'city' => 'Podgorica'],
            ['code' => 'OS-PG-002', 'name' => 'OŠ "Štampar Makarije"', 'city' => 'Podgorica'],
            ['code' => 'OS-BD-001', 'name' => 'OŠ "Maksim Gorki"', 'city' => 'Bijelo Polje'],
            ['code' => 'OS-HN-001', 'name' => 'OŠ "Vladimir Nazor"', 'city' => 'Herceg Novi'],
            ['code' => 'OS-BB-001', 'name' => 'OŠ "Anto Đedović"', 'city' => 'Berane'],
            ['code' => 'OS-NK-001', 'name' => 'OŠ "Mileva Lajović Lalatović"', 'city' => 'Nikšić'],
            ['code' => 'OS-CT-001', 'name' => 'OŠ "Lovćenski partizanski odred"', 'city' => 'Cetinje'],
        ];

        foreach ($schools as $row) {
            School::updateOrCreate(['code' => $row['code']], $row);
        }
    }
}
