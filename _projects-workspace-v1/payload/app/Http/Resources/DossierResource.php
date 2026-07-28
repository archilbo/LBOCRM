<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DossierResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $city = $this->relationLoaded('city') ? $this->city : null;

        return [
            'id' => $this->id,
            'clientId' => $this->client_id ? (string) $this->client_id : '',
            'clientName' => $this->client?->full_name ?? '-',
            'clientNumber' => $this->client?->client_number ?? '-',
            'clientCin' => $this->client?->cin ?? '-',
            'clientPhone' => $this->client?->phone ?? '-',
            'dossierNumber' => $this->dossier_number,
            'sequenceNumber' => $this->sequence_number,
            'period' => $this->period,
            'projectObject' => $this->project_object,
            'description' => $this->description,
            'projectAddress' => $this->project_address,
            'province' => $this->province,
            'commune' => $this->commune,
            'landTitleNumber' => $this->land_title_number,
            'landSurface' => $this->land_surface !== null ? (float) $this->land_surface : null,
            'floorArea' => $this->floor_area !== null ? (float) $this->floor_area : null,
            'status' => $this->status,
            'workflowStep' => $this->workflow_step,
            'openedAt' => optional($this->opened_at)->format('Y-m-d'),
            'closedAt' => optional($this->closed_at)->format('Y-m-d'),
            'updatedAt' => optional($this->updated_at)->diffForHumans(),
            'updatedAtIso' => optional($this->updated_at)->toIso8601String(),
            'createdAt' => optional($this->created_at)->format('Y-m-d'),
            'notes' => $this->notes,
            'documentsCount' => (int) ($this->documents_count ?? $this->documents()->count()),
            'financeDocumentsCount' => (int) ($this->finance_documents_count ?? $this->financeDocuments()->count()),
            'hasContract' => (bool) ($this->contract_exists ?? $this->contract()->exists()),
            'hasArchiveRecord' => (bool) ($this->archive_record_exists ?? $this->archiveRecord()->exists()),
            'city' => $city ? [
                'id' => $city->id,
                'name' => $city->name,
                'code' => $city->code,
                'color' => $city->color,
            ] : null,
        ];
    }
}
