import { Head } from '@inertiajs/react';
import { AlertTriangle, CheckCircle2, Clock3, ListTodo, TimerOff } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';

const PRIORITY_META: Record<string, { label: string; color: string; bar: string }> = {
    urgent: { label: 'Urgent', color: 'text-red-300', bar: 'bg-red-400' },
    high: { label: 'High', color: 'text-amber-300', bar: 'bg-amber-400' },
    medium: { label: 'Medium', color: 'text-blue-300', bar: 'bg-blue-400' },
    low: { label: 'Low', color: 'text-zinc-300', bar: 'bg-zinc-400' },
};

const MODULE_META: Record<string, { label: string; color: string; bar: string }> = {
    documents: { label: 'Documents', color: 'text-blue-300', bar: 'bg-blue-400' },
    client_follow_up: { label: 'Client follow-up', color: 'text-emerald-300', bar: 'bg-emerald-400' },
    contract: { label: 'Contract', color: 'text-violet-300', bar: 'bg-violet-400' },
    authorization: { label: 'Authorization', color: 'text-amber-300', bar: 'bg-amber-400' },
    finance: { label: 'Finance', color: 'text-rose-300', bar: 'bg-rose-400' },
    archive: { label: 'Archive', color: 'text-cyan-300', bar: 'bg-cyan-400' },
    general_admin: { label: 'General', color: 'text-zinc-300', bar: 'bg-zinc-400' },
};

type ReportPayload = {
    totalTasks: number;
    openTasks: number;
    completedTasks: number;
    blockedTasks: number;
    overdueTasks: number;
    byModule: Record<string, number>;
    byPriority: Record<string, number>;
};

export default function OperationsReports({ report }: { report: ReportPayload }) {
    const maxModule = Math.max(...Object.values(report.byModule), 1);
    const maxPriority = Math.max(...Object.values(report.byPriority), 1);
    const completionRate = report.totalTasks > 0 ? Math.round((report.completedTasks / report.totalTasks) * 100) : 0;

    return (
        <>
            <Head title="Operations reports" />
            <AppShell eyebrowKey="nav.tasks" titleKey="nav.tasks" subtitleKey="Operations reports">
                <div className="crm-page space-y-6">
                    {/* KPI row */}
                    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                        {[
                            { label: 'Total tasks', value: report.totalTasks, icon: ListTodo, color: 'text-blue-400' },
                            { label: 'Open tasks', value: report.openTasks, icon: Clock3, color: 'text-amber-400' },
                            { label: 'Completed', value: report.completedTasks, icon: CheckCircle2, color: 'text-emerald-400' },
                            { label: 'Blocked', value: report.blockedTasks, icon: AlertTriangle, color: 'text-red-400' },
                            { label: 'Overdue', value: report.overdueTasks, icon: TimerOff, color: 'text-rose-400' },
                        ].map((stat) => (
                            <div key={stat.label} className="rounded-xl border border-[var(--crm-border)] bg-[var(--crm-elevated)] p-4">
                                <div className="flex items-center justify-between">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--crm-muted)]">{stat.label}</p>
                                    <stat.icon size={15} className={stat.color} />
                                </div>
                                <p className="mt-2 text-2xl font-black text-[var(--crm-text)]">{stat.value}</p>
                            </div>
                        ))}
                    </section>

                    {/* Charts row */}
                    <div className="grid gap-4 lg:grid-cols-2">
                        {/* By module */}
                        <div className="rounded-xl border border-[var(--crm-border)] bg-[var(--crm-elevated)] p-5">
                            <h2 className="mb-1 text-sm font-bold text-[var(--crm-text)]">By module</h2>
                            <p className="mb-4 text-[10px] text-[var(--crm-text-muted)]">Task distribution across operation categories</p>
                            <div className="space-y-2.5">
                                {Object.entries(report.byModule)
                                    .sort(([, a], [, b]) => b - a)
                                    .map(([key, count]) => {
                                        const meta = MODULE_META[key] || { label: key, color: 'text-zinc-300', bar: 'bg-zinc-400' };
                                        const pct = Math.round((count / maxModule) * 100);
                                        return (
                                            <div key={key}>
                                                <div className="mb-1 flex items-center justify-between">
                                                    <span className={`text-xs font-semibold ${meta.color}`}>{meta.label}</span>
                                                    <span className="text-xs font-bold text-[var(--crm-text)]">{count}</span>
                                                </div>
                                                <div className="h-2 rounded-full bg-[var(--crm-surface-3)]">
                                                    <div className={`h-full rounded-full ${meta.bar} transition-all`} style={{ width: `${pct}%` }} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                {Object.keys(report.byModule).length === 0 ? (
                                    <p className="py-4 text-center text-xs text-[var(--crm-text-muted)]">No task data available</p>
                                ) : null}
                            </div>
                        </div>

                        {/* By priority */}
                        <div className="rounded-xl border border-[var(--crm-border)] bg-[var(--crm-elevated)] p-5">
                            <h2 className="mb-1 text-sm font-bold text-[var(--crm-text)]">By priority</h2>
                            <p className="mb-4 text-[10px] text-[var(--crm-text-muted)]">Task breakdown by urgency level</p>
                            <div className="space-y-3">
                                {Object.entries(report.byPriority)
                                    .sort(([, a], [, b]) => b - a)
                                    .map(([key, count]) => {
                                        const meta = PRIORITY_META[key] || { label: key, color: 'text-zinc-300', bar: 'bg-zinc-400' };
                                        const pct = Math.round((count / maxPriority) * 100);
                                        return (
                                            <div key={key}>
                                                <div className="mb-1 flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${meta.color} border-current/20`}>
                                                            {meta.label}
                                                        </span>
                                                    </div>
                                                    <span className="text-xs font-bold text-[var(--crm-text)]">{count}</span>
                                                </div>
                                                <div className="h-2.5 rounded-full bg-[var(--crm-surface-3)]">
                                                    <div className={`h-full rounded-full ${meta.bar} transition-all`} style={{ width: `${pct}%` }} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                {Object.keys(report.byPriority).length === 0 ? (
                                    <p className="py-4 text-center text-xs text-[var(--crm-text-muted)]">No priority data available</p>
                                ) : null}
                            </div>
                        </div>
                    </div>

                    {/* Completion rate */}
                    <div className="rounded-xl border border-[var(--crm-border)] bg-[var(--crm-elevated)] p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-sm font-bold text-[var(--crm-text)]">Task completion rate</h2>
                                <p className="mt-0.5 text-[10px] text-[var(--crm-text-muted)]">{report.completedTasks} of {report.totalTasks} tasks completed</p>
                            </div>
                            <span className="text-2xl font-black text-[var(--crm-gold)]">{completionRate}%</span>
                        </div>
                        <div className="mt-3 h-3 rounded-full bg-[var(--crm-surface-3)]">
                            <div className="h-full rounded-full bg-[var(--crm-gold)] transition-all" style={{ width: `${completionRate}%` }} />
                        </div>
                    </div>
                </div>
            </AppShell>
        </>
    );
}
