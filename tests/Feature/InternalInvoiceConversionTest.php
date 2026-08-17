<?php

namespace Tests\Feature;

use App\Enums\PaymentKind;
use App\Models\Client;
use App\Models\Company;
use App\Models\Dossier;
use App\Models\FinanceDocument;
use App\Models\FinanceDocumentItem;
use App\Models\Payment;
use App\Models\User;
use App\Services\Finance\FinanceDocumentSequenceService;
use App\Services\Finance\InternalInvoiceConversionService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InternalInvoiceConversionTest extends TestCase
{
    use RefreshDatabase;

    public function test_company_sequences_are_independent_and_start_at_zero(): void
    {
        $company = Company::factory()->create();
        $sequences = app(FinanceDocumentSequenceService::class);

        $this->assertSame('000/2026', $sequences->allocate('invoice', $company->id, '2026-01-10'));
        $this->assertSame('001/2026', $sequences->allocate('invoice', $company->id, '2026-02-10'));
        $this->assertSame('000/2026', $sequences->allocate('quote', $company->id, '2026-02-10'));
        $this->assertSame('INT-000/2026', $sequences->allocate('internal_invoice', $company->id, '2026-02-10'));
        $this->assertSame('000/2027', $sequences->allocate('invoice', $company->id, '2027-01-01'));
    }

    public function test_internal_conversion_moves_payment_once_and_preserves_the_source(): void
    {
        $company = Company::factory()->create();
        $client = Client::factory()->create(['company_id' => $company->id, 'branch_id' => null]);
        $dossier = Dossier::factory()->create(['company_id' => $company->id, 'branch_id' => null, 'client_id' => $client->id]);
        $user = User::factory()->create(['company_id' => $company->id, 'branch_id' => null]);

        $internal = FinanceDocument::create([
            'company_id' => $company->id,
            'branch_id' => null,
            'type' => 'internal_invoice',
            'number' => 'INT-000/2026',
            'status' => 'partially_paid',
            'client_id' => $client->id,
            'dossier_id' => $dossier->id,
            'issue_date' => '2026-01-10',
            'currency' => 'MAD',
            'tva_rate' => 0,
            'subtotal_ht' => 100,
            'discount_total' => 0,
            'tax_total' => 0,
            'total_ttc' => 100,
            'paid_total' => 40,
            'remaining_total' => 60,
        ]);
        $internal->items()->save(new FinanceDocumentItem([
            'position' => 1,
            'title' => 'Honoraires',
            'quantity' => 1,
            'unit_price' => 100,
            'total_ht' => 100,
            'total_tva' => 0,
            'total_ttc' => 100,
        ]));
        $payment = Payment::create([
            'company_id' => $company->id,
            'branch_id' => null,
            'finance_document_id' => $internal->id,
            'payment_kind' => PaymentKind::InternalInvoice,
            'client_id' => $client->id,
            'dossier_id' => $dossier->id,
            'payment_number' => 'PAY-2026-0001',
            'amount' => 40,
            'paid_at' => '2026-01-12',
        ]);

        $invoice = app(InternalInvoiceConversionService::class)->convert($internal, $user, [
            'issue_date' => '2026-02-01',
        ]);

        $this->assertSame('invoice', $invoice->type);
        $this->assertSame('000/2026', $invoice->number);
        $this->assertSame(40.0, (float) $invoice->paid_total);
        $this->assertSame(60.0, (float) $invoice->remaining_total);
        $this->assertSame(1, $invoice->items()->count());
        $this->assertSame($invoice->id, $internal->fresh()->converted_to_document_id);
        $this->assertSame('converted', $internal->fresh()->status);
        $this->assertSame($invoice->id, $payment->fresh()->finance_document_id);
        $this->assertSame(PaymentKind::Invoice, $payment->fresh()->payment_kind);
        $this->assertDatabaseHas('payment_document_transfers', [
            'payment_id' => $payment->id,
            'from_finance_document_id' => $internal->id,
            'to_finance_document_id' => $invoice->id,
        ]);
    }
}
