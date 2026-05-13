<?php

use App\Models\AiDnevnikSesija;
use App\Models\Competition;
use App\Models\School;
use App\Models\Sport;
use App\Models\Student;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;

it('full seeder run is idempotent and creates expected counts', function () {
    $this->seed(DatabaseSeeder::class);
    $this->seed(DatabaseSeeder::class); // re-run da provjeri idempotenciju

    expect(School::count())->toBeGreaterThanOrEqual(5);
    expect(Sport::count())->toBeGreaterThanOrEqual(8);
    expect(Competition::count())->toBeGreaterThanOrEqual(1);
    expect(Student::count())->toBeGreaterThanOrEqual(30);
    expect(User::where('role', 'admin')->count())->toBe(1);
});

it('AiDnevnikSesija is not affected by re-seeding (idempotent)', function () {
    $this->seed(DatabaseSeeder::class);
    $afterFirstSeed = AiDnevnikSesija::count();
    $this->seed(DatabaseSeeder::class);
    expect(AiDnevnikSesija::count())->toBe($afterFirstSeed);
});
