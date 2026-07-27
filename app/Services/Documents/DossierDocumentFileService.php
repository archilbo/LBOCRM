<?php

namespace App\Services\Documents;

use App\Models\DossierDocument;
use App\Models\Dossier;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class DossierDocumentFileService
{
    /** @var list<string> */
    private const PRIVATE_DISKS = ['local', 'public'];

    public function exists(DossierDocument $document): bool
    {
        return $this->diskName($document) !== null;
    }

    public function canPreview(DossierDocument $document, ?bool $exists = null): bool
    {
        if (! ($exists ?? $this->exists($document))) {
            return false;
        }

        $mimeType = strtolower((string) $document->mime_type);

        return str_starts_with($mimeType, 'image/')
            || in_array($mimeType, ['application/pdf', 'text/plain'], true);
    }

    public function locationLabel(DossierDocument $document, ?Dossier $dossier = null): ?string
    {
        if (blank($document->stored_path)) {
            return null;
        }

        $folder = basename(dirname($document->stored_path));

        return collect([
            $dossier?->dossier_number ?? $document->dossier?->dossier_number,
            $folder ? Str::of($folder)->replace('_', ' ')->headline()->toString() : null,
        ])->filter()->implode(' / ');
    }

    public function response(DossierDocument $document, bool $inline = false): BinaryFileResponse
    {
        $diskName = $this->diskName($document);

        abort_unless($diskName, 404, 'Le fichier est introuvable.');

        $filename = str_replace('"', '', $document->original_filename ?: 'document');
        $disposition = $inline ? 'inline' : 'attachment';

        return response()->file(Storage::disk($diskName)->path($document->stored_path), [
            'Content-Type' => $document->mime_type ?: 'application/octet-stream',
            'Content-Disposition' => $disposition.'; filename="'.$filename.'"',
            'Cache-Control' => 'private, no-store, max-age=0',
            'Pragma' => 'no-cache',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }

    private function diskName(DossierDocument $document): ?string
    {
        if (blank($document->stored_path)) {
            return null;
        }

        foreach (self::PRIVATE_DISKS as $disk) {
            if (Storage::disk($disk)->exists($document->stored_path)) {
                return $disk;
            }
        }

        return null;
    }
}
