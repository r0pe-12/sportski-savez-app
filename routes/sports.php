<?php

/*
|--------------------------------------------------------------------------
| Sports Routes (public read + admin CRUD u istom fajlu po middleware grupi)
|--------------------------------------------------------------------------
| Owner: T1.2 (Sportovi + raspored)
*/

use App\Http\Controllers\Admin\SportController as AdminSportController;
use App\Http\Controllers\SportController;
use Illuminate\Support\Facades\Route;

// Public read (auth required po spec 13.4)
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('sports', [SportController::class, 'index'])->name('sports.index');
    Route::get('sports/{sport:slug}', [SportController::class, 'show'])->name('sports.show');
});

// Admin CRUD
Route::middleware(['auth', 'verified', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::resource('sports', AdminSportController::class)->except(['show']);
});
