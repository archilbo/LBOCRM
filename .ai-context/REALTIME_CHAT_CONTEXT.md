# ARCHI LBO OS Realtime Chat Context
Generated: 07/01/2026 15:56:06

# Git Status

```text
 M PROMPT.ps1
 M app/Console/Commands/TaskChatQaCommand.php
 M app/Http/Controllers/ContractController.php
 M app/Http/Controllers/ConversationController.php
 M app/Http/Controllers/DocumentController.php
 M app/Http/Controllers/Finance/FinanceDocumentController.php
 M app/Http/Controllers/Finance/PaymentController.php
 M app/Http/Controllers/MessageController.php
 M app/Http/Controllers/TaskController.php
 M app/Http/Middleware/HandleInertiaRequests.php
 M app/Http/Requests/Chat/StoreConversationRequest.php
 M app/Http/Requests/Chat/StoreMessageRequest.php
 M app/Http/Resources/ConversationParticipantResource.php
 M app/Http/Resources/ConversationResource.php
 M app/Http/Resources/MessageResource.php
 M app/Http/Resources/NotificationResource.php
 M app/Http/Resources/TaskResource.php
 M app/Http/Resources/UserResource.php
 M app/Models/Conversation.php
 M app/Models/ConversationParticipant.php
 M app/Models/Message.php
 M app/Models/MessageAttachment.php
 M app/Models/User.php
 M app/Services/Chat/ChatService.php
 M bootstrap/app.php
 M database/seeders/DatabaseSeeder.php
 M database/seeders/TaskDemoSeeder.php
 M docs/AI_WORK_REPORT.md
 D exit
 M resources/css/archilbo-theme.css
 M resources/js/components/layout/AppShell.tsx
 M resources/js/components/layout/AppSidebar.tsx
 M resources/js/components/layout/AppTopbar.tsx
 M resources/js/features/chat/types.ts
 M resources/js/features/inbox/components/ConversationList.tsx
 M resources/js/features/inbox/components/MessageThread.tsx
 M resources/js/features/inbox/components/NewConversationDrawer.tsx
 M resources/js/features/notifications/types.ts
 M resources/js/features/planning/components/PlanningBoard.tsx
 M resources/js/features/planning/components/PlanningFocusPanel.tsx
 M resources/js/features/tasks/components/TaskBoard.tsx
 M resources/js/features/tasks/components/TaskDetailDrawer.tsx
 D resources/js/features/tasks/components/TaskList.tsx
 M resources/js/features/tasks/components/TaskOverview.tsx
 M resources/js/features/tasks/components/TaskTable.tsx
 M resources/js/features/tasks/types.ts
 M resources/js/pages/Calendar/Index.tsx
 M resources/js/pages/Inbox/Index.tsx
 M resources/js/pages/Notifications/Index.tsx
 M resources/js/pages/Operations/Reports.tsx
 M resources/js/pages/Planning/Index.tsx
 M resources/js/pages/Tasks/Index.tsx
 M routes/web.php
?? .ai-context/
?? app/Http/Controllers/PlanningController.php
?? app/Http/Middleware/UpdateLastSeen.php
?? app/Http/Resources/MessageAttachmentResource.php
?? app/Notifications/ContractNotification.php
?? app/Notifications/DocumentNotification.php
?? app/Notifications/FinanceDocumentNotification.php
?? config/archilbo_chat.php
?? database/migrations/2026_07_01_100000_enhance_chat_system.php
?? database/migrations/2026_07_01_100001_add_archived_at_to_participants.php
?? database/migrations/2026_07_01_110000_add_category_to_conversations.php
?? database/migrations/2026_07_01_142702_add_forwarded_from_to_messages.php
?? database/migrations/2026_07_01_145154_add_typing_at_to_conversation_participants.php
?? database/seeders/ChatDemoSeeder.php
?? database/seeders/DemoDataSeeder.php
?? resources/js/features/chat/helpers.ts
?? resources/js/features/inbox/components/ConversationInfoPanel.tsx
?? resources/js/features/inbox/components/MessagePopover.tsx
?? resources/js/features/inbox/components/useTyping.ts
?? resources/js/features/inbox/utils.ts
?? resources/js/features/notifications/components/
?? resources/js/features/notifications/helpers.ts

```

# Inbox/Broadcast Routes

```text

  GET|HEAD        inbox .......................... inbox.index › ConversationController@index
  POST            inbox .......................... inbox.store › ConversationController@store
  GET|HEAD        inbox/archived ........... inbox.archived › ConversationController@archived
  GET|HEAD        inbox/{conversation} ............. inbox.show › ConversationController@show
  PUT             inbox/{conversation} ......... inbox.update › ConversationController@update
  POST            inbox/{conversation}/archive inbox.archive › ConversationController@archive
  POST            inbox/{conversation}/messages inbox.messages.store › MessageController@sto…
  PUT             inbox/{conversation}/messages/{message} inbox.messages.update › MessageCon…
  DELETE          inbox/{conversation}/messages/{message} inbox.messages.destroy › MessageCo…
  POST            inbox/{conversation}/messages/{message}/forward inbox.messages.forward › M…
  POST            inbox/{conversation}/participants inbox.participants.add › ConversationCon…
  DELETE          inbox/{conversation}/participants/{user} inbox.participants.remove › Conve…
  POST            inbox/{conversation}/typing ....... inbox.typing › MessageController@typing
  GET|HEAD        inbox/{conversation}/typing inbox.typing.users › MessageController@typingU…
  POST            inbox/{conversation}/unarchive inbox.unarchive › ConversationController@un…



```

# Composer Realtime Packages

```text

```

# NPM Realtime Packages

```text
LBOCRM@ D:\ARCHI LBO\LBOSM\LBOCRM
└── (empty)


```

# Broadcast Config Files Found

```text
ERROR: Le terme « .Name » n'est pas reconnu comme nom d'applet de commande, fonction, fichier de script ou programme exécutable. Vérifiez l'orthographe du nom, ou si un chemin d'accès existe, vérifiez que le chemin d'accès est correct et réessayez.
```

# Realtime Text Search

```text
ERROR: Le terme « .FullName » n'est pas reconnu comme nom d'applet de commande, fonction, fichier de script ou programme exécutable. Vérifiez l'orthographe du nom, ou si un chemin d'accès existe, vérifiez que le chemin d'accès est correct et réessayez.
```

# FILE: composer.json

```json
{
    "$schema": "https://getcomposer.org/schema.json",
    "name": "laravel/laravel",
    "type": "project",
    "description": "The skeleton application for the Laravel framework.",
    "keywords": ["laravel", "framework"],
    "license": "MIT",
    "require": {
        "php": "^8.3",
        "barryvdh/laravel-dompdf": "^3.1",
        "inertiajs/inertia-laravel": "^3.1",
        "laravel/framework": "^13.8",
        "laravel/tinker": "^3.0",
        "phpoffice/phpspreadsheet": "^5.8",
        "phpoffice/phpword": "^1.1",
        "spatie/laravel-permission": "^8.0",
        "tightenco/ziggy": "^2.6"
    },
    "require-dev": {
        "fakerphp/faker": "^1.23",
        "laravel/pail": "^1.2.5",
        "laravel/pao": "^1.0.6",
        "laravel/pint": "^1.27",
        "mockery/mockery": "^1.6",
        "nunomaduro/collision": "^8.6",
        "phpunit/phpunit": "^12.5.12"
    },
    "autoload": {
        "psr-4": {
            "App\\": "app/",
            "Database\\Factories\\": "database/factories/",
            "Database\\Seeders\\": "database/seeders/"
        }
    },
    "autoload-dev": {
        "psr-4": {
            "Tests\\": "tests/"
        }
    },
    "scripts": {
        "setup": [
            "composer install",
            "@php -r \"file_exists('.env') || copy('.env.example', '.env');\"",
            "@php artisan key:generate",
            "@php artisan migrate --force",
            "npm install --ignore-scripts",
            "npm run build"
        ],
        "dev": [
            "Composer\\Config::disableProcessTimeout",
            "npx concurrently -c \"#93c5fd,#c4b5fd,#fb7185,#fdba74\" \"php artisan serve\" \"php artisan queue:listen --tries=1 --timeout=0\" \"php artisan pail --timeout=0\" \"npm run dev\" --names=server,queue,logs,vite --kill-others"
        ],
        "test": [
            "@php artisan config:clear --ansi @no_additional_args",
            "@php artisan test"
        ],
        "post-autoload-dump": [
            "Illuminate\\Foundation\\ComposerScripts::postAutoloadDump",
            "@php artisan package:discover --ansi"
        ],
        "post-update-cmd": [
            "@php artisan vendor:publish --tag=laravel-assets --ansi --force"
        ],
        "post-root-package-install": [
            "@php -r \"file_exists('.env') || copy('.env.example', '.env');\""
        ],
        "post-create-project-cmd": [
            "@php artisan key:generate --ansi",
            "@php -r \"file_exists('database/database.sqlite') || touch('database/database.sqlite');\"",
            "@php artisan migrate --graceful --ansi"
        ],
        "pre-package-uninstall": [
            "Illuminate\\Foundation\\ComposerScripts::prePackageUninstall"
        ]
    },
    "extra": {
        "laravel": {
            "dont-discover": []
        }
    },
    "config": {
        "optimize-autoloader": true,
        "preferred-install": "dist",
        "sort-packages": true,
        "allow-plugins": {
            "pestphp/pest-plugin": true,
            "php-http/discovery": true
        }
    },
    "minimum-stability": "stable",
    "prefer-stable": true
}

```

# FILE: package.json

```json
{
    "$schema": "https://www.schemastore.org/package.json",
    "private": true,
    "type": "module",
    "scripts": {
        "build": "vite build",
        "dev": "vite"
    },
    "devDependencies": {
        "@tailwindcss/vite": "^4.0.0",
        "@types/react": "^19.2.17",
        "concurrently": "^9.0.1",
        "laravel-vite-plugin": "^3.1",
        "tailwindcss": "^4.0.0",
        "typescript": "^6.0.3",
        "vite": "^8.0.0"
    },
    "dependencies": {
        "@codemirror/autocomplete": "^6.20.3",
        "@codemirror/commands": "^6.10.4",
        "@codemirror/lang-css": "^6.3.1",
        "@codemirror/lang-html": "^6.4.11",
        "@codemirror/theme-one-dark": "^6.1.3",
        "@codemirror/view": "^6.43.4",
        "@fontsource-variable/geist": "^5.2.9",
        "@fontsource-variable/geist-mono": "^5.2.8",
        "@fullcalendar/daygrid": "^6.1.21",
        "@fullcalendar/interaction": "^6.1.21",
        "@fullcalendar/react": "^6.1.21",
        "@fullcalendar/timegrid": "^6.1.21",
        "@hookform/resolvers": "^5.4.0",
        "@inertiajs/react": "^3.4.0",
        "@tanstack/react-table": "^8.21.3",
        "@uiw/react-codemirror": "^4.25.10",
        "@vitejs/plugin-react": "^6.0.2",
        "class-variance-authority": "^0.7.1",
        "clsx": "^2.1.1",
        "lucide-react": "^1.21.0",
        "react": "^19.2.7",
        "react-aria-components": "^1.19.0",
        "react-dom": "^19.2.7",
        "react-hook-form": "^7.80.0",
        "sonner": "^2.0.7",
        "tailwind-merge": "^3.6.0",
        "tailwindcss-react-aria-components": "^2.2.0",
        "zod": "^4.4.3"
    }
}

```

# FILE: vite.config.ts

```ts
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import { bunny } from 'laravel-vite-plugin/fonts';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            refresh: true,
            fonts: [
                bunny('Instrument Sans', {
                    weights: [400, 500, 600],
                }),
            ],
        }),
        react(),
        tailwindcss(),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './resources/js'),
        },
    },
    server: {
        watch: {
            ignored: ['**/storage/framework/views/**'],
        },
    },
});

```

# FILE: bootstrap/app.php

```php
<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\UpdateLastSeen;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            HandleInertiaRequests::class,
            UpdateLastSeen::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*'),
        );
    })->create();



```

# FILE: routes/web.php

```php
<?php

use App\Http\Controllers\ArchiveController;
use App\Http\Controllers\Admin\AdminUserController;
use App\Http\Controllers\Admin\AdminUserInvitationController;
use App\Http\Controllers\AuthorizationController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
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
use App\Http\Controllers\FinanceController;
use App\Http\Controllers\Finance\DocumentTemplateController;
use App\Http\Controllers\Finance\DocumentTemplateVersionController;
use App\Http\Controllers\Finance\FinanceDocumentController;
use App\Http\Controllers\Finance\FinanceSettingsController;
use App\Http\Controllers\Finance\CompanyLogoController;
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

    Route::resource('intermediaries', IntermediaryController::class)->only([
        'index',
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
    Route::get('/contracts/{contract}/download/generated', [ContractController::class, 'downloadGenerated'])->name('contracts.download.generated');
    Route::get('/contracts/{contract}/download/pdf', [ContractController::class, 'downloadPdf'])->name('contracts.download.pdf');

    Route::get('/authorizations', [AuthorizationController::class, 'index'])->name('authorizations.index');
    Route::post('/authorizations', [AuthorizationController::class, 'store'])->name('authorizations.store');
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
                    >
                        <Plus size={15} />
                        New
                    </button>

                    <button
                        type="button"
                        onClick={() => router.visit('/finance/documents?tab=monthly')}
                        className="crm-action-button hidden md:inline-flex"
                        title="Monthly summary"
                    >
                        <CalendarDays size={15} />
                    </button>

                    <MessagePopover />

                    <NotificationPopover />

                    <ThemeToggle />

                    <button
                        type="button"
                        onClick={handleLogout}
                        className="crm-action-button h-9 w-9 px-0"
                        aria-label="Logout"
                        title="Logout"
                    >
                        <LogOut size={15} />
                    </button>
                </div>
            </div>
        </header>
    );
}

```

# FILE: resources/js/pages/Inbox/Index.tsx

```tsx
import { Head, router, usePage } from '@inertiajs/react';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { AppShell } from '@/components/layout/AppShell';
import type { FormErrors } from '@/lib/formErrors';
import type { ChatUserOption, ConversationRow, MessageRow } from '@/features/chat/types';
import { conversationInitial, conversationName, messagePreview } from '@/features/chat/helpers';
import { ConversationList } from '@/features/inbox/components/ConversationList';
import { MessageThread } from '@/features/inbox/components/MessageThread';
import { NewConversationDrawer, type NewConvFormData } from '@/features/inbox/components/NewConversationDrawer';
import { ConversationInfoPanel } from '@/features/inbox/components/ConversationInfoPanel';

type PageProps = {
    conversations: ConversationRow[];
    users: ChatUserOption[];
    currentUserId?: number;
    unreadCount: number;
    archivedCount?: number;
};

function playMessageSound() {
    try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.value = 660;
        gain.gain.value = 0.1;
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.25);
    } catch { /* silent */ }
}

function getQueryParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        conversation: params.get('conversation'),
        message: params.get('message'),
    };
}

export default function InboxIndex({ conversations: _conversations, users, currentUserId: pageCurrentUserId, unreadCount: _unreadCount }: PageProps) {
    const authUser = (usePage().props.auth?.user as { id: number; name: string } | undefined) || { id: 0, name: '' };
    const currentUserId = pageCurrentUserId || authUser.id;

    const [conversations, setConversations] = useState<ConversationRow[]>(_conversations);
    const [archivedConversations, setArchivedConversations] = useState<ConversationRow[]>([]);
    const [selectedConv, setSelectedConv] = useState<ConversationRow | null>(null);
    const [messages, setMessages] = useState<MessageRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingOlder, setLoadingOlder] = useState(false);
    const [paginator, setPaginator] = useState<{ currentPage: number; lastPage: number; perPage: number; total: number } | null>(null);
    const [newConvOpen, setNewConvOpen] = useState(false);
    const [newConvForm, setNewConvForm] = useState<NewConvFormData>({ type: 'direct', user_ids: [], subject: '', category: 'general', custom_category: '' });
    const [formErrors, setFormErrors] = useState<FormErrors>({});
    const [search, setSearch] = useState('');
    const [convTab, setConvTab] = useState<'active' | 'archived' | 'unread' | 'direct' | 'groups'>('active');
    const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');
    const [highlightMsgId, setHighlightMsgId] = useState<number | null>(null);
    const [newMsgAvailable, setNewMsgAvailable] = useState(false);

    const pollListRef = useRef<ReturnType<typeof setInterval>>();
    const pollConvRef = useRef<ReturnType<typeof setInterval>>();
    const prevLastMsgIds = useRef<Record<number, number | null>>({});
    const selectedConvRef = useRef<ConversationRow | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const nearBottomRef = useRef(true);
    const autoOpenDone = useRef(false);

    selectedConvRef.current = selectedConv;

    // Helper to check if user is near bottom
    const isNearBottom = useCallback(() => {
        return nearBottomRef.current;
    }, []);

    // Track scroll position for "new message" button
    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
        const el = e.currentTarget;
        nearBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 150;
        if (nearBottomRef.current) setNewMsgAvailable(false);
    }, []);

    const filteredConvs = useMemo(() => {
        let items = convTab === 'archived' ? archivedConversations : conversations;
        if (search.trim()) {
            const q = search.toLowerCase();
            items = items.filter((c) =>
                conversationName(c, currentUserId).toLowerCase().includes(q) ||
                (c.subject || '').toLowerCase().includes(q) ||
                (c.lastMessage?.body || '').toLowerCase().includes(q) ||
                (Array.isArray(c.participants) ? c.participants : []).some((p) =>
                    p?.user?.name?.toLowerCase().includes(q) || p?.user?.email?.toLowerCase().includes(q)
                )
            );
        }
        if (convTab === 'unread') items = items.filter((c) => c.unreadCount > 0);
        if (convTab === 'direct') items = items.filter((c) => c.type === 'direct');
        if (convTab === 'groups') items = items.filter((c) => c.type === 'group');
        return items;
    }, [archivedConversations, conversations, convTab, currentUserId, search]);

    // Auto-open conversation from URL params on mount
    useEffect(() => {
        if (autoOpenDone.current || _conversations.length === 0) return;
        const { conversation } = getQueryParams();
        if (conversation) {
            const conv = _conversations.find((c) => String(c.id) === conversation);
            if (conv) {
                openConversation(conv);
                autoOpenDone.current = true;
            }
        }
    }, [_conversations]);

    // Scroll to and highlight message after messages load
    useEffect(() => {
        if (!highlightMsgId || messages.length === 0) return;
        const el = document.getElementById(`msg-${highlightMsgId}`);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.classList.add('ring-2', 'ring-[var(--crm-gold)]/50', 'rounded-lg');
            setTimeout(() => {
                el.classList.remove('ring-2', 'ring-[var(--crm-gold)]/50', 'rounded-lg');
                setHighlightMsgId(null);
            }, 2000);
        }
    }, [messages, highlightMsgId]);

    // Read query params for message highlight after opening
    useEffect(() => {
        if (!selectedConv) return;
        const { message } = getQueryParams();
        if (message && !autoOpenDone.current) {
            setHighlightMsgId(Number(message));
            autoOpenDone.current = true;
        }
    }, [selectedConv]);

    // Update URL when conversation changes
    useEffect(() => {
        if (selectedConv) {
            const params = new URLSearchParams();
            params.set('conversation', String(selectedConv.id));
            const msgId = highlightMsgId || selectedConv.lastMessage?.id;
            if (msgId) params.set('message', String(msgId));
            window.history.replaceState(null, '', `/inbox?${params.toString()}`);
        }
    }, [selectedConv?.id]);

    useEffect(() => {
        if (convTab !== 'archived') return;

        fetch('/inbox/archived')
            .then((response) => response.json())
            .then((data) => setArchivedConversations(data.conversations || []))
            .catch(() => toast.error('Failed to load archived conversations'));
    }, [convTab]);

    useEffect(() => {
        setConversations(_conversations);

        const currentIds: Record<number, number | null> = {};
        for (const c of _conversations) {
            currentIds[c.id] = c.lastMessage?.id ?? null;
        }

        if (Object.keys(prevLastMsgIds.current).length > 0) {
            for (const c of _conversations) {
                const prevId = prevLastMsgIds.current[c.id];
                const currId = c.lastMessage?.id ?? null;
                if (prevId !== undefined && prevId !== null && currId !== null && currId !== prevId) {
                    if (c.id !== selectedConvRef.current?.id) {
                        toast(conversationName(c, currentUserId), { description: messagePreview(c.lastMessage) || 'New message' });
                        playMessageSound();
                    }
                }
            }
        }

        prevLastMsgIds.current = currentIds;
    }, [_conversations, currentUserId]);

    useEffect(() => {
        if (selectedConv) {
            const updated = conversations.find((c) => c.id === selectedConv.id);
            if (updated) setSelectedConv(updated);
        }
    }, [conversations, selectedConv?.id]);

    // Poll conversations list every 15s
    useEffect(() => {
        pollListRef.current = setInterval(() => {
            router.reload({ only: ['conversations', 'unreadCount'], preserveState: true, preserveScroll: true });
        }, 15000);
        return () => clearInterval(pollListRef.current);
    }, []);

    // Poll selected conversation messages every 8s
    useEffect(() => {
        if (!selectedConv || loading) return;
        pollConvRef.current = setInterval(() => {
            fetch(`/inbox/${selectedConv.id}?page=1`)
                .then((r) => r.json())
                .then((data) => {
                    const newMessages: MessageRow[] = (data.messages || []).reverse();
                    setMessages((prev) => {
                        const prevIds = new Set(prev.map((m) => m.id));
                        const added = newMessages.filter((m) => !prevIds.has(m.id));
                        if (added.length === 0) return prev;
                        if (isNearBottom()) {
                            return [...prev, ...added];
                        } else {
                            setNewMsgAvailable(true);
                            return prev;
                        }
                    });
                    setPaginator(data.paginator || null);
                })
                .catch(() => {});
        }, 8000);
        return () => clearInterval(pollConvRef.current);
    }, [selectedConv?.id]);

    // Reset new message available when user scrolls to bottom
    useEffect(() => {
        if (nearBottomRef.current) setNewMsgAvailable(false);
    }, [messages]);

    function openConversation(conv: ConversationRow) {
        setSelectedConv(conv);
        setMobileView('chat');
        setLoading(true);
        setPaginator(null);
        setNewMsgAvailable(false);
        fetch(`/inbox/${conv.id}?page=1`)
            .then((r) => r.json())
            .then((data) => {
                setMessages((data.messages || []).reverse());
                setPaginator(data.paginator || null);
                setConversations((prev) => prev.map((c) =>
                    c.id === conv.id ? { ...c, unreadCount: 0 } : c
                ));
            })
            .catch(() => toast.error('Failed to load messages'))
            .finally(() => setLoading(false));
    }

    function loadOlderMessages() {
        if (!selectedConv || loadingOlder || (paginator && paginator.currentPage >= paginator.lastPage)) return;
        setLoadingOlder(true);
        const nextPage = (paginator?.currentPage || 1) + 1;
        fetch(`/inbox/${selectedConv.id}?page=${nextPage}`)
            .then((r) => r.json())
            .then((data) => {
                setMessages((prev) => [...(data.messages || []).reverse(), ...prev]);
                setPaginator(data.paginator || null);
            })
            .catch(() => toast.error('Failed to load older messages'))
            .finally(() => setLoadingOlder(false));
    }

    function goToConversationList() {
        setMobileView('list');
        setSelectedConv(null);
        setMessages([]);
        setPaginator(null);
        window.history.replaceState(null, '', '/inbox');
    }

    function toggleArchive(conv: ConversationRow) {
        const nextArchived = !conv.archivedAt;
        const url = `/inbox/${conv.id}/${nextArchived ? 'archive' : 'unarchive'}`;

        fetch(url, {
            method: 'POST',
            headers: { 'X-CSRF-TOKEN': (window as any).csrfToken || '' },
        })
            .then((response) => {
                if (!response.ok) throw new Error('Archive failed');
                const updated = { ...conv, archivedAt: nextArchived ? new Date().toISOString() : null };

                if (nextArchived) {
                    setConversations((prev) => prev.filter((item) => item.id !== conv.id));
                    setArchivedConversations((prev) => [updated, ...prev.filter((item) => item.id !== conv.id)]);
                    if (selectedConv?.id === conv.id) {
                        setSelectedConv(null);
                        setMessages([]);
                        setMobileView('list');
                    }
                    toast.success('Conversation archived.');
                } else {
                    setArchivedConversations((prev) => prev.filter((item) => item.id !== conv.id));
                    setConversations((prev) => [updated, ...prev.filter((item) => item.id !== conv.id)]);
                    toast.success('Conversation restored.');
                }
            })
            .catch(() => toast.error('Archive action failed.'));
    }

    let tempIdCounter = useRef(0);

    function sendMessage(body: string, images: File[], replyToId?: number) {
        if (!selectedConv || (!body.trim() && images.length === 0)) return;

        // Optimistic message
        const tempId = -(Date.now() + (tempIdCounter.current++));
        const optimisticMsg: MessageRow = {
            id: tempId,
            body: body.trim() || null,
            isEdited: false,
            isForwarded: false,
            forwardedFromMessageId: null,
            forwardedFrom: null,
            userId: currentUserId,
            userName: authUser.name,
            readBy: [],
            replyTo: null,
            attachments: [],
            attachmentsCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, optimisticMsg]);
        nearBottomRef.current = true;
        setNewMsgAvailable(false);

        // Scroll to bottom after optimistic add
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);

        const hasImages = images.length > 0;
        let promise: Promise<Response>;

        if (hasImages) {
            const formData = new FormData();
            if (body.trim()) formData.append('body', body);
            for (const img of images) formData.append('images[]', img);
            if (replyToId) formData.append('reply_to_message_id', String(replyToId));

            promise = fetch(`/inbox/${selectedConv.id}/messages`, {
                method: 'POST',
                headers: { 'X-CSRF-TOKEN': (window as any).csrfToken || '' },
                body: formData,
            });
        } else {
            promise = fetch(`/inbox/${selectedConv.id}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': (window as any).csrfToken || '' },
                body: JSON.stringify({
                    body: body.trim(),
                    ...(replyToId ? { reply_to_message_id: replyToId } : {}),
                }),
            });
        }

        return promise
            .then((r) => r.json())
            .then((msg: MessageRow) => {
                setMessages((prev) => prev.map((item) => item.id === tempId ? msg : item));
                setConversations((prev) => prev.map((c) =>
                    c.id === selectedConv!.id
                        ? { ...c, lastMessage: msg, lastMessageAt: msg.createdAt }
                        : c
                ));
                return msg;
            })
            .catch(() => {
                setMessages((prev) => prev.map((item) => item.id === tempId ? { ...item, isFailed: true as any } : item));
                toast.error('Failed to send message');
                throw new Error('Send failed');
            });
    }

    function handleNewConv(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setFormErrors({});
        const isGroup = newConvForm.type === 'group';
        router.post('/inbox', {
            user_ids: newConvForm.user_ids,
            type: newConvForm.type,
            subject: newConvForm.subject || null,
            ...(isGroup ? {
                category: newConvForm.category === 'custom' ? newConvForm.custom_category || 'custom' : newConvForm.category,
                ...(newConvForm.category === 'custom' ? { custom_category: newConvForm.custom_category } : {}),
            } : {}),
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setNewConvOpen(false);
                setNewConvForm({ type: 'direct', user_ids: [], subject: '', category: 'general', custom_category: '' });
                toast.success('Conversation created.');
            },
            onError: (err) => setFormErrors(err),
        });
    }

    function scrollToBottom() {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        setNewMsgAvailable(false);
    }

    return (
        <>
            <Head title="Messages" />
            <AppShell fullBleed>
                <div className="flex h-full w-full overflow-hidden">
                    {/* Conversation sidebar */}
                    <div className={`${mobileView === 'chat' ? 'hidden' : 'flex'} w-full flex-col border-r border-[var(--crm-border)] bg-[var(--crm-elevated)] md:flex md:w-[360px] lg:w-[380px]`}>
                        <ConversationList
                            conversations={filteredConvs}
                            selectedConvId={selectedConv?.id ?? null}
                            search={search}
                            onSearchChange={setSearch}
                            onSelect={openConversation}
                            activeTab={convTab}
                            onTabChange={setConvTab}
                            onArchiveToggle={toggleArchive}
                            currentUserId={currentUserId}
                            onNewConversation={() => { setFormErrors({}); setNewConvOpen(true); }}
                        />
                    </div>

                    {/* Chat area */}
                    <div className={`${mobileView === 'list' ? 'hidden' : 'flex'} flex-1 flex-col min-w-0 md:flex`}>
                        {selectedConv ? (
                            <>
                                <div className="flex items-center gap-3 border-b border-[var(--crm-border)] bg-[var(--crm-surface)] px-4 py-3 md:hidden">
                                    <button type="button" onClick={goToConversationList}
                                        className="flex size-8 items-center justify-center rounded-lg text-[var(--crm-text-muted)] hover:text-[var(--crm-text)]">
                                        <ArrowLeft size={18} />
                                    </button>
                                    <div className="flex size-8 items-center justify-center rounded-full bg-[var(--crm-gold-soft)] text-xs font-bold text-[var(--crm-gold)]">
                                        {conversationInitial(selectedConv, currentUserId)}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold text-[var(--crm-text)]">{conversationName(selectedConv, currentUserId)}</p>
                                    </div>
                                </div>
                                <div className="relative flex-1 flex flex-col min-h-0">
                                    <MessageThread
                                        conversation={selectedConv}
                                        conversations={conversations}
                                        messages={messages}
                                        loading={loading}
                                        loadingOlder={loadingOlder}
                                        paginator={paginator}
                                        currentUserId={currentUserId}
                                        onSend={sendMessage}
                                        onLoadOlder={loadOlderMessages}
                                        onMessageUpdate={(message) => setMessages((prev) => prev.map((item) => item.id === message.id ? message : item))}
                                        onMessageDelete={(messageId) => setMessages((prev) => prev.filter((item) => item.id !== messageId))}
                                        onScroll={handleScroll}
                                    />
                                    {/* New messages floating button */}
                                    {newMsgAvailable ? (
                                        <button type="button" onClick={scrollToBottom}
                                            className="absolute bottom-20 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full border border-[var(--crm-border)] bg-[var(--crm-elevated)] px-4 py-2 text-[11px] font-semibold text-[var(--crm-gold)] shadow-xl transition hover:brightness-110 animate-in fade-in slide-in-from-bottom-2">
                                            <MessageSquare size={12} />
                                            New messages
                                            <ArrowLeft size={12} className="rotate-90" />
                                        </button>
                                    ) : null}
                                </div>
                            </>
                        ) : (
                            <div className="hidden flex-1 items-center justify-center md:flex">
                                <div className="text-center">
                                    <MessageSquare size={40} className="mx-auto text-[var(--crm-muted)]" />
                                    <p className="mt-3 text-sm text-[var(--crm-text-muted)]">Select a conversation</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <ConversationInfoPanel
                        conversation={selectedConv}
                        messages={messages}
                        currentUserId={currentUserId}
                        onArchiveToggle={toggleArchive}
                    />
                </div>

                <div ref={messagesEndRef} />

                <NewConversationDrawer
                    isOpen={newConvOpen}
                    users={users}
                    formErrors={formErrors}
                    form={newConvForm}
                    onOpenChange={(o) => { setNewConvOpen(o); if (!o) setFormErrors({}); }}
                    onFormChange={setNewConvForm}
                    onSubmit={handleNewConv}
                />
            </AppShell>
        </>
    );
}

```

# FILE: resources/js/features/inbox/components/ConversationList.tsx

```tsx
import { Archive, Hash, MessageSquare, Plus, Search, Users, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { ConversationRow } from '@/features/chat/types';
import { CATEGORY_OPTIONS, getAvatarTone, getCategoryMeta, getConversationDisplayName, getConversationInitials, getLastMessagePreview, formatConversationTime } from '@/features/inbox/utils';

type Props = {
    conversations: ConversationRow[];
    selectedConvId: number | null;
    search: string;
    onSearchChange: (q: string) => void;
    onSelect: (conv: ConversationRow) => void;
    onArchiveToggle?: (conv: ConversationRow) => void;
    activeTab: string;
    onTabChange: (tab: string) => void;
    currentUserId: number;
    onNewConversation?: () => void;
};

const MAIN_TABS = [
    { id: 'active', label: 'Active' },
    { id: 'archived', label: 'Archived' },
    { id: 'unread', label: 'Unread' },
    { id: 'direct', label: 'Direct' },
    { id: 'groups', label: 'Groups' },
];

export function ConversationList({ conversations, selectedConvId, search, onSearchChange, onSelect, onArchiveToggle, activeTab, onTabChange, currentUserId, onNewConversation }: Props) {
    const [catFilter, setCatFilter] = useState('');

    const displayedConvs = useMemo(() => {
        if (!catFilter || activeTab !== 'groups') return conversations;
        return conversations.filter((c) => c.category === catFilter);
    }, [conversations, catFilter, activeTab]);
    const [rowHoverId, setRowHoverId] = useState<number | null>(null);

    const onlineUsers = useMemo(() => {
        const seen = new Set<number>();
        const users: { id: number; name: string }[] = [];
        for (const conv of conversations) {
            if (!Array.isArray(conv.participants)) continue;
            for (const p of conv.participants) {
                if (p?.user?.id && p.user.id !== currentUserId && !seen.has(p.user.id)) {
                    const ls = p.user.lastSeenAt;
                    if (ls && Date.now() - new Date(ls).getTime() < 300000) {
                        seen.add(p.user.id);
                        users.push({ id: p.user.id, name: p.user.name });
                    }
                }
            }
        }
        return users;
    }, [conversations, currentUserId]);

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-[var(--crm-border)] px-4 py-3">
                <div>
                    <h2 className="text-sm font-bold text-[var(--crm-text)]">Messages</h2>
                    <p className="mt-0.5 text-[10px] text-[var(--crm-text-muted)]">Team conversations and project updates</p>
                </div>
                <button type="button" onClick={onNewConversation}
                    className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-[var(--crm-border)] bg-[var(--crm-surface)] text-[var(--crm-text-muted)] hover:border-[var(--crm-gold)] hover:text-[var(--crm-gold)] transition"
                    title="New conversation">
                    <Plus size={16} />
                </button>
            </div>

            {/* Search */}
            <div className="border-b border-[var(--crm-border)] px-3 py-2.5">
                <div className="relative">
                    <Search size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--crm-muted)]" />
                    <input value={search} onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Search conversations..."
                        className="h-8 w-full rounded-lg border border-[var(--crm-border)] bg-[var(--crm-surface)] pl-8 pr-3 text-xs text-[var(--crm-text)] outline-none placeholder:text-[var(--crm-muted)] focus:border-[var(--crm-gold)]" />
                </div>
            </div>

            {/* Online now */}
            {onlineUsers.length > 0 ? (
                <div className="border-b border-[var(--crm-border)] px-3 py-2">
                    <p className="mb-1.5 text-[9px] font-bold uppercase tracking-[0.1em] text-[var(--crm-muted)]">Online now</p>
                    <div className="flex flex-wrap gap-1.5">
                        {onlineUsers.map((u) => (
                            <span key={u.id}
                                className="inline-flex items-center gap-1 rounded-full border border-[var(--crm-border)] bg-[var(--crm-surface)] px-2 py-0.5 text-[10px] font-semibold text-[var(--crm-text)]">
                                <span className="size-1.5 rounded-full bg-emerald-400" />
                                {u.name}
                            </span>
                        ))}
                    </div>
                </div>
            ) : null}

            {/* Tabs */}
            <div className="flex flex-wrap gap-1 border-b border-[var(--crm-border)] px-3 py-2">
                {MAIN_TABS.map((tab) => (
                    <button key={tab.id} type="button" onClick={() => onTabChange(tab.id)}
                        className={`rounded-lg px-2.5 py-1 text-[10px] font-semibold transition ${
                            activeTab === tab.id
                                ? 'bg-[var(--crm-gold)] text-black'
                                : 'text-[var(--crm-text-muted)] hover:text-[var(--crm-text)]'
                        }`}>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Category filter (groups tab only) */}
            {activeTab === 'groups' && (
                <div className="flex items-center gap-2 border-b border-[var(--crm-border)] px-3 py-2">
                    <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)}
                        className="h-7 rounded-lg border border-[var(--crm-border)] bg-[var(--crm-surface)] px-2 text-[10px] text-[var(--crm-text)] outline-none focus:border-[var(--crm-gold)]">
                        <option value="">All categories</option>
                        {CATEGORY_OPTIONS.filter((c) => c.id !== 'custom').map((c) => (
                            <option key={c.id} value={c.id}>{c.label}</option>
                        ))}
                    </select>
                    {catFilter && (
                        <button type="button" onClick={() => setCatFilter('')}
                            className="flex size-5 items-center justify-center rounded text-[var(--crm-text-muted)] hover:text-[var(--crm-gold)]">
                            <X size={12} />
                        </button>
                    )}
                </div>
            )}

            {/* Conversation list */}
            <div className="flex-1 overflow-y-auto scrollbar-none">
                {displayedConvs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 px-4">
                        <div className="flex size-12 items-center justify-center rounded-full bg-[var(--crm-surface-3)] mb-3">
                            <Search size={18} className="text-[var(--crm-muted)]" />
                        </div>
                        <p className="text-xs text-[var(--crm-text-muted)] text-center">No conversations found</p>
                        <p className="mt-1 text-[10px] text-[var(--crm-muted)] text-center">Start a new conversation to begin chatting</p>
                    </div>
                ) : (
                    displayedConvs.map((conv) => {
                        const name = getConversationDisplayName(conv, currentUserId);
                        const initials = getConversationInitials(conv, currentUserId);
                        const isSelected = selectedConvId === conv.id;
                        const isGroup = conv.type === 'group';
                        const catMeta = getCategoryMeta(isGroup ? conv.category : null);
                        const avatarTone = getAvatarTone(isGroup ? conv.id : name);
                        const preview = getLastMessagePreview(conv, currentUserId);

                        return (
                            <button key={conv.id} type="button" onClick={() => onSelect(conv)}
                                onMouseEnter={() => setRowHoverId(conv.id)}
                                onMouseLeave={() => setRowHoverId(null)}
                                className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition ${
                                    isSelected
                                        ? 'bg-[color-mix(in_srgb,var(--crm-gold)_10%,transparent)]'
                                        : 'hover:bg-[var(--crm-surface)]'
                                } ${conv.unreadCount > 0 && !isSelected ? 'border-l-2 border-[var(--crm-gold)]' : ''}`}>
                                <div className="relative shrink-0">
                                    {isGroup ? (
                                        <div className={`flex size-10 items-center justify-center rounded-xl ${avatarTone.bg} ${avatarTone.text}`}>
                                            <Users size={16} />
                                        </div>
                                    ) : (
                                        <div className={`flex size-10 items-center justify-center rounded-full ${avatarTone.bg} ${avatarTone.text} text-sm font-bold`}>
                                            {initials}
                                        </div>
                                    )}
                                    {!isGroup && conv.participants?.length === 2 ? (() => {
                                        const parts = Array.isArray(conv.participants) ? conv.participants : [];
                                        const other = parts.find((p) => p?.user?.id !== currentUserId);
                                        const ls = other?.user?.lastSeenAt;
                                        if (ls && Date.now() - new Date(ls).getTime() < 300000) {
                                            return <span className="absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-[var(--crm-elevated)] bg-emerald-400" />;
                                        }
                                        return null;
                                    })() : null}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-1.5 min-w-0">
                                            <p className={`truncate text-sm ${
                                                conv.unreadCount > 0 ? 'font-bold text-[var(--crm-text)]' : 'font-semibold text-[var(--crm-text)]'
                                            }`}>
                                                {name}
                                            </p>
                                            {isGroup && conv.category ? (
                                                <span className={`shrink-0 rounded px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wide ${catMeta.tone.bg} ${catMeta.tone.text}`}>
                                                    {catMeta.label}
                                                </span>
                                            ) : null}
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                            {conv.lastMessageAt ? (
                                                <span className="text-[9px] text-[var(--crm-text-muted)]">{formatConversationTime(conv.lastMessageAt)}</span>
                                            ) : null}
                                        </div>
                                    </div>
                                    <div className="mt-0.5 flex items-center gap-1.5">
                                        {preview ? (
                                            <p className="truncate text-[11px] text-[var(--crm-text-muted)]">{preview}</p>
                                        ) : null}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                    {!conv.archivedAt && rowHoverId === conv.id ? (
                                        <button type="button" onClick={(e) => { e.stopPropagation(); onArchiveToggle?.(conv); }}
                                            className="flex size-6 items-center justify-center rounded-md text-[var(--crm-text-muted)] hover:text-[var(--crm-gold)] transition"
                                            title="Archive">
                                            <Archive size={12} />
                                        </button>
                                    ) : null}
                                    {conv.unreadCount > 0 ? (
                                        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                                            {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                                        </span>
                                    ) : null}
                                </div>
                            </button>
                        );
                    })
                )}
            </div>
        </div>
    );
}

```

# FILE: resources/js/features/inbox/components/MessageThread.tsx

```tsx
import { usePage } from '@inertiajs/react';
import { useTyping } from '@/features/inbox/components/useTyping';
import { toast } from 'sonner';
import { Check, CheckCheck, ChevronLeft, ChevronDown, ChevronUp, Copy, Forward, ImageIcon, MessageSquare, Pencil, Reply, Search, Send, Settings, Trash2, Users, X, UserMinus, UserPlus, Info } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ConversationRow, MessageAttachmentRow, MessageRow } from '@/features/chat/types';
import { getAvatarTone, getCategoryMeta, getConversationDisplayName, getConversationInitials, highlightSearchMatch, formatConversationTime } from '@/features/inbox/utils';

function formatTime(dateStr: string) {
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function dateSeparator(dateStr: string): string {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

function shouldGroup(prev: MessageRow | undefined, curr: MessageRow): boolean {
    if (!prev) return false;
    if (prev.userId !== curr.userId) return false;
    const diff = new Date(curr.createdAt).getTime() - new Date(prev.createdAt).getTime();
    return diff < 300000;
}

function ImageGrid({ attachments, onImageClick }: { attachments: MessageAttachmentRow[]; onImageClick?: (index: number) => void }) {
    const count = attachments.length;
    if (count === 0) return null;
    const urls = attachments.map((a) => a.url || '').filter(Boolean);
    function img(url: string, i: number, cls: string) {
        return <img key={i} src={url} alt="" loading="lazy" className={`${cls} cursor-pointer hover:brightness-90 transition`} onClick={() => onImageClick?.(i)} />;
    }
    if (count === 1) return img(urls[0], 0, 'max-h-64 w-full rounded-lg object-cover');
    if (count === 2) return <div className="flex gap-1 rounded-lg overflow-hidden">{urls.map((url, i) => img(url, i, 'w-1/2 h-40 object-cover'))}</div>;
    if (count === 3) return <div className="grid grid-cols-2 gap-1 rounded-lg overflow-hidden">{img(urls[0], 0, 'row-span-2 h-48 w-full object-cover')}{img(urls[1], 1, 'h-[94px] w-full object-cover')}{img(urls[2], 2, 'h-[94px] w-full object-cover')}</div>;
    return (
        <div className="grid grid-cols-2 gap-1 rounded-lg overflow-hidden relative">
            {urls.slice(0, 4).map((url, i) => (
                <div key={i} className="relative">
                    {img(url, i, 'h-32 w-full object-cover')}
                    {i === 3 && count > 4 ? <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-sm font-bold text-white pointer-events-none">+{count - 4}</div> : null}
                </div>
            ))}
        </div>
    );
}

function Lightbox({ images, initialIndex, onClose }: { images: { url: string; originalFilename: string }[]; initialIndex: number; onClose: () => void }) {
    const [index, setIndex] = useState(initialIndex);
    const current = images[index];
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowLeft') setIndex((i) => Math.max(0, i - 1));
            if (e.key === 'ArrowRight') setIndex((i) => Math.min(images.length - 1, i + 1));
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [images.length, onClose]);
    if (!current) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80" onClick={onClose}>
            <button type="button" onClick={onClose} className="absolute right-4 top-4 z-10 flex size-10 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"><X size={20} /></button>
            {images.length > 1 && index > 0 ? <button type="button" onClick={(e) => { e.stopPropagation(); setIndex((i) => i - 1); }} className="absolute left-4 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"><ChevronLeft size={20} /></button> : null}
            {images.length > 1 && index < images.length - 1 ? <button type="button" onClick={(e) => { e.stopPropagation(); setIndex((i) => i + 1); }} className="absolute right-4 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"><ChevronLeft size={20} className="rotate-180" /></button> : null}
            <div onClick={(e) => e.stopPropagation()} className="flex flex-col items-center max-w-[90vw] max-h-[90vh]">
                <img src={current.url} alt={current.originalFilename} className="max-h-[80vh] max-w-[90vw] rounded-lg object-contain" />
                <p className="mt-2 text-xs text-white/60">{current.originalFilename}</p>
            </div>
        </div>
    );
}

function ForwardModal({ conversations, currentUserId, onClose, onForward }: {
    conversations: ConversationRow[]; currentUserId: number; onClose: () => void; onForward: (convIds: number[]) => void;
}) {
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState<Set<number>>(new Set());
    const convs = useMemo(() => conversations
        .filter((c) => c.id)
        .map((c) => {
            const others = (c.participants || []).filter((p) => p?.user?.id !== currentUserId);
            return { id: c.id, name: others.map((p) => p?.user?.name).filter(Boolean).join(', ') || c.subject || `Conversation #${c.id}` };
        }), [conversations, currentUserId]);
    const filtered = convs.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));
    const toggle = (id: number) => setSelected((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
    return (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 px-4" onClick={onClose}>
            <div onClick={(e) => e.stopPropagation()} className="w-full max-w-sm rounded-xl border border-[var(--crm-border)] bg-[var(--crm-elevated)] shadow-2xl">
                <div className="flex items-center justify-between border-b border-[var(--crm-border)] px-4 py-3">
                    <p className="text-sm font-bold text-[var(--crm-text)]">Forward message</p>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] text-[var(--crm-text-muted)]">{selected.size > 0 ? `${selected.size} selected` : ''}</span>
                        <button type="button" onClick={onClose} className="text-[var(--crm-muted)] hover:text-[var(--crm-text)]"><X size={16} /></button>
                    </div>
                </div>
                <div className="px-4 py-3">
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search conversations..." className="h-8 w-full rounded-lg border border-[var(--crm-border)] bg-[var(--crm-surface)] px-3 text-xs text-[var(--crm-text)] outline-none placeholder:text-[var(--crm-muted)] focus:border-[var(--crm-gold)]" />
                </div>
                <div className="max-h-60 overflow-y-auto px-2 pb-2">
                    {filtered.length === 0 ? <p className="py-6 text-center text-xs text-[var(--crm-text-muted)]">No conversations found</p> : filtered.map((c) => (
                        <button key={c.id} type="button" onClick={() => toggle(c.id)} className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold transition ${selected.has(c.id) ? 'bg-[var(--crm-gold)]/10 text-[var(--crm-gold)]' : 'text-[var(--crm-text)] hover:bg-[var(--crm-surface)]'}`}>
                            <div className={`flex size-4 shrink-0 items-center justify-center rounded border ${selected.has(c.id) ? 'border-[var(--crm-gold)] bg-[var(--crm-gold)] text-black' : 'border-[var(--crm-border)]'}`}>{selected.has(c.id) ? <Check size={10} /> : null}</div>
                            <Forward size={14} className="text-[var(--crm-muted)]" />
                            {c.name}
                        </button>
                    ))}
                </div>
                {selected.size > 0 ? (
                    <div className="border-t border-[var(--crm-border)] px-4 py-3">
                        <button type="button" onClick={() => { onForward(Array.from(selected)); setSelected(new Set()); }}
                            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--crm-gold)] px-4 py-2 text-xs font-bold text-black hover:brightness-110 transition">
                            <Forward size={14} /> Forward to {selected.size} conversation{selected.size > 1 ? 's' : ''}
                        </button>
                    </div>
                ) : null}
            </div>
        </div>
    );
}

function MessageBubble({ msg, isMine, grouped, isGroup, currentUserId, onReply, onForward: onForwardMsg, onImageClick, onEdit, onDelete, searchQuery }: {
    msg: MessageRow; isMine: boolean; grouped: boolean; isGroup: boolean; currentUserId: number;
    onReply: (msg: MessageRow) => void; onForward: (msg: MessageRow) => void;
    onImageClick: (attachments: MessageAttachmentRow[], index: number) => void;
    onEdit?: (msg: MessageRow) => void; onDelete?: (msg: MessageRow) => void; searchQuery?: string;
}) {
    const [hovered, setHovered] = useState(false);
    const avatarTone = getAvatarTone(msg.userId);
    const highlight = (text: string) => {
        if (!searchQuery || !text) return text;
        const match = highlightSearchMatch(text, searchQuery);
        if (!match) return text;
        return <>{match.before}<mark className="bg-[var(--crm-gold)]/30 text-inherit rounded px-0.5">{match.match}</mark>{match.after}</>;
    };
    return (
        <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-0.5`}>
            <div className={`max-w-[75%] min-w-0 ${grouped ? '' : 'mt-2'}`}>
                {isGroup && !isMine && !grouped ? (
                    <p className={`text-[10px] font-semibold mb-1 ${avatarTone.text}`}>{msg.user?.name || msg.userName || 'Unknown'}</p>
                ) : null}
                {msg.isForwarded ? <p className={`text-[9px] text-[var(--crm-muted)] mb-0.5 ${isMine ? 'text-right' : 'text-left'}`}>Forwarded</p> : null}
                {msg.replyTo ? (
                    <div className={`mb-1 rounded-lg border-l-2 px-2.5 py-1.5 ${isMine ? 'border-[var(--crm-gold)]/50 bg-black/20' : 'border-[var(--crm-border)] bg-[var(--crm-surface-3)]'}`}>
                        <p className="text-[9px] font-semibold text-[var(--crm-text-muted)]">Replied to {msg.replyTo.userName || 'a message'}</p>
                        <p className="text-[10px] text-[var(--crm-text-muted)] truncate">{msg.replyTo.body || (msg.replyTo.attachmentsCount > 0 ? 'Photo' : '')}</p>
                    </div>
                ) : null}
                <div className={`rounded-xl overflow-hidden ${isMine ? 'bg-[var(--crm-gold)] text-black' : 'border border-[var(--crm-border)] bg-[var(--crm-surface-2)]'}`}>
                    {msg.attachments && msg.attachments.length > 0 ? (
                        <div className={`${msg.body ? 'rounded-t-xl' : 'rounded-xl'} overflow-hidden`}>
                            <ImageGrid attachments={msg.attachments} onImageClick={(i) => onImageClick(msg.attachments!, i)} />
                        </div>
                    ) : null}
                    {msg.body ? (
                        <div className={`px-3 py-2 text-xs whitespace-pre-wrap break-words ${msg.attachments && msg.attachments.length > 0 ? 'border-t border-black/10' : ''}`}>
                            {highlight(msg.body)}
                        </div>
                    ) : null}
                </div>
                <div className={`mt-0.5 flex items-center gap-1 ${isMine ? 'justify-end' : 'justify-start'}`}>
                    {msg.isEdited ? <span className="text-[9px] text-[var(--crm-text-muted)]">edited</span> : null}
                    <span className="text-[9px] text-[var(--crm-text-muted)]">{formatTime(msg.createdAt)}</span>
                    {isMine ? (
                        msg.readBy && msg.readBy.length > 0 ? <CheckCheck size={11} className="text-emerald-400" /> : <Check size={11} className="text-[var(--crm-text-muted)]" />
                    ) : null}
                </div>
                {hovered ? (
                    <div className={`flex gap-1 mt-0.5 ${isMine ? 'justify-end' : 'justify-start'}`}>
                        <button type="button" onClick={() => onReply(msg)} className="flex size-6 items-center justify-center rounded-md bg-[var(--crm-surface-3)] text-[var(--crm-text-muted)] hover:text-[var(--crm-text)] transition"><Reply size={11} /></button>
                        <button type="button" onClick={() => onForward(msg)} className="flex size-6 items-center justify-center rounded-md bg-[var(--crm-surface-3)] text-[var(--crm-text-muted)] hover:text-[var(--crm-text)] transition"><Forward size={11} /></button>
                        {isMine && msg.body ? <button type="button" onClick={() => onEdit?.(msg)} className="flex size-6 items-center justify-center rounded-md bg-[var(--crm-surface-3)] text-[var(--crm-text-muted)] hover:text-[var(--crm-gold)] transition"><Pencil size={11} /></button> : msg.body ? <button type="button" onClick={() => { navigator.clipboard.writeText(msg.body || ''); }} className="flex size-6 items-center justify-center rounded-md bg-[var(--crm-surface-3)] text-[var(--crm-text-muted)] hover:text-[var(--crm-text)] transition"><Copy size={11} /></button> : null}
                        {isMine ? <button type="button" onClick={() => onDelete?.(msg)} className="flex size-6 items-center justify-center rounded-md bg-[var(--crm-surface-3)] text-[var(--crm-text-muted)] hover:text-red-400 transition"><Trash2 size={11} /></button> : null}
                    </div>
                ) : null}
            </div>
        </div>
    );
}

type Props = {
    conversation: ConversationRow;
    conversations: ConversationRow[];
    messages: MessageRow[];
    loading: boolean;
    loadingOlder: boolean;
    paginator: { currentPage: number; lastPage: number; perPage: number; total: number } | null;
    currentUserId: number;
    onSend: (body: string, images: File[], replyToId?: number) => Promise<MessageRow> | undefined;
    onLoadOlder: () => void;
    onMessageUpdate?: (message: MessageRow) => void;
    onMessageDelete?: (messageId: number) => void;
    onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
};

export function MessageThread({ conversation, conversations, messages, loading, loadingOlder, paginator, currentUserId, onSend, onLoadOlder, onMessageUpdate, onMessageDelete, onScroll }: Props) {
    const pageUsers = ((usePage().props as any)?.users || []) as { id: number; name: string }[];
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const prevLastId = useRef<number | null>(null);
    const [text, setText] = useState('');
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [replyTo, setReplyTo] = useState<MessageRow | null>(null);
    const [lightboxOpen, setLightboxOpen] = useState<{ images: { url: string; originalFilename: string }[]; index: number } | null>(null);
    const [forwardMsg, setForwardMsg] = useState<MessageRow | null>(null);
    const [editingMsg, setEditingMsg] = useState<MessageRow | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
    const [sending, setSending] = useState(false);
    const [groupSettingsOpen, setGroupSettingsOpen] = useState(false);
    const [groupSubject, setGroupSubject] = useState(conversation.subject || '');
    const [addUserId, setAddUserId] = useState('');
    const [availableUsers, setAvailableUsers] = useState<{ id: number; name: string }[]>([]);
    const [infoPanelOpen, setInfoPanelOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<number[]>([]);
    const [searchIndex, setSearchIndex] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { typingUsers, sendTyping } = useTyping(conversation?.id ?? null, currentUserId);

    useEffect(() => {
        if (messages.length > 0) {
            const lastId = messages[messages.length - 1].id;
            if (lastId !== prevLastId.current) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            prevLastId.current = lastId;
        }
    }, [messages]);

    useEffect(() => {
        if (!searchQuery) { setSearchResults([]); setSearchIndex(0); return; }
        const q = searchQuery.toLowerCase();
        const ids = messages.filter((m) => (m.body || '').toLowerCase().includes(q) || (m.userName || '').toLowerCase().includes(q) || (m.replyTo?.body || '').toLowerCase().includes(q)).map((m) => m.id);
        setSearchResults(ids);
        setSearchIndex(0);
    }, [searchQuery, messages]);

    useEffect(() => {
        if (searchResults.length > 0 && searchIndex < searchResults.length) {
            const el = document.getElementById(`msg-${searchResults[searchIndex]}`);
            el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [searchResults, searchIndex]);

    const parts = Array.isArray(conversation.participants) ? conversation.participants : [];
    const others = parts.filter((p) => p?.user?.id !== currentUserId);
    const otherName = getConversationDisplayName(conversation, currentUserId);
    const isGroup = conversation.type === 'group';
    const catMeta = getCategoryMeta(isGroup ? conversation.category : null);

    const statusLine = useMemo(() => {
        if (isGroup) {
            const pc = conversation.participantsCount ?? parts.length;
            const oc = conversation.onlineCount ?? parts.filter((p) => p?.user?.lastSeenAt && Date.now() - new Date(p.user.lastSeenAt).getTime() < 300000).length;
            return `${pc} member${pc !== 1 ? 's' : ''}${oc > 0 ? ` · ${oc} online` : ''}`;
        }
        const other = others[0];
        if (!other) return '';
        const ls = other.user?.lastSeenAt;
        if (!ls) return '';
        const diff = Date.now() - new Date(ls).getTime();
        if (diff < 300000) return 'Online';
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `Last seen ${mins}m ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `Last seen ${hours}h ago`;
        return `Last seen ${new Date(ls).toLocaleDateString([], { month: 'short', day: 'numeric' })}`;
    }, [conversation, others, parts, isGroup]);

    const handleSend = useCallback(async () => {
        const body = text.trim();
        if (!body && selectedImages.length === 0) return;
        if (sending) return;
        setSending(true);
        try {
            await onSend(body, selectedImages, replyTo?.id);
            setText(''); setSelectedImages([]); setReplyTo(null);
            if (textareaRef.current) textareaRef.current.style.height = 'auto';
        } catch { /* handled */ } finally { setSending(false); }
    }, [text, selectedImages, replyTo, sending, onSend]);

    const handleUpdate = useCallback(async () => {
        const body = text.trim();
        if (!body || !editingMsg || sending) return;
        setSending(true);
        try {
            const res = await fetch(`/inbox/${conversation.id}/messages/${editingMsg.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': (window as any).csrfToken || '' }, body: JSON.stringify({ body }) });
            if (!res.ok) { toast.error('Failed to update message'); return; }
            const updated: MessageRow = await res.json();
            onMessageUpdate?.(updated);
            setEditingMsg(null); setText('');
            if (textareaRef.current) textareaRef.current.style.height = 'auto';
        } catch { toast.error('Failed to update message'); } finally { setSending(false); }
    }, [text, editingMsg, sending, conversation.id, onMessageUpdate]);

    const handleEdit = useCallback((msg: MessageRow) => {
        setEditingMsg(msg); setText(msg.body || ''); setReplyTo(null); setSelectedImages([]);
        setTimeout(() => { if (textareaRef.current) { textareaRef.current.focus(); textareaRef.current.style.height = 'auto'; textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px'; } }, 0);
    }, []);

    const handleDelete = useCallback((msg: MessageRow) => {
        if (deleteConfirmId === msg.id) {
            fetch(`/inbox/${conversation.id}/messages/${msg.id}`, { method: 'DELETE', headers: { 'X-CSRF-TOKEN': (window as any).csrfToken || '' } }).then((res) => { if (res.ok) onMessageDelete?.(msg.id); }).catch(() => {});
            setDeleteConfirmId(null);
        } else { setDeleteConfirmId(msg.id); setTimeout(() => setDeleteConfirmId(null), 3000); }
    }, [deleteConfirmId, conversation.id, onMessageDelete]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (editingMsg) handleUpdate(); else handleSend(); }
        if (e.key === 'Escape' && editingMsg) { setEditingMsg(null); setText(''); if (textareaRef.current) textareaRef.current.style.height = 'auto'; }
    }, [handleSend, handleUpdate, editingMsg]);

    const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setSelectedImages((prev) => [...prev, ...files].slice(0, 10));
        if (fileInputRef.current) fileInputRef.current.value = '';
    }, []);

    const removeImage = useCallback((i: number) => setSelectedImages((prev) => prev.filter((_, idx) => idx !== i)), []);
    const handleImageClick = useCallback((attachments: MessageAttachmentRow[], index: number) => {
        const images = attachments.filter((a) => a.url).map((a) => ({ url: a.url!, originalFilename: a.originalFilename }));
        if (images.length > 0) setLightboxOpen({ images, index });
    }, []);

    const handleForward = useCallback(async (convIds: number[]) => {
        if (!forwardMsg) return;
        try {
            const res = await fetch(`/inbox/${conversation.id}/messages/${forwardMsg.id}/forward`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': (window as any).csrfToken || '' },
                body: JSON.stringify({ conversation_ids: convIds }),
            });
            if (res.ok) {
                const data = await res.json();
                if (data.forwarded) {
                    toast.success(`Forwarded to ${convIds.length} conversation${convIds.length > 1 ? 's' : ''}`);
                }
            } else {
                toast.error('Failed to forward message');
            }
            setForwardMsg(null);
        } catch { toast.error('Failed to forward message'); }
    }, [forwardMsg, conversation.id]);

    const handleRenameGroup = useCallback(async () => {
        if (!groupSubject.trim() || !isGroup) return;
        try {
            const res = await fetch(`/inbox/${conversation.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': (window as any).csrfToken || '' }, body: JSON.stringify({ subject: groupSubject.trim() }) });
            if (res.ok) { toast.success('Group renamed'); setGroupSettingsOpen(false); }
        } catch { toast.error('Failed to rename group'); }
    }, [conversation.id, isGroup, groupSubject]);

    const handleAddParticipant = useCallback(async () => {
        if (!addUserId) return;
        try {
            const res = await fetch(`/inbox/${conversation.id}/participants`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': (window as any).csrfToken || '' }, body: JSON.stringify({ user_id: Number(addUserId) }) });
            if (res.ok) { toast.success('Participant added'); setAddUserId(''); setAvailableUsers([]); }
        } catch { toast.error('Failed to add participant'); }
    }, [conversation.id, addUserId]);

    const handleRemoveParticipant = useCallback(async (userId: number) => {
        try {
            const res = await fetch(`/inbox/${conversation.id}/participants/${userId}`, { method: 'DELETE', headers: { 'X-CSRF-TOKEN': (window as any).csrfToken || '' } });
            if (res.ok) toast.success('Participant removed');
        } catch { toast.error('Failed to remove participant'); }
    }, [conversation.id]);

    const openGroupSettings = useCallback(() => {
        setGroupSubject(conversation.subject || '');
        setAvailableUsers(pageUsers.filter((u) => !parts.some((p) => p?.user?.id === u.id)));
        setGroupSettingsOpen(true);
    }, [conversation.subject, parts, pageUsers]);

    const groupedDates = useMemo(() => {
        const dates: { label: string; messageIds: number[] }[] = [];
        let lastLabel = '';
        for (const msg of messages) {
            const label = dateSeparator(msg.createdAt);
            if (label !== lastLabel) { dates.push({ label, messageIds: [msg.id] }); lastLabel = label; }
            else { dates[dates.length - 1].messageIds.push(msg.id); }
        }
        return dates;
    }, [messages]);

    const canSend = editingMsg ? text.trim().length > 0 : text.trim().length > 0 || selectedImages.length > 0;
    const avatarTone = getAvatarTone(isGroup ? conversation.id : otherName + currentUserId);

    return (
        <div className="flex flex-1 flex-col min-h-0">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-[var(--crm-border)] bg-[var(--crm-surface)] px-4 py-3 shrink-0">
                <div className="relative shrink-0">
                    {isGroup ? (
                        <div className={`flex size-9 items-center justify-center rounded-xl ${avatarTone.bg} ${avatarTone.text}`}><Users size={16} /></div>
                    ) : (
                        <div className={`flex size-9 items-center justify-center rounded-full ${avatarTone.bg} ${avatarTone.text} text-sm font-bold`}>{getConversationInitials(conversation, currentUserId)}</div>
                    )}
                    {!isGroup && others.length === 1 && statusLine === 'Online' ? (
                        <span className="absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-[var(--crm-surface)] bg-emerald-400" />
                    ) : null}
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-semibold text-[var(--crm-text)]">{otherName}</p>
                        {isGroup && conversation.category ? (
                            <span className={`shrink-0 rounded px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wide ${catMeta.tone.bg} ${catMeta.tone.text}`}>{catMeta.label}</span>
                        ) : null}
                    </div>
                    {statusLine ? <p className="text-[10px] text-[var(--crm-text-muted)]">{statusLine}</p> : null}
                </div>
                {searchOpen ? (
                    <div className="flex items-center gap-1">
                        <input ref={searchInputRef} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search messages..." autoFocus
                            className="h-7 w-40 rounded-lg border border-[var(--crm-border)] bg-[var(--crm-surface)] px-2 text-[10px] text-[var(--crm-text)] outline-none placeholder:text-[var(--crm-muted)] focus:border-[var(--crm-gold)]" />
                        {searchResults.length > 0 ? <span className="text-[9px] text-[var(--crm-text-muted)] shrink-0">{searchIndex + 1}/{searchResults.length}</span> : null}
                        <button type="button" onClick={() => { setSearchIndex((i) => Math.min(i + 1, searchResults.length - 1)); }} disabled={searchResults.length === 0} className="flex size-6 items-center justify-center rounded text-[var(--crm-text-muted)] hover:text-[var(--crm-text)] disabled:opacity-30"><ChevronUp size={12} /></button>
                        <button type="button" onClick={() => { setSearchIndex((i) => Math.max(i - 1, 0)); }} disabled={searchResults.length === 0} className="flex size-6 items-center justify-center rounded text-[var(--crm-text-muted)] hover:text-[var(--crm-text)] disabled:opacity-30"><ChevronDown size={12} /></button>
                        <button type="button" onClick={() => { setSearchOpen(false); setSearchQuery(''); setSearchResults([]); }} className="flex size-6 items-center justify-center rounded text-[var(--crm-text-muted)] hover:text-[var(--crm-text)]"><X size={12} /></button>
                    </div>
                ) : (
                    <div className="flex items-center gap-1">
                        <button type="button" onClick={() => { setSearchOpen(true); setTimeout(() => searchInputRef.current?.focus(), 50); }} className="flex size-8 items-center justify-center rounded-lg text-[var(--crm-text-muted)] hover:text-[var(--crm-gold)] transition"><Search size={14} /></button>
                        <button type="button" onClick={() => setInfoPanelOpen(!infoPanelOpen)} className="flex size-8 items-center justify-center rounded-lg text-[var(--crm-text-muted)] hover:text-[var(--crm-gold)] transition"><Info size={14} /></button>
                        {isGroup ? <button type="button" onClick={openGroupSettings} className="flex size-8 items-center justify-center rounded-lg text-[var(--crm-text-muted)] hover:text-[var(--crm-gold)] transition"><Settings size={14} /></button> : null}
                    </div>
                )}
            </div>

            <div className="flex flex-1 min-h-0">
                {/* Messages area */}
                <div className="flex-1 flex flex-col min-w-0">
                    <div className="flex-1 overflow-y-auto px-4 py-3 scrollbar-none" onScroll={onScroll}>
                        {loading ? (
                            <div className="flex items-center justify-center py-8"><div className="size-5 animate-spin rounded-full border-2 border-[var(--crm-gold)] border-t-transparent" /></div>
                        ) : messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <MessageSquare size={32} className="text-[var(--crm-muted)]" />
                                <p className="mt-2 text-xs text-[var(--crm-text-muted)]">No messages yet</p>
                                <p className="mt-0.5 text-[10px] text-[var(--crm-muted)]">Send a message to start the conversation</p>
                            </div>
                        ) : (
                            <>
                                {paginator && paginator.currentPage < paginator.lastPage ? (
                                    <div className="flex justify-center py-3">
                                        <button type="button" onClick={onLoadOlder} disabled={loadingOlder}
                                            className="flex items-center gap-1.5 rounded-full border border-[var(--crm-border)] bg-[var(--crm-surface)] px-3 py-1 text-[9px] font-semibold text-[var(--crm-text-muted)] hover:text-[var(--crm-text)] transition disabled:opacity-50">
                                            {loadingOlder ? <div className="size-3 animate-spin rounded-full border-2 border-[var(--crm-gold)] border-t-transparent" /> : null}
                                            {loadingOlder ? 'Loading...' : `Load older messages (${paginator.total - (paginator.currentPage * paginator.perPage) > 0 ? paginator.total - (paginator.currentPage * paginator.perPage) : 0} more)`}
                                        </button>
                                    </div>
                                ) : null}
                                {groupedDates.map((group) => (
                                    <div key={group.label}>
                                        <div className="flex items-center justify-center py-3">
                                            <span className="rounded-full border border-[var(--crm-border)] bg-[var(--crm-surface)] px-3 py-0.5 text-[9px] font-semibold text-[var(--crm-text-muted)]">{group.label}</span>
                                        </div>
                                        {group.messageIds.map((msgId, idx) => {
                                            const msg = messages.find((m) => m.id === msgId)!;
                                            const prev = idx > 0 ? messages.find((m) => m.id === group.messageIds[idx - 1]) : undefined;
                                            const isSearchResult = searchResults.includes(msg.id);
                                            return (
                                                <div key={msg.id} id={`msg-${msg.id}`} className={`msg-slide-in ${isSearchResult ? (searchResults[searchIndex] === msg.id ? 'ring-2 ring-[var(--crm-gold)]/50 rounded-lg' : 'ring-1 ring-[var(--crm-gold)]/20 rounded-lg') : ''}`}>
                                                    <MessageBubble msg={msg} isMine={msg.userId === currentUserId} grouped={shouldGroup(prev, msg)} isGroup={isGroup}
                                                        currentUserId={currentUserId} onReply={setReplyTo} onForward={setForwardMsg} onImageClick={handleImageClick}
                                                        onEdit={handleEdit} onDelete={handleDelete} searchQuery={searchQuery} />
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </>
                        )}
                    </div>

                    {/* Reply preview in composer */}
                    {replyTo && !editingMsg ? (
                        <div className="flex items-center gap-2 border-t border-[var(--crm-border)] bg-[var(--crm-surface)] px-4 py-2 shrink-0">
                            <div className="h-8 w-0.5 rounded-full bg-[var(--crm-gold)]" />
                            <div className="min-w-0 flex-1">
                                <p className="text-[10px] font-semibold text-[var(--crm-gold)]">Replying to {replyTo.userName || 'a message'}</p>
                                <p className="truncate text-[10px] text-[var(--crm-text-muted)]">{replyTo.body || (replyTo.attachments && replyTo.attachments.length > 0 ? 'Photo' : '')}</p>
                            </div>
                            <button type="button" onClick={() => setReplyTo(null)} className="flex size-6 items-center justify-center rounded-md text-[var(--crm-text-muted)] hover:text-[var(--crm-text)]"><X size={14} /></button>
                        </div>
                    ) : null}

                    {/* Editing bar */}
                    {editingMsg ? (
                        <div className="flex items-center gap-2 border-t border-[var(--crm-border)] bg-[var(--crm-surface)] px-4 py-2 shrink-0">
                            <div className="h-8 w-0.5 rounded-full bg-emerald-400" />
                            <div className="min-w-0 flex-1">
                                <p className="text-[10px] font-semibold text-emerald-400">Editing message</p>
                                <p className="truncate text-[10px] text-[var(--crm-text-muted)]">{editingMsg.body || ''}</p>
                            </div>
                            <button type="button" onClick={() => { setEditingMsg(null); setText(''); if (textareaRef.current) textareaRef.current.style.height = 'auto'; }} className="flex size-6 items-center justify-center rounded-md text-[var(--crm-text-muted)] hover:text-[var(--crm-text)]"><X size={14} /></button>
                        </div>
                    ) : null}

                    {/* Image previews */}
                    {selectedImages.length > 0 ? (
                        <div className="flex items-center gap-2 border-t border-[var(--crm-border)] bg-[var(--crm-surface)] px-4 py-2 overflow-x-auto shrink-0">
                            {selectedImages.map((file, i) => (
                                <div key={i} className="relative shrink-0">
                                    <img src={URL.createObjectURL(file)} alt="" className="size-14 rounded-lg object-cover border border-[var(--crm-border)]" />
                                    <button type="button" onClick={() => removeImage(i)} className="absolute -right-1.5 -top-1.5 flex size-4 items-center justify-center rounded-full bg-red-500 text-white"><X size={8} /></button>
                                </div>
                            ))}
                        </div>
                    ) : null}

                    {/* Typing indicator */}
                    {typingUsers.length > 0 && !editingMsg ? (
                        <div className="flex items-center gap-2 border-t border-[var(--crm-border)] bg-[var(--crm-surface)] px-4 py-1.5 shrink-0">
                            <div className="flex items-center gap-1">
                                {typingUsers.slice(0, 2).map((u) => (
                                    <span key={u.id} className="flex size-5 items-center justify-center rounded-full bg-[var(--crm-gold-soft)] text-[7px] font-bold text-[var(--crm-gold)]">
                                        {u.name.charAt(0).toUpperCase()}
                                    </span>
                                ))}
                            </div>
                            <p className="text-[10px] text-[var(--crm-text-muted)]">
                                {typingUsers.length === 1 ? `${typingUsers[0].name} is typing` :
                                    typingUsers.length === 2 ? `${typingUsers[0].name} and ${typingUsers[1].name} are typing` :
                                    `${typingUsers[0].name} and ${typingUsers.length - 1} others are typing`}
                                <span className="inline-flex items-center gap-0.5 ml-1">
                                    <span className="typing-dot size-1 rounded-full bg-[var(--crm-muted)]" />
                                    <span className="typing-dot size-1 rounded-full bg-[var(--crm-muted)]" />
                                    <span className="typing-dot size-1 rounded-full bg-[var(--crm-muted)]" />
                                </span>
                            </p>
                        </div>
                    ) : null}

                    {/* Composer */}
                    <div className="flex items-end gap-2 border-t border-[var(--crm-border)] bg-[var(--crm-surface)] px-4 py-3 shrink-0">
                        {!editingMsg ? <button type="button" onClick={() => fileInputRef.current?.click()} className="flex size-9 shrink-0 items-center justify-center rounded-lg text-[var(--crm-text-muted)] hover:text-[var(--crm-gold)] transition"><ImageIcon size={18} /></button> : <div className="size-9 shrink-0" />}
                        <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={handleImageSelect} />
                        <div className="relative flex-1">
                            <textarea ref={textareaRef} value={text} onChange={(e) => { setText(e.target.value); sendTyping(); e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'; }} onKeyDown={handleKeyDown}
                                placeholder="Type a message..." rows={1}
                                className="min-h-[36px] w-full resize-none rounded-lg border border-[var(--crm-border)] bg-[var(--crm-surface-2)] px-3 py-2 text-xs text-[var(--crm-text)] outline-none placeholder:text-[var(--crm-muted)] focus:border-[var(--crm-gold)]" style={{ lineHeight: '1.4' }} />
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                            {text.trim().length > 0 && !editingMsg ? (
                                <div className="flex items-center gap-0.5">
                                    <span className="typing-dot size-1 rounded-full bg-[var(--crm-gold)]" />
                                    <span className="typing-dot size-1 rounded-full bg-[var(--crm-gold)]" />
                                    <span className="typing-dot size-1 rounded-full bg-[var(--crm-gold)]" />
                                </div>
                            ) : null}
                            <button type="button" onClick={editingMsg ? handleUpdate : handleSend} disabled={!canSend || sending}
                                className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[var(--crm-gold)] text-black disabled:opacity-40 transition hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0">
                                {sending ? <div className="size-4 animate-spin rounded-full border-2 border-black border-t-transparent" /> : editingMsg ? <Check size={16} /> : <Send size={16} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Info panel */}
                {infoPanelOpen ? (
                    <div className="w-72 shrink-0 border-l border-[var(--crm-border)] bg-[var(--crm-surface)] overflow-y-auto scrollbar-none">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--crm-border)]">
                            <p className="text-xs font-bold text-[var(--crm-text)]">Info</p>
                            <button type="button" onClick={() => setInfoPanelOpen(false)} className="text-[var(--crm-muted)] hover:text-[var(--crm-text)]"><X size={14} /></button>
                        </div>
                        {isGroup ? (
                            <div className="p-4 space-y-4">
                                <div className="flex flex-col items-center gap-2">
                                    <div className={`flex size-14 items-center justify-center rounded-xl ${avatarTone.bg} ${avatarTone.text}`}><Users size={24} /></div>
                                    <p className="text-sm font-bold text-[var(--crm-text)]">{otherName}</p>
                                    {conversation.category ? <span className={`rounded px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${catMeta.tone.bg} ${catMeta.tone.text}`}>{catMeta.label}</span> : null}
                                    <p className="text-[10px] text-[var(--crm-text-muted)]">{statusLine}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-semibold text-[var(--crm-text-muted)] mb-2 uppercase tracking-wide">Participants</p>
                                    <div className="space-y-1.5">
                                        {parts.filter((p) => p?.user?.id !== currentUserId).map((p) => {
                                            const ls = p?.user?.lastSeenAt;
                                            const isOnline = ls && Date.now() - new Date(ls).getTime() < 300000;
                                            return (
                                                <div key={p.id} className="flex items-center gap-2">
                                                    <span className={`size-2 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-[var(--crm-muted)]'}`} />
                                                    <span className="text-xs text-[var(--crm-text)]">{p.user?.name}</span>
                                                    {!isOnline && ls ? <span className="text-[9px] text-[var(--crm-text-muted)]">{formatConversationTime(ls)}</span> : null}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[10px] font-semibold text-[var(--crm-text-muted)] mb-2 uppercase tracking-wide flex items-center gap-1"><ImageIcon size={12} /> Shared images</p>
                                    {(() => {
                                        const images = messages.flatMap((m) => m.attachments || []).filter((a) => a.url).slice(0, 9);
                                        if (images.length === 0) return <p className="text-[10px] text-[var(--crm-text-muted)]">No shared images yet.</p>;
                                        return <div className="grid grid-cols-3 gap-1">{images.map((img) => <img key={img.id} src={img.url!} alt="" className="aspect-square rounded-lg object-cover" />)}</div>;
                                    })()}
                                </div>
                                <div className="space-y-1.5">
                                    <button type="button" onClick={() => { fetch(`/inbox/${conversation.id}/archive`, { method: 'POST', headers: { 'X-CSRF-TOKEN': (window as any).csrfToken || '' } }).then(() => window.location.reload()); }}
                                        className="w-full rounded-lg bg-[var(--crm-surface-2)] px-3 py-2 text-[10px] font-semibold text-[var(--crm-text-muted)] hover:text-[var(--crm-text)] transition text-left">Archive conversation</button>
                                </div>
                            </div>
                        ) : (
                            <div className="p-4 space-y-4">
                                <div className="flex flex-col items-center gap-2">
                                    <div className={`flex size-14 items-center justify-center rounded-full ${avatarTone.bg} ${avatarTone.text} text-lg font-bold`}>{getConversationInitials(conversation, currentUserId)}</div>
                                    <p className="text-sm font-bold text-[var(--crm-text)]">{otherName}</p>
                                    <p className="text-[10px] text-[var(--crm-text-muted)]">{statusLine}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-semibold text-[var(--crm-text-muted)] mb-2 uppercase tracking-wide flex items-center gap-1"><ImageIcon size={12} /> Shared images</p>
                                    {(() => {
                                        const images = messages.flatMap((m) => m.attachments || []).filter((a) => a.url).slice(0, 9);
                                        if (images.length === 0) return <p className="text-[10px] text-[var(--crm-text-muted)]">No shared images yet.</p>;
                                        return <div className="grid grid-cols-3 gap-1">{images.map((img) => <img key={img.id} src={img.url!} alt="" className="aspect-square rounded-lg object-cover" />)}</div>;
                                    })()}
                                </div>
                                <div className="space-y-1.5">
                                    <button type="button" onClick={() => { fetch(`/inbox/${conversation.id}/archive`, { method: 'POST', headers: { 'X-CSRF-TOKEN': (window as any).csrfToken || '' } }).then(() => window.location.reload()); }}
                                        className="w-full rounded-lg bg-[var(--crm-surface-2)] px-3 py-2 text-[10px] font-semibold text-[var(--crm-text-muted)] hover:text-[var(--crm-text)] transition text-left">Archive conversation</button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : null}
            </div>

            {lightboxOpen ? <Lightbox images={lightboxOpen.images} initialIndex={lightboxOpen.index} onClose={() => setLightboxOpen(null)} /> : null}
            {forwardMsg ? <ForwardModal conversations={conversations} currentUserId={currentUserId} onClose={() => setForwardMsg(null)} onForward={handleForward} /> : null}
            {groupSettingsOpen ? (
                <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 px-4" onClick={() => setGroupSettingsOpen(false)}>
                    <div onClick={(e) => e.stopPropagation()} className="w-full max-w-sm rounded-xl border border-[var(--crm-border)] bg-[var(--crm-elevated)] shadow-2xl">
                        <div className="flex items-center justify-between border-b border-[var(--crm-border)] px-4 py-3">
                            <p className="text-sm font-bold text-[var(--crm-text)]">Group settings</p>
                            <button type="button" onClick={() => setGroupSettingsOpen(false)} className="text-[var(--crm-muted)] hover:text-[var(--crm-text)]"><X size={16} /></button>
                        </div>
                        <div className="px-4 py-3 space-y-4">
                            <div>
                                <p className="text-[10px] font-semibold text-[var(--crm-text-muted)] mb-1">Group name</p>
                                <div className="flex gap-2">
                                    <input value={groupSubject} onChange={(e) => setGroupSubject(e.target.value)} className="h-8 flex-1 rounded-lg border border-[var(--crm-border)] bg-[var(--crm-surface)] px-3 text-xs text-[var(--crm-text)] outline-none placeholder:text-[var(--crm-muted)] focus:border-[var(--crm-gold)]" />
                                    <button type="button" onClick={handleRenameGroup} className="h-8 rounded-lg bg-[var(--crm-gold)] px-3 text-[10px] font-bold text-black hover:brightness-110 transition">Save</button>
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] font-semibold text-[var(--crm-text-muted)] mb-1">Participants</p>
                                <div className="space-y-1 max-h-40 overflow-y-auto">
                                    {parts.filter((p) => p?.user?.id !== currentUserId).map((p) => (
                                        <div key={p.id} className="flex items-center justify-between rounded-lg bg-[var(--crm-surface)] px-3 py-2">
                                            <span className="text-xs font-semibold text-[var(--crm-text)]">{p.user?.name}</span>
                                            <button type="button" onClick={() => handleRemoveParticipant(p.user!.id)} className="text-[var(--crm-text-muted)] hover:text-red-400 transition"><UserMinus size={13} /></button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] font-semibold text-[var(--crm-text-muted)] mb-1">Add participant</p>
                                <div className="flex gap-2">
                                    <select value={addUserId} onChange={(e) => setAddUserId(e.target.value)} className="h-8 flex-1 rounded-lg border border-[var(--crm-border)] bg-[var(--crm-surface)] px-3 text-xs text-[var(--crm-text)] outline-none focus:border-[var(--crm-gold)]">
                                        <option value="">Select a user...</option>
                                        {availableUsers.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                                    </select>
                                    <button type="button" onClick={handleAddParticipant} disabled={!addUserId} className="flex h-8 items-center gap-1 rounded-lg bg-[var(--crm-gold)] px-3 text-[10px] font-bold text-black disabled:opacity-40 hover:brightness-110 transition"><UserPlus size={13} /> Add</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}


```

# FILE: resources/js/features/chat/types.ts

```ts
export type ParticipantUser = {
    id: number;
    name: string;
    email?: string;
    avatarUrl?: string | null;
    lastSeenAt?: string | null;
};

export type ConversationParticipant = {
    id: number;
    user: ParticipantUser;
    lastReadAt: string | null;
    archivedAt: string | null;
};

export type ConversationRow = {
    id: number;
    type: 'direct' | 'group';
    subject: string | null;
    category: string | null;
    displayName: string;
    avatarInitials: string;
    participants: ConversationParticipant[];
    participantsCount?: number;
    onlineCount?: number;
    lastMessage: MessageRow | null;
    lastMessageAt: string | null;
    unreadCount: number;
    archivedAt: string | null;
    createdAt: string;
};

export type MessageAttachmentRow = {
    id: number;
    originalFilename: string;
    filename: string;
    mimeType: string;
    size: number;
    url: string | null;
    thumbnailUrl: string | null;
    createdAt: string;
};

export type MessageReplyPreview = {
    id: number;
    body: string | null;
    userId: number;
    userName: string | null;
    attachmentsCount: number;
};

export type MessageForwardedFrom = {
    id: number;
    body: string | null;
    userId: number;
    userName: string | null;
};

export type MessageRow = {
    id: number;
    body: string | null;
    isEdited: boolean;
    isForwarded: boolean;
    forwardedFromMessageId: number | null;
    forwardedFrom: MessageForwardedFrom | null;
    userId: number;
    userName: string | null;
    user?: { id: number; name: string };
    readBy: number[];
    replyTo: MessageReplyPreview | null;
    attachments: MessageAttachmentRow[];
    attachmentsCount: number;
    createdAt: string;
    updatedAt: string;
};

export type ChatUserOption = {
    id: number;
    name: string;
    email: string;
};

```

# FILE: app/Http/Controllers/ConversationController.php

```php
<?php

namespace App\Http\Controllers;

use App\Http\Requests\Chat\StoreConversationRequest;
use App\Http\Resources\ConversationResource;
use App\Http\Resources\MessageResource;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use App\Services\Chat\ChatService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ConversationController extends Controller
{
    public function __construct(protected ChatService $chatService) {}

    public function index(Request $request): Response
    {
        abort_unless($request->user()->can('view inbox') || $request->user()->can('manage inbox') || $request->user()->hasRole('admin'), 403);
        $user = $request->user();
        $conversations = Conversation::whereHas('participants', fn ($q) => $q->where('user_id', $user->id)->whereNull('archived_at'))
            ->with([
                'participants.user',
                'messages' => fn ($q) => $q->with(['user', 'attachments', 'forwardedFrom.user'])->latest()->limit(1),
            ])
            ->orderByDesc('last_message_at')
            ->get();

        $users = User::where('id', '!=', $user->id)->orderBy('name')->get()->map(fn (User $u) => [
            'id' => $u->id, 'name' => $u->name, 'email' => $u->email,
        ]);

        $archivedCount = Conversation::whereHas('participants', fn ($q) => $q->where('user_id', $user->id)->whereNotNull('archived_at'))->count();

        return Inertia::render('Inbox/Index', [
            'conversations' => ConversationResource::collection($conversations)->resolve(),
            'users' => $users,
            'currentUserId' => $user->id,
            'unreadCount' => $this->chatService->unreadCount($user),
            'archivedCount' => $archivedCount,
        ]);
    }

    public function show(Request $request, Conversation $conversation)
    {
        $this->authorize('view', $conversation);
        $conversation->load(['participants.user']);

        $perPage = 50;
        $page = $request->integer('page', 1);

        $messages = $conversation->messages()
            ->with(['user', 'reads', 'attachments', 'replyTo.user', 'forwardedFrom.user'])
            ->orderBy('created_at', 'desc')
            ->paginate($perPage, ['*'], 'page', $page);

        $this->chatService->markAsRead($conversation, $request->user());

        return response()->json([
            'messages' => MessageResource::collection($messages)->resolve(),
            'paginator' => [
                'currentPage' => $messages->currentPage(),
                'lastPage' => $messages->lastPage(),
                'perPage' => $messages->perPage(),
                'total' => $messages->total(),
            ],
        ]);
    }

    public function store(StoreConversationRequest $request)
    {
        $this->authorize('create', Conversation::class);
        $data = $request->validated();
        $userIds = $data['user_ids'];

        if (count($userIds) === 1) {
            $other = User::findOrFail($userIds[0]);
            $conversation = $this->chatService->findOrCreateDirectConversation($request->user(), $other);
        } else {
            $category = $data['category'] ?? 'general';
            if ($category === 'custom' && !empty($data['custom_category'])) {
                $category = $data['custom_category'];
            }
            $conversation = Conversation::create([
                'type' => 'group',
                'subject' => $data['subject'] ?? null,
                'category' => $category,
            ]);
            $participants = array_merge($userIds, [$request->user()->id]);
            foreach ($participants as $uid) {
                $conversation->participants()->create(['user_id' => $uid]);
            }
        }

        return redirect()->route('inbox.index');
    }

    public function update(Request $request, Conversation $conversation): JsonResponse
    {
        $this->authorize('view', $conversation);
        $request->validate(['subject' => 'required|string|max:255']);

        $conversation->update(['subject' => $request->subject]);

        return response()->json((new ConversationResource($conversation))->resolve());
    }

    public function addParticipant(Request $request, Conversation $conversation): JsonResponse
    {
        $this->authorize('view', $conversation);
        abort_unless($conversation->type === 'group', 400, 'Only groups can have participants added.');
        $request->validate(['user_id' => 'required|exists:users,id']);

        $existing = $conversation->participants()->where('user_id', $request->user_id)->first();
        if ($existing) {
            if ($existing->archived_at) {
                $existing->update(['archived_at' => null]);
            }
            return response()->json(['success' => true]);
        }

        $conversation->participants()->create(['user_id' => $request->user_id]);
        return response()->json(['success' => true]);
    }

    public function removeParticipant(Conversation $conversation, User $user): JsonResponse
    {
        $this->authorize('view', $conversation);
        abort_unless($conversation->type === 'group', 400, 'Only groups can have participants removed.');

        $conversation->participants()->where('user_id', $user->id)->delete();
        return response()->json(['success' => true]);
    }

    public function archive(Request $request, Conversation $conversation): JsonResponse
    {
        $this->authorize('view', $conversation);
        $participant = $conversation->participants()->where('user_id', $request->user()->id)->first();
        if ($participant) {
            $participant->update(['archived_at' => now()]);
        }
        return response()->json(['success' => true]);
    }

    public function unarchive(Request $request, Conversation $conversation): JsonResponse
    {
        $this->authorize('view', $conversation);
        $participant = $conversation->participants()->where('user_id', $request->user()->id)->first();
        if ($participant) {
            $participant->update(['archived_at' => null]);
        }
        return response()->json(['success' => true]);
    }

    public function archived(Request $request): JsonResponse
    {
        $user = $request->user();
        $conversations = Conversation::whereHas('participants', fn ($q) => $q->where('user_id', $user->id)->whereNotNull('archived_at'))
            ->with(['participants.user', 'messages' => fn ($q) => $q->with(['user', 'attachments', 'forwardedFrom.user'])->latest()->limit(1)])
            ->orderByDesc('last_message_at')
            ->get();

        return response()->json([
            'conversations' => ConversationResource::collection($conversations)->resolve(),
        ]);
    }
}

```

# FILE: app/Http/Controllers/MessageController.php

```php
<?php

namespace App\Http\Controllers;

use App\Http\Requests\Chat\StoreMessageRequest;
use App\Http\Resources\MessageResource;
use App\Models\Conversation;
use App\Models\Message;
use App\Services\Chat\ChatService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    public function __construct(protected ChatService $chatService) {}

    public function store(StoreMessageRequest $request, Conversation $conversation): JsonResponse
    {
        $this->authorize('view', $conversation);
        $this->authorize('create', Message::class);

        $images = $request->hasFile('images') ? $request->file('images') : [];
        $replyToMessageId = $request->integer('reply_to_message_id') ?: null;

        if ($replyToMessageId) {
            abort_unless(
                Message::where('id', $replyToMessageId)->where('conversation_id', $conversation->id)->exists(),
                422,
                'Reply target does not belong to this conversation.'
            );
        }

        $message = $this->chatService->sendMessage(
            $conversation,
            $request->user(),
            $request->input('body'),
            $images,
            $replyToMessageId,
        );

        $message->load(['user', 'attachments', 'replyTo.user', 'reads']);

        return response()->json(new MessageResource($message));
    }

    public function update(Request $request, Conversation $conversation, Message $message): JsonResponse
    {
        $this->authorize('view', $conversation);
        $this->authorize('update', $message);
        abort_unless($message->conversation_id === $conversation->id, 404);
        $request->validate(['body' => 'required|string|max:10000']);

        $message->update([
            'body' => $request->body,
            'is_edited' => true,
            'edited_at' => now(),
        ]);

        $message->load(['user', 'attachments', 'replyTo.user', 'reads']);

        return response()->json(new MessageResource($message));
    }

    public function destroy(Conversation $conversation, Message $message): JsonResponse
    {
        $this->authorize('view', $conversation);
        $this->authorize('delete', $message);
        abort_unless($message->conversation_id === $conversation->id, 404);
        $message->delete();
        return response()->json(['success' => true]);
    }

    public function forward(Request $request, Conversation $conversation, Message $message): JsonResponse
    {
        $this->authorize('view', $conversation);
        $this->authorize('view', $message);
        abort_unless($message->conversation_id === $conversation->id, 404);

        $data = $request->validate([
            'conversation_ids' => ['required', 'array', 'min:1'],
            'conversation_ids.*' => ['integer', 'exists:conversations,id'],
        ]);

        $messages = [];
        foreach ($data['conversation_ids'] as $targetId) {
            $targetConversation = Conversation::findOrFail($targetId);
            $this->authorize('view', $targetConversation);

            $newMessage = $this->chatService->forwardMessage($targetConversation, $request->user(), $message);
            $newMessage->load(['user', 'attachments', 'replyTo.user', 'reads', 'forwardedFrom.user']);

            $messages[] = new MessageResource($newMessage);
        }

        return response()->json([
            'forwarded' => true,
            'messages' => $messages,
        ]);
    }

    public function typing(Request $request, Conversation $conversation): JsonResponse
    {
        $this->authorize('view', $conversation);
        $participant = $conversation->participants()
            ->where('user_id', $request->user()->id)
            ->first();
        if ($participant) {
            $participant->update(['typing_at' => now()]);
        }
        return response()->json(['typing' => true]);
    }

    public function typingUsers(Request $request, Conversation $conversation): JsonResponse
    {
        $this->authorize('view', $conversation);
        $typingUsers = $conversation->participants()
            ->where('user_id', '!=', $request->user()->id)
            ->whereNotNull('typing_at')
            ->where('typing_at', '>', now()->subSeconds(5))
            ->with('user')
            ->get()
            ->map(fn ($p) => [
                'id' => $p->user->id,
                'name' => $p->user->name,
            ]);
        return response()->json(['typing' => $typingUsers]);
    }
}

```

# FILE: app/Http/Resources/ConversationResource.php

```php
<?php

namespace App\Http\Resources;

use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ConversationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $user = $request->user();
        $participants = $this->relationLoaded('participants') ? $this->participants : $this->participants()->with('user')->get();
        $otherParticipants = $participants->filter(fn ($participant) => $participant->user_id !== $user?->id);
        $participantNames = $otherParticipants
            ->map(fn ($participant) => $participant->user?->name)
            ->filter()
            ->values();
        $displayName = $this->type === 'group'
            ? ($this->subject ?: $participantNames->implode(', '))
            : ($participantNames->first() ?: $this->subject);
        $displayName = $displayName ?: 'Conversation #' . $this->id;

        $participant = $this->relationLoaded('participants')
            ? $this->participants->firstWhere('user_id', $user?->id)
            : $this->participants()->where('user_id', $user?->id)->first();

        $onlineCount = $participants->filter(fn ($p) => $p->user?->last_seen_at && now()->diffInMinutes($p->user->last_seen_at, true) < 5)->count();

        return [
            'id' => $this->id,
            'type' => $this->type,
            'subject' => $this->subject,
            'category' => $this->category,
            'customCategory' => $this->custom_category,
            'displayName' => $displayName,
            'avatarInitials' => collect(explode(' ', $displayName))
                ->filter()
                ->take(2)
                ->map(fn ($part) => mb_strtoupper(mb_substr($part, 0, 1)))
                ->implode('') ?: '?',
            'participants' => $this->whenLoaded('participants', fn () =>
                ConversationParticipantResource::collection($this->participants)->resolve()
            ) ?? [],
            'participantsCount' => $participants->count(),
            'onlineCount' => $onlineCount,
            'lastMessage' => $this->whenLoaded('messages', function () {
                $first = $this->messages->first();
                return $first ? (new MessageResource($first))->resolve() : null;
            }),
            'lastMessageAt' => optional($this->last_message_at)->toISOString(),
            'unreadCount' => $this->when($user, function () use ($user) {
                return Message::where('conversation_id', $this->id)
                    ->where('user_id', '!=', $user->id)
                    ->whereDoesntHave('reads', fn ($q) => $q->where('user_id', $user->id))
                    ->count();
            }),
            'createdAt' => $this->created_at?->toISOString(),
            'archivedAt' => $participant ? optional($participant->archived_at)->toISOString() : null,
        ];
    }
}

```

# FILE: app/Http/Resources/MessageResource.php

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MessageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'body' => $this->body,
            'isEdited' => $this->is_edited,
            'isForwarded' => $this->is_forwarded,
            'forwardedFromMessageId' => $this->forwarded_from_message_id,
            'forwardedFrom' => $this->whenLoaded('forwardedFrom', fn () => $this->forwardedFrom ? [
                'id' => $this->forwardedFrom->id,
                'body' => $this->forwardedFrom->body,
                'userId' => $this->forwardedFrom->user_id,
                'userName' => $this->forwardedFrom->user?->name,
            ] : null),
            'userId' => $this->user_id,
            'userName' => $this->user?->name,
            'user' => new UserResource($this->whenLoaded('user')),
            'readBy' => $this->whenLoaded('reads', fn () => $this->reads->pluck('user_id')->toArray()),
            'replyTo' => $this->whenLoaded('replyTo', fn () => $this->replyTo ? [
                'id' => $this->replyTo->id,
                'body' => $this->replyTo->body,
                'userId' => $this->replyTo->user_id,
                'userName' => $this->replyTo->user?->name,
                'attachmentsCount' => $this->replyTo->relationLoaded('attachments') ? $this->replyTo->attachments->count() : 0,
            ] : null),
            'attachments' => MessageAttachmentResource::collection($this->whenLoaded('attachments')),
            'attachmentsCount' => $this->whenLoaded('attachments', fn () => $this->attachments->count()),
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->diffForHumans(),
        ];
    }
}

```

# FILE: app/Services/Chat/ChatService.php

```php
<?php

namespace App\Services\Chat;

use App\Models\Conversation;
use App\Models\ConversationParticipant;
use App\Models\Message;
use App\Models\MessageAttachment;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class ChatService
{
    public function findOrCreateDirectConversation(User $user1, User $user2): Conversation
    {
        $existing = Conversation::where('type', 'direct')
            ->whereHas('participants', fn ($q) => $q->where('user_id', $user1->id))
            ->whereHas('participants', fn ($q) => $q->where('user_id', $user2->id))
            ->first();

        if ($existing) return $existing;

        $conversation = Conversation::create(['type' => 'direct']);
        $conversation->participants()->createMany([
            ['user_id' => $user1->id],
            ['user_id' => $user2->id],
        ]);

        return $conversation;
    }

    public function sendMessage(
        Conversation $conversation,
        User $user,
        ?string $body = null,
        array $images = [],
        ?int $replyToMessageId = null,
        bool $isForwarded = false,
    ): Message {
        $message = Message::create([
            'conversation_id' => $conversation->id,
            'user_id' => $user->id,
            'body' => $body,
            'reply_to_message_id' => $replyToMessageId,
            'is_forwarded' => $isForwarded,
        ]);

        $this->storeAttachments($message, $user, $images);

        $conversation->update(['last_message_at' => now()]);

        $conversation->participants()
            ->where('user_id', '!=', $user->id)
            ->each(fn (ConversationParticipant $p) => $p->user->notify(
                new \App\Notifications\ChatMessageNotification($conversation, $message, $user)
            ));

        return $message;
    }

    public function forwardMessage(Conversation $targetConversation, User $user, Message $originalMessage): Message
    {
        $images = $originalMessage->attachments()->get()->map(function (MessageAttachment $att) {
            $path = 'message-attachments/' . $att->message_id . '/' . $att->filename;
            if (Storage::disk($att->disk ?? 'public')->exists($path)) {
                $localPath = Storage::disk($att->disk ?? 'public')->path($path);
                return new UploadedFile($localPath, $att->original_filename, $att->mime_type, null, true);
            }
            return null;
        })->filter()->values()->toArray();

        $message = Message::create([
            'conversation_id' => $targetConversation->id,
            'user_id' => $user->id,
            'body' => $originalMessage->body,
            'is_forwarded' => true,
            'forwarded_from_message_id' => $originalMessage->id,
        ]);

        foreach ($images as $image) {
            if ($image instanceof UploadedFile) {
                $storedPath = $image->store('message-attachments/' . $message->id, 'public');
                MessageAttachment::create([
                    'message_id' => $message->id,
                    'user_id' => $user->id,
                    'filename' => basename($storedPath),
                    'original_filename' => $image->getClientOriginalName(),
                    'mime_type' => $image->getMimeType(),
                    'size' => $image->getSize(),
                    'disk' => 'public',
                ]);
            }
        }

        $targetConversation->update(['last_message_at' => now()]);

        $targetConversation->participants()
            ->where('user_id', '!=', $user->id)
            ->each(fn (ConversationParticipant $p) => $p->user->notify(
                new \App\Notifications\ChatMessageNotification($targetConversation, $message, $user)
            ));

        return $message;
    }

    public function markAsRead(Conversation $conversation, User $user): void
    {
        $participant = $conversation->participants()->where('user_id', $user->id)->first();
        if ($participant) {
            $participant->update(['last_read_at' => now()]);
        }

        $conversation->messages()
            ->where('user_id', '!=', $user->id)
            ->whereDoesntHave('reads', fn ($q) => $q->where('user_id', $user->id))
            ->each(fn (Message $message) => $message->reads()->create(['user_id' => $user->id]));
    }

    public function unreadCount(User $user): int
    {
        return Message::whereHas('conversation.participants', fn ($q) => $q->where('user_id', $user->id))
            ->where('user_id', '!=', $user->id)
            ->whereDoesntHave('reads', fn ($q) => $q->where('user_id', $user->id))
            ->count();
    }

    public function updateLastSeen(User $user): void
    {
        $user->update(['last_seen_at' => now()]);
    }

    protected function storeAttachments(Message $message, User $user, array $images): void
    {
        foreach ($images as $image) {
            if ($image instanceof UploadedFile) {
                $storedPath = $image->store('message-attachments/' . $message->id, 'public');
                MessageAttachment::create([
                    'message_id' => $message->id,
                    'user_id' => $user->id,
                    'filename' => basename($storedPath),
                    'original_filename' => $image->getClientOriginalName(),
                    'mime_type' => $image->getMimeType(),
                    'size' => $image->getSize(),
                    'disk' => 'public',
                ]);
            }
        }
    }
}

```

# FILE: app/Models/Conversation.php

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Conversation extends Model
{
    protected $fillable = [
        'type', 'subject', 'category',
        'task_id', 'dossier_id', 'client_id', 'finance_document_id',
        'last_message_at',
    ];

    protected $casts = ['last_message_at' => 'datetime'];

    public function participants(): HasMany { return $this->hasMany(ConversationParticipant::class); }
    public function messages(): HasMany { return $this->hasMany(Message::class); }
    public function task(): BelongsTo { return $this->belongsTo(Task::class); }
    public function dossier(): BelongsTo { return $this->belongsTo(Dossier::class); }
    public function client(): BelongsTo { return $this->belongsTo(Client::class); }
    public function financeDocument(): BelongsTo { return $this->belongsTo(FinanceDocument::class); }
}

```

# FILE: app/Models/Message.php

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Message extends Model
{
    use SoftDeletes;

    protected $fillable = ['conversation_id', 'user_id', 'body', 'is_edited', 'edited_at', 'reply_to_message_id', 'is_forwarded', 'forwarded_from_message_id'];

    protected $casts = ['is_edited' => 'boolean', 'edited_at' => 'datetime', 'is_forwarded' => 'boolean'];

    public function conversation(): BelongsTo { return $this->belongsTo(Conversation::class); }
    public function user(): BelongsTo { return $this->belongsTo(User::class); }
    public function reads(): HasMany { return $this->hasMany(MessageRead::class); }
    public function attachments(): HasMany { return $this->hasMany(MessageAttachment::class); }
    public function replyTo(): BelongsTo { return $this->belongsTo(__CLASS__, 'reply_to_message_id'); }
    public function forwardedFrom(): BelongsTo { return $this->belongsTo(__CLASS__, 'forwarded_from_message_id'); }
}

```

# FILE: app/Models/MessageAttachment.php

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class MessageAttachment extends Model
{
    protected $fillable = ['message_id', 'user_id', 'filename', 'original_filename', 'mime_type', 'size', 'disk'];

    protected $casts = ['disk' => 'string'];

    public function message(): BelongsTo { return $this->belongsTo(Message::class); }
    public function user(): BelongsTo { return $this->belongsTo(User::class); }

    public function getUrlAttribute(): ?string
    {
        $path = 'message-attachments/' . $this->message_id . '/' . $this->filename;
        if ($this->disk === 'public') {
            return Storage::disk('public')->exists($path) ? Storage::disk('public')->url($path) : null;
        }
        return Storage::disk($this->disk ?? 'public')->exists($path) ? Storage::disk($this->disk ?? 'public')->url($path) : null;
    }

    public function getThumbnailUrlAttribute(): ?string
    {
        return $this->url;
    }
}

```

# FILE: app/Notifications/ChatMessageNotification.php

```php
<?php

namespace App\Notifications;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class ChatMessageNotification extends Notification
{
    use Queueable;

    public function __construct(public Conversation $conversation, public Message $message, public User $sender) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'conversation_id' => $this->conversation->id,
            'message_id' => $this->message->id,
            'sender_id' => $this->sender->id,
            'sender_name' => $this->sender->name,
            'body' => $this->message->body,
        ];
    }
}

```

# Safe .env realtime keys only

```text
BROADCAST_CONNECTION=log
QUEUE_CONNECTION=database
```
