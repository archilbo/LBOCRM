<?php

namespace App\Http\Controllers;

use App\Events\Chat\InboxUpdated;
use App\Http\Requests\Chat\StoreConversationRequest;
use App\Http\Resources\ConversationResource;
use App\Http\Resources\MessageResource;
use App\Http\Resources\MessageAttachmentResource;
use App\Models\Conversation;
use App\Models\ConversationParticipant;
use App\Models\Message;
use App\Models\User;
use App\Services\Chat\ChatService;
use App\Services\Chat\ChatActivityService;
use App\Services\Chat\ConversationQueryService;
use App\Services\PermissionRegistry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class ConversationController extends Controller
{
    public function __construct(
        protected ChatService $chatService,
        protected ConversationQueryService $queries,
        protected ChatActivityService $activity,
        protected PermissionRegistry $permissions,
    ) {}

    public function index(Request $request): Response
    {
        abort_unless($this->permissions->allows($request->user(), 'inbox.view'), 403);
        $user = $request->user();
        $conversations = $this->queries->paginate($user, $request->only(['search', 'type', 'unread', 'per_page']));
        $this->chatService->loadLatestMessagePreviews($conversations->getCollection());

        $users = User::where('company_id', $user->company_id)
            ->when($user->branch_id, fn ($query) => $query->where(fn ($branch) => $branch->whereNull('branch_id')->orWhere('branch_id', $user->branch_id)))
            ->where('id', '!=', $user->id)->orderBy('name')->get()->map(fn (User $u) => [
            'id' => $u->id, 'name' => $u->name, 'email' => $u->email,
        ]);

        $archivedCount = Conversation::where('company_id', $user->company_id)
            ->whereHas('participants', fn ($q) => $q->where('user_id', $user->id)->whereNotNull('archived_at'))->count();

        return Inertia::render('Inbox/Index', [
            'conversations' => ConversationResource::collection($conversations->getCollection())->resolve(),
            'conversationPaginator' => [
                'currentPage' => $conversations->currentPage(),
                'lastPage' => $conversations->lastPage(),
                'total' => $conversations->total(),
            ],
            'users' => $users,
            'currentUserId' => $user->id,
            'companyId' => $user->company_id,
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

        if ($data['type'] === 'direct') {
            $other = User::findOrFail($userIds[0]);
            $conversation = $this->chatService->findOrCreateDirectConversation($request->user(), $other);
        } else {
            $category = $data['category'] ?? 'general';
            if ($category === 'custom' && !empty($data['custom_category'])) {
                $category = $data['custom_category'];
            }
            $conversation = Conversation::create([
                'company_id' => $request->user()->company_id,
                'branch_id' => $request->user()->branch_id,
                'type' => 'group',
                'subject' => $data['subject'] ?? null,
                'category' => $category,
            ]);
            $participants = array_merge($userIds, [$request->user()->id]);
            foreach (array_unique($participants) as $uid) {
                $conversation->participants()->create([
                    'user_id' => $uid,
                    'role' => $uid === $request->user()->id ? 'owner' : 'member',
                ]);
            }
            $this->activity->log($conversation, $request->user(), 'chat.conversation.created');
        }

        return redirect()->route('inbox.index');
    }

    public function update(Request $request, Conversation $conversation): JsonResponse
    {
        $this->authorize('manage', $conversation);
        $request->validate(['subject' => 'required|string|max:255']);

        $old = ['subject' => $conversation->subject];
        $conversation->update(['subject' => $request->subject]);
        $this->activity->log($conversation, $request->user(), 'chat.conversation.updated', $old, ['subject' => $conversation->subject]);
        $this->chatService->broadcastConversationUpdate($conversation, 'conversation_updated');

        return response()->json((new ConversationResource($conversation))->resolve());
    }

    public function addParticipant(Request $request, Conversation $conversation): JsonResponse
    {
        $this->authorize('manage', $conversation);
        abort_unless($conversation->type === 'group', 400, 'Only groups can have participants added.');
        $request->validate(['user_id' => [
            'required',
            \Illuminate\Validation\Rule::exists('users', 'id')->where('company_id', $request->user()->company_id),
        ]]);

        $existing = $conversation->participants()->where('user_id', $request->user_id)->first();
        if ($existing) {
            if ($existing->archived_at) {
                $existing->update(['archived_at' => null]);
            }
            return response()->json(['success' => true]);
        }

        $conversation->participants()->create(['user_id' => $request->user_id]);
        $this->activity->log($conversation, $request->user(), 'chat.participant.added', [], ['user_id' => (int) $request->user_id]);
        $this->chatService->broadcastConversationUpdate($conversation, 'participant_added');
        return response()->json(['success' => true]);
    }

    public function removeParticipant(Request $request, Conversation $conversation, User $user): JsonResponse
    {
        $this->authorize('manage', $conversation);
        abort_unless($conversation->type === 'group', 400, 'Only groups can have participants removed.');
        abort_if($conversation->participants()->where('user_id', $user->id)->where('role', 'owner')->exists(), 422, 'Le propriétaire du groupe ne peut pas être retiré.');

        $conversation->participants()->where('user_id', $user->id)->delete();
        $this->activity->log($conversation, $request->user(), 'chat.participant.removed', ['user_id' => $user->id]);
        $this->chatService->broadcastConversationUpdate($conversation, 'participant_removed');
        try { broadcast(new InboxUpdated($user->id, [
            'eventType' => 'participant_removed',
            'conversationId' => $conversation->id,
        ])); } catch (\Throwable $e) { Log::debug('Broadcast failed: ' . $e->getMessage()); }
        return response()->json(['success' => true]);
    }

    public function archive(Request $request, Conversation $conversation): JsonResponse
    {
        $this->authorize('view', $conversation);
        $participant = $conversation->participants()->where('user_id', $request->user()->id)->first();
        if ($participant) {
            $participant->update(['archived_at' => now()]);
            $this->activity->log($conversation, $request->user(), 'chat.conversation.archived');
            $conversation->load(['participants.user']);
            $this->chatService->loadLatestMessagePreviews(collect([$conversation]));
            try { broadcast(new InboxUpdated($participant->user_id, [
                'eventType' => 'conversation_archived',
                'conversationId' => $conversation->id,
                'conversation' => (new ConversationResource($conversation))->resolve(),
            ])); } catch (\Throwable $e) { Log::debug('Broadcast failed: ' . $e->getMessage()); }
        }
        $conversation->loadMissing(['participants.user']);
        $this->chatService->loadLatestMessagePreviews(collect([$conversation]));

        return response()->json([
            'success' => true,
            'conversation' => (new ConversationResource($conversation))->resolve(),
        ]);
    }

    public function unarchive(Request $request, Conversation $conversation): JsonResponse
    {
        $this->authorize('view', $conversation);
        $participant = $conversation->participants()->where('user_id', $request->user()->id)->first();
        if ($participant) {
            $participant->update(['archived_at' => null]);
            $this->activity->log($conversation, $request->user(), 'chat.conversation.unarchived');
            $conversation->load(['participants.user']);
            $this->chatService->loadLatestMessagePreviews(collect([$conversation]));
            try { broadcast(new InboxUpdated($participant->user_id, [
                'eventType' => 'conversation_unarchived',
                'conversationId' => $conversation->id,
                'conversation' => (new ConversationResource($conversation))->resolve(),
            ])); } catch (\Throwable $e) { Log::debug('Broadcast failed: ' . $e->getMessage()); }
        }
        $conversation->loadMissing(['participants.user']);
        $this->chatService->loadLatestMessagePreviews(collect([$conversation]));

        return response()->json([
            'success' => true,
            'conversation' => (new ConversationResource($conversation))->resolve(),
        ]);
    }

    public function archived(Request $request): JsonResponse
    {
        abort_unless($this->permissions->allows($request->user(), 'inbox.view'), 403);

        $user = $request->user();
        $conversations = $this->queries->paginate($user, $request->only(['search', 'type', 'unread', 'per_page']), true);
        $this->chatService->loadLatestMessagePreviews($conversations->getCollection());

        return response()->json([
            'conversations' => ConversationResource::collection($conversations->getCollection())->resolve(),
            'paginator' => [
                'currentPage' => $conversations->currentPage(),
                'lastPage' => $conversations->lastPage(),
                'total' => $conversations->total(),
            ],
        ]);
    }

    public function listing(Request $request): JsonResponse
    {
        abort_unless($this->permissions->allows($request->user(), 'inbox.view'), 403);
        $conversations = $this->queries->paginate(
            $request->user(),
            $request->only(['search', 'type', 'unread', 'per_page']),
            $request->boolean('archived'),
        );
        $this->chatService->loadLatestMessagePreviews($conversations->getCollection());

        return response()->json([
            'conversations' => ConversationResource::collection($conversations->getCollection())->resolve(),
            'paginator' => [
                'currentPage' => $conversations->currentPage(),
                'lastPage' => $conversations->lastPage(),
                'total' => $conversations->total(),
            ],
        ]);
    }

    public function preferences(Request $request, Conversation $conversation): JsonResponse
    {
        $this->authorize('view', $conversation);
        $data = $request->validate([
            'pinned' => ['sometimes', 'boolean'],
            'muted' => ['sometimes', 'boolean'],
            'draft' => ['sometimes', 'nullable', 'string', 'max:10000'],
        ]);
        $participant = $conversation->participants()->where('user_id', $request->user()->id)->firstOrFail();
        $participant->update([
            ...(array_key_exists('pinned', $data) ? ['pinned_at' => $data['pinned'] ? now() : null] : []),
            ...(array_key_exists('muted', $data) ? ['muted_at' => $data['muted'] ? now() : null] : []),
            ...(array_key_exists('draft', $data) ? ['draft' => $data['draft']] : []),
        ]);

        return response()->json(['success' => true]);
    }

    public function searchMessages(Request $request, Conversation $conversation): JsonResponse
    {
        $this->authorize('view', $conversation);
        $data = $request->validate(['search' => ['required', 'string', 'min:2', 'max:120']]);
        $messages = $conversation->messages()
            ->where('body', 'like', '%'.$data['search'].'%')
            ->with(['user', 'reads', 'attachments', 'replyTo.user', 'forwardedFrom.user'])
            ->latest('created_at')
            ->paginate(30);

        return response()->json([
            'messages' => MessageResource::collection($messages->getCollection())->resolve(),
            'paginator' => ['currentPage' => $messages->currentPage(), 'lastPage' => $messages->lastPage(), 'total' => $messages->total()],
        ]);
    }

    public function attachments(Request $request, Conversation $conversation): JsonResponse
    {
        $this->authorize('view', $conversation);
        $attachments = \App\Models\MessageAttachment::query()
            ->whereHas('message', fn ($query) => $query->where('conversation_id', $conversation->id))
            ->latest('id')
            ->paginate(30);

        return response()->json([
            'attachments' => MessageAttachmentResource::collection($attachments->getCollection())->resolve(),
            'paginator' => ['currentPage' => $attachments->currentPage(), 'lastPage' => $attachments->lastPage(), 'total' => $attachments->total()],
        ]);
    }

    public function markUnread(Request $request, Conversation $conversation): JsonResponse
    {
        $this->authorize('view', $conversation);
        $message = $conversation->messages()->where('user_id', '!=', $request->user()->id)->latest('id')->first();
        if ($message) {
            $message->reads()->where('user_id', $request->user()->id)->delete();
            $conversation->participants()->where('user_id', $request->user()->id)->update([
                'last_read_at' => null,
                'last_read_message_id' => null,
            ]);
        }

        return response()->json(['success' => true]);
    }
}
