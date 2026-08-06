import { type ReactNode, useState } from 'react';
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    type ColumnDef,
    type SortingState,
} from '@tanstack/react-table';
import { Button, ScrollShadow } from '@heroui/react';
import { IconChevronDown, IconChevronLeft, IconChevronRight, IconArrowsSort, IconChevronUp, IconRefresh, IconAdjustmentsHorizontal } from '@tabler/icons-react';

import { AppEmptyState } from '@/components/ui/AppEmptyState';
import { AppSearchInput } from '@/components/ui/AppSearchInput';
import { cn } from '@/lib/cn';

type AppDataTableProps<TData extends object> = {
    data: TData[];
    columns: ColumnDef<TData, unknown>[];
    searchPlaceholder?: string;
    emptyTitle: string;
    emptyDescription: string;
    pageSize?: number;
    toolbarActions?: ReactNode;
    filterControls?: ReactNode;
    onRefresh?: () => void;
    onRowClick?: (row: TData) => void;
    compact?: boolean;
};

export function AppDataTable<TData extends object>({
    data,
    columns,
    searchPlaceholder,
    emptyTitle,
    emptyDescription,
    pageSize = 10,
    toolbarActions,
    filterControls,
    onRefresh,
    onRowClick,
    compact = false,
}: AppDataTableProps<TData>) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            globalFilter,
        },
        initialState: {
            pagination: {
                pageSize,
            },
        },
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    const filteredCount = table.getFilteredRowModel().rows.length;
    const pageIndex = table.getState().pagination.pageIndex;
    const pageCount = table.getPageCount();

    return (
        <div className="min-w-0 rounded-xl border border-[var(--border)] bg-[var(--surface)]">
            <div className={cn('flex flex-wrap items-center justify-between gap-3', compact ? 'px-3 py-2' : 'px-4 py-3')}>
                <div className="flex items-center gap-3 min-w-0 flex-1">
                    {searchPlaceholder ? (
                        <AppSearchInput
                            value={globalFilter}
                            onChange={setGlobalFilter}
                            placeholder={searchPlaceholder}
                            ariaLabel="Search"
                            maxWidth="max-w-full sm:max-w-[280px]"
                        />
                    ) : null}
                </div>

                <div className="flex items-center gap-2 ml-auto">
                    {onRefresh ? (
                        <button type="button" onClick={onRefresh} className="flex h-8 items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 text-xs font-medium text-[var(--text)] transition hover:bg-[var(--surface-2)]">
                            <IconRefresh size={13} />
                            Update
                        </button>
                    ) : null}
                    {filterControls ? (
                        <button type="button" onClick={() => setShowFilters((v) => !v)} className="flex h-8 items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 text-xs font-medium text-[var(--text)] transition hover:bg-[var(--surface-2)]">
                            <IconAdjustmentsHorizontal size={13} />
                            Filter
                        </button>
                    ) : null}
                    {toolbarActions}
                </div>
            </div>

            {filterControls && showFilters ? (
                <div className="border-b border-[var(--border)] px-4 py-3">
                    {filterControls}
                </div>
            ) : null}

            <ScrollShadow orientation="horizontal" className="w-full">
                <table className={cn('w-full', compact ? 'text-xs' : 'text-sm')}>
                    <thead>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id} className="border-b border-[var(--border)] bg-[var(--surface-2)]">
                                {headerGroup.headers.map((header) => {
                                    const sorted = header.column.getIsSorted();
                                    const meta = header.column.columnDef.meta as { hideOnMobile?: boolean; hideOnTablet?: boolean } | undefined;

                                    return (
                                        <th key={header.id} className={cn(
                                            'text-left text-xs font-medium capitalize text-[var(--text-muted)]',
                                            compact ? 'px-3 py-2' : 'px-4 py-3',
                                            meta?.hideOnMobile && 'hidden md:table-cell',
                                            meta?.hideOnTablet && 'hidden lg:table-cell'
                                        )}>
                                            {header.isPlaceholder ? null : (
                                                <button
                                                    type="button"
                                                    className="inline-flex items-center gap-1 transition hover:text-[var(--text)]"
                                                    onClick={header.column.getToggleSortingHandler()}
                                                >
                                                    {flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext(),
                                                    )}

                                                    {header.column.getCanSort() ? (
                                                        sorted === 'asc' ? (
                                                            <IconChevronUp size={11} className="text-[var(--accent)]" />
                                                        ) : sorted === 'desc' ? (
                                                            <IconChevronDown size={11} className="text-[var(--accent)]" />
                                                        ) : (
                                                            <IconArrowsSort size={11} className="text-[var(--text-muted)]" />
                                                        )
                                                    ) : null}
                                                </button>
                                            )}
                                        </th>
                                    );
                                })}
                            </tr>
                        ))}
                    </thead>

                    <tbody>
                        {table.getRowModel().rows.length > 0 ? (
                            table.getRowModel().rows.map((row) => (
                                <tr
                                    key={row.id}
                                    className={`border-b border-[var(--border)] transition last:border-0 ${onRowClick ? 'cursor-pointer hover:bg-[var(--surface-2)]' : ''}`}
                                    onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                                >
                                    {row.getVisibleCells().map((cell) => {
                                        const meta = cell.column.columnDef.meta as { hideOnMobile?: boolean; hideOnTablet?: boolean } | undefined;
                                        return (
                                            <td key={cell.id} className={cn(
                                                compact ? 'px-3 py-2' : 'px-4 py-3',
                                                meta?.hideOnMobile && 'hidden md:table-cell',
                                                meta?.hideOnTablet && 'hidden lg:table-cell'
                                            )}>
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext(),
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td className="p-8" colSpan={columns.length}>
                                    <AppEmptyState
                                        title={emptyTitle}
                                        description={emptyDescription}
                                    />
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </ScrollShadow>

            <div className={cn('flex items-center justify-end gap-3 border-t border-[var(--border)]', compact ? 'px-3 py-2' : 'px-4 py-3')}>
                <div className="flex items-center gap-1.5">
                    <button
                        type="button"
                        className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] transition hover:bg-[var(--surface-2)] disabled:opacity-40 disabled:cursor-not-allowed"
                        disabled={!table.getCanPreviousPage()}
                        onClick={() => table.previousPage()}
                        aria-label="Previous page"
                    >
                        <IconChevronLeft size={14} />
                    </button>

                    <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(pageCount, 5) }, (_, i) => {
                            let pageNum;
                            if (pageCount <= 5) {
                                pageNum = i + 1;
                            } else if (pageIndex < 3) {
                                pageNum = i + 1;
                            } else if (pageIndex >= pageCount - 3) {
                                pageNum = pageCount - 4 + i;
                            } else {
                                pageNum = pageIndex - 1 + i;
                            }

                            const isCurrentPage = pageNum === pageIndex + 1;
                            return (
                                <button
                                    key={pageNum}
                                    type="button"
                                    className={cn(
                                        'flex h-6 min-w-6 cursor-pointer items-center justify-center rounded-lg text-[10px] font-medium transition disabled:cursor-not-allowed',
                                        isCurrentPage
                                            ? 'bg-[var(--accent)] text-white'
                                            : 'border border-[var(--border)] bg-gray-800 text-white hover:bg-gray-700'
                                    )}
                                    onClick={() => table.setPageIndex(pageNum - 1)}
                                    aria-label={`Go to page ${pageNum}`}
                                    aria-current={isCurrentPage ? 'page' : undefined}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}
                    </div>

                    <button
                        type="button"
                        className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] transition hover:bg-[var(--surface-2)] disabled:opacity-40 disabled:cursor-not-allowed"
                        disabled={!table.getCanNextPage()}
                        onClick={() => table.nextPage()}
                        aria-label="Next page"
                    >
                        <IconChevronRight size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
}
