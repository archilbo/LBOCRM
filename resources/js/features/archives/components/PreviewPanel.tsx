import { AlertCircle, ExternalLink } from 'lucide-react';
import type { ArchiveRecordRow } from '@/features/archives/types';
import { StatusPill } from '@/components/ui/StatusPill';
import { router } from '@inertiajs/react';

type PreviewPanelProps = {
    record: ArchiveRecordRow | null;
};

export function PreviewPanel({ record }: PreviewPanelProps) {
    if (!record) {
        return (
            <div className="flex h-32 items-center justify-center">
                <p className="text-sm text-white/50">Select an archive to preview</p>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-white/5">
                <div className="flex items-center gap-3 min-w-0">
                    <span className="font-mono text-xs text-white/50 shrink-0">{record.archiveNumber}</span>
                    <h3 className="text-sm font-semibold text-white truncate">{record.projectObject}</h3>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <button type="button" onClick={() => router.visit(`/archives/${record.id}`)}
                        className="flex items-center gap-1 rounded-md border border-white/10 px-2 py-1 text-[11px] font-medium text-white/70 hover:text-white hover:bg-white/5 transition">
                        <ExternalLink size={11} /> Open
                    </button>
                    {record.isOverdue ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-red-400">
                            <AlertCircle size={11} /> Overdue
                        </span>
                    ) : null}
                    <StatusPill status={record.status} isOverdue={record.isOverdue} />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 px-4 py-2.5 text-xs">
                <div className="flex items-center gap-2">
                    <span className="text-white/50 w-14 shrink-0">Dossier</span>
                    <span className="text-white font-mono truncate">{record.dossierNumber || '-'}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-white/50 w-14 shrink-0">Client</span>
                    <span className="text-white truncate">{record.clientName || '-'}</span>
                </div>
                {record.city ? (
                    <div className="flex items-center gap-2">
                        <span className="text-white/50 w-14 shrink-0">City</span>
                        <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium"
                            style={{ backgroundColor: `${record.city.color}20`, color: record.city.color }}>
                            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: record.city.color }} />
                            {record.city.name}
                        </span>
                    </div>
                ) : null}
                <div className="flex items-center gap-2">
                    <span className="text-white/50 w-14 shrink-0">Location</span>
                    <span className="text-white font-mono truncate">
                        {[record.room, record.box].filter(Boolean).join(' / ') || '-'}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-white/50 w-14 shrink-0">Requester</span>
                    <span className="text-white truncate">{record.requestedBy || '-'}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-white/50 w-14 shrink-0">In / Out</span>
                    <span className="text-white">
                        {record.inDate || '-'} {record.outDate ? `/ ${record.outDate}` : ''}
                    </span>
                </div>
                {record.dueAt ? (
                    <div className="flex items-center gap-2">
                        <span className="text-white/50 w-14 shrink-0">Due</span>
                        <span className={record.isOverdue ? 'text-red-400' : 'text-white'}>
                            {record.dueAt}
                        </span>
                    </div>
                ) : null}
            </div>

            {record.notes ? (
                <div className="mx-4 mb-2.5 rounded-md bg-white/[0.03] px-3 py-1.5 text-xs text-white/60 leading-relaxed">
                    {record.notes}
                </div>
            ) : null}
        </div>
    );
}
