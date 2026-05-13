<?php

use App\Models\AiDnevnikSesija;
use Database\Seeders\AiDnevnikSeeder;

use function Pest\Laravel\get;
use function Pest\Laravel\seed;

uses(Illuminate\Foundation\Testing\RefreshDatabase::class);

it('javna /ai-dnevnik ruta odgovara 200 bez auth-a', function () {
    seed(AiDnevnikSeeder::class);

    get('/ai-dnevnik')->assertOk();
});

it('seeder upisuje sve postojeće sesije iz seeder fajla', function () {
    seed(AiDnevnikSeeder::class);

    // Broj raste kako se sesije dodaju — provjeravamo da je seeder
    // upisao bar inicijalnih 15 sesija (sesija 13 ostaje gap).
    expect(AiDnevnikSesija::count())->toBeGreaterThanOrEqual(15);
});

it('sesije se grupišu po fazi i prosleđuju u Inertia komponentu', function () {
    seed(AiDnevnikSeeder::class);

    $expectedFaze = AiDnevnikSesija::query()
        ->selectRaw('faza, count(*) as c')
        ->groupBy('faza')
        ->pluck('c', 'faza');

    $assertion = fn ($page) => $expectedFaze->reduce(
        fn ($p, $count, $faza) => $p->where("fazeSaSesijama.{$faza}", fn ($s) => count($s) === (int) $count),
        $page->component('ai-dnevnik')->has('fazeSaSesijama')
    );

    get('/ai-dnevnik')->assertInertia($assertion);
});

it('seeder je idempotentan (drugi run ne duplira sesije)', function () {
    seed(AiDnevnikSeeder::class);
    $countAfterFirst = AiDnevnikSesija::count();

    seed(AiDnevnikSeeder::class);

    expect(AiDnevnikSesija::count())->toBe($countAfterFirst);
});