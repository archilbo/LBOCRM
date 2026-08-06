import { router } from '@inertiajs/react';
import { cn } from '@/lib/cn';
import type { BoxContentsRecord } from '@/features/archives/types';

type FolderCardProps = {
    record: BoxContentsRecord;
    cityColor: string;
};

const STATUS_PILL: Record<string, string> = {
    ready_to_archive: 'border-[var(--crm-text-soft)]/40 text-[var(--crm-text-soft)]',
    stored: 'border-[var(--crm-success)]/40 text-[var(--crm-success)]',
    checked_out: 'border-[var(--crm-gold)]/40 text-[var(--crm-gold)]',
    returned: 'border-[var(--crm-info)]/40 text-[var(--crm-info)]',
    lost: 'border-[var(--crm-danger)]/40 text-[var(--crm-danger)]',
};

export function FolderCard({ record, cityColor }: FolderCardProps) {
    const dn = (record.dossierNumber || '').split('-')[0];

    function handleClick() {
        if (record.dossierId) {
            router.visit(`/dossiers/${record.dossierId}`);
        }
    }

    return (
        <button
            type="button"
            onClick={handleClick}
            className="flex w-full items-start gap-3 rounded-lg border border-[var(--crm-border-soft)] bg-[var(--crm-elevated)]/60 px-3 py-2.5 text-left transition hover:bg-[var(--crm-elevated)] hover:border-[var(--crm-border)] cursor-pointer"
        >
            <div className="mt-0.5 shrink-0" style={{ width: 3, height: 32, borderRadius: 2, backgroundColor: cityColor }} />

            <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="text-[12px] font-medium text-[var(--crm-text)]/90">{dn}</span>
                        <span className="text-[10px] text-[var(--crm-text-soft)]">{record.archiveNumber}</span>
                    </div>
                    <div className="mt-0.5 truncate text-[11px] text-[var(--crm-text-muted)]">
                        {record.projectObject || record.clientName}
                    </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                    {record.isOverdue && record.dueAt && (
                        <span className="text-[10px] text-[var(--crm-danger)]">Overdue</span>
                    )}
                    <span className={cn(
                        'rounded border px-1.5 py-[1px] text-[9px] font-medium uppercase leading-tight',
                        STATUS_PILL[record.status] || 'border-[var(--crm-border)] text-[var(--crm-text-soft)]',
                    )}>
                        {record.status === 'checked_out' ? 'OUT' : record.status === 'ready_to_archive' ? 'READY' : record.status}
                    </span>
                </div>
            </div>
        </button>
    );
}
