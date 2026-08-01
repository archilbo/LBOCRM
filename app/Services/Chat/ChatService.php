<?php

namespace App\Services\Chat;

use App\Events\Chat\InboxUpdated;
use App\Events\Chat\MessageCreated;
use App\Events\Chat\MessagesRead;
use App\Models\Conversation;
use App\Models\ConversationParticipant;
use App\Models\Message;
use App\Models\MessageAttachment;
use App\Models\User;
use App\Http\Resources\ConversationResource;
use App\Services\Dossiers\DossierPathBuilder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Database\QueryException;

class ChatService
{
    public function __construct(private readonly ChatActivityService $activity) {}

    public function findOrCreateDirectConversation(User $user1, User $user2): Conversation
    {
        abort_unless((int) $user1->company_id === (int) $user2->company_id, 422, 'Destinataire non disponible.');
        abort_unless(
            $user1->branch_id === null
                || $user2->branch_id === null
                || (int) $user1->branch_id === (int) $user2->branch_id,
            422,
            'Destinataire non disponible.'
        );
        $directKey = collect([$user1->id, $user2->id])->sort()->implode(':');

        try {
            return DB::transaction(function () use ($user1, $user2, $directKey): Conversation {
            $existing = Conversation::query()
                ->where('company_id', $user1->company_id)
                ->where('direct_key', $directKey)
                ->lockForUpdate()
                ->first();

            if ($existing) {
                $existing->participants()->whereIn('user_id', [$user1->id, $user2->id])->update(['archived_at' => null]);
                return $existing;
            }

            $conversation = Conversation::create([
                'company_id' => $user1->company_id,
                'branch_id' => $user1->branch_id,
                'type' => 'direct',
                'direct_key' => $directKey,
            ]);
            $conversation->participants()->createMany([
                ['user_id' => $user1->id, 'role' => 'owner'],
                ['user_id' => $user2->id, 'role' => 'member'],
            ]);
            $this->activity->log($conversation, $user1, 'chat.conversation.created');

            return $conversation;
            }, 3);
        } catch (QueryException $exception) {
            if ((string) $exception->getCode() !== '23000') throw $exception;

            return Conversation::query()
                ->where('company_id', $user1->company_id)
                ->where('direct_key', $directKey)
                ->firstOrFail();
        }
    }

    public function sendMessage(
        Conversation $conversation,
        User $user,
        ?string $body = null,
        array $files = [],
        ?int $replyToMessageId = null,
        bool $isForwarded = false,
        ?string $clientMessageId = null,
    ): Message {
        return DB::transaction(function () use ($conversation, $user, $body, $files, $replyToMessageId, $isForwarded, $clientMessageId): Message {
            $message = Message::create([
                'conversation_id' => $conversation->id,
                'user_id' => $user->id,
                'body' => $body,
                'reply_to_message_id' => $replyToMessageId,
                'is_forwarded' => $isForwarded,
                'client_message_id' => $clientMessageId,
            ]);

            $storedFiles = [];
            try {
                $storedFiles = $this->storeAttachments($message, $user, $files);
            } catch (\Throwable $e) {
                foreach ($storedFiles as $storedFile) {
                    Storage::disk(config('chat.attachment_disk', 'local'))->delete($storedFile);
                }
                throw $e;
            }

            $conversation->update(['last_message_at' => now()]);
            $this->activity->log($conversation, $user, 'chat.message.created', [], [], $message);

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
        });
    }

    public function sendMessageAfterCommit(
        Conversation $conversation,
        User $user,
        Message $message,
    ): void {
        $conversation->participants()
            ->where('user_id', '!=', $user->id)
            ->each(fn (ConversationParticipant $p) => $p->user->notify(
                new \App\Notifications\ChatMessageNotification($conversation, $message, $user)
            ));
    }

    public function forwardMessage(Conversation $targetConversation, User $user, Message $originalMessage): Message
    {
        $message = Message::create([
            'conversation_id' => $targetConversation->id,
            'user_id' => $user->id,
            'body' => $originalMessage->body,
            'is_forwarded' => true,
            'forwarded_from_message_id' => $originalMessage->id,
        ]);

        foreach ($originalMessage->attachments()->get() as $attachment) {
            $sourceDisk = $attachment->disk ?: 'public';
            $sourcePath = $attachment->storagePath();
            if (! Storage::disk($sourceDisk)->exists($sourcePath)) continue;

            $targetPath = $this->attachmentDirectory($targetConversation, $message).'/'.basename($attachment->filename);
            Storage::disk('local')->put($targetPath, Storage::disk($sourceDisk)->get($sourcePath));
            MessageAttachment::create([
                'message_id' => $message->id,
                'user_id' => $user->id,
                'filename' => basename($targetPath),
                'storage_path' => $targetPath,
                'original_filename' => $attachment->original_filename,
                'mime_type' => $attachment->mime_type,
                'size' => $attachment->size,
                'disk' => 'local',
            ]);
        }

        $targetConversation->update(['last_message_at' => now()]);
        $this->activity->log($targetConversation, $user, 'chat.message.forwarded', [
            'source_message_id' => $originalMessage->id,
        ], [], $message);

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

        $messageIds = $conversation->messages()
            ->where('user_id', '!=', $user->id)
            ->whereDoesntHave('reads', fn ($q) => $q->where('user_id', $user->id))
            ->pluck('id');

        if ($messageIds->isNotEmpty()) {
            $now = now();
            DB::table('message_reads')->insertOrIgnore($messageIds->map(fn ($messageId) => [
                'message_id' => $messageId,
                'user_id' => $user->id,
                'read_at' => $now,
                'created_at' => $now,
                'updated_at' => $now,
            ])->all());
            $participant?->update(['last_read_message_id' => $messageIds->max()]);
            try {
                broadcast(new MessagesRead($conversation, $user, (int) $messageIds->max()));
            } catch (\Throwable $e) {
                Log::debug('Read receipt broadcast failed: '.$e->getMessage());
            }
        }
    }

    public function broadcastConversationUpdate(Conversation $conversation, string $eventType): void
    {
        $conversation->load(['participants.user']);
        $this->loadLatestMessagePreviews(collect([$conversation]));
        $payload = [
            'eventType' => $eventType,
            'conversationId' => $conversation->id,
            'conversation' => (new ConversationResource($conversation))->resolve(),
        ];

        $conversation->participants->each(
            fn (ConversationParticipant $participant) => $this->broadcastInboxSafely($participant->user_id, $payload)
        );
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

    protected function storeAttachments(Message $message, User $user, array $files): array
    {
        $storedPaths = [];
        foreach ($files as $file) {
            if ($file instanceof UploadedFile) {
                $disk = config('chat.attachment_disk', 'local');
                $storedPath = $file->store($this->attachmentDirectory($message->conversation, $message), $disk);
                MessageAttachment::create([
                    'message_id' => $message->id,
                    'user_id' => $user->id,
                    'filename' => basename($storedPath),
                    'storage_path' => $storedPath,
                    'original_filename' => $file->getClientOriginalName(),
                    'mime_type' => $file->getMimeType(),
                    'size' => $file->getSize(),
                    'disk' => $disk,
                ]);
                $storedPaths[] = $storedPath;
            }
        }
        return $storedPaths;
    }

    protected function attachmentDirectory(Conversation $conversation, Message $message): string
    {
        $conversation->loadMissing(['company', 'branch']);
        $company = DossierPathBuilder::folderSafe($conversation->company?->name);
        $branch = DossierPathBuilder::folderSafe($conversation->branch?->name);

        return "archilbo/{$company}/{$branch}/chat/conversation-{$conversation->id}/message-{$message->id}";
    }
}
