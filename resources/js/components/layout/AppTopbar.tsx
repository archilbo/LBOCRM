import { router } from '@inertiajs/react';
import { Dropdown } from '@heroui/react';
import { IconClipboardList, IconFileText, IconFolder, IconPlus, IconUserPlus } from '@tabler/icons-react';

import { useTranslation } from '@/lib/i18n';
import { MessagePopover } from '@/features/inbox/components/MessagePopover';
import { NotificationPopover } from '@/features/notifications/components/NotificationPopover';
import { AppGlobalSearch } from '@/components/layout/AppGlobalSearch';
import { ThemeToggle } from '@/components/layout/ThemeToggle';

const QUICK_ACTIONS = [
    { labelKey: 'topbar.newProject', icon: IconFolder, href: '/projects/create' },
    { labelKey: 'topbar.newClient', icon: IconUserPlus, href: '/clients/create' },
    { labelKey: 'topbar.finance', icon: IconFileText, href: '/finance/expenses/create' },
    { labelKey: 'topbar.createTask', icon: IconClipboardList, href: '/tasks/create' },
];

export function AppTopbar() {
    const { t } = useTranslation();

    return (
        <header className="relative z-[100] flex h-16 shrink-0 items-center border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--background)_92%,transparent)] px-3 backdrop-blur-[18px] lg:px-6">
            <div className="flex min-w-0 flex-1 items-center gap-1.5 lg:gap-3">
                <AppGlobalSearch />

                <div className="min-w-0 flex-1" />

                <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
                    <Dropdown>
                        <Dropdown.Trigger
                            aria-label={t('topbar.new')}
                            className="relative z-20 flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[11px] font-semibold text-[var(--accent)] transition hover:bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] max-sm:hidden"
                        >
                            <IconPlus size={14} strokeWidth={2.5} />
                            <span className="hidden lg:inline">{t('topbar.new')}</span>
                        </Dropdown.Trigger>
                        <Dropdown.Popover placement="bottom end" className="z-[110] mt-1.5 w-52 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1.5 shadow-2xl shadow-black/50 backdrop-blur-sm">
                            <Dropdown.Menu onAction={(key) => router.visit(String(key))}>
                                {QUICK_ACTIONS.map((action) => {
                                    const Icon = action.icon;
                                    return (
                                        <Dropdown.Item key={action.href} id={action.href} textValue={t(action.labelKey)} className="rounded-lg px-2 py-2 text-[11px] font-medium text-[var(--text-muted)] data-[hovered]:bg-[var(--surface-2)] data-[hovered]:text-[var(--text)]">
                                            <div className="flex items-center gap-3"><Icon size={14} className="text-[var(--text-muted)]" />{t(action.labelKey)}</div>
                                        </Dropdown.Item>
                                    );
                                })}
                            </Dropdown.Menu>
                        </Dropdown.Popover>
                    </Dropdown>

                    <MessagePopover />

                    <NotificationPopover />

                    <ThemeToggle />
                </div>
            </div>
        </header>
    );
}
