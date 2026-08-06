import { AlertTriangle, CalendarDays, ListChecks, MessageCircle, Paperclip } from 'lucide-react';
import type { ReactNode } from 'react';
import { Avatar, Chip, ProgressBar, Tooltip } from '@heroui/react';

import { cn } from '@/lib/cn';
import { useTranslation, type AppLocale } from '@/lib/i18n';
import type { TaskPriority, TaskRow } from '@/features/tasks/types';

const PRIORITY_CHIP: Record<TaskPriority, string> = {
    low: 'bg-zinc-500/15 text-zinc-300 border-zinc-500/25',
    medium: 'bg-amber-500/15 text-amber-300 border-amber-500/25',
    high: 'bg-orange-500/15 text-orange-300 border-orange-500/25',
    urgent: 'bg-red-500/15 text-red-300 border-red-500/25',
};

const DUE_TONE: Record<'overdue' | 'today' | 'soon' | 'future', string> = {
    overdue: 'font-semibold text-red-400',
    today: 'font-semibold text-amber-400',
    soon: 'text-amber-400/80',
    future: 'text-[var(--text-muted)]',
};

const dateFormatters = new Map<AppLocale, Intl.DateTimeFormat>();

function dateFormatter(locale: AppLocale): Intl.DateTimeFormat {
    let formatter = dateFormatters.get(locale);

    if (!formatter) {
        formatter = new Intl.DateTimeFormat(locale === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'short' });
        dateFormatters.set(locale, formatter);
    }

    return formatter;
}

function todayString(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function initials(name: string): string {
    const value = name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '').join('');

    return value || '?';
}

type DueInfo = { tone: 'overdue' | 'today' | 'soon' | 'future'; label: string } | null;

function dueInfo(task: TaskRow, today: string, locale: AppLocale): DueInfo {
    const date = task.dueDate;

    if (!date || task.status === 'completed' || task.status === 'cancelled') {
        return null;
    }

    const label = dateFormatter(locale).format(new Date(`${date}T00:00:00`));

    if (date < today) {
        return { tone: 'overdue', label };
    }

    if (date === today) {
        return { tone: 'today', label };
    }

    const soonLimit = new Date();
    soonLimit.setDate(soonLimit.getDate() + 3);
    const limit = `${soonLimit.getFullYear()}-${String(soonLimit.getMonth() + 1).padStart(2, '0')}-${String(soonLimit.getDate()).padStart(2, '0')}`;

    if (date <= limit) {
        return { tone: 'soon', label };
    }

    return { tone: 'future', label };
}

type CountItem = { key: string; icon: ReactNode; text: string; label: string };

export function TaskCardMetadata({ task }: { task: TaskRow }) {
    const { locale, t } = useTranslation();
    const isCompleted = task.status === 'completed';
    const isCancelled = task.status === 'cancelled';
    const checklistItems = Array.isArray(task.checklistItems) ? task.checklistItems : [];
    const checklistTotal = checklistItems.length;
    const checklistDone = checklistItems.filter((item) => item.isDone).length;
    const assignees = Array.isArray(task.assignees) ? task.assignees : [];
    const showProgress = (checklistTotal > 0 || task.progress > 0) && !isCompleted;
    const due = dueInfo(task, todayString(), locale);

    const counts: CountItem[] = [];
    if (task.commentsCount > 0) {
        counts.push({ key: 'comments', icon: <MessageCircle size={10} />, text: String(task.commentsCount), label: t('tasks.meta.comments') });
    }
    if (task.attachmentsCount > 0) {
        counts.push({ key: 'attachments', icon: <Paperclip size={10} />, text: String(task.attachmentsCount), label: t('tasks.meta.attachments') });
    }
    if (checklistTotal > 0) {
        counts.push({ key: 'checklist', icon: <ListChecks size={10} />, text: `${checklistDone}/${checklistTotal}`, label: t('tasks.meta.checklist') });
    }

    return (
        <>
            {showProgress ? (
                <div className="mt-2.5 flex items-center gap-2">
                    <ProgressBar value={task.progress} aria-label={`${task.progress}%`} className="min-w-0 flex-1">
                        <ProgressBar.Track className={cn('h-1 rounded-full', isCancelled ? 'bg-zinc-500' : 'bg-[var(--surface-3)]')}>
                            <ProgressBar.Fill className={cn('h-full rounded-full', isCancelled ? 'bg-zinc-500' : 'bg-[var(--accent)]')} />
                        </ProgressBar.Track>
                    </ProgressBar>
                    <span className="w-7 shrink-0 text-right text-[9px] font-semibold tabular-nums text-[var(--text-muted)]">{task.progress}%</span>
                </div>
            ) : null}

            <div className="mt-2.5 flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center -space-x-1.5">
                    {assignees.slice(0, 3).map((assignee) => (
                        <Tooltip key={assignee.id} delay={450}>
                            <Tooltip.Trigger>
                                <Avatar size="sm" className="size-5 min-w-5 ring-2 ring-[var(--surface)]">
                                    <Avatar.Fallback className="bg-[var(--accent)] text-[7px] font-bold text-black">{initials(assignee.name)}</Avatar.Fallback>
                                </Avatar>
                            </Tooltip.Trigger>
                            <Tooltip.Content className="border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] shadow-xl">
                                {assignee.name}
                            </Tooltip.Content>
                        </Tooltip>
                    ))}
                    {assignees.length > 3 ? (
                        <span className="flex size-5 items-center justify-center rounded-full bg-[var(--surface-2)] text-[7px] font-semibold text-[var(--text-muted)] ring-2 ring-[var(--surface)]">
                            +{assignees.length - 3}
                        </span>
                    ) : null}
                </div>

                <Chip size="sm" className={cn('h-5 shrink-0 rounded-full border px-2 text-[9px] font-semibold', PRIORITY_CHIP[task.priority])}>
                    {t(`tasks.priorities.${task.priority}`)}
                </Chip>
            </div>

            {due || counts.length > 0 ? (
                <div className="mt-1.5 flex items-center justify-between gap-2">
                    {due ? (
                        <span
                            className={cn('inline-flex min-w-0 items-center gap-1 text-[9px]', DUE_TONE[due.tone])}
                            aria-label={due.tone === 'future' ? due.label : `${t(`tasks.due.${due.tone}`)} — ${due.label}`}
                        >
                            <CalendarDays size={10} className="shrink-0" />
                            <span className="truncate">{due.label}</span>
                        </span>
                    ) : <span />}

                    {counts.length > 0 ? (
                        <span className="flex shrink-0 items-center gap-2.5 text-[9px] text-[var(--text-muted)]">
                            {counts.map((count) => (
                                <span key={count.key} className="inline-flex items-center gap-1" aria-label={count.label}>
                                    {count.icon}
                                    <span className="tabular-nums">{count.text}</span>
                                </span>
                            ))}
                        </span>
                    ) : null}
                </div>
            ) : null}

            {task.status === 'blocked' && task.blockedReason ? (
                <div className="mt-2 flex items-start gap-1.5 rounded-lg border border-red-400/20 bg-red-400/10 px-2 py-1.5 text-[9px] leading-4 text-red-200">
                    <AlertTriangle size={10} className="mt-0.5 shrink-0" />
                    <span className="line-clamp-1">{task.blockedReason}</span>
                </div>
            ) : null}
        </>
    );
}
