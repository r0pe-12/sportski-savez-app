<?php

/*
|--------------------------------------------------------------------------
| Public Routes (welcome, ai-dnevnik, public schedule kasnije)
|--------------------------------------------------------------------------
| Owners: F1 (initial welcome + ai-dnevnik), T2.5 (public schedule).
*/

use App\Http\Controllers\AiDnevnikController;
use App\Http\Controllers\NotificationController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::get('/ai-dnevnik', [AiDnevnikController::class, 'show'])->name('ai-dnevnik');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');
});
