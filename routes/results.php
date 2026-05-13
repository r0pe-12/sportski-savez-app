<?php

/*
|--------------------------------------------------------------------------
| Results Routes (admin-only CRU, public read za rezultate)
|--------------------------------------------------------------------------
| Owner: T2.3 (Rezultati i medalje)
*/

use App\Http\Controllers\Admin\ResultController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('competitions/{competition}/results', [ResultController::class, 'index'])
        ->name('competitions.results.index');
    Route::post('competitions/{competition}/results', [ResultController::class, 'store'])
        ->name('competitions.results.store');
});
