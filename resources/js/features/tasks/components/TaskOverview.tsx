import { AlertTriangle, CalendarDays, CheckCircle2, Clock3, Flame, ListTodo, ShieldAlert } from 'lucide-react';
import { useMemo } from 'react';
import type { TaskRow, TaskStatus } from '@/features/tasks/types';
import { PRIORITY_COLORS, PRIORITY_LABELS, STATUS_COLORS, STATUS_DOT_COLORS, STATUS_LABELS } from '@/features/tasks/types';

type Props = { tasks: TaskRow[]; onTaskClick: (t: TaskRow) => void; userId?: number | null };

function isOpen(t: TaskRow) { return t.status !== 'completed' && t.status !== 'cancelled'; }
function isOverdue(t: TaskRow) { return Boolean(t.dueDate && new Date(t.dueDate) < new Date() && isOpen(t)); }

function KpiCard({ icon: Icon, label, value, sub, accent }: { icon: typeof Flame; label: string; value: string | number; sub: string; accent: string }) {
    const colors: Record<string, string> = {
        gold: 'text-[var(--crm-gold)] bg-[var(--crm-gold-soft)]',
        red: 'text-red-300 bg-red-500/10',
        green: 'text-emerald-300 bg-emerald-500/10',
        blue: 'text-blue-300 bg-blue-500/10',
        amber: 'text-amber-300 bg-amber-500/10',
        violet: 'text-violet-300 bg-violet-500/10',
    };
    return (
        <div className="rounded-xl border border-[var(--crm-border)] bg-[var(--crm-elevated)] p-3.5 transition hover:border-[var(--crm-gold)]/30">
            <div className="flex items-start justify-between">
                <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--crm-muted)]">{label}</p>
                    <p className="mt-1 text-2xl font-bold leading-none text-[var(--crm-text)]">{value}</p>
                    <p className="mt-1 truncate text-[11px] text-[var(--crm-muted)]">{sub}</p>
                </div>
                <span className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${colors[accent]}`}>
                    <Icon size={17} />
                </span>
            </div>
        </div>
    );
}

export function TaskOverview({ tasks, onTaskClick, userId }: Props) {
    const metrics = useMemo(() => {
        const open = tasks.filter(isOpen);
        const overdueT = tasks.filter(isOverdue);
        const urgent = open.filter((t) => t.priority === 'urgent' || t.impact === 'critical');
        const blocked = open.filter((t) => t.status === 'blocked');
        const review = open.filter((t) => t.status === 'in_review');
        const completed = tasks.filter((t) => t.status === 'completed');
        const cancelled = tasks.filter((t) => t.status === 'cancelled');
        const myTasks = userId ? tasks.filter((t) => t.assignees?.some((a) => a.id === userId)) : [];
        return { open, overdueT, urgent, blocked, review, completed, cancelled, myTasks };
    }, [tasks, userId]);

    const statusCounts = useMemo(() => {
        const map: Record<string, { count: number; label: string }> = {};
        for (const s of ['not_started', 'in_progress', 'waiting_client', 'waiting_admin', 'blocked', 'in_review', 'completed', 'cancelled'] as TaskStatus[]) {
            map[s] = { count: tasks.filter((t) => t.status === s).length, label: STATUS_LABELS[s] };
        }
        return map;
    }, [tasks]);

    const today = new Date().toISOString().slice(0, 10);
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
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                <KpiCard icon={ListTodo} label="Open" value={metrics.open.length} sub="Active operational work" accent="blue" />
                <KpiCard icon={CheckCircle2} label="Completed" value={metrics.completed.length} sub="Finished tasks" accent="green" />
                <KpiCard icon={Clock3} label="Pending" value={metrics.open.length - metrics.in_progress?.length || 0} sub="Not yet started" accent="gold" />
                <KpiCard icon={CalendarDays} label="Due this week" value={tasks.filter((t) => t.dueDate && t.dueDate >= today && new Date(t.dueDate) <= new Date(Date.now() + 7 * 86400000) && isOpen(t)).length} sub="Upcoming deadlines" accent="amber" />
                <KpiCard icon={Flame} label="Urgent" value={metrics.urgent.length} sub={metrics.urgent.length ? 'Needs immediate attention' : 'No urgent items'} accent={metrics.urgent.length ? 'red' : 'green'} />
                <KpiCard icon={AlertTriangle} label="Overdue" value={metrics.overdueT.length} sub={metrics.overdueT.length ? 'Past due date' : 'All on track'} accent={metrics.overdueT.length ? 'red' : 'green'} />
            </div>

            <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
                {/* Status Overview */}
                <div className="rounded-xl border border-[var(--crm-border)] bg-[var(--crm-elevated)] p-4">
                    <p className="mb-3 text-xs font-bold uppercase tracking-[0.1em] text-[var(--crm-muted)]">Status overview</p>
                    <div className="space-y-2">
                        {sortedStatuses.map((s) => {
                            const c = statusCounts[s]?.count || 0;
                            const pct = totalOpen > 0 && s !== 'completed' && s !== 'cancelled' ? Math.round((c / totalOpen) * 100) : 0;
                            return (
                                <div key={s} className="flex items-center gap-3">
                                    <span className={`size-2 rounded-full ${STATUS_DOT_COLORS[s]}`} />
                                    <span className="w-24 text-[11px] font-medium text-[var(--crm-text)]">{STATUS_LABELS[s]}</span>
                                    <div className="flex-1">
                                        <div className="h-2 rounded-full bg-[var(--crm-surface-3)]">
                                            <div className={`h-full rounded-full ${STATUS_COLORS[s].split(' ')[0].replace('bg-', 'bg-')}`} style={{ width: `${Math.max(pct, c > 0 ? 4 : 0)}%` }} />
                                        </div>
                                    </div>
                                    <span className="w-8 text-right text-[11px] font-semibold text-[var(--crm-text-muted)]">{c}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Mini Timeline - 7 Day */}
                <div className="rounded-xl border border-[var(--crm-border)] bg-[var(--crm-elevated)] p-4">
                    <p className="mb-3 text-xs font-bold uppercase tracking-[0.1em] text-[var(--crm-muted)]">7-day view</p>
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
                </div>

                {/* My Focus */}
                <div className="rounded-xl border border-[var(--crm-border)] bg-[var(--crm-elevated)] p-4">
                    <p className="mb-3 text-xs font-bold uppercase tracking-[0.1em] text-[var(--crm-muted)]">{userId ? 'My focus' : 'Urgent focus'}</p>
                    {focusTasks.length === 0 ? <p className="text-xs text-[var(--crm-text-muted)]">Nothing urgent.</p> : (
                        <div className="space-y-1.5">
                            {focusTasks.map((t) => {
                                const overdue = isOverdue(t);
                                return (
                                    <button key={t.id} type="button" onClick={() => onTaskClick(t)}
                                        className="flex w-full items-center gap-2 rounded-lg border border-[var(--crm-border)] px-2.5 py-2 text-left transition hover:bg-[var(--crm-surface)]">
                                        <span className={`size-2 shrink-0 rounded-full ${STATUS_DOT_COLORS[t.status]}`} />
                                        <span className="min-w-0 flex-1 truncate text-xs font-semibold text-[var(--crm-text)]">{t.title}</span>
                                        {t.dueDate ? <span className={`whitespace-nowrap text-[10px] ${overdue ? 'font-semibold text-red-400' : 'text-[var(--crm-text-muted)]'}`}>{t.dueDate}</span> : null}
                                        <span className={`inline-flex items-center rounded-full border px-1.5 py-0.5 text-[9px] font-semibold ${PRIORITY_COLORS[t.priority]}`}>{PRIORITY_LABELS[t.priority]}</span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Attention panel */}
            {attentionTasks.length > 0 ? (
                <div className="rounded-xl border border-red-400/15 bg-red-400/3 p-4">
                    <div className="mb-3 flex items-center gap-2">
                        <ShieldAlert size={14} className="text-red-400" />
                        <p className="text-xs font-bold uppercase tracking-[0.1em] text-red-300">Needs attention</p>
                        <span className="text-[10px] text-[var(--crm-muted)]">({attentionTasks.length})</span>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                        {attentionTasks.map((t) => (
                            <button key={t.id} type="button" onClick={() => onTaskClick(t)}
                                className="flex items-center gap-2 rounded-lg border border-red-400/10 bg-[var(--crm-surface)] px-3 py-2 text-left transition hover:border-red-400/30">
                                <span className={`size-2 shrink-0 rounded-full ${STATUS_DOT_COLORS[t.status]}`} />
                                <span className="min-w-0 flex-1 truncate text-xs font-semibold text-[var(--crm-text)]">{t.title}</span>
                                <span className="whitespace-nowrap text-[10px] text-[var(--crm-text-muted)]">{t.dueDate || 'No date'}</span>
                            </button>
                        ))}
                    </div>
                </div>
            ) : null}
        </div>
    );
}
