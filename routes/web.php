<?php

use App\Http\Controllers\ArchiveController;
use App\Http\Controllers\Admin\AdminUserController;
use App\Http\Controllers\Admin\AdminUserInvitationController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Api\ClientController as ApiClientController;
use App\Http\Controllers\BackendQaController;
use App\Http\Controllers\CalendarController;
use App\Http\Controllers\CalendarEventController;
use App\Http\Controllers\CalendarParticipantController;
use App\Http\Controllers\CalendarReminderController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\ContractController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DossierController;
use App\Http\Controllers\DossierWorkflowRequirementController;
use App\Http\Controllers\ProjectDesignController;
use App\Http\Controllers\ProjectDesignUploadSessionController;
use App\Http\Controllers\TusController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\Finance\DocumentTemplateController;
use App\Http\Controllers\Finance\DocumentTemplateVersionController;
use App\Http\Controllers\Finance\FinanceDocumentController;
use App\Http\Controllers\Finance\FinanceSettingsController;
use App\Http\Controllers\Finance\CompanyLogoController;
use App\Http\Controllers\Finance\ExpenseController;
use App\Http\Controllers\Finance\MonthlySummaryExportController;
use App\Http\Controllers\Finance\PaymentController;
use App\Http\Controllers\GlobalSearchController;
use App\Http\Controllers\IntermediaryController;
use App\Http\Controllers\OperationsReportController;
use App\Http\Controllers\WorkloadController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthenticatedSessionController::class, 'create'])->name('login');
    Route::post('/login', [AuthenticatedSessionController::class, 'store'])->name('login.store');
    Route::get('/accept-invitation/{token}', [AdminUserInvitationController::class, 'accept'])->name('invitation.accept');
    Route::post('/accept-invitation/{token}', [AdminUserInvitationController::class, 'complete'])->name('invitation.complete');
});

Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])
    ->middleware('auth')
    ->name('logout');

Route::middleware('auth')->group(function () {
    Route::put('/finance/settings', [FinanceSettingsController::class, 'update'])->name('finance.settings.update')->middleware('permission.route');
    Route::put('/finance/settings/reset', [FinanceSettingsController::class, 'reset'])->name('finance.settings.reset')->middleware('permission.route');
    Route::post('/finance/settings/logo', [CompanyLogoController::class, 'store'])->name('finance.settings.logo.store')->middleware('permission.route');
    Route::delete('/finance/settings/logo', [CompanyLogoController::class, 'destroy'])->name('finance.settings.logo.destroy')->middleware('permission.route');
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard')->middleware('permission.route');

    Route::get('/global-search', [GlobalSearchController::class, 'index'])->name('global-search.index')->middleware('permission.route');

    Route::resource('clients', ClientController::class)->only([
        'index',
        'show',
        'store',
        'update',
        'destroy',
    ])->middleware('permission.route');
    Route::patch('/clients/{client}/status', [ClientController::class, 'updateStatus'])->name('clients.status.update')->middleware('permission.route');
    Route::post('/clients/scan-cin', [ClientController::class, 'scanCin'])->name('clients.scan-cin')->middleware('permission.route')->withoutMiddleware([\App\Http\Middleware\HandleInertiaRequests::class]);

    Route::resource('intermediaries', IntermediaryController::class)->only([
        'index',
        'show',
        'store',
        'update',
        'destroy',
    ])->middleware('permission.route');

    Route::resource('dossiers', DossierController::class)->only([
        'index',
        'show',
        'store',
        'update',
        'destroy',
    ])->middleware('permission.route');
    Route::put('/dossiers/{dossier}/workflow-requirements', [DossierWorkflowRequirementController::class, 'update'])
        ->name('dossiers.workflow-requirements.update')
        ->middleware('permission.route');

    Route::middleware('permission.route')->group(function () {
    Route::get('/dossiers/{dossier}/project-design/summary', [ProjectDesignController::class, 'summary'])->name('dossiers.project-design.summary');
    Route::get('/dossiers/{dossier}/project-design/folders', [ProjectDesignController::class, 'folders'])->name('dossiers.project-design.folders');
    Route::post('/dossiers/{dossier}/project-design/folders', [ProjectDesignController::class, 'storeFolder'])->name('dossiers.project-design.folders.store');
    Route::put('/dossiers/{dossier}/project-design/folders/{folder}', [ProjectDesignController::class, 'updateFolder'])->name('dossiers.project-design.folders.update');
    Route::delete('/dossiers/{dossier}/project-design/folders/{folder}', [ProjectDesignController::class, 'destroyFolder'])->name('dossiers.project-design.folders.destroy');
    Route::get('/dossiers/{dossier}/project-design/files', [ProjectDesignController::class, 'index'])->name('dossiers.project-design.files');
    Route::post('/dossiers/{dossier}/project-design/files', [ProjectDesignController::class, 'store'])->name('dossiers.project-design.files.store');
    Route::put('/dossiers/{dossier}/project-design/files/{file}', [ProjectDesignController::class, 'update'])->name('dossiers.project-design.files.update');
    Route::delete('/dossiers/{dossier}/project-design/files/{file}', [ProjectDesignController::class, 'destroy'])->name('dossiers.project-design.files.destroy');
    Route::post('/dossiers/{dossier}/project-design/files/{file}/restore', [ProjectDesignController::class, 'restore'])->name('dossiers.project-design.files.restore');
    Route::get('/dossiers/{dossier}/project-design/files/{file}/versions', [ProjectDesignController::class, 'versions'])->name('dossiers.project-design.files.versions');
    Route::post('/dossiers/{dossier}/project-design/files/{file}/versions', [ProjectDesignController::class, 'uploadVersion'])->name('dossiers.project-design.versions.upload');
    Route::get('/dossiers/{dossier}/project-design/versions/{version}/preview', [ProjectDesignController::class, 'preview'])->name('dossiers.project-design.versions.preview');
    Route::get('/dossiers/{dossier}/project-design/versions/{version}/download', [ProjectDesignController::class, 'download'])->name('dossiers.project-design.versions.download');
    Route::get('/dossiers/{dossier}/project-design/activity', [ProjectDesignController::class, 'activity'])->name('dossiers.project-design.activity');
    Route::get('/dossiers/{dossier}/project-design/files/{file}', [ProjectDesignController::class, 'show'])->name('dossiers.project-design.files.show');
    Route::get('/dossiers/{dossier}/project-design/versions/{version}/annotations', [ProjectDesignController::class, 'getAnnotations'])->name('dossiers.project-design.versions.annotations');
    Route::post('/dossiers/{dossier}/project-design/versions/{version}/annotations', [ProjectDesignController::class, 'storeAnnotation'])->name('dossiers.project-design.versions.annotations.store');
    Route::put('/dossiers/{dossier}/project-design/versions/{version}/annotations/{annotation}', [ProjectDesignController::class, 'updateAnnotation'])->name('dossiers.project-design.versions.annotations.update');
    Route::delete('/dossiers/{dossier}/project-design/versions/{version}/annotations/{annotation}', [ProjectDesignController::class, 'destroyAnnotation'])->name('dossiers.project-design.versions.annotations.destroy');
    Route::post('/dossiers/{dossier}/project-design/versions/{version}/submit-review', [ProjectDesignController::class, 'submitForReview'])->name('dossiers.project-design.versions.submit-review');
    Route::post('/dossiers/{dossier}/project-design/versions/{version}/reviews/{review}/start', [ProjectDesignController::class, 'startReview'])->name('dossiers.project-design.versions.reviews.start');
    Route::post('/dossiers/{dossier}/project-design/versions/{version}/reviews/{review}/decision', [ProjectDesignController::class, 'decideReview'])->name('dossiers.project-design.versions.reviews.decision');
    Route::get('/dossiers/{dossier}/project-design/reviews', [ProjectDesignController::class, 'reviewQueue'])->name('dossiers.project-design.reviews');
    Route::get('/dossiers/{dossier}/project-design/remarks', [ProjectDesignController::class, 'listRemarks'])->name('dossiers.project-design.remarks');
    Route::post('/dossiers/{dossier}/project-design/versions/{version}/remarks', [ProjectDesignController::class, 'storeRemark'])->name('dossiers.project-design.remarks.store');
    Route::put('/dossiers/{dossier}/project-design/remarks/{remark}', [ProjectDesignController::class, 'updateRemark'])->name('dossiers.project-design.remarks.update');
    Route::delete('/dossiers/{dossier}/project-design/remarks/{remark}', [ProjectDesignController::class, 'destroyRemark'])->name('dossiers.project-design.remarks.destroy');
    Route::get('/project-design/assets/{asset}/preview', [ProjectDesignController::class, 'assetPreview'])->name('project-design.assets.preview');
    Route::get('/project-design/assets/{asset}/download', [ProjectDesignController::class, 'assetDownload'])->name('project-design.assets.download');
    Route::post('/dossiers/{dossier}/project-design/versions/{version}/review-assets', [ProjectDesignController::class, 'addReviewAsset'])->name('dossiers.project-design.versions.review-assets.store');
    Route::post('/dossiers/{dossier}/project-design/versions/{asset}/retry-conversion', [ProjectDesignController::class, 'retryConversion'])->name('dossiers.project-design.assets.retry-conversion');

    // Upload sessions
    Route::post('/dossiers/{dossier}/project-design/upload-sessions', [ProjectDesignUploadSessionController::class, 'create'])->name('dossiers.project-design.upload-sessions.create');
    Route::post('/dossiers/{dossier}/project-design/upload-sessions/{session}/finalize', [ProjectDesignUploadSessionController::class, 'finalize'])->name('dossiers.project-design.upload-sessions.finalize');
    Route::get('/dossiers/{dossier}/project-design/upload-sessions/{session}', [ProjectDesignUploadSessionController::class, 'status'])->name('dossiers.project-design.upload-sessions.status');
    Route::post('/dossiers/{dossier}/project-design/upload-sessions/{session}/cancel', [ProjectDesignUploadSessionController::class, 'cancel'])->name('dossiers.project-design.upload-sessions.cancel');

    // Tus protocol
    Route::match(['OPTIONS', 'POST'], '/tus', [TusController::class, 'post'])->name('tus.create');
    Route::match(['GET', 'HEAD'], '/tus/{upload}', [TusController::class, 'head'])->name('tus.head');
    Route::patch('/tus/{upload}', [TusController::class, 'patch'])->name('tus.patch');
    Route::delete('/tus/{upload}', [TusController::class, 'delete'])->name('tus.delete');
    });

    Route::get('/documents', [DocumentController::class, 'index'])->name('documents.index')->middleware('permission.route');
    Route::post('/documents', [DocumentController::class, 'store'])->name('documents.store')->middleware('permission.route');
    Route::put('/documents/{dossierDocument}/status', [DocumentController::class, 'updateStatus'])->name('documents.status')->middleware('permission.route');
    Route::delete('/documents/{dossierDocument}', [DocumentController::class, 'destroy'])->name('documents.destroy')->middleware('permission.route');
    Route::post('/documents/{dossierDocument}/replace', [DocumentController::class, 'replace'])->name('documents.replace')->middleware('permission.route');
    Route::get('/documents/{dossierDocument}/view', [DocumentController::class, 'view'])->name('documents.view')->middleware('permission.route');
    Route::get('/documents/{dossierDocument}/print', [DocumentController::class, 'print'])->name('documents.print')->middleware('permission.route');
    Route::get('/documents/{dossierDocument}/download', [DocumentController::class, 'download'])->name('documents.download')->middleware('permission.route');

    Route::get('/contracts', [ContractController::class, 'index'])->name('contracts.index')->middleware('permission.route');
    Route::post('/contracts', [ContractController::class, 'store'])->name('contracts.store')->middleware('permission.route');
    Route::put('/contracts/{contract}', [ContractController::class, 'update'])->name('contracts.update')->middleware('permission.route');
    Route::delete('/contracts/{contract}', [ContractController::class, 'destroy'])->name('contracts.destroy')->middleware('permission.route');
    Route::put('/contracts/{contract}/generate', [ContractController::class, 'generate'])->name('contracts.generate')->middleware('permission.route');
    Route::put('/contracts/{contract}/export-pdf', [ContractController::class, 'exportPdf'])->name('contracts.export-pdf')->middleware('permission.route');
    Route::put('/contracts/{contract}/signed', [ContractController::class, 'markSigned'])->name('contracts.signed')->middleware('permission.route');
    Route::get('/contracts/{contract}/print', [ContractController::class, 'print'])->name('contracts.print')->middleware('permission.route');
    Route::get('/contracts/{contract}/download/generated', [ContractController::class, 'downloadGenerated'])->name('contracts.download.generated')->middleware('permission.route');
    Route::get('/contracts/{contract}/download/pdf', [ContractController::class, 'downloadPdf'])->name('contracts.download.pdf')->middleware('permission.route');
    Route::get('/contracts/{contract}/preview/pdf', [ContractController::class, 'previewPdf'])->name('contracts.preview.pdf')->middleware('permission.route');

    Route::middleware('permission.route')->group(function () {
    Route::get('/finance', [FinanceDocumentController::class, 'index'])->name('finance.index');
    Route::get('/finance/monthly-summary/export-pdf', [MonthlySummaryExportController::class, 'exportPdf'])->name('finance.monthly-summary.export-pdf');
    Route::get('/finance/monthly-summary/export-excel', [MonthlySummaryExportController::class, 'exportExcel'])->name('finance.monthly-summary.export-excel');
    Route::get('/finance/monthly-summary/export-csv', [MonthlySummaryExportController::class, 'exportCsv'])->name('finance.monthly-summary.export-csv');
    Route::get('/finance/templates', [DocumentTemplateController::class, 'index'])->name('finance.templates.index');
    Route::get('/finance/templates/{documentTemplate}/versions', [DocumentTemplateVersionController::class, 'index'])->name('finance.templates.versions.index');
    Route::post('/finance/templates/{documentTemplate}/versions', [DocumentTemplateVersionController::class, 'store'])->name('finance.templates.versions.store');
    Route::put('/finance/templates/{documentTemplate}/versions/{version}/restore', [DocumentTemplateVersionController::class, 'restore'])->name('finance.templates.versions.restore');
    Route::delete('/finance/templates/{documentTemplate}/versions/{version}', [DocumentTemplateVersionController::class, 'destroy'])->name('finance.templates.versions.destroy');
    Route::post('/finance/templates', [DocumentTemplateController::class, 'store'])->name('finance.templates.store');
    Route::put('/finance/templates/reset/{type}', [DocumentTemplateController::class, 'resetDefault'])->name('finance.templates.reset');
    Route::get('/finance/templates/{documentTemplate}', [DocumentTemplateController::class, 'show'])->name('finance.templates.show');
    Route::put('/finance/templates/{documentTemplate}', [DocumentTemplateController::class, 'update'])->name('finance.templates.update');
    Route::patch('/finance/templates/{documentTemplate}/rename', [DocumentTemplateController::class, 'rename'])->name('finance.templates.rename');
    Route::delete('/finance/templates/{documentTemplate}', [DocumentTemplateController::class, 'destroy'])->name('finance.templates.destroy');
    Route::post('/finance/templates/{documentTemplate}/duplicate', [DocumentTemplateController::class, 'duplicate'])->name('finance.templates.duplicate');
    Route::put('/finance/templates/{documentTemplate}/default', [DocumentTemplateController::class, 'setDefault'])->name('finance.templates.default');
    Route::get('/finance/templates/{documentTemplate}/preview', [DocumentTemplateController::class, 'preview'])->name('finance.templates.preview');

    Route::get('/finance/documents', [FinanceDocumentController::class, 'index'])->name('finance.documents.index');
    Route::post('/finance/documents', [FinanceDocumentController::class, 'store'])->name('finance.documents.store');
    Route::get('/finance/documents/{financeDocument}', [FinanceDocumentController::class, 'show'])->name('finance.documents.show');
    Route::put('/finance/documents/{financeDocument}', [FinanceDocumentController::class, 'update'])->name('finance.documents.update');
    Route::delete('/finance/documents/{financeDocument}', [FinanceDocumentController::class, 'destroy'])->name('finance.documents.destroy');
    Route::get('/finance/documents/{financeDocument}/preview-html', [FinanceDocumentController::class, 'previewHtml'])->name('finance.documents.preview-html');
    Route::post('/finance/documents/preview', [FinanceDocumentController::class, 'previewDraft'])->name('finance.documents.preview-draft');
    Route::put('/finance/documents/{financeDocument}/generate', [FinanceDocumentController::class, 'generate'])->name('finance.documents.generate');
    Route::put('/finance/documents/{financeDocument}/generate-pdf', [FinanceDocumentController::class, 'generatePdf'])->name('finance.documents.generate-pdf');
    Route::put('/finance/documents/{financeDocument}/generate-excel', [FinanceDocumentController::class, 'generateExcel'])->name('finance.documents.generate-excel');
    Route::get('/finance/documents/{financeDocument}/download', [FinanceDocumentController::class, 'download'])->name('finance.documents.download');
    Route::get('/finance/documents/{financeDocument}/download-excel', [FinanceDocumentController::class, 'downloadExcel'])->name('finance.documents.download-excel');
    Route::get('/finance/documents/{financeDocument}/download-pdf', [FinanceDocumentController::class, 'downloadPdf'])->name('finance.documents.download-pdf');
    Route::get('/finance/documents/{financeDocument}/view', [FinanceDocumentController::class, 'viewHtml'])->name('finance.documents.view');
    Route::get('/finance/documents/{financeDocument}/view-pdf', [FinanceDocumentController::class, 'viewPdf'])->name('finance.documents.view-pdf');
    Route::get('/finance/documents/{financeDocument}/print', [FinanceDocumentController::class, 'print'])->name('finance.documents.print');
    Route::post('/finance/documents/{financeDocument}/reveal-generated-files', [FinanceDocumentController::class, 'revealGeneratedFiles'])->name('finance.documents.reveal-generated-files');
    Route::put('/finance/documents/{financeDocument}/accept', [FinanceDocumentController::class, 'accept'])->name('finance.documents.accept');
    Route::put('/finance/documents/{financeDocument}/reject', [FinanceDocumentController::class, 'reject'])->name('finance.documents.reject');
    Route::put('/finance/documents/{financeDocument}/cancel', [FinanceDocumentController::class, 'cancel'])->name('finance.documents.cancel');
    Route::post('/finance/documents/{financeDocument}/convert-to-invoice', [FinanceDocumentController::class, 'convertToInvoice'])->name('finance.documents.convert-to-invoice');

    Route::get('/finance/payments', [PaymentController::class, 'index'])->name('finance.payments.index');
    Route::post('/finance/payments', [PaymentController::class, 'store'])->name('finance.payments.store');
    Route::put('/finance/payments/{payment}', [PaymentController::class, 'update'])->name('finance.payments.update');
    Route::delete('/finance/payments/{payment}', [PaymentController::class, 'destroy'])->name('finance.payments.destroy');

    Route::get('/finance/expenses', [ExpenseController::class, 'index'])->name('finance.expenses.index');
    Route::post('/finance/expenses', [ExpenseController::class, 'store'])->name('finance.expenses.store');
    Route::put('/finance/expenses/{expense}', [ExpenseController::class, 'update'])->name('finance.expenses.update');
    Route::delete('/finance/expenses/{expense}', [ExpenseController::class, 'destroy'])->name('finance.expenses.destroy');
    });

    Route::middleware('permission.route')->group(function () {
        // Static routes first (before wildcard {archiveRecord})
        Route::get('/archives/reports', [ArchiveController::class, 'reports'])->name('archives.reports');
        Route::get('/archives/count', [ArchiveController::class, 'count'])->name('archives.count');
        Route::post('/archives/checkout', [ArchiveController::class, 'checkout'])->name('archives.checkout');
        Route::post('/archives/return', [ArchiveController::class, 'returnArchives'])->name('archives.return');
        Route::post('/archives/move', [ArchiveController::class, 'moveArchives'])->name('archives.move');
        Route::post('/archives/bulk/status', [ArchiveController::class, 'bulkStatus'])->name('archives.bulk.status');
        Route::post('/archives/bulk/move', [ArchiveController::class, 'bulkMove'])->name('archives.bulk.move');
        Route::get('/archives/boxes/{box}/contents', [ArchiveController::class, 'boxContents'])->name('archives.boxes.contents');
        // Wildcard routes last
        Route::get('/archives', [ArchiveController::class, 'index'])->name('archives.index');
        Route::get('/archives/{archiveRecord}', [ArchiveController::class, 'show'])->name('archives.show');
        Route::post('/archives', [ArchiveController::class, 'store'])->name('archives.store');
        Route::post('/archives/rooms', [ArchiveController::class, 'storeRoom'])->name('archives.rooms.store');
        Route::put('/archives/{archiveRecord}', [ArchiveController::class, 'update'])->name('archives.update');
        Route::put('/archives/{archiveRecord}/status', [ArchiveController::class, 'updateStatus'])->name('archives.status');
        Route::put('/archives/{archiveRecord}/mark-lost', [ArchiveController::class, 'markLost'])->name('archives.mark-lost');
        Route::delete('/archives/{archiveRecord}', [ArchiveController::class, 'destroy'])->name('archives.destroy');
    });
    Route::get('/archives/cities', [\App\Http\Controllers\CityController::class, 'index'])->name('archives.cities.index')->middleware('permission.route');
    Route::post('/archives/cities', [\App\Http\Controllers\CityController::class, 'store'])->name('archives.cities.store')->middleware('permission.route');
    Route::put('/archives/cities/{city}', [\App\Http\Controllers\CityController::class, 'update'])->name('archives.cities.update')->middleware('permission.route');
    Route::delete('/archives/cities/{city}', [\App\Http\Controllers\CityController::class, 'destroy'])->name('archives.cities.destroy')->middleware('permission.route');

    Route::get('/settings', [\App\Http\Controllers\CityController::class, 'settings'])->name('settings.index')->middleware('permission.route');
    Route::post('/settings/cities', [\App\Http\Controllers\CityController::class, 'store'])->name('settings.cities.store')->middleware('permission.route');
    Route::put('/settings/cities/{city}', [\App\Http\Controllers\CityController::class, 'update'])->name('settings.cities.update')->middleware('permission.route');
    Route::delete('/settings/cities/{city}', [\App\Http\Controllers\CityController::class, 'destroy'])->name('settings.cities.destroy')->middleware('permission.route');

    Route::prefix('api')->middleware('permission.route')->group(function () {
        Route::get('/clients/search', [ApiClientController::class, 'search'])->name('api.clients.search');
        Route::get('/clients/{client}/projects', [ApiClientController::class, 'projects'])->name('api.clients.projects');
    });

    Route::get('/frontend-qa', function () {
        return Inertia::render('FrontendQa/Index');
    })->name('frontend-qa.index')->middleware('permission.route');
    Route::get('/admin/users', [AdminUserController::class, 'index'])->name('admin.users.index')->middleware('permission.route');
    Route::post('/admin/users', [AdminUserController::class, 'store'])->name('admin.users.store')->middleware('permission.route');
    Route::put('/admin/users/bulk/role', [AdminUserController::class, 'bulkUpdateRole'])->name('admin.users.bulk.role')->middleware('permission.route');
    Route::put('/admin/users/bulk/suspend', [AdminUserController::class, 'bulkSuspend'])->name('admin.users.bulk.suspend')->middleware('permission.route');
    Route::post('/admin/users/bulk/delete', [AdminUserController::class, 'bulkDestroy'])->name('admin.users.bulk.destroy')->middleware('permission.route');
    Route::put('/admin/users/{user}/access', [AdminUserController::class, 'updateAccess'])->name('admin.users.access.update')->middleware('permission.route');
    Route::put('/admin/users/{user}/role', [AdminUserController::class, 'updateRole'])->name('admin.users.role')->middleware('permission.route');
    Route::delete('/admin/users/{user}', [AdminUserController::class, 'destroy'])->name('admin.users.destroy')->middleware('permission.route');
    Route::put('/admin/users/{user}/permissions', [AdminUserController::class, 'updatePermissions'])->name('admin.users.permissions')->middleware('permission.route');
    Route::post('/admin/users/invite', [AdminUserInvitationController::class, 'store'])->name('admin.users.invite')->middleware('permission.route');
    Route::post('/admin/users/invite/bulk/validate', [AdminUserInvitationController::class, 'bulkValidate'])->name('admin.users.invite.bulk.validate')->middleware('permission.route');
    Route::post('/admin/users/invite/bulk', [AdminUserInvitationController::class, 'bulkStore'])->name('admin.users.invite.bulk')->middleware('permission.route');
    Route::get('/admin/users/audit-logs', [AdminUserController::class, 'auditLogs'])->name('admin.users.audit-logs')->middleware('permission.route');


    Route::get('/backend-qa', [BackendQaController::class, 'index'])->name('backend-qa.index')->middleware('permission.route');

    Route::middleware('permission.route')->group(function () {
    Route::get('/tasks', [\App\Http\Controllers\TaskController::class, 'index'])->name('tasks.index');
    Route::post('/tasks', [\App\Http\Controllers\TaskController::class, 'store'])->name('tasks.store');
    Route::get('/tasks/{task}', [\App\Http\Controllers\TaskController::class, 'show'])->name('tasks.show');
    Route::get('/tasks/{task}/detail', [\App\Http\Controllers\TaskController::class, 'detail'])->name('tasks.detail');
    Route::put('/tasks/{task}', [\App\Http\Controllers\TaskController::class, 'update'])->name('tasks.update');
    Route::delete('/tasks/{task}', [\App\Http\Controllers\TaskController::class, 'destroy'])->name('tasks.destroy');
    Route::put('/tasks/{task}/status', [\App\Http\Controllers\TaskController::class, 'updateStatus'])->name('tasks.status');

    Route::get('/tasks/{task}/comments', [\App\Http\Controllers\TaskCommentController::class, 'index'])->name('tasks.comments.index');
    Route::post('/tasks/{task}/comments', [\App\Http\Controllers\TaskCommentController::class, 'store'])->name('tasks.comments.store');
    Route::delete('/tasks/{task}/comments/{comment}', [\App\Http\Controllers\TaskCommentController::class, 'destroy'])->name('tasks.comments.destroy');

    Route::get('/tasks/{task}/checklist', [\App\Http\Controllers\TaskChecklistController::class, 'index'])->name('tasks.checklist.index');
    Route::post('/tasks/{task}/checklist', [\App\Http\Controllers\TaskChecklistController::class, 'store'])->name('tasks.checklist.store');
    Route::put('/tasks/{task}/checklist/{item}/toggle', [\App\Http\Controllers\TaskChecklistController::class, 'toggle'])->name('tasks.checklist.toggle');
    Route::delete('/tasks/{task}/checklist/{item}', [\App\Http\Controllers\TaskChecklistController::class, 'destroy'])->name('tasks.checklist.destroy');

    Route::post('/tasks/{task}/attachments', [\App\Http\Controllers\TaskAttachmentController::class, 'store'])->name('tasks.attachments.store');
    Route::delete('/tasks/{task}/attachments/{attachment}', [\App\Http\Controllers\TaskAttachmentController::class, 'destroy'])->name('tasks.attachments.destroy');

    Route::get('/tasks/suggestions', [\App\Http\Controllers\TaskSuggestionController::class, 'index'])->name('tasks.suggestions.index');
    Route::post('/tasks/suggestions/{suggestion}/create-task', [\App\Http\Controllers\TaskSuggestionController::class, 'createFromSuggestion'])->name('tasks.suggestions.create-task');
    Route::post('/tasks/suggestions/{suggestion}/dismiss', [\App\Http\Controllers\TaskSuggestionController::class, 'dismiss'])->name('tasks.suggestions.dismiss');

    Route::get('/inbox', [\App\Http\Controllers\ConversationController::class, 'index'])->name('inbox.index');
    Route::post('/inbox', [\App\Http\Controllers\ConversationController::class, 'store'])->name('inbox.store');
    Route::get('/inbox/archived', [\App\Http\Controllers\ConversationController::class, 'archived'])->name('inbox.archived');
    Route::get('/inbox/conversations/list', [\App\Http\Controllers\ConversationController::class, 'listing'])->name('inbox.list');
    Route::get('/inbox/attachments/{messageAttachment}/view', [\App\Http\Controllers\MessageAttachmentController::class, 'view'])->name('inbox.attachments.view');
    Route::get('/inbox/attachments/{messageAttachment}/download', [\App\Http\Controllers\MessageAttachmentController::class, 'download'])->name('inbox.attachments.download');
    Route::get('/inbox/{conversation}', [\App\Http\Controllers\ConversationController::class, 'show'])->name('inbox.show');
    Route::get('/inbox/{conversation}/search', [\App\Http\Controllers\ConversationController::class, 'searchMessages'])->name('inbox.search');
    Route::get('/inbox/{conversation}/attachments', [\App\Http\Controllers\ConversationController::class, 'attachments'])->name('inbox.attachments');
    Route::post('/inbox/{conversation}/messages', [\App\Http\Controllers\MessageController::class, 'store'])->name('inbox.messages.store');
    Route::put('/inbox/{conversation}/messages/{message}', [\App\Http\Controllers\MessageController::class, 'update'])->name('inbox.messages.update');
    Route::delete('/inbox/{conversation}/messages/{message}', [\App\Http\Controllers\MessageController::class, 'destroy'])->name('inbox.messages.destroy');
    Route::post('/inbox/{conversation}/messages/{message}/forward', [\App\Http\Controllers\MessageController::class, 'forward'])->name('inbox.messages.forward');
    Route::post('/inbox/{conversation}/typing', [\App\Http\Controllers\MessageController::class, 'typing'])->name('inbox.typing');
    Route::get('/inbox/{conversation}/typing', [\App\Http\Controllers\MessageController::class, 'typingUsers'])->name('inbox.typing.users');
    Route::put('/inbox/{conversation}', [\App\Http\Controllers\ConversationController::class, 'update'])->name('inbox.update');
    Route::post('/inbox/{conversation}/participants', [\App\Http\Controllers\ConversationController::class, 'addParticipant'])->name('inbox.participants.add');
    Route::delete('/inbox/{conversation}/participants/{user}', [\App\Http\Controllers\ConversationController::class, 'removeParticipant'])->name('inbox.participants.remove');
    Route::post('/inbox/{conversation}/archive', [\App\Http\Controllers\ConversationController::class, 'archive'])->name('inbox.archive');
    Route::post('/inbox/{conversation}/unarchive', [\App\Http\Controllers\ConversationController::class, 'unarchive'])->name('inbox.unarchive');
    Route::put('/inbox/{conversation}/preferences', [\App\Http\Controllers\ConversationController::class, 'preferences'])->name('inbox.preferences');
    Route::post('/inbox/{conversation}/mark-unread', [\App\Http\Controllers\ConversationController::class, 'markUnread'])->name('inbox.mark-unread');

    Route::get('/notifications', [\App\Http\Controllers\NotificationController::class, 'index'])->name('notifications.index');
    Route::post('/notifications/{id}/read', [\App\Http\Controllers\NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::post('/notifications/read-all', [\App\Http\Controllers\NotificationController::class, 'markAllAsRead'])->name('notifications.read-all');

    Route::get('/workload', [WorkloadController::class, 'index'])->name('workload.index');
    Route::get('/operations/reports', [OperationsReportController::class, 'index'])->name('operations.reports.index');

    Route::get('/calendar', [CalendarController::class, 'index'])->name('calendar.index');
    Route::post('/calendar/events', [CalendarEventController::class, 'store'])->name('calendar.events.store');
    Route::get('/calendar/events/{calendarEvent}', [CalendarEventController::class, 'show'])->name('calendar.events.show');
    Route::put('/calendar/events/{calendarEvent}', [CalendarEventController::class, 'update'])->name('calendar.events.update');
    Route::delete('/calendar/events/{calendarEvent}', [CalendarEventController::class, 'destroy'])->name('calendar.events.destroy');
    Route::put('/calendar/events/{calendarEvent}/move', [CalendarEventController::class, 'move'])->name('calendar.events.move');
    Route::put('/calendar/events/{calendarEvent}/resize', [CalendarEventController::class, 'resize'])->name('calendar.events.resize');
    Route::get('/calendar/events/{calendarEvent}/conflicts', [CalendarEventController::class, 'conflicts'])->name('calendar.events.conflicts');
    Route::post('/calendar/events/{calendarEvent}/participants', [CalendarParticipantController::class, 'store'])->name('calendar.events.participants.store');
    Route::delete('/calendar/events/{calendarEvent}/participants/{user}', [CalendarParticipantController::class, 'destroy'])->name('calendar.events.participants.destroy');
    Route::post('/calendar/events/{calendarEvent}/reminders', [CalendarReminderController::class, 'store'])->name('calendar.events.reminders.store');
    Route::put('/calendar/reminders/{calendarReminder}/snooze', [CalendarReminderController::class, 'snooze'])->name('calendar.reminders.snooze');
    Route::put('/calendar/reminders/{calendarReminder}/dismiss', [CalendarReminderController::class, 'dismiss'])->name('calendar.reminders.dismiss');
    });

    Route::get('/planning', [\App\Http\Controllers\PlanningController::class, 'index'])->name('planning.index');
});
