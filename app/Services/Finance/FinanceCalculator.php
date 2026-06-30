<?php

namespace App\Services\Finance;

use App\Models\FinanceDocument;
use App\Models\FinanceDocumentItem;
use App\Services\Finance\FinanceSettingsService;

class FinanceCalculator
{
    public static function calculateItemTotals(array $item, float $defaultTvaRate): array
    {
        $quantity = $item['quantity'] ?? 1;
        $unitPrice = $item['unit_price'] ?? 0;
        $discountRate = $item['discount_rate'] ?? 0;
        $tvaRate = $item['tva_rate'] ?? $defaultTvaRate;

        $grossHt = $quantity * $unitPrice;
        $discountAmount = $grossHt * $discountRate / 100;
        $totalHt = $grossHt - $discountAmount;
        $totalTva = $totalHt * $tvaRate / 100;
        $totalTtc = $totalHt + $totalTva;

        return [
            'quantity' => $quantity,
            'unit_price' => $unitPrice,
            'discount_rate' => $discountRate,
            'tva_rate' => $tvaRate,
            'total_ht' => $totalHt,
            'total_tva' => $totalTva,
            'total_ttc' => $totalTtc,
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
