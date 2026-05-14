<?php

/*
|--------------------------------------------------------------------------
| Competitions Routes (public read + admin CRUD)
|--------------------------------------------------------------------------
| Owner: T1.2 (Sportovi + raspored)
*/

use App\Http\Controllers\Admin\CompetitionController as AdminCompetitionController;
use App\Http\Controllers\CompetitionController;
use App\Http\Controllers\CompetitionTeamController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('competitions/{competition:slug}', [CompetitionController::class, 'show'])->name('competitions.show');

    // UC5 streamline — direktna prijava ekipe sa stranice takmičenja
    Route::post('competitions/{competition:slug}/teams', [CompetitionTeamController::class, 'store'])
        ->name('competitions.teams.store');
});

Route::middleware(['auth', 'verified', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::resource('competitions', AdminCompetitionController::class)->except(['show']);
});
