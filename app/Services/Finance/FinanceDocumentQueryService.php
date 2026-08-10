<?php

namespace App\Services\Finance;

use App\Models\Expense;
use App\Models\FinanceDocument;
use App\Models\Payment;
use App\Models\FinancePaymentPromise;
use App\Models\User;
use Illuminate\Http\Request;

class FinanceDocumentQueryService
{
    public function __construct(
        private readonly FinanceContextService $context,
        private readonly FinanceReceivablesService $receivables,
    )
    {
    }

    public function documents(Request $request, User $user)
    {
        $query = $this->receivables->withValidPaymentTotal($this->context->apply(
            FinanceDocument::query()->with(['client', 'dossier', 'items', 'payments'])->withCount('payments'),
            $user,
        ));

        $tabType = match ($request->string('tab')->toString()) {
            'quotes' => 'quote',
            'invoices' => 'invoice',
            default => null,
        };
        $type = $request->string('type')->toString() ?: $tabType;

        $query->when($type, fn ($q) => $q->where('type', $type));
        $query->when($request->string('status')->toString(), fn ($q, $status) => $q->where('status', $status));
        $query->when($request->integer('client_id'), fn ($q, $id) => $q->where('client_id', $id));
        $query->when($request->integer('dossier_id'), fn ($q, $id) => $q->where('dossier_id', $id));
        $query->when($request->date('date_from'), fn ($q, $date) => $q->whereDate('issue_date', '>=', $date));
        $query->when($request->date('date_to'), fn ($q, $date) => $q->whereDate('issue_date', '<=', $date));

        $search = trim($request->string('search')->toString());
        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('number', 'like', "%{$search}%")
                    ->orWhereHas('client', fn ($client) => $client->where('full_name', 'like', "%{$search}%"))
                    ->orWhereHas('dossier', fn ($dossier) => $dossier
                        ->where('dossier_number', 'like', "%{$search}%")
                        ->orWhere('project_object', 'like', "%{$search}%"));
            });
        }

        $sortable = ['created_at', 'issue_date', 'due_date', 'number', 'type', 'total_ttc', 'paid_total', 'remaining_total', 'status'];
        $requestedSort = $request->string('sort')->toString();
        $sort = in_array($requestedSort, $sortable, true) ? $requestedSort : 'created_at';
        $direction = $request->string('direction')->toString() === 'asc' ? 'asc' : 'desc';
        $perPage = min(max($request->integer('per_page', 15), 10), 100);

        return $query->orderBy($sort, $direction)->paginate($perPage)->withQueryString();
    }

    public function payments(Request $request, User $user)
    {
        $query = $this->context->apply(
            Payment::query()->with(['document', 'client', 'dossier', 'receiptDocument']),
            $user,
        );

        $search = trim($request->string('payment_search')->toString());
        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('payment_number', 'like', "%{$search}%")
                    ->orWhere('reference', 'like', "%{$search}%")
                    ->orWhere('method', 'like', "%{$search}%")
                    ->orWhereHas('client', fn ($client) => $client->where('full_name', 'like', "%{$search}%"))
                    ->orWhereHas('document', fn ($document) => $document->where('number', 'like', "%{$search}%"));
            });
        }

        $sortable = ['created_at', 'paid_at', 'payment_number', 'amount', 'method'];
        $requestedSort = $request->string('payment_sort')->toString();
        $sort = in_array($requestedSort, $sortable, true) ? $requestedSort : 'paid_at';
        $direction = $request->string('payment_direction')->toString() === 'asc' ? 'asc' : 'desc';
        $perPage = min(max($request->integer('payments_per_page', 15), 10), 100);

        return $query->orderBy($sort, $direction)
            ->orderByDesc('created_at')
            ->paginate($perPage, ['*'], 'payments_page')
            ->withQueryString();
    }

    public function receivables(Request $request, User $user)
    {
        $query = $this->receivables->withValidPaymentTotal($this->context->apply(
            FinanceDocument::query()->with(['client', 'dossier', 'payments']),
            $user,
        ))
            ->where('type', 'invoice')
            ->where('status', '!=', 'cancelled')
            ->where('remaining_total', '>', 0);

        $today = now()->toDateString();
        $filter = $request->string('collection_filter')->toString() ?: 'all';
        match ($filter) {
            'today' => $query->whereDate('due_date', $today),
            'upcoming' => $query->whereDate('due_date', '>', $today),
            'overdue' => $query->whereDate('due_date', '<', $today),
            'overdue_30' => $query->whereDate('due_date', '<=', now()->subDays(30)->toDateString()),
            'promises' => $query->whereHas('paymentPromises', fn ($promises) => $promises->where('status', 'active')),
            default => null,
        };

        $query->when($request->integer('collection_client_id'), fn ($q, $id) => $q->where('client_id', $id));
        $query->when($request->integer('collection_dossier_id'), fn ($q, $id) => $q->where('dossier_id', $id));

        $search = trim($request->string('collection_search')->toString());
        if ($search !== '') {
            $query->where(function ($q) use ($search): void {
                $q->where('number', 'like', "%{$search}%")
                    ->orWhereHas('client', fn ($client) => $client->where('full_name', 'like', "%{$search}%"))
                    ->orWhereHas('dossier', fn ($dossier) => $dossier
                        ->where('dossier_number', 'like', "%{$search}%")
                        ->orWhere('project_object', 'like', "%{$search}%"));
            });
        }

        $sort = $request->string('collection_sort')->toString() ?: 'oldest_overdue';
        match ($sort) {
            'highest_outstanding' => $query->orderByDesc('remaining_total'),
            'nearest_due' => $query->orderByRaw('due_date is null, due_date asc'),
            'client' => $query->orderBy(
                \App\Models\Client::query()->select('full_name')->whereColumn('clients.id', 'finance_documents.client_id'),
            ),
            default => $query->orderByRaw('case when due_date < ? then 0 else 1 end', [$today])->orderBy('due_date'),
        };

        $perPage = min(max($request->integer('collection_per_page', 15), 10), 100);

        return $query->orderBy('id')->paginate($perPage, ['*'], 'collection_page')->withQueryString();
    }

    public function collectionMetrics(User $user, string $currency): array
    {
        $invoices = $this->context->apply(FinanceDocument::query(), $user)
            ->where('finance_documents.type', 'invoice')
            ->where('finance_documents.status', '!=', 'cancelled')
            ->where('finance_documents.remaining_total', '>', 0);
        $today = now()->toDateString();

        $agingBase = fn () => clone $invoices;

        return [
            'toReceive' => (float) (clone $invoices)->sum('finance_documents.remaining_total'),
            'overdue' => (float) (clone $invoices)->whereDate('finance_documents.due_date', '<', $today)->sum('finance_documents.remaining_total'),
            'dueToday' => (float) (clone $invoices)->whereDate('finance_documents.due_date', $today)->sum('finance_documents.remaining_total'),
            'promisesUpcoming' => (float) $this->context->apply(FinancePaymentPromise::query(), $user)
                ->where('status', 'active')
                ->whereDate('promised_for', '>=', $today)
                ->sum('amount'),
            'currency' => $currency,
            'aging' => [
                'current' => (float) $agingBase()->where(function ($query) use ($today): void {
                    $query->whereNull('finance_documents.due_date')->orWhereDate('finance_documents.due_date', '>=', $today);
                })->sum('finance_documents.remaining_total'),
                '1_7' => (float) $agingBase()->whereDate('finance_documents.due_date', '>=', now()->subDays(7)->toDateString())->whereDate('finance_documents.due_date', '<', $today)->sum('finance_documents.remaining_total'),
                '8_30' => (float) $agingBase()->whereDate('finance_documents.due_date', '>=', now()->subDays(30)->toDateString())->whereDate('finance_documents.due_date', '<', now()->subDays(7)->toDateString())->sum('finance_documents.remaining_total'),
                '31_60' => (float) $agingBase()->whereDate('finance_documents.due_date', '>=', now()->subDays(60)->toDateString())->whereDate('finance_documents.due_date', '<', now()->subDays(30)->toDateString())->sum('finance_documents.remaining_total'),
                '61_plus' => (float) $agingBase()->whereDate('finance_documents.due_date', '<', now()->subDays(60)->toDateString())->sum('finance_documents.remaining_total'),
            ],
            'clientsToRemind' => (clone $invoices)
                ->whereDate('finance_documents.due_date', '<', $today)
                ->join('clients', 'clients.id', '=', 'finance_documents.client_id')
                ->selectRaw('finance_documents.client_id, clients.full_name as client_name, sum(finance_documents.remaining_total) as outstanding, min(finance_documents.due_date) as oldest_due_date')
                ->groupBy('finance_documents.client_id', 'clients.full_name')
                ->orderBy('oldest_due_date')
                ->orderByDesc('outstanding')
                ->limit(5)
                ->get()
                ->map(fn ($client) => [
                    'clientId' => (int) $client->client_id,
                    'clientName' => $client->client_name,
                    'outstanding' => (float) $client->outstanding,
                    'oldestDueDate' => $client->oldest_due_date,
                ])
                ->all(),
        ];
    }

    public function expenses(Request $request, User $user)
    {
        $query = $this->context->apply(Expense::query()->with(['dossier', 'creator']), $user);

        $query->when(
            $request->string('expense_category')->toString(),
            fn ($q, $category) => $q->where('category', $category),
        );

        $search = trim($request->string('expense_search')->toString());
        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('vendor', 'like', "%{$search}%")
                    ->orWhere('notes', 'like', "%{$search}%")
                    ->orWhere('payment_method', 'like', "%{$search}%")
                    ->orWhereHas('dossier', fn ($dossier) => $dossier->where('dossier_number', 'like', "%{$search}%"));
            });
        }

        $sortable = ['created_at', 'expense_date', 'category', 'vendor', 'amount', 'payment_method'];
        $requestedSort = $request->string('expense_sort')->toString();
        $sort = in_array($requestedSort, $sortable, true) ? $requestedSort : 'expense_date';
        $direction = $request->string('expense_direction')->toString() === 'asc' ? 'asc' : 'desc';
        $perPage = min(max($request->integer('expenses_per_page', 15), 10), 100);

        return $query->orderBy($sort, $direction)
            ->orderByDesc('created_at')
            ->paginate($perPage, ['*'], 'expenses_page')
            ->withQueryString();
    }

    public function metrics(User $user, string $currency): array
    {
        $documents = fn () => $this->context->apply(FinanceDocument::query(), $user);
        $expenses = $this->context->apply(Expense::query(), $user);

        $invoices = $documents()->where('type', 'invoice');
        $today = now()->toDateString();

        return [
            'totalQuotes' => (float) $documents()->where('type', 'quote')->sum('total_ttc'),
            'totalInvoices' => (float) (clone $invoices)->sum('total_ttc'),
            'paidTotal' => (float) (clone $invoices)->sum('paid_total'),
            'remainingTotal' => (float) (clone $invoices)->sum('remaining_total'),
            'overdueTotal' => (float) (clone $invoices)
                ->where('due_date', '<', $today)
                ->where('remaining_total', '>', 0)
                ->sum('remaining_total'),
            'dueTodayTotal' => (float) (clone $invoices)
                ->whereDate('due_date', $today)
                ->where('remaining_total', '>', 0)
                ->sum('remaining_total'),
            'draftCount' => $documents()->where('status', 'draft')->count(),
            'totalExpenses' => (float) $expenses->sum('amount'),
            'currency' => $currency,
        ];
    }
}
