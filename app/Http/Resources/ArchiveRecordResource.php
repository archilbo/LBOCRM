<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ArchiveRecordResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $isOverdue = $this->status === 'checked_out'
            && $this->due_at
            && $this->due_at->isPast()
            && !$this->is_lost;

        return [
            'id' => $this->id,
            'dossierId' => $this->dossier_id ? (string) $this->dossier_id : '',
            'clientId' => $this->dossier?->client_id ? (string) $this->dossier->client_id : null,

            'dossierNumber' => $this->dossier?->dossier_number ?? '-',
            'projectObject' => $this->dossier?->project_object ?? '-',
            'clientName' => $this->dossier?->client?->full_name ?? '-',
            'clientCin' => $this->dossier?->client?->cin ?? '-',

            'archiveNumber' => $this->archive_number,
            'status' => $this->status,

            'room' => $this->room,
            'shelf' => $this->shelf,
            'box' => $this->box,
            'folder' => $this->folder,
            'locationLabel' => $this->locationLabel(),

            'inDate' => optional($this->in_date)->format('Y-m-d'),
            'outDate' => optional($this->out_date)->format('Y-m-d'),
            'returnedAt' => optional($this->returned_at)->format('Y-m-d'),
            'requestedBy' => $this->requested_by,

            'requesterId' => $this->requester_id ? (string) $this->requester_id : null,
            'dueAt' => optional($this->due_at)->format('Y-m-d'),
            'checkedOutAt' => optional($this->checked_out_at)->format('Y-m-d'),
            'isLost' => $this->is_lost ?? false,
            'lostReason' => $this->lost_reason,
            'isOverdue' => $isOverdue,

            'city' => $this->when($this->relationLoaded('dossier') && $this->dossier?->relationLoaded('city'), fn () => $this->dossier->city ? [
                'id'    => $this->dossier->city->id,
                'name'  => $this->dossier->city->name,
                'code'  => $this->dossier->city->code,
                'color' => $this->dossier->city->color,
            ] : null),

            'notes' => $this->notes,
            'updatedAt' => optional($this->updated_at)->diffForHumans(),
            'createdAt' => optional($this->created_at)->format('Y-m-d'),

            'events' => $this->relationLoaded('events') ? ArchiveEventResource::collection($this->events)->resolve() : [],
        ];
    }

    private function locationLabel(): string
    {
        $parts = collect([
            $this->room,
            $this->shelf,
            $this->box,
            $this->folder,
        ])->filter()->values();

        return $parts->isNotEmpty() ? $parts->implode(' / ') : '-';
    }
}