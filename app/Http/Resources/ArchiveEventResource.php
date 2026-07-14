<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ArchiveEventResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'archiveRecordId' => $this->archive_record_id,
            'actorId' => $this->actor_id ? (string) $this->actor_id : null,
            'actorName' => $this->actor?->name ?? 'System',
            'type' => $this->type,
            'payload' => $this->payload ?? [],
            'createdAt' => optional($this->created_at)->diffForHumans(),
            'createdAtRaw' => optional($this->created_at)->format('Y-m-d H:i:s'),
        ];
    }
}
