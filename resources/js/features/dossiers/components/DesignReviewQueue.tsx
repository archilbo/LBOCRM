import { useState } from 'react';
import { Eye, Play, ClipboardCheck, Search, Loader2 } from 'lucide-react';
import { cn } from '@/lib/cn';
import { AppEmptyState } from '@/components/ui/AppEmptyState';
import { AppButton } from '@/components/ui/AppButton';
import { DesignReviewDecisionDialog } from './DesignReviewDecisionDialog';
import { DesignFileViewer } from './DesignFileViewer';
import { useReviews } from '@/features/project-design/hooks/useProjectDesignQueries';
import { useStartReview, useDecideReview } from '@/features/project-design/hooks/useProjectDesignMutations';
import { formatProjectDesignDate } from '@/features/project-design/utils/projectDesignFormatters';
import type { ProjectDesignReview } from '@/features/project-design/types/projectDesign';

const STATUS_STYLES: Record<string, string> = {
    pending: 'bg-amber-400/10 text-amber-400',
    in_progress: 'bg-blue-400/10 text-blue-400',
    approved: 'bg-emerald-400/10 text-emerald-400',
    rejected: 'bg-red-400/10 text-red-400',
    changes_requested: 'bg-purple-400/10 text-purple-400',
};

export function DesignReviewQueue({ dossierId }: { dossierId: number }) {
    const [search, setSearch] = useState('');
    const [decisionOpen, setDecisionOpen] = useState(false);
    const [selectedReview, setSelectedReview] = useState<ProjectDesignReview | null>(null);
    const [previewVersion, setPreviewVersion] = useState<ProjectDesignReview['version'] | null>(null);

    const { data, isLoading, error } = useReviews(dossierId);
    const startReview = useStartReview(dossierId);
    const decideReview = useDecideReview(dossierId);

    const reviews = data?.data ?? [];

    const filtered = search
        ? reviews.filter((r) => r.file?.name?.toLowerCase().includes(search.toLowerCase()))
        : reviews;

    if (isLoading) {
        return <div className="flex items-center justify-center py-12 text-[13px] text-[var(--text-muted)]"><Loader2 size={16} className="animate-spin mr-2" /> Loading review queue...</div>;
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-xs">
                    <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search reviews..."
                        className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] py-1.5 pl-8 pr-3 text-[12px] outline-none transition focus:border-[var(--accent)]" aria-label="Search reviews" />
                </div>
                <span className="text-[11px] text-[var(--text-muted)]">{filtered.length} review(s)</span>
            </div>

            {error ? (
                <div className="rounded-lg border border-red-400/30 bg-red-400/10 px-3 py-2 text-[12px] text-red-400">Failed to load reviews. <button type="button" className="underline" onClick={() => window.location.reload()}>Retry</button></div>
            ) : filtered.length === 0 ? (
                <AppEmptyState icon={<ClipboardCheck size={15} />} title="Review Queue" description={search ? 'No reviews match your search.' : 'No designs are currently pending review.'} />
            ) : (
                <div className="space-y-1.5">
                    {filtered.map((review) => {
                        const previewAsset = review.version?.assets?.[0];
                        return (
                            <div key={review.id} className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5">
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                        <p className="truncate text-[12.5px] font-medium text-[var(--foreground)]">{review.file?.name ?? 'Unknown file'}</p>
                                        <span className={cn('shrink-0 rounded px-1.5 py-0.5 text-[9px] font-semibold leading-none', STATUS_STYLES[review.status] ?? '')}>
                                            {review.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[10.5px] text-[var(--text-muted)]">
                                        {review.file?.discipline && <span className="capitalize">{review.file.discipline}</span>}
                                        {review.version && <span>v{review.version.versionNumber}</span>}
                                        {review.requestedBy && <span>by {review.requestedBy.name}</span>}
                                        {review.dueAt && <span>Due {formatProjectDesignDate(review.dueAt)}</span>}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                    {previewAsset?.previewUrl && (
                                        <button type="button" onClick={() => setPreviewVersion(review.version)} title="Preview"
                                            className="flex size-7 items-center justify-center rounded-md text-[var(--text-muted)] hover:bg-[var(--accent)]/10 hover:text-[var(--accent)]">
                                            <Eye size={13} />
                                        </button>
                                    )}
                                    {review.status === 'pending' && (
                                        <AppButton size="sm" className="h-7 text-[10px]" onPress={() => startReview.mutate({ versionId: review.versionId, reviewId: review.id })}>
                                            <Play size={11} /> Start
                                        </AppButton>
                                    )}
                                    {review.status === 'in_progress' && (
                                        <AppButton size="sm" className="h-7 text-[10px]" onPress={() => { setSelectedReview(review); setDecisionOpen(true); }}>
                                            <ClipboardCheck size={11} /> Decide
                                        </AppButton>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <DesignReviewDecisionDialog
                isOpen={decisionOpen}
                onOpenChange={setDecisionOpen}
                onSubmit={async (decision, note) => {
                    if (!selectedReview) return;
                    await decideReview.mutateAsync({ versionId: selectedReview.versionId, reviewId: selectedReview.id, decision, note });
                    setDecisionOpen(false);
                    setSelectedReview(null);
                }}
            />
            {previewVersion && (() => {
                const asset = previewVersion.assets?.[0];
                return (
                    <DesignFileViewer
                        previewUrl={asset?.previewUrl ?? ''}
                        downloadUrl={asset?.downloadUrl ?? ''}
                        mimeType={asset?.mimeType ?? 'application/octet-stream'}
                        filename={asset?.originalFilename ?? previewVersion.label}
                        isOpen={!!previewVersion}
                        onClose={() => setPreviewVersion(null)}
                        versionId={previewVersion.id}
                        dossierId={dossierId}
                    />
                );
            })()}
        </div>
    );
}
