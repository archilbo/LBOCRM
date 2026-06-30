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
        copy($path, $path.'.bak-payment-receipt-missingvalue');
        echo "Backup: {$relativePath}.bak-payment-receipt-missingvalue".PHP_EOL;
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

echo "PaymentResource receipt MissingValue fix started".PHP_EOL;

$path = 'app/Http/Resources/PaymentResource.php';

backup_file($path);

$content = read_file_text($path);

$replacement = <<<'PHP_CODE'
'receipt' => $this->whenLoaded('receiptDocument', function () {
                $receipt = $this->receiptDocument;

                if (! $receipt) {
                    return null;
                }

                return [
                    'id' => $receipt->id,
                    'number' => $receipt->number,
                    'type' => $receipt->type,
                    'status' => $receipt->status,
                    'issueDate' => optional($receipt->issue_date)->format('Y-m-d'),
                    'amount' => (float) ($receipt->total_ttc ?? 0),
                    'pdfPath' => $receipt->pdf_path,
                    'excelPath' => $receipt->excel_path,
                    'urls' => [
                        'show' => $this->safeRoute('finance.documents.show', ['financeDocument' => $receipt->id]),
                    ],
                ];
            }),
PHP_CODE;

$pattern = "/'receipt'\s*=>\s*\\\$this->when\(\s*\\\$this->relationLoaded\('receiptDocument'\)\s*&&\s*\\\$receipt\s*,\s*\[.*?\n\s*\]\),/s";

$newContent = preg_replace($pattern, $replacement, $content, 1, $count);

if ($count !== 1) {
    if (str_contains($content, "'receipt' => \$this->whenLoaded('receiptDocument'")) {
        echo "PaymentResource receipt block already fixed.".PHP_EOL;
        $newContent = $content;
    } else {
        throw new RuntimeException("Could not patch receipt block automatically. Open app/Http/Resources/PaymentResource.php and replace the receipt block manually.");
    }
}

write_file_text($path, $newContent);

run_cmd('php -l app/Http/Resources/PaymentResource.php');

run_cmd('php artisan optimize:clear');

run_cmd('php artisan archilbo:finance-numbering-qa');
run_cmd('php artisan archilbo:finance-export-numbering-qa');
run_cmd('php artisan archilbo:finance-real-export-numbering-integration-qa');
run_cmd('php artisan archilbo:finance-export-qa');
run_cmd('php artisan archilbo:finance-document-lock-guard-qa');
run_cmd('php artisan archilbo:finance-ui-lock-payload-qa');

echo PHP_EOL.'PaymentResource receipt MissingValue fix completed.'.PHP_EOL;