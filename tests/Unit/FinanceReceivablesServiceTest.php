<?php

namespace Tests\Unit;

use App\Models\FinanceDocument;
use App\Models\Payment;
use App\Services\Finance\FinanceReceivablesService;
use Carbon\CarbonImmutable;
use Tests\TestCase;

class FinanceReceivablesServiceTest extends TestCase
{
    public function test_it_derives_outstanding_due_state_and_aging_from_valid_payments(): void
    {
        $invoice = new FinanceDocument([
            'type' => 'invoice',
            'total_ttc' => 10000,
            'due_date' => '2026-08-09',
        ]);
        $invoice->setRelation('payments', collect([
            new Payment(['amount' => 3000]),
            new Payment(['amount' => 7000]),
        ]));

        $summary = app(FinanceReceivablesService::class)->forInvoice($invoice, CarbonImmutable::parse('2026-08-10'));

        $this->assertSame(10000.0, $summary['total']);
        $this->assertSame(10000.0, $summary['paid']);
        $this->assertSame(0.0, $summary['outstanding']);
        $this->assertSame('paid', $summary['dueState']);
        $this->assertSame(0, $summary['daysOverdue']);
        $this->assertSame(FinanceReceivablesService::AGING_CURRENT, $summary['agingBucket']);
    }

    public function test_it_marks_an_unpaid_invoice_overdue_using_date_semantics(): void
    {
        $invoice = new FinanceDocument([
            'type' => 'invoice',
            'total_ttc' => 10000,
            'due_date' => '2026-08-09',
        ]);
        $invoice->setRelation('payments', collect([new Payment(['amount' => 3000])]));

        $summary = app(FinanceReceivablesService::class)->forInvoice($invoice, CarbonImmutable::parse('2026-08-10 23:59:59'));

        $this->assertSame(7000.0, $summary['outstanding']);
        $this->assertSame('overdue', $summary['dueState']);
        $this->assertSame(1, $summary['daysOverdue']);
        $this->assertSame(FinanceReceivablesService::AGING_1_7, $summary['agingBucket']);
    }
}
