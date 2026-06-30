import type { TaskRow } from '@/features/tasks/types';
import { COLUMNS, PRIORITY_COLORS, PRIORITY_LABELS, STATUS_COLORS, STATUS_LABELS } from '@/features/tasks/types';

type Props = {
    tasks: TaskRow[];
    columns: Record<string, TaskRow[]>;
    onTaskClick: (task: TaskRow) => void;
    onStatusChange: (task: TaskRow, status: string) => void;
};

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
                <table className="crm-table">
                    <thead>
                        <tr>
                            <th>Task</th>
                            <th>Assigned to</th>
                            <th>Project</th>
                            <th>Priority</th>
                            <th>Status</th>
                            <th>Due date</th>
                            <th>Updated</th>
                            <th className="text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tasks.map((task) => (
                            <tr key={task.id} onClick={() => onTaskClick(task)} className="cursor-pointer">
                                <td>
                                    <p className="max-w-[260px] truncate font-semibold text-[var(--crm-text)]">{task.title}</p>
                                    <p className="text-xs text-[var(--crm-text-muted)]">{task.taskNumber}</p>
                                </td>
                                <td>
                                    {Array.isArray(task.assignees) && task.assignees.length > 0 ? (
                                        <div className="flex -space-x-1">
                                            {task.assignees.slice(0, 3).map((a) => (
                                                <span key={a.id} className="flex size-7 items-center justify-center rounded-full border-2 border-[var(--crm-surface)] bg-[var(--crm-gold)] text-[9px] font-bold text-black" title={a.name}>
                                                    {a.name.charAt(0).toUpperCase()}
                                                </span>
                                            ))}
                                        </div>
                                    ) : <span className="text-xs text-[var(--crm-text-muted)]">-</span>}
                                </td>
                                <td><span className="text-xs text-[var(--crm-text-muted)]">{task.dossier?.object || '-'}</span></td>
                                <td><span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${PRIORITY_COLORS[task.priority]}`}>{PRIORITY_LABELS[task.priority]}</span></td>
                                <td><span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${STATUS_COLORS[task.status]}`}>{STATUS_LABELS[task.status]}</span></td>
                                <td className="text-xs text-[var(--crm-text-muted)]">{task.dueDate || '-'}</td>
                                <td className="text-xs text-[var(--crm-text-muted)]">{task.updatedAt || '-'}</td>
                                <td>
                                    <div className="flex justify-end gap-1">
                                        <select value={task.status} onChange={(e) => onStatusChange(task, e.target.value)} onClick={(e) => e.stopPropagation()}
                                            className="h-8 rounded-lg border border-[var(--crm-border)] bg-[var(--crm-elevated)] px-2 text-xs font-semibold text-[var(--crm-text)] outline-none">
                                            {COLUMNS.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                                        </select>
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
