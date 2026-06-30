import type { TaskRow } from '@/features/tasks/types';
import { PRIORITY_COLORS, PRIORITY_LABELS, STATUS_COLORS, STATUS_LABELS } from '@/features/tasks/types';

type Props = {
    tasks: TaskRow[];
    onTaskClick: (task: TaskRow) => void;
};

export function TaskCalendar({ tasks, onTaskClick }: Props) {
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const weekEnd = new Date(now); weekEnd.setDate(now.getDate() + (7 - now.getDay()));
    const weekEndStr = weekEnd.toISOString().slice(0, 10);
    const groups: { label: string; tasks: TaskRow[] }[] = [
        { label: 'Overdue', tasks: [] },
        { label: 'Today', tasks: [] },
        { label: 'This week', tasks: [] },
        { label: 'Upcoming', tasks: [] },
        { label: 'No date', tasks: [] },
    ];
    for (const t of tasks) {
        if (!t.dueDate) { groups[4].tasks.push(t); continue; }
        if (t.dueDate < today && t.status !== 'completed' && t.status !== 'cancelled') { groups[0].tasks.push(t); continue; }
        if (t.dueDate === today) { groups[1].tasks.push(t); continue; }
        if (t.dueDate <= weekEndStr) { groups[2].tasks.push(t); continue; }
        groups[3].tasks.push(t);
    }

    return (
        <section className="crm-panel overflow-hidden">
            <div className="divide-y divide-[var(--crm-border)]">
                {groups.map((g) => (
                    <div key={g.label} className="px-4 py-3">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-semibold text-[var(--crm-text-muted)]">{g.label}</span>
                            <span className="text-xs text-[var(--crm-muted)]">({g.tasks.length})</span>
                        </div>
                        {g.tasks.length === 0 ? <p className="text-xs text-[var(--crm-text-soft)] py-1">None</p> : g.tasks.map((t) => (
                            <button key={t.id} type="button" onClick={() => onTaskClick(t)}
                                className="flex w-full items-center gap-3 rounded-lg border border-[var(--crm-border)] bg-[var(--crm-surface)] px-3 py-2 text-left transition hover:bg-[var(--crm-surface-2)] mb-1">
                                <span className={`inline-flex items-center rounded-full border px-1.5 py-0.5 text-[9px] font-semibold ${STATUS_COLORS[t.status]}`}>{STATUS_LABELS[t.status]}</span>
                                <span className="min-w-0 flex-1 truncate text-sm font-semibold">{t.title}</span>
                                <span className={`inline-flex items-center rounded-full border px-1.5 py-0.5 text-[9px] font-semibold ${PRIORITY_COLORS[t.priority]}`}>{PRIORITY_LABELS[t.priority]}</span>
                                {t.assignees && Array.isArray(t.assignees) && t.assignees.length > 0 ? (
                                    <span className="flex size-5 items-center justify-center rounded-full bg-[var(--crm-gold)] text-[8px] font-bold text-black">{t.assignees[0].name.charAt(0)}</span>
                                ) : null}
                            </button>
                        ))}
                    </div>
                ))}
            </div>
        </section>
    );
}
