import { Head, router } from '@inertiajs/react';
import { Bell, CheckCheck } from 'lucide-react';
import { useMemo } from 'react';
import { toast } from 'sonner';
import { AppShell } from '@/components/layout/AppShell';
import { AppButton } from '@/components/ui/AppButton';
import type { NotificationRow } from '@/features/notifications/types';
import {
    enrichNotification,
    formatNotificationTime,
    getNotificationIcon,
    groupNotificationsByTime,
    SEVERITY_COLORS,
    TIME_GROUP_ORDER,
} from '@/features/notifications/helpers';

type PageProps = {
    notifications: NotificationRow[];
    unreadCount: number;
    activeFilter: string;
};

const FILTERS = [
    { id: 'all', label: 'All' },
    { id: 'unread', label: 'Unread' },
];

export default function NotificationsIndex({ notifications, unreadCount, activeFilter }: PageProps) {
    const enriched = useMemo(() => notifications.map(enrichNotification), [notifications]);

    const grouped = useMemo(() => groupNotificationsByTime(enriched), [enriched]);

    function markAsRead(id: string) {
        router.post(`/notifications/${id}/read`, {}, {
            preserveScroll: true,
            onSuccess: () => toast.success('Marked as read.'),
        });
    }

    function markAllAsRead() {
        router.post('/notifications/read-all', {}, {
            preserveScroll: true,
            onSuccess: () => toast.success('All marked as read.'),
        });
    }

    return (
        <>
            <Head title="Notifications" />
            <AppShell eyebrowKey="nav.notifications" titleKey="nav.notifications" subtitleKey="Task updates, chat messages, and system alerts"
                action={
                    unreadCount > 0 ? (
                        <AppButton variant="secondary" onPress={markAllAsRead}>
                            <CheckCheck size={16} /> Mark all read
                        </AppButton>
                    ) : undefined
                }
            >
                <div className="crm-page">
                    <section className="flex flex-wrap gap-2">
                        {FILTERS.map((f) => (
                            <button key={f.id} type="button" onClick={() => router.visit(`/notifications?filter=${f.id}`, { preserveState: true })}
                                className={`inline-flex h-8 items-center gap-2 rounded-lg border px-3 text-xs font-semibold transition ${activeFilter === f.id ? 'border-[var(--crm-gold)] bg-[var(--crm-gold-soft)] text-[var(--crm-gold)]' : 'border-[var(--crm-border)] text-[var(--crm-text-muted)] hover:text-[var(--crm-text)]'}`}>
                                {f.label}
                                {f.id === 'unread' && unreadCount > 0 ? <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[9px] text-white">{unreadCount}</span> : null}
                            </button>
                        ))}
                        <span className="ml-auto text-xs text-[var(--crm-text-muted)]">{unreadCount} unread</span>
                    </section>

                    <section className="space-y-6">
                        {TIME_GROUP_ORDER.map((group) => {
                            const items = grouped.get(group);
                            if (!items?.length) return null;
                            const label = group === 'now' ? 'Now' : group === 'today' ? 'Today' : group === 'yesterday' ? 'Yesterday' : 'Earlier';
                            return (
                                <div key={group}>
                                    <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--crm-text-muted)]">{label}</h3>
                                    <div className="space-y-1">
                                        {items.map((n) => {
                                            const Icon = getNotificationIcon(n.module);
                                            const sev = SEVERITY_COLORS[n.severity];
                                            return (
                                                <div key={n.id} className={`flex items-start gap-3 rounded-xl border px-4 py-3 transition ${n.isRead ? 'border-[var(--crm-border)] bg-[var(--crm-surface)]' : 'border-[var(--crm-gold)]/20 bg-[color-mix(in_srgb,var(--crm-gold)_6%,transparent)]'}`}>
                                                    <div className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${n.isRead ? 'bg-[var(--crm-surface-2)] text-[var(--crm-muted)]' : `${sev.bg} text-[var(--crm-gold)]`}`}>
                                                        <Icon size={15} />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <p className={`text-sm font-semibold ${n.isRead ? 'text-[var(--crm-text-muted)]' : 'text-[var(--crm-text)]'}`}>{n.title}</p>
                                                            <span className="shrink-0 text-[10px] text-[var(--crm-text-muted)]">{formatNotificationTime(n.createdAt)}</span>
                                                        </div>
                                                        {n.body ? (
                                                            <p className={`mt-0.5 text-xs ${n.isRead ? 'text-[var(--crm-text-muted)]/70' : 'text-[var(--crm-text-muted)]'}`}>{n.body}</p>
                                                        ) : null}
                                                        <div className="mt-1.5 flex items-center gap-2">
                                                            {n.entityLabel ? (
                                                                <span className="inline-flex items-center gap-1 rounded bg-[var(--crm-surface-2)] px-1.5 py-0.5 text-[9px] font-semibold text-[var(--crm-muted)]">{n.entityLabel}</span>
                                                            ) : null}
                                                            <span className={`text-[9px] font-semibold ${n.isRead ? 'text-[var(--crm-muted)]' : sev.dot.replace('bg-', 'text-')}`}>
                                                                {n.severity === 'urgent' ? 'Urgent' : n.severity === 'warning' ? 'Warning' : n.severity === 'success' ? 'Success' : 'Info'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex shrink-0 items-center gap-1">
                                                        {n.actionUrl ? (
                                                            <button type="button" onClick={() => router.visit(n.actionUrl!)}
                                                                className="crm-action-button h-7 px-2 text-xs">View</button>
                                                        ) : null}
                                                        {!n.isRead ? (
                                                            <button type="button" onClick={() => markAsRead(n.id)}
                                                                className="crm-action-button h-7 w-7 px-0" title="Mark as read">
                                                                <CheckCheck size={12} />
                                                            </button>
                                                        ) : null}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                        {enriched.length === 0 ? (
                            <div className="py-16 text-center">
                                <Bell size={36} className="mx-auto text-[var(--crm-muted)]" />
                                <p className="mt-3 text-sm text-[var(--crm-text-muted)]">No notifications yet</p>
                            </div>
                        ) : null}
                    </section>
                </div>
            </AppShell>
        </>
    );
}
