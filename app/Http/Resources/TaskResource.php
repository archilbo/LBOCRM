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
            'type' => $this->type,
            'status' => $this->status,
            'priority' => $this->priority,
            'impact' => $this->impact,
            'progress' => (int) $this->progress,
            'category' => $this->category,
            'startDate' => optional($this->start_date)->format('Y-m-d'),
            'dueDate' => optional($this->due_date)->format('Y-m-d'),
            'completedAt' => optional($this->completed_at)->toISOString(),
            'reviewedAt' => optional($this->reviewed_at)->toISOString(),
            'blockedReason' => $this->blocked_reason,
            'estimatedMinutes' => $this->estimated_minutes,
            'actualMinutes' => $this->actual_minutes,
            'recurrenceRule' => $this->recurrence_rule,
            'createdBy' => new UserResource($this->whenLoaded('creator')),
            'assignedBy' => new UserResource($this->whenLoaded('assigner')),
            'assignees' => $this->whenLoaded('assignees', fn () => UserResource::collection($this->assignees)->resolve(), []),
            'watchers' => $this->whenLoaded('watchers', fn () => UserResource::collection($this->watchers)->resolve(), []),
            'checklistItems' => $this->whenLoaded('checklistItems', fn () => TaskChecklistItemResource::collection($this->checklistItems)->resolve(), []),
            'comments' => TaskCommentResource::collection($this->whenLoaded('comments')),
            'attachments' => TaskAttachmentResource::collection($this->whenLoaded('attachments')),
            'activityLogs' => TaskActivityResource::collection($this->whenLoaded('activityLogs')),
            'commentsCount' => (int) ($this->whenCounted('comments') ?? 0),
            'attachmentsCount' => (int) ($this->whenCounted('attachments') ?? 0),
            'dossierId' => $this->dossier_id,
            'clientId' => $this->client_id,
            'dossierDocumentId' => $this->dossier_document_id,
            'financeDocumentId' => $this->finance_document_id,
            'contractId' => $this->contract_id,
            'authorizationId' => $this->authorization_id,
            'archiveRecordId' => $this->archive_record_id,
            'conversationId' => $this->conversation_id,
            'dossier' => $this->whenLoaded('dossier', fn () => ['id' => $this->dossier->id, 'number' => $this->dossier->dossier_number, 'object' => $this->dossier->project_object]),
            'client' => $this->whenLoaded('client', fn () => ['id' => $this->client->id, 'name' => $this->client->full_name]),
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->diffForHumans(),
        ];
    }
}
