<?php

namespace App\Http\Controllers;

use App\Models\MessageAttachment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
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
        $disk = $attachment->disk ?: 'public';
        $path = $attachment->storagePath();
        abort_unless(Storage::disk($disk)->exists($path), 404, 'Le fichier est introuvable.');

        return response()->file(Storage::disk($disk)->path($path), [
            'Content-Type' => $attachment->mime_type ?: 'application/octet-stream',
            'Content-Disposition' => $disposition.'; filename="'.str_replace('"', '', $attachment->original_filename).'"',
            'Cache-Control' => 'private, no-store, max-age=0',
            'Pragma' => 'no-cache',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }
}
