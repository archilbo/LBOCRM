<?php

namespace App\Http\Controllers;

use App\Models\MessageAttachment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class MessageAttachmentController extends Controller
{
    public function view(Request $request, MessageAttachment $messageAttachment): BinaryFileResponse
    {
        $this->authorize('view', $messageAttachment->message);

        return $this->response($messageAttachment, 'inline');
    }

    public function download(Request $request, MessageAttachment $messageAttachment): BinaryFileResponse
    {
        $this->authorize('view', $messageAttachment->message);

        return $this->response($messageAttachment, 'attachment');
    }

    private function response(MessageAttachment $attachment, string $disposition): BinaryFileResponse
    {
        $path = $attachment->storagePath();
        $disk = $this->resolveDisk($attachment, $path);
        abort_unless($disk !== null, 404, 'Le fichier est introuvable.');

        $response = response()->file(Storage::disk($disk)->path($path), [
            'Content-Type' => $attachment->mime_type ?: 'application/octet-stream',
            'Cache-Control' => 'private, no-store, max-age=0',
            'Pragma' => 'no-cache',
            'X-Content-Type-Options' => 'nosniff',
        ]);

        $filename = trim((string) $attachment->original_filename) ?: 'fichier';
        $fallback = Str::ascii($filename) ?: 'fichier';
        $response->setContentDisposition($disposition, $filename, $fallback);

        return $response;
    }

    private function resolveDisk(MessageAttachment $attachment, string $path): ?string
    {
        $candidates = array_unique(array_filter([
            $attachment->disk,
            config('chat.attachment_disk'),
            'local',
            'public',
        ]));

        foreach ($candidates as $disk) {
            if (Storage::disk($disk)->exists($path)) {
                return $disk;
            }
        }

        return null;
    }
}
