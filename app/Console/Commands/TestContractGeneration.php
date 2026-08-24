<?php

namespace App\Console\Commands;

use App\Models\Contract;
use App\Services\ContractDocumentGenerator;
use App\Services\WordDocumentConverter;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use ZipArchive;

class TestContractGeneration extends Command
{
    protected $signature = 'archilbo:test-contract-generation {contract_id}';
    protected $description = 'Test contract DOCX generation and verify output';

    public function handle(): int
    {
        $contractId = $this->argument('contract_id');
        $contract = Contract::with(['dossier.primaryClient'])->find($contractId);

        if (!$contract) {
            $this->error("Contract #{$contractId} not found.");

            return self::FAILURE;
        }

        $this->info("Testing contract: {$contract->contract_number}");

        try {
            $paths = app(ContractDocumentGenerator::class)->generate($contract);
            $this->info("DOCX generated: {$paths['docx_path']}");
        } catch (\Throwable $e) {
            $this->error("Generation failed: " . $e->getMessage());

            return self::FAILURE;
        }

        $absoluteDocx = Storage::disk('local')->path($paths['docx_path']);

        if (!file_exists($absoluteDocx)) {
            $this->error("File does not exist: {$absoluteDocx}");

            return self::FAILURE;
        }

        $this->info("File size: " . filesize($absoluteDocx) . " bytes");

        $placeholders = $this->findRemainingPlaceholders($absoluteDocx);

        if (empty($placeholders)) {
            $this->info("No remaining placeholders found. All known keys replaced.");
        } else {
            $this->warn("Remaining placeholders found: " . implode(', ', $placeholders));
        }

        $absoluteDocx = Storage::disk('local')->path($paths['docx_path']);
        $pathBuilder = app(\App\Services\Dossiers\DossierPathBuilder::class);
        $contract->loadMissing(['dossier.city', 'dossier.primaryClient']);
        $pdfRelative = $pathBuilder->contractPdfPath($contract, $contract->dossier);
        $absolutePdf = Storage::disk('local')->path($pdfRelative);

        try {
            app(WordDocumentConverter::class)->convertDocxToPdf($absoluteDocx, $absolutePdf);
            $this->info("PDF exported: {$pdfRelative}");

            if (file_exists($absolutePdf)) {
                $this->info("PDF file size: " . filesize($absolutePdf) . " bytes");
            }
        } catch (\Throwable $e) {
            $this->warn("PDF export skipped: " . $e->getMessage());
        }

        $this->info("Contract generation test completed successfully.");

        return self::SUCCESS;
    }

    private function findRemainingPlaceholders(string $docxPath): array
    {
        $zip = new ZipArchive();

        if ($zip->open($docxPath) !== true) {
            return [];
        }

        $knownKeys = [
            'DATE', 'CIVILITY', 'CLIENT_NAME', 'CIN', 'CLIENT_ADD',
            'PROJECT_OBJECT', 'PROJECT_ADD', 'TITRE', 'SUP', 'PREF', 'COMMUNE',
            'PLANCHER', 'ESTIMATION', 'HT', 'TVA', 'TTC',
        ];

        $found = [];

        libxml_use_internal_errors(true);

        for ($i = 0; $i < $zip->numFiles; $i++) {
            $name = $zip->getNameIndex($i);

            if (!$name || !str_starts_with($name, 'word/') || !str_ends_with($name, '.xml')) {
                continue;
            }

            $xml = $zip->getFromName($name);

            if ($xml === false) {
                continue;
            }

            $dom = new \DOMDocument();
            $dom->loadXML($xml, LIBXML_PARSEHUGE);
            $xpath = new \DOMXPath($dom);
            $xpath->registerNamespace('w', 'http://schemas.openxmlformats.org/wordprocessingml/2006/main');

            $fullText = '';
            foreach ($xpath->query('//w:t') as $t) {
                $fullText .= $t->textContent;
            }

            foreach ($knownKeys as $key) {
                if (str_contains($fullText, '[' . $key . ']')) {
                    $found[] = $key;
                }
            }
        }

        $zip->close();

        return array_unique($found);
    }
}
