<?php

namespace App\Http\Controllers;

use App\Http\Requests\Chat\StoreConversationRequest;
use App\Http\Resources\ConversationResource;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use App\Services\Chat\ChatService;
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
        $conversations = Conversation::whereHas('participants', fn ($q) => $q->where('user_id', $user->id))
            ->with([
                'participants.user',
                'messages' => fn ($q) => $q->latest()->limit(1),
            ])
            ->orderByDesc('last_message_at')
            ->get();

        $users = User::where('id', '!=', $user->id)->orderBy('name')->get()->map(fn (User $u) => [
            'id' => $u->id, 'name' => $u->name, 'email' => $u->email,
        ]);

        return Inertia::render('Inbox/Index', [
            'conversations' => ConversationResource::collection($conversations)->resolve(),
            'users' => $users,
            'unreadCount' => $this->chatService->unreadCount($user),
        ]);
    }

    public function show(Request $request, Conversation $conversation)
    {
        $this->authorize('view', $conversation);
        $conversation->load(['participants.user', 'messages.user', 'messages.reads', 'messages.attachments']);
        $this->chatService->markAsRead($conversation, $request->user());

        return response()->json([
            'conversation' => (new ConversationResource($conversation))->resolve(),
            'messages' => $conversation->messages->map(fn ($m) => [
                'id' => $m->id,
                'body' => $m->body,
                'isEdited' => $m->is_edited,
                'userId' => $m->user_id,
                'userName' => $m->user->name,
                'readBy' => $m->reads->pluck('user_id'),
                'createdAt' => $m->created_at?->toISOString(),
            ]),
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
            $conversation = Conversation::create([
                'type' => 'group',
                'subject' => $data['subject'] ?? null,
            ]);
            $participants = array_merge($userIds, [$request->user()->id]);
            foreach ($participants as $uid) {
                $conversation->participants()->create(['user_id' => $uid]);
            }
        }

        return redirect()->route('inbox.index');
    }
}
