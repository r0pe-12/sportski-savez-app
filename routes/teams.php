<?php

/*
|--------------------------------------------------------------------------
| Teams Routes
|--------------------------------------------------------------------------
| Owners: T2.1a (form), T2.1b (OCR pipeline), T2.1c (submit) — koordinišu.
*/

use App\Http\Controllers\TeamController;
use Illuminate\Support\Facades\Route;

// T2.1a routes (placeholder — popuniće T2.1a tokom merge-a):
//   GET    /teams                  → index
//   GET    /teams/create           → create
//   POST   /teams                  → store
//   GET    /teams/{team}/edit      → edit
//   PUT    /teams/{team}           → update
//   DELETE /teams/{team}           → destroy

// T2.1b routes (placeholder — popuniće T2.1b tokom merge-a):
//   POST   /teams/{team}/members/{member}/certificate → upload OCR

// T2.1c submission routes
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('teams/{team}/review', [TeamController::class, 'review'])
        ->name('teams.review');

    Route::post('teams/{team}/submit', [TeamController::class, 'submit'])
        ->name('teams.submit');

    Route::post('teams/{team}/cancel', [TeamController::class, 'cancel'])
        ->name('teams.cancel');
});
