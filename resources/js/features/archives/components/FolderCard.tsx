import { router } from '@inertiajs/react';
import { cn } from '@/lib/cn';
import type { BoxContentsRecord } from '@/features/archives/types';

type FolderCardProps = {
    record: BoxContentsRecord;
    cityColor: string;
};

const STATUS_PILL: Record<string, string> = {
    ready_to_archive: 'border-slate-500/40 text-slate-400',
    stored: 'border-emerald-500/40 text-emerald-400',
    checked_out: 'border-amber-500/40 text-amber-400',
    returned: 'border-sky-500/40 text-sky-400',
    lost: 'border-red-500/40 text-red-400',
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
            className="flex w-full items-start gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-left transition hover:bg-white/[0.04] hover:border-white/10 cursor-pointer"
        >
            <div className="mt-0.5 shrink-0" style={{ width: 3, height: 32, borderRadius: 2, backgroundColor: cityColor }} />

            <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="font-mono text-[13px] font-medium text-white/90">{dn}</span>
                        <span className="text-[11px] text-white/40">{record.archiveNumber}</span>
                    </div>
                    <div className="mt-0.5 truncate text-[12px] text-white/50">
                        {record.projectObject || record.clientName}
                    </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                    {record.isOverdue && record.dueAt && (
                        <span className="text-[11px] text-red-400">Overdue</span>
                    )}
                    <span className={cn(
                        'rounded border px-1.5 py-[1px] text-[10px] font-medium uppercase leading-tight',
                        STATUS_PILL[record.status] || 'border-white/10 text-white/40',
                    )}>
                        {record.status === 'checked_out' ? 'OUT' : record.status === 'ready_to_archive' ? 'READY' : record.status}
                    </span>
                </div>
            </div>
        </button>
    );
}
