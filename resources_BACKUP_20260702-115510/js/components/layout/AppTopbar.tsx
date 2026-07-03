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
        <header className="crm-topbar shrink-0">
            <div className="flex h-full items-center gap-1.5 px-3 lg:gap-3 lg:px-6">
                <div className="min-w-0 flex-1">
                    <div className="max-w-[340px] lg:max-w-[620px]">
                        <AppGlobalSearch />
                    </div>
                </div>

                <div className="flex shrink-0 items-center gap-1 sm:gap-2">
                    <button
                        type="button"
                        onClick={() => router.visit('/dossiers')}
                        className="crm-action-button-primary crm-action-button hidden sm:inline-flex h-8 lg:h-9"
                    >
                        <Plus size={14} />
                        <span className="hidden lg:inline">New</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => router.visit('/finance/documents?tab=monthly')}
                        className="crm-action-button hidden md:inline-flex h-8 w-8 px-0 lg:h-9 lg:w-auto lg:px-3"
                        title="Monthly summary"
                    >
                        <CalendarDays size={14} />
                        <span className="hidden lg:inline">Monthly</span>
                    </button>

                    <MessagePopover />

                    <NotificationPopover />

                    <ThemeToggle />

                    <button
                        type="button"
                        onClick={handleLogout}
                        className="crm-action-button h-8 w-8 px-0 lg:h-9 lg:w-9"
                        aria-label="Logout"
                        title="Logout"
                    >
                        <LogOut size={14} />
                    </button>
                </div>
            </div>
        </header>
    );
}
