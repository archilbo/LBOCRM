import { useState } from 'react';
import { MessageSquareText, Info, GitBranch, Activity, FileText, HardDrive, User, Clock, Shield, Package, ExternalLink, Download, Loader2 } from 'lucide-react';
import { Chip, Button } from '@heroui/react';
import { formatFileSize, formatDate } from '@/lib/formatters';
import { useRemarks, useActivity } from '@/features/project-design/hooks/useProjectDesignQueries';
import type { ProjectDesignFile, ProjectDesignVersion, ProjectDesignAsset } from '@/features/project-design/types/projectDesign';

type InspectorTab = 'details' | 'remarks' | 'versions' | 'activity';

export function DesignInspector({ file, versions, assets, activeAsset, dossierId, versionId, defaultTab, onOpenReviewAsset, onSwitchVersion, onTabChange }: {
    file: ProjectDesignFile | null;
    versions: ProjectDesignVersion[];
    assets: ProjectDesignAsset[];
    activeAsset: ProjectDesignAsset | null;
    dossierId?: number;
    versionId?: number;
    defaultTab?: InspectorTab;
    onOpenReviewAsset?: (asset: ProjectDesignAsset) => void;
    onSwitchVersion?: (versionId: number) => void;
    onTabChange?: (tab: InspectorTab) => void;
}) {
    const [tab, setTab] = useState<InspectorTab>(defaultTab ?? 'details');

    function handleTabChange(t: InspectorTab) {
        setTab(t);
        onTabChange?.(t);
    }

    const version = file?.latestVersion ?? null;

    const tabs: { id: InspectorTab; label: string; icon: React.ReactNode }[] = [
        { id: 'details', label: 'Details', icon: <Info size={11} /> },
        { id: 'remarks', label: 'Remarks', icon: <MessageSquareText size={11} /> },
        { id: 'versions', label: 'Versions', icon: <GitBranch size={11} /> },
        { id: 'activity', label: 'Activity', icon: <Activity size={11} /> },
    ];

    return (
        <div className="flex h-full flex-col border-l border-[var(--border)] bg-[var(--surface)] min-w-0">
            {/* Tab header */}
            <div className="flex shrink-0 border-b border-[var(--border)]">
                {tabs.map((t) => (
                    <button
                        key={t.id}
                        type="button"
                        onClick={() => handleTabChange(t.id)}
                        className={`flex items-center gap-1 px-2.5 py-1.5 text-[10.5px] font-medium transition ${
                            tab === t.id
                                ? 'text-[var(--accent)] border-b-2 border-[var(--accent)]'
                                : 'text-[var(--text-muted)] hover:text-[var(--foreground)]'
                        }`}
                    >
                        {t.icon}
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto p-2.5">
                {tab === 'details' && (
                    <DetailsContent file={file} version={version} assets={assets} activeAsset={activeAsset} onOpenReviewAsset={onOpenReviewAsset} />
                )}
                {tab === 'remarks' && (
                    <RemarksContent dossierId={dossierId} versionId={versionId} />
                )}
                {tab === 'versions' && (
                    <VersionsContent versions={versions} currentVersionId={version?.id} onSwitchVersion={onSwitchVersion} />
                )}
                {tab === 'activity' && (
                    <ActivityContent dossierId={dossierId} />
                )}
            </div>
        </div>
    );
}

function DetailsContent({ file, version, assets, activeAsset, onOpenReviewAsset }: {
    file: ProjectDesignFile | null;
    version: ProjectDesignVersion | null;
    assets: ProjectDesignAsset[];
    activeAsset: ProjectDesignAsset | null;
    onOpenReviewAsset?: (asset: ProjectDesignAsset) => void;
}) {
    return (
        <div className="space-y-3">
            {file && (
                <Section title="File">
                    <DetailItem icon={<FileText size={11} />} label="Name" value={file.name} />
                    {file.code && <DetailItem icon={<Info size={11} />} label="Code" value={file.code} />}
                    {file.discipline && <DetailItem icon={<HardDrive size={11} />} label="Discipline" value={file.discipline} />}
                    {file.category && <DetailItem icon={<HardDrive size={11} />} label="Category" value={file.category} />}
                    {file.responsibleUser && <DetailItem icon={<User size={11} />} label="Responsible" value={file.responsibleUser.name} />}
                    {file.reviewer && <DetailItem icon={<User size={11} />} label="Reviewer" value={file.reviewer.name} />}
                </Section>
            )}

            {version && (
                <Section title="Version">
                    <DetailItem icon={<GitBranch size={11} />} label="Version" value={version.label} />
                    {version.revisionCode && <DetailItem icon={<Info size={11} />} label="Revision" value={version.revisionCode} />}
                    <DetailItem icon={<Shield size={11} />} label="Status" value={
                        <Chip size="sm" variant="flat" color={version.status === 'approved' ? 'success' : version.status === 'rejected' ? 'danger' : 'warning'} className="h-4 text-[9px]">
                            {version.status}
                        </Chip>
                    } />
                    {version.uploadedBy && <DetailItem icon={<User size={11} />} label="Uploaded by" value={version.uploadedBy.name} />}
                    {version.createdAt && <DetailItem icon={<Clock size={11} />} label="Date" value={formatDate(version.createdAt)} />}
                    {version.changeSummary && <DetailItem icon={<FileText size={11} />} label="Summary" value={version.changeSummary} />}
                </Section>
            )}

            {activeAsset && (
                <Section title="Active Asset">
                    <DetailItem icon={<FileText size={11} />} label="Filename" value={activeAsset.originalFilename} />
                    <DetailItem icon={<HardDrive size={11} />} label="Format" value={activeAsset.extension.toUpperCase()} />
                    <DetailItem icon={<Info size={11} />} label="MIME" value={activeAsset.mimeType} />
                    <DetailItem icon={<HardDrive size={11} />} label="Size" value={formatFileSize(activeAsset.sizeBytes)} />
                    {activeAsset.formatCapability?.application && (
                        <DetailItem icon={<Package size={11} />} label="Application" value={activeAsset.formatCapability.application} />
                    )}
                    {activeAsset.sourceApplication && (
                        <DetailItem icon={<Info size={11} />} label="Source version" value={activeAsset.sourceApplication} />
                    )}
                    <DetailItem icon={<Shield size={11} />} label="Scan" value={
                        <Chip size="sm" variant="flat" color={activeAsset.scanStatus === 'clean' ? 'success' : 'warning'} className="h-4 text-[9px]">
                            {activeAsset.scanStatus ?? 'Pending'}
                        </Chip>
                    } />
                    {activeAsset.downloadUrl && (
                        <div className="pt-1">
                            <a href={activeAsset.downloadUrl} target="_blank" rel="noopener noreferrer"
                                className="inline-flex h-6 items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 text-[10px] font-medium text-[var(--foreground)] transition hover:bg-[var(--surface-2)]">
                                <Download size={11} /> Download
                            </a>
                        </div>
                    )}
                </Section>
            )}

            {assets.length > 0 && (
                <Section title={`Assets (${assets.length})`}>
                    <div className="space-y-0.5">
                        {assets.map((a) => (
                            <div key={a.id} className="flex items-center gap-2 rounded-md bg-[var(--surface-2)] px-2 py-1">
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-[10.5px] font-medium text-[var(--foreground)]">{a.originalFilename}</p>
                                    <p className="text-[9px] text-[var(--text-muted)]">{a.extension.toUpperCase()} · {formatFileSize(a.sizeBytes)}</p>
                                </div>
                                {a.previewable && a.previewUrl && onOpenReviewAsset && (
                                    <Button isIconOnly size="sm" variant="light" className="h-5 w-5 min-w-0 text-[9px]" onPress={() => onOpenReviewAsset(a)}>
                                        <ExternalLink size={9} />
                                    </Button>
                                )}
                                {a.downloadUrl && (
                                    <Button isIconOnly size="sm" variant="light" className="h-5 w-5 min-w-0 text-[9px]" as="a" href={a.downloadUrl} target="_blank" rel="noopener noreferrer">
                                        <Download size={9} />
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                </Section>
            )}
        </div>
    );
}

function RemarksContent({ dossierId, versionId }: { dossierId?: number; versionId?: number }) {
    const params: Record<string, string | undefined> = {};
    if (versionId) params.version_id = String(versionId);
    const { data, isLoading } = useRemarks(dossierId ?? 0, params);
    const remarks = data?.data ?? [];

    if (!dossierId) {
        return (
            <div className="flex flex-col items-center justify-center py-10 text-center">
                <MessageSquareText size={20} className="text-[var(--text-muted)]" />
                <p className="mt-2 text-[11px] font-medium text-[var(--foreground)]">No dossier context</p>
            </div>
        );
    }

    if (isLoading) {
        return <div className="flex items-center justify-center py-10"><Loader2 size={14} className="animate-spin text-[var(--text-muted)]" /></div>;
    }

    if (!remarks.length) {
        return (
            <div className="flex flex-col items-center justify-center py-10 text-center">
                <MessageSquareText size={20} className="text-[var(--text-muted)]" />
                <p className="mt-2 text-[11px] font-medium text-[var(--foreground)]">No remarks</p>
                <p className="mt-1 text-[10px] text-[var(--text-muted)]">Remarks appear here once created on review assets.</p>
            </div>
        );
    }

    return (
        <div className="space-y-1.5">
            {remarks.map((r) => (
                <div key={r.id} className="rounded-lg border border-[var(--border)] px-2.5 py-2">
                    <div className="flex items-start justify-between gap-1.5">
                        <div className="min-w-0">
                            <p className="text-[11px] font-medium text-[var(--foreground)] truncate">{r.title}</p>
                            {r.description && <p className="mt-0.5 text-[10px] text-[var(--text-muted)] line-clamp-2">{r.description}</p>}
                        </div>
                        <Chip size="sm" variant="flat" className="h-4 shrink-0 text-[9px]" color={r.severity === 'critical' ? 'danger' : r.severity === 'major' ? 'warning' : 'default'}>
                            {r.severity}
                        </Chip>
                    </div>
                    <div className="mt-1 flex items-center gap-1.5 text-[9px] text-[var(--text-muted)] flex-wrap">
                        {r.createdBy && <span>{r.createdBy.name}</span>}
                        {r.createdAt && <span>· {formatDate(r.createdAt)}</span>}
                        <Chip size="sm" variant="flat" className="h-3.5 text-[8px]" color={r.status === 'open' ? 'warning' : r.status === 'resolved' ? 'success' : 'default'}>
                            {r.status}
                        </Chip>
                    </div>
                </div>
            ))}
        </div>
    );
}

function VersionsContent({ versions, currentVersionId, onSwitchVersion }: {
    versions: ProjectDesignVersion[];
    currentVersionId?: number | null;
    onSwitchVersion?: (versionId: number) => void;
}) {
    if (!versions?.length) {
        return (
            <div className="flex flex-col items-center justify-center py-10 text-center">
                <GitBranch size={20} className="text-[var(--text-muted)]" />
                <p className="mt-2 text-[11px] font-medium text-[var(--foreground)]">No versions</p>
            </div>
        );
    }

    return (
        <div className="space-y-1">
            {versions.map((v) => {
                const isCurrent = v.id === currentVersionId;
                return (
                    <div
                        key={v.id}
                        className={`cursor-pointer rounded-lg border px-2.5 py-2 transition hover:bg-[var(--surface-2)] ${isCurrent ? 'border-[var(--accent)] bg-[var(--accent)]/5' : 'border-[var(--border)]'}`}
                        onClick={() => onSwitchVersion?.(v.id)}
                    >
                        <div className="flex items-center justify-between gap-1">
                            <div className="flex items-center gap-1.5 min-w-0">
                                <p className="text-[11px] font-semibold text-[var(--foreground)] truncate">{v.label}</p>
                                {isCurrent && <Chip size="sm" variant="flat" color="primary" className="h-4 text-[8px]">Current</Chip>}
                            </div>
                            <Chip size="sm" variant="flat" className="h-4 text-[8px] shrink-0" color={v.status === 'approved' ? 'success' : v.status === 'rejected' ? 'danger' : 'warning'}>
                                {v.status}
                            </Chip>
                        </div>
                        {v.uploadedBy?.name ? (
                            <p className="mt-0.5 text-[9px] text-[var(--text-muted)]">{v.uploadedBy.name} · {v.createdAt ? formatDate(v.createdAt) : ''}</p>
                        ) : null}
                    </div>
                );
            })}
        </div>
    );
}

function ActivityContent({ dossierId }: { dossierId?: number }) {
    const { data, isLoading } = useActivity(dossierId ?? 0);
    const items = data?.data ?? [];

    if (!dossierId) {
        return (
            <div className="flex flex-col items-center justify-center py-10 text-center">
                <Activity size={20} className="text-[var(--text-muted)]" />
                <p className="mt-2 text-[11px] font-medium text-[var(--foreground)]">No dossier context</p>
            </div>
        );
    }

    if (isLoading) {
        return <div className="flex items-center justify-center py-10"><Loader2 size={14} className="animate-spin text-[var(--text-muted)]" /></div>;
    }

    if (!items.length) {
        return (
            <div className="flex flex-col items-center justify-center py-10 text-center">
                <Activity size={20} className="text-[var(--text-muted)]" />
                <p className="mt-2 text-[11px] font-medium text-[var(--foreground)]">No activity yet</p>
            </div>
        );
    }

    return (
        <div className="space-y-1">
            {items.map((a) => (
                <div key={a.id} className="flex items-start gap-2 rounded-lg border border-[var(--border)] px-2.5 py-2">
                    <div className="mt-0.5 shrink-0">
                        <div className="size-1.5 rounded-full bg-[var(--accent)]" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-medium text-[var(--foreground)]">{a.action}</p>
                        {a.description && <p className="mt-0.5 text-[10px] text-[var(--text-muted)] line-clamp-2">{a.description}</p>}
                        <div className="mt-0.5 flex items-center gap-1.5 text-[9px] text-[var(--text-muted)]">
                            {a.user && <span>{a.user.name}</span>}
                            {a.createdAt && <span>· {formatDate(a.createdAt)}</span>}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div>
            <h4 className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">{title}</h4>
            <div className="space-y-1 text-[11px]">{children}</div>
        </div>
    );
}

function DetailItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode | string }) {
    return (
        <div className="flex items-center gap-1.5">
            <span className="shrink-0 text-[var(--text-muted)]">{icon}</span>
            <span className="text-[var(--text-muted)] whitespace-nowrap">{label}:</span>
            <span className="font-medium text-[var(--foreground)] truncate">{value}</span>
        </div>
    );
}
