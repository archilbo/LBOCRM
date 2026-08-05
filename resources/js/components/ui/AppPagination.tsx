import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';


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

    return (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] px-4 py-3">
            <p className="text-xs text-[var(--text-muted)]">
                Affichage {start}-{end} sur {total}
            </p>
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    className="flex h-8 items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-xs font-medium text-[var(--text)] transition hover:bg-[var(--surface-2)] disabled:opacity-40"
                    disabled={page <= 1}
                    onClick={() => onChange(page - 1)}
                >
                    <IconChevronLeft size={13} />
                    Precedent
                </button>
                <span className="rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-2.5 py-1 text-[10px] font-semibold text-[var(--text)]">
                    {page} / {totalPages}
                </span>
                <button
                    type="button"
                    className="flex h-8 items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-xs font-medium text-[var(--text)] transition hover:bg-[var(--surface-2)] disabled:opacity-40"
                    disabled={page >= totalPages}
                    onClick={() => onChange(page + 1)}
                >
                    Suivant
                    <IconChevronRight size={13} />
                </button>
            </div>
        </div>
    );
}
