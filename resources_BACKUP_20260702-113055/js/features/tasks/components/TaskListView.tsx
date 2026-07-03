import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import type { TaskRow, TaskStatus } from '@/features/tasks/types';
import { COLUMNS, PRIORITY_COLORS, PRIORITY_LABELS, STATUS_COLORS, STATUS_DOT_COLORS, STATUS_LABELS } from '@/features/tasks/types';

type Props = {
    columns: Record<string, TaskRow[]>;
    onTaskClick: (task: TaskRow) => void;
    onStatusChange: (task: TaskRow, status: string) => void;
};

export function TaskListView({ columns, onTaskClick, onStatusChange }: Props) {
    const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

    const toggle = (status: string) => {
        setCollapsed((prev) => {
            const next = new Set(prev);
            if (next.has(status)) next.delete(status); else next.add(status);
            return next;
        });
    };

    return (
        <div className="space-y-3">
            {COLUMNS.map((status) => {
                const tasks = columns[status] || [];
                const isCollapsed = collapsed.has(status);
                return (
                    <div key={status} className="rounded-xl border border-[var(--crm-border)] bg-[var(--crm-elevated)] overflow-hidden">
                        <button type="button" onClick={() => toggle(status)} className="flex w-full items-center gap-2 px-4 py-3 text-left transition hover:bg-[var(--crm-surface)]">
                            {isCollapsed ? <ChevronRight size={14} className="text-[var(--crm-muted)]" /> : <ChevronDown size={14} className="text-[var(--crm-muted)]" />}
                            <span className={`size-2 rounded-full ${STATUS_DOT_COLORS[status]}`} />
                            <span className="text-sm font-semibold text-[var(--crm-text)]">{STATUS_LABELS[status]}</span>
                            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-md bg-[var(--crm-surface-3)] px-1.5 text-[10px] font-bold text-[var(--crm-text-muted)]">{tasks.length}</span>
                        </button>
                        {!isCollapsed ? (
                            tasks.length === 0 ? (
                                <div className="px-4 py-3 text-xs text-[var(--crm-text-muted)]">No tasks</div>
                            ) : (
                                <div className="divide-y divide-[var(--crm-border)] border-t border-[var(--crm-border)]">
                                    {tasks.map((task) => (
                                        <div key={task.id} className="flex items-center gap-3 px-4 py-2.5 transition hover:bg-[var(--crm-surface)]">
                                            <button type="button" onClick={() => onTaskClick(task)} className="flex flex-1 items-center gap-3 min-w-0 text-left">
                                                <span className={`size-2 shrink-0 rounded-full ${STATUS_DOT_COLORS[task.status]}`} />
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-semibold text-[var(--crm-text)]">{task.title}</p>
                                                    <p className="truncate text-[10px] text-[var(--crm-text-muted)]">{task.taskNumber}{task.dossier?.object ? ` \u00B7 ${task.dossier.object}` : ''}</p>
                                                </div>
                                            </button>
                                            <div className="flex shrink-0 items-center gap-3">
                                                {Array.isArray(task.assignees) && task.assignees.length > 0 ? (
                                                    <div className="flex -space-x-1">
                                                        {task.assignees.slice(0, 2).map((a) => (
                                                            <span key={a.id} className="flex size-6 items-center justify-center rounded-full border-2 border-[var(--crm-elevated)] bg-[var(--crm-gold)] text-[8px] font-bold text-black" title={a.name}>
                                                                {a.name.charAt(0)}
                                                            </span>
                                                        ))}
                                                    </div>
                                                ) : null}
                                                <span className={`inline-flex items-center rounded-full border px-1.5 py-0.5 text-[9px] font-semibold ${PRIORITY_COLORS[task.priority]}`}>{PRIORITY_LABELS[task.priority]}</span>
                                                <span className={`inline-flex items-center rounded-full border px-1.5 py-0.5 text-[9px] font-semibold ${STATUS_COLORS[task.status]}`}>{STATUS_LABELS[task.status]}</span>
                                                {task.dueDate ? <span className="whitespace-nowrap text-[10px] text-[var(--crm-text-muted)]">{task.dueDate}</span> : null}
                                                <QuickStatus task={task} onStatusChange={onStatusChange} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )
                        ) : null}
                    </div>
                );
            })}
        </div>
    );
}

function QuickStatus({ task, onStatusChange }: { task: TaskRow; onStatusChange: (task: TaskRow, status: string) => void }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="relative" onClick={(e) => e.stopPropagation()}>
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
