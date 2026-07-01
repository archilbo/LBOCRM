<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class TaskAttachmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'originalFilename' => $this->original_filename,
            'filename' => $this->filename,
            'mimeType' => $this->mime_type,
            'size' => $this->size,
            'sizeLabel' => $this->size ? $this->formatSize($this->size) : null,
            'user' => new UserResource($this->whenLoaded('user')),
            'createdAt' => $this->created_at?->toISOString(),
            'downloadUrl' => $this->when($this->filename, function () {
                if (Storage::disk('local')->exists('task-attachments/' . $this->task_id . '/' . $this->filename)) {
                    return Storage::disk('local')->url('task-attachments/' . $this->task_id . '/' . $this->filename);
                }
                return null;
            }),
        ];
    }

    private function formatSize(int $bytes): string
    {
        $units = ['B', 'KB', 'MB', 'GB'];
        $i = 0;
        while ($bytes >= 1024 && $i < count($units) - 1) {
            $bytes /= 1024;
            $i++;
        }
        return round($bytes, 1) . ' ' . $units[$i];
    }
}
