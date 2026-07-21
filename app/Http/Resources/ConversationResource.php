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
        $participants = $this->relationLoaded('participants') ? $this->participants : $this->participants()->with('user')->get();
        $otherParticipants = $participants->filter(fn ($participant) => $participant->user_id !== $user?->id);
        $participantNames = $otherParticipants
            ->map(fn ($participant) => $participant->user?->name)
            ->filter()
            ->values();
        $displayName = $this->type === 'group'
            ? ($this->subject ?: $participantNames->implode(', '))
            : ($participantNames->first() ?: $this->subject);
        $displayName = $displayName ?: 'Conversation #' . $this->id;

        $participant = $this->relationLoaded('participants')
            ? $this->participants->firstWhere('user_id', $user?->id)
            : $this->participants()->where('user_id', $user?->id)->first();

        $onlineCount = $participants->filter(fn ($p) => $p->user?->last_seen_at && now()->diffInMinutes($p->user->last_seen_at, true) < 5)->count();

        return [
            'id' => $this->id,
            'type' => $this->type,
            'subject' => $this->subject,
            'category' => $this->category,
            'customCategory' => $this->custom_category,
            'displayName' => $displayName,
            'avatarInitials' => collect(explode(' ', $displayName))
                ->filter()
                ->take(2)
                ->map(fn ($part) => mb_strtoupper(mb_substr($part, 0, 1)))
                ->implode('') ?: '?',
            'participants' => $this->whenLoaded('participants', fn () =>
                ConversationParticipantResource::collection($this->participants)->resolve()
            ) ?? [],
            'participantsCount' => $participants->count(),
            'onlineCount' => $onlineCount,
            'lastMessage' => $this->whenLoaded('messages', function () {
                $first = $this->messages->first();
                return $first ? (new MessageResource($first))->resolve() : null;
            }),
            'lastMessageAt' => optional($this->last_message_at)->toISOString(),
            'unreadCount' => $this->when($user, function () use ($user) {
                if (isset($this->unread_messages_count)) {
                    return (int) $this->unread_messages_count;
                }
                return Message::where('conversation_id', $this->id)
                    ->where('user_id', '!=', $user->id)
                    ->whereDoesntHave('reads', fn ($q) => $q->where('user_id', $user->id))
                    ->count();
            }),
            'createdAt' => $this->created_at?->toISOString(),
            'archivedAt' => $participant ? optional($participant->archived_at)->toISOString() : null,
            'isPinned' => (bool) $participant?->pinned_at,
            'isMuted' => (bool) $participant?->muted_at,
            'draft' => $participant?->draft,
            'context' => [
                'taskId' => $this->task_id,
                'dossierId' => $this->dossier_id,
                'clientId' => $this->client_id,
                'financeDocumentId' => $this->finance_document_id,
            ],
        ];
    }
}
