<?php

namespace App\Console\Commands;

use App\Models\Client;
use App\Models\Dossier;
use App\Models\FinanceDocument;
use App\Services\Finance\FinanceNumberService;
use App\Services\Finance\PaymentLedgerService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class FinancePaymentLedgerReceiptQaCommand extends Command
{
    protected $signature = 'archilbo:finance-payment-ledger-receipt-qa';
    protected $description = 'Verify invoice payments subtract from remaining total and create linked receipts.';

    public function handle(PaymentLedgerService $ledger): int
    {
        $this->info('Finance payment ledger + receipt QA started...');

        $client = Client::first();
        $dossier = Dossier::first();

        if (! $client) {
            $this->error('No client found. Seed/create a client first.');
            return Command::FAILURE;
        }

        DB::beginTransaction();

        try {
            $invoice = FinanceDocument::create([
                'type' => 'invoice',
                'number' => FinanceNumberService::nextDocumentNumber('invoice'),
                'status' => 'issued',
                'client_id' => $client->id,
                'dossier_id' => $dossier?->id,
                'issue_date' => now(),
                'due_date' => now()->addDays(30),
                'currency' => 'MAD',
                'tva_rate' => 20,
                'subtotal_ht' => 416.67,
                'discount_total' => 0,
                'tax_total' => 83.33,
                'total_ttc' => 500,
                'paid_total' => 0,
                'remaining_total' => 500,
                'notes' => 'QA invoice',
                'terms' => 'Payment on receipt',
            ]);

            $payment1 = $ledger->recordPayment($invoice, [
                'amount' => 200,
                'method' => 'cash',
                'reference' => 'QA-PAY-001',
                'paid_at' => now()->toDateString(),
                'notes' => 'First partial payment',
            ]);

            $invoice = $invoice->fresh();

            $this->assertMoney(200, (float) $invoice->paid_total, 'Paid total after first payment');
            $this->assertMoney(300, (float) $invoice->remaining_total, 'Remaining after first payment');
            $this->assertTrue($invoice->status === 'partially_paid', 'Invoice should be partially_paid.');
            $this->assertTrue((bool) $payment1->receipt_document_id, 'First payment should have receipt.');

            $receipt1 = $payment1->receiptDocument;
            $this->assertTrue($receipt1 && $receipt1->type === 'receipt', 'Receipt document type should be receipt.');
            $this->assertMoney(200, (float) $receipt1->total_ttc, 'Receipt amount should match payment.');

            $this->info("OK partial payment: 500 - 200 = {$invoice->remaining_total}. Receipt {$receipt1->number}");

            try {
                $ledger->recordPayment($invoice, [
                    'amount' => 400,
                    'method' => 'cash',
                    'reference' => 'QA-OVERPAY',
                    'paid_at' => now()->toDateString(),
                ]);

                throw new \RuntimeException('Overpayment was not blocked.');
            } catch (ValidationException) {
                $this->info('OK overpayment blocked.');
            }

            $payment2 = $ledger->recordPayment($invoice->fresh(), [
                'amount' => 300,
                'method' => 'bank_transfer',
                'reference' => 'QA-PAY-002',
                'paid_at' => now()->toDateString(),
                'notes' => 'Final payment',
            ]);

            $invoice = $invoice->fresh();

            $this->assertMoney(500, (float) $invoice->paid_total, 'Paid total after final payment');
            $this->assertMoney(0, (float) $invoice->remaining_total, 'Remaining after final payment');
            $this->assertTrue($invoice->status === 'paid', 'Invoice should be paid.');
            $this->assertTrue((bool) $payment2->receipt_document_id, 'Second payment should have receipt.');

            $this->info("OK full payment: paid_total {$invoice->paid_total}, remaining {$invoice->remaining_total}, status {$invoice->status}.");

            $ledger->deletePayment($payment2->fresh());

            $invoice = $invoice->fresh();

            $this->assertMoney(200, (float) $invoice->paid_total, 'Paid total after deleting final payment');
            $this->assertMoney(300, (float) $invoice->remaining_total, 'Remaining after deleting final payment');
            $this->assertTrue($invoice->status === 'partially_paid', 'Invoice should return to partially_paid.');

            $this->info('OK deleting payment recalculates invoice back to partially_paid.');

            DB::rollBack();

            $this->info('Finance payment ledger + receipt QA passed.');
            return Command::SUCCESS;
        } catch (\Throwable $e) {
            DB::rollBack();

            $this->error('Finance payment ledger + receipt QA failed: ' . $e->getMessage());
            $this->line($e->getTraceAsString());

            return Command::FAILURE;
        }
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