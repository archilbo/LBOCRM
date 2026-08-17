<?php

namespace App\Services\Finance;

use App\Models\FinanceDocument;
use App\Models\Payment;
use Illuminate\Support\Collection;

/**
 * Calculates finance measures from one scoped document/payment set.
 *
 * An internal invoice remains the expected-value source after conversion. Its
 * official child is deliberately reported separately, so conversion never
 * inflates expected revenue or payments.
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

        $internalInvoices = $activeDocuments->filter(fn (FinanceDocument $document) => $document->isInternalInvoice());
        $officialInvoices = $activeDocuments->filter(fn (FinanceDocument $document) => $document->isInvoice());
        $internalInvoiceIds = $internalInvoices->keys()->flip();

        $validPayments = $payments->filter(fn (Payment $payment) => $payment->cancelled_at === null);
        $expectedPayments = $validPayments->filter(function (Payment $payment) use ($activeDocuments, $internalInvoiceIds): bool {
            $document = $activeDocuments->get($payment->finance_document_id);

            return $document?->isInternalInvoice()
                || ($document?->isInvoice() && $internalInvoiceIds->has($document->source_document_id));
        });
        $officialPayments = $validPayments->filter(function (Payment $payment) use ($officialInvoices): bool {
            return $officialInvoices->has($payment->finance_document_id);
        });

        $expectedTotal = $this->amount($internalInvoices->sum('total_ttc'));
        $expectedPaidTotal = min($expectedTotal, $this->amount($expectedPayments->sum('amount')));
        $officialInvoicedTotal = $this->amount($officialInvoices->sum('total_ttc'));
        $officialPaidTotal = min($officialInvoicedTotal, $this->amount($officialPayments->sum('amount')));

        return [
            'expectedTotal' => $expectedTotal,
            'expectedPaidTotal' => $expectedPaidTotal,
            'expectedRemainingTotal' => $this->amount(max(0, $expectedTotal - $expectedPaidTotal)),
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
