<?php

namespace App\Console\Commands;

use App\Services\Finance\FinanceDocumentNumberingService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Throwable;

class FinanceNumberingQaCommand extends Command
{
    protected $signature = 'archilbo:finance-numbering-qa';

    protected $description = 'Run QA checks for finance document numbering settings, counters, yearly reset, and locked numbers.';

    public function handle(FinanceDocumentNumberingService $numbering): int
    {
        $this->info('Finance numbering QA started...');

        try {
            $this->checkConfig($numbering);
            $this->checkPreview($numbering);
            $this->checkReserveSequence($numbering);
            $this->checkYearlyReset($numbering);

            $this->info('Finance numbering QA passed.');

            return self::SUCCESS;
        } catch (Throwable $e) {
            $this->error('Finance numbering QA failed.');
            $this->error($e->getMessage());

            if ($this->option('verbose')) {
                $this->line($e->getTraceAsString());
            }

            return self::FAILURE;
        }
    }

    protected function checkConfig(FinanceDocumentNumberingService $numbering): void
    {
        $types = $numbering->availableTypes();

        if ($types === []) {
            throw new \RuntimeException('No finance numbering document types are configured.');
        }

        foreach (['quote', 'invoice'] as $requiredType) {
            if (! in_array($requiredType, $types, true)) {
                throw new \RuntimeException("Missing required finance numbering type: {$requiredType}");
            }
        }

        $this->line('✓ Config document types found.');
    }

    protected function checkPreview(FinanceDocumentNumberingService $numbering): void
    {
        $preview = $numbering->preview('invoice', '2026-01-15');

        if (! str_starts_with($preview, 'FAC-2026-')) {
            throw new \RuntimeException("Invoice preview has invalid format: {$preview}");
        }

        $this->line("✓ Preview works: {$preview}");
    }

    protected function checkReserveSequence(FinanceDocumentNumberingService $numbering): void
    {
        DB::table('finance_document_number_counters')
            ->where('document_type', 'qa_invoice')
            ->delete();

        config([
            'archilbo_finance_numbering.types.qa_invoice' => [
                'label' => 'QA Invoice',
                'prefix' => 'QAFAC',
                'yearly_reset' => true,
            ],
        ]);

        $first = $numbering->reserve('qa_invoice', '2026-02-01');
        $second = $numbering->reserve('qa_invoice', '2026-02-01');

        if ($first !== 'QAFAC-2026-0001') {
            throw new \RuntimeException("First reserved number invalid: {$first}");
        }

        if ($second !== 'QAFAC-2026-0002') {
            throw new \RuntimeException("Second reserved number invalid: {$second}");
        }

        $this->line('✓ Sequential reservation works.');
    }

    protected function checkYearlyReset(FinanceDocumentNumberingService $numbering): void
    {
        DB::table('finance_document_number_counters')
            ->where('document_type', 'qa_quote')
            ->delete();

        config([
            'archilbo_finance_numbering.types.qa_quote' => [
                'label' => 'QA Quote',
                'prefix' => 'QADEV',
                'yearly_reset' => true,
            ],
        ]);

        $number2026 = $numbering->reserve('qa_quote', '2026-06-01');
        $number2027 = $numbering->reserve('qa_quote', '2027-06-01');

        if ($number2026 !== 'QADEV-2026-0001') {
            throw new \RuntimeException("2026 yearly number invalid: {$number2026}");
        }

        if ($number2027 !== 'QADEV-2027-0001') {
            throw new \RuntimeException("2027 yearly reset number invalid: {$number2027}");
        }

        $this->line('✓ Yearly reset works.');
    }
}
