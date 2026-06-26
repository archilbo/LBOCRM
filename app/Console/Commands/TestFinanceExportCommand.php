<?php

namespace App\Console\Commands;

use App\Models\FinanceDocument;
use App\Services\Finance\FinanceExcelExporter;
use App\Services\Finance\FinancePdfGenerator;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use PhpOffice\PhpSpreadsheet\IOFactory;

class TestFinanceExportCommand extends Command
{
    protected $signature = 'archilbo:test-finance-export {finance_document_id}';
    protected $description = 'Generate and validate PDF and Excel exports for a finance document';

    public function handle(FinancePdfGenerator $pdfGenerator, FinanceExcelExporter $excelExporter): int
    {
        $document = FinanceDocument::with(['client', 'dossier', 'items', 'payments', 'template'])
            ->find($this->argument('finance_document_id'));

        if (!$document) {
            $this->error('Finance document not found.');
            return Command::FAILURE;
        }

        if ($document->items->isEmpty()) {
            $this->error('Finance document has no line items. Add at least one item before export.');
            return Command::FAILURE;
        }

        $this->info("Testing finance export for {$document->number}...");

        try {
            $pdfPath = $pdfGenerator->generate($document);
            $this->assertStoredFile($pdfPath, 'PDF');
            $this->info("PDF generated: {$pdfPath}");

            $excelPath = $excelExporter->generate($document->refresh());
            $this->assertStoredFile($excelPath, 'Excel');
            $this->assertReadableXlsx($excelPath);
            $this->info("Excel generated: {$excelPath}");
        } catch (\Throwable $e) {
            $this->error('Export test failed: ' . $e->getMessage());
            return Command::FAILURE;
        }

        $this->info('Finance export test passed.');
        return Command::SUCCESS;
    }

    private function assertStoredFile(string $path, string $label): void
    {
        if (!Storage::disk('public')->exists($path)) {
            throw new \RuntimeException("{$label} file was not stored at {$path}.");
        }

        $absolutePath = Storage::disk('public')->path($path);
        if (!is_file($absolutePath) || filesize($absolutePath) === 0) {
            throw new \RuntimeException("{$label} file is empty at {$path}.");
        }
    }

    private function assertReadableXlsx(string $path): void
    {
        $absolutePath = Storage::disk('public')->path($path);
        $handle = fopen($absolutePath, 'rb');
        $signature = $handle ? fread($handle, 2) : '';
        if ($handle) {
            fclose($handle);
        }

        if ($signature !== 'PK') {
            throw new \RuntimeException('Excel file is not a valid XLSX zip package.');
        }

        $spreadsheet = IOFactory::load($absolutePath);
        $spreadsheet->disconnectWorksheets();
    }
}
