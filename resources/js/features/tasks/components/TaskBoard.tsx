import { Plus } from 'lucide-react';
import type { TaskRow } from '@/features/tasks/types';
import { BOARD_COLUMNS, STATUS_COLORS, STATUS_DOT_COLORS, STATUS_LABELS } from '@/features/tasks/types';
import { TaskCard } from '@/features/tasks/components/TaskCard';

type Props = {
    columns: Record<string, TaskRow[]>;
    onTaskClick: (task: TaskRow) => void;
    onCreateInStatus?: (status: string) => void;
};

export function TaskBoard({ columns, onTaskClick, onCreateInStatus }: Props) {
    return (
        <section className="overflow-x-auto pb-2">
            <div className="flex gap-4" style={{ minWidth: BOARD_COLUMNS.length * 280 }}>
                {BOARD_COLUMNS.map((status) => {
                    const tasks = columns[status] || [];
                    return (
                        <div key={status} className="flex w-[280px] shrink-0 flex-col">
                            <div className="sticky top-0 z-10 mb-2 flex items-center justify-between rounded-xl border border-[var(--crm-border)] bg-[var(--crm-elevated)] px-3 py-2.5 shadow-sm">
                                <div className="flex items-center gap-2">
                                    <span className={`size-2.5 rounded-full ${STATUS_DOT_COLORS[status]}`} />
                                    <span className="text-xs font-semibold text-[var(--crm-text)]">{STATUS_LABELS[status]}</span>
                                    <span className="flex h-5 min-w-[20px] items-center justify-center rounded-md bg-[var(--crm-surface-3)] px-1.5 text-[10px] font-bold text-[var(--crm-text-muted)]">{tasks.length}</span>
                                </div>
                                {onCreateInStatus ? (
                                    <button type="button" onClick={() => onCreateInStatus(status)}
                                        className="flex size-6 items-center justify-center rounded-md text-[var(--crm-text-muted)] transition hover:bg-[var(--crm-surface)] hover:text-[var(--crm-gold)]">
                                        <Plus size={14} />
                                    </button>
                                ) : null}
                            </div>
                            <div className="flex flex-col gap-2 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 280px)' }}>
                                {tasks.map((task) => (
                                    <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} />
                                ))}
                                {tasks.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--crm-border)] bg-[var(--crm-surface)]/30 px-4 py-8 text-center">
                                        <span className="text-[11px] text-[var(--crm-text-muted)]">No tasks</span>
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
