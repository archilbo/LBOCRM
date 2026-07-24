import { useState, type ReactNode } from 'react';
import { Button, Card, Chip, Tabs, Tooltip } from '@heroui/react';
import {
    Activity,
    ChevronDown,
    ChevronUp,
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
    Shield,
    User,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { formatDate, formatFileSize } from '@/lib/formatters';
import type {
    ProjectDesignActivity,
    ProjectDesignAsset,
    ProjectDesignFile,
    ProjectDesignRemark,
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
            <span className="min-w-0 break-words text-right text-[10px] text-[var(--foreground)]">{value}</span>
        </div>
    );
}

function EmptyInspectorState({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
    return (
        <Card variant="secondary" className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-2)]/20">
            <Card.Content className="flex min-h-44 flex-col items-center justify-center px-4 py-8 text-center">
                <span className="flex size-9 items-center justify-center rounded-xl bg-[var(--surface-2)] text-[var(--text-muted)]">{icon}</span>
                <p className="mt-2 text-[11px] font-medium text-[var(--foreground)]">{title}</p>
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
                <RemarksPanel remarks={remarks} activeRemarkId={activeRemarkId} onRemarkFocus={onRemarkFocus} />
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
                                className="h-8 text-[10px]"
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
                                <p className="truncate text-[10px] font-medium text-[var(--foreground)]">{asset.originalFilename}</p>
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
}: {
    remarks: ProjectDesignRemark[] | null;
    activeRemarkId?: number | null;
    onRemarkFocus?: (remark: ProjectDesignRemark) => void;
}) {
    const [expanded, setExpanded] = useState<Set<number>>(() => new Set());

    if (!remarks?.length) {
        return <EmptyInspectorState icon={<MessageSquareText size={16} />} title="No remarks" description="Remarks for this revision will appear here." />;
    }

    function toggleExpanded(id: number) {
        setExpanded((current) => {
            const next = new Set(current);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }

    return (
        <div className="space-y-1.5">
            {remarks.map((remark) => {
                const isExpanded = expanded.has(remark.id);
                const isSelected = activeRemarkId === remark.id;
                const hasLongDescription = (remark.description?.length ?? 0) > 110;

                return (
                    <Card
                        key={remark.id}
                        variant="secondary"
                        className={cn(
                            'overflow-hidden rounded-xl border transition',
                            isSelected
                                ? 'border-[var(--accent)]/45 bg-[var(--accent)]/8 shadow-sm'
                                : 'border-[var(--border)] bg-[var(--surface-2)]/30 hover:border-[var(--accent)]/25',
                        )}
                    >
                        <Card.Content className="p-0">
                            <Button
                                variant="ghost"
                                fullWidth
                                onPress={() => onRemarkFocus?.(remark)}
                                className="h-auto min-h-0 justify-start rounded-none px-2.5 py-2 text-left"
                                aria-label={`Focus remark ${remark.title}`}
                            >
                                <span className="min-w-0 flex-1">
                                    <span className="flex items-center gap-1.5">
                                        <span className="min-w-0 flex-1 truncate text-[10px] font-semibold text-[var(--foreground)]">{remark.title}</span>
                                        <StatusBadge value={remark.severity} />
                                    </span>
                                    <span className="mt-1 flex items-center gap-1.5 text-[8px] text-[var(--text-subtle)]">
                                        <span className="truncate">{remark.createdBy?.name ?? 'Unknown'}</span>
                                        <span>·</span>
                                        <StatusBadge value={remark.status} />
                                    </span>
                                </span>
                                <Focus size={12} className={cn('shrink-0', isSelected ? 'text-[var(--accent)]' : 'text-[var(--text-subtle)]')} />
                            </Button>

                            {remark.description ? (
                                <div className="border-t border-[var(--border)]/65 px-2.5 py-2">
                                    <p className={cn('text-[9px] leading-4 text-[var(--text-muted)]', !isExpanded && 'line-clamp-2')}>
                                        {remark.description}
                                    </p>
                                    {hasLongDescription ? (
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onPress={() => toggleExpanded(remark.id)}
                                            className="mt-1 h-6 min-w-0 gap-1 px-1.5 text-[8px] text-[var(--accent)]"
                                            aria-expanded={isExpanded}
                                        >
                                            {isExpanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                                            {isExpanded ? 'Collapse' : 'Expand'}
                                        </Button>
                                    ) : null}
                                </div>
                            ) : null}
                        </Card.Content>
                    </Card>
                );
            })}
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
    if (!versions.length) {
        return <EmptyInspectorState icon={<GitBranch size={16} />} title="No versions" description="Uploaded revisions will appear here." />;
    }

    return (
        <div className="space-y-1.5">
            {versions.map((version) => {
                const current = version.id === currentVersionId;
                return (
                    <Button
                        key={version.id}
                        variant="ghost"
                        fullWidth
                        onPress={() => onSwitchVersion?.(version.id)}
                        className={cn(
                            'h-auto min-h-12 justify-start rounded-xl border p-2.5 text-left',
                            current
                                ? 'border-[var(--accent)]/35 bg-[var(--accent)]/8'
                                : 'border-[var(--border)] bg-[var(--surface-2)]/30 hover:border-[var(--accent)]/25',
                        )}
                    >
                        <span className="min-w-0 flex-1">
                            <span className="flex items-center justify-between gap-2">
                                <span className="text-[10px] font-semibold text-[var(--foreground)]">{version.label}</span>
                                <StatusBadge value={version.status} />
                            </span>
                            <span className="mt-1 flex items-center justify-between text-[8px] text-[var(--text-muted)]">
                                <span>{version.uploadedBy?.name ?? 'Unknown'}</span>
                                <span>{version.createdAt ? formatDate(version.createdAt) : ''}</span>
                            </span>
                        </span>
                    </Button>
                );
            })}
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
