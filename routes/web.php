<?php

/*
|--------------------------------------------------------------------------
| Web Routes — splitter
|--------------------------------------------------------------------------
| Po meta-plan 4.2 — svaki feature edituje samo svoj fajl u routes/.
| NE dodavaj rute direktno ovde; dodaj ih u feature-specific fajl.
*/

use Illuminate\Support\Facades\Route;

require __DIR__.'/auth.php';
require __DIR__.'/admin.php';
require __DIR__.'/sports.php';
require __DIR__.'/competitions.php';
require __DIR__.'/teams.php';
require __DIR__.'/students.php';
require __DIR__.'/results.php';
require __DIR__.'/audit.php';
require __DIR__.'/public.php';
require __DIR__.'/settings.php';

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});
