<?php

namespace App\Http\Controllers;

use App\Events\Chat\InboxUpdated;
use App\Events\Chat\MessageDeleted;
use App\Events\Chat\MessageUpdated;
use App\Http\Requests\Chat\StoreMessageRequest;
use App\Http\Resources\ConversationResource;
use App\Http\Resources\MessageResource;
use App\Models\Conversation;
use App\Models\ConversationParticipant;
use App\Models\Message;
use App\Services\Chat\ChatService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class MessageController extends Controller
{
    public function __construct(protected ChatService $chatService) {}

    public function store(StoreMessageRequest $request, Conversation $conversation): JsonResponse
    {
        $this->authorize('view', $conversation);
        $this->authorize('create', Message::class);

        // Idempotency: return existing message if client_message_id matches
        if ($request->filled('client_message_id')) {
            $existing = Message::where('conversation_id', $conversation->id)
                ->where('user_id', $request->user()->id)
                ->where('client_message_id', $request->input('client_message_id'))
                ->with(['user', 'attachments', 'replyTo.user', 'reads', 'forwardedFrom.user'])
                ->first();
            if ($existing) {
                return response()->json(new MessageResource($existing));
            }
        }

        $files = array_merge($request->file('files', []), $request->file('images', []));
        $replyToMessageId = $request->integer('reply_to_message_id') ?: null;

        if ($replyToMessageId) {
            abort_unless(
                Message::where('id', $replyToMessageId)->where('conversation_id', $conversation->id)->exists(),
                422,
                'La cible de réponse n\'appartient pas à cette conversation.'
            );
        }

        $message = $this->chatService->sendMessage(
            $conversation,
            $request->user(),
            $request->input('body'),
            $files,
            $replyToMessageId,
            clientMessageId: $request->input('client_message_id'),
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
        app(\App\Services\Chat\ChatActivityService::class)->log($conversation, $request->user(), 'chat.message.updated', [], [], $message);

        $message->load(['user', 'attachments', 'replyTo.user', 'reads', 'forwardedFrom.user']);

        try { broadcast(new MessageUpdated($message))->toOthers(); } catch (\Throwable $e) { Log::debug('Broadcast failed: ' . $e->getMessage()); }

        return response()->json(new MessageResource($message));
    }

    public function destroy(Request $request, Conversation $conversation, Message $message): JsonResponse
    {
        $this->authorize('view', $conversation);
        $this->authorize('delete', $message);
        abort_unless($message->conversation_id === $conversation->id, 404);
        $convId = $message->conversation_id;
        $message->delete();
        app(\App\Services\Chat\ChatActivityService::class)->log($conversation, $request->user(), 'chat.message.deleted', [], [], $message);
        try { broadcast(new MessageDeleted($message->id, $convId))->toOthers(); } catch (\Throwable $e) { Log::debug('Broadcast failed: ' . $e->getMessage()); }
        $conversation->participants()
            ->where('user_id', '!=', $request->user()->id)
            ->each(fn (ConversationParticipant $p) => $this->inboxSafely($p->user_id, $message->id, $convId, $p->user));
        return response()->json(['success' => true]);
    }

    protected function inboxSafely(int $userId, int $messageId, int $convId, $user): void
    {
        try {
            broadcast(new InboxUpdated($userId, [
                'eventType' => 'message_deleted',
                'messageId' => $messageId,
                'conversationId' => $convId,
                'unreadCount' => $this->chatService->unreadCount($user),
            ]));
        } catch (\Throwable $e) { Log::debug('Inbox broadcast failed: ' . $e->getMessage()); }
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
