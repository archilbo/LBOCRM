import type { TaskRow } from '@/features/tasks/types';
import { PRIORITY_COLORS, PRIORITY_LABELS, STATUS_DOT_COLORS, STATUS_LABELS } from '@/features/tasks/types';

type Props = {
    tasks: TaskRow[];
    onTaskClick: (task: TaskRow) => void;
};

export function TaskTimeline({ tasks, onTaskClick }: Props) {
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const tomorrow = new Date(now); tomorrow.setDate(now.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().slice(0, 10);
    const weekEnd = new Date(now); weekEnd.setDate(now.getDate() + 7);
    const weekEndStr = weekEnd.toISOString().slice(0, 10);

    const groups: { label: string; tasks: TaskRow[] }[] = [
        { label: 'Today', tasks: [] },
        { label: 'Tomorrow', tasks: [] },
        { label: 'This week', tasks: [] },
        { label: 'Later', tasks: [] },
        { label: 'No date', tasks: [] },
    ];

    for (const t of tasks) {
        if (!t.dueDate) { groups[4].tasks.push(t); continue; }
        if (t.dueDate === today) { groups[0].tasks.push(t); continue; }
        if (t.dueDate === tomorrowStr) { groups[1].tasks.push(t); continue; }
        if (t.dueDate <= weekEndStr) { groups[2].tasks.push(t); continue; }
        groups[3].tasks.push(t);
    }

    const nonEmpty = groups.filter((g) => g.tasks.length > 0);

    if (nonEmpty.length === 0) {
        return (
            <div className="flex items-center justify-center rounded-xl border border-dashed border-[var(--crm-border)] bg-[var(--crm-elevated)] py-16">
                <p className="text-sm text-[var(--crm-text-muted)]">No upcoming tasks.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {nonEmpty.map((group) => (
                <div key={group.label} className="rounded-xl border border-[var(--crm-border)] bg-[var(--crm-elevated)] p-4">
                    <div className="mb-3 flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--crm-muted)]">{group.label}</span>
                        <span className="text-[10px] text-[var(--crm-text-muted)]">({group.tasks.length})</span>
                    </div>
                    <div className="space-y-1">
                        {group.tasks.map((task, idx) => (
                            <div key={task.id} className="relative flex gap-3 pl-5">
                                {idx < group.tasks.length - 1 ? (
                                    <div className="absolute left-[7px] top-3 bottom-0 w-px bg-[var(--crm-border)]" />
                                ) : null}
                                <div className="absolute left-0 top-[6px]">
                                    <span className={`block size-3 rounded-full border-2 border-[var(--crm-elevated)] ${STATUS_DOT_COLORS[task.status]}`} />
                                </div>
                                <button type="button" onClick={() => onTaskClick(task)}
                                    className="flex w-full items-center gap-3 rounded-lg border border-transparent px-3 py-2 text-left transition hover:border-[var(--crm-border)] hover:bg-[var(--crm-surface)]">
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold text-[var(--crm-text)]">{task.title}</p>
                                        <p className="truncate text-[10px] text-[var(--crm-text-muted)]">{task.taskNumber}{task.dossier?.object ? ` \u00B7 ${task.dossier.object}` : ''}</p>
                                    </div>
                                    <span className={`inline-flex items-center rounded-full border px-1.5 py-0.5 text-[9px] font-semibold ${PRIORITY_COLORS[task.priority]}`}>{PRIORITY_LABELS[task.priority]}</span>
                                    {task.dueDate ? <span className="whitespace-nowrap text-[10px] text-[var(--crm-text-muted)]">{task.dueDate}</span> : null}
                                    {Array.isArray(task.assignees) && task.assignees.length > 0 ? (
                                        <div className="flex -space-x-1">
                                            {task.assignees.slice(0, 2).map((a) => (
                                                <span key={a.id} className="flex size-5 items-center justify-center rounded-full border-2 border-[var(--crm-elevated)] bg-[var(--crm-gold)] text-[7px] font-bold text-black" title={a.name}>
                                                    {a.name.charAt(0)}
                                                </span>
                                            ))}
                                        </div>
                                    ) : null}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
