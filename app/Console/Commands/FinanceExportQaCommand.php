<?php

namespace App\Console\Commands;

use App\Models\FinanceDocument;
use App\Services\Finance\FinanceExcelExporter;
use App\Services\Finance\FinancePdfGenerator;
use App\Services\Finance\FinanceSettingsService;
use App\Services\Finance\FinanceFileStorageService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use PhpOffice\PhpSpreadsheet\IOFactory;
use Throwable;

class FinanceExportQaCommand extends Command
{
    protected $signature = 'archilbo:finance-export-qa
        {document_id? : Optional finance document id}
        {--create-sample : Try to create sample quote and invoice documents if no documents exist}';

    protected $description = 'Generate and verify finance PDF/XLSX exports.';

    public function handle(): int
    {
        $this->info('ARCHI LBO finance export QA');

        if (!class_exists(FinanceDocument::class)) {
            $this->error('FinanceDocument model is missing.');
            return self::FAILURE;
        }

        if (!class_exists(FinancePdfGenerator::class)) {
            $this->error('FinancePdfGenerator service is missing.');
            return self::FAILURE;
        }

        if (!class_exists(FinanceExcelExporter::class)) {
            $this->error('FinanceExcelExporter service is missing.');
            return self::FAILURE;
        }

        if (!Schema::hasTable('finance_documents')) {
            $this->error('finance_documents table is missing.');
            return self::FAILURE;
        }

        if ($this->option('create-sample') && FinanceDocument::query()->count() === 0) {
            $this->warn('No finance documents found. Trying to create sample documents...');
            $this->createSampleDocuments();
        }

        $documentId = $this->argument('document_id');

        $documents = $documentId
            ? FinanceDocument::query()->whereKey($documentId)->get()
            : FinanceDocument::query()->latest('id')->limit(3)->get();

        if ($documents->isEmpty()) {
            $this->warn('No finance documents found. Create one in /finance, then run this command again.');
            return self::SUCCESS;
        }

        $failures = 0;

        foreach ($documents as $document) {
            $failures += $this->checkDocument($document);
        }

        if ($failures > 0) {
            $this->error("Finance export QA finished with {$failures} issue(s).");
            return self::FAILURE;
        }

        $this->info('Finance export QA passed.');
        return self::SUCCESS;
    }

    private function checkDocument(FinanceDocument $document): int
    {
        $failures = 0;

        $label = '#' . $document->id . ' ' . ($document->number ?? $document->document_number ?? 'NO-NUMBER');

        $this->line('');
        $this->line('<fg=cyan>Checking finance document ' . $label . '</>');

        try {
            $document->loadMissing(['items', 'payments', 'client', 'dossier', 'template']);
        } catch (Throwable) {
            // Some older relation names may not exist. Export services will decide.
        }

        $failures += $this->checkPdf($document);
        $failures += $this->checkExcel($document);

        return $failures;
    }

    private function checkPdf(FinanceDocument $document): int
    {
        try {
            $path = app(FinancePdfGenerator::class)->generate($document);
            $document->refresh();

            $path = $path ?: ($document->pdf_path ?? null);

            if (!$path) {
                return $this->qaFail('PDF generator did not return or save a path.');
            }

            $disk = app(FinanceFileStorageService::class)->disk();
            if (!$disk->exists($path)) {
                return $this->qaFail("PDF file does not exist on private disk: {$path}");
            }

            $absolutePath = $disk->path($path);
            $size = filesize($absolutePath) ?: 0;

            if ($size < 100) {
                return $this->qaFail("PDF file is too small: {$path}");
            }

            $handle = fopen($absolutePath, 'rb');
            $signature = $handle ? fread($handle, 4) : '';
            if ($handle) {
                fclose($handle);
            }

            if ($signature !== '%PDF') {
                return $this->qaFail("PDF signature is invalid: {$path}");
            }

            if ($document->pdf_checksum && hash_file('sha256', $absolutePath) !== $document->pdf_checksum) {
                return $this->qaFail("PDF checksum does not match: {$path}");
            }

            $this->line('<fg=green>PASS</> PDF generated: ' . $path . ' (' . $size . ' bytes)');
            return 0;
        } catch (Throwable $exception) {
            return $this->qaFail('PDF export failed: ' . $exception->getMessage());
        }
    }

    private function checkExcel(FinanceDocument $document): int
    {
        try {
            $path = app(FinanceExcelExporter::class)->generate($document);
            $document->refresh();

            $path = $path ?: ($document->excel_path ?? null);

            if (!$path) {
                return $this->qaFail('Excel exporter did not return or save a path.');
            }

            $disk = app(FinanceFileStorageService::class)->disk();
            if (!$disk->exists($path)) {
                return $this->qaFail("XLSX file does not exist on private disk: {$path}");
            }

            $absolutePath = $disk->path($path);
            $size = filesize($absolutePath) ?: 0;

            if ($size < 100) {
                return $this->qaFail("XLSX file is too small: {$path}");
            }

            $handle = fopen($absolutePath, 'rb');
            $signature = $handle ? fread($handle, 2) : '';
            if ($handle) {
                fclose($handle);
            }

            if ($signature !== 'PK') {
                return $this->qaFail("XLSX signature is invalid. It must start with PK: {$path}");
            }

            IOFactory::load($absolutePath);

            if ($document->excel_checksum && hash_file('sha256', $absolutePath) !== $document->excel_checksum) {
                return $this->qaFail("XLSX checksum does not match: {$path}");
            }

            $this->line('<fg=green>PASS</> Excel generated: ' . $path . ' (' . $size . ' bytes)');
            return 0;
        } catch (Throwable $exception) {
            return $this->qaFail('Excel export failed: ' . $exception->getMessage());
        }
    }

    private function createSampleDocuments(): void
    {
        if (!Schema::hasTable('finance_documents')) {
            return;
        }

        try {
            $this->createSampleDocument('quote');
            $this->createSampleDocument('invoice');
        } catch (Throwable $exception) {
            $this->warn('Could not create sample finance documents automatically: ' . $exception->getMessage());
        }
    }

    private function createSampleDocument(string $type): void
    {
        $documentColumns = Schema::getColumnListing('finance_documents');
        $itemColumns = Schema::hasTable('finance_document_items')
            ? Schema::getColumnListing('finance_document_items')
            : [];

        $currency = FinanceSettingsService::getCurrency();
        $number = ($type === 'invoice' ? 'FAC' : 'DEV') . '-QA-' . now()->format('YmdHis');

        $data = [];

        $this->putIfColumn($data, $documentColumns, 'type', $type);
        $this->putIfColumn($data, $documentColumns, 'status', 'draft');
        $this->putIfColumn($data, $documentColumns, 'number', $number);
        $this->putIfColumn($data, $documentColumns, 'document_number', $number);
        $this->putIfColumn($data, $documentColumns, 'currency', $currency);
        $this->putIfColumn($data, $documentColumns, 'issue_date', now()->toDateString());
        $this->putIfColumn($data, $documentColumns, 'due_date', now()->addDays(30)->toDateString());
        $this->putIfColumn($data, $documentColumns, 'valid_until', now()->addDays(30)->toDateString());
        $this->putIfColumn($data, $documentColumns, 'notes', 'QA document generated automatically.');
        $this->putIfColumn($data, $documentColumns, 'terms', 'QA terms.');
        $this->putIfColumn($data, $documentColumns, 'subtotal_ht', 10000);
        $this->putIfColumn($data, $documentColumns, 'discount_total', 0);
        $this->putIfColumn($data, $documentColumns, 'tax_total', 2000);
        $this->putIfColumn($data, $documentColumns, 'total_ttc', 12000);
        $this->putIfColumn($data, $documentColumns, 'paid_total', 0);
        $this->putIfColumn($data, $documentColumns, 'remaining_total', 12000);

        if (in_array('client_id', $documentColumns, true) && Schema::hasTable('clients')) {
            $clientId = DB::table('clients')->value('id');
            if ($clientId) {
                $data['client_id'] = $clientId;
            }
        }

        if (in_array('dossier_id', $documentColumns, true) && Schema::hasTable('dossiers')) {
            $dossierId = DB::table('dossiers')->value('id');
            if ($dossierId) {
                $data['dossier_id'] = $dossierId;
            }
        }

        if (in_array('template_id', $documentColumns, true) && Schema::hasTable('document_templates')) {
            $templateId = DB::table('document_templates')
                ->where('type', $type)
                ->where('is_default', true)
                ->value('id');

            if ($templateId) {
                $data['template_id'] = $templateId;
            }
        }

        if (in_array('created_at', $documentColumns, true)) {
            $data['created_at'] = now();
        }

        if (in_array('updated_at', $documentColumns, true)) {
            $data['updated_at'] = now();
        }

        $documentId = DB::table('finance_documents')->insertGetId($data);

        if (!$itemColumns) {
            return;
        }

        $fk = in_array('finance_document_id', $itemColumns, true)
            ? 'finance_document_id'
            : (in_array('document_id', $itemColumns, true) ? 'document_id' : null);

        if (!$fk) {
            return;
        }

        $items = [
            [
                'title' => 'Etudes architecturales',
                'description' => 'Etudes architecturales',
                'quantity' => 1,
                'unit' => 'forfait',
                'unit_price' => 8000,
                'total_ht' => 8000,
                'total_tva' => 0,
                'total_ttc' => 8000,
            ],
            [
                'title' => 'Suivi dossier administratif',
                'description' => 'Suivi dossier administratif',
                'quantity' => 1,
                'unit' => 'forfait',
                'unit_price' => 2000,
                'total_ht' => 2000,
                'total_tva' => 0,
                'total_ttc' => 2000,
            ],
        ];

        foreach ($items as $index => $item) {
            $row = [$fk => $documentId];

            $this->putIfColumn($row, $itemColumns, 'position', $index + 1);
            foreach ($item as $key => $value) {
                $this->putIfColumn($row, $itemColumns, $key, $value);
            }

            if (in_array('created_at', $itemColumns, true)) {
                $row['created_at'] = now();
            }

            if (in_array('updated_at', $itemColumns, true)) {
                $row['updated_at'] = now();
            }

            DB::table('finance_document_items')->insert($row);
        }

        $this->line('<fg=green>Created sample ' . $type . ' document #' . $documentId . '</>');
    }

    private function putIfColumn(array &$data, array $columns, string $key, mixed $value): void
    {
        if (in_array($key, $columns, true)) {
            $data[$key] = $value;
        }
    }

    private function qaFail(string $message): int
    {
        $this->line('<fg=red>FAIL</> ' . $message);
        return 1;
    }
}
