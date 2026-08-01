import { Upload, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/cn';
import { useGlobalUploads } from './useGlobalUploads';
import { UploadItemRow } from './UploadItemRow';
import { formatBytes, formatPercent } from './uploadFormatters';

export function GlobalUploadDock() {
    const { batches, isDockVisible, minimized, toggleMinimized, dockBadge, pauseFile, resumeFile, retryFile, cancelBatch } = useGlobalUploads();
    const [openCenter, setOpenCenter] = useState(false);

    if (!isDockVisible) return null;

    const activeBatches = batches.filter(b =>
        b.overallStatus === 'uploading' || b.overallStatus === 'processing' || b.overallStatus === 'needs_attention'
    );
    const totalBytes = batches.reduce((s, b) => s + b.totalBytes, 0);
    const transferred = batches.reduce((s, b) => s + b.transferredBytes, 0);

    return (
        <>
            <div className="fixed bottom-4 right-4 z-50 flex w-[360px] flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-lg">
                <button
                    onClick={toggleMinimized}
                    className="flex items-center gap-3 px-4 py-3 text-left hover:bg-[var(--surface-2)]"
                    aria-label={minimized ? 'Expand upload progress' : 'Collapse upload progress'}
                >
                    <div className="flex size-8 items-center justify-center rounded-lg bg-[var(--accent)]/10 text-[var(--accent)]">
                        <Upload size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-[var(--foreground)]">
                                {dockBadge.active > 0
                                    ? `Uploading ${dockBadge.active} file${dockBadge.active > 1 ? 's' : ''}`
                                    : batches.some(b => b.overallStatus === 'processing')
                                        ? 'Processing...'
                                        : 'Uploads'}
                            </span>
                            {dockBadge.active > 0 && (
                                <span className="text-xs text-[var(--text-muted)] tabular-nums">{dockBadge.pct}%</span>
                            )}
                        </div>
                        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[var(--border)]">
                            <div className="h-full rounded-full bg-[var(--accent)] transition-all" style={{ width: `${dockBadge.pct}%` }} />
                        </div>
                        <div className="mt-0.5 text-[9px] text-[var(--text-muted)]">
                            {formatBytes(transferred)} of {formatBytes(totalBytes)}
                        </div>
                    </div>
                    <button
                        onClick={(e) => { e.stopPropagation(); setOpenCenter(p => !p); }}
                        className="rounded-lg px-2 py-1 text-[10px] font-medium text-[var(--accent)] hover:bg-[var(--accent)]/10"
                        aria-label="Open upload center"
                    >
                        <ExternalLink size={14} />
                    </button>
                    {minimized ? <ChevronUp size={16} className="text-[var(--text-muted)]" /> : <ChevronDown size={16} className="text-[var(--text-muted)]" />}
                </button>

                {!minimized && (
                    <div className="max-h-[40vh] overflow-y-auto border-t border-[var(--border)] p-2 space-y-2">
                        {activeBatches.length === 0 ? (
                            <p className="py-4 text-center text-xs text-[var(--text-muted)]">No active uploads</p>
                        ) : (
                            activeBatches.map(batch =>
                                batch.files
                                    .filter(f => f.transferStatus !== 'queued' || batch.overallStatus === 'uploading')
                                    .map(file => (
                                        <UploadItemRow
                                            key={file.clientFileUploadId}
                                            file={file}
                                            isUploading={batch.overallStatus === 'uploading'}
                                            batchOverallStatus={batch.overallStatus}
                                            onPause={() => pauseFile(batch.batchId, file.clientFileUploadId)}
                                            onResume={() => resumeFile(batch.batchId, file.clientFileUploadId)}
                                            onRetry={() => retryFile(batch.batchId, file.clientFileUploadId)}
                                            onCancel={() => cancelBatch(batch.dossierId, batch.batchId)}
                                        />
                                    ))
                            )
                        )}
                    </div>
                )}
            </div>

            {openCenter && (
                <div className="fixed inset-0 z-40 bg-black/30" onClick={() => setOpenCenter(false)} />
            )}
        </>
    );
}
