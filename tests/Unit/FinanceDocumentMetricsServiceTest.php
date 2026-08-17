<?php

namespace Tests\Unit;

use App\Models\FinanceDocument;
use App\Models\Payment;
use App\Services\Finance\FinanceDocumentMetricsService;
use Illuminate\Support\Collection;
use Tests\TestCase;

class FinanceDocumentMetricsServiceTest extends TestCase
{
    public function test_conversion_keeps_expected_and_official_metrics_separate_without_duplicate_payment(): void
    {
        $internal = new FinanceDocument([
            'id' => 10,
            'type' => 'internal_invoice',
            'status' => 'converted',
            'total_ttc' => 1200,
        ]);
        $internal->setAttribute('id', 10);

        $official = new FinanceDocument([
            'id' => 11,
            'type' => 'invoice',
            'status' => 'partially_paid',
            'source_document_id' => 10,
            'total_ttc' => 1200,
        ]);
        $official->setAttribute('id', 11);

        $payment = new Payment([
            'finance_document_id' => 11,
            'amount' => 400,
        ]);

        $metrics = app(FinanceDocumentMetricsService::class)->forDocuments(
            new Collection([$internal, $official]),
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
