<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ArchiveRecordResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'dossierId' => $this->dossier_id ? (string) $this->dossier_id : '',

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

            'notes' => $this->notes,
            'updatedAt' => optional($this->updated_at)->diffForHumans(),
            'createdAt' => optional($this->created_at)->format('Y-m-d'),
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