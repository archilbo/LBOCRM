<?php

function path_for(string $relativePath): string
{
    return __DIR__.DIRECTORY_SEPARATOR.str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $relativePath);
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

function read_file_text(string $relativePath): string
{
    $path = path_for($relativePath);

    if (! is_file($path)) {
        throw new RuntimeException("Missing file: {$relativePath}");
    }

    return file_get_contents($path);
}

function backup_file(string $relativePath): void
{
    $path = path_for($relativePath);

    if (is_file($path)) {
        copy($path, $path.'.bak-step48');
        echo "Backup: {$relativePath}.bak-step48".PHP_EOL;
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

echo "STEP 48 runner started".PHP_EOL;

# ---------------------------------------------------------------------
# 1) Add finance document lock guard.
# ---------------------------------------------------------------------

write_file_text('app/Services/Finance/FinanceDocumentLockGuard.php', <<<'PHP'
<?php

namespace App\Services\Finance;

use App\Models\FinanceDocument;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\ValidationException;

class FinanceDocumentLockGuard
{
    public function assertCanUpdate(FinanceDocument $document): void
    {
        if (! $this->wasAlreadyLocked($document)) {
            return;
        }

        $blockedFields = $this->blockedFields();

        $dirtyBlockedFields = array_values(array_intersect(
            array_keys($document->getDirty()),
            $blockedFields,
        ));

        if ($dirtyBlockedFields === []) {
            return;
        }

        throw ValidationException::withMessages([
            'finance_document_lock' => 'This finance document number is locked after export and cannot be changed. Blocked fields: '.implode(', ', $dirtyBlockedFields).'.',
        ]);
    }

    protected function wasAlreadyLocked(FinanceDocument $document): bool
    {
        if (! Schema::hasTable($document->getTable())) {
            return false;
        }

        if (! Schema::hasColumn($document->getTable(), 'number_locked')) {
            return false;
        }

        return (bool) $document->getOriginal('number_locked');
    }

    protected function blockedFields(): array
    {
        return array_values(array_filter([
            'number',
            'type',
            'issue_date',
            'number_locked',
            'number_locked_at',
        ]));
    }
}
PHP);

# ---------------------------------------------------------------------
# 2) Add provider that registers model update protection.
# ---------------------------------------------------------------------

write_file_text('app/Providers/FinanceDocumentLockServiceProvider.php', <<<'PHP'
<?php

namespace App\Providers;

use App\Models\FinanceDocument;
use App\Services\Finance\FinanceDocumentLockGuard;
use Illuminate\Support\ServiceProvider;

class FinanceDocumentLockServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        FinanceDocument::updating(function (FinanceDocument $document): void {
            app(FinanceDocumentLockGuard::class)->assertCanUpdate($document);
        });
    }
}
PHP);

# ---------------------------------------------------------------------
# 3) Register provider in bootstrap/providers.php.
# ---------------------------------------------------------------------

$providersPath = 'bootstrap/providers.php';

if (! is_file(path_for($providersPath))) {
    throw new RuntimeException('Missing bootstrap/providers.php. Cannot register FinanceDocumentLockServiceProvider safely.');
}

backup_file($providersPath);

$providers = read_file_text($providersPath);

if (! str_contains($providers, 'FinanceDocumentLockServiceProvider::class')) {
    $providers = preg_replace(
        '/\];\s*$/',
        "    App\\Providers\\FinanceDocumentLockServiceProvider::class,\n];\n",
        $providers,
        1,
        $count
    );

    if ($count !== 1) {
        throw new RuntimeException('Could not register provider in bootstrap/providers.php');
    }

    write_file_text($providersPath, $providers);
} else {
    echo "Provider already registered: {$providersPath}".PHP_EOL;
}

# ---------------------------------------------------------------------
# 4) Add QA command.
# ---------------------------------------------------------------------

write_file_text('app/Console/Commands/FinanceDocumentLockGuardQaCommand.php', <<<'PHP'
<?php

namespace App\Console\Commands;

use App\Models\FinanceDocument;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\ValidationException;
use RuntimeException;
use Throwable;

class FinanceDocumentLockGuardQaCommand extends Command
{
    protected $signature = 'archilbo:finance-document-lock-guard-qa';

    protected $description = 'Verify locked finance documents cannot change number-critical fields but can update safe fields.';

    public function handle(): int
    {
        $this->info('Finance document lock guard QA started...');

        if (! Schema::hasTable('finance_documents')) {
            $this->error('Missing table: finance_documents.');

            return self::FAILURE;
        }

        foreach (['number', 'type', 'number_locked', 'number_locked_at'] as $column) {
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

        $this->line("Testing locked document: {$document->number}");

        $blockedChecks = [
            'number' => $document->number.'-BAD',
            'type' => $document->type === 'invoice' ? 'quote' : 'invoice',
            'number_locked' => false,
        ];

        if (Schema::hasColumn('finance_documents', 'issue_date')) {
            $blockedChecks['issue_date'] = now()->addDay()->toDateString();
        }

        if (Schema::hasColumn('finance_documents', 'number_locked_at')) {
            $blockedChecks['number_locked_at'] = now()->addDay();
        }

        foreach ($blockedChecks as $field => $badValue) {
            $fresh = FinanceDocument::query()->findOrFail($document->id);

            try {
                DB::transaction(function () use ($fresh, $field, $badValue): void {
                    $fresh->{$field} = $badValue;
                    $fresh->save();
                });

                $this->error("Locked field was changed but should be blocked: {$field}");

                return self::FAILURE;
            } catch (ValidationException) {
                $this->line("OK blocked locked field: {$field}");
            } catch (Throwable $e) {
                $this->error("Unexpected error while checking {$field}: ".$e->getMessage());

                return self::FAILURE;
            }
        }

        $safeField = null;

        foreach (['notes', 'status', 'pdf_path', 'excel_path'] as $candidate) {
            if (Schema::hasColumn('finance_documents', $candidate)) {
                $safeField = $candidate;
                break;
            }
        }

        if (! $safeField) {
            $this->warn('No safe field found to test allowed updates.');
        } else {
            try {
                DB::transaction(function () use ($document, $safeField): void {
                    $fresh = FinanceDocument::query()->findOrFail($document->id);
                    $original = $fresh->{$safeField};

                    if (is_string($original) || is_null($original)) {
                        $fresh->{$safeField} = trim((string) $original).' ';
                    } else {
                        $fresh->{$safeField} = $original;
                    }

                    $fresh->save();

                    throw new RuntimeException('__ROLLBACK_SAFE_FIELD_TEST__');
                });
            } catch (RuntimeException $e) {
                if ($e->getMessage() !== '__ROLLBACK_SAFE_FIELD_TEST__') {
                    $this->error('Safe field update failed: '.$e->getMessage());

                    return self::FAILURE;
                }

                $this->line("OK safe field can be updated: {$safeField}");
            } catch (Throwable $e) {
                $this->error('Safe field update failed: '.$e->getMessage());

                return self::FAILURE;
            }
        }

        $document->refresh();

        $this->table(
            ['ID', 'Number', 'Type', 'Locked', 'Locked At'],
            [[
                $document->id,
                $document->number,
                $document->type,
                $document->number_locked ? 'yes' : 'no',
                (string) $document->number_locked_at,
            ]]
        );

        $this->info('Finance document lock guard QA passed.');

        return self::SUCCESS;
    }
}
PHP);

# ---------------------------------------------------------------------
# 5) Syntax + Laravel QA.
# ---------------------------------------------------------------------

run_cmd('php -l app/Services/Finance/FinanceDocumentLockGuard.php');
run_cmd('php -l app/Providers/FinanceDocumentLockServiceProvider.php');
run_cmd('php -l app/Console/Commands/FinanceDocumentLockGuardQaCommand.php');

run_cmd('php artisan optimize:clear');

run_cmd('php artisan archilbo:finance-numbering-qa');
run_cmd('php artisan archilbo:finance-export-numbering-qa');
run_cmd('php artisan archilbo:finance-real-export-numbering-integration-qa');
run_cmd('php artisan archilbo:finance-export-qa');
run_cmd('php artisan archilbo:finance-document-lock-guard-qa');

echo PHP_EOL.'STEP 48 completed.'.PHP_EOL;