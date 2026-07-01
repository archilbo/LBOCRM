import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import type { TaskRow, TaskStatus } from '@/features/tasks/types';
import { COLUMNS, IMPACT_COLORS, IMPACT_LABELS, PRIORITY_COLORS, PRIORITY_LABELS, STATUS_COLORS, STATUS_DOT_COLORS, STATUS_LABELS, TYPE_LABELS } from '@/features/tasks/types';

type Props = {
    tasks: TaskRow[];
    onTaskClick: (task: TaskRow) => void;
    onStatusChange: (task: TaskRow, status: string) => void;
};

export function TaskTable({ tasks, onTaskClick, onStatusChange }: Props) {
    if (tasks.length === 0) {
        return (
            <div className="flex items-center justify-center rounded-xl border border-dashed border-[var(--crm-border)] bg-[var(--crm-elevated)] py-16">
                <p className="text-sm text-[var(--crm-text-muted)]">No tasks match the current filters.</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto rounded-xl border border-[var(--crm-border)]">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-[var(--crm-border)] bg-[var(--crm-surface)]">
                        <th className="sticky top-0 z-10 whitespace-nowrap px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--crm-muted)]">Task</th>
                        <th className="sticky top-0 z-10 hidden whitespace-nowrap px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--crm-muted)] md:table-cell">Assigned</th>
                        <th className="sticky top-0 z-10 hidden whitespace-nowrap px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--crm-muted)] lg:table-cell">Project</th>
                        <th className="sticky top-0 z-10 hidden whitespace-nowrap px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--crm-muted)] xl:table-cell">Category</th>
                        <th className="sticky top-0 z-10 whitespace-nowrap px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--crm-muted)]">Priority</th>
                        <th className="sticky top-0 z-10 hidden whitespace-nowrap px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--crm-muted)] lg:table-cell">Progress</th>
                        <th className="sticky top-0 z-10 whitespace-nowrap px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--crm-muted)]">Status</th>
                        <th className="sticky top-0 z-10 whitespace-nowrap px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--crm-muted)]">Due date</th>
                        <th className="sticky top-0 z-10 whitespace-nowrap px-4 py-3 text-right text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--crm-muted)]">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-[var(--crm-border)]">
                    {tasks.map((task) => (
                        <tr key={task.id} onClick={() => onTaskClick(task)} className="cursor-pointer bg-[var(--crm-elevated)] transition hover:bg-[var(--crm-surface)]">
                            <td className="px-4 py-3">
                                <p className="max-w-[220px] truncate text-sm font-semibold text-[var(--crm-text)]">{task.title}</p>
                                <p className="text-[10px] text-[var(--crm-text-muted)]">{task.taskNumber}</p>
                            </td>
                            <td className="hidden px-4 py-3 md:table-cell">
                                {Array.isArray(task.assignees) && task.assignees.length > 0 ? (
                                    <div className="flex -space-x-1">
                                        {task.assignees.slice(0, 3).map((a) => (
                                            <span key={a.id} className="flex size-6 items-center justify-center rounded-full border-2 border-[var(--crm-elevated)] bg-[var(--crm-gold)] text-[8px] font-bold text-black" title={a.name}>
                                                {a.name.charAt(0)}
                                            </span>
                                        ))}
                                    </div>
                                ) : <span className="text-xs text-[var(--crm-text-muted)]">-</span>}
                            </td>
                            <td className="hidden px-4 py-3 lg:table-cell">
                                <span className="text-xs text-[var(--crm-text-muted)]">{task.dossier?.object || task.client?.name || '-'}</span>
                            </td>
                            <td className="hidden px-4 py-3 xl:table-cell">
                                <span className="text-[10px] text-[var(--crm-text-muted)]">{TYPE_LABELS[task.type]}</span>
                            </td>
                            <td className="px-4 py-3">
                                <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${PRIORITY_COLORS[task.priority]}`}>{PRIORITY_LABELS[task.priority]}</span>
                            </td>
                            <td className="hidden px-4 py-3 lg:table-cell">
                                <div className="flex items-center gap-2">
                                    <div className="h-1.5 w-16 rounded-full bg-[var(--crm-surface-3)]">
                                        <div className="h-full rounded-full bg-[var(--crm-gold)]" style={{ width: `${task.progress}%` }} />
                                    </div>
                                    <span className="text-[10px] text-[var(--crm-text-muted)]">{task.progress}%</span>
                                </div>
                            </td>
                            <td className="px-4 py-3">
                                <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${STATUS_COLORS[task.status]}`}>
                                    <span className={`size-1.5 rounded-full ${STATUS_DOT_COLORS[task.status]}`} />
                                    {STATUS_LABELS[task.status]}
                                </span>
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 text-xs text-[var(--crm-text-muted)]">{task.dueDate || '-'}</td>
                            <td className="px-4 py-3 text-right">
                                <StatusMenu task={task} onStatusChange={onStatusChange} />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function StatusMenu({ task, onStatusChange }: { task: TaskRow; onStatusChange: (task: TaskRow, status: string) => void }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="relative inline-flex" onClick={(e) => e.stopPropagation()}>
            <button type="button" onClick={() => setOpen(!open)}
                className="flex h-7 items-center gap-1 rounded-lg border border-[var(--crm-border)] px-2 text-[10px] font-semibold text-[var(--crm-text-muted)] transition hover:border-[var(--crm-gold)] hover:text-[var(--crm-text)]">
                <ChevronDown size={11} /> Move
            </button>
            {open ? (
                <div className="absolute right-0 top-8 z-50 w-40 overflow-hidden rounded-xl border border-[var(--crm-border)] bg-[var(--crm-elevated)] p-1 shadow-2xl shadow-black/40">
                    {COLUMNS.filter((s) => s !== task.status).map((status) => (
                        <button key={status} type="button" onClick={() => { setOpen(false); onStatusChange(task, status); }}
                            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-semibold text-[var(--crm-text)] transition hover:bg-[var(--crm-surface)]">
                            <span className={`size-2 rounded-full ${STATUS_DOT_COLORS[status]}`} />
                            {STATUS_LABELS[status as TaskStatus]}
                        </button>
                    ))}
                </div>
            ) : null}
        </div>
    );
}
