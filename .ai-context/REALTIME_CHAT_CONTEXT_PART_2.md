orizationController::class, 'store'])->name('authorizations.store');
    Route::put('/authorizations/{authorization}', [AuthorizationController::class, 'update'])->name('authorizations.update');
    Route::put('/authorizations/{authorization}/status', [AuthorizationController::class, 'updateStatus'])->name('authorizations.status');
    Route::delete('/authorizations/{authorization}', [AuthorizationController::class, 'destroy'])->name('authorizations.destroy');

    Route::get('/finance', [FinanceDocumentController::class, 'index'])->name('finance.index');
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

    Route::get('/finance/templates', [DocumentTemplateController::class, 'index'])->name('finance.templates.index');
    Route::get('/finance/templates/{documentTemplate}/versions', [DocumentTemplateVersionController::class, 'index'])->name('finance.templates.versions.index');
    Route::post('/finance/templates/{documentTemplate}/versions', [DocumentTemplateVersionController::class, 'store'])->name('finance.templates.versions.store');
    Route::put('/finance/templates/{documentTemplate}/versions/{version}/restore', [DocumentTemplateVersionController::class, 'restore'])->name('finance.templates.versions.restore');
    Route::delete('/finance/templates/{documentTemplate}/versions/{version}', [DocumentTemplateVersionController::class, 'destroy'])->name('finance.templates.versions.destroy');
    Route::post('/finance/templates', [DocumentTemplateController::class, 'store'])->name('finance.templates.store');
    Route::put('/finance/templates/reset/{type}', [DocumentTemplateController::class, 'resetDefault'])->name('finance.templates.reset');
    Route::get('/finance/templates/{documentTemplate}', [DocumentTemplateController::class, 'show'])->name('finance.templates.show');
    Route::put('/finance/templates/{documentTemplate}', [DocumentTemplateController::class, 'update'])->name('finance.templates.update');
    Route::delete('/finance/templates/{documentTemplate}', [DocumentTemplateController::class, 'destroy'])->name('finance.templates.destroy');
    Route::post('/finance/templates/{documentTemplate}/duplicate', [DocumentTemplateController::class, 'duplicate'])->name('finance.templates.duplicate');
    Route::put('/finance/templates/{documentTemplate}/default', [DocumentTemplateController::class, 'setDefault'])->name('finance.templates.default');
    Route::get('/finance/templates/{documentTemplate}/preview', [DocumentTemplateController::class, 'preview'])->name('finance.templates.preview');

    Route::get('/finance/documents', [FinanceDocumentController::class, 'index'])->name('finance.documents.index');
    Route::post('/finance/documents', [FinanceDocumentController::class, 'store'])->name('finance.documents.store');
    Route::get('/finance/documents/{financeDocument}', [FinanceDocumentController::class, 'show'])->name('finance.documents.show');
    Route::put('/finance/documents/{financeDocument}', [FinanceDocumentController::class, 'update'])->name('finance.documents.update');
    Route::delete('/finance/documents/{financeDocument}', [FinanceDocumentController::class, 'destroy'])->name('finance.documents.destroy');
    Route::put('/finance/documents/{financeDocument}/generate', [FinanceDocumentController::class, 'generate'])->name('finance.documents.generate');
    Route::put('/finance/documents/{financeDocument}/generate-pdf', [FinanceDocumentController::class, 'generatePdf'])->name('finance.documents.generate-pdf');
    Route::put('/finance/documents/{financeDocument}/generate-excel', [FinanceDocumentController::class, 'generateExcel'])->name('finance.documents.generate-excel');
    Route::get('/finance/documents/{financeDocument}/download', [FinanceDocumentController::class, 'download'])->name('finance.documents.download');
    Route::get('/finance/documents/{financeDocument}/download-excel', [FinanceDocumentController::class, 'downloadExcel'])->name('finance.documents.download-excel');
    Route::get('/finance/documents/{financeDocument}/download-pdf', [FinanceDocumentController::class, 'downloadPdf'])->name('finance.documents.download-pdf');
    Route::post('/finance/documents/{financeDocument}/reveal-generated-files', [FinanceDocumentController::class, 'revealGeneratedFiles'])->name('finance.documents.reveal-generated-files');
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
    Route::post('/admin/users/invite', [AdminUserInvitationController::class, 'store'])->name('admin.users.invite');


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

```

# FILE: resources/js/app.tsx

```tsx
import '@fontsource-variable/geist/wght.css';
import '@fontsource-variable/geist-mono/wght.css';
import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import { AppToastProvider } from '@/providers/AppToastProvider';
import { AppFlashToasts } from '@/components/layout/AppFlashToasts';
import { ThemeProvider } from '@/providers/ThemeProvider';

createInertiaApp({
    title: (title) => title ? `${title} - ARCHI LBO OS` : 'ARCHI LBO OS',
    resolve: (name) => {
        const pages = import.meta.glob('./pages/**/*.tsx', { eager: true });
        const page = pages[`./pages/${name}.tsx`];

        if (!page) {
            throw new Error(`Page not found: ${name}`);
        }

        return page;
    },
    setup({ el, App, props }) {
        createRoot(el).render(
            <ThemeProvider>
                <AppFlashToasts />
                                <AppToastProvider />
                <App {...props} />
            </ThemeProvider>,
        );
    },
    progress: {
        color: '#2563eb',
    },
});


```

# FILE: resources/js/components/layout/AppTopbar.tsx

```tsx
import { router } from '@inertiajs/react';
import { CalendarDays, LogOut, Plus } from 'lucide-react';
import { MessagePopover } from '@/features/inbox/components/MessagePopover';
import { NotificationPopover } from '@/features/notifications/components/NotificationPopover';
import { AppGlobalSearch } from '@/components/layout/AppGlobalSearch';
import { ThemeToggle } from '@/components/layout/ThemeToggle';

export function AppTopbar() {
    function handleLogout() {
        router.post('/logout');
    }

    return (
        <header className="crm-topbar sticky top-0 z-40">
            <div className="flex h-full items-center gap-3 px-4 lg:px-6">
                <div className="min-w-0 flex-1">
                    <div className="max-w-[620px]">
                        <AppGlobalSearch />
                    </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                    <button
                        type="button"
                        onClick={() => router.visit('/dossiers')}
                        className="crm-action-button-primary crm-action-button hidden sm:inline-flex"
                  