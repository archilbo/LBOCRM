import type { TaskRow } from '@/features/tasks/types';
import { PRIORITY_COLORS, STATUS_DOT_COLORS } from '@/features/tasks/types';
import { Button, Card, Chip } from '@heroui/react';
import { cn } from '@/lib/cn';
import { AvatarPill } from '@/components/ui/AvatarPill';
import { useTranslation } from '@/lib/i18n';

type Props = {
    tasks: TaskRow[];
    onTaskClick: (task: TaskRow) => void;
};

export function TaskTimeline({ tasks, onTaskClick }: Props) {
    const { t } = useTranslation();
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const tomorrow = new Date(now); tomorrow.setDate(now.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().slice(0, 10);
    const weekEnd = new Date(now); weekEnd.setDate(now.getDate() + 7);
    const weekEndStr = weekEnd.toISOString().slice(0, 10);

    const groups: { id: string; label: string; tasks: TaskRow[] }[] = [
        { id: 'today', label: t('tasks.periods.today'), tasks: [] },
        { id: 'tomorrow', label: t('tasks.periods.tomorrow'), tasks: [] },
        { id: 'thisWeek', label: t('tasks.periods.thisWeek'), tasks: [] },
        { id: 'later', label: t('tasks.periods.later'), tasks: [] },
        { id: 'noDate', label: t('tasks.periods.noDate'), tasks: [] },
    ];

    for (const task of tasks) {
        if (!task.dueDate) { groups[4].tasks.push(task); continue; }
        if (task.dueDate === today) { groups[0].tasks.push(task); continue; }
        if (task.dueDate === tomorrowStr) { groups[1].tasks.push(task); continue; }
        if (task.dueDate <= weekEndStr) { groups[2].tasks.push(task); continue; }
        groups[3].tasks.push(task);
    }

    const nonEmpty = groups.filter((g) => g.tasks.length > 0);

    if (nonEmpty.length === 0) {
        return (
            <div className="flex items-center justify-center rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface)] py-16">
                <p className="text-sm text-[var(--text-muted)]">{t('tasks.empty.timeline')}</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {nonEmpty.map((group) => (
                <Card key={group.id} className="gap-0 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
                    <div className="mb-3 flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--text-muted)]">{group.label}</span>
                        <span className="text-[9px] text-[var(--text-muted)]">({group.tasks.length})</span>
                    </div>
                    <div className="space-y-1">
                        {group.tasks.map((task, idx) => (
                            <div key={task.id} className="relative flex gap-3 pl-5">
                                {idx < group.tasks.length - 1 ? (
                                    <div className="absolute left-[7px] top-3 bottom-0 w-px bg-[var(--border)]" />
                                ) : null}
                                <div className="absolute left-0 top-[6px]">
                                    <span className={`block size-3 rounded-full border-2 border-[var(--surface)] ${STATUS_DOT_COLORS[task.status]}`} />
                                </div>
                                <Button variant="ghost" onPress={() => onTaskClick(task)}
                                    className="flex h-auto min-h-0 w-full items-center gap-3 justify-start rounded-lg border border-transparent px-3 py-2 text-left transition hover:border-[var(--border)] hover:bg-[var(--surface-2)]">
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold text-[var(--text)]">{task.title}</p>
                                        <p className="truncate text-[9px] text-[var(--text-muted)]">{task.taskNumber}{task.dossier?.object ? ` \u00B7 ${task.dossier.object}` : ''}</p>
                                    </div>
                                    <Chip size="sm" className={cn('h-5 rounded-full border px-2 text-[9px] font-semibold', PRIORITY_COLORS[task.priority])}>{t(`tasks.priorities.${task.priority}`)}</Chip>
                                    {task.dueDate ? <span className="whitespace-nowrap text-[9px] text-[var(--text-muted)]">{task.dueDate}</span> : null}
                                    {Array.isArray(task.assignees) && task.assignees.length > 0 ? (
                                        <div className="flex -space-x-1">
                                            {task.assignees.slice(0, 2).map((a) => (
                                                <AvatarPill key={a.id} name={a.name} size="sm" className="size-5 min-w-5 border-2 border-[var(--surface)] text-[7px]" />
                                            ))}
                                        </div>
                                    ) : null}
                                </Button>
                            </div>
                        ))}
                    </div>
                </Card>
            ))}
        </div>
    );
}
