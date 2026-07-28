<?php

namespace App\Services\Dashboard;

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
                'subtitle' => 'One place to see what needs attention across projects, documents, finance, and archive.',
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
                    'helper' => 'Blocking contracts and documents',
                    'tone' => $missingDocuments > 0 ? 'red' : 'green',
                    'icon' => 'documents',
                    'href' => '/documents',
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
                ['label' => 'New project', 'href' => '/dossiers?command=create', 'icon' => 'projects'],
                ['label' => 'Upload document', 'href' => '/documents?command=upload', 'icon' => 'upload'],
                ['label' => 'Create invoice', 'href' => '/finance/documents?tab=invoices&command=create-invoice', 'icon' => 'invoices'],
                ['label' => 'New client', 'href' => '/clients?command=create', 'icon' => 'clients'],
                ['label' => 'New task', 'href' => '/tasks?command=create', 'icon' => 'tasks'],
                ['label' => 'New conversation', 'href' => '/inbox?command=create', 'icon' => 'chat'],
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
            ->toBase()
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
            ->toBase()
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
            ->toBase()
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
            ->with(['client', 'documents'])
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
