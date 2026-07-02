<?php

namespace App\Http\Controllers;

use App\Events\Chat\InboxUpdated;
use App\Http\Requests\Chat\StoreConversationRequest;
use App\Http\Resources\ConversationResource;
use App\Http\Resources\MessageResource;
use App\Models\Conversation;
use App\Models\ConversationParticipant;
use App\Models\Message;
use App\Models\User;
use App\Services\Chat\ChatService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
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
        try { broadcast(new InboxUpdated($request->user_id, [
            'eventType' => 'participant_added',
            'conversationId' => $conversation->id,
        ])); } catch (\Throwable $e) { Log::debug('Broadcast failed: ' . $e->getMessage()); }
        return response()->json(['success' => true]);
    }

    public function removeParticipant(Conversation $conversation, User $user): JsonResponse
    {
        $this->authorize('view', $conversation);
        abort_unless($conversation->type === 'group', 400, 'Only groups can have participants removed.');

        $conversation->participants()->where('user_id', $user->id)->delete();
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
            try { broadcast(new InboxUpdated($participant->user_id, [
                'eventType' => 'conversation_archived',
                'conversationId' => $conversation->id,
            ])); } catch (\Throwable $e) { Log::debug('Broadcast failed: ' . $e->getMessage()); }
        }
        return response()->json(['success' => true]);
    }

    public function unarchive(Request $request, Conversation $conversation): JsonResponse
    {
        $this->authorize('view', $conversation);
        $participant = $conversation->participants()->where('user_id', $request->user()->id)->first();
        if ($participant) {
            $participant->update(['archived_at' => null]);
            try { broadcast(new InboxUpdated($participant->user_id, [
                'eventType' => 'conversation_unarchived',
                'conversationId' => $conversation->id,
            ])); } catch (\Throwable $e) { Log::debug('Broadcast failed: ' . $e->getMessage()); }
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
