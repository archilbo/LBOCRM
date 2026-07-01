# ARCHI LBO OS Messages Context
Generated: 07/01/2026 13:09:14


## Git Status

```text
 M PROMPT.ps1
 M app/Console/Commands/TaskChatQaCommand.php
 M app/Http/Controllers/ContractController.php
 M app/Http/Controllers/DocumentController.php
 M app/Http/Controllers/Finance/FinanceDocumentController.php
 M app/Http/Controllers/Finance/PaymentController.php
 M app/Http/Middleware/HandleInertiaRequests.php
 M app/Http/Resources/NotificationResource.php
 D exit
 M resources/js/components/layout/AppTopbar.tsx
 M resources/js/features/notifications/types.ts
 M resources/js/features/tasks/components/TaskBoard.tsx
 D resources/js/features/tasks/components/TaskList.tsx
 M resources/js/features/tasks/components/TaskOverview.tsx
 M resources/js/pages/Notifications/Index.tsx
 M resources/js/pages/Tasks/Index.tsx
?? .ai-context/
?? app/Notifications/ContractNotification.php
?? app/Notifications/DocumentNotification.php
?? app/Notifications/FinanceDocumentNotification.php
?? resources/js/features/notifications/components/
?? resources/js/features/notifications/helpers.ts

```

## Message Routes

```text

  GET|HEAD        inbox ..................................................... inbox.index › ConversationController@index
  POST            inbox ..................................................... inbox.store › ConversationController@store
  GET|HEAD        inbox/{conversation} ........................................ inbox.show › ConversationController@show
  POST            inbox/{conversation}/messages ......................... inbox.messages.store › MessageController@store
  PUT             inbox/{conversation}/messages/{message} ............. inbox.messages.update › MessageController@update
  DELETE          inbox/{conversation}/messages/{message} ........... inbox.messages.destroy › MessageController@destroy



```

## All Routes Summary

```text

  GET|HEAD        / .............................................................. dashboard › DashboardController@index
  GET|HEAD        accept-invitation/{token} ............. invitation.accept › Admin\AdminUserInvitationController@accept
  POST            accept-invitation/{token} ......... invitation.complete › Admin\AdminUserInvitationController@complete
  GET|HEAD        admin/users ...................................... admin.users.index › Admin\AdminUserController@index
  POST            admin/users/invite .................... admin.users.invite › Admin\AdminUserInvitationController@store
  PUT             admin/users/{user}/role ...................... admin.users.role › Admin\AdminUserController@updateRole
  GET|HEAD        archives .................................................... archives.index › ArchiveController@index
  POST            archives .................................................... archives.store › ArchiveController@store
  PUT             archives/{archiveRecord} .................................. archives.update › ArchiveController@update
  DELETE          archives/{archiveRecord} ................................ archives.destroy › ArchiveController@destroy
  PUT             archives/{archiveRecord}/status ..................... archives.status › ArchiveController@updateStatus
  GET|HEAD        authorizations .................................. authorizations.index › AuthorizationController@index
  POST            authorizations .................................. authorizations.store › AuthorizationController@store
  PUT             authorizations/{authorization} ................ authorizations.update › AuthorizationController@update
  DELETE          authorizations/{authorization} .............. authorizations.destroy › AuthorizationController@destroy
  PUT             authorizations/{authorization}/status ... authorizations.status › AuthorizationController@updateStatus
  GET|HEAD        backend-qa .............................................. backend-qa.index › BackendQaController@index
  GET|HEAD        calendar ................................................... calendar.index › CalendarController@index
  POST            calendar/events ................................ calendar.events.store › CalendarEventController@store
  GET|HEAD        calendar/events/{calendarEvent} .................. calendar.events.show › CalendarEventController@show
  PUT             calendar/events/{calendarEvent} .............. calendar.events.update › CalendarEventController@update
  DELETE          calendar/events/{calendarEvent} ............ calendar.events.destroy › CalendarEventController@destroy
  GET|HEAD        calendar/events/{calendarEvent}/conflicts calendar.events.conflicts › CalendarEventController@conflic…
  PUT             calendar/events/{calendarEvent}/move ............. calendar.events.move › CalendarEventController@move
  POST            calendar/events/{calendarEvent}/participants calendar.events.participants.store › CalendarParticipant…
  DELETE          calendar/events/{calendarEvent}/participants/{user} calendar.events.participants.destroy › CalendarPa…
  POST            calendar/events/{calendarEvent}/reminders calendar.events.reminders.store › CalendarReminderControlle…
  PUT             calendar/events/{calendarEvent}/resize ....... calendar.events.resize › CalendarEventController@resize
  PUT             calendar/reminders/{calendarReminder}/dismiss calendar.reminders.dismiss › CalendarReminderController…
  PUT             calendar/reminders/{calendarReminder}/snooze calendar.reminders.snooze › CalendarReminderController@s…
  GET|HEAD        clients ....................................................... clients.index › ClientController@index
  POST            clients ....................................................... clients.store › ClientController@store
  GET|HEAD        clients/{client} ................................................ clients.show › ClientController@show
  PUT|PATCH       clients/{client} ............................................ clients.update › ClientController@update
  DELETE          clients/{client} .......................................... clients.destroy › ClientController@destroy
  GET|HEAD        contracts ................................................. contracts.index › ContractController@index
  POST            contracts ................................................. contracts.store › ContractController@store
  PUT             contracts/{contract} .................................... contracts.update › ContractController@update
  DELETE          contracts/{contract} .................................. contracts.destroy › ContractController@destroy
  GET|HEAD        contracts/{contract}/download/generated contracts.download.generated › ContractController@downloadGen…
  GET|HEAD        contracts/{contract}/download/pdf ............ contracts.download.pdf › ContractController@downloadPdf
  PUT             contracts/{contract}/export-pdf .................. contracts.export-pdf › ContractController@exportPdf
  PUT             contracts/{contract}/generate ....................... contracts.generate › ContractController@generate
  PUT             contracts/{contract}/signed ......................... contracts.signed › ContractController@markSigned
  GET|HEAD        documents ................................................. documents.index › DocumentController@index
  POST            documents ................................................. documents.store › DocumentController@store
  DELETE          documents/{dossierDocument} ........................... documents.destroy › DocumentController@destroy
  GET|HEAD        documents/{dossierDocument}/download ................ documents.download › DocumentController@download
  PUT             documents/{dossierDocument}/status ................ documents.status › DocumentController@updateStatus
  GET|HEAD        dossiers .................................................... dossiers.index › DossierController@index
  POST            dossiers .................................................... dossiers.store › DossierController@store
  GET|HEAD        dossiers/{dossier} ............................................ dossiers.show › DossierController@show
  PUT|PATCH       dossiers/{dossier} ........................................ dossiers.update › DossierController@update
  DELETE          dossiers/{dossier} ...................................... dossiers.destroy › DossierController@destroy
  PUT             dossiers/{dossier}/workflow-requirements dossiers.workflow-requirements.update › DossierWorkflowRequi…
  GET|HEAD        finance ...................................... finance.index › Finance\FinanceDocumentController@index
  POST            finance ...................................................... finance.store › FinanceController@store
  GET|HEAD        finance/documents .................. finance.documents.index › Finance\FinanceDocumentController@index
  POST            finance/documents .................. finance.documents.store › Finance\FinanceDocumentController@store
  GET|HEAD        finance/documents/{financeDocument} .. finance.documents.show › Finance\FinanceDocumentController@show
  PUT             finance/documents/{financeDocument} finance.documents.update › Finance\FinanceDocumentController@upda…
  DELETE          finance/documents/{financeDocument} finance.documents.destroy › Finance\FinanceDocumentController@des…
  PUT             finance/documents/{financeDocument}/accept finance.documents.accept › Finance\FinanceDocumentControll…
  PUT             finance/documents/{financeDocument}/cancel finance.documents.cancel › Finance\FinanceDocumentControll…
  POST            finance/documents/{financeDocument}/convert-to-invoice finance.documents.convert-to-invoice › Finance…
  GET|HEAD        finance/documents/{financeDocument}/download finance.documents.download › Finance\FinanceDocumentCont…
  GET|HEAD        finance/documents/{financeDocument}/download-excel finance.documents.download-excel › Finance\Finance…
  GET|HEAD        finance/documents/{financeDocument}/download-pdf finance.documents.download-pdf › Finance\FinanceDocu…
  PUT             finance/documents/{financeDocument}/generate finance.documents.generate › Finance\FinanceDocumentCont…
  PUT             finance/documents/{financeDocument}/generate-excel finance.documents.generate-excel › Finance\Finance…
  PUT             finance/documents/{financeDocument}/generate-pdf finance.documents.generate-pdf › Finance\FinanceDocu…
  PUT             finance/documents/{financeDocument}/reject finance.documents.reject › Finance\FinanceDocumentControll…
  POST            finance/documents/{financeDocument}/reveal-generated-files finance.documents.reveal-generated-files  …
  GET|HEAD        finance/payments ............................ finance.payments.index › Finance\PaymentController@index
  POST            finance/payments ............................ finance.payments.store › Finance\PaymentController@store
  PUT             finance/payments/{payment} ................ finance.payments.update › Finance\PaymentController@update
  DELETE          finance/payments/{payment} .............. finance.payments.destroy › Finance\PaymentController@destroy
  GET|HEAD        finance/settings .......................... finance.settings › Finance\FinanceSettingsController@index
  PUT             finance/settings .................. finance.settings.update › Finance\FinanceSettingsController@update
  POST            finance/settings/logo .............. finance.settings.logo.store › Finance\CompanyLogoController@store
  DELETE          finance/settings/logo .......... finance.settings.logo.destroy › Finance\CompanyLogoController@destroy
  PUT             finance/settings/reset .............. finance.settings.reset › Finance\FinanceSettingsController@reset
  GET|HEAD        finance/templates ................. finance.templates.index › Finance\DocumentTemplateController@index
  POST            finance/templates ................. finance.templates.store › Finance\DocumentTemplateController@store
  PUT             finance/templates/reset/{type} finance.templates.reset › Finance\DocumentTemplateController@resetDefa…
  GET|HEAD        finance/templates/{documentTemplate} finance.templates.show › Finance\DocumentTemplateController@show
  PUT             finance/templates/{documentTemplate} finance.templates.update › Finance\DocumentTemplateController@up…
  DELETE          finance/templates/{documentTemplate} finance.templates.destroy › Finance\DocumentTemplateController@d…
  PUT             finance/templates/{documentTemplate}/default finance.templates.default › Finance\DocumentTemplateCont…
  POST            finance/templates/{documentTemplate}/duplicate finance.templates.duplicate › Finance\DocumentTemplate…
  GET|HEAD        finance/templates/{documentTemplate}/preview finance.templates.preview › Finance\DocumentTemplateCont…
  GET|HEAD        finance/templates/{documentTemplate}/versions finance.templates.versions.index › Finance\DocumentTemp…
  POST            finance/templates/{documentTemplate}/versions finance.templates.versions.store › Finance\DocumentTemp…
  DELETE          finance/templates/{documentTemplate}/versions/{version} finance.templates.versions.destroy › Finance\…
  PUT             finance/templates/{documentTemplate}/versions/{version}/restore finance.templates.versions.restore › …
  PUT             finance/{financeRecord} .................................... finance.update › FinanceController@update
  DELETE          finance/{financeRecord} .................................. finance.destroy › FinanceController@destroy
  GET|HEAD        finance/{financeRecord}/download ....................... finance.download › FinanceController@download
  GET|HEAD        finance/{financeRecord}/download-pdf ............ finance.download-pdf › FinanceController@downloadPdf
  PUT             finance/{financeRecord}/export-pdf .................. finance.export-pdf › FinanceController@exportPdf
  PUT             finance/{financeRecord}/generate ....................... finance.generate › FinanceController@generate
  PUT             finance/{financeRecord}/paid ............................... finance.paid › FinanceController@markPaid
  GET|HEAD        frontend-qa ................................................... frontend-qa.index › routes/web.php:157
  GET|HEAD        global-search ..................................... global-search.index › GlobalSearchController@index
  GET|HEAD        inbox ..................................................... inbox.index › ConversationController@index
  POST            inbox ..................................................... inbox.store › ConversationController@store
  GET|HEAD        inbox/{conversation} ........................................ inbox.show › ConversationController@show
  POST            inbox/{conversation}/messages ......................... inbox.messages.store › MessageController@store
  PUT             inbox/{conversation}/messages/{message} ............. inbox.messages.update › MessageController@update
  DELETE          inbox/{conversation}/messages/{message} ........... inbox.messages.destroy › MessageController@destroy
  GET|HEAD        intermediaries ................................... intermediaries.index › IntermediaryController@index
  POST            intermediaries ................................... intermediaries.store › IntermediaryController@store
  PUT|PATCH       intermediaries/{intermediary} .................. intermediaries.update › IntermediaryController@update
  DELETE          intermediaries/{intermediary} ................ intermediaries.destroy › IntermediaryController@destroy
  GET|HEAD        login ............................................. login › Auth\AuthenticatedSessionController@create
  POST            login ........................................ login.store › Auth\AuthenticatedSessionController@store
  POST            logout .......................................... logout › Auth\AuthenticatedSessionController@destroy
  GET|HEAD        notifications ..................................... notifications.index › NotificationController@index
  POST            notifications/read-all ................. notifications.read-all › NotificationController@markAllAsRead
  POST            notifications/{id}/read ....................... notifications.read › NotificationController@markAsRead
  GET|HEAD        operations/reports ....................... operations.reports.index › OperationsReportController@index
  GET|HEAD        storage/{path} storage.local › vendor/laravel/framework/src/Illuminate/Filesystem/FilesystemServicePr…
  PUT             storage/{path} storage.local.upload › vendor/laravel/framework/src/Illuminate/Filesystem/FilesystemSe…
  GET|HEAD        task-requests ...................................... task-requests.index › TaskRequestController@index
  POST            task-requests ...................................... task-requests.store › TaskRequestController@store
  PUT             task-requests/{taskRequest} ...................... task-requests.update › TaskRequestController@update
  POST            task-requests/{taskRequest}/accept ............... task-requests.accept › TaskRequestController@accept
  POST            task-requests/{taskRequest}/convert ............ task-requests.convert › TaskRequestController@convert
  POST            task-requests/{taskRequest}/reject ............... task-requests.reject › TaskRequestController@reject
  GET|HEAD        tasks ............................................................. tasks.index › TaskController@index
  POST            tasks ............................................................. tasks.store › TaskController@store
  GET|HEAD        tasks/suggestions ........................... tasks.suggestions.index › TaskSuggestionController@index
  POST            tasks/suggestions/{suggestion}/create-task tasks.suggestions.create-task › TaskSuggestionController@c…
  POST            tasks/suggestions/{suggestion}/dismiss .. tasks.suggestions.dismiss › TaskSuggestionController@dismiss
  GET|HEAD        tasks/{task} ........................................................ tasks.show › TaskController@show
  PUT             tasks/{task} .................................................... tasks.update › TaskController@update
  DELETE          tasks/{task} .................................................. tasks.destroy › TaskController@destroy
  POST            tasks/{task}/attachments .................... tasks.attachments.store › TaskAttachmentController@store
  DELETE          tasks/{task}/attachments/{attachment} ... tasks.attachments.destroy › TaskAttachmentController@destroy
  GET|HEAD        tasks/{task}/checklist ......................... tasks.checklist.index › TaskChecklistController@index
  POST            tasks/{task}/checklist ......................... tasks.checklist.store › TaskChecklistController@store
  DELETE          tasks/{task}/checklist/{item} .............. tasks.checklist.destroy › TaskChecklistController@destroy
  PUT             tasks/{task}/checklist/{item}/toggle ......... tasks.checklist.toggle › TaskChecklistController@toggle
  GET|HEAD        tasks/{task}/comments ............................. tasks.comments.index › TaskCommentController@index
  POST            tasks/{task}/comments ............................. tasks.comments.store › TaskCommentController@store
  DELETE          tasks/{task}/comments/{comment} ............... tasks.comments.destroy › TaskCommentController@destroy
  PUT             tasks/{task}/status ....................................... tasks.status › TaskController@updateStatus
  GET|HEAD        up ....... vendor/laravel/framework/src/Illuminate/Foundation/Configuration/ApplicationBuilder.php:224
  GET|HEAD        workload ................................................... workload.index › WorkloadController@index

                                                                                                    Showing [149] routes


```

## Files Included

- app/Http/Controllers/ConversationController.php
- app/Http/Controllers/MessageController.php
- app/Http/Resources/ConversationResource.php
- app/Http/Resources/MessageResource.php
- app/Models/Conversation.php
- app/Models/Message.php
- app/Models/User.php
- app\Console\Commands\FinanceDocumentLockGuardQaCommand.php
- app\Console\Commands\FinanceExportNumberingQaCommand.php
- app\Console\Commands\FinanceExportQaCommand.php
- app\Console\Commands\FinanceNumberingLockQaCommand.php
- app\Console\Commands\FinanceNumberingQaCommand.php
- app\Console\Commands\FinancePaymentLedgerReceiptQaCommand.php
- app\Console\Commands\FinancePaymentReceiptExportQaCommand.php
- app\Console\Commands\FinancePaymentReceiptPayloadQaCommand.php
- app\Console\Commands\FinanceUiLockAwarenessDiscoveryCommand.php
- app\Console\Commands\FinanceUiLockPayloadQaCommand.php
- app\Console\Commands\OperationsFoundationQaCommand.php
- app\Console\Commands\TaskChatQaCommand.php
- app\Console\Commands\TestContractGeneration.php
- app\Console\Commands\TestFinanceBuilderCommand.php
- app\Console\Commands\TestFinanceExportCommand.php
- app\Console\Commands\TestFinanceGeneration.php
- app\Console\Commands\WorkflowGroupingQaCommand.php
- app\Http\Controllers\ContractController.php
- app\Http\Controllers\ConversationController.php
- app\Http\Controllers\Finance\FinanceDocumentController.php
- app\Http\Controllers\FinanceController.php
- app\Http\Controllers\MessageController.php
- app\Http\Controllers\NotificationController.php
- app\Http\Controllers\TaskAttachmentController.php
- app\Http\Controllers\TaskController.php
- app\Http\Middleware\HandleInertiaRequests.php
- app\Http\Requests\Auth\LoginRequest.php
- app\Http\Requests\Chat\StoreConversationRequest.php
- app\Http\Requests\Chat\StoreMessageRequest.php
- app\Http\Requests\Task\StoreTaskRequest.php
- app\Http\Requests\Task\UpdateTaskRequest.php
- app\Http\Resources\CalendarParticipantResource.php
- app\Http\Resources\ConversationParticipantResource.php
- app\Http\Resources\ConversationResource.php
- app\Http\Resources\MessageResource.php
- app\Http\Resources\NotificationResource.php
- app\Http\Resources\TaskAttachmentResource.php
- app\Http\Resources\TaskResource.php
- app\Models\CalendarEventParticipant.php
- app\Models\Conversation.php
- app\Models\ConversationParticipant.php
- app\Models\Message.php
- app\Models\MessageAttachment.php
- app\Models\MessageRead.php
- app\Models\Task.php
- app\Models\TaskAttachment.php
- app\Notifications\ChatMessageNotification.php
- app\Policies\ConversationPolicy.php
- app\Policies\MessagePolicy.php
- app\Services\Chat\ChatService.php
- app\Services\Dashboard\DashboardCommandCenterService.php
- app\Services\Dossiers\DossierWorkflowRequirementService.php
- app\Services\Dossiers\DossierWorkflowStepperService.php
- app\Services\Finance\FinanceDocumentLockGuard.php
- app\Services\Finance\FinanceDocumentLockStatePresenter.php
- app\Services\Finance\FinanceExcelExporter.php
- app\Services\Finance\FinancePdfGenerator.php
- app\Services\Finance\FinanceSettingsService.php
- app\Services\Finance\PaymentLedgerService.php
- app\Services\Task\TaskQueryService.php
- app\Services\Task\TaskRequestService.php
- app\Services\WordDocumentConverter.php
- database\migrations\2026_06_30_110000_create_tasks_tables.php
- database\migrations\2026_06_30_110001_create_conversations_tables.php
- database\migrations\2026_06_30_110002_create_notifications_table.php
- database\migrations\2026_06_30_120000_extend_operations_center_foundation.php
- database\migrations\2026_07_01_110000_create_calendar_tables.php
- resources/css/app.css
- resources/css/archilbo-theme.css
- resources/js/locales/en.ts
- resources\js\components\layout\AppTopbar.tsx
- resources\js\components\ui\AppDatePicker.tsx
- resources\js\components\ui\AppFormErrorSummary.tsx
- resources\js\components\ui\AppMoneyInput.tsx
- resources\js\components\ui\AppTextarea.tsx
- resources\js\components\ui\AppTextField.tsx
- resources\js\features\calendar\types.ts
- resources\js\features\chat\types.ts
- resources\js\features\clients\components\DocumentIntelligenceChecklist.tsx
- resources\js\features\dashboard\types.ts
- resources\js\features\documents\components\DocumentUploadCard.tsx
- resources\js\features\documents\drawers\DocumentUploadDrawer.tsx
- resources\js\features\finance\components\FinanceDocumentLockNotice.tsx
- resources\js\features\finance\components\FinanceDocumentPreview.tsx
- resources\js\features\finance\drawers\FinanceDocumentBuilderDrawer.tsx
- resources\js\features\finance\drawers\FinanceDocumentDrawer.tsx
- resources\js\features\finance\drawers\PaymentDrawer.tsx
- resources\js\features\finance\templates\TemplateEditorForm.tsx
- resources\js\features\finance\types.ts
- resources\js\features\inbox\components\ConversationList.tsx
- resources\js\features\inbox\components\MessageThread.tsx
- resources\js\features\inbox\components\NewConversationDrawer.tsx
- resources\js\features\notifications\helpers.ts
- resources\js\features\notifications\types.ts
- resources\js\features\tasks\components\TaskCard.tsx
- resources\js\features\tasks\components\TaskDetailDrawer.tsx
- resources\js\features\tasks\types.ts
- resources\js\lib\appRoutes.ts
- resources\js\lib\i18n.ts
- resources\js\lib\prototypeActions.ts
- resources\js\locales\en.ts
- resources\js\pages\Clients\Show.tsx
- resources\js\pages\Dashboard.tsx
- resources\js\pages\Finance\Documents\Show.tsx
- resources\js\pages\Finance\Settings\Index.tsx
- resources\js\pages\Inbox\Index.tsx
- resources\js\pages\Notifications\Index.tsx
- resources\js\pages\Tasks\Index.tsx
- routes/web.php
- routes\web.php

## FILE: app/Http/Controllers/ConversationController.php

```php
<?php

namespace App\Http\Controllers;

use App\Http\Requests\Chat\StoreConversationRequest;
use App\Http\Resources\ConversationResource;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use App\Services\Chat\ChatService;
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
        $conversations = Conversation::whereHas('participants', fn ($q) => $q->where('user_id', $user->id))
            ->with([
                'participants.user',
                'messages' => fn ($q) => $q->latest()->limit(1),
            ])
            ->orderByDesc('last_message_at')
            ->get();

        $users = User::where('id', '!=', $user->id)->orderBy('name')->get()->map(fn (User $u) => [
            'id' => $u->id, 'name' => $u->name, 'email' => $u->email,
        ]);

        return Inertia::render('Inbox/Index', [
            'conversations' => ConversationResource::collection($conversations)->resolve(),
            'users' => $users,
            'unreadCount' => $this->chatService->unreadCount($user),
        ]);
    }

    public function show(Request $request, Conversation $conversation)
    {
        $this->authorize('view', $conversation);
        $conversation->load(['participants.user', 'messages.user', 'messages.reads', 'messages.attachments']);
        $this->chatService->markAsRead($conversation, $request->user());

        return response()->json([
            'conversation' => (new ConversationResource($conversation))->resolve(),
            'messages' => $conversation->messages->map(fn ($m) => [
                'id' => $m->id,
                'body' => $m->body,
                'isEdited' => $m->is_edited,
                'userId' => $m->user_id,
                'userName' => $m->user->name,
                'readBy' => $m->reads->pluck('user_id'),
                'createdAt' => $m->created_at?->toISOString(),
            ]),
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
            $conversation = Conversation::create([
                'type' => 'group',
                'subject' => $data['subject'] ?? null,
            ]);
            $participants = array_merge($userIds, [$request->user()->id]);
            foreach ($participants as $uid) {
                $conversation->participants()->create(['user_id' => $uid]);
            }
        }

        return redirect()->route('inbox.index');
    }
}

```

## FILE: app/Http/Controllers/MessageController.php

```php
<?php

namespace App\Http\Controllers;

use App\Http\Requests\Chat\StoreMessageRequest;
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
        $message = $this->chatService->sendMessage($conversation, $request->user(), $request->validated('body'));
        $message->load('user');

        return response()->json([
            'id' => $message->id,
            'body' => $message->body,
            'userId' => $message->user_id,
            'userName' => $message->user->name,
            'createdAt' => $message->created_at?->toISOString(),
        ]);
    }

    public function update(Request $request, Conversation $conversation, Message $message): RedirectResponse
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

        return redirect()->back();
    }

    public function destroy(Conversation $conversation, Message $message): RedirectResponse
    {
        $this->authorize('view', $conversation);
        $this->authorize('delete', $message);
        abort_unless($message->conversation_id === $conversation->id, 404);
        $message->delete();
        return redirect()->back();
    }
}

```

## FILE: app/Http/Resources/ConversationResource.php

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
        $participant = $this->relationLoaded('participants')
            ? $this->participants->firstWhere('user_id', $user?->id)
            : $this->participants()->where('user_id', $user?->id)->first();

        return [
            'id' => $this->id,
            'type' => $this->type,
            'subject' => $this->subject,
            'participants' => ConversationParticipantResource::collection($this->whenLoaded('participants')),
            'lastMessage' => new MessageResource($this->whenLoaded('messages', fn () => $this->messages->last())),
            'lastMessageAt' => optional($this->last_message_at)->toISOString(),
            'unreadCount' => $this->when($user, function () use ($user) {
                return Message::where('conversation_id', $this->id)
                    ->where('user_id', '!=', $user->id)
                    ->whereDoesntHave('reads', fn ($q) => $q->where('user_id', $user->id))
                    ->count();
            }),
            'createdAt' => $this->created_at?->toISOString(),
        ];
    }
}

```

## FILE: app/Http/Resources/MessageResource.php

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
            'user' => new UserResource($this->whenLoaded('user')),
            'readBy' => $this->whenLoaded('reads', fn () => $this->reads->pluck('user_id')),
            'attachments' => $this->whenLoaded('attachments'),
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->diffForHumans(),
        ];
    }
}

```

## FILE: app/Models/Conversation.php

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Conversation extends Model
{
    protected $fillable = [
        'type', 'subject',
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

## FILE: app/Models/Message.php

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

    protected $fillable = ['conversation_id', 'user_id', 'body', 'is_edited', 'edited_at'];

    protected $casts = ['is_edited' => 'boolean', 'edited_at' => 'datetime'];

    public function conversation(): BelongsTo { return $this->belongsTo(Conversation::class); }
    public function user(): BelongsTo { return $this->belongsTo(User::class); }
    public function reads(): HasMany { return $this->hasMany(MessageRead::class); }
    public function attachments(): HasMany { return $this->hasMany(MessageAttachment::class); }
}

```

## FILE: app/Models/User.php

```php
<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

#[Fillable(['name', 'email', 'password', 'invitation_token', 'invited_at', 'accepted_at', 'invited_by'])]
#[Hidden(['password', 'remember_token', 'invitation_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, HasRoles, Notifiable;

    public function invitedBy(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(__CLASS__, 'invited_by');
    }

    public function tasksAssigned(): BelongsToMany
    {
        return $this->belongsToMany(Task::class, 'task_assignees');
    }

    public function tasksWatching(): BelongsToMany
    {
        return $this->belongsToMany(Task::class, 'task_watchers');
    }

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'invited_at' => 'datetime',
            'accepted_at' => 'datetime',
        ];
    }
}

```

## FILE: app\Console\Commands\FinanceDocumentLockGuardQaCommand.php

```php
<?php

namespace App\Console\Commands;

use App\Models\FinanceDocument;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\ValidationException;
use RuntimeException;
use Throwable;

class FinanceDocumentLockGuardQaCommand extends Command
{
    protected $signature = 'archilbo:finance-document-lock-guard-qa';

    protected $description = 'Verify locked finance documents cannot change number-critical fields but can regenerate exports.';

    public function handle(): int
    {
        $this->info('Finance document lock guard QA started...');

        if (! Schema::hasTable('finance_documents')) {
            $this->error('Missing table: finance_documents.');

            return self::FAILURE;
        }

        foreach (['number', 'type', 'number_locked', 'number_locked_at'] as $column) {
            if (! Schema::hasColumn('finance_documents', $column)) {
                $this->error("Missing finance_documents column: {$column}");

                return self::FAILURE;
            }
        }

        $document = FinanceDocument::query()
            ->where('number_locked', true)
            ->orderByDesc('id')
            ->first();

        if (! $document) {
            $this->error('No locked finance document found. Run finance export QA first.');

            return self::FAILURE;
        }

        $this->line("Testing locked document: {$document->number}");

        $blockedChecks = [
            'number' => $document->number.'-BAD',
            'type' => $document->type === 'invoice' ? 'quote' : 'invoice',
            'number_locked' => false,
        ];

        if (Schema::hasColumn('finance_documents', 'issue_date')) {
            $blockedChecks['issue_date'] = now()->addDay()->toDateString();
        }

        if (Schema::hasColumn('finance_documents', 'number_locked_at')) {
            $blockedChecks['number_locked_at'] = now()->addDay();
        }

        foreach ($blockedChecks as $field => $badValue) {
            $fresh = FinanceDocument::query()->findOrFail($document->id);

            try {
                DB::transaction(function () use ($fresh, $field, $badValue): void {
                    $fresh->{$field} = $badValue;
                    $fresh->save();
                });

                $this->error("Locked field was changed but should be blocked: {$field}");

                return self::FAILURE;
            } catch (ValidationException) {
                $this->line("OK blocked locked field: {$field}");
            } catch (Throwable $e) {
                $this->error("Unexpected error while checking {$field}: ".$e->getMessage());

                return self::FAILURE;
            }
        }

        try {
            DB::transaction(function () use ($document): void {
                $fresh = FinanceDocument::query()->findOrFail($document->id);
                $fresh->number_locked = true;
                $fresh->save();

                throw new RuntimeException('__ROLLBACK_IDEMPOTENT_LOCK_TEST__');
            });
        } catch (RuntimeException $e) {
            if ($e->getMessage() !== '__ROLLBACK_IDEMPOTENT_LOCK_TEST__') {
                $this->error('Idempotent lock write failed: '.$e->getMessage());

                return self::FAILURE;
            }

            $this->line('OK idempotent number_locked=true write allowed.');
        } catch (Throwable $e) {
            $this->error('Idempotent lock write failed: '.$e->getMessage());

            return self::FAILURE;
        }

        $safeField = null;

        foreach (['notes', 'status', 'pdf_path', 'excel_path'] as $candidate) {
            if (Schema::hasColumn('finance_documents', $candidate)) {
                $safeField = $candidate;
                break;
            }
        }

        if ($safeField) {
            try {
                DB::transaction(function () use ($document, $safeField): void {
                    $fresh = FinanceDocument::query()->findOrFail($document->id);
                    $original = $fresh->{$safeField};

                    if (is_string($original) || is_null($original)) {
                        $fresh->{$safeField} = trim((string) $original).' ';
                    } else {
                        $fresh->{$safeField} = $original;
                    }

                    $fresh->save();

                    throw new RuntimeException('__ROLLBACK_SAFE_FIELD_TEST__');
                });
            } catch (RuntimeException $e) {
                if ($e->getMessage() !== '__ROLLBACK_SAFE_FIELD_TEST__') {
                    $this->error('Safe field update failed: '.$e->getMessage());

                    return self::FAILURE;
                }

                $this->line("OK safe field can be updated: {$safeField}");
            } catch (Throwable $e) {
                $this->error('Safe field update failed: '.$e->getMessage());

                return self::FAILURE;
            }
        }

        $document->refresh();

        $this->table(
            ['ID', 'Number', 'Type', 'Locked', 'Locked At'],
            [[
                $document->id,
                $document->number,
                $document->type,
                $document->number_locked ? 'yes' : 'no',
                (string) $document->number_locked_at,
            ]]
        );

        $this->info('Finance document lock guard QA passed.');

        return self::SUCCESS;
    }
}
```

## FILE: app\Console\Commands\FinanceExportNumberingQaCommand.php

```php
<?php

namespace App\Console\Commands;

use App\Services\Finance\FinanceExportNumberPayloadBuilder;
use App\Services\Finance\FinanceLockedDocumentNumberResolver;
use Illuminate\Console\Command;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Throwable;

class FinanceExportNumberingQaCommand extends Command
{
    protected $signature = 'archilbo:finance-export-numbering-qa';

    protected $description = 'Run QA checks for locked finance document numbers inside PDF/Excel export payloads.';

    public function handle(
        FinanceLockedDocumentNumberResolver $resolver,
        FinanceExportNumberPayloadBuilder $payloadBuilder,
    ): int {
        $this->info('Finance export numbering QA started...');

        try {
            config([
                'archilbo_finance_numbering.types.qa_export_invoice' => [
                    'label' => 'QA Export Invoice',
                    'prefix' => 'QAEXP',
                    'yearly_reset' => true,
                ],
            ]);

            DB::table('finance_document_number_counters')
                ->where('document_type', 'qa_export_invoice')
                ->delete();

            Schema::dropIfExists('finance_export_numbering_qa_documents');

            Schema::create('finance_export_numbering_qa_documents', function (Blueprint $table): void {
                $table->id();
                $table->string('document_number', 80)->nullable();
                $table->boolean('number_locked')->default(false);
                $table->timestamp('number_locked_at')->nullable();
                $table->timestamps();
            });

            $document = new class extends Model {
                protected $table = 'finance_export_numbering_qa_documents';

                protected $guarded = [];
            };

            $document->save();

            $first = $resolver->forModel($document, 'qa_export_invoice', 'document_number', '2026-08-01');

            $document->refresh();

            $payload = $payloadBuilder->build(
                document: $document,
                documentType: 'qa_export_invoice',
                numberColumn: 'document_number',
                date: '2026-08-01',
                payload: [
                    'client_name' => 'QA Client',
                    'total_ttc' => '1200.00',
                ],
            );

            $second = $resolver->forModel($document, 'qa_export_invoice', 'document_number', '2026-08-01');

            if ($first !== 'QAEXP-2026-0001') {
                throw new \RuntimeException("First export number invalid: {$first}");
            }

            if ($second !== $first) {
                throw new \RuntimeException("Export number changed from {$first} to {$second}");
            }

            foreach ([
                'document_number',
                'finance_document_number',
                'generated_document_number',
                'locked_document_number',
                'display_number',
            ] as $key) {
                if (($payload[$key] ?? null) !== $first) {
                    throw new \RuntimeException("Payload key {$key} does not contain locked number.");
                }
            }

            if ((bool) $document->number_locked !== true) {
                throw new \RuntimeException('number_locked was not set to true.');
            }

            if (empty($document->number_locked_at)) {
                throw new \RuntimeException('number_locked_at was not set.');
            }

            $nextDocument = new class extends Model {
                protected $table = 'finance_export_numbering_qa_documents';

                protected $guarded = [];
            };

            $nextDocument->save();

            $next = $resolver->forModel($nextDocument, 'qa_export_invoice', 'document_number', '2026-08-01');

            if ($next !== 'QAEXP-2026-0002') {
                throw new \RuntimeException("Next export number invalid: {$next}");
            }

            Schema::dropIfExists('finance_export_numbering_qa_documents');

            $this->line("OK Export payload uses locked number: {$first}");
            $this->info('Finance export numbering QA passed.');

            return self::SUCCESS;
        } catch (Throwable $e) {
            try {
                Schema::dropIfExists('finance_export_numbering_qa_documents');
            } catch (Throwable) {
                //
            }

            $this->error('Finance export numbering QA failed.');
            $this->error($e->getMessage());

            if ($this->option('verbose')) {
                $this->line($e->getTraceAsString());
            }

            return self::FAILURE;
        }
    }
}
```

## FILE: app\Console\Commands\FinanceExportQaCommand.php

```php
<?php

namespace App\Console\Commands;

use App\Models\FinanceDocument;
use App\Services\Finance\FinanceExcelExporter;
use App\Services\Finance\FinancePdfGenerator;
use App\Services\Finance\FinanceSettingsService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use PhpOffice\PhpSpreadsheet\IOFactory;
use Throwable;

class FinanceExportQaCommand extends Command
{
    protected $signature = 'archilbo:finance-export-qa
        {document_id? : Optional finance document id}
        {--create-sample : Try to create sample quote and invoice documents if no documents exist}';

    protected $description = 'Generate and verify finance PDF/XLSX exports.';

    public function handle(): int
    {
        $this->info('ARCHI LBO finance export QA');

        if (!class_exists(FinanceDocument::class)) {
            $this->error('FinanceDocument model is missing.');
            return self::FAILURE;
        }

        if (!class_exists(FinancePdfGenerator::class)) {
            $this->error('FinancePdfGenerator service is missing.');
            return self::FAILURE;
        }

        if (!class_exists(FinanceExcelExporter::class)) {
            $this->error('FinanceExcelExporter service is missing.');
            return self::FAILURE;
        }

        if (!Schema::hasTable('finance_documents')) {
            $this->error('finance_documents table is missing.');
            return self::FAILURE;
        }

        if ($this->option('create-sample') && FinanceDocument::query()->count() === 0) {
            $this->warn('No finance documents found. Trying to create sample documents...');
            $this->createSampleDocuments();
        }

        $documentId = $this->argument('document_id');

        $documents = $documentId
            ? FinanceDocument::query()->whereKey($documentId)->get()
            : FinanceDocument::query()->latest('id')->limit(3)->get();

        if ($documents->isEmpty()) {
            $this->warn('No finance documents found. Create one in /finance, then run this command again.');
            return self::SUCCESS;
        }

        $failures = 0;

        foreach ($documents as $document) {
            $failures += $this->checkDocument($document);
        }

        if ($failures > 0) {
            $this->error("Finance export QA finished with {$failures} issue(s).");
            return self::FAILURE;
        }

        $this->info('Finance export QA passed.');
        return self::SUCCESS;
    }

    private function checkDocument(FinanceDocument $document): int
    {
        $failures = 0;

        $label = '#' . $document->id . ' ' . ($document->number ?? $document->document_number ?? 'NO-NUMBER');

        $this->line('');
        $this->line('<fg=cyan>Checking finance document ' . $label . '</>');

        try {
            $document->loadMissing(['items', 'payments', 'client', 'dossier', 'template']);
        } catch (Throwable) {
            // Some older relation names may not exist. Export services will decide.
        }

        $failures += $this->checkPdf($document);
        $failures += $this->checkExcel($document);

        return $failures;
    }

    private function checkPdf(FinanceDocument $document): int
    {
        try {
            $path = app(FinancePdfGenerator::class)->generate($document);
            $document->refresh();

            $path = $path ?: ($document->pdf_path ?? null);

            if (!$path) {
                return $this->qaFail('PDF generator did not return or save a path.');
            }

            if (!Storage::disk('public')->exists($path)) {
                return $this->qaFail("PDF file does not exist on public disk: {$path}");
            }

            $absolutePath = Storage::disk('public')->path($path);
            $size = filesize($absolutePath) ?: 0;

            if ($size < 100) {
                return $this->qaFail("PDF file is too small: {$path}");
            }

            $handle = fopen($absolutePath, 'rb');
            $signature = $handle ? fread($handle, 4) : '';
            if ($handle) {
                fclose($handle);
            }

            if ($signature !== '%PDF') {
                return $this->qaFail("PDF signature is invalid: {$path}");
            }

            $this->line('<fg=green>PASS</> PDF generated: ' . $path . ' (' . $size . ' bytes)');
            return 0;
        } catch (Throwable $exception) {
            return $this->qaFail('PDF export failed: ' . $exception->getMessage());
        }
    }

    private function checkExcel(FinanceDocument $document): int
    {
        try {
            $path = app(FinanceExcelExporter::class)->generate($document);
            $document->refresh();

            $path = $path ?: ($document->excel_path ?? null);

            if (!$path) {
                return $this->qaFail('Excel exporter did not return or save a path.');
            }

            if (!Storage::disk('public')->exists($path)) {
                return $this->qaFail("XLSX file does not exist on public disk: {$path}");
            }

            $absolutePath = Storage::disk('public')->path($path);
            $size = filesize($absolutePath) ?: 0;

            if ($size < 100) {
                return $this->qaFail("XLSX file is too small: {$path}");
            }

            $handle = fopen($absolutePath, 'rb');
            $signature = $handle ? fread($handle, 2) : '';
            if ($handle) {
                fclose($handle);
            }

            if ($signature !== 'PK') {
                return $this->qaFail("XLSX signature is invalid. It must start with PK: {$path}");
            }

            IOFactory::load($absolutePath);

            $this->line('<fg=green>PASS</> Excel generated: ' . $path . ' (' . $size . ' bytes)');
            return 0;
        } catch (Throwable $exception) {
            return $this->qaFail('Excel export failed: ' . $exception->getMessage());
        }
    }

    private function createSampleDocuments(): void
    {
        if (!Schema::hasTable('finance_documents')) {
            return;
        }

        try {
            $this->createSampleDocument('quote');
            $this->createSampleDocument('invoice');
        } catch (Throwable $exception) {
            $this->warn('Could not create sample finance documents automatically: ' . $exception->getMessage());
        }
    }

    private function createSampleDocument(string $type): void
    {
        $documentColumns = Schema::getColumnListing('finance_documents');
        $itemColumns = Schema::hasTable('finance_document_items')
            ? Schema::getColumnListing('finance_document_items')
            : [];

        $currency = FinanceSettingsService::getCurrency();
        $number = ($type === 'invoice' ? 'FAC' : 'DEV') . '-QA-' . now()->format('YmdHis');

        $data = [];

        $this->putIfColumn($data, $documentColumns, 'type', $type);
        $this->putIfColumn($data, $documentColumns, 'status', 'draft');
        $this->putIfColumn($data, $documentColumns, 'number', $number);
        $this->putIfColumn($data, $documentColumns, 'document_number', $number);
        $this->putIfColumn($data, $documentColumns, 'currency', $currency);
        $this->putIfColumn($data, $documentColumns, 'issue_date', now()->toDateString());
        $this->putIfColumn($data, $documentColumns, 'due_date', now()->addDays(30)->toDateString());
        $this->putIfColumn($data, $documentColumns, 'valid_until', now()->addDays(30)->toDateString());
        $this->putIfColumn($data, $documentColumns, 'notes', 'QA document generated automatically.');
        $this->putIfColumn($data, $documentColumns, 'terms', 'QA terms.');
        $this->putIfColumn($data, $documentColumns, 'subtotal_ht', 10000);
        $this->putIfColumn($data, $documentColumns, 'discount_total', 0);
        $this->putIfColumn($data, $documentColumns, 'tax_total', 2000);
        $this->putIfColumn($data, $documentColumns, 'total_ttc', 12000);
        $this->putIfColumn($data, $documentColumns, 'paid_total', 0);
        $this->putIfColumn($data, $documentColumns, 'remaining_total', 12000);

        if (in_array('client_id', $documentColumns, true) && Schema::hasTable('clients')) {
            $clientId = DB::table('clients')->value('id');
            if ($clientId) {
                $data['client_id'] = $clientId;
            }
        }

        if (in_array('dossier_id', $documentColumns, true) && Schema::hasTable('dossiers')) {
            $dossierId = DB::table('dossiers')->value('id');
            if ($dossierId) {
                $data['dossier_id'] = $dossierId;
            }
        }

        if (in_array('template_id', $documentColumns, true) && Schema::hasTable('document_templates')) {
            $templateId = DB::table('document_templates')
                ->where('type', $type)
                ->where('is_default', true)
                ->value('id');

            if ($templateId) {
                $data['template_id'] = $templateId;
            }
        }

        if (in_array('created_at', $documentColumns, true)) {
            $data['created_at'] = now();
        }

        if (in_array('updated_at', $documentColumns, true)) {
            $data['updated_at'] = now();
        }

        $documentId = DB::table('finance_documents')->insertGetId($data);

        if (!$itemColumns) {
            return;
        }

        $fk = in_array('finance_document_id', $itemColumns, true)
            ? 'finance_document_id'
            : (in_array('document_id', $itemColumns, true) ? 'document_id' : null);

        if (!$fk) {
            return;
        }

        $items = [
            [
                'title' => 'Etudes architecturales',
                'description' => 'Etudes architecturales',
                'quantity' => 1,
                'unit' => 'forfait',
                'unit_price' => 8000,
                'discount_rate' => 0,
                'tva_rate' => 20,
                'total_ht' => 8000,
                'total_tva' => 1600,
                'total_ttc' => 9600,
            ],
            [
                'title' => 'Suivi dossier administratif',
                'description' => 'Suivi dossier administratif',
                'quantity' => 1,
                'unit' => 'forfait',
                'unit_price' => 2000,
                'discount_rate' => 0,
                'tva_rate' => 20,
                'total_ht' => 2000,
                'total_tva' => 400,
                'total_ttc' => 2400,
            ],
        ];

        foreach ($items as $index => $item) {
            $row = [$fk => $documentId];

            $this->putIfColumn($row, $itemColumns, 'position', $index + 1);
            foreach ($item as $key => $value) {
                $this->putIfColumn($row, $itemColumns, $key, $value);
            }

            if (in_array('created_at', $itemColumns, true)) {
                $row['created_at'] = now();
            }

            if (in_array('updated_at', $itemColumns, true)) {
                $row['updated_at'] = now();
            }

            DB::table('finance_document_items')->insert($row);
        }

        $this->line('<fg=green>Created sample ' . $type . ' document #' . $documentId . '</>');
    }

    private function putIfColumn(array &$data, array $columns, string $key, mixed $value): void
    {
        if (in_array($key, $columns, true)) {
            $data[$key] = $value;
        }
    }

    private function qaFail(string $message): int
    {
        $this->line('<fg=red>FAIL</> ' . $message);
        return 1;
    }
}
```

## FILE: app\Console\Commands\FinanceNumberingLockQaCommand.php

```php
<?php

namespace App\Console\Commands;

use App\Services\Finance\FinanceDocumentNumberingService;
use Illuminate\Console\Command;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Throwable;

class FinanceNumberingLockQaCommand extends Command
{
    protected $signature = 'archilbo:finance-numbering-lock-qa';

    protected $description = 'Run QA checks proving finance document numbers stay locked after first generation.';

    public function handle(FinanceDocumentNumberingService $numbering): int
    {
        $this->info('Finance locked numbering QA started...');

        try {
            config([
                'archilbo_finance_numbering.types.qa_lock_invoice' => [
                    'label' => 'QA Lock Invoice',
                    'prefix' => 'QALOCK',
                    'yearly_reset' => true,
                ],
            ]);

            DB::table('finance_document_number_counters')
                ->where('document_type', 'qa_lock_invoice')
                ->delete();

            Schema::dropIfExists('finance_numbering_lock_qa_documents');

            Schema::create('finance_numbering_lock_qa_documents', function (Blueprint $table): void {
                $table->id();
                $table->string('document_number', 80)->nullable();
                $table->boolean('number_locked')->default(false);
                $table->timestamp('number_locked_at')->nullable();
            });

            $document = new class extends Model {
                protected $table = 'finance_numbering_lock_qa_documents';

                public $timestamps = false;

                protected $guarded = [];
            };

            $document->save();

            $first = $numbering->assignLockedNumber($document, 'qa_lock_invoice', 'document_number', '2026-07-01');

            $document->refresh();

            $second = $numbering->assignLockedNumber($document, 'qa_lock_invoice', 'document_number', '2026-07-01');

            if ($first !== 'QALOCK-2026-0001') {
                throw new \RuntimeException("First locked number invalid: {$first}");
            }

            if ($second !== $first) {
                throw new \RuntimeException("Locked number changed from {$first} to {$second}");
            }

            if ((bool) $document->number_locked !== true) {
                throw new \RuntimeException('number_locked was not set to true.');
            }

            if (empty($document->number_locked_at)) {
                throw new \RuntimeException('number_locked_at was not set.');
            }

            $nextPreview = $numbering->preview('qa_lock_invoice', '2026-07-01');

            if ($nextPreview !== 'QALOCK-2026-0002') {
                throw new \RuntimeException("Next preview invalid after locked assignment: {$nextPreview}");
            }

            Schema::dropIfExists('finance_numbering_lock_qa_documents');

            $this->line("OK Locked number remains stable: {$first}");
            $this->info('Finance locked numbering QA passed.');

            return self::SUCCESS;
        } catch (Throwable $e) {
            try {
                Schema::dropIfExists('finance_numbering_lock_qa_documents');
            } catch (Throwable) {
                //
            }

            $this->error('Finance locked numbering QA failed.');
            $this->error($e->getMessage());

            if ($this->option('verbose')) {
                $this->line($e->getTraceAsString());
            }

            return self::FAILURE;
        }
    }
}
```

## FILE: app\Console\Commands\FinanceNumberingQaCommand.php

```php
<?php

namespace App\Console\Commands;

use App\Services\Finance\FinanceDocumentNumberingService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Throwable;

class FinanceNumberingQaCommand extends Command
{
    protected $signature = 'archilbo:finance-numbering-qa';

    protected $description = 'Run QA checks for finance document numbering settings, counters, yearly reset, and locked numbers.';

    public function handle(FinanceDocumentNumberingService $numbering): int
    {
        $this->info('Finance numbering QA started...');

        try {
            $this->checkConfig($numbering);
            $this->checkPreview($numbering);
            $this->checkReserveSequence($numbering);
            $this->checkYearlyReset($numbering);

            $this->info('Finance numbering QA passed.');

            return self::SUCCESS;
        } catch (Throwable $e) {
            $this->error('Finance numbering QA failed.');
            $this->error($e->getMessage());

            if ($this->option('verbose')) {
                $this->line($e->getTraceAsString());
            }

            return self::FAILURE;
        }
    }

    protected function checkConfig(FinanceDocumentNumberingService $numbering): void
    {
        $types = $numbering->availableTypes();

        if ($types === []) {
            throw new \RuntimeException('No finance numbering document types are configured.');
        }

        foreach (['quote', 'invoice'] as $requiredType) {
            if (! in_array($requiredType, $types, true)) {
                throw new \RuntimeException("Missing required finance numbering type: {$requiredType}");
            }
        }

        $this->line('âœ“ Config document types found.');
    }

    protected function checkPreview(FinanceDocumentNumberingService $numbering): void
    {
        $preview = $numbering->preview('invoice', '2026-01-15');

        if (! str_starts_with($preview, 'FAC-2026-')) {
            throw new \RuntimeException("Invoice preview has invalid format: {$preview}");
        }

        $this->line("âœ“ Preview works: {$preview}");
    }

    protected function checkReserveSequence(FinanceDocumentNumberingService $numbering): void
    {
        DB::table('finance_document_number_counters')
            ->where('document_type', 'qa_invoice')
            ->delete();

        config([
            'archilbo_finance_numbering.types.qa_invoice' => [
                'label' => 'QA Invoice',
                'prefix' => 'QAFAC',
                'yearly_reset' => true,
            ],
        ]);

        $first = $numbering->reserve('qa_invoice', '2026-02-01');
        $second = $numbering->reserve('qa_invoice', '2026-02-01');

        if ($first !== 'QAFAC-2026-0001') {
            throw new \RuntimeException("First reserved number invalid: {$first}");
        }

        if ($second !== 'QAFAC-2026-0002') {
            throw new \RuntimeException("Second reserved number invalid: {$second}");
        }

        $this->line('âœ“ Sequential reservation works.');
    }

    protected function checkYearlyReset(FinanceDocumentNumberingService $numbering): void
    {
        DB::table('finance_document_number_counters')
            ->where('document_type', 'qa_quote')
            ->delete();

        config([
            'archilbo_finance_numbering.types.qa_quote' => [
                'label' => 'QA Quote',
                'prefix' => 'QADEV',
                'yearly_reset' => true,
            ],
        ]);

        $number2026 = $numbering->reserve('qa_quote', '2026-06-01');
        $number2027 = $numbering->reserve('qa_quote', '2027-06-01');

        if ($number2026 !== 'QADEV-2026-0001') {
            throw new \RuntimeException("2026 yearly number invalid: {$number2026}");
        }

        if ($number2027 !== 'QADEV-2027-0001') {
            throw new \RuntimeException("2027 yearly reset number invalid: {$number2027}");
        }

        $this->line('âœ“ Yearly reset works.');
    }
}

```

## FILE: app\Console\Commands\FinancePaymentLedgerReceiptQaCommand.php

```php
<?php

namespace App\Console\Commands;

use App\Models\Client;
use App\Models\Dossier;
use App\Models\FinanceDocument;
use App\Services\Finance\FinanceNumberService;
use App\Services\Finance\PaymentLedgerService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class FinancePaymentLedgerReceiptQaCommand extends Command
{
    protected $signature = 'archilbo:finance-payment-ledger-receipt-qa';
    protected $description = 'Verify invoice payments subtract from remaining total and create linked receipts.';

    public function handle(PaymentLedgerService $ledger): int
    {
        $this->info('Finance payment ledger + receipt QA started...');

        $client = Client::first();
        $dossier = Dossier::first();

        if (! $client) {
            $this->error('No client found. Seed/create a client first.');
            return Command::FAILURE;
        }

        DB::beginTransaction();

        try {
            $invoice = FinanceDocument::create([
                'type' => 'invoice',
                'number' => FinanceNumberService::nextDocumentNumber('invoice'),
                'status' => 'issued',
                'client_id' => $client->id,
                'dossier_id' => $dossier?->id,
                'issue_date' => now(),
                'due_date' => now()->addDays(30),
                'currency' => 'MAD',
                'tva_rate' => 20,
                'subtotal_ht' => 416.67,
                'discount_total' => 0,
                'tax_total' => 83.33,
                'total_ttc' => 500,
                'paid_total' => 0,
                'remaining_total' => 500,
                'notes' => 'QA invoice',
                'terms' => 'Payment on receipt',
            ]);

            $payment1 = $ledger->recordPayment($invoice, [
                'amount' => 200,
                'method' => 'cash',
                'reference' => 'QA-PAY-001',
                'paid_at' => now()->toDateString(),
                'notes' => 'First partial payment',
            ]);

            $invoice = $invoice->fresh();

            $this->assertMoney(200, (float) $invoice->paid_total, 'Paid total after first payment');
            $this->assertMoney(300, (float) $invoice->remaining_total, 'Remaining after first payment');
            $this->assertTrue($invoice->status === 'partially_paid', 'Invoice should be partially_paid.');
            $this->assertTrue((bool) $payment1->receipt_document_id, 'First payment should have receipt.');

            $receipt1 = $payment1->receiptDocument;
            $this->assertTrue($receipt1 && $receipt1->type === 'receipt', 'Receipt document type should be receipt.');
            $this->assertMoney(200, (float) $receipt1->total_ttc, 'Receipt amount should match payment.');

            $this->info("OK partial payment: 500 - 200 = {$invoice->remaining_total}. Receipt {$receipt1->number}");

            try {
                $ledger->recordPayment($invoice, [
                    'amount' => 400,
                    'method' => 'cash',
                    'reference' => 'QA-OVERPAY',
                    'paid_at' => now()->toDateString(),
                ]);

                throw new \RuntimeException('Overpayment was not blocked.');
            } catch (ValidationException) {
                $this->info('OK overpayment blocked.');
            }

            $payment2 = $ledger->recordPayment($invoice->fresh(), [
                'amount' => 300,
                'method' => 'bank_transfer',
                'reference' => 'QA-PAY-002',
                'paid_at' => now()->toDateString(),
                'notes' => 'Final payment',
            ]);

            $invoice = $invoice->fresh();

            $this->assertMoney(500, (float) $invoice->paid_total, 'Paid total after final payment');
            $this->assertMoney(0, (float) $invoice->remaining_total, 'Remaining after final payment');
            $this->assertTrue($invoice->status === 'paid', 'Invoice should be paid.');
            $this->assertTrue((bool) $payment2->receipt_document_id, 'Second payment should have receipt.');

            $this->info("OK full payment: paid_total {$invoice->paid_total}, remaining {$invoice->remaining_total}, status {$invoice->status}.");

            $ledger->deletePayment($payment2->fresh());

            $invoice = $invoice->fresh();

            $this->assertMoney(200, (float) $invoice->paid_total, 'Paid total after deleting final payment');
            $this->assertMoney(300, (float) $invoice->remaining_total, 'Remaining after deleting final payment');
            $this->assertTrue($invoice->status === 'partially_paid', 'Invoice should return to partially_paid.');

            $this->info('OK deleting payment recalculates invoice back to partially_paid.');

            DB::rollBack();

            $this->info('Finance payment ledger + receipt QA passed.');
            return Command::SUCCESS;
        } catch (\Throwable $e) {
            DB::rollBack();

            $this->error('Finance payment ledger + receipt QA failed: ' . $e->getMessage());
            $this->line($e->getTraceAsString());

            return Command::FAILURE;
        }
    }

    private function assertMoney(float $expected, float $actual, string $label): void
    {
        if (round($expected, 2) !== round($actual, 2)) {
            throw new \RuntimeException("{$label}: expected {$expected}, got {$actual}");
        }
    }

    private function assertTrue(bool $condition, string $message): void
    {
        if (! $condition) {
            throw new \RuntimeException($message);
        }
    }
}
```

## FILE: app\Console\Commands\FinancePaymentReceiptExportQaCommand.php

```php
<?php

namespace App\Console\Commands;

use App\Models\Client;
use App\Models\Dossier;
use App\Models\FinanceDocument;
use App\Services\Finance\FinanceExcelExporter;
use App\Services\Finance\FinanceNumberService;
use App\Services\Finance\FinancePdfGenerator;
use App\Services\Finance\PaymentLedgerService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class FinancePaymentReceiptExportQaCommand extends Command
{
    protected $signature = 'archilbo:finance-payment-receipt-export-qa';
    protected $description = 'Verify payment receipt document can generate printable PDF and Excel exports.';

    public function handle(
        PaymentLedgerService $ledger,
        FinancePdfGenerator $pdfGenerator,
        FinanceExcelExporter $excelExporter
    ): int {
        $this->info('Finance payment receipt export QA started...');

        $client = Client::first();
        $dossier = Dossier::first();

        if (! $client) {
            $this->error('No client found. Seed/create a client first.');
            return Command::FAILURE;
        }

        DB::beginTransaction();

        try {
            $invoice = FinanceDocument::create([
                'type' => 'invoice',
                'number' => FinanceNumberService::nextDocumentNumber('invoice'),
                'status' => 'issued',
                'client_id' => $client->id,
                'dossier_id' => $dossier?->id,
                'issue_date' => now(),
                'due_date' => now()->addDays(30),
                'currency' => 'MAD',
                'tva_rate' => 20,
                'subtotal_ht' => 416.67,
                'discount_total' => 0,
                'tax_total' => 83.33,
                'total_ttc' => 500,
                'paid_total' => 0,
                'remaining_total' => 500,
                'notes' => 'QA invoice for receipt export',
                'terms' => 'Payment on receipt',
            ]);

            $payment = $ledger->recordPayment($invoice, [
                'amount' => 200,
                'method' => 'cash',
                'reference' => 'QA-RECEIPT-EXPORT',
                'paid_at' => now()->toDateString(),
                'notes' => 'Receipt export QA payment',
            ])->fresh(['receiptDocument']);

            $receipt = $payment->receiptDocument;

            if (! $receipt) {
                throw new \RuntimeException('Payment has no receipt document.');
            }

            if ($receipt->type !== 'receipt') {
                throw new \RuntimeException('Receipt document type is not receipt.');
            }

            $this->line("Payment: {$payment->payment_number}");
            $this->line("Receipt: {$receipt->number}");

            $pdfPath = $pdfGenerator->generate($receipt);
            $excelPath = $excelExporter->generate($receipt);

            $receipt = $receipt->fresh();

            if (! $pdfPath) {
                throw new \RuntimeException('PDF generator returned empty path.');
            }

            if (! $excelPath) {
                throw new \RuntimeException('Excel exporter returned empty path.');
            }

            $pdfLocation = $this->findGeneratedFile($pdfPath, $receipt->storage_disk ?? 'local');
            $excelLocation = $this->findGeneratedFile($excelPath, $receipt->storage_disk ?? 'local');

            if (! $pdfLocation) {
                throw new \RuntimeException("Receipt PDF file not found in known storage locations: {$pdfPath}");
            }

            if (! $excelLocation) {
                throw new \RuntimeException("Receipt Excel file not found in known storage locations: {$excelPath}");
            }

            $this->table(
                ['Receipt', 'Amount', 'PDF', 'Excel'],
                [[
                    $receipt->number,
                    number_format((float) $receipt->total_ttc, 2),
                    $pdfLocation,
                    $excelLocation,
                ]]
            );

            DB::rollBack();

            $this->info('Finance payment receipt export QA passed.');
            return Command::SUCCESS;
        } catch (\Throwable $e) {
            DB::rollBack();

            $this->error('Finance payment receipt export QA failed: ' . $e->getMessage());
            $this->line($e->getTraceAsString());

            return Command::FAILURE;
        }
    }

    private function findGeneratedFile(string $path, string $disk): ?string
    {
        $path = ltrim($path, '/\\');

        $checks = [
            ['label' => "disk:{$disk}", 'exists' => fn () => Storage::disk($disk)->exists($path)],
            ['label' => 'disk:local', 'exists' => fn () => Storage::disk('local')->exists($path)],
            ['label' => 'disk:public', 'exists' => fn () => Storage::disk('public')->exists($path)],
            ['label' => 'storage/app', 'exists' => fn () => file_exists(storage_path('app/' . $path))],
            ['label' => 'storage/app/private', 'exists' => fn () => file_exists(storage_path('app/private/' . $path))],
            ['label' => 'storage/app/public', 'exists' => fn () => file_exists(storage_path('app/public/' . $path))],
            ['label' => 'public/storage', 'exists' => fn () => file_exists(public_path('storage/' . $path))],
        ];

        foreach ($checks as $check) {
            try {
                if (($check['exists'])()) {
                    return $check['label'] . ':' . $path;
                }
            } catch (\Throwable) {
                // Continue checking other locations.
            }
        }

        return null;
    }
}
```

## FILE: app\Console\Commands\FinancePaymentReceiptPayloadQaCommand.php

```php
<?php

namespace App\Console\Commands;

use App\Http\Resources\PaymentResource;
use App\Models\Client;
use App\Models\Dossier;
use App\Models\FinanceDocument;
use App\Services\Finance\FinanceNumberService;
use App\Services\Finance\PaymentLedgerService;
use Illuminate\Console\Command;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FinancePaymentReceiptPayloadQaCommand extends Command
{
    protected $signature = 'archilbo:finance-payment-receipt-payload-qa';
    protected $description = 'Verify payment resource exposes linked receipt document and receipt URLs.';

    public function handle(PaymentLedgerService $ledger): int
    {
        $this->info('Finance payment receipt payload QA started...');

        $client = Client::first();
        $dossier = Dossier::first();

        if (! $client) {
            $this->error('No client found. Seed/create a client first.');
            return Command::FAILURE;
        }

        DB::beginTransaction();

        try {
            $invoice = FinanceDocument::create([
                'type' => 'invoice',
                'number' => FinanceNumberService::nextDocumentNumber('invoice'),
                'status' => 'issued',
                'client_id' => $client->id,
                'dossier_id' => $dossier?->id,
                'issue_date' => now(),
                'due_date' => now()->addDays(30),
                'currency' => 'MAD',
                'tva_rate' => 20,
                'subtotal_ht' => 416.67,
                'discount_total' => 0,
                'tax_total' => 83.33,
                'total_ttc' => 500,
                'paid_total' => 0,
                'remaining_total' => 500,
                'notes' => 'QA invoice for receipt payload',
                'terms' => 'Payment on receipt',
            ]);

            $payment = $ledger->recordPayment($invoice, [
                'amount' => 200,
                'method' => 'cash',
                'reference' => 'QA-RECEIPT-PAYLOAD',
                'paid_at' => now()->toDateString(),
                'notes' => 'Payload QA payment',
            ]);

            $payment = $payment->fresh(['document', 'client', 'dossier', 'receiptDocument']);

            if (! $payment->receipt_document_id) {
                throw new \RuntimeException('Payment has no receipt_document_id.');
            }

            if (! $payment->receiptDocument) {
                throw new \RuntimeException('Payment receiptDocument relation missing.');
            }

            if ($payment->receiptDocument->type !== 'receipt') {
                throw new \RuntimeException('Linked document is not type receipt.');
            }

            $payload = (new PaymentResource($payment))->toArray(Request::create('/'));

            if (empty($payload['receipt']['id'])) {
                throw new \RuntimeException('PaymentResource missing receipt.id.');
            }

            if (empty($payload['receipt']['number'])) {
                throw new \RuntimeException('PaymentResource missing receipt.number.');
            }

            if ((float) $payload['receipt']['amount'] !== 200.0) {
                throw new \RuntimeException('PaymentResource receipt amount is wrong.');
            }

            if (! array_key_exists('urls', $payload['receipt'])) {
                throw new \RuntimeException('PaymentResource receipt urls missing.');
            }

            $this->table(
                ['Payment', 'Amount', 'Invoice', 'Receipt', 'Receipt Type'],
                [[
                    $payment->payment_number,
                    number_format((float) $payment->amount, 2),
                    $payment->document?->number,
                    $payment->receiptDocument?->number,
                    $payment->receiptDocument?->type,
                ]]
            );

            DB::rollBack();

            $this->info('Finance payment receipt payload QA passed.');
            return Command::SUCCESS;
        } catch (\Throwable $e) {
            DB::rollBack();

            $this->error('Finance payment receipt payload QA failed: ' . $e->getMessage());
            $this->line($e->getTraceAsString());

            return Command::FAILURE;
        }
    }
}
```

## FILE: app\Console\Commands\FinanceUiLockAwarenessDiscoveryCommand.php

```php
<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class FinanceUiLockAwarenessDiscoveryCommand extends Command
{
    protected $signature = 'archilbo:finance-ui-lock-awareness-discovery';

    protected $description = 'Discover React UI files that need locked finance document awareness.';

    public function handle(): int
    {
        $this->info('Finance UI lock awareness discovery started...');

        $roots = [
            'resources/js/features/finance',
            'resources/js/Features/Finance',
            'resources/js/pages/Finance',
            'resources/js/Pages/Finance',
            'resources/js/Pages/Admin/Finance',
            'resources/js/pages/Admin/Finance',
        ];

        $keywords = [
            'FinanceDocument',
            'number',
            'type',
            'issue',
            'date',
            'edit',
            'update',
            'drawer',
            'form',
            'generate',
            'pdf',
            'excel',
            'download',
            'document',
            'status',
        ];

        $alreadyAware = [
            'numberLocked',
            'numberLockedAt',
            'isLocked',
            'canEditNumberFields',
            'canRegenerateExports',
            'lockedAtFormatted',
        ];

        $rows = [];
        $report = [
            '# Finance UI Lock Awareness Discovery',
            '',
            'Generated at: '.now()->toDateTimeString(),
            '',
            '## Backend payload keys available',
            '',
            '```ts',
            'document.numberLocked',
            'document.numberLockedAt',
            'document.lock.isLocked',
            'document.lock.lockedAtFormatted',
            'document.lock.message',
            'document.lock.blockedFields',
            'document.lock.canEditNumberFields',
            'document.lock.canRegenerateExports',
            'document.lock.canGeneratePdf',
            'document.lock.canGenerateExcel',
            '```',
            '',
            '## Candidates',
            '',
        ];

        foreach ($roots as $root) {
            $directory = base_path($root);

            if (! is_dir($directory)) {
                continue;
            }

            $iterator = new \RecursiveIteratorIterator(
                new \RecursiveDirectoryIterator($directory, \FilesystemIterator::SKIP_DOTS)
            );

            foreach ($iterator as $file) {
                if (! $file->isFile()) {
                    continue;
                }

                $extension = strtolower($file->getExtension());

                if (! in_array($extension, ['ts', 'tsx', 'js', 'jsx'], true)) {
                    continue;
                }

                $path = $file->getPathname();
                $relativePath = str_replace(base_path().DIRECTORY_SEPARATOR, '', $path);
                $relativePath = str_replace('\\', '/', $relativePath);
                $content = file_get_contents($path);

                if (! is_string($content) || trim($content) === '') {
                    continue;
                }

                $score = 0;

                foreach ($keywords as $keyword) {
                    if (str_contains(strtolower($content), strtolower($keyword)) || str_contains(strtolower($relativePath), strtolower($keyword))) {
                        $score++;
                    }
                }

                if ($score < 3) {
                    continue;
                }

                $aware = false;

                foreach ($alreadyAware as $needle) {
                    if (str_contains($content, $needle)) {
                        $aware = true;
                        break;
                    }
                }

                $type = $this->guessType($relativePath, $content);

                $rows[] = [
                    'score' => $score,
                    'type' => $type,
                    'aware' => $aware ? 'yes' : 'no',
                    'path' => $relativePath,
                ];
            }
        }

        usort($rows, fn (array $a, array $b): int => $b['score'] <=> $a['score']);

        foreach ($rows as $index => $row) {
            $report[] = '### '.($index + 1).'. '.$row['path'];
            $report[] = '';
            $report[] = '- Score: '.$row['score'];
            $report[] = '- Type: '.$row['type'];
            $report[] = '- Already lock-aware: '.$row['aware'];
            $report[] = '';
        }

        if (! is_dir(base_path('docs'))) {
            mkdir(base_path('docs'), 0777, true);
        }

        file_put_contents(base_path('docs/finance-ui-lock-awareness-discovery.md'), implode(PHP_EOL, $report).PHP_EOL);

        $this->table(
            ['Score', 'Type', 'Aware', 'Path'],
            array_map(fn (array $row): array => [
                $row['score'],
                $row['type'],
                $row['aware'],
                $row['path'],
            ], array_slice($rows, 0, 40))
        );

        $this->info('Report written: docs/finance-ui-lock-awareness-discovery.md');
        $this->info('Finance UI lock awareness discovery completed.');

        return self::SUCCESS;
    }

    protected function guessType(string $path, string $content): string
    {
        $source = strtolower($path.' '.$content);

        if (str_contains($source, 'types')) {
            return 'Types';
        }

        if (str_contains($source, 'drawer') || str_contains($source, 'form')) {
            return 'Drawer/Form';
        }

        if (str_contains($source, 'actions') || str_contains($source, 'button')) {
            return 'Actions';
        }

        if (str_contains($source, 'preview')) {
            return 'Preview';
        }

        if (str_contains($source, 'show')) {
            return 'Page/Show';
        }

        if (str_contains($source, 'index') || str_contains($source, 'table') || str_contains($source, 'list')) {
            return 'Page/List';
        }

        return 'Component';
    }
}
```

## FILE: app\Console\Commands\FinanceUiLockPayloadQaCommand.php

```php
<?php

namespace App\Console\Commands;

use App\Http\Resources\FinanceDocumentResource;
use App\Models\FinanceDocument;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Schema;

class FinanceUiLockPayloadQaCommand extends Command
{
    protected $signature = 'archilbo:finance-ui-lock-payload-qa';

    protected $description = 'Verify finance document resource exposes UI lock awareness payload.';

    public function handle(): int
    {
        $this->info('Finance UI lock payload QA started...');

        if (! Schema::hasTable('finance_documents')) {
            $this->error('Missing table: finance_documents.');

            return self::FAILURE;
        }

        foreach (['number', 'number_locked', 'number_locked_at'] as $column) {
            if (! Schema::hasColumn('finance_documents', $column)) {
                $this->error("Missing finance_documents column: {$column}");

                return self::FAILURE;
            }
        }

        $document = FinanceDocument::query()
            ->where('number_locked', true)
            ->orderByDesc('id')
            ->first();

        if (! $document) {
            $this->error('No locked finance document found. Run finance export QA first.');

            return self::FAILURE;
        }

        $payload = (new FinanceDocumentResource($document))->resolve();

        foreach (['numberLocked', 'numberLockedAt', 'lock'] as $key) {
            if (! array_key_exists($key, $payload)) {
                $this->error("Missing resource key: {$key}");

                return self::FAILURE;
            }
        }

        foreach (['isLocked', 'lockedAt', 'lockedAtFormatted', 'message', 'blockedFields', 'canEditNumberFields', 'canRegenerateExports', 'canGeneratePdf', 'canGenerateExcel'] as $key) {
            if (! array_key_exists($key, $payload['lock'])) {
                $this->error("Missing lock payload key: lock.{$key}");

                return self::FAILURE;
            }
        }

        if ($payload['numberLocked'] !== true) {
            $this->error('numberLocked should be true for exported locked document.');

            return self::FAILURE;
        }

        if (($payload['lock']['isLocked'] ?? null) !== true) {
            $this->error('lock.isLocked should be true.');

            return self::FAILURE;
        }

        if (($payload['lock']['canEditNumberFields'] ?? true) !== false) {
            $this->error('lock.canEditNumberFields should be false.');

            return self::FAILURE;
        }

        if (($payload['lock']['canRegenerateExports'] ?? false) !== true) {
            $this->error('lock.canRegenerateExports should be true.');

            return self::FAILURE;
        }

        $this->table(
            ['Number', 'Locked', 'Locked At', 'Can Edit Number Fields', 'Can Regenerate Exports'],
            [[
                $payload['number'] ?? 'n/a',
                $payload['numberLocked'] ? 'yes' : 'no',
                $payload['numberLockedAt'] ?? 'n/a',
                $payload['lock']['canEditNumberFields'] ? 'yes' : 'no',
                $payload['lock']['canRegenerateExports'] ? 'yes' : 'no',
            ]]
        );

        $this->info('Finance UI lock payload QA passed.');

        return self::SUCCESS;
    }
}
```

## FILE: app\Console\Commands\OperationsFoundationQaCommand.php

```php
<?php

namespace App\Console\Commands;

use App\Models\TaskRequest;
use App\Services\Task\OperationsReportService;
use App\Services\Task\TaskRequestService;
use App\Services\Task\WorkloadService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Schema;
use Spatie\Permission\Models\Permission;

class OperationsFoundationQaCommand extends Command
{
    protected $signature = 'archilbo:operations-foundation-qa';

    protected $description = 'Validate the Operations Center backend foundation.';

    public function handle(
        TaskRequestService $taskRequests,
        WorkloadService $workload,
        OperationsReportService $reports,
    ): int {
        $this->info('Checking Operations Center foundation...');

        foreach (['tasks', 'task_requests', 'conversations', 'messages', 'notifications'] as $table) {
            if (! Schema::hasTable($table)) {
                $this->error("Missing table: {$table}");
                return self::FAILURE;
            }
        }

        foreach ([
            'type',
            'impact',
            'reviewed_at',
            'blocked_reason',
            'estimated_minutes',
            'actual_minutes',
            'recurrence_rule',
            'conversation_id',
        ] as $column) {
            if (! Schema::hasColumn('tasks', $column)) {
                $this->error("Missing tasks column: {$column}");
                return self::FAILURE;
            }
        }

        foreach ([
            'request_number',
            'request_type',
            'requested_by',
            'target_user_id',
            'status',
            'converted_task_id',
        ] as $column) {
            if (! Schema::hasColumn('task_requests', $column)) {
                $this->error("Missing task_requests column: {$column}");
                return self::FAILURE;
            }
        }

        foreach ([
            'task_statuses',
            'task_types',
            'task_priorities',
            'task_impacts',
            'task_request_statuses',
            'task_request_types',
        ] as $key) {
            if (empty(config("archilbo_operations.{$key}"))) {
                $this->error("Missing operations config: {$key}");
                return self::FAILURE;
            }
        }

        foreach ([
            'tasks.index',
            'tasks.store',
            'task-requests.index',
            'task-requests.store',
            'task-requests.convert',
            'workload.index',
            'operations.reports.index',
            'inbox.index',
            'notifications.index',
        ] as $routeName) {
            if (! Route::has($routeName)) {
                $this->error("Missing route: {$routeName}");
                return self::FAILURE;
            }
        }

        $missingPermissions = collect([
            'view tasks',
            'manage tasks',
            'view task requests',
            'manage task requests',
            'view inbox',
            'manage inbox',
            'view notifications',
            'manage notifications',
            'view workload',
            'view operations reports',
        ])->reject(fn (string $permission) => Permission::query()->where('name', $permission)->exists());

        if ($missingPermissions->isNotEmpty()) {
            $this->error('Missing permissions: ' . $missingPermissions->implode(', '));
            return self::FAILURE;
        }

        $number = $taskRequests->nextNumber();
        if (! str_starts_with($number, 'REQ-' . now()->format('Y') . '-')) {
            $this->error('Task request numbering format is invalid.');
            return self::FAILURE;
        }

        if (! is_array($workload->summary()) || ! is_array($reports->summary())) {
            $this->error('Operations services did not return arrays.');
            return self::FAILURE;
        }

        $this->line('Task requests in database: ' . TaskRequest::query()->count());
        $this->info('Operations Center foundation QA passed.');

        return self::SUCCESS;
    }
}

```

## FILE: app\Console\Commands\TaskChatQaCommand.php

```php
<?php

namespace App\Console\Commands;

use App\Http\Resources\TaskResource;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\Task;
use App\Models\TaskChecklistItem;
use App\Models\TaskComment;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Route;

class TaskChatQaCommand extends Command
{
    protected $signature = 'app:qa-tasks-chat';
    protected $description = 'QA checks for Task, Chat, and Notification modules';

    public function handle(): int
    {
        $this->info('=== Task & Chat QA ===');

        $tasks = Task::count();
        $this->line("Tasks: $tasks");
        if ($tasks === 0) {
            $this->warn('No tasks found');
        }

        $validStatuses = config('archilbo_operations.task_statuses', []);
        $invalidStatuses = Task::whereNotIn('status', $validStatuses)->count();
        if ($invalidStatuses > 0) {
            $this->warn("$invalidStatuses tasks with invalid status");
        } else {
            $this->line('All statuses valid');
        }

        $validPriorities = config('archilbo_operations.task_priorities', []);
        $invalidPriorities = Task::whereNotIn('priority', $validPriorities)->count();
        if ($invalidPriorities > 0) {
            $this->warn("$invalidPriorities tasks with invalid priority");
        } else {
            $this->line('All priorities valid');
        }

        $tasklessChecklist = TaskChecklistItem::whereDoesntHave('task')->count();
        if ($tasklessChecklist > 0) {
            $this->warn("$tasklessChecklist orphaned checklist items");
        }

        $tasklessComments = TaskComment::whereDoesntHave('task')->count();
        if ($tasklessComments > 0) {
            $this->warn("$tasklessComments orphaned comments");
        }

        $convs = Conversation::count();
        $this->line("Conversations: $convs");

        $msgs = Message::count();
        $this->line("Messages: $msgs");

        $msglessConvs = Conversation::whereDoesntHave('messages')->count();
        if ($msglessConvs > 0) {
            $this->warn("$msglessConvs conversations with no messages");
        }

        $participantlessConvs = Conversation::whereDoesntHave('participants')->count();
        if ($participantlessConvs > 0) {
            $this->warn("$participantlessConvs conversations with no participants");
        }

        $notifications = User::all()->sum(fn ($u) => $u->notifications()->count());
        $this->line("Total notifications: $notifications");

        $this->line('');

        // Extended QA
        $this->line('--- Extended resource checks ---');

        $resourceClass = class_exists(\App\Http\Resources\TaskAttachmentResource::class);
        $this->line($resourceClass ? 'TaskAttachmentResource class exists' : 'WARN: TaskAttachmentResource missing');

        $hasCommentNoteColumn = \Illuminate\Support\Facades\Schema::hasColumn('task_comments', 'is_note');
        $this->line($hasCommentNoteColumn ? 'task_comments.is_note column exists' : 'WARN: is_note column missing');

        $taskRoutes = Route::getRoutes()->getRoutesByMethod()['GET'] ?? [];
        $hasTasksRoute = collect($taskRoutes)->contains(fn ($r) => $r->uri() === 'tasks' || $r->uri() === 'tasks/{task}');
        $this->line($hasTasksRoute ? 'Task GET routes registered' : 'WARN: Task routes missing');

        // TaskResource numeric counts check
        $sampleTask = Task::withCount(['comments', 'attachments'])->first();
        if ($sampleTask) {
            $resource = new TaskResource($sampleTask);
            $data = $resource->resolve();
            $commentsCount = $data['commentsCount'] ?? null;
            $attachmentsCount = $data['attachmentsCount'] ?? null;
            $this->line(is_int($commentsCount) ? "commentsCount is int: $commentsCount" : 'WARN: commentsCount not int');
            $this->line(is_int($attachmentsCount) ? "attachmentsCount is int: $attachmentsCount" : 'WARN: attachmentsCount not int');
            $this->line('assignees default: ' . (is_array($data['assignees'] ?? null) ? 'array' : 'WARN: not array'));
            $this->line('watchers default: ' . (is_array($data['watchers'] ?? null) ? 'array' : 'WARN: not array'));
            $this->line('checklistItems default: ' . (is_array($data['checklistItems'] ?? null) ? 'array' : 'WARN: not array'));
        }

        $this->line('');

        // Source file checks
        $files = [
            resource_path('js/pages/Tasks/Index.tsx'),
            resource_path('js/features/tasks/types.ts'),
            resource_path('js/features/tasks/components/TaskBoard.tsx'),
            resource_path('js/features/tasks/components/TaskCard.tsx'),
            resource_path('js/features/tasks/components/TaskDetailDrawer.tsx'),
            resource_path('js/features/tasks/components/TaskCreateDrawer.tsx'),
            resource_path('js/features/tasks/components/TaskFilters.tsx'),
            resource_path('js/features/tasks/components/TaskListView.tsx'),
            resource_path('js/features/tasks/components/TaskCalendar.tsx'),
        ];
        foreach ($files as $file) {
            $this->line(file_exists($file) ? "OK: $file" : "WARN: Missing $file");
        }

        $this->info('QA complete.');
        return Command::SUCCESS;
    }
}

```

## FILE: app\Console\Commands\TestContractGeneration.php

```php
<?php

namespace App\Console\Commands;

use App\Models\Contract;
use App\Services\ContractDocumentGenerator;
use App\Services\WordDocumentConverter;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use ZipArchive;

class TestContractGeneration extends Command
{
    protected $signature = 'archilbo:test-contract-generation {contract_id}';
    protected $description = 'Test contract DOCX generation and verify output';

    public function handle(): int
    {
        $contractId = $this->argument('contract_id');
        $contract = Contract::with(['dossier.client'])->find($contractId);

        if (!$contract) {
            $this->error("Contract #{$contractId} not found.");

            return self::FAILURE;
        }

        $this->info("Testing contract: {$contract->contract_number}");

        try {
            $paths = app(ContractDocumentGenerator::class)->generate($contract);
            $this->info("DOCX generated: {$paths['docx_path']}");
        } catch (\Throwable $e) {
            $this->error("Generation failed: " . $e->getMessage());

            return self::FAILURE;
        }

        $absoluteDocx = Storage::disk('public')->path($paths['docx_path']);

        if (!file_exists($absoluteDocx)) {
            $this->error("File does not exist: {$absoluteDocx}");

            return self::FAILURE;
        }

        $this->info("File size: " . filesize($absoluteDocx) . " bytes");

        $placeholders = $this->findRemainingPlaceholders($absoluteDocx);

        if (empty($placeholders)) {
            $this->info("No remaining placeholders found. All known keys replaced.");
        } else {
            $this->warn("Remaining placeholders found: " . implode(', ', $placeholders));
        }

        $absoluteDocx = Storage::disk('public')->path($paths['docx_path']);
        $pdfRelative = 'contracts/' . $contract->contract_number . '/' . $contract->contract_number . '-contract.pdf';
        $absolutePdf = Storage::disk('public')->path($pdfRelative);

        try {
            app(WordDocumentConverter::class)->convertDocxToPdf($absoluteDocx, $absolutePdf);
            $this->info("PDF exported: {$pdfRelative}");

            if (file_exists($absolutePdf)) {
                $this->info("PDF file size: " . filesize($absolutePdf) . " bytes");
            }
        } catch (\Throwable $e) {
            $this->warn("PDF export skipped: " . $e->getMessage());
        }

        $this->info("Contract generation test completed successfully.");

        return self::SUCCESS;
    }

    private function findRemainingPlaceholders(string $docxPath): array
    {
        $zip = new ZipArchive();

        if ($zip->open($docxPath) !== true) {
            return [];
        }

        $knownKeys = [
            'DATE', 'CIVILITY', 'CLIENT_NAME', 'CIN', 'CLIENT_ADD',
            'PROJECT_OBJECT', 'PROJECT_ADD', 'TITRE', 'SUP', 'PREF', 'COMMUNE',
            'PLANCHER', 'ESTIMATION', 'HT', 'TVA', 'TTC',
        ];

        $found = [];

        libxml_use_internal_errors(true);

        for ($i = 0; $i < $zip->numFiles; $i++) {
            $name = $zip->getNameIndex($i);

            if (!$name || !str_starts_with($name, 'word/') || !str_ends_with($name, '.xml')) {
                continue;
            }

            $xml = $zip->getFromName($name);

            if ($xml === false) {
                continue;
            }

            $dom = new \DOMDocument();
            $dom->loadXML($xml, LIBXML_PARSEHUGE);
            $xpath = new \DOMXPath($dom);
            $xpath->registerNamespace('w', 'http://schemas.openxmlformats.org/wordprocessingml/2006/main');

            $fullText = '';
            foreach ($xpath->query('//w:t') as $t) {
                $fullText .= $t->textContent;
            }

            foreach ($knownKeys as $key) {
                if (str_contains($fullText, '[' . $key . ']')) {
                    $found[] = $key;
                }
            }
        }

        $zip->close();

        return array_unique($found);
    }
}

```

## FILE: app\Console\Commands\TestFinanceBuilderCommand.php

```php
<?php

namespace App\Console\Commands;

use App\Models\Client;
use App\Models\Dossier;
use App\Models\FinanceDocument;
use App\Models\FinanceDocumentItem;
use App\Models\Payment;
use App\Services\Finance\FinanceCalculator;
use App\Services\Finance\FinanceNumberService;
use App\Services\Finance\FinanceSettingsService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class TestFinanceBuilderCommand extends Command
{
    protected $signature = 'archilbo:test-finance-builder';
    protected $description = 'Test the finance builder backend';

    public function handle(): int
    {
        $this->info('=== Finance Builder Backend Test ===');
        $this->newLine();

        $client = Client::first();
        if (!$client) {
            $this->warn('No client found! Please create a client first.');
            return Command::FAILURE;
        }
        $this->info('✅ Client found: ' . $client->full_name);

        $dossier = Dossier::first();
        if ($dossier) {
            $this->info('✅ Dossier found: ' . $dossier->dossier_number);
        }

        $this->info('');

        try {
            DB::beginTransaction();

            $this->info('1. Creating a quote...');
            $quote = $this->createTestQuote($client, $dossier);
            $this->info('   ✅ Quote created: ' . $quote->number);
            $this->info("      - Subtotal HT: {$quote->subtotal_ht}");
            $this->info("      - Tax total: {$quote->tax_total}");
            $this->info("      - Total TTC: {$quote->total_ttc}");

            $this->info('');

            $this->info('2. Converting quote to invoice...');
            $invoice = $this->convertQuoteToInvoice($quote);
            $this->info('   ✅ Invoice created: ' . $invoice->number);
            $this->info("      - Status: {$invoice->status}");

            $this->info('');

            $this->info('3. Recording partial payment (50%)...');
            $partialAmount = $invoice->total_ttc / 2;
            $payment1 = $this->createTestPayment($invoice, $partialAmount);
            $this->info("   ✅ Payment recorded: {$payment1->payment_number} ({$partialAmount} MAD)");
            $invoice->refresh();
            $this->info("      - Invoice paid total: {$invoice->paid_total}");
            $this->info("      - Remaining: {$invoice->remaining_total}");
            $this->info("      - Status: {$invoice->status}");

            if ($invoice->status !== 'partially_paid') {
                throw new \Exception('Invoice status should be partially_paid!');
            }

            $this->info('');

            $this->info('4. Recording remaining payment...');
            $remainingAmount = $invoice->remaining_total;
            $payment2 = $this->createTestPayment($invoice, $remainingAmount);
            $this->info("   ✅ Payment recorded: {$payment2->payment_number} ({$remainingAmount} MAD)");
            $invoice->refresh();
            $this->info("      - Invoice paid total: {$invoice->paid_total}");
            $this->info("      - Remaining: {$invoice->remaining_total}");
            $this->info("      - Status: {$invoice->status}");

            if ($invoice->status !== 'paid') {
                throw new \Exception('Invoice status should be paid!');
            }

            DB::rollBack();
            $this->info('');
            $this->info('✅ All tests passed! Rolled back test data.');
        } catch (\Exception $e) {
            DB::rollBack();
            $this->error('❌ Test failed: ' . $e->getMessage());
            $this->error('   Stack trace: ' . $e->getTraceAsString());
            return Command::FAILURE;
        }

        $this->info('');
        $this->info('=== Test Complete ===');
        return Command::SUCCESS;
    }

    private function createTestQuote(Client $client, ?Dossier $dossier): FinanceDocument
    {
        $number = FinanceNumberService::nextDocumentNumber('quote');

        $document = FinanceDocument::create([
            'type' => 'quote',
            'number' => $number,
            'status' => 'draft',
            'client_id' => $client->id,
            'dossier_id' => $dossier?->id,
            'issue_date' => now(),
            'due_date' => now()->addDays(30),
            'valid_until' => now()->addDays(30),
            'currency' => FinanceSettingsService::getCurrency(),
            'tva_rate' => FinanceSettingsService::getTvaRate(),
            'notes' => 'Test quote',
            'terms' => 'Payment on receipt',
        ]);

        $item1 = new FinanceDocumentItem([
            'position' => 1,
            'title' => 'Design services',
            'quantity' => 1,
            'unit' => 'hrs',
            'unit_price' => 1000,
            'tva_rate' => $document->tva_rate,
        ]);
        $item1->calculateTotals();
        $document->items()->save($item1);

        $item2 = new FinanceDocumentItem([
            'position' => 2,
            'title' => 'Consulting',
            'quantity' => 2,
            'unit' => 'hrs',
            'unit_price' => 500,
            'tva_rate' => $document->tva_rate,
        ]);
        $item2->calculateTotals();
        $document->items()->save($item2);

        FinanceCalculator::recalculateDocument($document);
        $document->save();

        return $document;
    }

    private function convertQuoteToInvoice(FinanceDocument $quote): FinanceDocument
    {
        $invoiceNumber = FinanceNumberService::nextDocumentNumber('invoice');

        $invoice = FinanceDocument::create([
            'type' => 'invoice',
            'number' => $invoiceNumber,
            'status' => 'issued',
            'client_id' => $quote->client_id,
            'dossier_id' => $quote->dossier_id,
            'source_document_id' => $quote->id,
            'issue_date' => now(),
            'due_date' => now()->addDays(30),
            'currency' => $quote->currency,
            'tva_rate' => $quote->tva_rate,
            'subtotal_ht' => $quote->subtotal_ht,
            'tax_total' => $quote->tax_total,
            'total_ttc' => $quote->total_ttc,
            'remaining_total' => $quote->total_ttc,
            'notes' => 'Test invoice from quote',
            'terms' => $quote->terms,
        ]);

        foreach ($quote->items as $item) {
            $newItem = $item->replicate();
            $newItem->finance_document_id = $invoice->id;
            $newItem->save();
        }

        $quote->update(['status' => 'converted']);

        return $invoice;
    }

    private function createTestPayment(FinanceDocument $invoice, float $amount): Payment
    {
        $payment = Payment::create([
            'finance_document_id' => $invoice->id,
            'client_id' => $invoice->client_id,
            'dossier_id' => $invoice->dossier_id,
            'payment_number' => FinanceNumberService::nextPaymentNumber(),
            'amount' => $amount,
            'method' => 'bank_transfer',
            'reference' => 'TEST-' . uniqid(),
            'paid_at' => now(),
        ]);

        FinanceCalculator::updateInvoicePaymentTotals($invoice);
        $invoice->save();

        return $payment;
    }
}

```

## FILE: app\Console\Commands\TestFinanceExportCommand.php

```php
<?php

namespace App\Console\Commands;

use App\Models\FinanceDocument;
use App\Services\Finance\FinanceExcelExporter;
use App\Services\Finance\FinancePdfGenerator;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use PhpOffice\PhpSpreadsheet\IOFactory;

class TestFinanceExportCommand extends Command
{
    protected $signature = 'archilbo:test-finance-export {finance_document_id}';
    protected $description = 'Generate and validate PDF and Excel exports for a finance document';

    public function handle(FinancePdfGenerator $pdfGenerator, FinanceExcelExporter $excelExporter): int
    {
        $document = FinanceDocument::with(['client', 'dossier', 'items', 'payments', 'template'])
            ->find($this->argument('finance_document_id'));

        if (!$document) {
            $this->error('Finance document not found.');
            return Command::FAILURE;
        }

        if ($document->items->isEmpty()) {
            $this->error('Finance document has no line items. Add at least one item before export.');
            return Command::FAILURE;
        }

        $this->info("Testing finance export for {$document->number}...");

        try {
            $pdfPath = $pdfGenerator->generate($document);
            $this->assertStoredFile($pdfPath, 'PDF');
            $this->info("PDF generated: {$pdfPath}");

            $excelPath = $excelExporter->generate($document->refresh());
            $this->assertStoredFile($excelPath, 'Excel');
            $this->assertReadableXlsx($excelPath);
            $this->info("Excel generated: {$excelPath}");
        } catch (\Throwable $e) {
            $this->error('Export test failed: ' . $e->getMessage());
            return Command::FAILURE;
        }

        $this->info('Finance export test passed.');
        return Command::SUCCESS;
    }

    private function assertStoredFile(string $path, string $label): void
    {
        if (!Storage::disk('public')->exists($path)) {
            throw new \RuntimeException("{$label} file was not stored at {$path}.");
        }

        $absolutePath = Storage::disk('public')->path($path);
        if (!is_file($absolutePath) || filesize($absolutePath) === 0) {
            throw new \RuntimeException("{$label} file is empty at {$path}.");
        }
    }

    private function assertReadableXlsx(string $path): void
    {
        $absolutePath = Storage::disk('public')->path($path);
        $handle = fopen($absolutePath, 'rb');
        $signature = $handle ? fread($handle, 2) : '';
        if ($handle) {
            fclose($handle);
        }

        if ($signature !== 'PK') {
            throw new \RuntimeException('Excel file is not a valid XLSX zip package.');
        }

        $spreadsheet = IOFactory::load($absolutePath);
        $spreadsheet->disconnectWorksheets();
    }
}

```

## FILE: app\Console\Commands\TestFinanceGeneration.php

```php
<?php

namespace App\Console\Commands;

use App\Models\FinanceRecord;
use App\Services\FinanceDocumentGenerator;
use App\Services\OfficeDocumentConverter;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use PhpOffice\PhpSpreadsheet\IOFactory;

class TestFinanceGeneration extends Command
{
    protected $signature = 'archilbo:test-finance-generation {finance_record_id}';
    protected $description = 'Test finance XLSX generation and verify output';

    public function handle(): int
    {
        $recordId = $this->argument('finance_record_id');
        $record = FinanceRecord::with(['dossier.client'])->find($recordId);

        if (!$record) {
            $this->error("Finance record #{$recordId} not found.");
            return self::FAILURE;
        }

        $this->info("Testing finance record: {$record->record_number} ({$record->type})");

        try {
            $paths = app(FinanceDocumentGenerator::class)->generate($record);
            $this->info("XLSX generated: {$paths['xlsx_path']}");
        } catch (\Throwable $e) {
            $this->error("Generation failed: " . $e->getMessage());
            return self::FAILURE;
        }

        $absoluteXlsx = Storage::disk('public')->path($paths['xlsx_path']);

        if (!file_exists($absoluteXlsx)) {
            $this->error("File does not exist: {$absoluteXlsx}");
            return self::FAILURE;
        }

        $size = filesize($absoluteXlsx);
        $this->info("File size: {$size} bytes");

        // Check ZIP/XLSX signature
        $fp = fopen($absoluteXlsx, 'rb');
        $bytes = fread($fp, 4);
        fclose($fp);
        $hex = bin2hex($bytes);

        $isValidZip = str_starts_with($hex, '504b');
        if (!$isValidZip) {
            $this->error("INVALID XLSX: first bytes are {$hex}, expected PK (504b...). File is not a valid ZIP/XLSX.");
            return self::FAILURE;
        }

        $this->info("ZIP signature OK (PK/{$hex})");

        // Try loading with PhpSpreadsheet
        try {
            $spreadsheet = IOFactory::load($absoluteXlsx);
            $this->info("PhpSpreadsheet loaded OK: " . $spreadsheet->getSheetCount() . " sheet(s)");
            $spreadsheet->disconnectWorksheets();
        } catch (\Throwable $e) {
            $this->error("PhpSpreadsheet could not load file: " . $e->getMessage());
            return self::FAILURE;
        }

        $remaining = $this->findRemainingPlaceholders($absoluteXlsx);

        if (empty($remaining)) {
            $this->info("No remaining placeholders found. All known keys replaced.");
        } else {
            $this->warn("Remaining placeholders found: " . implode(', ', $remaining));
        }

        $converter = app(OfficeDocumentConverter::class);

        if ($converter->isAvailable()) {
            $pdfRelative = 'finance/' . $record->record_number . '/' . $record->record_number . '.pdf';
            $absolutePdf = Storage::disk('public')->path($pdfRelative);

            try {
                $converter->convertDocxToPdf($absoluteXlsx, $absolutePdf);
                $this->info("PDF exported: {$pdfRelative}");

                if (file_exists($absolutePdf)) {
                    $this->info("PDF file size: " . filesize($absolutePdf) . " bytes");
                }
            } catch (\Throwable $e) {
                $this->warn("PDF export skipped: " . $e->getMessage());
            }
        } else {
            $this->warn("LibreOffice not installed. PDF export skipped.");
        }

        $this->info("Finance generation test completed successfully.");
        return self::SUCCESS;
    }

    private function findRemainingPlaceholders(string $xlsxPath): array
    {
        $allTemplatePlaceholders = [
            'DATE', 'DUE_DATE', 'PAID_DATE', 'DATE_AVANCE',
            'RECORD_NUMBER', 'NUMERO_DEVIS', 'NUMERO_FACTURE',
            'TYPE', 'STATUS',
            'CLIENT_NAME', 'CIVILITY', 'CIN', 'ICE', 'CLIENT_ADD',
            'CLIENT_PHONE', 'CLIENT_EMAIL',
            'DOSSIER_NUMBER', 'PROJECT_OBJECT', 'DESIGNATION',
            'PROJECT_ADD', 'TITRE', 'COMMUNE', 'PREF', 'SUP', 'PLANCHER',
            'QU', 'HT', 'TOTAL_HT', 'TVA', 'TTC', 'TOTAL_TTC',
            'PAID', 'REMAINING', 'NOTES',
        ];

        $found = [];

        try {
            $spreadsheet = IOFactory::load($xlsxPath);

            foreach ($spreadsheet->getAllSheets() as $sheet) {
                foreach ($sheet->getRowIterator() as $row) {
                    foreach ($row->getCellIterator() as $cell) {
                        $value = $cell->getValue();

                        if (!is_string($value)) {
                            continue;
                        }

                        foreach ($allTemplatePlaceholders as $key) {
                            if (str_contains($value, '[' . $key . ']') && !in_array($key, $found, true)) {
                                $found[] = $key;
                            }
                            if (str_contains($value, '${' . $key . '}') && !in_array($key, $found, true)) {
                                $found[] = $key;
                            }
                        }
                    }
                }
            }

            $spreadsheet->disconnectWorksheets();
        } catch (\Throwable $e) {
            $this->warn("Could not inspect spreadsheet: " . $e->getMessage());
        }

        return $found;
    }
}

```

## FILE: app\Console\Commands\WorkflowGroupingQaCommand.php

```php
<?php

namespace App\Console\Commands;

use App\Models\Client;
use App\Models\Dossier;
use App\Models\DossierDocument;
use App\Models\FinanceDocument;
use App\Models\Payment;
use App\Services\Clients\ClientWorkspaceService;
use App\Services\Dossiers\DossierLocationGroupingService;
use App\Services\Documents\DocumentGroupingService;
use App\Services\Finance\FinanceMonthlySummaryService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Schema;

class WorkflowGroupingQaCommand extends Command
{
    protected $signature = 'archilbo:workflow-grouping-qa';

    protected $description = 'Verify client/project/document/location/monthly finance grouping read models.';

    public function handle(
        ClientWorkspaceService $clientWorkspace,
        DossierLocationGroupingService $dossierGroups,
        DocumentGroupingService $documentGroups,
        FinanceMonthlySummaryService $financeMonths,
    ): int {
        $this->info('ARCHI LBO workflow grouping QA started...');

        foreach (['clients', 'dossiers', 'dossier_documents', 'finance_documents', 'payments'] as $table) {
            if (! Schema::hasTable($table)) {
                $this->error("Missing table: {$table}");

                return self::FAILURE;
            }
        }

        $failures = 0;
        $failures += $this->checkClientWorkspace($clientWorkspace);
        $failures += $this->checkDossierGroups($dossierGroups);
        $failures += $this->checkDocumentGroups($documentGroups);
        $failures += $this->checkFinanceMonths($financeMonths);

        if ($failures > 0) {
            $this->error("Workflow grouping QA failed with {$failures} issue(s).");

            return self::FAILURE;
        }

        $this->info('Workflow grouping QA passed.');

        return self::SUCCESS;
    }

    private function checkClientWorkspace(ClientWorkspaceService $service): int
    {
        $client = Client::query()
            ->withCount('dossiers')
            ->orderByDesc('dossiers_count')
            ->first();

        if (! $client) {
            $this->warn('No clients found. Client workspace grouping skipped.');

            return 0;
        }

        $workspace = $service->forClient($client);

        foreach (['client', 'projects', 'selectedProject'] as $key) {
            if (! array_key_exists($key, $workspace)) {
                return $this->qaFail("Client workspace missing key: {$key}");
            }
        }

        foreach ($workspace['projects'] as $project) {
            foreach (['id', 'clientId', 'dossierNumber', 'projectObject', 'documentsCount', 'financeDocumentsCount', 'paymentsCount'] as $key) {
                if (! array_key_exists($key, $project)) {
                    return $this->qaFail("Client project summary missing key: {$key}");
                }
            }
        }

        $this->line('<fg=green>PASS</> Client workspace payload checked for ' . ($client->full_name ?? $client->id));

        return 0;
    }

    private function checkDossierGroups(DossierLocationGroupingService $service): int
    {
        $groups = $service->groups();
        $groupedCount = collect($groups)
            ->flatMap(fn (array $province) => $province['communes'] ?? [])
            ->sum(fn (array $commune) => count($commune['dossiers'] ?? []));

        $rawCount = Dossier::query()->count();

        if ($groupedCount !== $rawCount) {
            return $this->qaFail("Dossier location grouping count mismatch: grouped {$groupedCount}, raw {$rawCount}");
        }

        foreach ($groups as $province) {
            foreach (['province', 'stats', 'communes'] as $key) {
                if (! array_key_exists($key, $province)) {
                    return $this->qaFail("Dossier province group missing key: {$key}");
                }
            }
        }

        $this->line("<fg=green>PASS</> Dossier location groups checked ({$rawCount} project(s)).");

        return 0;
    }

    private function checkDocumentGroups(DocumentGroupingService $service): int
    {
        $groups = $service->groups();
        $groupedCount = collect($groups)
            ->flatMap(fn (array $province) => $province['communes'] ?? [])
            ->flatMap(fn (array $commune) => $commune['clients'] ?? [])
            ->flatMap(fn (array $client) => $client['projects'] ?? [])
            ->flatMap(fn (array $project) => $project['types'] ?? [])
            ->sum(fn (array $type) => count($type['documents'] ?? []));

        $rawCount = DossierDocument::query()->count();

        if ($groupedCount !== $rawCount) {
            return $this->qaFail("Document grouping count mismatch: grouped {$groupedCount}, raw {$rawCount}");
        }

        $this->line("<fg=green>PASS</> Document groups checked ({$rawCount} document(s)).");

        return 0;
    }

    private function checkFinanceMonths(FinanceMonthlySummaryService $service): int
    {
        $months = $service->months();
        $summaryTotal = round((float) collect($months)->sum('totalTtc'), 2);
        $rawTotal = round((float) FinanceDocument::query()->sum('total_ttc'), 2);

        if ($summaryTotal !== $rawTotal) {
            return $this->qaFail("Finance monthly total mismatch: grouped {$summaryTotal}, raw {$rawTotal}");
        }

        $summaryPaid = round((float) collect($months)->sum('paidTotal'), 2);
        $rawPaid = round((float) Payment::query()->sum('amount'), 2);

        if ($summaryPaid !== $rawPaid) {
            return $this->qaFail("Finance monthly payment mismatch: grouped {$summaryPaid}, raw {$rawPaid}");
        }

        $this->table(
            ['Months', 'Documents TTC', 'Payments'],
            [[count($months), number_format($summaryTotal, 2), number_format($summaryPaid, 2)]]
        );

        $this->line('<fg=green>PASS</> Finance monthly groups checked.');

        return 0;
    }

    private function qaFail(string $message): int
    {
        $this->error($message);

        return 1;
    }
}

```

## FILE: app\Http\Controllers\ContractController.php

```php
<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreContractRequest;
use App\Http\Requests\UpdateContractRequest;
use App\Http\Resources\ContractResource;
use App\Models\Contract;
use App\Models\Dossier;
use App\Notifications\ContractNotification;
use App\Services\ContractDocumentGenerator;
use App\Services\WordDocumentConverter;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ContractController extends Controller
{
    public function index(): Response
    {
        $contracts = Contract::query()
            ->with(['dossier.client'])
            ->latest()
            ->get();

        return Inertia::render('Contracts/Index', [
            'contracts' => ContractResource::collection($contracts)->resolve(),
            'dossiers' => $this->dossierOptions(),
            'metrics' => [
                'total' => Contract::count(),
                'draft' => Contract::where('status', 'draft')->count(),
                'generated' => Contract::where('status', 'generated')->count(),
                'signed' => Contract::where('status', 'signed')->count(),
                'totalTtc' => (float) Contract::sum('ttc'),
            ],
        ]);
    }

    public function store(StoreContractRequest $request): RedirectResponse
    {
        $data = $this->prepareContractData($request->validated());
        $data['contract_number'] = $this->nextContractNumber();

        $contract = Contract::create($data);

        $request->user()->notify(new ContractNotification($contract, 'created', 'Contract created: ' . $contract->contract_number));

        if ($request->filled('return_to')) {
            return redirect()
                ->to($request->string('return_to')->toString())
                ->with('success', 'Contract created successfully.');
        }

        return redirect()
            ->route('contracts.index')
            ->with('success', 'Contract created successfully.');
    }

    public function update(UpdateContractRequest $request, Contract $contract): RedirectResponse
    {
        $contract->update($this->prepareContractData($request->validated()));

        $request->user()->notify(new ContractNotification($contract->fresh(), 'updated', 'Contract updated: ' . $contract->contract_number));

        return redirect()
            ->route('contracts.index')
            ->with('success', 'Contract updated successfully.');
    }

    public function destroy(Contract $contract): RedirectResponse
    {
        $directory = 'contracts/' . $contract->contract_number;

        if (Storage::disk('public')->exists($directory)) {
            Storage::disk('public')->deleteDirectory($directory);
        }

        $contract->delete();

        return redirect()
            ->route('contracts.index')
            ->with('success', 'Contract deleted successfully.');
    }

    public function generate(Request $request, Contract $contract): RedirectResponse
    {
        try {
            $paths = app(ContractDocumentGenerator::class)->generate($contract);

            $contract->update([
                'status' => 'generated',
                'generated_document_path' => $paths['docx_path'],
                'generated_at' => now(),
            ]);

            $request->user()->notify(new ContractNotification($contract->fresh(), 'generated', 'Contract generated: ' . $contract->contract_number));

            return redirect()
                ->route('contracts.index')
                ->with('success', 'Contract DOCX generated successfully.');
        } catch (\Throwable $e) {
            return redirect()
                ->route('contracts.index')
                ->with('error', 'Failed to generate contract: ' . $e->getMessage());
        }
    }

    public function exportPdf(Contract $contract): RedirectResponse
    {
        if (!$contract->generated_document_path || !Storage::disk('public')->exists($contract->generated_document_path)) {
            return redirect()
                ->route('contracts.index')
                ->with('error', 'Generate the DOCX first before exporting PDF.');
        }

        $absoluteDocx = Storage::disk('public')->path($contract->generated_document_path);
        $pdfRelative = 'contracts/' . $contract->contract_number . '/' . $contract->contract_number . '-contract.pdf';
        $absolutePdf = Storage::disk('public')->path($pdfRelative);

        try {
            app(WordDocumentConverter::class)->convertDocxToPdf($absoluteDocx, $absolutePdf);

            $contract->update([
                'pdf_path' => $pdfRelative,
            ]);

            return redirect()
                ->route('contracts.index')
                ->with('success', 'PDF exported successfully.');
        } catch (\Throwable $e) {
            return redirect()
                ->route('contracts.index')
                ->with('error', 'PDF export failed: ' . $e->getMessage());
        }
    }

    public function markSigned(Request $request, Contract $contract): RedirectResponse
    {
        $contract->update([
            'status' => 'signed',
            'signed_at' => now(),
        ]);

        $request->user()->notify(new ContractNotification($contract->fresh(), 'signed', 'Contract signed: ' . $contract->contract_number));

        return redirect()
            ->route('contracts.index')
            ->with('success', 'Contract marked as signed.');
    }

    public function downloadGenerated(Contract $contract): StreamedResponse|RedirectResponse
    {
        if (!$contract->generated_document_path || !Storage::disk('public')->exists($contract->generated_document_path)) {
            $paths = app(ContractDocumentGenerator::class)->generate($contract);

            $contract->update([
                'status' => 'generated',
                'generated_document_path' => $paths['docx_path'],
                'generated_at' => now(),
            ]);

            $contract->refresh();
        }

        if (!$contract->generated_document_path || !Storage::disk('public')->exists($contract->generated_document_path)) {
            return redirect()
                ->route('contracts.index')
                ->with('error', 'Could not generate contract file.');
        }

        return Storage::disk('public')->download(
            $contract->generated_document_path,
            $contract->contract_number . '-contract.docx'
        );
    }

    public function downloadPdf(Contract $contract): StreamedResponse|RedirectResponse
    {
        if (!$contract->generated_document_path || !Storage::disk('public')->exists($contract->generated_document_path)) {
            $paths = app(ContractDocumentGenerator::class)->generate($contract);

            $contract->update([
                'status' => 'generated',
                'generated_document_path' => $paths['docx_path'],
                'generated_at' => now(),
            ]);

            $contract->refresh();
        }

        if (!$contract->pdf_path || !Storage::disk('public')->exists($contract->pdf_path)) {
            $absoluteDocx = Storage::disk('public')->path($contract->generated_document_path);
            $pdfRelative = 'contracts/' . $contract->contract_number . '/' . $contract->contract_number . '-contract.pdf';
            $absolutePdf = Storage::disk('public')->path($pdfRelative);

            app(WordDocumentConverter::class)->convertDocxToPdf($absoluteDocx, $absolutePdf);

            $contract->update([
                'pdf_path' => $pdfRelative,
            ]);

            $contract->refresh();
        }

        if (!$contract->pdf_path || !Storage::disk('public')->exists($contract->pdf_path)) {
            return redirect()
                ->route('contracts.index')
                ->with('error', 'Could not export PDF.');
        }

        return Storage::disk('public')->download(
            $contract->pdf_path,
            $contract->contract_number . '-contract.pdf'
        );
    }

    private function prepareContractData(array $data): array
    {
        $dossier = Dossier::query()->findOrFail($data['dossier_id']);
        unset($data['return_to']);

        $calculationMode = ($data['calculation_mode'] ?? 'percentage') === 'forfait'
            ? 'forfait'
            : 'percentage';
        $feeRatePercent = (float) ($data['fee_rate_percent'] ?? config('archilbo_templates.contracts.default_rate', 0.5));
        $surface = (float) ($data['surface'] ?? 0);
        $unitPrice = (float) ($data['price_per_square_meter'] ?? config('archilbo_templates.contracts.construction_unit_price', 900));
        $tvaRate = ((float) config('archilbo_templates.contracts.tva_rate', 20)) / 100;

        if ($surface <= 0) {
            $surface = (float) ($dossier->floor_area ?? 0);
        }

        $estimation = $surface * $unitPrice;

        if ($calculationMode === 'forfait') {
            $ttc = max(0, (float) ($data['forfait_ttc'] ?? 0));
            $ht = $tvaRate > -1 ? $ttc / (1 + $tvaRate) : $ttc;
            $tva = $ttc - $ht;
        } else {
            $ht = $estimation * ($feeRatePercent / 100);
            $tva = $ht * $tvaRate;
            $ttc = $ht + $tva;
        }

        return [
            'dossier_id' => $dossier->id,
            'status' => $data['status'] ?? 'draft',
            'surface' => $surface,
            'price_per_square_meter' => $unitPrice,
            'calculation_mode' => $calculationMode,
            'fee_rate_percent' => $feeRatePercent,
            'forfait_ttc' => $calculationMode === 'forfait' ? $ttc : null,
            'ht' => $ht,
            'tva' => $tva,
            'ttc' => $ttc,
            'notes' => $data['notes'] ?? null,
        ];
    }

    private function nextContractNumber(): string
    {
        $year = now()->format('Y');
        $next = Contract::count() + 1;

        do {
            $number = sprintf('CTR-%s-%04d', $year, $next);
            $next++;
        } while (Contract::where('contract_number', $number)->exists());

        return $number;
    }

    private function dossierOptions(): array
    {
        return Dossier::query()
            ->with(['client', 'contract'])
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (Dossier $dossier) => [
                'id' => (string) $dossier->id,
                'label' => $dossier->dossier_number . ' - ' . $dossier->project_object . ' - ' . ($dossier->client?->full_name ?? '-'),
                'floorArea' => $dossier->floor_area !== null ? (float) $dossier->floor_area : null,
                'hasContract' => $dossier->contract !== null,
            ])
            ->values()
            ->all();
    }
}

```

## FILE: app\Http\Controllers\ConversationController.php

```php
<?php

namespace App\Http\Controllers;

use App\Http\Requests\Chat\StoreConversationRequest;
use App\Http\Resources\ConversationResource;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use App\Services\Chat\ChatService;
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
        $conversations = Conversation::whereHas('participants', fn ($q) => $q->where('user_id', $user->id))
            ->with([
                'participants.user',
                'messages' => fn ($q) => $q->latest()->limit(1),
            ])
            ->orderByDesc('last_message_at')
            ->get();

        $users = User::where('id', '!=', $user->id)->orderBy('name')->get()->map(fn (User $u) => [
            'id' => $u->id, 'name' => $u->name, 'email' => $u->email,
        ]);

        return Inertia::render('Inbox/Index', [
            'conversations' => ConversationResource::collection($conversations)->resolve(),
            'users' => $users,
            'unreadCount' => $this->chatService->unreadCount($user),
        ]);
    }

    public function show(Request $request, Conversation $conversation)
    {
        $this->authorize('view', $conversation);
        $conversation->load(['participants.user', 'messages.user', 'messages.reads', 'messages.attachments']);
        $this->chatService->markAsRead($conversation, $request->user());

        return response()->json([
            'conversation' => (new ConversationResource($conversation))->resolve(),
            'messages' => $conversation->messages->map(fn ($m) => [
                'id' => $m->id,
                'body' => $m->body,
                'isEdited' => $m->is_edited,
                'userId' => $m->user_id,
                'userName' => $m->user->name,
                'readBy' => $m->reads->pluck('user_id'),
                'createdAt' => $m->created_at?->toISOString(),
            ]),
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
            $conversation = Conversation::create([
                'type' => 'group',
                'subject' => $data['subject'] ?? null,
            ]);
            $participants = array_merge($userIds, [$request->user()->id]);
            foreach ($participants as $uid) {
                $conversation->participants()->create(['user_id' => $uid]);
            }
        }

        return redirect()->route('inbox.index');
    }
}

```

## FILE: app\Http\Controllers\Finance\FinanceDocumentController.php

```php
<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Http\Requests\Finance\ConvertQuoteToInvoiceRequest;
use App\Http\Requests\Finance\StoreFinanceDocumentRequest;
use App\Http\Requests\Finance\UpdateFinanceDocumentRequest;
use App\Http\Resources\FinanceDocumentResource;
use App\Http\Resources\PaymentResource;
use App\Notifications\FinanceDocumentNotification;
use App\Models\Client;
use App\Models\Dossier;
use App\Models\FinanceDocument;
use App\Models\FinanceDocumentItem;
use App\Models\FinanceTemplate;
use App\Models\Payment;
use App\Services\Finance\FinanceExcelExporter;
use App\Services\Finance\FinanceNumberService;
use App\Services\Finance\FinancePdfGenerator;
use App\Services\Finance\FinanceSettingsService;
use App\Services\Finance\FinanceMonthlySummaryService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\Process\Process;

class FinanceDocumentController extends Controller
{
    public function index(Request $request, FinanceMonthlySummaryService $monthlySummaryService): Response
    {
        $query = FinanceDocument::with(['client', 'dossier', 'items', 'payments'])
            ->withCount('payments');

        if ($type = $request->input('type')) {
            $query->where('type', $type);
        }

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('number', 'like', "%{$search}%")
                    ->orWhereHas('client', fn ($cq) => $cq->where('full_name', 'like', "%{$search}%"))
                    ->orWhereHas('dossier', fn ($dq) => $dq->where('dossier_number', 'like', "%{$search}%"));
            });
        }

        $documents = $query->orderBy('created_at', 'desc')->limit(100)->get();
        $records = FinanceDocumentResource::collection($documents)->resolve($request);

        $payments = Payment::with(['document', 'client', 'dossier', 'receiptDocument'])
            ->orderByDesc('paid_at')
            ->orderByDesc('created_at')
            ->limit(100)
            ->get();

        $currency = FinanceSettingsService::getCurrency();

        $metrics = [
            'totalQuotes' => (float) FinanceDocument::where('type', 'quote')->sum('total_ttc'),
            'totalInvoices' => (float) FinanceDocument::where('type', 'invoice')->sum('total_ttc'),
            'paidTotal' => (float) FinanceDocument::where('type', 'invoice')->sum('paid_total'),
            'remainingTotal' => (float) FinanceDocument::where('type', 'invoice')->sum('remaining_total'),
            'overdueTotal' => (float) FinanceDocument::where('type', 'invoice')->where('status', 'overdue')->sum('remaining_total'),
            'draftCount' => FinanceDocument::where('status', 'draft')->count(),
            'currency' => $currency,
        ];

        return Inertia::render('Finance/Documents/Index', [
            'documents' => $records,
            'payments' => PaymentResource::collection($payments)->resolve($request),
            'monthlySummaries' => $monthlySummaryService->months(),
            'metrics' => $metrics,
            'clients' => Client::select('id', 'full_name', 'cin', 'address')
                ->orderBy('full_name')
                ->get()
                ->map(fn ($c) => [
                    'id' => (string) $c->id,
                    'label' => $c->full_name,
                    'cin' => $c->cin,
                    'address' => $c->address,
                ]),
            'dossiers' => Dossier::select('id', 'client_id', 'dossier_number', 'project_object', 'project_address', 'floor_area', 'land_surface')
                ->orderBy('dossier_number')
                ->get()
                ->map(fn ($d) => [
                    'id' => (string) $d->id,
                    'label' => trim($d->dossier_number . ' - ' . ($d->project_object ?? '')),
                    'clientId' => (string) $d->client_id,
                    'projectObject' => $d->project_object,
                    'address' => $d->project_address,
                    'floorArea' => $d->floor_area,
                    'landSurface' => $d->land_surface,
                ]),
            'templates' => FinanceTemplate::query()
                ->orderBy('name')
                ->get()
                ->map(fn ($template) => [
                    'id' => (string) $template->id,
                    'label' => $template->name,
                    'type' => $template->type,
                ]),
            'defaultTemplates' => FinanceTemplate::query()
                ->where('is_default', true)
                ->orderBy('type')
                ->get()
                ->map(fn ($template) => [
                    'id' => (string) $template->id,
                    'label' => $template->name,
                    'type' => $template->type,
                    'slug' => $template->slug,
                ]),
            'templateEditorUrl' => route('finance.templates.index'),
            'settings' => [
                'defaultTvaRate' => FinanceSettingsService::getTvaRate(),
                'defaultCurrency' => $currency,
                'defaultPaymentTermsDays' => FinanceSettingsService::getDefaultPaymentDays(),
                'defaultQuoteValidityDays' => 30,
                'defaultUnitPriceM2' => 0,
                'defaultArchitectRate' => 0,
                'companyInfo' => [],
                'bankInfo' => [],
            ],
            'filters' => $request->only(['type', 'status', 'search']),
        ]);
    }

    public function store(StoreFinanceDocumentRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $document = DB::transaction(function () use ($data, $request) {
            $number = FinanceNumberService::nextDocumentNumber($data['type']);

            $document = FinanceDocument::create([
                'type' => $data['type'],
                'number' => $number,
                'status' => 'draft',
                'client_id' => $data['client_id'] ?? null,
                'dossier_id' => $data['dossier_id'] ?? null,
                'issue_date' => $data['issue_date'] ?? now(),
                'due_date' => $data['due_date'] ?? now()->addDays(FinanceSettingsService::getDefaultPaymentDays()),
                'valid_until' => $data['valid_until'] ?? now()->addDays(30),
                'currency' => $data['currency'] ?? FinanceSettingsService::getCurrency(),
                'tva_rate' => $data['tva_rate'] ?? FinanceSettingsService::getTvaRate(),
                'discount_total' => $data['discount_total'] ?? 0,
                'notes' => $data['notes'] ?? null,
                'terms' => $data['terms'] ?? FinanceSettingsService::getDefaultPaymentTerms(),
                'template_id' => $data['template_id'] ?? null,
                'created_by' => Auth::id(),
            ]);

            if (!empty($data['items'])) {
                foreach (array_values($data['items']) as $pos => $itemData) {
                    $item = new FinanceDocumentItem([
                        'position' => $pos + 1,
                        'title' => $itemData['title'] ?? null,
                        'description' => $itemData['description'] ?? null,
                        'quantity' => $itemData['quantity'] ?? 1,
                        'unit' => $itemData['unit'] ?? null,
                        'unit_price' => $itemData['unit_price'] ?? 0,
                        'discount_rate' => $itemData['discount_rate'] ?? 0,
                        'tva_rate' => $itemData['tva_rate'] ?? $document->tva_rate,
                    ]);
                    $item->calculateTotals();
                    $document->items()->save($item);
                }
            }

            $document->recalculateTotals()->save();

            return $document;
        });

        $request->user()->notify(new FinanceDocumentNotification($document, 'created', ucfirst($document->type) . ' created: ' . $document->number));

        return redirect()->route('finance.documents.index', [
            'tab' => match ($document->type) {
                'quote' => 'quotes',
                'invoice' => 'invoices',
                'receipt' => 'overview',
                default => 'overview',
            },
        ])->with('success', "Document {$document->number} cree avec succes.");
    }

    public function show(FinanceDocument $financeDocument): Response
    {
        $financeDocument->loadMissing(['client', 'dossier', 'items', 'payments', 'template', 'creator']);

        return Inertia::render('Finance/Documents/Show', [
            'document' => new FinanceDocumentResource($financeDocument),
        ]);
    }

    public function update(UpdateFinanceDocumentRequest $request, FinanceDocument $financeDocument): RedirectResponse
    {
        $data = $request->validated();

        DB::transaction(function () use ($data, $financeDocument) {
            $financeDocument->update([
                'type' => $data['type'] ?? $financeDocument->type,
                'client_id' => $data['client_id'] ?? $financeDocument->client_id,
                'dossier_id' => $data['dossier_id'] ?? $financeDocument->dossier_id,
                'status' => $data['status'] ?? $financeDocument->status,
                'issue_date' => $data['issue_date'] ?? $financeDocument->issue_date,
                'due_date' => $data['due_date'] ?? $financeDocument->due_date,
                'valid_until' => $data['valid_until'] ?? $financeDocument->valid_until,
                'currency' => $data['currency'] ?? $financeDocument->currency,
                'tva_rate' => $data['tva_rate'] ?? $financeDocument->tva_rate,
                'discount_total' => $data['discount_total'] ?? $financeDocument->discount_total,
                'notes' => $data['notes'] ?? $financeDocument->notes,
                'terms' => $data['terms'] ?? $financeDocument->terms,
                'template_id' => $data['template_id'] ?? $financeDocument->template_id,
            ]);

            if (isset($data['items'])) {
                $financeDocument->items()->delete();

                foreach (array_values($data['items']) as $pos => $itemData) {
                    $item = new FinanceDocumentItem([
                        'position' => $pos + 1,
                        'title' => $itemData['title'],
                        'description' => $itemData['description'] ?? null,
                        'quantity' => $itemData['quantity'] ?? 1,
                        'unit' => $itemData['unit'] ?? null,
                        'unit_price' => $itemData['unit_price'] ?? 0,
                        'discount_rate' => $itemData['discount_rate'] ?? 0,
                        'tva_rate' => $itemData['tva_rate'] ?? $financeDocument->tva_rate,
                    ]);
                    $item->calculateTotals();
                    $financeDocument->items()->save($item);
                }
            }

            $financeDocument->recalculateTotals()->save();
        });

        return redirect()->route('finance.documents.index', [
            'tab' => match ($financeDocument->type) {
                'quote' => 'quotes',
                'invoice' => 'invoices',
                'receipt' => 'overview',
                default => 'overview',
            },
        ])->with('success', "Document {$financeDocument->number} mis a jour.");
    }

    public function destroy(FinanceDocument $financeDocument): RedirectResponse
    {
        $number = $financeDocument->number;
        $financeDocument->delete();

        return redirect()->route('finance.documents.index')
            ->with('success', "Document {$number} supprime.");
    }

    public function generate(Request $request, FinanceDocument $financeDocument, FinancePdfGenerator $pdfGenerator, FinanceExcelExporter $excelExporter): RedirectResponse
    {
        if ($financeDocument->items()->count() === 0) {
            return redirect()->back()->with('error', 'Ajoutez au moins une ligne au document avant generation.');
        }

        try {
            $pdfGenerator->generate($financeDocument);
            $excelExporter->generate($financeDocument->refresh());

            $request->user()->notify(new FinanceDocumentNotification($financeDocument, 'generated', ucfirst($financeDocument->type) . ' generated: ' . $financeDocument->number));

            return redirect()->back()->with('success', "Document {$financeDocument->number} genere avec succes.");
        } catch (\Throwable $e) {
            return redirect()->back()->with('error', 'Erreur de generation : ' . $e->getMessage());
        }
    }

    public function generatePdf(FinanceDocument $financeDocument, FinancePdfGenerator $generator): RedirectResponse
    {
        if ($financeDocument->items()->count() === 0) {
            return redirect()->back()->with('error', 'Ajoutez au moins une ligne au document avant generation PDF.');
        }

        try {
            $generator->generate($financeDocument);

            return redirect()->back()->with('success', "PDF {$financeDocument->number} genere avec succes.");
        } catch (\Throwable $e) {
            return redirect()->back()->with('error', 'Erreur de generation PDF : ' . $e->getMessage());
        }
    }

    public function generateExcel(FinanceDocument $financeDocument, FinanceExcelExporter $exporter): RedirectResponse
    {
        if ($financeDocument->items()->count() === 0) {
            return redirect()->back()->with('error', 'Ajoutez au moins une ligne au document avant export Excel.');
        }

        try {
            $exporter->generate($financeDocument);

            return redirect()->back()->with('success', "Excel {$financeDocument->number} genere avec succes.");
        } catch (\Throwable $e) {
            return redirect()->back()->with('error', 'Erreur export Excel : ' . $e->getMessage());
        }
    }

    public function download(FinanceDocument $financeDocument)
    {
        return $this->downloadExcel($financeDocument);
    }

    public function downloadExcel(FinanceDocument $financeDocument)
    {
        if (!$financeDocument->excel_path || !Storage::disk('public')->exists($financeDocument->excel_path)) {
            return redirect()->back()->with('error', 'Aucun fichier Excel disponible.');
        }

        return Storage::disk('public')->download($financeDocument->excel_path, $financeDocument->number . '.xlsx');
    }

    public function downloadPdf(FinanceDocument $financeDocument)
    {
        if (!$financeDocument->pdf_path || !Storage::disk('public')->exists($financeDocument->pdf_path)) {
            return redirect()->back()->with('error', 'Aucun PDF disponible.');
        }

        return Storage::disk('public')->download($financeDocument->pdf_path, $financeDocument->number . '.pdf');
    }
    public function revealGeneratedFiles(FinanceDocument $financeDocument): RedirectResponse
    {
        if (!app()->environment('local')) {
            return redirect()->back()->with('error', 'Ouverture Explorer disponible uniquement en local.');
        }

        if (PHP_OS_FAMILY !== 'Windows') {
            return redirect()->back()->with('error', 'Ouverture Explorer disponible uniquement sur Windows.');
        }

        $relativePath = $financeDocument->pdf_path ?: $financeDocument->excel_path;

        if (!$relativePath || !Storage::disk('public')->exists($relativePath)) {
            return redirect()->back()->with('error', 'Aucun fichier genere disponible.');
        }

        $absolutePath = Storage::disk('public')->path($relativePath);
        $storageRoot = realpath(Storage::disk('public')->path(''));
        $realFile = realpath($absolutePath);

        if (!$storageRoot || !$realFile || !str_starts_with($realFile, $storageRoot)) {
            return redirect()->back()->with('error', 'Emplacement fichier invalide.');
        }

        try {
            (new Process(['explorer.exe', '/select,' . $realFile]))->start();

            return redirect()->back()->with('success', 'Dossier genere ouvert dans Explorer.');
        } catch (\Throwable $e) {
            return redirect()->back()->with('error', 'Impossible d ouvrir Explorer : ' . $e->getMessage());
        }
    }

    public function accept(Request $request, FinanceDocument $financeDocument): RedirectResponse
    {
        if (!$financeDocument->isQuote()) {
            return redirect()->back()->with('error', 'Seul un devis peut etre accepte.');
        }

        $financeDocument->update([
            'status' => 'accepted',
            'accepted_at' => now(),
        ]);

        $request->user()->notify(new FinanceDocumentNotification($financeDocument->fresh(), 'accepted', 'Quote accepted: ' . $financeDocument->number));

        return redirect()->back()->with('success', "Devis {$financeDocument->number} accepte !");
    }

    public function reject(Request $request, FinanceDocument $financeDocument): RedirectResponse
    {
        if (!$financeDocument->isQuote()) {
            return redirect()->back()->with('error', 'Seul un devis peut etre refuse.');
        }

        $financeDocument->update([
            'status' => 'rejected',
            'rejected_at' => now(),
        ]);

        $request->user()->notify(new FinanceDocumentNotification($financeDocument->fresh(), 'rejected', 'Quote rejected: ' . $financeDocument->number));

        return redirect()->back()->with('success', "Devis {$financeDocument->number} refuse !");
    }

    public function cancel(Request $request, FinanceDocument $financeDocument): RedirectResponse
    {
        $financeDocument->update([
            'status' => 'cancelled',
        ]);

        $request->user()->notify(new FinanceDocumentNotification($financeDocument->fresh(), 'cancelled', ucfirst($financeDocument->type) . ' cancelled: ' . $financeDocument->number));

        return redirect()->back()->with('success', "Document {$financeDocument->number} annule !");
    }

    public function convertToInvoice(ConvertQuoteToInvoiceRequest $request, FinanceDocument $financeDocument): RedirectResponse
    {
        if (!$financeDocument->canConvertToInvoice()) {
            return redirect()->back()->with('error', 'Ce devis ne peut pas etre converti.');
        }

        $data = $request->validated();

        $invoice = DB::transaction(function () use ($financeDocument, $data) {
            $invoiceNumber = FinanceNumberService::nextDocumentNumber('invoice');

            $invoice = FinanceDocument::create([
                'type' => 'invoice',
                'number' => $invoiceNumber,
                'status' => 'issued',
                'client_id' => $financeDocument->client_id,
                'dossier_id' => $financeDocument->dossier_id,
                'source_document_id' => $financeDocument->id,
                'issue_date' => $data['issue_date'] ?? now(),
                'due_date' => $data['due_date'] ?? now()->addDays(FinanceSettingsService::getDefaultPaymentDays()),
                'valid_until' => $financeDocument->valid_until,
                'currency' => $financeDocument->currency,
                'tva_rate' => $financeDocument->tva_rate,
                'subtotal_ht' => $financeDocument->subtotal_ht,
                'discount_total' => $financeDocument->discount_total,
                'tax_total' => $financeDocument->tax_total,
                'total_ttc' => $financeDocument->total_ttc,
                'remaining_total' => $financeDocument->total_ttc,
                'notes' => $data['notes'] ?? $financeDocument->notes,
                'terms' => $financeDocument->terms,
                'template_id' => $financeDocument->template_id,
                'created_by' => Auth::id(),
            ]);

            foreach ($financeDocument->items as $item) {
                $newItem = $item->replicate();
                $newItem->finance_document_id = $invoice->id;
                $newItem->save();
            }

            $financeDocument->update([
                'status' => 'converted',
            ]);

            return $invoice;
        });

        $request->user()->notify(new FinanceDocumentNotification($invoice, 'converted', 'Quote converted to invoice: ' . $invoice->number));

        return redirect()->route('finance.documents.show', $invoice)
            ->with('success', "Facture {$invoice->number} creee a partir du devis {$financeDocument->number} !");
    }
}

```

## FILE: app\Http\Controllers\FinanceController.php

```php
<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreFinanceRecordRequest;
use App\Http\Requests\UpdateFinanceRecordRequest;
use App\Http\Resources\FinanceRecordResource;
use App\Models\Dossier;
use App\Models\FinanceRecord;
use App\Services\FinanceDocumentGenerator;
use App\Services\OfficeDocumentConverter;
use Illuminate\Support\Facades\File;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class FinanceController extends Controller
{
    public function index(): Response
    {
        $records = FinanceRecord::query()
            ->with(['dossier.client', 'client'])
            ->latest()
            ->get();

        return Inertia::render('Finance/Index', [
            'financeRecords' => FinanceRecordResource::collection($records)->resolve(),
            'dossiers' => $this->dossierOptions(),
            'metrics' => [
                'totalRecords' => FinanceRecord::count(),
                'totalTtc' => (float) FinanceRecord::sum('total_ttc'),
                'paid' => (float) FinanceRecord::sum('paid'),
                'remaining' => (float) FinanceRecord::sum('remaining'),
                'overdue' => (float) FinanceRecord::query()
                    ->whereDate('due_date', '<', now()->toDateString())
                    ->where('remaining', '>', 0)
                    ->sum('remaining'),
                'draft' => FinanceRecord::where('status', 'draft')->count(),
                'sent' => FinanceRecord::where('status', 'sent')->count(),
                'paidCount' => FinanceRecord::where('status', 'paid')->count(),
                'partiallyPaid' => FinanceRecord::where('status', 'partially_paid')->count(),
                'overdueCount' => FinanceRecord::where('status', 'overdue')->count(),
            ],
        ]);
    }

    public function store(StoreFinanceRecordRequest $request): RedirectResponse
    {
        $data = $this->prepareFinanceData($request->validated());
        $data['record_number'] = $this->nextRecordNumber($data['type']);

        FinanceRecord::create($data);

        return redirect()
            ->route('finance.index')
            ->with('success', 'Finance record created successfully.');
    }

    public function update(UpdateFinanceRecordRequest $request, FinanceRecord $financeRecord): RedirectResponse
    {
        $financeRecord->update($this->prepareFinanceData($request->validated()));

        return redirect()
            ->route('finance.index')
            ->with('success', 'Finance record updated successfully.');
    }

    public function destroy(FinanceRecord $financeRecord): RedirectResponse
    {
        $financeRecord->delete();

        return redirect()
            ->route('finance.index')
            ->with('success', 'Finance record deleted successfully.');
    }

    public function markPaid(FinanceRecord $financeRecord): RedirectResponse
    {
        $financeRecord->update([
            'status' => 'paid',
            'paid' => $financeRecord->total_ttc,
            'remaining' => 0,
            'paid_at' => now()->toDateString(),
        ]);

        return redirect()
            ->route('finance.index')
            ->with('success', 'Finance record marked as paid.');
    }

    public function generate(FinanceRecord $financeRecord): RedirectResponse
    {
        try {
            // Delete old generated files before regenerating
            $oldDir = storage_path('app/public/finance/' . $financeRecord->record_number);
            if (is_dir($oldDir)) {
                File::deleteDirectory($oldDir);
            }

            $paths = app(FinanceDocumentGenerator::class)->generate($financeRecord);

            $financeRecord->update([
                'generated_file_path' => $paths['xlsx_path'],
                'generated_pdf_path' => null,
                'generated_at' => now(),
            ]);

            return redirect()
                ->route('finance.index')
                ->with('success', 'Excel document generated successfully.');
        } catch (\Throwable $e) {
            return redirect()
                ->route('finance.index')
                ->with('error', 'Generation failed: ' . $e->getMessage());
        }
    }

    public function download(FinanceRecord $financeRecord): RedirectResponse|StreamedResponse
    {
        if (!$financeRecord->generated_file_path) {
            return redirect()
                ->route('finance.index')
                ->with('error', 'No generated document found. Please generate first.');
        }

        if (!Storage::disk('public')->exists($financeRecord->generated_file_path)) {
            return redirect()
                ->route('finance.index')
                ->with('error', 'Generated file is missing. Please regenerate.');
        }

        return Storage::disk('public')->download(
            $financeRecord->generated_file_path,
            $financeRecord->record_number . '.xlsx'
        );
    }

    public function exportPdf(Request $request, FinanceRecord $financeRecord): RedirectResponse
    {
        if (!$financeRecord->generated_file_path) {
            return redirect()
                ->route('finance.index')
                ->with('error', 'No generated document found. Please generate first.');
        }

        $absoluteXlsx = Storage::disk('public')->path($financeRecord->generated_file_path);

        if (!file_exists($absoluteXlsx)) {
            return redirect()
                ->route('finance.index')
                ->with('error', 'Generated file is missing. Please regenerate.');
        }

        $converter = app(OfficeDocumentConverter::class);

        if (!$converter->isAvailable()) {
            return redirect()
                ->route('finance.index')
                ->with('error', 'LibreOffice is not installed. XLSX generated, but PDF export is unavailable.');
        }

        try {
            $relativePdf = 'finance/' . $financeRecord->record_number . '/' . $financeRecord->record_number . '.pdf';
            $absolutePdf = Storage::disk('public')->path($relativePdf);

            $converter->convertDocxToPdf($absoluteXlsx, $absolutePdf);

            $financeRecord->update([
                'generated_pdf_path' => $relativePdf,
            ]);

            return redirect()
                ->route('finance.index')
                ->with('success', 'PDF exported successfully.');
        } catch (\Throwable $e) {
            return redirect()
                ->route('finance.index')
                ->with('error', 'PDF export failed: ' . $e->getMessage());
        }
    }

    public function downloadPdf(FinanceRecord $financeRecord): RedirectResponse|StreamedResponse
    {
        if (!$financeRecord->generated_pdf_path) {
            return redirect()
                ->route('finance.index')
                ->with('error', 'No PDF found. Please export PDF first.');
        }

        if (!Storage::disk('public')->exists($financeRecord->generated_pdf_path)) {
            return redirect()
                ->route('finance.index')
                ->with('error', 'PDF file is missing. Please re-export.');
        }

        return Storage::disk('public')->download(
            $financeRecord->generated_pdf_path,
            $financeRecord->record_number . '.pdf'
        );
    }

    private function prepareFinanceData(array $data): array
    {
        $dossier = Dossier::query()->with('client')->findOrFail($data['dossier_id']);

        $totalTtc = (float) ($data['total_ttc'] ?? 0);
        $ht = (float) ($data['ht'] ?? 0);
        $tva = (float) ($data['tva'] ?? 0);
        $paid = (float) ($data['paid'] ?? 0);

        if ($ht <= 0 && $totalTtc > 0) {
            $ht = round($totalTtc / 1.20, 2);
        }

        if ($tva <= 0 && $totalTtc > 0) {
            $tva = round($totalTtc - $ht, 2);
        }

        if ($totalTtc <= 0) {
            $totalTtc = $ht + $tva;
        }

        if ($paid > $totalTtc) {
            $paid = $totalTtc;
        }

        $remaining = max($totalTtc - $paid, 0);

        $status = $data['status'] ?? 'draft';

        if ($remaining <= 0 && $totalTtc > 0) {
            $status = 'paid';
        } elseif ($paid > 0 && $remaining > 0) {
            $status = 'partially_paid';
        } elseif (($data['due_date'] ?? null) && $remaining > 0 && $data['due_date'] < now()->toDateString()) {
            $status = 'overdue';
        }

        return [
            'dossier_id' => $dossier->id,
            'client_id' => $dossier->client_id,
            'type' => $data['type'] ?? 'devis',
            'status' => $status,
            'ht' => $ht,
            'tva' => $tva,
            'total_ttc' => $totalTtc,
            'paid' => $paid,
            'remaining' => $remaining,
            'issued_at' => ($data['issued_at'] ?? null) ?: now()->toDateString(),
            'due_date' => ($data['due_date'] ?? null) ?: null,
            'paid_at' => ($status === 'paid') ? (($data['paid_at'] ?? null) ?: now()->toDateString()) : (($data['paid_at'] ?? null) ?: null),
            'notes' => $data['notes'] ?? null,
        ];
    }

    private function nextRecordNumber(string $type): string
    {
        $year = now()->format('Y');

        $prefix = match ($type) {
            'invoice' => 'INV',
            'payment' => 'PAY',
            default => 'DEV',
        };

        $next = FinanceRecord::where('type', $type)->count() + 1;

        do {
            $number = sprintf('%s-%s-%04d', $prefix, $year, $next);
            $next++;
        } while (FinanceRecord::where('record_number', $number)->exists());

        return $number;
    }

    private function dossierOptions(): array
    {
        return Dossier::query()
            ->with('client')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (Dossier $dossier) => [
                'id' => (string) $dossier->id,
                'label' => $dossier->dossier_number . ' - ' . $dossier->project_object . ' - ' . ($dossier->client?->full_name ?? '-'),
                'clientName' => $dossier->client?->full_name ?? '-',
            ])
            ->values()
            ->all();
    }
}

```

## FILE: app\Http\Controllers\MessageController.php

```php
<?php

namespace App\Http\Controllers;

use App\Http\Requests\Chat\StoreMessageRequest;
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
        $message = $this->chatService->sendMessage($conversation, $request->user(), $request->validated('body'));
        $message->load('user');

        return response()->json([
            'id' => $message->id,
            'body' => $message->body,
            'userId' => $message->user_id,
            'userName' => $message->user->name,
            'createdAt' => $message->created_at?->toISOString(),
        ]);
    }

    public function update(Request $request, Conversation $conversation, Message $message): RedirectResponse
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

        return redirect()->back();
    }

    public function destroy(Conversation $conversation, Message $message): RedirectResponse
    {
        $this->authorize('view', $conversation);
        $this->authorize('delete', $message);
        abort_unless($message->conversation_id === $conversation->id, 404);
        $message->delete();
        return redirect()->back();
    }
}

```

## FILE: app\Http\Controllers\NotificationController.php

```php
<?php

namespace App\Http\Controllers;

use App\Http\Resources\NotificationResource;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', \Illuminate\Notifications\DatabaseNotification::class);
        $user = $request->user();
        $filter = $request->query('filter', 'all');

        $query = $user->notifications()->latest();

        if ($filter === 'unread') {
            $query->whereNull('read_at');
        }

        $notifications = $query->paginate(20);

        return Inertia::render('Notifications/Index', [
            'notifications' => NotificationResource::collection($notifications)->resolve(),
            'unreadCount' => $user->unreadNotifications()->count(),
            'activeFilter' => $filter,
        ]);
    }

    public function markAsRead(Request $request, string $id): RedirectResponse
    {
        $notification = $request->user()->notifications()->findOrFail($id);
        $this->authorize('update', $notification);
        $notification->markAsRead();

        return redirect()->back();
    }

    public function markAllAsRead(Request $request): RedirectResponse
    {
        $this->authorize('viewAny', \Illuminate\Notifications\DatabaseNotification::class);
        $request->user()->unreadNotifications->markAsRead();
        return redirect()->back();
    }
}

```

## FILE: app\Http\Controllers\TaskAttachmentController.php

```php
<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\TaskAttachment;
use App\Services\Task\TaskActivityService;
use App\Services\Task\TaskNotificationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class TaskAttachmentController extends Controller
{
    public function __construct(
        protected TaskActivityService $activityService,
        protected TaskNotificationService $notificationService,
    ) {}

    public function store(Request $request, Task $task): RedirectResponse
    {
        $this->authorize('update', $task);
        $request->validate([
            'file' => ['required', 'file', 'max:10240'],
        ]);

        $file = $request->file('file');
        $filename = $file->hashName();
        $path = $file->storeAs('task-attachments/' . $task->id, $filename, 'local');

        if ($path === false) {
            return redirect()->back()->with('error', 'Failed to store file.');
        }

        $attachment = TaskAttachment::create([
            'task_id' => $task->id,
            'user_id' => $request->user()->id,
            'filename' => $filename,
            'original_filename' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType(),
            'size' => $file->getSize(),
        ]);

        $this->activityService->log($task, $request->user()->id, 'attachment_added', 'File attached: ' . $attachment->original_filename);
        $this->notificationService->notifyWatchers($task, 'file_attached', 'File attached to ' . $task->title);

        return redirect()->back()->with('success', 'File attached.');
    }

    public function destroy(Task $task, TaskAttachment $attachment): RedirectResponse
    {
        $this->authorize('update', $task);
        abort_unless($attachment->task_id === $task->id, 404);

        $path = 'task-attachments/' . $task->id . '/' . $attachment->filename;
        if (Storage::disk('local')->exists($path)) {
            Storage::disk('local')->delete($path);
        }

        $this->activityService->log($task, $attachment->user_id, 'attachment_removed', 'File removed: ' . $attachment->original_filename);

        $attachment->delete();
        return redirect()->back()->with('success', 'Attachment removed.');
    }
}

```

## FILE: app\Http\Controllers\TaskController.php

```php
<?php

namespace App\Http\Controllers;

use App\Http\Requests\Task\StoreTaskRequest;
use App\Http\Requests\Task\UpdateTaskRequest;
use App\Http\Resources\TaskResource;
use App\Models\Task;
use App\Services\Task\TaskMutationService;
use App\Services\Task\TaskQueryService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class TaskController extends Controller
{
    public function __construct(
        protected TaskQueryService $tasks,
        protected TaskMutationService $mutations,
    ) {}

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Task::class);

        return Inertia::render('Tasks/Index', $this->tasks->indexPayload($request));
    }

    public function store(StoreTaskRequest $request): RedirectResponse
    {
        $this->authorize('create', Task::class);
        $this->mutations->create($request->validated(), $request->user());

        return redirect()->route('tasks.index')->with('success', 'Task created.');
    }

    public function show(Task $task): Response
    {
        $this->authorize('view', $task);

        $task->load([
            'creator', 'assigner', 'assignees', 'watchers',
            'checklistItems.completedBy',
            'comments.user',
            'attachments.user',
            'activityLogs.user',
            'dossier', 'client', 'document', 'financeDocument', 'contract', 'authorization', 'archiveRecord',
        ]);
        $task->loadCount(['comments', 'attachments']);

        return Inertia::render('Tasks/Show', [
            'task' => new TaskResource($task),
        ]);
    }

    public function update(UpdateTaskRequest $request, Task $task): RedirectResponse
    {
        $this->authorize('update', $task);
        $this->mutations->update($task, $request->validated(), $request->user());

        return redirect()->back()->with('success', 'Task updated.');
    }

    public function destroy(Task $task): RedirectResponse
    {
        $this->authorize('delete', $task);
        $task->delete();

        return redirect()->route('tasks.index')->with('success', 'Task deleted.');
    }

    public function updateStatus(Request $request, Task $task): RedirectResponse
    {
        $this->authorize('updateStatus', $task);
        $data = $request->validate(['status' => ['required', Rule::in(config('archilbo_operations.task_statuses', []))]]);
        $this->mutations->updateStatus($task, $data['status'], $request->user());

        return redirect()->back()->with('success', 'Status updated.');
    }
}

```

## FILE: app\Http\Middleware\HandleInertiaRequests.php

```php
<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $user = $request->user();

        return [
            ...parent::share($request),

            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'roles' => method_exists($user, 'getRoleNames')
                        ? $user->getRoleNames()->values()
                        : [],
                    'permissions' => method_exists($user, 'getAllPermissions')
                        ? $user->getAllPermissions()->pluck('name')->values()
                        : [],
                    'unread_notifications' => $user->unreadNotifications()->count(),
                    'unread_messages' => \App\Models\Message::whereHas(
                        'conversation.participants',
                        fn ($q) => $q->where('user_id', $user->id),
                    )->where('user_id', '!=', $user->id)
                        ->whereDoesntHave('reads', fn ($q) => $q->where('user_id', $user->id))
                        ->count(),
                    'recent_notifications' => \App\Http\Resources\NotificationResource::collection(
                        $user->notifications()->latest()->take(20)->get()
                    )->resolve(),
                ] : null,
            ],

            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'warning' => fn () => $request->session()->get('warning'),
                'info' => fn () => $request->session()->get('info'),
                'receipt' => fn () => $request->session()->get('receipt'),
            ],
        ];
    }
}

```

## FILE: app\Http\Requests\Auth\LoginRequest.php

```php
<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
            'remember' => ['nullable', 'boolean'],
        ];
    }

    public function authenticate(): void
    {
        $credentials = $this->only('email', 'password');
        $remember = (bool) $this->boolean('remember');

        if (!Auth::attempt($credentials, $remember)) {
            throw ValidationException::withMessages([
                'email' => 'These credentials do not match our records.',
            ]);
        }

        $this->session()->regenerate();
    }
}
```

## FILE: app\Http\Requests\Chat\StoreConversationRequest.php

```php
<?php

namespace App\Http\Requests\Chat;

use Illuminate\Foundation\Http\FormRequest;

class StoreConversationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'user_ids' => ['required', 'array', 'min:1'],
            'user_ids.*' => ['exists:users,id'],
            'subject' => ['nullable', 'string', 'max:255'],
            'type' => ['required', 'in:direct,group'],
        ];
    }
}

```

## FILE: app\Http\Requests\Chat\StoreMessageRequest.php

```php
<?php

namespace App\Http\Requests\Chat;

use Illuminate\Foundation\Http\FormRequest;

class StoreMessageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'body' => ['required', 'string', 'max:10000'],
        ];
    }
}

```

## FILE: app\Http\Requests\Task\StoreTaskRequest.php

```php
<?php

namespace App\Http\Requests\Task;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'type' => ['nullable', Rule::in(config('archilbo_operations.task_types', []))],
            'status' => ['required', Rule::in(config('archilbo_operations.task_statuses', []))],
            'priority' => ['required', Rule::in(config('archilbo_operations.task_priorities', []))],
            'impact' => ['nullable', Rule::in(config('archilbo_operations.task_impacts', []))],
            'category' => ['required', Rule::in(config('archilbo_operations.task_categories', []))],
            'progress' => ['nullable', 'integer', 'min:0', 'max:100'],
            'start_date' => ['nullable', 'date'],
            'due_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'reviewed_at' => ['nullable', 'date'],
            'blocked_reason' => ['nullable', 'string'],
            'estimated_minutes' => ['nullable', 'integer', 'min:0'],
            'actual_minutes' => ['nullable', 'integer', 'min:0'],
            'recurrence_rule' => ['nullable', 'string', 'max:255'],
            'assignee_ids' => ['nullable', 'array'],
            'assignee_ids.*' => ['exists:users,id'],
            'watcher_ids' => ['nullable', 'array'],
            'watcher_ids.*' => ['exists:users,id'],
            'dossier_id' => ['nullable', 'exists:dossiers,id'],
            'client_id' => ['nullable', 'exists:clients,id'],
            'dossier_document_id' => ['nullable', 'exists:dossier_documents,id'],
            'finance_document_id' => ['nullable', 'exists:finance_documents,id'],
            'contract_id' => ['nullable', 'exists:contracts,id'],
            'authorization_id' => ['nullable', 'exists:authorizations,id'],
            'archive_record_id' => ['nullable', 'exists:archive_records,id'],
            'conversation_id' => ['nullable', 'exists:conversations,id'],
            'metadata' => ['nullable', 'array'],
        ];
    }
}

```

## FILE: app\Http\Requests\Task\UpdateTaskRequest.php

```php
<?php

namespace App\Http\Requests\Task;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'type' => ['sometimes', Rule::in(config('archilbo_operations.task_types', []))],
            'status' => ['sometimes', Rule::in(config('archilbo_operations.task_statuses', []))],
            'priority' => ['sometimes', Rule::in(config('archilbo_operations.task_priorities', []))],
            'impact' => ['sometimes', Rule::in(config('archilbo_operations.task_impacts', []))],
            'category' => ['sometimes', Rule::in(config('archilbo_operations.task_categories', []))],
            'progress' => ['sometimes', 'integer', 'min:0', 'max:100'],
            'start_date' => ['nullable', 'date'],
            'due_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'reviewed_at' => ['nullable', 'date'],
            'blocked_reason' => ['nullable', 'string'],
            'estimated_minutes' => ['nullable', 'integer', 'min:0'],
            'actual_minutes' => ['nullable', 'integer', 'min:0'],
            'recurrence_rule' => ['nullable', 'string', 'max:255'],
            'assignee_ids' => ['nullable', 'array'],
            'assignee_ids.*' => ['exists:users,id'],
            'watcher_ids' => ['nullable', 'array'],
            'watcher_ids.*' => ['exists:users,id'],
            'dossier_id' => ['nullable', 'exists:dossiers,id'],
            'client_id' => ['nullable', 'exists:clients,id'],
            'dossier_document_id' => ['nullable', 'exists:dossier_documents,id'],
            'finance_document_id' => ['nullable', 'exists:finance_documents,id'],
            'contract_id' => ['nullable', 'exists:contracts,id'],
            'authorization_id' => ['nullable', 'exists:authorizations,id'],
            'archive_record_id' => ['nullable', 'exists:archive_records,id'],
            'conversation_id' => ['nullable', 'exists:conversations,id'],
            'metadata' => ['nullable', 'array'],
        ];
    }
}

```

## FILE: app\Http\Resources\CalendarParticipantResource.php

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CalendarParticipantResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'calendarEventId' => $this->calendar_event_id,
            'user' => $this->whenLoaded('user', fn () => new UserResource($this->user)),
            'userId' => $this->user_id,
            'role' => $this->role,
            'responseStatus' => $this->response_status,
            'lastReadAt' => $this->last_read_at?->format('Y-m-d H:i:s'),
        ];
    }
}

```

## FILE: app\Http\Resources\ConversationParticipantResource.php

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ConversationParticipantResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user' => new UserResource($this->whenLoaded('user')),
            'lastReadAt' => optional($this->last_read_at)->toISOString(),
        ];
    }
}

```

## FILE: app\Http\Resources\ConversationResource.php

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
        $participant = $this->relationLoaded('participants')
            ? $this->participants->firstWhere('user_id', $user?->id)
            : $this->participants()->where('user_id', $user?->id)->first();

        return [
            'id' => $this->id,
            'type' => $this->type,
            'subject' => $this->subject,
            'participants' => ConversationParticipantResource::collection($this->whenLoaded('participants')),
            'lastMessage' => new MessageResource($this->whenLoaded('messages', fn () => $this->messages->last())),
            'lastMessageAt' => optional($this->last_message_at)->toISOString(),
            'unreadCount' => $this->when($user, function () use ($user) {
                return Message::where('conversation_id', $this->id)
                    ->where('user_id', '!=', $user->id)
                    ->whereDoesntHave('reads', fn ($q) => $q->where('user_id', $user->id))
                    ->count();
            }),
            'createdAt' => $this->created_at?->toISOString(),
        ];
    }
}

```

## FILE: app\Http\Resources\MessageResource.php

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
            'user' => new UserResource($this->whenLoaded('user')),
            'readBy' => $this->whenLoaded('reads', fn () => $this->reads->pluck('user_id')),
            'attachments' => $this->whenLoaded('attachments'),
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->diffForHumans(),
        ];
    }
}

```

## FILE: app\Http\Resources\NotificationResource.php

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NotificationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $data = $this->data;

        $actionUrl = null;
        if (isset($data['task_id'])) {
            $actionUrl = "/tasks/{$data['task_id']}";
        } elseif (isset($data['conversation_id'])) {
            $actionUrl = '/inbox';
        } elseif (isset($data['calendar_event_id'])) {
            $actionUrl = '/calendar';
        } elseif (isset($data['dossier_id'])) {
            $actionUrl = "/dossiers/{$data['dossier_id']}";
        } elseif (isset($data['contract_id'])) {
            $actionUrl = '/contracts';
        } elseif (isset($data['finance_document_id'])) {
            $actionUrl = "/finance/documents/{$data['finance_document_id']}";
        } elseif (isset($data['document_id'])) {
            $actionUrl = '/documents';
        }

        return [
            'id' => $this->id,
            'type' => class_basename($this->type),
            'data' => $data,
            'readAt' => optional($this->read_at)->toISOString(),
            'isRead' => $this->read_at !== null,
            'createdAt' => $this->created_at?->toISOString(),
            'createdAtHuman' => $this->created_at?->diffForHumans(),
            'actionUrl' => $actionUrl,
        ];
    }
}

```

## FILE: app\Http\Resources\TaskAttachmentResource.php

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class TaskAttachmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'originalFilename' => $this->original_filename,
            'filename' => $this->filename,
            'mimeType' => $this->mime_type,
            'size' => $this->size,
            'sizeLabel' => $this->size ? $this->formatSize($this->size) : null,
            'user' => new UserResource($this->whenLoaded('user')),
            'createdAt' => $this->created_at?->toISOString(),
            'downloadUrl' => $this->when($this->filename, function () {
                if (Storage::disk('local')->exists('task-attachments/' . $this->task_id . '/' . $this->filename)) {
                    return Storage::disk('local')->url('task-attachments/' . $this->task_id . '/' . $this->filename);
                }
                return null;
            }),
        ];
    }

    private function formatSize(int $bytes): string
    {
        $units = ['B', 'KB', 'MB', 'GB'];
        $i = 0;
        while ($bytes >= 1024 && $i < count($units) - 1) {
            $bytes /= 1024;
            $i++;
        }
        return round($bytes, 1) . ' ' . $units[$i];
    }
}

```

## FILE: app\Models\Conversation.php

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Conversation extends Model
{
    protected $fillable = [
        'type', 'subject',
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

## FILE: app\Models\ConversationParticipant.php

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ConversationParticipant extends Model
{
    protected $fillable = ['conversation_id', 'user_id', 'last_read_at'];

    protected $casts = ['joined_at' => 'datetime', 'last_read_at' => 'datetime'];

    public function conversation(): BelongsTo { return $this->belongsTo(Conversation::class); }
    public function user(): BelongsTo { return $this->belongsTo(User::class); }
}

```

## FILE: app\Models\Message.php

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

    protected $fillable = ['conversation_id', 'user_id', 'body', 'is_edited', 'edited_at'];

    protected $casts = ['is_edited' => 'boolean', 'edited_at' => 'datetime'];

    public function conversation(): BelongsTo { return $this->belongsTo(Conversation::class); }
    public function user(): BelongsTo { return $this->belongsTo(User::class); }
    public function reads(): HasMany { return $this->hasMany(MessageRead::class); }
    public function attachments(): HasMany { return $this->hasMany(MessageAttachment::class); }
}

```

## FILE: app\Models\MessageAttachment.php

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MessageAttachment extends Model
{
    protected $fillable = ['message_id', 'user_id', 'filename', 'original_filename', 'mime_type', 'size'];

    public function message(): BelongsTo { return $this->belongsTo(Message::class); }
    public function user(): BelongsTo { return $this->belongsTo(User::class); }
}

```

## FILE: app\Models\MessageRead.php

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MessageRead extends Model
{
    protected $fillable = ['message_id', 'user_id', 'read_at'];

    protected $casts = ['read_at' => 'datetime'];

    public function message(): BelongsTo { return $this->belongsTo(Message::class); }
    public function user(): BelongsTo { return $this->belongsTo(User::class); }
}

```

## FILE: app\Models\Task.php

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Task extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'task_number', 'title', 'description', 'type', 'status', 'priority', 'impact', 'progress',
        'category', 'start_date', 'due_date', 'completed_at',
        'reviewed_at', 'blocked_reason', 'estimated_minutes', 'actual_minutes', 'recurrence_rule',
        'created_by', 'assigned_by',
        'dossier_id', 'client_id', 'dossier_document_id',
        'finance_document_id', 'contract_id', 'authorization_id', 'archive_record_id', 'conversation_id',
        'metadata',
    ];

    protected $casts = [
        'progress' => 'integer',
        'start_date' => 'date',
        'due_date' => 'date',
        'completed_at' => 'datetime',
        'reviewed_at' => 'datetime',
        'estimated_minutes' => 'integer',
        'actual_minutes' => 'integer',
        'metadata' => 'json',
    ];

    public function creator(): BelongsTo { return $this->belongsTo(User::class, 'created_by'); }
    public function assigner(): BelongsTo { return $this->belongsTo(User::class, 'assigned_by'); }
    public function assignees(): BelongsToMany { return $this->belongsToMany(User::class, 'task_assignees'); }
    public function watchers(): BelongsToMany { return $this->belongsToMany(User::class, 'task_watchers'); }
    public function checklistItems(): HasMany { return $this->hasMany(TaskChecklistItem::class); }
    public function comments(): HasMany { return $this->hasMany(TaskComment::class); }
    public function attachments(): HasMany { return $this->hasMany(TaskAttachment::class); }
    public function activityLogs(): HasMany { return $this->hasMany(TaskActivityLog::class); }
    public function dossier(): BelongsTo { return $this->belongsTo(Dossier::class); }
    public function client(): BelongsTo { return $this->belongsTo(Client::class); }
    public function document(): BelongsTo { return $this->belongsTo(DossierDocument::class, 'dossier_document_id'); }
    public function financeDocument(): BelongsTo { return $this->belongsTo(FinanceDocument::class); }
    public function contract(): BelongsTo { return $this->belongsTo(Contract::class); }
    public function authorization(): BelongsTo { return $this->belongsTo(Authorization::class); }
    public function archiveRecord(): BelongsTo { return $this->belongsTo(ArchiveRecord::class); }
    public function conversation(): BelongsTo { return $this->belongsTo(Conversation::class); }
}

```

## FILE: app\Models\TaskAttachment.php

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TaskAttachment extends Model
{
    protected $fillable = ['task_id', 'user_id', 'filename', 'original_filename', 'mime_type', 'size'];

    public function task(): BelongsTo { return $this->belongsTo(Task::class); }
    public function user(): BelongsTo { return $this->belongsTo(User::class); }
}

```

## FILE: app\Notifications\ChatMessageNotification.php

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

## FILE: app\Policies\ConversationPolicy.php

```php
<?php

namespace App\Policies;

use App\Models\Conversation;
use App\Models\User;

class ConversationPolicy
{
    public function view(User $user, Conversation $conversation): bool
    {
        return $conversation->participants()->where('user_id', $user->id)->exists();
    }

    public function create(User $user): bool
    {
        return $user->can('view inbox') || $user->can('manage inbox') || $user->hasRole('admin');
    }
}

```

## FILE: app\Policies\MessagePolicy.php

```php
<?php

namespace App\Policies;

use App\Models\Message;
use App\Models\User;

class MessagePolicy
{
    public function view(User $user, Message $message): bool
    {
        return $message->conversation
            ? $message->conversation->participants()->where('user_id', $user->id)->exists()
            : false;
    }

    public function create(User $user): bool
    {
        return $user->can('manage inbox') || $user->can('view inbox') || $user->hasRole('admin');
    }

    public function update(User $user, Message $message): bool
    {
        return $message->user_id === $user->id || $user->can('manage inbox') || $user->hasRole('admin');
    }

    public function delete(User $user, Message $message): bool
    {
        return $message->user_id === $user->id || $user->can('manage inbox') || $user->hasRole('admin');
    }
}

```

## FILE: app\Services\Chat\ChatService.php

```php
<?php

namespace App\Services\Chat;

use App\Models\Conversation;
use App\Models\ConversationParticipant;
use App\Models\Message;
use App\Models\User;

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

    public function sendMessage(Conversation $conversation, User $user, string $body): Message
    {
        $message = Message::create([
            'conversation_id' => $conversation->id,
            'user_id' => $user->id,
            'body' => $body,
        ]);

        $conversation->update(['last_message_at' => now()]);

        $conversation->participants()
            ->where('user_id', '!=', $user->id)
            ->each(fn (ConversationParticipant $p) => $p->user->notify(
                new \App\Notifications\ChatMessageNotification($conversation, $message, $user)
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
}

```

## FILE: app\Services\Dashboard\DashboardCommandCenterService.php

```php
<?php

namespace App\Services\Dashboard;

use App\Models\Authorization;
use App\Models\Client;
use App\Models\Conversation;
use App\Models\Dossier;
use App\Models\DossierDocument;
use App\Models\FinanceDocument;
use App\Models\Message;
use App\Models\Payment;
use App\Models\Task;
use Illuminate\Support\Collection;

class DashboardCommandCenterService
{
    public function data(): array
    {
        $activeProjects = Dossier::query()
            ->whereIn('status', ['opened', 'active'])
            ->count();

        $missingDocuments = DossierDocument::query()
            ->where('status', 'missing')
            ->count();

        $pendingAuthorizations = Authorization::query()
            ->whereNotIn('status', ['approved', 'received', 'closed', 'cancelled'])
            ->count();

        $unpaidInvoices = FinanceDocument::query()
            ->where('type', 'invoice')
            ->where('remaining_total', '>', 0)
            ->count();

        $todayPayments = (float) Payment::query()
            ->whereDate('paid_at', today())
            ->sum('amount');

        $monthlyPayments = (float) Payment::query()
            ->whereYear('paid_at', now()->year)
            ->whereMonth('paid_at', now()->month)
            ->sum('amount');

        $remainingTotal = (float) FinanceDocument::query()
            ->where('type', 'invoice')
            ->sum('remaining_total');

        $overdueTotal = (float) FinanceDocument::query()
            ->where('type', 'invoice')
            ->where('status', 'overdue')
            ->sum('remaining_total');

        $myTasks = Task::whereHas('assignees', fn ($q) => $q->where('user_id', auth()->id()))->count();
        $urgentTasks = Task::where('priority', 'urgent')->whereNotIn('status', ['completed', 'cancelled'])->count();
        $overdueTasks = Task::whereNotNull('due_date')->where('due_date', '<', now())->whereNotIn('status', ['completed', 'cancelled'])->count();
        $pendingReviewTasks = Task::where('status', 'in_review')->count();
        $unreadMessages = Message::whereHas('conversation.participants', fn ($q) => $q->where('user_id', auth()->id()))
            ->where('user_id', '!=', auth()->id())
            ->whereDoesntHave('reads', fn ($q) => $q->where('user_id', auth()->id()))
            ->count();

        $blockedDossiers = $this->blockedDossiers();
        $workflowDistribution = $this->workflowDistribution();

        $urgentTaskList = Task::with(['assignees'])
            ->whereHas('assignees', fn ($q) => $q->where('user_id', auth()->id()))
            ->whereNotIn('status', ['completed', 'cancelled'])
            ->where(function ($q) {
                $q->where('priority', 'urgent')
                  ->orWhere(fn ($q2) => $q2->whereNotNull('due_date')->where('due_date', '<', now()));
            })
            ->orderByRaw("CASE WHEN due_date < ? THEN 0 ELSE 1 END", [now()])
            ->orderBy('due_date')
            ->limit(5)
            ->get()
            ->map(fn ($t) => [
                'id' => $t->id,
                'title' => $t->title,
                'taskNumber' => $t->task_number,
                'status' => $t->status,
                'priority' => $t->priority,
                'dueDate' => $t->due_date?->format('Y-m-d'),
                'isOverdue' => $t->due_date && $t->due_date->isPast(),
            ]);

        $recentMessageList = Message::with(['user', 'conversation.participants'])
            ->whereHas('conversation.participants', fn ($q) => $q->where('user_id', auth()->id()))
            ->where('user_id', '!=', auth()->id())
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn ($m) => [
                'id' => $m->id,
                'conversationId' => $m->conversation_id,
                'sender' => $m->user?->name ?? 'Unknown',
                'body' => mb_strlen($m->body) > 80 ? mb_substr($m->body, 0, 80) . '…' : $m->body,
                'createdAt' => $m->created_at->diffForHumans(),
                'unread' => !$m->reads->contains('user_id', auth()->id()),
            ]);

        return [
            'hero' => [
                'eyebrow' => 'Command center',
                'title' => 'Daily Operations',
                'subtitle' => 'One place to see what needs attention across projects, documents, authorizations, finance, and archive.',
            ],
            'kpis' => [
                [
                    'key' => 'activeProjects',
                    'label' => 'Active projects',
                    'value' => (string) $activeProjects,
                    'helper' => Dossier::count() . ' total projects',
                    'tone' => 'blue',
                    'icon' => 'projects',
                    'href' => '/dossiers',
                ],
                [
                    'key' => 'missingDocuments',
                    'label' => 'Missing documents',
                    'value' => (string) $missingDocuments,
                    'helper' => 'Blocking contracts and authorizations',
                    'tone' => $missingDocuments > 0 ? 'red' : 'green',
                    'icon' => 'documents',
                    'href' => '/documents',
                ],
                [
                    'key' => 'pendingAuthorizations',
                    'label' => 'Pending authorizations',
                    'value' => (string) $pendingAuthorizations,
                    'helper' => Authorization::count() . ' total authorizations',
                    'tone' => $pendingAuthorizations > 0 ? 'gold' : 'green',
                    'icon' => 'authorizations',
                    'href' => '/authorizations',
                ],
                [
                    'key' => 'unpaidInvoices',
                    'label' => 'Unpaid invoices',
                    'value' => (string) $unpaidInvoices,
                    'helper' => $this->money($remainingTotal) . ' remaining',
                    'tone' => $unpaidInvoices > 0 ? 'violet' : 'green',
                    'icon' => 'invoices',
                    'href' => '/finance/documents?tab=invoices',
                ],
                [
                    'key' => 'todayPayments',
                    'label' => 'Today payments',
                    'value' => $this->compactMoney($todayPayments),
                    'helper' => $this->money($monthlyPayments) . ' this month',
                    'tone' => 'green',
                    'icon' => 'payments',
                    'href' => '/finance/documents?tab=monthly',
                ],
                [
                    'key' => 'blockedDossiers',
                    'label' => 'Blocked dossiers',
                    'value' => (string) count($blockedDossiers),
                    'helper' => 'Stuck at same step for 7+ days',
                    'tone' => count($blockedDossiers) > 0 ? 'red' : 'green',
                    'icon' => 'projects',
                    'href' => '/dossiers',
                ],
                [
                    'key' => 'myTasks',
                    'label' => 'My tasks',
                    'value' => (string) $myTasks,
                    'helper' => $urgentTasks . ' urgent, ' . $overdueTasks . ' overdue',
                    'tone' => $overdueTasks > 0 ? 'red' : ($urgentTasks > 0 ? 'gold' : 'green'),
                    'icon' => 'tasks',
                    'href' => '/tasks?filter=my',
                ],
                [
                    'key' => 'pendingReviewTasks',
                    'label' => 'In review',
                    'value' => (string) $pendingReviewTasks,
                    'helper' => 'Tasks waiting review',
                    'tone' => $pendingReviewTasks > 0 ? 'gold' : 'green',
                    'icon' => 'tasks',
                    'href' => '/tasks?filter=all&status=in_review',
                ],
                [
                    'key' => 'unreadMessages',
                    'label' => 'Unread messages',
                    'value' => (string) $unreadMessages,
                    'helper' => 'Across all conversations',
                    'tone' => $unreadMessages > 0 ? 'violet' : 'green',
                    'icon' => 'chat',
                    'href' => '/inbox',
                ],
            ],
            'nextActions' => $this->nextActions(),
            'blockedDossiers' => $blockedDossiers,
            'workflowDistribution' => $workflowDistribution,
            'recentProjects' => $this->recentProjects(),
            'financeAlerts' => $this->financeAlerts($remainingTotal, $overdueTotal, $monthlyPayments),
            'activityFeed' => $this->activityFeed(),
            'urgentTaskList' => $urgentTaskList,
            'recentMessageList' => $recentMessageList,
            'quickLinks' => [
                ['label' => 'New project', 'href' => '/dossiers', 'icon' => 'projects'],
                ['label' => 'Upload document', 'href' => '/documents', 'icon' => 'upload'],
                ['label' => 'Create invoice', 'href' => '/finance/documents', 'icon' => 'invoices'],
                ['label' => 'Clients', 'href' => '/clients', 'icon' => 'clients'],
                ['label' => 'Tasks', 'href' => '/tasks', 'icon' => 'tasks'],
                ['label' => 'Inbox', 'href' => '/inbox', 'icon' => 'chat'],
            ],
            'systemHealth' => [
                ['label' => 'Clients', 'value' => (string) Client::count(), 'icon' => 'clients', 'tone' => 'blue'],
                ['label' => 'Projects', 'value' => (string) Dossier::count(), 'icon' => 'projects', 'tone' => 'gold'],
                ['label' => 'Documents', 'value' => (string) DossierDocument::count(), 'icon' => 'documents', 'tone' => 'green'],
                ['label' => 'Finance docs', 'value' => (string) FinanceDocument::count(), 'icon' => 'invoices', 'tone' => 'violet'],
                ['label' => 'Last refresh', 'value' => now()->format('H:i'), 'icon' => 'clock', 'tone' => 'green'],
            ],
        ];
    }

    private function nextActions(): array
    {
        $actions = collect();

        DossierDocument::query()
            ->with(['dossier.client'])
            ->where('status', 'missing')
            ->latest()
            ->limit(3)
            ->get()
            ->each(function (DossierDocument $document) use ($actions) {
                $actions->push([
                    'id' => 'document-' . $document->id,
                    'title' => 'Upload missing document',
                    'subtitle' => trim(($document->dossier?->dossier_number ?? 'Project') . ' - ' . ($document->dossier?->client?->full_name ?? 'Client')),
                    'due' => 'Today',
                    'tone' => 'red',
                    'icon' => 'upload',
                    'href' => '/documents',
                ]);
            });

        Authorization::query()
            ->with('dossier.client')
            ->whereNotIn('status', ['approved', 'received', 'closed', 'cancelled'])
            ->latest()
            ->limit(2)
            ->get()
            ->each(function (Authorization $authorization) use ($actions) {
                $actions->push([
                    'id' => 'authorization-' . $authorization->id,
                    'title' => 'Follow authorization status',
                    'subtitle' => trim(($authorization->dossier?->dossier_number ?? 'Project') . ' - ' . ($authorization->authority_name ?? 'Authority')),
                    'due' => 'This week',
                    'tone' => 'gold',
                    'icon' => 'authorizations',
                    'href' => '/authorizations',
                ]);
            });

        FinanceDocument::query()
            ->with(['client', 'dossier'])
            ->where('type', 'invoice')
            ->where('remaining_total', '>', 0)
            ->orderByDesc('remaining_total')
            ->limit(2)
            ->get()
            ->each(function (FinanceDocument $invoice) use ($actions) {
                $actions->push([
                    'id' => 'invoice-' . $invoice->id,
                    'title' => 'Follow unpaid invoice',
                    'subtitle' => trim(($invoice->number ?? 'Invoice') . ' - ' . ($invoice->client?->full_name ?? 'Client')),
                    'due' => $invoice->status === 'overdue' ? 'Overdue' : 'Open',
                    'tone' => $invoice->status === 'overdue' ? 'red' : 'blue',
                    'icon' => 'invoices',
                    'href' => '/finance/documents?tab=invoices',
                ]);
            });

        if ($actions->isEmpty()) {
            $actions->push([
                'id' => 'all-clear',
                'title' => 'No urgent blocking action',
                'subtitle' => 'Workflow looks clean right now.',
                'due' => 'Good',
                'tone' => 'green',
                'icon' => 'check',
                'href' => '/dossiers',
            ]);
        }

        return $actions->take(5)->values()->all();
    }

    private function recentProjects(): array
    {
        return Dossier::query()
            ->with(['client', 'documents', 'financeDocuments'])
            ->latest()
            ->limit(8)
            ->get()
            ->map(fn (Dossier $dossier) => [
                'id' => (string) $dossier->id,
                'dossierNumber' => $dossier->dossier_number,
                'project' => $dossier->project_object ?? $dossier->dossier_number,
                'client' => $dossier->client?->full_name ?? '-',
                'location' => trim(($dossier->province ?? '-') . ' / ' . ($dossier->commune ?? '-')),
                'step' => $dossier->workflow_step ?? '-',
                'status' => $dossier->status ?? '-',
                'missingDocs' => $dossier->documents->where('status', 'missing')->count(),
                'remaining' => $this->money((float) $dossier->financeDocuments
                    ->where('type', 'invoice')
                    ->sum('remaining_total')),
                'href' => '/dossiers/' . $dossier->id,
            ])
            ->values()
            ->all();
    }

    private function financeAlerts(float $remainingTotal, float $overdueTotal, float $monthlyPayments): array
    {
        $overdueCount = FinanceDocument::query()
            ->where('type', 'invoice')
            ->where('status', 'overdue')
            ->count();

        $unpaidCount = FinanceDocument::query()
            ->where('type', 'invoice')
            ->where('remaining_total', '>', 0)
            ->count();

        return [
            [
                'id' => 'overdue',
                'title' => 'Overdue invoices',
                'amount' => $this->money($overdueTotal),
                'subtitle' => $overdueCount . ' invoice(s) overdue',
                'tone' => $overdueCount > 0 ? 'red' : 'green',
                'href' => '/finance/documents?tab=invoices',
            ],
            [
                'id' => 'remaining',
                'title' => 'Remaining balance',
                'amount' => $this->money($remainingTotal),
                'subtitle' => $unpaidCount . ' unpaid invoice(s)',
                'tone' => $unpaidCount > 0 ? 'gold' : 'green',
                'href' => '/finance/documents?tab=invoices',
            ],
            [
                'id' => 'monthly',
                'title' => 'Monthly collected',
                'amount' => $this->money($monthlyPayments),
                'subtitle' => 'Open monthly summary',
                'tone' => 'blue',
                'href' => '/finance/documents?tab=monthly',
            ],
        ];
    }

    private function activityFeed(): array
    {
        $documents = DossierDocument::query()
            ->with('dossier')
            ->latest()
            ->limit(4)
            ->get()
            ->map(fn (DossierDocument $document) => [
                'id' => 'doc-' . $document->id,
                'title' => 'Document ' . ($document->status ?? 'updated'),
                'description' => trim(($document->original_filename ?? 'Document') . ' - ' . ($document->dossier?->dossier_number ?? 'Project')),
                'time' => optional($document->updated_at)->diffForHumans() ?? '-',
                'tone' => $document->status === 'verified' ? 'green' : ($document->status === 'missing' ? 'red' : 'gold'),
                'icon' => 'documents',
                'sortAt' => $document->updated_at,
            ]);

        $payments = Payment::query()
            ->with('document')
            ->latest()
            ->limit(4)
            ->get()
            ->map(fn (Payment $payment) => [
                'id' => 'payment-' . $payment->id,
                'title' => 'Payment recorded',
                'description' => trim(($payment->payment_number ?? 'Payment') . ' - ' . ($payment->document?->number ?? 'Invoice')),
                'time' => optional($payment->created_at)->diffForHumans() ?? '-',
                'tone' => 'blue',
                'icon' => 'payments',
                'sortAt' => $payment->created_at,
            ]);

        $projects = Dossier::query()
            ->latest()
            ->limit(4)
            ->get()
            ->map(fn (Dossier $dossier) => [
                'id' => 'project-' . $dossier->id,
                'title' => 'Project updated',
                'description' => trim(($dossier->dossier_number ?? 'Project') . ' - ' . ($dossier->project_object ?? '')),
                'time' => optional($dossier->updated_at)->diffForHumans() ?? '-',
                'tone' => 'neutral',
                'icon' => 'projects',
                'sortAt' => $dossier->updated_at,
            ]);

        return $documents
            ->merge($payments)
            ->merge($projects)
            ->sortByDesc('sortAt')
            ->take(6)
            ->map(fn (array $item) => collect($item)->except('sortAt')->all())
            ->values()
            ->all();
    }

    private function blockedDossiers(): array
    {
        $config = config('archilbo_workflow.client_project_steps', []);
        $stepLabels = collect($config)->pluck('label', 'key')->all();

        return Dossier::query()
            ->with('client')
            ->whereIn('status', ['opened', 'active'])
            ->where('updated_at', '<', now()->subDays(7))
            ->latest('updated_at')
            ->limit(10)
            ->get()
            ->map(fn (Dossier $dossier) => [
                'id' => (string) $dossier->id,
                'dossierNumber' => $dossier->dossier_number,
                'project' => $dossier->project_object ?? $dossier->dossier_number,
                'client' => $dossier->client?->full_name ?? '-',
                'step' => $stepLabels[$dossier->workflow_step] ?? $dossier->workflow_step ?? '-',
                'stepKey' => $dossier->workflow_step ?? '-',
                'daysStuck' => (int) $dossier->updated_at->diffInDays(now()),
                'missingDocs' => $dossier->documents?->where('status', 'missing')->count() ?? 0,
                'href' => '/dossiers/' . $dossier->id,
            ])
            ->values()
            ->all();
    }

    private function workflowDistribution(): array
    {
        $config = config('archilbo_workflow.client_project_steps', []);
        $steps = collect($config)->pluck('label', 'key')->all();
        $counts = Dossier::query()
            ->selectRaw('workflow_step, count(*) as total')
            ->whereIn('status', ['opened', 'active'])
            ->groupBy('workflow_step')
            ->pluck('total', 'workflow_step');

        $results = [];

        foreach ($steps as $key => $label) {
            $results[] = [
                'key' => $key,
                'label' => $label,
                'count' => (int) ($counts[$key] ?? 0),
            ];
        }

        return $results;
    }

    private function money(float $value): string
    {
        return number_format($value, 0, '.', ',') . ' MAD';
    }

    private function compactMoney(float $value): string
    {
        if ($value >= 1000000) {
            return number_format($value / 1000000, 1) . 'M';
        }

        if ($value >= 1000) {
            return number_format($value / 1000, 0) . 'K';
        }

        return number_format($value, 0);
    }
}
```

## FILE: app\Services\Dossiers\DossierWorkflowRequirementService.php

```php
<?php

namespace App\Services\Dossiers;

use App\Models\Dossier;
use App\Models\DossierWorkflowRequirement;
use App\Models\DossierWorkflowRequirementHistory;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class DossierWorkflowRequirementService
{
    public function update(Dossier $dossier, array $data): DossierWorkflowRequirement
    {
        $this->assertRequirementExists((string) $data['step_key'], (string) $data['requirement_key']);

        return DB::transaction(function () use ($dossier, $data) {
            $keys = [
                'dossier_id' => $dossier->id,
                'step_key' => $data['step_key'],
                'requirement_key' => $data['requirement_key'],
            ];

            $existing = DossierWorkflowRequirement::where($keys)->first();
            $oldDone = $existing?->is_done;
            $oldNotes = $existing?->notes;
            $newDone = (bool) $data['is_done'];
            $newNotes = $data['notes'] ?? $oldNotes;

            $requirement = DossierWorkflowRequirement::updateOrCreate(
                $keys,
                [
                    'is_done' => $newDone,
                    'checked_at' => $newDone ? now() : null,
                    'checked_by' => $newDone ? Auth::id() : null,
                    'notes' => $newNotes,
                ],
            );

            DossierWorkflowRequirementHistory::create([
                'dossier_id' => $dossier->id,
                'dossier_workflow_requirement_id' => $requirement->id,
                'step_key' => $data['step_key'],
                'requirement_key' => $data['requirement_key'],
                'old_is_done' => $oldDone,
                'new_is_done' => $newDone,
                'old_notes' => $oldNotes,
                'new_notes' => $newNotes,
                'changed_by' => Auth::id(),
                'changed_at' => now(),
            ]);

            return $requirement;
        });
    }

    private function assertRequirementExists(string $stepKey, string $requirementKey): void
    {
        foreach ((array) config('archilbo_workflow.client_project_steps', []) as $step) {
            if (($step['key'] ?? null) !== $stepKey) {
                continue;
            }

            foreach (($step['requirements'] ?? []) as $requirement) {
                if (($requirement['key'] ?? null) === $requirementKey) {
                    return;
                }
            }
        }

        throw ValidationException::withMessages([
            'requirement_key' => 'Element workflow inconnu.',
        ]);
    }
}

```

## FILE: app\Services\Dossiers\DossierWorkflowStepperService.php

```php
<?php

namespace App\Services\Dossiers;

use App\Enums\DossierWorkflowStepStatus;
use App\Models\Dossier;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class DossierWorkflowStepperService
{
    public function evaluate(Dossier $dossier): array
    {
        $dossier->loadMissing(['documents.template', 'contract', 'authorization', 'workflowRequirements.checkedBy']);

        $steps = collect(config('archilbo_workflow.client_project_steps', []))
            ->map(fn (array $step, int $index) => $this->evaluateStep($dossier, $step, $index))
            ->values();

        $completed = $steps->where('status', DossierWorkflowStepStatus::Completed->value)->count();
        $total = max(1, $steps->count());
        $currentStep = $steps->first(fn (array $step) => $step['status'] !== DossierWorkflowStepStatus::Completed->value)['key']
            ?? $steps->last()['key']
            ?? null;

        return [
            'completed' => $completed,
            'total' => $steps->count(),
            'percent' => (int) round(($completed / $total) * 100),
            'currentStep' => $currentStep,
            'steps' => $steps->all(),
        ];
    }

    private function evaluateStep(Dossier $dossier, array $step, int $index): array
    {
        $requirements = collect($step['requirements'] ?? [])
            ->map(function (array $requirement) use ($dossier, $step) {
                $manual = $this->manualRequirement($dossier, (string) $step['key'], (string) $requirement['key']);

                return [
                    ...$requirement,
                    'done' => $this->requirementDone($dossier, (string) $step['key'], (string) $requirement['key']),
                    'manual' => $manual !== null,
                    'notes' => $manual?->notes,
                    'checkedAt' => optional($manual?->checked_at)->format('Y-m-d H:i'),
                    'checkedBy' => $manual?->checkedBy?->name,
                    'actionLabel' => $this->requirementActionLabel((string) $step['key'], (string) $requirement['key']),
                    'actionUrl' => $this->requirementActionUrl($dossier, (string) $step['key'], (string) $requirement['key']),
                ];
            })
            ->values();

        $done = $requirements->where('done', true)->count();
        $status = $this->stepStatus($requirements, $done);

        return [
            'key' => $step['key'],
            'order' => $index + 1,
            'label' => $step['label'],
            'description' => $step['description'] ?? null,
            'status' => $status->value,
            'statusLabel' => $status->label(),
            'done' => $done,
            'total' => $requirements->count(),
            'requirements' => $requirements->all(),
            'primaryActionLabel' => $this->stepActionLabel((string) $step['key']),
            'primaryActionUrl' => $this->stepActionUrl($dossier, (string) $step['key']),
        ];
    }

    private function stepStatus(Collection $requirements, int $done): DossierWorkflowStepStatus
    {
        if ($requirements->isNotEmpty() && $done === $requirements->count()) {
            return DossierWorkflowStepStatus::Completed;
        }

        if ($done > 0) {
            return DossierWorkflowStepStatus::InProgress;
        }

        return DossierWorkflowStepStatus::Pending;
    }

    private function requirementDone(Dossier $dossier, string $step, string $requirement): bool
    {
        $manualDone = $this->manualRequirement($dossier, $step, $requirement)?->is_done;

        if ($manualDone !== null) {
            return $manualDone;
        }

        return match ($step . '.' . $requirement) {
            'documents.cin' => $this->hasDocument($dossier, ['cin', 'cni', 'carte nationale']),
            'documents.certificat_propriete' => $this->hasDocument($dossier, ['certificat propriete', 'certificat de propriete', 'titre foncier']),
            'documents.terrain_documents' => $this->terrainDocumentsReady($dossier),

            'contract.contract_created' => (bool) $dossier->contract,
            'contract.contract_generated' => filled($dossier->contract?->generated_document_path) || filled($dossier->contract?->generated_at),
            'contract.contract_signed' => filled($dossier->contract?->signed_at) || in_array($dossier->contract?->status, ['signed', 'cachete', 'contrat_cachete'], true),

            'cahier_chantier.engineer_request' => $this->hasDocument($dossier, ['demande ingenieur', 'centre ingenieur', 'cahier chantier demande']),
            'cahier_chantier.cahier_received' => $this->hasDocument($dossier, ['cahier de chantier', 'cahier chantier']),

            'rokhas.rokhas_upload' => in_array($dossier->authorization?->status, ['submitted', 'under_review', 'approved', 'authorization_received'], true)
                || filled($dossier->authorization?->submission_number)
                || filled($dossier->authorization?->submitted_at),
            'rokhas.fiche_energetique' => $this->hasDocument($dossier, ['fiche energetique', 'efficacite energetique', 'efficacite energetic']),

            'bureau_etude.contract_bureau_etude' => $this->hasDocument($dossier, ['contrat bureau etude', 'contract bureau etude']),
            'bureau_etude.plan_beton' => $this->hasDocument($dossier, ['plan beton', 'beton arme', 'plan ba']),
            'bureau_etude.implantation_topographie' => $this->hasDocument($dossier, ['implantation', 'topographie', 'topographe']),
            'bureau_etude.laboratoire_controle' => $this->hasDocument($dossier, ['laboratoire', 'bureau de controle', 'controle technique']),

            'permis_habiter.demande_permis_habiter' => $this->hasDocument($dossier, ['demande permis habiter', 'permis d habiter', 'permis habiter']),
            'permis_habiter.site_images' => $this->hasDocument($dossier, ['image site', 'photo site', 'photos site', 'location']),
            'permis_habiter.recent_certificat_propriete' => $this->hasDocument($dossier, ['certificat propriete recent', 'certificat de propriete recent'])
                || $this->hasDocument($dossier, ['certificat propriete', 'certificat de propriete', 'titre foncier']),

            'archive.archive_created' => (bool) $dossier->archiveRecord,
            'archive.file_stored' => $dossier->archiveRecord?->status === 'stored',

            default => false,
        };
    }

    private function manualRequirement(Dossier $dossier, string $step, string $requirement)
    {
        return $dossier->workflowRequirements
            ->first(fn ($item) => $item->step_key === $step && $item->requirement_key === $requirement);
    }

    private function terrainDocumentsReady(Dossier $dossier): bool
    {
        if ($this->hasDocument($dossier, ['plan parcellaire'])) {
            return true;
        }

        return $this->hasDocument($dossier, ['plan cadastral'])
            && $this->hasDocument($dossier, ['calcul contenance', 'contenance']);
    }

    private function hasDocument(Dossier $dossier, array $aliases): bool
    {
        return $dossier->documents->contains(function ($document) use ($aliases) {
            if (! filled($document->stored_path) && ! filled($document->original_filename)) {
                return false;
            }

            $haystack = $this->normalize(implode(' ', array_filter([
                $document->document_number,
                $document->original_filename,
                $document->status,
                $document->notes,
                $document->template?->name,
                $document->template?->code,
                $document->template?->document_type,
            ])));

            foreach ($aliases as $alias) {
                if (Str::contains($haystack, $this->normalize($alias))) {
                    return true;
                }
            }

            return false;
        });
    }

    private function normalize(?string $value): string
    {
        return Str::of($value ?? '')
            ->ascii()
            ->lower()
            ->replace(['_', '-', '\''], ' ')
            ->squish()
            ->toString();
    }

    private function stepActionLabel(string $step): string
    {
        return match ($step) {
            'documents' => 'Ouvrir les documents',
            'contract' => 'Ouvrir les contrats',
            'cahier_chantier' => 'Ajouter documents cahier',
            'rokhas' => 'Ouvrir autorisations',
            'bureau_etude' => 'Ajouter documents techniques',
            'permis_habiter' => 'Ajouter documents permis',
            'archive' => 'Creer / ouvrir archive',
            default => 'Ouvrir dossier',
        };
    }

    private function stepActionUrl(Dossier $dossier, string $step): string
    {
        return match ($step) {
            'contract' => route('contracts.index', ['dossier_id' => $dossier->id]),
            'rokhas' => route('authorizations.index', ['dossier_id' => $dossier->id]),
            'archive' => route('archives.index', ['dossier_id' => $dossier->id]),
            default => route('documents.index', ['dossier_id' => $dossier->id]),
        };
    }

    private function requirementActionLabel(string $step, string $requirement): string
    {
        return match ($step . '.' . $requirement) {
            'contract.contract_created' => 'Creer contrat',
            'contract.contract_generated' => 'Generer contrat',
            'contract.contract_signed' => 'Marquer signe',
            'rokhas.rokhas_upload' => 'Suivre Rokhas',
            'archive.archive_created' => 'Creer la fiche d archive',
            'archive.file_stored' => 'Ouvrir la fiche d archive',
            default => 'Televerser / ouvrir',
        };
    }

    private function requirementActionUrl(Dossier $dossier, string $step, string $requirement): string
    {
        return match ($step . '.' . $requirement) {
            'contract.contract_created', 'contract.contract_generated', 'contract.contract_signed' => route('contracts.index', ['dossier_id' => $dossier->id]),
            'rokhas.rokhas_upload' => route('authorizations.index', ['dossier_id' => $dossier->id]),
            default => route('documents.index', ['dossier_id' => $dossier->id]),
        };
    }
}

```

## FILE: app\Services\Finance\FinanceDocumentLockGuard.php

```php
<?php

namespace App\Services\Finance;

use App\Models\FinanceDocument;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\ValidationException;

class FinanceDocumentLockGuard
{
    public function assertCanUpdate(FinanceDocument $document): void
    {
        if (! $this->wasAlreadyLocked($document)) {
            return;
        }

        $blockedFields = $this->blockedFields();

        $dirtyBlockedFields = [];

        foreach ($blockedFields as $field) {
            if (! $document->isDirty($field)) {
                continue;
            }

            if ($this->isAllowedIdempotentLockWrite($document, $field)) {
                continue;
            }

            if ($this->valuesAreSemanticallyEqual(
                $field,
                $document->getOriginal($field),
                $document->getAttribute($field),
            )) {
                continue;
            }

            $dirtyBlockedFields[] = $field;
        }

        if ($dirtyBlockedFields === []) {
            return;
        }

        throw ValidationException::withMessages([
            'finance_document_lock' => 'This finance document number is locked after export and cannot be changed. Blocked fields: '.implode(', ', $dirtyBlockedFields).'.',
        ]);
    }

    protected function wasAlreadyLocked(FinanceDocument $document): bool
    {
        if (! Schema::hasTable($document->getTable())) {
            return false;
        }

        if (! Schema::hasColumn($document->getTable(), 'number_locked')) {
            return false;
        }

        return (bool) $document->getOriginal('number_locked');
    }

    protected function blockedFields(): array
    {
        return [
            'number',
            'type',
            'issue_date',
            'number_locked',
            'number_locked_at',
        ];
    }

    protected function isAllowedIdempotentLockWrite(FinanceDocument $document, string $field): bool
    {
        if ($field === 'number_locked') {
            return (bool) $document->getOriginal('number_locked') === true
                && (bool) $document->getAttribute('number_locked') === true;
        }

        if ($field === 'number_locked_at') {
            $original = $document->getOriginal('number_locked_at');
            $current = $document->getAttribute('number_locked_at');

            return ! empty($original)
                && ! empty($current)
                && (string) $original === (string) $current;
        }

        return false;
    }

    protected function valuesAreSemanticallyEqual(string $field, mixed $original, mixed $current): bool
    {
        if ($field === 'number_locked') {
            return (bool) $original === (bool) $current;
        }

        if ($field === 'issue_date' || $field === 'number_locked_at') {
            return (string) $original === (string) $current;
        }

        return (string) $original === (string) $current;
    }
}
```

## FILE: app\Services\Finance\FinanceDocumentLockStatePresenter.php

```php
<?php

namespace App\Services\Finance;

use App\Models\FinanceDocument;

class FinanceDocumentLockStatePresenter
{
    public function toArray(FinanceDocument $document): array
    {
        $locked = (bool) ($document->number_locked ?? false);
        $lockedAt = $document->number_locked_at;

        return [
            'isLocked' => $locked,
            'lockedAt' => $lockedAt ? (string) $lockedAt : null,
            'lockedAtFormatted' => $lockedAt && method_exists($lockedAt, 'format')
                ? $lockedAt->format('d/m/Y H:i')
                : ($lockedAt ? (string) $lockedAt : null),
            'message' => $locked
                ? 'Document locked after export. Number, type, and issue date cannot be changed.'
                : 'Document is not locked yet.',
            'blockedFields' => [
                'number',
                'type',
                'issue_date',
                'number_locked',
                'number_locked_at',
            ],
            'canEditNumberFields' => ! $locked,
            'canRegenerateExports' => true,
            'canGeneratePdf' => true,
            'canGenerateExcel' => true,
        ];
    }
}
```

## FILE: app\Services\Finance\FinanceExcelExporter.php

```php
<?php

namespace App\Services\Finance;

use App\Models\FinanceDocument;
use Illuminate\Support\Facades\Storage;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use RuntimeException;
use Throwable;

class FinanceExcelExporter
{
    public function __construct(
        private readonly FinanceDocumentRenderData $renderData,
        private readonly FinanceLockedDocumentNumberResolver $numberResolver,
    ) {
    }

    public function generate(FinanceDocument $document): string
    {
        $spreadsheet = new Spreadsheet();

        try {
            $this->numberResolver->forModel($document, $document->type, 'number', $document->issue_date);
            $document->refresh()->loadMissing(['client', 'dossier', 'items', 'payments', 'template']);

            $data = $this->renderData->toArray($document);
            $sheet = $spreadsheet->getActiveSheet();
            $sheet->setTitle(substr($data['document']['type_label'] . ' ' . $document->number, 0, 31));

            $row = 1;
            $sheet->setCellValue("A{$row}", $data['company']['name']);
            $sheet->mergeCells("A{$row}:F{$row}");
            $sheet->setCellValue("G{$row}", $data['document']['type_label']);
            $sheet->mergeCells("G{$row}:K{$row}");
            $sheet->getStyle("A{$row}:K{$row}")->getFont()->setBold(true)->setSize(16);
            $sheet->getStyle("G{$row}:K{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
            $row++;

            $sheet->setCellValue("A{$row}", $data['company']['address']);
            $sheet->mergeCells("A{$row}:F{$row}");
            $sheet->setCellValue("G{$row}", $document->number);
            $sheet->mergeCells("G{$row}:K{$row}");
            $sheet->getStyle("G{$row}:K{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
            $row++;

            $sheet->setCellValue("A{$row}", 'ICE: ' . $data['company']['ice'] . ' | TVA: ' . $data['company']['tva'] . ' | Patente: ' . $data['company']['patente'] . ' | CNSS: ' . $data['company']['cnss']);
            $sheet->mergeCells("A{$row}:K{$row}");
            $row += 2;

            $sheet->setCellValue("A{$row}", 'Document');
            $sheet->setCellValue("B{$row}", $data['document']['type_label']);
            $sheet->setCellValue("D{$row}", 'Date emission');
            $sheet->setCellValue("E{$row}", $data['document']['issue_date']);
            $sheet->setCellValue("G{$row}", $document->isInvoice() ? 'Echeance' : 'Validite');
            $sheet->setCellValue("H{$row}", $document->isInvoice() ? $data['document']['due_date'] : $data['document']['valid_until']);
            $sheet->getStyle("A{$row}:K{$row}")->getFont()->setBold(true);
            $row += 2;

            $row = $this->section($sheet, $row, 'Client', [
                ['Nom', $data['client']['name'], 'CIN', $data['client']['cin']],
                ['Adresse', $data['client']['address'], 'Contact', trim($data['client']['phone'] . ' ' . $data['client']['email'])],
            ]);

            $row = $this->section($sheet, $row, 'Dossier', [
                ['Numero', $data['dossier']['number'], 'Objet', $data['dossier']['project_object']],
                ['Adresse', $data['dossier']['address'], 'Commune/Province', trim($data['dossier']['commune'] . ' ' . $data['dossier']['province'])],
            ]);

            $headers = ['#', 'Title', 'Description', 'Qty', 'Unit', 'Unit price', 'Discount %', 'TVA %', 'Total HT', 'Total TVA', 'Total TTC'];
            $sheet->fromArray($headers, null, "A{$row}");
            $headerRow = $row;
            $row++;

            foreach ($data['items'] as $item) {
                $sheet->fromArray([
                    $item['position'],
                    $item['title'],
                    $item['description'],
                    $item['quantity'],
                    $item['unit'],
                    $item['unit_price'],
                    $item['discount_rate'],
                    $item['tva_rate'],
                    $item['total_ht'],
                    $item['total_tva'],
                    $item['total_ttc'],
                ], null, "A{$row}");
                $row++;
            }

            $tableEnd = max($headerRow, $row - 1);
            $sheet->getStyle("A{$headerRow}:K{$tableEnd}")->getBorders()->getAllBorders()->setBorderStyle(Border::BORDER_THIN);
            $sheet->getStyle("A{$headerRow}:K{$headerRow}")->getFont()->setBold(true);
            $sheet->getStyle("A{$headerRow}:K{$headerRow}")->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('F3F4F6');
            $sheet->getStyle("F" . ($headerRow + 1) . ":F{$tableEnd}")->getNumberFormat()->setFormatCode('#,##0.00');
            $sheet->getStyle("I" . ($headerRow + 1) . ":K{$tableEnd}")->getNumberFormat()->setFormatCode('#,##0.00');
            $sheet->getStyle("D" . ($headerRow + 1) . ":K{$tableEnd}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
            $row += 2;

            $totals = [
                ['Subtotal HT', $data['totals']['subtotal_ht_raw']],
                ['Discount', $data['totals']['discount_total_raw']],
                ['TVA', $data['totals']['tax_total_raw']],
                ['Total TTC', $data['totals']['total_ttc_raw']],
                ['Paid', $data['totals']['paid_total_raw']],
                ['Remaining', $data['totals']['remaining_total_raw']],
            ];

            foreach ($totals as [$label, $value]) {
                $sheet->setCellValue("I{$row}", $label);
                $sheet->setCellValue("K{$row}", $value);
                $sheet->getStyle("I{$row}:K{$row}")->getFont()->setBold($label === 'Total TTC');
                $sheet->getStyle("K{$row}")->getNumberFormat()->setFormatCode('#,##0.00');
                $row++;
            }

            $row += 1;
            $sheet->setCellValue("A{$row}", 'Notes');
            $sheet->setCellValue("B{$row}", $data['document']['notes']);
            $sheet->mergeCells("B{$row}:K{$row}");
            $row++;
            $sheet->setCellValue("A{$row}", 'Terms');
            $sheet->setCellValue("B{$row}", $data['document']['terms']);
            $sheet->mergeCells("B{$row}:K{$row}");

            foreach (range('A', 'K') as $column) {
                $sheet->getColumnDimension($column)->setAutoSize(true);
            }

            $sheet->freezePane('A9');
            $sheet->getStyle('A:K')->getAlignment()->setVertical(Alignment::VERTICAL_TOP);

            $directory = $this->directory($document);
            Storage::disk('public')->makeDirectory($directory);
            $relativePath = $directory . '/' . $document->number . '.xlsx';
            $absolutePath = Storage::disk('public')->path($relativePath);

            IOFactory::createWriter($spreadsheet, 'Xlsx')->save($absolutePath);

            if (!file_exists($absolutePath) || filesize($absolutePath) === 0) {
                throw new RuntimeException('Excel file was not created.');
            }

            $document->forceFill(['excel_path' => $relativePath])->save();

            return $relativePath;
        } catch (Throwable $e) {
            throw new RuntimeException('Unable to generate finance Excel file: ' . $e->getMessage(), previous: $e);
        } finally {
            $spreadsheet->disconnectWorksheets();
        }
    }

    private function section($sheet, int $row, string $title, array $lines): int
    {
        $sheet->setCellValue("A{$row}", $title);
        $sheet->mergeCells("A{$row}:K{$row}");
        $sheet->getStyle("A{$row}:K{$row}")->getFont()->setBold(true);
        $sheet->getStyle("A{$row}:K{$row}")->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('F9FAFB');
        $row++;

        foreach ($lines as $line) {
            $sheet->setCellValue("A{$row}", $line[0]);
            $sheet->setCellValue("B{$row}", $line[1]);
            $sheet->setCellValue("F{$row}", $line[2]);
            $sheet->setCellValue("G{$row}", $line[3]);
            $row++;
        }

        return $row + 1;
    }

    private function directory(FinanceDocument $document): string
    {
        return 'finance/' . match ($document->type) {
            'quote' => 'quotes',
            'invoice' => 'invoices',
            'receipt' => 'receipts',
            default => 'documents',
        } . '/' . $document->number;
    }
}

```

## FILE: app\Services\Finance\FinancePdfGenerator.php

```php
<?php

namespace App\Services\Finance;

use App\Models\FinanceDocument;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;
use RuntimeException;
use Throwable;

class FinancePdfGenerator
{
    public function __construct(
        private readonly FinanceTemplateRenderer $renderer,
        private readonly FinanceLockedDocumentNumberResolver $numberResolver,
    ) {
    }

    public function generate(FinanceDocument $document): string
    {
        try {
            $document->loadMissing(['client', 'dossier', 'items', 'payments', 'template']);
            $this->numberResolver->forModel($document, $document->type, 'number', $document->issue_date);
            $document->refresh()->loadMissing(['client', 'dossier', 'items', 'payments', 'template']);

            $html = $this->renderer->renderHtml($document);
            $directory = $this->directory($document);
            Storage::disk('public')->makeDirectory($directory);

            $relativePath = $directory . '/' . $document->number . '.pdf';
            $absolutePath = Storage::disk('public')->path($relativePath);

            Pdf::loadHTML($html)
                ->setPaper('a4', 'portrait')
                ->save($absolutePath);

            if (!file_exists($absolutePath) || filesize($absolutePath) === 0) {
                throw new RuntimeException('PDF file was not created.');
            }

            $document->forceFill([
                'pdf_path' => $relativePath,
                'generated_at' => now(),
            ])->save();

            return $relativePath;
        } catch (Throwable $e) {
            throw new RuntimeException('Unable to generate finance PDF: ' . $e->getMessage(), previous: $e);
        }
    }

    private function directory(FinanceDocument $document): string
    {
        return 'finance/' . match ($document->type) {
            'quote' => 'quotes',
            'invoice' => 'invoices',
            'receipt' => 'receipts',
            default => 'documents',
        } . '/' . $document->number;
    }
}

```

## FILE: app\Services\Finance\FinanceSettingsService.php

```php
<?php

namespace App\Services\Finance;

use App\Models\CompanySetting;
use Illuminate\Support\Facades\Storage;

class FinanceSettingsService
{
    public function allGrouped(): array
    {
        return [
            'finance' => $this->finance(),
            'company' => $this->companyInfo(),
            'bank' => $this->bankInfo(),
        ];
    }

    public function finance(): array
    {
        return [
            'defaultTvaRate' => self::getTvaRate(),
            'defaultCurrency' => self::getCurrency(),
            'defaultPaymentTermsDays' => self::getPaymentTermsDays(),
            'defaultQuoteValidityDays' => self::getQuoteValidityDays(),
            'defaultUnitPriceM2' => self::getUnitPriceM2(),
            'defaultArchitectRate' => self::getArchitectRate(),
        ];
    }

    public function companyInfo(): array
    {
        return [
            'companyName' => self::getCompanyName(),
            'companyAddress' => self::getCompanyAddress(),
            'companyPhone' => self::getCompanyPhone(),
            'companyEmail' => self::getCompanyEmail(),
            'companyIce' => self::getCompanyIce(),
            'companyTva' => self::getCompanyTva(),
            'companyPatente' => self::getCompanyPatente(),
            'companyCnss' => self::getCompanyCnss(),
            'companyLogoPath' => self::getCompanyLogoPath(),
            'companyLogoUrl' => self::getCompanyLogoUrl(),
            'companyLogoDataUri' => self::getCompanyLogoDataUri(),
            'companyLogoHtml' => self::getCompanyLogoHtml(),
        ];
    }

    public function bankInfo(): array
    {
        return [
            'bankName' => self::getBankName(),
            'bankRib' => self::getBankRib(),
        ];
    }

    public function defaultTvaRate(): float
    {
        return self::getTvaRate();
    }

    public function defaultCurrency(): string
    {
        return self::getCurrency();
    }

    public function defaultPaymentTermsDays(): int
    {
        return self::getPaymentTermsDays();
    }

    public function defaultQuoteValidityDays(): int
    {
        return self::getQuoteValidityDays();
    }

    public function defaultUnitPriceM2(): float
    {
        return self::getUnitPriceM2();
    }

    public function defaultArchitectRate(): float
    {
        return self::getArchitectRate();
    }

    /**
     * Backward-compatible generic settings getter.
     *
     * Supports:
     * - FinanceSettingsService::get('finance', 'default_currency', 'MAD')
     * - FinanceSettingsService::get('finance.default_currency', 'MAD')
     * - FinanceSettingsService::get('default_currency', 'MAD')
     * - app(FinanceSettingsService::class)->get('company.company_name', 'ARCHI LBO')
     */
    public static function get(string $groupOrKey, mixed $keyOrDefault = null, mixed $default = null): mixed
    {
        $groups = ['finance', 'company', 'bank'];

        if (in_array($groupOrKey, $groups, true)) {
            $group = $groupOrKey;
            $key = (string) $keyOrDefault;
            $fallback = $default;

            return CompanySetting::getValue($group, self::normalizeKey($key), $fallback);
        }

        if (str_contains($groupOrKey, '.')) {
            [$group, $key] = explode('.', $groupOrKey, 2);

            return CompanySetting::getValue($group, self::normalizeKey($key), $keyOrDefault);
        }

        $key = self::normalizeKey($groupOrKey);
        $group = self::inferGroupFromKey($key);

        return CompanySetting::getValue($group, $key, $keyOrDefault);
    }

    public static function set(string $groupOrKey, mixed $keyOrValue, mixed $value = null, string $type = 'string', ?string $description = null): mixed
    {
        $groups = ['finance', 'company', 'bank'];

        if (in_array($groupOrKey, $groups, true)) {
            return CompanySetting::setValue(
                $groupOrKey,
                self::normalizeKey((string) $keyOrValue),
                $value,
                $type,
                $description
            );
        }

        if (str_contains($groupOrKey, '.')) {
            [$group, $key] = explode('.', $groupOrKey, 2);

            return CompanySetting::setValue(
                $group,
                self::normalizeKey($key),
                $keyOrValue,
                $type,
                $description
            );
        }

        $key = self::normalizeKey($groupOrKey);

        return CompanySetting::setValue(
            self::inferGroupFromKey($key),
            $key,
            $keyOrValue,
            $type,
            $description
        );
    }

    private static function normalizeKey(string $key): string
    {
        return match ($key) {
            'currency' => 'default_currency',
            'tva_rate' => 'default_tva_rate',
            'tax_rate' => 'default_tva_rate',
            'payment_terms_days' => 'default_payment_terms_days',
            'payment_days' => 'default_payment_terms_days',
            'quote_validity_days' => 'default_quote_validity_days',
            'unit_price_m2' => 'default_unit_price_m2',
            'unit_price' => 'default_unit_price_m2',
            'architect_rate' => 'default_architect_rate',
            'name' => 'company_name',
            'address' => 'company_address',
            'phone' => 'company_phone',
            'email' => 'company_email',
            'ice' => 'company_ice',
            'tva' => 'company_tva',
            'patente' => 'company_patente',
            'cnss' => 'company_cnss',
            'logo_path' => 'company_logo_path',
            'logo_url' => 'company_logo_url',
            'bank_name' => 'bank_name',
            'rib' => 'bank_rib',
            default => $key,
        };
    }

    private static function inferGroupFromKey(string $key): string
    {
        if (str_starts_with($key, 'company_')) {
            return 'company';
        }

        if (str_starts_with($key, 'bank_')) {
            return 'bank';
        }

        return 'finance';
    }

    public static function getTvaRate(): float
    {
        return (float) CompanySetting::getValue('finance', 'default_tva_rate', 20);
    }

    public static function getDefaultTvaRate(): float
    {
        return self::getTvaRate();
    }

    public static function getCurrency(): string
    {
        return (string) CompanySetting::getValue('finance', 'default_currency', 'MAD');
    }

    public static function getDefaultCurrency(): string
    {
        return self::getCurrency();
    }

    public static function getPaymentTermsDays(): int
    {
        return (int) CompanySetting::getValue('finance', 'default_payment_terms_days', 30);
    }

    public static function getDefaultPaymentTermsDays(): int
    {
        return self::getPaymentTermsDays();
    }

    public static function getDefaultPaymentDays(): int
    {
        return self::getPaymentTermsDays();
    }

    public static function getQuoteValidityDays(): int
    {
        return (int) CompanySetting::getValue('finance', 'default_quote_validity_days', 30);
    }

    public static function getDefaultQuoteValidityDays(): int
    {
        return self::getQuoteValidityDays();
    }

    public static function getUnitPriceM2(): float
    {
        return (float) CompanySetting::getValue('finance', 'default_unit_price_m2', 900);
    }

    public static function getDefaultUnitPriceM2(): float
    {
        return self::getUnitPriceM2();
    }

    public static function getDefaultUnitPrice(): float
    {
        return self::getUnitPriceM2();
    }

    public static function getArchitectRate(): float
    {
        return (float) CompanySetting::getValue('finance', 'default_architect_rate', 0.5);
    }

    public static function getDefaultArchitectRate(): float
    {
        return self::getArchitectRate();
    }

    public static function getCompanyName(): string
    {
        return (string) CompanySetting::getValue('company', 'company_name', 'ARCHI LBO SARLAU');
    }

    public static function getCompanyAddress(): string
    {
        return (string) CompanySetting::getValue('company', 'company_address', 'Immeuble nr 959 lotissement AL MASSAR Marrakech');
    }

    public static function getCompanyPhone(): string
    {
        return (string) CompanySetting::getValue('company', 'company_phone', '');
    }

    public static function getCompanyEmail(): string
    {
        return (string) CompanySetting::getValue('company', 'company_email', 'contact@archilbo.local');
    }

    public static function getCompanyIce(): string
    {
        return (string) CompanySetting::getValue('company', 'company_ice', '003614682000039');
    }

    public static function getCompanyTva(): string
    {
        return (string) CompanySetting::getValue('company', 'company_tva', '66121376');
    }

    public static function getCompanyPatente(): string
    {
        return (string) CompanySetting::getValue('company', 'company_patente', '64007633');
    }

    public static function getCompanyCnss(): string
    {
        return (string) CompanySetting::getValue('company', 'company_cnss', '5850815');
    }

    public static function getCompanyLogoPath(): string
    {
        return (string) CompanySetting::getValue('company', 'company_logo_path', '');
    }

    public static function getCompanyLogoUrl(): string
    {
        $path = self::getCompanyLogoPath();

        if (!$path) {
            return '';
        }

        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        return Storage::disk('public')->url($path);
    }

    public static function getCompanyLogoDataUri(): string
    {
        $path = self::getCompanyLogoPath();

        if (!$path || str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return '';
        }

        if (!Storage::disk('public')->exists($path)) {
            return '';
        }

        $absolutePath = Storage::disk('public')->path($path);
        $contents = file_get_contents($absolutePath);

        if ($contents === false) {
            return '';
        }

        $mime = mime_content_type($absolutePath) ?: 'image/png';

        return 'data:' . $mime . ';base64,' . base64_encode($contents);
    }

    public static function getCompanyLogoHtml(): string
    {
        $dataUri = self::getCompanyLogoDataUri();
        $url = $dataUri ?: self::getCompanyLogoUrl();

        if ($url) {
            return '<img src="' . e($url) . '" alt="ARCHI LBO" class="company-logo-img">';
        }

        return '<div class="logo-mark"><span></span><span></span><span></span></div><div class="logo-text">ARCHI LBO</div>';
    }

    public static function getBankName(): string
    {
        return (string) CompanySetting::getValue('bank', 'bank_name', '');
    }

    public static function getBankRib(): string
    {
        return (string) CompanySetting::getValue('bank', 'bank_rib', '');
    }
}
```

## FILE: app\Services\Finance\PaymentLedgerService.php

```php
<?php

namespace App\Services\Finance;

use App\Models\FinanceDocument;
use App\Models\FinanceDocumentItem;
use App\Models\Payment;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Throwable;

class PaymentLedgerService
{
    public function recordPayment(FinanceDocument $invoice, array $data): Payment
    {
        return DB::transaction(function () use ($invoice, $data) {
            $invoice = $invoice->fresh();

            $amount = $this->normalizeAmount($data['amount'] ?? 0);

            $this->assertCanReceivePayment($invoice);
            $this->assertPaymentAmountIsValid($invoice, $amount);

            $payment = Payment::create([
                'finance_document_id' => $invoice->id,
                'client_id' => $invoice->client_id,
                'dossier_id' => $invoice->dossier_id,
                'payment_number' => FinanceNumberService::nextPaymentNumber(),
                'amount' => $amount,
                'method' => $data['method'] ?? null,
                'reference' => $data['reference'] ?? null,
                'paid_at' => $data['paid_at'] ?? now(),
                'notes' => $data['notes'] ?? null,
                'created_by' => $data['created_by'] ?? null,
            ]);

            $invoice = $this->recalculateInvoice($invoice);

            $receipt = $this->createOrUpdateReceiptForPayment($invoice, $payment->fresh());

            $payment->forceFill([
                'receipt_document_id' => $receipt->id,
            ])->save();

            return $payment->fresh(['document', 'receiptDocument']);
        });
    }

    public function updatePayment(Payment $payment, array $data): Payment
    {
        return DB::transaction(function () use ($payment, $data) {
            $payment = $payment->fresh(['document']);

            $oldInvoice = $payment->document;
            $newInvoiceId = $data['finance_document_id'] ?? $payment->finance_document_id;
            $newInvoice = FinanceDocument::findOrFail($newInvoiceId);
            $amount = $this->normalizeAmount($data['amount'] ?? $payment->amount);

            $this->assertCanReceivePayment($newInvoice);
            $this->assertPaymentAmountIsValid($newInvoice, $amount, $payment);

            $payment->update([
                'finance_document_id' => $newInvoice->id,
                'client_id' => $newInvoice->client_id,
                'dossier_id' => $newInvoice->dossier_id,
                'amount' => $amount,
                'method' => $data['method'] ?? $payment->method,
                'reference' => $data['reference'] ?? $payment->reference,
                'paid_at' => $data['paid_at'] ?? $payment->paid_at,
                'notes' => $data['notes'] ?? $payment->notes,
            ]);

            if ($oldInvoice && $oldInvoice->id !== $newInvoice->id) {
                $this->recalculateInvoice($oldInvoice->fresh());
            }

            $newInvoice = $this->recalculateInvoice($newInvoice->fresh());

            $receipt = $this->createOrUpdateReceiptForPayment($newInvoice, $payment->fresh());

            $payment->forceFill([
                'receipt_document_id' => $receipt->id,
            ])->save();

            return $payment->fresh(['document', 'receiptDocument']);
        });
    }

    public function deletePayment(Payment $payment): void
    {
        DB::transaction(function () use ($payment) {
            $payment = $payment->fresh(['document', 'receiptDocument']);

            $invoice = $payment->document;
            $receipt = $payment->receiptDocument;

            if ($receipt) {
                $receipt->forceFill([
                    'status' => 'cancelled',
                    'notes' => trim(($receipt->notes ?? '') . PHP_EOL . 'Recu annule car le paiement lie a ete supprime.'),
                ])->save();
            }

            $payment->delete();

            if ($invoice) {
                $this->recalculateInvoice($invoice->fresh());
            }
        });
    }

    public function recalculateInvoice(FinanceDocument $invoice): FinanceDocument
    {
        FinanceCalculator::updateInvoicePaymentTotals($invoice);
        $invoice->save();

        return $invoice->fresh();
    }

    private function assertCanReceivePayment(FinanceDocument $invoice): void
    {
        if (! $invoice->canRecordPayment()) {
            throw ValidationException::withMessages([
                'finance_document_id' => 'This document cannot receive payments.',
            ]);
        }
    }

    private function assertPaymentAmountIsValid(FinanceDocument $invoice, float $amount, ?Payment $existingPayment = null): void
    {
        if ($amount <= 0) {
            throw ValidationException::withMessages([
                'amount' => 'Payment amount must be greater than zero.',
            ]);
        }

        $available = (float) $invoice->remaining_total;

        if ($existingPayment && (int) $existingPayment->finance_document_id === (int) $invoice->id) {
            $available += (float) $existingPayment->amount;
        }

        if ($amount > round($available, 2)) {
            throw ValidationException::withMessages([
                'amount' => 'Payment amount cannot be greater than the remaining invoice amount.',
            ]);
        }
    }

    private function createOrUpdateReceiptForPayment(FinanceDocument $invoice, Payment $payment): FinanceDocument
    {
        $receipt = $payment->receipt_document_id
            ? FinanceDocument::find($payment->receipt_document_id)
            : null;

        $amount = (float) $payment->amount;
        $paymentDate = $payment->paid_at ?: now();

        if (! $receipt) {
            $receipt = new FinanceDocument();
            $receipt->type = 'receipt';
            $receipt->number = $this->nextReceiptNumber();
            $receipt->status = 'issued';
            $receipt->created_by = $payment->created_by;
        }

        $receipt->forceFill([
            'client_id' => $invoice->client_id,
            'dossier_id' => $invoice->dossier_id,
            'source_document_id' => $invoice->id,
            'issue_date' => $paymentDate,
            'currency' => $invoice->currency,
            'tva_rate' => 0,
            'subtotal_ht' => $amount,
            'discount_total' => 0,
            'tax_total' => 0,
            'total_ttc' => $amount,
            'paid_total' => $amount,
            'remaining_total' => 0,
            'notes' => $this->receiptNotes($invoice, $payment),
            'terms' => $this->receiptTerms($payment),
        ])->save();

        $this->syncReceiptItem($receipt, $invoice, $payment);

        return $receipt->fresh();
    }

    private function syncReceiptItem(FinanceDocument $receipt, FinanceDocument $invoice, Payment $payment): void
    {
        $receipt->items()->delete();

        $item = new FinanceDocumentItem([
            'position' => 1,
            'title' => 'Paiement recu - Facture ' . $invoice->number,
            'quantity' => 1,
            'unit' => 'payment',
            'unit_price' => (float) $payment->amount,
            'tva_rate' => 0,
        ]);

        $item->calculateTotals();
        $receipt->items()->save($item);
    }

    private function receiptNotes(FinanceDocument $invoice, Payment $payment): string
    {
        return implode(PHP_EOL, array_filter([
            'Recu de paiement pour facture ' . $invoice->number . '.',
            'Montant recu: ' . number_format((float) $payment->amount, 2, '.', ' ') . ' ' . $invoice->currency . '.',
            'Total facture TTC: ' . number_format((float) $invoice->total_ttc, 2, '.', ' ') . ' ' . $invoice->currency . '.',
            'Total paye facture: ' . number_format((float) $invoice->paid_total, 2, '.', ' ') . ' ' . $invoice->currency . '.',
            'Reste a payer: ' . number_format((float) $invoice->remaining_total, 2, '.', ' ') . ' ' . $invoice->currency . '.',
            $payment->notes,
        ]));
    }

    private function receiptTerms(Payment $payment): string
    {
        return implode(PHP_EOL, array_filter([
            'Date de paiement: ' . optional($payment->paid_at)->format('Y-m-d'),
            'Mode de paiement: ' . ($payment->method ?: 'Non precise'),
            'Reference: ' . ($payment->reference ?: null),
            'Numero paiement: ' . $payment->payment_number,
        ]));
    }

    private function nextReceiptNumber(): string
    {
        try {
            return FinanceNumberService::nextDocumentNumber('receipt');
        } catch (Throwable) {
            $year = now()->format('Y');
            $next = FinanceDocument::where('type', 'receipt')
                ->whereYear('created_at', now()->year)
                ->count() + 1;

            return 'REC-' . $year . '-' . str_pad((string) $next, 4, '0', STR_PAD_LEFT);
        }
    }

    private function normalizeAmount(mixed $amount): float
    {
        return round((float) $amount, 2);
    }
}
```

## FILE: app\Services\Task\TaskQueryService.php

```php
<?php

namespace App\Services\Task;

use App\Http\Resources\TaskResource;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\Request;

class TaskQueryService
{
    public function __construct(protected TaskRequestService $taskRequests) {}

    public function indexPayload(Request $request): array
    {
        $user = $request->user();
        $filter = $request->query('filter', 'all');
        $category = $request->query('category', 'all');
        $search = $request->query('search');

        $query = Task::query()
            ->with(['assignees', 'watchers', 'creator', 'assigner', 'checklistItems', 'dossier', 'client'])
            ->withCount(['comments', 'attachments']);

        if (! $user->can('manage tasks') && ! $user->hasRole('admin')) {
            $query->where(function ($q) use ($user) {
                $q->where('created_by', $user->id)
                    ->orWhereHas('assignees', fn ($assignees) => $assignees->where('user_id', $user->id))
                    ->orWhereHas('watchers', fn ($watchers) => $watchers->where('user_id', $user->id));
            });
        }

        match ($filter) {
            'my' => $query->whereHas('assignees', fn ($q) => $q->where('user_id', $user->id)),
            'assigned_by_me' => $query->where('assigned_by', $user->id),
            'watching' => $query->whereHas('watchers', fn ($q) => $q->where('user_id', $user->id)),
            'overdue' => $query->whereNotNull('due_date')->where('due_date', '<', now())->whereNotIn('status', ['completed', 'cancelled']),
            'due_today' => $query->whereDate('due_date', today()),
            'due_week' => $query->whereBetween('due_date', [now()->startOfWeek(), now()->endOfWeek()]),
            'blocked' => $query->where('status', 'blocked'),
            'completed' => $query->where('status', 'completed'),
            default => null,
        };

        if ($category !== 'all') {
            $query->where('category', $category);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('task_number', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $tasks = $query->latest()->get();

        return [
            'tasks' => TaskResource::collection($tasks)->resolve(),
            'users' => User::query()
                ->orderBy('name')
                ->get(['id', 'name', 'email'])
                ->map(fn (User $user) => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                ]),
            'activeFilter' => $filter,
            'activeCategory' => $category,
            'operationsConfig' => [
                'statuses' => config('archilbo_operations.task_statuses', []),
                'types' => config('archilbo_operations.task_types', []),
                'categories' => config('archilbo_operations.task_categories', []),
                'priorities' => config('archilbo_operations.task_priorities', []),
                'impacts' => config('archilbo_operations.task_impacts', []),
            ],
            'taskRequestTypes' => config('archilbo_operations.task_request_types', []),
            'taskRequestTypeLabels' => config('archilbo_operations.task_request_type_labels', []),
            'taskRequestOptions' => $this->taskRequests->formOptions(),
        ];
    }
}

```

## FILE: app\Services\Task\TaskRequestService.php

```php
<?php

namespace App\Services\Task;

use App\Models\Client;
use App\Models\Dossier;
use App\Models\TaskRequest;
use App\Models\User;
use Illuminate\Validation\ValidationException;

class TaskRequestService
{
    public function __construct(protected TaskMutationService $tasks) {}

    public function listFor(User $user): array
    {
        $query = TaskRequest::query()
            ->with(['requester', 'targetUser', 'client', 'dossier'])
            ->latest();

        if (! $user->can('manage task requests') && ! $user->hasRole('admin')) {
            $query->where(function ($q) use ($user) {
                $q->where('requested_by', $user->id)
                    ->orWhere('target_user_id', $user->id);
            });
        }

        return $query->get()->all();
    }

    public function formOptions(): array
    {
        return [
            'users' => User::query()
                ->orderBy('name')
                ->get(['id', 'name', 'email'])
                ->map(fn (User $user) => [
                    'id' => $user->id,
                    'label' => $user->name,
                    'description' => $user->email,
                ])
                ->values(),
            'clients' => Client::query()
                ->orderBy('full_name')
                ->limit(150)
                ->get(['id', 'full_name', 'client_number'])
                ->map(fn (Client $client) => [
                    'id' => $client->id,
                    'label' => trim(($client->client_number ? $client->client_number . ' - ' : '') . $client->full_name),
                ])
                ->values(),
            'dossiers' => Dossier::query()
                ->with('client:id,full_name')
                ->orderBy('dossier_number')
                ->limit(200)
                ->get(['id', 'client_id', 'dossier_number', 'project_object'])
                ->map(fn (Dossier $dossier) => [
                    'id' => $dossier->id,
                    'clientId' => $dossier->client_id,
                    'label' => trim($dossier->dossier_number . ' - ' . ($dossier->project_object ?? '-') . ' - ' . ($dossier->client?->full_name ?? '-')),
                ])
                ->values(),
        ];
    }

    public function nextNumber(): string
    {
        $prefix = 'REQ-' . now()->format('Y') . '-';
        $last = TaskRequest::query()
            ->where('request_number', 'like', $prefix . '%')
            ->latest('id')
            ->value('request_number');

        $next = $last ? ((int) substr($last, -4)) + 1 : 1;

        return $prefix . str_pad((string) $next, 4, '0', STR_PAD_LEFT);
    }

    public function create(array $data, User $requester): TaskRequest
    {
        return TaskRequest::create([
            ...$data,
            'request_number' => $data['request_number'] ?? $this->nextNumber(),
            'requested_by' => $data['requested_by'] ?? $requester->id,
            'status' => $data['status'] ?? 'submitted',
        ]);
    }

    public function accept(TaskRequest $taskRequest): TaskRequest
    {
        $this->ensureCanChangeDecision($taskRequest);

        if ($taskRequest->status === 'accepted') {
            return $taskRequest->refresh();
        }

        $taskRequest->update(['status' => 'accepted']);

        return $taskRequest->refresh();
    }

    public function reject(TaskRequest $taskRequest, ?string $reason = null): TaskRequest
    {
        $this->ensureCanChangeDecision($taskRequest);

        $metadata = $taskRequest->metadata ?? [];

        if ($reason) {
            $metadata['rejection_reason'] = $reason;
        }

        $taskRequest->update([
            'status' => 'rejected',
            'metadata' => $metadata,
        ]);

        return $taskRequest->refresh();
    }

    public function markConverted(TaskRequest $taskRequest, int $taskId): TaskRequest
    {
        $taskRequest->update([
            'status' => 'converted',
            'converted_task_id' => $taskId,
        ]);

        return $taskRequest->refresh();
    }

    public function convertToTask(TaskRequest $taskRequest, User $user): TaskRequest
    {
        if ($taskRequest->status === 'rejected') {
            throw ValidationException::withMessages([
                'task_request' => 'Rejected requests cannot be converted.',
            ]);
        }

        if ($taskRequest->converted_task_id) {
            return $taskRequest->refresh();
        }

        $mapping = config("archilbo_operations.task_request_task_mapping.{$taskRequest->request_type}", [
            'type' => 'internal_admin',
            'category' => 'general_admin',
        ]);

        $task = $this->tasks->create([
            'title' => $taskRequest->title,
            'description' => $taskRequest->description,
            'type' => $mapping['type'],
            'category' => $mapping['category'],
            'status' => 'not_started',
            'priority' => 'medium',
            'impact' => 'normal',
            'assignee_ids' => array_values(array_filter([$taskRequest->target_user_id])),
            'watcher_ids' => array_values(array_filter([$taskRequest->requested_by])),
            'client_id' => $taskRequest->client_id,
            'dossier_id' => $taskRequest->dossier_id,
            'dossier_document_id' => $taskRequest->dossier_document_id,
            'finance_document_id' => $taskRequest->finance_document_id,
            'contract_id' => $taskRequest->contract_id,
            'authorization_id' => $taskRequest->authorization_id,
            'archive_record_id' => $taskRequest->archive_record_id,
        ], $user);

        return $this->markConverted($taskRequest, $task->id);
    }

    private function ensureCanChangeDecision(TaskRequest $taskRequest): void
    {
        if (in_array($taskRequest->status, ['rejected', 'converted'], true)) {
            throw ValidationException::withMessages([
                'task_request' => 'This request is already closed.',
            ]);
        }
    }
}

```

## FILE: app\Services\WordDocumentConverter.php

```php
<?php

namespace App\Services;

class WordDocumentConverter
{
    private ?\COM $word = null;

    public function __construct()
    {
        if (!class_exists('\\COM', false)) {
            throw new \RuntimeException(
                'PHP COM extension is not enabled. '
                . 'Add "extension=com_dotnet" to php.ini and restart the web server.'
            );
        }
    }

    public function isAvailable(): bool
    {
        try {
            $word = new \COM('Word.Application');
            $word->Quit(false);

            return true;
        } catch (\Throwable) {
            return false;
        }
    }

    public function convertDocxToPdf(string $absoluteDocxPath, string $absolutePdfPath): void
    {
        if (!file_exists($absoluteDocxPath)) {
            throw new \RuntimeException("DOCX file not found: $absoluteDocxPath");
        }

        $pdfDir = dirname($absolutePdfPath);

        if (!is_dir($pdfDir)) {
            mkdir($pdfDir, 0755, true);
        }

        $word = null;

        try {
            $word = new \COM('Word.Application');
            $word->Visible = false;
            $word->DisplayAlerts = false;
            $word->ScreenUpdating = false;

            $doc = $word->Documents->Open($absoluteDocxPath);

            $doc->ExportAsFixedFormat($absolutePdfPath, 17);

            $doc->Close(false);
            $word->Quit(false);

            unset($doc, $word);

            if (!file_exists($absolutePdfPath)) {
                throw new \RuntimeException("Word did not create PDF at: $absolutePdfPath");
            }
        } catch (\Throwable $e) {
            if (isset($word)) {
                try {
                    $word->Quit(false);
                } catch (\Throwable) {
                }

                unset($word);
            }

            throw new \RuntimeException('Word PDF conversion failed: ' . $e->getMessage());
        }
    }
}

```

## FILE: database\migrations\2026_06_30_110000_create_tasks_tables.php

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->string('task_number')->unique();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('status')->default('not_started');
            $table->string('priority')->default('medium');
            $table->unsignedTinyInteger('progress')->default(0);
            $table->string('category')->default('general_admin');
            $table->date('start_date')->nullable();
            $table->date('due_date')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->foreignId('assigned_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('dossier_id')->nullable()->constrained('dossiers')->nullOnDelete();
            $table->foreignId('client_id')->nullable()->constrained('clients')->nullOnDelete();
            $table->foreignId('dossier_document_id')->nullable()->constrained('dossier_documents')->nullOnDelete();
            $table->foreignId('finance_document_id')->nullable()->constrained('finance_documents')->nullOnDelete();
            $table->foreignId('contract_id')->nullable()->constrained('contracts')->nullOnDelete();
            $table->foreignId('authorization_id')->nullable()->constrained('authorizations')->nullOnDelete();
            $table->foreignId('archive_record_id')->nullable()->constrained('archive_records')->nullOnDelete();
            $table->json('metadata')->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->index(['status', 'priority']);
            $table->index(['due_date']);
            $table->index(['created_by']);
        });

        Schema::create('task_assignees', function (Blueprint $table) {
            $table->id();
            $table->foreignId('task_id')->constrained('tasks')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['task_id', 'user_id']);
        });

        Schema::create('task_watchers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('task_id')->constrained('tasks')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['task_id', 'user_id']);
        });

        Schema::create('task_checklist_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('task_id')->constrained('tasks')->cascadeOnDelete();
            $table->string('label');
            $table->boolean('is_done')->default(false);
            $table->unsignedInteger('position')->default(0);
            $table->foreignId('completed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
        });

        Schema::create('task_comments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('task_id')->constrained('tasks')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->text('body');
            $table->boolean('is_note')->default(false);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('task_attachments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('task_id')->constrained('tasks')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('filename');
            $table->string('original_filename');
            $table->string('mime_type')->nullable();
            $table->unsignedInteger('size')->default(0);
            $table->timestamps();
        });

        Schema::create('task_activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('task_id')->constrained('tasks')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('action');
            $table->text('description')->nullable();
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();
            $table->timestamps();
        });

        Schema::create('task_suggestions', function (Blueprint $table) {
            $table->id();
            $table->string('type');
            $table->text('description');
            $table->json('context')->nullable();
            $table->foreignId('dossier_id')->nullable()->constrained('dossiers')->nullOnDelete();
            $table->foreignId('client_id')->nullable()->constrained('clients')->nullOnDelete();
            $table->foreignId('related_entity_id')->nullable();
            $table->string('related_entity_type')->nullable();
            $table->boolean('is_dismissed')->default(false);
            $table->timestamp('dismissed_at')->nullable();
            $table->foreignId('created_task_id')->nullable()->constrained('tasks')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('task_suggestions');
        Schema::dropIfExists('task_activity_logs');
        Schema::dropIfExists('task_attachments');
        Schema::dropIfExists('task_comments');
        Schema::dropIfExists('task_checklist_items');
        Schema::dropIfExists('task_watchers');
        Schema::dropIfExists('task_assignees');
        Schema::dropIfExists('tasks');
    }
};

```

## FILE: database\migrations\2026_06_30_110001_create_conversations_tables.php

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('conversations', function (Blueprint $table) {
            $table->id();
            $table->string('type')->default('direct');
            $table->string('subject')->nullable();
            $table->foreignId('task_id')->nullable()->constrained('tasks')->nullOnDelete();
            $table->foreignId('dossier_id')->nullable()->constrained('dossiers')->nullOnDelete();
            $table->foreignId('client_id')->nullable()->constrained('clients')->nullOnDelete();
            $table->foreignId('finance_document_id')->nullable()->constrained('finance_documents')->nullOnDelete();
            $table->timestamp('last_message_at')->nullable();
            $table->timestamps();
        });

        Schema::create('conversation_participants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('conversation_id')->constrained('conversations')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->timestamp('joined_at')->useCurrent();
            $table->timestamp('last_read_at')->nullable();
            $table->timestamps();
            $table->unique(['conversation_id', 'user_id']);
        });

        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('conversation_id')->constrained('conversations')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->text('body');
            $table->boolean('is_edited')->default(false);
            $table->timestamp('edited_at')->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->index(['conversation_id', 'created_at']);
        });

        Schema::create('message_reads', function (Blueprint $table) {
            $table->id();
            $table->foreignId('message_id')->constrained('messages')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->timestamp('read_at')->useCurrent();
            $table->timestamps();
            $table->unique(['message_id', 'user_id']);
        });

        Schema::create('message_attachments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('message_id')->constrained('messages')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('filename');
            $table->string('original_filename');
            $table->string('mime_type')->nullable();
            $table->unsignedInteger('size')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('message_attachments');
        Schema::dropIfExists('message_reads');
        Schema::dropIfExists('messages');
        Schema::dropIfExists('conversation_participants');
        Schema::dropIfExists('conversations');
    }
};

```

## FILE: database\migrations\2026_06_30_110002_create_notifications_table.php

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('type');
            $table->morphs('notifiable');
            $table->text('data');
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};

```

## FILE: database\migrations\2026_06_30_120000_extend_operations_center_foundation.php

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            if (! Schema::hasColumn('tasks', 'type')) {
                $table->string('type')->default('general')->index();
            }

            if (! Schema::hasColumn('tasks', 'impact')) {
                $table->string('impact')->default('normal')->index();
            }

            if (! Schema::hasColumn('tasks', 'reviewed_at')) {
                $table->timestamp('reviewed_at')->nullable();
            }

            if (! Schema::hasColumn('tasks', 'blocked_reason')) {
                $table->text('blocked_reason')->nullable();
            }

            if (! Schema::hasColumn('tasks', 'estimated_minutes')) {
                $table->unsignedInteger('estimated_minutes')->nullable();
            }

            if (! Schema::hasColumn('tasks', 'actual_minutes')) {
                $table->unsignedInteger('actual_minutes')->nullable();
            }

            if (! Schema::hasColumn('tasks', 'recurrence_rule')) {
                $table->string('recurrence_rule')->nullable();
            }

            if (! Schema::hasColumn('tasks', 'conversation_id')) {
                $table->foreignId('conversation_id')->nullable()->constrained('conversations')->nullOnDelete();
            }
        });

        if (! Schema::hasTable('task_requests')) {
            Schema::create('task_requests', function (Blueprint $table) {
                $table->id();
                $table->string('request_number')->unique();
                $table->string('request_type');
                $table->string('title');
                $table->text('description')->nullable();
                $table->foreignId('requested_by')->constrained('users')->cascadeOnDelete();
                $table->foreignId('target_user_id')->nullable()->constrained('users')->nullOnDelete();
                $table->string('status')->default('submitted')->index();
                $table->foreignId('client_id')->nullable()->constrained('clients')->nullOnDelete();
                $table->foreignId('dossier_id')->nullable()->constrained('dossiers')->nullOnDelete();
                $table->foreignId('dossier_document_id')->nullable()->constrained('dossier_documents')->nullOnDelete();
                $table->foreignId('finance_document_id')->nullable()->constrained('finance_documents')->nullOnDelete();
                $table->foreignId('contract_id')->nullable()->constrained('contracts')->nullOnDelete();
                $table->foreignId('authorization_id')->nullable()->constrained('authorizations')->nullOnDelete();
                $table->foreignId('archive_record_id')->nullable()->constrained('archive_records')->nullOnDelete();
                $table->foreignId('converted_task_id')->nullable()->constrained('tasks')->nullOnDelete();
                $table->json('metadata')->nullable();
                $table->timestamps();
                $table->softDeletes();

                $table->index(['request_type', 'status']);
                $table->index(['requested_by', 'status']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('task_requests');

        Schema::table('tasks', function (Blueprint $table) {
            foreach ([
                'conversation_id',
                'recurrence_rule',
                'actual_minutes',
                'estimated_minutes',
                'blocked_reason',
                'reviewed_at',
                'impact',
                'type',
            ] as $column) {
                if (Schema::hasColumn('tasks', $column)) {
                    if ($column === 'conversation_id') {
                        $table->dropConstrainedForeignId($column);
                    } else {
                        $table->dropColumn($column);
                    }
                }
            }
        });
    }
};

```

## FILE: database\migrations\2026_07_01_110000_create_calendar_tables.php

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('calendar_events', function (Blueprint $table) {
            $table->id();
            $table->string('event_number')->unique();
            $table->string('type');
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('status')->default('scheduled');
            $table->string('priority')->default('medium');
            $table->string('color')->nullable();
            $table->dateTime('starts_at');
            $table->dateTime('ends_at')->nullable();
            $table->boolean('all_day')->default(false);
            $table->string('timezone')->default('UTC');
            $table->string('visibility')->default('assigned_users');
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->foreignId('owner_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('task_id')->nullable()->constrained('tasks')->nullOnDelete();
            $table->foreignId('client_id')->nullable()->constrained('clients')->nullOnDelete();
            $table->foreignId('dossier_id')->nullable()->constrained('dossiers')->nullOnDelete();
            $table->foreignId('dossier_document_id')->nullable()->constrained('dossier_documents')->nullOnDelete();
            $table->foreignId('finance_document_id')->nullable()->constrained('finance_documents')->nullOnDelete();
            $table->foreignId('contract_id')->nullable()->constrained('contracts')->nullOnDelete();
            $table->foreignId('authorization_id')->nullable()->constrained('authorizations')->nullOnDelete();
            $table->foreignId('archive_record_id')->nullable()->constrained('archive_records')->nullOnDelete();
            $table->json('metadata')->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->index(['starts_at', 'ends_at']);
            $table->index(['status', 'priority']);
            $table->index('type');
            $table->index('created_by');
            $table->index('owner_id');
        });

        Schema::create('calendar_event_participants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('calendar_event_id')->constrained('calendar_events')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('role')->default('assignee');
            $table->string('response_status')->default('pending');
            $table->timestamp('last_read_at')->nullable();
            $table->timestamps();

            $table->unique(['calendar_event_id', 'user_id']);
        });

        Schema::create('calendar_event_reminders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('calendar_event_id')->constrained('calendar_events')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->integer('offset_minutes')->nullable();
            $table->timestamp('remind_at')->nullable();
            $table->string('channel')->default('in_app');
            $table->string('status')->default('pending');
            $table->timestamp('snoozed_until')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->timestamps();

            $table->index('status');
            $table->index('remind_at');
        });

        Schema::create('calendar_event_activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('calendar_event_id')->constrained('calendar_events')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('event');
            $table->json('old_value')->nullable();
            $table->json('new_value')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('created_at')->nullable();

            $table->index('event');
        });

        Schema::create('calendar_event_recurrences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('calendar_event_id')->constrained('calendar_events')->cascadeOnDelete();
            $table->string('frequency');
            $table->unsignedSmallInteger('interval')->default(1);
            $table->json('days_of_week')->nullable();
            $table->date('ends_at')->nullable();
            $table->unsignedInteger('count')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('calendar_event_recurrences');
        Schema::dropIfExists('calendar_event_activity_logs');
        Schema::dropIfExists('calendar_event_reminders');
        Schema::dropIfExists('calendar_event_participants');
        Schema::dropIfExists('calendar_events');
    }
};

```

## FILE: resources/css/app.css

```css
@import './archilbo-theme.css';
@import "tailwindcss";
@plugin "tailwindcss-react-aria-components";
@import './calendar.css';

:root {
    color-scheme: light;

    --tint: #fcb12d;

    --background: #ffffff;
    --foreground: #12110f;

    --surface: #ffffff;
    --surface-2: #f7f7f7;
    --surface-3: #eeeeee;

    --border: #e5e5e5;
    --border-strong: #d4d4d4;

    --text-muted: #6b6b6b;
    --text-subtle: #9a9a9a;

    --accent: #fcb12d;
    --accent-hover: #e69f1f;
    --accent-pressed: #d08d16;
    --accent-foreground: #12110f;

    --danger: #dc2626;
    --danger-hover: #b91c1c;

    --success: #16a34a;
    --warning: #d97706;
    --info: #0284c7;

    --focus-ring: #fcb12d;

    --radius-sm: 6px;
    --radius-md: 8px;
    --radius-lg: 12px;
    --radius-xl: 16px;

    --font-sans: "Geist Variable", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    --font-mono: "Geist Mono Variable", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
}

.dark {
    color-scheme: dark;

    --tint: #fcb12d;

    --background: #12110f;
    --foreground: #fdfdfd;

    --surface: #1a1815;
    --surface-2: #26231e;
    --surface-3: #333028;

    --border: #2d2a22;
    --border-strong: #474337;

    --text-muted: #a3a096;
    --text-subtle: #726e62;

    --accent: #fcb12d;
    --accent-hover: #e69f1f;
    --accent-pressed: #d08d16;
    --accent-foreground: #12110f;

    --danger: #f87171;
    --danger-hover: #ef4444;

    --success: #4ade80;
    --warning: #fbbf24;
    --info: #38bdf8;

    --focus-ring: #fcb12d;
}

html,
body {
    min-height: 100%;
}

body {
    margin: 0;
    background:
        radial-gradient(circle at top left, color-mix(in srgb, var(--accent) 8%, transparent), transparent 32rem),
        var(--background);
    color: var(--foreground);
    font-family: var(--font-sans);
    font-size: 14px;
    letter-spacing: -0.006em;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
}

code,
pre,
kbd,
samp {
    font-family: var(--font-mono);
}

* {
    border-color: var(--border);
}

::selection {
    background: color-mix(in srgb, var(--accent) 20%, transparent);
}

/* React Aria base styling */

.react-aria-Button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    height: 2.25rem;
    padding: 0 0.875rem;
    border-radius: var(--radius-md);
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--foreground);
    font-size: 13px;
    font-weight: 500;
    line-height: 1;
    letter-spacing: -0.004em;
    outline: none;
    transition:
        background-color 140ms ease,
        border-color 140ms ease,
        color 140ms ease,
        box-shadow 140ms ease,
        transform 80ms ease;
}

.react-aria-Button[data-hovered] {
    background: var(--surface-2);
    border-color: var(--border-strong);
}

.react-aria-Button[data-pressed] {
    transform: translateY(1px);
    background: var(--surface-3);
}

.react-aria-Button[data-focus-visible] {
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--focus-ring) 28%, transparent);
    border-color: var(--focus-ring);
}

.react-aria-Button[data-disabled] {
    opacity: 0.5;
    cursor: not-allowed;
}

.react-aria-TextField {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
}

.react-aria-Label {
    color: var(--foreground);
    font-size: 0.8125rem;
    font-weight: 500;
}

.react-aria-Input,
.react-aria-TextArea,
.react-aria-SearchField input {
    width: 100%;
    min-height: 2.25rem;
    border-radius: var(--radius-md);
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--foreground);
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
    outline: none;
    transition:
        border-color 140ms ease,
        box-shadow 140ms ease,
        background-color 140ms ease;
}

.react-aria-Input[data-focused],
.react-aria-TextArea[data-focused],
.react-aria-SearchField[data-focused] input {
    border-color: var(--focus-ring);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--focus-ring) 22%, transparent);
}

.react-aria-Input[data-invalid],
.react-aria-TextArea[data-invalid] {
    border-color: var(--danger);
}

.react-aria-FieldError {
    color: var(--danger);
    font-size: 0.75rem;
}

.react-aria-Text {
    color: var(--text-muted);
    font-size: 0.8125rem;
}

.react-aria-Popover,
.react-aria-Modal {
    background: var(--surface);
    color: var(--foreground);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    box-shadow:
        0 20px 25px -5px rgb(15 23 42 / 0.12),
        0 8px 10px -6px rgb(15 23 42 / 0.12);
}

.react-aria-Dialog {
    outline: none;
}

.react-aria-ListBox,
.react-aria-Menu {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    padding: 0.375rem;
    outline: none;
}

.react-aria-ListBoxItem,
.react-aria-MenuItem {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    min-height: 2rem;
    padding: 0.375rem 0.625rem;
    border-radius: var(--radius-sm);
    color: var(--foreground);
    font-size: 0.875rem;
    outline: none;
    cursor: default;
}

.react-aria-ListBoxItem[data-hovered],
.react-aria-MenuItem[data-hovered],
.react-aria-ListBoxItem[data-focused],
.react-aria-MenuItem[data-focused] {
    background: var(--surface-2);
}

.react-aria-ListBoxItem[data-selected] {
    background: color-mix(in srgb, var(--accent) 14%, transparent);
    color: var(--accent);
}

.react-aria-Tabs {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.react-aria-TabList {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    border-bottom: 1px solid var(--border);
}

.react-aria-Tab {
    position: relative;
    padding: 0.625rem 0.75rem;
    color: var(--text-muted);
    font-size: 0.875rem;
    font-weight: 500;
    outline: none;
    cursor: default;
}

.react-aria-Tab[data-hovered] {
    color: var(--foreground);
}

.react-aria-Tab[data-selected] {
    color: var(--accent);
}

.react-aria-Tab[data-selected]::after {
    content: "";
    position: absolute;
    left: 0.75rem;
    right: 0.75rem;
    bottom: -1px;
    height: 2px;
    border-radius: 999px;
    background: var(--accent);
}

.react-aria-Table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    font-size: 0.875rem;
}

.react-aria-Column {
    color: var(--text-muted);
    font-size: 11px;
    line-height: 16px;
    font-weight: 600;
    text-align: left;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    padding: 0.5rem 0.625rem;
    border-bottom: 1px solid var(--border);
    white-space: nowrap;
}

.react-aria-Cell {
    vertical-align: middle;
    padding: 0.5rem 0.625rem;
    border-bottom: 1px solid var(--border);
}

.react-aria-Row[data-hovered] .react-aria-Cell {
    background: color-mix(in srgb, var(--surface-2) 70%, transparent);
}

/* App utilities */

.app-surface {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-xl);
    box-shadow: 0 1px 2px rgb(15 23 42 / 0.05);
}

.app-muted {
    color: var(--text-muted);
}

.app-compact-badge {
    white-space: nowrap;
    flex-shrink: 0;
    font-size: 11px;
    line-height: 16px;
    letter-spacing: -0.01em;
    padding: 1px 7px;
}

.app-table-nowrap td,
.app-table-nowrap th {
    white-space: nowrap;
}

.app-table-primary-cell {
    white-space: normal;
    min-width: 240px;
}

.app-focus-ring {
    outline: none;
}

.app-focus-ring:focus-visible {
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--focus-ring) 28%, transparent);
}

.app-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: color-mix(in srgb, var(--border-strong) 80%, transparent) transparent;
}

.app-scrollbar::-webkit-scrollbar {
    width: 10px;
    height: 10px;
}

.app-scrollbar::-webkit-scrollbar-thumb {
    background: color-mix(in srgb, var(--border-strong) 80%, transparent);
    border: 3px solid transparent;
    border-radius: 999px;
    background-clip: content-box;
}

/* Step 5 - Drawer and modal helpers */

.app-modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 60;
    display: flex;
    background: rgb(15 23 42 / 0.38);
    backdrop-filter: blur(8px);
}

.app-drawer-overlay {
    align-items: stretch;
    justify-content: flex-end;
}

.app-dialog-overlay {
    align-items: center;
    justify-content: center;
    padding: 1rem;
}

.app-drawer-panel {
    width: min(100vw, 520px);
    height: 100%;
    background: var(--surface);
    color: var(--foreground);
    border-left: 1px solid var(--border);
    box-shadow: -24px 0 60px rgb(15 23 42 / 0.18);
    outline: none;
}

.app-dialog-panel {
    width: min(100vw - 2rem, 440px);
    background: var(--surface);
    color: var(--foreground);
    border: 1px solid var(--border);
    border-radius: var(--radius-xl);
    box-shadow:
        0 20px 25px -5px rgb(15 23 42 / 0.18),
        0 8px 10px -6px rgb(15 23 42 / 0.16);
    outline: none;
}

/* STEP_15_GLOBAL_POLISH */
html {
    scroll-behavior: smooth;
}

body {
    overflow-x: hidden;
}

.app-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: color-mix(in srgb, var(--text-muted) 35%, transparent) transparent;
}

.app-scrollbar::-webkit-scrollbar {
    height: 8px;
    width: 8px;
}

.app-scrollbar::-webkit-scrollbar-thumb {
    border-radius: 999px;
    background: color-mix(in srgb, var(--text-muted) 28%, transparent);
}

.app-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}

.react-aria-Table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
}

.react-aria-Cell,
.react-aria-Column {
    vertical-align: middle;
}

.app-table-primary-cell {
    min-width: 0;
}

@media (max-width: 1023px) {
    .app-drawer-panel {
        width: min(100vw, 720px);
    }
}

/* Step 36 finance live builder */
.finance-builder-container {
    container-type: inline-size;
}

.finance-builder-layout {
    display: grid;
    gap: 1.25rem;
    min-width: 0;
}

.finance-builder-preview {
    position: static;
    min-width: 0;
}

@container (min-width: 980px) {
    .finance-builder-layout {
        grid-template-columns: minmax(0, 1fr) minmax(360px, 440px);
        align-items: start;
    }

    .finance-builder-preview {
        position: sticky;
        top: 1rem;
    }
}

html.login-no-scroll,
body.login-no-scroll {
    width: 100%;
    height: 100%;
    overflow: hidden !important;
    overscroll-behavior: none;
}

body.login-no-scroll #app {
    width: 100vw;
    height: 100dvh;
    overflow: hidden !important;
}
```

## FILE: resources/css/archilbo-theme.css

```css
:root {
    color-scheme: dark;

    --crm-bg: #070808;
    --crm-bg-2: #0b0c0d;
    --crm-bg-3: #0f1011;

    --crm-surface: #101111;
    --crm-surface-2: #151513;
    --crm-surface-3: #1b1a16;
    --crm-surface-hover: #1f1d18;

    --crm-border: #2b2921;
    --crm-border-strong: #3a3528;
    --crm-border-soft: color-mix(in srgb, var(--crm-border) 70%, transparent);

    --crm-text: #f5f1e8;
    --crm-text-muted: #a9a294;
    --crm-text-soft: #756f64;

    --crm-gold: #f6b725;
    --crm-gold-2: #d79516;
    --crm-gold-soft: color-mix(in srgb, var(--crm-gold) 14%, transparent);

    --crm-success: #4ade80;
    --crm-success-soft: color-mix(in srgb, var(--crm-success) 14%, transparent);
    --crm-danger: #fb5c5c;
    --crm-danger-soft: color-mix(in srgb, var(--crm-danger) 14%, transparent);
    --crm-info: #7fb0ff;
    --crm-info-soft: color-mix(in srgb, var(--crm-info) 14%, transparent);
    --crm-violet: #a78bfa;
    --crm-violet-soft: color-mix(in srgb, var(--crm-violet) 14%, transparent);

    --crm-sidebar-w: 264px;
    --crm-topbar-h: 72px;
    --crm-right-panel-w: 360px;

    --crm-page-pad: 32px;
    --crm-page-gap: 24px;
    --crm-panel-gap: 18px;
    --crm-card-pad: 18px;
    --crm-card-pad-sm: 14px;

    --crm-radius-xs: 6px;
    --crm-radius-sm: 8px;
    --crm-radius-md: 12px;
    --crm-radius-lg: 16px;
    --crm-radius-xl: 20px;

    --crm-shadow-panel: 0 18px 60px rgb(0 0 0 / 0.36);
    --crm-shadow-gold: 0 0 0 1px color-mix(in srgb, var(--crm-gold) 24%, transparent), 0 10px 30px rgb(246 183 37 / 0.08);

    --crm-font-sans: Geist, Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    --crm-font-mono: "Geist Mono", "SFMono-Regular", Consolas, monospace;
}

html,
body {
    background:
        radial-gradient(circle at top left, rgb(246 183 37 / 0.06), transparent 28rem),
        radial-gradient(circle at top right, rgb(127 176 255 / 0.04), transparent 24rem),
        var(--crm-bg);
    color: var(--crm-text);
}

body {
    font-family: var(--crm-font-sans);
}

.crm-shell {
    min-height: 100vh;
    background:
        linear-gradient(180deg, rgb(255 255 255 / 0.018), transparent 180px),
        var(--crm-bg);
}

.crm-panel {
    border: 1px solid var(--crm-border);
    background:
        linear-gradient(180deg, rgb(255 255 255 / 0.025), transparent),
        var(--crm-surface);
    border-radius: var(--crm-radius-lg);
    box-shadow: var(--crm-shadow-panel);
}

.crm-panel-flat {
    border: 1px solid var(--crm-border);
    background: var(--crm-surface);
    border-radius: var(--crm-radius-md);
}

.crm-panel-soft {
    border: 1px solid var(--crm-border-soft);
    background: color-mix(in srgb, var(--crm-surface) 84%, transparent);
    border-radius: var(--crm-radius-md);
}

.crm-page {
    width: 100%;
    max-width: 1600px;
    margin-inline: auto;
    padding: var(--crm-page-pad);
    display: grid;
    gap: 8px;
    align-content: start;
}

.crm-topbar {
    height: var(--crm-topbar-h);
    border-bottom: 1px solid var(--crm-border);
    background: color-mix(in srgb, var(--crm-bg-2) 92%, transparent);
    backdrop-filter: blur(18px);
}

.crm-command-input {
    height: 42px;
    border: 1px solid var(--crm-border);
    border-radius: var(--crm-radius-md);
    background: color-mix(in srgb, var(--crm-surface) 88%, transparent);
    color: var(--crm-text);
}

.crm-command-input:focus-within {
    border-color: color-mix(in srgb, var(--crm-gold) 58%, var(--crm-border));
    box-shadow: 0 0 0 3px rgb(246 183 37 / 0.08);
}

.crm-sidebar {
    width: var(--crm-sidebar-w);
    border-right: 1px solid var(--crm-border);
    background:
        linear-gradient(180deg, rgb(246 183 37 / 0.045), transparent 280px),
        var(--crm-bg-2);
}

.crm-nav-item {
    height: 42px;
    display: flex;
    align-items: center;
    gap: 12px;
    border-radius: var(--crm-radius-md);
    padding-inline: 12px;
    color: var(--crm-text-muted);
    transition: background 160ms ease, color 160ms ease, box-shadow 160ms ease;
}

.crm-nav-item:hover {
    background: var(--crm-surface-2);
    color: var(--crm-text);
}

.crm-nav-item-active {
    background:
        linear-gradient(90deg, rgb(246 183 37 / 0.2), rgb(246 183 37 / 0.07)),
        var(--crm-surface-3);
    color: var(--crm-gold);
    box-shadow: inset 3px 0 0 var(--crm-gold);
}

.crm-page-title {
    letter-spacing: -0.015em;
    font-size: 28px;
    line-height: 1.1;
    font-weight: 720;
}

.crm-eyebrow {
    font-size: 11px;
    font-weight: 760;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--crm-gold);
}

.crm-kpi-grid {
    display: grid;
    gap: var(--crm-panel-gap);
    grid-template-columns: repeat(5, minmax(0, 1fr));
}

.crm-kpi-card {
    min-height: 88px;
    border: 1px solid var(--crm-border);
    background: linear-gradient(180deg, rgb(255 255 255 / 0.028), transparent), var(--crm-surface);
    border-radius: var(--crm-radius-md);
    padding: 14px;
}

.crm-kpi-label {
    font-size: 11px;
    font-weight: 650;
    color: var(--crm-text-muted);
}

.crm-kpi-value {
    margin-top: 8px;
    font-size: 24px;
    line-height: 1;
    font-weight: 760;
    letter-spacing: -0.02em;
}

.crm-segmented {
    display: inline-flex;
    gap: 3px;
    padding: 4px;
    border: 1px solid var(--crm-border);
    border-radius: var(--crm-radius-md);
    background: var(--crm-surface);
}

.crm-segmented-button {
    height: 32px;
    border-radius: var(--crm-radius-sm);
    padding-inline: 12px;
    font-size: 12px;
    font-weight: 680;
    color: var(--crm-text-muted);
    transition: background 160ms ease, color 160ms ease;
}

.crm-segmented-button:hover {
    background: var(--crm-surface-2);
    color: var(--crm-text);
}

.crm-segmented-button-active {
    background: var(--crm-gold);
    color: #111;
}

.crm-table-wrap {
    overflow: hidden;
    border: 1px solid var(--crm-border);
    border-radius: var(--crm-radius-md);
    background: var(--crm-surface);
}

.crm-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    font-size: 13px;
}

.crm-table th {
    height: 38px;
    padding-inline: 12px;
    border-bottom: 1px solid var(--crm-border);
    color: var(--crm-text-soft);
    font-size: 11px;
    font-weight: 700;
    text-align: left;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    background: color-mix(in srgb, var(--crm-surface-2) 74%, transparent);
}

.crm-table td {
    height: 52px;
    padding-inline: 12px;
    border-bottom: 1px solid color-mix(in srgb, var(--crm-border) 72%, transparent);
    color: var(--crm-text-muted);
}

.crm-table tr:hover td {
    background: color-mix(in srgb, var(--crm-gold) 4%, transparent);
    color: var(--crm-text);
}

.crm-status-pill {
    display: inline-flex;
    min-height: 22px;
    align-items: center;
    border-radius: 999px;
    padding-inline: 8px;
    font-size: 11px;
    font-weight: 700;
    white-space: nowrap;
}

.crm-status-warning {
    background: var(--crm-gold-soft);
    color: var(--crm-gold);
}

.crm-status-success {
    background: var(--crm-success-soft);
    color: var(--crm-success);
}

.crm-status-danger {
    background: var(--crm-danger-soft);
    color: var(--crm-danger);
}

.crm-status-info {
    background: var(--crm-info-soft);
    color: var(--crm-info);
}

.crm-action-button {
    height: 34px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    border: 1px solid var(--crm-border);
    border-radius: var(--crm-radius-sm);
    padding-inline: 11px;
    background: var(--crm-surface);
    color: var(--crm-text);
    font-size: 12px;
    font-weight: 700;
    transition: background 160ms ease, border-color 160ms ease, color 160ms ease;
}

.crm-action-button:hover {
    border-color: var(--crm-border-strong);
    background: var(--crm-surface-2);
}

.crm-action-button-primary {
    border-color: color-mix(in srgb, var(--crm-gold) 60%, var(--crm-border));
    background: var(--crm-gold);
    color: #111;
}

.crm-action-button-primary:hover {
    background: #ffc63a;
}

.crm-right-panel {
    width: var(--crm-right-panel-w);
    min-width: 0;
}

.crm-divider {
    height: 1px;
    background: var(--crm-border);
}

.crm-scroll-thin {
    scrollbar-width: thin;
    scrollbar-color: var(--crm-border-strong) transparent;
}

.crm-scroll-thin::-webkit-scrollbar {
    width: 8px;
    height: 8px;
}

.crm-scroll-thin::-webkit-scrollbar-thumb {
    background: var(--crm-border-strong);
    border-radius: 999px;
}

.crm-scroll-thin::-webkit-scrollbar-track {
    background: transparent;
}

@media (max-width: 1279px) {
    .crm-kpi-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .crm-right-panel {
        width: 100%;
    }
}

@media (max-width: 767px) {
    :root {
        --crm-page-pad: 16px;
        --crm-page-gap: 18px;
        --crm-panel-gap: 14px;
    }

    .crm-page-title {
        font-size: 23px;
    }

    .crm-kpi-grid {
        grid-template-columns: 1fr;
    }

    .crm-table td,
    .crm-table th {
        padding-inline: 10px;
    }
}
```

## FILE: resources/js/locales/en.ts

```ts
export const en = {
    app: {
        name: 'ARCHI LBO OS',
        shortName: 'ARCHI LBO',
        description: 'Architecture office operating system',
        searchPlaceholder: 'Search clients, projects, documents...',
        theme: 'Theme',
        light: 'Light',
        dark: 'Dark',
        soon: 'Soon',
        userMenu: 'User menu',
        noData: 'No data',
    },

    nav: {
        groups: {
            principal: 'Main',
            followUp: 'Follow-up',
            management: 'Management',
            administration: 'Administration',
        },
        dashboard: 'Dashboard',
        clients: 'Clients',
        intermediaries: 'Intermediaries',
        dossiers: 'Projects',
        contracts: 'Contracts',
        planning: 'Planning',
        authorizations: 'Authorizations',
        documents: 'Documents',
        archives: 'Archives',
        finance: 'Finance',
        financeOverview: 'Overview',
        financePayments: 'Payments',
        financeMonthly: 'Monthly summary',
        financeTemplates: 'Templates',
        financeDocuments: 'Finance documents',
        financeSettings: 'Finance settings',
        tasks: 'Tasks',
        calendar: 'Calendar',
        taskRequests: 'Requests',
        workload: 'Workload',
        operationsReports: 'Operations reports',
        inbox: 'Inbox',
        notifications: 'Notifications',
        users: 'Users',
        branches: 'Branches',
        settings: 'Settings',
    },
    calendar: {
        eyebrow: 'Operations calendar',
        title: 'Calendar',
        subtitle: 'Schedule, tasks, reminders, meetings, and follow-ups across all CRM modules.',
        today: 'Today',
        month: 'Month',
        week: 'Week',
        day: 'Day',
        newEvent: 'New event',
        search: 'Search events...',
        noEvents: 'No events',
        eventType: 'Event type',
        allTypes: 'All types',
        user: 'User',
        allUsers: 'All',
        dueToday: 'Due today',
        overdue: 'Overdue',
        upcoming: 'Upcoming',
        noDate: 'No date',
        eventTypes: {
            task: 'Task',
            note: 'Note',
            reminder: 'Reminder',
            meeting: 'Meeting',
            deadline: 'Deadline',
            client_follow_up: 'Client follow-up',
            finance_follow_up: 'Finance follow-up',
            authorization_follow_up: 'Authorization follow-up',
            contract_follow_up: 'Contract follow-up',
            archive_follow_up: 'Archive follow-up',
        },
    },

    actions: {
        continue: 'Continue',
        startPrototype: 'Start prototype',
        newClient: 'New client',
        newProject: 'New project',
        open: 'Open',
        toggleTheme: 'Toggle theme',
        view: 'View',
        edit: 'Edit',
        delete: 'Delete',
        create: 'Create',
        save: 'Save',
        cancel: 'Cancel',
        more: 'More',
        export: 'Export',
        filter: 'Filter',
        download: 'Download',
        upload: 'Upload',
        documents: 'Documents',
        archive: 'Archive',
        clearSearch: 'Clear search',
        next: 'Next',
        previous: 'Previous',
        generate: 'Generate',
        verify: 'Verify',
        reject: 'Reject',
        submit: 'Submit',
        addNote: 'Add note',
        updateStatus: 'Update status',
        createProject: 'Create project',
        close: 'Close',
        confirmDelete: 'Confirm delete',
    },

    common: {
        status: 'Status',
        progress: 'Progress',
        updatedAt: 'Updated',
        actions: 'Actions',
        search: 'Search',
        all: 'All',
        active: 'Active',
        inactive: 'Inactive',
        archived: 'Archived',
        pending: 'Pending',
        completed: 'Completed',
        blocked: 'Blocked',
        missing: 'Missing',
        ready: 'Ready',
        amount: 'Amount',
        notes: 'Notes',
    },

    dashboard: {
        eyebrow: 'Command center',
        title: 'Dashboard',
        subtitle: 'Live overview of projects, documents, authorizations, finance, and daily actions.',
        introTitle: 'Interface foundation is ready',
        introText: 'This screen uses local translations instead of static text. The next step is to build the Projects page using the same shared components.',
        metrics: {
            clients: {
                label: 'Clients',
                value: '0',
                description: 'No real data yet',
            },
            dossiers: {
                label: 'Projects',
                value: '0',
                description: 'No real data yet',
            },
            documents: {
                label: 'Documents',
                value: '0',
                description: 'No real data yet',
            },
        },
        sections: {
            sampleField: 'React Aria field',
            sampleSelect: 'React Aria select',
        },
        fields: {
            clientName: 'Client name',
            clientNamePlaceholder: 'Example: Mohamed Ouknin',
            status: 'Status',
        },
        statuses: {
            new: 'New',
            active: 'Active',
            archived: 'Archived',
        },
    },

    clients: {
        eyebrow: 'Client CRM',
        title: 'Clients',
        subtitle: 'Manage owners, CIN details, contacts, project history, and client follow-up.',
        newClient: 'New client',
        editClient: 'Edit client',
        deleteClient: 'Delete client',
        searchPlaceholder: 'Search by name, CIN, phone, address, or intermediary...',
        emptyTitle: 'No clients found',
        emptyDescription: 'Create your first client to start building project files.',
        table: {
            client: 'Client',
            cin: 'CIN',
            phone: 'Phone',
            address: 'Address',
            status: 'Status',
            projects: 'Projects',
            updated: 'Updated',
            actions: 'Actions',
        },
        metrics: {
            total: 'Total clients',
            active: 'Active',
            thisMonth: 'This month',
            archived: 'Archived',
        },
        status: {
            active: 'Active',
            inactive: 'Inactive',
            archived: 'Archived',
        },
        form: {
            identity: 'Identity',
            contact: 'Contact',
            extra: 'Additional information',
            civility: 'Civility',
            firstName: 'First name',
            lastName: 'Last name',
            cin: 'CIN',
            phone: 'Phone',
            email: 'Email',
            address: 'Address',
            fatherName: 'Father name',
            cniExpirationDate: 'CNI expiration date',
            intermediaryName: 'Intermediary',
            notes: 'Notes',
            firstNamePlaceholder: 'Example: Mohamed',
            lastNamePlaceholder: 'Example: Ouknin',
            cinPlaceholder: 'Example: EE123456',
            phonePlaceholder: 'Example: +212 6 11 22 33 44',
            emailPlaceholder: 'Example: client@email.com',
            addressPlaceholder: 'Client address',
            notesPlaceholder: 'Internal notes about this client',
        },
        drawer: {
            createTitle: 'Create client',
            createDescription: 'Add a new client profile. Backend saving will be connected later.',
            editTitle: 'Edit client',
            editDescription: 'Update client information. Backend saving will be connected later.',
        },
        confirmDelete: {
            title: 'Delete client?',
            description: 'This is only a prototype action for now. Backend delete will be connected later.',
        },
        toast: {
            created: 'Client created successfully.',
            updated: 'Client updated successfully.',
            deleted: 'Client deleted.',
            view: 'Opening client details...',
            createProject: 'Create project action clicked.',
        },
    },

    intermediaries: {
        eyebrow: 'Client network',
        title: 'Intermediaries',
        subtitle: 'Manage agencies, partners, and people who bring or follow client files.',
    },

    dossiers: {
        eyebrow: 'Project workspace',
        title: 'Projects',
        subtitle: 'Track architecture files from client request to authorization, closure, archive, and finance.',
        pageTitle: 'Projects',
        newProject: 'New project',
        searchPlaceholder: 'Search by project, client, CIN, commune, or file number...',
        emptyTitle: 'No projects found',
        emptyDescription: 'Create your first project to start tracking contracts, documents, authorizations, and finance.',
        table: {
            project: 'Project',
            client: 'Client',
            commune: 'Commune',
            status: 'Status',
            contract: 'Contract',
            authorization: 'Authorization',
            progress: 'Progress',
            updated: 'Updated',
            actions: 'Actions',
        },
        metrics: {
            total: 'Total projects',
            active: 'Active',
            authorization: 'Authorization',
            finance: 'Finance follow-up',
        },
        status: {
            new: 'New',
            documentsRequired: 'Docs required',
            readyForContract: 'Ready contract',
            contractGenerated: 'Contract generated',
            authorizationProgress: 'Authorization',
            closed: 'Closed',
            archived: 'Archived',
            blocked: 'Blocked',
        },
        contract: {
            missing: 'Missing',
            calculation: 'Calculation',
            generated: 'Generated',
            signed: 'Signed',
            completed: 'Completed',
        },
        authorization: {
            notStarted: 'Not started',
            preparing: 'Preparing',
            submitted: 'Submitted',
            observations: 'Observations',
            approved: 'Approved',
            received: 'Received',
        },
        toast: {
            newProject: 'New project action clicked.',
            view: 'Opening project details...',
            edit: 'Opening project editor...',
            documents: 'Opening project documents...',
            archive: 'Archive action clicked.',
            export: 'Export action clicked.',
        },
    },

    dossierWorkspace: {
        eyebrow: 'Project file',
        titleFallback: 'Project workspace',
        subtitle: 'Central workspace for client data, property information, required documents, contract, authorization, planning, finance, and notes.',
        backToProjects: 'Back to projects',
        openDocuments: 'Open documents',
        editProject: 'Edit project',
        tabs: {
            overview: 'Overview',
            client: 'Client',
            property: 'Property',
            documents: 'Required docs',
            contract: 'Contract',
            planning: 'Planning',
            authorization: 'Authorization',
            finance: 'Finance',
            notes: 'Notes',
        },
        summary: {
            client: 'Client',
            cin: 'CIN',
            commune: 'Commune',
            landSurface: 'Land surface',
            floorArea: 'Floor area',
            progress: 'Progress',
            nextAction: 'Next action',
            nextActionValue: 'Complete missing documents before contract generation.',
        },
        overview: {
            title: 'Project overview',
            description: 'Fast view of the project status, next actions, and operational progress.',
            workflowHealth: 'Workflow health',
            documentReadiness: 'Document readiness',
            contractReadiness: 'Contract readiness',
            authorizationReadiness: 'Authorization readiness',
        },
        client: {
            title: 'Client information',
            description: 'Main client data used for contracts and official documents.',
            fullName: 'Full name',
            phone: 'Phone',
            address: 'Address',
            intermediary: 'Intermediary',
        },
        property: {
            title: 'Property information',
            description: 'Core property information needed for architectural and administrative workflow.',
            projectObject: 'Project object',
            address: 'Project address',
            province: 'Province / Prefecture',
            commune: 'Commune',
            titleNumber: 'Title number',
            landSurface: 'Land surface',
            floorArea: 'Floor area',
        },
        documents: {
            title: 'Required documents',
            description: 'Checklist of documents required before moving the project forward.',
            cni: 'CNI',
            ownership: 'Ownership certificate',
            cadastral: 'Cadastral plan',
            surface: 'Surface calculation',
            uploaded: 'Uploaded',
            verified: 'Verified',
            missing: 'Missing',
            rejected: 'Rejected',
        },
        contract: {
            title: 'Contract tracking',
            description: 'Contract calculation, generation, signature, submission, and return tracking.',
            calculation: 'Calculation',
            generation: 'Generation',
            signature: 'Signature',
            submission: 'Submission',
            returned: 'Returned',
            amount: 'Contract amount',
            tva: 'TVA',
            total: 'Total TTC',
        },
        planning: {
            title: 'Planning',
            description: 'Simple internal steps to keep the project moving.',
            collectDocs: 'Collect documents',
            verifyProperty: 'Verify property',
            prepareContract: 'Prepare contract',
            submitFile: 'Submit authorization file',
            followObservations: 'Follow observations',
        },
        authorization: {
            title: 'Authorization',
            description: 'Administrative authorization status and observations.',
            currentStatus: 'Current status',
            authority: 'Authority',
            submissionNumber: 'Submission number',
            observations: 'Observations',
        },
        finance: {
            title: 'Finance',
            description: 'Devis, invoices, payments, and remaining balance overview.',
            devis: 'Devis',
            invoices: 'Invoices',
            paid: 'Paid',
            remaining: 'Remaining',
        },
        notes: {
            title: 'Internal notes',
            description: 'Internal comments and decisions related to this project.',
            pinned: 'Pinned',
            warning: 'Warning',
            general: 'General',
        },
        toast: {
            edit: 'Project editor will be added later.',
            documents: 'Documents workspace will be connected later.',
            note: 'Note action clicked.',
            status: 'Status update action clicked.',
            verify: 'Document verification action clicked.',
            generate: 'Contract generation action clicked.',
        },
    },

    clientDetails: {
        eyebrow: 'Client profile',
        titleFallback: 'Client workspace',
        subtitle: 'Central workspace for client identity, projects, documents, notes, and activity.',
        backToClients: 'Back to clients',
        editClient: 'Edit client',
        createProject: 'Create project',
        uploadDocument: 'Upload document',
        tabs: {
            overview: 'Overview',
            projects: 'Projects',
            documents: 'Documents',
            notes: 'Notes',
            activity: 'Activity',
        },
        summary: {
            clientNumber: 'Client number',
            cin: 'CIN',
            phone: 'Phone',
            projects: 'Projects',
            status: 'Status',
            lastUpdate: 'Last update',
        },
        overview: {
            title: 'Client overview',
            description: 'Quick profile summary, contact data, project activity, and next actions.',
            identity: 'Identity',
            contact: 'Contact',
            followUp: 'Follow-up',
            fullName: 'Full name',
            email: 'Email',
            address: 'Address',
            fatherName: 'Father name',
            cniExpirationDate: 'CNI expiration',
            intermediaryName: 'Intermediary',
            nextAction: 'Next action',
            nextActionValue: 'Review client documents and create or update the active project file.',
        },
        projects: {
            title: 'Client projects',
            description: 'Projects linked to this client. Backend relation will be connected later.',
            emptyTitle: 'No projects linked',
            emptyDescription: 'Create a project from this client profile when backend is connected.',
            project: 'Project',
            commune: 'Commune',
            status: 'Status',
            progress: 'Progress',
            updated: 'Updated',
        },
        documents: {
            title: 'Client documents',
            description: 'Client-level files such as CNI and profile documents.',
            cni: 'CNI copy',
            profile: 'Client information',
            intermediary: 'Intermediary file',
            uploaded: 'Uploaded',
            missing: 'Missing',
            verified: 'Verified',
        },
        notes: {
            title: 'Notes',
            description: 'Internal notes and follow-up information about this client.',
            pinned: 'Pinned note',
            warning: 'Warning',
            general: 'General note',
        },
        activity: {
            title: 'Activity',
            description: 'Recent actions related to this client.',
            created: 'Client profile created',
            projectCreated: 'Project file created',
            documentUploaded: 'Document uploaded',
            contractPrepared: 'Contract preparation started',
        },
        toast: {
            edit: 'Client editor opened.',
            createProject: 'Create project action clicked.',
            uploadDocument: 'Upload document action clicked.',
            openProject: 'Opening project workspace...',
            addNote: 'Note action clicked.',
        },
    },
    projectForm: {
        drawer: {
            createTitle: 'Create project',
            createDescription: 'Create a new architecture project file. Backend saving will be connected later.',
            editTitle: 'Edit project',
            editDescription: 'Update project information. Backend saving will be connected later.',
        },
        sections: {
            client: 'Client',
            project: 'Project',
            property: 'Property',
            workflow: 'Workflow',
            notes: 'Notes',
        },
        fields: {
            client: 'Client',
            projectObject: 'Project object',
            projectAddress: 'Project address',
            province: 'Province / Prefecture',
            commune: 'Commune',
            landTitleNumber: 'Land title number',
            landSurface: 'Land surface',
            floorArea: 'Floor area',
            status: 'Initial status',
            notes: 'Notes',
        },
        placeholders: {
            projectObject: 'Example: Villa construction study',
            projectAddress: 'Project address',
            province: 'Example: Marrakech',
            commune: 'Example: Marrakech',
            landTitleNumber: 'Example: TF-88421/M',
            landSurface: 'Example: 420',
            floorArea: 'Example: 280',
            notes: 'Internal project notes',
        },
        statusOptions: {
            new: 'New',
            documentsRequired: 'Documents required',
            readyForContract: 'Ready for contract',
        },
        toast: {
            created: 'Project created successfully.',
            updated: 'Project updated successfully.',
        },
    },
    documentsWorkspace: {
        eyebrow: 'Required documents',
        title: 'Documents',
        subtitle: 'Manage required client and project documents before contracts, authorization, closure, and archive.',
        uploadDocument: 'Upload document',
        exportList: 'Export list',
        searchPlaceholder: 'Search by document, client, project, CIN, or status...',
        emptyTitle: 'No documents found',
        emptyDescription: 'Upload or create required document records to start document tracking.',
        metrics: {
            total: 'Total documents',
            verified: 'Verified',
            missing: 'Missing',
            rejected: 'Rejected',
        },
        table: {
            document: 'Document',
            project: 'Project',
            client: 'Client',
            type: 'Type',
            status: 'Status',
            updated: 'Updated',
            actions: 'Actions',
        },
        types: {
            cni: 'CNI',
            ownership: 'Ownership certificate',
            cadastral: 'Cadastral plan',
            surface: 'Surface calculation',
            contract: 'Contract',
            authorization: 'Authorization',
        },
        status: {
            missing: 'Missing',
            uploaded: 'Uploaded',
            verified: 'Verified',
            rejected: 'Rejected',
            expired: 'Expired',
        },
        cards: {
            cniTitle: 'Client identity',
            cniDescription: 'CNI copy and identity data required for contracts.',
            ownershipTitle: 'Ownership',
            ownershipDescription: 'Ownership certificate and property proof.',
            cadastralTitle: 'Cadastral',
            cadastralDescription: 'Cadastral plan and land references.',
            surfaceTitle: 'Surface',
            surfaceDescription: 'Surface calculation and plancher values.',
        },
        preview: {
            title: 'Document preview',
            emptyTitle: 'No document selected',
            emptyDescription: 'Select a document from the list or upload a file to preview metadata here.',
            selectedTitle: 'Selected document',
            fileName: 'File name',
            fileSize: 'File size',
            uploadedBy: 'Uploaded by',
            uploadedAt: 'Uploaded at',
        },
        checklist: {
            title: 'Readiness checklist',
            description: 'Operational checklist before contract generation.',
            cni: 'Client CNI is verified',
            ownership: 'Ownership certificate is verified',
            cadastral: 'Cadastral plan is available',
            surface: 'Surface calculation is ready',
            contractReady: 'Contract can be generated',
        },
        upload: {
            title: 'Upload zone',
            description: 'Choose a file to simulate upload. Backend storage will be connected later.',
            chooseFile: 'Choose file',
            accepted: 'PDF, DOCX, XLSX, JPG, PNG',
        },
        toast: {
            upload: 'Upload action clicked.',
            fileSelected: 'File selected.',
            view: 'Opening document preview...',
            verify: 'Document verified.',
            reject: 'Document rejected.',
            download: 'Download action clicked.',
            export: 'Export action clicked.',
        },
    },
    contractsWorkspace: {
        eyebrow: 'Contracts',
        title: 'Contracts',
        subtitle: 'Prepare contract calculations, generate official DOCX/PDF files, and track contract signature workflow.',
        newContract: 'New contract',
        generateDocx: 'Generate DOCX',
        generatePdf: 'Generate PDF',
        exportList: 'Export list',
        searchPlaceholder: 'Search by contract, client, project, CIN, or status...',
        emptyTitle: 'No contracts found',
        emptyDescription: 'Create a contract calculation from an approved project file.',
        metrics: {
            total: 'Total contracts',
            generated: 'Generated',
            signed: 'Signed',
            pending: 'Pending',
        },
        table: {
            contract: 'Contract',
            project: 'Project',
            client: 'Client',
            amount: 'Amount',
            status: 'Status',
            updated: 'Updated',
            actions: 'Actions',
        },
        status: {
            draft: 'Draft',
            calculated: 'Calculated',
            generated: 'Generated',
            givenToClient: 'Given to client',
            signed: 'Signed',
            submitted: 'Submitted',
            returned: 'Returned',
            completed: 'Completed',
            cancelled: 'Cancelled',
        },
        calculator: {
            title: 'Contract calculation',
            description: 'Prototype calculation for architectural fees. Backend formulas and template rules will be connected later.',
            surface: 'Floor area',
            pricePerMeter: 'Price per mÂ²',
            estimation: 'Estimated amount',
            honorairesRate: 'Fee rate',
            ht: 'HT amount',
            tvaRate: 'TVA rate',
            tvaAmount: 'TVA amount',
            ttc: 'Total TTC',
            currency: 'MAD',
            lock: 'Lock calculation',
            reset: 'Reset',
        },
        preview: {
            title: 'Contract preview',
            description: 'Official document preview placeholder. Real DOCX/PDF generation will use uploaded templates later.',
            fileName: 'File name',
            template: 'Template',
            version: 'Version',
            lastGenerated: 'Last generated',
            noPreview: 'No generated file selected',
        },
        workflow: {
            title: 'Contract workflow',
            description: 'Track the contract from calculation to client signature and return.',
            calculation: 'Calculation',
            docxGenerated: 'DOCX generated',
            pdfGenerated: 'PDF exported',
            givenToClient: 'Given to client',
            ownerSigned: 'Owner signed',
            submitted: 'Submitted to authority',
            returned: 'Returned to office',
        },
        cards: {
            templateTitle: 'Official template',
            templateDescription: 'Real DOCX template with placeholders.',
            versionTitle: 'Versions',
            versionDescription: 'Keep regenerated versions safely.',
            pdfTitle: 'PDF export',
            pdfDescription: 'LibreOffice conversion will be connected later.',
        },
        toast: {
            newContract: 'New contract action clicked.',
            generateDocx: 'DOCX generation simulated.',
            generatePdf: 'PDF export simulated.',
            lock: 'Calculation locked.',
            reset: 'Calculation reset.',
            view: 'Opening contract preview...',
            edit: 'Opening contract editor...',
            download: 'Download action clicked.',
            export: 'Export action clicked.',
        },
    },
    authorizationsWorkspace: {
        eyebrow: 'Authorizations',
        title: 'Authorizations',
        subtitle: 'Track administrative submissions, observations, approvals, and received authorization files.',
        newSubmission: 'New submission',
        submitFile: 'Submit file',
        addObservation: 'Add observation',
        markReceived: 'Mark received',
        downloadReceipt: 'Download receipt',
        exportList: 'Export list',
        searchPlaceholder: 'Search by submission, project, client, authority, or status...',
        emptyTitle: 'No authorizations found',
        emptyDescription: 'Create or submit an authorization file after project documents and contract are ready.',
        metrics: {
            total: 'Total files',
            submitted: 'Submitted',
            observations: 'With observations',
            received: 'Received',
        },
        table: {
            authorization: 'Authorization',
            project: 'Project',
            client: 'Client',
            authority: 'Authority',
            status: 'Status',
            observations: 'Observations',
            updated: 'Updated',
            actions: 'Actions',
        },
        status: {
            notStarted: 'Not started',
            preparing: 'Preparing',
            submitted: 'Submitted',
            observations: 'Observations',
            approved: 'Approved',
            received: 'Received',
            rejected: 'Rejected',
        },
        authorityType: {
            commune: 'Commune',
            province: 'Province',
            agency: 'Urban agency',
        },
        board: {
            title: 'Submission board',
            description: 'Operational view of the current authorization file and next administrative action.',
            currentStatus: 'Current status',
            authority: 'Authority',
            submissionNumber: 'Submission number',
            submittedAt: 'Submitted at',
            authorizationNumber: 'Authorization number',
            authorizationDate: 'Authorization date',
            nextAction: 'Next action',
            nextActionValue: 'Follow observations and upload the final authorization when received.',
        },
        timeline: {
            title: 'Authorization timeline',
            description: 'Follow the authorization process from preparation to received file.',
            preparing: 'Preparing file',
            submitted: 'Submitted to authority',
            observations: 'Observations received',
            corrections: 'Corrections prepared',
            approved: 'Approved',
            received: 'Authorization received',
        },
        observationsPanel: {
            title: 'Observations',
            description: 'Track remarks, corrections, and blocked points from the authority.',
            open: 'Open',
            resolved: 'Resolved',
            blocked: 'Blocked',
            dueDate: 'Due date',
            resolve: 'Resolve',
        },
        preview: {
            title: 'Authorization file',
            description: 'Preview placeholder for receipt, submission proof, or final authorization document.',
            receipt: 'Receipt',
            finalAuthorization: 'Final authorization',
            noFile: 'No file selected',
            fileName: 'File name',
            uploadedBy: 'Uploaded by',
            uploadedAt: 'Uploaded at',
        },
        cards: {
            prepareTitle: 'Prepare file',
            prepareDescription: 'Required documents and contract must be ready before submission.',
            submitTitle: 'Submit to authority',
            submitDescription: 'Track submission number, date, and receipt.',
            observeTitle: 'Follow observations',
            observeDescription: 'Keep corrections and authority remarks organized.',
        },
        toast: {
            newSubmission: 'New submission action clicked.',
            submitFile: 'Submission action clicked.',
            addObservation: 'Observation action clicked.',
            markReceived: 'Authorization marked as received.',
            view: 'Opening authorization preview...',
            edit: 'Opening authorization editor...',
            download: 'Download action clicked.',
            export: 'Export action clicked.',
            resolveObservation: 'Observation resolved.',
        },
    },
    planningWorkspace: {
        eyebrow: 'Planning',
        title: 'Planning',
        subtitle: 'Organize internal tasks, deadlines, visits, contract preparation, document follow-up, and authorization actions.',
        newTask: 'New task',
        exportList: 'Export list',
        markDone: 'Mark done',
        blockTask: 'Block task',
        searchPlaceholder: 'Search by task, project, client, assignee, priority, or status...',
        emptyTitle: 'No planning tasks found',
        emptyDescription: 'Create internal tasks to organize project work and deadlines.',
        metrics: {
            total: 'Total tasks',
            active: 'Active',
            overdue: 'Overdue',
            completed: 'Completed',
        },
        table: {
            task: 'Task',
            project: 'Project',
            client: 'Client',
            assignee: 'Assignee',
            priority: 'Priority',
            status: 'Status',
            dueDate: 'Due date',
            progress: 'Progress',
            actions: 'Actions',
        },
        status: {
            pending: 'Pending',
            active: 'Active',
            completed: 'Completed',
            blocked: 'Blocked',
            overdue: 'Overdue',
        },
        priority: {
            low: 'Low',
            normal: 'Normal',
            high: 'High',
            urgent: 'Urgent',
        },
        type: {
            documents: 'Documents',
            verification: 'Verification',
            contract: 'Contract',
            authorization: 'Authorization',
            siteVisit: 'Site visit',
            archive: 'Archive',
            finance: 'Finance',
        },
        board: {
            title: 'Weekly board',
            description: 'A visual week view for the office team.',
            monday: 'Monday',
            tuesday: 'Tuesday',
            wednesday: 'Wednesday',
            thursday: 'Thursday',
            friday: 'Friday',
            saturday: 'Saturday',
            sunday: 'Sunday',
        },
        focus: {
            title: 'Task focus',
            description: 'Selected task details and next action.',
            noTask: 'No task selected',
            selectTask: 'Select a task from the table to preview details here.',
            project: 'Project',
            client: 'Client',
            assignee: 'Assignee',
            dueDate: 'Due date',
            nextAction: 'Next action',
            nextActionValue: 'Confirm documents and move the project to the next workflow step.',
        },
        timeline: {
            title: 'Project workflow timeline',
            description: 'Prototype timeline for internal project follow-up.',
            documents: 'Documents collection',
            verification: 'Property verification',
            contract: 'Contract preparation',
            authorization: 'Authorization follow-up',
            closure: 'Closure and archive',
        },
        cards: {
            todayTitle: 'Today focus',
            todayDescription: 'Tasks that need immediate follow-up.',
            lateTitle: 'Late tasks',
            lateDescription: 'Blocked or overdue items that need manager attention.',
            teamTitle: 'Team load',
            teamDescription: 'Prototype workload overview by assignee.',
        },
        toast: {
            newTask: 'New task action clicked.',
            view: 'Opening task preview...',
            edit: 'Opening task editor...',
            done: 'Task marked as completed.',
            block: 'Task marked as blocked.',
            export: 'Export action clicked.',
        },
    },
    financeWorkspace: {
        eyebrow: 'Finance',
        title: 'Finance',
        subtitle: 'Track devis, invoices, payments, remaining balances, and financial status for each project.',
        newDevis: 'New devis',
        newInvoice: 'New invoice',
        addPayment: 'Add payment',
        exportList: 'Export list',
        searchPlaceholder: 'Search by client, project, invoice, devis, CIN, or status...',
        emptyTitle: 'No finance records found',
        emptyDescription: 'Create a devis or invoice to start tracking project finance.',
        metrics: {
            totalTtc: 'Total TTC',
            paid: 'Paid',
            remaining: 'Remaining',
            overdue: 'Overdue',
        },
        table: {
            record: 'Record',
            project: 'Project',
            client: 'Client',
            type: 'Type',
            total: 'Total',
            paid: 'Paid',
            remaining: 'Remaining',
            status: 'Status',
            updated: 'Updated',
            actions: 'Actions',
        },
        type: {
            devis: 'Devis',
            invoice: 'Invoice',
            payment: 'Payment',
            creditNote: 'Credit note',
        },
        status: {
            draft: 'Draft',
            sent: 'Sent',
            partiallyPaid: 'Partially paid',
            paid: 'Paid',
            overdue: 'Overdue',
            cancelled: 'Cancelled',
        },
        focus: {
            title: 'Finance focus',
            description: 'Selected financial record details and payment state.',
            noRecord: 'No record selected',
            selectRecord: 'Select a finance record from the table to preview details here.',
            recordNumber: 'Record number',
            client: 'Client',
            project: 'Project',
            totalTtc: 'Total TTC',
            paid: 'Paid',
            remaining: 'Remaining',
            dueDate: 'Due date',
            nextAction: 'Next action',
            nextActionValue: 'Follow remaining balance and prepare invoice/payment receipt.',
        },
        breakdown: {
            title: 'Payment breakdown',
            description: 'Prototype payment distribution for the selected record.',
            ht: 'HT',
            tva: 'TVA',
            ttc: 'TTC',
            paid: 'Paid',
            remaining: 'Remaining',
        },
        timeline: {
            title: 'Finance timeline',
            description: 'Financial workflow from devis to payment and closure.',
            devisCreated: 'Devis created',
            invoiceGenerated: 'Invoice generated',
            paymentReceived: 'Payment received',
            remainingFollowUp: 'Remaining follow-up',
            closed: 'Closed',
        },
        cards: {
            invoicesTitle: 'Invoices',
            invoicesDescription: 'Invoices generated from project contracts.',
            paymentsTitle: 'Payments',
            paymentsDescription: 'Track payment receipts and remaining balances.',
            overdueTitle: 'Overdue follow-up',
            overdueDescription: 'Records requiring manager attention.',
        },
        toast: {
            newDevis: 'New devis action clicked.',
            newInvoice: 'New invoice action clicked.',
            addPayment: 'Add payment action clicked.',
            view: 'Opening finance record preview...',
            edit: 'Opening finance editor...',
            download: 'Download action clicked.',
            markPaid: 'Record marked as paid.',
            export: 'Export action clicked.',
        },
    },
    archivesWorkspace: {
        eyebrow: 'Archives',
        title: 'Archives',
        subtitle: 'Track closed project files, archive numbers, in/out dates, physical location, and retrieval status.',
        newArchive: 'New archive',
        exportList: 'Export list',
        registerIn: 'Register in',
        registerOut: 'Register out',
        returnArchive: 'Return archive',
        searchPlaceholder: 'Search by archive number, project, client, box, shelf, room, or status...',
        emptyTitle: 'No archive records found',
        emptyDescription: 'Close a project file and assign an archive number to start archive tracking.',
        metrics: {
            total: 'Total archives',
            stored: 'Stored',
            out: 'Out',
            pending: 'Pending return',
        },
        table: {
            archive: 'Archive',
            project: 'Project',
            client: 'Client',
            location: 'Location',
            inDate: 'In date',
            outDate: 'Out date',
            status: 'Status',
            updated: 'Updated',
            actions: 'Actions',
        },
        status: {
            readyToArchive: 'Ready to archive',
            stored: 'Stored',
            out: 'Out',
            pendingReturn: 'Pending return',
            returned: 'Returned',
            lost: 'Lost',
        },
        focus: {
            title: 'Archive focus',
            description: 'Selected archive record, physical location, in/out history, and next action.',
            noRecord: 'No archive selected',
            selectRecord: 'Select an archive record from the table to preview details here.',
            archiveNumber: 'Archive number',
            client: 'Client',
            project: 'Project',
            dossierNumber: 'Dossier number',
            inDate: 'In date',
            outDate: 'Out date',
            returnedAt: 'Returned at',
            requestedBy: 'Requested by',
            nextAction: 'Next action',
            nextActionValue: 'Verify physical file location and update return status when the file comes back.',
        },
        location: {
            title: 'Physical location',
            description: 'Where the paper file is stored in the office archive.',
            room: 'Room',
            shelf: 'Shelf',
            box: 'Box',
            folder: 'Folder',
            archiveNumber: 'Archive number',
        },
        timeline: {
            title: 'Archive timeline',
            description: 'Archive lifecycle from project closure to physical storage and retrieval.',
            projectClosed: 'Project closed',
            documentsVerified: 'Documents verified',
            archiveNumberAssigned: 'Archive number assigned',
            fileStored: 'File stored',
            retrievalTracked: 'Retrieval tracked',
        },
        cards: {
            closureTitle: 'Closure control',
            closureDescription: 'Project cannot be archived until required documents and finance status are reviewed.',
            retrievalTitle: 'Retrieval tracking',
            retrievalDescription: 'Track who took the physical file and when it must be returned.',
            locationTitle: 'Archive location',
            locationDescription: 'Box, shelf, room, and folder identifiers must stay searchable.',
        },
        toast: {
            newArchive: 'New archive action clicked.',
            registerIn: 'Archive registered in.',
            registerOut: 'Archive registered out.',
            returnArchive: 'Archive marked as returned.',
            view: 'Opening archive preview...',
            edit: 'Opening archive editor...',
            download: 'Download action clicked.',
            export: 'Export action clicked.',
        },
    },
    dashboardHome: {
        eyebrow: 'Command center',
        title: 'ARCHI LBO operating dashboard',
        subtitle: 'A compact overview of clients, projects, documents, contracts, authorizations, finance, planning, and archives.',
        quickActions: 'Quick actions',
        openModule: 'Open module',
        viewAll: 'View all',
        workflowTitle: 'Office workflow',
        workflowDescription: 'Follow every project from first client contact to archive.',
        urgentTitle: 'Needs attention',
        urgentDescription: 'Operational items that should be handled first.',
        activityTitle: 'Recent activity',
        activityDescription: 'Latest prototype actions across the office workflow.',
        modulesTitle: 'Modules overview',
        modulesDescription: 'Current frontend modules ready in the prototype.',
        kpi: {
            clients: 'Clients',
            projects: 'Projects',
            documents: 'Documents',
            contracts: 'Contracts',
            authorizations: 'Authorizations',
            planning: 'Planning tasks',
            finance: 'Finance TTC',
            archives: 'Archives',
        },
        quick: {
            newClient: 'New client',
            newProject: 'New project',
            uploadDocument: 'Upload document',
            generateContract: 'Generate contract',
            addPayment: 'Add payment',
            archiveFile: 'Archive file',
        },
        workflow: {
            client: 'Client',
            project: 'Project',
            documents: 'Documents',
            contract: 'Contract',
            authorization: 'Authorization',
            finance: 'Finance',
            archive: 'Archive',
        },
        health: {
            ready: 'Ready',
            active: 'Active',
            attention: 'Attention',
            pending: 'Pending',
        },
        toast: {
            quickAction: 'Quick action clicked.',
            moduleOpen: 'Opening module...',
        },
    },
    dashboardCompact: {
        quickActions: 'Quick actions',
        recentActivity: 'Recent activity',
        showActivity: 'Show activity',
        hideActivity: 'Hide activity',
        financeTitle: 'Company finance snapshot',
        financeDescription: 'Small financial overview for the office.',
        totalTtc: 'Total TTC',
        paid: 'Paid',
        remaining: 'Remaining',
        overdue: 'Overdue',
        collectionRate: 'Collection rate',
    },
    clientFormExtra: {
        motherName: 'Mother name',
        intermediary: 'Intermediary',
        intermediaryPlaceholder: 'Select intermediary',
        none: 'None',
        agency: 'Agency',
        architectPartner: 'Architect partner',
        businessReferral: 'Business referral',
        familyReferral: 'Family referral',
    },
    frontendQa: {
        eyebrow: 'Frontend QA',
        title: 'Prototype QA console',
        subtitle: 'Test routing, global search, project test data, and prototype button actions before starting database work.',
        routesTitle: 'Route tests',
        routesDescription: 'Every active frontend route should open without 404 or undefined href errors.',
        searchTitle: 'Search tests',
        searchDescription: 'These queries must return results in the global search system.',
        projectsTitle: 'Project test data',
        projectsDescription: 'Open each project/dossier test record and confirm the workspace loads.',
        actionsTitle: 'Prototype button logic',
        actionsDescription: 'Test non-database actions such as fake downloads, toasts, and navigation.',
        open: 'Open',
        test: 'Test',
        runAction: 'Run action',
        expected: 'Expected',
        result: 'Result',
        routeOk: 'Route configured',
        searchOk: 'Search result found',
        noResult: 'No result',
        fakeDownload: 'Fake download',
        toastAction: 'Toast action',
        passed: 'Passed',
        pending: 'Pending manual check',
        toast: {
            route: 'Opening route...',
            action: 'Prototype action executed.',
            search: 'Search test executed.',
        },
    },
    layout: {
        account: 'Account',
        notifications: 'Notifications',
        workspace: 'Workspace',
    },

    financeSettings: {
        eyebrow: 'Finance settings',
        title: 'Finance settings',
        subtitle: 'Configure company information, numbering, tax rates, payment terms, and bank details for finance document generation.',
        sections: {
            company: 'Company information',
            numbering: 'Document numbering',
            tax: 'Tax & finance',
            bank: 'Bank information',
        },
        fields: {
            company_name: 'Company name',
            company_name_desc: 'Official business name shown on documents',
            company_address: 'Address',
            company_address_desc: 'Full company address',
            company_phone: 'Phone',
            company_phone_desc: 'Company phone number',
            company_email: 'Email',
            company_email_desc: 'Company email address',
            company_ice: 'ICE',
            company_ice_desc: 'Identifiant Commun de l\'Entreprise',
            company_cin: 'CIN',
            company_cin_desc: 'Carte d\'Identité Nationale of the manager',
            quote_prefix: 'Quote prefix',
            quote_prefix_desc: 'Prefix for quote numbering (e.g. DEV)',
            invoice_prefix: 'Invoice prefix',
            invoice_prefix_desc: 'Prefix for invoice numbering (e.g. INV)',
            receipt_prefix: 'Receipt prefix',
            receipt_prefix_desc: 'Prefix for receipt numbering (e.g. REC)',
            payment_prefix: 'Payment prefix',
            payment_prefix_desc: 'Prefix for payment numbering (e.g. PAY)',
            tva_rate: 'TVA rate (%)',
            tva_rate_desc: 'Default VAT rate applied to documents',
            currency: 'Currency',
            currency_desc: 'Default currency (e.g. MAD)',
            payment_terms: 'Payment terms',
            payment_terms_desc: 'Default payment conditions text',
            payment_days: 'Payment days',
            payment_days_desc: 'Default number of days before payment is due',
            bank_name: 'Bank name',
            bank_name_desc: 'Name of the bank',
            bank_rib: 'RIB',
            bank_rib_desc: 'Relevé d\'Identité Bancaire',
            bank_iban: 'IBAN',
            bank_iban_desc: 'International Bank Account Number',
            bank_bic: 'BIC/SWIFT',
            bank_bic_desc: 'Bank identification code',
        },
        save: 'Save settings',
        saving: 'Saving...',
        saved: 'Settings saved successfully.',
        saveError: 'Failed to save settings.',
    },

    tasks: {
        pageTitle: 'Tasks',
        pageSubtitle: 'Operations center \u2014 track, assign, and complete operational work.',
        metrics: {
            open: 'Open',
            urgent: 'Urgent',
            blocked: 'Blocked',
            overdue: 'Overdue',
            review: 'Review',
            completed: 'Completed',
            pending: 'Pending',
            dueThisWeek: 'Due this week',
        },
        filters: {
            all: 'All',
            my: 'My tasks',
            assignedByMe: 'Assigned by me',
            watching: 'Watching',
            overdue: 'Overdue',
            dueToday: 'Due today',
            dueThisWeek: 'Due this week',
            blocked: 'Blocked',
            completed: 'Completed',
            allPriorities: 'All priorities',
            allProjects: 'All projects',
            search: 'Search tasks, clients, projects...',
            scope: 'Scope',
            module: 'Module',
            reset: 'Reset',
        },
        overview: {
            statusOverview: 'Status overview',
            dayView: '7-day view',
            myFocus: 'My focus',
            urgentFocus: 'Urgent focus',
            needsAttention: 'Needs attention',
            nothingUrgent: 'Nothing urgent.',
            noUpcoming: 'No upcoming tasks.',
            allOnTrack: 'All on track',
            currentWorkload: 'Current workload',
        },
        board: {
            noTasks: 'No tasks',
        },
        drawer: {
            overview: 'Overview',
            checklist: 'Checklist',
            people: 'People',
            comments: 'Comments',
            attachments: 'Attachments',
            activity: 'Activity',
            markComplete: 'Mark complete',
            addChecklist: 'Add checklist item',
            addComment: 'Add comment',
            addNote: 'Add note',
            uploadFile: 'Upload',
            statusQuickActions: {
                start: 'Start',
                waitingClient: 'Waiting client',
                blocked: 'Blocked',
                inReview: 'In review',
                complete: 'Complete',
            },
            noPeople: 'No people assigned.',
            noChecklist: 'No checklist items yet.',
            filesAfterReload: 'Files appear after page reload.',
            internalNote: 'Internal note',
            commentPlaceholder: 'Write a comment or @mention someone',
            notePlaceholder: 'Internal note (team only)',
            activityTimeline: 'Full activity timeline available with backend integration.',
            filesEmpty: 'No files uploaded yet.',
            blockedReason: 'Blocked reason',
            linkedRecords: 'Linked records',
        },
        create: {
            title: 'Create task',
            subtitle: 'Fill in the details below to create a new task.',
            sections: {
                main: 'Main',
                people: 'People',
                dates: 'Dates',
                more: 'More',
            },
            cancel: 'Cancel',
            create: 'Create task',
        },
        toast: {
            created: 'Task created.',
            updated: 'Task updated.',
            statusUpdated: 'Status updated.',
            statusFailed: 'Status update failed.',
            commentAdded: 'Comment added.',
            commentFailed: 'Comment could not be added.',
            attachmentUploaded: 'Attachment uploaded.',
            attachmentFailed: 'Attachment upload failed.',
            checklistAdded: 'Checklist item added.',
            checklistFailed: 'Checklist item could not be added.',
            checklistUpdated: 'Checklist updated.',
        },
    },

    table: {
        rowsPerPage: 'Rows per page',
        page: 'Page',
        of: 'of',
        selected: 'selected',
        noResults: 'No results found',
    },
} as const;

export type AppLocale = typeof en;












```

## FILE: resources\js\components\layout\AppTopbar.tsx

```tsx
import { router, usePage } from '@inertiajs/react';
import { CalendarDays, LogOut, MessageSquare, Plus } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { NotificationPopover } from '@/features/notifications/components/NotificationPopover';
import { AppGlobalSearch } from '@/components/layout/AppGlobalSearch';
import { ThemeToggle } from '@/components/layout/ThemeToggle';

function UnreadBadge({ count }: { count: number }) {
    if (count <= 0) return null;
    return (
        <span className="absolute -right-1 -top-1 flex min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold leading-none text-white">
            {count > 99 ? '99+' : count}
        </span>
    );
}

const POLL_INTERVAL = 30000;

export function AppTopbar() {
    const { auth } = usePage().props as { auth: { user?: { unread_notifications?: number; unread_messages?: number } } };
    const unreadChats = auth?.user?.unread_messages ?? 0;
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        intervalRef.current = setInterval(() => {
            router.reload({ only: ['auth'], preserveScroll: true, preserveState: true });
        }, POLL_INTERVAL);
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, []);

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

                    <button
                        type="button"
                        onClick={() => router.visit('/inbox')}
                        className="crm-action-button relative hidden h-9 w-9 px-0 sm:inline-flex"
                        title="Messages"
                    >
                        <MessageSquare size={15} />
                        <UnreadBadge count={unreadChats} />
                    </button>

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

## FILE: resources\js\components\ui\AppDatePicker.tsx

```tsx
import {
    Input,
    Label,
    Text,
    TextField,
    type TextFieldProps,
} from 'react-aria-components';
import { cn } from '@/lib/cn';

type AppDatePickerProps = Omit<TextFieldProps, 'children'> & {
    label: string;
    description?: string;
    error?: string;
    placeholder?: string;
};

export function AppDatePicker({
    label,
    description,
    error,
    placeholder,
    className,
    ...props
}: AppDatePickerProps) {
    return (
        <TextField
            {...props}
            className={cn('group grid gap-1.5', className ?? '')}
            isInvalid={Boolean(error) || props.isInvalid}
        >
            <Label className="text-sm font-medium text-[var(--text)]">
                {label}
            </Label>

            <Input
                type="date"
                placeholder={placeholder}
                className={cn(
                    'h-10 w-full rounded-2xl border bg-[var(--surface)] px-3 text-sm outline-none transition',
                    'placeholder:text-[var(--text-muted)]',
                    'focus:border-[var(--accent)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--accent)_14%,transparent)]',
                    'group-data-[invalid]:border-[var(--danger)] group-data-[invalid]:ring-4 group-data-[invalid]:ring-[color-mix(in_srgb,var(--danger)_12%,transparent)]'
                )}
            />

            {description && !error ? (
                <Text slot="description" className="text-xs text-[var(--text-muted)]">
                    {description}
                </Text>
            ) : null}

            {error ? (
                <Text slot="errorMessage" className="text-xs font-medium text-[var(--danger)]">
                    {error}
                </Text>
            ) : null}
        </TextField>
    );
}

```

## FILE: resources\js\components\ui\AppFormErrorSummary.tsx

```tsx
import { TriangleAlert } from 'lucide-react';
import type { FormErrors } from '@/lib/formErrors';
import { hasErrors } from '@/lib/formErrors';

type AppFormErrorSummaryProps = {
    errors?: FormErrors;
};

export function AppFormErrorSummary({ errors }: AppFormErrorSummaryProps) {
    if (!hasErrors(errors)) {
        return null;
    }

    const entries = Object.entries(errors ?? {});

    return (
        <div className="rounded-2xl border border-[color-mix(in_srgb,var(--danger)_35%,transparent)] bg-[color-mix(in_srgb,var(--danger)_8%,transparent)] p-4">
            <div className="flex items-start gap-3">
                <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--danger)_12%,transparent)] text-[var(--danger)]">
                    <TriangleAlert size={16} />
                </div>

                <div className="min-w-0">
                    <p className="text-sm font-semibold text-[var(--danger)]">
                        Please check the form
                    </p>

                    <ul className="mt-2 space-y-1 text-sm text-[var(--text-muted)]">
                        {entries.slice(0, 8).map(([field, message]) => (
                            <li key={field}>
                                <span className="font-medium">
                                    {field.replaceAll('_', ' ')}:
                                </span>{' '}
                                {message}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
```

## FILE: resources\js\components\ui\AppMoneyInput.tsx

```tsx
import {
    Input,
    Label,
    Text,
    TextField,
    type TextFieldProps,
} from 'react-aria-components';
import { cn } from '@/lib/cn';

type AppMoneyInputProps = Omit<TextFieldProps, 'children'> & {
    label: string;
    description?: string;
    error?: string;
    currency?: string;
    placeholder?: string;
};

export function AppMoneyInput({
    label,
    description,
    error,
    currency = 'MAD',
    placeholder,
    className,
    ...props
}: AppMoneyInputProps) {
    return (
        <TextField
            {...props}
            className={cn('group grid gap-1.5', className ?? '')}
            isInvalid={Boolean(error) || props.isInvalid}
        >
            <Label className="text-sm font-medium text-[var(--text)]">
                {label}
            </Label>

            <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--text-muted)]">
                    {currency}
                </span>

                <Input
                    type="number"
                    step="0.01"
                    placeholder={placeholder}
                    className={cn(
                        'h-10 w-full rounded-2xl border bg-[var(--surface)] px-3 pl-14 text-sm outline-none transition',
                        'placeholder:text-[var(--text-muted)]',
                        'focus:border-[var(--accent)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--accent)_14%,transparent)]',
                        'group-data-[invalid]:border-[var(--danger)] group-data-[invalid]:ring-4 group-data-[invalid]:ring-[color-mix(in_srgb,var(--danger)_12%,transparent)]'
                    )}
                />
            </div>

            {description && !error ? (
                <Text slot="description" className="text-xs text-[var(--text-muted)]">
                    {description}
                </Text>
            ) : null}

            {error ? (
                <Text slot="errorMessage" className="text-xs font-medium text-[var(--danger)]">
                    {error}
                </Text>
            ) : null}
        </TextField>
    );
}

```

## FILE: resources\js\components\ui\AppTextarea.tsx

```tsx
import {
    Label,
    Text,
    TextArea,
    TextField,
    type TextFieldProps,
} from 'react-aria-components';

type AppTextareaProps = Omit<TextFieldProps, 'children'> & {
    label: string;
    description?: string;
    error?: string;
    placeholder?: string;
    rows?: number;
};

export function AppTextarea({
    label,
    description,
    error,
    placeholder,
    rows = 4,
    className,
    ...props
}: AppTextareaProps) {
    return (
        <TextField
            {...props}
            className={[
                'group grid gap-1.5',
                className ?? '',
            ].join(' ')}
            isInvalid={Boolean(error) || props.isInvalid}
        >
            <Label className="text-sm font-medium text-[var(--text)]">
                {label}
            </Label>

            <TextArea
                rows={rows}
                placeholder={placeholder}
                className={[
                    'min-h-28 w-full resize-y rounded-2xl border bg-[var(--surface)] px-3 py-2 text-sm outline-none transition',
                    'placeholder:text-[var(--text-muted)]',
                    'focus:border-[var(--accent)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--accent)_14%,transparent)]',
                    'group-data-[invalid]:border-[var(--danger)] group-data-[invalid]:ring-4 group-data-[invalid]:ring-[color-mix(in_srgb,var(--danger)_12%,transparent)]',
                ].join(' ')}
            />

            {description && !error ? (
                <Text slot="description" className="text-xs text-[var(--text-muted)]">
                    {description}
                </Text>
            ) : null}

            {error ? (
                <Text slot="errorMessage" className="text-xs font-medium text-[var(--danger)]">
                    {error}
                </Text>
            ) : null}
        </TextField>
    );
}
```

## FILE: resources\js\components\ui\AppTextField.tsx

```tsx
import type { ReactNode } from 'react';
import {
    Input,
    Label,
    Text,
    TextField,
    type TextFieldProps,
} from 'react-aria-components';

type AppTextFieldProps = Omit<TextFieldProps, 'children'> & {
    label: string;
    description?: string;
    error?: string;
    icon?: ReactNode;
    placeholder?: string;
};

export function AppTextField({
    label,
    description,
    error,
    icon,
    placeholder,
    className,
    ...props
}: AppTextFieldProps) {
    return (
        <TextField
            {...props}
            className={[
                'group grid gap-1.5',
                className ?? '',
            ].join(' ')}
            isInvalid={Boolean(error) || props.isInvalid}
        >
            <Label className="text-sm font-medium text-[var(--text)]">
                {label}
            </Label>

            <div className="relative">
                {icon ? (
                    <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                        {icon}
                    </div>
                ) : null}

                <Input
                    placeholder={placeholder}
                    className={[
                        'h-10 w-full rounded-2xl border bg-[var(--surface)] px-3 text-sm outline-none transition',
                        'placeholder:text-[var(--text-muted)]',
                        'focus:border-[var(--accent)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--accent)_14%,transparent)]',
                        'group-data-[invalid]:border-[var(--danger)] group-data-[invalid]:ring-4 group-data-[invalid]:ring-[color-mix(in_srgb,var(--danger)_12%,transparent)]',
                        icon ? 'pl-9' : '',
                    ].join(' ')}
                />
            </div>

            {description && !error ? (
                <Text slot="description" className="text-xs text-[var(--text-muted)]">
                    {description}
                </Text>
            ) : null}

            {error ? (
                <Text slot="errorMessage" className="text-xs font-medium text-[var(--danger)]">
                    {error}
                </Text>
            ) : null}
        </TextField>
    );
}
```

## FILE: resources\js\features\calendar\types.ts

```ts
export type CalendarEventType =
    | 'task' | 'note' | 'reminder' | 'meeting' | 'deadline'
    | 'client_follow_up' | 'finance_follow_up' | 'authorization_follow_up'
    | 'contract_follow_up' | 'archive_follow_up';

export type CalendarEventStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'overdue';
export type CalendarEventPriority = 'low' | 'medium' | 'high' | 'urgent';
export type CalendarVisibility = 'private' | 'assigned_users' | 'team' | 'admins';
export type ParticipantRole = 'owner' | 'assignee' | 'watcher' | 'guest';
export type ResponseStatus = 'pending' | 'accepted' | 'declined' | 'tentative';
export type ReminderStatus = 'pending' | 'sent' | 'dismissed' | 'snoozed' | 'failed';

export type CalendarUser = {
    id: number;
    name: string;
    email: string;
};

export type CalendarParticipant = {
    id: number;
    calendarEventId: number;
    user: CalendarUser | null;
    userId: number;
    role: ParticipantRole;
    responseStatus: ResponseStatus;
    lastReadAt: string | null;
};

export type CalendarReminder = {
    id: number;
    calendarEventId: number;
    userId: number | null;
    offsetMinutes: number | null;
    remindAt: string | null;
    channel: string;
    status: ReminderStatus;
    snoozedUntil: string | null;
    sentAt: string | null;
    createdAt: string | null;
};

export type CalendarActivity = {
    id: number;
    calendarEventId: number;
    userId: number | null;
    event: string;
    oldValue: unknown;
    newValue: unknown;
    metadata: unknown;
    createdAt: string | null;
};

export type CalendarEventRow = {
    id: number;
    eventNumber: string;
    type: CalendarEventType;
    title: string;
    description: string | null;
    status: CalendarEventStatus;
    priority: CalendarEventPriority;
    color: string | null;
    startsAt: string;
    endsAt: string | null;
    allDay: boolean;
    timezone: string;
    visibility: CalendarVisibility;
    createdBy: CalendarUser | null;
    owner: CalendarUser | null;
    task: unknown | null;
    taskId: number | null;
    clientId: number | null;
    dossierId: number | null;
    dossierDocumentId: number | null;
    financeDocumentId: number | null;
    contractId: number | null;
    authorizationId: number | null;
    archiveRecordId: number | null;
    participants: CalendarParticipant[];
    reminders: CalendarReminder[];
    activityLogs: CalendarActivity[];
    createdAt: string | null;
    updatedAt: string | null;
};

export type CalendarFormData = {
    type: CalendarEventType;
    title: string;
    description: string;
    status: CalendarEventStatus;
    priority: CalendarEventPriority;
    color: string;
    startsAt: string;
    endsAt: string;
    allDay: boolean;
    timezone: string;
    visibility: CalendarVisibility;
    ownerId: number | null;
    clientId: number | null;
    dossierId: number | null;
    dossierDocumentId: number | null;
    financeDocumentId: number | null;
    contractId: number | null;
    authorizationId: number | null;
    archiveRecordId: number | null;
    participantIds: number[];
    reminderOffset: number | null;
};

export const EVENT_TYPE_LABELS: Record<CalendarEventType, string> = {
    task: 'Task',
    note: 'Note',
    reminder: 'Reminder',
    meeting: 'Meeting',
    deadline: 'Deadline',
    client_follow_up: 'Client follow-up',
    finance_follow_up: 'Finance follow-up',
    authorization_follow_up: 'Authorization follow-up',
    contract_follow_up: 'Contract follow-up',
    archive_follow_up: 'Archive follow-up',
};

export const EVENT_STATUS_LABELS: Record<CalendarEventStatus, string> = {
    scheduled: 'Scheduled',
    in_progress: 'In progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
    overdue: 'Overdue',
};

export const EVENT_PRIORITY_LABELS: Record<CalendarEventPriority, string> = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    urgent: 'Urgent',
};

export const EVENT_TYPE_COLORS: Record<CalendarEventType, string> = {
    task: '#f5b342',
    note: '#3b82f6',
    reminder: '#a855f7',
    meeting: '#06b6d4',
    deadline: '#ef4444',
    client_follow_up: '#22c55e',
    finance_follow_up: '#10b981',
    authorization_follow_up: '#f59e0b',
    contract_follow_up: '#8b5cf6',
    archive_follow_up: '#6b7280',
};

export const EVENT_TYPE_CLASSES: Record<CalendarEventType, string> = {
    task: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    note: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    reminder: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    meeting: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    deadline: 'bg-red-500/20 text-red-300 border-red-500/30',
    client_follow_up: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    finance_follow_up: 'bg-green-500/20 text-green-300 border-green-500/30',
    authorization_follow_up: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    contract_follow_up: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
    archive_follow_up: 'bg-zinc-500/20 text-zinc-300 border-zinc-500/30',
};

export const VISIBILITY_LABELS: Record<CalendarVisibility, string> = {
    private: 'Private',
    assigned_users: 'Assigned users',
    team: 'Team',
    admins: 'Admins',
};

```

## FILE: resources\js\features\chat\types.ts

```ts
export type ConversationRow = {
    id: number;
    type: 'direct' | 'group';
    subject: string | null;
    participants: { id: number; user: { id: number; name: string }; lastReadAt: string | null }[];
    lastMessage: { id: number; body: string; createdAt: string; user: { id: number; name: string } } | null;
    lastMessageAt: string | null;
    unreadCount: number;
    createdAt: string;
};

export type MessageRow = {
    id: number;
    body: string;
    isEdited: boolean;
    userId: number;
    userName: string;
    readBy: number[];
    createdAt: string;
};

export type ChatUserOption = {
    id: number;
    name: string;
    email: string;
};

```

## FILE: resources\js\features\clients\components\DocumentIntelligenceChecklist.tsx

```tsx
import { AlertTriangle, CheckCircle2, Circle, Clock, FileText, ShieldAlert, UploadCloud } from 'lucide-react';
import { useMemo } from 'react';
import type { ClientProjectDocument, DossierWorkflowProgress } from '@/features/clients/types';

type ChecklistRequirement = {
    key: string;
    stepKey: string;
    stepLabel: string;
    label: string;
    done: boolean;
    manual: boolean;
    notes: string | null;
    checkedAt: string | null;
    checkedBy: string | null;
    actionLabel: string | null;
    matchedDocument: ClientProjectDocument | null;
    isExpired: boolean;
    isExpiringSoon: boolean;
};

const EXPIRY_THRESHOLD_DAYS = 30;
const EXPIRABLE_DOCS = ['cin', 'cni', 'certificat_propriete', 'recent_certificat_propriete'];

function checkExpiry(document: ClientProjectDocument | null, key: string): { isExpired: boolean; isExpiringSoon: boolean } {
    if (!document || !EXPIRABLE_DOCS.includes(key)) {
        return { isExpired: false, isExpiringSoon: false };
    }

    const dateStr = document.uploadedAt;
    if (!dateStr) {
        return { isExpired: false, isExpiringSoon: false };
    }

    const date = new Date(dateStr);
    const now = new Date();
    const monthsDiff = (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth());

    if (key === 'cin' || key === 'cni') {
        return { isExpired: monthsDiff > 120, isExpiringSoon: monthsDiff > 108 };
    }

    if (key === 'certificat_propriete' || key === 'recent_certificat_propriete') {
        return { isExpired: monthsDiff > 12, isExpiringSoon: monthsDiff > 11 };
    }

    return { isExpired: false, isExpiringSoon: false };
}

function findMatchedDocument(documents: ClientProjectDocument[], requirementKey: string, stepKey: string): ClientProjectDocument | null {
    const haystack = `${requirementKey} ${stepKey}`.toLowerCase();

    return documents.find((doc) => {
        const searchText = `${doc.name} ${doc.originalFilename ?? ''} ${doc.documentNumber ?? ''} ${doc.status ?? ''}`.toLowerCase();

        if (haystack.includes('cin') || haystack.includes('cni')) {
            return searchText.includes('cin') || searchText.includes('cni') || searchText.includes('carte nationale');
        }

        if (haystack.includes('certificat')) {
            return searchText.includes('certificat');
        }

        if (haystack.includes('terrain') || haystack.includes('cadastral') || haystack.includes('parcellaire')) {
            return searchText.includes('cadastral') || searchText.includes('parcellaire') || searchText.includes('contenance');
        }

        if (haystack.includes('energetique')) {
            return searchText.includes('energetique') || searchText.includes('efficacite');
        }

        if (haystack.includes('ingenieur')) {
            return searchText.includes('ingenieur') || searchText.includes('cahier');
        }

        if (haystack.includes('cahier') || haystack.includes('chantier')) {
            return searchText.includes('cahier');
        }

        if (haystack.includes('plan') || haystack.includes('beton')) {
            return searchText.includes('beton') || searchText.includes('plan ba');
        }

        if (haystack.includes('implantation') || haystack.includes('topographie')) {
            return searchText.includes('topographie') || searchText.includes('implantation');
        }

        if (haystack.includes('laboratoire') || haystack.includes('controle')) {
            return searchText.includes('laboratoire') || searchText.includes('controle');
        }

        if (haystack.includes('permis')) {
            return searchText.includes('permis');
        }

        if (haystack.includes('site') || haystack.includes('image') || haystack.includes('photo')) {
            return searchText.includes('photo') || searchText.includes('image');
        }

        return searchText.includes(haystack.split('_')[0]);
    }) ?? null;
}

export function DocumentIntelligenceChecklist({
    workflow,
    documents,
    onUploadDocument,
}: {
    workflow: DossierWorkflowProgress | null;
    documents: ClientProjectDocument[];
    onUploadDocument: () => void;
}) {
    const requirements = useMemo<ChecklistRequirement[]>(() => {
        if (!workflow) {
            return [];
        }

        const results: ChecklistRequirement[] = [];

        for (const step of workflow.steps) {
            for (const req of step.requirements) {
                const matched = findMatchedDocument(documents, req.key, step.key);
                const { isExpired, isExpiringSoon } = checkExpiry(matched, req.key);

                results.push({
                    key: req.key,
                    stepKey: step.key,
                    stepLabel: step.label,
                    label: req.label,
                    done: req.done,
                    manual: req.manual,
                    notes: req.notes,
                    checkedAt: req.checkedAt,
                    checkedBy: req.checkedBy,
                    actionLabel: req.actionLabel,
                    matchedDocument: matched,
                    isExpired,
                    isExpiringSoon,
                });
            }
        }

        return results;
    }, [workflow, documents]);

    const totals = useMemo(() => {
        const total = requirements.length;
        const done = requirements.filter((r) => r.done).length;
        const expired = requirements.filter((r) => r.isExpired).length;
        const expiring = requirements.filter((r) => r.isExpiringSoon).length;

        return { total, done, expired, expiring, percent: total > 0 ? Math.round((done / total) * 100) : 0 };
    }, [requirements]);

    if (requirements.length === 0) {
        return null;
    }

    const grouped = requirements.reduce<Record<string, ChecklistRequirement[]>>((acc, req) => {
        if (!acc[req.stepLabel]) {
            acc[req.stepLabel] = [];
        }
        acc[req.stepLabel].push(req);

        return acc;
    }, {});

    return (
        <div className="rounded-xl border border-[var(--crm-border)] bg-[var(--crm-elevated)] p-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <FileText size={15} className="text-[var(--crm-accent)]" />
                        <h3 className="text-sm font-black uppercase tracking-[0.14em] text-[var(--crm-muted)]">Document checklist</h3>
                    </div>
                    <p className="mt-2 text-xs text-[var(--crm-muted)]">
                        {totals.done}/{totals.total} requirements met
                        {totals.expired > 0 ? ` / ${totals.expired} expired` : ''}
                        {totals.expiring > 0 ? ` / ${totals.expiring} expiring soon` : ''}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {totals.expired > 0 ? (
                        <span className="flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-1 text-[11px] font-bold text-red-300">
                            <AlertTriangle size={12} />
                            {totals.expired} expired
                        </span>
                    ) : null}
                    <button type="button" className="crm-action-button border-[var(--crm-accent)] bg-[color-mix(in_srgb,var(--crm-accent)_14%,transparent)] text-[var(--crm-accent)]" onClick={onUploadDocument}>
                        <UploadCloud size={13} />
                        Upload missing
                    </button>
                </div>
            </div>

            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-black/20">
                <div
                    className="h-full rounded-full bg-[var(--crm-accent)]"
                    style={{ width: `${totals.percent}%` }}
                />
            </div>

            <div className="mt-4 grid gap-3">
                {Object.entries(grouped).map(([stepLabel, reqs]) => (
                    <div key={stepLabel}>
                        <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--crm-muted)]">{stepLabel}</p>
                        <div className="grid gap-2">
                            {reqs.map((req) => (
                                <div key={req.key} className="flex flex-wrap items-center gap-3 rounded-lg border border-[var(--crm-border)] bg-black/10 px-3 py-2 md:flex-nowrap md:justify-between">
                                    <div className="flex min-w-0 items-center gap-2">
                                        {req.isExpired ? (
                                            <ShieldAlert size={14} className="shrink-0 text-red-400" />
                                        ) : req.done ? (
                                            <CheckCircle2 size={14} className="shrink-0 text-emerald-400" />
                                        ) : (
                                            <Circle size={14} className="shrink-0 text-[var(--crm-muted)]" />
                                        )}
                                        <span className="truncate text-xs font-bold text-[var(--crm-text)]">{req.label}</span>
                                        {req.isExpired ? (
                                            <span className="shrink-0 rounded-full bg-red-500/10 px-1.5 py-0.5 text-[10px] font-bold text-red-300">Expired</span>
                                        ) : req.isExpiringSoon ? (
                                            <span className="shrink-0 rounded-full bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-bold text-amber-300">
                                                <Clock size={10} className="inline" /> Soon
                                            </span>
                                        ) : null}
                                    </div>
                                    <div className="flex shrink-0 items-center gap-2 text-[11px]">
                                        {req.notes ? (
                                            <span className="text-[var(--crm-muted)]">{req.notes}</span>
                                        ) : null}
                                        <span className={req.done ? 'text-emerald-400' : 'text-[var(--crm-muted)]'}>
                                            {req.done ? 'Done' : 'Missing'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

```

## FILE: resources\js\features\dashboard\types.ts

```ts
export type DashboardTone = 'gold' | 'green' | 'red' | 'blue' | 'violet' | 'neutral';

export type DashboardIconKey =
    | 'projects'
    | 'documents'
    | 'authorizations'
    | 'invoices'
    | 'payments'
    | 'upload'
    | 'clients'
    | 'clock'
    | 'check'
    | 'tasks'
    | 'chat';

export type DashboardHero = {
    eyebrow: string;
    title: string;
    subtitle: string;
};

export type DashboardKpi = {
    key: string;
    label: string;
    value: string;
    helper: string;
    tone: DashboardTone;
    icon: DashboardIconKey;
    href: string;
};

export type DashboardAction = {
    id: string;
    title: string;
    subtitle: string;
    due: string;
    tone: DashboardTone;
    icon: DashboardIconKey;
    href: string;
};

export type DashboardProject = {
    id: string;
    dossierNumber: string;
    project: string;
    client: string;
    location: string;
    step: string;
    status: string;
    missingDocs: number;
    remaining: string;
    href: string;
};

export type DashboardAlert = {
    id: string;
    title: string;
    amount: string;
    subtitle: string;
    tone: DashboardTone;
    href: string;
};

export type DashboardActivity = {
    id: string;
    title: string;
    description: string;
    time: string;
    tone: DashboardTone;
    icon: DashboardIconKey;
};

export type DashboardQuickLink = {
    label: string;
    href: string;
    icon: DashboardIconKey;
};

export type DashboardSystemHealth = {
    label: string;
    value: string;
    icon: DashboardIconKey;
    tone: DashboardTone;
};

export type DashboardBlockedDossier = {
    id: string;
    dossierNumber: string;
    project: string;
    client: string;
    step: string;
    stepKey: string;
    daysStuck: number;
    missingDocs: number;
    href: string;
};

export type DashboardWorkflowStepCount = {
    key: string;
    label: string;
    count: number;
};

export type DashboardUrgentTask = {
    id: number;
    title: string;
    taskNumber: string;
    status: string;
    priority: string;
    dueDate: string | null;
    isOverdue: boolean;
};

export type DashboardRecentMessage = {
    id: number;
    conversationId: number;
    sender: string;
    body: string;
    createdAt: string;
    unread: boolean;
};

export type DashboardCommandCenter = {
    hero: DashboardHero;
    kpis: DashboardKpi[];
    nextActions: DashboardAction[];
    blockedDossiers: DashboardBlockedDossier[];
    workflowDistribution: DashboardWorkflowStepCount[];
    recentProjects: DashboardProject[];
    financeAlerts: DashboardAlert[];
    activityFeed: DashboardActivity[];
    urgentTaskList: DashboardUrgentTask[];
    recentMessageList: DashboardRecentMessage[];
    quickLinks: DashboardQuickLink[];
    systemHealth: DashboardSystemHealth[];
};
```

## FILE: resources\js\features\documents\components\DocumentUploadCard.tsx

```tsx
import { ReactNode } from 'react';
import { FileTrigger } from 'react-aria-components';
import { Upload } from 'lucide-react';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';

type DocumentUploadCardProps = {
    title: string;
    description: string;
    acceptedText: string;
    chooseLabel: string;
    icon?: ReactNode;
    onSelect: (fileName: string) => void;
};

export function DocumentUploadCard({
    title,
    description,
    acceptedText,
    chooseLabel,
    icon,
    onSelect,
}: DocumentUploadCardProps) {
    return (
        <AppCard className="p-4">
            <div className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] text-[var(--accent)]">
                    {icon ?? <Upload size={18} />}
                </div>

                <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{title}</p>
                    <p className="mt-1 text-sm leading-5 text-[var(--text-muted)]">
                        {description}
                    </p>
                    <p className="mt-2 text-xs text-[var(--text-subtle)]">
                        {acceptedText}
                    </p>

                    <div className="mt-4">
                        <FileTrigger
                            acceptedFileTypes={[
                                'application/pdf',
                                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                                'image/jpeg',
                                'image/png',
                            ]}
                            onSelect={(files) => {
                                const file = files?.item(0);
                                if (file) {
                                    onSelect(file.name);
                                }
                            }}
                        >
                            <AppButton size="sm" variant="primary">
                                <Upload size={15} />
                                {chooseLabel}
                            </AppButton>
                        </FileTrigger>
                    </div>
                </div>
            </div>
        </AppCard>
    );
}

```

## FILE: resources\js\features\documents\drawers\DocumentUploadDrawer.tsx

```tsx
import { FormEvent, useEffect, useState } from 'react';
import type { Key } from 'react-aria-components';
import { UploadCloud } from 'lucide-react';
import { AppButton } from '@/components/ui/AppButton';
import { AppDrawer } from '@/components/ui/AppDrawer';
import { AppFormErrorSummary } from '@/components/ui/AppFormErrorSummary';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppTextarea } from '@/components/ui/AppTextarea';
import type {
    DocumentTemplateOption,
    DocumentUploadPayload,
    DossierOption,
} from '@/features/documents/types';
import type { FormErrors } from '@/lib/formErrors';
import { firstError } from '@/lib/formErrors';

type DocumentUploadDrawerProps = {
    isOpen: boolean;
    dossiers: DossierOption[];
    templates: DocumentTemplateOption[];
    initialDossierId?: string;
    initialTemplateId?: string;
    onOpenChange: (isOpen: boolean) => void;
    onSubmit: (payload: DocumentUploadPayload) => void;
    errors?: FormErrors;
};

const emptyForm: DocumentUploadPayload = {
    dossierId: '',
    documentTemplateId: '',
    status: 'uploaded',
    notes: '',
    file: null,
};

const statusOptions = [
    { id: 'uploaded', label: 'Uploaded' },
    { id: 'verified', label: 'Verified' },
    { id: 'missing', label: 'Missing' },
    { id: 'rejected', label: 'Rejected' },
];

export function DocumentUploadDrawer({
    isOpen,
    dossiers,
    templates,
    initialDossierId = '',
    initialTemplateId = '',
    onOpenChange,
    onSubmit,
    errors = {},
}: DocumentUploadDrawerProps) {
    const [form, setForm] = useState<DocumentUploadPayload>(emptyForm);
    const [fileName, setFileName] = useState('');

    useEffect(() => {
        if (isOpen) {
            setForm({
                ...emptyForm,
                dossierId: initialDossierId,
                documentTemplateId: initialTemplateId,
            });
            setFileName('');
        }
    }, [initialDossierId, initialTemplateId, isOpen]);

    function updateField(field: keyof DocumentUploadPayload, value: string) {
        setForm((current) => ({ ...current, [field]: value }));
    }

    function updateSelect(field: keyof DocumentUploadPayload, value: Key | null) {
        setForm((current) => ({
            ...current,
            [field]: value ? String(value) : '',
        }));
    }

    function handleFileChange(fileList: FileList | null) {
        const file = fileList?.[0] ?? null;

        setForm((current) => ({
            ...current,
            file,
        }));

        setFileName(file?.name ?? '');
    }

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        onSubmit(form);
    }

    return (
        <AppDrawer
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            title="Upload document"
            description="Attach a document to a project/dossier."
            footer={
                <>
                    <AppButton variant="secondary" onPress={() => onOpenChange(false)}>
                        Cancel
                    </AppButton>

                    <AppButton variant="primary" type="submit" form="document-upload-form">
                        Save document
                    </AppButton>
                </>
            }
        >
            <form id="document-upload-form" className="space-y-6" onSubmit={handleSubmit}>
                <AppFormErrorSummary errors={errors} />

                <section>
                    <h3 className="mb-3 text-sm font-semibold">Document information</h3>

                    <div className="grid gap-4">
                        <AppSelect
                            label="Dossier / Project"
                            placeholder="Select dossier"
                            selectedKey={form.dossierId}
                            onSelectionChange={(value) => updateSelect('dossierId', value)}
                            options={dossiers}
                            error={firstError(errors, 'dossier_id')}
                        />

                        <AppSelect
                            label="Document template"
                            placeholder="Select document type"
                            selectedKey={form.documentTemplateId}
                            onSelectionChange={(value) => updateSelect('documentTemplateId', value)}
                            options={templates}
                            error={firstError(errors, 'document_template_id')}
                        />

                        <AppSelect
                            label="Status"
                            selectedKey={form.status}
                            onSelectionChange={(value) => updateSelect('status', value)}
                            options={statusOptions}
                            error={firstError(errors, 'status')}
                        />
                    </div>
                </section>

                <section>
                    <h3 className="mb-3 text-sm font-semibold">File</h3>

                    <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed bg-[var(--surface)] p-6 text-center transition hover:border-[var(--accent)] hover:bg-[var(--surface-2)]">
                        <UploadCloud size={26} className="text-[var(--accent)]" />

                        <span className="mt-3 text-sm font-semibold">
                            {fileName || 'Choose file'}
                        </span>

                        <span className="mt-1 text-xs text-[var(--text-muted)]">
                            PDF, image, DOCX, or office file. Max 20 MB.
                        </span>

                        <input
                            type="file"
                            className="hidden"
                            onChange={(event) => handleFileChange(event.target.files)}
                        />
                    </label>

                    {firstError(errors, 'file') ? (
                        <p className="mt-2 text-xs font-medium text-[var(--danger)]">
                            {firstError(errors, 'file')}
                        </p>
                    ) : null}
                </section>

                <section>
                    <AppTextarea
                        label="Notes"
                        value={form.notes}
                        onChange={(value) => updateField('notes', value)}
                        error={firstError(errors, 'notes')}
                    />
                </section>
            </form>
        </AppDrawer>
    );
}

```

## FILE: resources\js\features\finance\components\FinanceDocumentLockNotice.tsx

```tsx
import type { ReactNode } from 'react';
import type { FinanceDocument } from '../types';

export type FinanceDocumentLockStateLike = {
    isLocked?: boolean;
    lockedAt?: string | null;
    lockedAtFormatted?: string | null;
    message?: string;
    blockedFields?: string[];
    canEditNumberFields?: boolean;
    canRegenerateExports?: boolean;
    canGeneratePdf?: boolean;
    canGenerateExcel?: boolean;
};

export type LockableFinanceDocument = Partial<FinanceDocument> & {
    numberLocked?: boolean;
    numberLockedAt?: string | null;
    lock?: FinanceDocumentLockStateLike | null;
};

type NoticeProps = {
    document?: LockableFinanceDocument | null;
    isLocked?: boolean;
    lockedAt?: string | null;
    lockedAtFormatted?: string | null;
    message?: ReactNode;
    compact?: boolean;
    className?: string;
};

export function isFinanceDocumentLocked(document?: LockableFinanceDocument | null): boolean {
    return Boolean(document?.lock?.isLocked ?? document?.numberLocked);
}

export function canEditFinanceDocumentNumberFields(document?: LockableFinanceDocument | null): boolean {
    return document?.lock?.canEditNumberFields ?? !isFinanceDocumentLocked(document);
}

export function getFinanceDocumentLockedAt(document?: LockableFinanceDocument | null): string | null {
    return document?.lock?.lockedAtFormatted ?? document?.numberLockedAt ?? document?.lock?.lockedAt ?? null;
}

export function getFinanceDocumentLockMessage(document?: LockableFinanceDocument | null): string {
    return document?.lock?.message ?? 'Document locked after export. Number, type, and issue date cannot be changed.';
}

export function FinanceDocumentLockBadge({ document }: { document?: LockableFinanceDocument | null }) {
    if (!isFinanceDocumentLocked(document)) {
        return null;
    }

    const lockedAt = getFinanceDocumentLockedAt(document);

    return (
        <span
            className="inline-flex items-center rounded-full border border-amber-400/40 bg-amber-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-300"
            title={lockedAt ? `Locked at ${lockedAt}` : 'Locked after export'}
        >
            Locked
        </span>
    );
}

export function FinanceDocumentLockNotice({
    document,
    isLocked,
    lockedAt,
    lockedAtFormatted,
    message,
    compact = false,
    className = '',
}: NoticeProps) {
    const locked = isLocked ?? isFinanceDocumentLocked(document);

    if (!locked) {
        return null;
    }

    const displayLockedAt = lockedAtFormatted ?? lockedAt ?? getFinanceDocumentLockedAt(document);
    const displayMessage = message ?? getFinanceDocumentLockMessage(document);

    if (compact) {
        return (
            <span className={`inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-200 ${className}`}>
                Locked
                {displayLockedAt ? <span className="font-normal text-amber-100/60">{displayLockedAt}</span> : null}
            </span>
        );
    }

    return (
        <div className={`rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100 ${className}`}>
            <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full border border-amber-400/40 bg-amber-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-300">
                    Locked
                </span>
                {displayLockedAt ? <span className="text-xs text-amber-100/60">Locked at {displayLockedAt}</span> : null}
            </div>
            <p className="mt-2 text-amber-100/80">{displayMessage}</p>
        </div>
    );
}

export default FinanceDocumentLockNotice;
```

## FILE: resources\js\features\finance\components\FinanceDocumentPreview.tsx

```tsx
import type { FinanceDocumentItem, FinanceDocumentType } from '@/features/finance/types';
import { formatMoney } from '@/features/finance/utils/calculations';

type UiLockAwareFinanceDocument = {
    numberLocked?: boolean;
    numberLockedAt?: string | null;
    lock?: {
        isLocked?: boolean;
        lockedAtFormatted?: string | null;
        message?: string;
        canEditNumberFields?: boolean;
        canRegenerateExports?: boolean;
        canGeneratePdf?: boolean;
        canGenerateExcel?: boolean;
    } | null;
};

function isFinanceDocumentLocked(document: UiLockAwareFinanceDocument | null | undefined) {
    return Boolean(document?.lock?.isLocked ?? document?.numberLocked);
}

function canEditFinanceDocumentNumberFields(document: UiLockAwareFinanceDocument | null | undefined) {
    return document?.lock?.canEditNumberFields ?? !isFinanceDocumentLocked(document);
}

function FinanceDocumentLockedInlineBadge({ document }: { document: UiLockAwareFinanceDocument | null | undefined }) {
    if (!isFinanceDocumentLocked(document)) {
        return null;
    }

    const lockedAt = document?.lock?.lockedAtFormatted ?? document?.numberLockedAt ?? null;

    return (
        <span
            className="ml-2 inline-flex items-center rounded-full border border-amber-400/40 bg-amber-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-300"
            title={lockedAt ? `Locked at ${lockedAt}` : 'Locked after export'}
        >
            Locked
        </span>
    );
}

function FinanceDocumentLockInlineNotice({ document }: { document: UiLockAwareFinanceDocument | null | undefined }) {
    if (!isFinanceDocumentLocked(document)) {
        return null;
    }

    const lockedAt = document?.lock?.lockedAtFormatted ?? document?.numberLockedAt ?? null;
    const message = document?.lock?.message ?? 'Document locked after export. Number, type, and issue date cannot be changed.';

    return (
        <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
            <div className="font-semibold text-amber-200">Locked document</div>
            <div className="mt-1 text-amber-100/80">{message}</div>
            {lockedAt ? <div className="mt-1 text-xs text-amber-100/60">Locked at {lockedAt}</div> : null}
        </div>
    );
}


const typeLabels: Record<FinanceDocumentType, string> = {
    quote: 'DEVIS',
    invoice: 'FACTURE',
    receipt: 'RECU',
};

type FinanceDocumentPreviewProps = {
    type: FinanceDocumentType;
    number?: string;
    clientLabel?: string;
    dossierLabel?: string;
    issueDate: string;
    dueDate?: string;
    validUntil?: string;
    currency: string;
    items: FinanceDocumentItem[];
    subtotalHt: number;
    discountTotal: number;
    taxTotal: number;
    totalTtc: number;
    notes?: string;
    terms?: string;
};

export function FinanceDocumentPreview({
    type,
    number,
    clientLabel,
    dossierLabel,
    issueDate,
    dueDate,
    validUntil,
    currency,
    items,
    subtotalHt,
    discountTotal,
    taxTotal,
    totalTtc,
    notes,
    terms,
}: FinanceDocumentPreviewProps) {
    return (
        <div className="finance-builder-preview rounded-2xl border bg-[var(--surface-2)] p-3">
            <div className="mx-auto min-h-[520px] max-w-[440px] rounded-xl bg-white p-5 text-slate-950 shadow-xl sm:min-h-[640px] sm:p-7">
                <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-5">
                    <div>
                        <p className="text-xs font-semibold tracking-[0.22em] text-slate-500">ARCHI LBO</p>
                        <h3 className="mt-2 text-2xl font-bold">{typeLabels[type]}</h3>
                        <p className="mt-1 text-xs text-slate-500">{number || 'Nouveau document'}</p>
                    </div>
                    <div className="text-right text-xs text-slate-500">
                        <p>Date: {issueDate || '-'}</p>
                        {type === 'invoice' ? <p>Echeance: {dueDate || '-'}</p> : null}
                        {type === 'quote' ? <p>Validite: {validUntil || '-'}</p> : null}
                    </div>
                </div>

                <div className="grid gap-3 border-b border-slate-200 py-5 text-sm">
                    <div>
                        <p className="text-xs uppercase text-slate-500">Client</p>
                        <p className="font-semibold">{clientLabel || 'Client non selectionne'}</p>
                    </div>
                    <div>
                        <p className="text-xs uppercase text-slate-500">Dossier</p>
                        <p>{dossierLabel || 'Dossier non selectionne'}</p>
                    </div>
                </div>

                <table className="mt-5 w-full text-xs">
                    <thead>
                        <tr className="border-b border-slate-200 text-left text-slate-500">
                            <th className="py-2">Designation</th>
                            <th className="py-2 text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, index) => (
                            <tr key={`${item.title}-${index}`} className="border-b border-slate-100">
                                <td className="py-2 pr-3">
                                    <p className="font-medium">{item.title || `Ligne ${index + 1}`}</p>
                                    <p className="text-slate-500">{item.quantity} {item.unit || ''} x {formatMoney(item.unitPrice, currency)}</p>
                                </td>
                                <td className="py-2 text-right font-semibold">{formatMoney(item.totalTtc, currency)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="ml-auto mt-5 w-56 space-y-1 text-xs">
                    <PreviewRow label="HT" value={formatMoney(subtotalHt, currency)} />
                    <PreviewRow label="Remise" value={`-${formatMoney(discountTotal, currency)}`} />
                    <PreviewRow label="TVA" value={formatMoney(taxTotal, currency)} />
                    <div className="border-t border-slate-200 pt-2">
                        <PreviewRow label="Total TTC" value={formatMoney(totalTtc, currency)} strong />
                    </div>
                </div>

                {notes ? <p className="mt-6 whitespace-pre-line text-xs text-slate-600">{notes}</p> : null}
                {terms ? <p className="mt-3 whitespace-pre-line text-xs text-slate-500">{terms}</p> : null}
            </div>
        </div>
    );
}

function PreviewRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
    return (
        <div className={`flex justify-between gap-3 ${strong ? 'text-sm font-bold' : ''}`}>
            <span>{label}</span>
            <span>{value}</span>
        </div>
    );
}


```

## FILE: resources\js\features\finance\drawers\FinanceDocumentBuilderDrawer.tsx

```tsx
import { useEffect, useMemo, useState } from 'react';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import { AppButton } from '@/components/ui/AppButton';
import { AppDrawer } from '@/components/ui/AppDrawer';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppTextField } from '@/components/ui/AppTextField';
import { AppTextarea } from '@/components/ui/AppTextarea';
import { FinanceClientDossierFields } from '@/features/finance/components/FinanceClientDossierFields';
import { FinanceDateFields } from '@/features/finance/components/FinanceDateFields';
import { FinanceDocumentLockNotice, getFinanceDocumentLockMessage, isFinanceDocumentLocked } from '@/features/finance/components/FinanceDocumentLockNotice';
import { FinanceDocumentPreview } from '@/features/finance/components/FinanceDocumentPreview';
import { FinanceItemsTable } from '@/features/finance/components/FinanceItemsTable';
import { FinanceTotalsBox } from '@/features/finance/components/FinanceTotalsBox';
import type { ClientOption, DossierOption, FinanceDocument, FinanceDocumentItem, FinanceDocumentType, FinanceSettings, TemplateOption } from '@/features/finance/types';
import { calculateItem, calculateTotals, createEmptyItem, normalizeCurrency, normalizeNumber } from '@/features/finance/utils/calculations';

type UiLockAwareFinanceDocument = {
    numberLocked?: boolean;
    numberLockedAt?: string | null;
    lock?: {
        isLocked?: boolean;
        lockedAtFormatted?: string | null;
        message?: string;
        canEditNumberFields?: boolean;
        canRegenerateExports?: boolean;
        canGeneratePdf?: boolean;
        canGenerateExcel?: boolean;
    } | null;
};

function isFinanceDocumentLocked(document: UiLockAwareFinanceDocument | null | undefined) {
    return Boolean(document?.lock?.isLocked ?? document?.numberLocked);
}

function canEditFinanceDocumentNumberFields(document: UiLockAwareFinanceDocument | null | undefined) {
    return document?.lock?.canEditNumberFields ?? !isFinanceDocumentLocked(document);
}

function FinanceDocumentLockedInlineBadge({ document }: { document: UiLockAwareFinanceDocument | null | undefined }) {
    if (!isFinanceDocumentLocked(document)) {
        return null;
    }

    const lockedAt = document?.lock?.lockedAtFormatted ?? document?.numberLockedAt ?? null;

    return (
        <span
            className="ml-2 inline-flex items-center rounded-full border border-amber-400/40 bg-amber-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-300"
            title={lockedAt ? `Locked at ${lockedAt}` : 'Locked after export'}
        >
            
            <FinanceDocumentLockInlineNotice document={document} />
Locked
        </span>
    );
}

function FinanceDocumentLockInlineNotice({ document }: { document: UiLockAwareFinanceDocument | null | undefined }) {
    if (!isFinanceDocumentLocked(document)) {
        return null;
    }

    const lockedAt = document?.lock?.lockedAtFormatted ?? document?.numberLockedAt ?? null;
    const message = document?.lock?.message ?? 'Document locked after export. Number, type, and issue date cannot be changed.';

    return (
        <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
            <div className="font-semibold text-amber-200">Locked document</div>
            <div className="mt-1 text-amber-100/80">{message}</div>
            {lockedAt ? <div className="mt-1 text-xs text-amber-100/60">Locked at {lockedAt}</div> : null}
        </div>
    );
}


type FinanceDocumentBuilderDrawerProps = {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    mode: 'create' | 'edit';
    type: FinanceDocumentType;
    document?: FinanceDocument | null;
    clients: ClientOption[];
    dossiers: DossierOption[];
    templates: TemplateOption[];
    settings: FinanceSettings;
    onSaved?: (type: FinanceDocumentType) => void;
};

type BuilderForm = {
    type: FinanceDocumentType;
    clientId: string;
    dossierId: string;
    issueDate: string;
    dueDate: string;
    validUntil: string;
    currency: string;
    tvaRate: number;
    discountTotal: number;
    notes: string;
    terms: string;
    templateId: string;
    items: FinanceDocumentItem[];
};

const today = () => new Date().toISOString().slice(0, 10);

function addDays(date: string, days: number): string {
    const value = new Date(`${date}T00:00:00`);
    value.setDate(value.getDate() + days);
    return value.toISOString().slice(0, 10);
}

function createForm(type: FinanceDocumentType, settings: FinanceSettings, document?: FinanceDocument | null): BuilderForm {
    const issueDate = document?.issueDate || today();

    if (document) {
        return {
            type: document.type,
            clientId: document.client ? String(document.client.id) : '',
            dossierId: document.dossier ? String(document.dossier.id) : '',
            issueDate,
            dueDate: document.dueDate || '',
            validUntil: document.validUntil || '',
            currency: normalizeCurrency(document.currency || settings.defaultCurrency),
            tvaRate: normalizeNumber(document.tvaRate || settings.defaultTvaRate),
            discountTotal: normalizeNumber(document.discountTotal),
            notes: document.notes || '',
            terms: document.terms || '',
            templateId: document.templateId ? String(document.templateId) : '',
            items: document.items.length > 0
                ? document.items.map((item, index) => calculateItem({ ...item, position: index + 1 }, document.tvaRate || settings.defaultTvaRate))
                : [createEmptyItem(settings.defaultTvaRate)],
        };
    }

    return {
        type,
        clientId: '',
        dossierId: '',
        issueDate,
        dueDate: type === 'invoice' ? addDays(issueDate, settings.defaultPaymentTermsDays) : '',
        validUntil: type === 'quote' ? addDays(issueDate, settings.defaultQuoteValidityDays) : '',
        currency: normalizeCurrency(settings.defaultCurrency),
        tvaRate: settings.defaultTvaRate,
        discountTotal: 0,
        notes: '',
        terms: '',
        templateId: '',
        items: [createEmptyItem(settings.defaultTvaRate)],
    };
}

export function FinanceDocumentBuilderDrawer({
    isOpen,
    onOpenChange,
    mode,
    type,
    document,
    clients,
    dossiers,
    templates,
    settings,
    onSaved,
}: FinanceDocumentBuilderDrawerProps) {
    const [form, setForm] = useState<BuilderForm>(() => createForm(type, settings, document));
    const isLocked = isFinanceDocumentLocked(document);
    const canEditNumberFields = !isLocked && (document?.lock?.canEditNumberFields ?? true);
    const lockMessage = isLocked ? getFinanceDocumentLockMessage(document) : undefined;

    useEffect(() => {
        if (isOpen) {
            setForm(createForm(type, settings, document));
        }
    }, [document, isOpen, settings, type]);

    const totals = useMemo(
        () => calculateTotals(form.items, form.discountTotal, form.tvaRate),
        [form.discountTotal, form.items, form.tvaRate],
    );

    const selectedClient = clients.find((client) => client.id === form.clientId);
    const selectedDossier = dossiers.find((dossier) => dossier.id === form.dossierId);
    const title = mode === 'edit'
        ? `Modifier ${document?.number || 'document'}`
        : form.type === 'quote'
            ? 'Nouveau devis'
            : form.type === 'invoice'
                ? 'Nouvelle facture'
                : 'Nouveau recu';

    function update<K extends keyof BuilderForm>(key: K, value: BuilderForm[K]) {
        setForm((prev) => ({ ...prev, [key]: value }));
    }

    function submit() {
        const payload: Record<string, unknown> = {
            type: form.type,
            client_id: form.clientId || null,
            dossier_id: form.dossierId || null,
            issue_date: form.issueDate || null,
            due_date: form.dueDate || null,
            valid_until: form.validUntil || null,
            currency: form.currency,
            tva_rate: form.tvaRate,
            discount_total: form.discountTotal,
            notes: form.notes || null,
            terms: form.terms || null,
            template_id: form.templateId || null,
            items: form.items.map((item, index) => ({
                title: item.title || `Ligne ${index + 1}`,
                description: item.description || null,
                quantity: item.quantity || 1,
                unit: item.unit || null,
                unit_price: item.unitPrice || 0,
                discount_rate: item.discountRate || 0,
                tva_rate: item.tvaRate || form.tvaRate,
            })),
        };

        if (mode === 'edit' && isLocked) {
            delete payload.type;
            delete payload.issue_date;
        }

        const options = {
            preserveScroll: true,
            preserveState: false,
            onSuccess: () => {
                toast.success(mode === 'edit' ? 'Document mis a jour.' : 'Document cree.');
                onSaved?.(form.type);
                onOpenChange(false);
            },
            onError: () => toast.error('Impossible enregistrer le document.'),
        };

        if (mode === 'edit' && document) {
            router.put(`/finance/documents/${document.id}`, payload, options);
            return;
        }

        router.post('/finance/documents', payload, options);
    }

    return (
        <AppDrawer
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            title={title}
            description="Construire le document avec calcul HT, TVA, TTC et apercu en direct."
            panelClassName="!w-[min(1200px,calc(100vw-24px))] !max-w-[1200px] sm:!w-[min(1200px,calc(100vw-40px))]"
            footer={
                <>
                    <AppButton variant="ghost" onPress={() => onOpenChange(false)}>Annuler</AppButton>
                    <AppButton variant="primary" onPress={submit}>Enregistrer</AppButton>
                </>
            }
        >
            <div className="finance-builder-container"><div className="finance-builder-layout">
                <div className="min-w-0 space-y-5">
                    <FinanceDocumentLockNotice document={document} compact />
                    <div className="grid gap-3 sm:grid-cols-3">
                        <AppSelect
                            label="Type"
                            options={[
                                { id: 'quote', label: 'Devis' },
                                { id: 'invoice', label: 'Facture' },
                                { id: 'receipt', label: 'Recu' },
                            ]}
                            selectedKey={form.type}
                            isDisabled={!canEditNumberFields}
                            description={!canEditNumberFields ? lockMessage : undefined}
                            onSelectionChange={(key) => update('type', String(key || 'quote') as FinanceDocumentType)}
                        />
                        <AppTextField label="Devise" value={form.currency} onChange={(value) => update('currency', normalizeCurrency(value))} />
                        <AppTextField label="TVA par defaut (%)" type="number" min="0" max="100" step="0.01" value={String(form.tvaRate)} onChange={(value) => update('tvaRate', normalizeNumber(value))} />
                    </div>

                    <FinanceClientDossierFields
                        clientId={form.clientId}
                        dossierId={form.dossierId}
                        clients={clients}
                        dossiers={dossiers}
                        onClientChange={(value) => update('clientId', value)}
                        onDossierChange={(value) => update('dossierId', value)}
                    />

                    <FinanceDateFields
                        type={form.type}
                        issueDate={form.issueDate}
                        dueDate={form.dueDate}
                        validUntil={form.validUntil}
                        isIssueDateDisabled={!canEditNumberFields}
                        issueDateDescription={!canEditNumberFields ? lockMessage : undefined}
                        onChange={(field, value) => update(field, value)}
                    />

                    <div className="grid gap-3 sm:grid-cols-2">
                        <AppTextField label="Remise document" type="number" min="0" step="0.01" value={String(form.discountTotal)} onChange={(value) => update('discountTotal', normalizeNumber(value))} />
                        <AppSelect
                            label="Template"
                            placeholder="Template optionnel"
                            options={[{ id: '', label: 'Aucun template' }, ...templates.filter((template) => template.type === form.type || template.type === 'finance')]}
                            selectedKey={form.templateId || null}
                            onSelectionChange={(key) => update('templateId', key ? String(key) : '')}
                        />
                    </div>

                    <FinanceItemsTable
                        items={totals.items}
                        defaultTvaRate={form.tvaRate}
                        currency={form.currency}
                        onChange={(items) => update('items', items)}
                    />

                    <FinanceTotalsBox
                        subtotalHt={totals.subtotalHt}
                        discountTotal={totals.discountTotal}
                        taxTotal={totals.taxTotal}
                        totalTtc={totals.totalTtc}
                        paidTotal={document?.paidTotal || 0}
                        remainingTotal={document ? Math.max(0, totals.totalTtc - document.paidTotal) : totals.totalTtc}
                        currency={form.currency}
                    />

                    <div className="grid gap-3 lg:grid-cols-2">
                        <AppTextarea label="Notes" value={form.notes} onChange={(value) => update('notes', value)} />
                        <AppTextarea label="Conditions" value={form.terms} onChange={(value) => update('terms', value)} />
                    </div>
                </div>

                <FinanceDocumentPreview
                    type={form.type}
                    number={document?.number}
                    clientLabel={selectedClient?.label}
                    dossierLabel={selectedDossier?.label}
                    issueDate={form.issueDate}
                    dueDate={form.dueDate}
                    validUntil={form.validUntil}
                    currency={form.currency}
                    items={totals.items}
                    subtotalHt={totals.subtotalHt}
                    discountTotal={totals.discountTotal}
                    taxTotal={totals.taxTotal}
                    totalTtc={totals.totalTtc}
                    notes={form.notes}
                    terms={form.terms}
                />
            </div></div>
        </AppDrawer>
    );
}






```

## FILE: resources\js\features\finance\drawers\FinanceDocumentDrawer.tsx

```tsx
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { AppButton } from '@/components/ui/AppButton';
import { AppDrawer } from '@/components/ui/AppDrawer';
import { AppFormErrorSummary } from '@/components/ui/AppFormErrorSummary';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppTextField } from '@/components/ui/AppTextField';
import { AppTextarea } from '@/components/ui/AppTextarea';
import type { FormErrors } from '@/lib/formErrors';

type UiLockAwareFinanceDocument = {
    numberLocked?: boolean;
    numberLockedAt?: string | null;
    lock?: {
        isLocked?: boolean;
        lockedAtFormatted?: string | null;
        message?: string;
        canEditNumberFields?: boolean;
        canRegenerateExports?: boolean;
        canGeneratePdf?: boolean;
        canGenerateExcel?: boolean;
    } | null;
};

function isFinanceDocumentLocked(document: UiLockAwareFinanceDocument | null | undefined) {
    return Boolean(document?.lock?.isLocked ?? document?.numberLocked);
}

function canEditFinanceDocumentNumberFields(document: UiLockAwareFinanceDocument | null | undefined) {
    return document?.lock?.canEditNumberFields ?? !isFinanceDocumentLocked(document);
}

function FinanceDocumentLockedInlineBadge({ document }: { document: UiLockAwareFinanceDocument | null | undefined }) {
    if (!isFinanceDocumentLocked(document)) {
        return null;
    }

    const lockedAt = document?.lock?.lockedAtFormatted ?? document?.numberLockedAt ?? null;

    return (
        <span
            className="ml-2 inline-flex items-center rounded-full border border-amber-400/40 bg-amber-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-300"
            title={lockedAt ? `Locked at ${lockedAt}` : 'Locked after export'}
        >
            
            <FinanceDocumentLockInlineNotice document={document} />
Locked
        </span>
    );
}

function FinanceDocumentLockInlineNotice({ document }: { document: UiLockAwareFinanceDocument | null | undefined }) {
    if (!isFinanceDocumentLocked(document)) {
        return null;
    }

    const lockedAt = document?.lock?.lockedAtFormatted ?? document?.numberLockedAt ?? null;
    const message = document?.lock?.message ?? 'Document locked after export. Number, type, and issue date cannot be changed.';

    return (
        <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
            <div className="font-semibold text-amber-200">Locked document</div>
            <div className="mt-1 text-amber-100/80">{message}</div>
            {lockedAt ? <div className="mt-1 text-xs text-amber-100/60">Locked at {lockedAt}</div> : null}
        </div>
    );
}


type ClientOption = { id: string; label: string };
type DossierOption = { id: string; label: string };

type LineItemForm = {
    key: number;
    title: string;
    description: string;
    quantity: string;
    unit: string;
    unit_price: string;
    discount_rate: string;
    tva_rate: string;
};

export type FinanceDocFormPayload = {
    type: string;
    client_id: string;
    dossier_id: string;
    issue_date: string;
    due_date: string;
    valid_until: string;
    currency: string;
    tva_rate: string;
    notes: string;
    terms: string;
    items: LineItemForm[];
};

type CalculatedTotals = {
    subtotalHt: number;
    discountTotal: number;
    taxTotal: number;
    totalTtc: number;
};

type LineItemCalculations = {
    totalHt: number;
    totalTva: number;
    totalTtc: number;
};

const emptyItem = (key: number, tvaRate = '20'): LineItemForm => ({
    key,
    title: '',
    description: '',
    quantity: '1',
    unit: '',
    unit_price: '0',
    discount_rate: '0',
    tva_rate: tvaRate,
});

const emptyForm: FinanceDocFormPayload = {
    type: 'quote',
    client_id: '',
    dossier_id: '',
    issue_date: new Date().toISOString().slice(0, 10),
    due_date: '',
    valid_until: '',
    currency: 'MAD',
    tva_rate: '20',
    notes: '',
    terms: '',
    items: [emptyItem(1, '20')],
};

const calculateLineItem = (item: LineItemForm): LineItemCalculations => {
    const quantity = parseFloat(item.quantity) || 0;
    const unitPrice = parseFloat(item.unit_price) || 0;
    const discountRate = parseFloat(item.discount_rate) || 0;
    const tvaRate = parseFloat(item.tva_rate) || 0;

    const subtotal = quantity * unitPrice;
    const discountAmount = (subtotal * discountRate) / 100;
    const totalHt = subtotal - discountAmount;
    const totalTva = (totalHt * tvaRate) / 100;
    const totalTtc = totalHt + totalTva;

    return { totalHt, totalTva, totalTtc };
};

type Props = {
    isOpen: boolean;
    mode: 'create' | 'edit';
    clients: ClientOption[];
    dossiers: DossierOption[];
    onOpenChange: (open: boolean) => void;
    onSubmit: (payload: FinanceDocFormPayload) => void;
    initialType?: string;
    errors?: FormErrors;
};

export function FinanceDocumentDrawer({
    isOpen,
    mode,
    clients,
    dossiers,
    onOpenChange,
    onSubmit,
    initialType,
    errors = {},
}: Props) {
    const [form, setForm] = useState<FinanceDocFormPayload>(emptyForm);
    const [nextItemKey, setNextItemKey] = useState(2);

    useEffect(() => {
        if (isOpen && mode === 'create') {
            setForm({
                ...emptyForm,
                type: initialType || emptyForm.type,
                items: [emptyItem(1, emptyForm.tva_rate)],
            });
            setNextItemKey(2);
        }
    }, [isOpen, mode, initialType]);

    const update = useCallback(
        <K extends keyof FinanceDocFormPayload>(
            key: K,
            value: FinanceDocFormPayload[K],
        ) => setForm((prev) => ({ ...prev, [key]: value })),
        [],
    );

    const updateItem = useCallback(
        (itemKey: number, field: keyof LineItemForm, value: string) => {
            setForm((prev) => ({
                ...prev,
                items: prev.items.map((item) =>
                    item.key === itemKey ? { ...item, [field]: value } : item,
                ),
            }));
        },
        [],
    );

    const addItem = useCallback(() => {
        setForm((prev) => ({
            ...prev,
            items: [
                ...prev.items,
                emptyItem(nextItemKey, prev.tva_rate),
            ],
        }));
        setNextItemKey((k) => k + 1);
    }, [nextItemKey]);

    const removeItem = useCallback((itemKey: number) => {
        setForm((prev) => ({
            ...prev,
            items: prev.items.filter((item) => item.key !== itemKey),
        }));
    }, []);

    const totals: CalculatedTotals = useMemo(() => {
        let subtotalHt = 0;
        let discountTotal = 0;
        let taxTotal = 0;

        form.items.forEach(item => {
            const calc = calculateLineItem(item);
            const quantity = parseFloat(item.quantity) || 0;
            const unitPrice = parseFloat(item.unit_price) || 0;
            const discountRate = parseFloat(item.discount_rate) || 0;
            
            subtotalHt += calc.totalHt;
            taxTotal += calc.totalTva;
            discountTotal += (quantity * unitPrice * discountRate) / 100;
        });

        const totalTtc = subtotalHt + taxTotal;

        return { subtotalHt, discountTotal, taxTotal, totalTtc };
    }, [form.items]);

    const formatCurrency = (amount: number): string => {
        return amount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    function handleSubmit() {
        onSubmit(form);
    }

    const typeOptions = [
        { id: 'quote', label: 'Devis' },
        { id: 'invoice', label: 'Facture' },
        { id: 'receipt', label: 'Reçu' },
    ];

    const clientOptions = clients.map((c) => ({ id: c.id, label: c.label }));
    const dossierOptions = dossiers.map((d) => ({ id: d.id, label: d.label }));

    return (
        <AppDrawer
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            title={mode === 'create' ? 'New document' : 'Edit document'}
            description={
                mode === 'create'
                    ? 'Create a new devis, invoice, or receipt.'
                    : 'Update the document details and items.'
            }
            footer={
                <>
                    <AppButton variant="ghost" onPress={() => onOpenChange(false)}>
                        Cancel
                    </AppButton>
                    <AppButton variant="primary" onPress={handleSubmit}>
                        {mode === 'create' ? 'Create' : 'Save'}
                    </AppButton>
                </>
            }
        >
            <div className="space-y-5">
                <AppFormErrorSummary errors={errors} />

                <AppSelect
                    label="Type"
                    options={typeOptions}
                    selectedKey={form.type}
                    onSelectionChange={(key) => update('type', String(key))}
                />

                <AppSelect
                    label="Client"
                    placeholder="Select client"
                    options={
                        form.client_id
                            ? [{ id: '', label: 'None' }, ...clientOptions]
                            : clientOptions
                    }
                    selectedKey={form.client_id || undefined}
                    onSelectionChange={(key) => update('client_id', key ? String(key) : '')}
                />

                <AppSelect
                    label="Project"
                    placeholder="Select project"
                    options={
                        form.dossier_id
                            ? [{ id: '', label: 'None' }, ...dossierOptions]
                            : dossierOptions
                    }
                    selectedKey={form.dossier_id || undefined}
                    onSelectionChange={(key) => update('dossier_id', key ? String(key) : '')}
                />

                <div className="grid grid-cols-2 gap-3">
                    <AppTextField
                        label="Issue date"
                        type="date"
                        value={form.issue_date}
                        onChange={(v) => update('issue_date', v)}
                    />
                    <AppTextField
                        label="Due date"
                        type="date"
                        value={form.due_date}
                        onChange={(v) => update('due_date', v)}
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <AppTextField
                        label="Valid until"
                        type="date"
                        value={form.valid_until}
                        onChange={(v) => update('valid_until', v)}
                    />
                    <AppTextField
                        label="TVA rate (%)"
                        type="number"
                        value={form.tva_rate}
                        onChange={(v) => update('tva_rate', v)}
                    />
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-[var(--text)]">
                            Line items
                        </h3>
                        <AppButton variant="ghost" size="sm" onPress={addItem}>
                            <Plus size={14} />
                            Add item
                        </AppButton>
                    </div>

                    <div className="space-y-3">
                        {form.items.map((item, idx) => {
                            const itemTotals = calculateLineItem(item);
                            return (
                            <div
                                key={item.key}
                                className="space-y-2 rounded-2xl border p-3"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-[var(--text-muted)]">
                                        Item {idx + 1}
                                    </span>
                                    {form.items.length > 1 && (
                                        <AppButton
                                            variant="ghost"
                                            size="sm"
                                            onPress={() => removeItem(item.key)}
                                        >
                                            <Trash2 size={13} />
                                        </AppButton>
                                    )}
                                </div>

                                <AppTextField
                                    label="Title"
                                    value={item.title}
                                    onChange={(v) => updateItem(item.key, 'title', v)}
                                />

                                <AppTextarea
                                    label="Description"
                                    value={item.description}
                                    onChange={(v) =>
                                        updateItem(item.key, 'description', v)
                                    }
                                />

                                <div className="grid grid-cols-4 gap-2">
                                    <AppTextField
                                        label="Qty"
                                        type="number"
                                        step="0.001"
                                        value={item.quantity}
                                        onChange={(v) =>
                                            updateItem(item.key, 'quantity', v)
                                        }
                                    />
                                    <AppTextField
                                        label="Unit"
                                        value={item.unit}
                                        onChange={(v) =>
                                            updateItem(item.key, 'unit', v)
                                        }
                                    />
                                    <AppTextField
                                        label="Unit price"
                                        type="number"
                                        step="0.01"
                                        value={item.unit_price}
                                        onChange={(v) =>
                                            updateItem(item.key, 'unit_price', v)
                                        }
                                    />
                                    <AppTextField
                                        label="Disc. %"
                                        type="number"
                                        step="0.01"
                                        value={item.discount_rate}
                                        onChange={(v) =>
                                            updateItem(item.key, 'discount_rate', v)
                                        }
                                    />
                                </div>

                                <div className="mt-2 flex justify-between text-xs text-[var(--text-muted)]">
                                    <span>HT: {formatCurrency(itemTotals.totalHt)} MAD</span>
                                    <span>TVA: {formatCurrency(itemTotals.totalTva)} MAD</span>
                                    <span>TTC: {formatCurrency(itemTotals.totalTtc)} MAD</span>
                                </div>
                            </div>
                        );})}
                    </div>
                </div>

                <div className="rounded-2xl border p-4 bg-[var(--card-muted)]">
                    <h3 className="mb-3 text-sm font-medium text-[var(--text)]">Totals</h3>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-sm text-[var(--text-muted)]">Subtotal HT</span>
                            <span className="font-mono text-sm">{formatCurrency(totals.subtotalHt)} MAD</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-[var(--text-muted)]">Discount</span>
                            <span className="font-mono text-sm text-[var(--danger)]">-{formatCurrency(totals.discountTotal)} MAD</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-[var(--text-muted)]">TVA ({form.tva_rate}%)</span>
                            <span className="font-mono text-sm">{formatCurrency(totals.taxTotal)} MAD</span>
                        </div>
                        <div className="pt-2 border-t border-[var(--border)] flex justify-between">
                            <span className="text-base font-semibold text-[var(--text)]">Total TTC</span>
                            <span className="font-mono text-base font-bold text-[var(--primary)]">{formatCurrency(totals.totalTtc)} MAD</span>
                        </div>
                    </div>
                </div>

                <AppTextarea
                    label="Notes"
                    value={form.notes}
                    onChange={(v) => update('notes', v)}
                />

                <AppTextarea
                    label="Terms"
                    value={form.terms}
                    onChange={(v) => update('terms', v)}
                />
            </div>
        </AppDrawer>
    );
}
```

## FILE: resources\js\features\finance\drawers\PaymentDrawer.tsx

```tsx
import { useEffect, useMemo, useState } from 'react';
import { router } from '@inertiajs/react';
import { Dialog, Heading, Modal, ModalOverlay } from 'react-aria-components';
import { AlertTriangle, FileDown, FileSpreadsheet, FileText, Printer, ReceiptText } from 'lucide-react';
import { toast } from 'sonner';
import { AppButton } from '@/components/ui/AppButton';
import { AppDatePicker } from '@/components/ui/AppDatePicker';
import { AppDrawer } from '@/components/ui/AppDrawer';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppTextField } from '@/components/ui/AppTextField';
import { AppTextarea } from '@/components/ui/AppTextarea';
import type { FinanceDocument } from '@/features/finance/types';
import { formatMoney, normalizeNumber } from '@/features/finance/utils/calculations';

type PaymentDrawerProps = {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    invoices: FinanceDocument[];
    invoice?: FinanceDocument | null;
};

type PaymentForm = {
    financeDocumentId: string;
    amount: string;
    method: string;
    reference: string;
    paidAt: string;
    notes: string;
};

type PaymentReceiptFlash = {
    paymentNumber: string;
    number: string;
    showUrl: string | null;
    generatePdfUrl: string | null;
    generateExcelUrl: string | null;
    pdfDownloadUrl: string | null;
    excelDownloadUrl: string | null;
};

type PaymentSuccessPage = {
    props?: {
        flash?: {
            receipt?: PaymentReceiptFlash | null;
        };
    };
};

const today = () => new Date().toISOString().slice(0, 10);

const paymentMethods = [
    { id: 'cash', label: 'Especes' },
    { id: 'bank_transfer', label: 'Virement bancaire' },
    { id: 'check', label: 'Cheque' },
    { id: 'card', label: 'Carte bancaire' },
    { id: 'other', label: 'Autre' },
];

function makeForm(selectedInvoice?: FinanceDocument | null): PaymentForm {
    return {
        financeDocumentId: selectedInvoice ? String(selectedInvoice.id) : '',
        amount: selectedInvoice ? String(selectedInvoice.remainingTotal) : '',
        method: 'cash',
        reference: '',
        paidAt: today(),
        notes: '',
    };
}

export function PaymentDrawer({ isOpen, onOpenChange, invoices, invoice }: PaymentDrawerProps) {
    const [form, setForm] = useState<PaymentForm>(() => makeForm(invoice));
    const [receiptPrompt, setReceiptPrompt] = useState<PaymentReceiptFlash | null>(null);
    const payableInvoices = useMemo(
        () => invoices.filter((item) => item.type === 'invoice' && item.status !== 'cancelled' && item.remainingTotal > 0),
        [invoices],
    );

    const activeInvoice = payableInvoices.find((item) => String(item.id) === form.financeDocumentId) || invoice || null;
    const amount = normalizeNumber(form.amount);
    const remainingBefore = activeInvoice?.remainingTotal || 0;
    const remainingAfter = Math.max(0, remainingBefore - amount);
    const isOverpayment = amount > remainingBefore && remainingBefore > 0;
    const isFullPayment = activeInvoice ? amount === remainingBefore && amount > 0 : false;
    const canSubmit = Boolean(form.financeDocumentId) && amount > 0 && !isOverpayment;

    useEffect(() => {
        if (isOpen) {
            setForm(makeForm(invoice));
        }
    }, [invoice, isOpen]);

    function update<K extends keyof PaymentForm>(key: K, value: PaymentForm[K]) {
        setForm((prev) => ({ ...prev, [key]: value }));
    }

    function submit() {
        if (!canSubmit) {
            toast.error(isOverpayment ? 'Le montant depasse le reste a payer.' : 'Paiement invalide.');
            return;
        }

        router.post('/finance/payments', {
            finance_document_id: form.financeDocumentId,
            amount,
            method: form.method || null,
            reference: form.reference || null,
            paid_at: form.paidAt || null,
            notes: form.notes || null,
        }, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: (page) => {
                const receipt = (page as PaymentSuccessPage).props?.flash?.receipt ?? null;
                toast.success('Paiement enregistre. Le recu est cree automatiquement.');
                onOpenChange(false);

                if (receipt) {
                    setReceiptPrompt(receipt);
                }
            },
            onError: (errors) => {
                const firstError = Object.values(errors)[0];
                toast.error(typeof firstError === 'string' ? firstError : 'Impossible enregistrer le paiement.');
            },
        });
    }

    function openUrl(url: string | null | undefined, errorMessage = 'Lien recu indisponible.') {
        if (!url) {
            toast.error(errorMessage);
            return;
        }

        window.open(url, '_blank');
    }

    function generateReceiptFile(url: string | null | undefined, label: string) {
        if (!url) {
            toast.error('Action recu indisponible.');
            return;
        }

        router.put(url, {}, {
            preserveScroll: true,
            preserveState: true,
            onStart: () => toast.loading(`${label} en cours...`, { id: label }),
            onSuccess: () => toast.success(`${label} termine.`, { id: label }),
            onError: () => toast.error(`${label} impossible.`, { id: label }),
        });
    }

    return (
        <>
            <AppDrawer
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                title="Enregistrer un paiement"
                description="Ajouter un paiement sur une facture. Le reste a payer est recalcule et un recu est cree automatiquement."
                footer={
                    <>
                        <AppButton variant="ghost" onPress={() => onOpenChange(false)}>Annuler</AppButton>
                        <AppButton variant="primary" onPress={submit} isDisabled={!canSubmit}>Enregistrer + creer recu</AppButton>
                    </>
                }
            >
                <div className="space-y-5">
                    <AppSelect
                        label="Facture"
                        placeholder="Choisir une facture"
                        options={payableInvoices.map((item) => ({
                            id: String(item.id),
                            label: `${item.number} - ${formatMoney(item.remainingTotal, item.currency)} restant`,
                        }))}
                        selectedKey={form.financeDocumentId || null}
                        onSelectionChange={(key) => {
                            const id = key ? String(key) : '';
                            const selected = payableInvoices.find((item) => String(item.id) === id);
                            setForm((prev) => ({
                                ...prev,
                                financeDocumentId: id,
                                amount: selected ? String(selected.remainingTotal) : '',
                            }));
                        }}
                    />

                    {activeInvoice ? (
                        <div className="rounded-2xl border bg-[var(--surface-2)] p-4 text-sm">
                            <div className="flex items-center gap-2 font-semibold">
                                <ReceiptText size={16} />
                                {activeInvoice.number}
                            </div>
                            <div className="mt-3 grid gap-2 sm:grid-cols-3">
                                <p>Total TTC: <strong>{formatMoney(activeInvoice.totalTtc, activeInvoice.currency)}</strong></p>
                                <p>Paye: <strong>{formatMoney(activeInvoice.paidTotal, activeInvoice.currency)}</strong></p>
                                <p>Restant: <strong>{formatMoney(activeInvoice.remainingTotal, activeInvoice.currency)}</strong></p>
                            </div>
                        </div>
                    ) : null}

                    <div className="grid gap-3 sm:grid-cols-2">
                        <AppTextField
                            label="Montant paye"
                            type="number"
                            min="0"
                            step="0.01"
                            value={form.amount}
                            onChange={(value) => update('amount', value)}
                            error={isOverpayment ? 'Le montant depasse le reste a payer.' : undefined}
                        />

                        <AppDatePicker
                            label="Date paiement"
                            value={form.paidAt}
                            onChange={(value) => update('paidAt', value)}
                        />
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                        <AppSelect
                            label="Mode de paiement"
                            options={paymentMethods}
                            selectedKey={form.method}
                            onSelectionChange={(key) => update('method', key ? String(key) : '')}
                        />

                        <AppTextField
                            label="Reference"
                            value={form.reference}
                            onChange={(value) => update('reference', value)}
                        />
                    </div>

                    {activeInvoice ? (
                        <div className={`rounded-2xl border p-4 text-sm ${isOverpayment ? 'border-red-300 bg-red-50 text-red-800' : 'bg-[var(--surface-2)]'}`}>
                            <div className="flex items-center gap-2 font-semibold">
                                {isOverpayment ? <AlertTriangle size={16} /> : null}
                                Resultat apres paiement
                            </div>
                            <div className="mt-3 grid gap-2 sm:grid-cols-3">
                                <p>Paiement: <strong>{formatMoney(amount, activeInvoice.currency)}</strong></p>
                                <p>Reste apres: <strong>{formatMoney(remainingAfter, activeInvoice.currency)}</strong></p>
                                <p>Statut: <strong>{isFullPayment ? 'Paiement complet' : 'Paiement partiel'}</strong></p>
                            </div>
                        </div>
                    ) : null}

                    <AppTextarea
                        label="Notes"
                        value={form.notes}
                        onChange={(value) => update('notes', value)}
                    />
                </div>
            </AppDrawer>

            <ModalOverlay
                isOpen={Boolean(receiptPrompt)}
                onOpenChange={(open) => {
                    if (!open) setReceiptPrompt(null);
                }}
                className="app-modal-overlay app-dialog-overlay"
                isDismissable
            >
                <Modal className="app-dialog-panel max-w-xl">
                    <Dialog className="outline-none">
                        {({ close }) => (
                            <div className="p-5">
                                <div className="flex gap-4">
                                    <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
                                        <ReceiptText size={20} />
                                    </div>
                                    <div className="min-w-0">
                                        <Heading slot="title" className="text-base font-semibold">
                                            Recu cree: {receiptPrompt?.number}
                                        </Heading>
                                        <p className="mt-1 text-sm leading-6 text-[var(--text-muted)]">
                                            Paiement {receiptPrompt?.paymentNumber} enregistre. Voulez-vous ouvrir, imprimer ou sauvegarder le recu maintenant ?
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-5 grid gap-2 sm:grid-cols-2">
                                    <AppButton variant="primary" onPress={() => openUrl(receiptPrompt?.showUrl)}>
                                        <Printer size={16} />
                                        Ouvrir / imprimer
                                    </AppButton>
                                    <AppButton variant="secondary" onPress={() => generateReceiptFile(receiptPrompt?.generatePdfUrl, 'Generation PDF recu')}>
                                        <FileText size={16} />
                                        Generer PDF
                                    </AppButton>
                                    <AppButton variant="secondary" onPress={() => openUrl(receiptPrompt?.pdfDownloadUrl, 'PDF recu non genere.')}>
                                        <FileDown size={16} />
                                        Telecharger PDF
                                    </AppButton>
                                    <AppButton variant="secondary" onPress={() => receiptPrompt?.excelDownloadUrl ? openUrl(receiptPrompt.excelDownloadUrl) : generateReceiptFile(receiptPrompt?.generateExcelUrl, 'Generation Excel recu')}>
                                        <FileSpreadsheet size={16} />
                                        Excel
                                    </AppButton>
                                </div>

                                <div className="mt-5 flex justify-end">
                                    <AppButton variant="ghost" onPress={close}>Plus tard</AppButton>
                                </div>
                            </div>
                        )}
                    </Dialog>
                </Modal>
            </ModalOverlay>
        </>
    );
}

```

## FILE: resources\js\features\finance\templates\TemplateEditorForm.tsx

```tsx
import {
    AlertTriangle,
    CheckCircle2,
    Code2,
    Copy,
    FileCode2,
    FileText,
    Layout,
    Palette,
    RotateCcw,
    Save,
    Search,
    Sparkles,
} from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import type { DocumentTemplate, TemplatePlaceholder } from '@/features/finance/types';

type TemplateEditorFormProps = {
    value: DocumentTemplate;
    placeholders: TemplatePlaceholder[];
    onChange: (value: DocumentTemplate) => void;
    onSave: () => void;
    onReset: () => void;
};

type EditorTab = 'body' | 'header' | 'footer' | 'css';

type Warning = {
    type: 'error' | 'warning' | 'info';
    message: string;
};

const tabConfig: Array<{
    id: EditorTab;
    label: string;
    icon: typeof FileText;
    language: string;
    help: string;
}> = [
    {
        id: 'body',
        label: 'Body',
        icon: FileText,
        language: 'HTML',
        help: 'Main document content. For Devis/Facture, keep {{items_table}}.',
    },
    {
        id: 'header',
        label: 'Header',
        icon: Layout,
        language: 'HTML',
        help: 'Top section of the A4 document. Recommended logo placeholder: {{company.logo_html}}.',
    },
    {
        id: 'footer',
        label: 'Footer',
        icon: FileCode2,
        language: 'HTML',
        help: 'Legal footer, company identifiers, contact and final closing tags.',
    },
    {
        id: 'css',
        label: 'CSS',
        icon: Palette,
        language: 'CSS',
        help: 'Visual design for PDF and preview. Keep DomPDF-compatible CSS.',
    },
];

function getCode(value: DocumentTemplate, tab: EditorTab): string {
    if (tab === 'header') {
        return value.headerHtml || '';
    }

    if (tab === 'footer') {
        return value.footerHtml || '';
    }

    if (tab === 'css') {
        return value.css || '';
    }

    return value.bodyHtml || '';
}

function setCode(value: DocumentTemplate, tab: EditorTab, code: string): DocumentTemplate {
    if (tab === 'header') {
        return { ...value, headerHtml: code };
    }

    if (tab === 'footer') {
        return { ...value, footerHtml: code };
    }

    if (tab === 'css') {
        return { ...value, css: code };
    }

    return { ...value, bodyHtml: code };
}

function allTemplateCode(value: DocumentTemplate): string {
    return [
        value.headerHtml || '',
        value.bodyHtml || '',
        value.footerHtml || '',
        value.css || '',
    ].join('\n');
}

function flattenPlaceholders(groups: TemplatePlaceholder[]): string[] {
    return groups.flatMap((group) => group.items || []);
}

function extractPlaceholders(code: string): string[] {
    const matches = code.match(/{{\s*[a-zA-Z0-9_.]+\s*}}/g) || [];

    return Array.from(new Set(matches.map((item) => item.replace(/\s+/g, ''))));
}

function validateTemplate(value: DocumentTemplate, placeholders: TemplatePlaceholder[]): Warning[] {
    const warnings: Warning[] = [];
    const code = allTemplateCode(value);
    const supported = new Set(flattenPlaceholders(placeholders).map((item) => item.replace(/\s+/g, '')));
    const used = extractPlaceholders(code);

    if (/<script\b/i.test(code)) {
        warnings.push({
            type: 'error',
            message: 'Script tags are not allowed and will be removed by backend validation.',
        });
    }

    if (/\son[a-z]+\s*=/i.test(code)) {
        warnings.push({
            type: 'error',
            message: 'Inline event handlers like onclick/onload are unsafe and should be removed.',
        });
    }

    const unsupported = used.filter((item) => !supported.has(item));

    if (unsupported.length > 0) {
        warnings.push({
            type: 'warning',
            message: `Unsupported placeholders: ${unsupported.slice(0, 8).join(', ')}${unsupported.length > 8 ? '...' : ''}`,
        });
    }

    if ((value.type === 'quote' || value.type === 'invoice') && !code.includes('{{items_table}}')) {
        warnings.push({
            type: 'warning',
            message: 'This template type should include {{items_table}}.',
        });
    }

    if (value.type === 'receipt' && !code.includes('{{payments_table}}')) {
        warnings.push({
            type: 'info',
            message: 'Receipt templates usually include {{payments_table}}.',
        });
    }

    if (!code.includes('{{company.logo_html}}')) {
        warnings.push({
            type: 'info',
            message: 'Add {{company.logo_html}} in the header to use the uploaded logo.',
        });
    }

    if (!value.bodyHtml?.trim()) {
        warnings.push({
            type: 'warning',
            message: 'Body HTML is empty.',
        });
    }

    if (!value.css?.trim()) {
        warnings.push({
            type: 'info',
            message: 'CSS is empty. The document may look unstyled.',
        });
    }

    return warnings;
}

function Field({
    label,
    value,
    onChange,
    placeholder,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}) {
    return (
        <label className="min-w-0">
            <span className="mb-1.5 block text-xs font-semibold text-[var(--text)]">{label}</span>

            <input
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                className="h-10 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] outline-none transition hover:border-[var(--accent)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--accent)_20%,transparent)]"
            />
        </label>
    );
}

function SelectField({
    label,
    value,
    onChange,
    options,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: Array<{ value: string; label: string }>;
}) {
    return (
        <label className="min-w-0">
            <span className="mb-1.5 block text-xs font-semibold text-[var(--text)]">{label}</span>

            <select
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="h-10 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] outline-none transition hover:border-[var(--accent)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--accent)_20%,transparent)]"
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </label>
    );
}

function WarningBox({ warnings }: { warnings: Warning[] }) {
    if (!warnings.length) {
        return (
            <div className="flex items-start gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-500">
                <CheckCircle2 size={15} className="mt-0.5 shrink-0" />
                <div>
                    <p className="font-semibold">Template looks healthy.</p>
                    <p className="mt-1 opacity-80">No major structure issues detected.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {warnings.map((warning, index) => {
                const tone =
                    warning.type === 'error'
                        ? 'border-red-500/20 bg-red-500/10 text-red-500'
                        : warning.type === 'warning'
                          ? 'border-amber-500/20 bg-amber-500/10 text-amber-500'
                          : 'border-sky-500/20 bg-sky-500/10 text-sky-500';

                return (
                    <div key={`${warning.message}-${index}`} className={`flex items-start gap-2 rounded-2xl border p-3 text-xs ${tone}`}>
                        <AlertTriangle size={15} className="mt-0.5 shrink-0" />
                        <p>{warning.message}</p>
                    </div>
                );
            })}
        </div>
    );
}

export function TemplateEditorForm({
    value,
    placeholders,
    onChange,
    onSave,
    onReset,
}: TemplateEditorFormProps) {
    const [activeTab, setActiveTab] = useState<EditorTab>('body');
    const [placeholderSearch, setPlaceholderSearch] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    const activeConfig = tabConfig.find((item) => item.id === activeTab) || tabConfig[0];
    const code = getCode(value, activeTab);
    const warnings = useMemo(() => validateTemplate(value, placeholders), [value, placeholders]);

    const flatPlaceholders = useMemo(() => {
        const query = placeholderSearch.trim().toLowerCase();

        return flattenPlaceholders(placeholders)
            .filter((item) => !query || item.toLowerCase().includes(query))
            .slice(0, 20);
    }, [placeholders, placeholderSearch]);

    const usedCount = useMemo(() => extractPlaceholders(allTemplateCode(value)).length, [value]);

    function update<K extends keyof DocumentTemplate>(key: K, nextValue: DocumentTemplate[K]) {
        onChange({
            ...value,
            [key]: nextValue,
        });
    }

    function updateCode(nextCode: string) {
        onChange(setCode(value, activeTab, nextCode));
    }

    function insertPlaceholder(placeholder: string) {
        const textarea = textareaRef.current;

        if (!textarea) {
            updateCode(`${code}${placeholder}`);
            return;
        }

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const nextCode = `${code.slice(0, start)}${placeholder}${code.slice(end)}`;

        updateCode(nextCode);

        requestAnimationFrame(() => {
            textarea.focus();
            textarea.setSelectionRange(start + placeholder.length, start + placeholder.length);
        });
    }

    async function copyCurrentCode() {
        await navigator.clipboard.writeText(code);
        toast.success(`${activeConfig.label} code copied.`);
    }

    function beautifyCode() {
        const next = code
            .replace(/>\s+</g, '>\n<')
            .replace(/\n{3,}/g, '\n\n')
            .trim();

        updateCode(next);
        toast.success('Code cleaned lightly.');
    }

    return (
        <section className="overflow-hidden rounded-2xl border bg-[var(--surface)]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b px-3 py-2">
                <div className="flex min-w-0 items-center gap-2">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] text-[var(--accent)]">
                        <Code2 size={17} />
                    </div>

                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <h2 className="truncate text-sm font-semibold">{value.name || 'Template editor'}</h2>

                            {value.isDefault ? (
                                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-500">
                                    Default
                                </span>
                            ) : null}
                        </div>

                        <p className="mt-0.5 truncate text-[11px] text-[var(--text-muted)]">
                            {value.slug || 'template'} / {value.typeLabel || value.type}
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                    <button
                        type="button"
                        onClick={onReset}
                        className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border bg-[var(--surface)] px-3 text-xs font-semibold text-[var(--text-muted)] transition hover:border-amber-500 hover:text-amber-500"
                    >
                        <RotateCcw size={14} />
                        Reset
                    </button>

                    <button
                        type="button"
                        onClick={onSave}
                        className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-3 text-xs font-semibold text-white transition hover:opacity-90"
                    >
                        <Save size={14} />
                        Save
                    </button>
                </div>
            </div>

            <div className="grid gap-3 p-3 xl:grid-cols-[minmax(0,1fr)_280px]">
                <div className="min-w-0 space-y-3">
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
                        <div className="xl:col-span-2">
                            <Field
                                label="Name"
                                value={value.name || ''}
                                onChange={(next) => update('name', next)}
                            />
                        </div>

                        <div className="xl:col-span-2">
                            <Field
                                label="Slug"
                                value={value.slug || ''}
                                onChange={(next) => update('slug', next)}
                            />
                        </div>

                        <SelectField
                            label="Format"
                            value={value.paperSize || 'A4'}
                            onChange={(next) => update('paperSize', next)}
                            options={[
                                { value: 'A4', label: 'A4' },
                                { value: 'A5', label: 'A5' },
                                { value: 'Letter', label: 'Letter' },
                            ]}
                        />

                        <SelectField
                            label="Orientation"
                            value={value.orientation || 'portrait'}
                            onChange={(next) => update('orientation', next)}
                            options={[
                                { value: 'portrait', label: 'Portrait' },
                                { value: 'landscape', label: 'Landscape' },
                            ]}
                        />

                        <div className="md:col-span-2 xl:col-span-3">
                            <Field
                                label="Logo path"
                                value={value.logoPath || ''}
                                onChange={(next) => update('logoPath', next)}
                                placeholder="Optional template-specific logo path"
                            />
                        </div>

                        <div className="md:col-span-2 xl:col-span-3">
                            <Field
                                label="Accent"
                                value={String((value.settings as Record<string, unknown> | undefined)?.accent_color || '')}
                                onChange={(next) =>
                                    update('settings', {
                                        ...((value.settings as Record<string, unknown> | undefined) || {}),
                                        accent_color: next,
                                    })
                                }
                                placeholder="#d8aa26"
                            />
                        </div>
                    </div>

                    <div className="rounded-2xl border bg-[var(--surface-2)] p-1">
                        <div className="grid grid-cols-4 gap-1">
                            {tabConfig.map((tab) => {
                                const Icon = tab.icon;
                                const active = activeTab === tab.id;

                                return (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => setActiveTab(tab.id)}
                                        className={[
                                            'inline-flex h-9 items-center justify-center gap-2 rounded-xl text-xs font-semibold transition',
                                            active
                                                ? 'bg-[var(--accent)] text-white'
                                                : 'text-[var(--text-muted)] hover:bg-[var(--surface)] hover:text-[var(--text)]',
                                        ].join(' ')}
                                    >
                                        <Icon size={14} />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-2xl border">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-[var(--surface-2)] px-3 py-2">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                                    {activeConfig.label} / {activeConfig.language}
                                </p>
                                <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">{activeConfig.help}</p>
                            </div>

                            <div className="flex items-center gap-1.5">
                                <button
                                    type="button"
                                    onClick={beautifyCode}
                                    className="inline-flex h-8 items-center justify-center gap-1.5 rounded-xl border bg-[var(--surface)] px-2.5 text-xs font-semibold text-[var(--text-muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                                >
                                    <Sparkles size={13} />
                                    Clean
                                </button>

                                <button
                                    type="button"
                                    onClick={() => void copyCurrentCode()}
                                    className="inline-flex h-8 items-center justify-center gap-1.5 rounded-xl border bg-[var(--surface)] px-2.5 text-xs font-semibold text-[var(--text-muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                                >
                                    <Copy size={13} />
                                    Copy
                                </button>
                            </div>
                        </div>

                        <textarea
                            ref={textareaRef}
                            value={code}
                            onChange={(event) => updateCode(event.target.value)}
                            spellCheck={false}
                            className="min-h-[520px] w-full resize-y bg-[#111827] px-4 py-3 font-mono text-[12px] leading-6 text-slate-100 outline-none selection:bg-[var(--accent)]/30"
                        />
                    </div>
                </div>

                <aside className="space-y-3">
                    <div className="rounded-2xl border bg-[var(--surface-2)] p-3">
                        <div className="mb-3 flex items-center justify-between gap-2">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                                    Template status
                                </p>
                                <p className="mt-1 text-xs text-[var(--text-muted)]">{usedCount} placeholders used</p>
                            </div>

                            <span className="rounded-full bg-[var(--surface)] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                                {warnings.filter((item) => item.type === 'error').length} errors
                            </span>
                        </div>

                        <WarningBox warnings={warnings} />
                    </div>

                    <div className="rounded-2xl border bg-[var(--surface-2)] p-3">
                        <div className="mb-3">
                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                                Insert placeholder
                            </p>

                            <label className="mt-2 flex h-10 items-center gap-2 rounded-2xl border bg-[var(--surface)] px-3">
                                <Search size={14} className="text-[var(--text-muted)]" />
                                <input
                                    value={placeholderSearch}
                                    onChange={(event) => setPlaceholderSearch(event.target.value)}
                                    placeholder="Search company, total..."
                                    className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--text-muted)]"
                                />
                            </label>
                        </div>

                        <div className="max-h-[360px] space-y-1 overflow-auto">
                            {flatPlaceholders.map((placeholder) => (
                                <button
                                    key={placeholder}
                                    type="button"
                                    onClick={() => insertPlaceholder(placeholder)}
                                    className="block w-full truncate rounded-xl bg-[var(--surface)] px-3 py-2 text-left font-mono text-[11px] text-[var(--text-muted)] transition hover:bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] hover:text-[var(--accent)]"
                                    title={placeholder}
                                >
                                    {placeholder}
                                </button>
                            ))}
                        </div>
                    </div>
                </aside>
            </div>
        </section>
    );
}

export default TemplateEditorForm;
```

## FILE: resources\js\features\finance\types.ts

```ts

export type FinanceDocumentLockState = {
    isLocked: boolean;
    lockedAt: string | null;
    lockedAtFormatted: string | null;
    message: string;
    blockedFields: string[];
    canEditNumberFields: boolean;
    canRegenerateExports: boolean;
    canGeneratePdf: boolean;
    canGenerateExcel: boolean;
};
export type FinanceDocumentType = 'quote' | 'invoice' | 'receipt';

export type FinanceDocumentStatus =
    | 'draft'
    | 'sent'
    | 'accepted'
    | 'rejected'
    | 'converted'
    | 'issued'
    | 'partially_paid'
    | 'paid'
    | 'overdue'
    | 'cancelled';

export type FinanceDocumentLock = {
    isLocked: boolean;
    lockedAt: string | null;
    lockedAtFormatted: string | null;
    message: string;
    blockedFields: string[];
    canEditNumberFields: boolean;
    canRegenerateExports: boolean;
    canGeneratePdf: boolean;
    canGenerateExcel: boolean;
};

export type FinanceDocumentItem = {
    id?: number;
    position: number;
    title: string;
    description: string | null;
    quantity: number;
    unit: string | null;
    unitPrice: number;
    discountRate: number;
    tvaRate: number;
    totalHt: number;
    totalTva: number;
    totalTtc: number;
};

export type FinanceDocument = {
    id: number;
    type: FinanceDocumentType;
    typeLabel: string;
    number: string;
    numberLocked?: boolean;
    numberLockedAt?: string | null;
    lock?: FinanceDocumentLock | null;
    status: FinanceDocumentStatus;
    client: { id: number | string; name: string; cin?: string | null; address?: string | null } | null;
    dossier: {
        id: number | string;
        number: string;
        projectObject?: string | null;
        address?: string | null;
        floorArea?: number | string | null;
        landSurface?: number | string | null;
    } | null;
    sourceDocumentId: number | null;
    issueDate: string | null;
    dueDate: string | null;
    validUntil: string | null;
    currency: string;
    tvaRate: number;
    subtotalHt: number;
    discountTotal: number;
    taxTotal: number;
    totalTtc: number;
    paidTotal: number;
    remainingTotal: number;
    notes: string | null;
    terms: string | null;
    templateId: number | string | null;
    pdfPath: string | null;
    excelPath: string | null;
    generatedAt: string | null;
    items: FinanceDocumentItem[];
    payments?: Payment[];
    paymentsCount: number;
    createdAt?: string | null;
    updatedAt?: string | null;
    showUrl?: string | null;
    updateUrl?: string | null;
    deleteUrl?: string | null;
    acceptUrl?: string | null;
    rejectUrl?: string | null;
    cancelUrl?: string | null;
    convertToInvoiceUrl?: string | null;
    hasPdf?: boolean;
    hasExcel?: boolean;
    generateUrl?: string | null;
    generatePdfUrl?: string | null;
    generateExcelUrl?: string | null;
    downloadUrl?: string | null;
    excelDownloadUrl?: string | null;
    pdfDownloadUrl?: string | null;
    revealFilesUrl?: string | null;
    paymentUrl?: string | null;
};

export type DocumentTemplate = {
    id: number;
    type: FinanceDocumentType;
    typeLabel: string;
    name: string;
    slug: string;
    isDefault: boolean;
    paperSize: 'A4' | 'A5' | 'Letter' | string;
    orientation: 'portrait' | 'landscape' | string;
    headerHtml: string;
    bodyHtml: string;
    footerHtml: string;
    css: string;
    settings: Record<string, unknown>;
    logoPath: string;
    createdAt?: string | null;
    updatedAt?: string | null;
    urls: {
        update: string;
        delete: string;
        duplicate: string;
        setDefault: string;
        preview: string;
        versions?: string;
        snapshot?: string;
    };
};

export type TemplatePlaceholder = {
    group: string;
    items: string[];
};

export type TemplatePreviewData = {
    html: string;
};
export type FinanceSettings = {
    defaultTvaRate: number;
    defaultCurrency: string;
    defaultPaymentTermsDays: number;
    defaultQuoteValidityDays: number;
    defaultUnitPriceM2: number;
    defaultArchitectRate: number;
    companyInfo: Record<string, string | null>;
    bankInfo: Record<string, string | null>;
};

export type ClientOption = {
    id: string;
    label: string;
    cin?: string | null;
    address?: string | null;
};

export type DossierOption = {
    id: string;
    label: string;
    clientId: string;
    projectObject?: string | null;
    address?: string | null;
    floorArea?: number | string | null;
    landSurface?: number | string | null;
};

export type TemplateOption = {
    id: string;
    label: string;
    type: FinanceDocumentType | string;
};

export type PaymentReceiptUrls = {
    show: string | null;
    download: string | null;
    pdf: string | null;
    excel: string | null;
    generatePdf: string | null;
    generateExcel: string | null;
};

export type PaymentReceipt = {
    id: number;
    number: string;
    type: 'receipt' | string;
    status: FinanceDocumentStatus | string;
    issueDate: string | null;
    amount: number;
    pdfPath: string | null;
    excelPath: string | null;
    urls: PaymentReceiptUrls;
};

export type Payment = {
    id: number;
    paymentNumber: string;
    amount: number;
    method: string | null;
    reference: string | null;
    paidAt: string | null;
    notes: string | null;
    document?: {
        id: number;
        number: string;
        type: string;
        status?: string;
        totalTtc?: number;
        paidTotal?: number;
        remainingTotal?: number;
    } | null;
    client?: { id: number; name: string } | null;
    dossier?: { id: number; number: string } | null;
    receiptDocumentId?: number | null;
    receipt?: PaymentReceipt | null;
    createdAt?: string | null;
};

export type FinanceRecordType = 'devis' | 'invoice' | 'payment' | string;

export type FinanceRecordStatus =
    | 'draft'
    | 'sent'
    | 'paid'
    | 'partially_paid'
    | 'overdue'
    | 'cancelled'
    | string;

export type FinanceRecordRow = {
    id: number;
    dossierId: string;
    clientId: string;
    dossierNumber: string;
    projectObject: string;
    clientName: string;
    clientCin: string;
    recordNumber: string;
    type: FinanceRecordType;
    status: FinanceRecordStatus;
    ht: number;
    tva: number;
    totalTtc: number;
    paid: number;
    remaining: number;
    issuedAt: string | null;
    dueDate: string | null;
    paidAt: string | null;
    notes: string | null;
    updatedAt: string | null;
    createdAt: string | null;
    generatedFilePath: string | null;
    generatedPdfPath: string | null;
    generatedAt: string | null;
    downloadUrl: string;
    pdfDownloadUrl: string;
    hasGeneratedFile: boolean;
    hasPdf: boolean;
};

export type FinanceDossierOption = {
    id: string;
    label: string;
    clientName: string;
};

export type FinanceFormPayload = {
    dossierId: string;
    type: string;
    status: string;
    ht: string;
    tva: string;
    totalTtc: string;
    paid: string;
    issuedAt: string;
    dueDate: string;
    paidAt: string;
    notes: string;
};

export type FinanceMonthDocumentRow = {
    id: number;
    type: FinanceDocumentType | string;
    number: string;
    status: FinanceDocumentStatus | string;
    clientName: string | null;
    dossierNumber: string | null;
    province: string | null;
    commune: string | null;
    issueDate: string | null;
    totalTtc: number;
    paidTotal: number;
    remainingTotal: number;
};

export type FinanceMonthPaymentRow = {
    id: number;
    paymentNumber: string;
    documentNumber: string | null;
    clientName: string | null;
    dossierNumber: string | null;
    province: string | null;
    commune: string | null;
    amount: number;
    method: string | null;
    paidAt: string | null;
};

export type FinanceMonthSummary = {
    year: number;
    month: number;
    key: string;
    label: string;
    currency: string;
    quotesCount: number;
    invoicesCount: number;
    receiptsCount: number;
    paymentsCount: number;
    quotesTotalTtc: number;
    invoicesTotalTtc: number;
    receiptsTotalTtc: number;
    paidTotal: number;
    remainingTotal: number;
    overdueTotal: number;
    subtotalHt: number;
    taxTotal: number;
    totalTtc: number;
    documents: FinanceMonthDocumentRow[];
    payments: FinanceMonthPaymentRow[];
};
```

## FILE: resources\js\features\inbox\components\ConversationList.tsx

```tsx
import { Search } from 'lucide-react';
import type { ConversationRow } from '@/features/chat/types';

function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'now';
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
}

type Props = {
    conversations: ConversationRow[];
    selectedConvId: number | null;
    search: string;
    onSearchChange: (q: string) => void;
    onSelect: (conv: ConversationRow) => void;
};

export function ConversationList({ conversations, selectedConvId, search, onSearchChange, onSelect }: Props) {
    return (
        <div className="flex flex-col border-r border-[var(--crm-border)]">
            <div className="border-b border-[var(--crm-border)] p-3">
                <div className="relative">
                    <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--crm-muted)]" />
                    <input value={search} onChange={(e) => onSearchChange(e.target.value)} placeholder="Search conversations..." className="crm-command-input h-9 w-full pl-8 text-xs" />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto">
                {conversations.map((conv) => {
                    const parts = Array.isArray(conv.participants) ? conv.participants : [];
                    const other = parts.find((p) => p?.user?.name !== 'You');
                    return (
                        <button key={conv.id} type="button" onClick={() => onSelect(conv)}
                            className={`flex w-full items-center gap-3 border-b border-[var(--crm-border)] px-3 py-3 text-left transition hover:bg-[var(--crm-surface-2)] ${selectedConvId === conv.id ? 'bg-[color-mix(in_srgb,var(--crm-gold)_8%,transparent)]' : ''}`}>
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--crm-gold-soft)] text-sm font-bold text-[var(--crm-gold)]">
                                {other ? other.user.name.charAt(0).toUpperCase() : '?'}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-2">
                                    <p className="truncate text-sm font-semibold text-[var(--crm-text)]">{other?.user?.name || conv.subject || 'Conversation'}</p>
                                    {conv.lastMessageAt ? <span className="shrink-0 text-[10px] text-[var(--crm-text-muted)]">{timeAgo(conv.lastMessageAt)}</span> : null}
                                </div>
                                <p className="mt-0.5 truncate text-xs text-[var(--crm-text-muted)]">{conv.lastMessage?.body || 'No messages yet'}</p>
                            </div>
                            {conv.unreadCount > 0 ? (
                                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">{conv.unreadCount}</span>
                            ) : null}
                        </button>
                    );
                })}
                {conversations.length === 0 ? (
                    <p className="p-6 text-center text-xs text-[var(--crm-text-muted)]">No conversations</p>
                ) : null}
            </div>
        </div>
    );
}

```

## FILE: resources\js\features\inbox\components\MessageThread.tsx

```tsx
import { MessageSquare, Send } from 'lucide-react';
import { useEffect, useRef } from 'react';
import type { ConversationRow, MessageRow } from '@/features/chat/types';

type Props = {
    conversation: ConversationRow | null;
    messages: MessageRow[];
    loading: boolean;
    messageBody: string;
    onMessageBodyChange: (body: string) => void;
    onSend: () => void;
};

export function MessageThread({ conversation, messages, loading, messageBody, onMessageBodyChange, onSend }: Props) {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    if (!conversation) {
        return (
            <div className="flex flex-1 items-center justify-center">
                <div className="text-center">
                    <MessageSquare size={40} className="mx-auto text-[var(--crm-muted)]" />
                    <p className="mt-3 text-sm text-[var(--crm-text-muted)]">Select a conversation</p>
                </div>
            </div>
        );
    }

    const userId = (window as any).userId;
    const parts = Array.isArray(conversation.participants) ? conversation.participants : [];
    const otherName = parts.filter((p) => p?.user?.name !== 'You').map((p) => p?.user?.name).filter(Boolean).join(', ');

    return (
        <>
            <div className="flex items-center gap-3 border-b border-[var(--crm-border)] px-4 py-3">
                <div className="flex size-8 items-center justify-center rounded-full bg-[var(--crm-gold-soft)] text-xs font-bold text-[var(--crm-gold)]">
                    {(() => { const o = parts.find((x) => x?.user?.name !== 'You'); return o?.user?.name?.charAt(0)?.toUpperCase() || '?'; })()}
                </div>
                <div>
                    <p className="text-sm font-semibold text-[var(--crm-text)]">{otherName || conversation.subject || 'Conversation'}</p>
                    {conversation.subject ? <p className="text-xs text-[var(--crm-text-muted)]">{conversation.subject}</p> : null}
                </div>
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto p-4">
                {loading ? <p className="text-center text-xs text-[var(--crm-text-muted)]">Loading...</p> : null}
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.userId === userId ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] rounded-xl px-3 py-2 ${msg.userId === userId ? 'bg-[var(--crm-gold)] text-black' : 'border border-[var(--crm-border)] bg-[var(--crm-surface-2)]'}`}>
                            <p className="text-xs font-semibold opacity-70">{msg.userName}</p>
                            <p className="mt-0.5 text-sm">{msg.body}</p>
                            <p className="mt-0.5 text-right text-[10px] opacity-50">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <div className="flex items-center gap-2 border-t border-[var(--crm-border)] p-3">
                <input value={messageBody} onChange={(e) => onMessageBodyChange(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend(); } }}
                    placeholder="Type a message..." className="crm-command-input h-10 flex-1 px-3 text-sm" />
                <button type="button" onClick={onSend} disabled={!messageBody.trim()}
                    className="flex size-10 items-center justify-center rounded-xl bg-[var(--crm-gold)] text-black disabled:opacity-40">
                    <Send size={16} />
                </button>
            </div>
        </>
    );
}

```

## FILE: resources\js\features\inbox\components\NewConversationDrawer.tsx

```tsx
import { FormEvent } from 'react';
import { AppDrawer } from '@/components/ui/AppDrawer';
import { AppButton } from '@/components/ui/AppButton';
import { AppFormErrorSummary } from '@/components/ui/AppFormErrorSummary';
import { AppSelect } from '@/components/ui/AppSelect';
import type { FormErrors } from '@/lib/formErrors';
import { firstError } from '@/lib/formErrors';
import type { ChatUserOption } from '@/features/chat/types';

type Props = {
    isOpen: boolean;
    users: ChatUserOption[];
    formErrors: FormErrors;
    form: { user_id: string; subject: string };
    onOpenChange: (o: boolean) => void;
    onFormChange: (f: { user_id: string; subject: string }) => void;
    onSubmit: (e: FormEvent<HTMLFormElement>) => void;
};

export function NewConversationDrawer({ isOpen, users, formErrors, form, onOpenChange, onFormChange, onSubmit }: Props) {
    return (
        <AppDrawer isOpen={isOpen} onOpenChange={(o) => { onOpenChange(o); if (!o) onOpenChange(false); }}
            title="New conversation" description="Start a direct conversation with another user."
            footer={<><AppButton variant="secondary" onPress={() => onOpenChange(false)}>Cancel</AppButton><AppButton variant="primary" type="submit" form="new-conv-form">Create</AppButton></>}>
            <form id="new-conv-form" className="space-y-5" onSubmit={onSubmit}>
                <AppFormErrorSummary errors={formErrors} />
                <AppSelect label="User" placeholder="Select user" selectedKey={form.user_id} onSelectionChange={(v) => onFormChange({ ...form, user_id: v ? String(v) : '' })}
                    options={users.map((u) => ({ id: String(u.id), label: u.name }))} error={firstError(formErrors, 'user_ids.0')} />
                <AppSelect label="Subject (optional)" placeholder="e.g. Re: Task 42" selectedKey={form.subject} onSelectionChange={(v) => onFormChange({ ...form, subject: v ? String(v) : '' })}
                    options={[{ id: '', label: 'None' }, { id: 'General inquiry', label: 'General inquiry' }, { id: 'Task follow-up', label: 'Task follow-up' }]} />
            </form>
        </AppDrawer>
    );
}

```

## FILE: resources\js\features\notifications\helpers.ts

```ts
import {
    Bell,
    CalendarCheck,
    ClipboardList,
    CreditCard,
    FileText,
    Handshake,
    type LucideIcon,
    UserPlus,
} from 'lucide-react';
import type { EnrichedNotification, NotificationModule, NotificationRow, NotificationSeverity } from './types';

export const MODULE_ORDER: NotificationModule[] = ['tasks', 'requests', 'documents', 'contracts', 'finance', 'calendar', 'system'];

export const MODULE_LABELS: Record<NotificationModule, string> = {
    tasks: 'Tasks',
    requests: 'Requests',
    documents: 'Documents',
    contracts: 'Contracts',
    finance: 'Finance',
    calendar: 'Calendar',
    system: 'System',
};

export function getNotificationModule(n: NotificationRow): NotificationModule {
    const type = n.type;
    const data = n.data;

    if (type === 'TaskNotification' || data.task_id || data.task_number) return 'tasks';
    if (type === 'CalendarEventNotification' || data.calendar_event_id || data.event_number) return 'calendar';
    if (type === 'DocumentNotification' || data.document_number) return 'documents';
    if (type === 'ContractNotification' || data.contract_number) return 'contracts';
    if (type === 'FinanceDocumentNotification' || data.finance_number) return 'finance';
    if (data.finance_document_id || data.finance_number) return 'finance';
    if (data.suggestion) return 'system';
    if (data.conversation_id || data.sender_id) return 'system';

    return 'system';
}

export function getNotificationSeverity(n: NotificationRow, module: NotificationModule): NotificationSeverity {
    const data = n.data;
    const action = data.action as string | undefined;

    if (action === 'overdue') return 'urgent';
    if (action === 'blocked') return 'warning';
    if (action === 'completed' || action === 'accepted') return 'success';
    if (action === 'payment_received') return 'success';
    if (action === 'generated') return 'success';
    if (action === 'signed') return 'success';
    if (module === 'finance' && (action === 'overdue' || data.type === 'overdue')) return 'urgent';
    if (module === 'system' && action === 'warning') return 'warning';
    if (action === 'failed' || action === 'rejected') return 'urgent';
    if (action === 'cancelled') return 'warning';

    return 'info';
}

export function getNotificationText(n: NotificationRow): { title: string; body: string | null } {
    const type = n.type;
    const data = n.data;
    const description = (data.description as string) || '';
    const title = (data.title as string) || '';
    const action = (data.action as string) || '';
    const body = (data.body as string) || '';

    const actionLabels: Record<string, string> = {
        assigned: 'Task assigned',
        reassigned: 'Task reassigned',
        completed: 'Task completed',
        in_review: 'Ready for review',
        blocked: 'Task is blocked',
        overdue: 'Task overdue',
        due_tomorrow: 'Due tomorrow',
        mentioned: 'You were mentioned',
        status_changed: 'Status changed',
        uploaded: 'Document uploaded',
        status_changed: 'Status updated',
        created: 'Created',
        updated: 'Updated',
        generated: 'Document generated',
        signed: 'Contract signed',
        accepted: 'Quote accepted',
        rejected: 'Quote rejected',
        cancelled: 'Cancelled',
        converted: 'Converted to invoice',
        payment_received: 'Payment received',
    };

    const actionTitle = actionLabels[action];

    if (type === 'TaskNotification') {
        return {
            title: actionTitle || 'Task update',
            body: description || title || null,
        };
    }

    if (type === 'ChatMessageNotification') {
        return {
            title: (data.sender_name as string) || 'New message',
            body: body || description || null,
        };
    }

    if (type === 'CalendarEventNotification') {
        return {
            title: actionTitle || 'Calendar event',
            body: description || title || null,
        };
    }

    if (type === 'DocumentNotification') {
        return {
            title: actionTitle || 'Document update',
            body: description || (data.original_filename as string) || null,
        };
    }

    if (type === 'ContractNotification') {
        return {
            title: actionTitle || 'Contract update',
            body: description || null,
        };
    }

    if (type === 'FinanceDocumentNotification') {
        return {
            title: actionTitle || 'Finance update',
            body: description || null,
        };
    }

    if (data.suggestion) {
        return {
            title: 'New suggestion',
            body: description || null,
        };
    }

    return {
        title: actionTitle || description || type || 'Notification',
        body: null,
    };
}

export function getNotificationEntity(n: NotificationRow): { label: string | null; type: string | null; id: number | null } {
    const data = n.data;
    const taskNumber = data.task_number as string | undefined;
    const eventNumber = data.event_number as string | undefined;
    const docNumber = data.document_number as string | undefined;
    const contractNumber = data.contract_number as string | undefined;
    const financeNumber = data.finance_number as string | undefined;

    if (taskNumber) return { label: taskNumber, type: 'task', id: (data.task_id as number) || null };
    if (eventNumber) return { label: eventNumber, type: 'event', id: (data.calendar_event_id as number) || null };
    if (contractNumber) return { label: contractNumber, type: 'contract', id: (data.contract_id as number) || null };
    if (financeNumber) return { label: financeNumber, type: 'finance', id: (data.finance_document_id as number) || null };
    if (docNumber) return { label: docNumber, type: 'document', id: (data.document_id as number) || null };
    if (data.conversation_id) return { label: 'Conversation', type: 'chat', id: (data.conversation_id as number) || null };
    if (data.dossier_id) return { label: 'Dossier', type: 'dossier', id: (data.dossier_id as number) || null };

    return { label: null, type: null, id: null };
}

export function getNotificationIcon(module: NotificationModule): LucideIcon {
    const icons: Record<NotificationModule, LucideIcon> = {
        tasks: ClipboardList,
        requests: UserPlus,
        documents: FileText,
        contracts: Handshake,
        finance: CreditCard,
        calendar: CalendarCheck,
        system: Bell,
    };
    return icons[module];
}

export const SEVERITY_COLORS: Record<NotificationSeverity, { dot: string; bg: string; border: string }> = {
    info: { dot: 'bg-blue-400', bg: 'bg-blue-400/5', border: 'border-blue-400/15' },
    success: { dot: 'bg-emerald-400', bg: 'bg-emerald-400/5', border: 'border-emerald-400/15' },
    warning: { dot: 'bg-amber-400', bg: 'bg-amber-400/5', border: 'border-amber-400/15' },
    urgent: { dot: 'bg-red-400', bg: 'bg-red-400/5', border: 'border-red-400/15' },
};

export function formatNotificationTime(isoString: string): string {
    const now = Date.now();
    const date = new Date(isoString).getTime();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return 'just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(isoString).toLocaleDateString('en', { month: 'short', day: 'numeric' });
}

export type TimeGroup = 'now' | 'today' | 'yesterday' | 'earlier';

export const TIME_GROUP_LABELS: Record<TimeGroup, string> = {
    now: 'Now',
    today: 'Today',
    yesterday: 'Yesterday',
    earlier: 'Earlier',
};

export const TIME_GROUP_ORDER: TimeGroup[] = ['now', 'today', 'yesterday', 'earlier'];

export function groupNotificationsByTime(items: EnrichedNotification[]): Map<TimeGroup, EnrichedNotification[]> {
    const groups = new Map<TimeGroup, EnrichedNotification[]>();
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterdayStart = todayStart - 86400000;
    const twoDaysAgo = todayStart - 86400000;

    for (const item of items) {
        const createdAt = new Date(item.createdAt).getTime();
        let group: TimeGroup;
        if (createdAt >= todayStart) {
            group = now.getTime() - createdAt < 3600000 ? 'now' : 'today';
        } else if (createdAt >= yesterdayStart && createdAt < todayStart) {
            group = 'yesterday';
        } else {
            group = 'earlier';
        }
        if (!groups.has(group)) groups.set(group, []);
        groups.get(group)!.push(item);
    }

    return groups;
}

export function enrichNotification(n: NotificationRow): EnrichedNotification {
    const module = getNotificationModule(n);
    const severity = getNotificationSeverity(n, module);
    const { title, body } = getNotificationText(n);
    const entity = getNotificationEntity(n);
    return { ...n, module, severity, title, body, entityLabel: entity.label, entityType: entity.type, entityId: entity.id };
}

```

## FILE: resources\js\features\notifications\types.ts

```ts
export type NotificationRow = {
    id: string;
    type: string;
    data: Record<string, unknown>;
    readAt: string | null;
    isRead: boolean;
    createdAt: string;
    createdAtHuman: string;
    actionUrl: string | null;
};

export type NotificationModule = 'tasks' | 'requests' | 'documents' | 'contracts' | 'finance' | 'calendar' | 'system';

export type NotificationSeverity = 'info' | 'success' | 'warning' | 'urgent';

export type EnrichedNotification = NotificationRow & {
    module: NotificationModule;
    severity: NotificationSeverity;
    title: string;
    body: string | null;
    entityLabel: string | null;
    entityType: string | null;
    entityId: number | null;
};

```

## FILE: resources\js\features\tasks\components\TaskCard.tsx

```tsx
import { AlertTriangle, CalendarDays, CheckCircle2, CheckSquare, Link2, MessageSquare, MoreHorizontal, Paperclip } from 'lucide-react';
import { useState } from 'react';
import type { TaskRow, TaskStatus } from '@/features/tasks/types';
import {
    CATEGORY_COLORS, CATEGORY_LABELS, COLUMNS, IMPACT_COLORS, IMPACT_LABELS, PRIORITY_COLORS, PRIORITY_LABELS, STATUS_COLORS, STATUS_DOT_COLORS, STATUS_LABELS, TYPE_LABELS,
} from '@/features/tasks/types';
import { router } from '@inertiajs/react';

export function TaskCard({ task, onClick }: { task: TaskRow; onClick: () => void }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const isCompleted = task.status === 'completed';
    const isCancelled = task.status === 'cancelled';
    const isSoft = isCompleted || isCancelled;
    const overdue = task.dueDate && new Date(task.dueDate) < new Date() && !isCompleted && !isCancelled;
    const categoryClass = CATEGORY_COLORS[task.category] || CATEGORY_COLORS.general_admin;
    const checklistItems = Array.isArray(task.checklistItems) ? task.checklistItems : [];
    const checklistTotal = checklistItems.length;
    const checklistDone = checklistItems.filter((item) => item.isDone).length;
    const linkedRecord = task.dossier?.object || task.client?.name || null;

    return (
        <div className={`group relative rounded-xl border ${isSoft ? 'border-[var(--crm-border)] bg-[var(--crm-surface)]/50 opacity-60' : 'border-[var(--crm-border)] bg-[var(--crm-surface)] hover:border-[var(--crm-gold)]/40 hover:bg-[var(--crm-elevated)]'} transition-all`}>
            <button type="button" onClick={onClick} className="w-full p-3 text-left">
                <div className="mb-2 flex items-start justify-between gap-2">
                    <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                        <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${STATUS_COLORS[task.status]}`}>
                            <span className={`size-1.5 rounded-full ${STATUS_DOT_COLORS[task.status]}`} />
                            {STATUS_LABELS[task.status]}
                        </span>
                        <span className={`inline-flex items-center rounded-full border px-1.5 py-0.5 text-[9px] font-semibold ${PRIORITY_COLORS[task.priority] || ''}`}>
                            {PRIORITY_LABELS[task.priority] || task.priority}
                        </span>
                    </div>
                    <div className="relative shrink-0">
                        <button type="button" onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
                            className="flex size-6 items-center justify-center rounded-md text-[var(--crm-text-muted)] opacity-0 transition group-hover:opacity-100 hover:bg-[var(--crm-surface-3)]">
                            <MoreHorizontal size={14} />
                        </button>
                        {menuOpen ? (
                            <div className="absolute right-0 top-7 z-50 w-44 overflow-hidden rounded-xl border border-[var(--crm-border)] bg-[var(--crm-elevated)] p-1 shadow-2xl shadow-black/40"
                                onMouseLeave={() => setMenuOpen(false)}>
                                {COLUMNS.filter((s) => s !== task.status).map((status) => (
                                    <button key={status} type="button"
                                        onClick={(e) => { e.stopPropagation(); setMenuOpen(false); router.put(`/tasks/${task.id}/status`, { status }, { preserveScroll: true, preserveState: true }); }}
                                        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-semibold text-[var(--crm-text)] transition hover:bg-[var(--crm-surface)]">
                                        <span className={`size-2 rounded-full ${STATUS_DOT_COLORS[status]}`} />
                                        {STATUS_LABELS[status as TaskStatus]}
                                    </button>
                                ))}
                            </div>
                        ) : null}
                    </div>
                </div>

                <p className={`line-clamp-2 text-[13px] font-semibold leading-5 ${isSoft ? 'text-[var(--crm-text-muted)]' : 'text-[var(--crm-text)]'}`}>{task.title}</p>

                {task.description ? (
                    <p className="mt-1 line-clamp-1 text-[11px] text-[var(--crm-text-muted)]">{task.description}</p>
                ) : null}

                {linkedRecord ? (
                    <div className="mt-1.5 inline-flex items-center gap-1 rounded bg-black/10 px-1.5 py-0.5 text-[10px] text-[var(--crm-muted)]">
                        <Link2 size={10} />
                        <span className="truncate max-w-[140px]">{linkedRecord}</span>
                    </div>
                ) : null}

                <div className="mt-2 flex items-center justify-between gap-2">
                    <div className="flex -space-x-1">
                        {Array.isArray(task.assignees) ? task.assignees.slice(0, 3).map((a) => (
                            <div key={a.id} className="flex size-5 items-center justify-center rounded-full border-2 border-[var(--crm-surface)] bg-[var(--crm-gold)] text-[7px] font-bold text-black" title={a.name}>
                                {a.name.charAt(0).toUpperCase()}
                            </div>
                        )) : null}
                        {Array.isArray(task.assignees) && task.assignees.length > 3 ? (
                            <div className="flex size-5 items-center justify-center rounded-full border-2 border-[var(--crm-surface)] bg-[var(--crm-surface-2)] text-[7px] text-[var(--crm-text-muted-dark)]">
                                +{task.assignees.length - 3}
                            </div>
                        ) : null}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-[var(--crm-text-muted)]">
                        {task.dueDate ? (
                            <span className={`inline-flex items-center gap-1 ${overdue ? 'font-semibold text-red-400' : ''}`}>
                                <CalendarDays size={11} />
                                {task.dueDate}
                            </span>
                        ) : null}
                        {checklistTotal > 0 ? <span className="inline-flex items-center gap-1"><CheckSquare size={11} />{checklistDone}/{checklistTotal}</span> : null}
                        {task.commentsCount > 0 ? <span className="inline-flex items-center gap-1"><MessageSquare size={11} />{task.commentsCount}</span> : null}
                        {task.attachmentsCount > 0 ? <span className="inline-flex items-center gap-1"><Paperclip size={11} />{task.attachmentsCount}</span> : null}
                    </div>
                </div>

                {task.status === 'blocked' && task.blockedReason ? (
                    <div className="mt-2 flex gap-1.5 rounded-lg border border-red-400/15 bg-red-400/5 p-2 text-[10px] leading-4 text-red-200">
                        <AlertTriangle size={11} className="mt-0.5 shrink-0" />
                        <span className="line-clamp-1">{task.blockedReason}</span>
                    </div>
                ) : null}

                {isCompleted ? (
                    <div className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-emerald-400">
                        <CheckCircle2 size={11} /> Completed
                    </div>
                ) : null}
            </button>

            {(checklistTotal > 0 || task.progress > 0) && !isCompleted ? (
                <div className="h-1 bg-[var(--crm-surface-3)]">
                    <div className={`h-full ${isCancelled ? 'bg-zinc-500' : 'bg-[var(--crm-gold)]'}`} style={{ width: `${task.progress}%`, transition: 'width 0.2s' }} />
                </div>
            ) : null}
        </div>
    );
}

```

## FILE: resources\js\features\tasks\components\TaskDetailDrawer.tsx

```tsx
import { CalendarDays, CheckCircle2, CheckSquare, Clock3, ExternalLink, FileText, MessageSquare, Notebook, Paperclip, Plus, StickyNote, X } from 'lucide-react';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { router } from '@inertiajs/react';
import { AppDrawer } from '@/components/ui/AppDrawer';
import { AppButton } from '@/components/ui/AppButton';
import type { TaskRow } from '@/features/tasks/types';
import {
    CATEGORY_COLORS, CATEGORY_LABELS, IMPACT_COLORS, IMPACT_LABELS, PRIORITY_COLORS, PRIORITY_LABELS,
    STATUS_COLORS, STATUS_DOT_COLORS, STATUS_LABELS, TYPE_LABELS,
} from '@/features/tasks/types';

type Props = {
    task: TaskRow | null;
    onClose: () => void;
    onComplete: (task: TaskRow) => void;
    onChecklistToggle: (taskId: number, itemId: number) => void;
    onChecklistAdd: (taskId: number, label: string) => void;
    onCommentAdd: (taskId: number, body: string) => void;
    onAttachmentUpload: (taskId: number, file: File) => void;
};

type TabId = 'overview' | 'checklist' | 'comments' | 'files' | 'activity';

const TABS: { id: TabId; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'checklist', label: 'Checklist' },
    { id: 'comments', label: 'Comments' },
    { id: 'files', label: 'Files' },
    { id: 'activity', label: 'Activity' },
];

function Badge({ children, className }: { children: React.ReactNode; className: string }) {
    return <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${className}`}>{children}</span>;
}

export function TaskDetailDrawer({ task, onClose, onComplete, onChecklistToggle, onChecklistAdd, onCommentAdd, onAttachmentUpload }: Props) {
    const [tab, setTab] = useState<TabId>('overview');
    const [checklistLabel, setChecklistLabel] = useState('');
    const [commentBody, setCommentBody] = useState('');
    const [noteBody, setNoteBody] = useState('');
    const [attachment, setAttachment] = useState<File | null>(null);
    const [showNote, setShowNote] = useState(false);

    useEffect(() => {
        setTab('overview');
        setChecklistLabel('');
        setCommentBody('');
        setNoteBody('');
        setAttachment(null);
        setShowNote(false);
    }, [task?.id]);

    const links = useMemo(() => {
        if (!task) return [];
        return [
            task.client ? { label: `Client: ${task.client.name}`, href: `/clients/${task.client.id}` } : null,
            task.dossier ? { label: `Dossier: ${task.dossier.number}`, href: `/dossiers/${task.dossier.id}` } : null,
            task.conversationId ? { label: 'Conversation', href: '/inbox' } : null,
        ].filter(Boolean) as { label: string; href: string }[];
    }, [task]);

    const checklistItems = Array.isArray(task?.checklistItems) ? task.checklistItems : [];
    const doneCount = checklistItems.filter((i) => i.isDone).length;
    const isComplete = task?.status === 'completed' || task?.status === 'cancelled';

    if (!task) return null;

    const submitChecklist = (e: FormEvent) => { e.preventDefault(); if (!checklistLabel.trim()) return; onChecklistAdd(task.id, checklistLabel.trim()); setChecklistLabel(''); };
    const submitComment = (e: FormEvent) => { e.preventDefault(); if (!commentBody.trim()) return; onCommentAdd(task.id, commentBody.trim()); setCommentBody(''); };
    const submitNote = (e: FormEvent) => { e.preventDefault(); if (!noteBody.trim()) return; onCommentAdd(task.id, noteBody.trim()); setNoteBody(''); };
    const submitAttachment = (e: FormEvent) => { e.preventDefault(); if (!attachment) return; onAttachmentUpload(task.id, attachment); setAttachment(null); };

    return (
        <AppDrawer isOpen={!!task} onOpenChange={(o) => { if (!o) onClose(); }} size="lg"
            title={
                <div className="flex items-center gap-3 min-w-0">
                    <div>
                        <p className="text-sm font-bold text-[var(--crm-text)]">{task.title}</p>
                        <p className="text-[10px] text-[var(--crm-muted)]">{task.taskNumber}</p>
                    </div>
                </div>
            }
            footer={
                <div className="flex items-center gap-2">
                    <AppButton variant="secondary" onPress={onClose}>Close</AppButton>
                    {!isComplete ? (
                        <AppButton variant="primary" onPress={() => onComplete(task)}>
                            <CheckCircle2 size={14} /> Mark complete
                        </AppButton>
                    ) : null}
                </div>
            }>
            {/* Mini header */}
            <div className="mb-4 flex flex-wrap items-center gap-1.5">
                <Badge className={STATUS_COLORS[task.status]}>{STATUS_LABELS[task.status]}</Badge>
                <Badge className={PRIORITY_COLORS[task.priority]}>{PRIORITY_LABELS[task.priority]}</Badge>
                <Badge className={CATEGORY_COLORS[task.category]}>{CATEGORY_LABELS[task.category]}</Badge>
            </div>

            {/* Tabs */}
            <div className="mb-4 flex gap-1 border-b border-[var(--crm-border)]">
                {TABS.map((t) => (
                    <button key={t.id} type="button" onClick={() => setTab(t.id)}
                        className={`border-b-2 px-3 py-2 text-xs font-semibold transition ${tab === t.id ? 'border-[var(--crm-gold)] text-[var(--crm-gold)]' : 'border-transparent text-[var(--crm-text-muted)] hover:text-[var(--crm-text)]'}`}>
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Tab content */}
            {tab === 'overview' ? <OverviewTab task={task} links={links} /> : null}
            {tab === 'checklist' ? (
                <ChecklistTab task={task} checklistItems={checklistItems} doneCount={doneCount} isComplete={isComplete}
                    onToggle={(id) => onChecklistToggle(task.id, id)} onAdd={submitChecklist}
                    label={checklistLabel} onLabelChange={setChecklistLabel} />
            ) : null}
            {tab === 'comments' ? (
                <CommentsTab task={task} commentBody={commentBody} noteBody={noteBody} showNote={showNote}
                    onCommentChange={setCommentBody} onNoteChange={setNoteBody}
                    onSubmitComment={submitComment} onSubmitNote={submitNote}
                    onToggleNote={() => setShowNote(!showNote)} />
            ) : null}
            {tab === 'files' ? (
                <FilesTab task={task} attachment={attachment} onAttachmentChange={setAttachment} onSubmit={submitAttachment} />
            ) : null}
            {tab === 'activity' ? <ActivityTab task={task} /> : null}
        </AppDrawer>
    );
}

function OverviewTab({ task, links }: { task: TaskRow; links: { label: string; href: string }[] }) {
    const row = (label: string, val: string | number | null) => val ? (
        <div className="rounded-lg border border-[var(--crm-border)] bg-[var(--crm-surface)] px-3 py-2">
            <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-[var(--crm-muted)]">{label}</p>
            <p className="mt-0.5 text-sm font-semibold text-[var(--crm-text)]">{val}</p>
        </div>
    ) : null;

    return (
        <div className="space-y-4">
            <div className="grid gap-2 sm:grid-cols-2">
                {row('Type', TYPE_LABELS[task.type])}
                {row('Impact', IMPACT_LABELS[task.impact])}
                {row('Status', STATUS_LABELS[task.status])}
                {row('Progress', `${task.progress}%`)}
                {row('Start date', task.startDate)}
                {row('Due date', task.dueDate + (task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed' && task.status !== 'cancelled' ? ' (Overdue)' : ''))}
                {row('Estimated', task.estimatedMinutes ? `${task.estimatedMinutes} min` : null)}
                {row('Actual', task.actualMinutes ? `${task.actualMinutes} min` : null)}
            </div>

            {task.description ? (
                <div className="rounded-lg border border-[var(--crm-border)] bg-[var(--crm-surface)] px-3 py-2">
                    <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-[var(--crm-muted)]">Description</p>
                    <p className="mt-0.5 text-sm text-[var(--crm-text)]">{task.description}</p>
                </div>
            ) : null}

            {/* People */}
            <div className="rounded-xl border border-[var(--crm-border)] bg-[var(--crm-elevated)] p-3">
                <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.1em] text-[var(--crm-muted)]">People</p>
                <div className="flex flex-wrap gap-2">
                    {Array.isArray(task.assignees) && task.assignees.map((a) => (
                        <span key={a.id} className="inline-flex items-center gap-1.5 rounded-full border border-[var(--crm-border)] bg-[var(--crm-surface)] px-2.5 py-1 text-xs font-semibold">
                            <span className="flex size-5 items-center justify-center rounded-full bg-[var(--crm-gold)] text-[8px] font-bold text-black">{a.name.charAt(0)}</span>
                            {a.name}
                        </span>
                    ))}
                    {Array.isArray(task.watchers) && task.watchers.map((w) => (
                        <span key={w.id} className="inline-flex items-center gap-1 rounded-full border border-[var(--crm-border)] px-2.5 py-1 text-[10px] text-[var(--crm-text-muted)]">Watching: {w.name}</span>
                    ))}
                    {(!Array.isArray(task.assignees) || task.assignees.length === 0) && (!Array.isArray(task.watchers) || task.watchers.length === 0) ? (
                        <span className="text-xs text-[var(--crm-text-muted)]">No people assigned.</span>
                    ) : null}
                </div>
            </div>

            {/* Linked records */}
            {links.length > 0 ? (
                <div className="rounded-xl border border-[var(--crm-border)] bg-[var(--crm-elevated)] p-3">
                    <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.1em] text-[var(--crm-muted)]">Linked records</p>
                    <div className="flex flex-wrap gap-1.5">
                        {links.map((link) => (
                            <button key={link.href} type="button" onClick={() => router.visit(link.href)}
                                className="inline-flex items-center gap-1 rounded-lg border border-[var(--crm-border)] px-2.5 py-1.5 text-xs font-semibold text-[var(--crm-text)] transition hover:border-[var(--crm-gold)] hover:text-[var(--crm-gold)]">
                                <ExternalLink size={12} /> {link.label}
                            </button>
                        ))}
                    </div>
                </div>
            ) : null}

            {/* Quick actions */}
            {task.status !== 'completed' && task.status !== 'cancelled' ? (
                <div className="flex flex-wrap gap-1.5">
                    {[
                        { s: 'in_progress', l: 'Start' },
                        { s: 'waiting_client', l: 'Waiting client' },
                        { s: 'blocked', l: 'Blocked' },
                        { s: 'in_review', l: 'In review' },
                    ].filter((a) => a.s !== task.status).map((action) => (
                        <button key={action.s} type="button" onClick={() => router.put(`/tasks/${task.id}/status`, { status: action.s }, { preserveScroll: true, preserveState: true })}
                            className="inline-flex items-center gap-1 rounded-lg border border-[var(--crm-border)] px-2.5 py-1.5 text-[10px] font-semibold text-[var(--crm-text-muted)] transition hover:border-[var(--crm-gold)] hover:text-[var(--crm-gold)]">
                            {action.l}
                        </button>
                    ))}
                </div>
            ) : null}

            {task.blockedReason ? (
                <div className="rounded-lg border border-red-400/15 bg-red-400/5 px-3 py-2 text-xs text-red-200">
                    <p className="font-semibold">Blocked reason:</p>
                    <p>{task.blockedReason}</p>
                </div>
            ) : null}
        </div>
    );
}

function ChecklistTab({ task, checklistItems, doneCount, isComplete, onToggle, onAdd, label, onLabelChange }: {
    task: TaskRow;
    checklistItems: TaskRow['checklistItems'];
    doneCount: number;
    isComplete: boolean;
    onToggle: (id: number) => void;
    onAdd: (e: FormEvent) => void;
    label: string;
    onLabelChange: (v: string) => void;
}) {
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-[var(--crm-muted)]">Checklist {doneCount}/{checklistItems.length}</p>
                <span className="text-xs font-semibold text-[var(--crm-text-muted)]">{task.progress}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-[var(--crm-surface-3)]">
                <div className="h-full rounded-full bg-[var(--crm-gold)]" style={{ width: `${task.progress}%` }} />
            </div>
            {checklistItems.length > 0 ? (
                <div className="space-y-1">
                    {checklistItems.map((item) => (
                        <label key={item.id} className="flex items-center gap-2 rounded-lg border border-[var(--crm-border)] px-3 py-2 text-sm transition hover:bg-[var(--crm-surface)]">
                            <input type="checkbox" checked={item.isDone} onChange={() => onToggle(item.id)} className="accent-[var(--crm-gold)]" />
                            <span className={item.isDone ? 'text-[var(--crm-text-muted)] line-through' : 'text-[var(--crm-text)]'}>{item.label}</span>
                        </label>
                    ))}
                </div>
            ) : (
                <p className="rounded-lg border border-dashed border-[var(--crm-border)] px-3 py-3 text-sm text-[var(--crm-text-muted)]">No checklist items yet.</p>
            )}
            {!isComplete ? (
                <form onSubmit={onAdd} className="flex gap-2">
                    <input value={label} onChange={(e) => onLabelChange(e.target.value)} placeholder="Add checklist item"
                        className="min-w-0 flex-1 rounded-lg border border-[var(--crm-border)] bg-[var(--crm-surface)] px-3 py-2 text-sm text-[var(--crm-text)] outline-none placeholder:text-[var(--crm-muted)] focus:border-[var(--crm-gold)]" />
                    <AppButton variant="secondary" type="submit"><Plus size={14} /> Add</AppButton>
                </form>
            ) : null}
        </div>
    );
}

function CommentsTab({ task, commentBody, noteBody, showNote, onCommentChange, onNoteChange, onSubmitComment, onSubmitNote, onToggleNote }: {
    task: TaskRow;
    commentBody: string;
    noteBody: string;
    showNote: boolean;
    onCommentChange: (v: string) => void;
    onNoteChange: (v: string) => void;
    onSubmitComment: (e: FormEvent) => void;
    onSubmitNote: (e: FormEvent) => void;
    onToggleNote: () => void;
}) {
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-[var(--crm-muted)]">Comments ({task.commentsCount})</p>
                <button type="button" onClick={onToggleNote}
                    className="inline-flex items-center gap-1 text-[10px] font-semibold text-[var(--crm-muted)] hover:text-[var(--crm-gold)]">
                    <StickyNote size={12} /> {showNote ? 'Write comment' : 'Internal note'}
                </button>
            </div>
            {!showNote ? (
                <form onSubmit={onSubmitComment} className="space-y-2">
                    <textarea value={commentBody} onChange={(e) => onCommentChange(e.target.value)} placeholder="Write a comment or @mention someone..." rows={3}
                        className="w-full rounded-lg border border-[var(--crm-border)] bg-[var(--crm-surface)] px-3 py-2 text-sm text-[var(--crm-text)] outline-none placeholder:text-[var(--crm-muted)] focus:border-[var(--crm-gold)]" />
                    <AppButton variant="secondary" type="submit"><MessageSquare size={14} /> Add comment</AppButton>
                </form>
            ) : (
                <form onSubmit={onSubmitNote} className="space-y-2">
                    <textarea value={noteBody} onChange={(e) => onNoteChange(e.target.value)} placeholder="Internal note (team only)..." rows={3}
                        className="w-full rounded-lg border border-amber-400/20 bg-[var(--crm-surface)] px-3 py-2 text-sm text-[var(--crm-text)] outline-none placeholder:text-[var(--crm-muted)] focus:border-[var(--crm-gold)]" />
                    <AppButton variant="secondary" type="submit"><Notebook size={14} /> Add note</AppButton>
                </form>
            )}
            <p className="rounded-lg border border-dashed border-[var(--crm-border)] px-3 py-3 text-xs text-[var(--crm-text-muted)]">Previous comments appear after page reload.</p>
        </div>
    );
}

function FilesTab({ task, attachment, onAttachmentChange, onSubmit }: {
    task: TaskRow;
    attachment: File | null;
    onAttachmentChange: (f: File | null) => void;
    onSubmit: (e: FormEvent) => void;
}) {
    return (
        <div className="space-y-3">
            <p className="text-xs font-bold text-[var(--crm-muted)]">Attachments ({task.attachmentsCount})</p>
            <form onSubmit={onSubmit} className="flex flex-wrap items-center gap-2">
                <input type="file" onChange={(e) => onAttachmentChange(e.target.files?.[0] ?? null)}
                    className="min-w-0 flex-1 rounded-lg border border-[var(--crm-border)] bg-[var(--crm-surface)] px-3 py-2 text-xs text-[var(--crm-text)] file:mr-2 file:rounded file:border-0 file:bg-[var(--crm-gold)] file:px-2 file:py-0.5 file:text-[10px] file:font-bold file:text-black" />
                <AppButton variant="secondary" type="submit"><Paperclip size={14} /> Upload</AppButton>
            </form>
            <div className="rounded-lg border border-dashed border-[var(--crm-border)] px-4 py-6 text-center text-xs text-[var(--crm-text-muted)]">
                <FileText size={20} className="mx-auto mb-1 text-[var(--crm-muted)]" />
                {task.attachmentsCount > 0 ? `${task.attachmentsCount} file(s) attached. Reload to see.` : 'No files uploaded yet.'}
            </div>
        </div>
    );
}

function ActivityTab({ task }: { task: TaskRow }) {
    return (
        <div className="space-y-3">
            <p className="text-xs font-bold text-[var(--crm-muted)]">Activity log</p>
            <div className="space-y-2">
                {[
                    { icon: Plus, label: 'Task created', time: task.createdAt, color: 'text-blue-400' },
                    ...(task.completedAt ? [{ icon: CheckCircle2, label: 'Task completed', time: task.completedAt, color: 'text-emerald-400' as string }] : []),
                ].map((entry, i) => (
                    <div key={i} className="flex items-start gap-3">
                        <span className={`flex size-6 shrink-0 items-center justify-center rounded-full bg-[var(--crm-surface-3)] ${entry.color}`}><entry.icon size={12} /></span>
                        <div>
                            <p className="text-xs font-semibold text-[var(--crm-text)]">{entry.label}</p>
                            <p className="text-[10px] text-[var(--crm-text-muted)]">{entry.time}</p>
                        </div>
                    </div>
                ))}
            </div>
            <div className="rounded-lg border border-dashed border-[var(--crm-border)] px-4 py-4 text-center text-xs text-[var(--crm-text-muted)]">
                <Clock3 size={16} className="mx-auto mb-1 text-[var(--crm-muted)]" />
                Full activity timeline available with backend integration.
            </div>
        </div>
    );
}

```

## FILE: resources\js\features\tasks\types.ts

```ts
export type TaskStatus = 'backlog' | 'not_started' | 'in_progress' | 'waiting_client' | 'waiting_admin' | 'blocked' | 'in_review' | 'completed' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskImpact = 'low' | 'normal' | 'high' | 'critical';
export type TaskType = 'general' | 'missing_document' | 'client_follow_up' | 'contract' | 'authorization' | 'finance' | 'archive' | 'review' | 'internal_admin';
export type TaskCategory = 'documents' | 'client_follow_up' | 'contract' | 'authorization' | 'finance' | 'archive' | 'general_admin';

export type TaskRow = {
    id: number;
    taskNumber: string;
    title: string;
    description: string | null;
    type: TaskType;
    status: TaskStatus;
    priority: TaskPriority;
    impact: TaskImpact;
    progress: number;
    category: TaskCategory;
    startDate: string | null;
    dueDate: string | null;
    completedAt: string | null;
    reviewedAt: string | null;
    blockedReason: string | null;
    estimatedMinutes: number | null;
    actualMinutes: number | null;
    recurrenceRule: string | null;
    createdBy: { id: number; name: string } | null;
    assignees: { id: number; name: string }[];
    watchers: { id: number; name: string }[];
    checklistItems: { id: number; label: string; isDone: boolean; position: number }[];
    commentsCount: number;
    attachmentsCount: number;
    dossierId: number | null;
    clientId: number | null;
    conversationId: number | null;
    dossier: { id: number; number: string; object: string } | null;
    client: { id: number; name: string } | null;
    createdAt: string;
    updatedAt: string;
};

export type UserOption = {
    id: number;
    name: string;
    email: string;
};

export const STATUS_LABELS: Record<TaskStatus, string> = {
    backlog: 'Backlog',
    not_started: 'Not started',
    in_progress: 'In progress',
    waiting_client: 'Waiting client',
    waiting_admin: 'Waiting admin',
    in_review: 'In review',
    completed: 'Completed',
    blocked: 'Blocked',
    cancelled: 'Cancelled',
};

export const IMPACT_LABELS: Record<TaskImpact, string> = {
    low: 'Low',
    normal: 'Normal',
    high: 'High',
    critical: 'Critical',
};

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    urgent: 'Urgent',
};

export const CATEGORY_LABELS: Record<TaskCategory, string> = {
    documents: 'Documents',
    client_follow_up: 'Client follow-up',
    contract: 'Contract',
    authorization: 'Authorization',
    finance: 'Finance',
    archive: 'Archive',
    general_admin: 'General',
};

export const CATEGORY_COLORS: Record<TaskCategory, string> = {
    documents: 'text-blue-400 border-blue-400/20 bg-blue-400/10',
    client_follow_up: 'text-emerald-400 border-emerald-400/20 bg-emerald-400/10',
    contract: 'text-violet-400 border-violet-400/20 bg-violet-400/10',
    authorization: 'text-amber-400 border-amber-400/20 bg-amber-400/10',
    finance: 'text-rose-400 border-rose-400/20 bg-rose-400/10',
    archive: 'text-cyan-400 border-cyan-400/20 bg-cyan-400/10',
    general_admin: 'text-zinc-400 border-zinc-400/20 bg-zinc-400/10',
};

export const PRIORITY_COLORS: Record<TaskPriority, string> = {
    low: 'bg-zinc-500/20 text-zinc-300 border-zinc-500/25',
    medium: 'bg-blue-500/20 text-blue-300 border-blue-500/25',
    high: 'bg-amber-500/20 text-amber-300 border-amber-500/25',
    urgent: 'bg-red-500/20 text-red-300 border-red-500/25',
};

export const IMPACT_COLORS: Record<TaskImpact, string> = {
    low: 'bg-zinc-500/15 text-zinc-300 border-zinc-500/20',
    normal: 'bg-blue-500/15 text-blue-300 border-blue-500/20',
    high: 'bg-amber-500/15 text-amber-300 border-amber-500/20',
    critical: 'bg-red-500/15 text-red-300 border-red-500/20',
};

export const TYPE_LABELS: Record<TaskType, string> = {
    general: 'General',
    missing_document: 'Missing document',
    client_follow_up: 'Client follow-up',
    contract: 'Contract',
    authorization: 'Authorization',
    finance: 'Finance',
    archive: 'Archive',
    review: 'Review',
    internal_admin: 'Internal admin',
};

export const COLUMNS: TaskStatus[] = ['not_started', 'in_progress', 'waiting_client', 'waiting_admin', 'blocked', 'in_review', 'completed'];
export const BOARD_COLUMNS: TaskStatus[] = ['not_started', 'in_progress', 'waiting_client', 'waiting_admin', 'blocked', 'in_review', 'completed'];

export type ViewMode = 'overview' | 'board' | 'list' | 'table' | 'timeline' | 'calendar';

export const VIEW_OPTIONS: { id: ViewMode; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: 'LayoutDashboard' },
    { id: 'board', label: 'Board', icon: 'Columns3' },
    { id: 'list', label: 'List', icon: 'List' },
    { id: 'table', label: 'Table', icon: 'Table' },
    { id: 'timeline', label: 'Timeline', icon: 'CalendarDays' },
    { id: 'calendar', label: 'Calendar', icon: 'Calendar' },
];

export type TaskCommentRow = {
    id: number;
    body: string;
    isNote: boolean;
    user: { id: number; name: string } | null;
    createdAt: string;
    updatedAt: string;
};

export type TaskAttachmentRow = {
    id: number;
    originalFilename: string;
    filename: string;
    mimeType: string;
    size: number;
    sizeLabel: string | null;
    user: { id: number; name: string } | null;
    createdAt: string;
    downloadUrl: string | null;
};

export const STATUS_COLORS: Record<TaskStatus, string> = {
    backlog: 'bg-zinc-500/15 text-zinc-300 border-zinc-500/20',
    not_started: 'bg-zinc-500/15 text-zinc-300 border-zinc-500/20',
    in_progress: 'bg-blue-500/15 text-blue-300 border-blue-500/20',
    waiting_client: 'bg-violet-500/15 text-violet-300 border-violet-500/20',
    waiting_admin: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/20',
    in_review: 'bg-amber-500/15 text-amber-300 border-amber-500/20',
    completed: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
    blocked: 'bg-red-500/15 text-red-300 border-red-500/20',
    cancelled: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/15',
};

export const STATUS_DOT_COLORS: Record<TaskStatus, string> = {
    backlog: 'bg-zinc-400',
    not_started: 'bg-zinc-400',
    in_progress: 'bg-blue-400',
    waiting_client: 'bg-violet-400',
    waiting_admin: 'bg-cyan-400',
    in_review: 'bg-amber-400',
    completed: 'bg-emerald-400',
    blocked: 'bg-red-400',
    cancelled: 'bg-zinc-500',
};

export const STATUS_BG_COLORS: Record<TaskStatus, string> = {
    backlog: 'bg-zinc-500/5',
    not_started: 'bg-zinc-500/5',
    in_progress: 'bg-blue-500/5',
    waiting_client: 'bg-violet-500/5',
    waiting_admin: 'bg-cyan-500/5',
    in_review: 'bg-amber-500/5',
    completed: 'bg-emerald-500/5',
    blocked: 'bg-red-500/5',
    cancelled: 'bg-zinc-500/3',
};

```

## FILE: resources\js\lib\appRoutes.ts

```ts
import {
    Archive,
    BadgeDollarSign,
    Building2,
    FileCheck2,
    FileSpreadsheet,
    FileText,
    FolderKanban,
    LayoutDashboard,
    ReceiptText,
    CalendarDays,
    Settings,
    ShieldCheck,
    SlidersHorizontal,
    UserRound,
    Users,
    ListChecks,
    MessageSquare,
    Bell,
    FilePlus2,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type AppRouteKey =
    | 'dashboard'
    | 'clients'
    | 'intermediaries'
    | 'dossiers'
    | 'documents'
    | 'contracts'
    | 'authorizations'
    | 'finance'
    | 'financeDocuments'
    | 'financePayments'
    | 'financeMonthly'
    | 'financeTemplates'
    | 'financeSettings'
    | 'archives'
    | 'branches'
    | 'settings'
    | 'users'
    | 'tasks'
    | 'calendar'
    | 'taskRequests'
    | 'workload'
    | 'operationsReports'
    | 'inbox'
    | 'notifications';

export type AppRouteGroup = 'principal' | 'followUp' | 'management' | 'administration';

export type AppRoute = {
    key: AppRouteKey;
    labelKey: string;
    href: string;
    icon: LucideIcon;
    enabled: boolean;
    searchable: boolean;
    group: AppRouteGroup;
    badgeKey?: string;
};

export const appRoutes: AppRoute[] = [
    {
        key: 'dashboard',
        labelKey: 'nav.dashboard',
        href: '/',
        icon: LayoutDashboard,
        enabled: true,
        searchable: true,
        group: 'principal',
    },
    {
        key: 'clients',
        labelKey: 'nav.clients',
        href: '/clients',
        icon: Users,
        enabled: true,
        searchable: true,
        group: 'principal',
    },
    {
        key: 'intermediaries',
        labelKey: 'nav.intermediaries',
        href: '/intermediaries',
        icon: UserRound,
        enabled: true,
        searchable: true,
        group: 'principal',
    },
    {
        key: 'dossiers',
        labelKey: 'nav.dossiers',
        href: '/dossiers',
        icon: FolderKanban,
        enabled: true,
        searchable: true,
        group: 'principal',
    },
    {
        key: 'documents',
        labelKey: 'nav.documents',
        href: '/documents',
        icon: FileCheck2,
        enabled: true,
        searchable: true,
        group: 'followUp',
    },
    {
        key: 'contracts',
        labelKey: 'nav.contracts',
        href: '/contracts',
        icon: FileText,
        enabled: true,
        searchable: true,
        group: 'followUp',
    },
    {
        key: 'authorizations',
        labelKey: 'nav.authorizations',
        href: '/authorizations',
        icon: ShieldCheck,
        enabled: true,
        searchable: true,
        group: 'followUp',
    },
    {
        key: 'finance',
        labelKey: 'nav.finance',
        href: '/finance',
        icon: BadgeDollarSign,
        enabled: true,
        searchable: true,
        group: 'management',
    },
    {
        key: 'financeDocuments',
        labelKey: 'nav.financeDocuments',
        href: '/finance/documents',
        icon: FileSpreadsheet,
        enabled: true,
        searchable: true,
        group: 'management',
    },
    {
        key: 'financePayments',
        labelKey: 'nav.financePayments',
        href: '/finance/payments',
        icon: ReceiptText,
        enabled: true,
        searchable: true,
        group: 'management',
    },
    {
        key: 'financeMonthly',
        labelKey: 'nav.financeMonthly',
        href: '/finance/documents?tab=monthly',
        icon: CalendarDays,
        enabled: true,
        searchable: true,
        group: 'management',
    },

    {
        key: 'financeTemplates',
        labelKey: 'nav.financeTemplates',
        href: '/finance/templates',
        icon: FileText,
        enabled: true,
        searchable: true,
        group: 'management',
    },
    {
        key: 'financeSettings',
        labelKey: 'nav.financeSettings',
        href: '/finance/settings',
        icon: SlidersHorizontal,
        enabled: true,
        searchable: true,
        group: 'management',
    },
    {
        key: 'archives',
        labelKey: 'nav.archives',
        href: '/archives',
        icon: Archive,
        enabled: true,
        searchable: true,
        group: 'management',
    },
    {
        key: 'tasks',
        labelKey: 'nav.tasks',
        href: '/tasks',
        icon: ListChecks,
        enabled: true,
        searchable: true,
        group: 'followUp',
    },
    {
        key: 'calendar',
        labelKey: 'nav.calendar',
        href: '/calendar',
        icon: CalendarDays,
        enabled: true,
        searchable: true,
        group: 'followUp',
    },
    {
        key: 'taskRequests',
        labelKey: 'nav.taskRequests',
        href: '/task-requests',
        icon: FilePlus2,
        enabled: true,
        searchable: true,
        group: 'followUp',
    },
    {
        key: 'workload',
        labelKey: 'nav.workload',
        href: '/workload',
        icon: Users,
        enabled: true,
        searchable: true,
        group: 'followUp',
    },
    {
        key: 'operationsReports',
        labelKey: 'nav.operationsReports',
        href: '/operations/reports',
        icon: CalendarDays,
        enabled: true,
        searchable: true,
        group: 'followUp',
    },
    {
        key: 'inbox',
        labelKey: 'nav.inbox',
        href: '/inbox',
        icon: MessageSquare,
        enabled: true,
        searchable: true,
        group: 'management',
    },
    {
        key: 'notifications',
        labelKey: 'nav.notifications',
        href: '/notifications',
        icon: Bell,
        enabled: true,
        searchable: true,
        group: 'administration',
    },
    {
        key: 'users',
        labelKey: 'nav.users',
        href: '/admin/users',
        icon: Users,
        enabled: true,
        searchable: true,
        group: 'administration',
    },
    {
        key: 'branches',
        labelKey: 'nav.branches',
        href: '#',
        icon: Building2,
        enabled: false,
        searchable: false,
        group: 'administration',
        badgeKey: 'app.soon',
    },
    {
        key: 'settings',
        labelKey: 'nav.settings',
        href: '#',
        icon: Settings,
        enabled: false,
        searchable: false,
        group: 'administration',
        badgeKey: 'app.soon',
    },
];

export function isValidHref(href: unknown): href is string {
    return typeof href === 'string' && href.trim().length > 0 && href !== '#';
}

function splitRoutePath(path: string) {
    const [pathname, query = ''] = path.split('?');

    return {
        pathname,
        query,
        params: new URLSearchParams(query),
    };
}

export function isActivePath(currentPath: string, itemPath: string) {
    if (!isValidHref(itemPath)) {
        return false;
    }

    const current = splitRoutePath(currentPath);
    const item = splitRoutePath(itemPath);

    if (item.pathname === '/') {
        return current.pathname === '/';
    }

    if (item.query) {
        if (current.pathname !== item.pathname) {
            return false;
        }

        return Array.from(item.params.entries()).every(
            ([key, value]) => current.params.get(key) === value,
        );
    }

    if (item.pathname === '/finance') {
        return current.pathname === '/finance' && !current.query;
    }

    return current.pathname === item.pathname || current.pathname.startsWith(`${item.pathname}/`);
}

```

## FILE: resources\js\lib\i18n.ts

```ts
import { en } from '@/locales/en';

const messages = en;

type ReplaceValues = Record<string, string | number>;

function getByPath(source: unknown, path: string): unknown {
    return path.split('.').reduce<unknown>((current, part) => {
        if (!current || typeof current !== 'object') {
            return undefined;
        }

        return (current as Record<string, unknown>)[part];
    }, source);
}

export function t(key: string, values?: ReplaceValues): string {
    const value = getByPath(messages, key);
    const text = typeof value === 'string' ? value : key;

    if (!values) {
        return text;
    }

    return text.replace(/\{(\w+)\}/g, (_, name: string) => {
        const replacement = values[name];
        return replacement === undefined ? `{${name}}` : String(replacement);
    });
}

export function useTranslation() {
    return { t };
}

```

## FILE: resources\js\lib\prototypeActions.ts

```ts
import { router } from '@inertiajs/react';
import { toast } from 'sonner';

export function prototypeNavigate(href: string, message = 'Opening page...') {
    toast.info(message);
    router.visit(href);
}

export function prototypeToast(message: string, type: 'info' | 'success' | 'error' = 'info') {
    if (type === 'success') {
        toast.success(message);
        return;
    }

    if (type === 'error') {
        toast.error(message);
        return;
    }

    toast.info(message);
}

export function prototypeDownload(fileName: string, content = 'ARCHI LBO prototype file') {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');

    anchor.href = url;
    anchor.download = fileName;
    anchor.click();

    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${fileName}`);
}

export function prototypeNotReady(action = 'This action') {
    toast.info(`${action} will be connected after backend/database implementation.`);
}

```

## FILE: resources\js\locales\en.ts

```ts
export const en = {
    app: {
        name: 'ARCHI LBO OS',
        shortName: 'ARCHI LBO',
        description: 'Architecture office operating system',
        searchPlaceholder: 'Search clients, projects, documents...',
        theme: 'Theme',
        light: 'Light',
        dark: 'Dark',
        soon: 'Soon',
        userMenu: 'User menu',
        noData: 'No data',
    },

    nav: {
        groups: {
            principal: 'Main',
            followUp: 'Follow-up',
            management: 'Management',
            administration: 'Administration',
        },
        dashboard: 'Dashboard',
        clients: 'Clients',
        intermediaries: 'Intermediaries',
        dossiers: 'Projects',
        contracts: 'Contracts',
        planning: 'Planning',
        authorizations: 'Authorizations',
        documents: 'Documents',
        archives: 'Archives',
        finance: 'Finance',
        financeOverview: 'Overview',
        financePayments: 'Payments',
        financeMonthly: 'Monthly summary',
        financeTemplates: 'Templates',
        financeDocuments: 'Finance documents',
        financeSettings: 'Finance settings',
        tasks: 'Tasks',
        calendar: 'Calendar',
        taskRequests: 'Requests',
        workload: 'Workload',
        operationsReports: 'Operations reports',
        inbox: 'Inbox',
        notifications: 'Notifications',
        users: 'Users',
        branches: 'Branches',
        settings: 'Settings',
    },
    calendar: {
        eyebrow: 'Operations calendar',
        title: 'Calendar',
        subtitle: 'Schedule, tasks, reminders, meetings, and follow-ups across all CRM modules.',
        today: 'Today',
        month: 'Month',
        week: 'Week',
        day: 'Day',
        newEvent: 'New event',
        search: 'Search events...',
        noEvents: 'No events',
        eventType: 'Event type',
        allTypes: 'All types',
        user: 'User',
        allUsers: 'All',
        dueToday: 'Due today',
        overdue: 'Overdue',
        upcoming: 'Upcoming',
        noDate: 'No date',
        eventTypes: {
            task: 'Task',
            note: 'Note',
            reminder: 'Reminder',
            meeting: 'Meeting',
            deadline: 'Deadline',
            client_follow_up: 'Client follow-up',
            finance_follow_up: 'Finance follow-up',
            authorization_follow_up: 'Authorization follow-up',
            contract_follow_up: 'Contract follow-up',
            archive_follow_up: 'Archive follow-up',
        },
    },

    actions: {
        continue: 'Continue',
        startPrototype: 'Start prototype',
        newClient: 'New client',
        newProject: 'New project',
        open: 'Open',
        toggleTheme: 'Toggle theme',
        view: 'View',
        edit: 'Edit',
        delete: 'Delete',
        create: 'Create',
        save: 'Save',
        cancel: 'Cancel',
        more: 'More',
        export: 'Export',
        filter: 'Filter',
        download: 'Download',
        upload: 'Upload',
        documents: 'Documents',
        archive: 'Archive',
        clearSearch: 'Clear search',
        next: 'Next',
        previous: 'Previous',
        generate: 'Generate',
        verify: 'Verify',
        reject: 'Reject',
        submit: 'Submit',
        addNote: 'Add note',
        updateStatus: 'Update status',
        createProject: 'Create project',
        close: 'Close',
        confirmDelete: 'Confirm delete',
    },

    common: {
        status: 'Status',
        progress: 'Progress',
        updatedAt: 'Updated',
        actions: 'Actions',
        search: 'Search',
        all: 'All',
        active: 'Active',
        inactive: 'Inactive',
        archived: 'Archived',
        pending: 'Pending',
        completed: 'Completed',
        blocked: 'Blocked',
        missing: 'Missing',
        ready: 'Ready',
        amount: 'Amount',
        notes: 'Notes',
    },

    dashboard: {
        eyebrow: 'Command center',
        title: 'Dashboard',
        subtitle: 'Live overview of projects, documents, authorizations, finance, and daily actions.',
        introTitle: 'Interface foundation is ready',
        introText: 'This screen uses local translations instead of static text. The next step is to build the Projects page using the same shared components.',
        metrics: {
            clients: {
                label: 'Clients',
                value: '0',
                description: 'No real data yet',
            },
            dossiers: {
                label: 'Projects',
                value: '0',
                description: 'No real data yet',
            },
            documents: {
                label: 'Documents',
                value: '0',
                description: 'No real data yet',
            },
        },
        sections: {
            sampleField: 'React Aria field',
            sampleSelect: 'React Aria select',
        },
        fields: {
            clientName: 'Client name',
            clientNamePlaceholder: 'Example: Mohamed Ouknin',
            status: 'Status',
        },
        statuses: {
            new: 'New',
            active: 'Active',
            archived: 'Archived',
        },
    },

    clients: {
        eyebrow: 'Client CRM',
        title: 'Clients',
        subtitle: 'Manage owners, CIN details, contacts, project history, and client follow-up.',
        newClient: 'New client',
        editClient: 'Edit client',
        deleteClient: 'Delete client',
        searchPlaceholder: 'Search by name, CIN, phone, address, or intermediary...',
        emptyTitle: 'No clients found',
        emptyDescription: 'Create your first client to start building project files.',
        table: {
            client: 'Client',
            cin: 'CIN',
            phone: 'Phone',
            address: 'Address',
            status: 'Status',
            projects: 'Projects',
            updated: 'Updated',
            actions: 'Actions',
        },
        metrics: {
            total: 'Total clients',
            active: 'Active',
            thisMonth: 'This month',
            archived: 'Archived',
        },
        status: {
            active: 'Active',
            inactive: 'Inactive',
            archived: 'Archived',
        },
        form: {
            identity: 'Identity',
            contact: 'Contact',
            extra: 'Additional information',
            civility: 'Civility',
            firstName: 'First name',
            lastName: 'Last name',
            cin: 'CIN',
            phone: 'Phone',
            email: 'Email',
            address: 'Address',
            fatherName: 'Father name',
            cniExpirationDate: 'CNI expiration date',
            intermediaryName: 'Intermediary',
            notes: 'Notes',
            firstNamePlaceholder: 'Example: Mohamed',
            lastNamePlaceholder: 'Example: Ouknin',
            cinPlaceholder: 'Example: EE123456',
            phonePlaceholder: 'Example: +212 6 11 22 33 44',
            emailPlaceholder: 'Example: client@email.com',
            addressPlaceholder: 'Client address',
            notesPlaceholder: 'Internal notes about this client',
        },
        drawer: {
            createTitle: 'Create client',
            createDescription: 'Add a new client profile. Backend saving will be connected later.',
            editTitle: 'Edit client',
            editDescription: 'Update client information. Backend saving will be connected later.',
        },
        confirmDelete: {
            title: 'Delete client?',
            description: 'This is only a prototype action for now. Backend delete will be connected later.',
        },
        toast: {
            created: 'Client created successfully.',
            updated: 'Client updated successfully.',
            deleted: 'Client deleted.',
            view: 'Opening client details...',
            createProject: 'Create project action clicked.',
        },
    },

    intermediaries: {
        eyebrow: 'Client network',
        title: 'Intermediaries',
        subtitle: 'Manage agencies, partners, and people who bring or follow client files.',
    },

    dossiers: {
        eyebrow: 'Project workspace',
        title: 'Projects',
        subtitle: 'Track architecture files from client request to authorization, closure, archive, and finance.',
        pageTitle: 'Projects',
        newProject: 'New project',
        searchPlaceholder: 'Search by project, client, CIN, commune, or file number...',
        emptyTitle: 'No projects found',
        emptyDescription: 'Create your first project to start tracking contracts, documents, authorizations, and finance.',
        table: {
            project: 'Project',
            client: 'Client',
            commune: 'Commune',
            status: 'Status',
            contract: 'Contract',
            authorization: 'Authorization',
            progress: 'Progress',
            updated: 'Updated',
            actions: 'Actions',
        },
        metrics: {
            total: 'Total projects',
            active: 'Active',
            authorization: 'Authorization',
            finance: 'Finance follow-up',
        },
        status: {
            new: 'New',
            documentsRequired: 'Docs required',
            readyForContract: 'Ready contract',
            contractGenerated: 'Contract generated',
            authorizationProgress: 'Authorization',
            closed: 'Closed',
            archived: 'Archived',
            blocked: 'Blocked',
        },
        contract: {
            missing: 'Missing',
            calculation: 'Calculation',
            generated: 'Generated',
            signed: 'Signed',
            completed: 'Completed',
        },
        authorization: {
            notStarted: 'Not started',
            preparing: 'Preparing',
            submitted: 'Submitted',
            observations: 'Observations',
            approved: 'Approved',
            received: 'Received',
        },
        toast: {
            newProject: 'New project action clicked.',
            view: 'Opening project details...',
            edit: 'Opening project editor...',
            documents: 'Opening project documents...',
            archive: 'Archive action clicked.',
            export: 'Export action clicked.',
        },
    },

    dossierWorkspace: {
        eyebrow: 'Project file',
        titleFallback: 'Project workspace',
        subtitle: 'Central workspace for client data, property information, required documents, contract, authorization, planning, finance, and notes.',
        backToProjects: 'Back to projects',
        openDocuments: 'Open documents',
        editProject: 'Edit project',
        tabs: {
            overview: 'Overview',
            client: 'Client',
            property: 'Property',
            documents: 'Required docs',
            contract: 'Contract',
            planning: 'Planning',
            authorization: 'Authorization',
            finance: 'Finance',
            notes: 'Notes',
        },
        summary: {
            client: 'Client',
            cin: 'CIN',
            commune: 'Commune',
            landSurface: 'Land surface',
            floorArea: 'Floor area',
            progress: 'Progress',
            nextAction: 'Next action',
            nextActionValue: 'Complete missing documents before contract generation.',
        },
        overview: {
            title: 'Project overview',
            description: 'Fast view of the project status, next actions, and operational progress.',
            workflowHealth: 'Workflow health',
            documentReadiness: 'Document readiness',
            contractReadiness: 'Contract readiness',
            authorizationReadiness: 'Authorization readiness',
        },
        client: {
            title: 'Client information',
            description: 'Main client data used for contracts and official documents.',
            fullName: 'Full name',
            phone: 'Phone',
            address: 'Address',
            intermediary: 'Intermediary',
        },
        property: {
            title: 'Property information',
            description: 'Core property information needed for architectural and administrative workflow.',
            projectObject: 'Project object',
            address: 'Project address',
            province: 'Province / Prefecture',
            commune: 'Commune',
            titleNumber: 'Title number',
            landSurface: 'Land surface',
            floorArea: 'Floor area',
        },
        documents: {
            title: 'Required documents',
            description: 'Checklist of documents required before moving the project forward.',
            cni: 'CNI',
            ownership: 'Ownership certificate',
            cadastral: 'Cadastral plan',
            surface: 'Surface calculation',
            uploaded: 'Uploaded',
            verified: 'Verified',
            missing: 'Missing',
            rejected: 'Rejected',
        },
        contract: {
            title: 'Contract tracking',
            description: 'Contract calculation, generation, signature, submission, and return tracking.',
            calculation: 'Calculation',
            generation: 'Generation',
            signature: 'Signature',
            submission: 'Submission',
            returned: 'Returned',
            amount: 'Contract amount',
            tva: 'TVA',
            total: 'Total TTC',
        },
        planning: {
            title: 'Planning',
            description: 'Simple internal steps to keep the project moving.',
            collectDocs: 'Collect documents',
            verifyProperty: 'Verify property',
            prepareContract: 'Prepare contract',
            submitFile: 'Submit authorization file',
            followObservations: 'Follow observations',
        },
        authorization: {
            title: 'Authorization',
            description: 'Administrative authorization status and observations.',
            currentStatus: 'Current status',
            authority: 'Authority',
            submissionNumber: 'Submission number',
            observations: 'Observations',
        },
        finance: {
            title: 'Finance',
            description: 'Devis, invoices, payments, and remaining balance overview.',
            devis: 'Devis',
            invoices: 'Invoices',
            paid: 'Paid',
            remaining: 'Remaining',
        },
        notes: {
            title: 'Internal notes',
            description: 'Internal comments and decisions related to this project.',
            pinned: 'Pinned',
            warning: 'Warning',
            general: 'General',
        },
        toast: {
            edit: 'Project editor will be added later.',
            documents: 'Documents workspace will be connected later.',
            note: 'Note action clicked.',
            status: 'Status update action clicked.',
            verify: 'Document verification action clicked.',
            generate: 'Contract generation action clicked.',
        },
    },

    clientDetails: {
        eyebrow: 'Client profile',
        titleFallback: 'Client workspace',
        subtitle: 'Central workspace for client identity, projects, documents, notes, and activity.',
        backToClients: 'Back to clients',
        editClient: 'Edit client',
        createProject: 'Create project',
        uploadDocument: 'Upload document',
        tabs: {
            overview: 'Overview',
            projects: 'Projects',
            documents: 'Documents',
            notes: 'Notes',
            activity: 'Activity',
        },
        summary: {
            clientNumber: 'Client number',
            cin: 'CIN',
            phone: 'Phone',
            projects: 'Projects',
            status: 'Status',
            lastUpdate: 'Last update',
        },
        overview: {
            title: 'Client overview',
            description: 'Quick profile summary, contact data, project activity, and next actions.',
            identity: 'Identity',
            contact: 'Contact',
            followUp: 'Follow-up',
            fullName: 'Full name',
            email: 'Email',
            address: 'Address',
            fatherName: 'Father name',
            cniExpirationDate: 'CNI expiration',
            intermediaryName: 'Intermediary',
            nextAction: 'Next action',
            nextActionValue: 'Review client documents and create or update the active project file.',
        },
        projects: {
            title: 'Client projects',
            description: 'Projects linked to this client. Backend relation will be connected later.',
            emptyTitle: 'No projects linked',
            emptyDescription: 'Create a project from this client profile when backend is connected.',
            project: 'Project',
            commune: 'Commune',
            status: 'Status',
            progress: 'Progress',
            updated: 'Updated',
        },
        documents: {
            title: 'Client documents',
            description: 'Client-level files such as CNI and profile documents.',
            cni: 'CNI copy',
            profile: 'Client information',
            intermediary: 'Intermediary file',
            uploaded: 'Uploaded',
            missing: 'Missing',
            verified: 'Verified',
        },
        notes: {
            title: 'Notes',
            description: 'Internal notes and follow-up information about this client.',
            pinned: 'Pinned note',
            warning: 'Warning',
            general: 'General note',
        },
        activity: {
            title: 'Activity',
            description: 'Recent actions related to this client.',
            created: 'Client profile created',
            projectCreated: 'Project file created',
            documentUploaded: 'Document uploaded',
            contractPrepared: 'Contract preparation started',
        },
        toast: {
            edit: 'Client editor opened.',
            createProject: 'Create project action clicked.',
            uploadDocument: 'Upload document action clicked.',
            openProject: 'Opening project workspace...',
            addNote: 'Note action clicked.',
        },
    },
    projectForm: {
        drawer: {
            createTitle: 'Create project',
            createDescription: 'Create a new architecture project file. Backend saving will be connected later.',
            editTitle: 'Edit project',
            editDescription: 'Update project information. Backend saving will be connected later.',
        },
        sections: {
            client: 'Client',
            project: 'Project',
            property: 'Property',
            workflow: 'Workflow',
            notes: 'Notes',
        },
        fields: {
            client: 'Client',
            projectObject: 'Project object',
            projectAddress: 'Project address',
            province: 'Province / Prefecture',
            commune: 'Commune',
            landTitleNumber: 'Land title number',
            landSurface: 'Land surface',
            floorArea: 'Floor area',
            status: 'Initial status',
            notes: 'Notes',
        },
        placeholders: {
            projectObject: 'Example: Villa construction study',
            projectAddress: 'Project address',
            province: 'Example: Marrakech',
            commune: 'Example: Marrakech',
            landTitleNumber: 'Example: TF-88421/M',
            landSurface: 'Example: 420',
            floorArea: 'Example: 280',
            notes: 'Internal project notes',
        },
        statusOptions: {
            new: 'New',
            documentsRequired: 'Documents required',
            readyForContract: 'Ready for contract',
        },
        toast: {
            created: 'Project created successfully.',
            updated: 'Project updated successfully.',
        },
    },
    documentsWorkspace: {
        eyebrow: 'Required documents',
        title: 'Documents',
        subtitle: 'Manage required client and project documents before contracts, authorization, closure, and archive.',
        uploadDocument: 'Upload document',
        exportList: 'Export list',
        searchPlaceholder: 'Search by document, client, project, CIN, or status...',
        emptyTitle: 'No documents found',
        emptyDescription: 'Upload or create required document records to start document tracking.',
        metrics: {
            total: 'Total documents',
            verified: 'Verified',
            missing: 'Missing',
            rejected: 'Rejected',
        },
        table: {
            document: 'Document',
            project: 'Project',
            client: 'Client',
            type: 'Type',
            status: 'Status',
            updated: 'Updated',
            actions: 'Actions',
        },
        types: {
            cni: 'CNI',
            ownership: 'Ownership certificate',
            cadastral: 'Cadastral plan',
            surface: 'Surface calculation',
            contract: 'Contract',
            authorization: 'Authorization',
        },
        status: {
            missing: 'Missing',
            uploaded: 'Uploaded',
            verified: 'Verified',
            rejected: 'Rejected',
            expired: 'Expired',
        },
        cards: {
            cniTitle: 'Client identity',
            cniDescription: 'CNI copy and identity data required for contracts.',
            ownershipTitle: 'Ownership',
            ownershipDescription: 'Ownership certificate and property proof.',
            cadastralTitle: 'Cadastral',
            cadastralDescription: 'Cadastral plan and land references.',
            surfaceTitle: 'Surface',
            surfaceDescription: 'Surface calculation and plancher values.',
        },
        preview: {
            title: 'Document preview',
            emptyTitle: 'No document selected',
            emptyDescription: 'Select a document from the list or upload a file to preview metadata here.',
            selectedTitle: 'Selected document',
            fileName: 'File name',
            fileSize: 'File size',
            uploadedBy: 'Uploaded by',
            uploadedAt: 'Uploaded at',
        },
        checklist: {
            title: 'Readiness checklist',
            description: 'Operational checklist before contract generation.',
            cni: 'Client CNI is verified',
            ownership: 'Ownership certificate is verified',
            cadastral: 'Cadastral plan is available',
            surface: 'Surface calculation is ready',
            contractReady: 'Contract can be generated',
        },
        upload: {
            title: 'Upload zone',
            description: 'Choose a file to simulate upload. Backend storage will be connected later.',
            chooseFile: 'Choose file',
            accepted: 'PDF, DOCX, XLSX, JPG, PNG',
        },
        toast: {
            upload: 'Upload action clicked.',
            fileSelected: 'File selected.',
            view: 'Opening document preview...',
            verify: 'Document verified.',
            reject: 'Document rejected.',
            download: 'Download action clicked.',
            export: 'Export action clicked.',
        },
    },
    contractsWorkspace: {
        eyebrow: 'Contracts',
        title: 'Contracts',
        subtitle: 'Prepare contract calculations, generate official DOCX/PDF files, and track contract signature workflow.',
        newContract: 'New contract',
        generateDocx: 'Generate DOCX',
        generatePdf: 'Generate PDF',
        exportList: 'Export list',
        searchPlaceholder: 'Search by contract, client, project, CIN, or status...',
        emptyTitle: 'No contracts found',
        emptyDescription: 'Create a contract calculation from an approved project file.',
        metrics: {
            total: 'Total contracts',
            generated: 'Generated',
            signed: 'Signed',
            pending: 'Pending',
        },
        table: {
            contract: 'Contract',
            project: 'Project',
            client: 'Client',
            amount: 'Amount',
            status: 'Status',
            updated: 'Updated',
            actions: 'Actions',
        },
        status: {
            draft: 'Draft',
            calculated: 'Calculated',
            generated: 'Generated',
            givenToClient: 'Given to client',
            signed: 'Signed',
            submitted: 'Submitted',
            returned: 'Returned',
            completed: 'Completed',
            cancelled: 'Cancelled',
        },
        calculator: {
            title: 'Contract calculation',
            description: 'Prototype calculation for architectural fees. Backend formulas and template rules will be connected later.',
            surface: 'Floor area',
            pricePerMeter: 'Price per mÂ²',
            estimation: 'Estimated amount',
            honorairesRate: 'Fee rate',
            ht: 'HT amount',
            tvaRate: 'TVA rate',
            tvaAmount: 'TVA amount',
            ttc: 'Total TTC',
            currency: 'MAD',
            lock: 'Lock calculation',
            reset: 'Reset',
        },
        preview: {
            title: 'Contract preview',
            description: 'Official document preview placeholder. Real DOCX/PDF generation will use uploaded templates later.',
            fileName: 'File name',
            template: 'Template',
            version: 'Version',
            lastGenerated: 'Last generated',
            noPreview: 'No generated file selected',
        },
        workflow: {
            title: 'Contract workflow',
            description: 'Track the contract from calculation to client signature and return.',
            calculation: 'Calculation',
            docxGenerated: 'DOCX generated',
            pdfGenerated: 'PDF exported',
            givenToClient: 'Given to client',
            ownerSigned: 'Owner signed',
            submitted: 'Submitted to authority',
            returned: 'Returned to office',
        },
        cards: {
            templateTitle: 'Official template',
            templateDescription: 'Real DOCX template with placeholders.',
            versionTitle: 'Versions',
            versionDescription: 'Keep regenerated versions safely.',
            pdfTitle: 'PDF export',
            pdfDescription: 'LibreOffice conversion will be connected later.',
        },
        toast: {
            newContract: 'New contract action clicked.',
            generateDocx: 'DOCX generation simulated.',
            generatePdf: 'PDF export simulated.',
            lock: 'Calculation locked.',
            reset: 'Calculation reset.',
            view: 'Opening contract preview...',
            edit: 'Opening contract editor...',
            download: 'Download action clicked.',
            export: 'Export action clicked.',
        },
    },
    authorizationsWorkspace: {
        eyebrow: 'Authorizations',
        title: 'Authorizations',
        subtitle: 'Track administrative submissions, observations, approvals, and received authorization files.',
        newSubmission: 'New submission',
        submitFile: 'Submit file',
        addObservation: 'Add observation',
        markReceived: 'Mark received',
        downloadReceipt: 'Download receipt',
        exportList: 'Export list',
        searchPlaceholder: 'Search by submission, project, client, authority, or status...',
        emptyTitle: 'No authorizations found',
        emptyDescription: 'Create or submit an authorization file after project documents and contract are ready.',
        metrics: {
            total: 'Total files',
            submitted: 'Submitted',
            observations: 'With observations',
            received: 'Received',
        },
        table: {
            authorization: 'Authorization',
            project: 'Project',
            client: 'Client',
            authority: 'Authority',
            status: 'Status',
            observations: 'Observations',
            updated: 'Updated',
            actions: 'Actions',
        },
        status: {
            notStarted: 'Not started',
            preparing: 'Preparing',
            submitted: 'Submitted',
            observations: 'Observations',
            approved: 'Approved',
            received: 'Received',
            rejected: 'Rejected',
        },
        authorityType: {
            commune: 'Commune',
            province: 'Province',
            agency: 'Urban agency',
        },
        board: {
            title: 'Submission board',
            description: 'Operational view of the current authorization file and next administrative action.',
            currentStatus: 'Current status',
            authority: 'Authority',
            submissionNumber: 'Submission number',
            submittedAt: 'Submitted at',
            authorizationNumber: 'Authorization number',
            authorizationDate: 'Authorization date',
            nextAction: 'Next action',
            nextActionValue: 'Follow observations and upload the final authorization when received.',
        },
        timeline: {
            title: 'Authorization timeline',
            description: 'Follow the authorization process from preparation to received file.',
            preparing: 'Preparing file',
            submitted: 'Submitted to authority',
            observations: 'Observations received',
            corrections: 'Corrections prepared',
            approved: 'Approved',
            received: 'Authorization received',
        },
        observationsPanel: {
            title: 'Observations',
            description: 'Track remarks, corrections, and blocked points from the authority.',
            open: 'Open',
            resolved: 'Resolved',
            blocked: 'Blocked',
            dueDate: 'Due date',
            resolve: 'Resolve',
        },
        preview: {
            title: 'Authorization file',
            description: 'Preview placeholder for receipt, submission proof, or final authorization document.',
            receipt: 'Receipt',
            finalAuthorization: 'Final authorization',
            noFile: 'No file selected',
            fileName: 'File name',
            uploadedBy: 'Uploaded by',
            uploadedAt: 'Uploaded at',
        },
        cards: {
            prepareTitle: 'Prepare file',
            prepareDescription: 'Required documents and contract must be ready before submission.',
            submitTitle: 'Submit to authority',
            submitDescription: 'Track submission number, date, and receipt.',
            observeTitle: 'Follow observations',
            observeDescription: 'Keep corrections and authority remarks organized.',
        },
        toast: {
            newSubmission: 'New submission action clicked.',
            submitFile: 'Submission action clicked.',
            addObservation: 'Observation action clicked.',
            markReceived: 'Authorization marked as received.',
            view: 'Opening authorization preview...',
            edit: 'Opening authorization editor...',
            download: 'Download action clicked.',
            export: 'Export action clicked.',
            resolveObservation: 'Observation resolved.',
        },
    },
    planningWorkspace: {
        eyebrow: 'Planning',
        title: 'Planning',
        subtitle: 'Organize internal tasks, deadlines, visits, contract preparation, document follow-up, and authorization actions.',
        newTask: 'New task',
        exportList: 'Export list',
        markDone: 'Mark done',
        blockTask: 'Block task',
        searchPlaceholder: 'Search by task, project, client, assignee, priority, or status...',
        emptyTitle: 'No planning tasks found',
        emptyDescription: 'Create internal tasks to organize project work and deadlines.',
        metrics: {
            total: 'Total tasks',
            active: 'Active',
            overdue: 'Overdue',
            completed: 'Completed',
        },
        table: {
            task: 'Task',
            project: 'Project',
            client: 'Client',
            assignee: 'Assignee',
            priority: 'Priority',
            status: 'Status',
            dueDate: 'Due date',
            progress: 'Progress',
            actions: 'Actions',
        },
        status: {
            pending: 'Pending',
            active: 'Active',
            completed: 'Completed',
            blocked: 'Blocked',
            overdue: 'Overdue',
        },
        priority: {
            low: 'Low',
            normal: 'Normal',
            high: 'High',
            urgent: 'Urgent',
        },
        type: {
            documents: 'Documents',
            verification: 'Verification',
            contract: 'Contract',
            authorization: 'Authorization',
            siteVisit: 'Site visit',
            archive: 'Archive',
            finance: 'Finance',
        },
        board: {
            title: 'Weekly board',
            description: 'A visual week view for the office team.',
            monday: 'Monday',
            tuesday: 'Tuesday',
            wednesday: 'Wednesday',
            thursday: 'Thursday',
            friday: 'Friday',
            saturday: 'Saturday',
            sunday: 'Sunday',
        },
        focus: {
            title: 'Task focus',
            description: 'Selected task details and next action.',
            noTask: 'No task selected',
            selectTask: 'Select a task from the table to preview details here.',
            project: 'Project',
            client: 'Client',
            assignee: 'Assignee',
            dueDate: 'Due date',
            nextAction: 'Next action',
            nextActionValue: 'Confirm documents and move the project to the next workflow step.',
        },
        timeline: {
            title: 'Project workflow timeline',
            description: 'Prototype timeline for internal project follow-up.',
            documents: 'Documents collection',
            verification: 'Property verification',
            contract: 'Contract preparation',
            authorization: 'Authorization follow-up',
            closure: 'Closure and archive',
        },
        cards: {
            todayTitle: 'Today focus',
            todayDescription: 'Tasks that need immediate follow-up.',
            lateTitle: 'Late tasks',
            lateDescription: 'Blocked or overdue items that need manager attention.',
            teamTitle: 'Team load',
            teamDescription: 'Prototype workload overview by assignee.',
        },
        toast: {
            newTask: 'New task action clicked.',
            view: 'Opening task preview...',
            edit: 'Opening task editor...',
            done: 'Task marked as completed.',
            block: 'Task marked as blocked.',
            export: 'Export action clicked.',
        },
    },
    financeWorkspace: {
        eyebrow: 'Finance',
        title: 'Finance',
        subtitle: 'Track devis, invoices, payments, remaining balances, and financial status for each project.',
        newDevis: 'New devis',
        newInvoice: 'New invoice',
        addPayment: 'Add payment',
        exportList: 'Export list',
        searchPlaceholder: 'Search by client, project, invoice, devis, CIN, or status...',
        emptyTitle: 'No finance records found',
        emptyDescription: 'Create a devis or invoice to start tracking project finance.',
        metrics: {
            totalTtc: 'Total TTC',
            paid: 'Paid',
            remaining: 'Remaining',
            overdue: 'Overdue',
        },
        table: {
            record: 'Record',
            project: 'Project',
            client: 'Client',
            type: 'Type',
            total: 'Total',
            paid: 'Paid',
            remaining: 'Remaining',
            status: 'Status',
            updated: 'Updated',
            actions: 'Actions',
        },
        type: {
            devis: 'Devis',
            invoice: 'Invoice',
            payment: 'Payment',
            creditNote: 'Credit note',
        },
        status: {
            draft: 'Draft',
            sent: 'Sent',
            partiallyPaid: 'Partially paid',
            paid: 'Paid',
            overdue: 'Overdue',
            cancelled: 'Cancelled',
        },
        focus: {
            title: 'Finance focus',
            description: 'Selected financial record details and payment state.',
            noRecord: 'No record selected',
            selectRecord: 'Select a finance record from the table to preview details here.',
            recordNumber: 'Record number',
            client: 'Client',
            project: 'Project',
            totalTtc: 'Total TTC',
            paid: 'Paid',
            remaining: 'Remaining',
            dueDate: 'Due date',
            nextAction: 'Next action',
            nextActionValue: 'Follow remaining balance and prepare invoice/payment receipt.',
        },
        breakdown: {
            title: 'Payment breakdown',
            description: 'Prototype payment distribution for the selected record.',
            ht: 'HT',
            tva: 'TVA',
            ttc: 'TTC',
            paid: 'Paid',
            remaining: 'Remaining',
        },
        timeline: {
            title: 'Finance timeline',
            description: 'Financial workflow from devis to payment and closure.',
            devisCreated: 'Devis created',
            invoiceGenerated: 'Invoice generated',
            paymentReceived: 'Payment received',
            remainingFollowUp: 'Remaining follow-up',
            closed: 'Closed',
        },
        cards: {
            invoicesTitle: 'Invoices',
            invoicesDescription: 'Invoices generated from project contracts.',
            paymentsTitle: 'Payments',
            paymentsDescription: 'Track payment receipts and remaining balances.',
            overdueTitle: 'Overdue follow-up',
            overdueDescription: 'Records requiring manager attention.',
        },
        toast: {
            newDevis: 'New devis action clicked.',
            newInvoice: 'New invoice action clicked.',
            addPayment: 'Add payment action clicked.',
            view: 'Opening finance record preview...',
            edit: 'Opening finance editor...',
            download: 'Download action clicked.',
            markPaid: 'Record marked as paid.',
            export: 'Export action clicked.',
        },
    },
    archivesWorkspace: {
        eyebrow: 'Archives',
        title: 'Archives',
        subtitle: 'Track closed project files, archive numbers, in/out dates, physical location, and retrieval status.',
        newArchive: 'New archive',
        exportList: 'Export list',
        registerIn: 'Register in',
        registerOut: 'Register out',
        returnArchive: 'Return archive',
        searchPlaceholder: 'Search by archive number, project, client, box, shelf, room, or status...',
        emptyTitle: 'No archive records found',
        emptyDescription: 'Close a project file and assign an archive number to start archive tracking.',
        metrics: {
            total: 'Total archives',
            stored: 'Stored',
            out: 'Out',
            pending: 'Pending return',
        },
        table: {
            archive: 'Archive',
            project: 'Project',
            client: 'Client',
            location: 'Location',
            inDate: 'In date',
            outDate: 'Out date',
            status: 'Status',
            updated: 'Updated',
            actions: 'Actions',
        },
        status: {
            readyToArchive: 'Ready to archive',
            stored: 'Stored',
            out: 'Out',
            pendingReturn: 'Pending return',
            returned: 'Returned',
            lost: 'Lost',
        },
        focus: {
            title: 'Archive focus',
            description: 'Selected archive record, physical location, in/out history, and next action.',
            noRecord: 'No archive selected',
            selectRecord: 'Select an archive record from the table to preview details here.',
            archiveNumber: 'Archive number',
            client: 'Client',
            project: 'Project',
            dossierNumber: 'Dossier number',
            inDate: 'In date',
            outDate: 'Out date',
            returnedAt: 'Returned at',
            requestedBy: 'Requested by',
            nextAction: 'Next action',
            nextActionValue: 'Verify physical file location and update return status when the file comes back.',
        },
        location: {
            title: 'Physical location',
            description: 'Where the paper file is stored in the office archive.',
            room: 'Room',
            shelf: 'Shelf',
            box: 'Box',
            folder: 'Folder',
            archiveNumber: 'Archive number',
        },
        timeline: {
            title: 'Archive timeline',
            description: 'Archive lifecycle from project closure to physical storage and retrieval.',
            projectClosed: 'Project closed',
            documentsVerified: 'Documents verified',
            archiveNumberAssigned: 'Archive number assigned',
            fileStored: 'File stored',
            retrievalTracked: 'Retrieval tracked',
        },
        cards: {
            closureTitle: 'Closure control',
            closureDescription: 'Project cannot be archived until required documents and finance status are reviewed.',
            retrievalTitle: 'Retrieval tracking',
            retrievalDescription: 'Track who took the physical file and when it must be returned.',
            locationTitle: 'Archive location',
            locationDescription: 'Box, shelf, room, and folder identifiers must stay searchable.',
        },
        toast: {
            newArchive: 'New archive action clicked.',
            registerIn: 'Archive registered in.',
            registerOut: 'Archive registered out.',
            returnArchive: 'Archive marked as returned.',
            view: 'Opening archive preview...',
            edit: 'Opening archive editor...',
            download: 'Download action clicked.',
            export: 'Export action clicked.',
        },
    },
    dashboardHome: {
        eyebrow: 'Command center',
        title: 'ARCHI LBO operating dashboard',
        subtitle: 'A compact overview of clients, projects, documents, contracts, authorizations, finance, planning, and archives.',
        quickActions: 'Quick actions',
        openModule: 'Open module',
        viewAll: 'View all',
        workflowTitle: 'Office workflow',
        workflowDescription: 'Follow every project from first client contact to archive.',
        urgentTitle: 'Needs attention',
        urgentDescription: 'Operational items that should be handled first.',
        activityTitle: 'Recent activity',
        activityDescription: 'Latest prototype actions across the office workflow.',
        modulesTitle: 'Modules overview',
        modulesDescription: 'Current frontend modules ready in the prototype.',
        kpi: {
            clients: 'Clients',
            projects: 'Projects',
            documents: 'Documents',
            contracts: 'Contracts',
            authorizations: 'Authorizations',
            planning: 'Planning tasks',
            finance: 'Finance TTC',
            archives: 'Archives',
        },
        quick: {
            newClient: 'New client',
            newProject: 'New project',
            uploadDocument: 'Upload document',
            generateContract: 'Generate contract',
            addPayment: 'Add payment',
            archiveFile: 'Archive file',
        },
        workflow: {
            client: 'Client',
            project: 'Project',
            documents: 'Documents',
            contract: 'Contract',
            authorization: 'Authorization',
            finance: 'Finance',
            archive: 'Archive',
        },
        health: {
            ready: 'Ready',
            active: 'Active',
            attention: 'Attention',
            pending: 'Pending',
        },
        toast: {
            quickAction: 'Quick action clicked.',
            moduleOpen: 'Opening module...',
        },
    },
    dashboardCompact: {
        quickActions: 'Quick actions',
        recentActivity: 'Recent activity',
        showActivity: 'Show activity',
        hideActivity: 'Hide activity',
        financeTitle: 'Company finance snapshot',
        financeDescription: 'Small financial overview for the office.',
        totalTtc: 'Total TTC',
        paid: 'Paid',
        remaining: 'Remaining',
        overdue: 'Overdue',
        collectionRate: 'Collection rate',
    },
    clientFormExtra: {
        motherName: 'Mother name',
        intermediary: 'Intermediary',
        intermediaryPlaceholder: 'Select intermediary',
        none: 'None',
        agency: 'Agency',
        architectPartner: 'Architect partner',
        businessReferral: 'Business referral',
        familyReferral: 'Family referral',
    },
    frontendQa: {
        eyebrow: 'Frontend QA',
        title: 'Prototype QA console',
        subtitle: 'Test routing, global search, project test data, and prototype button actions before starting database work.',
        routesTitle: 'Route tests',
        routesDescription: 'Every active frontend route should open without 404 or undefined href errors.',
        searchTitle: 'Search tests',
        searchDescription: 'These queries must return results in the global search system.',
        projectsTitle: 'Project test data',
        projectsDescription: 'Open each project/dossier test record and confirm the workspace loads.',
        actionsTitle: 'Prototype button logic',
        actionsDescription: 'Test non-database actions such as fake downloads, toasts, and navigation.',
        open: 'Open',
        test: 'Test',
        runAction: 'Run action',
        expected: 'Expected',
        result: 'Result',
        routeOk: 'Route configured',
        searchOk: 'Search result found',
        noResult: 'No result',
        fakeDownload: 'Fake download',
        toastAction: 'Toast action',
        passed: 'Passed',
        pending: 'Pending manual check',
        toast: {
            route: 'Opening route...',
            action: 'Prototype action executed.',
            search: 'Search test executed.',
        },
    },
    layout: {
        account: 'Account',
        notifications: 'Notifications',
        workspace: 'Workspace',
    },

    financeSettings: {
        eyebrow: 'Finance settings',
        title: 'Finance settings',
        subtitle: 'Configure company information, numbering, tax rates, payment terms, and bank details for finance document generation.',
        sections: {
            company: 'Company information',
            numbering: 'Document numbering',
            tax: 'Tax & finance',
            bank: 'Bank information',
        },
        fields: {
            company_name: 'Company name',
            company_name_desc: 'Official business name shown on documents',
            company_address: 'Address',
            company_address_desc: 'Full company address',
            company_phone: 'Phone',
            company_phone_desc: 'Company phone number',
            company_email: 'Email',
            company_email_desc: 'Company email address',
            company_ice: 'ICE',
            company_ice_desc: 'Identifiant Commun de l\'Entreprise',
            company_cin: 'CIN',
            company_cin_desc: 'Carte d\'Identité Nationale of the manager',
            quote_prefix: 'Quote prefix',
            quote_prefix_desc: 'Prefix for quote numbering (e.g. DEV)',
            invoice_prefix: 'Invoice prefix',
            invoice_prefix_desc: 'Prefix for invoice numbering (e.g. INV)',
            receipt_prefix: 'Receipt prefix',
            receipt_prefix_desc: 'Prefix for receipt numbering (e.g. REC)',
            payment_prefix: 'Payment prefix',
            payment_prefix_desc: 'Prefix for payment numbering (e.g. PAY)',
            tva_rate: 'TVA rate (%)',
            tva_rate_desc: 'Default VAT rate applied to documents',
            currency: 'Currency',
            currency_desc: 'Default currency (e.g. MAD)',
            payment_terms: 'Payment terms',
            payment_terms_desc: 'Default payment conditions text',
            payment_days: 'Payment days',
            payment_days_desc: 'Default number of days before payment is due',
            bank_name: 'Bank name',
            bank_name_desc: 'Name of the bank',
            bank_rib: 'RIB',
            bank_rib_desc: 'Relevé d\'Identité Bancaire',
            bank_iban: 'IBAN',
            bank_iban_desc: 'International Bank Account Number',
            bank_bic: 'BIC/SWIFT',
            bank_bic_desc: 'Bank identification code',
        },
        save: 'Save settings',
        saving: 'Saving...',
        saved: 'Settings saved successfully.',
        saveError: 'Failed to save settings.',
    },

    tasks: {
        pageTitle: 'Tasks',
        pageSubtitle: 'Operations center \u2014 track, assign, and complete operational work.',
        metrics: {
            open: 'Open',
            urgent: 'Urgent',
            blocked: 'Blocked',
            overdue: 'Overdue',
            review: 'Review',
            completed: 'Completed',
            pending: 'Pending',
            dueThisWeek: 'Due this week',
        },
        filters: {
            all: 'All',
            my: 'My tasks',
            assignedByMe: 'Assigned by me',
            watching: 'Watching',
            overdue: 'Overdue',
            dueToday: 'Due today',
            dueThisWeek: 'Due this week',
            blocked: 'Blocked',
            completed: 'Completed',
            allPriorities: 'All priorities',
            allProjects: 'All projects',
            search: 'Search tasks, clients, projects...',
            scope: 'Scope',
            module: 'Module',
            reset: 'Reset',
        },
        overview: {
            statusOverview: 'Status overview',
            dayView: '7-day view',
            myFocus: 'My focus',
            urgentFocus: 'Urgent focus',
            needsAttention: 'Needs attention',
            nothingUrgent: 'Nothing urgent.',
            noUpcoming: 'No upcoming tasks.',
            allOnTrack: 'All on track',
            currentWorkload: 'Current workload',
        },
        board: {
            noTasks: 'No tasks',
        },
        drawer: {
            overview: 'Overview',
            checklist: 'Checklist',
            people: 'People',
            comments: 'Comments',
            attachments: 'Attachments',
            activity: 'Activity',
            markComplete: 'Mark complete',
            addChecklist: 'Add checklist item',
            addComment: 'Add comment',
            addNote: 'Add note',
            uploadFile: 'Upload',
            statusQuickActions: {
                start: 'Start',
                waitingClient: 'Waiting client',
                blocked: 'Blocked',
                inReview: 'In review',
                complete: 'Complete',
            },
            noPeople: 'No people assigned.',
            noChecklist: 'No checklist items yet.',
            filesAfterReload: 'Files appear after page reload.',
            internalNote: 'Internal note',
            commentPlaceholder: 'Write a comment or @mention someone',
            notePlaceholder: 'Internal note (team only)',
            activityTimeline: 'Full activity timeline available with backend integration.',
            filesEmpty: 'No files uploaded yet.',
            blockedReason: 'Blocked reason',
            linkedRecords: 'Linked records',
        },
        create: {
            title: 'Create task',
            subtitle: 'Fill in the details below to create a new task.',
            sections: {
                main: 'Main',
                people: 'People',
                dates: 'Dates',
                more: 'More',
            },
            cancel: 'Cancel',
            create: 'Create task',
        },
        toast: {
            created: 'Task created.',
            updated: 'Task updated.',
            statusUpdated: 'Status updated.',
            statusFailed: 'Status update failed.',
            commentAdded: 'Comment added.',
            commentFailed: 'Comment could not be added.',
            attachmentUploaded: 'Attachment uploaded.',
            attachmentFailed: 'Attachment upload failed.',
            checklistAdded: 'Checklist item added.',
            checklistFailed: 'Checklist item could not be added.',
            checklistUpdated: 'Checklist updated.',
        },
    },

    table: {
        rowsPerPage: 'Rows per page',
        page: 'Page',
        of: 'of',
        selected: 'selected',
        noResults: 'No results found',
    },
} as const;

export type AppLocale = typeof en;












```

## FILE: resources\js\pages\Clients\Show.tsx

```tsx
import { Head, router } from '@inertiajs/react';
import {
    ArrowLeft,
    FolderKanban,
    Mail,
    MapPin,
    Phone,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { AppShell } from '@/components/layout/AppShell';
import { AppButton } from '@/components/ui/AppButton';
import { ClientProjectsPanel } from '@/features/clients/components/ClientProjectsPanel';
import { ClientSelectedProjectWorkspace, type ClientWorkflowActionContext } from '@/features/clients/components/ClientSelectedProjectWorkspace';
import type { ClientRow, ClientWorkspace, DossierWorkflowRequirement } from '@/features/clients/types';
import { ContractDrawer } from '@/features/contracts/drawers/ContractDrawer';
import type { ContractFormPayload } from '@/features/contracts/types';
import { DocumentUploadDrawer } from '@/features/documents/drawers/DocumentUploadDrawer';
import type { DocumentTemplateOption, DocumentUploadPayload } from '@/features/documents/types';
import { ProjectDrawer } from '@/features/dossiers/drawers/ProjectDrawer';
import type { DossierFormPayload } from '@/features/dossiers/types';
import { ArchiveDrawer } from '@/features/archives/drawers/ArchiveDrawer';
import type { ArchiveFormPayload } from '@/features/archives/types';
import { FinanceDocumentDrawer } from '@/features/finance/drawers/FinanceDocumentDrawer';
import type { FinanceDocFormPayload } from '@/features/finance/drawers/FinanceDocumentDrawer';

const FORCE_CLIENT_SHOW_LAYOUT_53JC = true;

type DossierSummary = {
    id: number;
    dossierNumber: string;
    projectObject: string;
    status: string;
    workflowStep: string;
    updatedAt: string | null;
};

type PageProps = {
    client: ClientRow;
    dossiers: DossierSummary[];
    workspace: ClientWorkspace;
    documentTemplates: DocumentTemplateOption[];
};

function initials(client: ClientRow) {
    const first = client.firstName?.charAt(0) ?? '';
    const last = client.lastName?.charAt(0) ?? '';

    return `${first}${last}`.trim() || client.fullName.slice(0, 2).toUpperCase();
}

function dossierPayload(payload: DossierFormPayload) {
    const current = payload as DossierFormPayload & { address?: string; projectAddress?: string };

    return {
        client_id: payload.clientId,
        project_object: payload.projectObject,
        description: payload.description || null,
        project_address: current.projectAddress || current.address || null,
        province: payload.province || null,
        commune: payload.commune || null,
        land_title_number: payload.landTitleNumber || null,
        land_surface: payload.landSurface || null,
        floor_area: payload.floorArea || null,
        status: payload.status || 'opened',
        workflow_step: payload.workflowStep || 'client',
        notes: payload.notes || null,
    };
}

function contractPayload(payload: ContractFormPayload) {
    return {
        dossier_id: payload.dossierId,
        status: payload.status || 'draft',
        surface: payload.surface || null,
        price_per_square_meter: payload.pricePerSquareMeter || null,
        calculation_mode: payload.calculationMode || 'percentage',
        fee_rate_percent: payload.feeRatePercent || null,
        forfait_ttc: payload.calculationMode === 'forfait' ? payload.forfaitTtc || null : null,
        notes: payload.notes || null,
    };
}

function normalizeMatchValue(value: string | null | undefined) {
    return String(value ?? '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
}

const workflowTemplateAliases: Record<string, string[]> = {
    cin: ['cin', 'cni', 'carte nationale'],
    certificat_propriete: ['certificat propriete', 'titre foncier'],
    terrain_documents: ['plan parcellaire', 'plan cadastral', 'calcul contenance'],
    engineer_request: ['demande ingenieur', 'centre ingenieur'],
    cahier_received: ['cahier chantier', 'cahier de chantier'],
    fiche_energetique: ['fiche energetique', 'efficacite energetique'],
    contract_bureau_etude: ['contrat bureau etude'],
    plan_beton: ['plan beton', 'beton arme'],
    implantation_topographie: ['implantation', 'topographie'],
    laboratoire_controle: ['laboratoire', 'bureau de controle'],
    demande_permis_habiter: ['permis habiter', 'demande permis'],
    site_images: ['image site', 'photo site'],
    recent_certificat_propriete: ['certificat propriete'],
};

export default function ClientShow({ client, dossiers, workspace, documentTemplates }: PageProps) {
    const [projectDrawerOpen, setProjectDrawerOpen] = useState(false);
    const [documentDrawerOpen, setDocumentDrawerOpen] = useState(false);
    const [documentTemplateId, setDocumentTemplateId] = useState('');
    const [contractDrawerOpen, setContractDrawerOpen] = useState(false);
    const [financeDrawerOpen, setFinanceDrawerOpen] = useState(false);
    const [financeDocType, setFinanceDocType] = useState('quote');
    const [archiveDrawerOpen, setArchiveDrawerOpen] = useState(false);
    const selectedProject = workspace?.selectedProject ?? null;
    const projects = workspace?.projects ?? dossiers.map((dossier) => ({
        id: dossier.id,
        clientId: client.id,
        clientName: client.fullName,
        dossierNumber: dossier.dossierNumber,
        projectObject: dossier.projectObject,
        projectAddress: null,
        province: null,
        commune: null,
        status: dossier.status,
        workflowStep: dossier.workflowStep,
        documentsCount: 0,
        financeDocumentsCount: 0,
        paymentsCount: 0,
        quotesTotal: 0,
        invoicesTotal: 0,
        paidTotal: 0,
        remainingTotal: 0,
        updatedAt: dossier.updatedAt,
    }));
    const returnTo = selectedProject ? `/clients/${client.id}?dossier_id=${selectedProject.id}` : `/clients/${client.id}`;
    const clientOptions = useMemo(() => [{ id: String(client.id), label: client.fullName }], [client.fullName, client.id]);
    const dossierOptions = useMemo(
        () => projects.map((project) => ({
            id: String(project.id),
            label: `${project.dossierNumber} - ${project.projectObject || 'Projet'}`,
        })),
        [projects],
    );
    const archiveDossierOptions = useMemo(
        () => selectedProject ? [{
            id: String(selectedProject.id),
            label: `${selectedProject.dossierNumber} - ${selectedProject.projectObject || 'Projet'}`,
            hasArchiveRecord: Boolean(selectedProject.archiveRecord),
        }] : [],
        [selectedProject],
    );
    const contractDossierOptions = useMemo(
        () => selectedProject ? [{
            id: String(selectedProject.id),
            label: `${selectedProject.dossierNumber} - ${selectedProject.projectObject || 'Projet'}`,
            floorArea: selectedProject.documentsCount ? null : null,
            hasContract: Boolean(selectedProject.contract),
        }] : [],
        [selectedProject],
    );

    function findTemplateIdForRequirement(requirement?: DossierWorkflowRequirement | null) {
        if (!requirement) {
            return '';
        }

        const aliases = [
            requirement.key,
            requirement.label,
            ...(workflowTemplateAliases[requirement.key] ?? []),
        ].map(normalizeMatchValue).filter(Boolean);

        const template = documentTemplates.find((option) => {
            const haystack = normalizeMatchValue(`${option.label} ${option.type ?? ''}`);

            return aliases.some((alias) => haystack.includes(alias) || alias.includes(haystack));
        });

        return template ? String(template.id) : '';
    }

    function openDocumentQuickCreate(context?: ClientWorkflowActionContext) {
        if (!selectedProject) {
            toast.error('Selectionnez un projet avant d ajouter un document.');
            return;
        }

        setDocumentTemplateId(findTemplateIdForRequirement(context?.requirement));
        setDocumentDrawerOpen(true);
    }

    function openContractQuickCreate() {
        if (!selectedProject) {
            toast.error('Selectionnez un projet avant de creer un contrat.');
            return;
        }

        setContractDrawerOpen(true);
    }

    function submitProject(payload: DossierFormPayload) {
        router.post('/dossiers', { ...dossierPayload(payload), return_to: `/clients/${client.id}` }, {
            preserveScroll: true,
            onSuccess: () => {
                setProjectDrawerOpen(false);
                toast.success('Projet cree depuis le client.');
            },
            onError: () => toast.error('Impossible de creer le projet.'),
        });
    }

    function submitDocument(payload: DocumentUploadPayload) {
        const formData = new FormData();

        formData.append('dossier_id', payload.dossierId);
        formData.append('document_template_id', payload.documentTemplateId || '');
        formData.append('status', payload.status || 'uploaded');
        formData.append('notes', payload.notes || '');
        formData.append('return_to', returnTo);

        if (payload.file) {
            formData.append('file', payload.file);
        }

        router.post('/documents', formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setDocumentDrawerOpen(false);
                setDocumentTemplateId('');
                toast.success('Document ajoute au projet.');
            },
            onError: () => toast.error('Impossible d ajouter le document.'),
        });
    }

    function openFinanceQuickCreate(type: string) {
        if (!selectedProject) {
            toast.error('Selectionnez un projet avant de creer un document financier.');
            return;
        }

        setFinanceDocType(type);
        setFinanceDrawerOpen(true);
    }

    function submitFinance(payload: FinanceDocFormPayload) {
        if (!selectedProject) {
            return;
        }

        router.post('/finance/documents', {
            ...payload,
            client_id: String(selectedProject.clientId),
            dossier_id: String(selectedProject.id),
            return_to: `/clients/${client.id}?dossier_id=${selectedProject.id}`,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setFinanceDrawerOpen(false);
                toast.success('Document financier cree.');
            },
            onError: () => toast.error('Impossible de creer le document financier.'),
        });
    }

    function openArchiveQuickCreate() {
        if (!selectedProject) {
            toast.error('Selectionnez un projet avant de creer une archive.');
            return;
        }

        setArchiveDrawerOpen(true);
    }

    function submitArchive(payload: ArchiveFormPayload) {
        if (!selectedProject) {
            return;
        }

        router.post('/archives', {
            ...payload,
            return_to: `/clients/${client.id}?dossier_id=${selectedProject.id}`,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setArchiveDrawerOpen(false);
                toast.success('Fiche d archive creee.');
            },
            onError: () => toast.error('Impossible de creer la fiche d archive.'),
        });
    }

    function submitContract(payload: ContractFormPayload) {
        router.post('/contracts', { ...contractPayload(payload), return_to: returnTo }, {
            preserveScroll: true,
            onSuccess: () => {
                setContractDrawerOpen(false);
                toast.success('Contrat cree depuis le client.');
            },
            onError: () => toast.error('Impossible de creer le contrat.'),
        });
    }

    return (
        <>
            <Head title={client.fullName} />

            <AppShell
                eyebrowKey="clients.eyebrow"
                titleKey="clients.title"
                subtitleKey="clients.subtitle"
                action={
                    <div className="flex flex-wrap gap-2">
                        <AppButton variant="secondary" onPress={() => router.visit('/clients')}>
                            <ArrowLeft size={16} />
                            Clients
                        </AppButton>
                        <AppButton variant="primary" onPress={() => setProjectDrawerOpen(true)}>
                            <FolderKanban size={16} />
                            New project
                        </AppButton>
                    </div>
                }
            >
                <div className="crm-page" data-ui-marker={FORCE_CLIENT_SHOW_LAYOUT_53JC ? 'FORCE_CLIENT_SHOW_LAYOUT_53JC' : undefined}>
                    <section className="crm-panel overflow-hidden">
                        <div className="grid gap-5 p-5 xl:grid-cols-[minmax(0,1fr)_420px] xl:items-center">
                            <div className="flex min-w-0 items-start gap-4">
                                <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--crm-accent)_18%,transparent)] text-base font-black text-[var(--crm-accent)]">
                                    {initials(client)}
                                </div>
                                <div className="min-w-0">
                                    <p className="crm-eyebrow">Client workspace</p>
                                    <h1 className="mt-2 truncate text-2xl font-black text-[var(--crm-text)]">{client.fullName}</h1>
                                    <p className="mt-1 text-sm text-[var(--crm-muted)]">{client.clientNumber} / {client.cin || 'No CIN'}</p>
                                </div>
                            </div>

                            <div className="grid gap-2 text-sm text-[var(--crm-muted)]">
                                <span className="flex items-center gap-2"><Phone size={15} />{client.phone || '-'}</span>
                                <span className="flex items-center gap-2"><Mail size={15} />{client.email || '-'}</span>
                                <span className="flex items-center gap-2"><MapPin size={15} />{client.address || '-'}</span>
                            </div>
                        </div>

                        <div className="grid border-t border-[var(--crm-border)] md:grid-cols-4">
                            <div className="border-b border-[var(--crm-border)] p-5 md:border-b-0 md:border-r">
                                <p className="crm-kpi-label">Status</p>
                                <p className="mt-2 text-lg font-black capitalize text-emerald-300">{client.status}</p>
                            </div>
                            <div className="border-b border-[var(--crm-border)] p-5 md:border-b-0 md:border-r">
                                <p className="crm-kpi-label">Projects</p>
                                <p className="mt-2 text-lg font-black text-[var(--crm-accent)]">{projects.length}</p>
                            </div>
                            <div className="border-b border-[var(--crm-border)] p-5 md:border-b-0 md:border-r">
                                <p className="crm-kpi-label">Intermediary</p>
                                <p className="mt-2 truncate text-sm font-bold">{client.intermediaryName || '-'}</p>
                            </div>
                            <div className="p-5">
                                <p className="crm-kpi-label">Updated</p>
                                <p className="mt-2 text-sm font-bold">{client.updatedAt || '-'}</p>
                            </div>
                        </div>
                    </section>

                    <section className="grid min-w-0 items-start gap-6 2xl:grid-cols-[320px_minmax(0,1fr)]">
                        <aside className="grid min-w-0 gap-5">
                            <section className="crm-panel p-5">
                                <div className="flex items-center gap-3">
                                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--crm-accent)_18%,transparent)] text-sm font-black text-[var(--crm-accent)]">
                                        {initials(client)}
                                    </div>
                                    <div className="min-w-0">
                                        <h2 className="truncate text-sm font-black">{client.fullName}</h2>
                                        <p className="truncate text-xs text-[var(--crm-muted)]">{client.clientNumber} / {client.cin || 'No CIN'}</p>
                                    </div>
                                </div>

                                <dl className="mt-4 grid gap-2 text-xs">
                                    {[
                                        ['First name', client.firstName],
                                        ['Last name', client.lastName],
                                        ['Father', client.fatherName],
                                        ['Mother', client.motherName],
                                        ['CNI expiration', client.cniExpirationDate],
                                        ['Created', client.createdAt],
                                    ].map(([label, value]) => (
                                        <div key={label} className="flex items-center justify-between gap-3 rounded-lg border border-[var(--crm-border)] bg-black/10 px-3 py-2">
                                            <dt className="shrink-0 text-[var(--crm-muted)]">{label}</dt>
                                            <dd className="truncate font-bold text-[var(--crm-text)]">{value || '-'}</dd>
                                        </div>
                                    ))}
                                </dl>

                                <div className="mt-4 rounded-xl border border-[var(--crm-border)] bg-black/10 p-3">
                                    <p className="text-xs font-black uppercase tracking-[0.14em] text-[var(--crm-muted)]">Notes</p>
                                    <p className="mt-2 line-clamp-4 text-xs leading-5 text-[var(--crm-text-muted)]">{client.notes || 'No notes saved.'}</p>
                                </div>
                            </section>

                            <section className="crm-panel p-5">
                                <div className="mb-4 flex items-center justify-between gap-2">
                                    <h2 className="text-sm font-bold">Client projects</h2>
                                    <span className="rounded-full bg-blue-500/10 px-2 py-1 text-xs font-bold text-blue-300">{projects.length}</span>
                                </div>
                                <ClientProjectsPanel
                                    clientId={client.id}
                                    projects={projects}
                                    selectedProjectId={selectedProject?.id ?? null}
                                />
                            </section>
                        </aside>

                        <main className="min-w-0">
                            <ClientSelectedProjectWorkspace
                                project={selectedProject}
                                onCreateProject={() => setProjectDrawerOpen(true)}
                                onUploadDocument={openDocumentQuickCreate}
                                onCreateContract={openContractQuickCreate}
                                onCreateFinanceDocument={openFinanceQuickCreate}
                                onCreateArchive={openArchiveQuickCreate}
                            />
                        </main>
                    </section>
                </div>
            </AppShell>

            <ProjectDrawer
                isOpen={projectDrawerOpen}
                mode="create"
                dossier={null}
                clients={clientOptions}
                initialClientId={String(client.id)}
                onOpenChange={setProjectDrawerOpen}
                onSubmit={submitProject}
            />

            <DocumentUploadDrawer
                isOpen={documentDrawerOpen}
                dossiers={dossierOptions}
                templates={documentTemplates}
                initialDossierId={selectedProject ? String(selectedProject.id) : ''}
                initialTemplateId={documentTemplateId}
                onOpenChange={setDocumentDrawerOpen}
                onSubmit={submitDocument}
            />

            <ContractDrawer
                isOpen={contractDrawerOpen}
                mode="create"
                contract={null}
                dossiers={contractDossierOptions}
                initialDossierId={selectedProject ? String(selectedProject.id) : ''}
                onOpenChange={setContractDrawerOpen}
                onSubmit={submitContract}
            />

            <FinanceDocumentDrawer
                isOpen={financeDrawerOpen}
                mode="create"
                clients={clientOptions}
                dossiers={dossierOptions}
                onOpenChange={setFinanceDrawerOpen}
                onSubmit={submitFinance}
                initialType={financeDocType}
            />

            <ArchiveDrawer
                isOpen={archiveDrawerOpen}
                mode="create"
                archiveRecord={null}
                dossiers={archiveDossierOptions}
                onOpenChange={setArchiveDrawerOpen}
                onSubmit={submitArchive}
            />
        </>
    );
}

```

## FILE: resources\js\pages\Dashboard.tsx

```tsx
import { Head, router } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowRight,
    Bell,
    CalendarDays,
    CheckCircle2,
    ChevronRight,
    Clock3,
    Command,
    FileCheck2,
    FolderKanban,
    ListChecks,
    MessageSquare,
    Plus,
    ReceiptText,
    Search,
    ShieldCheck,
    SlidersHorizontal,
    UploadCloud,
    UserRound,
    WalletCards,
} from 'lucide-react';
import type { ComponentType } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import type { DashboardCommandCenter, DashboardIconKey, DashboardTone } from '@/features/dashboard/types';

type PageProps = {
    commandCenter: DashboardCommandCenter;
};

const iconMap: Record<DashboardIconKey, ComponentType<{ size?: number; className?: string }>> = {
    projects: FolderKanban,
    documents: FileCheck2,
    authorizations: ShieldCheck,
    invoices: ReceiptText,
    payments: WalletCards,
    tasks: ListChecks,
    chat: MessageSquare,
    upload: UploadCloud,
    clients: UserRound,
    clock: Clock3,
    check: CheckCircle2,
};

const toneClasses: Record<DashboardTone, { soft: string; text: string; dot: string; pill: string }> = {
    gold: {
        soft: 'bg-[color-mix(in_srgb,var(--crm-gold)_14%,transparent)]',
        text: 'text-[var(--crm-gold)]',
        dot: 'bg-[var(--crm-gold)]',
        pill: 'crm-status-warning',
    },
    green: {
        soft: 'bg-[var(--crm-success-soft)]',
        text: 'text-[var(--crm-success)]',
        dot: 'bg-[var(--crm-success)]',
        pill: 'crm-status-success',
    },
    red: {
        soft: 'bg-[var(--crm-danger-soft)]',
        text: 'text-[var(--crm-danger)]',
        dot: 'bg-[var(--crm-danger)]',
        pill: 'crm-status-danger',
    },
    blue: {
        soft: 'bg-[var(--crm-info-soft)]',
        text: 'text-[var(--crm-info)]',
        dot: 'bg-[var(--crm-info)]',
        pill: 'crm-status-info',
    },
    violet: {
        soft: 'bg-[var(--crm-violet-soft)]',
        text: 'text-[var(--crm-violet)]',
        dot: 'bg-[var(--crm-violet)]',
        pill: 'crm-status-info',
    },
    neutral: {
        soft: 'bg-[var(--crm-surface-2)]',
        text: 'text-[var(--crm-text-muted)]',
        dot: 'bg-[var(--crm-text-soft)]',
        pill: 'crm-status-info',
    },
};

function goTo(href: string) {
    router.visit(href);
}

function IconTile({ icon, tone }: { icon: DashboardIconKey; tone: DashboardTone }) {
    const Icon = iconMap[icon] ?? FolderKanban;

    return (
        <span className={`flex size-10 shrink-0 items-center justify-center rounded-[var(--crm-radius-md)] ${toneClasses[tone].soft} ${toneClasses[tone].text}`}>
            <Icon size={18} />
        </span>
    );
}

export default function Dashboard({ commandCenter }: PageProps) {
    const { hero, kpis, quickLinks, nextActions, recentProjects, financeAlerts, systemHealth, activityFeed, blockedDossiers, workflowDistribution, urgentTaskList, recentMessageList } = commandCenter;

    return (
        <>
            <Head title="Dashboard" />

            <AppShell
                eyebrowKey="dashboard.eyebrow"
                titleKey="dashboard.title"
                subtitleKey="dashboard.subtitle"
                action={
                    <div className="flex flex-wrap items-center gap-2">
                        <button type="button" className="crm-action-button" onClick={() => goTo('/finance/documents?tab=monthly')}>
                            <CalendarDays size={15} />
                            Monthly
                                               </button>
                        <button type="button" className="crm-action-button-primary crm-action-button" onClick={() => goTo('/dossiers')}>
                            <Plus size={15} />
                            New project
                        </button>
                    </div>
                }
            >
                <section className="space-y-[var(--crm-page-gap)]">
                    <div className="crm-panel p-4">
                        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
                            <div className="min-w-0">
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                    <div>
                                        <p className="crm-eyebrow">{hero.eyebrow}</p>
                                        <h1 className="crm-page-title mt-2">{hero.title}</h1>
                                        <p className="mt-2 max-w-2xl text-sm text-[var(--crm-text-muted)]">{hero.subtitle}</p>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2">
                                        <button type="button" className="crm-action-button" onClick={() => goTo('/documents')}>
                                            <Bell size={15} />
                                            Urgent
                                        </button>
                                        <button type="button" className="crm-action-button" onClick={() => goTo('/dossiers')}>
                                            <SlidersHorizontal size={15} />
                                            Filters
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-5 crm-kpi-grid">
                                    {kpis.map((kpi) => (
                                        <button
                                            key={kpi.key}
                                            type="button"
                                            onClick={() => goTo(kpi.href)}
                                            className="crm-kpi-card text-left transition hover:border-[var(--crm-border-strong)] hover:bg-[var(--crm-surface-2)]"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <IconTile icon={kpi.icon} tone={kpi.tone} />
                                                <ArrowRight size={14} className="text-[var(--crm-text-soft)]" />
                                            </div>
                                            <p className="crm-kpi-label mt-3">{kpi.label}</p>
                                            <p className={`crm-kpi-value ${toneClasses[kpi.tone].text}`}>{kpi.value}</p>
                                            <p className="mt-2 truncate text-xs text-[var(--crm-text-soft)]">{kpi.helper}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <aside className="crm-panel-flat p-4">
                                <div className="mb-4 flex items-center justify-between gap-3">
                                    <div>
                                        <h2 className="text-sm font-semibold">Quick launch</h2>
                                        <p className="mt-1 text-xs text-[var(--crm-text-muted)]">Fast access to daily work.</p>
                                    </div>
                                    <Command size={16} className="text-[var(--crm-gold)]" />
                                </div>

                                <div className="grid gap-2">
                                    {quickLinks.map((link) => (
                                        <button
                                            key={link.label}
                                            type="button"
                                            onClick={() => goTo(link.href)}
                                            className="flex items-center justify-between gap-3 rounded-[var(--crm-radius-md)] border border-[var(--crm-border)] bg-[var(--crm-surface)] px-3 py-3 text-left transition hover:bg-[var(--crm-surface-2)]"
                                        >
                                            <span className="flex min-w-0 items-center gap-3">
                                                <IconTile icon={link.icon} tone="gold" />
                                                <span className="truncate text-sm font-semibold">{link.label}</span>
                                            </span>
                                            <ChevronRight size={15} className="shrink-0 text-[var(--crm-text-soft)]" />
                                        </button>
                                    ))}
                                </div>
                            </aside>
                        </div>
                    </div>

                    <div className="grid gap-[var(--crm-page-gap)] xl:grid-cols-[minmax(0,1fr)_360px]">
                        <main className="min-w-0 space-y-[var(--crm-page-gap)]">
                            <section className="grid gap-[var(--crm-page-gap)] lg:grid-cols-[360px_minmax(0,1fr)]">
                                <div className="crm-panel-flat overflow-hidden">
                                    <div className="flex items-center justify-between gap-3 border-b border-[var(--crm-border)] px-5 py-4">
                                        <div>
                                            <h2 className="text-sm font-semibold">Next actions</h2>
                                            <p className="text-xs text-[var(--crm-text-muted)]">Priority workflow queue.</p>
                                        </div>
                                        <button type="button" className="crm-action-button" onClick={() => goTo('/dossiers')}>View all</button>
                                    </div>

                                    <div className="divide-y divide-[var(--crm-border)]">
                                        {nextActions.map((action) => (
                                            <button
                                                key={action.id}
                                                type="button"
                                                onClick={() => goTo(action.href)}
                                                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-[var(--crm-surface-2)]"
                                            >
                                                <span className="flex min-w-0 items-center gap-3">
                                                    <IconTile icon={action.icon} tone={action.tone} />
                                                    <span className="min-w-0">
                                                        <span className="block truncate text-sm font-semibold">{action.title}</span>
                                                        <span className="block truncate text-xs text-[var(--crm-text-muted)]">{action.subtitle}</span>
                                                    </span>
                                                </span>
                                                <span className={`crm-status-pill ${toneClasses[action.tone].pill}`}>{action.due}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="crm-table-wrap">
                                    <div className="flex items-center justify-between gap-3 border-b border-[var(--crm-border)] px-5 py-4">
                                        <div>
                                            <h2 className="text-sm font-semibold">Recent projects</h2>
                                            <p className="text-xs text-[var(--crm-text-muted)]">Latest active dossiers and workflow status.</p>
                                        </div>
                                        <div className="hidden items-center gap-2 md:flex">
                                            <div className="crm-command-input flex w-64 items-center gap-2 px-3">
                                                <Search size={14} className="text-[var(--crm-text-soft)]" />
                                                <span className="text-xs text-[var(--crm-text-muted)]">Search projects...</span>
                                            </div>
                                            <button type="button" className="crm-action-button" onClick={() => goTo('/dossiers')}>Open</button>
                                        </div>
                                    </div>

                                    <div className="overflow-x-auto crm-scroll-thin">
                                        <table className="crm-table">
                                            <thead>
                                                <tr>
                                                    <th>Project</th>
                                                    <th>Client</th>
                                                    <th>Location</th>
                                                    <th>Step</th>
                                                    <th>Missing</th>
                                                    <th>Remaining</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {recentProjects.map((project) => (
                                                    <tr key={project.id}>
                                                        <td>
                                                            <button type="button" onClick={() => goTo(project.href)} className="text-left">
                                                                <span className="block font-semibold text-[var(--crm-text)]">{project.project}</span>
                                                                <span className="block text-xs text-[var(--crm-text-soft)]">{project.dossierNumber}</span>
                                                            </button>
                                                        </td>
                                                        <td>{project.client}</td>
                                                        <td>{project.location}</td>
                                                        <td><span className="crm-status-pill crm-status-warning">{project.step}</span></td>
                                                        <td>
                                                            <span className={project.missingDocs > 0 ? 'font-semibold text-[var(--crm-danger)]' : 'font-semibold text-[var(--crm-success)]'}>
                                                                {project.missingDocs}
                                                            </span>
                                                        </td>
                                                        <td>{project.remaining}</td>
                                                        <td>
                                                            <button type="button" className="crm-action-button" onClick={() => goTo(project.href)}>Open</button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </section>

                            <section className="grid gap-[var(--crm-page-gap)] lg:grid-cols-3">
                                <div className="crm-panel-flat overflow-hidden">
                                    <div className="flex items-center justify-between gap-3 border-b border-[var(--crm-border)] px-5 py-4">
                                        <h2 className="text-sm font-semibold">Finance alerts</h2>
                                        <button type="button" className="text-xs font-semibold text-[var(--crm-gold)]" onClick={() => goTo('/finance/documents')}>Go to finance</button>
                                    </div>

                                    <div className="divide-y divide-[var(--crm-border)]">
                                        {financeAlerts.map((alert) => (
                                            <button
                                                key={alert.id}
                                                type="button"
                                                onClick={() => goTo(alert.href)}
                                                className="grid w-full grid-cols-[1fr_auto] gap-3 px-4 py-3 text-left transition hover:bg-[var(--crm-surface-2)]"
                                            >
                                                <span className="min-w-0">
                                                    <span className="flex items-center gap-2 text-sm font-semibold">
                                                        <span className={`size-2 rounded-full ${toneClasses[alert.tone].dot}`} />
                                                        {alert.title}
                                                    </span>
                                                    <span className="mt-1 block text-xs text-[var(--crm-text-muted)]">{alert.subtitle}</span>
                                                </span>
                                                <span className={`text-sm font-semibold ${toneClasses[alert.tone].text}`}>{alert.amount}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="crm-panel-flat overflow-hidden">
                                    <div className="flex items-center justify-between gap-3 border-b border-[var(--crm-border)] px-5 py-4">
                                        <h2 className="text-sm font-semibold">Workflow distribution</h2>
                                    </div>

                                    <div className="p-4">
                                        {workflowDistribution.length > 0 ? (
                                            <div className="grid gap-3">
                                                {workflowDistribution.map((step) => {
                                                    const maxCount = Math.max(...workflowDistribution.map((s) => s.count), 1);
                                                    const pct = Math.round((step.count / maxCount) * 100);

                                                    return (
                                                        <div key={step.key}>
                                                            <div className="mb-1 flex items-center justify-between text-xs">
                                                                <span className="font-semibold text-[var(--crm-text)]">{step.label}</span>
                                                                <span className="text-[var(--crm-muted)]">{step.count}</span>
                                                            </div>
                                                            <div className="h-2 overflow-hidden rounded-full bg-black/20">
                                                                <div
                                                                    className="h-full rounded-full bg-[var(--crm-accent)]"
                                                                    style={{ width: `${pct}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <p className="text-xs text-[var(--crm-text-muted)]">No active projects.</p>
                                        )}
                                    </div>
                                </div>

                                {blockedDossiers.length > 0 ? (
                                    <div className="crm-panel-flat overflow-hidden">
                                        <div className="flex items-center justify-between gap-3 border-b border-[var(--crm-border)] px-5 py-4">
                                            <div className="flex items-center gap-2">
                                                <AlertTriangle size={14} className="text-red-400" />
                                                <h2 className="text-sm font-semibold">Blocked dossiers</h2>
                                            </div>
                                            <button type="button" className="text-xs font-semibold text-[var(--crm-gold)]" onClick={() => goTo('/dossiers')}>View all</button>
                                        </div>

                                        <div className="divide-y divide-[var(--crm-border)]">
                                            {blockedDossiers.map((dossier) => (
                                                <button
                                                    key={dossier.id}
                                                    type="button"
                                                    onClick={() => goTo(dossier.href)}
                                                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-[var(--crm-surface-2)]"
                                                >
                                                    <span className="min-w-0">
                                                        <span className="block truncate text-sm font-semibold">{dossier.project}</span>
                                                        <span className="block truncate text-xs text-[var(--crm-text-muted)]">{dossier.client}</span>
                                                        <span className="mt-1 block text-[11px] text-[var(--crm-gold)]">{dossier.step}</span>
                                                    </span>
                                                    <span className="shrink-0 rounded-full bg-red-500/10 px-2 py-1 text-[11px] font-bold text-red-300">
                                                        {dossier.daysStuck}d
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="crm-panel-flat p-4">
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle2 size={14} className="text-emerald-400" />
                                                <h2 className="text-sm font-semibold">Blocked dossiers</h2>
                                            </div>
                                        </div>
                                        <p className="mt-2 text-xs text-[var(--crm-text-muted)]">No dossiers stuck for more than 7 days.</p>
                                    </div>
                                )}

                                <div className="crm-panel-flat overflow-hidden">
                                    <div className="flex items-center justify-between gap-3 border-b border-[var(--crm-border)] px-5 py-4">
                                        <h2 className="text-sm font-semibold">System health</h2>
                                    </div>

                                    <div className="grid gap-2 p-4 sm:grid-cols-2">
                                        {systemHealth.map((item) => (
                                            <div key={item.label} className="flex items-center gap-3 rounded-[var(--crm-radius-md)] border border-[var(--crm-border)] bg-[var(--crm-surface)] p-3">
                                                <IconTile icon={item.icon} tone={item.tone} />
                                                <div className="min-w-0">
                                                    <p className="truncate text-xs text-[var(--crm-text-muted)]">{item.label}</p>
                                                    <p className="truncate text-sm font-semibold">{item.value}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </section>
                        </main>

                        <aside className="crm-right-panel min-w-0 space-y-[var(--crm-page-gap)]">
                            <div className="crm-panel-flat overflow-hidden">
<div className="flex items-center justify-between gap-3 border-b border-[var(--crm-border)] px-5 py-4">
                                        <h2 className="text-sm font-semibold">Activity feed</h2>
                                    <button type="button" className="text-xs font-semibold text-[var(--crm-gold)]">View all</button>
                                </div>

                                <div className="relative space-y-1 p-4">
                                    <div className="absolute bottom-4 left-[31px] top-4 w-px bg-[var(--crm-border)]" />

                                    {activityFeed.map((activity) => (
                                        <div key={activity.id} className="relative flex gap-3 rounded-[var(--crm-radius-md)] p-2 transition hover:bg-[var(--crm-surface-2)]">
                                            <span className={`relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full ${toneClasses[activity.tone].soft} ${toneClasses[activity.tone].text}`}>
                                                {(() => {
                                                    const Icon = iconMap[activity.icon] ?? FolderKanban;
                                                    return <Icon size={15} />;
                                                })()}
                                            </span>
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-semibold">{activity.title}</p>
                                                <p className="mt-1 text-xs leading-5 text-[var(--crm-text-muted)]">{activity.description}</p>
                                                <p className="mt-1 text-[11px] text-[var(--crm-text-soft)]">{activity.time}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="crm-panel-flat overflow-hidden">
                                <div className="flex items-center justify-between gap-3 border-b border-[var(--crm-border)] px-5 py-4">
                                    <h2 className="text-sm font-semibold">Urgent tasks</h2>
                                    <button type="button" className="text-xs font-semibold text-[var(--crm-gold)]" onClick={() => goTo('/tasks')}>View all</button>
                                </div>

                                {urgentTaskList.length > 0 ? (
                                    <div className="divide-y divide-[var(--crm-border)]">
                                        {urgentTaskList.map((t) => (
                                            <button key={t.id} type="button" onClick={() => goTo(`/tasks?task=${t.id}`)}
                                                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-[var(--crm-surface-2)]">
                                                <span className="min-w-0 flex-1">
                                                    <span className="flex items-center gap-2">
                                                        {t.isOverdue ? <span className="size-1.5 shrink-0 rounded-full bg-red-400" /> : null}
                                                        <span className="truncate text-sm font-semibold">{t.title}</span>
                                                    </span>
                                                    <span className="block truncate text-xs text-[var(--crm-text-muted)]">{t.taskNumber}</span>
                                                </span>
                                                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${t.priority === 'urgent' ? 'bg-red-500/10 text-red-300' : 'bg-yellow-500/10 text-yellow-300'}`}>
                                                    {t.isOverdue ? 'Overdue' : 'Urgent'}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-4">
                                        <p className="text-xs text-[var(--crm-text-muted)]">No urgent tasks assigned to you.</p>
                                    </div>
                                )}
                            </div>

                            <div className="crm-panel-flat overflow-hidden">
                                <div className="flex items-center justify-between gap-3 border-b border-[var(--crm-border)] px-5 py-4">
                                    <h2 className="text-sm font-semibold">Recent messages</h2>
                                    <button type="button" className="text-xs font-semibold text-[var(--crm-gold)]" onClick={() => goTo('/inbox')}>Open inbox</button>
                                </div>

                                {recentMessageList.length > 0 ? (
                                    <div className="divide-y divide-[var(--crm-border)]">
                                        {recentMessageList.map((m) => (
                                            <button key={m.id} type="button" onClick={() => goTo(`/inbox?conversation=${m.conversationId}`)}
                                                className="flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-[var(--crm-surface-2)]">
                                                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--crm-gold)] text-[10px] font-bold text-black">
                                                    {m.sender.charAt(0).toUpperCase()}
                                                </span>
                                                <span className="min-w-0 flex-1">
                                                    <span className="flex items-center gap-2">
                                                        <span className="truncate text-sm font-semibold">{m.sender}</span>
                                                        {m.unread ? <span className="size-1.5 shrink-0 rounded-full bg-[var(--crm-gold)]" /> : null}
                                                    </span>
                                                    <span className="block truncate text-xs text-[var(--crm-text-muted)]">{m.body}</span>
                                                    <span className="mt-0.5 block text-[11px] text-[var(--crm-text-soft)]">{m.createdAt}</span>
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-4">
                                        <p className="text-xs text-[var(--crm-text-muted)]">No recent messages.</p>
                                    </div>
                                )}
                            </div>
                        </aside>
                    </div>
                </section>
            </AppShell>
        </>
    );
}
```

## FILE: resources\js\pages\Finance\Documents\Show.tsx

```tsx
import { Head, router } from '@inertiajs/react';
import {
    ArrowLeft,
    BadgeDollarSign,
    CheckCircle2,
    Download,
    FileSpreadsheet,
    FileText,
    Landmark,
    LockKeyhole,
    ReceiptText,
    RotateCcw,
    ShieldCheck,
    Trash2,
    UserRound,
    XCircle,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { toast } from 'sonner';
import { AppShell } from '@/components/layout/AppShell';
import { AppButton } from '@/components/ui/AppButton';
import { FinanceDocumentLockBadge, FinanceDocumentLockNotice } from '@/features/finance/components/FinanceDocumentLockNotice';
import type { FinanceDocument, FinanceDocumentItem, Payment } from '@/features/finance/types';

const FORCE_FINANCE_SHOW_REDESIGN_53N = true;

type PageProps = {
    document: FinanceDocument;
};

function money(value: number, currency = 'MAD') {
    return `${Number(value || 0).toLocaleString('fr-MA')} ${currency || 'MAD'}`;
}

function dateLabel(value: string | null | undefined) {
    if (!value) {
        return '-';
    }

    return value.slice(0, 10);
}

function statusClass(status: string) {
    if (['paid', 'accepted', 'generated', 'sent', 'issued'].includes(status)) {
        return 'border-emerald-500/25 bg-emerald-500/10 text-emerald-300';
    }

    if (['partially_paid', 'draft'].includes(status)) {
        return 'border-amber-500/25 bg-amber-500/10 text-amber-300';
    }

    if (['rejected', 'cancelled', 'overdue'].includes(status)) {
        return 'border-red-500/25 bg-red-500/10 text-red-300';
    }

    return 'border-blue-500/25 bg-blue-500/10 text-blue-300';
}

function typeIcon(type: string): LucideIcon {
    if (type === 'invoice') {
        return Landmark;
    }

    if (type === 'receipt') {
        return ReceiptText;
    }

    return FileText;
}

function InfoTile({ label, value }: { label: string; value: ReactNode }) {
    return (
        <div className="rounded-xl border border-[var(--crm-border)] bg-[var(--crm-elevated)] p-3">
            <p className="crm-kpi-label">{label}</p>
            <div className="mt-2 truncate text-sm font-semibold text-[var(--crm-text)]">{value || '-'}</div>
        </div>
    );
}

function StatTile({
    label,
    value,
    hint,
    icon: Icon,
    tone = 'text-[var(--crm-accent)]',
}: {
    label: string;
    value: string | number;
    hint: string;
    icon: LucideIcon;
    tone?: string;
}) {
    return (
        <div className="crm-kpi-card">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="crm-kpi-label">{label}</p>
                    <p className={`crm-kpi-value ${tone}`}>{value}</p>
                </div>
                <div className="flex size-10 items-center justify-center rounded-xl bg-white/5">
                    <Icon size={18} className={tone} />
                </div>
            </div>
            <p className="mt-2 text-xs text-[var(--crm-muted)]">{hint}</p>
        </div>
    );
}

function ActionButton({
    children,
    onClick,
    tone = 'default',
    disabled = false,
}: {
    children: ReactNode;
    onClick: () => void;
    tone?: 'default' | 'primary' | 'danger' | 'success';
    disabled?: boolean;
}) {
    const toneClass = {
        default: 'border-[var(--crm-border)] text-[var(--crm-text)]',
        primary: 'border-[var(--crm-accent)] bg-[color-mix(in_srgb,var(--crm-accent)_18%,transparent)] text-[var(--crm-accent)]',
        danger: 'border-red-500/30 bg-red-500/10 text-red-300',
        success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    }[tone];

    return (
        <button
            type="button"
            disabled={disabled}
            onClick={onClick}
            className={`crm-action-button justify-center py-3 disabled:cursor-not-allowed disabled:opacity-45 ${toneClass}`}
        >
            {children}
        </button>
    );
}

function EmptyState({ label }: { label: string }) {
    return (
        <div className="rounded-xl border border-dashed border-[var(--crm-border)] bg-black/10 px-4 py-10 text-center text-sm text-[var(--crm-muted)]">
            {label}
        </div>
    );
}

export default function FinanceDocumentShow({ document }: PageProps) {
    const Icon = typeIcon(document.type);
    const currency = document.currency || 'MAD';
    const items = document.items ?? [];
    const payments = document.payments ?? [];
    const locked = Boolean(document.lock?.isLocked ?? document.numberLocked);

    function putAction(url: string | null | undefined, successMessage: string) {
        if (!url) {
            toast.error('Action is not available.');
            return;
        }

        router.put(url, {}, {
            preserveScroll: true,
            onSuccess: () => toast.success(successMessage),
            onError: () => toast.error('Action failed.'),
        });
    }

    function postAction(url: string | null | undefined, successMessage: string) {
        if (!url) {
            toast.error('Action is not available.');
            return;
        }

        router.post(url, {}, {
            preserveScroll: true,
            onSuccess: () => toast.success(successMessage),
            onError: () => toast.error('Action failed.'),
        });
    }

    function download(url: string | null | undefined) {
        if (!url) {
            toast.error('File is not available.');
            return;
        }

        window.location.href = url;
    }

    function deleteDocument() {
        if (!document.deleteUrl || !window.confirm(`Delete ${document.number}?`)) {
            return;
        }

        router.delete(document.deleteUrl, {
            onSuccess: () => {
                toast.success('Document deleted.');
                router.visit('/finance/documents');
            },
            onError: () => toast.error('Document could not be deleted.'),
        });
    }

    return (
        <>
            <Head title={document.number} />

            <AppShell
                eyebrowKey="nav.financeDocuments"
                titleKey="nav.financeDocuments"
                subtitleKey="dashboardHome.subtitle"
                action={
                    <div className="flex flex-wrap gap-2">
                        <AppButton variant="secondary" onPress={() => router.visit('/finance/documents')}>
                            <ArrowLeft size={16} />
                            Finance
                        </AppButton>
                        <AppButton variant="primary" onPress={() => putAction(document.generateUrl, 'Document generated.')}>
                            <RotateCcw size={16} />
                            Generate
                        </AppButton>
                    </div>
                }
            >
                <div className="crm-page mx-auto max-w-[1540px] pt-6 xl:pt-8" data-ui-marker={FORCE_FINANCE_SHOW_REDESIGN_53N ? 'FORCE_FINANCE_SHOW_REDESIGN_53N' : undefined}>
                    <section className="crm-panel overflow-hidden shadow-[0_18px_60px_rgba(0,0,0,0.24)]">
                        <div className="grid gap-5 p-5 xl:grid-cols-[minmax(0,1fr)_430px] xl:items-start">
                            <div className="flex min-w-0 items-start gap-4">
                                <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--crm-accent)_18%,transparent)] text-[var(--crm-accent)]">
                                    <Icon size={24} />
                                </div>

                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="crm-eyebrow">{document.typeLabel}</p>
                                        <FinanceDocumentLockBadge document={document} />
                                    </div>

                                    <h1 className="mt-2 truncate text-2xl font-black text-[var(--crm-text)]">{document.number}</h1>
                                    <p className="mt-1 text-sm text-[var(--crm-muted)]">
                                        {document.client?.name || 'No client'} / {document.dossier?.number || 'No dossier'}
                                    </p>

                                    <div className="mt-3 flex flex-wrap gap-2">
                                        <span className={`rounded-full border px-2 py-1 text-xs font-bold ${statusClass(document.status)}`}>
                                            {document.status}
                                        </span>
                                        <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-2 py-1 text-xs font-bold text-blue-300">
                                            TVA {document.tvaRate}%
                                        </span>
                                        {locked ? (
                                            <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/25 bg-amber-500/10 px-2 py-1 text-xs font-bold text-amber-300">
                                                <LockKeyhole size={12} />
                                                Locked
                                            </span>
                                        ) : null}
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-2 text-sm text-[var(--crm-muted)]">
                                <span className="flex items-center gap-2">
                                    <UserRound size={15} />
                                    {document.client?.name || '-'} / {document.client?.cin || '-'}
                                </span>
                                <span className="flex items-center gap-2">
                                    <FileText size={15} />
                                    {document.dossier?.number || '-'} / {document.dossier?.projectObject || '-'}
                                </span>
                                <div className="mt-2 grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        className="crm-action-button justify-center"
                                        onClick={() => document.client?.id ? router.visit(`/clients/${document.client.id}`) : router.visit('/clients')}
                                    >
                                        Client
                                    </button>
                                    <button
                                        type="button"
                                        className="crm-action-button justify-center"
                                        onClick={() => document.dossier?.id ? router.visit(`/dossiers/${document.dossier.id}`) : router.visit('/dossiers')}
                                    >
                                        Project
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="grid border-t border-[var(--crm-border)] md:grid-cols-5">
                            <div className="border-b border-[var(--crm-border)] p-4 md:border-b-0 md:border-r">
                                <p className="crm-kpi-label">Issue date</p>
                                <p className="mt-2 text-sm font-black">{dateLabel(document.issueDate)}</p>
                            </div>
                            <div className="border-b border-[var(--crm-border)] p-4 md:border-b-0 md:border-r">
                                <p className="crm-kpi-label">Due date</p>
                                <p className="mt-2 text-sm font-black">{dateLabel(document.dueDate)}</p>
                            </div>
                            <div className="border-b border-[var(--crm-border)] p-4 md:border-b-0 md:border-r">
                                <p className="crm-kpi-label">Valid until</p>
                                <p className="mt-2 text-sm font-black">{dateLabel(document.validUntil)}</p>
                            </div>
                            <div className="border-b border-[var(--crm-border)] p-4 md:border-b-0 md:border-r">
                                <p className="crm-kpi-label">PDF</p>
                                <p className="mt-2 text-sm font-black">{document.hasPdf ? 'Ready' : 'Missing'}</p>
                            </div>
                            <div className="p-4">
                                <p className="crm-kpi-label">Excel</p>
                                <p className="mt-2 text-sm font-black">{document.hasExcel ? 'Ready' : 'Missing'}</p>
                            </div>
                        </div>
                    </section>

                    {locked ? (
                        <FinanceDocumentLockNotice document={document} />
                    ) : null}

                    <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                        <StatTile label="Subtotal HT" value={money(document.subtotalHt, currency)} hint="Before TVA" icon={FileSpreadsheet} />
                        <StatTile label="TVA" value={money(document.taxTotal, currency)} hint={`${document.tvaRate}% tax`} icon={Landmark} tone="text-blue-300" />
                        <StatTile label="Total TTC" value={money(document.totalTtc, currency)} hint="Document total" icon={BadgeDollarSign} />
                        <StatTile label="Remaining" value={money(document.remainingTotal, currency)} hint="Amount still due" icon={ReceiptText} tone="text-amber-300" />
                    </section>

                    <section className="grid min-w-0 items-start gap-5 2xl:grid-cols-[minmax(0,1fr)_400px]">
                        <main className="grid min-w-0 gap-5">
                            <section className="crm-panel overflow-hidden">
                                <div className="flex items-start justify-between gap-4 border-b border-[var(--crm-border)] px-5 py-4">
                                    <div>
                                        <h2 className="text-sm font-black">Document lines</h2>
                                        <p className="mt-1 text-xs text-[var(--crm-muted)]">{items.length} item(s)</p>
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="crm-table">
                                        <thead>
                                            <tr>
                                                <th>Item</th>
                                                <th>Qty</th>
                                                <th>Unit</th>
                                                <th>Unit price</th>
                                                <th>TVA</th>
                                                <th className="text-right">Total TTC</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {items.map((item: FinanceDocumentItem) => (
                                                <tr key={item.id ?? item.position}>
                                                    <td>
                                                        <div className="min-w-0">
                                                            <p className="max-w-[360px] truncate font-semibold text-[var(--crm-text)]">{item.title}</p>
                                                            <p className="max-w-[420px] truncate text-xs text-[var(--crm-muted)]">{item.description || '-'}</p>
                                                        </div>
                                                    </td>
                                                    <td>{item.quantity}</td>
                                                    <td>{item.unit || '-'}</td>
                                                    <td>{money(item.unitPrice, currency)}</td>
                                                    <td>{item.tvaRate}%</td>
                                                    <td className="text-right font-black text-[var(--crm-accent)]">{money(item.totalTtc, currency)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {items.length === 0 ? <div className="p-5"><EmptyState label="No items in this document." /></div> : null}
                            </section>

                            <section className="crm-panel overflow-hidden">
                                <div className="flex items-start justify-between gap-4 border-b border-[var(--crm-border)] px-5 py-4">
                                    <div>
                                        <h2 className="text-sm font-black">Payments</h2>
                                        <p className="mt-1 text-xs text-[var(--crm-muted)]">{payments.length} payment(s)</p>
                                    </div>
                                </div>

                                <div className="p-5">
                                    {payments.length > 0 ? (
                                        <div className="grid gap-2">
                                            {payments.map((payment: Payment) => (
                                                <div key={payment.id} className="grid gap-2 rounded-xl border border-[var(--crm-border)] bg-[var(--crm-elevated)] px-3 py-2 md:grid-cols-[1fr_auto] md:items-center">
                                                    <div className="min-w-0">
                                                        <p className="truncate text-sm font-semibold text-[var(--crm-text)]">{payment.paymentNumber}</p>
                                                        <p className="text-xs text-[var(--crm-muted)]">
                                                            {payment.method || '-'} / {payment.reference || '-'} / {dateLabel(payment.paidAt)}
                                                        </p>
                                                    </div>
                                                    <div className="text-sm font-black text-emerald-300">{money(payment.amount, currency)}</div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <EmptyState label="No payments recorded for this document." />
                                    )}
                                </div>
                            </section>

                            <section className="crm-panel p-5">
                                <h2 className="text-sm font-black">Notes and terms</h2>
                                <div className="mt-4 grid gap-4 xl:grid-cols-2">
                                    <div className="rounded-xl border border-[var(--crm-border)] bg-[var(--crm-elevated)] p-4">
                                        <p className="crm-kpi-label">Notes</p>
                                        <p className="mt-3 text-sm leading-6 text-[var(--crm-muted)]">{document.notes || 'No notes saved.'}</p>
                                    </div>
                                    <div className="rounded-xl border border-[var(--crm-border)] bg-[var(--crm-elevated)] p-4">
                                        <p className="crm-kpi-label">Terms</p>
                                        <p className="mt-3 text-sm leading-6 text-[var(--crm-muted)]">{document.terms || 'No terms saved.'}</p>
                                    </div>
                                </div>
                            </section>
                        </main>

                        <aside className="grid min-w-0 gap-5 2xl:sticky 2xl:top-24">
                            <section className="crm-panel p-5">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck size={15} className="text-[var(--crm-accent)]" />
                                    <h2 className="text-sm font-black">Actions</h2>
                                </div>

                                <div className="mt-4 grid gap-2">
                                    <ActionButton tone="primary" onClick={() => putAction(document.generateUrl, 'Document generated.')}>
                                        <RotateCcw size={15} />
                                        Generate PDF + Excel
                                    </ActionButton>

                                    <div className="grid grid-cols-2 gap-2">
                                        <ActionButton onClick={() => putAction(document.generatePdfUrl, 'PDF generated.')}>
                                            <FileText size={15} />
                                            PDF
                                        </ActionButton>
                                        <ActionButton onClick={() => putAction(document.generateExcelUrl, 'Excel generated.')}>
                                            <FileSpreadsheet size={15} />
                                            Excel
                                        </ActionButton>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <ActionButton disabled={!document.pdfDownloadUrl} onClick={() => download(document.pdfDownloadUrl)}>
                                            <Download size={15} />
                                            PDF
                                        </ActionButton>
                                        <ActionButton disabled={!document.excelDownloadUrl} onClick={() => download(document.excelDownloadUrl)}>
                                            <Download size={15} />
                                            Excel
                                        </ActionButton>
                                    </div>

                                    {document.acceptUrl ? (
                                        <ActionButton tone="success" onClick={() => putAction(document.acceptUrl, 'Quote accepted.')}>
                                            <CheckCircle2 size={15} />
                                            Accept quote
                                        </ActionButton>
                                    ) : null}

                                    {document.rejectUrl ? (
                                        <ActionButton tone="danger" onClick={() => putAction(document.rejectUrl, 'Quote rejected.')}>
                                            <XCircle size={15} />
                                            Reject quote
                                        </ActionButton>
                                    ) : null}

                                    {document.convertToInvoiceUrl ? (
                                        <ActionButton tone="primary" onClick={() => postAction(document.convertToInvoiceUrl, 'Invoice created.')}>
                                            <Landmark size={15} />
                                            Convert to invoice
                                        </ActionButton>
                                    ) : null}

                                    <ActionButton onClick={() => putAction(document.cancelUrl, 'Document cancelled.')}>
                                        <XCircle size={15} />
                                        Cancel
                                    </ActionButton>

                                    <ActionButton tone="danger" onClick={deleteDocument}>
                                        <Trash2 size={15} />
                                        Delete
                                    </ActionButton>
                                </div>
                            </section>

                            <section className="crm-panel p-5">
                                <h2 className="text-sm font-black">Document details</h2>
                                <div className="mt-4 grid gap-3">
                                    <InfoTile label="Type" value={document.typeLabel} />
                                    <InfoTile label="Status" value={<span className={`rounded-full border px-2 py-1 text-xs font-bold ${statusClass(document.status)}`}>{document.status}</span>} />
                                    <InfoTile label="Generated" value={dateLabel(document.generatedAt)} />
                                    <InfoTile label="Created" value={dateLabel(document.createdAt)} />
                                    <InfoTile label="Updated" value={dateLabel(document.updatedAt)} />
                                </div>
                            </section>

                            <section className="crm-panel p-5">
                                <h2 className="text-sm font-black">Client and project</h2>
                                <div className="mt-4 grid gap-3">
                                    <InfoTile label="Client" value={document.client?.name || '-'} />
                                    <InfoTile label="CIN" value={document.client?.cin || '-'} />
                                    <InfoTile label="Dossier" value={document.dossier?.number || '-'} />
                                    <InfoTile label="Project" value={document.dossier?.projectObject || '-'} />
                                </div>
                            </section>
                        </aside>
                    </section>
                </div>
            </AppShell>
        </>
    );
}
```

## FILE: resources\js\pages\Finance\Settings\Index.tsx

```tsx
import { Head, router, usePage } from '@inertiajs/react';
import {
    Banknote,
    Building2,
    Calculator,
    FileText,
    ImageIcon,
    RotateCcw,
    Save,
    Settings,
    Upload,
} from 'lucide-react';
import { type ChangeEvent, type FormEvent, type ReactNode, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { AppShell } from '@/components/layout/AppShell';
import { AppButton } from '@/components/ui/AppButton';

const FORCE_FINANCE_SETTINGS_REDESIGN_53O = true;

type FinanceSettingsForm = {
    finance: {
        defaultTvaRate: string;
        defaultCurrency: string;
        defaultPaymentTermsDays: string;
        defaultQuoteValidityDays: string;
        defaultUnitPriceM2: string;
        defaultArchitectRate: string;
    };
    company: {
        companyName: string;
        companyAddress: string;
        companyPhone: string;
        companyEmail: string;
        companyIce: string;
        companyTva: string;
        companyPatente: string;
        companyCnss: string;
        companyLogoPath: string;
        companyLogoUrl?: string;
    };
    bank: {
        bankName: string;
        bankRib: string;
    };
};

type PageProps = {
    settings: {
        finance: {
            defaultTvaRate: number | string;
            defaultCurrency: string;
            defaultPaymentTermsDays: number | string;
            defaultQuoteValidityDays: number | string;
            defaultUnitPriceM2: number | string;
            defaultArchitectRate: number | string;
        };
        company: {
            companyName: string;
            companyAddress: string;
            companyPhone: string;
            companyEmail: string;
            companyIce: string;
            companyTva: string;
            companyPatente: string;
            companyCnss: string;
            companyLogoPath: string;
            companyLogoUrl?: string;
        };
        bank: {
            bankName: string;
            bankRib: string;
        };
    };
    routes: {
        update: string;
        reset: string;
        templates: string;
        finance: string;
        uploadLogo: string;
        deleteLogo: string;
    };
    errors?: Record<string, string>;
};

function toStringValue(value: unknown): string {
    return value === null || value === undefined ? '' : String(value);
}

function fromSettings(settings: PageProps['settings']): FinanceSettingsForm {
    return {
        finance: {
            defaultTvaRate: toStringValue(settings.finance.defaultTvaRate),
            defaultCurrency: toStringValue(settings.finance.defaultCurrency || 'MAD'),
            defaultPaymentTermsDays: toStringValue(settings.finance.defaultPaymentTermsDays),
            defaultQuoteValidityDays: toStringValue(settings.finance.defaultQuoteValidityDays),
            defaultUnitPriceM2: toStringValue(settings.finance.defaultUnitPriceM2),
            defaultArchitectRate: toStringValue(settings.finance.defaultArchitectRate),
        },
        company: {
            companyName: toStringValue(settings.company.companyName),
            companyAddress: toStringValue(settings.company.companyAddress),
            companyPhone: toStringValue(settings.company.companyPhone),
            companyEmail: toStringValue(settings.company.companyEmail),
            companyIce: toStringValue(settings.company.companyIce),
            companyTva: toStringValue(settings.company.companyTva),
            companyPatente: toStringValue(settings.company.companyPatente),
            companyCnss: toStringValue(settings.company.companyCnss),
            companyLogoPath: toStringValue(settings.company.companyLogoPath),
            companyLogoUrl: toStringValue(settings.company.companyLogoUrl),
        },
        bank: {
            bankName: toStringValue(settings.bank.bankName),
            bankRib: toStringValue(settings.bank.bankRib),
        },
    };
}

function toPayload(form: FinanceSettingsForm) {
    return {
        finance: {
            default_tva_rate: form.finance.defaultTvaRate,
            default_currency: form.finance.defaultCurrency,
            default_payment_terms_days: form.finance.defaultPaymentTermsDays,
            default_quote_validity_days: form.finance.defaultQuoteValidityDays,
            default_unit_price_m2: form.finance.defaultUnitPriceM2,
            default_architect_rate: form.finance.defaultArchitectRate,
        },
        company: {
            company_name: form.company.companyName,
            company_address: form.company.companyAddress,
            company_phone: form.company.companyPhone,
            company_email: form.company.companyEmail,
            company_ice: form.company.companyIce,
            company_tva: form.company.companyTva,
            company_patente: form.company.companyPatente,
            company_cnss: form.company.companyCnss,
            company_logo_path: form.company.companyLogoPath,
        },
        bank: {
            bank_name: form.bank.bankName,
            bank_rib: form.bank.bankRib,
        },
    };
}

function sameForm(a: FinanceSettingsForm, b: FinanceSettingsForm): boolean {
    return JSON.stringify(a) === JSON.stringify(b);
}

function Field({
    label,
    value,
    onChange,
    error,
    type = 'text',
    placeholder,
    help,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    type?: string;
    placeholder?: string;
    help?: string;
}) {
    return (
        <label className="block min-w-0">
            <span className="mb-1.5 block text-xs font-bold text-[var(--crm-text)]">{label}</span>
            <input
                type={type}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                className={[
                    'h-11 w-full rounded-xl border border-[var(--crm-border)] bg-[var(--crm-elevated)] px-3 text-sm text-[var(--crm-text)] outline-none transition',
                    'hover:border-[color-mix(in_srgb,var(--crm-accent)_45%,var(--crm-border))] focus:border-[var(--crm-accent)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--crm-accent)_18%,transparent)]',
                    error ? 'border-red-500/70' : '',
                ].join(' ')}
            />
            {help ? <span className="mt-1 block text-xs text-[var(--crm-muted)]">{help}</span> : null}
            {error ? <span className="mt-1 block text-xs font-semibold text-red-400">{error}</span> : null}
        </label>
    );
}

function TextArea({
    label,
    value,
    onChange,
    error,
    placeholder,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    placeholder?: string;
}) {
    return (
        <label className="block min-w-0">
            <span className="mb-1.5 block text-xs font-bold text-[var(--crm-text)]">{label}</span>
            <textarea
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                rows={4}
                className={[
                    'w-full resize-y rounded-xl border border-[var(--crm-border)] bg-[var(--crm-elevated)] px-3 py-2 text-sm text-[var(--crm-text)] outline-none transition',
                    'hover:border-[color-mix(in_srgb,var(--crm-accent)_45%,var(--crm-border))] focus:border-[var(--crm-accent)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--crm-accent)_18%,transparent)]',
                    error ? 'border-red-500/70' : '',
                ].join(' ')}
            />
            {error ? <span className="mt-1 block text-xs font-semibold text-red-400">{error}</span> : null}
        </label>
    );
}

function Section({
    icon: Icon,
    title,
    description,
    children,
}: {
    icon: typeof Settings;
    title: string;
    description: string;
    children: ReactNode;
}) {
    return (
        <section className="crm-panel overflow-hidden">
            <div className="flex items-start gap-3 border-b border-[var(--crm-border)] px-5 py-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--crm-accent)_16%,transparent)] text-[var(--crm-accent)]">
                    <Icon size={18} />
                </div>
                <div className="min-w-0">
                    <h2 className="text-sm font-black text-[var(--crm-text)]">{title}</h2>
                    <p className="mt-1 text-xs text-[var(--crm-muted)]">{description}</p>
                </div>
            </div>
            <div className="p-5">{children}</div>
        </section>
    );
}

function PreviewTile({ label, value }: { label: string; value: ReactNode }) {
    return (
        <div className="rounded-xl border border-[var(--crm-border)] bg-[var(--crm-elevated)] p-3">
            <p className="crm-kpi-label">{label}</p>
            <div className="mt-2 text-sm font-black text-[var(--crm-text)]">{value || '-'}</div>
        </div>
    );
}

export default function FinanceSettingsIndex({ settings, routes }: PageProps) {
    const { errors = {} } = usePage<PageProps>().props;
    const initialForm = useMemo(() => fromSettings(settings), [settings]);

    const [form, setForm] = useState<FinanceSettingsForm>(initialForm);
    const [processing, setProcessing] = useState(false);

    const isDirty = useMemo(() => !sameForm(form, initialForm), [form, initialForm]);

    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
                event.preventDefault();

                if (isDirty && !processing) {
                    save();
                }
            }
        }

        window.addEventListener('keydown', handleKeyDown);

        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [form, isDirty, processing]);

    function updateFinance(key: keyof FinanceSettingsForm['finance'], value: string) {
        setForm((current) => ({ ...current, finance: { ...current.finance, [key]: value } }));
    }

    function updateCompany(key: keyof FinanceSettingsForm['company'], value: string) {
        setForm((current) => ({ ...current, company: { ...current.company, [key]: value } }));
    }

    function updateBank(key: keyof FinanceSettingsForm['bank'], value: string) {
        setForm((current) => ({ ...current, bank: { ...current.bank, [key]: value } }));
    }

    function save(event?: FormEvent<HTMLFormElement>) {
        event?.preventDefault();
        setProcessing(true);

        router.put(routes.update, toPayload(form), {
            preserveScroll: true,
            onSuccess: () => toast.success('Finance settings saved.'),
            onError: () => toast.error('Please check the settings form.'),
            onFinish: () => setProcessing(false),
        });
    }

    function resetDefaults() {
        if (!window.confirm('Reset finance defaults? Company and bank information will not be changed.')) {
            return;
        }

        router.put(routes.reset, {}, {
            preserveScroll: true,
            onSuccess: () => toast.success('Finance defaults reset.'),
            onError: () => toast.error('Could not reset finance defaults.'),
        });
    }

    function uploadLogo(event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        const formData = new FormData();
        formData.append('logo', file);

        router.post(routes.uploadLogo, formData, {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => toast.success('Logo uploaded.'),
            onError: () => toast.error('Could not upload logo.'),
            onFinish: () => {
                event.target.value = '';
            },
        });
    }

    function deleteLogo() {
        if (!window.confirm('Remove company logo?')) {
            return;
        }

        router.delete(routes.deleteLogo, {
            preserveScroll: true,
            onSuccess: () => toast.success('Logo removed.'),
            onError: () => toast.error('Could not remove logo.'),
        });
    }

    return (
        <>
            <Head title="Finance Settings" />

            <AppShell
                eyebrowKey="financeWorkspace.eyebrow"
                titleKey="financeWorkspace.title"
                subtitleKey="financeWorkspace.subtitle"
                action={
                    <div className="flex flex-wrap gap-2">
                        <AppButton variant="secondary" onPress={() => router.visit(routes.templates)}>
                            <FileText size={16} />
                            Templates
                        </AppButton>
                        <AppButton variant="primary" type="submit" form="finance-settings-form" isDisabled={!isDirty || processing}>
                            <Save size={16} />
                            {processing ? 'Saving...' : 'Save'}
                        </AppButton>
                    </div>
                }
            >
                <form
                    id="finance-settings-form"
                    className="crm-page mx-auto max-w-[1540px] pt-6 xl:pt-8"
                    data-ui-marker={FORCE_FINANCE_SETTINGS_REDESIGN_53O ? 'FORCE_FINANCE_SETTINGS_REDESIGN_53O' : undefined}
                    onSubmit={save}
                >
                    <section className="crm-panel overflow-hidden shadow-[0_18px_60px_rgba(0,0,0,0.24)]">
                        <div className="flex flex-wrap items-start justify-between gap-4 p-5">
                            <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                    <Settings size={15} className="text-[var(--crm-accent)]" />
                                    <p className="crm-eyebrow">Finance settings</p>
                                </div>
                                <h1 className="mt-2 text-2xl font-black tracking-tight text-[var(--crm-text)]">
                                    Company and finance defaults
                                </h1>
                                <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--crm-muted)]">
                                    Manage TVA, currency, company legal information, logo, bank details and default values used in Devis, Factures and PDF templates.
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                {isDirty ? (
                                    <span className="rounded-full border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-xs font-black text-amber-300">
                                        Unsaved changes
                                    </span>
                                ) : (
                                    <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-xs font-black text-emerald-300">
                                        Saved
                                    </span>
                                )}

                                <button type="button" onClick={resetDefaults} className="crm-action-button py-3 text-amber-300">
                                    <RotateCcw size={15} />
                                    Reset finance
                                </button>
                            </div>
                        </div>
                    </section>

                    <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
                        <main className="grid min-w-0 gap-5">
                            <Section
                                icon={Calculator}
                                title="Finance defaults"
                                description="Used by the finance builder for TVA, due dates and automatic calculations."
                            >
                                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                    <Field label="Default TVA rate (%)" type="number" value={form.finance.defaultTvaRate} onChange={(value) => updateFinance('defaultTvaRate', value)} error={errors['finance.default_tva_rate']} />
                                    <Field label="Currency" value={form.finance.defaultCurrency} onChange={(value) => updateFinance('defaultCurrency', value)} error={errors['finance.default_currency']} placeholder="MAD" />
                                    <Field label="Payment terms days" type="number" value={form.finance.defaultPaymentTermsDays} onChange={(value) => updateFinance('defaultPaymentTermsDays', value)} error={errors['finance.default_payment_terms_days']} />
                                    <Field label="Quote validity days" type="number" value={form.finance.defaultQuoteValidityDays} onChange={(value) => updateFinance('defaultQuoteValidityDays', value)} error={errors['finance.default_quote_validity_days']} />
                                    <Field label="Default unit price/m2" type="number" value={form.finance.defaultUnitPriceM2} onChange={(value) => updateFinance('defaultUnitPriceM2', value)} error={errors['finance.default_unit_price_m2']} />
                                    <Field label="Default architect rate (%)" type="number" value={form.finance.defaultArchitectRate} onChange={(value) => updateFinance('defaultArchitectRate', value)} error={errors['finance.default_architect_rate']} />
                                </div>
                            </Section>

                            <Section
                                icon={Building2}
                                title="Company information"
                                description="Used in template headers, legal footers and generated PDF documents."
                            >
                                <div className="grid gap-4 md:grid-cols-2">
                                    <Field label="Company name" value={form.company.companyName} onChange={(value) => updateCompany('companyName', value)} error={errors['company.company_name']} />
                                    <Field label="Company email" type="email" value={form.company.companyEmail} onChange={(value) => updateCompany('companyEmail', value)} error={errors['company.company_email']} />
                                    <Field label="Company phone" value={form.company.companyPhone} onChange={(value) => updateCompany('companyPhone', value)} error={errors['company.company_phone']} />
                                    <Field label="Logo path" value={form.company.companyLogoPath} onChange={(value) => updateCompany('companyLogoPath', value)} error={errors['company.company_logo_path']} help="Use a public URL or upload the logo below." />

                                    <div className="md:col-span-2 rounded-xl border border-[var(--crm-border)] bg-[var(--crm-elevated)] p-4">
                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                            <div className="flex items-start gap-3">
                                                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--crm-accent)_16%,transparent)] text-[var(--crm-accent)]">
                                                    <ImageIcon size={18} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black">Company logo</p>
                                                    <p className="mt-1 text-xs text-[var(--crm-muted)]">
                                                        Upload PNG, JPG, WEBP or SVG. Use {'{{company.logo_html}}'} inside templates.
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-2">
                                                <label className="crm-action-button cursor-pointer border-[var(--crm-accent)] bg-[color-mix(in_srgb,var(--crm-accent)_18%,transparent)] py-3 text-[var(--crm-accent)]">
                                                    <Upload size={15} />
                                                    Upload logo
                                                    <input type="file" accept=".png,.jpg,.jpeg,.webp,.svg" className="hidden" onChange={uploadLogo} />
                                                </label>

                                                {form.company.companyLogoPath ? (
                                                    <button type="button" onClick={deleteLogo} className="crm-action-button py-3 text-red-300">
                                                        Remove
                                                    </button>
                                                ) : null}
                                            </div>
                                        </div>

                                        {form.company.companyLogoUrl ? (
                                            <div className="mt-4 flex items-center gap-3 rounded-xl border border-[var(--crm-border)] bg-black/20 p-3">
                                                <img src={form.company.companyLogoUrl} alt="Company logo" className="h-12 w-12 rounded-xl object-contain" />
                                                <div className="min-w-0">
                                                    <p className="text-xs font-black">Current logo</p>
                                                    <p className="mt-1 truncate text-xs text-[var(--crm-muted)]">{form.company.companyLogoPath}</p>
                                                </div>
                                            </div>
                                        ) : form.company.companyLogoPath ? (
                                            <div className="mt-4 rounded-xl border border-[var(--crm-border)] bg-black/20 p-3 text-xs text-[var(--crm-muted)]">
                                                Current path: {form.company.companyLogoPath}
                                            </div>
                                        ) : null}
                                    </div>

                                    <div className="md:col-span-2">
                                        <TextArea label="Company address" value={form.company.companyAddress} onChange={(value) => updateCompany('companyAddress', value)} error={errors['company.company_address']} />
                                    </div>

                                    <Field label="ICE" value={form.company.companyIce} onChange={(value) => updateCompany('companyIce', value)} error={errors['company.company_ice']} />
                                    <Field label="TVA" value={form.company.companyTva} onChange={(value) => updateCompany('companyTva', value)} error={errors['company.company_tva']} />
                                    <Field label="Patente" value={form.company.companyPatente} onChange={(value) => updateCompany('companyPatente', value)} error={errors['company.company_patente']} />
                                    <Field label="CNSS" value={form.company.companyCnss} onChange={(value) => updateCompany('companyCnss', value)} error={errors['company.company_cnss']} />
                                </div>
                            </Section>

                            <Section
                                icon={Banknote}
                                title="Bank information"
                                description="Used in documents when bank transfer details are needed."
                            >
                                <div className="grid gap-4 md:grid-cols-2">
                                    <Field label="Bank name" value={form.bank.bankName} onChange={(value) => updateBank('bankName', value)} error={errors['bank.bank_name']} />
                                    <Field label="RIB" value={form.bank.bankRib} onChange={(value) => updateBank('bankRib', value)} error={errors['bank.bank_rib']} />
                                </div>
                            </Section>
                        </main>

                        <aside className="grid min-w-0 gap-5 xl:sticky xl:top-24 xl:self-start">
                            <section className="crm-panel p-5">
                                <div className="mb-4 flex items-center gap-3">
                                    <div className="flex size-10 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--crm-accent)_16%,transparent)] text-[var(--crm-accent)]">
                                        <FileText size={18} />
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-black">Document impact</h2>
                                        <p className="text-xs text-[var(--crm-muted)]">Values used by templates.</p>
                                    </div>
                                </div>

                                <div className="grid gap-3">
                                    <PreviewTile label="Company" value={form.company.companyName || '-'} />
                                    <PreviewTile label="TVA" value={`${form.finance.defaultTvaRate || 0}%`} />
                                    <PreviewTile label="Currency" value={form.finance.defaultCurrency || 'MAD'} />
                                    <PreviewTile label="Payment days" value={form.finance.defaultPaymentTermsDays || '-'} />
                                    <PreviewTile label="Unit price/m2" value={`${form.finance.defaultUnitPriceM2 || 0} ${form.finance.defaultCurrency || 'MAD'}`} />
                                </div>
                            </section>

                            <section className="crm-panel p-5">
                                <h2 className="text-sm font-black">Legal footer</h2>
                                <p className="mt-3 text-sm leading-6 text-[var(--crm-muted)]">
                                    ICE: {form.company.companyIce || '-'} / CNSS: {form.company.companyCnss || '-'} / Patente: {form.company.companyPatente || '-'} / TVA: {form.company.companyTva || '-'}
                                </p>
                            </section>

                            <section className="crm-panel p-5">
                                <h2 className="text-sm font-black">Bank</h2>
                                <p className="mt-3 text-sm leading-6 text-[var(--crm-muted)]">
                                    {form.bank.bankName || 'No bank selected'}<br />
                                    {form.bank.bankRib || 'No RIB'}
                                </p>
                            </section>
                        </aside>
                    </section>
                </form>
            </AppShell>
        </>
    );
}
```

## FILE: resources\js\pages\Inbox\Index.tsx

```tsx
import { Head, router } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { AppShell } from '@/components/layout/AppShell';
import { AppButton } from '@/components/ui/AppButton';
import type { FormErrors } from '@/lib/formErrors';
import type { ChatUserOption, ConversationRow, MessageRow } from '@/features/chat/types';
import { ConversationList } from '@/features/inbox/components/ConversationList';
import { MessageThread } from '@/features/inbox/components/MessageThread';
import { NewConversationDrawer } from '@/features/inbox/components/NewConversationDrawer';

type PageProps = {
    conversations: ConversationRow[];
    users: ChatUserOption[];
    unreadCount: number;
};

export default function InboxIndex({ conversations, users, unreadCount }: PageProps) {
    const [selectedConv, setSelectedConv] = useState<ConversationRow | null>(null);
    const [messages, setMessages] = useState<MessageRow[]>([]);
    const [messageBody, setMessageBody] = useState('');
    const [loading, setLoading] = useState(false);
    const [newConvOpen, setNewConvOpen] = useState(false);
    const [newConvForm, setNewConvForm] = useState({ user_id: '', subject: '' });
    const [formErrors, setFormErrors] = useState<FormErrors>({});
    const [search, setSearch] = useState('');

    const filteredConvs = useMemo(() => conversations.filter((c) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        const parts = Array.isArray(c.participants) ? c.participants : [];
        return parts.some((p) => p?.user?.name?.toLowerCase().includes(q)) || (c.subject || '').toLowerCase().includes(q);
    }), [conversations, search]);

    function openConversation(conv: ConversationRow) {
        setSelectedConv(conv);
        setLoading(true);
        fetch(`/inbox/${conv.id}`)
            .then((r) => r.json())
            .then((data) => {
                setMessages(data.messages || []);
            })
            .catch(() => toast.error('Failed to load messages'))
            .finally(() => setLoading(false));
    }

    function sendMessage() {
        if (!messageBody.trim() || !selectedConv) return;
        fetch(`/inbox/${selectedConv.id}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': (window as any).csrfToken || '' },
            body: JSON.stringify({ body: messageBody }),
        })
            .then((r) => r.json())
            .then((msg) => {
                setMessages((prev) => [...prev, msg]);
                setMessageBody('');
            })
            .catch(() => toast.error('Failed to send message'));
    }

    function handleNewConv(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setFormErrors({});
        router.post('/inbox', {
            user_ids: [Number(newConvForm.user_id)],
            type: 'direct',
            subject: newConvForm.subject || null,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setNewConvOpen(false);
                setNewConvForm({ user_id: '', subject: '' });
                toast.success('Conversation created.');
            },
            onError: (err) => setFormErrors(err),
        });
    }

    return (
        <>
            <Head title="Inbox" />
            <AppShell eyebrowKey="nav.inbox" titleKey="nav.inbox" subtitleKey="Direct messages and context chats"
                action={
                    <AppButton variant="primary" onPress={() => { setFormErrors({}); setNewConvOpen(true); }}>
                        <Plus size={16} /> New conversation
                    </AppButton>
                }
            >
                <section className="grid min-w-0 flex-1 grid-cols-[320px_minmax(0,1fr)] gap-0 overflow-hidden rounded-xl border border-[var(--crm-border)]" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                    <ConversationList
                        conversations={filteredConvs}
                        selectedConvId={selectedConv?.id ?? null}
                        search={search}
                        onSearchChange={setSearch}
                        onSelect={openConversation}
                    />

                    <div className="flex flex-col">
                        <MessageThread
                            conversation={selectedConv}
                            messages={messages}
                            loading={loading}
                            messageBody={messageBody}
                            onMessageBodyChange={setMessageBody}
                            onSend={sendMessage}
                        />
                    </div>
                </section>

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

## FILE: resources\js\pages\Notifications\Index.tsx

```tsx
import { Head, router } from '@inertiajs/react';
import { Bell, CheckCheck } from 'lucide-react';
import { useMemo } from 'react';
import { toast } from 'sonner';
import { AppShell } from '@/components/layout/AppShell';
import { AppButton } from '@/components/ui/AppButton';
import type { NotificationRow } from '@/features/notifications/types';
import {
    enrichNotification,
    formatNotificationTime,
    getNotificationIcon,
    groupNotificationsByTime,
    SEVERITY_COLORS,
    TIME_GROUP_ORDER,
} from '@/features/notifications/helpers';

type PageProps = {
    notifications: NotificationRow[];
    unreadCount: number;
    activeFilter: string;
};

const FILTERS = [
    { id: 'all', label: 'All' },
    { id: 'unread', label: 'Unread' },
];

export default function NotificationsIndex({ notifications, unreadCount, activeFilter }: PageProps) {
    const enriched = useMemo(() => notifications.map(enrichNotification), [notifications]);

    const grouped = useMemo(() => groupNotificationsByTime(enriched), [enriched]);

    function markAsRead(id: string) {
        router.post(`/notifications/${id}/read`, {}, {
            preserveScroll: true,
            onSuccess: () => toast.success('Marked as read.'),
        });
    }

    function markAllAsRead() {
        router.post('/notifications/read-all', {}, {
            preserveScroll: true,
            onSuccess: () => toast.success('All marked as read.'),
        });
    }

    return (
        <>
            <Head title="Notifications" />
            <AppShell eyebrowKey="nav.notifications" titleKey="nav.notifications" subtitleKey="Task updates, chat messages, and system alerts"
                action={
                    unreadCount > 0 ? (
                        <AppButton variant="secondary" onPress={markAllAsRead}>
                            <CheckCheck size={16} /> Mark all read
                        </AppButton>
                    ) : undefined
                }
            >
                <div className="crm-page">
                    <section className="flex flex-wrap gap-2">
                        {FILTERS.map((f) => (
                            <button key={f.id} type="button" onClick={() => router.visit(`/notifications?filter=${f.id}`, { preserveState: true })}
                                className={`inline-flex h-8 items-center gap-2 rounded-lg border px-3 text-xs font-semibold transition ${activeFilter === f.id ? 'border-[var(--crm-gold)] bg-[var(--crm-gold-soft)] text-[var(--crm-gold)]' : 'border-[var(--crm-border)] text-[var(--crm-text-muted)] hover:text-[var(--crm-text)]'}`}>
                                {f.label}
                                {f.id === 'unread' && unreadCount > 0 ? <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[9px] text-white">{unreadCount}</span> : null}
                            </button>
                        ))}
                        <span className="ml-auto text-xs text-[var(--crm-text-muted)]">{unreadCount} unread</span>
                    </section>

                    <section className="space-y-6">
                        {TIME_GROUP_ORDER.map((group) => {
                            const items = grouped.get(group);
                            if (!items?.length) return null;
                            const label = group === 'now' ? 'Now' : group === 'today' ? 'Today' : group === 'yesterday' ? 'Yesterday' : 'Earlier';
                            return (
                                <div key={group}>
                                    <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--crm-text-muted)]">{label}</h3>
                                    <div className="space-y-1">
                                        {items.map((n) => {
                                            const Icon = getNotificationIcon(n.module);
                                            const sev = SEVERITY_COLORS[n.severity];
                                            return (
                                                <div key={n.id} className={`flex items-start gap-3 rounded-xl border px-4 py-3 transition ${n.isRead ? 'border-[var(--crm-border)] bg-[var(--crm-surface)]' : 'border-[var(--crm-gold)]/20 bg-[color-mix(in_srgb,var(--crm-gold)_6%,transparent)]'}`}>
                                                    <div className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${n.isRead ? 'bg-[var(--crm-surface-2)] text-[var(--crm-muted)]' : `${sev.bg} text-[var(--crm-gold)]`}`}>
                                                        <Icon size={15} />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <p className={`text-sm font-semibold ${n.isRead ? 'text-[var(--crm-text-muted)]' : 'text-[var(--crm-text)]'}`}>{n.title}</p>
                                                            <span className="shrink-0 text-[10px] text-[var(--crm-text-muted)]">{formatNotificationTime(n.createdAt)}</span>
                                                        </div>
                                                        {n.body ? (
                                                            <p className={`mt-0.5 text-xs ${n.isRead ? 'text-[var(--crm-text-muted)]/70' : 'text-[var(--crm-text-muted)]'}`}>{n.body}</p>
                                                        ) : null}
                                                        <div className="mt-1.5 flex items-center gap-2">
                                                            {n.entityLabel ? (
                                                                <span className="inline-flex items-center gap-1 rounded bg-[var(--crm-surface-2)] px-1.5 py-0.5 text-[9px] font-semibold text-[var(--crm-muted)]">{n.entityLabel}</span>
                                                            ) : null}
                                                            <span className={`text-[9px] font-semibold ${n.isRead ? 'text-[var(--crm-muted)]' : sev.dot.replace('bg-', 'text-')}`}>
                                                                {n.severity === 'urgent' ? 'Urgent' : n.severity === 'warning' ? 'Warning' : n.severity === 'success' ? 'Success' : 'Info'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex shrink-0 items-center gap-1">
                                                        {n.actionUrl ? (
                                                            <button type="button" onClick={() => router.visit(n.actionUrl!)}
                                                                className="crm-action-button h-7 px-2 text-xs">View</button>
                                                        ) : null}
                                                        {!n.isRead ? (
                                                            <button type="button" onClick={() => markAsRead(n.id)}
                                                                className="crm-action-button h-7 w-7 px-0" title="Mark as read">
                                                                <CheckCheck size={12} />
                                                            </button>
                                                        ) : null}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                        {enriched.length === 0 ? (
                            <div className="py-16 text-center">
                                <Bell size={36} className="mx-auto text-[var(--crm-muted)]" />
                                <p className="mt-3 text-sm text-[var(--crm-text-muted)]">No notifications yet</p>
                            </div>
                        ) : null}
                    </section>
                </div>
            </AppShell>
        </>
    );
}

```

## FILE: resources\js\pages\Tasks\Index.tsx

```tsx
import { Head, router } from '@inertiajs/react';
import { CalendarDays, Columns3, LayoutDashboard, List, Plus, Table2, Timeline } from 'lucide-react';
import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { AppShell } from '@/components/layout/AppShell';
import { AppButton } from '@/components/ui/AppButton';
import type { FormErrors } from '@/lib/formErrors';
import type { TaskRow, TaskStatus, UserOption, ViewMode } from '@/features/tasks/types';
import { COLUMNS } from '@/features/tasks/types';
import { TaskFilters } from '@/features/tasks/components/TaskFilters';
import { TaskBoard } from '@/features/tasks/components/TaskBoard';
import { TaskCalendar } from '@/features/tasks/components/TaskCalendar';
import { TaskListView } from '@/features/tasks/components/TaskListView';
import { TaskTable } from '@/features/tasks/components/TaskTable';
import { TaskTimeline } from '@/features/tasks/components/TaskTimeline';
import { TaskOverview } from '@/features/tasks/components/TaskOverview';
import { TaskCreateDrawer } from '@/features/tasks/components/TaskCreateDrawer';
import { TaskDetailDrawer } from '@/features/tasks/components/TaskDetailDrawer';
import { TaskRequestCreateDrawer, type TaskRequestOptions } from '@/features/tasks/components/TaskRequestCreateDrawer';

type PageProps = {
    tasks: TaskRow[];
    users: UserOption[];
    activeFilter: string;
    activeCategory: string;
    taskRequestTypes: string[];
    taskRequestTypeLabels: Record<string, string>;
    taskRequestOptions: TaskRequestOptions;
};

function isOpenTask(task: TaskRow) {
    return task.status !== 'completed' && task.status !== 'cancelled';
}

function isOverdue(task: TaskRow) {
    return Boolean(task.dueDate && new Date(task.dueDate) < new Date() && isOpenTask(task));
}

export default function TasksIndex({ tasks, users, activeFilter, activeCategory, taskRequestTypes, taskRequestTypeLabels, taskRequestOptions }: PageProps) {
    const [localTasks, setLocalTasks] = useState<TaskRow[]>(tasks);
    const [query, setQuery] = useState('');
    const [filter, setFilter] = useState(activeFilter);
    const [category, setCategory] = useState(activeCategory);
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [viewMode, setViewMode] = useState<ViewMode>(() => {
        if (typeof window !== 'undefined') {
            return (localStorage.getItem('tasks_view') as ViewMode) || 'overview';
        }
        return 'overview';
    });
    const [selectedTask, setSelectedTask] = useState<TaskRow | null>(null);
    const [createOpen, setCreateOpen] = useState(false);
    const [requestOpen, setRequestOpen] = useState(false);
    const [form, setForm] = useState({
        title: '', description: '', status: 'not_started' as string,
        priority: 'medium' as string, impact: 'normal' as string, type: 'general' as string,
        category: 'general_admin' as string,
        start_date: '', due_date: '', estimated_minutes: '', blocked_reason: '',
        assignee_ids: [] as number[], watcher_ids: [] as number[],
    });
    const [formErrors, setFormErrors] = useState<FormErrors>({});

    const filtered = useMemo(() => {
        let items = localTasks;
        if (query.trim()) {
            const q = query.toLowerCase();
            items = items.filter((t) =>
                t.title.toLowerCase().includes(q) ||
                t.taskNumber.toLowerCase().includes(q) ||
                (t.description && t.description.toLowerCase().includes(q)) ||
                (t.client && t.client.name.toLowerCase().includes(q)) ||
                (t.dossier && (t.dossier.number.toLowerCase().includes(q) || t.dossier.object.toLowerCase().includes(q))) ||
                t.category.toLowerCase().includes(q) ||
                t.status.toLowerCase().includes(q) ||
                t.priority.toLowerCase().includes(q)
            );
        }
        if (category !== 'all') {
            items = items.filter((t) => t.category === category);
        }
        if (priorityFilter !== 'all') {
            items = items.filter((t) => t.priority === priorityFilter);
        }
        if (filter === 'my') {
            /* client-side approximate */
        } else if (filter === 'overdue') {
            items = items.filter((t) => isOverdue(t));
        } else if (filter === 'due_today') {
            const today = new Date().toISOString().slice(0, 10);
            items = items.filter((t) => t.dueDate === today);
        } else if (filter === 'due_week') {
            const now = new Date(); const end = new Date(now); end.setDate(now.getDate() + (7 - now.getDay()));
            const endStr = end.toISOString().slice(0, 10);
            items = items.filter((t) => t.dueDate && t.dueDate <= endStr);
        } else if (filter === 'blocked') {
            items = items.filter((t) => t.status === 'blocked');
        } else if (filter === 'completed') {
            items = items.filter((t) => t.status === 'completed');
        } else if (filter === 'assigned_by_me') {
            /* server-side */
        } else if (filter === 'watching') {
            /* server-side */
        }
        return items;
    }, [localTasks, query, category, priorityFilter, filter]);

    const columns = useMemo(() => {
        const map: Record<string, TaskRow[]> = {};
        for (const col of COLUMNS) map[col] = [];
        for (const t of filtered) {
            if (map[t.status]) map[t.status].push(t);
        }
        return map;
    }, [filtered]);

    useEffect(() => {
        setFilter(activeFilter);
    }, [activeFilter]);

    useEffect(() => {
        setLocalTasks(tasks);
        setSelectedTask((current) => current ? tasks.find((task) => task.id === current.id) ?? current : null);
    }, [tasks]);

    useEffect(() => {
        localStorage.setItem('tasks_view', viewMode);
    }, [viewMode]);

    const handleCreate = useCallback((event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setFormErrors({});
        const payload = { ...form, estimated_minutes: form.estimated_minutes ? parseInt(form.estimated_minutes, 10) : null };
        router.post('/tasks', payload, {
            preserveScroll: true,
            onSuccess: () => {
                setCreateOpen(false);
                setForm({ title: '', description: '', status: 'not_started', priority: 'medium', impact: 'normal', type: 'general', category: 'general_admin', start_date: '', due_date: '', estimated_minutes: '', blocked_reason: '', assignee_ids: [], watcher_ids: [] });
                toast.success('Task created.');
            },
            onError: (err) => {
                setFormErrors(err);
                toast.error('Please check form errors.');
            },
        });
    }, [form]);

    const handleCreateInStatus = useCallback((status: string) => {
        setForm((prev) => ({ ...prev, status }));
        setCreateOpen(true);
    }, []);

    const replaceTask = useCallback((taskId: number, updater: (task: TaskRow) => TaskRow) => {
        setLocalTasks((current) => current.map((task) => task.id === taskId ? updater(task) : task));
        setSelectedTask((current) => current && current.id === taskId ? updater(current) : current);
    }, []);

    const updateStatus = useCallback((task: TaskRow, status: string) => {
        const previous = task;
        const nextStatus = status as TaskStatus;

        replaceTask(task.id, (current) => ({
            ...current,
            status: nextStatus,
            completedAt: nextStatus === 'completed' ? new Date().toISOString() : current.completedAt,
            progress: nextStatus === 'completed' ? 100 : current.progress,
        }));

        router.put(`/tasks/${task.id}/status`, { status }, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => toast.success('Status updated.'),
            onError: () => {
                replaceTask(task.id, () => previous);
                toast.error('Status update failed.');
            },
        });
    }, [replaceTask]);

    const toggleChecklistItem = useCallback((taskId: number, itemId: number) => {
        const previous = localTasks.find((task) => task.id === taskId) ?? null;

        replaceTask(taskId, (task) => {
            const checklistItems = Array.isArray(task.checklistItems) ? task.checklistItems : [];
            const nextItems = checklistItems.map((item) => item.id === itemId ? { ...item, isDone: !item.isDone } : item);
            const progress = nextItems.length > 0 ? Math.round((nextItems.filter((item) => item.isDone).length / nextItems.length) * 100) : 0;
            return { ...task, checklistItems: nextItems, progress };
        });

        router.put(`/tasks/${taskId}/checklist/${itemId}/toggle`, {}, {
            preserveScroll: true,
            preserveState: true,
            onError: () => { if (previous) replaceTask(taskId, () => previous); toast.error('Checklist update failed.'); },
        });
    }, [localTasks, replaceTask]);

    const addChecklistItem = useCallback((taskId: number, label: string) => {
        router.post(`/tasks/${taskId}/checklist`, { label }, { preserveScroll: true, onSuccess: () => toast.success('Checklist item added.'), onError: () => toast.error('Checklist item could not be added.') });
    }, []);

    const addComment = useCallback((taskId: number, body: string) => {
        router.post(`/tasks/${taskId}/comments`, { body, is_note: false }, { preserveScroll: true, onSuccess: () => toast.success('Comment added.'), onError: () => toast.error('Comment could not be added.') });
    }, []);

    const uploadAttachment = useCallback((taskId: number, file: File) => {
        router.post(`/tasks/${taskId}/attachments`, { file }, { forceFormData: true, preserveScroll: true, onSuccess: () => toast.success('Attachment uploaded.'), onError: () => toast.error('Attachment upload failed.') });
    }, []);

    const teamAvatars = useMemo(() => {
        const ids = new Set<number>();
        const avatars: { id: number; name: string }[] = [];
        for (const t of localTasks) {
            if (Array.isArray(t.assignees)) {
                for (const a of t.assignees) {
                    if (!ids.has(a.id)) { ids.add(a.id); avatars.push(a); if (avatars.length >= 6) break; }
                }
            }
            if (avatars.length >= 6) break;
        }
        return avatars;
    }, [localTasks]);

    const TABS: { id: ViewMode; label: string; icon: typeof LayoutDashboard }[] = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'board', label: 'Board', icon: Columns3 },
        { id: 'list', label: 'List', icon: List },
        { id: 'table', label: 'Table', icon: Table2 },
        { id: 'timeline', label: 'Timeline', icon: Timeline },
        { id: 'calendar', label: 'Calendar', icon: CalendarDays },
    ];

    return (
        <>
            <Head title="Tasks" />
            <AppShell eyebrowKey="nav.tasks" titleKey="nav.tasks" subtitleKey="Track and organize all office operations in one place."
                action={
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="hidden sm:flex -space-x-1.5 mr-1">
                            {teamAvatars.map((a) => (
                                <span key={a.id} className="flex size-7 items-center justify-center rounded-full border-2 border-[var(--crm-surface)] bg-[var(--crm-gold)] text-[9px] font-bold text-black" title={a.name}>
                                    {a.name.charAt(0)}
                                </span>
                            ))}
                        </div>
                        <AppButton variant="secondary" onPress={() => router.visit('/task-requests')}>Requests</AppButton>
                        <AppButton variant="secondary" onPress={() => setRequestOpen(true)}><Plus size={15} /> Request</AppButton>
                        <AppButton variant="secondary" onPress={() => router.visit('/workload')}>Workload</AppButton>
                        <AppButton variant="primary" onPress={() => { setFormErrors({}); setCreateOpen(true); }}><Plus size={15} /> Create</AppButton>
                    </div>
                }
            >
                <div className="crm-page">
                    {/* Tab bar */}
                    <div className="mb-4 flex gap-1 border-b border-[var(--crm-border)]">
                        {TABS.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button key={tab.id} type="button" onClick={() => setViewMode(tab.id)}
                                    className={`flex items-center gap-1.5 border-b-2 px-3 pb-2 pt-1 text-xs font-semibold transition ${viewMode === tab.id ? 'border-[var(--crm-gold)] text-[var(--crm-gold)]' : 'border-transparent text-[var(--crm-text-muted)] hover:text-[var(--crm-text)]'}`}>
                                    <Icon size={14} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>

                    <TaskFilters
                        filter={filter}
                        category={category}
                        priorityFilter={priorityFilter}
                        query={query}
                        viewMode={viewMode}
                        onFilterChange={(f) => { setFilter(f); router.visit(`/tasks?filter=${f}&category=${category}`, { preserveState: true }); }}
                        onCategoryChange={(c) => { setCategory(c); router.visit(`/tasks?filter=${filter}&category=${c}`, { preserveState: true }); }}
                        onPriorityFilterChange={setPriorityFilter}
                        onQueryChange={setQuery}
                        onViewModeChange={setViewMode}
                    />

                    <div className="mt-4">
                        {viewMode === 'overview' ? (
                            <TaskOverview tasks={filtered} onTaskClick={setSelectedTask} userId={undefined} />
                        ) : viewMode === 'board' ? (
                            <TaskBoard columns={columns} onTaskClick={setSelectedTask} onCreateInStatus={handleCreateInStatus} />
                        ) : viewMode === 'list' ? (
                            <TaskListView columns={columns} onTaskClick={setSelectedTask} onStatusChange={updateStatus} />
                        ) : viewMode === 'table' ? (
                            <TaskTable tasks={filtered} onTaskClick={setSelectedTask} onStatusChange={updateStatus} />
                        ) : viewMode === 'timeline' ? (
                            <TaskTimeline tasks={filtered} onTaskClick={setSelectedTask} />
                        ) : (
                            <TaskCalendar tasks={filtered} onTaskClick={setSelectedTask} />
                        )}
                    </div>

                    <TaskCreateDrawer
                        isOpen={createOpen}
                        users={users}
                        form={form}
                        formErrors={formErrors}
                        onOpenChange={(o) => { setCreateOpen(o); if (!o) setFormErrors({}); }}
                        onFormChange={setForm}
                        onSubmit={handleCreate}
                    />

                    <TaskDetailDrawer
                        task={selectedTask}
                        onClose={() => setSelectedTask(null)}
                        onComplete={(t) => updateStatus(t, 'completed')}
                        onChecklistToggle={toggleChecklistItem}
                        onChecklistAdd={addChecklistItem}
                        onCommentAdd={addComment}
                        onAttachmentUpload={uploadAttachment}
                    />

                    <TaskRequestCreateDrawer
                        isOpen={requestOpen}
                        requestTypes={taskRequestTypes}
                        requestTypeLabels={taskRequestTypeLabels}
                        options={taskRequestOptions}
                        onOpenChange={setRequestOpen}
                    />
                </div>
            </AppShell>
        </>
    );
}

```

## FILE: routes/web.php

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
    Route::get('/inbox/{conversation}', [\App\Http\Controllers\ConversationController::class, 'show'])->name('inbox.show');
    Route::post('/inbox/{conversation}/messages', [\App\Http\Controllers\MessageController::class, 'store'])->name('inbox.messages.store');
    Route::put('/inbox/{conversation}/messages/{message}', [\App\Http\Controllers\MessageController::class, 'update'])->name('inbox.messages.update');
    Route::delete('/inbox/{conversation}/messages/{message}', [\App\Http\Controllers\MessageController::class, 'destroy'])->name('inbox.messages.destroy');

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

```

## FILE: routes\web.php

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
    Route::get('/inbox/{conversation}', [\App\Http\Controllers\ConversationController::class, 'show'])->name('inbox.show');
    Route::post('/inbox/{conversation}/messages', [\App\Http\Controllers\MessageController::class, 'store'])->name('inbox.messages.store');
    Route::put('/inbox/{conversation}/messages/{message}', [\App\Http\Controllers\MessageController::class, 'update'])->name('inbox.messages.update');
    Route::delete('/inbox/{conversation}/messages/{message}', [\App\Http\Controllers\MessageController::class, 'destroy'])->name('inbox.messages.destroy');

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

```

# Screenshot UI Description For AI

The user wants a modern messaging workspace inspired by clean SaaS chat apps.

Reference visual:
- Left side has conversation list with search, online users, tabs like All/Team/Personal.
- Each conversation row has avatar, name, last message preview, time, unread badge, read check marks.
- Main chat area has a conversation header with avatar/group image, name, member/online count, call/video/menu icons.
- Messages are grouped by sender and time.
- Incoming messages are light/neutral bubbles, outgoing messages use strong brand color.
- Date separator appears in the middle.
- Composer is fixed at bottom with text input, emoji/image buttons, send button.
- The UI is clean, compact, modern, and easy to scan.

ARCHI LBO adaptation:
- Keep dark/gold CRM identity.
- Do not use purple/light style exactly.
- Use dark panels, gold primary accents, subtle borders.
- Support text and images only.
- No audio, no files/documents.
- Multiple uploaded images must group like WhatsApp in one message/gallery.
- Image preview modal/lightbox required.
