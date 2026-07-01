# Tasks / Operations Center — Implementation Report

> Report generated for AI review and improvement planning.
> Covers: Tasks, Operations Center, Chat/Inbox, Notifications, Calendar.

---

## 1. Summary

A full Tasks + Chat + Notifications + Operations Center module has been implemented.

**Routes/pages available:**

| URL | Page | Purpose |
|---|---|---|
| `/tasks` | Tasks/Index | Kanban board, list view, calendar view, CRUD |
| `/task-requests` | TaskRequests/Index | Intake management (accept/reject/convert) |
| `/workload` | Workload/Index | Team workload summary table |
| `/operations/reports` | Operations/Reports | KPI cards by module/priority |
| `/inbox` | Inbox/Index | Chat conversations (REST polling) |
| `/notifications` | Notifications/Index | Database notification inbox |
| `/calendar` | Calendar/Index | FullCalendar month/week/day |

**Core flows that work:**
- Create/update/delete tasks with assignees, watchers, status, priority, category
- Kanban board: drag status via button clicks (no drag-and-drop)
- Checklist: add, toggle, track progress percentage
- Comments: add to any task
- Attachments: upload per task
- Task suggestions: view, create-task-from-suggestion, dismiss
- Task requests: submit intake, accept/reject, convert to task
- Inbox/chat: conversation list, message thread (polling), new conversation
- Notifications: grouped by time, mark read, mark-all-read
- Workload: per-user open/urgent/blocked/overdue counts
- Reports: aggregate metrics
- Calendar: month/week/day views with CRUD, drag/drop, resize
- Dashboard: urgent tasks panel + recent messages panel in right sidebar
- Seed data: 10 demo tasks, 3 notifications, 15 calendar events

---

## 2. Files Changed / Created

### Migrations/Models

| File | Type |
|---|---|
| `database/migrations/2026_06_30_110000_create_tasks_tables.php` | Migration — 9 task/operations tables in one file |
| `database/migrations/2026_06_30_110001_create_conversations_tables.php` | Migration — 4 chat tables |
| `database/migrations/2026_06_30_110002_create_notifications_table.php` | Migration — Laravel notifications table |
| `database/migrations/2026_06_30_120000_extend_operations_center_foundation.php` | Migration — tasks extras |
| `database/migrations/2026_07_01_110000_create_calendar_tables.php` | Migration — 5 calendar tables |
| `app/Models/Task.php` | Model |
| `app/Models/TaskSuggestion.php` | Model |
| `app/Models/TaskRequest.php` | Model |
| `app/Models/TaskComment.php` | Model |
| `app/Models/TaskChecklistItem.php` | Model |
| `app/Models/TaskAttachment.php` | Model |
| `app/Models/TaskActivityLog.php` | Model |
| `app/Models/Conversation.php` | Model |
| `app/Models/ConversationParticipant.php` | Model |
| `app/Models/Message.php` | Model |
| `app/Models/MessageRead.php` | Model |
| `app/Models/MessageAttachment.php` | Model |
| `app/Models/CalendarEvent.php` | Model |
| `app/Models/CalendarEventParticipant.php` | Model |
| `app/Models/CalendarEventReminder.php` | Model |
| `app/Models/CalendarEventActivityLog.php` | Model |
| `app/Models/CalendarEventRecurrence.php` | Model |

### Controllers/Services/Resources/Policies

| File | Type |
|---|---|
| `app/Http/Controllers/TaskController.php` | Controller — CRUD + status |
| `app/Http/Controllers/TaskCommentController.php` | Controller |
| `app/Http/Controllers/TaskChecklistController.php` | Controller |
| `app/Http/Controllers/TaskAttachmentController.php` | Controller |
| `app/Http/Controllers/TaskSuggestionController.php` | Controller |
| `app/Http/Controllers/TaskRequestController.php` | Controller |
| `app/Http/Controllers/ConversationController.php` | Controller |
| `app/Http/Controllers/MessageController.php` | Controller |
| `app/Http/Controllers/NotificationController.php` | Controller |
| `app/Http/Controllers/WorkloadController.php` | Controller |
| `app/Http/Controllers/OperationsReportController.php` | Controller |
| `app/Services/Task/TaskMutationService.php` | Service |
| `app/Services/Task/TaskQueryService.php` | Service |
| `app/Services/Task/TaskNumberService.php` | Service |
| `app/Services/Task/TaskActivityService.php` | Service |
| `app/Services/Task/TaskNotificationService.php` | Service |
| `app/Services/Task/TaskPermissionService.php` | Service |
| `app/Services/Task/TaskSuggestionService.php` | Service |
| `app/Services/Task/TaskRequestService.php` | Service |
| `app/Services/Task/WorkloadService.php` | Service |
| `app/Services/Task/OperationsReportService.php` | Service |
| `app/Services/Chat/ChatService.php` | Service |
| `app/Services/Dashboard/DashboardCommandCenterService.php` | Service |
| `app/Http/Resources/TaskResource.php` | Resource |
| `app/Http/Resources/TaskSuggestionResource.php` | Resource |
| `app/Http/Resources/TaskRequestResource.php` | Resource |
| `app/Http/Resources/TaskCommentResource.php` | Resource |
| `app/Http/Resources/TaskChecklistItemResource.php` | Resource |
| `app/Http/Resources/TaskActivityResource.php` | Resource |
| `app/Http/Resources/ConversationResource.php` | Resource |
| `app/Http/Resources/ConversationParticipantResource.php` | Resource |
| `app/Http/Resources/MessageResource.php` | Resource |
| `app/Http/Resources/NotificationResource.php` | Resource |
| `app/Policies/TaskPolicy.php` | Policy |
| `app/Policies/TaskRequestPolicy.php` | Policy |
| `app/Notifications/TaskNotification.php` | Notification class |
| `app/Notifications/ChatMessageNotification.php` | Notification class |
| `app/Notifications/SuggestionNotification.php` | Notification class |

### Requests/Validation

| File | Type |
|---|---|
| `app/Http/Requests/Task/StoreTaskRequest.php` | Form request |
| `app/Http/Requests/Task/UpdateTaskRequest.php` | Form request |
| `app/Http/Requests/Task/StoreTaskRequestRequest.php` | Form request |
| `app/Http/Requests/Task/UpdateTaskRequestRequest.php` | Form request |
| `app/Http/Requests/Chat/StoreConversationRequest.php` | Form request |
| `app/Http/Requests/Chat/StoreMessageRequest.php` | Form request |

### Frontend Pages

| File |
|---|
| `resources/js/pages/Tasks/Index.tsx` |
| `resources/js/pages/TaskRequests/Index.tsx` |
| `resources/js/pages/Workload/Index.tsx` |
| `resources/js/pages/Operations/Reports.tsx` |
| `resources/js/pages/Inbox/Index.tsx` |
| `resources/js/pages/Notifications/Index.tsx` |
| `resources/js/pages/Calendar/Index.tsx` |
| `resources/js/pages/Dashboard.tsx` (widget section) |

### Frontend Components

| Directory |
|---|
| `resources/js/features/tasks/components/TaskBoard.tsx` |
| `resources/js/features/tasks/components/TaskCalendar.tsx` |
| `resources/js/features/tasks/components/TaskCard.tsx` |
| `resources/js/features/tasks/components/TaskCreateDrawer.tsx` |
| `resources/js/features/tasks/components/TaskDetailDrawer.tsx` |
| `resources/js/features/tasks/components/TaskFilters.tsx` |
| `resources/js/features/tasks/components/TaskList.tsx` |
| `resources/js/features/tasks/components/TaskRequestCreateDrawer.tsx` |
| `resources/js/features/inbox/components/ConversationList.tsx` |
| `resources/js/features/inbox/components/MessageThread.tsx` |
| `resources/js/features/inbox/components/NewConversationDrawer.tsx` |
| `resources/js/features/calendar/components/*` (8 components) |

### Types/Config/Navigation

| File |
|---|
| `resources/js/features/tasks/types.ts` |
| `resources/js/features/calendar/types.ts` |
| `resources/js/features/chat/types.ts` |
| `resources/js/features/notifications/types.ts` |
| `resources/js/lib/appRoutes.ts` |
| `resources/js/locales/en.ts` (calendar locale) |

### CSS/Theme

| File |
|---|
| `resources/css/calendar.css` |
| `resources/css/app.css` (imports calendar.css) |

### QA/Tests/Commands

| File | Signature |
|---|---|
| `app/Console/Commands/TaskOverdueNotificationsCommand.php` | `app:task-overdue-notify` |
| `app/Console/Commands/TaskChatQaCommand.php` | `app:qa-tasks-chat` |
| `app/Console/Commands/CalendarProcessRemindersCommand.php` | `calendar:process-reminders` |
| `database/seeders/TaskDemoSeeder.php` | 10 tasks + chat data |
| `database/seeders/NotificationsDemoSeeder.php` | 3 notifications |
| `database/seeders/CalendarDemoSeeder.php` | 15 calendar events |

---

## 3. Routes

All registered in `routes/web.php` under `auth` middleware:

| Method | URI | Controller | Name |
|---|---|---|---|
| GET | `/tasks` | TaskController@index | `tasks.index` |
| POST | `/tasks` | TaskController@store | `tasks.store` |
| GET | `/tasks/{task}` | TaskController@show | `tasks.show` |
| PUT | `/tasks/{task}` | TaskController@update | `tasks.update` |
| DELETE | `/tasks/{task}` | TaskController@destroy | `tasks.destroy` |
| PUT | `/tasks/{task}/status` | TaskController@updateStatus | `tasks.status` |
| GET | `/tasks/{task}/comments` | TaskCommentController@index | `tasks.comments.index` |
| POST | `/tasks/{task}/comments` | TaskCommentController@store | `tasks.comments.store` |
| DELETE | `/tasks/{task}/comments/{comment}` | TaskCommentController@destroy | `tasks.comments.destroy` |
| GET | `/tasks/{task}/checklist` | TaskChecklistController@index | `tasks.checklist.index` |
| POST | `/tasks/{task}/checklist` | TaskChecklistController@store | `tasks.checklist.store` |
| PUT | `/tasks/{task}/checklist/{item}/toggle` | TaskChecklistController@toggle | `tasks.checklist.toggle` |
| DELETE | `/tasks/{task}/checklist/{item}` | TaskChecklistController@destroy | `tasks.checklist.destroy` |
| POST | `/tasks/{task}/attachments` | TaskAttachmentController@store | `tasks.attachments.store` |
| DELETE | `/tasks/{task}/attachments/{attachment}` | TaskAttachmentController@destroy | `tasks.attachments.destroy` |
| GET | `/tasks/suggestions` | TaskSuggestionController@index | `tasks.suggestions.index` |
| POST | `/tasks/suggestions/{suggestion}/create-task` | TaskSuggestionController@createFromSuggestion | `tasks.suggestions.create-task` |
| POST | `/tasks/suggestions/{suggestion}/dismiss` | TaskSuggestionController@dismiss | `tasks.suggestions.dismiss` |
| GET | `/task-requests` | TaskRequestController@index | `task-requests.index` |
| POST | `/task-requests` | TaskRequestController@store | `task-requests.store` |
| PUT | `/task-requests/{taskRequest}` | TaskRequestController@update | `task-requests.update` |
| POST | `/task-requests/{taskRequest}/accept` | TaskRequestController@accept | `task-requests.accept` |
| POST | `/task-requests/{taskRequest}/reject` | TaskRequestController@reject | `task-requests.reject` |
| POST | `/task-requests/{taskRequest}/convert` | TaskRequestController@convert | `task-requests.convert` |
| GET | `/inbox` | ConversationController@index | `inbox.index` |
| POST | `/inbox` | ConversationController@store | `inbox.store` |
| GET | `/inbox/{conversation}` | ConversationController@show | `inbox.show` |
| POST | `/inbox/{conversation}/messages` | MessageController@store | `inbox.messages.store` |
| PUT | `/inbox/{conversation}/messages/{message}` | MessageController@update | `inbox.messages.update` |
| DELETE | `/inbox/{conversation}/messages/{message}` | MessageController@destroy | `inbox.messages.destroy` |
| GET | `/notifications` | NotificationController@index | `notifications.index` |
| POST | `/notifications/{id}/read` | NotificationController@markAsRead | `notifications.read` |
| POST | `/notifications/read-all` | NotificationController@markAllAsRead | `notifications.read-all` |
| GET | `/workload` | WorkloadController@index | `workload.index` |
| GET | `/operations/reports` | OperationsReportController@index | `operations.reports.index` |
| GET | `/calendar` | CalendarController@index | `calendar.index` |
| POST | `/calendar/events` | CalendarEventController@store | `calendar.events.store` |
| GET | `/calendar/events/{event}` | CalendarEventController@show | `calendar.events.show` |
| PUT | `/calendar/events/{event}` | CalendarEventController@update | `calendar.events.update` |
| DELETE | `/calendar/events/{event}` | CalendarEventController@destroy | `calendar.events.destroy` |
| PUT | `/calendar/events/{event}/move` | CalendarEventController@move | `calendar.events.move` |
| PUT | `/calendar/events/{event}/resize` | CalendarEventController@resize | `calendar.events.resize` |
| GET | `/calendar/events/{event}/conflicts` | CalendarEventController@conflicts | `calendar.events.conflicts` |
| POST | `/calendar/events/{event}/participants` | CalendarParticipantController@store | `calendar.events.participants.store` |
| DELETE | `/calendar/events/{event}/participants/{user}` | CalendarParticipantController@destroy | `calendar.events.participants.destroy` |
| POST | `/calendar/events/{event}/reminders` | CalendarReminderController@store | `calendar.events.reminders.store` |
| PUT | `/calendar/reminders/{reminder}/snooze` | CalendarReminderController@snooze | `calendar.reminders.snooze` |
| PUT | `/calendar/reminders/{reminder}/dismiss` | CalendarReminderController@dismiss | `calendar.reminders.dismiss` |

---

## 4. Database Structure

### `tasks`
| Column | Type | Notes |
|---|---|---|
| id | bigint AI PK | |
| task_number | varchar(20) UNIQUE | TASK-YEAR-NNNN |
| title | varchar(255) | |
| description | text | nullable |
| type | varchar(40) | general/missing_document/client_follow_up/etc |
| status | varchar(20) | backlog...cancelled |
| priority | varchar(10) | low/medium/high/urgent |
| impact | varchar(10) | low/normal/high/critical |
| progress | tinyint | 0-100 |
| category | varchar(40) | documents/contract/finance/etc |
| start_date | date | nullable |
| due_date | date | nullable |
| completed_at | datetime | nullable |
| reviewed_at | datetime | nullable |
| blocked_reason | text | nullable |
| estimated_minutes | int | nullable |
| actual_minutes | int | nullable |
| recurrence_rule | varchar(100) | nullable (unused) |
| created_by | bigint FK→users.id | |
| assigned_by | bigint FK→users.id | nullable |
| dossier_id | bigint FK→dossiers.id | nullable |
| client_id | bigint FK→clients.id | nullable |
| dossier_document_id | bigint FK→dossier_documents.id | nullable |
| finance_document_id | bigint FK→finance_documents.id | nullable |
| contract_id | bigint FK→contracts.id | nullable |
| authorization_id | bigint FK→authorizations.id | nullable |
| archive_record_id | bigint FK→archive_records.id | nullable |
| conversation_id | bigint FK→conversations.id | nullable |
| timestamps + soft_deletes | | |

**Relations:** BelongsTo `User` (creator), `client`, `dossier`, `dossierDocument`, `financeDocument`, `contract`, `authorization`, `archiveRecord`, `conversation`. BelongsToMany `assignees`, `watchers` (via pivot `task_user` with `role` column). HasMany `checklistItems`, `comments`, `attachments`, `activityLogs`.

**Indexes:** `task_number` (unique), `status`, `priority`, `type`, `due_date`, `created_by`, `dossier_id`, `client_id`.

**Pivot `task_user`:** `user_id`, `task_id`, `role` (assignee/watcher).

### `task_checklist_items`
| Column | Type |
|---|---|
| id | bigint PK |
| task_id | bigint FK→tasks.id (CASCADE) |
| label | varchar(255) |
| is_done | tinyint(1) default 0 |
| position | int default 0 |
| timestamps | |

### `task_comments`
| Column | Type |
|---|---|
| id | bigint PK |
| task_id | bigint FK→tasks.id (CASCADE) |
| user_id | bigint FK→users.id |
| body | text |
| is_note | tinyint(1) default 0 |
| timestamps | |

### `task_attachments`
| Column | Type |
|---|---|
| id | bigint PK |
| task_id | bigint FK→tasks.id (CASCADE) |
| user_id | bigint FK→users.id |
| filename | varchar(255) |
| original_name | varchar(255) |
| mime_type | varchar(100) |
| size | int |
| disk | varchar(20) |
| timestamps | |

### `task_activity_logs`
| Column | Type |
|---|---|
| id | bigint PK |
| task_id | bigint FK→tasks.id (CASCADE) |
| user_id | bigint FK→users.id | nullable |
| event | varchar(50) |
| old_value | json | nullable |
| new_value | json | nullable |
| metadata | json | nullable |
| created_at | timestamp | |

### `task_suggestions`
| Column | Type |
|---|---|
| id | bigint PK |
| type | varchar(40) |
| title | varchar(255) |
| description | text | nullable |
| source | varchar(40) | nullable |
| context | json | nullable |
| score | int | nullable |
| dismissed_at | datetime | nullable |
| created_at | timestamp | |

### `task_requests`
| Column | Type |
|---|---|
| id | bigint PK |
| request_number | varchar(20) UNIQUE | REQ-YEAR-NNNN |
| type | varchar(40) |
| title | varchar(255) |
| description | text | nullable |
| status | varchar(20) | pending/accepted/rejected/converted |
| requested_by | bigint FK→users.id |
| assigned_to | bigint FK→users.id | nullable |
| priority | varchar(10) | nullable |
| dossier_id | bigint FK→dossiers.id | nullable |
| client_id | bigint FK→clients.id | nullable |
| resolved_at | datetime | nullable |
| resolved_notes | text | nullable |
| timestamps | | |

### `conversations`
| Column | Type |
|---|---|
| id | bigint PK |
| type | varchar(20) | direct/group |
| title | varchar(255) | nullable |
| last_message_at | datetime | nullable |
| timestamps | |

**Relations:** HasMany `participants`, `messages`.

### `conversation_participants`
| Column | Type |
|---|---|
| id | bigint PK |
| conversation_id | bigint FK→conversations.id (CASCADE) |
| user_id | bigint FK→users.id |
| last_read_at | datetime | nullable |

### `messages`
| Column | Type |
|---|---|
| id | bigint PK |
| conversation_id | bigint FK→conversations.id (CASCADE) |
| user_id | bigint FK→users.id |
| body | text |
| timestamps | |

### `message_reads`
| Column | Type |
|---|---|
| id | bigint PK |
| message_id | bigint FK→messages.id (CASCADE) |
| user_id | bigint FK→users.id |

### `notifications`
(Laravel's `notifications` table — polymorphic)

---

## 5. Backend Behavior

**Task list/query/filtering** — `TaskQueryService::filtered()` accepts `filter` and `category` params. Filter values: `all`, `my`, `assigned_by_me`, `overdue`, `due_today`, `due_this_week`, `completed`. Loads `assignees`, `watchers`, `checklistItems`, `creator`, `dossier`, `client`. Policy `viewAny` scopes to own tasks.

**Task create/update/delete** — `TaskMutationService::create()` and `update()` validate via form requests. Creates via `Task::create()`. Syncs assignees and watchers on pivot. Generates task number via `TaskNumberService` (`TASK-YEAR-NNNN`). `TaskMutationService::delete()` uses soft deletes.

**Status updates** — `TaskController::updateStatus()` calls `TaskMutationService::updateStatus()` which updates status, progress, timestamps (completed_at). Calls `TaskActivityService::logStatusChange()`.

**Assignees/watchers** — `TaskMutationService::syncAssignees()` / `syncWatchers()` on the pivot `task_user` with `role` column. Multiple assignees and watchers supported.

**Checklist** — `TaskChecklistController` CRUD. `toggle()` flips `is_done`. Progress computed as `round(done/total * 100)`.

**Comments** — `TaskCommentController::store()` creates comment. `is_note` flag for internal notes (default false). `@mention` parsing calls `TaskNotificationService::notifyMentioned()` if body contains @username.

**Attachments** — `TaskAttachmentController::store()` receives `file` via `forceFormData: true` (Inertia file upload). Stores on the default disk, saves metadata.

**Activity logs** — `TaskActivityService` logs all status changes, field updates, comments, attachments. Logs stored in `task_activity_logs` with JSON diff.

**Task suggestions** — `TaskSuggestionService` generates suggestions based on recurring patterns. Controller: `index()` returns suggestions for current user, `createFromSuggestion()` converts to task, `dismiss()` sets `dismissed_at`.

**Task requests** — `TaskRequestService` manages intake requests. Controller: `accept()` sets status, `reject()` adds notes, `convert()` creates a linked task. `request_number` generated via number service (`REQ-YEAR-NNNN`).

**Workload** — `WorkloadService::load()` aggregates per-user counts by status and priority. Returns User + open/urgent/blocked/overdue counts.

**Reports** — `OperationsReportService` computes aggregate metrics: total, open, completed, blocked, overdue. Breakdown by category and priority.

**Notifications** — `TaskNotificationService` has `notifyAssigned`, `notifyReassigned`, `notifyStatusChanged`, `notifyOverdue`, `notifyDueTomorrow`, `notifyMentioned`. All create Laravel database notifications. `TaskOverdueNotificationsCommand` runs daily at 08:00 to send overdue/due-tomorrow notifications.

**Chat** — `ChatService` manages conversations and messages. `ConversationController::show()` eager-loads participants and messages. Messages sent via `fetch()` with CSRF token (no websockets).

**Permissions/policies** — `TaskPolicy`: `viewAny` (own tasks), `view` (assignee/watcher/creator/admin), `create` (any authenticated), `update`/`delete` (creator/assignee/admin). `TaskRequestPolicy`: `viewAny` (own), `update`/`accept`/`reject`/`convert` (creator/admin). Calendar policies: `CalendarEventPolicy` + `CalendarEventReminderPolicy`.

**Dashboard** — `DashboardCommandCenterService` provides `$urgentTaskList` and `$recentMessageList` for right sidebar widgets.

---

## 6. Frontend Behavior

**/tasks layout** — Full-width page with AppShell header. Operations metrics row (Open/Urgent/Blocked/Overdue/Review — 5 cards). Filters bar. View mode switcher (Board/List/Calendar).

**Board view** — `TaskBoard` renders 7 columns (not_started, in_progress, waiting_client, waiting_admin, blocked, in_review, completed). Each column scrolls independently with count badge. Status change via clickable dropdown. No drag-and-drop reorder within or between columns.

**List view** — `TaskList` renders a table with all tasks, grouped by status. Shows task number, title, assignee(s), priority, due date, progress bar. Inline status change buttons.

**Calendar view** — `TaskCalendar` renders tasks grouped by: Overdue (red), Today (gold), This week, Upcoming, No date. Simple list-per-group layout, not a FullCalendar grid.

**Filters/search** — `TaskFilters` component: text search, dropdown filter (All/My/Assigned by me/Overdue/Due today/Due this week/Completed), category context tabs, view mode switcher. Filter/category changes trigger Inertia visit with query params.

**Create drawer** — `TaskCreateDrawer`: text fields for title, description; selects for status, priority, category, due_date; multi-select for assignees and watchers. Submit via Inertia POST.

**Detail drawer** — `TaskDetailDrawer`: shows full task info, tabs or sections for checklist, comments, attachments, activity log. Optimistic toggle for checklist items. Inertia POST for comments/attachments. Complete button triggers status update.

**Task requests page** — `TaskRequests/Index`: table of intake requests with status, type, title, requester, priority, date. Actions: Accept, Convert to task, Reject (with reason modal).

**Workload page** — `Workload/Index`: table with columns User, Open, Urgent, Blocked, Overdue. Simple read-only summary.

**Reports page** — `Operations/Reports`: KPI cards (Total tasks, Open, Completed, Blocked, Overdue). Breakdown tables by module (category) and priority. Read-only.

**Inbox page** — Split-panel: left conversation list (avatars, names, last message preview, unread count, time), right message thread (header with user info, scrollable messages, send input). New conversation drawer with user multi-select + initial message. Messages sent via raw `fetch()` with `window.csrfToken` global.

**Notifications page** — Grouped by Today/This week/Earlier. All/Unread filters. Per-type icons (Task/Chat/Calendar). Mark-as-read button per notification. Mark-all-as-read button.

**Calendar page** — 3-column layout with left sidebar (new event, search, mini calendar, type/user filters), center FullCalendar (month/week/day), right panel (today focus, reminders, overdue, quick actions). Create/edit drawer. Drag/drop move + resize with toast+revert.

**Responsive/mobile** — Tasks page uses responsive grid for metrics (5-col → 2-col → 1-col). Board columns overflow scroll. Calendar tiles responsive. Inbox stack at mobile. Calendar 3-col → 2-col → 1-col.

**Missing UI:**
- TaskCard has no drag handle — status changes only via dropdown
- No "internal note" toggle in comment form (backend supports `is_note`)
- Attachment list in detail drawer may show placeholder text
- Task request drawer form is basic
- Suggestions panel exists on backend but may not have visible UI on the tasks page
- No bulk select/actions
- No saved filters/views

---

## 7. UI Quality Checklist

| Item | Yes/No | Notes |
|---|---|---|
| Dark/gold CRM style applied | Yes | Consistent with CRM theme |
| Useful dense operations layout | Yes | Metrics row, 7-column board, filters bar |
| Board columns are readable | Yes | Scrollable with count badges |
| Task cards are informative | Yes | Title, number, priority, category, assignee avatars, due date, progress bar |
| List view is useful for admin | Yes | Table with inline status change |
| Calendar/task schedule view is useful | Partial | Simple grouped list, not a grid calendar |
| Drawer is easy to use | Yes | Create and detail drawers both functional |
| Filters are practical | Yes | Combined filter + category + search |
| Empty states are useful | Partial | Calendar and boards may show blank columns instead of "No tasks" messages |
| No fake data | Yes | Seed data is realistic but clearly demo |
| All visible buttons work | Partial | Board drop zone/drag not wired; some buttons may navigate to placeholder pages |
| Mobile layout is acceptable | Yes | Responsive grid, columns scroll |

---

## 8. Advanced Features Status

| Feature | Status | Notes |
|---|---|---|
| Multiple assignees | Implemented | Via pivot |
| Watchers | Implemented | Via pivot with `role` column |
| Priority | Implemented | low/medium/high/urgent |
| Impact | Implemented | low/normal/high/critical |
| Progress | Implemented | Auto from checklist percentage |
| Due dates | Implemented | date column |
| Overdue detection | Implemented | Client-side in Index.tsx, backend in command |
| Status workflow | Implemented | 9 statuses with transitions |
| Checklist | Implemented | Add, toggle, delete, auto-progress |
| Comments | Implemented | Add, delete, @mentions |
| Internal notes | Partial | Backend `is_note` flag exists, but frontend has no toggle |
| Attachments | Implemented | Upload via Inertia forceFormData |
| Activity timeline | Implemented | Backend logging, frontend display in detail drawer |
| Task suggestions | Implemented | Backend service + suggestions page |
| Request intake | Implemented | Full accept/reject/convert flow |
| User workload | Implemented | Per-user counts page |
| Reports | Implemented | Aggregate KPIs + breakdowns |
| Notifications | Implemented | Database notifications, grouping, mark-read |
| Chat/inbox link | Implemented | Conversation linked to task via `conversation_id` |
| Link to client/dossier/document/finance/contract/auth/archive | Implemented | All nullable FK columns on tasks table |
| Recurring tasks | Partial | `recurrence_rule` column exists, no UI or service logic |
| Dependencies/blockers | Partial | `blocked` status + `blocked_reason` field, no dependency graph |
| Automation rules | Missing | No automation engine |
| Bulk actions | Missing | No select-all, batch status update |
| Saved filters/views | Missing | No filter presets |
| Drag/drop Kanban | Missing | Status changes via button click, not drag |

---

## 9. Commands Run

| Command | Result |
|---|---|
| `npm run build` | 3690 modules, ~876-929ms, **success** |
| `php artisan optimize:clear` | All 6 caches cleared, **success** |
| `php artisan migrate:fresh --seed` | 25 migrations, 5 seeders, **success** |
| `php artisan db:seed --class=CalendarDemoSeeder` | **success** |
| `php artisan tinker ... echo count()` | Data verification **success** |

No QA commands were run (`app:qa-tasks-chat` exists but was not executed). No test suite was run.

---

## 10. Known Issues / Gaps

1. **No drag-and-drop on Kanban board** — Status changes via button click only. User expected to drag cards between columns.
2. **No post-mutation data refresh on Calendar** — After create/edit/move/resize, FullCalendar shows stale data until page reload.
3. **`CalendarTaskSyncService::createTaskFromEvent()` never wired** — Task creation from calendar events of type `task` is broken (method exists but never called).
4. **Internal notes toggle missing in UI** — Backend supports `is_note` flag on comments, but frontend has no note/comment switch.
5. **Suggestions panel may not have visible UI on tasks page** — Backend service exists, frontend component may be unstyled or unlinked.
6. **Task card has no drag handle** — No `draggable`, no `onDragStart`/`onDrop`. Board columns are static.
7. **List view column headers not clickable for sort** — No column sorting implementation.
8. **Calendar task view is a grouped list, not a calendar grid** — Separate from FullCalendar, uses simple date-grouped layout.
9. **No recurring task expansion** — `recurrence_rule` column exists on tasks but no expansion logic.
10. **No dependency/blocker graph** — Tasks can be blocked with reason, but no "depends_on" relationship.
11. **No bulk operations** — No batch status update, assign, or delete.
12. **No saved/search filters** — Filter state is URL-based but not persistable as named views.
13. **Chat uses raw `fetch()` with `window.csrfToken`** — Works but fragile if global is missing.
14. **Resource serialization inconsistencies** — `CalendarEventResource` and other resources return `{ data: [...] }` for relation collections instead of plain arrays. Patched for calendar events (`->resolve()`) but other relations may still have the problem.
15. **No attachment preview** — Attachments are uploaded but no preview/thumbnail in task detail drawer.
16. **No mobile menu for tasks** — The board columns don't collapse into a list well on small screens.
17. **No test coverage** — No PHPUnit tests for task controllers, services, or policies.
18. **No pagination** — Task list assumes manageable data volume; no pagination or infinite scroll.
19. **No rate limiting on chat sends** — No throttling on message creation.
20. **No websocket/SSE for chat** — Uses REST polling (intentional for v1, but not real-time).
21. **No export/print for reports** — Reports page is read-only, no PDF/CSV export.

---

## 11. Recommended Next Improvements

**P0 — Must fix**
1. Wire `CalendarTaskSyncService::createTaskFromEvent()` — call from `CalendarEventController::store()` when type is `task`.
2. Board drag-and-drop — implement between-column drag using FullCalendar's interaction plugin pattern or a DnD library.
3. Post-mutation refresh on Calendar — re-fetch events after create/edit/move without full page reload.
4. Fix resource serialization across all resources — ensure all `Resource::collection()` calls use `->resolve()` or the frontend normalizes.

**P1 — Important UX/functionality**
5. Internal notes toggle — add note/comment switch to comment input in task detail drawer.
6. Empty states — add "No tasks" messages to empty board columns and list/calendar views.
7. Column sorting in list view — allow sorting by due_date, priority, status, title.
8. Attachment preview — show file name, size, type icon; handle image preview inline.
9. Bulk actions — add checkbox selection + batch status/assignee operations.
10. Saved filters — store filter presets per user (local storage or backend).

**P2 — Advanced / nice-to-have**
11. Recurring task expansion — `RecurrenceService` to generate recurring instances.
12. Dependency graph — `depends_on` FK and blocker visualization.
13. WebSocket chat — replace REST polling with SSE or Pusher.
14. Drag-to-reorder within columns — card reorder persistence.
15. Export reports — PDF/CSV download for operations reports.
16. Notifications for @mentions in comments (partially implemented — verify).
17. Calendar event pill shows assignee avatar.
18. Keyboard shortcuts on tasks page.
19. Task calendar view as FullCalendar (unify with main calendar).
20. Pagination for large task datasets.

---

## 12. Manual Verification Steps

| Step | URL/Action | Expected |
|---|---|---|
| Load tasks | `/tasks` | Metrics row, board columns, filter bar visible |
| Create task | Click "Create task", fill form, submit | Task appears in board, toast "Task created" |
| Change status | Click status on task card, select new status | Card moves to new column, toast "Status updated" |
| Add checklist | Open task drawer, add checklist item | Item appears, progress updates |
| Toggle checklist | Click checkbox on item | Item toggles, progress recalculates |
| Add comment | Open task drawer, type comment, submit | Comment appears in thread |
| Upload attachment | Open task drawer, select file, upload | File listed, toast success |
| View list | Click "List" view mode | Table with all tasks, grouped by status |
| View calendar | Click "Calendar" view mode | Tasks grouped by date, overdue/today/this week/upcoming |
| Apply filter | Select "My tasks" from filter | Only owned tasks visible |
| Search | Type in search box | Tasks filtered by title/number |
| View requests | Click "Requests" button in header | `/task-requests` page with intake list |
| Create request | Click "New request" in header | Drawer with type/title/description form |
| View workload | Click "Workload" in header | `/workload` table per user |
| View reports | Navigate to `/operations/reports` | KPI cards + breakdown tables |
| Inbox | Navigate to `/inbox` | Left conversation list + right message thread |
| Send message | Type in input, press enter/click send | Message appears in thread |
| New conversation | Click "New conversation", select users, send | New thread created |
| Notifications | Navigate to `/notifications` | Grouped list, mark-read works |
| Calendar | Navigate to `/calendar` | 3-column layout, FullCalendar renders |
| Create event | Click day cell | Drawer opens with date prefilled |
| Edit event | Click event pill | Drawer opens with fetched data |
| Drag event | Drag event to different day | Event moves, toast "Event moved" |
| Resize event | In week/day, drag event edge | Duration changes, toast "Event resized" |
