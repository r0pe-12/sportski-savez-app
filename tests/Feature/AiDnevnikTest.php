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

it('seeder upisuje 12 postojećih sesija', function () {
    seed(AiDnevnikSeeder::class);

    expect(AiDnevnikSesija::count())->toBe(12);
});

it('sesije se grupišu po fazi i prosleđuju u Inertia komponentu', function () {
    seed(AiDnevnikSeeder::class);

    get('/ai-dnevnik')
        ->assertInertia(
            fn ($page) => $page
                ->component('ai-dnevnik')
                ->has('fazeSaSesijama')
                ->where('fazeSaSesijama.Faza 1 — Analitička dokumentacija', fn ($sesije) => count($sesije) === 7)
                ->where('fazeSaSesijama.Faza 2 — Skraćivanje, refaktor i projektni dizajn', fn ($sesije) => count($sesije) === 4)
                ->where('fazeSaSesijama.Faza 3 — Kontinuirano dokumentovanje upotrebe AI', fn ($sesije) => count($sesije) === 1)
        );
});

it('seeder je idempotentan (drugi run ne duplira sesije)', function () {
    seed(AiDnevnikSeeder::class);
    seed(AiDnevnikSeeder::class);

    expect(AiDnevnikSesija::count())->toBe(12);
});
