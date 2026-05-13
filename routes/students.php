<?php

/*
|--------------------------------------------------------------------------
| Students Routes
|--------------------------------------------------------------------------
| Owners: T2.2 (eDnevnik verifikacija), T2.4 (učenički profil + istorija).
*/

use App\Http\Controllers\Admin\StudentVerificationController;
use App\Http\Controllers\StudentPhotoController;
use App\Http\Controllers\StudentProfileController;
use Illuminate\Support\Facades\Route;

// T2.2 verification routes — admin only
Route::middleware(['auth', 'verified', 'role:admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::get('students', [StudentVerificationController::class, 'index'])
            ->name('students.index');
        Route::get('students/{student}/verify', [StudentVerificationController::class, 'show'])
            ->name('students.verify.show');
        Route::post('students/{student}/verify', [StudentVerificationController::class, 'verify'])
            ->name('students.verify');
        Route::post('students/{student}/manual-approve', [StudentVerificationController::class, 'manualApprove'])
            ->name('students.manual-approve');
        Route::post('students/{student}/reset-verification', [StudentVerificationController::class, 'resetVerification'])
            ->name('students.reset-verification');
    });

// T2.4 profile routes — student own, professor of school, admin all
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('profile', [StudentProfileController::class, 'showOwn'])->name('student-profile.show');
    Route::patch('profile', [StudentProfileController::class, 'update'])->name('student-profile.update');
    Route::get('students/{student}', [StudentProfileController::class, 'show'])->name('students.show');
    Route::post('students/{student}/photo', [StudentPhotoController::class, 'store'])->name('students.photo.store');
    Route::delete('students/{student}/photo', [StudentPhotoController::class, 'destroy'])->name('students.photo.destroy');
});
