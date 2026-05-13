<?php

namespace Database\Factories;

use App\Models\School;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<School> */
class SchoolFactory extends Factory
{
    public function definition(): array
    {
        $city = fake()->randomElement(['PG', 'BD', 'HN', 'BB', 'NK', 'CT']);
        $serial = str_pad((string) fake()->numberBetween(1, 999), 3, '0', STR_PAD_LEFT);

        return [
            'code' => "OS-{$city}-{$serial}",
            'name' => 'OŠ "'.fake()->randomElement(['Sutjeska', 'Maksim Gorki', 'Vladimir Nazor', 'Štampar Makarije', 'Anto Đedović']).'"',
            'city' => fake()->randomElement(['Podgorica', 'Bijelo Polje', 'Herceg Novi', 'Berane', 'Nikšić', 'Cetinje']),
            'address' => fake()->streetAddress(),
            'phone' => '+382 '.fake()->numerify('## ### ###'),
            'email' => fake()->safeEmail(),
        ];
    }
}
