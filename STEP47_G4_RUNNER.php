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
    file_put_contents($path, ltrim($content, "\xEF\xBB\xBF"));
    echo "Written: {$relativePath}".PHP_EOL;
}

function backup_file(string $relativePath): void
{
    $path = path_for($relativePath);

    if (is_file($path)) {
        copy($path, $path.'.bak-step47g4');
        echo "Backup: {$relativePath}.bak-step47g4".PHP_EOL;
    }
}

function replace_once(string $content, string $search, string $replace, string $label): string
{
    if (! str_contains($content, $search)) {
        throw new RuntimeException("Patch point not found: {$label}");
    }

    return str_replace($search, $replace, $content);
}

function run_cmd(string $command): void
{
    echo PHP_EOL."> {$command}".PHP_EOL;
    passthru($command, $exitCode);

    if ($exitCode !== 0) {
        exit($exitCode);
    }
}

echo "STEP 47-G4 runner started".PHP_EOL;

# ---------------------------------------------------------------------
# 1) Make sure numbering service has final safe behavior.
# ---------------------------------------------------------------------

$servicePath = 'app/Services/Finance/FinanceDocumentNumberingService.php';
backup_file($servicePath);

write_file_text($servicePath, <<<'PHP'
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

        if ($this->hasColumnAttribute($model, 'number_locked')) {
            $updates['number_locked'] = true;
        }

        if ($this->hasColumnAttribute($model, 'number_locked_at') && empty($model->number_locked_at)) {
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
# 2) Patch FinancePdfGenerator using literal strings.
# ---------------------------------------------------------------------

$pdfPath = 'app/Services/Finance/FinancePdfGenerator.php';
backup_file($pdfPath);
$pdf = read_file_text($pdfPath);

if (! str_contains($pdf, 'FinanceLockedDocumentNumberResolver $numberResolver')) {
    $pdf = replace_once($pdf, <<<'TXT'
    public function __construct(private readonly FinanceTemplateRenderer $renderer)
    {
    }
TXT,
<<<'TXT'
    public function __construct(
        private readonly FinanceTemplateRenderer $renderer,
        private readonly FinanceLockedDocumentNumberResolver $numberResolver,
    ) {
    }
TXT,
    'FinancePdfGenerator constructor');
}

if (! str_contains($pdf, '$this->numberResolver->forModel($document')) {
    $pdf = replace_once($pdf, <<<'TXT'
            $document->loadMissing(['client', 'dossier', 'items', 'payments', 'template']);
            $html = $this->renderer->renderHtml($document);
TXT,
<<<'TXT'
            $document->loadMissing(['client', 'dossier', 'items', 'payments', 'template']);
            $this->numberResolver->forModel($document, $document->type, 'number', $document->issue_date);
            $document->refresh()->loadMissing(['client', 'dossier', 'items', 'payments', 'template']);

            $html = $this->renderer->renderHtml($document);
TXT,
    'FinancePdfGenerator generation lock');
}

write_file_text($pdfPath, $pdf);

# ---------------------------------------------------------------------
# 3) Patch FinanceExcelExporter using literal strings.
# ---------------------------------------------------------------------

$excelPath = 'app/Services/Finance/FinanceExcelExporter.php';
backup_file($excelPath);
$excel = read_file_text($excelPath);

if (! str_contains($excel, 'FinanceLockedDocumentNumberResolver $numberResolver')) {
    $excel = replace_once($excel, <<<'TXT'
    public function __construct(private readonly FinanceDocumentRenderData $renderData)
    {
    }
TXT,
<<<'TXT'
    public function __construct(
        private readonly FinanceDocumentRenderData $renderData,
        private readonly FinanceLockedDocumentNumberResolver $numberResolver,
    ) {
    }
TXT,
    'FinanceExcelExporter constructor');
}

if (! str_contains($excel, '$this->numberResolver->forModel($document')) {
    $excel = replace_once($excel, <<<'TXT'
        try {
            $data = $this->renderData->toArray($document);
TXT,
<<<'TXT'
        try {
            $this->numberResolver->forModel($document, $document->type, 'number', $document->issue_date);
            $document->refresh()->loadMissing(['client', 'dossier', 'items', 'payments', 'template']);

            $data = $this->renderData->toArray($document);
TXT,
    'FinanceExcelExporter generation lock');
}

write_file_text($excelPath, $excel);

# ---------------------------------------------------------------------
# 4) QA command.
# ---------------------------------------------------------------------

$qaPath = 'app/Console/Commands/FinanceRealExportNumberingIntegrationQaCommand.php';
backup_file($qaPath);

write_file_text($qaPath, <<<'PHP'
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
PHP);

# ---------------------------------------------------------------------
# 5) Syntax + Laravel QA.
# ---------------------------------------------------------------------

run_cmd('php -l app/Services/Finance/FinanceDocumentNumberingService.php');
run_cmd('php -l app/Services/Finance/FinancePdfGenerator.php');
run_cmd('php -l app/Services/Finance/FinanceExcelExporter.php');
run_cmd('php -l app/Console/Commands/FinanceRealExportNumberingIntegrationQaCommand.php');

run_cmd('php artisan optimize:clear');

run_cmd('php artisan archilbo:finance-numbering-qa');
run_cmd('php artisan archilbo:finance-export-numbering-qa');
run_cmd('php artisan archilbo:finance-real-export-numbering-integration-qa');
run_cmd('php artisan archilbo:finance-export-qa');

echo PHP_EOL.'STEP 47-G4 completed.'.PHP_EOL;