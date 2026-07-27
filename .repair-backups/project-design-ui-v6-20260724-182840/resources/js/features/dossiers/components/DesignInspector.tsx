import { useState, type ReactNode } from 'react';
import {
    Activity,
    Clock,
    Download,
    ExternalLink,
    FileText,
    GitBranch,
    HardDrive,
    Info,
    MessageSquareText,
    Package,
    Shield,
    User,
} from 'lucide-react';
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
};

const TABS: { id: DesignInspectorTab; label: string; icon: typeof Info }[] = [
    { id: 'details', label: 'Details', icon: Info },
    { id: 'remarks', label: 'Remarks', icon: MessageSquareText },
    { id: 'versions', label: 'Versions', icon: GitBranch },
    { id: 'activity', label: 'Activity', icon: Activity },
];

const STATUS_TONES: Record<string, string> = {
    approved: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-300',
    resolved: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-300',
    clean: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-300',
    rejected: 'border-red-500/25 bg-red-500/10 text-red-300',
    failed: 'border-red-500/25 bg-red-500/10 text-red-300',
    critical: 'border-red-500/25 bg-red-500/10 text-red-300',
    major: 'border-orange-500/25 bg-orange-500/10 text-orange-300',
    pending: 'border-amber-500/25 bg-amber-500/10 text-amber-300',
    open: 'border-amber-500/25 bg-amber-500/10 text-amber-300',
    in_progress: 'border-blue-500/25 bg-blue-500/10 text-blue-300',
};

function StatusBadge({ value }: { value: string | null | undefined }) {
    const normalized = value?.toLowerCase() || 'pending';
    return (
        <span className={`inline-flex h-5 items-center rounded-md border px-1.5 text-[9px] font-semibold capitalize ${STATUS_TONES[normalized] ?? 'border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-muted)]'}`}>
            {normalized.replace(/_/g, ' ')}
        </span>
    );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
    return (
        <section className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
            <div className="border-b border-[var(--border)] bg-[var(--surface-2)]/45 px-3 py-2">
                <h4 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">{title}</h4>
            </div>
            <div className="divide-y divide-[var(--border)]/65 px-3">{children}</div>
        </section>
    );
}

function DetailRow({ icon, label, value }: { icon: ReactNode; label: string; value: ReactNode }) {
    return (
        <div className="grid grid-cols-[18px_92px_minmax(0,1fr)] items-start gap-2 py-2.5">
            <span className="mt-0.5 text-[var(--text-subtle)]">{icon}</span>
            <span className="text-[10px] font-medium text-[var(--text-muted)]">{label}</span>
            <span className="min-w-0 break-words text-right text-[11px] text-[var(--foreground)]">{value}</span>
        </div>
    );
}

function EmptyInspectorState({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
    return (
        <div className="flex flex-col items-center justify-center px-4 py-14 text-center">
            <span className="flex size-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-muted)]">{icon}</span>
            <p className="mt-3 text-[12px] font-medium text-[var(--foreground)]">{title}</p>
            <p className="mt-1 max-w-[240px] text-[10px] leading-4 text-[var(--text-muted)]">{description}</p>
        </div>
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
}: DesignInspectorProps) {
    const [internalTab, setInternalTab] = useState<DesignInspectorTab>('details');
    const tab = activeTab ?? internalTab;

    const selectTab = (next: DesignInspectorTab) => {
        if (activeTab == null) setInternalTab(next);
        onTabChange?.(next);
    };

    return (
        <div className="flex h-full min-h-0 flex-col bg-[var(--surface)]">
            <div className="shrink-0 border-b border-[var(--border)] px-2 pt-2">
                <div className="app-scrollbar flex items-center gap-1 overflow-x-auto">
                    {TABS.map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            type="button"
                            onClick={() => selectTab(id)}
                            className={`relative flex h-8 shrink-0 items-center gap-1.5 rounded-t-lg px-2.5 text-[10px] font-medium outline-none transition ${tab === id ? 'bg-[var(--surface-2)] text-[var(--accent)]' : 'text-[var(--text-muted)] hover:bg-[var(--surface-2)]/55 hover:text-[var(--foreground)]'}`}
                        >
                            <Icon size={12} />
                            {label}
                            {tab === id ? <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-[var(--accent)]" /> : null}
                        </button>
                    ))}
                </div>
            </div>

            <div className="app-scrollbar min-h-0 flex-1 overflow-y-auto p-3">
                {tab === 'details' ? (
                    <DetailsPanel
                        file={file}
                        versions={versions}
                        assets={assets}
                        activeAsset={activeAsset}
                        onOpenReviewAsset={onOpenReviewAsset}
                    />
                ) : null}
                {tab === 'remarks' ? <RemarksPanel remarks={remarks} /> : null}
                {tab === 'versions' ? (
                    <VersionsPanel
                        versions={versions}
                        currentVersionId={activeAsset ? versions.find((version) => version.assets.some((asset) => asset.id === activeAsset.id))?.id : file?.currentVersionId}
                        onSwitchVersion={onSwitchVersion}
                    />
                ) : null}
                {tab === 'activity' ? <ActivityPanel activities={activities} /> : null}
            </div>
        </div>
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
        <div className="space-y-3">
            {file ? (
                <Section title="Design file">
                    <DetailRow icon={<FileText size={12} />} label="Name" value={file.name} />
                    {file.code ? <DetailRow icon={<Info size={12} />} label="Code" value={file.code} /> : null}
                    {file.discipline ? <DetailRow icon={<HardDrive size={12} />} label="Discipline" value={file.discipline} /> : null}
                    {file.category ? <DetailRow icon={<Package size={12} />} label="Category" value={file.category} /> : null}
                    {file.responsibleUser ? <DetailRow icon={<User size={12} />} label="Responsible" value={file.responsibleUser.name} /> : null}
                    {file.reviewer ? <DetailRow icon={<User size={12} />} label="Reviewer" value={file.reviewer.name} /> : null}
                </Section>
            ) : null}

            {activeVersion ? (
                <Section title="Version">
                    <DetailRow icon={<GitBranch size={12} />} label="Revision" value={activeVersion.label} />
                    <DetailRow icon={<Shield size={12} />} label="Status" value={<StatusBadge value={activeVersion.status} />} />
                    {activeVersion.revisionCode ? <DetailRow icon={<Info size={12} />} label="Code" value={activeVersion.revisionCode} /> : null}
                    {activeVersion.uploadedBy ? <DetailRow icon={<User size={12} />} label="Uploaded by" value={activeVersion.uploadedBy.name} /> : null}
                    {activeVersion.createdAt ? <DetailRow icon={<Clock size={12} />} label="Created" value={formatDate(activeVersion.createdAt)} /> : null}
                </Section>
            ) : null}

            {activeAsset ? (
                <Section title="Active asset">
                    <DetailRow icon={<FileText size={12} />} label="Filename" value={activeAsset.originalFilename} />
                    <DetailRow icon={<HardDrive size={12} />} label="Format" value={activeAsset.extension.toUpperCase()} />
                    <DetailRow icon={<HardDrive size={12} />} label="Size" value={formatFileSize(activeAsset.sizeBytes)} />
                    <DetailRow icon={<Shield size={12} />} label="Scan" value={<StatusBadge value={activeAsset.scanStatus} />} />
                    {activeAsset.formatCapability?.application ? <DetailRow icon={<Package size={12} />} label="Application" value={activeAsset.formatCapability.application} /> : null}
                    {activeAsset.downloadUrl ? (
                        <div className="py-2.5">
                            <a
                                href={activeAsset.downloadUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex h-8 items-center justify-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] text-[10px] font-medium text-[var(--foreground)] transition hover:border-[var(--accent)]/30 hover:text-[var(--accent)]"
                            >
                                <Download size={12} />
                                Download asset
                            </a>
                        </div>
                    ) : null}
                </Section>
            ) : null}

            {assets.length ? (
                <Section title={`Assets · ${assets.length}`}>
                    {assets.map((asset) => (
                        <div key={asset.id} className="flex items-center gap-2 py-2.5">
                            <span className={`size-1.5 shrink-0 rounded-full ${asset.id === activeAsset?.id ? 'bg-[var(--accent)]' : 'bg-[var(--text-subtle)]'}`} />
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-[10px] font-medium text-[var(--foreground)]">{asset.originalFilename}</p>
                                <p className="mt-0.5 text-[9px] uppercase tracking-wide text-[var(--text-muted)]">{asset.extension} · {formatFileSize(asset.sizeBytes)}</p>
                            </div>
                            {asset.previewUrl && onOpenReviewAsset ? (
                                <button
                                    type="button"
                                    onClick={() => onOpenReviewAsset(asset)}
                                    className="flex size-7 shrink-0 items-center justify-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--accent)]"
                                    aria-label={`Open ${asset.originalFilename}`}
                                >
                                    <ExternalLink size={12} />
                                </button>
                            ) : null}
                        </div>
                    ))}
                </Section>
            ) : null}
        </div>
    );
}

function RemarksPanel({ remarks }: { remarks: ProjectDesignRemark[] | null }) {
    if (!remarks?.length) {
        return <EmptyInspectorState icon={<MessageSquareText size={17} />} title="No remarks" description="Remarks for this revision will appear here." />;
    }

    return (
        <div className="space-y-2">
            {remarks.map((remark) => (
                <article key={remark.id} className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)]/35 p-3">
                    <div className="flex items-start justify-between gap-2">
                        <p className="min-w-0 flex-1 text-[11px] font-medium leading-4 text-[var(--foreground)]">{remark.title}</p>
                        <StatusBadge value={remark.severity} />
                    </div>
                    {remark.description ? <p className="mt-1.5 line-clamp-3 text-[10px] leading-4 text-[var(--text-muted)]">{remark.description}</p> : null}
                    <div className="mt-2 flex items-center justify-between gap-2 text-[9px] text-[var(--text-subtle)]">
                        <span>{remark.createdBy?.name ?? 'Unknown'}</span>
                        <StatusBadge value={remark.status} />
                    </div>
                </article>
            ))}
        </div>
    );
}

function VersionsPanel({ versions, currentVersionId, onSwitchVersion }: { versions: ProjectDesignVersion[]; currentVersionId?: number | null; onSwitchVersion?: (versionId: number) => void }) {
    if (!versions.length) {
        return <EmptyInspectorState icon={<GitBranch size={17} />} title="No versions" description="Uploaded revisions will appear here." />;
    }

    return (
        <div className="space-y-2">
            {versions.map((version) => {
                const current = version.id === currentVersionId;
                return (
                    <button
                        key={version.id}
                        type="button"
                        onClick={() => onSwitchVersion?.(version.id)}
                        className={`w-full rounded-xl border p-3 text-left transition ${current ? 'border-[var(--accent)]/35 bg-[var(--accent)]/8' : 'border-[var(--border)] bg-[var(--surface-2)]/30 hover:border-[var(--accent)]/25'}`}
                    >
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-[11px] font-semibold text-[var(--foreground)]">{version.label}</span>
                            <StatusBadge value={version.status} />
                        </div>
                        <div className="mt-1.5 flex items-center justify-between text-[9px] text-[var(--text-muted)]">
                            <span>{version.uploadedBy?.name ?? 'Unknown'}</span>
                            <span>{version.createdAt ? formatDate(version.createdAt) : ''}</span>
                        </div>
                    </button>
                );
            })}
        </div>
    );
}

function ActivityPanel({ activities }: { activities: ProjectDesignActivity[] | null }) {
    if (!activities?.length) {
        return <EmptyInspectorState icon={<Activity size={17} />} title="No activity" description="Project Design events will appear here." />;
    }

    return (
        <div className="relative space-y-1 pl-4 before:absolute before:bottom-3 before:left-[5px] before:top-3 before:w-px before:bg-[var(--border)]">
            {activities.map((item) => (
                <article key={item.id} className="relative rounded-xl px-2 py-2.5 hover:bg-[var(--surface-2)]/45">
                    <span className="absolute -left-[15px] top-3.5 size-2 rounded-full border-2 border-[var(--surface)] bg-[var(--accent)]" />
                    <p className="text-[10px] font-medium capitalize text-[var(--foreground)]">{item.action.replace(/_/g, ' ')}</p>
                    {item.description ? <p className="mt-1 text-[10px] leading-4 text-[var(--text-muted)]">{item.description}</p> : null}
                    <div className="mt-1.5 flex items-center justify-between text-[9px] text-[var(--text-subtle)]">
                        <span>{item.user?.name ?? 'System'}</span>
                        <span>{formatDate(item.createdAt)}</span>
                    </div>
                </article>
            ))}
        </div>
    );
}
