import { router } from '@inertiajs/react';
import { CalendarDays, LogOut, Plus } from 'lucide-react';
import { MessagePopover } from '@/features/inbox/components/MessagePopover';
import { NotificationPopover } from '@/features/notifications/components/NotificationPopover';
import { AppGlobalSearch } from '@/components/layout/AppGlobalSearch';
import { ThemeToggle } from '@/components/layout/ThemeToggle';

export function AppTopbar() {
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

                    <MessagePopover />

                    <NotificationPopover />

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
