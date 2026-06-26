import { useState } from 'react';
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
import { ChevronDown, ChevronLeft, ChevronRight, ChevronsUpDown, ChevronUp, Search, X } from 'lucide-react';
import { AppEmptyState } from '@/components/ui/AppEmptyState';

type AppDataTableProps<TData extends object> = {
    data: TData[];
    columns: ColumnDef<TData, unknown>[];
    searchPlaceholder: string;
    emptyTitle: string;
    emptyDescription: string;
    pageSize?: number;
};

export function AppDataTable<TData extends object>({
    data,
    columns,
    searchPlaceholder,
    emptyTitle,
    emptyDescription,
    pageSize = 10,
}: AppDataTableProps<TData>) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [globalFilter, setGlobalFilter] = useState('');

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
        <div className="app-surface min-w-0 overflow-hidden">
            <div className="flex flex-col gap-3 border-b p-3 sm:flex-row sm:items-center sm:justify-between">
                <SearchField
                    aria-label="Search"
                    value={globalFilter}
                    onChange={setGlobalFilter}
                    className="relative w-full sm:max-w-md"
                >
                    <Search
                        size={16}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                    />
                    <Input
                        className="react-aria-Input h-9 pl-9 pr-9"
                        placeholder={searchPlaceholder}
                    />
                    {globalFilter ? (
                        <Button
                            className="absolute right-2 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-[var(--text-muted)] hover:bg-[var(--surface-2)]"
                            onPress={() => setGlobalFilter('')}
                        >
                            <X size={14} />
                        </Button>
                    ) : null}
                </SearchField>

                <div className="flex shrink-0 items-center justify-between gap-3 text-xs text-[var(--text-muted)] sm:justify-end">
                    <span>{filteredCount}</span>
                </div>
            </div>

            <div className="app-scrollbar min-w-0 overflow-x-auto">
                <table className="react-aria-Table app-table-nowrap min-w-[920px]">
                    <thead>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    const sorted = header.column.getIsSorted();

                                    return (
                                        <th key={header.id} className="react-aria-Column">
                                            {header.isPlaceholder ? null : (
                                                <button
                                                    type="button"
                                                    className="inline-flex items-center gap-1 whitespace-nowrap text-left"
                                                    onClick={header.column.getToggleSortingHandler()}
                                                >
                                                    {flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext(),
                                                    )}

                                                    {header.column.getCanSort() ? (
                                                        sorted === 'asc' ? (
                                                            <ChevronUp size={12} />
                                                        ) : sorted === 'desc' ? (
                                                            <ChevronDown size={12} />
                                                        ) : (
                                                            <ChevronsUpDown size={12} />
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
                                <tr key={row.id} className="react-aria-Row">
                                    {row.getVisibleCells().map((cell) => (
                                        <td key={cell.id} className="react-aria-Cell">
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

            <div className="flex flex-col gap-3 border-t p-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-[var(--text-muted)]">
                    Page {pageIndex + 1} of {Math.max(pageCount, 1)}
                </p>

                <div className="flex items-center gap-2">
                    <Button
                        className="react-aria-Button h-8 px-3 text-xs"
                        isDisabled={!table.getCanPreviousPage()}
                        onPress={() => table.previousPage()}
                    >
                        <ChevronLeft size={14} />
                        Previous
                    </Button>

                    <Button
                        className="react-aria-Button h-8 px-3 text-xs"
                        isDisabled={!table.getCanNextPage()}
                        onPress={() => table.nextPage()}
                    >
                        Next
                        <ChevronRight size={14} />
                    </Button>
                </div>
            </div>
        </div>
    );
}
