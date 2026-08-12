<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\Company;
use App\Models\Dossier;
use App\Models\FinanceActivityLog;
use App\Models\FinanceDocument;
use App\Models\Intermediary;
use App\Models\User;
use App\Services\Finance\IntermediaryPaymentService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class IntermediaryPaymentTest extends TestCase
{
    use RefreshDatabase;

    public function test_payment_is_allocated_oldest_invoice_first_and_can_be_cancelled(): void
    {
        $company = Company::factory()->create();
        $user = User::factory()->create(['company_id' => $company->id, 'branch_id' => null]);
        $intermediary = Intermediary::create(['company_id' => $company->id, 'code' => 'INT-PAY-01', 'name' => 'Intermediaire', 'type' => 'person', 'is_active' => true]);
        $client = Client::factory()->create(['company_id' => $company->id, 'branch_id' => null]);
        $first = Dossier::factory()->create(['company_id' => $company->id, 'branch_id' => null, 'client_id' => $client->id, 'intermediary_id' => $intermediary->id]);
        $second = Dossier::factory()->create(['company_id' => $company->id, 'branch_id' => null, 'client_id' => $client->id, 'intermediary_id' => $intermediary->id]);
        Dossier::factory()->create(['company_id' => $company->id, 'branch_id' => null, 'client_id' => $client->id, 'intermediary_id' => $intermediary->id]);
        $invoiceA = $this->invoice($company, $client, $first, 'FAC-TEST-001', 500, '2026-01-01');
        $invoiceB = $this->invoice($company, $client, $second, 'FAC-TEST-002', 600, '2026-01-02');

        $service = app(IntermediaryPaymentService::class);
        $batch = $service->record($intermediary, $user, ['amount' => 600, 'paid_at' => '2026-02-01', 'method' => 'bank_transfer', 'reference' => 'VIR-TEST-01', 'notes' => 'Paiement groupe']);

        $this->assertDatabaseCount('intermediary_payment_allocations', 2);
        $this->assertDatabaseHas('intermediary_payment_allocations', ['intermediary_payment_batch_id' => $batch->id, 'finance_document_id' => $invoiceA->id, 'amount' => 500]);
        $this->assertDatabaseHas('intermediary_payment_allocations', ['intermediary_payment_batch_id' => $batch->id, 'finance_document_id' => $invoiceB->id, 'amount' => 100]);
        $this->assertSame('0.00', $invoiceA->fresh()->remaining_total);
        $this->assertSame('500.00', $invoiceB->fresh()->remaining_total);
        $this->assertDatabaseHas('payments', ['finance_document_id' => $invoiceA->id, 'method' => 'bank_transfer', 'reference' => 'VIR-TEST-01', 'notes' => 'Paiement groupe']);
        $this->assertDatabaseHas('payments', ['finance_document_id' => $invoiceB->id, 'method' => 'bank_transfer', 'reference' => 'VIR-TEST-01', 'notes' => 'Paiement groupe']);

        $finance = $service->data($intermediary, $user);
        $this->assertSame(3, $finance['summary']['projectsCount']);
        $this->assertSame(1100.0, $finance['summary']['invoiced']);
        $this->assertSame(600.0, $finance['summary']['paid']);
        $this->assertCount(3, $finance['projects']);
        $this->assertSame('no_invoice', $finance['projects']->firstWhere('invoicesCount', 0)['status']);
        $this->assertDatabaseHas('finance_activity_logs', [
            'company_id' => $company->id,
            'user_id' => $user->id,
            'subject_type' => $batch->getMorphClass(),
            'subject_id' => $batch->id,
            'action' => 'finance.intermediary_payment.recorded',
        ]);

        $this->assertTrue($service->cancel($batch, $intermediary, $user, 'Erreur de saisie'));
        $this->assertFalse($service->cancel($batch, $intermediary, $user, 'Nouvelle tentative'));
        $this->assertSame('500.00', $invoiceA->fresh()->remaining_total);
        $this->assertSame('600.00', $invoiceB->fresh()->remaining_total);
        $this->assertNotNull($batch->fresh()->cancelled_at);
        $this->assertDatabaseHas('finance_activity_logs', [
            'company_id' => $company->id,
            'user_id' => $user->id,
            'subject_type' => $batch->getMorphClass(),
            'subject_id' => $batch->id,
            'action' => 'finance.intermediary_payment.cancelled',
        ]);
        $this->assertSame(2, FinanceActivityLog::query()->where('subject_id', $batch->id)->count());
    }

    private function invoice(Company $company, Client $client, Dossier $dossier, string $number, int $amount, string $date): FinanceDocument
    {
        return FinanceDocument::create(['company_id' => $company->id, 'branch_id' => null, 'type' => 'invoice', 'number' => $number, 'status' => 'issued', 'client_id' => $client->id, 'dossier_id' => $dossier->id, 'issue_date' => $date, 'currency' => 'MAD', 'total_ttc' => $amount, 'paid_total' => 0, 'remaining_total' => $amount]);
    }
}
