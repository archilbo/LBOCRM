<?php

namespace App\Console\Commands;

use App\Models\FinanceDocument;
use App\Services\Finance\FinanceFileStorageService;
use Illuminate\Console\Command;

class MigrateFinanceFilesToPrivateCommand extends Command
{
    protected $signature = 'finance:migrate-private-files';
    protected $description = 'Move generated finance PDF and Excel files from public to private storage';

    public function handle(FinanceFileStorageService $storage): int
    {
        $moved = 0;
        $missing = 0;

        FinanceDocument::query()->whereNotNull('pdf_path')->orWhereNotNull('excel_path')
            ->chunkById(100, function ($documents) use ($storage, &$moved, &$missing) {
                foreach ($documents as $document) {
                    foreach (['pdf_path', 'excel_path'] as $field) {
                        $path = $document->{$field};
                        if (! $path) {
                            continue;
                        }

                        if ($storage->ensurePrivate($path)) {
                            $moved++;
                        } else {
                            $missing++;
                            $this->warn("Missing {$field}: {$document->number}");
                        }
                    }
                }
            });

        $this->info("Private finance files verified: {$moved}; missing: {$missing}.");

        return self::SUCCESS;
    }
}
