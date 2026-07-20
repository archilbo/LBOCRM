<?php

use App\Http\Controllers\ArchiveController;
use App\Http\Controllers\Admin\AdminUserController;
use App\Http\Controllers\Admin\AdminUserInvitationController;
use App\Http\Controllers\AuthorizationController;
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
use App\Http\Controllers\TaskRequestController;
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
    Route::get('/finance/settings', [FinanceSettingsController::class, 'index'])->name('finance.settings.index');
    Route::put('/finance/settings', [FinanceSettingsController::class, 'update'])->name('finance.settings.update');
    Route::put('/finance/settings/reset', [FinanceSettingsController::class, 'reset'])->name('finance.settings.reset');
    Route::post('/finance/settings/logo', [CompanyLogoController::class, 'store'])->name('finance.settings.logo.store');
    Route::delete('/finance/settings/logo', [CompanyLogoController::class, 'destroy'])->name('finance.settings.logo.destroy');
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

    Route::get('/global-search', [GlobalSearchController::class, 'index'])->name('global-search.index');

    Route::resource('clients', ClientController::class)->only([
        'index',
        'show',
        'store',
        'update',
        'destroy',
    ]);
    Route::post('/clients/scan-cin', [ClientController::class, 'scanCin'])->name('clients.scan-cin')->withoutMiddleware([\App\Http\Middleware\HandleInertiaRequests::class]);

    Route::resource('intermediaries', IntermediaryController::class)->only([
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
    Route::put('/dossiers/{dossier}/workflow-requirements', [DossierWorkflowRequirementController::class, 'update'])
        ->name('dossiers.workflow-requirements.update');

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
    Route::get('/contracts/{contract}/print', [ContractController::class, 'print'])->name('contracts.print');
    Route::get('/contracts/{contract}/download/generated', [ContractController::class, 'downloadGenerated'])->name('contracts.download.generated');
    Route::get('/contracts/{contract}/download/pdf', [ContractController::class, 'downloadPdf'])->name('contracts.download.pdf');
    Route::get('/contracts/{contract}/preview/pdf', [ContractController::class, 'previewPdf'])->name('contracts.preview.pdf');

    Route::get('/authorizations', [AuthorizationController::class, 'index'])->name('authorizations.index');
    Route::post('/authorizations', [AuthorizationController::class, 'store'])->name('authorizations.store');
    Route::put('/authorizations/{authorization}', [AuthorizationController::class, 'update'])->name('authorizations.update');
    Route::put('/authorizations/{authorization}/status', [AuthorizationController::class, 'updateStatus'])->name('authorizations.status');
    Route::delete('/authorizations/{authorization}', [AuthorizationController::class, 'destroy'])->name('authorizations.destroy');

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

    // Static routes first (before wildcard {archiveRecord})
    Route::get('/archives/reports', [ArchiveController::class, 'reports'])->name('archives.reports');
    Route::get('/archives/count', [ArchiveController::class, 'count'])->name('archives.count');
    Route::post('/archives/checkout', [ArchiveController::class, 'checkout'])->name('archives.checkout');
    Route::post('/archives/return', [ArchiveController::class, 'returnArchives'])->name('archives.return');
    Route::post('/archives/move', [ArchiveController::class, 'moveArchives'])->name('archives.move');
    Route::post('/archives/bulk/status', [ArchiveController::class, 'bulkStatus'])->name('archives.bulk.status');
    Route::post('/archives/bulk/move', [ArchiveController::class, 'bulkMove'])->name('archives.bulk.move');
    Route::get('/archives/boxes/{box}/contents', [ArchiveController::class, 'boxContents'])->name('archives.boxes.contents');
    Route::get('/archives/cities', [\App\Http\Controllers\CityController::class, 'index'])->name('archives.cities.index');
    Route::post('/archives/cities', [\App\Http\Controllers\CityController::class, 'store'])->name('archives.cities.store');
    Route::put('/archives/cities/{city}', [\App\Http\Controllers\CityController::class, 'update'])->name('archives.cities.update');
    Route::delete('/archives/cities/{city}', [\App\Http\Controllers\CityController::class, 'destroy'])->name('archives.cities.destroy');
    // Wildcard routes last
    Route::get('/archives', [ArchiveController::class, 'index'])->name('archives.index');
    Route::get('/archives/{archiveRecord}', [ArchiveController::class, 'show'])->name('archives.show');
    Route::post('/archives', [ArchiveController::class, 'store'])->name('archives.store');
    Route::put('/archives/{archiveRecord}', [ArchiveController::class, 'update'])->name('archives.update');
    Route::put('/archives/{archiveRecord}/status', [ArchiveController::class, 'updateStatus'])->name('archives.status');
    Route::put('/archives/{archiveRecord}/mark-lost', [ArchiveController::class, 'markLost'])->name('archives.mark-lost');
    Route::delete('/archives/{archiveRecord}', [ArchiveController::class, 'destroy'])->name('archives.destroy');

    Route::prefix('api')->group(function () {
        Route::get('/clients/search', [ApiClientController::class, 'search'])->name('api.clients.search');
        Route::get('/clients/{client}/projects', [ApiClientController::class, 'projects'])->name('api.clients.projects');
    });

    Route::get('/frontend-qa', function () {
        return Inertia::render('FrontendQa/Index');
    })->name('frontend-qa.index');
    Route::get('/admin/users', [AdminUserController::class, 'index'])->name('admin.users.index');
    Route::put('/admin/users/bulk/role', [AdminUserController::class, 'bulkUpdateRole'])->name('admin.users.bulk.role');
    Route::put('/admin/users/bulk/suspend', [AdminUserController::class, 'bulkSuspend'])->name('admin.users.bulk.suspend');
    Route::post('/admin/users/bulk/delete', [AdminUserController::class, 'bulkDestroy'])->name('admin.users.bulk.destroy');
    Route::put('/admin/users/{user}/role', [AdminUserController::class, 'updateRole'])->name('admin.users.role');
    Route::delete('/admin/users/{user}', [AdminUserController::class, 'destroy'])->name('admin.users.destroy');
    Route::put('/admin/users/{user}/permissions', [AdminUserController::class, 'updatePermissions'])->name('admin.users.permissions');
    Route::post('/admin/users/invite', [AdminUserInvitationController::class, 'store'])->name('admin.users.invite');
    Route::post('/admin/users/invite/bulk/validate', [AdminUserInvitationController::class, 'bulkValidate'])->name('admin.users.invite.bulk.validate');
    Route::post('/admin/users/invite/bulk', [AdminUserInvitationController::class, 'bulkStore'])->name('admin.users.invite.bulk');
    Route::get('/admin/users/audit-logs', [AdminUserController::class, 'auditLogs'])->name('admin.users.audit-logs');


    Route::get('/backend-qa', [BackendQaController::class, 'index'])->name('backend-qa.index');

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

    Route::get('/task-requests', [TaskRequestController::class, 'index'])->name('task-requests.index');
    Route::post('/task-requests', [TaskRequestController::class, 'store'])->name('task-requests.store');
    Route::put('/task-requests/{taskRequest}', [TaskRequestController::class, 'update'])->name('task-requests.update');
    Route::post('/task-requests/{taskRequest}/accept', [TaskRequestController::class, 'accept'])->name('task-requests.accept');
    Route::post('/task-requests/{taskRequest}/reject', [TaskRequestController::class, 'reject'])->name('task-requests.reject');
    Route::post('/task-requests/{taskRequest}/convert', [TaskRequestController::class, 'convert'])->name('task-requests.convert');

    Route::get('/inbox', [\App\Http\Controllers\ConversationController::class, 'index'])->name('inbox.index');
    Route::post('/inbox', [\App\Http\Controllers\ConversationController::class, 'store'])->name('inbox.store');
    Route::get('/inbox/archived', [\App\Http\Controllers\ConversationController::class, 'archived'])->name('inbox.archived');
    Route::get('/inbox/{conversation}', [\App\Http\Controllers\ConversationController::class, 'show'])->name('inbox.show');
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

    Route::get('/planning', [\App\Http\Controllers\PlanningController::class, 'index'])->name('planning.index');
});
