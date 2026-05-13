<?php

/*
|--------------------------------------------------------------------------
| Students Routes
|--------------------------------------------------------------------------
| Owners: T2.2 (eDnevnik verifikacija), T2.4 (učenički profil + istorija).
*/

use App\Http\Controllers\StudentPhotoController;
use App\Http\Controllers\StudentProfileController;
use Illuminate\Support\Facades\Route;

// T2.4 profile routes
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('profile', [StudentProfileController::class, 'showOwn'])->name('student-profile.show');
    Route::patch('profile', [StudentProfileController::class, 'update'])->name('student-profile.update');
    Route::get('students/{student}', [StudentProfileController::class, 'show'])->name('students.show');
    Route::post('students/{student}/photo', [StudentPhotoController::class, 'store'])->name('students.photo.store');
    Route::delete('students/{student}/photo', [StudentPhotoController::class, 'destroy'])->name('students.photo.destroy');
});
