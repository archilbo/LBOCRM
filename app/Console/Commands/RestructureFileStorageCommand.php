<?php

namespace App\Console\Commands;

use App\Models\Contract;
use App\Models\Dossier;
use App\Models\DossierDocument;
use App\Services\Dossiers\DossierPathBuilder;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class RestructureFileStorageCommand extends Command
{
    protected $signature = 'archilbo:restructure-files {--dry-run : Simulate without moving files}';

    protected $description = 'Migrate all existing files from old flat structure to new hierarchical CITY/Commune/Client/Project/Type structure on local disk';

    public function handle(): int
    {
        $dryRun = $this->option('dry-run');
        $pathBuilder = app(DossierPathBuilder::class);

        $this->info(($dryRun ? '[DRY-RUN] ' : '') . 'Restructuring file storage...');

        $documentsMigrated = 0;
        $contractsMigrated = 0;

        // ── Migrate dossier documents ──
        $documents = DossierDocument::query()
            ->with(['dossier.city', 'dossier.client', 'template'])
            ->whereNotNull('stored_path')
            ->get();

        $this->info("Found {$documents->count()} dossier documents with stored paths.");

        foreach ($documents as $document) {
            $oldPath = $document->stored_path;
            $sourceDisk = $this->resolveDisk($oldPath);

            if (!$sourceDisk) {
                $this->warn("Document #{$document->id}: file not found at {$oldPath}");
                continue;
            }

            $dossier = $document->dossier;
            if (!$dossier) {
                $this->warn("Document #{$document->id}: dossier not found, skipping.");
                continue;
            }

            $newPath = $pathBuilder->documentPath(
                $dossier,
                $document->template,
                $document->original_filename ?? 'document-' . $document->id
            );

            if ($oldPath === $newPath) {
                continue;
            }

            if ($dryRun) {
                $this->line("  [DRY-RUN] Would move: {$oldPath} → {$newPath}");
                $documentsMigrated++;
                continue;
            }

            try {
                $contents = Storage::disk($sourceDisk)->get($oldPath);
                Storage::disk('local')->put($newPath, $contents);
                $document->update(['stored_path' => $newPath]);
                Storage::disk($sourceDisk)->delete($oldPath);
                $documentsMigrated++;
                $this->line("  Moved document #{$document->id}: {$oldPath} → {$newPath}");
            } catch (\Throwable $e) {
                $this->error("Document #{$document->id}: failed - {$e->getMessage()}");
            }
        }

        // ── Migrate contract files ──
        $contracts = Contract::query()
            ->with(['dossier.city', 'dossier.client'])
            ->where(function ($q) {
                $q->whereNotNull('generated_document_path')
                  ->orWhereNotNull('pdf_path');
            })
            ->get();

        $this->info("Found {$contracts->count()} contracts with file paths.");

        foreach ($contracts as $contract) {
            $dossier = $contract->dossier;
            if (!$dossier) {
                $this->warn("Contract #{$contract->id}: dossier not found, skipping.");
                continue;
            }

            // Migrate DOCX
            if ($contract->generated_document_path) {
                $oldDocxPath = $contract->generated_document_path;
                $sourceDisk = $this->resolveDisk($oldDocxPath);

                if ($sourceDisk) {
                    $newDocxPath = $pathBuilder->contractDocxPath($contract, $dossier);

                    if ($oldDocxPath !== $newDocxPath) {
                        if ($dryRun) {
                            $this->line("  [DRY-RUN] Would move DOCX: {$oldDocxPath} → {$newDocxPath}");
                        } else {
                            try {
                                $contents = Storage::disk($sourceDisk)->get($oldDocxPath);
                                Storage::disk('local')->put($newDocxPath, $contents);
                                $contract->update(['generated_document_path' => $newDocxPath]);
                                Storage::disk($sourceDisk)->delete($oldDocxPath);
                                $this->line("  Moved DOCX: {$oldDocxPath} → {$newDocxPath}");
                            } catch (\Throwable $e) {
                                $this->error("Contract #{$contract->id} DOCX: failed - {$e->getMessage()}");
                            }
                        }
                        $contractsMigrated++;
                    }
                } else {
                    $this->warn("Contract #{$contract->id}: DOCX not found at {$oldDocxPath}");
                }
            }

            // Migrate PDF
            if ($contract->pdf_path) {
                $oldPdfPath = $contract->pdf_path;
                $sourceDisk = $this->resolveDisk($oldPdfPath);

                if ($sourceDisk) {
                    $newPdfPath = $pathBuilder->contractPdfPath($contract, $dossier);

                    if ($oldPdfPath !== $newPdfPath) {
                        if ($dryRun) {
                            $this->line("  [DRY-RUN] Would move PDF: {$oldPdfPath} → {$newPdfPath}");
                        } else {
                            try {
                                $contents = Storage::disk($sourceDisk)->get($oldPdfPath);
                                Storage::disk('local')->put($newPdfPath, $contents);
                                $contract->update(['pdf_path' => $newPdfPath]);
                                Storage::disk($sourceDisk)->delete($oldPdfPath);
                                $this->line("  Moved PDF: {$oldPdfPath} → {$newPdfPath}");
                            } catch (\Throwable $e) {
                                $this->error("Contract #{$contract->id} PDF: failed - {$e->getMessage()}");
                            }
                        }
                        $contractsMigrated++;
                    }
                } else {
                    $this->warn("Contract #{$contract->id}: PDF not found at {$oldPdfPath}");
                }
            }
        }

        $this->newLine();
        $this->info("Done. Documents migrated: {$documentsMigrated}, Contract files migrated: {$contractsMigrated}");

        return self::SUCCESS;
    }

    private function resolveDisk(string $path): ?string
    {
        if (Storage::disk('local')->exists($path)) {
            return 'local';
        }

        if (Storage::disk('public')->exists($path)) {
            return 'public';
        }

        return null;
    }
}
