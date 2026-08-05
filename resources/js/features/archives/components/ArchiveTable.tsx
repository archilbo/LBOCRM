import { router } from '@inertiajs/react';
import { IconAlertCircle, IconArrowsSort, IconChevronDown, IconChevronUp, IconLogout, IconDots, IconPencil, IconTrash, IconArrowBackUp } from '@tabler/icons-react';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
    type ColumnDef,
    type Row,
    type SortingState,
} from '@tanstack/react-table';
import { AppEmptyState } from '@/components/ui/AppEmptyState';
import { AppTooltip } from '@/components/ui/AppTooltip';
import { StatusPill } from '@/components/ui/StatusPill';
import type { ArchiveRecordRow } from '@/features/archives/types';
import { cn } from '@/lib/cn';

type ArchiveTableProps = {
    archives: ArchiveRecordRow[];
    selectedIds: Set<number>;
    allSelected: boolean;
    sort: string | undefined;
    onToggleSelect: (id: number) => void;
    onToggleAll: () => void;
    onRowClick: (record: ArchiveRecordRow) => void;
    onRowDoubleClick: (record: ArchiveRecordRow) => void;
    onCheckoutSingle?: (record: ArchiveRecordRow) => void;
    onReturnSingle?: (record: ArchiveRecordRow) => void;
    onEditSingle?: (record: ArchiveRecordRow) => void;
    onDeleteSingle?: (record: ArchiveRecordRow) => void;
    onSortChange: (sort: string | undefined) => void;
    onCreateFromEmpty?: () => void;
    className?: string;
};

function SortHeader({ label, sortKey, sort, onSortChange }: { label: string; sortKey: string; sort: string | undefined; onSortChange: (s: string | undefined) => void }) {
    const [col, dir] = (typeof sort === 'string' ? sort : '').split(':');
    const active = col === sortKey;
    return (
        <button type="button" onClick={() => {
            if (!active) onSortChange(`${sortKey}:asc`);
            else if (dir === 'asc') onSortChange(`${sortKey}:desc`);
            else onSortChange(undefined);
        }}
            className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-white/50 hover:text-white/80 select-none whitespace-nowrap">
            {label}
            {active ? (dir === 'asc' ? <IconChevronUp size={11} /> : <IconChevronDown size={11} />) : <IconArrowsSort size={11} className="opacity-30" />}
        </button>
    );
}

function LocationBreadcrumbs({ record }: { record: ArchiveRecordRow }) {
    const parts = [record.room, record.shelf, record.box].filter(Boolean);
    if (parts.length === 0) return <span className="text-white/60">-</span>;
    return (
        <span className="text-[11px] text-white/60 font-mono whitespace-nowrap">
            {parts.map((p, i) => (
                <span key={i}>
                    {i > 0 && <span className="text-white/20 mx-1">/</span>}
                    {p}
                </span>
            ))}
        </span>
    );
}

export function ArchiveTable({
    archives,
    selectedIds,
    allSelected,
    sort,
    onToggleSelect,
    onToggleAll,
    onRowClick,
    onRowDoubleClick,
    onCheckoutSingle,
    onReturnSingle,
    onEditSingle,
    onDeleteSingle,
    onSortChange,
    onCreateFromEmpty,
    className,
}: ArchiveTableProps) {
    const [menuOpen, setMenuOpen] = useState<number | null>(null);
    const [sorting, setSorting] = useState<SortingState>(() => {
        if (typeof sort !== 'string' || !sort) return [];
        const [col, dir] = sort.split(':');
        return [{ id: col, desc: dir === 'desc' }];
    });
    const tableContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (sorting.length === 0) { onSortChange(undefined); return; }
        const s = sorting[0];
        onSortChange(`${s.id}:${s.desc ? 'desc' : 'asc'}`);
    }, [sorting]);

    useEffect(() => {
        if (typeof sort !== 'string' || !sort) { setSorting([]); return; }
        const [col, dir] = sort.split(':');
        setSorting([{ id: col, desc: dir === 'desc' }]);
    }, [sort]);

    const columns = useMemo<ColumnDef<ArchiveRecordRow>[]>(() => [
        {
            id: 'select',
            header: () => (
                <input type="checkbox" checked={allSelected} onChange={onToggleAll}
                    className="size-3.5 accent-amber-500" aria-label="Select all" />
            ),
            cell: ({ row }) => (
                <input type="checkbox" checked={selectedIds.has(row.original.id)}
                    onChange={() => onToggleSelect(row.original.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="size-3.5 accent-amber-500" aria-label={`Select ${row.original.archiveNumber}`} />
            ),
            meta: { width: 36 },
            enableSorting: false,
        },
        {
            id: 'arcNumber',
            accessorKey: 'archiveNumber',
            header: () => <SortHeader label="ARC" sortKey="archive_number" sort={sort} onSortChange={onSortChange} />,
            cell: ({ row }) => (
                <span className="font-mono text-[12px] text-white whitespace-nowrap">{row.original.archiveNumber}</span>
            ),
            meta: { width: 128 },
        },
        {
            id: 'project',
            accessorKey: 'projectObject',
            header: () => <span className="text-[10px] uppercase tracking-wide text-white/50">Project</span>,
            cell: ({ row }) => (
                <span className="truncate text-white block">{row.original.projectObject}</span>
            ),
            enableSorting: false,
        },
        {
            id: 'city',
            accessorKey: 'city',
            header: () => <span className="text-[10px] uppercase tracking-wide text-white/50">City</span>,
            cell: ({ row }) => (
                row.original.city ? (
                    <span className="inline-flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-sm ring-1 ring-black/10"
                            style={{ backgroundColor: row.original.city.color }}
                            aria-label={row.original.city.name} />
                        <span className="text-xs text-white/60">{row.original.city.code}</span>
                    </span>
                ) : (
                    <span className="text-xs text-white/60">—</span>
                )
            ),
            meta: { width: 60 },
            enableSorting: false,
        },
        {
            id: 'location',
            accessorKey: 'locationLabel',
            header: () => <span className="text-[10px] uppercase tracking-wide text-white/50">Location</span>,
            cell: ({ row }) => <LocationBreadcrumbs record={row.original} />,
            meta: { width: 156 },
            enableSorting: false,
        },
        {
            id: 'status',
            accessorKey: 'status',
            header: () => <SortHeader label="Status" sortKey="status" sort={sort} onSortChange={onSortChange} />,
            cell: ({ row }) => (
                <StatusPill status={row.original.status} isOverdue={row.original.isOverdue} />
            ),
            meta: { width: 100 },
        },
        {
            id: 'requester',
            accessorKey: 'requestedBy',
            header: () => <span className="text-[10px] uppercase tracking-wide text-white/50">Requester</span>,
            cell: ({ row }) => (
                <span className="truncate text-white/70 block">{row.original.requestedBy || '-'}</span>
            ),
            meta: { width: 120 },
            enableSorting: false,
        },
        {
            id: 'dueAt',
            accessorKey: 'dueAt',
            header: () => <SortHeader label="Due" sortKey="due_at" sort={sort} onSortChange={onSortChange} />,
            cell: ({ row }) => (
                row.original.isOverdue ? (
                    <span className="inline-flex items-center gap-1 text-white/80 tabular-nums whitespace-nowrap"><IconAlertCircle size={11} className="text-red-400" />{row.original.dueAt}</span>
                ) : row.original.dueAt ? (
                    <span className="text-white/60 tabular-nums whitespace-nowrap">{row.original.dueAt}</span>
                ) : <span className="text-white/40">—</span>
            ),
            meta: { width: 108 },
        },
        {
            id: 'actions',
            header: () => null,
            cell: ({ row }) => (
                <div className="relative flex justify-end">
                    <div className="md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <AppTooltip label="More actions">
                            <button type="button" onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === row.original.id ? null : row.original.id); }}
                                className="flex size-7 items-center justify-center rounded text-white/40 hover:bg-white/5 hover:text-white/80" aria-label={`Actions for ${row.original.archiveNumber}`}>
                                <IconDots size={14} />
                            </button>
                        </AppTooltip>
                    </div>
                    {menuOpen === row.original.id ? (
                        <div className="absolute right-0 top-full z-20 min-w-32 rounded-lg border border-white/10 bg-zinc-900 py-1 shadow-sm"
                            onMouseLeave={() => setMenuOpen(null)} onClick={(e) => e.stopPropagation()}>
                            {onCheckoutSingle ? <button type="button" onClick={() => { setMenuOpen(null); onCheckoutSingle(row.original); }}
                                className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-white/80 hover:bg-white/5"><IconLogout size={12} /> Check out</button>
                            : null}
                            {onReturnSingle ? <button type="button" onClick={() => { setMenuOpen(null); onReturnSingle(row.original); }}
                                className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-white/80 hover:bg-white/5"><IconArrowBackUp size={12} /> Return</button>
                            : null}
                            {onEditSingle ? <button type="button" onClick={() => { setMenuOpen(null); onEditSingle(row.original); }}
                                className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-white/80 hover:bg-white/5"><IconPencil size={12} /> Edit</button>
                            : null}
                            {onDeleteSingle ? <button type="button" onClick={() => { setMenuOpen(null); onDeleteSingle(row.original); }}
                                className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-red-400 hover:bg-white/5"><IconTrash size={12} /> Delete</button>
                            : null}
                        </div>
                    ) : null}
                </div>
            ),
            meta: { width: 40 },
            enableSorting: false,
        },
    ], [selectedIds, allSelected, sort, menuOpen, onToggleSelect, onToggleAll, onSortChange]);

    const table = useReactTable({
        data: archives,
        columns,
        state: { sorting },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        enableSortingRemoval: true,
    });

    function handleRowClick(row: Row<ArchiveRecordRow>) {
        onRowClick(row.original);
     }

    function handleRowMetaClick(e: React.MouseEvent, row: Row<ArchiveRecordRow>) {
        if (e.metaKey || e.ctrlKey) {
            // window.open(`/archives/${row.original.id}`, '_blank');
            return;
        }
        handleRowClick(row);
    }

    if (archives.length === 0) {
        return (
            <div className="flex flex-1 items-center justify-center min-h-0">
                <AppEmptyState
                    title="No archives match these filters"
                    description="Try adjusting your search or filters."
                    actions={onCreateFromEmpty ? [{ label: 'Clear filters', onAction: () => onCreateFromEmpty() }] : undefined}
                />
            </div>
        );
    }

    return (
        <div className={cn('flex flex-1 flex-col min-h-0', className)}>
            <div ref={tableContainerRef} className="flex-1 overflow-auto">
                <table className="w-full">
                    <thead>         
                        {table.getHeaderGroups().map((hg) => (
                            <tr key={hg.id}>
                                {hg.headers.map((header) => (
                                    <th key={header.id}
                                        className="h-10 px-3 text-left whitespace-nowrap"
                                        style={{ width: (header.column.columnDef.meta as { width?: number })?.width ?? 'auto', minWidth: (header.column.columnDef.meta as { width?: number })?.width ?? 'auto' }}>
                                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {table.getRowModel().rows.map((row) => {
                            const checked = selectedIds.has(row.original.id);
                            return (
                                <tr key={row.id}
                                    className={cn(
                                        'group cursor-pointer transition border-b border-white/5 hover:bg-white/[0.02]',
                                        checked && 'bg-amber-500/[0.06] border-l-2 border-l-amber-500',
                                    )}
                                    onClick={(e) => handleRowMetaClick(e, row)}
                                    onDoubleClick={() => onRowDoubleClick(row.original)}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <td key={cell.id}
                                            className="h-11 px-3 text-[12px] leading-none"
                                            style={{ width: (cell.column.columnDef.meta as { width?: number })?.width ?? 'auto' }}
                                            onClick={cell.column.id === 'select' ? (e) => e.stopPropagation() : undefined}
                                        >
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
