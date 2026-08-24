import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import { IconGripVertical } from '@tabler/icons-react';
import { cn } from '@/lib/cn';

export type AppWorkspaceTableColumn<T> = {
    id: string;
    label: ReactNode;
    icon?: ReactNode;
    render: (row: T) => ReactNode;
    headerClassName?: string;
    cellClassName?: string;
    defaultWidth?: number;
    reorderable?: boolean;
    fixedPosition?: 'start' | 'end';
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
    resizableColumns?: boolean;
    columnResizeHint?: string;
    onRowPress?: (row: T) => void;
    renderMobileRow?: (row: T) => ReactNode;
    rowKey?: (row: T) => string | number;
    toolbar?: ReactNode;
    /** Extra classes for the card root (e.g. flex sizing inside a fixed-height layout). */
    className?: string;
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
    resizableColumns = false,
    columnResizeHint = 'Glisser pour redimensionner la colonne',
    onRowPress,
    renderMobileRow,
    rowKey,
    toolbar,
    className,
}: AppWorkspaceTableProps<T>) {
    const baseColumns = columns ?? [];
    const columnSignature = baseColumns.map((column) => column.id).join('|');
    const columnIds = useMemo(() => (columnSignature ? columnSignature.split('|') : []), [columnSignature]);
    const [columnOrder, setColumnOrder] = useState<string[]>([]);
    const [draggedColumnId, setDraggedColumnId] = useState<string | null>(null);
    const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
    const resizingColumnRef = useRef<{ id: string; startX: number; startWidth: number } | null>(null);
    const columnResizeStorageKey = columnOrderStorageKey ? `${columnOrderStorageKey}.widths.v2` : undefined;

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

    useEffect(() => {
        if (!resizableColumns || !columnResizeStorageKey || typeof window === 'undefined') {
            setColumnWidths({});
            return;
        }

        try {
            const stored = window.localStorage.getItem(columnResizeStorageKey);
            const parsed = stored ? JSON.parse(stored) : {};
            if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
                setColumnWidths({});
                return;
            }

            const widths: Record<string, number> = {};
            for (const [id, width] of Object.entries(parsed)) {
                if (columnIds.includes(id) && typeof width === 'number' && Number.isFinite(width)) {
                    widths[id] = Math.max(120, Math.min(720, Math.round(width)));
                }
            }
            setColumnWidths(widths);
        } catch {
            setColumnWidths({});
        }
    }, [columnIds, columnResizeStorageKey, resizableColumns]);

    useEffect(() => {
        if (!resizableColumns || !columnResizeStorageKey || typeof window === 'undefined') return;
        window.localStorage.setItem(columnResizeStorageKey, JSON.stringify(columnWidths));
    }, [columnResizeStorageKey, columnWidths, resizableColumns]);

    const resolvedColumns = useMemo(() => {
        const byId = new Map(baseColumns.map((column) => [column.id, column]));
        const orderedIds = columnOrder.length > 0 ? columnOrder : columnIds;

        const orderedColumns = orderedIds
            .map((id) => byId.get(id))
            .filter((column): column is AppWorkspaceTableColumn<T> => Boolean(column));

        return [
            ...orderedColumns.filter((column) => column.fixedPosition === 'start'),
            ...orderedColumns.filter((column) => !column.fixedPosition),
            ...orderedColumns.filter((column) => column.fixedPosition === 'end'),
        ];
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

    function startColumnResize(event: ReactPointerEvent<HTMLButtonElement>, columnId: string) {
        const header = event.currentTarget.closest('th');
        if (!header) return;

        event.preventDefault();
        event.stopPropagation();
        event.currentTarget.setPointerCapture(event.pointerId);
        resizingColumnRef.current = {
            id: columnId,
            startX: event.clientX,
            startWidth: header.getBoundingClientRect().width,
        };
    }

    function resizeColumn(event: ReactPointerEvent<HTMLButtonElement>) {
        const resize = resizingColumnRef.current;
        if (!resize) return;

        event.preventDefault();
        const width = Math.max(120, Math.min(720, Math.round(resize.startWidth + event.clientX - resize.startX)));
        setColumnWidths((current) => current[resize.id] === width ? current : { ...current, [resize.id]: width });
    }

    function stopColumnResize(event: ReactPointerEvent<HTMLButtonElement>) {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
        }
        resizingColumnRef.current = null;
    }

    function columnStyle(column: AppWorkspaceTableColumn<T>) {
        const width = columnWidths[column.id] ?? (resizableColumns ? column.defaultWidth : undefined);

        return width ? { width, minWidth: width } : undefined;
    }

    if (children) {
        return (
            <div className={cn('rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm', className)}>
                {toolbar ? <div className="border-b border-[var(--border)]">{toolbar}</div> : null}
                {children}
                {footer ? <div className="border-t border-[var(--border)]">{footer}</div> : null}
            </div>
        );
    }

    return (
        <div className={cn('rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm', className)}>
            {toolbar ? <div className="border-b border-[var(--border)]">{toolbar}</div> : null}

            <div className={cn('flex-1 min-h-0 overflow-x-auto overflow-y-auto', desktopHiddenClassName)}>
                <table aria-label={ariaLabel} className={cn('w-full text-xs', resizableColumns && 'table-fixed', minTableWidthClassName)}>
                    <thead>
                        <tr className="border-b border-[var(--border)] bg-[var(--surface-2)]/55 text-left text-[10px] font-semibold tracking-[0.04em] text-[var(--text-muted)]">
                            {resolvedColumns.map((column) => {
                                const canResize = resizableColumns && column.reorderable !== false;
                                const canReorder = Boolean(columnOrderStorageKey && column.reorderable !== false);

                                return <th
                                    key={column.id}
                                    onDragOver={(event) => { if (canReorder) event.preventDefault(); }}
                                    onDrop={() => { if (canReorder) reorderColumns(column.id); }}
                                    className={cn(
                                        'relative px-3 py-3 align-middle',
                                        draggedColumnId === column.id ? 'opacity-45' : '',
                                        column.headerClassName,
                                    )}
                                    style={columnStyle(column)}
                                >
                                    <div className={cn('flex min-w-0 items-center gap-1', canResize ? 'pr-3' : '')}>
                                        {canReorder ? <span
                                            draggable
                                            title={columnOrderHint}
                                            aria-hidden="true"
                                            className="inline-flex shrink-0 cursor-grab touch-none text-[var(--text-muted)]/75 transition hover:text-[var(--accent)] active:cursor-grabbing"
                                            onDragStart={() => setDraggedColumnId(column.id)}
                                            onDragEnd={() => setDraggedColumnId(null)}
                                        ><IconGripVertical size={13} strokeWidth={1.8} /></span> : null}
                                        <span className="inline-flex min-w-0 items-center gap-1.5 whitespace-nowrap">
                                            {column.icon ? <span className="shrink-0 text-[var(--accent)]/85">{column.icon}</span> : null}
                                            {column.label}
                                        </span>
                                    </div>
                                    {canResize ? <button
                                        type="button"
                                        aria-label={`${columnResizeHint}: ${column.id}`}
                                        title={columnResizeHint}
                                        className="absolute inset-y-0 right-0 z-10 w-3 !cursor-ew-resize touch-none focus-visible:outline-none after:absolute after:inset-y-2 after:left-1/2 after:w-px after:-translate-x-1/2 after:bg-transparent hover:after:bg-[var(--accent)] focus-visible:after:bg-[var(--accent)]"
                                        onPointerDown={(event) => startColumnResize(event, column.id)}
                                        onPointerMove={resizeColumn}
                                        onPointerUp={stopColumnResize}
                                        onLostPointerCapture={() => { resizingColumnRef.current = null; }}
                                    /> : null}
                                </th>
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {resolvedData.length > 0 ? resolvedData.map((row) => (
                            <tr
                                key={resolvedRowKey(row)}
                                className={cn('border-b border-[var(--border)] transition last:border-0', onRowPress ? 'cursor-pointer hover:bg-[var(--surface-2)]' : '')}
                                onClick={() => onRowPress?.(row)}
                            >
                                {resolvedColumns.map((column) => {
                                    return <td key={column.id} className={cn('px-3 py-2', column.cellClassName)} style={columnStyle(column)}>{column.render(row)}</td>;
                                })}
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
