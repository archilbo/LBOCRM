<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use App\Services\Chat\ChatService;
use App\Services\PermissionRegistry;
use App\Services\SystemSettingsService;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function __construct(private readonly SystemSettingsService $systemSettings)
    {
    }

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $user = $request->user();

        return [
            ...parent::share($request),

            'branding' => fn () => $this->systemSettings->publicBrandingArray(),

            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'roles' => method_exists($user, 'getRoleNames')
                        ? $user->getRoleNames()->values()
                        : [],
                    'permissions' => app(PermissionRegistry::class)->effectiveNames($user),
                    'unread_notifications' => $user->unreadNotifications()->count(),
                    'unread_messages' => \App\Models\Message::whereHas(
                        'conversation.participants',
                        fn ($q) => $q->where('user_id', $user->id),
                    )->where('user_id', '!=', $user->id)
                        ->whereDoesntHave('reads', fn ($q) => $q->where('user_id', $user->id))
                        ->count(),
                    'recent_notifications' => \App\Http\Resources\NotificationResource::collection(
                        $user->notifications()->latest()->take(20)->get()
                    )->resolve(),
                    'recent_conversations' => fn () => \App\Http\Resources\ConversationResource::collection(
                        app(ChatService::class)->loadLatestMessagePreviews(
                            \App\Models\Conversation::whereHas('participants', fn ($q) => $q->where('user_id', $user->id)->whereNull('archived_at'))
                                ->with(['participants.user'])
                                ->orderByDesc('last_message_at')
                                ->take(8)
                                ->get()
                        )
                    )->resolve(),
                ] : null,
            ],

            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'warning' => fn () => $request->session()->get('warning'),
                'info' => fn () => $request->session()->get('info'),
                'receipt' => fn () => $request->session()->get('receipt'),
            ],
        ];
    }
}
