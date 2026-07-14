<?php

use App\Http\Controllers\Api\CinOcrController;
use App\Http\Controllers\Api\ClientController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function () {
    Route::post('/ocr/scan', [CinOcrController::class, 'scan'])->name('api.ocr.scan');
    Route::post('/ocr/scan-cin', [CinOcrController::class, 'scanCin'])->name('api.ocr.scan-cin');

    Route::get('/clients', [ClientController::class, 'index'])->name('api.clients.index');
    Route::get('/clients/{client}/projects', [ClientController::class, 'projects'])->name('api.clients.projects');
});
