<?php

namespace App\Services\Documents;

use App\Models\DossierDocument;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

/**
 * Reads a bounded, UTF-8-validated text preview from an authorized private
 * document. The controller authorizes with the existing documents.view
 * policy before calling this service; every response carries private/no-store
 * cache headers and nosniff, and never exposes the physical storage path.
 */
class DossierDocumentContentService
{
    public function __construct(
        private readonly DossierDocumentFileService $files,
    ) {}

    public function response(DossierDocument $document): JsonResponse
    {
        $diskName = $this->files->diskName($document);

        if ($diskName === null) {
            return $this->json(['reason' => 'missing'], 404);
        }

        if (! $this->files->canPreviewText($document)) {
            return $this->json(['reason' => 'unsupported'], 415);
        }

        $limit = max(1, (int) config('documents.content_preview_limit', 1024 * 1024));

        // Read at most limit + 1 bytes: never the whole file, always enough
        // to know whether the preview was truncated.
        $handle = Storage::disk($diskName)->readStream($document->stored_path);

        if ($handle === false) {
            return $this->json(['reason' => 'missing'], 404);
        }

        try {
            $raw = fread($handle, $limit + 1);
        } finally {
            fclose($handle);
        }

        if ($raw === false) {
            return $this->json(['reason' => 'missing'], 404);
        }

        // Obvious binary content (null bytes) is never decoded as text.
        if (str_contains($raw, "\0")) {
            return $this->json(['reason' => 'binary'], 422);
        }

        if (! mb_check_encoding($raw, 'UTF-8')) {
            return $this->json(['reason' => 'encoding'], 422);
        }

        $truncated = strlen($raw) > $limit;

        return $this->json([
            'content' => $truncated ? substr($raw, 0, $limit) : $raw,
            'truncated' => $truncated,
            'previewBytes' => $truncated ? $limit : strlen($raw),
            'totalBytes' => (int) ($document->size_bytes ?? Storage::disk($diskName)->size($document->stored_path)),
            'mimeType' => strtolower(trim((string) $document->mime_type)),
        ]);
    }

    private function json(array $payload, int $status = 200): JsonResponse
    {
        return response()->json($payload, $status, [
            'Cache-Control' => 'private, no-store, max-age=0',
            'Pragma' => 'no-cache',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }
}
