import { useCallback, useEffect, useRef, useState, type DragEvent } from 'react';
import { Card } from '@heroui/react';

import { useTranslation } from '@/lib/i18n';
import { TaskBoardColumn } from '@/features/tasks/components/TaskBoardColumn';
import { BOARD_COLUMNS } from '@/features/tasks/types';
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

export function TaskBoard({
    columns,
    onTaskClick,
    onCreateInStatus,
    onStatusChange,
}: Props) {
    const { t } = useTranslation();

    const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
    const [dragTaskId, setDragTaskId] = useState<number | null>(null);

    const dragLeaveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

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

    const handleDragStart = useCallback((event: DragEvent<HTMLDivElement>, task: TaskRow) => {
        const dragData: DragData = { id: task.id, fromStatus: task.status };
        const serializedData = JSON.stringify(dragData);

        event.dataTransfer.setData('application/json', serializedData);
        event.dataTransfer.setData('text/plain', serializedData);
        event.dataTransfer.effectAllowed = 'move';

        setDragTaskId(task.id);
    }, []);

    const handleDragOver = useCallback((event: DragEvent<HTMLDivElement>, status: string) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';

        clearDragLeaveTimeout();
        setDragOverColumn(status);
    }, [clearDragLeaveTimeout]);

    const handleDragLeave = useCallback((event: DragEvent<HTMLDivElement>) => {
        const columnElement = event.currentTarget;
        const nextElement = event.relatedTarget;

        if (nextElement instanceof Node && columnElement.contains(nextElement)) {
            return;
        }

        clearDragLeaveTimeout();

        dragLeaveTimeout.current = setTimeout(() => {
            setDragOverColumn(null);
        }, 80);
    }, [clearDragLeaveTimeout]);

    const handleDrop = useCallback((event: DragEvent<HTMLDivElement>, targetStatus: string) => {
        event.preventDefault();

        try {
            const rawData = event.dataTransfer.getData('application/json') || event.dataTransfer.getData('text/plain');

            if (!rawData) {
                resetDragState();
                return;
            }

            const dragData = JSON.parse(rawData) as DragData;

            if (!dragData.id || !dragData.fromStatus || dragData.fromStatus === targetStatus || !onStatusChange) {
                resetDragState();
                return;
            }

            const sourceTasks = columns[dragData.fromStatus] ?? [];
            const draggedTask = sourceTasks.find((task) => task.id === dragData.id);

            if (draggedTask) {
                onStatusChange(draggedTask, targetStatus);
            }
        } catch {
            // Ignore invalid external drag data.
        } finally {
            resetDragState();
        }
    }, [columns, onStatusChange, resetDragState]);

    return (
        <Card aria-label={t('tasks.board.label')} className="relative isolate gap-0 overflow-visible border-0 bg-transparent p-0 shadow-none">
            <Card.Content className="p-0">
                <div className="grid grid-cols-1 items-start gap-2 px-0.5 pb-0.5 md:grid-cols-2 xl:grid-cols-4">
                    {BOARD_COLUMNS.map((status) => (
                        <TaskBoardColumn
                            key={status}
                            status={status}
                            tasks={columns[status] ?? []}
                            canAdd={!!onCreateInStatus}
                            isDragOver={dragOverColumn === status}
                            draggingTaskId={dragTaskId}
                            onTaskClick={onTaskClick}
                            onCreateInStatus={onCreateInStatus}
                            onStatusChange={onStatusChange}
                            onDragStart={handleDragStart}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onDragEnd={resetDragState}
                        />
                    ))}
                </div>
            </Card.Content>
        </Card>
    );
}
