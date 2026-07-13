<?php

namespace App\Services\Chat;

use App\Events\Chat\InboxUpdated;
use App\Events\Chat\MessageCreated;
use App\Models\Conversation;
use App\Models\ConversationParticipant;
use App\Models\Message;
use App\Models\MessageAttachment;
use App\Models\User;
use App\Http\Resources\ConversationResource;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ChatService
{
    public function findOrCreateDirectConversation(User $user1, User $user2): Conversation
    {
        $existing = Conversation::where('type', 'direct')
            ->whereHas('participants', fn ($q) => $q->where('user_id', $user1->id))
            ->whereHas('participants', fn ($q) => $q->where('user_id', $user2->id))
            ->first();

        if ($existing) return $existing;

        $conversation = Conversation::create(['type' => 'direct']);
        $conversation->participants()->createMany([
            ['user_id' => $user1->id],
            ['user_id' => $user2->id],
        ]);

        return $conversation;
    }

    public function sendMessage(
        Conversation $conversation,
        User $user,
        ?string $body = null,
        array $images = [],
        ?int $replyToMessageId = null,
        bool $isForwarded = false,
    ): Message {
        $message = Message::create([
            'conversation_id' => $conversation->id,
            'user_id' => $user->id,
            'body' => $body,
            'reply_to_message_id' => $replyToMessageId,
            'is_forwarded' => $isForwarded,
        ]);

        $this->storeAttachments($message, $user, $images);

        $conversation->update(['last_message_at' => now()]);

        $conversation->participants()
            ->where('user_id', '!=', $user->id)
            ->each(fn (ConversationParticipant $p) => $p->user->notify(
                new \App\Notifications\ChatMessageNotification($conversation, $message, $user)
            ));

        $message->load(['user', 'attachments', 'replyTo.user', 'forwardedFrom.user', 'reads']);
        try { broadcast(new MessageCreated($message)); } catch (\Throwable $e) { Log::debug('Broadcast failed: ' . $e->getMessage()); }

        $conversation->load(['participants.user']);
        $this->loadLatestMessagePreviews(collect([$conversation]));
        $convResource = (new ConversationResource($conversation))->resolve();
        $conversation->participants()
            ->where('user_id', '!=', $user->id)
            ->each(fn (ConversationParticipant $p) => $this->broadcastInboxSafely($p->user_id, [
                'eventType' => 'message_created',
                'conversation' => $convResource,
                'unreadCount' => $this->unreadCount($p->user),
            ]));

        return $message;
    }

    public function forwardMessage(Conversation $targetConversation, User $user, Message $originalMessage): Message
    {
        $images = $originalMessage->attachments()->get()->map(function (MessageAttachment $att) {
            $path = 'message-attachments/' . $att->message_id . '/' . $att->filename;
            if (Storage::disk($att->disk ?? 'public')->exists($path)) {
                $localPath = Storage::disk($att->disk ?? 'public')->path($path);
                return new UploadedFile($localPath, $att->original_filename, $att->mime_type, null, true);
            }
            return null;
        })->filter()->values()->toArray();

        $message = Message::create([
            'conversation_id' => $targetConversation->id,
            'user_id' => $user->id,
            'body' => $originalMessage->body,
            'is_forwarded' => true,
            'forwarded_from_message_id' => $originalMessage->id,
        ]);

        foreach ($images as $image) {
            if ($image instanceof UploadedFile) {
                $storedPath = $image->store('message-attachments/' . $message->id, 'public');
                MessageAttachment::create([
                    'message_id' => $message->id,
                    'user_id' => $user->id,
                    'filename' => basename($storedPath),
                    'original_filename' => $image->getClientOriginalName(),
                    'mime_type' => $image->getMimeType(),
                    'size' => $image->getSize(),
                    'disk' => 'public',
                ]);
            }
        }

        $targetConversation->update(['last_message_at' => now()]);

        $targetConversation->participants()
            ->where('user_id', '!=', $user->id)
            ->each(fn (ConversationParticipant $p) => $p->user->notify(
                new \App\Notifications\ChatMessageNotification($targetConversation, $message, $user)
            ));

        $message->load(['user', 'attachments', 'replyTo.user', 'forwardedFrom.user', 'reads']);
        try { broadcast(new MessageCreated($message)); } catch (\Throwable $e) { Log::debug('Broadcast failed: ' . $e->getMessage()); }

        $targetConversation->load(['participants.user']);
        $this->loadLatestMessagePreviews(collect([$targetConversation]));
        $convResource = (new ConversationResource($targetConversation))->resolve();
        $targetConversation->participants()
            ->where('user_id', '!=', $user->id)
            ->each(fn (ConversationParticipant $p) => $this->broadcastInboxSafely($p->user_id, [
                'eventType' => 'message_created',
                'conversation' => $convResource,
                'unreadCount' => $this->unreadCount($p->user),
            ]));

        return $message;
    }

    public function markAsRead(Conversation $conversation, User $user): void
    {
        $participant = $conversation->participants()->where('user_id', $user->id)->first();
        if ($participant) {
            $participant->update(['last_read_at' => now()]);
        }

        $conversation->messages()
            ->where('user_id', '!=', $user->id)
            ->whereDoesntHave('reads', fn ($q) => $q->where('user_id', $user->id))
            ->each(fn (Message $message) => $message->reads()->create(['user_id' => $user->id]));
    }

    public function unreadCount(User $user): int
    {
        return Message::whereHas('conversation.participants', fn ($q) => $q->where('user_id', $user->id))
            ->where('user_id', '!=', $user->id)
            ->whereDoesntHave('reads', fn ($q) => $q->where('user_id', $user->id))
            ->count();
    }

    public function updateLastSeen(User $user): void
    {
        $user->update(['last_seen_at' => now()]);
    }

    public function loadLatestMessagePreviews(Collection $conversations): Collection
    {
        $conversationIds = $conversations->pluck('id')->filter()->values();

        if ($conversationIds->isEmpty()) {
            return $conversations;
        }

        $latestMessageIds = Message::query()
            ->selectRaw('MAX(id) as id')
            ->whereIn('conversation_id', $conversationIds)
            ->groupBy('conversation_id')
            ->pluck('id');

        $messages = Message::query()
            ->with(['user', 'attachments', 'forwardedFrom.user'])
            ->whereIn('id', $latestMessageIds)
            ->get()
            ->keyBy('conversation_id');

        $conversations->each(function (Conversation $conversation) use ($messages): void {
            $message = $messages->get($conversation->id);

            $conversation->setRelation('messages', $message ? collect([$message]) : collect());
        });

        return $conversations;
    }

    protected function broadcastInboxSafely(int $userId, array $payload): void
    {
        try { broadcast(new InboxUpdated($userId, $payload)); } catch (\Throwable $e) { Log::debug('Inbox broadcast failed: ' . $e->getMessage()); }
    }

    protected function storeAttachments(Message $message, User $user, array $images): void
    {
        foreach ($images as $image) {
            if ($image instanceof UploadedFile) {
                $storedPath = $image->store('message-attachments/' . $message->id, 'public');
                MessageAttachment::create([
                    'message_id' => $message->id,
                    'user_id' => $user->id,
                    'filename' => basename($storedPath),
                    'original_filename' => $image->getClientOriginalName(),
                    'mime_type' => $image->getMimeType(),
                    'size' => $image->getSize(),
                    'disk' => 'public',
                ]);
            }
        }
    }
}
