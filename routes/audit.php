<?php

/*
|--------------------------------------------------------------------------
| Audit Log Routes (admin-only read)
|--------------------------------------------------------------------------
| Owner: T3.1 (Audit log dashboard)
*/

use App\Http\Controllers\Admin\AuditLogController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('audit-log', [AuditLogController::class, 'index'])->name('audit-log.index');
    Route::get('audit-log/{auditLog}', [AuditLogController::class, 'show'])->name('audit-log.show');
});
