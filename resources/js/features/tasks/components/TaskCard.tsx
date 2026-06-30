import { CalendarDays, MessageSquare, Paperclip } from 'lucide-react';
import type { TaskRow } from '@/features/tasks/types';
import {
    CATEGORY_COLORS, CATEGORY_LABELS, PRIORITY_COLORS, PRIORITY_LABELS,
} from '@/features/tasks/types';

export function TaskCard({ task, onClick }: { task: TaskRow; onClick: () => void }) {
    const overdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed' && task.status !== 'cancelled';
    const categoryClass = CATEGORY_COLORS[task.category] || CATEGORY_COLORS.general_admin;

    return (
        <button type="button" onClick={onClick} className="w-full rounded-xl border border-[var(--crm-border)] bg-[var(--crm-surface)] p-3 text-left transition hover:border-[var(--crm-gold)] hover:shadow-sm">
            <div className="mb-2 flex items-start justify-between gap-2">
                <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${categoryClass}`}>
                    {CATEGORY_LABELS[task.category] || task.category}
                </span>
                <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${PRIORITY_COLORS[task.priority] || ''}`}>
                    {PRIORITY_LABELS[task.priority] || task.priority}
                </span>
            </div>

            <p className="line-clamp-2 text-sm font-semibold text-[var(--crm-text)]">{task.title}</p>

            <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-[var(--crm-text-muted)]">
                {task.dueDate ? (
                    <span className={`inline-flex items-center gap-1 ${overdue ? 'text-red-400' : ''}`}>
                        <CalendarDays size={12} />
                        {task.dueDate}
                    </span>
                ) : null}
                {task.dossier ? (
                    <span className="truncate max-w-[120px]">{task.dossier.object}</span>
                ) : null}
            </div>

            <div className="mt-2 flex items-center justify-between">
                <div className="flex -space-x-1.5">
                    {Array.isArray(task.assignees) ? task.assignees.slice(0, 3).map((a) => (
                        <div key={a.id} className="flex size-6 items-center justify-center rounded-full border-2 border-[var(--crm-surface)] bg-[var(--crm-gold)] text-[9px] font-bold text-black">
                            {a.name.charAt(0).toUpperCase()}
                        </div>
                    )) : null}
                    {Array.isArray(task.assignees) && task.assignees.length > 3 ? (
                        <div className="flex size-6 items-center justify-center rounded-full border-2 border-[var(--crm-surface)] bg-[var(--crm-surface-2)] text-[9px] text-[var(--crm-text-muted)]">
                            +{task.assignees.length - 3}
                        </div>
                    ) : null}
                </div>
                <div className="flex items-center gap-2 text-[11px] text-[var(--crm-text-muted)]">
                    {task.commentsCount > 0 ? <span className="inline-flex items-center gap-1"><MessageSquare size={12} />{task.commentsCount}</span> : null}
                    {task.attachmentsCount > 0 ? <span className="inline-flex items-center gap-1"><Paperclip size={12} />{task.attachmentsCount}</span> : null}
                </div>
            </div>

            {task.progress > 0 && task.status !== 'completed' ? (
                <div className="mt-2 h-1.5 rounded-full bg-[var(--crm-surface-3)]">
                    <div className="h-full rounded-full bg-[var(--crm-gold)]" style={{ width: `${task.progress}%` }} />
                </div>
            ) : null}
        </button>
    );
}
