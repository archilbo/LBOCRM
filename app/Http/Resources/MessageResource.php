<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MessageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'body' => $this->body,
            'isEdited' => $this->is_edited,
            'isForwarded' => $this->is_forwarded,
            'forwardedFromMessageId' => $this->forwarded_from_message_id,
            'forwardedFrom' => $this->whenLoaded('forwardedFrom', fn () => $this->forwardedFrom ? [
                'id' => $this->forwardedFrom->id,
                'body' => $this->forwardedFrom->body,
                'userId' => $this->forwardedFrom->user_id,
                'userName' => $this->forwardedFrom->user?->name,
            ] : null),
            'userId' => $this->user_id,
            'userName' => $this->user?->name,
            'user' => new UserResource($this->whenLoaded('user')),
            'readBy' => $this->whenLoaded('reads', fn () => $this->reads->pluck('user_id')->toArray()),
            'replyTo' => $this->whenLoaded('replyTo', fn () => $this->replyTo ? [
                'id' => $this->replyTo->id,
                'body' => $this->replyTo->body,
                'userId' => $this->replyTo->user_id,
                'userName' => $this->replyTo->user?->name,
                'attachmentsCount' => $this->replyTo->relationLoaded('attachments') ? $this->replyTo->attachments->count() : 0,
            ] : null),
            'attachments' => MessageAttachmentResource::collection($this->whenLoaded('attachments')),
            'attachmentsCount' => $this->whenLoaded('attachments', fn () => $this->attachments->count()),
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->diffForHumans(),
        ];
    }
}
