<?php

use App\Http\Controllers\ArchiveController;
use App\Http\Controllers\Admin\AdminUserController;
use App\Http\Controllers\AuthorizationController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\BackendQaController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\ContractController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DossierController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\FinanceController;
use App\Http\Controllers\Finance\FinanceDocumentController;
use App\Http\Controllers\Finance\FinanceSettingsController;
use App\Http\Controllers\Finance\PaymentController;
use App\Http\Controllers\GlobalSearchController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthenticatedSessionController::class, 'create'])->name('login');
    Route::post('/login', [AuthenticatedSessionController::class, 'store'])->name('login.store');
});

Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])
    ->middleware('auth')
    ->name('logout');

Route::middleware('auth')->group(function () {
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

    Route::get('/global-search', [GlobalSearchController::class, 'index'])->name('global-search.index');

    Route::resource('clients', ClientController::class)->only([
        'index',
        'show',
        'store',
        'update',
        'destroy',
    ]);

    Route::resource('dossiers', DossierController::class)->only([
        'index',
        'show',
        'store',
        'update',
        'destroy',
    ]);

    Route::get('/documents', [DocumentController::class, 'index'])->name('documents.index');
    Route::post('/documents', [DocumentController::class, 'store'])->name('documents.store');
    Route::put('/documents/{dossierDocument}/status', [DocumentController::class, 'updateStatus'])->name('documents.status');
    Route::delete('/documents/{dossierDocument}', [DocumentController::class, 'destroy'])->name('documents.destroy');
    Route::get('/documents/{dossierDocument}/download', [DocumentController::class, 'download'])->name('documents.download');

    Route::get('/contracts', [ContractController::class, 'index'])->name('contracts.index');
    Route::post('/contracts', [ContractController::class, 'store'])->name('contracts.store');
    Route::put('/contracts/{contract}', [ContractController::class, 'update'])->name('contracts.update');
    Route::delete('/contracts/{contract}', [ContractController::class, 'destroy'])->name('contracts.destroy');
    Route::put('/contracts/{contract}/generate', [ContractController::class, 'generate'])->name('contracts.generate');
    Route::put('/contracts/{contract}/export-pdf', [ContractController::class, 'exportPdf'])->name('contracts.export-pdf');
    Route::put('/contracts/{contract}/signed', [ContractController::class, 'markSigned'])->name('contracts.signed');
    Route::get('/contracts/{contract}/download/generated', [ContractController::class, 'downloadGenerated'])->name('contracts.download.generated');
    Route::get('/contracts/{contract}/download/pdf', [ContractController::class, 'downloadPdf'])->name('contracts.download.pdf');

    Route::get('/authorizations', [AuthorizationController::class, 'index'])->name('authorizations.index');
    Route::post('/authorizations', [AuthorizationController::class, 'store'])->name('authorizations.store');
    Route::put('/authorizations/{authorization}', [AuthorizationController::class, 'update'])->name('authorizations.update');
    Route::put('/authorizations/{authorization}/status', [AuthorizationController::class, 'updateStatus'])->name('authorizations.status');
    Route::delete('/authorizations/{authorization}', [AuthorizationController::class, 'destroy'])->name('authorizations.destroy');

    Route::get('/finance', [FinanceController::class, 'index'])->name('finance.index');
    Route::post('/finance', [FinanceController::class, 'store'])->name('finance.store');
    Route::put('/finance/{financeRecord}', [FinanceController::class, 'update'])->name('finance.update');
    Route::put('/finance/{financeRecord}/paid', [FinanceController::class, 'markPaid'])->name('finance.paid');
    Route::delete('/finance/{financeRecord}', [FinanceController::class, 'destroy'])->name('finance.destroy');
    Route::put('/finance/{financeRecord}/generate', [FinanceController::class, 'generate'])->name('finance.generate');
    Route::get('/finance/{financeRecord}/download', [FinanceController::class, 'download'])->name('finance.download');
    Route::put('/finance/{financeRecord}/export-pdf', [FinanceController::class, 'exportPdf'])->name('finance.export-pdf');
    Route::get('/finance/{financeRecord}/download-pdf', [FinanceController::class, 'downloadPdf'])->name('finance.download-pdf');

    Route::get('/finance/settings', [FinanceSettingsController::class, 'index'])->name('finance.settings');
    Route::put('/finance/settings', [FinanceSettingsController::class, 'update'])->name('finance.settings.update');

    Route::get('/finance/documents', [FinanceDocumentController::class, 'index'])->name('finance.documents.index');
    Route::post('/finance/documents', [FinanceDocumentController::class, 'store'])->name('finance.documents.store');
    Route::get('/finance/documents/{financeDocument}', [FinanceDocumentController::class, 'show'])->name('finance.documents.show');
    Route::put('/finance/documents/{financeDocument}', [FinanceDocumentController::class, 'update'])->name('finance.documents.update');
    Route::delete('/finance/documents/{financeDocument}', [FinanceDocumentController::class, 'destroy'])->name('finance.documents.destroy');
    Route::put('/finance/documents/{financeDocument}/generate', [FinanceDocumentController::class, 'generate'])->name('finance.documents.generate');
    Route::get('/finance/documents/{financeDocument}/download', [FinanceDocumentController::class, 'download'])->name('finance.documents.download');
    Route::get('/finance/documents/{financeDocument}/download-pdf', [FinanceDocumentController::class, 'downloadPdf'])->name('finance.documents.download-pdf');
    Route::put('/finance/documents/{financeDocument}/accept', [FinanceDocumentController::class, 'accept'])->name('finance.documents.accept');
    Route::put('/finance/documents/{financeDocument}/reject', [FinanceDocumentController::class, 'reject'])->name('finance.documents.reject');
    Route::put('/finance/documents/{financeDocument}/cancel', [FinanceDocumentController::class, 'cancel'])->name('finance.documents.cancel');
    Route::post('/finance/documents/{financeDocument}/convert-to-invoice', [FinanceDocumentController::class, 'convertToInvoice'])->name('finance.documents.convert-to-invoice');

    Route::get('/finance/payments', [PaymentController::class, 'index'])->name('finance.payments.index');
    Route::post('/finance/payments', [PaymentController::class, 'store'])->name('finance.payments.store');
    Route::put('/finance/payments/{payment}', [PaymentController::class, 'update'])->name('finance.payments.update');
    Route::delete('/finance/payments/{payment}', [PaymentController::class, 'destroy'])->name('finance.payments.destroy');

    Route::get('/archives', [ArchiveController::class, 'index'])->name('archives.index');
    Route::post('/archives', [ArchiveController::class, 'store'])->name('archives.store');
    Route::put('/archives/{archiveRecord}', [ArchiveController::class, 'update'])->name('archives.update');
    Route::put('/archives/{archiveRecord}/status', [ArchiveController::class, 'updateStatus'])->name('archives.status');
    Route::delete('/archives/{archiveRecord}', [ArchiveController::class, 'destroy'])->name('archives.destroy');

    Route::get('/frontend-qa', function () {
        return Inertia::render('FrontendQa/Index');
    })->name('frontend-qa.index');
    Route::get('/admin/users', [AdminUserController::class, 'index'])->name('admin.users.index');
    Route::put('/admin/users/{user}/role', [AdminUserController::class, 'updateRole'])->name('admin.users.role');


    Route::get('/backend-qa', [BackendQaController::class, 'index'])->name('backend-qa.index');
});