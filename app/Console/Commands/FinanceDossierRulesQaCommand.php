<?php

namespace App\Console\Commands;

use App\Models\Client;
use App\Models\Dossier;
use App\Models\FinanceDocument;
use App\Services\Finance\DossierFinanceEligibilityService;
use App\Services\Finance\FinanceNumberService;
use App\Services\Finance\PaymentLedgerService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class FinanceDossierRulesQaCommand extends Command
{
    protected $signature = 'archilbo:finance-dossier-rules-qa';

    protected $description = 'Verify one active invoice, quote acceptance, and advance payment rules for a dossier.';

    public function handle(DossierFinanceEligibilityService $eligibility, PaymentLedgerService $ledger): int
    {
        $client = Client::query()->whereNotNull('company_id')->first();

        if (! $client) {
            $this->error('No tenant-scoped client found. Run the tenant migration and seed client data first.');

            return self::FAILURE;
        }

        $scope = ['company_id' => $client->company_id, 'branch_id' => $client->branch_id];
        DB::beginTransaction();

        try {
            $dossier = Dossier::create([
                ...$scope,
                'client_id' => $client->id,
                'dossier_number' => 'QA-FIN-' . now()->format('YmdHisv'),
                'project_object' => 'Finance rules QA',
                'status' => 'opened',
                'workflow_step' => 'client',
                'opened_at' => now()->toDateString(),
            ]);

            $advance = $ledger->recordAdvancePayment($dossier, $scope, [
                'amount' => 120,
                'method' => 'cash',
                'paid_at' => now()->toDateString(),
                'notes' => 'QA advance',
            ]);
            $this->assertTrue($advance->finance_document_id === null, 'Advance must remain unlinked before an invoice exists.');
            $this->assertTrue((bool) $advance->receipt_document_id, 'Advance must create a receipt.');
            $this->info('OK direct advance creates a receipt without an invoice.');

            $quote = $this->document($scope, $dossier, 'quote', 'draft', 120);
            $eligibility->assertCanCreateDocument($scope, 'quote', $dossier->id, null, $client->id);
            $this->info('OK multiple quotes are allowed before acceptance.');

            $quote->update(['status' => 'accepted', 'accepted_at' => now()]);
            $this->assertValidation(fn () => $eligibility->assertCanCreateDocument($scope, 'quote', $dossier->id, null, $client->id));
            $this->info('OK an accepted quote blocks a new quote.');

            $invoice = $this->document($scope, $dossier, 'invoice', 'issued', 500);
            $invoice->update([
                'active_invoice_dossier_key' => $eligibility->invoiceGuardKey($scope, 'invoice', $dossier->id, 'issued'),
            ]);
            $ledger->applyPendingAdvancesToInvoice($invoice->fresh());

            $invoice = $invoice->fresh();
            $advance = $advance->fresh();
            $this->assertMoney(120, (float) $invoice->paid_total, 'Invoice must receive the prior advance');
            $this->assertTrue((int) $advance->finance_document_id === (int) $invoice->id, 'Advance must attach to the invoice.');
            $this->assertValidation(fn () => $eligibility->assertCanCreateDocument($scope, 'invoice', $dossier->id, null, $client->id));
            $this->info('OK only one active invoice is allowed per dossier.');

            $ledger->releaseAdvancesFromInvoice($invoice);
            $this->assertTrue($advance->fresh()->finance_document_id === null, 'Advance must be released if its invoice is removed.');
            $this->info('OK cancelling or deleting an invoice can safely release attached advances.');

            DB::rollBack();
            $this->info('Finance dossier rules QA passed.');

            return self::SUCCESS;
        } catch (\Throwable $exception) {
            DB::rollBack();
            $this->error('Finance dossier rules QA failed: ' . $exception->getMessage());

            return self::FAILURE;
        }
    }

    private function document(array $scope, Dossier $dossier, string $type, string $status, float $total): FinanceDocument
    {
        return FinanceDocument::create([
            ...$scope,
            'type' => $type,
            'number' => FinanceNumberService::nextDocumentNumber($type),
            'status' => $status,
            'client_id' => $dossier->client_id,
            'dossier_id' => $dossier->id,
            'issue_date' => now(),
            'due_date' => now()->addDays(30),
            'valid_until' => now()->addDays(30),
            'currency' => 'MAD',
            'tva_rate' => 0,
            'subtotal_ht' => $total,
            'discount_total' => 0,
            'tax_total' => 0,
            'total_ttc' => $total,
            'paid_total' => 0,
            'remaining_total' => $total,
            'notes' => 'Finance rules QA',
            'terms' => 'QA',
        ]);
    }

    private function assertValidation(callable $callback): void
    {
        try {
            $callback();
        } catch (ValidationException) {
            return;
        }

        throw new \RuntimeException('Expected validation error was not raised.');
    }

    private function assertMoney(float $expected, float $actual, string $label): void
    {
        if (round($expected, 2) !== round($actual, 2)) {
            throw new \RuntimeException("{$label}: expected {$expected}, got {$actual}");
        }
    }

    private function assertTrue(bool $condition, string $message): void
    {
        if (! $condition) {
            throw new \RuntimeException($message);
        }
    }
}
