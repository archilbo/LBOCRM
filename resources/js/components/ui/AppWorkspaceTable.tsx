import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type AppWorkspaceTableColumn<T> = {
    id: string;
    label: ReactNode;
    icon?: ReactNode;
    render: (row: T) => ReactNode;
    headerClassName?: string;
    cellClassName?: string;
    reorderable?: boolean;
};

type AppWorkspaceTableProps<T> = {
    ariaLabel: string;
    children?: ReactNode;
    columns?: AppWorkspaceTableColumn<T>[];
    data?: T[];
    emptyContent?: ReactNode;
    footer?: ReactNode;
    minTableWidthClassName?: string;
    columnOrderStorageKey?: string;
    columnOrderHint?: string;
    onRowPress?: (row: T) => void;
    renderMobileRow?: (row: T) => ReactNode;
    rowKey?: (row: T) => string | number;
    toolbar: ReactNode;
};

/** Shared CRM list shell with optional persisted column reordering. */
export function AppWorkspaceTable<T>({
    ariaLabel,
    columns,
    children,
    data,
    emptyContent,
    footer,
    minTableWidthClassName = 'min-w-[800px]',
    columnOrderStorageKey,
    columnOrderHint,
    onRowPress,
    renderMobileRow,
    rowKey,
    toolbar,
}: AppWorkspaceTableProps<T>) {
    const baseColumns = columns ?? [];
    const columnSignature = baseColumns.map((column) => column.id).join('|');
    const columnIds = useMemo(() => (columnSignature ? columnSignature.split('|') : []), [columnSignature]);
    const [columnOrder, setColumnOrder] = useState<string[]>([]);
    const [draggedColumnId, setDraggedColumnId] = useState<string | null>(null);

    useEffect(() => {
        if (!columnOrderStorageKey || typeof window === 'undefined') {
            setColumnOrder(columnIds);
            return;
        }

        let storedOrder: string[] = [];
        try {
            const stored = window.localStorage.getItem(columnOrderStorageKey);
            const parsed = stored ? JSON.parse(stored) : [];
            storedOrder = Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
        } catch {
            storedOrder = [];
        }

        setColumnOrder((currentOrder) => {
            const preferredOrder = currentOrder.length > 0 ? currentOrder : storedOrder;
            const nextOrder = [...preferredOrder.filter((id) => columnIds.includes(id)), ...columnIds.filter((id) => !preferredOrder.includes(id))];

            return currentOrder.length === nextOrder.length && currentOrder.every((id, index) => id === nextOrder[index])
                ? currentOrder
                : nextOrder;
        });
    }, [columnIds, columnOrderStorageKey]);

    useEffect(() => {
        if (!columnOrderStorageKey || columnOrder.length === 0 || typeof window === 'undefined') return;
        window.localStorage.setItem(columnOrderStorageKey, JSON.stringify(columnOrder));
    }, [columnOrder, columnOrderStorageKey]);

    const resolvedColumns = useMemo(() => {
        const byId = new Map(baseColumns.map((column) => [column.id, column]));
        const orderedIds = columnOrder.length > 0 ? columnOrder : columnIds;

        return orderedIds.map((id) => byId.get(id)).filter((column): column is AppWorkspaceTableColumn<T> => Boolean(column));
    }, [baseColumns, columnIds, columnOrder]);

    const resolvedData = data ?? [];
    const resolvedRowKey = rowKey ?? (() => 'row');
    const desktopHiddenClassName = renderMobileRow ? 'hidden md:block' : '';

    function reorderColumns(targetId: string) {
        if (!draggedColumnId || draggedColumnId === targetId) return;

        setColumnOrder((currentOrder) => {
            const nextOrder = (currentOrder.length > 0 ? currentOrder : columnIds).filter((id) => id !== draggedColumnId);
            const targetIndex = nextOrder.indexOf(targetId);
            nextOrder.splice(targetIndex < 0 ? nextOrder.length : targetIndex, 0, draggedColumnId);
            return nextOrder;
        });
        setDraggedColumnId(null);
    }

    if (children) {
        return (
            <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
                <div className="border-b border-[var(--border)]">{toolbar}</div>
                {children}
                {footer ? <div className="border-t border-[var(--border)]">{footer}</div> : null}
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
            <div className="border-b border-[var(--border)]">{toolbar}</div>

            <div className={cn('overflow-x-auto', desktopHiddenClassName)}>
                <table aria-label={ariaLabel} className={cn('w-full text-xs', minTableWidthClassName)}>
                    <thead>
                        <tr className="border-b border-[var(--border)] bg-[var(--surface-2)]/55 text-left text-[11px] font-semibold tracking-[0.04em] text-[var(--text-muted)]">
                            {resolvedColumns.map((column) => (
                                <th
                                    key={column.id}
                                    draggable={Boolean(columnOrderStorageKey && column.reorderable !== false)}
                                    onDragStart={() => setDraggedColumnId(column.id)}
                                    onDragOver={(event) => { if (columnOrderStorageKey && column.reorderable !== false) event.preventDefault(); }}
                                    onDrop={() => { if (column.reorderable !== false) reorderColumns(column.id); }}
                                    onDragEnd={() => setDraggedColumnId(null)}
                                    title={columnOrderStorageKey && column.reorderable !== false ? columnOrderHint : undefined}
                                    className={cn(
                                        'px-3 py-3 align-middle',
                                        columnOrderStorageKey && column.reorderable !== false ? 'cursor-grab select-none active:cursor-grabbing' : '',
                                        draggedColumnId === column.id ? 'opacity-45' : '',
                                        column.headerClassName,
                                    )}
                                >
                                    <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                                        {column.icon ? <span className="text-[var(--accent)]/85">{column.icon}</span> : null}
                                        {column.label}
                                    </span>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {resolvedData.length > 0 ? resolvedData.map((row) => (
                            <tr
                                key={resolvedRowKey(row)}
                                className={cn('border-b border-[var(--border)] transition last:border-0', onRowPress ? 'cursor-pointer hover:bg-[var(--surface-2)]' : '')}
                                onClick={() => onRowPress?.(row)}
                            >
                                {resolvedColumns.map((column) => <td key={column.id} className={cn('px-3 py-2', column.cellClassName)}>{column.render(row)}</td>)}
                            </tr>
                        )) : (
                            <tr><td colSpan={resolvedColumns.length} className="px-3 py-8 text-center text-xs text-[var(--text-muted)]">{emptyContent}</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {renderMobileRow ? <div className="block divide-y divide-[var(--border)] md:hidden">{resolvedData.length > 0 ? resolvedData.map((row) => renderMobileRow(row)) : <div className="p-6">{emptyContent}</div>}</div> : null}
            {footer ? <div className="border-t border-[var(--border)]">{footer}</div> : null}
        </div>
    );
}
