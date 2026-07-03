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
        <div className="crm-reference-table-shell min-w-0">
            <div className="crm-reference-toolbar">
                <SearchField
                    aria-label="Search"
                    value={globalFilter}
                    onChange={setGlobalFilter}
                    className="crm-reference-search"
                >
                    <Search
                        size={14}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--crm-text-soft)]"
                    />
                    <Input
                        placeholder={searchPlaceholder}
                    />
                    {globalFilter ? (
                        <Button
                            className="absolute right-2 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-[var(--crm-text-soft)] hover:bg-[var(--crm-surface-2)]"
                            onPress={() => setGlobalFilter('')}
                        >
                            <X size={14} />
                        </Button>
                    ) : null}
                </SearchField>

                <div className="crm-reference-toolbar-actions">
                    {onRefresh ? (
                        <Button className="crm-reference-button" onPress={onRefresh}>
                            <RefreshCw size={13} />
                            Update
                        </Button>
                    ) : null}
                    {filterControls ? (
                        <Button className="crm-reference-button" onPress={() => setShowFilters((v) => !v)}>
                            <SlidersHorizontal size={13} />
                            Filter
                        </Button>
                    ) : null}
                    {toolbarActions}
                </div>

                <div className="hidden text-xs font-semibold text-[var(--crm-text-muted)] md:block">
                    {filteredCount} record(s)
                </div>
            </div>

            {filterControls && showFilters ? (
                <div className="border-b border-[var(--crm-border)] px-4 py-3">
                    {filterControls}
                </div>
            ) : null}

            <div className="crm-reference-table-card">
                <div className="crm-reference-table-scroll">
                <table className="crm-reference-table">
                    <thead>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    const sorted = header.column.getIsSorted();

                                    return (
                                        <th key={header.id}>
                                            {header.isPlaceholder ? null : (
                                                <button
                                                    type="button"
                                                    className="crm-reference-header-cell"
                                                    onClick={header.column.getToggleSortingHandler()}
                                                >
                                                    {flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext(),
                                                    )}

                                                    {header.column.getCanSort() ? (
                                                        sorted === 'asc' ? (
                                                            <ChevronUp className="crm-reference-header-sort" size={11} />
                                                        ) : sorted === 'desc' ? (
                                                            <ChevronDown className="crm-reference-header-sort" size={11} />
                                                        ) : (
                                                            <ChevronsUpDown className="crm-reference-header-sort" size={11} />
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
                                    className={onRowClick ? 'cursor-pointer' : ''}
                                    onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <td key={cell.id}>
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

            <div className="crm-reference-footer">
                <p>
                    Page {pageIndex + 1} of {Math.max(pageCount, 1)}
                </p>

                <div className="flex items-center gap-2">
                    <Button
                        className="crm-reference-button h-8 px-3"
                        isDisabled={!table.getCanPreviousPage()}
                        onPress={() => table.previousPage()}
                    >
                        <ChevronLeft size={14} />
                        Previous
                    </Button>

                    <Button
                        className="crm-reference-button h-8 px-3"
                        isDisabled={!table.getCanNextPage()}
                        onPress={() => table.nextPage()}
                    >
                        Next
                        <ChevronRight size={14} />
                    </Button>
                </div>
            </div>
            </div>
        </div>
    );
}
