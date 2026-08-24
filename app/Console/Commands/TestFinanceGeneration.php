<?php

namespace App\Console\Commands;

use App\Models\FinanceRecord;
use App\Services\FinanceDocumentGenerator;
use App\Services\OfficeDocumentConverter;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use PhpOffice\PhpSpreadsheet\IOFactory;

class TestFinanceGeneration extends Command
{
    protected $signature = 'archilbo:test-finance-generation {finance_record_id}';
    protected $description = 'Test finance XLSX generation and verify output';

    public function handle(): int
    {
        $recordId = $this->argument('finance_record_id');
        $record = FinanceRecord::with(['dossier.primaryClient'])->find($recordId);

        if (!$record) {
            $this->error("Finance record #{$recordId} not found.");
            return self::FAILURE;
        }

        $this->info("Testing finance record: {$record->record_number} ({$record->type})");

        try {
            $paths = app(FinanceDocumentGenerator::class)->generate($record);
            $this->info("XLSX generated: {$paths['xlsx_path']}");
        } catch (\Throwable $e) {
            $this->error("Generation failed: " . $e->getMessage());
            return self::FAILURE;
        }

        $absoluteXlsx = Storage::disk('public')->path($paths['xlsx_path']);

        if (!file_exists($absoluteXlsx)) {
            $this->error("File does not exist: {$absoluteXlsx}");
            return self::FAILURE;
        }

        $size = filesize($absoluteXlsx);
        $this->info("File size: {$size} bytes");

        // Check ZIP/XLSX signature
        $fp = fopen($absoluteXlsx, 'rb');
        $bytes = fread($fp, 4);
        fclose($fp);
        $hex = bin2hex($bytes);

        $isValidZip = str_starts_with($hex, '504b');
        if (!$isValidZip) {
            $this->error("INVALID XLSX: first bytes are {$hex}, expected PK (504b...). File is not a valid ZIP/XLSX.");
            return self::FAILURE;
        }

        $this->info("ZIP signature OK (PK/{$hex})");

        // Try loading with PhpSpreadsheet
        try {
            $spreadsheet = IOFactory::load($absoluteXlsx);
            $this->info("PhpSpreadsheet loaded OK: " . $spreadsheet->getSheetCount() . " sheet(s)");
            $spreadsheet->disconnectWorksheets();
        } catch (\Throwable $e) {
            $this->error("PhpSpreadsheet could not load file: " . $e->getMessage());
            return self::FAILURE;
        }

        $remaining = $this->findRemainingPlaceholders($absoluteXlsx);

        if (empty($remaining)) {
            $this->info("No remaining placeholders found. All known keys replaced.");
        } else {
            $this->warn("Remaining placeholders found: " . implode(', ', $remaining));
        }

        $converter = app(OfficeDocumentConverter::class);

        if ($converter->isAvailable()) {
            $pdfRelative = 'finance/' . $record->record_number . '/' . $record->record_number . '.pdf';
            $absolutePdf = Storage::disk('public')->path($pdfRelative);

            try {
                $converter->convertDocxToPdf($absoluteXlsx, $absolutePdf);
                $this->info("PDF exported: {$pdfRelative}");

                if (file_exists($absolutePdf)) {
                    $this->info("PDF file size: " . filesize($absolutePdf) . " bytes");
                }
            } catch (\Throwable $e) {
                $this->warn("PDF export skipped: " . $e->getMessage());
            }
        } else {
            $this->warn("LibreOffice not installed. PDF export skipped.");
        }

        $this->info("Finance generation test completed successfully.");
        return self::SUCCESS;
    }

    private function findRemainingPlaceholders(string $xlsxPath): array
    {
        $allTemplatePlaceholders = [
            'DATE', 'DUE_DATE', 'PAID_DATE', 'DATE_AVANCE',
            'RECORD_NUMBER', 'NUMERO_DEVIS', 'NUMERO_FACTURE',
            'TYPE', 'STATUS',
            'CLIENT_NAME', 'CIVILITY', 'CIN', 'ICE', 'CLIENT_ADD',
            'CLIENT_PHONE', 'CLIENT_EMAIL',
            'DOSSIER_NUMBER', 'PROJECT_OBJECT', 'DESIGNATION',
            'PROJECT_ADD', 'TITRE', 'COMMUNE', 'PREF', 'SUP', 'PLANCHER',
            'QU', 'HT', 'TOTAL_HT', 'TVA', 'TTC', 'TOTAL_TTC',
            'PAID', 'REMAINING', 'NOTES',
        ];

        $found = [];

        try {
            $spreadsheet = IOFactory::load($xlsxPath);

            foreach ($spreadsheet->getAllSheets() as $sheet) {
                foreach ($sheet->getRowIterator() as $row) {
                    foreach ($row->getCellIterator() as $cell) {
                        $value = $cell->getValue();

                        if (!is_string($value)) {
                            continue;
                        }

                        foreach ($allTemplatePlaceholders as $key) {
                            if (str_contains($value, '[' . $key . ']') && !in_array($key, $found, true)) {
                                $found[] = $key;
                            }
                            if (str_contains($value, '${' . $key . '}') && !in_array($key, $found, true)) {
                                $found[] = $key;
                            }
                        }
                    }
                }
            }

            $spreadsheet->disconnectWorksheets();
        } catch (\Throwable $e) {
            $this->warn("Could not inspect spreadsheet: " . $e->getMessage());
        }

        return $found;
    }
}
