import { Link2 } from 'lucide-react';
import { Button, Card, Chip } from '@heroui/react';

import { cn } from '@/lib/cn';
import { useTranslation } from '@/lib/i18n';
import { TaskActionsMenu } from '@/features/tasks/components/TaskActionsMenu';
import { TaskCardMetadata } from '@/features/tasks/components/TaskCardMetadata';
import type { TaskRow } from '@/features/tasks/types';

type Props = {
    task: TaskRow;
    onOpen: () => void;
    onStatusChange?: (task: TaskRow, status: string) => void;
};

export function TaskCard({ task, onOpen, onStatusChange }: Props) {
    const { t } = useTranslation();
    const isSoft = task.status === 'completed' || task.status === 'cancelled';
    const linkedRecord = task.dossier?.object || task.client?.name || null;
    const showTypeChip = task.type !== 'general';

    return (
        <Card className={cn(
            'gap-0 rounded-xl border bg-[var(--surface)] transition-all duration-150',
            isSoft
                ? 'border-[var(--border)] opacity-55'
                : 'border-[var(--border)] hover:border-[var(--accent)]/40 hover:bg-[var(--surface-2)]/40',
        )}>
            <div className="min-w-0 p-3">
                {/* Top row: context chip + actions menu */}
                <div className="flex items-start gap-2">
                    {showTypeChip ? (
                        <Chip size="sm" className="h-[18px] max-w-[140px] rounded bg-[var(--surface-2)] px-1.5 text-[9px] font-semibold text-[var(--text-muted)]">
                            <span className="truncate">{t(`tasks.types.${task.type}`)}</span>
                        </Chip>
                    ) : <span className="min-w-0 flex-1" />}
                    <div className="ml-auto shrink-0" onClick={(event) => event.stopPropagation()}>
                        <TaskActionsMenu task={task} onOpen={onOpen} onStatusChange={onStatusChange} />
                    </div>
                </div>

                {/* Primary action: opens the task details drawer */}
                <Button
                    variant="ghost"
                    onPress={onOpen}
                    aria-label={t('tasks.actions.ariaOpen', { title: task.title })}
                    className="mt-1.5 h-auto min-h-0 w-full min-w-0 justify-start gap-0 rounded-lg p-0 text-left"
                >
                    <span className="flex w-full flex-col">
                        <span className={cn('block w-full text-[12px] font-semibold leading-5', isSoft ? 'text-[var(--text-muted)]' : 'text-[var(--text)]')}>
                            {task.title}
                        </span>

                        {task.description ? (
                            <span className="mt-0.5 line-clamp-2 block w-full text-[10px] leading-4 text-[var(--text-muted)]">{task.description}</span>
                        ) : null}

                        {linkedRecord ? (
                            <span className="mt-1.5 inline-flex max-w-full items-center gap-1 rounded bg-black/10 px-1.5 py-0.5 text-[9px] text-[var(--text-muted)]">
                                <Link2 size={9} className="shrink-0" />
                                <span className="truncate">{linkedRecord}</span>
                            </span>
                        ) : null}
                    </span>
                </Button>

                <TaskCardMetadata task={task} />
            </div>
        </Card>
    );
}
