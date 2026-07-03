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
        <header className="flex h-[var(--crm-topbar-h)] shrink-0 items-center border-b border-[var(--crm-border)] bg-[color-mix(in_srgb,var(--crm-bg-2)_92%,transparent)] px-3 backdrop-blur-[18px] lg:px-6">
            <div className="flex min-w-0 flex-1 items-center gap-1.5 lg:gap-3">
                <div className="min-w-0 flex-1">
                    <div className="max-w-[280px] sm:max-w-[340px] lg:max-w-[620px]">
                        <AppGlobalSearch />
                    </div>
                </div>

                <div className="flex shrink-0 items-center gap-1 sm:gap-2">
                    <button
                        type="button"
                        onClick={() => router.visit('/dossiers')}
                        className="flex h-8 shrink-0 items-center justify-center gap-2 rounded-[var(--crm-radius-sm)] border border-[var(--crm-border)] bg-[var(--crm-gold)] px-3 text-[12px] font-bold text-black transition hover:bg-[#ffc63a] max-sm:hidden lg:h-9"
                    >
                        <Plus size={14} />
                        <span className="hidden lg:inline">New</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => router.visit('/finance/documents?tab=monthly')}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--crm-radius-sm)] border border-[var(--crm-border)] bg-[var(--crm-surface)] text-[var(--crm-text)] transition hover:border-[var(--crm-border-strong)] hover:bg-[var(--crm-surface-2)] max-md:hidden lg:h-9 lg:w-auto lg:px-3"
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
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--crm-radius-sm)] border border-[var(--crm-border)] bg-[var(--crm-surface)] text-[var(--crm-text)] transition hover:border-[var(--crm-border-strong)] hover:bg-[var(--crm-surface-2)] lg:h-9 lg:w-9"
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
