import { ChevronLeft, ChevronRight } from 'lucide-react';

type AppPaginationProps = {
    page: number;
    pageSize: number;
    total: number;
    onChange: (page: number) => void;
    variant?: 'default' | 'reference';
};

export function AppPagination({ page, pageSize, total, onChange, variant = 'default' }: AppPaginationProps) {
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    if (total <= pageSize) {
        return null;
    }

    const start = (page - 1) * pageSize + 1;
    const end = Math.min(page * pageSize, total);

    if (variant === 'reference') {
        return (
            <div className="crm-reference-footer">
                <p>
                    Showing {start}-{end} of {total}
                </p>
                <div className="flex items-center justify-end gap-2">
                    <button
                        type="button"
                        className="crm-reference-button h-8 px-3"
                        disabled={page <= 1}
                        onClick={() => onChange(page - 1)}
                    >
                        <ChevronLeft size={13} />
                        Previous
                    </button>
                    <span className="rounded-md border border-[var(--crm-border)] bg-[var(--crm-surface-2)] px-2.5 py-1 text-[11px] font-semibold text-[var(--crm-text)]">
                        {page} / {totalPages}
                    </span>
                    <button
                        type="button"
                        className="crm-reference-button h-8 px-3"
                        disabled={page >= totalPages}
                        onClick={() => onChange(page + 1)}
                    >
                        Next
                        <ChevronRight size={13} />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3 border-t border-[var(--crm-border)] p-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-[var(--crm-text-muted)]">
                Page {page} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    className="crm-action-button h-8 px-3 text-xs"
                    disabled={page <= 1}
                    onClick={() => onChange(page - 1)}
                >
                    <ChevronLeft size={14} />
                    Previous
                </button>
                <button
                    type="button"
                    className="crm-action-button h-8 px-3 text-xs"
                    disabled={page >= totalPages}
                    onClick={() => onChange(page + 1)}
                >
                    Next
                    <ChevronRight size={14} />
                </button>
            </div>
        </div>
    );
}
