<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TaskRequestResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'requestNumber' => $this->request_number,
            'requestType' => $this->request_type,
            'title' => $this->title,
            'description' => $this->description,
            'status' => $this->status,
            'requestedBy' => new UserResource($this->whenLoaded('requester')),
            'targetUser' => new UserResource($this->whenLoaded('targetUser')),
            'clientId' => $this->client_id,
            'dossierId' => $this->dossier_id,
            'dossierDocumentId' => $this->dossier_document_id,
            'financeDocumentId' => $this->finance_document_id,
            'contractId' => $this->contract_id,
            'authorizationId' => $this->authorization_id,
            'archiveRecordId' => $this->archive_record_id,
            'convertedTaskId' => $this->converted_task_id,
            'client' => $this->whenLoaded('client', fn () => ['id' => $this->client->id, 'name' => $this->client->full_name]),
            'dossier' => $this->whenLoaded('dossier', fn () => ['id' => $this->dossier->id, 'number' => $this->dossier->dossier_number, 'object' => $this->dossier->project_object]),
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->diffForHumans(),
        ];
    }
}
