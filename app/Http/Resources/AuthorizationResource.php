<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AuthorizationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $observations = is_array($this->observations) ? $this->observations : [];
        $observationsText = collect($observations)
            ->map(fn ($item) => is_array($item) ? ($item['text'] ?? '') : (string) $item)
            ->filter()
            ->implode("\n");

        return [
            'id' => $this->id,
            'dossierId' => $this->dossier_id ? (string) $this->dossier_id : '',
            'dossierNumber' => $this->dossier?->dossier_number ?? '-',
            'projectObject' => $this->dossier?->project_object ?? '-',
            'clientName' => $this->dossier?->client?->full_name ?? '-',
            'clientCin' => $this->dossier?->client?->cin ?? '-',

            'authorizationNumber' => $this->authorization_number,
            'submissionNumber' => $this->submission_number,
            'authorityName' => $this->authority_name,
            'authorityType' => $this->authority_type,
            'status' => $this->status,

            'submittedAt' => optional($this->submitted_at)->format('Y-m-d'),
            'approvedAt' => optional($this->approved_at)->format('Y-m-d'),
            'receivedAt' => optional($this->received_at)->format('Y-m-d'),

            'receiptPath' => $this->receipt_path,
            'finalFilePath' => $this->final_file_path,
            'observations' => $observations,
            'observationsText' => $observationsText,
            'notes' => $this->notes,

            'updatedAt' => optional($this->updated_at)->diffForHumans(),
            'createdAt' => optional($this->created_at)->format('Y-m-d'),
        ];
    }
}