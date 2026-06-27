<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Str;

class FinanceExportNumberingDiscoveryCommand extends Command
{
    protected $signature = 'archilbo:finance-export-numbering-discovery {--write-report : Write markdown report to docs/finance-export-numbering-discovery.md}';

    protected $description = 'Discover real finance PDF/Excel/export/template code that should receive locked document numbering integration.';

    public function handle(): int
    {
        $this->info('Finance export numbering discovery started...');

        $root = base_path();

        $scanRoots = [
            'app',
            'resources/views',
            'resources/js',
        ];

        $exportKeywords = [
            'export',
            'pdf',
            'excel',
            'xlsx',
            'xls',
            'dompdf',
            'download',
            'stream',
            'template',
            'finance',
            'invoice',
            'quote',
            'devis',
            'facture',
            'receipt',
            'recu',
            'avoir',
        ];

        $numberKeywords = [
            'document_number',
            'finance_document_number',
            'generated_document_number',
            'number',
            'reference',
            'ref',
        ];

        $alreadyIntegratedKeywords = [
            'FinanceExportNumberPayloadBuilder',
            'FinanceLockedDocumentNumberResolver',
            'assignLockedNumber',
            'locked_document_number',
        ];

        $candidates = [];

        foreach ($scanRoots as $scanRoot) {
            $directory = $root.DIRECTORY_SEPARATOR.str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $scanRoot);

            if (! is_dir($directory)) {
                continue;
            }

            $iterator = new \RecursiveIteratorIterator(
                new \RecursiveDirectoryIterator($directory, \FilesystemIterator::SKIP_DOTS)
            );

            foreach ($iterator as $file) {
                if (! $file->isFile()) {
                    continue;
                }

                $extension = strtolower($file->getExtension());

                if (! in_array($extension, ['php', 'tsx', 'ts', 'jsx', 'js', 'blade.php'], true)) {
                    continue;
                }

                $path = $file->getPathname();
                $relativePath = str_replace($root.DIRECTORY_SEPARATOR, '', $path);
                $relativePath = str_replace('\\', '/', $relativePath);

                if (Str::contains($relativePath, [
                    'vendor/',
                    'node_modules/',
                    'storage/',
                    'bootstrap/cache/',
                    'FinanceExportNumberingDiscoveryCommand.php',
                ])) {
                    continue;
                }

                $content = @file_get_contents($path);

                if (! is_string($content) || trim($content) === '') {
                    continue;
                }

                $lowerPath = strtolower($relativePath);
                $lowerContent = strtolower($content);

                $pathScore = 0;
                $contentScore = 0;
                $numberScore = 0;
                $integrated = false;

                foreach ($exportKeywords as $keyword) {
                    if (str_contains($lowerPath, strtolower($keyword))) {
                        $pathScore += 2;
                    }

                    if (str_contains($lowerContent, strtolower($keyword))) {
                        $contentScore++;
                    }
                }

                foreach ($numberKeywords as $keyword) {
                    if (str_contains($lowerContent, strtolower($keyword))) {
                        $numberScore++;
                    }
                }

                foreach ($alreadyIntegratedKeywords as $keyword) {
                    if (str_contains($content, $keyword)) {
                        $integrated = true;
                        break;
                    }
                }

                $score = $pathScore + $contentScore + ($numberScore * 2);

                if ($score < 4) {
                    continue;
                }

                $type = $this->guessType($relativePath, $content);

                $candidates[] = [
                    'path' => $relativePath,
                    'score' => $score,
                    'type' => $type,
                    'number_score' => $numberScore,
                    'integrated' => $integrated,
                    'recommendation' => $integrated
                        ? 'Already references locked numbering integration.'
                        : 'Needs review. Inject FinanceExportNumberPayloadBuilder before PDF/Excel/template payload is rendered.',
                ];
            }
        }

        usort($candidates, function (array $a, array $b): int {
            return $b['score'] <=> $a['score'];
        });

        if ($candidates === []) {
            $this->warn('No export candidates found.');
        } else {
            $this->table(
                ['Score', 'Type', 'Integrated', 'Path', 'Recommendation'],
                array_map(fn (array $candidate): array => [
                    $candidate['score'],
                    $candidate['type'],
                    $candidate['integrated'] ? 'yes' : 'no',
                    $candidate['path'],
                    $candidate['recommendation'],
                ], array_slice($candidates, 0, 30))
            );
        }

        if ($this->option('write-report')) {
            $this->writeReport($candidates);
        }

        $notIntegrated = array_values(array_filter(
            $candidates,
            fn (array $candidate): bool => ! $candidate['integrated']
        ));

        $this->line('');
        $this->info('Discovery summary:');
        $this->line('Candidates found: '.count($candidates));
        $this->line('Need integration review: '.count($notIntegrated));

        if (count($notIntegrated) > 0) {
            $this->warn('Next step: patch the top real export candidates from docs/finance-export-numbering-discovery.md');
        } else {
            $this->info('All detected candidates already reference locked numbering integration.');
        }

        return self::SUCCESS;
    }

    protected function guessType(string $path, string $content): string
    {
        $source = strtolower($path.' '.$content);

        if (str_contains($source, 'excel') || str_contains($source, 'xlsx') || str_contains($source, 'xls')) {
            return 'Excel';
        }

        if (str_contains($source, 'pdf') || str_contains($source, 'dompdf')) {
            return 'PDF';
        }

        if (str_contains($source, 'template') || str_contains($source, 'blade')) {
            return 'Template';
        }

        if (str_contains($source, 'controller')) {
            return 'Controller';
        }

        return 'Export';
    }

    protected function writeReport(array $candidates): void
    {
        $reportPath = base_path('docs/finance-export-numbering-discovery.md');

        if (! is_dir(dirname($reportPath))) {
            mkdir(dirname($reportPath), 0777, true);
        }

        $lines = [
            '# Finance Export Numbering Discovery',
            '',
            'Generated at: '.now()->toDateTimeString(),
            '',
            'Purpose: identify real PDF, Excel, template, and export code that must use locked finance document numbers.',
            '',
            'Required integration service:',
            '',
            '```php',
            'use App\Services\Finance\FinanceExportNumberPayloadBuilder;',
            '',
            '$payload = app(FinanceExportNumberPayloadBuilder::class)->mergeInto(',
            '    payload: $payload,',
            '    document: $document,',
            '    documentType: $documentType,',
            ');',
            '```',
            '',
            '## Candidates',
            '',
        ];

        if ($candidates === []) {
            $lines[] = 'No candidates found.';
        }

        foreach ($candidates as $index => $candidate) {
            $lines[] = '### '.($index + 1).'. '.$candidate['path'];
            $lines[] = '';
            $lines[] = '- Score: '.$candidate['score'];
            $lines[] = '- Type: '.$candidate['type'];
            $lines[] = '- Already integrated: '.($candidate['integrated'] ? 'yes' : 'no');
            $lines[] = '- Recommendation: '.$candidate['recommendation'];
            $lines[] = '';
        }

        file_put_contents($reportPath, implode(PHP_EOL, $lines).PHP_EOL);

        $this->info('Report written: docs/finance-export-numbering-discovery.md');
    }
}