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
        copy($path, $path.'.bak-step47g2');
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

echo "STEP 47-G2 runner started".PHP_EOL;

# ---------------------------------------------------------------------
# 1) Regex-safe patch FinanceDocumentNumberingService.
# ---------------------------------------------------------------------

$servicePath = 'app/Services/Finance/FinanceDocumentNumberingService.php';
backup_file($servicePath);
$service = read_file_text($servicePath);

if (! str_contains($service, 'markExistingNumberAsLocked')) {
    $pattern = "/if\\s*\\(\\s*\\$existing\\s*!==\\s*''\\s*\\)\\s*\\{\\s*return\\s+\\$existing\\s*;\\s*\\}/m";

    $replacement = "if (\$existing !== '') {\n            \$this->markExistingNumberAsLocked(\$model);\n\n            return \$existing;\n        }";

    $service = preg_replace($pattern, $replacement, $service, 1, $count);

    if ($count !== 1) {
        throw new RuntimeException('Could not patch existing-number branch in FinanceDocumentNumberingService. Please send app/Services/Finance/FinanceDocumentNumberingService.php.');
    }

    $helper = <<<'PHP'

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

PHP;

    $service = preg_replace(
        '/\n\s*public function format\s*\(/',
        "\n".$helper."    public function format(",
        $service,
        1,
        $count
    );

    if ($count !== 1) {
        throw new RuntimeException('Could not insert markExistingNumberAsLocked helper before format().');
    }
}

write_file_text($servicePath, $service);


# ---------------------------------------------------------------------
# 2) Regex-safe patch FinancePdfGenerator.
# ---------------------------------------------------------------------

$pdfPath = 'app/Services/Finance/FinancePdfGenerator.php';
backup_file($pdfPath);
$pdf = read_file_text($pdfPath);

if (! str_contains($pdf, 'FinanceLockedDocumentNumberResolver $numberResolver')) {
    $pdf = preg_replace(
        '/public function __construct\s*\(\s*private readonly FinanceTemplateRenderer \$renderer\s*,?\s*\)\s*\{\s*\}/s',
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
    $pdf = preg_replace(
        "/(\\s*\\$document->loadMissing\\(\\['client', 'dossier', 'items', 'payments', 'template'\\]\\);\\s*)/",
        "$1            \$this->numberResolver->forModel(\$document, \$document->type, 'number', \$document->issue_date);\n            \$document->refresh()->loadMissing(['client', 'dossier', 'items', 'payments', 'template']);\n\n",
        $pdf,
        1,
        $count
    );

    if ($count !== 1) {
        throw new RuntimeException('Could not insert number lock into FinancePdfGenerator.');
    }
}

write_file_text($pdfPath, $pdf);


# ---------------------------------------------------------------------
# 3) Regex-safe patch FinanceExcelExporter.
# ---------------------------------------------------------------------

$excelPath = 'app/Services/Finance/FinanceExcelExporter.php';
backup_file($excelPath);
$excel = read_file_text($excelPath);

if (! str_contains($excel, 'FinanceLockedDocumentNumberResolver $numberResolver')) {
    $excel = preg_replace(
        '/public function __construct\s*\(\s*private readonly FinanceDocumentRenderData \$renderData\s*,?\s*\)\s*\{\s*\}/s',
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
    $excel = preg_replace(
        "/(\\s*try\\s*\\{\\s*)\\$data\\s*=\\s*\\$this->renderData->toArray\\(\\$document\\);/",
        "$1\$this->numberResolver->forModel(\$document, \$document->type, 'number', \$document->issue_date);\n            \$document->refresh()->loadMissing(['client', 'dossier', 'items', 'payments', 'template']);\n\n            \$data = \$this->renderData->toArray(\$document);",
        $excel,
        1,
        $count
    );

    if ($count !== 1) {
        throw new RuntimeException('Could not insert number lock into FinanceExcelExporter.');
    }
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

echo PHP_EOL.'STEP 47-G2 completed.'.PHP_EOL;