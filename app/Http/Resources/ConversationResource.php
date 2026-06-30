<?php

namespace App\Http\Resources;

use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ConversationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $user = $request->user();
        $participant = $this->relationLoaded('participants')
            ? $this->participants->firstWhere('user_id', $user?->id)
            : $this->participants()->where('user_id', $user?->id)->first();

        return [
            'id' => $this->id,
            'type' => $this->type,
            'subject' => $this->subject,
            'participants' => ConversationParticipantResource::collection($this->whenLoaded('participants')),
            'lastMessage' => new MessageResource($this->whenLoaded('messages', fn () => $this->messages->last())),
            'lastMessageAt' => optional($this->last_message_at)->toISOString(),
            'unreadCount' => $this->when($user, function () use ($user) {
                return Message::where('conversation_id', $this->id)
                    ->where('user_id', '!=', $user->id)
                    ->whereDoesntHave('reads', fn ($q) => $q->where('user_id', $user->id))
                    ->count();
            }),
            'createdAt' => $this->created_at?->toISOString(),
        ];
    }
}
