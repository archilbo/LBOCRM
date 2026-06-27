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

function backup_file(string $relativePath): void
{
    $path = path_for($relativePath);

    if (is_file($path)) {
        copy($path, $path.'.bak-step48b');
        echo "Backup: {$relativePath}.bak-step48b".PHP_EOL;
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

echo "STEP 48-B runner started".PHP_EOL;

# ---------------------------------------------------------------------
# 1) Replace FinanceDocumentLockGuard with semantic comparison.
# ---------------------------------------------------------------------

backup_file('app/Services/Finance/FinanceDocumentLockGuard.php');

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

        $dirtyBlockedFields = [];

        foreach ($blockedFields as $field) {
            if (! $document->isDirty($field)) {
                continue;
            }

            if ($this->isAllowedIdempotentLockWrite($document, $field)) {
                continue;
            }

            if ($this->valuesAreSemanticallyEqual(
                $field,
                $document->getOriginal($field),
                $document->getAttribute($field),
            )) {
                continue;
            }

            $dirtyBlockedFields[] = $field;
        }

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
        return [
            'number',
            'type',
            'issue_date',
            'number_locked',
            'number_locked_at',
        ];
    }

    protected function isAllowedIdempotentLockWrite(FinanceDocument $document, string $field): bool
    {
        if ($field === 'number_locked') {
            return (bool) $document->getOriginal('number_locked') === true
                && (bool) $document->getAttribute('number_locked') === true;
        }

        if ($field === 'number_locked_at') {
            $original = $document->getOriginal('number_locked_at');
            $current = $document->getAttribute('number_locked_at');

            return ! empty($original)
                && ! empty($current)
                && (string) $original === (string) $current;
        }

        return false;
    }

    protected function valuesAreSemanticallyEqual(string $field, mixed $original, mixed $current): bool
    {
        if ($field === 'number_locked') {
            return (bool) $original === (bool) $current;
        }

        if ($field === 'issue_date' || $field === 'number_locked_at') {
            return (string) $original === (string) $current;
        }

        return (string) $original === (string) $current;
    }
}
PHP);

# ---------------------------------------------------------------------
# 2) Replace numbering service with idempotent markExistingNumberAsLocked.
# ---------------------------------------------------------------------

backup_file('app/Services/Finance/FinanceDocumentNumberingService.php');

write_file_text('app/Services/Finance/FinanceDocumentNumberingService.php', <<<'PHP'
<?php

namespace App\Services\Finance;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use RuntimeException;

class FinanceDocumentNumberingService
{
    public function __construct(
        protected FinanceSettingsService $settings,
    ) {
    }

    public function availableTypes(): array
    {
        return array_keys((array) config('archilbo_finance_numbering.types', []));
    }

    public function settingsFor(string $documentType): array
    {
        $documentType = $this->normalizeType($documentType);

        $config = (array) config("archilbo_finance_numbering.types.$documentType", []);

        $saved = [];

        if (method_exists($this->settings, 'get')) {
            $saved = (array) $this->settings->get("document_numbering.types.$documentType", []);
        }

        return array_replace_recursive($config, $saved);
    }

    public function prefixFor(string $documentType): string
    {
        $settings = $this->settingsFor($documentType);

        $prefix = strtoupper(trim((string) ($settings['prefix'] ?? 'DOC')));
        $prefix = preg_replace('/[^A-Z0-9_-]/', '', $prefix) ?: 'DOC';

        return $prefix;
    }

    public function usesYearlyReset(string $documentType): bool
    {
        $settings = $this->settingsFor($documentType);

        return (bool) ($settings['yearly_reset'] ?? true);
    }

    public function padding(): int
    {
        $saved = null;

        if (method_exists($this->settings, 'get')) {
            $saved = $this->settings->get('document_numbering.default_padding');
        }

        $padding = (int) ($saved ?: config('archilbo_finance_numbering.default_padding', 4));

        return max(3, min($padding, 10));
    }

    public function preview(string $documentType, Carbon|string|null $date = null): string
    {
        $documentType = $this->normalizeType($documentType);
        $date = $this->date($date);

        $year = $this->usesYearlyReset($documentType) ? (int) $date->format('Y') : null;

        $lastNumber = (int) DB::table('finance_document_number_counters')
            ->where('document_type', $documentType)
            ->where('year', $year)
            ->value('last_number');

        return $this->format($documentType, $lastNumber + 1, $date);
    }

    public function reserve(string $documentType, Carbon|string|null $date = null): string
    {
        $documentType = $this->normalizeType($documentType);
        $date = $this->date($date);

        return DB::transaction(function () use ($documentType, $date): string {
            $year = $this->usesYearlyReset($documentType) ? (int) $date->format('Y') : null;

            $counter = DB::table('finance_document_number_counters')
                ->where('document_type', $documentType)
                ->where('year', $year)
                ->lockForUpdate()
                ->first();

            if (! $counter) {
                DB::table('finance_document_number_counters')->insert([
                    'document_type' => $documentType,
                    'year' => $year,
                    'last_number' => 1,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                return $this->format($documentType, 1, $date);
            }

            $next = ((int) $counter->last_number) + 1;

            DB::table('finance_document_number_counters')
                ->where('id', $counter->id)
                ->update([
                    'last_number' => $next,
                    'updated_at' => now(),
                ]);

            return $this->format($documentType, $next, $date);
        });
    }

    public function assignLockedNumber(
        Model $model,
        string $documentType,
        ?string $column = null,
        Carbon|string|null $date = null,
    ): string {
        $column = $column ?: $this->detectNumberColumn($model);

        $existing = trim((string) ($model->{$column} ?? ''));

        if ($existing !== '') {
            $this->markExistingNumberAsLocked($model);

            return $existing;
        }

        $number = $this->reserve($documentType, $date);

        $model->{$column} = $number;

        if ($this->hasColumnAttribute($model, 'number_locked_at') && empty($model->number_locked_at)) {
            $model->number_locked_at = now();
        }

        if ($this->hasColumnAttribute($model, 'number_locked')) {
            $model->number_locked = true;
        }

        $model->save();

        return $number;
    }

    protected function markExistingNumberAsLocked(Model $model): void
    {
        $updates = [];

        if ($this->hasColumnAttribute($model, 'number_locked') && (bool) $model->getAttribute('number_locked') !== true) {
            $updates['number_locked'] = true;
        }

        if ($this->hasColumnAttribute($model, 'number_locked_at') && empty($model->getAttribute('number_locked_at'))) {
            $updates['number_locked_at'] = now();
        }

        if ($updates !== []) {
            $model->forceFill($updates)->save();
        }
    }

    public function format(string $documentType, int $number, Carbon|string|null $date = null): string
    {
        $documentType = $this->normalizeType($documentType);
        $date = $this->date($date);

        $prefix = $this->prefixFor($documentType);
        $sequence = str_pad((string) $number, $this->padding(), '0', STR_PAD_LEFT);

        if ($this->usesYearlyReset($documentType)) {
            return $prefix.'-'.$date->format('Y').'-'.$sequence;
        }

        return $prefix.'-'.$sequence;
    }

    protected function normalizeType(string $documentType): string
    {
        $documentType = Str::of($documentType)
            ->trim()
            ->lower()
            ->replace([' ', '-'], '_')
            ->toString();

        if ($documentType === '') {
            throw new RuntimeException('Finance document type cannot be empty.');
        }

        return $documentType;
    }

    protected function date(Carbon|string|null $date): Carbon
    {
        if ($date instanceof Carbon) {
            return $date;
        }

        if (is_string($date) && trim($date) !== '') {
            return Carbon::parse($date);
        }

        return now();
    }

    protected function detectNumberColumn(Model $model): string
    {
        foreach ([
            'document_number',
            'finance_document_number',
            'number',
            'reference',
            'generated_document_number',
        ] as $column) {
            if ($this->hasColumnAttribute($model, $column)) {
                return $column;
            }
        }

        return 'document_number';
    }

    protected function hasColumnAttribute(Model $model, string $column): bool
    {
        if (
            array_key_exists($column, $model->getAttributes())
            || in_array($column, $model->getFillable(), true)
            || $model->isFillable($column)
        ) {
            return true;
        }

        $table = $model->getTable();

        try {
            return Schema::hasTable($table) && Schema::hasColumn($table, $column);
        } catch (\Throwable) {
            return false;
        }
    }
}
PHP);

# ---------------------------------------------------------------------
# 3) Replace QA command with stronger checks.
# ---------------------------------------------------------------------

backup_file('app/Console/Commands/FinanceDocumentLockGuardQaCommand.php');

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

    protected $description = 'Verify locked finance documents cannot change number-critical fields but can regenerate exports.';

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

        try {
            DB::transaction(function () use ($document): void {
                $fresh = FinanceDocument::query()->findOrFail($document->id);
                $fresh->number_locked = true;
                $fresh->save();

                throw new RuntimeException('__ROLLBACK_IDEMPOTENT_LOCK_TEST__');
            });
        } catch (RuntimeException $e) {
            if ($e->getMessage() !== '__ROLLBACK_IDEMPOTENT_LOCK_TEST__') {
                $this->error('Idempotent lock write failed: '.$e->getMessage());

                return self::FAILURE;
            }

            $this->line('OK idempotent number_locked=true write allowed.');
        } catch (Throwable $e) {
            $this->error('Idempotent lock write failed: '.$e->getMessage());

            return self::FAILURE;
        }

        $safeField = null;

        foreach (['notes', 'status', 'pdf_path', 'excel_path'] as $candidate) {
            if (Schema::hasColumn('finance_documents', $candidate)) {
                $safeField = $candidate;
                break;
            }
        }

        if ($safeField) {
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
# 4) Syntax + QA.
# ---------------------------------------------------------------------

run_cmd('php -l app/Services/Finance/FinanceDocumentLockGuard.php');
run_cmd('php -l app/Services/Finance/FinanceDocumentNumberingService.php');
run_cmd('php -l app/Console/Commands/FinanceDocumentLockGuardQaCommand.php');

run_cmd('php artisan optimize:clear');

run_cmd('php artisan archilbo:finance-numbering-qa');
run_cmd('php artisan archilbo:finance-export-numbering-qa');
run_cmd('php artisan archilbo:finance-real-export-numbering-integration-qa');
run_cmd('php artisan archilbo:finance-export-qa');
run_cmd('php artisan archilbo:finance-document-lock-guard-qa');

echo PHP_EOL.'STEP 48-B completed.'.PHP_EOL;