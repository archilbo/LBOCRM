import { Flag, GripVertical, Link2 } from 'lucide-react';
import { Button, Card, Chip } from '@heroui/react';

import { cn } from '@/lib/cn';
import { useTranslation } from '@/lib/i18n';
import { TaskActionsMenu } from '@/features/tasks/components/TaskActionsMenu';
import { TaskCardMetadata } from '@/features/tasks/components/TaskCardMetadata';
import type { TaskPriority, TaskRow } from '@/features/tasks/types';

type Props = {
    task: TaskRow;
    toneIndex: number;
    onOpen: () => void;
    onStatusChange?: (task: TaskRow, status: string) => void;
};

const priorityClasses: Record<TaskPriority, { icon: string }> = {
    low: { icon: 'bg-zinc-500/10 text-zinc-400' },
    medium: { icon: 'bg-blue-500/10 text-blue-400' },
    high: { icon: 'bg-amber-500/10 text-amber-400' },
    urgent: { icon: 'bg-red-500/10 text-red-400' },
};

const surfaceTones = [
    'bg-[linear-gradient(135deg,color-mix(in_srgb,var(--info)_42%,var(--surface)),color-mix(in_srgb,var(--info)_19%,var(--surface)))]',
    'bg-[linear-gradient(135deg,color-mix(in_srgb,var(--secondary)_40%,var(--surface)),color-mix(in_srgb,var(--secondary)_18%,var(--surface)))]',
    'bg-[linear-gradient(135deg,color-mix(in_srgb,var(--success)_38%,var(--surface)),color-mix(in_srgb,var(--success)_17%,var(--surface)))]',
    'bg-[linear-gradient(135deg,color-mix(in_srgb,var(--accent)_42%,var(--surface)),color-mix(in_srgb,var(--accent)_19%,var(--surface)))]',
    'bg-[linear-gradient(135deg,color-mix(in_srgb,var(--danger)_36%,var(--surface)),color-mix(in_srgb,var(--danger)_16%,var(--surface)))]',
];

export function TaskCard({ task, toneIndex, onOpen, onStatusChange }: Props) {
    const { t } = useTranslation();
    const isSoft = task.status === 'completed' || task.status === 'cancelled';
    const linkedRecord = task.dossier?.object || task.client?.name || null;
    const showTypeChip = task.type !== 'general';
    const priority = priorityClasses[task.priority];
    const surfaceTone = surfaceTones[toneIndex % surfaceTones.length] ?? surfaceTones[0];

    return (
        <Card className={cn(
            'group relative isolate gap-0 overflow-hidden rounded-xl border-0 shadow-sm transition-[background-color,box-shadow,transform] duration-200',
            surfaceTone,
            isSoft
                ? 'opacity-60'
                : 'hover:-translate-y-0.5 hover:shadow-lg',
        )}>
            <div className="min-w-0 p-2.5">
                <div className="flex min-w-0 items-center gap-1.5">
                    <span className={cn('flex size-5 shrink-0 items-center justify-center rounded-md', priority.icon)} aria-hidden="true"><Flag size={10} /></span>
                    <span className="min-w-0 flex-1 truncate font-mono text-[9px] font-semibold tracking-wide text-[var(--text-muted)]">{task.taskNumber}</span>
                    {showTypeChip ? (
                        <Chip size="sm" className="h-[18px] max-w-[104px] shrink-0 rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-1.5 text-[8px] font-semibold text-[var(--text-muted)]">
                            <span className="truncate">{t(`tasks.types.${task.type}`)}</span>
                        </Chip>
                    ) : null}
                    <div className="shrink-0" onClick={(event) => event.stopPropagation()}>
                        <TaskActionsMenu task={task} onOpen={onOpen} onStatusChange={onStatusChange} />
                    </div>
                </div>

                <Button
                    variant="ghost"
                    onPress={onOpen}
                    aria-label={t('tasks.actions.ariaOpen', { title: task.title })}
                    className="mt-1.5 h-auto min-h-0 w-full min-w-0 justify-start rounded-lg bg-transparent p-0 text-left hover:bg-transparent data-[hovered]:bg-transparent focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
                >
                    <span className="flex w-full min-w-0 flex-col">
                        <span className={cn('line-clamp-2 w-full text-[11px] font-semibold leading-4', isSoft ? 'text-[var(--text-muted)]' : 'text-[var(--foreground)]')}>
                            {task.title}
                        </span>
                        {task.description ? (
                            <span className="mt-0.5 line-clamp-1 w-full text-[9px] leading-4 text-[var(--text-muted)]">{task.description}</span>
                        ) : null}
                        {linkedRecord ? (
                            <span className="mt-1.5 inline-flex max-w-full items-center gap-1 rounded-md bg-[var(--surface-2)] px-1.5 py-0.5 text-[8px] text-[var(--text-muted)]">
                                <Link2 size={9} className="shrink-0" />
                                <span className="truncate">{linkedRecord}</span>
                            </span>
                        ) : null}
                    </span>
                </Button>

                <TaskCardMetadata task={task} />
            </div>
            <GripVertical aria-hidden size={13} className="pointer-events-none absolute bottom-2 right-2 text-[var(--text-muted)] opacity-0 transition-opacity group-hover:opacity-60" />
        </Card>
    );
}
