import { Head, router } from '@inertiajs/react';
import { Bell, CheckCheck } from 'lucide-react';
import { useMemo } from 'react';
import { toast } from 'sonner';
import { AppShell } from '@/components/layout/AppShell';
import { cn } from '@/lib/cn';
import type { NotificationRow } from '@/features/notifications/types';
import {
    enrichNotification,
    formatNotificationTime,
    getNotificationIcon,
    groupNotificationsByTime,
    SEVERITY_COLORS,
    TIME_GROUP_ORDER,
    TIME_GROUP_LABELS,
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
            <AppShell>
                <div className="mx-auto w-full max-w-[720px] px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="flex size-9 items-center justify-center rounded-lg bg-white/[0.04]">
                                <Bell size={16} className="text-white/45" />
                            </div>
                            <div>
                                <h1 className="text-base font-semibold text-white/90">Notifications</h1>
                                <p className="text-[10px] text-white/30 mt-0.5">{enriched.length} total{unreadCount > 0 ? `, ${unreadCount} unread` : ''}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            {unreadCount > 0 ? (
                                <button type="button" onClick={markAllAsRead}
                                    className="flex h-8 items-center gap-1.5 rounded-lg px-3 text-[10px] font-semibold text-white/40 transition hover:bg-white/5 hover:text-white/70">
                                    <CheckCheck size={13} />
                                    Mark all read
                                </button>
                            ) : null}
                        </div>
                    </div>

                    {/* Filter tabs */}
                    <div className="flex items-center gap-1 mb-6">
                        {FILTERS.map((f) => {
                            const isActive = activeFilter === f.id;
                            return (
                                <button key={f.id} type="button" onClick={() => router.visit(`/notifications?filter=${f.id}`, { preserveState: true })}
                                    className={cn(
                                        'inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-[10px] font-medium transition',
                                        isActive
                                            ? 'bg-white/10 text-white/80'
                                            : 'text-white/40 hover:bg-white/5 hover:text-white/60',
                                    )}>
                                    {f.label}
                                    {f.id === 'unread' && unreadCount > 0 ? (
                                        <span className="flex h-3.5 min-w-[15px] items-center justify-center rounded bg-red-500/80 px-1 text-[8px] font-bold text-white">{unreadCount}</span>
                                    ) : null}
                                </button>
                            );
                        })}
                    </div>

                    {/* List */}
                    <div className="space-y-6">
                        {TIME_GROUP_ORDER.map((group) => {
                            const items = grouped.get(group);
                            if (!items?.length) return null;
                            return (
                                <div key={group}>
                                    <div className="flex items-center gap-3 mb-3 px-0.5">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[9px] font-semibold uppercase tracking-widest text-white/25">{TIME_GROUP_LABELS[group]}</span>
                                            <span className="flex h-4 min-w-[18px] items-center justify-center rounded bg-white/[0.04] px-1.5 text-[9px] font-semibold tabular-nums text-white/20">{items.length}</span>
                                        </div>
                                        <div className="flex-1 h-px bg-white/[0.04]" />
                                    </div>
                                    <div className="space-y-1.5">
                                        {items.map((n) => {
                                            const Icon = getNotificationIcon(n.module);
                                            const sev = SEVERITY_COLORS[n.severity];
                                            return (
                                                <div
                                                    key={n.id}
                                                    onClick={() => { if (!n.actionUrl) return; if (n.isRead) { router.visit(n.actionUrl); return; } router.post(`/notifications/${n.id}/read`, {}, { preserveScroll: true, onSuccess: () => router.visit(n.actionUrl) }); }}
                                                    className={cn(
                                                        'group relative flex items-start gap-3.5 rounded-lg px-4 py-3.5 transition cursor-pointer',
                                                        n.isRead
                                                            ? 'hover:bg-white/[0.015]'
                                                            : 'bg-white/[0.02] hover:bg-white/[0.03]',
                                                    )}
                                                >
                                                    {/* Unread indicator */}
                                                    {!n.isRead ? (
                                                        <span className="absolute left-0 top-3.5 w-0.5 h-4.5 rounded-r-full" style={{ backgroundColor: sev.dot.replace('bg-', '').replace('-400', '') }} />
                                                    ) : null}

                                                    {/* Icon */}
                                                    <div className={cn(
                                                        'flex size-8 shrink-0 items-center justify-center rounded-lg',
                                                        n.isRead
                                                            ? 'bg-white/[0.03] text-white/25'
                                                            : `${sev.bg} ${sev.dot.replace('bg-', 'text-')}`,
                                                    )}>
                                                        <Icon size={15} />
                                                    </div>

                                                    {/* Content */}
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div className="min-w-0">
                                                                <p className={cn(
                                                                    'text-[12px] leading-snug',
                                                                    n.isRead ? 'text-white/50' : 'text-white/85 font-semibold',
                                                                )}>
                                                                    {n.title}
                                                                </p>
                                                            </div>
                                                            <span className="shrink-0 text-[9px] text-white/25 tabular-nums mt-0.5">{formatNotificationTime(n.createdAt)}</span>
                                                        </div>
                                                        {n.body ? (
                                                            <p className={cn(
                                                                'mt-1 text-xs leading-relaxed max-w-lg',
                                                                n.isRead ? 'text-white/25' : 'text-white/40',
                                                            )}>{n.body}</p>
                                                        ) : null}
                                                        <div className="mt-2 flex items-center gap-2">
                                                            {n.entityLabel ? (
                                                                <span className="inline-flex items-center gap-1 rounded-md bg-white/[0.04] px-1.5 py-0.5 text-[9px] font-semibold text-white/35">{n.entityLabel}</span>
                                                            ) : null}
                                                            <span className={cn(
                                                                'text-[9px] font-semibold',
                                                                n.isRead ? 'text-white/15' : sev.dot.replace('bg-', 'text-'),
                                                            )}>
                                                                {n.severity === 'urgent' ? 'Urgent' : n.severity === 'warning' ? 'Warning' : n.severity === 'success' ? 'Success' : 'Info'}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Mark as read */}
                                                    {!n.isRead ? (
                                                        <button type="button" onClick={(e) => { e.stopPropagation(); markAsRead(n.id); }}
                                                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md self-start mt-1 text-white/25 transition hover:bg-white/5 hover:text-emerald-400" title="Mark as read">
                                                            <CheckCheck size={13} />
                                                        </button>
                                                    ) : null}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                        {enriched.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-24">
                                <div className="flex size-14 items-center justify-center rounded-xl bg-white/[0.03]">
                                    <Bell size={24} className="text-white/15" />
                                </div>
                                <p className="mt-4 text-sm font-medium text-white/35">No notifications</p>
                                <p className="mt-1.5 text-xs text-white/25">You're all caught up.</p>
                            </div>
                        ) : null}
                    </div>
                </div>
            </AppShell>
        </>
    );
}