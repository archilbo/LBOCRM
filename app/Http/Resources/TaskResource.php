<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TaskResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'taskNumber' => $this->task_number,
            'title' => $this->title,
            'description' => $this->description,
            'status' => $this->status,
            'priority' => $this->priority,
            'progress' => $this->progress,
            'category' => $this->category,
            'startDate' => optional($this->start_date)->format('Y-m-d'),
            'dueDate' => optional($this->due_date)->format('Y-m-d'),
            'completedAt' => optional($this->completed_at)->toISOString(),
            'createdBy' => new UserResource($this->whenLoaded('creator')),
            'assignedBy' => new UserResource($this->whenLoaded('assigner')),
            'assignees' => UserResource::collection($this->whenLoaded('assignees')),
            'watchers' => UserResource::collection($this->whenLoaded('watchers')),
            'checklistItems' => TaskChecklistItemResource::collection($this->whenLoaded('checklistItems')),
            'commentsCount' => $this->whenCounted('comments'),
            'attachmentsCount' => $this->whenCounted('attachments'),
            'dossierId' => $this->dossier_id,
            'clientId' => $this->client_id,
            'dossierDocumentId' => $this->dossier_document_id,
            'financeDocumentId' => $this->finance_document_id,
            'contractId' => $this->contract_id,
            'authorizationId' => $this->authorization_id,
            'archiveRecordId' => $this->archive_record_id,
            'dossier' => $this->whenLoaded('dossier', fn () => ['id' => $this->dossier->id, 'number' => $this->dossier->dossier_number, 'object' => $this->dossier->project_object]),
            'client' => $this->whenLoaded('client', fn () => ['id' => $this->client->id, 'name' => $this->client->full_name]),
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->diffForHumans(),
        ];
    }
}
