<?php

use Illuminate\Support\Facades\Artisan;

use function Pest\Laravel\get;

it('welcome route renders', function () {
    get('/')->assertOk();
});

it('ai-dnevnik route renders', function () {
    get('/ai-dnevnik')->assertOk();
});

it('dashboard route requires auth', function () {
    get('/dashboard')->assertRedirect('/login');
});

it('route list is loadable without fatal', function () {
    $exitCode = Artisan::call('route:list');
    expect($exitCode)->toBe(0);
});
