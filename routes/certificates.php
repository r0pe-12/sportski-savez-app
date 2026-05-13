<?php

/*
|--------------------------------------------------------------------------
| Certificates Routes
|--------------------------------------------------------------------------
| Owner: gap5 — admin review queue za medical certificate (manual_review).
| Postojeća manualApprove ruta ostaje u routes/teams.php (T2.1b).
*/

use App\Http\Controllers\Admin\CertificateController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'role:admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::get('certificates', [CertificateController::class, 'index'])
            ->name('certificates.index');

        Route::post('certificates/{certificate}/reject', [CertificateController::class, 'reject'])
            ->name('certificates.reject');
    });
