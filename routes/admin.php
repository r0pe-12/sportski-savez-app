<?php

/*
|--------------------------------------------------------------------------
| Admin Routes
|--------------------------------------------------------------------------
| Owner: T1.1 (user/school admin). Ostali "admin-only" CRUD-ovi za sport,
| competition, result idu u resource-specific fajl sa Route::middleware('role:admin').
*/

use App\Http\Controllers\Admin\SchoolController;
use App\Http\Controllers\Admin\TeamController as AdminTeamController;
use App\Http\Controllers\Admin\UserController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::redirect('/', '/admin/users');

    Route::resource('users', UserController::class);
    Route::resource('schools', SchoolController::class);

    // T2.1c admin team approval/rejection
    Route::get('teams', [AdminTeamController::class, 'index'])->name('teams.index');
    Route::get('teams/{team}', [AdminTeamController::class, 'show'])->name('teams.show');
    Route::post('teams/{team}/approve', [AdminTeamController::class, 'approve'])->name('teams.approve');
    Route::post('teams/{team}/reject', [AdminTeamController::class, 'reject'])->name('teams.reject');
});
