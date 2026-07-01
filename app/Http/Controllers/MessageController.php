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
