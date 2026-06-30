import { Head, router } from '@inertiajs/react';
import { Bell, CheckCheck, ListChecks, MessageSquare } from 'lucide-react';
import { useMemo } from 'react';
import { toast } from 'sonner';
import { AppShell } from '@/components/layout/AppShell';
import { AppButton } from '@/components/ui/AppButton';
import type { NotificationRow } from '@/features/notifications/types';

type PageProps = {
    notifications: NotificationRow[];
    unreadCount: number;
    activeFilter: string;
};

const FILTERS = [
    { id: 'all', label: 'All' },
    { id: 'unread', label: 'Unread' },
];

function notificationIcon(type: string) {
    switch (type) {
        case 'TaskNotification': return ListChecks;
        case 'ChatMessageNotification': return MessageSquare;
        default: return Bell;
    }
}

function notificationLink(notification: NotificationRow): string {
    const data = notification.data;
    if (data.task_id) return `/tasks?filter=all&category=all`;
    if (data.conversation_id) return `/inbox`;
    return '#';
}

export default function NotificationsIndex({ notifications, unreadCount, activeFilter }: PageProps) {
    const grouped = useMemo(() => {
        const groups: Record<string, NotificationRow[]> = { Today: [], 'This week': [], Earlier: [] };
        const now = new Date();
        for (const n of notifications) {
            const d = new Date(n.createdAt);
            const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
            if (diffDays === 0) groups.Today.push(n);
            else if (diffDays < 7) groups['This week'].push(n);
            else groups.Earlier.push(n);
        }
        return groups;
    }, [notifications]);

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
                        {Object.entries(grouped).map(([groupName, items]) => (
                            items.length > 0 ? (
                                <div key={groupName}>
                                    <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--crm-text-muted)]">{groupName}</h3>
                                    <div className="space-y-1">
                                        {items.map((notification) => {
                                            const Icon = notificationIcon(notification.type);
                                            return (
                                                <div key={notification.id} className={`flex items-start gap-3 rounded-xl border px-4 py-3 transition ${notification.isRead ? 'border-[var(--crm-border)] bg-[var(--crm-surface)]' : 'border-[var(--crm-gold)]/20 bg-[color-mix(in_srgb,var(--crm-gold)_6%,transparent)]'}`}>
                                                    <div className={`flex size-8 shrink-0 items-center justify-center rounded-full ${notification.isRead ? 'bg-[var(--crm-surface-2)] text-[var(--crm-muted)]' : 'bg-[var(--crm-gold-soft)] text-[var(--crm-gold)]'}`}>
                                                        <Icon size={15} />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm text-[var(--crm-text)]">
                                                            {typeof notification.data.description === 'string' ? notification.data.description : notification.type}
                                                        </p>
                                                        <p className="mt-0.5 text-xs text-[var(--crm-text-muted)]">{notification.createdAtHuman}</p>
                                                    </div>
                                                    <div className="flex shrink-0 items-center gap-1">
                                                        {notification.data.task_id || notification.data.conversation_id ? (
                                                            <button type="button" onClick={() => router.visit(notificationLink(notification))}
                                                                className="crm-action-button h-7 px-2 text-xs">View</button>
                                                        ) : null}
                                                        {!notification.isRead ? (
                                                            <button type="button" onClick={() => markAsRead(notification.id)}
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
                            ) : null
                        ))}
                        {notifications.length === 0 ? (
                            <div className="py-16 text-center">
                                <Bell size={36} className="mx-auto text-[var(--crm-muted)]" />
                                <p className="mt-3 text-sm text-[var(--crm-text-muted])">No notifications yet</p>
                            </div>
                        ) : null}
                    </section>
                </div>
            </AppShell>
        </>
    );
}
