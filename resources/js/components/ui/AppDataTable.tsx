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
import { Button, Input, SearchField } from 'react-aria-components';
import {
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronsUpDown,
    ChevronUp,
    RefreshCw,
    Search,
    SlidersHorizontal,
    X,
} from 'lucide-react';
import { AppEmptyState } from '@/components/ui/AppEmptyState';

type AppDataTableProps<TData extends object> = {
    data: TData[];
    columns: ColumnDef<TData, unknown>[];
    searchPlaceholder: string;
    emptyTitle: string;
    emptyDescription: string;
    pageSize?: number;
    toolbarActions?: ReactNode;
    filterControls?: ReactNode;
    onRefresh?: () => void;
    onRowClick?: (row: TData) => void;
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
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <SearchField
                    aria-label="Search"
                    value={globalFilter}
                    onChange={setGlobalFilter}
                    className="relative w-full max-w-[280px]"
                >
                    <Search
                        size={14}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                    />
                    <Input
                        placeholder={searchPlaceholder}
                        className="h-9 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] pl-9 pr-8 text-sm text-[var(--text)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--accent)_18%,transparent)]"
                    />
                    {globalFilter ? (
                        <Button
                            className="absolute right-1 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-[var(--text-muted)] hover:bg-[var(--surface-2)]"
                            onPress={() => setGlobalFilter('')}
                        >
                            <X size={14} />
                        </Button>
                    ) : null}
                </SearchField>

                <div className="flex items-center gap-2">
                    {onRefresh ? (
                        <button type="button" onClick={onRefresh} className="flex h-8 items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 text-xs font-medium text-[var(--text)] transition hover:bg-[var(--surface-2)]">
                            <RefreshCw size={13} />
                            Update
                        </button>
                    ) : null}
                    {filterControls ? (
                        <button type="button" onClick={() => setShowFilters((v) => !v)} className="flex h-8 items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 text-xs font-medium text-[var(--text)] transition hover:bg-[var(--surface-2)]">
                            <SlidersHorizontal size={13} />
                            Filter
                        </button>
                    ) : null}
                    {toolbarActions}
                </div>

                <div className="hidden text-xs font-medium text-[var(--text-muted)] md:block">
                    {filteredCount} record(s)
                </div>
            </div>

            {filterControls && showFilters ? (
                <div className="border-b border-[var(--border)] px-4 py-3">
                    {filterControls}
                </div>
            ) : null}

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id} className="border-b border-[var(--border)] bg-[var(--surface-2)]">
                                {headerGroup.headers.map((header) => {
                                    const sorted = header.column.getIsSorted();

                                    return (
                                        <th key={header.id} className="px-4 py-3 text-left text-xs font-medium text-[var(--text-muted)]">
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
                                                            <ChevronUp size={11} className="text-[var(--accent)]" />
                                                        ) : sorted === 'desc' ? (
                                                            <ChevronDown size={11} className="text-[var(--accent)]" />
                                                        ) : (
                                                            <ChevronsUpDown size={11} className="text-[var(--text-muted)]" />
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
                                    {row.getVisibleCells().map((cell) => (
                                        <td key={cell.id} className="px-4 py-3">
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext(),
                                            )}
                                        </td>
                                    ))}
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
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] px-4 py-3">
                <p className="text-xs text-[var(--text-muted)]">
                    Page {pageIndex + 1} of {Math.max(pageCount, 1)}
                </p>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        className="flex h-8 items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-xs font-medium text-[var(--text)] transition hover:bg-[var(--surface-2)] disabled:opacity-40"
                        disabled={!table.getCanPreviousPage()}
                        onClick={() => table.previousPage()}
                    >
                        <ChevronLeft size={14} />
                        Previous
                    </button>

                    <button
                        type="button"
                        className="flex h-8 items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-xs font-medium text-[var(--text)] transition hover:bg-[var(--surface-2)] disabled:opacity-40"
                        disabled={!table.getCanNextPage()}
                        onClick={() => table.nextPage()}
                    >
                        Next
                        <ChevronRight size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
}
