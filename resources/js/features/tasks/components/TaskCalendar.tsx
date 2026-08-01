import type { TaskRow } from '@/features/tasks/types';
import { PRIORITY_COLORS, PRIORITY_LABELS, STATUS_DOT_COLORS, STATUS_LABELS } from '@/features/tasks/types';

type Props = {
    tasks: TaskRow[];
    onTaskClick: (task: TaskRow) => void;
};

export function TaskCalendar({ tasks, onTaskClick }: Props) {
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const weekEnd = new Date(now); weekEnd.setDate(now.getDate() + (7 - now.getDay()));
    const weekEndStr = weekEnd.toISOString().slice(0, 10);

    const groups: { label: string; tasks: TaskRow[]; accent: string }[] = [
        { label: 'Overdue', tasks: [], accent: 'text-red-400' },
        { label: 'Today', tasks: [], accent: 'text-[var(--crm-gold)]' },
        { label: 'This week', tasks: [], accent: 'text-blue-400' },
        { label: 'Upcoming', tasks: [], accent: 'text-emerald-400' },
        { label: 'No date', tasks: [], accent: 'text-zinc-400' },
    ];

    for (const t of tasks) {
        if (!t.dueDate) { groups[4].tasks.push(t); continue; }
        if (t.dueDate < today && t.status !== 'completed' && t.status !== 'cancelled') { groups[0].tasks.push(t); continue; }
        if (t.dueDate === today) { groups[1].tasks.push(t); continue; }
        if (t.dueDate <= weekEndStr) { groups[2].tasks.push(t); continue; }
        groups[3].tasks.push(t);
    }

    const nonEmpty = groups.filter((g) => g.tasks.length > 0);

    if (nonEmpty.length === 0) {
        return (
            <div className="flex items-center justify-center rounded-xl border border-dashed border-[var(--crm-border)] bg-[var(--crm-elevated)] py-16">
                <p className="text-sm text-[var(--crm-text-muted)]">No tasks to show.</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {nonEmpty.map((group) => (
                <div key={group.label} className="rounded-xl border border-[var(--crm-border)] bg-[var(--crm-elevated)] p-3">
                    <div className="mb-2 flex items-center gap-2">
                        <span className={`text-xs font-bold uppercase tracking-[0.1em] ${group.accent}`}>{group.label}</span>
                        <span className="text-[9px] text-[var(--crm-text-muted)]">({group.tasks.length})</span>
                    </div>
                    <div className="space-y-1">
                        {group.tasks.map((t) => (
                            <button key={t.id} type="button" onClick={() => onTaskClick(t)}
                                className="flex w-full items-center gap-2 rounded-lg border border-transparent px-2.5 py-2 text-left transition hover:border-[var(--crm-border)] hover:bg-[var(--crm-surface)]">
                                <span className={`size-2 shrink-0 rounded-full ${STATUS_DOT_COLORS[t.status]}`} />
                                <span className="min-w-0 flex-1 truncate text-xs font-semibold text-[var(--crm-text)]">{t.title}</span>
                                <span className={`inline-flex items-center rounded-full border px-1.5 py-0.5 text-[9px] font-semibold ${PRIORITY_COLORS[t.priority]}`}>{PRIORITY_LABELS[t.priority]}</span>
                                {t.dueDate ? <span className={`whitespace-nowrap text-[9px] ${group.label === 'Overdue' ? 'font-semibold text-red-400' : 'text-[var(--crm-text-muted)]'}`}>{t.dueDate}</span> : null}
                                {Array.isArray(t.assignees) && t.assignees.length > 0 ? (
                                    <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-[var(--crm-gold)] text-[7px] font-bold text-black">{t.assignees[0].name.charAt(0)}</span>
                                ) : null}
                            </button>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
