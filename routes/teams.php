<?php

/*
|--------------------------------------------------------------------------
| Teams Routes
|--------------------------------------------------------------------------
| Owners: T2.1a (form), T2.1b (OCR pipeline), T2.1c (submit) — koordinišu.
*/

use App\Http\Controllers\MedicalCertificateController;
use App\Http\Controllers\TeamController;
use App\Http\Controllers\TeamMemberController;
use Illuminate\Support\Facades\Route;

// ============================================================
// T2.1a — Team CRUD (draft state)
// ============================================================
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('teams', [TeamController::class, 'index'])->name('teams.index');
    Route::get('teams/create', [TeamController::class, 'create'])->name('teams.create');
    Route::post('teams', [TeamController::class, 'store'])->name('teams.store');
    Route::get('teams/{team}/edit', [TeamController::class, 'edit'])->name('teams.edit');
    Route::patch('teams/{team}', [TeamController::class, 'update'])->name('teams.update');
    Route::delete('teams/{team}', [TeamController::class, 'destroy'])->name('teams.destroy');

    Route::post('teams/{team}/members', [TeamMemberController::class, 'store'])->name('teams.members.store');
    Route::delete('teams/{team}/members/{member}', [TeamMemberController::class, 'destroy'])->name('teams.members.destroy');
});

// ============================================================
// T2.1b — Medical certificate OCR pipeline
// ============================================================
Route::middleware(['auth', 'verified'])->group(function () {
    Route::post('teams/{team}/members/{member}/certificate', [MedicalCertificateController::class, 'store'])
        ->name('teams.members.certificate.store');

    Route::delete('teams/{team}/members/{member}/certificate', [MedicalCertificateController::class, 'destroy'])
        ->name('teams.members.certificate.destroy');

    Route::get('certificates/{certificate}', [MedicalCertificateController::class, 'show'])
        ->name('certificates.show');
});

Route::middleware(['auth', 'verified', 'role:admin'])->group(function () {
    Route::post('admin/certificates/{certificate}/manual-approve', [MedicalCertificateController::class, 'manualApprove'])
        ->name('admin.certificates.manual-approve');
});

// ============================================================
// T2.1c — Team submission (draft → submitted → active|rejected, cancel)
// ============================================================
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('teams/{team}/review', [TeamController::class, 'review'])
        ->name('teams.review');

    Route::post('teams/{team}/submit', [TeamController::class, 'submit'])
        ->name('teams.submit');

    Route::post('teams/{team}/cancel', [TeamController::class, 'cancel'])
        ->name('teams.cancel');
});
