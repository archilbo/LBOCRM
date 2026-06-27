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

    echo "Patched: {$relativePath}".PHP_EOL;
}

function backup_file(string $relativePath): void
{
    $path = path_for($relativePath);

    if (is_file($path)) {
        copy($path, $path.'.bak-step47g');
    }
}

function replace_required(string $content, string $search, string $replace, string $label): string
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

echo "STEP 47-G runner started".PHP_EOL;

# ---------------------------------------------------------------------
# 1) Improve FinanceDocumentNumberingService:
#    if number already exists, mark it locked instead of returning early.
# ---------------------------------------------------------------------

$servicePath = 'app/Services/Finance/FinanceDocumentNumberingService.php';
backup_file($servicePath);
$service = read_file_text($servicePath);

if (! str_contains($service, 'markExistingNumberAsLocked')) {
    $service = replace_required(
        $service,
        "        if (\$existing !== '') {\n            return \$existing;\n        }\n",
        "        if (\$existing !== '') {\n            \$this->markExistingNumberAsLocked(\$model);\n\n            return \$existing;\n        }\n",
        'FinanceDocumentNumberingService existing-number branch'
    );

    $service = replace_required(
        $service,
        "    public function format(string \$documentType, int \$number, Carbon|string|null \$date = null): string\n",
        "    protected function markExistingNumberAsLocked(Model \$model): void\n    {\n        \$updates = [];\n\n        if (\$this->hasColumnAttribute(\$model, 'number_locked')) {\n            \$updates['number_locked'] = true;\n        }\n\n        if (\$this->hasColumnAttribute(\$model, 'number_locked_at') && empty(\$model->number_locked_at)) {\n            \$updates['number_locked_at'] = now();\n        }\n\n        if (\$updates !== []) {\n            \$model->forceFill(\$updates)->save();\n        }\n    }\n\n    public function format(string \$documentType, int \$number, Carbon|string|null \$date = null): string\n",
        'FinanceDocumentNumberingService insert lock helper'
    );
}

write_file_text($servicePath, $service);


# ---------------------------------------------------------------------
# 2) Patch FinancePdfGenerator:
#    lock existing $document->number before render/path/filename.
# ---------------------------------------------------------------------

$pdfPath = 'app/Services/Finance/FinancePdfGenerator.php';
backup_file($pdfPath);
$pdf = read_file_text($pdfPath);

if (! str_contains($pdf, 'private readonly FinanceLockedDocumentNumberResolver $numberResolver')) {
    $pdf = preg_replace(
        '/public function __construct\(\s*private readonly FinanceTemplateRenderer \$renderer\s*\)\s*\{\s*\}/s',
        "public function __construct(\n        private readonly FinanceTemplateRenderer \$renderer,\n        private readonly FinanceLockedDocumentNumberResolver \$numberResolver,\n    ) {\n    }",
        $pdf,
        1,
        $count
    );

    if ($count !== 1) {
        throw new RuntimeException('Could not patch FinancePdfGenerator constructor.');
    }
}

if (! str_contains($pdf, '$this->numberResolver->forModel($document')) {
    $pdf = replace_required(
        $pdf,
        "            \$document->loadMissing(['client', 'dossier', 'items', 'payments', 'template']);\n            \$html = \$this->renderer->renderHtml(\$document);\n",
        "            \$document->loadMissing(['client', 'dossier', 'items', 'payments', 'template']);\n            \$this->numberResolver->forModel(\$document, \$document->type, 'number', \$document->issue_date);\n            \$document->refresh()->loadMissing(['client', 'dossier', 'items', 'payments', 'template']);\n\n            \$html = \$this->renderer->renderHtml(\$document);\n",
        'FinancePdfGenerator generate lock insertion'
    );
}

write_file_text($pdfPath, $pdf);


# ---------------------------------------------------------------------
# 3) Patch FinanceExcelExporter:
#    lock existing $document->number before sheet/path/filename.
# ---------------------------------------------------------------------

$excelPath = 'app/Services/Finance/FinanceExcelExporter.php';
backup_file($excelPath);
$excel = read_file_text($excelPath);

if (! str_contains($excel, 'private readonly FinanceLockedDocumentNumberResolver $numberResolver')) {
    $excel = preg_replace(
        '/public function __construct\(\s*private readonly FinanceDocumentRenderData \$renderData\s*\)\s*\{\s*\}/s',
        "public function __construct(\n        private readonly FinanceDocumentRenderData \$renderData,\n        private readonly FinanceLockedDocumentNumberResolver \$numberResolver,\n    ) {\n    }",
        $excel,
        1,
        $count
    );

    if ($count !== 1) {
        throw new RuntimeException('Could not patch FinanceExcelExporter constructor.');
    }
}

if (! str_contains($excel, '$this->numberResolver->forModel($document')) {
    $excel = replace_required(
        $excel,
        "        try {\n            \$data = \$this->renderData->toArray(\$document);\n",
        "        try {\n            \$this->numberResolver->forModel(\$document, \$document->type, 'number', \$document->issue_date);\n            \$document->refresh()->loadMissing(['client', 'dossier', 'items', 'payments', 'template']);\n\n            \$data = \$this->renderData->toArray(\$document);\n",
        'FinanceExcelExporter generate lock insertion'
    );
}

write_file_text($excelPath, $excel);


# ---------------------------------------------------------------------
# 4) Add source-level integration QA command.
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

echo PHP_EOL.'STEP 47-G completed.'.PHP_EOL;