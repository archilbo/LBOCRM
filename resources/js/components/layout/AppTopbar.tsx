import { router, usePage } from '@inertiajs/react';
import { Bell, CalendarDays, LogOut, MessageSquare, Plus } from 'lucide-react';
import { AppGlobalSearch } from '@/components/layout/AppGlobalSearch';
import { ThemeToggle } from '@/components/layout/ThemeToggle';

function UnreadBadge({ count }: { count: number }) {
    if (count <= 0) return null;
    return (
        <span className="absolute -right-1 -top-1 flex min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold leading-none text-white">
            {count > 99 ? '99+' : count}
        </span>
    );
}

export function AppTopbar() {
    const { auth } = usePage().props as { auth: { user?: { unread_notifications?: number; unread_messages?: number } } };
    const unreadNotifs = auth?.user?.unread_notifications ?? 0;
    const unreadChats = auth?.user?.unread_messages ?? 0;

    function handleLogout() {
        router.post('/logout');
    }

    return (
        <header className="crm-topbar sticky top-0 z-40">
            <div className="flex h-full items-center gap-3 px-4 lg:px-6">
                <div className="min-w-0 flex-1">
                    <div className="max-w-[620px]">
                        <AppGlobalSearch />
                    </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                    <button
                        type="button"
                        onClick={() => router.visit('/dossiers')}
                        className="crm-action-button-primary crm-action-button hidden sm:inline-flex"
                    >
                        <Plus size={15} />
                        New
                    </button>

                    <button
                        type="button"
                        onClick={() => router.visit('/finance/documents?tab=monthly')}
                        className="crm-action-button hidden md:inline-flex"
                        title="Monthly summary"
                    >
                        <CalendarDays size={15} />
                    </button>

                    <button
                        type="button"
                        onClick={() => router.visit('/inbox')}
                        className="crm-action-button relative hidden h-9 w-9 px-0 sm:inline-flex"
                        title="Messages"
                    >
                        <MessageSquare size={15} />
                        <UnreadBadge count={unreadChats} />
                    </button>

                    <button
                        type="button"
                        onClick={() => router.visit('/notifications')}
                        className="crm-action-button relative h-9 w-9 px-0 sm:inline-flex"
                        title="Notifications"
                    >
                        <Bell size={15} />
                        <UnreadBadge count={unreadNotifs} />
                    </button>

                    <ThemeToggle />

                    <button
                        type="button"
                        onClick={handleLogout}
                        className="crm-action-button h-9 w-9 px-0"
                        aria-label="Logout"
                        title="Logout"
                    >
                        <LogOut size={15} />
                    </button>
                </div>
            </div>
        </header>
    );
}
