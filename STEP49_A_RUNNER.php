<?php

function path_for(string $relativePath): string
{
    return __DIR__.DIRECTORY_SEPARATOR.str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $relativePath);
}

function read_file_text(string $relativePath): string
{
    $path = path_for($relativePath);

    if (! is_file($path)) {
        throw new RuntimeException("Missing file: {$relativePath}");
    }

    return file_get_contents($path);
}

function write_file_text(string $relativePath, string $content): void
{
    $path = path_for($relativePath);
    $dir = dirname($path);

    if (! is_dir($dir)) {
        mkdir($dir, 0777, true);
    }

    file_put_contents($path, ltrim($content, "\xEF\xBB\xBF"));

    echo "Written: {$relativePath}".PHP_EOL;
}

function backup_file(string $relativePath): void
{
    $path = path_for($relativePath);

    if (is_file($path)) {
        copy($path, $path.'.bak-step49a');
        echo "Backup: {$relativePath}.bak-step49a".PHP_EOL;
    }
}

function run_cmd(string $command): void
{
    echo PHP_EOL."> {$command}".PHP_EOL;

    passthru($command, $exitCode);

    if ($exitCode !== 0) {
        exit($exitCode);
    }
}

echo "STEP 49-A runner started".PHP_EOL;

# ---------------------------------------------------------------------
# 1) Add finance document lock state presenter.
# ---------------------------------------------------------------------

write_file_text('app/Services/Finance/FinanceDocumentLockStatePresenter.php', <<<'PHP'
<?php

namespace App\Services\Finance;

use App\Models\FinanceDocument;

class FinanceDocumentLockStatePresenter
{
    public function toArray(FinanceDocument $document): array
    {
        $locked = (bool) ($document->number_locked ?? false);
        $lockedAt = $document->number_locked_at;

        return [
            'isLocked' => $locked,
            'lockedAt' => $lockedAt ? (string) $lockedAt : null,
            'lockedAtFormatted' => $lockedAt && method_exists($lockedAt, 'format')
                ? $lockedAt->format('d/m/Y H:i')
                : ($lockedAt ? (string) $lockedAt : null),
            'message' => $locked
                ? 'Document locked after export. Number, type, and issue date cannot be changed.'
                : 'Document is not locked yet.',
            'blockedFields' => [
                'number',
                'type',
                'issue_date',
                'number_locked',
                'number_locked_at',
            ],
            'canEditNumberFields' => ! $locked,
            'canRegenerateExports' => true,
            'canGeneratePdf' => true,
            'canGenerateExcel' => true,
        ];
    }
}
PHP);

# ---------------------------------------------------------------------
# 2) Patch FinanceDocumentResource.
# ---------------------------------------------------------------------

$resourcePath = 'app/Http/Resources/FinanceDocumentResource.php';

if (! is_file(path_for($resourcePath))) {
    throw new RuntimeException('Missing app/Http/Resources/FinanceDocumentResource.php');
}

backup_file($resourcePath);

$resource = read_file_text($resourcePath);

if (! str_contains($resource, "'lock' =>") && ! str_contains($resource, '"lock" =>')) {
    $lines = preg_split('/\R/', $resource);
    $output = [];
    $inserted = false;

    foreach ($lines as $line) {
        $output[] = $line;

        if (! $inserted && preg_match("/^(\s*)['\"]number['\"]\s*=>\s*/", $line, $matches)) {
            $indent = $matches[1];

            $output[] = $indent."'numberLocked' => (bool) (\$this->number_locked ?? false),";
            $output[] = $indent."'numberLockedAt' => \$this->number_locked_at ? (string) \$this->number_locked_at : null,";
            $output[] = $indent."'lock' => app(\\App\\Services\\Finance\\FinanceDocumentLockStatePresenter::class)->toArray(\$this->resource),";

            $inserted = true;
        }
    }

    if (! $inserted) {
        throw new RuntimeException('Could not find number field in FinanceDocumentResource.php. Send this file before Step 49-B.');
    }

    write_file_text($resourcePath, implode(PHP_EOL, $output).PHP_EOL);
} else {
    echo "FinanceDocumentResource already has lock payload.".PHP_EOL;
}

# ---------------------------------------------------------------------
# 3) Add backend payload QA command.
# ---------------------------------------------------------------------

write_file_text('app/Console/Commands/FinanceUiLockPayloadQaCommand.php', <<<'PHP'
<?php

namespace App\Console\Commands;

use App\Http\Resources\FinanceDocumentResource;
use App\Models\FinanceDocument;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Schema;

class FinanceUiLockPayloadQaCommand extends Command
{
    protected $signature = 'archilbo:finance-ui-lock-payload-qa';

    protected $description = 'Verify finance document resource exposes UI lock awareness payload.';

    public function handle(): int
    {
        $this->info('Finance UI lock payload QA started...');

        if (! Schema::hasTable('finance_documents')) {
            $this->error('Missing table: finance_documents.');

            return self::FAILURE;
        }

        foreach (['number', 'number_locked', 'number_locked_at'] as $column) {
            if (! Schema::hasColumn('finance_documents', $column)) {
                $this->error("Missing finance_documents column: {$column}");

                return self::FAILURE;
            }
        }

        $document = FinanceDocument::query()
            ->where('number_locked', true)
            ->orderByDesc('id')
            ->first();

        if (! $document) {
            $this->error('No locked finance document found. Run finance export QA first.');

            return self::FAILURE;
        }

        $payload = (new FinanceDocumentResource($document))->resolve();

        foreach (['numberLocked', 'numberLockedAt', 'lock'] as $key) {
            if (! array_key_exists($key, $payload)) {
                $this->error("Missing resource key: {$key}");

                return self::FAILURE;
            }
        }

        foreach (['isLocked', 'lockedAt', 'lockedAtFormatted', 'message', 'blockedFields', 'canEditNumberFields', 'canRegenerateExports', 'canGeneratePdf', 'canGenerateExcel'] as $key) {
            if (! array_key_exists($key, $payload['lock'])) {
                $this->error("Missing lock payload key: lock.{$key}");

                return self::FAILURE;
            }
        }

        if ($payload['numberLocked'] !== true) {
            $this->error('numberLocked should be true for exported locked document.');

            return self::FAILURE;
        }

        if (($payload['lock']['isLocked'] ?? null) !== true) {
            $this->error('lock.isLocked should be true.');

            return self::FAILURE;
        }

        if (($payload['lock']['canEditNumberFields'] ?? true) !== false) {
            $this->error('lock.canEditNumberFields should be false.');

            return self::FAILURE;
        }

        if (($payload['lock']['canRegenerateExports'] ?? false) !== true) {
            $this->error('lock.canRegenerateExports should be true.');

            return self::FAILURE;
        }

        $this->table(
            ['Number', 'Locked', 'Locked At', 'Can Edit Number Fields', 'Can Regenerate Exports'],
            [[
                $payload['number'] ?? 'n/a',
                $payload['numberLocked'] ? 'yes' : 'no',
                $payload['numberLockedAt'] ?? 'n/a',
                $payload['lock']['canEditNumberFields'] ? 'yes' : 'no',
                $payload['lock']['canRegenerateExports'] ? 'yes' : 'no',
            ]]
        );

        $this->info('Finance UI lock payload QA passed.');

        return self::SUCCESS;
    }
}
PHP);

# ---------------------------------------------------------------------
# 4) Add UI discovery command.
# ---------------------------------------------------------------------

write_file_text('app/Console/Commands/FinanceUiLockAwarenessDiscoveryCommand.php', <<<'PHP'
<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class FinanceUiLockAwarenessDiscoveryCommand extends Command
{
    protected $signature = 'archilbo:finance-ui-lock-awareness-discovery';

    protected $description = 'Discover React UI files that need locked finance document awareness.';

    public function handle(): int
    {
        $this->info('Finance UI lock awareness discovery started...');

        $roots = [
            'resources/js/features/finance',
            'resources/js/Features/Finance',
            'resources/js/pages/Finance',
            'resources/js/Pages/Finance',
            'resources/js/Pages/Admin/Finance',
            'resources/js/pages/Admin/Finance',
        ];

        $keywords = [
            'FinanceDocument',
            'number',
            'type',
            'issue',
            'date',
            'edit',
            'update',
            'drawer',
            'form',
            'generate',
            'pdf',
            'excel',
            'download',
            'document',
            'status',
        ];

        $alreadyAware = [
            'numberLocked',
            'numberLockedAt',
            'isLocked',
            'canEditNumberFields',
            'canRegenerateExports',
            'lockedAtFormatted',
        ];

        $rows = [];
        $report = [
            '# Finance UI Lock Awareness Discovery',
            '',
            'Generated at: '.now()->toDateTimeString(),
            '',
            '## Backend payload keys available',
            '',
            '```ts',
            'document.numberLocked',
            'document.numberLockedAt',
            'document.lock.isLocked',
            'document.lock.lockedAtFormatted',
            'document.lock.message',
            'document.lock.blockedFields',
            'document.lock.canEditNumberFields',
            'document.lock.canRegenerateExports',
            'document.lock.canGeneratePdf',
            'document.lock.canGenerateExcel',
            '```',
            '',
            '## Candidates',
            '',
        ];

        foreach ($roots as $root) {
            $directory = base_path($root);

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

                if (! in_array($extension, ['ts', 'tsx', 'js', 'jsx'], true)) {
                    continue;
                }

                $path = $file->getPathname();
                $relativePath = str_replace(base_path().DIRECTORY_SEPARATOR, '', $path);
                $relativePath = str_replace('\\', '/', $relativePath);
                $content = file_get_contents($path);

                if (! is_string($content) || trim($content) === '') {
                    continue;
                }

                $score = 0;

                foreach ($keywords as $keyword) {
                    if (str_contains(strtolower($content), strtolower($keyword)) || str_contains(strtolower($relativePath), strtolower($keyword))) {
                        $score++;
                    }
                }

                if ($score < 3) {
                    continue;
                }

                $aware = false;

                foreach ($alreadyAware as $needle) {
                    if (str_contains($content, $needle)) {
                        $aware = true;
                        break;
                    }
                }

                $type = $this->guessType($relativePath, $content);

                $rows[] = [
                    'score' => $score,
                    'type' => $type,
                    'aware' => $aware ? 'yes' : 'no',
                    'path' => $relativePath,
                ];
            }
        }

        usort($rows, fn (array $a, array $b): int => $b['score'] <=> $a['score']);

        foreach ($rows as $index => $row) {
            $report[] = '### '.($index + 1).'. '.$row['path'];
            $report[] = '';
            $report[] = '- Score: '.$row['score'];
            $report[] = '- Type: '.$row['type'];
            $report[] = '- Already lock-aware: '.$row['aware'];
            $report[] = '';
        }

        if (! is_dir(base_path('docs'))) {
            mkdir(base_path('docs'), 0777, true);
        }

        file_put_contents(base_path('docs/finance-ui-lock-awareness-discovery.md'), implode(PHP_EOL, $report).PHP_EOL);

        $this->table(
            ['Score', 'Type', 'Aware', 'Path'],
            array_map(fn (array $row): array => [
                $row['score'],
                $row['type'],
                $row['aware'],
                $row['path'],
            ], array_slice($rows, 0, 40))
        );

        $this->info('Report written: docs/finance-ui-lock-awareness-discovery.md');
        $this->info('Finance UI lock awareness discovery completed.');

        return self::SUCCESS;
    }

    protected function guessType(string $path, string $content): string
    {
        $source = strtolower($path.' '.$content);

        if (str_contains($source, 'types')) {
            return 'Types';
        }

        if (str_contains($source, 'drawer') || str_contains($source, 'form')) {
            return 'Drawer/Form';
        }

        if (str_contains($source, 'actions') || str_contains($source, 'button')) {
            return 'Actions';
        }

        if (str_contains($source, 'preview')) {
            return 'Preview';
        }

        if (str_contains($source, 'show')) {
            return 'Page/Show';
        }

        if (str_contains($source, 'index') || str_contains($source, 'table') || str_contains($source, 'list')) {
            return 'Page/List';
        }

        return 'Component';
    }
}
PHP);

# ---------------------------------------------------------------------
# 5) Syntax + QA.
# ---------------------------------------------------------------------

run_cmd('php -l app/Services/Finance/FinanceDocumentLockStatePresenter.php');
run_cmd('php -l app/Http/Resources/FinanceDocumentResource.php');
run_cmd('php -l app/Console/Commands/FinanceUiLockPayloadQaCommand.php');
run_cmd('php -l app/Console/Commands/FinanceUiLockAwarenessDiscoveryCommand.php');

run_cmd('php artisan optimize:clear');

run_cmd('php artisan archilbo:finance-numbering-qa');
run_cmd('php artisan archilbo:finance-export-numbering-qa');
run_cmd('php artisan archilbo:finance-real-export-numbering-integration-qa');
run_cmd('php artisan archilbo:finance-export-qa');
run_cmd('php artisan archilbo:finance-document-lock-guard-qa');
run_cmd('php artisan archilbo:finance-ui-lock-payload-qa');
run_cmd('php artisan archilbo:finance-ui-lock-awareness-discovery');

echo PHP_EOL.'STEP 49-A completed.'.PHP_EOL;