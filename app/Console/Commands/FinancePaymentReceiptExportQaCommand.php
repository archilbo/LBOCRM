<?php

namespace App\Console\Commands;

use App\Models\Client;
use App\Models\Dossier;
use App\Models\FinanceDocument;
use App\Services\Finance\FinanceExcelExporter;
use App\Services\Finance\FinanceNumberService;
use App\Services\Finance\FinancePdfGenerator;
use App\Services\Finance\PaymentLedgerService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class FinancePaymentReceiptExportQaCommand extends Command
{
    protected $signature = 'archilbo:finance-payment-receipt-export-qa';
    protected $description = 'Verify payment receipt document can generate printable PDF and Excel exports.';

    public function handle(
        PaymentLedgerService $ledger,
        FinancePdfGenerator $pdfGenerator,
        FinanceExcelExporter $excelExporter
    ): int {
        $this->info('Finance payment receipt export QA started...');

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
                'notes' => 'QA invoice for receipt export',
                'terms' => 'Payment on receipt',
            ]);

            $payment = $ledger->recordPayment($invoice, [
                'amount' => 200,
                'method' => 'cash',
                'reference' => 'QA-RECEIPT-EXPORT',
                'paid_at' => now()->toDateString(),
                'notes' => 'Receipt export QA payment',
            ])->fresh(['receiptDocument']);

            $receipt = $payment->receiptDocument;

            if (! $receipt) {
                throw new \RuntimeException('Payment has no receipt document.');
            }

            if ($receipt->type !== 'receipt') {
                throw new \RuntimeException('Receipt document type is not receipt.');
            }

            $this->line("Payment: {$payment->payment_number}");
            $this->line("Receipt: {$receipt->number}");

            $pdfPath = $pdfGenerator->generate($receipt);
            $excelPath = $excelExporter->generate($receipt);

            $receipt = $receipt->fresh();

            if (! $pdfPath) {
                throw new \RuntimeException('PDF generator returned empty path.');
            }

            if (! $excelPath) {
                throw new \RuntimeException('Excel exporter returned empty path.');
            }

            $pdfLocation = $this->findGeneratedFile($pdfPath, $receipt->storage_disk ?? 'local');
            $excelLocation = $this->findGeneratedFile($excelPath, $receipt->storage_disk ?? 'local');

            if (! $pdfLocation) {
                throw new \RuntimeException("Receipt PDF file not found in known storage locations: {$pdfPath}");
            }

            if (! $excelLocation) {
                throw new \RuntimeException("Receipt Excel file not found in known storage locations: {$excelPath}");
            }

            $this->table(
                ['Receipt', 'Amount', 'PDF', 'Excel'],
                [[
                    $receipt->number,
                    number_format((float) $receipt->total_ttc, 2),
                    $pdfLocation,
                    $excelLocation,
                ]]
            );

            DB::rollBack();

            $this->info('Finance payment receipt export QA passed.');
            return Command::SUCCESS;
        } catch (\Throwable $e) {
            DB::rollBack();

            $this->error('Finance payment receipt export QA failed: ' . $e->getMessage());
            $this->line($e->getTraceAsString());

            return Command::FAILURE;
        }
    }

    private function findGeneratedFile(string $path, string $disk): ?string
    {
        $path = ltrim($path, '/\\');

        $checks = [
            ['label' => "disk:{$disk}", 'exists' => fn () => Storage::disk($disk)->exists($path)],
            ['label' => 'disk:local', 'exists' => fn () => Storage::disk('local')->exists($path)],
            ['label' => 'disk:public', 'exists' => fn () => Storage::disk('public')->exists($path)],
            ['label' => 'storage/app', 'exists' => fn () => file_exists(storage_path('app/' . $path))],
            ['label' => 'storage/app/private', 'exists' => fn () => file_exists(storage_path('app/private/' . $path))],
            ['label' => 'storage/app/public', 'exists' => fn () => file_exists(storage_path('app/public/' . $path))],
            ['label' => 'public/storage', 'exists' => fn () => file_exists(public_path('storage/' . $path))],
        ];

        foreach ($checks as $check) {
            try {
                if (($check['exists'])()) {
                    return $check['label'] . ':' . $path;
                }
            } catch (\Throwable) {
                // Continue checking other locations.
            }
        }

        return null;
    }
}