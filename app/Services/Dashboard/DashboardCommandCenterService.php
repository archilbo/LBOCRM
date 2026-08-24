<?php

namespace App\Services\Dashboard;

use App\Models\CalendarEvent;
use App\Models\Client;
use App\Models\Dossier;
use App\Models\DossierDocument;
use App\Models\FinanceDocument;
use App\Models\Message;
use App\Models\Payment;
use App\Models\Task;
use App\Models\User;
use App\Services\CompanyContext;
use App\Services\Finance\FinanceContextService;
use App\Services\PermissionRegistry;
use Illuminate\Database\Eloquent\Builder;

class DashboardCommandCenterService
{
    public function __construct(
        private readonly CompanyContext $companyContext,
        private readonly FinanceContextService $financeContext,
        private readonly PermissionRegistry $permissions,
    ) {}

    public function data(User $user): array
    {
        $activeProjects = $this->dossiers($user)
            ->whereIn('status', ['opened', 'active'])
            ->count();

        $missingDocuments = $this->dossierDocuments($user)
            ->where('status', 'missing')
            ->count();

        $unpaidInvoices = $this->financeDocuments($user)
            ->where('type', 'invoice')
            ->where('remaining_total', '>', 0)
            ->count();

        $todayPayments = (float) $this->payments($user)
            ->whereDate('paid_at', today())
            ->sum('amount');

        $monthlyPayments = (float) $this->payments($user)
            ->whereYear('paid_at', now()->year)
            ->whereMonth('paid_at', now()->month)
            ->sum('amount');

        $remainingTotal = (float) $this->financeDocuments($user)
            ->where('type', 'invoice')
            ->sum('remaining_total');

        $overdueTotal = (float) $this->financeDocuments($user)
            ->where('type', 'invoice')
            ->where('status', 'overdue')
            ->sum('remaining_total');

        $myTasks = $this->assignedTasks($user)->count();
        $urgentTasks = $this->assignedTasks($user)->where('priority', 'urgent')->whereNotIn('status', ['completed', 'cancelled'])->count();
        $overdueTasks = $this->assignedTasks($user)->whereNotNull('due_date')->where('due_date', '<', now())->whereNotIn('status', ['completed', 'cancelled'])->count();
        $pendingReviewTasks = $this->assignedTasks($user)->where('status', 'in_review')->count();
        $unreadMessages = Message::whereHas('conversation.participants', fn ($q) => $q->where('user_id', $user->id))
            ->where('user_id', '!=', $user->id)
            ->whereDoesntHave('reads', fn ($q) => $q->where('user_id', $user->id))
            ->count();

        $blockedDossiers = $this->blockedDossiers($user);
        $workflowDistribution = $this->workflowDistribution($user);

        $urgentTaskList = $this->assignedTasks($user)
            ->whereNotIn('status', ['completed', 'cancelled'])
            ->where(function ($q) {
                $q->where('priority', 'urgent')
                    ->orWhere(fn ($q2) => $q2->whereNotNull('due_date')->where('due_date', '<', now()));
            })
            ->orderByRaw('CASE WHEN due_date < ? THEN 0 ELSE 1 END', [now()])
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
            ])
            ->values()
            ->all();

        $recentMessageList = Message::query()
            ->with([
                'user:id,name',
                'reads' => fn ($query) => $query->where('user_id', $user->id),
            ])
            ->whereHas('conversation', function (Builder $query) use ($user) {
                $this->companyContext->applyTo($query, $user)
                    ->whereHas('participants', fn (Builder $participants) => $participants->where('user_id', $user->id));
            })
            ->where('user_id', '!=', $user->id)
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn ($m) => [
                'id' => $m->id,
                'conversationId' => $m->conversation_id,
                'sender' => $m->user?->name ?? '-',
                'body' => mb_strlen($m->body) > 80 ? mb_substr($m->body, 0, 80).'…' : $m->body,
                'createdAt' => $m->created_at?->locale('fr')->diffForHumans() ?? '-',
                'unread' => $m->reads->isEmpty(),
            ])
            ->values()
            ->all();

        return [
            'kpis' => [
                [
                    'key' => 'activeProjects',
                    'value' => (string) $activeProjects,
                    'helperKey' => 'totalProjects',
                    'helperValues' => ['count' => $this->dossiers($user)->count()],
                    'tone' => 'blue',
                    'icon' => 'projects',
                    'href' => '/dossiers',
                ],
                [
                    'key' => 'missingDocuments',
                    'value' => (string) $missingDocuments,
                    'helperKey' => 'blockingDocuments',
                    'tone' => $missingDocuments > 0 ? 'red' : 'green',
                    'icon' => 'documents',
                    'href' => '/documents',
                ],
                [
                    'key' => 'unpaidInvoices',
                    'value' => (string) $unpaidInvoices,
                    'helperKey' => 'remainingAmount',
                    'helperValues' => ['amount' => $remainingTotal],
                    'tone' => $unpaidInvoices > 0 ? 'violet' : 'green',
                    'icon' => 'invoices',
                    'href' => '/finance/documents?tab=invoices',
                ],
                [
                    'key' => 'todayPayments',
                    'value' => $todayPayments,
                    'helperKey' => 'monthlyAmount',
                    'helperValues' => ['amount' => $monthlyPayments],
                    'tone' => 'green',
                    'icon' => 'payments',
                    'href' => '/finance/documents?tab=monthly',
                ],
                [
                    'key' => 'blockedDossiers',
                    'value' => (string) count($blockedDossiers),
                    'helperKey' => 'stuckDossiers',
                    'tone' => count($blockedDossiers) > 0 ? 'red' : 'green',
                    'icon' => 'projects',
                    'href' => '/dossiers',
                ],
                [
                    'key' => 'myTasks',
                    'value' => (string) $myTasks,
                    'helperKey' => 'taskPriority',
                    'helperValues' => ['urgent' => $urgentTasks, 'overdue' => $overdueTasks],
                    'tone' => $overdueTasks > 0 ? 'red' : ($urgentTasks > 0 ? 'gold' : 'green'),
                    'icon' => 'tasks',
                    'href' => '/tasks?filter=my',
                ],
                [
                    'key' => 'pendingReviewTasks',
                    'value' => (string) $pendingReviewTasks,
                    'helperKey' => 'pendingReview',
                    'tone' => $pendingReviewTasks > 0 ? 'gold' : 'green',
                    'icon' => 'tasks',
                    'href' => '/tasks?filter=all&status=in_review',
                ],
                [
                    'key' => 'unreadMessages',
                    'value' => (string) $unreadMessages,
                    'helperKey' => 'allConversations',
                    'tone' => $unreadMessages > 0 ? 'violet' : 'green',
                    'icon' => 'chat',
                    'href' => '/inbox',
                ],
            ],
            'nextActions' => $this->nextActions($user),
            'blockedDossiers' => $blockedDossiers,
            'workflowDistribution' => $workflowDistribution,
            'financeTrend' => $this->financeTrend($user),
            'recentProjects' => $this->recentProjects($user),
            'financeAlerts' => $this->financeAlerts($user, $remainingTotal, $overdueTotal, $monthlyPayments),
            'activityFeed' => $this->activityFeed($user),
            'urgentTaskList' => $urgentTaskList,
            'recentMessageList' => $recentMessageList,
            'attentionItems' => $this->attentionItems($user),
            'quickLinks' => $this->quickLinks($user),
            'systemHealth' => [
                ['label' => 'Clients', 'value' => (string) $this->clients($user)->count(), 'icon' => 'clients', 'tone' => 'blue'],
                ['label' => 'Projects', 'value' => (string) $this->dossiers($user)->count(), 'icon' => 'projects', 'tone' => 'gold'],
                ['label' => 'Documents', 'value' => (string) $this->dossierDocuments($user)->count(), 'icon' => 'documents', 'tone' => 'green'],
                ['label' => 'Finance docs', 'value' => (string) $this->financeDocuments($user)->count(), 'icon' => 'invoices', 'tone' => 'violet'],
                ['label' => 'Last refresh', 'value' => now()->format('H:i'), 'icon' => 'clock', 'tone' => 'green'],
            ],
        ];
    }

    private function quickLinks(User $user): array
    {
        // Each quick action targets a page with a create/manage command; the
        // action is only offered when the registry grants the underlying
        // ability (legacy aliases and custom matrices included).
        $links = [
            ['key' => 'newProject', 'href' => '/dossiers?command=create', 'icon' => 'projects', 'permission' => 'dossiers.create'],
            ['key' => 'uploadDocument', 'href' => '/documents?command=upload', 'icon' => 'upload', 'permission' => 'documents.create'],
            ['key' => 'createInvoice', 'href' => '/finance/documents?tab=invoices&command=create-invoice', 'icon' => 'invoices', 'permission' => 'finance.documents.create'],
            ['key' => 'newClient', 'href' => '/clients?command=create', 'icon' => 'clients', 'permission' => 'clients.create'],
            ['key' => 'newTask', 'href' => '/tasks?command=create', 'icon' => 'tasks', 'permission' => 'tasks.create'],
            ['key' => 'newConversation', 'href' => '/inbox?command=create', 'icon' => 'chat', 'permission' => 'inbox.manage'],
        ];

        return array_values(array_map(
            fn (array $link) => ['key' => $link['key'], 'href' => $link['href'], 'icon' => $link['icon']],
            array_filter($links, fn (array $link) => $this->permissions->allows($user, $link['permission'])),
        ));
    }

    private function attentionItems(User $user): array
    {
        $now = now();
        $horizon = $now->copy()->addHours(48);
        $items = collect();

        if ($this->permissions->allows($user, 'tasks.view')) {
            $this->assignedTasks($user)
                ->whereNotIn('status', ['completed', 'cancelled'])
                ->whereNotNull('due_date')
                ->where('due_date', '<=', $horizon->toDateString())
                ->orderBy('due_date')
                ->limit(4)
                ->get(['id', 'task_number', 'title', 'due_date', 'priority'])
                ->each(function (Task $task) use ($items) {
                    $urgency = $task->due_date->isPast()
                        ? 'overdue'
                        : ($task->due_date->isToday() ? 'today' : 'upcoming');

                    $items->push([
                        'id' => 'task-'.$task->id,
                        'kind' => 'task',
                        'title' => $task->title,
                        'context' => $task->task_number,
                        'at' => $task->due_date->copy()->startOfDay()->toIso8601String(),
                        'urgency' => $urgency,
                        'tone' => $urgency === 'overdue' ? 'red' : ($task->priority === 'urgent' ? 'gold' : 'blue'),
                        'icon' => 'tasks',
                        'href' => '/tasks?task='.$task->id,
                        'sortAt' => $task->due_date->copy()->startOfDay(),
                    ]);
                });
        }

        if ($this->permissions->allows($user, 'calendar.view')) {
            $this->visibleCalendarEvents($user)
                ->whereNotIn('status', ['completed', 'cancelled'])
                ->whereBetween('starts_at', [$now, $horizon])
                ->orderBy('starts_at')
                ->limit(4)
                ->get(['id', 'event_number', 'title', 'type', 'starts_at'])
                ->each(function (CalendarEvent $event) use ($items) {
                    $urgency = $event->starts_at->isToday() ? 'today' : 'upcoming';

                    $items->push([
                        'id' => 'calendar-'.$event->id,
                        'kind' => 'calendar',
                        'title' => $event->title,
                        'context' => $event->event_number,
                        'at' => $event->starts_at->toIso8601String(),
                        'urgency' => $urgency,
                        'tone' => $urgency === 'today' ? 'gold' : 'violet',
                        'icon' => 'clock',
                        'href' => '/calendar?start='.$event->starts_at->toDateString().'&end='.$event->starts_at->toDateString().'&event='.$event->id,
                        'sortAt' => $event->starts_at,
                    ]);
                });
        }

        return $items
            ->sortBy('sortAt')
            ->take(8)
            ->map(fn (array $item) => collect($item)->except('sortAt')->all())
            ->values()
            ->all();
    }

    private function visibleCalendarEvents(User $user): Builder
    {
        $query = CalendarEvent::query()
            ->whereHas('creator', fn (Builder $creator) => $this->companyContext->applyTo($creator, $user));

        if ($this->permissions->isProtected($user)) {
            return $query;
        }

        return $query
            ->where('visibility', '!=', 'admins')
            ->where(function (Builder $events) use ($user) {
                $events->where('created_by', $user->id)
                    ->orWhere('visibility', 'team')
                    ->orWhere(function (Builder $assignedEvents) use ($user) {
                        $assignedEvents
                            ->where('visibility', 'assigned_users')
                            ->whereHas('participants', fn (Builder $participants) => $participants->where('user_id', $user->id));
                    });
            });
    }

    private function nextActions(User $user): array
    {
        $actions = collect();

        $this->dossierDocuments($user)
            ->with(['dossier.primaryClient'])
            ->where('status', 'missing')
            ->latest()
            ->limit(3)
            ->get()
            ->each(function (DossierDocument $document) use ($actions) {
                $actions->push([
                    'id' => 'document-'.$document->id,
                    'kind' => 'missingDocument',
                    'context' => trim(($document->dossier?->dossier_number ?? '-').' - '.($document->dossier?->primaryClient?->full_name ?? '-')),
                    'dueKey' => 'today',
                    'tone' => 'red',
                    'icon' => 'upload',
                    'href' => '/documents',
                ]);
            });

        $this->financeDocuments($user)
            ->with(['client', 'dossier'])
            ->where('type', 'invoice')
            ->where('remaining_total', '>', 0)
            ->orderByDesc('remaining_total')
            ->limit(2)
            ->get()
            ->each(function (FinanceDocument $invoice) use ($actions) {
                $actions->push([
                    'id' => 'invoice-'.$invoice->id,
                    'kind' => 'unpaidInvoice',
                    'context' => trim(($invoice->number ?? '-').' - '.($invoice->client?->full_name ?? '-')),
                    'dueKey' => $invoice->status === 'overdue' ? 'overdue' : 'open',
                    'tone' => $invoice->status === 'overdue' ? 'red' : 'blue',
                    'icon' => 'invoices',
                    'href' => '/finance/documents?tab=invoices',
                ]);
            });

        if ($actions->isEmpty()) {
            $actions->push([
                'id' => 'all-clear',
                'kind' => 'allClear',
                'context' => null,
                'dueKey' => 'good',
                'tone' => 'green',
                'icon' => 'check',
                'href' => '/dossiers',
            ]);
        }

        return $actions->take(5)->values()->all();
    }

    private function recentProjects(User $user): array
    {
        return $this->dossiers($user)
            ->with('primaryClient:clients.id,clients.full_name')
            ->withCount([
                'documents as missing_documents_count' => fn (Builder $query) => $query->where('status', 'missing'),
            ])
            ->withSum([
                'financeDocuments as invoice_remaining_total' => fn (Builder $query) => $query
                    ->where('type', 'invoice'),
            ], 'remaining_total')
            ->latest()
            ->limit(8)
            ->get()
            ->map(fn (Dossier $dossier) => [
                'id' => (string) $dossier->id,
                'dossierNumber' => $dossier->dossier_number,
                'project' => $dossier->project_object ?? $dossier->dossier_number,
                'client' => $dossier->primaryClient?->full_name ?? '-',
                'location' => trim(($dossier->province ?? '-').' / '.($dossier->commune ?? '-')),
                'step' => $dossier->workflow_step ?? '-',
                'status' => $dossier->status ?? '-',
                'missingDocs' => (int) $dossier->missing_documents_count,
                'remaining' => (float) ($dossier->invoice_remaining_total ?? 0),
                'href' => '/dossiers/'.$dossier->id,
            ])
            ->values()
            ->all();
    }

    private function financeAlerts(User $user, float $remainingTotal, float $overdueTotal, float $monthlyPayments): array
    {
        $overdueCount = $this->financeDocuments($user)
            ->where('type', 'invoice')
            ->where('status', 'overdue')
            ->count();

        $unpaidCount = $this->financeDocuments($user)
            ->where('type', 'invoice')
            ->where('remaining_total', '>', 0)
            ->count();

        return [
            [
                'id' => 'overdue',
                'amount' => $overdueTotal,
                'count' => $overdueCount,
                'tone' => $overdueCount > 0 ? 'red' : 'green',
                'href' => '/finance/documents?tab=invoices',
            ],
            [
                'id' => 'remaining',
                'amount' => $remainingTotal,
                'count' => $unpaidCount,
                'tone' => $unpaidCount > 0 ? 'gold' : 'green',
                'href' => '/finance/documents?tab=invoices',
            ],
            [
                'id' => 'monthly',
                'amount' => $monthlyPayments,
                'tone' => 'blue',
                'href' => '/finance/documents?tab=monthly',
            ],
        ];
    }

    private function activityFeed(User $user): array
    {
        $documents = $this->dossierDocuments($user)
            ->with('dossier:id,dossier_number')
            ->latest()
            ->limit(4)
            ->get()
            ->toBase()
            ->map(fn (DossierDocument $document) => [
                'id' => 'doc-'.$document->id,
                'kind' => 'documentUpdated',
                'description' => trim(($document->original_filename ?? '-').' - '.($document->dossier?->dossier_number ?? '-')),
                'time' => $document->updated_at?->locale('fr')->diffForHumans() ?? '-',
                'tone' => $document->status === 'verified' ? 'green' : ($document->status === 'missing' ? 'red' : 'gold'),
                'icon' => 'documents',
                'sortAt' => $document->updated_at,
            ]);

        $payments = $this->payments($user)
            ->with('document')
            ->latest()
            ->limit(4)
            ->get()
            ->toBase()
            ->map(fn (Payment $payment) => [
                'id' => 'payment-'.$payment->id,
                'kind' => 'paymentRecorded',
                'description' => trim(($payment->payment_number ?? '-').' - '.($payment->document?->number ?? '-')),
                'time' => $payment->created_at?->locale('fr')->diffForHumans() ?? '-',
                'tone' => 'blue',
                'icon' => 'payments',
                'sortAt' => $payment->created_at,
            ]);

        $projects = $this->dossiers($user)
            ->latest()
            ->limit(4)
            ->get()
            ->toBase()
            ->map(fn (Dossier $dossier) => [
                'id' => 'project-'.$dossier->id,
                'kind' => 'projectUpdated',
                'description' => trim(($dossier->dossier_number ?? '-').' - '.($dossier->project_object ?? '')),
                'time' => $dossier->updated_at?->locale('fr')->diffForHumans() ?? '-',
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

    private function blockedDossiers(User $user): array
    {
        $config = config('archilbo_workflow.client_project_steps', []);
        $stepLabels = collect($config)->pluck('label', 'key')->all();

        return $this->dossiers($user)
            ->with('primaryClient:clients.id,clients.full_name')
            ->withCount([
                'documents as missing_documents_count' => fn (Builder $query) => $query->where('status', 'missing'),
            ])
            ->whereIn('status', ['opened', 'active'])
            ->where('updated_at', '<', now()->subDays(7))
            ->latest('updated_at')
            ->limit(10)
            ->get()
            ->map(fn (Dossier $dossier) => [
                'id' => (string) $dossier->id,
                'dossierNumber' => $dossier->dossier_number,
                'project' => $dossier->project_object ?? $dossier->dossier_number,
                'client' => $dossier->primaryClient?->full_name ?? '-',
                'step' => $stepLabels[$dossier->workflow_step] ?? $dossier->workflow_step ?? '-',
                'stepKey' => $dossier->workflow_step ?? '-',
                'daysStuck' => (int) $dossier->updated_at->diffInDays(now()),
                'missingDocs' => (int) $dossier->missing_documents_count,
                'href' => '/dossiers/'.$dossier->id,
            ])
            ->values()
            ->all();
    }

    private function workflowDistribution(User $user): array
    {
        $config = config('archilbo_workflow.client_project_steps', []);
        $steps = collect($config)->pluck('label', 'key')->all();
        $counts = $this->dossiers($user)
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

    private function financeTrend(User $user): array
    {
        $start = now()->startOfMonth()->subMonths(5);

        $collected = $this->payments($user)
            ->whereDate('paid_at', '>=', $start)
            ->get(['paid_at', 'amount'])
            ->groupBy(fn (Payment $payment) => $payment->paid_at?->format('Y-m'))
            ->filter(fn ($payments, ?string $month) => $month !== null)
            ->map(fn ($payments) => (float) $payments->sum('amount'))
            ->all();

        $invoiced = $this->financeDocuments($user)
            ->where('type', 'invoice')
            ->whereDate('issue_date', '>=', $start)
            ->get(['issue_date', 'total_ttc'])
            ->groupBy(fn (FinanceDocument $document) => $document->issue_date?->format('Y-m'))
            ->filter(fn ($documents, ?string $month) => $month !== null)
            ->map(fn ($documents) => (float) $documents->sum('total_ttc'))
            ->all();

        return collect(range(0, 5))
            ->map(function (int $offset) use ($start, $invoiced, $collected) {
                $date = $start->copy()->addMonths($offset);
                $key = $date->format('Y-m');

                return [
                    'key' => $key,
                    'label' => ucfirst($date->locale('fr')->translatedFormat('M')),
                    'invoiced' => $invoiced[$key] ?? 0.0,
                    'collected' => $collected[$key] ?? 0.0,
                ];
            })
            ->values()
            ->all();
    }

    private function clients(User $user): Builder
    {
        return $this->companyContext->applyTo(Client::query(), $user);
    }

    private function dossiers(User $user): Builder
    {
        return $this->companyContext->applyTo(Dossier::query(), $user);
    }

    private function dossierDocuments(User $user): Builder
    {
        return DossierDocument::query()
            ->whereHas('dossier', fn (Builder $query) => $this->companyContext->applyTo($query, $user));
    }

    private function financeDocuments(User $user): Builder
    {
        return $this->financeContext->apply(FinanceDocument::query(), $user);
    }

    private function payments(User $user): Builder
    {
        return $this->financeContext->apply(Payment::query(), $user);
    }

    private function assignedTasks(User $user): Builder
    {
        return Task::query()
            ->whereHas('creator', fn (Builder $query) => $this->companyContext->applyTo($query, $user))
            ->whereHas('assignees', fn (Builder $query) => $query->whereKey($user->id));
    }
}
