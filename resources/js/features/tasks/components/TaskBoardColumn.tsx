import { Plus } from 'lucide-react';
import type { DragEvent } from 'react';
import { Button, Card, Chip, ScrollShadow } from '@heroui/react';

import { cn } from '@/lib/cn';
import { useTranslation } from '@/lib/i18n';
import { TaskBoardEmptyState } from '@/features/tasks/components/TaskBoardEmptyState';
import { TaskCard } from '@/features/tasks/components/TaskCard';
import { BOARD_COLUMNS, STATUS_COLORS, STATUS_DOT_COLORS } from '@/features/tasks/types';
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

const dragBorderClasses: Record<TaskStatus, string> = {
    backlog: 'border-zinc-300/90 ring-1 ring-zinc-300/55 shadow-[0_0_16px_rgba(212,212,216,0.24)]',
    not_started: 'border-zinc-300/90 ring-1 ring-zinc-300/55 shadow-[0_0_16px_rgba(212,212,216,0.24)]',
    in_progress: 'border-blue-300/90 ring-1 ring-blue-300/55 shadow-[0_0_16px_rgba(147,197,253,0.3)]',
    waiting_client: 'border-violet-300/90 ring-1 ring-violet-300/55 shadow-[0_0_16px_rgba(196,181,253,0.3)]',
    waiting_admin: 'border-cyan-300/90 ring-1 ring-cyan-300/55 shadow-[0_0_16px_rgba(103,232,249,0.3)]',
    blocked: 'border-red-300/90 ring-1 ring-red-300/55 shadow-[0_0_16px_rgba(252,165,165,0.3)]',
    in_review: 'border-amber-300/90 ring-1 ring-amber-300/55 shadow-[0_0_16px_rgba(252,211,77,0.3)]',
    completed: 'border-emerald-300/90 ring-1 ring-emerald-300/55 shadow-[0_0_16px_rgba(110,231,183,0.3)]',
    cancelled: 'border-zinc-300/90 ring-1 ring-zinc-300/55 shadow-[0_0_16px_rgba(212,212,216,0.24)]',
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
    const toneOffset = BOARD_COLUMNS.indexOf(status);

    return (
        <Card
            onDragOver={(event) => onDragOver(event, status)}
            onDragLeave={onDragLeave}
            onDrop={(event) => onDrop(event, status)}
            className={cn(
                'flex min-w-0 w-full flex-col overflow-hidden rounded-xl border bg-[color-mix(in_srgb,var(--surface)_92%,var(--surface-2))]',
                'transition-[border-color,background-color,box-shadow,transform] duration-200',
                isDragOver
                    ? `z-20 -translate-y-0.5 bg-[color-mix(in_srgb,var(--surface)_94%,transparent)] ${dragBorderClasses[status]}`
                    : 'border-[var(--border)] shadow-sm hover:border-[var(--border-strong)]',
            )}
        >
            <div className="relative m-1.5 flex h-10 shrink-0 items-center gap-1.5 rounded-lg bg-[color-mix(in_srgb,var(--surface-2)_78%,transparent)] px-2.5">
                <span className={cn('flex size-5 shrink-0 items-center justify-center rounded-md border border-current/10 bg-[var(--surface)]', STATUS_COLORS[status])} aria-hidden="true">
                    <span className={cn('size-1.5 rounded-full', STATUS_DOT_COLORS[status])} />
                </span>
                <div className="min-w-0 flex-1">
                    <h2 className="truncate text-[9px] font-bold uppercase tracking-[0.09em] text-[var(--foreground)]">{statusName}</h2>
                    <span className="block text-[8px] leading-3 text-[var(--text-muted)]">{countLabel}</span>
                </div>
                <Chip size="sm" aria-label={countLabel} className={cn('h-5 min-w-5 shrink-0 rounded-md border px-1.5 text-[9px] font-bold tabular-nums', STATUS_COLORS[status])}>{count}</Chip>
                {canAdd && onCreateInStatus ? (
                    <Button
                        isIconOnly
                        variant="ghost"
                        size="sm"
                        aria-label={t('tasks.board.createTaskIn', { status: statusName })}
                        onPress={() => onCreateInStatus(status)}
                        className="ml-auto size-5 min-w-5 rounded-md text-[var(--text-muted)] transition hover:bg-[var(--surface-3)] hover:text-[var(--foreground)]"
                    >
                        <Plus size={13} />
                    </Button>
                ) : null}
            </div>

            <ScrollShadow orientation="vertical" hideScrollBar className="h-[360px] xl:h-[410px]">
                <div className="relative flex min-h-full flex-col gap-1.5 p-1.5">
                    {tasks.map((task, taskIndex) => {
                    const isDragging = draggingTaskId === task.id;

                    return (
                        <div
                            key={task.id}
                            draggable
                            onDragStart={(event) => onDragStart(event, task)}
                            onDragEnd={onDragEnd}
                            className={cn(
                                'relative min-w-0 shrink-0 cursor-grab rounded-xl',
                                'transition-[opacity,transform] duration-150',
                                'active:cursor-grabbing focus-within:z-30 hover:z-10',
                                isDragging ? 'z-30 scale-[0.99] opacity-70' : 'opacity-100',
                            )}
                        >
                            <TaskCard
                                task={task}
                                toneIndex={taskIndex + toneOffset}
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
                            className="mt-0.5 h-6 min-h-6 w-full gap-1 rounded-md border border-dashed border-[var(--border)] bg-[var(--surface)]/45 px-2 text-[9px] font-semibold text-[var(--text-muted)] transition hover:border-[var(--accent)]/40 hover:text-[var(--accent)]"
                        >
                            <Plus size={11} /> {t('tasks.board.addTask')}
                        </Button>
                    ) : null}

                    {isDragOver ? (
                        <div aria-hidden="true" className="pointer-events-none absolute inset-1 z-40 rounded-lg border-2 border-dashed border-[var(--accent)]/45 bg-[var(--accent)]/[0.025]" />
                    ) : null}
                </div>
            </ScrollShadow>
        </Card>
    );
}
