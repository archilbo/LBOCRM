<?php

namespace App\Console\Commands;

use App\Http\Resources\DossierDocumentResource;
use App\Models\DossierDocument;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;

class DocumentStorageSecurityQaCommand extends Command
{
    protected $signature = 'archilbo:document-storage-security-qa';

    protected $description = 'Verify dossier document resources do not expose storage paths and downloads use controlled routes.';

    public function handle(): int
    {
        $this->info('Document storage security QA started...');

        if (! Route::has('documents.download')) {
            $this->error('Missing documents.download route.');

            return self::FAILURE;
        }

        $failures = 0;

        $documents = DossierDocument::query()
            ->with(['dossier.primaryClient', 'template'])
            ->latest()
            ->limit(25)
            ->get();

        foreach ($documents as $document) {
            $payload = DossierDocumentResource::make($document)->resolve(request());

            foreach (['storedPath', 'publicUrl', 'path', 'storagePath'] as $forbiddenKey) {
                if (array_key_exists($forbiddenKey, $payload)) {
                    $this->error("Resource exposes forbidden key {$forbiddenKey} for document #{$document->id}");
                    $failures++;
                }
            }

            if (filled($document->stored_path)) {
                $downloadUrl = $payload['downloadUrl'] ?? null;

                if (! is_string($downloadUrl) || ! str_contains($downloadUrl, '/documents/') || ! str_contains($downloadUrl, '/download')) {
                    $this->error("Document #{$document->id} has no controlled download URL.");
                    $failures++;
                }

                $existsOnLocal = Storage::disk('local')->exists($document->stored_path);
                $existsOnPublic = Storage::disk('public')->exists($document->stored_path);

                if (! $existsOnLocal && ! $existsOnPublic) {
                    $this->warn("Document #{$document->id} has a stored path but file was not found on local/public disks.");
                }
            }
        }

        $this->table(
            ['Documents Checked', 'With File', 'Local Files', 'Legacy Public Files'],
            [[
                $documents->count(),
                $documents->whereNotNull('stored_path')->count(),
                $documents->filter(fn ($document) => filled($document->stored_path) && Storage::disk('local')->exists($document->stored_path))->count(),
                $documents->filter(fn ($document) => filled($document->stored_path) && Storage::disk('public')->exists($document->stored_path))->count(),
            ]]
        );

        if ($failures > 0) {
            $this->error("Document storage security QA failed with {$failures} issue(s).");

            return self::FAILURE;
        }

        $this->info('Document storage security QA passed.');

        return self::SUCCESS;
    }
}