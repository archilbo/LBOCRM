import { CalendarDays, CheckCircle2 } from 'lucide-react';
import { AppDrawer } from '@/components/ui/AppDrawer';
import { AppButton } from '@/components/ui/AppButton';
import { router } from '@inertiajs/react';
import type { TaskRow } from '@/features/tasks/types';
import {
    CATEGORY_COLORS, CATEGORY_LABELS, PRIORITY_COLORS, PRIORITY_LABELS,
    STATUS_COLORS, STATUS_LABELS,
} from '@/features/tasks/types';

type Props = {
    task: TaskRow | null;
    onClose: () => void;
    onComplete: (task: TaskRow) => void;
    onChecklistToggle: (taskId: number, itemId: number) => void;
};

export function TaskDetailDrawer({ task, onClose, onComplete, onChecklistToggle }: Props) {
    return (
        <AppDrawer isOpen={!!task} onOpenChange={(o) => { if (!o) onClose(); }}
            title={task?.title || 'Task details'} description={task?.taskNumber || ''}
            footer={<>
                <AppButton variant="secondary" onPress={onClose}>Close</AppButton>
                {task && task.status !== 'completed' ? (
                    <AppButton variant="primary" onPress={() => { if (task) onComplete(task); }}>
                        <CheckCircle2 size={14} /> Mark complete
                    </AppButton>
                ) : null}
            </>}>
            {task ? (
                <div className="space-y-5">
                    <div className="flex flex-wrap gap-2">
                        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${STATUS_COLORS[task.status]}`}>{STATUS_LABELS[task.status]}</span>
                        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${PRIORITY_COLORS[task.priority]}`}>{PRIORITY_LABELS[task.priority]}</span>
                        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${CATEGORY_COLORS[task.category]}`}>{CATEGORY_LABELS[task.category]}</span>
                    </div>

                    {task.dossier ? (
                        <div className="rounded-xl border border-[var(--crm-border)] bg-[var(--crm-elevated)] p-3">
                            <p className="text-xs text-[var(--crm-text-muted)]">Linked dossier</p>
                            <p className="mt-1 text-sm font-semibold">{task.dossier.object}</p>
                            <p className="text-xs text-[var(--crm-text-muted)]">{task.dossier.number}</p>
                        </div>
                    ) : null}

                    {task.description ? (
                        <div>
                            <p className="mb-1 text-xs font-semibold text-[var(--crm-text-muted)]">Description</p>
                            <p className="text-sm text-[var(--crm-text)]">{task.description}</p>
                        </div>
                    ) : null}

                    {Array.isArray(task.checklistItems) && task.checklistItems.length > 0 ? (
                        <div>
                            <p className="mb-2 text-xs font-semibold text-[var(--crm-text-muted)]">Checklist ({task.checklistItems.filter((i) => i.isDone).length}/{task.checklistItems.length})</p>
                            <div className="space-y-1">
                                {task.checklistItems.map((item) => (
                                    <label key={item.id} className="flex items-center gap-2 rounded-lg border border-[var(--crm-border)] px-3 py-2 text-sm">
                                        <input type="checkbox" checked={item.isDone} onChange={() => {
                                            onChecklistToggle(task.id, item.id);
                                        }} className="accent-[var(--crm-gold)]" />
                                        <span className={item.isDone ? 'line-through text-[var(--crm-text-muted)]' : ''}>{item.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ) : null}

                    <div>
                        <p className="mb-2 text-xs font-semibold text-[var(--crm-text-muted)]">Assignees</p>
                        <div className="flex flex-wrap gap-2">
                            {Array.isArray(task.assignees) ? task.assignees.map((a) => (
                                <span key={a.id} className="inline-flex items-center gap-1.5 rounded-full border border-[var(--crm-border)] bg-[var(--crm-elevated)] px-2.5 py-1 text-xs font-semibold">
                                    <span className="flex size-5 items-center justify-center rounded-full bg-[var(--crm-gold)] text-[8px] font-bold text-black">{a.name.charAt(0)}</span>
                                    {a.name}
                                </span>
                            )) : null}
                        </div>
                    </div>

                    {task.dueDate ? (
                        <div className="flex items-center gap-2 text-sm">
                            <CalendarDays size={14} className="text-[var(--crm-muted)]" />
                            <span className={task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed' ? 'text-red-400 font-semibold' : ''}>
                                Due: {task.dueDate}
                            </span>
                        </div>
                    ) : null}

                    {task.progress > 0 ? (
                        <div>
                            <p className="mb-1 text-xs text-[var(--crm-text-muted)]">Progress: {task.progress}%</p>
                            <div className="h-2 rounded-full bg-[var(--crm-surface-3)]">
                                <div className="h-full rounded-full bg-[var(--crm-gold)]" style={{ width: `${task.progress}%` }} />
                            </div>
                        </div>
                    ) : null}
                </div>
            ) : null}
        </AppDrawer>
    );
}
