<?php

namespace App\Console\Commands;

use App\Http\Resources\PaymentResource;
use App\Models\Client;
use App\Models\Dossier;
use App\Models\FinanceDocument;
use App\Services\Finance\FinanceNumberService;
use App\Services\Finance\PaymentLedgerService;
use Illuminate\Console\Command;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FinancePaymentReceiptPayloadQaCommand extends Command
{
    protected $signature = 'archilbo:finance-payment-receipt-payload-qa';
    protected $description = 'Verify payment resource exposes linked receipt document and receipt URLs.';

    public function handle(PaymentLedgerService $ledger): int
    {
        $this->info('Finance payment receipt payload QA started...');

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
                'notes' => 'QA invoice for receipt payload',
                'terms' => 'Payment on receipt',
            ]);

            $payment = $ledger->recordPayment($invoice, [
                'amount' => 200,
                'method' => 'cash',
                'reference' => 'QA-RECEIPT-PAYLOAD',
                'paid_at' => now()->toDateString(),
                'notes' => 'Payload QA payment',
            ]);

            $payment = $payment->fresh(['document', 'client', 'dossier', 'receiptDocument']);

            if (! $payment->receipt_document_id) {
                throw new \RuntimeException('Payment has no receipt_document_id.');
            }

            if (! $payment->receiptDocument) {
                throw new \RuntimeException('Payment receiptDocument relation missing.');
            }

            if ($payment->receiptDocument->type !== 'receipt') {
                throw new \RuntimeException('Linked document is not type receipt.');
            }

            $payload = (new PaymentResource($payment))->toArray(Request::create('/'));

            if (empty($payload['receipt']['id'])) {
                throw new \RuntimeException('PaymentResource missing receipt.id.');
            }

            if (empty($payload['receipt']['number'])) {
                throw new \RuntimeException('PaymentResource missing receipt.number.');
            }

            if ((float) $payload['receipt']['amount'] !== 200.0) {
                throw new \RuntimeException('PaymentResource receipt amount is wrong.');
            }

            if (! array_key_exists('urls', $payload['receipt'])) {
                throw new \RuntimeException('PaymentResource receipt urls missing.');
            }

            $this->table(
                ['Payment', 'Amount', 'Invoice', 'Receipt', 'Receipt Type'],
                [[
                    $payment->payment_number,
                    number_format((float) $payment->amount, 2),
                    $payment->document?->number,
                    $payment->receiptDocument?->number,
                    $payment->receiptDocument?->type,
                ]]
            );

            DB::rollBack();

            $this->info('Finance payment receipt payload QA passed.');
            return Command::SUCCESS;
        } catch (\Throwable $e) {
            DB::rollBack();

            $this->error('Finance payment receipt payload QA failed: ' . $e->getMessage());
            $this->line($e->getTraceAsString());

            return Command::FAILURE;
        }
    }
}