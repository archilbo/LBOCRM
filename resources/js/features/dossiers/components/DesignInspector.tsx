import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Button, Card, Chip, Input, Tabs, Tooltip } from '@heroui/react';
import {
    Activity,
    CalendarClock,
    CheckCircle2,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    CircleDot,
    Clock,
    Download,
    ExternalLink,
    FileText,
    Focus,
    GitBranch,
    HardDrive,
    Info,
    MessageSquareText,
    Package,
    RotateCcw,
    Shield,
    User,
    UserRoundCheck,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { formatDate, formatFileSize } from '@/lib/formatters';
import {
    isProjectDesignRemarkOpen,
    getProjectDesignRemarkWorkflowAction,
    matchesProjectDesignRemarkFilter,
    PROJECT_DESIGN_REMARK_FILTERS,
    type ProjectDesignRemarkFilter,
} from '@/features/project-design/config/remarkWorkflow';
import type {
    ProjectDesignActivity,
    ProjectDesignAsset,
    ProjectDesignFile,
    ProjectDesignRemark,
    ProjectDesignRemarkUpdate,
    ProjectDesignVersion,
} from '@/features/project-design/types/projectDesign';

export type DesignInspectorTab = 'details' | 'remarks' | 'versions' | 'activity';

type DesignInspectorProps = {
    file: ProjectDesignFile | null;
    versions: ProjectDesignVersion[];
    assets: ProjectDesignAsset[];
    activeAsset: ProjectDesignAsset | null;
    remarks: ProjectDesignRemark[] | null;
    activities: ProjectDesignActivity[] | null;
    activeTab?: DesignInspectorTab;
    onTabChange?: (tab: DesignInspectorTab) => void;
    onOpenReviewAsset?: (asset: ProjectDesignAsset) => void;
    onSwitchVersion?: (versionId: number) => void;
    activeRemarkId?: number | null;
    onRemarkFocus?: (remark: ProjectDesignRemark) => void;
    currentUserId?: number;
    remarkCapabilities?: RemarkCapabilities;
    onRemarkUpdate?: (remark: ProjectDesignRemark, changes: ProjectDesignRemarkUpdate) => Promise<void>;
};

type RemarkCapabilities = {
    assign: boolean;
    address: boolean;
    verify: boolean;
    reopen: boolean;
};

const TABS: { id: DesignInspectorTab; label: string; icon: typeof Info }[] = [
    { id: 'details', label: 'Details', icon: Info },
    { id: 'remarks', label: 'Remarks', icon: MessageSquareText },
    { id: 'versions', label: 'Versions', icon: GitBranch },
    { id: 'activity', label: 'Activity', icon: Activity },
];

const STATUS_TONES: Record<string, string> = {
    approved: 'bg-emerald-500/10 text-emerald-300',
    resolved: 'bg-emerald-500/10 text-emerald-300',
    clean: 'bg-emerald-500/10 text-emerald-300',
    rejected: 'bg-red-500/10 text-red-300',
    failed: 'bg-red-500/10 text-red-300',
    critical: 'bg-red-500/10 text-red-300',
    major: 'bg-orange-500/10 text-orange-300',
    pending: 'bg-amber-500/10 text-amber-300',
    open: 'bg-amber-500/10 text-amber-300',
    in_progress: 'bg-blue-500/10 text-blue-300',
    assigned: 'bg-blue-500/10 text-blue-300',
    minor: 'bg-yellow-500/10 text-yellow-300',
    cosmetic: 'bg-violet-500/10 text-violet-300',
    question: 'bg-cyan-500/10 text-cyan-300',
};

function StatusBadge({ value }: { value: string | null | undefined }) {
    const normalized = value?.toLowerCase() || 'pending';
    return (
        <Chip
            size="sm"
            variant="soft"
            className={cn(
                'h-4 px-1 text-[8px] font-semibold capitalize',
                STATUS_TONES[normalized] ?? 'bg-[var(--surface-2)] text-[var(--text-muted)]',
            )}
        >
            {normalized.replace(/_/g, ' ')}
        </Chip>
    );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
    return (
        <Card variant="secondary" className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
            <Card.Header className="border-b border-[var(--border)] bg-[var(--surface-2)]/45 px-3 py-2">
                <Card.Title className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                    {title}
                </Card.Title>
            </Card.Header>
            <Card.Content className="divide-y divide-[var(--border)]/65 px-3 py-0">
                {children}
            </Card.Content>
        </Card>
    );
}

function DetailRow({ icon, label, value }: { icon: ReactNode; label: string; value: ReactNode }) {
    return (
        <div className="grid grid-cols-[18px_82px_minmax(0,1fr)] items-start gap-2 py-2.5">
            <span className="mt-0.5 text-[var(--text-subtle)]">{icon}</span>
            <span className="text-[9px] font-medium text-[var(--text-muted)]">{label}</span>
            <span className="min-w-0 break-words text-right text-[9px] text-[var(--foreground)]">{value}</span>
        </div>
    );
}

function EmptyInspectorState({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
    return (
        <Card variant="secondary" className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-2)]/20">
            <Card.Content className="flex min-h-44 flex-col items-center justify-center px-4 py-8 text-center">
                <span className="flex size-9 items-center justify-center rounded-xl bg-[var(--surface-2)] text-[var(--text-muted)]">{icon}</span>
                <p className="mt-2 text-[10px] font-medium text-[var(--foreground)]">{title}</p>
                <p className="mt-1 max-w-[220px] text-[9px] leading-4 text-[var(--text-muted)]">{description}</p>
            </Card.Content>
        </Card>
    );
}

export function DesignInspector({
    file,
    versions,
    assets,
    activeAsset,
    remarks,
    activities,
    activeTab,
    onTabChange,
    onOpenReviewAsset,
    onSwitchVersion,
    activeRemarkId,
    onRemarkFocus,
    currentUserId,
    remarkCapabilities,
    onRemarkUpdate,
}: DesignInspectorProps) {
    const [internalTab, setInternalTab] = useState<DesignInspectorTab>('details');
    const tab = activeTab ?? internalTab;

    const selectTab = (next: DesignInspectorTab) => {
        if (activeTab == null) setInternalTab(next);
        onTabChange?.(next);
    };

    return (
        <Tabs
            selectedKey={tab}
            onSelectionChange={(key) => selectTab(String(key) as DesignInspectorTab)}
            variant="secondary"
            className="flex h-full min-h-0 flex-col bg-[var(--surface)]"
        >
            <Tabs.ListContainer className="shrink-0 border-b border-[var(--border)] px-2 pt-1.5">
                <Tabs.List aria-label="Design inspector" className="min-w-max">
                    {TABS.map(({ id, label, icon: Icon }) => (
                        <Tabs.Tab
                            key={id}
                            id={id}
                            className="h-8 gap-1.5 px-2.5 text-[9px] font-medium text-[var(--text-muted)] aria-selected:text-[var(--accent)]"
                        >
                            <Icon size={11} />
                            {label}
                            <Tabs.Indicator />
                        </Tabs.Tab>
                    ))}
                </Tabs.List>
            </Tabs.ListContainer>

            <Tabs.Panel id="details" className="app-scrollbar min-h-0 flex-1 overflow-y-auto p-2.5 outline-none">
                <DetailsPanel file={file} versions={versions} assets={assets} activeAsset={activeAsset} onOpenReviewAsset={onOpenReviewAsset} />
            </Tabs.Panel>
            <Tabs.Panel id="remarks" className="app-scrollbar min-h-0 flex-1 overflow-y-auto p-2.5 outline-none">
                <RemarksPanel
                    remarks={remarks}
                    activeRemarkId={activeRemarkId}
                    onRemarkFocus={onRemarkFocus}
                    currentUserId={currentUserId}
                    capabilities={remarkCapabilities}
                    onUpdate={onRemarkUpdate}
                />
            </Tabs.Panel>
            <Tabs.Panel id="versions" className="app-scrollbar min-h-0 flex-1 overflow-y-auto p-2.5 outline-none">
                <VersionsPanel
                    versions={versions}
                    currentVersionId={activeAsset ? versions.find((version) => version.assets.some((asset) => asset.id === activeAsset.id))?.id : file?.currentVersionId}
                    onSwitchVersion={onSwitchVersion}
                />
            </Tabs.Panel>
            <Tabs.Panel id="activity" className="app-scrollbar min-h-0 flex-1 overflow-y-auto p-2.5 outline-none">
                <ActivityPanel activities={activities} />
            </Tabs.Panel>
        </Tabs>
    );
}

function DetailsPanel({
    file,
    versions,
    assets,
    activeAsset,
    onOpenReviewAsset,
}: {
    file: ProjectDesignFile | null;
    versions: ProjectDesignVersion[];
    assets: ProjectDesignAsset[];
    activeAsset: ProjectDesignAsset | null;
    onOpenReviewAsset?: (asset: ProjectDesignAsset) => void;
}) {
    const activeVersion = activeAsset
        ? versions.find((version) => version.assets.some((asset) => asset.id === activeAsset.id)) ?? file?.latestVersion ?? null
        : file?.latestVersion ?? null;

    return (
        <div className="space-y-2.5">
            {file ? (
                <Section title="Design file">
                    <DetailRow icon={<FileText size={11} />} label="Name" value={file.name} />
                    {file.code ? <DetailRow icon={<Info size={11} />} label="Code" value={file.code} /> : null}
                    {file.discipline ? <DetailRow icon={<HardDrive size={11} />} label="Discipline" value={file.discipline} /> : null}
                    {file.category ? <DetailRow icon={<Package size={11} />} label="Category" value={file.category} /> : null}
                    {file.responsibleUser ? <DetailRow icon={<User size={11} />} label="Responsible" value={file.responsibleUser.name} /> : null}
                    {file.reviewer ? <DetailRow icon={<User size={11} />} label="Reviewer" value={file.reviewer.name} /> : null}
                </Section>
            ) : null}

            {activeVersion ? (
                <Section title="Version">
                    <DetailRow icon={<GitBranch size={11} />} label="Revision" value={activeVersion.label} />
                    <DetailRow icon={<Shield size={11} />} label="Status" value={<StatusBadge value={activeVersion.status} />} />
                    {activeVersion.revisionCode ? <DetailRow icon={<Info size={11} />} label="Code" value={activeVersion.revisionCode} /> : null}
                    {activeVersion.uploadedBy ? <DetailRow icon={<User size={11} />} label="Uploaded by" value={activeVersion.uploadedBy.name} /> : null}
                    {activeVersion.createdAt ? <DetailRow icon={<Clock size={11} />} label="Created" value={formatDate(activeVersion.createdAt)} /> : null}
                </Section>
            ) : null}

            {activeAsset ? (
                <Section title="Active asset">
                    <DetailRow icon={<FileText size={11} />} label="Filename" value={activeAsset.originalFilename} />
                    <DetailRow icon={<HardDrive size={11} />} label="Format" value={activeAsset.extension.toUpperCase()} />
                    <DetailRow icon={<HardDrive size={11} />} label="Size" value={formatFileSize(activeAsset.sizeBytes)} />
                    <DetailRow icon={<Shield size={11} />} label="Scan" value={<StatusBadge value={activeAsset.scanStatus} />} />
                    {activeAsset.formatCapability?.application ? <DetailRow icon={<Package size={11} />} label="Application" value={activeAsset.formatCapability.application} /> : null}
                    {activeAsset.downloadUrl ? (
                        <div className="py-2.5">
                            <Button
                                size="sm"
                                variant="secondary"
                                fullWidth
                                onPress={() => window.open(activeAsset.downloadUrl ?? '', '_blank', 'noopener,noreferrer')}
                                className="h-8 text-[9px]"
                            >
                                <Download size={11} />
                                Download asset
                            </Button>
                        </div>
                    ) : null}
                </Section>
            ) : null}

            {assets.length ? (
                <Section title={`Assets · ${assets.length}`}>
                    {assets.map((asset) => (
                        <div key={asset.id} className="flex items-center gap-2 py-2.5">
                            <span className={cn('size-1.5 shrink-0 rounded-full', asset.id === activeAsset?.id ? 'bg-[var(--accent)]' : 'bg-[var(--text-subtle)]')} />
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-[9px] font-medium text-[var(--foreground)]">{asset.originalFilename}</p>
                                <p className="mt-0.5 text-[8px] uppercase tracking-wide text-[var(--text-muted)]">{asset.extension} · {formatFileSize(asset.sizeBytes)}</p>
                            </div>
                            {asset.previewUrl && onOpenReviewAsset ? (
                                <Tooltip delay={350}>
                                    <Tooltip.Trigger>
                                        <Button
                                            isIconOnly
                                            size="sm"
                                            variant="ghost"
                                            onPress={() => onOpenReviewAsset(asset)}
                                            className="h-7 w-7 min-w-0 text-[var(--text-muted)]"
                                            aria-label={`Open ${asset.originalFilename}`}
                                        >
                                            <ExternalLink size={11} />
                                        </Button>
                                    </Tooltip.Trigger>
                                    <Tooltip.Content>Open asset</Tooltip.Content>
                                </Tooltip>
                            ) : null}
                        </div>
                    ))}
                </Section>
            ) : null}
        </div>
    );
}

function RemarksPanel({
    remarks,
    activeRemarkId,
    onRemarkFocus,
    currentUserId,
    capabilities,
    onUpdate,
}: {
    remarks: ProjectDesignRemark[] | null;
    activeRemarkId?: number | null;
    onRemarkFocus?: (remark: ProjectDesignRemark) => void;
    currentUserId?: number;
    capabilities?: RemarkCapabilities;
    onUpdate?: (remark: ProjectDesignRemark, changes: ProjectDesignRemarkUpdate) => Promise<void>;
}) {
    const [expanded, setExpanded] = useState<Set<number>>(() => new Set());
    const [filter, setFilter] = useState<ProjectDesignRemarkFilter>('all');
    const remarkList = remarks ?? [];

    const visibleRemarks = useMemo(
        () => remarkList.filter((remark) => matchesProjectDesignRemarkFilter(remark.status, filter)),
        [filter, remarkList],
    );
    const openRemarks = useMemo(
        () => remarkList.filter((remark) => isProjectDesignRemarkOpen(remark.status) && remark.annotationId != null),
        [remarkList],
    );

    if (!remarkList.length) {
        return <EmptyInspectorState icon={<MessageSquareText size={16} />} title="No remarks" description="Remarks for this revision will appear here." />;
    }

    const openCount = openRemarks.length;
    const resolvedCount = remarkList.length - openCount;
    const activeOpenIndex = openRemarks.findIndex((remark) => remark.id === activeRemarkId);

    const toggleExpanded = (id: number) => {
        setExpanded((current) => {
            const next = new Set(current);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const focusRelativeOpenRemark = (direction: -1 | 1) => {
        if (!openRemarks.length) return;

        const nextIndex = activeOpenIndex < 0
            ? (direction > 0 ? 0 : openRemarks.length - 1)
            : (activeOpenIndex + direction + openRemarks.length) % openRemarks.length;

        onRemarkFocus?.(openRemarks[nextIndex]);
    };

    return (
        <section className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
            <div className="flex h-11 items-center justify-between gap-3 border-b border-[var(--border)] px-3">
                <div className="flex min-w-0 items-center gap-2">
                    <MessageSquareText size={14} className="shrink-0 text-[var(--accent)]" />
                    <span className="text-[11px] font-semibold text-[var(--foreground)]">Remarks</span>
                    <span className="text-[9px] text-[var(--text-muted)]">{remarkList.length} total</span>
                </div>
                <div className="flex shrink-0 items-center gap-2 text-[9px] tabular-nums">
                    <span className="inline-flex items-center gap-1 text-amber-300"><CircleDot size={10} /> {openCount}</span>
                    <span className="inline-flex items-center gap-1 text-emerald-300"><CheckCircle2 size={10} /> {resolvedCount}</span>
                    <span className="ml-1 flex items-center gap-0.5 border-l border-[var(--border)] pl-1.5">
                        <Button
                            isIconOnly
                            size="sm"
                            variant="ghost"
                            onPress={() => focusRelativeOpenRemark(-1)}
                            isDisabled={!openRemarks.length}
                            className="size-6 min-w-0 rounded-md"
                            aria-label="Previous open remark"
                        >
                            <ChevronLeft size={13} />
                        </Button>
                        <Button
                            isIconOnly
                            size="sm"
                            variant="ghost"
                            onPress={() => focusRelativeOpenRemark(1)}
                            isDisabled={!openRemarks.length}
                            className="size-6 min-w-0 rounded-md"
                            aria-label="Next open remark"
                        >
                            <ChevronRight size={13} />
                        </Button>
                    </span>
                </div>
            </div>

            <div className="app-scrollbar flex gap-1 overflow-x-auto border-b border-[var(--border)] px-2 py-1.5">
                {PROJECT_DESIGN_REMARK_FILTERS.map((item) => (
                    <Button
                        key={item.id}
                        size="sm"
                        variant="ghost"
                        onPress={() => setFilter(item.id)}
                        aria-pressed={filter === item.id}
                        className={cn(
                            'h-7 min-w-0 shrink-0 rounded-md px-2.5 text-[9px]',
                            filter === item.id
                                ? 'bg-[var(--accent)]/12 text-[var(--accent)]'
                                : 'text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]',
                        )}
                    >
                        {item.label}
                    </Button>
                ))}
            </div>

            <div className="divide-y divide-[var(--border)]/70">
                {visibleRemarks.map((remark) => {
                    const isExpanded = expanded.has(remark.id);
                    const isSelected = activeRemarkId === remark.id;
                    const owner = remark.assignedTo ?? remark.createdBy;
                    const isResolved = ['resolved', 'closed'].includes(remark.status.toLowerCase());
                    const initials = owner?.name
                        .split(/\s+/)
                        .filter(Boolean)
                        .slice(0, 2)
                        .map((part) => part[0])
                        .join('')
                        .toUpperCase() ?? '?';
                    const canExpand = Boolean(remark.description || remark.file || remark.dueDate);

                    return (
                        <article
                            key={remark.id}
                            className={cn(
                                'relative transition-colors',
                                isSelected ? 'bg-[var(--accent)]/8' : 'hover:bg-[var(--surface-2)]/38',
                            )}
                        >
                            <span className={cn(
                                'absolute inset-y-0 left-0 w-0.5',
                                isResolved ? 'bg-emerald-400/70' : isSelected ? 'bg-[var(--accent)]' : 'bg-amber-400/70',
                            )} />
                            <div className="flex items-center gap-1 px-2.5 py-2.5 pl-3.5">
                                <Button
                                    variant="ghost"
                                    fullWidth
                                    onPress={() => onRemarkFocus?.(remark)}
                                    className="h-auto min-h-0 flex-1 justify-start rounded-lg px-1 py-0.5 text-left"
                                    aria-label={`Focus remark ${remark.title}`}
                                >
                                    <span className="flex min-w-0 flex-1 items-center gap-2.5">
                                        <span className={cn(
                                            'flex size-7 shrink-0 items-center justify-center rounded-full text-[9px] font-semibold',
                                            isResolved ? 'bg-emerald-500/12 text-emerald-300' : 'bg-[var(--surface-2)] text-[var(--text-muted)]',
                                        )}>
                                            {initials}
                                        </span>
                                        <span className="min-w-0 flex-1">
                                            <span className="flex items-center gap-1.5">
                                                <span className="min-w-0 flex-1 truncate text-[11px] font-semibold text-[var(--foreground)]">{remark.title}</span>
                                                <StatusBadge value={remark.severity} />
                                            </span>
                                            <span className="mt-1 flex min-w-0 items-center gap-1.5 text-[9px] text-[var(--text-muted)]">
                                                <span className="truncate">{owner?.name ?? 'Unassigned'}</span>
                                                <span className="text-[var(--text-subtle)]">/</span>
                                                <StatusBadge value={remark.status} />
                                            </span>
                                        </span>
                                    </span>
                                    <Focus size={13} className={cn('shrink-0', isSelected ? 'text-[var(--accent)]' : 'text-[var(--text-subtle)]')} />
                                </Button>
                                {canExpand ? (
                                    <Button
                                        isIconOnly
                                        size="sm"
                                        variant="ghost"
                                        onPress={() => toggleExpanded(remark.id)}
                                        className="size-7 shrink-0 rounded-md text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]"
                                        aria-label={isExpanded ? `Collapse remark ${remark.title}` : `Expand remark ${remark.title}`}
                                        aria-expanded={isExpanded}
                                    >
                                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                    </Button>
                                ) : null}
                            </div>

                            {isExpanded ? (
                                <div className="border-t border-[var(--border)]/60 bg-[var(--surface-2)]/20 px-3.5 py-3 pl-[4.75rem]">
                                    {remark.description ? (
                                        <p className="text-[10px] leading-5 text-[var(--text-muted)]">{remark.description}</p>
                                    ) : (
                                        <p className="text-[10px] italic text-[var(--text-subtle)]">No description was added.</p>
                                    )}
                                    <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[9px] text-[var(--text-muted)]">
                                        <span className="inline-flex min-w-0 items-center gap-1.5">
                                            <FileText size={11} className="shrink-0 text-[var(--text-subtle)]" />
                                            <span className="truncate">{remark.file?.name ?? 'Current drawing'}{remark.versionNumber ? ` / v${remark.versionNumber}` : ''}</span>
                                        </span>
                                        {remark.pageNumber ? (
                                            <span className="inline-flex items-center gap-1.5 text-[var(--accent)]">
                                                <CircleDot size={11} /> Page {remark.pageNumber}
                                            </span>
                                        ) : null}
                                        {remark.dueDate ? (
                                            <span className="inline-flex items-center gap-1.5 text-amber-300">
                                                <CalendarClock size={11} /> Due {formatDate(remark.dueDate)}
                                            </span>
                                        ) : null}
                                    </div>
                                    <RemarkWorkflowActions
                                        remark={remark}
                                        currentUserId={currentUserId}
                                        capabilities={capabilities}
                                        onUpdate={onUpdate}
                                    />
                                </div>
                            ) : null}
                        </article>
                    );
                })}
                {!visibleRemarks.length ? (
                    <div className="px-4 py-10 text-center">
                        <p className="text-[11px] font-medium text-[var(--foreground)]">No matching remarks</p>
                        <p className="mt-1 text-[9px] text-[var(--text-muted)]">Choose another filter to continue reviewing this version.</p>
                    </div>
                ) : null}
            </div>
        </section>
    );
}

function RemarkWorkflowActions({
    remark,
    currentUserId,
    capabilities,
    onUpdate,
}: {
    remark: ProjectDesignRemark;
    currentUserId?: number;
    capabilities?: RemarkCapabilities;
    onUpdate?: (remark: ProjectDesignRemark, changes: ProjectDesignRemarkUpdate) => Promise<void>;
}) {
    const [isSaving, setIsSaving] = useState(false);
    const [dueDate, setDueDate] = useState(remark.dueDate ?? '');
    const workflowAction = getProjectDesignRemarkWorkflowAction(remark.status);
    const assignedToCurrentUser = remark.assignedTo?.id === currentUserId;
    const canAssign = Boolean(capabilities?.assign && onUpdate && currentUserId);
    const canAdvance = Boolean(workflowAction && onUpdate && (
        (workflowAction.status === 'in_progress' || workflowAction.status === 'addressed') && capabilities?.address
        || (workflowAction.status === 'verified' || workflowAction.status === 'resolved') && capabilities?.verify
        || workflowAction.status === 'reopened' && capabilities?.reopen
    ));

    useEffect(() => {
        setDueDate(remark.dueDate ?? '');
    }, [remark.dueDate]);

    if (!canAssign && !canAdvance) return null;

    const save = async (changes: ProjectDesignRemarkUpdate) => {
        if (!onUpdate) return;
        setIsSaving(true);
        try {
            await onUpdate(remark, changes);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="mt-3 border-t border-[var(--border)]/60 pt-2.5">
            <div className="flex flex-wrap items-center gap-1.5">
                {canAssign && !assignedToCurrentUser ? (
                    <Button
                        size="sm"
                        variant="secondary"
                        onPress={() => void save({ assigned_to: currentUserId })}
                        isDisabled={isSaving}
                        className="h-7 min-w-0 rounded-md px-2 text-[9px]"
                    >
                        <UserRoundCheck size={12} />
                        Assign to me
                    </Button>
                ) : null}
                {workflowAction && canAdvance ? (
                    <Button
                        size="sm"
                        variant="secondary"
                        onPress={() => void save({ status: workflowAction.status })}
                        isDisabled={isSaving}
                        className="h-7 min-w-0 rounded-md px-2 text-[9px]"
                    >
                        {workflowAction.status === 'reopened' ? <RotateCcw size={12} /> : <CheckCircle2 size={12} />}
                        {workflowAction.label}
                    </Button>
                ) : null}
                {canAssign ? (
                    <Input
                        type="date"
                        aria-label={`Due date for ${remark.title}`}
                        value={dueDate}
                        onChange={(event) => setDueDate(event.target.value)}
                        onBlur={() => {
                            if (dueDate !== (remark.dueDate ?? '')) void save({ due_date: dueDate || null });
                        }}
                        disabled={isSaving}
                        variant="secondary"
                        className="h-7 min-w-0 max-w-[142px] text-[9px]"
                    />
                ) : null}
            </div>
        </div>
    );
}
function VersionsPanel({
    versions,
    currentVersionId,
    onSwitchVersion,
}: {
    versions: ProjectDesignVersion[];
    currentVersionId?: number | null;
    onSwitchVersion?: (versionId: number) => void;
}) {
    const [comparisonVersionId, setComparisonVersionId] = useState<number | null>(null);

    if (!versions.length) {
        return <EmptyInspectorState icon={<GitBranch size={16} />} title="No versions" description="Uploaded revisions will appear here." />;
    }

    const currentVersion = versions.find((version) => version.id === currentVersionId) ?? versions[0];
    const comparisonVersion = versions.find((version) => version.id === comparisonVersionId) ?? null;

    return (
        <div className="space-y-1.5">
            {comparisonVersion && comparisonVersion.id !== currentVersion.id ? (
                <Card variant="secondary" className="overflow-hidden rounded-xl border border-[var(--accent)]/30 bg-[var(--accent)]/5">
                    <Card.Header className="flex items-center justify-between gap-2 border-b border-[var(--accent)]/20 px-3 py-2.5">
                        <div className="min-w-0">
                            <Card.Title className="text-[9px] font-semibold text-[var(--foreground)]">Revision comparison</Card.Title>
                            <p className="mt-0.5 text-[9px] text-[var(--text-muted)]">{comparisonVersion.label} to {currentVersion.label}</p>
                        </div>
                        <Button isIconOnly size="sm" variant="ghost" onPress={() => setComparisonVersionId(null)} className="size-7 min-w-0" aria-label="Close revision comparison"><ChevronUp size={13} /></Button>
                    </Card.Header>
                    <Card.Content className="space-y-2.5 px-3 py-3">
                        <div className="grid grid-cols-2 gap-2 text-[9px]">
                            <ComparisonValue label="Earlier" value={comparisonVersion.label} />
                            <ComparisonValue label="Current" value={currentVersion.label} accent />
                            <ComparisonValue label="Status" value={comparisonVersion.status.replace(/_/g, ' ')} />
                            <ComparisonValue label="Status" value={currentVersion.status.replace(/_/g, ' ')} accent />
                        </div>
                        <div className="rounded-lg border border-[var(--border)]/75 bg-[var(--surface)]/60 p-2.5">
                            <p className="text-[8px] font-semibold uppercase tracking-[0.12em] text-[var(--text-subtle)]">Change note</p>
                            <p className="mt-1 text-[9px] leading-4 text-[var(--text-muted)]">{currentVersion.changeSummary || currentVersion.uploadNote || 'No change summary was recorded for this revision.'}</p>
                        </div>
                        <div className="flex justify-end gap-1.5">
                            <Button size="sm" variant="secondary" onPress={() => onSwitchVersion?.(comparisonVersion.id)} className="h-7 px-2 text-[9px]">Open earlier</Button>
                            <Button size="sm" variant="primary" onPress={() => onSwitchVersion?.(currentVersion.id)} className="h-7 px-2 text-[9px]">Open current</Button>
                        </div>
                    </Card.Content>
                </Card>
            ) : null}
            {versions.map((version) => {
                const current = version.id === currentVersionId;
                return (
                    <Card
                        key={version.id}
                        variant="secondary"
                        className={cn(
                            'overflow-hidden rounded-xl border',
                            current
                                ? 'border-[var(--accent)]/35 bg-[var(--accent)]/8'
                                : 'border-[var(--border)] bg-[var(--surface-2)]/30',
                        )}
                    >
                        <Card.Content className="flex items-center gap-1.5 p-1.5">
                            <Button
                                variant="ghost"
                                fullWidth
                                onPress={() => onSwitchVersion?.(version.id)}
                                className="h-auto min-h-10 flex-1 justify-start rounded-lg px-2 py-1.5 text-left hover:bg-[var(--surface)]/70"
                            >
                                <span className="min-w-0 flex-1">
                                    <span className="flex items-center justify-between gap-2">
                                        <span className="text-[9px] font-semibold text-[var(--foreground)]">{version.label}</span>
                                        <StatusBadge value={version.status} />
                                    </span>
                                    <span className="mt-1 flex items-center justify-between text-[8px] text-[var(--text-muted)]">
                                        <span>{version.uploadedBy?.name ?? 'Unknown'}</span>
                                        <span>{version.createdAt ? formatDate(version.createdAt) : ''}</span>
                                    </span>
                                </span>
                            </Button>
                            <Tooltip delay={350}>
                                <Tooltip.Trigger>
                                    <Button
                                        isIconOnly
                                        size="sm"
                                        variant="ghost"
                                        onPress={() => setComparisonVersionId(version.id)}
                                        isDisabled={version.id === currentVersion.id}
                                        className="size-7 min-w-0 rounded-md text-[var(--text-muted)] hover:bg-[var(--surface)] hover:text-[var(--accent)]"
                                        aria-label={`Compare ${version.label} with ${currentVersion.label}`}
                                    >
                                        <GitBranch size={12} />
                                    </Button>
                                </Tooltip.Trigger>
                                <Tooltip.Content>Compare with current revision</Tooltip.Content>
                            </Tooltip>
                        </Card.Content>
                    </Card>
                );
            })}
        </div>
    );
}

function ComparisonValue({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
    return (
        <div className={cn('rounded-lg border border-[var(--border)]/75 px-2 py-1.5', accent && 'border-[var(--accent)]/30 bg-[var(--accent)]/8')}>
            <p className="text-[8px] uppercase tracking-[0.1em] text-[var(--text-subtle)]">{label}</p>
            <p className="mt-0.5 truncate text-[9px] font-medium capitalize text-[var(--foreground)]">{value}</p>
        </div>
    );
}

function ActivityPanel({ activities }: { activities: ProjectDesignActivity[] | null }) {
    if (!activities?.length) {
        return <EmptyInspectorState icon={<Activity size={16} />} title="No activity" description="Project Design events will appear here." />;
    }

    return (
        <div className="relative space-y-0.5 pl-4 before:absolute before:bottom-3 before:left-[5px] before:top-3 before:w-px before:bg-[var(--border)]">
            {activities.map((item) => (
                <Card key={item.id} variant="secondary" className="relative border-0 bg-transparent shadow-none">
                    <Card.Content className="rounded-xl px-2 py-2.5 hover:bg-[var(--surface-2)]/45">
                        <span className="absolute -left-[11px] top-3.5 size-2 rounded-full border-2 border-[var(--surface)] bg-[var(--accent)]" />
                        <p className="text-[9px] font-medium capitalize text-[var(--foreground)]">{item.action.replace(/_/g, ' ')}</p>
                        {item.description ? <p className="mt-1 text-[9px] leading-4 text-[var(--text-muted)]">{item.description}</p> : null}
                        <div className="mt-1 flex items-center justify-between text-[8px] text-[var(--text-subtle)]">
                            <span>{item.user?.name ?? 'System'}</span>
                            <span>{formatDate(item.createdAt)}</span>
                        </div>
                    </Card.Content>
                </Card>
            ))}
        </div>
    );
}
