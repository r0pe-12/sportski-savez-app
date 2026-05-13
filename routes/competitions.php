<?php

/*
|--------------------------------------------------------------------------
| Competitions Routes (public read + admin CRUD)
|--------------------------------------------------------------------------
| Owner: T1.2 (Sportovi + raspored)
*/

use App\Http\Controllers\Admin\CompetitionController as AdminCompetitionController;
use App\Http\Controllers\CompetitionController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('competitions/{competition:slug}', [CompetitionController::class, 'show'])->name('competitions.show');
});

Route::middleware(['auth', 'verified', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::resource('competitions', AdminCompetitionController::class)->except(['show']);
});
