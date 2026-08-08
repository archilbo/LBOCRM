<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CalendarEventResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $canUpdate = $request->user()?->can('update', $this->resource) ?? false;
        $canDelete = $request->user()?->can('delete', $this->resource) ?? false;

        return [
            'id' => $this->id,
            'key' => "calendar_event:{$this->id}",
            'sourceType' => 'calendar_event',
            'sourceId' => $this->id,
            'eventNumber' => $this->event_number,
            'type' => $this->type,
            'title' => $this->title,
            'description' => $this->description,
            'status' => $this->status,
            'priority' => $this->priority,
            'color' => $this->color,
            'startsAt' => $this->starts_at?->toIso8601String(),
            'endsAt' => $this->ends_at?->toIso8601String(),
            'allDay' => $this->all_day,
            'timezone' => $this->timezone,
            'visibility' => $this->visibility,
            'createdBy' => $this->whenLoaded('creator', fn () => new UserResource($this->creator)),
            'owner' => $this->whenLoaded('owner', fn () => new UserResource($this->owner)),
            'task' => $this->whenLoaded('task', fn () => new TaskResource($this->task)),
            'taskId' => $this->task_id,
            'clientId' => $this->client_id,
            'dossierId' => $this->dossier_id,
            'dossierDocumentId' => $this->dossier_document_id,
            'financeDocumentId' => $this->finance_document_id,
            'contractId' => $this->contract_id,
            'archiveRecordId' => $this->archive_record_id,
            'participants' => CalendarParticipantResource::collection($this->whenLoaded('participants')),
            'reminders' => CalendarReminderResource::collection($this->whenLoaded('reminders')),
            'activityLogs' => CalendarActivityResource::collection($this->whenLoaded('activityLogs')),
            'createdAt' => $this->created_at?->toIso8601String(),
            'updatedAt' => $this->updated_at?->toIso8601String(),
            'capabilities' => [
                'update' => $canUpdate,
                'delete' => $canDelete,
            ],
        ];
    }
}
