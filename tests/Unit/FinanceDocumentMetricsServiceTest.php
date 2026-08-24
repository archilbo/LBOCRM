<?php

namespace Tests\Unit;

use App\Models\FinanceDocument;
use App\Models\Payment;
use App\Services\Finance\FinanceDocumentMetricsService;
use Illuminate\Support\Collection;
use Tests\TestCase;

class FinanceDocumentMetricsServiceTest extends TestCase
{
    public function test_invoice_metrics_use_the_single_official_invoice_ledger(): void
    {
        $official = new FinanceDocument([
            'id' => 11,
            'type' => 'invoice',
            'status' => 'partially_paid',
            'total_ttc' => 1200,
        ]);
        $official->setAttribute('id', 11);

        $payment = new Payment([
            'finance_document_id' => 11,
            'amount' => 400,
        ]);

        $metrics = app(FinanceDocumentMetricsService::class)->forDocuments(
            new Collection([$official]),
            new Collection([$payment]),
        );

        $this->assertSame(1200.0, $metrics['expectedTotal']);
        $this->assertSame(400.0, $metrics['expectedPaidTotal']);
        $this->assertSame(800.0, $metrics['expectedRemainingTotal']);
        $this->assertSame(1200.0, $metrics['officialInvoicedTotal']);
        $this->assertSame(400.0, $metrics['officialPaidTotal']);
        $this->assertSame(800.0, $metrics['officialBalanceTotal']);
    }
}
