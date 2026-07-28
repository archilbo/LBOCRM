<?php

namespace App\Console\Commands;

use App\Models\FinanceDocument;
use App\Services\Finance\FinanceFileStorageService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class MigrateFinanceFilesToDossierFoldersCommand extends Command
{
    protected $signature = 'finance:migrate-dossier-storage {--dry-run : Report planned moves without changing files}';

    protected $description = 'Move private finance exports from the legacy shared folder into each dossier finance folder.';

    public function handle(FinanceFileStorageService $storage): int
    {
        $dryRun = (bool) $this->option('dry-run');
        $moved = 0;
        $skipped = 0;
        $missing = 0;

        FinanceDocument::query()
            ->with(['dossier.city', 'dossier.client'])
            ->where(fn ($query) => $query->whereNotNull('pdf_path')->orWhereNotNull('excel_path'))
            ->chunkById(100, function ($documents) use ($storage, $dryRun, &$moved, &$skipped, &$missing) {
                foreach ($documents as $document) {
                    if (! $document->dossier) {
                        $this->warn("Skipped {$document->number}: no dossier is linked.");
                        $skipped++;

                        continue;
                    }

                    $directory = $storage->directory($document);

                    foreach (['pdf_path' => 'pdf', 'excel_path' => 'xlsx'] as $field => $extension) {
                        $source = $document->{$field};
                        if (! $source) {
                            continue;
                        }

                        if ($dryRun && ! $storage->disk()->exists($source) && ! Storage::disk('public')->exists($source)) {
                            $this->warn("Missing {$field}: {$document->number}");
                            $missing++;

                            continue;
                        }

                        $source = $dryRun ? $source : $storage->ensurePrivate($source);
                        if (! $source) {
                            $this->warn("Missing {$field}: {$document->number}");
                            $missing++;

                            continue;
                        }

                        $target = $directory . '/' . $document->number . '.' . $extension;
                        if ($source === $target) {
                            continue;
                        }

                        if (! $dryRun && $storage->disk()->exists($target) && ! $this->sameContents($storage, $source, $target)) {
                            $this->warn("Skipped {$document->number}: destination already contains a different {$extension} file.");
                            $skipped++;

                            continue;
                        }

                        $this->line(($dryRun ? '[DRY] ' : '') . "{$source} -> {$target}");
                        if ($dryRun) {
                            $moved++;

                            continue;
                        }

                        $storage->disk()->makeDirectory($directory);
                        if (! $storage->disk()->exists($target) && ! $storage->disk()->copy($source, $target)) {
                            $this->warn("Skipped {$document->number}: unable to copy {$extension} file.");
                            $skipped++;

                            continue;
                        }

                        $document->forceFill([$field => $target])->save();
                        $storage->disk()->delete($source);
                        $moved++;
                    }
                }
            });

        $this->info("Finance dossier storage migration: moved {$moved}; skipped {$skipped}; missing {$missing}.");

        return $missing || $skipped ? self::FAILURE : self::SUCCESS;
    }

    private function sameContents(FinanceFileStorageService $storage, string $source, string $target): bool
    {
        return hash_equals(
            hash_file('sha256', $storage->disk()->path($source)),
            hash_file('sha256', $storage->disk()->path($target)),
        );
    }
}
