import { IconAlertTriangle, IconCalendarMonth, IconCircleCheck, IconSquareCheck, IconLink, IconMessage2, IconDots, IconPaperclip } from '@tabler/icons-react';

import { useState } from 'react';
import type { TaskRow, TaskStatus } from '@/features/tasks/types';
import {
    CATEGORY_COLORS, CATEGORY_LABELS, COLUMNS, IMPACT_COLORS, IMPACT_LABELS, PRIORITY_COLORS, PRIORITY_LABELS, STATUS_COLORS, STATUS_DOT_COLORS, STATUS_LABELS, TYPE_LABELS,
} from '@/features/tasks/types';
import { router } from '@inertiajs/react';

export function TaskCard({ task, onClick }: { task: TaskRow; onClick: () => void }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const isCompleted = task.status === 'completed';
    const isCancelled = task.status === 'cancelled';
    const isSoft = isCompleted || isCancelled;
    const overdue = task.dueDate && new Date(task.dueDate) < new Date() && !isCompleted && !isCancelled;
    const categoryClass = CATEGORY_COLORS[task.category] || CATEGORY_COLORS.general_admin;
    const checklistItems = Array.isArray(task.checklistItems) ? task.checklistItems : [];
    const checklistTotal = checklistItems.length;
    const checklistDone = checklistItems.filter((item) => item.isDone).length;
    const linkedRecord = task.dossier?.object || task.client?.name || null;

    return (
        <div className={`group relative rounded-xl border ${isSoft ? 'border-[var(--crm-border)] bg-[var(--crm-surface)]/50 opacity-60' : 'border-[var(--crm-border)] bg-[var(--crm-surface)] hover:border-[var(--crm-gold)]/40 hover:bg-[var(--crm-elevated)]'} transition-all`}>
            <button type="button" onClick={onClick} className="w-full p-3 text-left">
                <div className="mb-2 flex items-start justify-between gap-2">
                    <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                        <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-semibold ${STATUS_COLORS[task.status]}`}>
                            <span className={`size-1.5 rounded-full ${STATUS_DOT_COLORS[task.status]}`} />
                            {STATUS_LABELS[task.status]}
                        </span>
                        <span className={`inline-flex items-center rounded-full border px-1.5 py-0.5 text-[9px] font-semibold ${PRIORITY_COLORS[task.priority] || ''}`}>
                            {PRIORITY_LABELS[task.priority] || task.priority}
                        </span>
                    </div>
                    <div className="relative shrink-0">
                        <button type="button" onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
                            className="flex size-6 items-center justify-center rounded-md text-[var(--crm-text-muted)] opacity-0 transition group-hover:opacity-100 hover:bg-[var(--crm-surface-3)]">
                            <IconDots size={14} />
                        </button>
                        {menuOpen ? (
                            <div className="absolute right-0 top-7 z-50 w-44 overflow-hidden rounded-xl border border-[var(--crm-border)] bg-[var(--surface)] p-1 shadow-2xl shadow-black/40"
                                onMouseLeave={() => setMenuOpen(false)}>
                                {COLUMNS.filter((s) => s !== task.status).map((status) => (
                                    <button key={status} type="button"
                                        onClick={(e) => { e.stopPropagation(); setMenuOpen(false); router.put(`/tasks/${task.id}/status`, { status }, { preserveScroll: true, preserveState: true }); }}
                                        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-semibold text-[var(--crm-text)] transition hover:bg-[var(--crm-surface)]">
                                        <span className={`size-2 rounded-full ${STATUS_DOT_COLORS[status]}`} />
                                        {STATUS_LABELS[status as TaskStatus]}
                                    </button>
                                ))}
                            </div>
                        ) : null}
                    </div>
                </div>

                <p className={`line-clamp-2 text-[12px] font-semibold leading-5 ${isSoft ? 'text-[var(--crm-text-muted)]' : 'text-[var(--crm-text)]'}`}>{task.title}</p>

                {task.description ? (
                    <p className="mt-1 line-clamp-1 text-[10px] text-[var(--crm-text-muted)]">{task.description}</p>
                ) : null}

                {linkedRecord ? (
                    <div className="mt-1.5 inline-flex items-center gap-1 rounded bg-black/10 px-1.5 py-0.5 text-[9px] text-[var(--crm-muted)]">
                        <IconLink size={10} />
                        <span className="truncate max-w-[140px]">{linkedRecord}</span>
                    </div>
                ) : null}

                <div className="mt-2 flex items-center justify-between gap-2">
                    <div className="flex -space-x-1">
                        {Array.isArray(task.assignees) ? task.assignees.slice(0, 3).map((a) => (
                            <div key={a.id} className="flex size-5 items-center justify-center rounded-full border-2 border-[var(--crm-surface)] bg-[var(--crm-gold)] text-[7px] font-bold text-black" title={a.name}>
                                {a.name.charAt(0).toUpperCase()}
                            </div>
                        )) : null}
                        {Array.isArray(task.assignees) && task.assignees.length > 3 ? (
                            <div className="flex size-5 items-center justify-center rounded-full border-2 border-[var(--crm-surface)] bg-[var(--crm-surface-2)] text-[7px] text-[var(--crm-text-muted-dark)]">
                                +{task.assignees.length - 3}
                            </div>
                        ) : null}
                    </div>
                    <div className="flex items-center gap-2 text-[9px] text-[var(--crm-text-muted)]">
                        {task.dueDate ? (
                            <span className={`inline-flex items-center gap-1 ${overdue ? 'font-semibold text-red-400' : ''}`}>
                                <IconCalendarMonth size={11} />
                                {task.dueDate}
                            </span>
                        ) : null}
                        {checklistTotal > 0 ? <span className="inline-flex items-center gap-1"><IconSquareCheck size={11} />{checklistDone}/{checklistTotal}</span> : null}
                        {task.commentsCount > 0 ? <span className="inline-flex items-center gap-1"><IconMessage2 size={11} />{task.commentsCount}</span> : null}
                        {task.attachmentsCount > 0 ? <span className="inline-flex items-center gap-1"><IconPaperclip size={11} />{task.attachmentsCount}</span> : null}
                    </div>
                </div>

                {task.status === 'blocked' && task.blockedReason ? (
                    <div className="mt-2 flex gap-1.5 rounded-lg border border-red-400/15 bg-red-400/5 p-2 text-[9px] leading-4 text-red-200">
                        <IconAlertTriangle size={11} className="mt-0.5 shrink-0" />
                        <span className="line-clamp-1">{task.blockedReason}</span>
                    </div>
                ) : null}

                {isCompleted ? (
                    <div className="mt-2 flex items-center gap-1 text-[9px] font-semibold text-emerald-400">
                        <IconCircleCheck size={11} /> Completed
                    </div>
                ) : null}
            </button>

            {(checklistTotal > 0 || task.progress > 0) && !isCompleted ? (
                <div className="h-1 bg-[var(--crm-surface-3)]">
                    <div className={`h-full ${isCancelled ? 'bg-zinc-500' : 'bg-[var(--crm-gold)]'}`} style={{ width: `${task.progress}%`, transition: 'width 0.2s' }} />
                </div>
            ) : null}
        </div>
    );
}
