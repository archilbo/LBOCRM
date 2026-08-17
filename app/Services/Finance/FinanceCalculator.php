<?php

namespace App\Services\Finance;

use App\Models\FinanceDocument;

class FinanceCalculator
{
    public static function calculateItemTotals(array $item, float $tvaRate = 0): array
    {
        $quantity = (float) ($item['quantity'] ?? 1);
        $unitPrice = (float) ($item['unit_price'] ?? 0);
        $totalHt = round(max(0, $quantity * $unitPrice), 2);
        $tvaRate = min(100, max(0, $tvaRate));
        $totalTva = round($totalHt * $tvaRate / 100, 2);

        return [
            'quantity' => $quantity,
            'unit_price' => $unitPrice,
            'total_ht' => $totalHt,
            'total_tva' => $totalTva,
            'total_ttc' => round($totalHt + $totalTva, 2),
        ];
    }

    public static function recalculateDocument(FinanceDocument $document): FinanceDocument
    {
        $items = $document->items;

        $document->subtotal_ht = $items->sum('total_ht');
        $document->tax_total = $items->sum('total_tva');
        $document->total_ttc = ($document->subtotal_ht - $document->discount_total) + $document->tax_total;
        $document->remaining_total = $document->total_ttc - $document->paid_total;

        return $document;
    }

    public static function updateInvoicePaymentTotals(FinanceDocument $invoice): FinanceDocument
    {
        $invoice->paid_total = $invoice->payments()->sum('amount');
        $invoice->remaining_total = $invoice->total_ttc - $invoice->paid_total;

        if ($invoice->remaining_total <= 0 && $invoice->total_ttc > 0) {
            $invoice->status = 'paid';
            $invoice->paid_at = $invoice->paid_at ?? now();
        } elseif ($invoice->paid_total > 0 && $invoice->remaining_total > 0) {
            $invoice->status = 'partially_paid';
        } elseif ($invoice->paid_total == 0 && !in_array($invoice->status, ['draft', 'cancelled'])) {
            $invoice->status = 'issued';
        }

        return $invoice;
    }
}
