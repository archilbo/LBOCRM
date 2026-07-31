<?php

namespace App\Services\Documents;

use App\Models\DocumentTemplate;
use App\Models\Dossier;
use App\Models\DossierDocument;
use App\Services\Dossiers\DossierPathBuilder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;
use Throwable;

final class DossierDocumentUploadService
{
    public function __construct(
        private readonly DossierPathBuilder $paths,
    ) {
    }

    /**
     * @param array<string, UploadedFile> $filesBySide
     */
    public function upload(
        Dossier $dossier,
        DocumentTemplate $template,
        array $filesBySide,
        string $status,
        ?string $notes,
    ): Collection {
        $newPaths = [];
        $oldPaths = [];

        try {
            $documents = DB::transaction(
                function () use (
                    $dossier,
                    $template,
                    $filesBySide,
                    $status,
                    $notes,
                    &$newPaths,
                    &$oldPaths,
                ): Collection {
                    return collect($filesBySide)
                        ->map(function (
                            UploadedFile $file,
                            string $side,
                        ) use (
                            $dossier,
                            $template,
                            $status,
                            $notes,
                            &$newPaths,
                            &$oldPaths,
                        ): DossierDocument {
                            $existing = DossierDocument::query()
                                ->where(
                                    'dossier_id',
                                    $dossier->id
                                )
                                ->where(
                                    'document_template_id',
                                    $template->id
                                )
                                ->where(
                                    'document_side',
                                    $side
                                )
                                ->lockForUpdate()
                                ->first();

                            $clientName = mb_strtoupper(
                                $dossier->client?->full_name
                                    ?? 'CLIENT'
                            );

                            $typeName = mb_strtoupper(
                                $template->name ?? 'DOCUMENT'
                            );

                            $sidePrefix = match ($side) {
                                DossierDocument::SIDE_FRONT =>
                                    'RECTO',

                                DossierDocument::SIDE_BACK =>
                                    'VERSO',

                                default => null,
                            };

                            $storageFilename = implode(
                                '_',
                                array_filter([
                                    $sidePrefix,
                                    $typeName,
                                    $clientName,
                                    (string) Str::uuid(),
                                ])
                            );

                            $relativePath =
                                $this->paths->documentPath(
                                    $dossier,
                                    $template,
                                    $storageFilename,
                                );

                            $storedPath = $file->storeAs(
                                dirname($relativePath),
                                basename($relativePath),
                                'local',
                            );

                            if (! is_string($storedPath)) {
                                throw new RuntimeException(
                                    'The document could not be stored.'
                                );
                            }

                            $newPaths[] = $storedPath;

                            if (
                                $existing?->stored_path
                                && $existing->stored_path
                                    !== $storedPath
                            ) {
                                $oldPaths[] =
                                    $existing->stored_path;
                            }

                            $payload = [
                                'dossier_id' => $dossier->id,
                                'document_template_id' =>
                                    $template->id,
                                'document_side' => $side,
                                'document_number' =>
                                    $existing?->document_number
                                    ?? $this->nextDocumentNumber(),
                                'original_filename' =>
                                    $file->getClientOriginalName(),
                                'stored_path' => $storedPath,
                                'mime_type' =>
                                    $file->getClientMimeType(),
                                'size_bytes' => $file->getSize(),
                                'status' => $status,
                                'uploaded_at' => now(),
                                'verified_at' =>
                                    $status === 'verified'
                                        ? now()
                                        : null,
                                'notes' => $notes,
                            ];

                            if ($existing) {
                                $existing->update($payload);

                                return $existing->fresh();
                            }

                            return DossierDocument::query()
                                ->create($payload);
                        })
                        ->values();
                }
            );
        } catch (Throwable $exception) {
            foreach (array_unique($newPaths) as $path) {
                Storage::disk('local')->delete($path);
            }

            throw $exception;
        }

        foreach (
            array_diff(
                array_unique($oldPaths),
                array_unique($newPaths),
            ) as $path
        ) {
            $this->deleteStoredPath($path);
        }

        return $documents;
    }

    private function nextDocumentNumber(): string
    {
        $year = now()->format('Y');
        $next = DossierDocument::query()->count() + 1;

        do {
            $number = sprintf(
                'DOC-%s-%04d',
                $year,
                $next
            );

            $next++;
        } while (
            DossierDocument::query()
                ->where(
                    'document_number',
                    $number
                )
                ->exists()
        );

        return $number;
    }

    private function deleteStoredPath(
        ?string $path
    ): void {
        if (! $path) {
            return;
        }

        foreach (['local', 'public'] as $disk) {
            if (Storage::disk($disk)->exists($path)) {
                Storage::disk($disk)->delete($path);

                return;
            }
        }
    }
}
