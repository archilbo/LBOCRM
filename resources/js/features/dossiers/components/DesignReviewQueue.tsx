import { useState } from 'react';
import { Button, Card, Chip, Input, Spinner, Tooltip } from '@heroui/react';
import { ClipboardCheck, Eye, Play, Search } from 'lucide-react';
import { cn } from '@/lib/cn';
import { DesignReviewDecisionDialog } from './DesignReviewDecisionDialog';
import { DesignViewerTabs } from './DesignViewerTabs';
import { useReviews } from '@/features/project-design/hooks/useProjectDesignQueries';
import { useDecideReview, useStartReview } from '@/features/project-design/hooks/useProjectDesignMutations';
import { formatProjectDesignDate } from '@/features/project-design/utils/projectDesignFormatters';
import type { ProjectDesignReview, ProjectDesignVersion } from '@/features/project-design/types/projectDesign';

const STATUS_STYLES: Record<string, string> = {
    pending: 'bg-amber-500/10 text-amber-300',
    in_progress: 'bg-blue-500/10 text-blue-300',
    approved: 'bg-emerald-500/10 text-emerald-300',
    rejected: 'bg-red-500/10 text-red-300',
    changes_requested: 'bg-violet-500/10 text-violet-300',
};

export function DesignReviewQueue({ dossierId }: { dossierId: number }) {
    const [search, setSearch] = useState('');
    const [decisionOpen, setDecisionOpen] = useState(false);
    const [selectedReview, setSelectedReview] = useState<ProjectDesignReview | null>(null);
    const [previewVersion, setPreviewVersion] = useState<ProjectDesignVersion | null>(null);
    const { data, isLoading, error } = useReviews(dossierId);
    const startReview = useStartReview(dossierId);
    const decideReview = useDecideReview(dossierId);
    const reviews = data?.data ?? [];
    const filtered = search
        ? reviews.filter((review) => review.file?.name?.toLowerCase().includes(search.toLowerCase()))
        : reviews;

    if (isLoading) {
        return <div className="flex min-h-52 items-center justify-center"><Spinner size="sm" /></div>;
    }

    return (
        <div className="space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="relative min-w-0 flex-1">
                    <Search size={13} className="pointer-events-none absolute left-2.5 top-1/2 z-10 -translate-y-1/2 text-[var(--text-subtle)]" />
                    <Input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search reviews"
                        aria-label="Search reviews"
                        variant="secondary"
                        fullWidth
                        className="h-8 pl-8 text-[11px]"
                    />
                </div>
                <Chip size="sm" variant="soft" className="h-6 px-2 text-[9px]">{filtered.length} reviews</Chip>
            </div>

            {error ? (
                <Card variant="secondary" className="rounded-xl border border-red-500/25 bg-red-500/5">
                    <Card.Content className="flex items-center justify-between gap-3 p-3">
                        <p className="text-[10px] text-red-300">Failed to load the review queue.</p>
                        <Button size="sm" variant="ghost" onPress={() => window.location.reload()} className="h-7 text-[10px]">Retry</Button>
                    </Card.Content>
                </Card>
            ) : filtered.length === 0 ? (
                <Card variant="secondary" className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface-2)]/25">
                    <Card.Content className="flex min-h-52 flex-col items-center justify-center p-6 text-center">
                        <span className="flex size-10 items-center justify-center rounded-xl bg-[var(--surface-2)] text-[var(--text-muted)]"><ClipboardCheck size={17} /></span>
                        <p className="mt-2 text-[12px] font-medium text-[var(--foreground)]">Review queue is empty</p>
                        <p className="mt-1 text-[10px] text-[var(--text-muted)]">{search ? 'No reviews match your search.' : 'No designs are currently waiting for review.'}</p>
                    </Card.Content>
                </Card>
            ) : (
                <div className="space-y-1.5">
                    {filtered.map((review) => {
                        const previewAsset = review.version?.assets?.[0];
                        return (
                            <Card key={review.id} variant="secondary" className="rounded-xl border border-[var(--border)] bg-[var(--surface)]">
                                <Card.Content className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-1.5">
                                            <p className="min-w-0 truncate text-[11px] font-semibold text-[var(--foreground)]">{review.file?.name ?? 'Unknown file'}</p>
                                            <Chip size="sm" variant="soft" className={cn('h-4 px-1 text-[8px] capitalize', STATUS_STYLES[review.status] ?? '')}>{review.status.replace(/_/g, ' ')}</Chip>
                                        </div>
                                        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[9px] text-[var(--text-muted)]">
                                            {review.file?.discipline ? <span className="capitalize">{review.file.discipline}</span> : null}
                                            {review.version ? <span>v{review.version.versionNumber}</span> : null}
                                            {review.requestedBy ? <span>by {review.requestedBy.name}</span> : null}
                                            {review.dueAt ? <span>Due {formatProjectDesignDate(review.dueAt)}</span> : null}
                                        </div>
                                    </div>

                                    <div className="flex shrink-0 items-center gap-1.5">
                                        {previewAsset?.previewUrl && review.version ? (
                                            <Tooltip delay={350}>
                                                <Tooltip.Trigger>
                                                    <Button
                                                        isIconOnly
                                                        size="sm"
                                                        variant="ghost"
                                                        onPress={() => setPreviewVersion(review.version)}
                                                        className="h-8 w-8 min-w-0"
                                                        aria-label={`Preview ${review.file?.name ?? 'design'}`}
                                                    >
                                                        <Eye size={13} />
                                                    </Button>
                                                </Tooltip.Trigger>
                                                <Tooltip.Content>Preview revision</Tooltip.Content>
                                            </Tooltip>
                                        ) : null}
                                        {review.status === 'pending' ? (
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                onPress={() => startReview.mutate({ versionId: review.versionId, reviewId: review.id })}
                                                isPending={startReview.isPending}
                                                className="h-8 text-[10px]"
                                            >
                                                <Play size={12} />
                                                Start
                                            </Button>
                                        ) : null}
                                        {review.status === 'in_progress' ? (
                                            <Button
                                                size="sm"
                                                variant="primary"
                                                onPress={() => {
                                                    setSelectedReview(review);
                                                    setDecisionOpen(true);
                                                }}
                                                className="h-8 text-[10px]"
                                            >
                                                <ClipboardCheck size={12} />
                                                Decide
                                            </Button>
                                        ) : null}
                                    </div>
                                </Card.Content>
                            </Card>
                        );
                    })}
                </div>
            )}

            <DesignReviewDecisionDialog
                isOpen={decisionOpen}
                onOpenChange={(open) => {
                    setDecisionOpen(open);
                    if (!open) setSelectedReview(null);
                }}
                onSubmit={async (decision, note) => {
                    if (!selectedReview) return;
                    await decideReview.mutateAsync({
                        versionId: selectedReview.versionId,
                        reviewId: selectedReview.id,
                        decision,
                        note,
                    });
                    setDecisionOpen(false);
                    setSelectedReview(null);
                }}
            />

            {previewVersion?.assets?.length ? (
                <Card variant="secondary" className="overflow-hidden rounded-xl border border-[var(--border)] bg-[#101214]">
                    <Card.Header className="flex items-center justify-between border-b border-[var(--border)] px-3 py-2">
                        <Card.Title className="text-[10px] font-medium text-[var(--foreground)]">{previewVersion.label}</Card.Title>
                        <Button size="sm" variant="ghost" onPress={() => setPreviewVersion(null)} className="h-7 text-[9px]">Close preview</Button>
                    </Card.Header>
                    <Card.Content className="h-[min(68vh,720px)] p-0">
                        <DesignViewerTabs assets={previewVersion.assets} dossierId={dossierId} versionId={previewVersion.id} />
                    </Card.Content>
                </Card>
            ) : null}
        </div>
    );
}
