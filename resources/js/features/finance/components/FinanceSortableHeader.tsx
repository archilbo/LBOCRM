import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import type { ReactNode } from 'react';

export type FinanceSortDirection = 'asc' | 'desc';

type Props = {
    column: string;
    label: ReactNode;
    sort?: string;
    direction?: FinanceSortDirection;
    onSort: (column: string) => void;
    align?: 'left' | 'right';
    className?: string;
};

export function FinanceSortableHeader({
    column,
    label,
    sort,
    direction = 'desc',
    onSort,
    align = 'left',
    className = '',
}: Props) {
    const active = sort === column;
    const Icon = active ? (direction === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown;

    return (
        <th
            className={`px-3 py-2 ${align === 'right' ? 'text-right' : 'text-left'} ${className}`}
            aria-sort={active ? (direction === 'asc' ? 'ascending' : 'descending') : 'none'}
        >
            <button
                type="button"
                onClick={() => onSort(column)}
                className={`inline-flex items-center gap-1.5 rounded px-1 py-0.5 transition hover:bg-[var(--surface-2)] hover:text-[var(--text)] ${
                    align === 'right' ? 'ml-auto' : ''
                } ${active ? 'text-[var(--accent)]' : 'text-inherit'}`}
            >
                {label}
                <Icon size={11} aria-hidden="true" />
            </button>
        </th>
    );
}

export function nextFinanceSortDirection(
    currentColumn: string | undefined,
    currentDirection: FinanceSortDirection | undefined,
    nextColumn: string,
): FinanceSortDirection {
    return currentColumn === nextColumn && currentDirection === 'asc' ? 'desc' : 'asc';
}
