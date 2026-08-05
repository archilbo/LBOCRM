import { router } from '@inertiajs/react';
import { useState } from 'react';
import { IconClipboardList, IconFileText, IconFolder, IconHeartHandshake, IconPlus, IconUserPlus } from '@tabler/icons-react';

import { MessagePopover } from '@/features/inbox/components/MessagePopover';
import { NotificationPopover } from '@/features/notifications/components/NotificationPopover';
import { AppGlobalSearch } from '@/components/layout/AppGlobalSearch';
import { ThemeToggle } from '@/components/layout/ThemeToggle';

const QUICK_ACTIONS = [
    { label: 'New Project', icon: IconFolder, href: '/projects/create' },
    { label: 'New Client', icon: IconUserPlus, href: '/clients/create' },
    { label: 'Log Expense', icon: IconFileText, href: '/finance/expenses/create' },
    { label: 'Create Task', icon: IconClipboardList, href: '/tasks/create' },
];

export function AppTopbar() {
    const [newOpen, setNewOpen] = useState(false);

    return (
        <header className="flex h-16 shrink-0 items-center border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--background)_92%,transparent)] px-3 backdrop-blur-[18px] lg:px-6">
            <div className="flex min-w-0 flex-1 items-center gap-1.5 lg:gap-3">
                <AppGlobalSearch />

                <div className="min-w-0 flex-1" />

                <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setNewOpen((o) => !o)}
                            className="flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[11px] font-semibold text-[var(--accent)] transition hover:bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] max-sm:hidden"
                        >
                            <IconPlus size={14} strokeWidth={2.5} />
                            <span className="hidden lg:inline">New</span>
                        </button>
                        {newOpen && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setNewOpen(false)} />
                                <div className="absolute right-0 top-full z-50 mt-1.5 w-52 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] py-1.5 shadow-2xl shadow-black/50 backdrop-blur-sm">
                                    {QUICK_ACTIONS.map((a) => {
                                        const Icon = a.icon;
                                        return (
                                            <button key={a.label} type="button" onClick={() => { setNewOpen(false); router.visit(a.href); }}
                                                className="flex w-full items-center gap-3 px-3 py-2 text-[11px] font-medium text-[var(--text-muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--text)]">
                                                <Icon size={14} className="text-[var(--text-muted)]" />
                                                {a.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </div>

                    <MessagePopover />

                    <NotificationPopover />

                    <ThemeToggle />
                </div>
            </div>
        </header>
    );
}
