turn [
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

```

# FILE: app/Services/Chat/ChatService.php

```php
<?php

namespace App\Services\Chat;

use App\Models\Conversation;
use App\Models\ConversationParticipant;
use App\Models\Message;
use App\Models\MessageAttachment;
use App\Models\User;
use Illuminate\Http\UploadedFile;
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

```

# FILE: app/Models/Conversation.php

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Conversation extends Model
{
    protected $fillable = [
        'type', 'subject', 'category',
        'task_id', 'dossier_id', 'client_id', 'finance_document_id',
        'last_message_at',
    ];

    protected $casts = ['last_message_at' => 'datetime'];

    public function participants(): HasMany { return $this->hasMany(ConversationParticipant::class); }
    public function messages(): HasMany { return $this->hasMany(Message::class); }
    public function task(): BelongsTo { return $this->belongsTo(Task::class); }
    public function dossier(): BelongsTo { return $this->belongsTo(Dossier::class); }
    public function client(): BelongsTo { return $this->belongsTo(Client::class); }
    public function financeDocument(): BelongsTo { return $this->belongsTo(FinanceDocument::class); }
}

```

# FILE: app/Models/Message.php

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Message extends Model
{
    use SoftDeletes;

    protected $fillable = ['conversation_id', 'user_id', 'body', 'is_edited', 'edited_at', 'reply_to_message_id', 'is_forwarded', 'forwarded_from_message_id'];

    protected $casts = ['is_edited' => 'boolean', 'edited_at' => 'datetime', 'is_forwarded' => 'boolean'];

    public function conversation(): BelongsTo { return $this->belongsTo(Conversation::class); }
    public function user(): BelongsTo { return $this->belongsTo(User::class); }
    public function reads(): HasMany { return $this->hasMany(MessageRead::class); }
    public function attachments(): HasMany { return $this->hasMany(MessageAttachment::class); }
    public function replyTo(): BelongsTo { return $this->belongsTo(__CLASS__, 'reply_to_message_id'); }
    public function forwardedFrom(): BelongsTo { return $this->belongsTo(__CLASS__, 'forwarded_from_message_id'); }
}

```

# FILE: app/Models/MessageAttachment.php

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class MessageAttachment extends Model
{
    protected $fillable = ['message_id', 'user_id', 'filename', 'original_filename', 'mime_type', 'size', 'disk'];

    protected $casts = ['disk' => 'string'];

    public function message(): BelongsTo { return $this->belongsTo(Message::class); }
    public function user(): BelongsTo { return $this->belongsTo(User::class); }

    public function getUrlAttribute(): ?string
    {
        $path = 'message-attachments/' . $this->message_id . '/' . $this->filename;
        if ($this->disk === 'public') {
            return Storage::disk('public')->exists($path) ? Storage::disk('public')->url($path) : null;
        }
        return Storage::disk($this->disk ?? 'public')->exists($path) ? Storage::disk($this->disk ?? 'public')->url($path) : null;
    }

    public function getThumbnailUrlAttribute(): ?string
    {
        return $this->url;
    }
}

```

# FILE: app/Notifications/ChatMessageNotification.php

```php
<?php

namespace App\Notifications;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class ChatMessageNotification extends Notification
{
    use Queueable;

    public function __construct(public Conversation $conversation, public Message $message, public User $sender) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'conversation_id' => $this->conversation->id,
            'message_id' => $this->message->id,
            'sender_id' => $this->sender->id,
            'sender_name' => $this->sender->name,
            'body' => $this->message->body,
        ];
    }
}

```

# Safe .env realtime keys only

```text
BROADCAST_CONNECTION=log
QUEUE_CONNECTION=database
```
