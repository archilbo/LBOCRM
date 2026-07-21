<?php

namespace App\Services\Chat;

use App\Models\Conversation;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ConversationQueryService
{
    public function paginate(User $user, array $filters, bool $archived = false): LengthAwarePaginator
    {
        $search = trim((string) ($filters['search'] ?? ''));
        $type = $filters['type'] ?? null;
        $unread = filter_var($filters['unread'] ?? false, FILTER_VALIDATE_BOOL);

        return Conversation::query()
            ->where('company_id', $user->company_id)
            ->when($user->branch_id, fn ($query) => $query->where(fn ($scope) => $scope
                ->whereNull('branch_id')
                ->orWhere('branch_id', $user->branch_id)))
            ->whereHas('participants', fn ($query) => $query
                ->where('user_id', $user->id)
                ->when($archived, fn ($participant) => $participant->whereNotNull('archived_at'))
                ->when(! $archived, fn ($participant) => $participant->whereNull('archived_at')))
            ->when(in_array($type, ['direct', 'group'], true), fn ($query) => $query->where('type', $type))
            ->when($unread, fn ($query) => $query->whereHas('messages', fn ($messages) => $messages
                ->where('user_id', '!=', $user->id)
                ->whereDoesntHave('reads', fn ($reads) => $reads->where('user_id', $user->id))))
            ->when($search !== '', fn ($query) => $query->where(function ($searchQuery) use ($search) {
                $searchQuery
                    ->where('subject', 'like', "%{$search}%")
                    ->orWhere('category', 'like', "%{$search}%")
                    ->orWhereHas('participants.user', fn ($users) => $users
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%"))
                    ->orWhereHas('messages', fn ($messages) => $messages->where('body', 'like', "%{$search}%"));
            }))
            ->with(['participants.user'])
            ->withCount(['messages as unread_messages_count' => fn ($messages) => $messages
                ->where('user_id', '!=', $user->id)
                ->whereDoesntHave('reads', fn ($reads) => $reads->where('user_id', $user->id))])
            ->orderByRaw('EXISTS (SELECT 1 FROM conversation_participants cp WHERE cp.conversation_id = conversations.id AND cp.user_id = ? AND cp.pinned_at IS NOT NULL) DESC', [$user->id])
            ->orderByDesc('last_message_at')
            ->orderByDesc('id')
            ->paginate(min(max((int) ($filters['per_page'] ?? 30), 10), 100));
    }
}
