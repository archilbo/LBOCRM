import { router, usePage } from '@inertiajs/react';
import { IconBell, IconChecks, IconExternalLink } from '@tabler/icons-react';

import { useCallback, useMemo, useState } from 'react';
import { Button, Dialog, DialogTrigger, Popover } from 'react-aria-components';
import { toast } from 'sonner';
import { useTranslation } from '@/lib/i18n';
import type { EnrichedNotification, NotificationModule, NotificationRow } from '@/features/notifications/types';
import {
    enrichNotification,
    formatNotificationTime,
    getNotificationIcon,
    groupNotificationsByTime,
    SEVERITY_COLORS,
    TIME_GROUP_ORDER,
} from '@/features/notifications/helpers';

type NotifData = { recent_notifications?: NotificationRow[] };

const MODULE_TABS: { key: 'all' | NotificationModule; label: string }[] = [
    { key: 'all', label: 'Inbox' },
    { key: 'tasks', label: 'Tasks' },
    { key: 'requests', label: 'Requests' },
    { key: 'system', label: 'System' },
];

function getModuleTabLabel(key: 'all' | NotificationModule, t: (key: string) => string): string {
    if (key === 'all') return t('notifications.inbox');
    return t(`notifications.modules.${key}`);
}

function MarkAsReadBtn({ id, size = 14 }: { id: string; size?: number }) {
    const { t } = useTranslation();
    return (
        <button type="button" onClick={(e) => { e.stopPropagation(); router.post(`/notifications/${id}/read`, {}, { preserveScroll: true, onSuccess: () => toast.success(t('notifications.markedAsRead')) }); }}
            className="flex size-6 items-center justify-center rounded-md text-[var(--crm-text-muted)] opacity-0 transition group-hover:opacity-100 hover:bg-[var(--crm-surface-2)] hover:text-[var(--crm-gold)]">
            <IconChecks size={size} />
        </button>
    );
}

function NotifCard({ n, onClose }: { n: EnrichedNotification; onClose: () => void }) {
    const { t, locale } = useTranslation();
    const Icon = getNotificationIcon(n.module);
    const sev = SEVERITY_COLORS[n.severity];

    // Translate title if it's a translation key
    const displayTitle = n.title.startsWith('notifications.') ? t(n.title, n.values) : n.title;

    function handleClick() {
        if (!n.isRead) {
            router.post(`/notifications/${n.id}/read`, {}, { preserveScroll: true });
        }
        if (n.actionUrl) {
            router.visit(n.actionUrl);
        }
        onClose();
    }

    return (
        <button type="button" onClick={handleClick}
            className={`group relative flex w-full gap-3 px-3 py-2.5 text-left transition hover:bg-[var(--crm-surface)] ${n.isRead ? '' : 'bg-[var(--crm-gold)]/[0.04]'}`}>
            {!n.isRead ? <span className={`absolute left-2.5 top-[14px] size-1.5 rounded-full ${sev.dot}`} /> : null}
            <div className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${n.isRead ? 'bg-[var(--crm-surface-2)] text-[var(--crm-text-muted)]' : `${sev.bg} ${sev.dot.replace('bg-', 'text-').replace('-400', '-400')}`}`}>
                <Icon size={15} />
            </div>
            <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                    <p className={`truncate text-xs font-semibold ${n.isRead ? 'text-[var(--crm-text-muted)]' : 'text-[var(--crm-text)]'}`}>
                        {displayTitle}
                    </p>
                    <span className="shrink-0 text-[9px] text-[var(--crm-text-muted)]">{formatNotificationTime(n.createdAt, locale)}</span>
                </div>
                {n.body ? (
                    <p className={`mt-0.5 line-clamp-1 text-[10px] ${n.isRead ? 'text-[var(--crm-text-muted)]/70' : 'text-[var(--crm-text-muted)]'}`}>
                        {n.body.startsWith('notifications.') ? t(n.body, n.values) : n.body}
                    </p>
                ) : null}
                <div className="mt-1 flex items-center gap-2">
                    {n.entityLabel ? (
                        <span className="inline-flex items-center gap-1 rounded bg-[var(--crm-surface-2)] px-1.5 py-0.5 text-[9px] font-semibold text-[var(--crm-text-muted)]">
                            {n.entityLabel}
                        </span>
                    ) : null}
                    <span className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-semibold ${n.isRead ? 'text-[var(--crm-text-muted)]/50' : sev.dot.replace('bg-', 'text-')}`}>
                        {n.severity === 'urgent' ? t('notifications.severity.urgent') : n.severity === 'warning' ? t('notifications.severity.warning') : n.severity === 'success' ? t('notifications.severity.success') : t('notifications.severity.info')}
                    </span>
                </div>
            </div>
            {!n.isRead ? <MarkAsReadBtn id={n.id} /> : null}
        </button>
    );
}

function NotifGroup({ label, items, onClose }: { label: string; items: EnrichedNotification[]; onClose: () => void }) {
    return (
        <div>
            <div className="sticky top-0 z-10 bg-[var(--crm-elevated)] px-3 pb-1 pt-2">
                <span className="text-[9px] font-semibold uppercase tracking-wider text-[var(--crm-text-muted)]">{label}</span>
            </div>
            {items.map((n) => (
                <NotifCard key={n.id} n={n} onClose={onClose} />
            ))}
        </div>
    );
}

export function NotificationPopover() {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<'all' | NotificationModule>('all');

    const pageProps = usePage().props as unknown as { auth: { user?: { recent_notifications?: NotificationRow[]; unread_notifications?: number } } };
    const notifRows = pageProps.auth?.user?.recent_notifications ?? [];
    const unreadCount = pageProps.auth?.user?.unread_notifications ?? 0;

    const enriched = useMemo(() => notifRows.map((row) => enrichNotification(row, t)), [notifRows, t]);

    const filtered = useMemo(() => {
        if (activeTab === 'all') return enriched;
        return enriched.filter((n) => n.module === activeTab);
    }, [enriched, activeTab]);

    const notificationsByTime = useMemo(() => groupNotificationsByTime(filtered), [filtered]);

    const moduleCounts = useMemo(() => {
        const counts: Partial<Record<'all' | NotificationModule, number>> = { all: enriched.length };
        for (const n of enriched) {
            counts[n.module] = (counts[n.module] || 0) + 1;
        }
        return counts;
    }, [enriched]);

    const handleMarkAllRead = useCallback(() => {
        router.post('/notifications/read-all', {}, { preserveScroll: true, onSuccess: () => toast.success(t('notifications.allMarkedAsRead')) });
    }, [t]);

    return (
        <DialogTrigger>
            <Button className="relative flex h-8 w-8 items-center justify-center rounded-lg text-[var(--crm-text-muted)] transition hover:bg-[var(--crm-surface-2)] hover:text-[var(--crm-text)]" aria-label="Notifications">
                <IconBell size={15} />
                {unreadCount > 0 ? (
                    <span className="absolute -right-1.5 -top-1 flex min-w-[18px] items-center justify-center rounded-md bg-red-500 px-1 py-[1px] text-[9px] font-bold leading-tight text-white shadow-sm shadow-red-500/30">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                ) : null}
            </Button>
            <Popover placement="bottom end" className="react-aria-Popover" style={{ maxWidth: '480px', minWidth: '420px' }}>
                <Dialog className="outline-none" aria-label={t('notifications.title')}>
                    {({ close }) => (
                        <div className="flex max-h-[70vh] flex-col rounded-xl border border-[var(--crm-border)] bg-[var(--crm-elevated)] shadow-2xl shadow-black/50">
                            <div className="flex items-center justify-between border-b border-[var(--crm-border)] px-4 py-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-[var(--crm-text)]">{t('notifications.title')}</span>
                                    {unreadCount > 0 ? (
                                        <span className="flex h-5 min-w-[22px] items-center justify-center rounded-md bg-red-500 px-1.5 text-[9px] font-bold text-white shadow-sm shadow-red-500/30">{unreadCount}</span>
                                    ) : null}
                                </div>
                                <div className="flex items-center gap-1">
                                    {unreadCount > 0 ? (
                                        <button type="button" onClick={handleMarkAllRead}
                                            className="flex h-7 items-center gap-1 rounded-md px-2 text-[9px] font-semibold text-[var(--crm-text-muted)] transition hover:bg-[var(--crm-surface)] hover:text-[var(--crm-gold)]">
                                            <IconChecks size={12} />
                                            <span className="hidden sm:inline">{t('notifications.markAllRead')}</span>
                                        </button>
                                    ) : null}
                                </div>
                            </div>

                            <div className="flex gap-1 border-b border-[var(--crm-border)] px-3 py-2">
                                {MODULE_TABS.map((tab) => {
                                    const count = moduleCounts[tab.key] || 0;
                                    const isActive = activeTab === tab.key;
                                    return (
                                        <button key={tab.key} type="button" onClick={() => setActiveTab(tab.key)}
                                            className={`inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-[9px] font-semibold transition ${isActive ? 'bg-[var(--crm-gold-brand)] text-black' : 'text-[var(--crm-text-muted)] hover:bg-[var(--crm-surface)] hover:text-[var(--crm-text)]'}`}>
                                            {getModuleTabLabel(tab.key, t)}
                                            {count > 0 ? (
                                                <span className={`flex h-4 min-w-[16px] items-center justify-center rounded px-1 text-[9px] font-bold ${isActive ? 'bg-black/20 text-black' : 'bg-[var(--crm-surface-2)] text-[var(--crm-text-muted)]'}`}>
                                                    {count}
                                                </span>
                                            ) : null}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="flex-1 overflow-y-auto">
                                {filtered.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
                                        <IconBell size={24} className="text-[var(--crm-text-muted)]/40" />
                                        <p className="mt-2 text-xs font-semibold text-[var(--crm-text-muted)]">{t('notifications.noNotifications')}</p>
                                        <p className="mt-1 text-[9px] text-[var(--crm-text-muted)]/60">{t('notifications.emptyState')}</p>
                                    </div>
                                ) : (
                                    TIME_GROUP_ORDER.map((group) => {
                                        const items = notificationsByTime.get(group);
                                        if (!items?.length) return null;
                                        return <NotifGroup key={group} label={t(`notifications.timeGroups.${group}`)} items={items} onClose={close} />;
                                    })
                                )}
                            </div>

                            <div className="flex items-center justify-end border-t border-[var(--crm-border)] px-3 py-2">
                                <button type="button" onClick={() => { router.visit('/notifications'); close(); }}
                                    className="flex h-7 items-center gap-1.5 rounded-md px-2.5 text-[9px] font-semibold text-[var(--crm-text-muted)] transition hover:bg-[var(--crm-surface)] hover:text-[var(--crm-gold)]">
                                    <IconExternalLink size={12} />
                                    {t('notifications.viewAll')}
                                </button>
                            </div>
                        </div>
                    )}
                </Dialog>
            </Popover>
        </DialogTrigger>
    );
}
