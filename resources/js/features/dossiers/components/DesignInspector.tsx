import { useState } from 'react';
import { MessageSquareText, Info, GitBranch, Activity, FileText, HardDrive, User, Clock, Shield, Package, ExternalLink, Download } from 'lucide-react';
import { Chip, Button } from '@heroui/react';
import { formatFileSize, formatDate } from '@/lib/formatters';
import type { ProjectDesignFile, ProjectDesignVersion, ProjectDesignAsset, ProjectDesignRemark, ProjectDesignActivity } from '@/features/project-design/types/projectDesign';

type InspectorTab = 'details' | 'remarks' | 'versions' | 'activity';

export function DesignInspector({ file, versions, assets, activeAsset, remarks, activities, onOpenReviewAsset, onSwitchVersion }: {
    file: ProjectDesignFile | null;
    versions: ProjectDesignVersion[];
    assets: ProjectDesignAsset[];
    activeAsset: ProjectDesignAsset | null;
    remarks: ProjectDesignRemark[] | null;
    activities: ProjectDesignActivity[] | null;
    onOpenReviewAsset?: (asset: ProjectDesignAsset) => void;
    onSwitchVersion?: (versionId: number) => void;
}) {
    const [tab, setTab] = useState<InspectorTab>('details');

    const version = file?.latestVersion ?? null;

    const tabs: { id: InspectorTab; label: string; icon: React.ReactNode }[] = [
        { id: 'details', label: 'Details', icon: <Info size={12} /> },
        { id: 'remarks', label: 'Remarks', icon: <MessageSquareText size={12} /> },
        { id: 'versions', label: 'Versions', icon: <GitBranch size={12} /> },
        { id: 'activity', label: 'Activity', icon: <Activity size={12} /> },
    ];

    return (
        <div className="flex h-full flex-col border-l border-[var(--border)] bg-[var(--surface)]">
            {/* Tab header */}
            <div className="flex shrink-0 border-b border-[var(--border)]">
                {tabs.map((t) => (
                    <button
                        key={t.id}
                        type="button"
                        onClick={() => setTab(t.id)}
                        className={`flex items-center gap-1 px-3 py-2 text-[11px] font-medium transition ${
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
            <div className="flex-1 overflow-y-auto p-3">
                {tab === 'details' && (
                    <DetailsContent file={file} version={version} assets={assets} activeAsset={activeAsset} onOpenReviewAsset={onOpenReviewAsset} />
                )}
                {tab === 'remarks' && (
                    <RemarksContent remarks={remarks} />
                )}
                {tab === 'versions' && (
                    <VersionsContent versions={versions} currentVersionId={version?.id} onSwitchVersion={onSwitchVersion} />
                )}
                {tab === 'activity' && (
                    <ActivityContent activities={activities} />
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
        <div className="space-y-4">
            {file && (
                <Section title="File">
                    <DetailItem icon={<FileText size={12} />} label="Name" value={file.name} />
                    {file.code && <DetailItem icon={<Info size={12} />} label="Code" value={file.code} />}
                    {file.discipline && <DetailItem icon={<HardDrive size={12} />} label="Discipline" value={file.discipline} />}
                    {file.category && <DetailItem icon={<HardDrive size={12} />} label="Category" value={file.category} />}
                    {file.responsibleUser && <DetailItem icon={<User size={12} />} label="Responsible" value={file.responsibleUser.name} />}
                    {file.reviewer && <DetailItem icon={<User size={12} />} label="Reviewer" value={file.reviewer.name} />}
                </Section>
            )}

            {version && (
                <Section title="Version">
                    <DetailItem icon={<GitBranch size={12} />} label="Version" value={version.label} />
                    {version.revisionCode && <DetailItem icon={<Info size={12} />} label="Revision" value={version.revisionCode} />}
                    <DetailItem icon={<Shield size={12} />} label="Status" value={
                        <Chip size="sm" variant="flat" color={version.status === 'approved' ? 'success' : version.status === 'rejected' ? 'danger' : 'warning'} className="h-5 text-[10px]">
                            {version.status}
                        </Chip>
                    } />
                    {version.uploadedBy && <DetailItem icon={<User size={12} />} label="Uploaded by" value={version.uploadedBy.name} />}
                    {version.createdAt && <DetailItem icon={<Clock size={12} />} label="Date" value={formatDate(version.createdAt)} />}
                    {version.changeSummary && <DetailItem icon={<FileText size={12} />} label="Summary" value={version.changeSummary} />}
                </Section>
            )}

            {activeAsset && (
                <Section title="Active Asset">
                    <DetailItem icon={<FileText size={12} />} label="Filename" value={activeAsset.originalFilename} />
                    <DetailItem icon={<HardDrive size={12} />} label="Format" value={activeAsset.extension.toUpperCase()} />
                    <DetailItem icon={<Info size={12} />} label="MIME" value={activeAsset.mimeType} />
                    <DetailItem icon={<HardDrive size={12} />} label="Size" value={formatFileSize(activeAsset.sizeBytes)} />
                    {activeAsset.formatCapability?.application && (
                        <DetailItem icon={<Package size={12} />} label="Application" value={activeAsset.formatCapability.application} />
                    )}
                    {activeAsset.sourceApplication && (
                        <DetailItem icon={<Info size={12} />} label="Source version" value={activeAsset.sourceApplication} />
                    )}
                    <DetailItem icon={<Shield size={12} />} label="Scan" value={
                        <Chip size="sm" variant="flat" color={activeAsset.scanStatus === 'clean' ? 'success' : 'warning'} className="h-5 text-[10px]">
                            {activeAsset.scanStatus ?? 'Pending'}
                        </Chip>
                    } />
                    {activeAsset.downloadUrl && (
                        <div className="pt-1">
                            <a href={activeAsset.downloadUrl} target="_blank" rel="noopener noreferrer"
                                className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 text-[11px] font-medium text-[var(--foreground)] transition hover:bg-[var(--surface-2)]">
                                <Download size={12} /> Download
                            </a>
                        </div>
                    )}
                </Section>
            )}

            {assets.length > 0 && (
                <Section title={`All Assets (${assets.length})`}>
                    <div className="space-y-1">
                        {assets.map((a) => (
                            <div key={a.id} className="flex items-center justify-between rounded-md bg-[var(--surface-2)] px-2.5 py-1.5">
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-[11px] font-medium text-[var(--foreground)]">{a.originalFilename}</p>
                                    <p className="text-[10px] text-[var(--text-muted)]">{a.extension.toUpperCase()} · {formatFileSize(a.sizeBytes)}</p>
                                </div>
                                <div className="flex items-center gap-1">
                                    {a.previewable && a.previewUrl && onOpenReviewAsset && (
                                        <Button isIconOnly size="sm" variant="light" className="h-6 w-6 min-w-0 text-[10px]" onPress={() => onOpenReviewAsset(a)}>
                                            <ExternalLink size={10} />
                                        </Button>
                                    )}
                                    {a.downloadUrl && (
                                        <Button isIconOnly size="sm" variant="light" className="h-6 w-6 min-w-0 text-[10px]" as="a" href={a.downloadUrl} target="_blank" rel="noopener noreferrer">
                                            <Download size={10} />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </Section>
            )}
        </div>
    );
}

function RemarksContent({ remarks }: { remarks: ProjectDesignRemark[] | null }) {
    if (!remarks?.length) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <MessageSquareText size={24} className="text-[var(--text-muted)]" />
                <p className="mt-2 text-[12px] font-medium text-[var(--foreground)]">No remarks</p>
                <p className="mt-1 text-[11px] text-[var(--text-muted)]">Remarks will appear here once created on review assets.</p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {remarks.map((r) => (
                <div key={r.id} className="rounded-lg border border-[var(--border)] p-2.5">
                    <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                            <p className="text-[12px] font-medium text-[var(--foreground)]">{r.title}</p>
                            {r.description && <p className="mt-0.5 text-[11px] text-[var(--text-muted)] line-clamp-2">{r.description}</p>}
                        </div>
                        <Chip size="sm" variant="flat" className="h-5 shrink-0 text-[10px]" color={r.severity === 'critical' ? 'danger' : r.severity === 'major' ? 'warning' : 'default'}>
                            {r.severity}
                        </Chip>
                    </div>
                    <div className="mt-1.5 flex items-center gap-2 text-[10px] text-[var(--text-muted)]">
                        {r.createdBy && <span>{r.createdBy.name}</span>}
                        {r.createdAt && <span>· {formatDate(r.createdAt)}</span>}
                        <Chip size="sm" variant="flat" className="h-4 text-[9px]" color={r.status === 'open' ? 'warning' : r.status === 'resolved' ? 'success' : 'default'}>
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
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <GitBranch size={24} className="text-[var(--text-muted)]" />
                <p className="mt-2 text-[12px] font-medium text-[var(--foreground)]">No versions</p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {versions.map((v) => {
                const isCurrent = v.id === currentVersionId;
                return (
                    <div
                        key={v.id}
                        className={`cursor-pointer rounded-lg border p-2.5 transition hover:bg-[var(--surface-2)] ${isCurrent ? 'border-[var(--accent)] bg-[var(--accent)]/5' : 'border-[var(--border)]'}`}
                        onClick={() => onSwitchVersion?.(v.id)}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <p className="text-[12px] font-semibold text-[var(--foreground)]">{v.label}</p>
                                {isCurrent && <Chip size="sm" variant="flat" color="primary" className="h-5 text-[9px]">Current</Chip>}
                            </div>
                            <Chip size="sm" variant="flat" className="h-5 text-[9px]" color={v.status === 'approved' ? 'success' : v.status === 'rejected' ? 'danger' : 'warning'}>
                                {v.status}
                            </Chip>
                        </div>
                        {v.uploadedBy?.name ? (
                            <p className="mt-1 text-[10px] text-[var(--text-muted)]">{v.uploadedBy.name} · {v.createdAt ? formatDate(v.createdAt) : ''}</p>
                        ) : null}
                    </div>
                );
            })}
        </div>
    );
}

function ActivityContent({ activities }: { activities: ProjectDesignActivity[] | null }) {
    if (!activities?.length) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <Activity size={24} className="text-[var(--text-muted)]" />
                <p className="mt-2 text-[12px] font-medium text-[var(--foreground)]">No activity yet</p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {activities.map((a) => (
                <div key={a.id} className="flex items-start gap-2 rounded-lg border border-[var(--border)] p-2.5">
                    <div className="mt-0.5 shrink-0">
                        <div className="size-2 rounded-full bg-[var(--accent)]" />
                    </div>
                    <div>
                        <p className="text-[12px] font-medium text-[var(--foreground)]">{a.action}</p>
                        {a.description && <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">{a.description}</p>}
                        <div className="mt-1 flex items-center gap-2 text-[10px] text-[var(--text-muted)]">
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
            <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">{title}</h4>
            <div className="space-y-1.5 text-[12px]">{children}</div>
        </div>
    );
}

function DetailItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode | string }) {
    return (
        <div className="flex items-center gap-2">
            <span className="shrink-0 text-[var(--text-muted)]">{icon}</span>
            <span className="text-[var(--text-muted)]">{label}:</span>
            <span className="font-medium text-[var(--foreground)]">{value}</span>
        </div>
    );
}

function summarizeAssets(assets: ProjectDesignAsset[]): string {
    const parts: string[] = [];
    const pdfs = assets.filter(a => a.mimeType === 'application/pdf');
    const ifcs = assets.filter(a => a.extension === 'ifc');
    const sources = assets.filter(a => a.assetType === 'source');
    const images = assets.filter(a => a.mimeType.startsWith('image/'));
    if (sources.length) parts.push(`Source: ${sources.length}`);
    if (pdfs.length) parts.push(`PDF: ${pdfs.length}`);
    if (ifcs.length) parts.push(`IFC: ${ifcs.length}`);
    if (images.length) parts.push(`Images: ${images.length}`);
    return parts.join(' · ') || `${assets.length} asset(s)`;
}
