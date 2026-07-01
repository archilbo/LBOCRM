                      </div>
                            </div>
                            <div>
                                <p className="text-[10px] font-semibold text-[var(--crm-text-muted)] mb-1">Add participant</p>
                                <div className="flex gap-2">
                                    <select value={addUserId} onChange={(e) => setAddUserId(e.target.value)} className="h-8 flex-1 rounded-lg border border-[var(--crm-border)] bg-[var(--crm-surface)] px-3 text-xs text-[var(--crm-text)] outline-none focus:border-[var(--crm-gold)]">
                                        <option value="">Select a user...</option>
                                        {availableUsers.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                                    </select>
                                    <button type="button" onClick={handleAddParticipant} disabled={!addUserId} className="flex h-8 items-center gap-1 rounded-lg bg-[var(--crm-gold)] px-3 text-[10px] font-bold text-black disabled:opacity-40 hover:brightness-110 transition"><UserPlus size={13} /> Add</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}


```

# FILE: resources/js/features/chat/types.ts

```ts
export type ParticipantUser = {
    id: number;
    name: string;
    email?: string;
    avatarUrl?: string | null;
    lastSeenAt?: string | null;
};

export type ConversationParticipant = {
    id: number;
    user: ParticipantUser;
    lastReadAt: string | null;
    archivedAt: string | null;
};

export type ConversationRow = {
    id: number;
    type: 'direct' | 'group';
    subject: string | null;
    category: string | null;
    displayName: string;
    avatarInitials: string;
    participants: ConversationParticipant[];
    participantsCount?: number;
    onlineCount?: number;
    lastMessage: MessageRow | null;
    lastMessageAt: string | null;
    unreadCount: number;
    archivedAt: string | null;
    createdAt: string;
};

export type MessageAttachmentRow = {
    id: number;
    originalFilename: string;
    filename: string;
    mimeType: string;
    size: number;
    url: string | null;
    thumbnailUrl: string | null;
    createdAt: string;
};

export type MessageReplyPreview = {
    id: number;
    body: string | null;
    userId: number;
    userName: string | null;
    attachmentsCount: number;
};

export type MessageForwardedFrom = {
    id: number;
    body: string | null;
    userId: number;
    userName: string | null;
};

export type MessageRow = {
    id: number;
    body: string | null;
    isEdited: boolean;
    isForwarded: boolean;
    forwardedFromMessageId: number | null;
    forwardedFrom: MessageForwardedFrom | null;
    userId: number;
    userName: string | null;
    user?: { id: number; name: string };
    readBy: number[];
    replyTo: MessageReplyPreview | null;
    attachments: MessageAttachmentRow[];
    attachmentsCount: number;
    createdAt: string;
    updatedAt: string;
};

export type ChatUserOption = {
    id: number;
    name: string;
    email: string;
};

```

# FILE: app/Http/Controllers/ConversationController.php

```php
<?php

namespace App\Http\Controllers;

use App\Http\Requests\Chat\StoreConversationRequest;
use App\Http\Resources\ConversationResource;
use App\Http\Resources\MessageResource;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use App\Services\Chat\ChatService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ConversationController extends Controller
{
    public function __construct(protected ChatService $chatService) {}

    public function index(Request $request): Response
    {
        abort_unless($request->user()->can('view inbox') || $request->user()->can('manage inbox') || $request->user()->hasRole('admin'), 403);
        $user = $request->user();
        $conversations = Conversation::whereHas('participants', fn ($q) => $q->where('user_id', $user->id)->whereNull('archived_at'))
            ->with([
                'participants.user',
                'messages' => fn ($q) => $q->with(['user', 'attachments', 'forwardedFrom.user'])->latest()->limit(1),
            ])
            ->orderByDesc('last_message_at')
            ->get();

        $users = User::where('id', '!=', $user->id)->orderBy('name')->get()->map(fn (User $u) => [
            'id' => $u->id, 'name' => $u->name, 'email' => $u->email,
        ]);

        $archivedCount = Conversation::whereHas('participants', fn ($q) => $q->where('user_id', $user->id)->whereNotNull('archived_at'))->count();

        return Inertia::render('Inbox/Index', [
            'conversations' => ConversationResource::collection($conversations)->resolve(),
            'users' => $users,
            'currentUserId' => $user->id,
            'unreadCount' => $this->chatService->unreadCount($user),
            'archivedCount' => $archivedCount,
        ]);
    }

    public function show(Request $request, Conversation $conversation)
    {
        $this->authorize('view', $conversation);
        $conversation->load(['participants.user']);

        $perPage = 50;
        $page = $request->integer('page', 1);

        $messages = $conversation->messages()
            ->with(['user', 'reads', 'attachments', 'replyTo.user', 'forwardedFrom.user'])
            ->orderBy('created_at', 'desc')
            ->paginate($perPage, ['*'], 'page', $page);

        $this->chatService->markAsRead($conversation, $request->user());

        return response()->json([
            'messages' => MessageResource::collection($messages)->resolve(),
            'paginator' => [
                'currentPage' => $messages->currentPage(),
                'lastPage' => $messages->lastPage(),
                'perPage' => $messages->perPage(),
                'total' => $messages->total(),
            ],
        ]);
    }

    public function store(StoreConversationRequest $request)
    {
        $this->authorize('create', Conversation::class);
        $data = $request->validated();
        $userIds = $data['user_ids'];

        if (count($userIds) === 1) {
            $other = User::findOrFail($userIds[0]);
            $conversation = $this->chatService->findOrCreateDirectConversation($request->user(), $other);
        } else {
            $category = $data['category'] ?? 'general';
            if ($category === 'custom' && !empty($data['custom_category'])) {
                $category = $data['custom_category'];
            }
            $conversation = Conversation::create([
                'type' => 'group',
                'subject' => $data['subject'] ?? null,
                'category' => $category,
            ]);
            $participants = array_merge($userIds, [$request->user()->id]);
            foreach ($participants as $uid) {
                $conversation->participants()->create(['user_id' => $uid]);
            }
        }

        return redirect()->route('inbox.index');
    }

    public function update(Request $request, Conversation $conversation): JsonResponse
    {
        $this->authorize('view', $conversation);
        $request->validate(['subject' => 'required|string|max:255']);

        $conversation->update(['subject' => $request->subject]);

        return response()->json((new ConversationResource($conversation))->resolve());
    }

    public function addParticipant(Request $request, Conversation $conversation): JsonResponse
    {
        $this->authorize('view', $conversation);
        abort_unless($conversation->type === 'group', 400, 'Only groups can have participants added.');
        $request->validate(['user_id' => 'required|exists:users,id']);

        $existing = $conversation->participants()->where('user_id', $request->user_id)->first();
        if ($existing) {
            if ($existing->archived_at) {
                $existing->update(['archived_at' => null]);
            }
            return response()->json(['success' => true]);
        }

        $conversation->participants()->create(['user_id' => $request->user_id]);
        return response()->json(['success' => true]);
    }

    public function removeParticipant(Conversation $conversation, User $user): JsonResponse
    {
        $this->authorize('view', $conversation);
        abort_unless($conversation->type === 'group', 400, 'Only groups can have participants removed.');

        $conversation->participants()->where('user_id', $user->id)->delete();
        return response()->json(['success' => true]);
    }

    public function archive(Request $request, Conversation $conversation): JsonResponse
    {
        $this->authorize('view', $conversation);
        $participant = $conversation->participants()->where('user_id', $request->user()->id)->first();
        if ($participant) {
            $participant->update(['archived_at' => now()]);
        }
        return response()->json(['success' => true]);
    }

    public function unarchive(Request $request, Conversation $conversation): JsonResponse
    {
        $this->authorize('view', $conversation);
        $participant = $conversation->participants()->where('user_id', $request->user()->id)->first();
        if ($participant) {
            $participant->update(['archived_at' => null]);
        }
        return response()->json(['success' => true]);
    }

    public function archived(Request $request): JsonResponse
    {
        $user = $request->user();
        $conversations = Conversation::whereHas('participants', fn ($q) => $q->where('user_id', $user->id)->whereNotNull('archived_at'))
            ->with(['participants.user', 'messages' => fn ($q) => $q->with(['user', 'attachments', 'forwardedFrom.user'])->latest()->limit(1)])
            ->orderByDesc('last_message_at')
            ->get();

        return response()->json([
            'conversations' => ConversationResource::collection($conversations)->resolve(),
        ]);
    }
}

```

# FILE: app/Http/Controllers/MessageController.php

```php
<?php

namespace App\Http\Controllers;

use App\Http\Requests\Chat\StoreMessageRequest;
use App\Http\Resources\MessageResource;
use App\Models\Conversation;
use App\Models\Message;
use App\Services\Chat\ChatService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    public function __construct(protected ChatService $chatService) {}

    public function store(StoreMessageRequest $request, Conversation $conversation): JsonResponse
    {
        $this->authorize('view', $conversation);
        $this->authorize('create', Message::class);

        $images = $request->hasFile('images') ? $request->file('images') : [];
        $replyToMessageId = $request->integer('reply_to_message_id') ?: null;

        if ($replyToMessageId) {
            abort_unless(
                Message::where('id', $replyToMessageId)->where('conversation_id', $conversation->id)->exists(),
                422,
                'Reply target does not belong to this conversation.'
            );
        }

        $message = $this->chatService->sendMessage(
            $conversation,
            $request->user(),
            $request->input('body'),
            $images,
            $replyToMessageId,
        );

        $message->load(['user', 'attachments', 'replyTo.user', 'reads']);

        return response()->json(new MessageResource($message));
    }

    public function update(Request $request, Conversation $conversation, Message $message): JsonResponse
    {
        $this->authorize('view', $conversation);
        $this->authorize('update', $message);
        abort_unless($message->conversation_id === $conversation->id, 404);
        $request->validate(['body' => 'required|string|max:10000']);

        $message->update([
            'body' => $request->body,
            'is_edited' => true,
            'edited_at' => now(),
        ]);

        $message->load(['user', 'attachments', 'replyTo.user', 'reads']);

        return response()->json(new MessageResource($message));
    }

    public function destroy(Conversation $conversation, Message $message): JsonResponse
    {
        $this->authorize('view', $conversation);
        $this->authorize('delete', $message);
        abort_unless($message->conversation_id === $conversation->id, 404);
        $message->delete();
        return response()->json(['success' => true]);
    }

    public function forward(Request $request, Conversation $conversation, Message $message): JsonResponse
    {
        $this->authorize('view', $conversation);
        $this->authorize('view', $message);
        abort_unless($message->conversation_id === $conversation->id, 404);

        $data = $request->validate([
            'conversation_ids' => ['required', 'array', 'min:1'],
            'conversation_ids.*' => ['integer', 'exists:conversations,id'],
        ]);

        $messages = [];
        foreach ($data['conversation_ids'] as $targetId) {
            $targetConversation = Conversation::findOrFail($targetId);
            $this->authorize('view', $targetConversation);

            $newMessage = $this->chatService->forwardMessage($targetConversation, $request->user(), $message);
            $newMessage->load(['user', 'attachments', 'replyTo.user', 'reads', 'forwardedFrom.user']);

            $messages[] = new MessageResource($newMessage);
        }

        return response()->json([
            'forwarded' => true,
            'messages' => $messages,
        ]);
    }

    public function typing(Request $request, Conversation $conversation): JsonResponse
    {
        $this->authorize('view', $conversation);
        $participant = $conversation->participants()
            ->where('user_id', $request->user()->id)
            ->first();
        if ($participant) {
            $participant->update(['typing_at' => now()]);
        }
        return response()->json(['typing' => true]);
    }

    public function typingUsers(Request $request, Conversation $conversation): JsonResponse
    {
        $this->authorize('view', $conversation);
        $typingUsers = $conversation->participants()
            ->where('user_id', '!=', $request->user()->id)
            ->whereNotNull('typing_at')
            ->where('typing_at', '>', now()->subSeconds(5))
            ->with('user')
            ->get()
            ->map(fn ($p) => [
                'id' => $p->user->id,
                'name' => $p->user->name,
            ]);
        return response()->json(['typing' => $typingUsers]);
    }
}

```

# FILE: app/Http/Resources/ConversationResource.php

```php
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
                return Message::where('conversation_id', $this->id)
                    ->where('user_id', '!=', $user->id)
                    ->whereDoesntHave('reads', fn ($q) => $q->where('user_id', $user->id))
                    ->count();
            }),
            'createdAt' => $this->created_at?->toISOString(),
            'archivedAt' => $participant ? optional($participant->archived_at)->toISOString() : null,
        ];
    }
}

```

# FILE: app/Http/Resources/MessageResource.php

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MessageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        re