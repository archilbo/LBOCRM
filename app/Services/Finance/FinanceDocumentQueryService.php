<?php

namespace App\Services\Finance;

use App\Models\Expense;
use App\Models\FinanceDocument;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Http\Request;

class FinanceDocumentQueryService
{
    public function __construct(private readonly FinanceContextService $context)
    {
    }

    public function documents(Request $request, User $user)
    {
        $query = $this->context->apply(
            FinanceDocument::query()->with(['client', 'dossier', 'items', 'payments'])->withCount('payments'),
            $user,
        );

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

        return [
            'totalQuotes' => (float) $documents()->where('type', 'quote')->sum('total_ttc'),
            'totalInvoices' => (float) $documents()->where('type', 'invoice')->sum('total_ttc'),
            'paidTotal' => (float) $documents()->where('type', 'invoice')->sum('paid_total'),
            'remainingTotal' => (float) $documents()->where('type', 'invoice')->sum('remaining_total'),
            'overdueTotal' => (float) $documents()->where('type', 'invoice')->where('status', 'overdue')->sum('remaining_total'),
            'draftCount' => $documents()->where('status', 'draft')->count(),
            'totalExpenses' => (float) $expenses->sum('amount'),
            'currency' => $currency,
        ];
    }
}
