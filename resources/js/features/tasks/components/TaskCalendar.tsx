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

export function TaskCalendar({ tasks, onTaskClick }: Props) {
    const { t } = useTranslation();
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const weekEnd = new Date(now); weekEnd.setDate(now.getDate() + (7 - now.getDay()));
    const weekEndStr = weekEnd.toISOString().slice(0, 10);

    const groups: { id: string; label: string; tasks: TaskRow[]; accent: string }[] = [
        { id: 'overdue', label: t('tasks.periods.overdue'), tasks: [], accent: 'text-red-400' },
        { id: 'today', label: t('tasks.periods.today'), tasks: [], accent: 'text-[var(--accent)]' },
        { id: 'thisWeek', label: t('tasks.periods.thisWeek'), tasks: [], accent: 'text-blue-400' },
        { id: 'upcoming', label: t('tasks.periods.upcoming'), tasks: [], accent: 'text-emerald-400' },
        { id: 'noDate', label: t('tasks.periods.noDate'), tasks: [], accent: 'text-zinc-400' },
    ];

    for (const t of tasks) {
        if (!t.dueDate) { groups[4].tasks.push(t); continue; }
        if (t.dueDate < today && t.status !== 'completed' && t.status !== 'cancelled') { groups[0].tasks.push(t); continue; }
        if (t.dueDate === today) { groups[1].tasks.push(t); continue; }
        if (t.dueDate <= weekEndStr) { groups[2].tasks.push(t); continue; }
        groups[3].tasks.push(t);
    }

    const nonEmpty = groups.filter((g) => g.tasks.length > 0);

    if (nonEmpty.length === 0) {
        return (
            <div className="flex items-center justify-center rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface)] py-16">
                <p className="text-sm text-[var(--text-muted)]">{t('tasks.empty.calendar')}</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {nonEmpty.map((group) => (
                <Card key={group.id} className="gap-0 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-sm">
                    <div className="mb-2 flex items-center gap-2">
                        <span className={`text-xs font-bold uppercase tracking-[0.1em] ${group.accent}`}>{group.label}</span>
                        <span className="text-[9px] text-[var(--text-muted)]">({group.tasks.length})</span>
                    </div>
                    <div className="space-y-1">
                        {group.tasks.map((task) => (
                            <Button key={task.id} variant="ghost" onPress={() => onTaskClick(task)}
                                className="flex h-auto min-h-0 w-full items-center gap-2 justify-start rounded-lg border border-transparent px-2.5 py-2 text-left transition hover:border-[var(--border)] hover:bg-[var(--surface-2)]">
                                <span className={`size-2 shrink-0 rounded-full ${STATUS_DOT_COLORS[task.status]}`} />
                                <span className="min-w-0 flex-1 truncate text-xs font-semibold text-[var(--text)]">{task.title}</span>
                                <Chip size="sm" className={cn('h-5 rounded-full border px-2 text-[9px] font-semibold', PRIORITY_COLORS[task.priority])}>{t(`tasks.priorities.${task.priority}`)}</Chip>
                                {task.dueDate ? <span className={`whitespace-nowrap text-[9px] ${group.id === 'overdue' ? 'font-semibold text-red-400' : 'text-[var(--text-muted)]'}`}>{task.dueDate}</span> : null}
                                {Array.isArray(task.assignees) && task.assignees.length > 0 ? (
                                    <AvatarPill name={task.assignees[0].name} size="sm" className="size-4 min-w-4 text-[7px]" />
                                ) : null}
                            </Button>
                        ))}
                    </div>
                </Card>
            ))}
        </div>
    );
}
