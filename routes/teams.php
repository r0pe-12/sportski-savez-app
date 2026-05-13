<?php

/*
|--------------------------------------------------------------------------
| Teams Routes
|--------------------------------------------------------------------------
| Owners: T2.1a (form), T2.1b (OCR pipeline), T2.1c (submit) — koordinišu.
*/

use App\Http\Controllers\MedicalCertificateController;
// ============================================================
// T2.1b OCR routes (UC5 — medical certificates upload pipeline)
// ============================================================
use Illuminate\Support\Facades\Route;

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
// End T2.1b OCR routes
// ============================================================
