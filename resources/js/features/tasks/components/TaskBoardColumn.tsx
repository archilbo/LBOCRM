import { Plus } from 'lucide-react';
import type { DragEvent } from 'react';
import { Button, Card, Chip } from '@heroui/react';

import { cn } from '@/lib/cn';
import { useTranslation } from '@/lib/i18n';
import { TaskBoardEmptyState } from '@/features/tasks/components/TaskBoardEmptyState';
import { TaskCard } from '@/features/tasks/components/TaskCard';
import { STATUS_BG_COLORS, STATUS_COLORS, STATUS_DOT_COLORS } from '@/features/tasks/types';
import type { TaskRow, TaskStatus } from '@/features/tasks/types';

type Props = {
    status: TaskStatus;
    tasks: TaskRow[];
    canAdd: boolean;
    isDragOver: boolean;
    draggingTaskId: number | null;
    onTaskClick: (task: TaskRow) => void;
    onCreateInStatus?: (status: string) => void;
    onStatusChange?: (task: TaskRow, status: string) => void;
    onDragStart: (event: DragEvent<HTMLDivElement>, task: TaskRow) => void;
    onDragOver: (event: DragEvent<HTMLDivElement>, status: string) => void;
    onDragLeave: (event: DragEvent<HTMLDivElement>) => void;
    onDrop: (event: DragEvent<HTMLDivElement>, status: string) => void;
    onDragEnd: () => void;
};

export function TaskBoardColumn({
    status,
    tasks,
    canAdd,
    isDragOver,
    draggingTaskId,
    onTaskClick,
    onCreateInStatus,
    onStatusChange,
    onDragStart,
    onDragOver,
    onDragLeave,
    onDrop,
    onDragEnd,
}: Props) {
    const { t } = useTranslation();
    const statusName = t(`tasks.statuses.${status}`);
    const count = tasks.length;
    const countLabel = count === 1
        ? t('tasks.board.tasksCountOne', { count })
        : t('tasks.board.tasksCountMany', { count });

    return (
        <Card
            onDragOver={(event) => onDragOver(event, status)}
            onDragLeave={onDragLeave}
            onDrop={(event) => onDrop(event, status)}
            className={cn(
                'flex w-[min(calc(100vw-3rem),340px)] min-w-[280px] shrink-0 flex-col overflow-visible rounded-2xl border bg-[var(--surface)]',
                'transition-[border-color,background-color,box-shadow] duration-200 sm:w-[300px]',
                isDragOver
                    ? 'z-20 border-[var(--accent)]/60 bg-[var(--accent)]/[0.04] shadow-[0_0_0_3px_rgba(252,177,45,0.12)]'
                    : 'border-[var(--border)] shadow-sm hover:border-[var(--border-strong)]',
            )}
        >
            {/* Column header: dot + name + count + add button */}
            <div className="flex h-11 shrink-0 items-center gap-2 rounded-t-2xl border-b border-[var(--border)] bg-[var(--surface-2)]/60 px-3">
                <span className={cn('size-2 shrink-0 rounded-full', STATUS_DOT_COLORS[status])} aria-hidden="true" />
                <h2 className="truncate text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--text-muted)]">{statusName}</h2>
                <Chip size="sm" aria-label={countLabel} className={cn('h-5 min-w-5 shrink-0 rounded-md border px-1.5 text-[9px] font-bold tabular-nums', STATUS_COLORS[status])}>{count}</Chip>
                {canAdd && onCreateInStatus ? (
                    <Button
                        isIconOnly
                        variant="ghost"
                        size="sm"
                        aria-label={t('tasks.board.createTaskIn', { status: statusName })}
                        onPress={() => onCreateInStatus(status)}
                        className="ml-auto size-6 min-w-6 rounded-md text-[var(--text-muted)] transition hover:bg-[var(--surface-3)] hover:text-[var(--foreground)]"
                    >
                        <Plus size={13} />
                    </Button>
                ) : null}
            </div>

            {/* Column body: cards, empty state, add-task row */}
            <div className={cn('relative flex flex-1 flex-col gap-2 rounded-b-2xl p-2', STATUS_BG_COLORS[status])}>
                {tasks.map((task) => {
                    const isDragging = draggingTaskId === task.id;

                    return (
                        <div
                            key={task.id}
                            draggable
                            onDragStart={(event) => onDragStart(event, task)}
                            onDragEnd={onDragEnd}
                            className={cn(
                                'relative min-w-0 shrink-0 cursor-grab rounded-xl',
                                'transition-[opacity,box-shadow] duration-150',
                                'active:cursor-grabbing focus-within:z-30 hover:z-10',
                                isDragging ? 'z-30 scale-[0.99] opacity-70 shadow-2xl shadow-black/25' : 'opacity-100',
                            )}
                        >
                            <TaskCard
                                task={task}
                                onOpen={() => onTaskClick(task)}
                                onStatusChange={onStatusChange}
                            />
                        </div>
                    );
                })}

                {tasks.length === 0 ? (
                    <TaskBoardEmptyState
                        canAdd={canAdd && !!onCreateInStatus}
                        onAddTask={onCreateInStatus ? () => onCreateInStatus(status) : undefined}
                    />
                ) : null}

                {canAdd && onCreateInStatus && tasks.length > 0 ? (
                    <Button
                        variant="ghost"
                        size="sm"
                        onPress={() => onCreateInStatus(status)}
                        className="mt-0.5 h-7 min-h-7 w-full gap-1 rounded-lg border border-dashed border-[var(--border)] px-2 text-[10px] font-semibold text-[var(--text-muted)] transition hover:border-[var(--accent)]/40 hover:text-[var(--accent)]"
                    >
                        <Plus size={11} /> {t('tasks.board.addTask')}
                    </Button>
                ) : null}

                {isDragOver ? (
                    <div aria-hidden="true" className="pointer-events-none absolute inset-1.5 z-40 rounded-xl border-2 border-dashed border-[var(--accent)]/45 bg-[var(--accent)]/[0.025]" />
                ) : null}
            </div>
        </Card>
    );
}
