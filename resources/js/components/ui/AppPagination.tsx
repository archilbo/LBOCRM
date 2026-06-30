import { ChevronLeft, ChevronRight } from 'lucide-react';

type AppPaginationProps = {
    page: number;
    pageSize: number;
    total: number;
    onChange: (page: number) => void;
};

export function AppPagination({ page, pageSize, total, onChange }: AppPaginationProps) {
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    if (total <= pageSize) {
        return null;
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
