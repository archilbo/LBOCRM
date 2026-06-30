<?php

namespace App\Http\Controllers;

use App\Http\Requests\Chat\StoreMessageRequest;
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
        $message = $this->chatService->sendMessage($conversation, $request->user(), $request->validated('body'));
        $message->load('user');

        return response()->json([
            'id' => $message->id,
            'body' => $message->body,
            'userId' => $message->user_id,
            'userName' => $message->user->name,
            'createdAt' => $message->created_at?->toISOString(),
        ]);
    }

    public function update(Request $request, Conversation $conversation, Message $message): RedirectResponse
    {
        $request->validate(['body' => 'required|string|max:10000']);

        $message->update([
            'body' => $request->body,
            'is_edited' => true,
            'edited_at' => now(),
        ]);

        return redirect()->back();
    }

    public function destroy(Conversation $conversation, Message $message): RedirectResponse
    {
        $message->delete();
        return redirect()->back();
    }
}
