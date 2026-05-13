<?php

/*
|--------------------------------------------------------------------------
| Admin Routes
|--------------------------------------------------------------------------
| Owner: T1.1 (user/school admin). Ostali "admin-only" CRUD-ovi za sport,
| competition, result idu u resource-specific fajl sa Route::middleware('role:admin').
*/

use App\Http\Controllers\Admin\UserController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::redirect('/', '/admin/users');

    Route::resource('users', UserController::class);
});
