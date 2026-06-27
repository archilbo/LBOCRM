<?php

function write_file(string $relativePath, string $content): void
{
    $path = __DIR__.DIRECTORY_SEPARATOR.str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $relativePath);
    $dir = dirname($path);

    if (! is_dir($dir)) {
        mkdir($dir, 0777, true);
    }

    file_put_contents($path, ltrim($content, "\xEF\xBB\xBF"));

    echo "Written: {$relativePath}".PHP_EOL;
}

function run_cmd(string $command): void
{
    echo PHP_EOL."> {$command}".PHP_EOL;

    passthru($command, $exitCode);

    if ($exitCode !== 0) {
        exit($exitCode);
    }
}

echo "STEP 47-E: Collect exact real export integration context".PHP_EOL;

write_file('app/Console/Commands/FinanceExportNumberingTargetContextCommand.php', <<<'PHP'
<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Str;

class FinanceExportNumberingTargetContextCommand extends Command
{
    protected $signature = 'archilbo:finance-export-numbering-target-context';

    protected $description = 'Collect focused source context for real finance export numbering integration.';

    public function handle(): int
    {
        $this->info('Collecting finance export numbering target context...');

        $targets = [
            'app/Http/Controllers/Finance/FinanceDocumentController.php',
            'app/Services/Finance/FinanceDocumentRenderData.php',
            'app/Services/Finance/FinanceExcelExporter.php',
            'app/Services/FinanceDocumentGenerator.php',
            'app/Services/Finance/FinancePdfGenerator.php',
            'app/Services/Finance/FinanceTemplateRenderer.php',
            'app/Console/Commands/FinanceExportQaCommand.php',
            'app/Console/Commands/TestFinanceExportCommand.php',
            'app/Console/Commands/TestFinanceGeneration.php',
        ];

        $keywords = [
            'render',
            'payload',
            'data',
            'pdf',
            'excel',
            'export',
            'download',
            'stream',
            'generate',
            'document_number',
            'generated_document_number',
            'reference',
            'number',
            'invoice',
            'quote',
            'devis',
            'facture',
        ];

        $report = [
            '# Finance Export Numbering Target Context',
            '',
            'Generated at: '.now()->toDateTimeString(),
            '',
            'Goal: identify exact injection points for `FinanceExportNumberPayloadBuilder` without guessing class signatures.',
            '',
            'Required backend service already available:',
            '',
            '```php',
            'App\Services\Finance\FinanceExportNumberPayloadBuilder',
            '```',
            '',
            'Preferred integration point order:',
            '',
            '1. `FinanceDocumentRenderData` if it builds all template/PDF payloads.',
            '2. `FinancePdfGenerator` if it builds PDF-only payloads.',
            '3. `FinanceExcelExporter` if it builds Excel-only payloads.',
            '4. `FinanceDocumentGenerator` if it orchestrates generated documents.',
            '5. `FinanceDocumentController` only if controller builds export payload directly.',
            '',
        ];

        $tableRows = [];

        foreach ($targets as $relativePath) {
            $path = base_path($relativePath);

            if (! is_file($path)) {
                $tableRows[] = [$relativePath, 'missing', '0'];
                $report[] = '## '.$relativePath;
                $report[] = '';
                $report[] = 'Missing.';
                $report[] = '';
                continue;
            }

            $content = file_get_contents($path);

            if (! is_string($content)) {
                $tableRows[] = [$relativePath, 'unreadable', '0'];
                continue;
            }

            $lines = preg_split('/\R/', $content) ?: [];
            $classes = $this->findMatches($lines, '/^\s*(final\s+)?class\s+\w+|^\s*class\s+\w+/');
            $methods = $this->findMatches($lines, '/^\s*(public|protected|private)\s+function\s+\w+/');
            $constructors = $this->findMatches($lines, '/^\s*public\s+function\s+__construct/');
            $imports = $this->findMatches($lines, '/^\s*use\s+[^;]+;/');

            $hitLines = [];

            foreach ($lines as $index => $line) {
                foreach ($keywords as $keyword) {
                    if (Str::contains(Str::lower($line), Str::lower($keyword))) {
                        $hitLines[$index + 1] = $line;
                        break;
                    }
                }
            }

            $score = count($hitLines) + (count($methods) * 2) + (count($constructors) * 3);
            $status = $this->alreadyIntegrated($content) ? 'already-integrated' : 'needs-patch';

            $tableRows[] = [$relativePath, $status, (string) $score];

            $report[] = '## '.$relativePath;
            $report[] = '';
            $report[] = '- Status: '.$status;
            $report[] = '- Score: '.$score;
            $report[] = '';

            $report[] = '### Imports';
            $report[] = '';
            $report[] = '```php';
            $report[] = $this->formatMatches($imports);
            $report[] = '```';
            $report[] = '';

            $report[] = '### Classes';
            $report[] = '';
            $report[] = '```php';
            $report[] = $this->formatMatches($classes);
            $report[] = '```';
            $report[] = '';

            $report[] = '### Constructors';
            $report[] = '';
            $report[] = '```php';
            $report[] = $this->formatMatches($constructors);
            $report[] = '```';
            $report[] = '';

            $report[] = '### Methods';
            $report[] = '';
            $report[] = '```php';
            $report[] = $this->formatMatches($methods);
            $report[] = '```';
            $report[] = '';

            $report[] = '### Focused snippets';
            $report[] = '';

            foreach ($this->snippetBlocks($lines, array_keys($hitLines), 5) as $block) {
                $report[] = '```php';
                foreach ($block as $lineNumber => $line) {
                    $report[] = str_pad((string) $lineNumber, 4, ' ', STR_PAD_LEFT).' | '.$line;
                }
                $report[] = '```';
                $report[] = '';
            }
        }

        $reportPath = base_path('docs/finance-export-numbering-target-context.md');

        if (! is_dir(dirname($reportPath))) {
            mkdir(dirname($reportPath), 0777, true);
        }

        file_put_contents($reportPath, implode(PHP_EOL, $report).PHP_EOL);

        $this->table(['File', 'Status', 'Score'], $tableRows);

        $this->info('Report written: docs/finance-export-numbering-target-context.md');
        $this->info('Finance export numbering target context completed.');

        return self::SUCCESS;
    }

    protected function alreadyIntegrated(string $content): bool
    {
        return Str::contains($content, [
            'FinanceExportNumberPayloadBuilder',
            'FinanceLockedDocumentNumberResolver',
            'locked_document_number',
            'assignLockedNumber',
        ]);
    }

    protected function findMatches(array $lines, string $pattern): array
    {
        $matches = [];

        foreach ($lines as $index => $line) {
            if (preg_match($pattern, $line)) {
                $matches[$index + 1] = trim($line);
            }
        }

        return $matches;
    }

    protected function formatMatches(array $matches): string
    {
        if ($matches === []) {
            return '// none found';
        }

        $lines = [];

        foreach ($matches as $lineNumber => $line) {
            $lines[] = str_pad((string) $lineNumber, 4, ' ', STR_PAD_LEFT).' | '.$line;
        }

        return implode(PHP_EOL, $lines);
    }

    protected function snippetBlocks(array $lines, array $hitLineNumbers, int $radius): array
    {
        if ($hitLineNumbers === []) {
            return [];
        }

        sort($hitLineNumbers);

        $ranges = [];

        foreach ($hitLineNumbers as $lineNumber) {
            $start = max(1, $lineNumber - $radius);
            $end = min(count($lines), $lineNumber + $radius);

            if ($ranges !== [] && $start <= $ranges[array_key_last($ranges)][1] + 2) {
                $ranges[array_key_last($ranges)][1] = max($ranges[array_key_last($ranges)][1], $end);
            } else {
                $ranges[] = [$start, $end];
            }
        }

        $blocks = [];

        foreach (array_slice($ranges, 0, 8) as [$start, $end]) {
            $block = [];

            for ($line = $start; $line <= $end; $line++) {
                $block[$line] = $lines[$line - 1] ?? '';
            }

            $blocks[] = $block;
        }

        return $blocks;
    }
}
PHP);

run_cmd('php -l app/Console/Commands/FinanceExportNumberingTargetContextCommand.php');

run_cmd('php artisan optimize:clear');

run_cmd('php artisan archilbo:finance-numbering-qa');
run_cmd('php artisan archilbo:finance-export-numbering-qa');
run_cmd('php artisan archilbo:finance-export-numbering-target-context');

echo PHP_EOL.'STEP 47-E completed.'.PHP_EOL;