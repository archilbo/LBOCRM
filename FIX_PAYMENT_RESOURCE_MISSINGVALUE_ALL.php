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
        copy($path, $path.'.bak-payment-missingvalue-all-relations');
        echo "Backup: {$relativePath}.bak-payment-missingvalue-all-relations".PHP_EOL;
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

echo "PaymentResource MissingValue relation fix started".PHP_EOL;

$path = 'app/Http/Resources/PaymentResource.php';

backup_file($path);

$content = read_file_text($path);

if (! str_contains($content, 'use Illuminate\Http\Resources\MissingValue;')) {
    $content = preg_replace(
        '/namespace App\\\\Http\\\\Resources;\s*/',
        "namespace App\\Http\\Resources;\n\nuse Illuminate\\Http\\Resources\\MissingValue;\n",
        $content,
        1,
        $namespaceCount
    );

    if ($namespaceCount !== 1) {
        throw new RuntimeException('Could not add MissingValue import.');
    }
}

$normalizer = <<<'PHP_CODE'
        foreach (['document', 'client', 'dossier', 'receipt'] as $relationVariable) {
            if (isset(${$relationVariable}) && ${$relationVariable} instanceof MissingValue) {
                ${$relationVariable} = null;
            }
        }

PHP_CODE;

if (! str_contains($content, '$relationVariable') && ! str_contains($content, 'instanceof MissingValue')) {
    $content = preg_replace(
        '/(\s*return\s*\[\s*)/',
        "\n".$normalizer.'$1',
        $content,
        1,
        $returnCount
    );

    if ($returnCount !== 1) {
        throw new RuntimeException('Could not insert MissingValue normalizer before return array.');
    }
}

write_file_text($path, $content);

run_cmd('php -l app/Http/Resources/PaymentResource.php');

run_cmd('php artisan optimize:clear');

run_cmd('php artisan archilbo:finance-numbering-qa');
run_cmd('php artisan archilbo:finance-export-numbering-qa');
run_cmd('php artisan archilbo:finance-real-export-numbering-integration-qa');
run_cmd('php artisan archilbo:finance-export-qa');
run_cmd('php artisan archilbo:finance-document-lock-guard-qa');
run_cmd('php artisan archilbo:finance-ui-lock-payload-qa');

echo PHP_EOL.'PaymentResource MissingValue relation fix completed.'.PHP_EOL;