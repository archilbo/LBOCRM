import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type AppWorkspaceTableColumn<T> = {
    id: string;
    label: ReactNode;
    render: (row: T) => ReactNode;
    headerClassName?: string;
    cellClassName?: string;
};

type AppWorkspaceTableProps<T> = {
    ariaLabel: string;
    children?: ReactNode;
    columns?: AppWorkspaceTableColumn<T>[];
    data?: T[];
    emptyContent?: ReactNode;
    footer?: ReactNode;
    minTableWidthClassName?: string;
    onRowPress?: (row: T) => void;
    renderMobileRow?: (row: T) => ReactNode;
    rowKey?: (row: T) => string | number;
    toolbar: ReactNode;
};

/**
 * Shared CRM list shell. Pages retain their domain-specific data, filters,
 * actions, and mobile summaries while this component owns the table pattern.
 */
export function AppWorkspaceTable<T>({
    ariaLabel,
    columns,
    children,
    data,
    emptyContent,
    footer,
    minTableWidthClassName = 'min-w-[800px]',
    onRowPress,
    renderMobileRow,
    rowKey,
    toolbar,
}: AppWorkspaceTableProps<T>) {
    if (children) {
        return (
            <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
                <div className="border-b border-[var(--border)]">{toolbar}</div>
                {children}
                {footer ? <div className="border-t border-[var(--border)]">{footer}</div> : null}
            </div>
        );
    }

    const resolvedColumns = columns ?? [];
    const resolvedData = data ?? [];
    const resolvedRowKey = rowKey ?? (() => 'row');
    const desktopHiddenClassName = renderMobileRow ? 'hidden md:block' : '';

    return (
        <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
            <div className="border-b border-[var(--border)]">{toolbar}</div>

            <div className={cn('overflow-x-auto', desktopHiddenClassName)}>
                <table aria-label={ariaLabel} className={cn('w-full text-xs', minTableWidthClassName)}>
                    <thead>
                        <tr className="border-b border-[var(--border)] text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                            {resolvedColumns.map((column) => (
                                <th key={column.id} className={cn('px-3 py-2', column.headerClassName)}>
                                    {column.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {resolvedData.length > 0 ? resolvedData.map((row) => (
                            <tr
                                key={resolvedRowKey(row)}
                                className={cn(
                                    'border-b border-[var(--border)] transition last:border-0',
                                    onRowPress ? 'cursor-pointer hover:bg-[var(--surface-2)]' : '',
                                )}
                                onClick={() => onRowPress?.(row)}
                            >
                                {resolvedColumns.map((column) => (
                                    <td key={column.id} className={cn('px-3 py-2', column.cellClassName)}>
                                        {column.render(row)}
                                    </td>
                                ))}
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={resolvedColumns.length} className="px-3 py-8 text-center text-xs text-[var(--text-muted)]">
                                    {emptyContent}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {renderMobileRow ? (
                <div className="block divide-y divide-[var(--border)] md:hidden">
                    {resolvedData.length > 0 ? resolvedData.map((row) => renderMobileRow(row)) : (
                        <div className="p-6">{emptyContent}</div>
                    )}
                </div>
            ) : null}

            {footer ? <div className="border-t border-[var(--border)]">{footer}</div> : null}
        </div>
    );
}
