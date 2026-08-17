<?php

namespace App\Console\Commands;

use App\Models\Client;
use App\Models\Dossier;
use App\Models\FinanceDocument;
use App\Models\FinanceDocumentItem;
use App\Models\Payment;
use App\Services\Finance\FinanceCalculator;
use App\Services\Finance\FinanceNumberService;
use App\Services\Finance\FinanceSettingsService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class TestFinanceBuilderCommand extends Command
{
    protected $signature = 'archilbo:test-finance-builder';
    protected $description = 'Test the finance builder backend';

    public function handle(): int
    {
        $this->info('=== Finance Builder Backend Test ===');
        $this->newLine();

        $client = Client::first();
        if (!$client) {
            $this->warn('No client found! Please create a client first.');
            return Command::FAILURE;
        }
        $this->info('✅ Client found: ' . $client->full_name);

        $dossier = Dossier::first();
        if ($dossier) {
            $this->info('✅ Dossier found: ' . $dossier->dossier_number);
        }

        $this->info('');

        try {
            DB::beginTransaction();

            $this->info('1. Creating a quote...');
            $quote = $this->createTestQuote($client, $dossier);
            $this->info('   ✅ Quote created: ' . $quote->number);
            $this->info("      - Subtotal HT: {$quote->subtotal_ht}");
            $this->info("      - Tax total: {$quote->tax_total}");
            $this->info("      - Total TTC: {$quote->total_ttc}");

            $this->info('');

            $this->info('2. Converting quote to invoice...');
            $invoice = $this->convertQuoteToInvoice($quote);
            $this->info('   ✅ Invoice created: ' . $invoice->number);
            $this->info("      - Status: {$invoice->status}");

            $this->info('');

            $this->info('3. Recording partial payment (50%)...');
            $partialAmount = $invoice->total_ttc / 2;
            $payment1 = $this->createTestPayment($invoice, $partialAmount);
            $this->info("   ✅ Payment recorded: {$payment1->payment_number} ({$partialAmount} MAD)");
            $invoice->refresh();
            $this->info("      - Invoice paid total: {$invoice->paid_total}");
            $this->info("      - Remaining: {$invoice->remaining_total}");
            $this->info("      - Status: {$invoice->status}");

            if ($invoice->status !== 'partially_paid') {
                throw new \Exception('Invoice status should be partially_paid!');
            }

            $this->info('');

            $this->info('4. Recording remaining payment...');
            $remainingAmount = $invoice->remaining_total;
            $payment2 = $this->createTestPayment($invoice, $remainingAmount);
            $this->info("   ✅ Payment recorded: {$payment2->payment_number} ({$remainingAmount} MAD)");
            $invoice->refresh();
            $this->info("      - Invoice paid total: {$invoice->paid_total}");
            $this->info("      - Remaining: {$invoice->remaining_total}");
            $this->info("      - Status: {$invoice->status}");

            if ($invoice->status !== 'paid') {
                throw new \Exception('Invoice status should be paid!');
            }

            DB::rollBack();
            $this->info('');
            $this->info('✅ All tests passed! Rolled back test data.');
        } catch (\Exception $e) {
            DB::rollBack();
            $this->error('❌ Test failed: ' . $e->getMessage());
            $this->error('   Stack trace: ' . $e->getTraceAsString());
            return Command::FAILURE;
        }

        $this->info('');
        $this->info('=== Test Complete ===');
        return Command::SUCCESS;
    }

    private function createTestQuote(Client $client, ?Dossier $dossier): FinanceDocument
    {
        $number = FinanceNumberService::nextDocumentNumber('quote');

        $document = FinanceDocument::create([
            'type' => 'quote',
            'number' => $number,
            'status' => 'draft',
            'client_id' => $client->id,
            'dossier_id' => $dossier?->id,
            'issue_date' => now(),
            'due_date' => now()->addDays(30),
            'valid_until' => now()->addDays(30),
            'currency' => FinanceSettingsService::getCurrency(),
            'tva_rate' => FinanceSettingsService::getTvaRate(),
            'notes' => 'Test quote',
            'terms' => 'Payment on receipt',
        ]);

        $item1 = new FinanceDocumentItem([
            'position' => 1,
            'title' => 'Design services',
            'quantity' => 1,
            'unit' => 'hrs',
            'unit_price' => 1000,
        ]);
        $item1->calculateTotals((float) $document->tva_rate);
        $document->items()->save($item1);

        $item2 = new FinanceDocumentItem([
            'position' => 2,
            'title' => 'Consulting',
            'quantity' => 2,
            'unit' => 'hrs',
            'unit_price' => 500,
        ]);
        $item2->calculateTotals((float) $document->tva_rate);
        $document->items()->save($item2);

        FinanceCalculator::recalculateDocument($document);
        $document->save();

        return $document;
    }

    private function convertQuoteToInvoice(FinanceDocument $quote): FinanceDocument
    {
        $invoiceNumber = FinanceNumberService::nextDocumentNumber('invoice');

        $invoice = FinanceDocument::create([
            'type' => 'invoice',
            'number' => $invoiceNumber,
            'status' => 'issued',
            'client_id' => $quote->client_id,
            'dossier_id' => $quote->dossier_id,
            'source_document_id' => $quote->id,
            'issue_date' => now(),
            'due_date' => now()->addDays(30),
            'currency' => $quote->currency,
            'tva_rate' => $quote->tva_rate,
            'subtotal_ht' => $quote->subtotal_ht,
            'tax_total' => $quote->tax_total,
            'total_ttc' => $quote->total_ttc,
            'remaining_total' => $quote->total_ttc,
            'notes' => 'Test invoice from quote',
            'terms' => $quote->terms,
        ]);

        foreach ($quote->items as $item) {
            $newItem = $item->replicate();
            $newItem->finance_document_id = $invoice->id;
            $newItem->save();
        }

        $quote->update(['status' => 'converted']);

        return $invoice;
    }

    private function createTestPayment(FinanceDocument $invoice, float $amount): Payment
    {
        $payment = Payment::create([
            'finance_document_id' => $invoice->id,
            'client_id' => $invoice->client_id,
            'dossier_id' => $invoice->dossier_id,
            'payment_number' => FinanceNumberService::nextPaymentNumber(),
            'amount' => $amount,
            'method' => 'bank_transfer',
            'reference' => 'TEST-' . uniqid(),
            'paid_at' => now(),
        ]);

        FinanceCalculator::updateInvoicePaymentTotals($invoice);
        $invoice->save();

        return $payment;
    }
}
