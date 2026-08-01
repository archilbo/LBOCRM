import { Upload, X } from 'lucide-react';
import { AppDrawer } from '@/components/ui/AppDrawer';
import { useGlobalUploads } from './useGlobalUploads';
import { UploadItemRow } from './UploadItemRow';
import { formatBytes, formatPercent } from './uploadFormatters';

interface GlobalUploadCenterDrawerProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export function GlobalUploadCenterDrawer({ isOpen, onOpenChange }: GlobalUploadCenterDrawerProps) {
    const { batches, pauseFile, resumeFile, retryFile, cancelBatch, removeCompleted } = useGlobalUploads();

    const active = batches.filter(b => b.overallStatus === 'uploading' || b.overallStatus === 'queued');
    const processing = batches.filter(b => b.overallStatus === 'processing');
    const needsAttention = batches.filter(b => b.overallStatus === 'needs_attention' || b.overallStatus === 'failed');
    const completed = batches.filter(b => b.overallStatus === 'completed');

    return (
        <AppDrawer isOpen={isOpen} onOpenChange={onOpenChange} title="Uploads" description="Manage your file uploads across all projects">
            <div className="space-y-6">
                {needsAttention.length > 0 && (
                    <Section title="Needs attention" count={needsAttention.length}>
                        {needsAttention.map(batch => batch.files.filter(f => f.transferStatus === 'failed').map(file => (
                            <div key={file.clientFileUploadId} className="space-y-1">
                                <p className="text-xs text-[var(--text-muted)]">{batch.dossierName && `${batch.dossierName} · `}{batch.operation}</p>
                                <UploadItemRow
                                    file={file}
                                    isUploading={false}
                                    batchOverallStatus={batch.overallStatus}
                                    onPause={() => {}}
                                    onResume={() => {}}
                                    onRetry={() => retryFile(batch.batchId, file.clientFileUploadId)}
                                    onCancel={() => cancelBatch(batch.dossierId, batch.batchId)}
                                />
                            </div>
                        )))}
                    </Section>
                )}

                {active.length > 0 && (
                    <Section title="Active" count={active.reduce((s, b) => s + b.files.filter(f => f.transferStatus === 'uploading').length, 0)}>
                        {active.map(batch => batch.files.filter(f => f.transferStatus === 'uploading' || f.transferStatus === 'paused' || f.transferStatus === 'queued').map(file => (
                            <div key={file.clientFileUploadId} className="space-y-1">
                                <p className="text-xs text-[var(--text-muted)]">{batch.dossierName && `${batch.dossierName} · `}{batch.operation}</p>
                                <UploadItemRow
                                    file={file}
                                    isUploading={batch.overallStatus === 'uploading'}
                                    batchOverallStatus={batch.overallStatus}
                                    onPause={() => pauseFile(batch.batchId, file.clientFileUploadId)}
                                    onResume={() => resumeFile(batch.batchId, file.clientFileUploadId)}
                                    onRetry={() => retryFile(batch.batchId, file.clientFileUploadId)}
                                    onCancel={() => cancelBatch(batch.dossierId, batch.batchId)}
                                />
                            </div>
                        )))}
                    </Section>
                )}

                {processing.length > 0 && (
                    <Section title="Processing" count={processing.length}>
                        {processing.map(batch => batch.files.map(file => (
                            <div key={file.clientFileUploadId} className="space-y-1">
                                <p className="text-xs text-[var(--text-muted)]">{batch.dossierName && `${batch.dossierName} · `}Processing {batch.processingProgress}%</p>
                                <UploadItemRow
                                    file={file}
                                    isUploading={false}
                                    batchOverallStatus={batch.overallStatus}
                                    onPause={() => {}}
                                    onResume={() => {}}
                                    onRetry={() => {}}
                                    onCancel={() => cancelBatch(batch.dossierId, batch.batchId)}
                                />
                            </div>
                        )))}
                    </Section>
                )}

                {completed.length > 0 && (
                    <Section title="Completed" count={completed.length}>
                        {completed.map(batch => batch.files.map(file => (
                            <div key={file.clientFileUploadId} className="space-y-1">
                                <p className="text-xs text-[var(--text-muted)]">{batch.dossierName && `${batch.dossierName} · `}Completed</p>
                                <UploadItemRow
                                    file={file}
                                    isUploading={false}
                                    batchOverallStatus={batch.overallStatus}
                                    onPause={() => {}}
                                    onResume={() => {}}
                                    onRetry={() => {}}
                                    onCancel={() => removeCompleted(batch.batchId)}
                                />
                            </div>
                        )))}
                    </Section>
                )}

                {batches.length === 0 && (
                    <div className="flex flex-col items-center gap-2 py-12 text-center">
                        <Upload size={32} className="text-[var(--text-muted)]" />
                        <p className="text-sm text-[var(--text-muted)]">No uploads yet</p>
                    </div>
                )}
            </div>
        </AppDrawer>
    );
}

function Section({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
    return (
        <div>
            <div className="mb-2 flex items-center gap-2">
                <h3 className="text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">{title}</h3>
                <span className="rounded-full bg-[var(--surface-2)] px-2 py-0.5 text-[9px] text-[var(--text-muted)]">{count}</span>
            </div>
            <div className="space-y-3">{children}</div>
        </div>
    );
}
