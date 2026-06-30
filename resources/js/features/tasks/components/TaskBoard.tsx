import type { TaskRow } from '@/features/tasks/types';
import { COLUMNS, STATUS_COLORS, STATUS_LABELS } from '@/features/tasks/types';
import { TaskCard } from '@/features/tasks/components/TaskCard';

type Props = {
    columns: Record<string, TaskRow[]>;
    onTaskClick: (task: TaskRow) => void;
};

export function TaskBoard({ columns, onTaskClick }: Props) {
    return (
        <section className="grid min-w-0 flex-1 grid-cols-5 gap-3 overflow-x-auto">
            {COLUMNS.map((status) => (
                <div key={status} className="crm-panel min-w-0 overflow-hidden">
                    <div className="flex items-center justify-between border-b border-[var(--crm-border)] px-3 py-2.5">
                        <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${STATUS_COLORS[status]}`}>
                                {STATUS_LABELS[status]}
                            </span>
                            <span className="text-xs text-[var(--crm-text-muted)]">{columns[status]?.length || 0}</span>
                        </div>
                    </div>
                    <div className="space-y-2 overflow-y-auto p-2" style={{ maxHeight: 'calc(100vh - 340px)' }}>
                        {(columns[status] || []).map((task) => (
                            <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} />
                        ))}
                        {(columns[status] || []).length === 0 ? (
                            <p className="py-8 text-center text-xs text-[var(--crm-text-muted)]">No tasks</p>
                        ) : null}
                    </div>
                </div>
            ))}
        </section>
    );
}
