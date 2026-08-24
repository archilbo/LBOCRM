<?php

namespace App\Services\Finance;

use App\Models\Expense;
use App\Models\FinanceDocument;
use App\Models\Payment;
use App\Models\User;
use Carbon\CarbonInterface;
use Illuminate\Support\Collection;

class FinanceMonthlySummaryService
{
    public function __construct(private readonly FinanceContextService $context)
    {
    }

    public function months(?int $year = null, ?User $user = null): array
    {
        $expenseQuery = Expense::query();
        $documentQuery = FinanceDocument::query()->with(['client', 'dossier']);
        $paymentQuery = Payment::query()->with(['document', 'client', 'dossier']);

        if ($user) {
            $this->context->apply($expenseQuery, $user);
            $this->context->apply($documentQuery, $user);
            $this->context->apply($paymentQuery, $user);
        }

        $expenses = $expenseQuery
            ->when($year, fn ($query) => $query->where(function ($q) use ($year) {
                $q->whereYear('expense_date', $year)
                    ->orWhere(function ($fallback) use ($year) {
                        $fallback->whereYear('created_at', $year);
                    });
            }))
            ->latest()
            ->get();

        $documents = $documentQuery
            ->when($year, fn ($query) => $query->where(function ($q) use ($year) {
                $q->whereYear('issue_date', $year)
                    ->orWhere(function ($fallback) use ($year) {
                        $fallback->whereNull('issue_date')->whereYear('created_at', $year);
                    });
            }))
            ->latest()
            ->get();

        $payments = $paymentQuery
            ->when($year, fn ($query) => $query->where(function ($q) use ($year) {
                $q->whereYear('paid_at', $year)
                    ->orWhere(function ($fallback) use ($year) {
                        $fallback->whereNull('paid_at')->whereYear('created_at', $year);
                    });
            }))
            ->latest()
            ->get();

        $keys = $documents
            ->map(fn (FinanceDocument $document) => $this->monthKey($document->issue_date ?? $document->created_at))
            ->merge($payments->map(fn (Payment $payment) => $this->monthKey($payment->paid_at ?? $payment->created_at)))
            ->merge($expenses->map(fn (Expense $expense) => $this->monthKey($expense->expense_date)))
            ->filter()
            ->unique()
            ->sortDesc()
            ->values();

        return $keys
            ->map(fn (string $key) => $this->monthSummary(
                $key,
                $documents->filter(fn (FinanceDocument $document) => $this->monthKey($document->issue_date ?? $document->created_at) === $key),
                $payments->filter(fn (Payment $payment) => $this->monthKey($payment->paid_at ?? $payment->created_at) === $key),
                $expenses->filter(fn (Expense $expense) => $this->monthKey($expense->expense_date) === $key),
            ))
            ->all();
    }

    private function monthSummary(string $key, Collection $documents, Collection $payments, Collection $expenses): array
    {
        [$year, $month] = array_map('intval', explode('-', $key));
        $quotes = $documents->where('type', 'quote');
        $invoices = $documents->where('type', 'invoice')->where('status', '!=', 'cancelled');
        $receipts = $documents->where('type', 'receipt');

        return [
            'year' => $year,
            'month' => $month,
            'key' => $key,
            'label' => sprintf('%04d-%02d', $year, $month),
            'currency' => FinanceSettingsService::getCurrency(),
            'quotesCount' => $quotes->count(),
            'invoicesCount' => $invoices->count(),
            'receiptsCount' => $receipts->count(),
            'paymentsCount' => $payments->count(),
            'quotesTotalTtc' => (float) $quotes->sum('total_ttc'),
            'invoicesTotalTtc' => (float) $invoices->sum('total_ttc'),
            'receiptsTotalTtc' => (float) $receipts->sum('total_ttc'),
            'paidTotal' => (float) $payments->sum('amount'),
            'expensesTotal' => (float) $expenses->sum('amount'),
            'expensesCount' => $expenses->count(),
            'remainingTotal' => (float) $invoices->sum('remaining_total'),
            'overdueTotal' => (float) $invoices->where('status', 'overdue')->sum('remaining_total'),
            'subtotalHt' => (float) $documents->sum('subtotal_ht'),
            'taxTotal' => (float) $documents->sum('tax_total'),
            'totalTtc' => (float) $documents->sum('total_ttc'),
            'documents' => $documents->values()->map(fn (FinanceDocument $document) => $this->documentRow($document))->all(),
            'payments' => $payments->values()->map(fn (Payment $payment) => $this->paymentRow($payment))->all(),
        ];
    }

    private function documentRow(FinanceDocument $document): array
    {
        return [
            'id' => $document->id,
            'type' => $document->type,
            'number' => $document->number,
            'status' => $document->status,
            'clientName' => $document->client?->full_name,
            'dossierNumber' => $document->dossier?->dossier_number,
            'province' => $document->dossier?->province,
            'commune' => $document->dossier?->commune,
            'issueDate' => optional($document->issue_date)->toDateString(),
            'totalTtc' => (float) $document->total_ttc,
            'paidTotal' => (float) $document->paid_total,
            'remainingTotal' => (float) $document->remaining_total,
        ];
    }

    private function paymentRow(Payment $payment): array
    {
        return [
            'id' => $payment->id,
            'paymentNumber' => $payment->payment_number,
            'documentNumber' => $payment->document?->number,
            'clientName' => $payment->client?->full_name,
            'dossierNumber' => $payment->dossier?->dossier_number,
            'province' => $payment->dossier?->province,
            'commune' => $payment->dossier?->commune,
            'amount' => (float) $payment->amount,
            'method' => $payment->method,
            'paidAt' => optional($payment->paid_at)->toDateString(),
        ];
    }

    private function monthKey(CarbonInterface|string|null $date): ?string
    {
        if (! $date) {
            return null;
        }

        return $date instanceof CarbonInterface
            ? $date->format('Y-m')
            : (string) date('Y-m', strtotime($date));
    }
}
