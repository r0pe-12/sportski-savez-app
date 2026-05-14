<?php

/*
|--------------------------------------------------------------------------
| Public Routes (welcome, ai-dnevnik, public schedule kasnije)
|--------------------------------------------------------------------------
| Owners: F1 (initial welcome + ai-dnevnik), T2.5 (public schedule).
*/

use App\Http\Controllers\AiDnevnikController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ScheduleController;
use App\Http\Controllers\WelcomeController;
use Illuminate\Support\Facades\Route;

Route::get('/', [WelcomeController::class, 'index'])->name('home');

Route::get('/ai-dnevnik', [AiDnevnikController::class, 'show'])->name('ai-dnevnik');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');
});

// T2.5 public schedule routes
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('schedule', [ScheduleController::class, 'index'])->name('schedule.index');
});
