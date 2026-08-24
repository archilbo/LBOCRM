<?php

namespace App\Services\Finance;

use App\Models\FinanceDocument;
use App\Models\Payment;
use Illuminate\Support\Collection;

/**
 * Calculates finance measures from one scoped document/payment set.
 *
 * With the deprecated planning document removed, issued invoices are the single source for
 * expected and official finance totals.
 */
class FinanceDocumentMetricsService
{
    /**
     * @param Collection<int, FinanceDocument> $documents
     * @param Collection<int, Payment> $payments
     * @return array{expectedTotal: float, expectedPaidTotal: float, expectedRemainingTotal: float, officialInvoicedTotal: float, officialPaidTotal: float, officialBalanceTotal: float}
     */
    public function forDocuments(Collection $documents, Collection $payments): array
    {
        $activeDocuments = $documents
            ->filter(fn (FinanceDocument $document) => $document->status !== 'cancelled')
            ->keyBy('id');

        $officialInvoices = $activeDocuments->filter(fn (FinanceDocument $document) => $document->isInvoice());

        $validPayments = $payments->filter(fn (Payment $payment) => $payment->cancelled_at === null);
        $officialPayments = $validPayments->filter(function (Payment $payment) use ($officialInvoices): bool {
            return $officialInvoices->has($payment->finance_document_id);
        });

        $officialInvoicedTotal = $this->amount($officialInvoices->sum('total_ttc'));
        $officialPaidTotal = min($officialInvoicedTotal, $this->amount($officialPayments->sum('amount')));

        return [
            'expectedTotal' => $officialInvoicedTotal,
            'expectedPaidTotal' => $officialPaidTotal,
            'expectedRemainingTotal' => $this->amount(max(0, $officialInvoicedTotal - $officialPaidTotal)),
            'officialInvoicedTotal' => $officialInvoicedTotal,
            'officialPaidTotal' => $officialPaidTotal,
            'officialBalanceTotal' => $this->amount(max(0, $officialInvoicedTotal - $officialPaidTotal)),
        ];
    }

    private function amount(mixed $amount): float
    {
        return (float) round((float) $amount, 2);
    }
}
