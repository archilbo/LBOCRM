<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NotificationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $data = $this->data;

        $actionUrl = null;
        if (isset($data['task_id'])) {
            $actionUrl = "/tasks/{$data['task_id']}";
        } elseif (isset($data['conversation_id'])) {
            $actionUrl = '/inbox';
        } elseif (isset($data['calendar_event_id'])) {
            $actionUrl = '/calendar';
        } elseif (isset($data['dossier_id'])) {
            $actionUrl = "/dossiers/{$data['dossier_id']}";
        } elseif (isset($data['contract_id'])) {
            $actionUrl = '/contracts';
        } elseif (isset($data['finance_document_id'])) {
            $actionUrl = "/finance/documents/{$data['finance_document_id']}";
        } elseif (isset($data['document_id'])) {
            $actionUrl = '/documents';
        }

        return [
            'id' => $this->id,
            'type' => class_basename($this->type),
            'data' => $data,
            'readAt' => optional($this->read_at)->toISOString(),
            'isRead' => $this->read_at !== null,
            'createdAt' => $this->created_at?->toISOString(),
            'createdAtHuman' => $this->created_at?->diffForHumans(),
            'actionUrl' => $actionUrl,
        ];
    }
}
