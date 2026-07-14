import { AlertCircle, ExternalLink } from 'lucide-react';
import type { ArchiveRecordRow } from '@/features/archives/types';
import { archiveVisualStatus } from '@/config/statuses';
import { StatusPill } from '@/components/ui/StatusPill';
import { cn } from '@/lib/cn';
import { router } from '@inertiajs/react';

type PreviewPanelProps = {
    record: ArchiveRecordRow | null;
};

export function PreviewPanel({ record }: PreviewPanelProps) {
    if (!record) {
        return (
            <div className="flex h-40 items-center justify-center">
                <p className="text-[13px] text-white/50">Select an archive to preview</p>
            </div>
        );
    }

    return (
        <div>
            <div className="border-b border-white/5 px-4 py-3">
                <div className="flex items-center justify-between">
                    <div className="font-mono text-[13px] text-white/70">{record.archiveNumber}</div>
                    <StatusPill status={record.status} isOverdue={record.isOverdue} />
                </div>
                <div className="mt-1 truncate text-base font-semibold text-white">{record.projectObject}</div>
            </div>

            {record.isOverdue ? (
                <div className="mx-4 mt-3 flex items-center gap-1.5 rounded-md border border-red-500/20 bg-red-500/10 px-2 py-1.5 text-xs text-red-400">
                    <AlertCircle size={12} /> Overdue since {record.dueAt}
                </div>
            ) : null}

            <dl className="grid grid-cols-[80px_1fr] gap-x-3 gap-y-2 px-4 py-3 text-[13px]">
                <dt className="text-white/50">Dossier</dt>
                <dd className="text-white">{record.dossierNumber || '-'}</dd>
                <dt className="text-white/50">Client</dt>
                <dd className="text-white">{record.clientName || '-'}</dd>
                <dt className="text-white/50">Location</dt>
                <dd className="text-white font-mono">{record.locationLabel || '-'}</dd>
                <dt className="text-white/50">Requester</dt>
                <dd className="text-white">{record.requestedBy || '-'}</dd>
                {record.dueAt ? (
                    <>
                        <dt className="text-white/50">Due</dt>
                        <dd className={cn('tabular-nums', record.isOverdue ? 'text-red-400' : 'text-white')}>{record.dueAt}</dd>
                    </>
                ) : null}
                <dt className="text-white/50">In / Out</dt>
                <dd className="text-white">{record.inDate || '-'} / {record.outDate || '-'}</dd>
            </dl>

            {record.notes ? (
                <div className="mx-4 mb-3 rounded-md bg-white/[0.03] px-3 py-2 text-[13px] text-white/70 leading-relaxed">
                    {record.notes}
                </div>
            ) : null}

            <div className="border-t border-white/5 p-3">
                <button
                    type="button"
                    onClick={() => router.visit(`/archives/${record.id}`)}
                    className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-white/10 py-2 text-[13px] font-medium text-white transition hover:bg-white/[0.04]"
                >
                    <ExternalLink size={14} /> Open
                </button>
            </div>
        </div>
    );
}
