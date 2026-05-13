<?php

/*
|--------------------------------------------------------------------------
| Teams Routes
|--------------------------------------------------------------------------
| Owners: T2.1a (form), T2.1b (OCR pipeline), T2.1c (submit) — koordinišu.
*/

use App\Http\Controllers\TeamController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('teams', [TeamController::class, 'index'])->name('teams.index');
    Route::get('teams/create', [TeamController::class, 'create'])->name('teams.create');
    Route::post('teams', [TeamController::class, 'store'])->name('teams.store');
    Route::get('teams/{team}/edit', [TeamController::class, 'edit'])->name('teams.edit');
    Route::patch('teams/{team}', [TeamController::class, 'update'])->name('teams.update');
    Route::delete('teams/{team}', [TeamController::class, 'destroy'])->name('teams.destroy');
});
