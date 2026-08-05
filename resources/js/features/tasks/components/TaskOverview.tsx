import { IconAlertTriangle, IconCalendarMonth, IconCircleCheck, IconClockHour3, IconListCheck, IconShieldExclamation } from '@tabler/icons-react';

import { useMemo } from 'react';
import { Card } from '@heroui/react';
import { AppKpiCard } from '@/components/ui/AppKpiCard';
import type { TaskRow, TaskStatus } from '@/features/tasks/types';
import { PRIORITY_COLORS, PRIORITY_LABELS, STATUS_COLORS, STATUS_DOT_COLORS, STATUS_LABELS } from '@/features/tasks/types';

type Props = { tasks: TaskRow[]; onTaskClick: (t: TaskRow) => void; userId?: number | null };

function isOpen(t: TaskRow) { return t.status !== 'completed' && t.status !== 'cancelled'; }
function isOverdue(t: TaskRow) { return Boolean(t.dueDate && new Date(t.dueDate) < new Date() && isOpen(t)); }

function formatLocalDay(date: Date): string {
    const offset = date.getTimezoneOffset() * 60_000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

function taskDay(value: string | null | undefined): string | null {
    return value?.match(/^\d{4}-\d{2}-\d{2}/)?.[0] ?? null;
}

function taskSeries(
    tasks: TaskRow[],
    getDate: (task: TaskRow) => string | null | undefined,
    startOffset: number,
): number[] {
    const points = new Map<string, number>();

    for (let index = 0; index < 7; index += 1) {
        const date = new Date();
        date.setDate(date.getDate() + startOffset + index);
        points.set(formatLocalDay(date), 0);
    }

    for (const task of tasks) {
        const day = taskDay(getDate(task));
        if (day && points.has(day)) {
            points.set(day, (points.get(day) ?? 0) + 1);
        }
    }

    return [...points.values()];
}

export function TaskOverview({ tasks, onTaskClick, userId }: Props) {
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);
    const weekEnd = new Date(today); weekEnd.setDate(today.getDate() + 7);
    const weekEndStr = weekEnd.toISOString().slice(0, 10);

    const metrics = useMemo(() => {
        const open = tasks.filter(isOpen);
        const overdueT = tasks.filter(isOverdue);
        const urgent = open.filter((t) => t.priority === 'urgent' || t.impact === 'critical');
        const blocked = open.filter((t) => t.status === 'blocked');
        const review = open.filter((t) => t.status === 'in_review');
        const completed = tasks.filter((t) => t.status === 'completed');
        const cancelled = tasks.filter((t) => t.status === 'cancelled');
        const pending = tasks.filter((t) => t.status === 'not_started');
        const dueThisWeek = tasks.filter((t) => t.dueDate && t.dueDate >= todayStr && t.dueDate <= weekEndStr && isOpen(t));
        return {
            open,
            overdueT,
            urgent,
            blocked,
            review,
            completed,
            cancelled,
            pending,
            dueThisWeek,
            openSeries: taskSeries(open, (task) => task.updatedAt, -6),
            completedSeries: taskSeries(completed, (task) => task.completedAt, -6),
            pendingSeries: taskSeries(pending, (task) => task.createdAt, -6),
            upcomingSeries: taskSeries(dueThisWeek, (task) => task.dueDate, 0),
            overdueSeries: taskSeries(overdueT, (task) => task.dueDate, -6),
        };
    }, [tasks]);

    const statusCounts = useMemo(() => {
        const map: Record<string, { count: number; label: string }> = {};
        for (const s of ['not_started', 'in_progress', 'waiting_client', 'waiting_admin', 'blocked', 'in_review', 'completed', 'cancelled'] as TaskStatus[]) {
            map[s] = { count: tasks.filter((t) => t.status === s).length, label: STATUS_LABELS[s] };
        }
        return map;
    }, [tasks]);

    const weekDays = useMemo(() => {
        const days: { date: string; label: string; tasks: TaskRow[] }[] = [];
        const now = new Date();
        for (let i = 0; i < 7; i++) {
            const d = new Date(now); d.setDate(now.getDate() + i);
            const ds = d.toISOString().slice(0, 10);
            days.push({ date: ds, label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en', { weekday: 'short' }), tasks: tasks.filter((t) => t.dueDate === ds && isOpen(t)) });
        }
        return days;
    }, [tasks]);

    const sortedStatuses: TaskStatus[] = ['not_started', 'in_progress', 'waiting_client', 'waiting_admin', 'blocked', 'in_review', 'completed'];
    const totalOpen = sortedStatuses.filter((s) => s !== 'completed' && s !== 'cancelled').reduce((a, s) => a + (statusCounts[s]?.count || 0), 0);

    const focusTasks = useMemo(() => {
        if (userId) {
            const mine = tasks.filter((t) => t.assignees?.some((a) => a.id === userId) && isOpen(t));
            return mine.slice(0, 5);
        }
        return tasks.filter((t) => (t.priority === 'urgent' || isOverdue(t)) && isOpen(t)).slice(0, 5);
    }, [tasks, userId]);

    const attentionTasks = useMemo(() => {
        return tasks.filter((t) => (t.status === 'blocked' || isOverdue(t) || t.priority === 'urgent') && isOpen(t)).slice(0, 5);
    }, [tasks]);

    return (
        <div className="space-y-4">
            {/* KPI Row */}
            <div className="grid min-w-0 gap-3 md:grid-cols-2 xl:grid-cols-5">
                <AppKpiCard icon={<IconListCheck size={16} className="text-sky-400" />} label="Open" value={metrics.open.length} detail="Active operational work" sparklineData={metrics.openSeries} accentColor="#38bdf8" showAutoTrend={false} />
                <AppKpiCard icon={<IconCircleCheck size={16} className="text-emerald-400" />} label="Completed" value={metrics.completed.length} detail="Finished tasks" sparklineData={metrics.completedSeries} accentColor="#34d399" showAutoTrend={false} />
                <AppKpiCard icon={<IconClockHour3 size={16} className="text-amber-400" />} label="Pending" value={metrics.pending.length} detail="Not yet started" sparklineData={metrics.pendingSeries} accentColor="#fbbf24" showAutoTrend={false} />
                <AppKpiCard icon={<IconCalendarMonth size={16} className="text-violet-400" />} label="Upcoming" value={metrics.dueThisWeek.length} detail="Due within 7 days" sparklineData={metrics.upcomingSeries} accentColor="#a78bfa" showAutoTrend={false} />
                <AppKpiCard icon={<IconAlertTriangle size={16} className={metrics.overdueT.length ? 'text-rose-400' : 'text-emerald-400'} />} label="Overdue" value={metrics.overdueT.length} detail={metrics.overdueT.length ? 'Past due date' : 'All on track'} sparklineData={metrics.overdueSeries} accentColor={metrics.overdueT.length ? '#fb7185' : '#34d399'} showAutoTrend={false} />
            </div>

            <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
                {/* Status Overview */}
                <Card className="gap-0 overflow-hidden border border-[var(--border)] bg-[var(--surface)] shadow-sm">
                    <Card.Content className="p-4">
                    <p className="mb-3 text-xs font-bold uppercase tracking-[0.1em] text-[var(--text-muted)]">Workflow status</p>
                    <div className="space-y-2">
                        {sortedStatuses.map((s) => {
                            const c = statusCounts[s]?.count || 0;
                            const pct = totalOpen > 0 && s !== 'completed' && s !== 'cancelled' ? Math.round((c / totalOpen) * 100) : 0;
                            return (
                                <div key={s} className="flex items-center gap-3">
                                    <span className={`size-2 rounded-full ${STATUS_DOT_COLORS[s]}`} />
                                    <span className="w-24 text-[10px] font-medium text-[var(--crm-text)]">{STATUS_LABELS[s]}</span>
                                    <div className="flex-1">
                                        <div className="h-2 rounded-full bg-[var(--crm-surface-3)]">
                                            <div className={`h-full rounded-full ${STATUS_COLORS[s].split(' ')[0].replace('bg-', 'bg-')}`} style={{ width: `${Math.max(pct, c > 0 ? 4 : 0)}%` }} />
                                        </div>
                                    </div>
                                    <span className="w-8 text-right text-[10px] font-semibold text-[var(--crm-text-muted)]">{c}</span>
                                </div>
                            );
                        })}
                    </div>
                    </Card.Content>
                </Card>

                {/* Mini Timeline - 7 Day */}
                <Card className="gap-0 overflow-hidden border border-[var(--border)] bg-[var(--surface)] shadow-sm">
                    <Card.Content className="p-4">
                    <p className="mb-3 text-xs font-bold uppercase tracking-[0.1em] text-[var(--text-muted)]">Next 7 days</p>
                    <div className="flex gap-1">
                        {weekDays.map((day) => (
                            <div key={day.date} className="flex flex-1 flex-col items-center gap-1">
                                <span className="text-[9px] font-semibold text-[var(--crm-muted)]">{day.label}</span>
                                <div className={`flex h-16 w-full flex-col items-center justify-end rounded-lg border ${day.date === today ? 'border-[var(--crm-gold)] bg-[var(--crm-gold)]/5' : 'border-[var(--crm-border)]'}`}>
                                    {day.tasks.slice(0, 3).map((t) => (
                                        <button key={t.id} type="button" onClick={() => onTaskClick(t)}
                                            className="mb-[1px] h-2 w-[80%] rounded-sm bg-[var(--crm-gold)] opacity-70 hover:opacity-100" title={t.title} />
                                    ))}
                                    {day.tasks.length > 3 ? <span className="text-[8px] text-[var(--crm-muted)]">+{day.tasks.length - 3}</span> : null}
                                </div>
                                <span className="text-[9px] text-[var(--crm-text-muted)]">{day.tasks.length}</span>
                            </div>
                        ))}
                    </div>
                    </Card.Content>
                </Card>

                {/* My Focus */}
                <Card className="gap-0 overflow-hidden border border-[var(--border)] bg-[var(--surface)] shadow-sm">
                    <Card.Content className="p-4">
                    <p className="mb-3 text-xs font-bold uppercase tracking-[0.1em] text-[var(--text-muted)]">{userId ? 'My focus' : 'Urgent focus'}</p>
                    {focusTasks.length === 0 ? <p className="text-xs text-[var(--crm-text-muted)]">Nothing urgent.</p> : (
                        <div className="space-y-1.5">
                            {focusTasks.map((t) => {
                                const overdue = isOverdue(t);
                                return (
                                    <button key={t.id} type="button" onClick={() => onTaskClick(t)}
                                        className="flex w-full items-center gap-2 rounded-lg border border-[var(--crm-border)] px-2.5 py-2 text-left transition hover:bg-[var(--crm-surface)]">
                                        <span className={`size-2 shrink-0 rounded-full ${STATUS_DOT_COLORS[t.status]}`} />
                                        <span className="min-w-0 flex-1 truncate text-xs font-semibold text-[var(--crm-text)]">{t.title}</span>
                                        {t.dueDate ? <span className={`whitespace-nowrap text-[9px] ${overdue ? 'font-semibold text-red-400' : 'text-[var(--crm-text-muted)]'}`}>{t.dueDate}</span> : null}
                                        <span className={`inline-flex items-center rounded-full border px-1.5 py-0.5 text-[9px] font-semibold ${PRIORITY_COLORS[t.priority]}`}>{PRIORITY_LABELS[t.priority]}</span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                    </Card.Content>
                </Card>
            </div>

            {/* Attention panel */}
            {attentionTasks.length > 0 ? (
                <div className="rounded-xl border border-red-400/15 bg-red-400/3 p-4">
                    <div className="mb-3 flex items-center gap-2">
                        <IconShieldExclamation size={14} className="text-red-400" />
                        <p className="text-xs font-bold uppercase tracking-[0.1em] text-red-300">Needs attention</p>
                        <span className="text-[9px] text-[var(--crm-muted)]">({attentionTasks.length})</span>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                        {attentionTasks.map((t) => (
                            <button key={t.id} type="button" onClick={() => onTaskClick(t)}
                                className="flex items-center gap-2 rounded-lg border border-red-400/10 bg-[var(--crm-surface)] px-3 py-2 text-left transition hover:border-red-400/30">
                                <span className={`size-2 shrink-0 rounded-full ${STATUS_DOT_COLORS[t.status]}`} />
                                <span className="min-w-0 flex-1 truncate text-xs font-semibold text-[var(--crm-text)]">{t.title}</span>
                                <span className="whitespace-nowrap text-[9px] text-[var(--crm-text-muted)]">{t.dueDate || 'No date'}</span>
                            </button>
                        ))}
                    </div>
                </div>
            ) : null}
        </div>
    );
}
