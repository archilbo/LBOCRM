import { IconPlus } from '@tabler/icons-react';

import {
    useCallback,
    useEffect,
    useRef,
    useState,
    type DragEvent,
} from 'react';

import { TaskCard } from '@/features/tasks/components/TaskCard';
import {
    BOARD_COLUMNS,
    STATUS_DOT_COLORS,
    STATUS_LABELS,
} from '@/features/tasks/types';
import type { TaskRow } from '@/features/tasks/types';

type Props = {
    columns: Record<string, TaskRow[]>;
    onTaskClick: (task: TaskRow) => void;
    onCreateInStatus?: (status: string) => void;
    onStatusChange?: (task: TaskRow, status: string) => void;
};

type DragData = {
    id: number;
    fromStatus: string;
};

const HIDDEN_SCROLLBAR =
    '[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden';

export function TaskBoard({
    columns,
    onTaskClick,
    onCreateInStatus,
    onStatusChange,
}: Props) {
    const [dragOverColumn, setDragOverColumn] = useState<string | null>(
        null,
    );

    const [dragTaskId, setDragTaskId] = useState<number | null>(null);

    const dragLeaveTimeout = useRef<ReturnType<
        typeof setTimeout
    > | null>(null);

    useEffect(() => {
        return () => {
            if (dragLeaveTimeout.current) {
                clearTimeout(dragLeaveTimeout.current);
            }
        };
    }, []);

    const clearDragLeaveTimeout = useCallback(() => {
        if (!dragLeaveTimeout.current) {
            return;
        }

        clearTimeout(dragLeaveTimeout.current);
        dragLeaveTimeout.current = null;
    }, []);

    const resetDragState = useCallback(() => {
        clearDragLeaveTimeout();
        setDragOverColumn(null);
        setDragTaskId(null);
    }, [clearDragLeaveTimeout]);

    const handleDragStart = useCallback(
        (
            event: DragEvent<HTMLDivElement>,
            task: TaskRow,
        ) => {
            const dragData: DragData = {
                id: task.id,
                fromStatus: task.status,
            };

            const serializedData = JSON.stringify(dragData);

            event.dataTransfer.setData(
                'application/json',
                serializedData,
            );

            event.dataTransfer.setData(
                'text/plain',
                serializedData,
            );

            event.dataTransfer.effectAllowed = 'move';

            setDragTaskId(task.id);
        },
        [],
    );

    const handleDragOver = useCallback(
        (
            event: DragEvent<HTMLDivElement>,
            status: string,
        ) => {
            event.preventDefault();

            event.dataTransfer.dropEffect = 'move';

            clearDragLeaveTimeout();
            setDragOverColumn(status);
        },
        [clearDragLeaveTimeout],
    );

    const handleDragLeave = useCallback(
        (event: DragEvent<HTMLDivElement>) => {
            const columnElement = event.currentTarget;
            const nextElement = event.relatedTarget;

            if (
                nextElement instanceof Node &&
                columnElement.contains(nextElement)
            ) {
                return;
            }

            clearDragLeaveTimeout();

            dragLeaveTimeout.current = setTimeout(() => {
                setDragOverColumn(null);
            }, 80);
        },
        [clearDragLeaveTimeout],
    );

    const handleDrop = useCallback(
        (
            event: DragEvent<HTMLDivElement>,
            targetStatus: string,
        ) => {
            event.preventDefault();

            try {
                const rawData =
                    event.dataTransfer.getData(
                        'application/json',
                    ) ||
                    event.dataTransfer.getData('text/plain');

                if (!rawData) {
                    resetDragState();
                    return;
                }

                const dragData = JSON.parse(
                    rawData,
                ) as DragData;

                if (
                    !dragData.id ||
                    !dragData.fromStatus ||
                    dragData.fromStatus === targetStatus ||
                    !onStatusChange
                ) {
                    resetDragState();
                    return;
                }

                const sourceTasks =
                    columns[dragData.fromStatus] ?? [];

                const draggedTask = sourceTasks.find(
                    (task) => task.id === dragData.id,
                );

                if (draggedTask) {
                    onStatusChange(
                        draggedTask,
                        targetStatus,
                    );
                }
            } catch {
                // Ignore invalid external drag data.
            } finally {
                resetDragState();
            }
        },
        [
            columns,
            onStatusChange,
            resetDragState,
        ],
    );

    return (
        <section className="relative isolate w-full">
            <div className="grid w-full grid-cols-1 items-start gap-3 md:grid-cols-2 xl:grid-cols-4">
                {BOARD_COLUMNS.map((status) => {
                    const tasks = columns[status] ?? [];

                    const isDragOver =
                        dragOverColumn === status;

                    return (
                        <article
                            key={status}
                            onDragOver={(event) =>
                                handleDragOver(
                                    event,
                                    status,
                                )
                            }
                            onDragLeave={handleDragLeave}
                            onDrop={(event) =>
                                handleDrop(
                                    event,
                                    status,
                                )
                            }
                            className={[
                                'relative flex min-w-0 flex-col overflow-visible',
                                'h-[calc(100vh-240px)] min-h-[480px]',
                                'rounded-2xl border',
                                'bg-[var(--crm-surface)]',
                                'transition-[border-color,background-color,box-shadow,transform]',
                                'duration-200',
                                isDragOver
                                    ? [
                                          'z-20',
                                          'border-[var(--crm-gold)]/60',
                                          'bg-[var(--crm-gold)]/[0.035]',
                                          'shadow-[0_0_0_3px_rgba(212,175,55,0.08)]',
                                      ].join(' ')
                                    : [
                                          'z-0',
                                          'border-[var(--crm-border)]',
                                          'shadow-sm',
                                          'hover:border-[var(--crm-border-strong)]',
                                      ].join(' '),
                            ].join(' ')}
                        >
                            <header className="relative z-20 flex shrink-0 items-center justify-between gap-3 rounded-t-2xl border-b border-[var(--crm-border)] bg-[var(--crm-elevated)] px-3.5 py-3">
                                <div className="flex min-w-0 items-center gap-2.5">
                                    <span
                                        className={[
                                            'size-2.5 shrink-0 rounded-full',
                                            'ring-4 ring-[var(--crm-surface-3)]',
                                            STATUS_DOT_COLORS[
                                                status
                                            ],
                                        ].join(' ')}
                                    />

                                    <div className="flex min-w-0 items-center gap-2">
                                        <h3 className="truncate text-xs font-semibold tracking-[0.01em] text-[var(--crm-text)]">
                                            {
                                                STATUS_LABELS[
                                                    status
                                                ]
                                            }
                                        </h3>

                                        <span className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-md bg-[var(--crm-surface-3)] px-1.5 text-[9px] font-bold tabular-nums text-[var(--crm-text-muted)]">
                                            {tasks.length}
                                        </span>
                                    </div>
                                </div>

                                {onCreateInStatus ? (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            onCreateInStatus(
                                                status,
                                            )
                                        }
                                        aria-label={`Create task in ${STATUS_LABELS[status]}`}
                                        title={`Create task in ${STATUS_LABELS[status]}`}
                                        className={[
                                            'inline-flex size-7 shrink-0 items-center justify-center',
                                            'rounded-lg border border-transparent',
                                            'text-[var(--crm-text-muted)]',
                                            'transition-colors duration-150',
                                            'hover:border-[var(--crm-border)]',
                                            'hover:bg-[var(--crm-surface-3)]',
                                            'hover:text-[var(--crm-gold)]',
                                            'focus-visible:outline-none',
                                            'focus-visible:ring-2',
                                            'focus-visible:ring-[var(--crm-gold)]/40',
                                        ].join(' ')}
                                    >
                                        <IconPlus
                                            size={15}
                                            strokeWidth={2}
                                            aria-hidden="true"
                                        />
                                    </button>
                                ) : null}
                            </header>

                            <div
                                className={[
                                    'relative flex min-h-0 flex-1 flex-col',
                                    'gap-2.5 overflow-y-auto overflow-x-visible',
                                    'p-2.5',
                                    HIDDEN_SCROLLBAR,
                                ].join(' ')}
                            >
                                {tasks.map((task) => {
                                    const isDragging =
                                        dragTaskId ===
                                        task.id;

                                    return (
                                        <div
                                            key={task.id}
                                            draggable
                                            onDragStart={(
                                                event,
                                            ) =>
                                                handleDragStart(
                                                    event,
                                                    task,
                                                )
                                            }
                                            onDragEnd={
                                                resetDragState
                                            }
                                            className={[
                                                'relative min-w-0 shrink-0',
                                                'cursor-grab rounded-xl',
                                                'transition-[opacity,transform,box-shadow]',
                                                'duration-200',
                                                'active:cursor-grabbing',
                                                'focus-within:z-30',
                                                'hover:z-10',
                                                isDragging
                                                    ? 'z-30 scale-[0.98] opacity-35'
                                                    : 'opacity-100',
                                            ].join(' ')}
                                        >
                                            <TaskCard
                                                task={task}
                                                onClick={() =>
                                                    onTaskClick(
                                                        task,
                                                    )
                                                }
                                            />
                                        </div>
                                    );
                                })}

                                {tasks.length === 0 ? (
                                    <button
                                        type="button"
                                        disabled={
                                            !onCreateInStatus
                                        }
                                        onClick={() =>
                                            onCreateInStatus?.(
                                                status,
                                            )
                                        }
                                        className={[
                                            'flex min-h-36 w-full flex-1',
                                            'flex-col items-center justify-center',
                                            'rounded-xl border border-dashed',
                                            'border-[var(--crm-border)]',
                                            'bg-[var(--crm-elevated)]/40',
                                            'px-5 py-8 text-center',
                                            'transition-colors duration-150',
                                            'enabled:hover:border-[var(--crm-gold)]/40',
                                            'enabled:hover:bg-[var(--crm-gold)]/[0.035]',
                                            'disabled:cursor-default',
                                        ].join(' ')}
                                    >
                                        <span className="text-xs font-medium text-[var(--crm-text-muted)]">
                                            No tasks
                                        </span>

                                        {onCreateInStatus ? (
                                            <span className="mt-1 text-[9px] text-[var(--crm-text-subtle)]">
                                                Add the first
                                                task
                                            </span>
                                        ) : null}
                                    </button>
                                ) : null}

                                {isDragOver ? (
                                    <div
                                        aria-hidden="true"
                                        className="pointer-events-none absolute inset-2 z-40 rounded-xl border-2 border-dashed border-[var(--crm-gold)]/45 bg-[var(--crm-gold)]/[0.025]"
                                    />
                                ) : null}
                            </div>
                        </article>
                    );
                })}
            </div>
        </section>
    );
}