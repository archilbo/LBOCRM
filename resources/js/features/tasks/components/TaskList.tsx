import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import type { TaskRow } from '@/features/tasks/types';
import { COLUMNS, IMPACT_COLORS, IMPACT_LABELS, PRIORITY_COLORS, PRIORITY_LABELS, STATUS_COLORS, STATUS_LABELS, TYPE_LABELS, type TaskStatus } from '@/features/tasks/types';

type Props = {
    tasks: TaskRow[];
    columns: Record<string, TaskRow[]>;
    onTaskClick: (task: TaskRow) => void;
    onStatusChange: (task: TaskRow, status: string) => void;
};

function StatusMenu({
    task,
    onStatusChange,
}: {
    task: TaskRow;
    onStatusChange: (task: TaskRow, status: string) => void;
}) {
    const [open, setOpen] = useState(false);

    return (
        <div className="relative inline-flex" onClick={(event) => event.stopPropagation()}>
            <button
                type="button"
                onClick={() => setOpen((current) => !current)}
                className={[
                    'inline-flex h-8 min-w-[128px] items-center justify-between gap-2 rounded-lg border px-3 text-xs font-bold transition',
                    'border-[var(--crm-border)] bg-[var(--crm-elevated)] text-[var(--crm-text)]',
                    'hover:border-[var(--crm-gold)] hover:bg-[var(--crm-surface)]',
                ].join(' ')}
            >
                <span className="truncate">{STATUS_LABELS[task.status]}</span>
                <ChevronDown size={13} className={open ? 'rotate-180 transition' : 'transition'} />
            </button>

            {open ? (
                <div className="absolute right-0 top-9 z-50 w-44 overflow-hidden rounded-xl border border-[var(--crm-border)] bg-[var(--crm-elevated)] p-1 shadow-2xl shadow-black/40">
                    {COLUMNS.map((status) => (
                        <button
                            key={status}
                            type="button"
                            onClick={() => {
                                setOpen(false);
                                if (status !== task.status) {
                                    onStatusChange(task, status);
                                }
                            }}
                            className={[
                                'flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-semibold transition',
                                status === task.status
                                    ? 'bg-[var(--crm-gold)] text-black'
                                    : 'text-[var(--crm-text)] hover:bg-[var(--crm-surface)]',
                            ].join(' ')}
                        >
                            <span>{STATUS_LABELS[status as TaskStatus]}</span>
                            <span className={`size-2 rounded-full border ${STATUS_COLORS[status]}`} />
                        </button>
                    ))}
                </div>
            ) : null}
        </div>
    );
}

export function TaskList({ tasks, columns, onTaskClick, onStatusChange }: Props) {
    if (tasks.length === 0) {
        return (
            <section className="crm-panel overflow-hidden">
                <div className="px-4 py-12 text-center text-sm text-[var(--crm-text-muted)]">No tasks match the current filters.</div>
            </section>
        );
    }

    return (
        <section className="crm-panel overflow-hidden">
            <div className="overflow-x-auto">
                <table className="crm-table w-full">
                    <thead>
                        <tr>
                            <th className="whitespace-nowrap">Task</th>
                            <th className="whitespace-nowrap hidden md:table-cell">Assigned to</th>
                            <th className="whitespace-nowrap hidden lg:table-cell">Project</th>
                            <th className="whitespace-nowrap hidden xl:table-cell">Type</th>
                            <th className="whitespace-nowrap">Priority</th>
                            <th className="whitespace-nowrap hidden lg:table-cell">Status</th>
                            <th className="whitespace-nowrap">Due date</th>
                            <th className="whitespace-nowrap text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tasks.map((task) => (
                            <tr key={task.id} onClick={() => onTaskClick(task)} className="cursor-pointer">
                                <td>
                                    <p className="max-w-[200px] truncate font-semibold text-[var(--crm-text)]">{task.title}</p>
                                    <p className="text-[10px] text-[var(--crm-text-muted)]">{task.taskNumber}</p>
                                </td>
                                <td className="hidden md:table-cell">
                                    {Array.isArray(task.assignees) && task.assignees.length > 0 ? (
                                        <div className="flex -space-x-1">
                                            {task.assignees.slice(0, 3).map((a) => (
                                                <span key={a.id} className="flex size-6 items-center justify-center rounded-full border-2 border-[var(--crm-surface)] bg-[var(--crm-gold)] text-[8px] font-bold text-black" title={a.name}>
                                                    {a.name.charAt(0).toUpperCase()}
                                                </span>
                                            ))}
                                        </div>
                                    ) : <span className="text-xs text-[var(--crm-text-muted)]">-</span>}
                                </td>
                                <td className="hidden lg:table-cell"><span className="text-xs text-[var(--crm-text-muted)]">{task.dossier?.object || task.client?.name || '-'}</span></td>
                                <td className="hidden xl:table-cell"><span className="text-xs text-[var(--crm-text-muted)]">{TYPE_LABELS[task.type] || task.type}</span></td>
                                <td><span className={`inline-flex items-center rounded-full border px-1.5 py-0.5 text-[9px] font-semibold ${PRIORITY_COLORS[task.priority]}`}>{PRIORITY_LABELS[task.priority]}</span></td>
                                <td className="hidden lg:table-cell"><span className={`inline-flex items-center rounded-full border px-1.5 py-0.5 text-[9px] font-semibold ${STATUS_COLORS[task.status]}`}>{STATUS_LABELS[task.status]}</span></td>
                                <td className="whitespace-nowrap text-xs text-[var(--crm-text-muted)]">{task.dueDate || '-'}</td>
                                <td>
                                    <div className="flex justify-end gap-1">
                                        <StatusMenu task={task} onStatusChange={onStatusChange} />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
