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

echo "STEP 47-C: Finance export locked numbering connector".PHP_EOL;

$existingLockedMigration = glob(__DIR__.'/database/migrations/*_add_locked_number_columns_to_finance_tables.php');

if (! $existingLockedMigration) {
    $timestamp = date('Y_m_d_His');

    write_file("database/migrations/{$timestamp}_add_locked_number_columns_to_finance_tables.php", <<<'PHP'
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected array $candidateTables = [
        'finance_documents',
        'finance_quotes',
        'finance_invoices',
        'finance_receipts',
        'finance_credit_notes',
        'quotes',
        'invoices',
        'receipts',
        'credit_notes',
    ];

    public function up(): void
    {
        foreach ($this->candidateTables as $tableName) {
            if (! Schema::hasTable($tableName)) {
                continue;
            }

            Schema::table($tableName, function (Blueprint $table) use ($tableName): void {
                if (! Schema::hasColumn($tableName, 'document_number')) {
                    $table->string('document_number', 80)->nullable()->after('id');
                }

                if (! Schema::hasColumn($tableName, 'number_locked')) {
                    $table->boolean('number_locked')->default(false)->after('document_number');
                }

                if (! Schema::hasColumn($tableName, 'number_locked_at')) {
                    $table->timestamp('number_locked_at')->nullable()->after('number_locked');
                }
            });
        }
    }

    public function down(): void
    {
        foreach ($this->candidateTables as $tableName) {
            if (! Schema::hasTable($tableName)) {
                continue;
            }

            Schema::table($tableName, function (Blueprint $table) use ($tableName): void {
                foreach (['number_locked_at', 'number_locked', 'document_number'] as $column) {
                    if (Schema::hasColumn($tableName, $column)) {
                        $table->dropColumn($column);
                    }
                }
            });
        }
    }
};
PHP);
}

write_file('app/Services/Finance/FinanceDocumentNumberingService.php', <<<'PHP'
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

write_file('app/Services/Finance/FinanceLockedDocumentNumberResolver.php', <<<'PHP'
<?php

namespace App\Services\Finance;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

class FinanceLockedDocumentNumberResolver
{
    public function __construct(
        protected FinanceDocumentNumberingService $numbering,
    ) {
    }

    public function forModel(
        Model $model,
        ?string $documentType = null,
        ?string $numberColumn = null,
        Carbon|string|null $date = null,
    ): string {
        $documentType = $documentType ?: $this->inferDocumentType($model);

        return $this->numbering->assignLockedNumber(
            model: $model,
            documentType: $documentType,
            column: $numberColumn,
            date: $date,
        );
    }

    public function payloadFor(
        Model $model,
        ?string $documentType = null,
        ?string $numberColumn = null,
        Carbon|string|null $date = null,
        array $basePayload = [],
    ): array {
        $lockedNumber = $this->forModel($model, $documentType, $numberColumn, $date);

        return array_replace($basePayload, [
            'document_number' => $lockedNumber,
            'finance_document_number' => $lockedNumber,
            'generated_document_number' => $lockedNumber,
            'locked_document_number' => $lockedNumber,
            'display_number' => $lockedNumber,

            // Compatibility aliases for older templates / exports.
            'number' => $basePayload['number'] ?? $lockedNumber,
            'reference' => $basePayload['reference'] ?? $lockedNumber,
            'ref' => $basePayload['ref'] ?? $lockedNumber,
        ]);
    }

    public function inferDocumentType(Model $model): string
    {
        $source = strtolower(class_basename($model).' '.$model->getTable());

        $aliases = [
            'credit_note' => ['credit_note', 'credit note', 'avoir'],
            'invoice' => ['invoice', 'facture'],
            'quote' => ['quote', 'devis'],
            'receipt' => ['receipt', 'recu', 'reÃ§u'],
        ];

        foreach ($aliases as $type => $needles) {
            foreach ($needles as $needle) {
                if (Str::contains($source, $needle)) {
                    return $type;
                }
            }
        }

        return 'invoice';
    }
}
PHP);

write_file('app/Services/Finance/FinanceExportNumberPayloadBuilder.php', <<<'PHP'
<?php

namespace App\Services\Finance;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

class FinanceExportNumberPayloadBuilder
{
    public function __construct(
        protected FinanceLockedDocumentNumberResolver $resolver,
    ) {
    }

    public function build(
        Model $document,
        ?string $documentType = null,
        ?string $numberColumn = null,
        Carbon|string|null $date = null,
        array $payload = [],
    ): array {
        return $this->resolver->payloadFor(
            model: $document,
            documentType: $documentType,
            numberColumn: $numberColumn,
            date: $date,
            basePayload: $payload,
        );
    }

    public function mergeInto(
        array $payload,
        Model $document,
        ?string $documentType = null,
        ?string $numberColumn = null,
        Carbon|string|null $date = null,
    ): array {
        return $this->build(
            document: $document,
            documentType: $documentType,
            numberColumn: $numberColumn,
            date: $date,
            payload: $payload,
        );
    }
}
PHP);

write_file('app/Console/Commands/FinanceExportNumberingQaCommand.php', <<<'PHP'
<?php

namespace App\Console\Commands;

use App\Services\Finance\FinanceExportNumberPayloadBuilder;
use App\Services\Finance\FinanceLockedDocumentNumberResolver;
use Illuminate\Console\Command;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Throwable;

class FinanceExportNumberingQaCommand extends Command
{
    protected $signature = 'archilbo:finance-export-numbering-qa';

    protected $description = 'Run QA checks for locked finance document numbers inside PDF/Excel export payloads.';

    public function handle(
        FinanceLockedDocumentNumberResolver $resolver,
        FinanceExportNumberPayloadBuilder $payloadBuilder,
    ): int {
        $this->info('Finance export numbering QA started...');

        try {
            config([
                'archilbo_finance_numbering.types.qa_export_invoice' => [
                    'label' => 'QA Export Invoice',
                    'prefix' => 'QAEXP',
                    'yearly_reset' => true,
                ],
            ]);

            DB::table('finance_document_number_counters')
                ->where('document_type', 'qa_export_invoice')
                ->delete();

            Schema::dropIfExists('finance_export_numbering_qa_documents');

            Schema::create('finance_export_numbering_qa_documents', function (Blueprint $table): void {
                $table->id();
                $table->string('document_number', 80)->nullable();
                $table->boolean('number_locked')->default(false);
                $table->timestamp('number_locked_at')->nullable();
                $table->timestamps();
            });

            $document = new class extends Model {
                protected $table = 'finance_export_numbering_qa_documents';

                protected $guarded = [];
            };

            $document->save();

            $first = $resolver->forModel($document, 'qa_export_invoice', 'document_number', '2026-08-01');

            $document->refresh();

            $payload = $payloadBuilder->build(
                document: $document,
                documentType: 'qa_export_invoice',
                numberColumn: 'document_number',
                date: '2026-08-01',
                payload: [
                    'client_name' => 'QA Client',
                    'total_ttc' => '1200.00',
                ],
            );

            $second = $resolver->forModel($document, 'qa_export_invoice', 'document_number', '2026-08-01');

            if ($first !== 'QAEXP-2026-0001') {
                throw new \RuntimeException("First export number invalid: {$first}");
            }

            if ($second !== $first) {
                throw new \RuntimeException("Export number changed from {$first} to {$second}");
            }

            foreach ([
                'document_number',
                'finance_document_number',
                'generated_document_number',
                'locked_document_number',
                'display_number',
            ] as $key) {
                if (($payload[$key] ?? null) !== $first) {
                    throw new \RuntimeException("Payload key {$key} does not contain locked number.");
                }
            }

            if ((bool) $document->number_locked !== true) {
                throw new \RuntimeException('number_locked was not set to true.');
            }

            if (empty($document->number_locked_at)) {
                throw new \RuntimeException('number_locked_at was not set.');
            }

            $nextDocument = new class extends Model {
                protected $table = 'finance_export_numbering_qa_documents';

                protected $guarded = [];
            };

            $nextDocument->save();

            $next = $resolver->forModel($nextDocument, 'qa_export_invoice', 'document_number', '2026-08-01');

            if ($next !== 'QAEXP-2026-0002') {
                throw new \RuntimeException("Next export number invalid: {$next}");
            }

            Schema::dropIfExists('finance_export_numbering_qa_documents');

            $this->line("OK Export payload uses locked number: {$first}");
            $this->info('Finance export numbering QA passed.');

            return self::SUCCESS;
        } catch (Throwable $e) {
            try {
                Schema::dropIfExists('finance_export_numbering_qa_documents');
            } catch (Throwable) {
                //
            }

            $this->error('Finance export numbering QA failed.');
            $this->error($e->getMessage());

            if ($this->option('verbose')) {
                $this->line($e->getTraceAsString());
            }

            return self::FAILURE;
        }
    }
}
PHP);

run_cmd('php -l app/Services/Finance/FinanceDocumentNumberingService.php');
run_cmd('php -l app/Services/Finance/FinanceLockedDocumentNumberResolver.php');
run_cmd('php -l app/Services/Finance/FinanceExportNumberPayloadBuilder.php');
run_cmd('php -l app/Console/Commands/FinanceExportNumberingQaCommand.php');

run_cmd('php artisan optimize:clear');
run_cmd('php artisan migrate');
run_cmd('php artisan archilbo:finance-numbering-qa');
run_cmd('php artisan archilbo:finance-export-numbering-qa');

echo PHP_EOL.'STEP 47-C completed.'.PHP_EOL;