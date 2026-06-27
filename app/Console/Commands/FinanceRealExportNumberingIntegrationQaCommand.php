<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class FinanceRealExportNumberingIntegrationQaCommand extends Command
{
    protected $signature = 'archilbo:finance-real-export-numbering-integration-qa';

    protected $description = 'Verify real PDF and Excel generators lock the existing visible finance document number before exporting.';

    public function handle(): int
    {
        $this->info('Finance real export numbering integration QA started...');

        $checks = [
            'app/Services/Finance/FinanceDocumentNumberingService.php' => [
                'markExistingNumberAsLocked',
                '$this->markExistingNumberAsLocked($model);',
            ],
            'app/Services/Finance/FinancePdfGenerator.php' => [
                'FinanceLockedDocumentNumberResolver $numberResolver',
                '$this->numberResolver->forModel($document',
                '$html = $this->renderer->renderHtml($document);',
            ],
            'app/Services/Finance/FinanceExcelExporter.php' => [
                'FinanceLockedDocumentNumberResolver $numberResolver',
                '$this->numberResolver->forModel($document',
                '$data = $this->renderData->toArray($document);',
            ],
        ];

        foreach ($checks as $relativePath => $needles) {
            $path = base_path($relativePath);

            if (! is_file($path)) {
                $this->error("Missing file: {$relativePath}");
                return self::FAILURE;
            }

            $content = file_get_contents($path);

            foreach ($needles as $needle) {
                if (! str_contains($content, $needle)) {
                    $this->error("Missing integration marker in {$relativePath}: {$needle}");
                    return self::FAILURE;
                }
            }

            $this->line("OK {$relativePath}");
        }

        $this->info('Finance real export numbering integration QA passed.');

        return self::SUCCESS;
    }
}