import { Download, ArrowUpFromLine, FileWarning, Info, HardDrive, Shield, Clock, User, FileText, Package, Wrench, Image, Box } from 'lucide-react';
import { Button, Chip } from '@heroui/react';
import { formatFileSize, formatDate } from '@/lib/formatters';
import type { ProjectDesignAsset, ProjectDesignFile } from '@/features/project-design/types/projectDesign';

const APP_ICONS: Record<string, string> = {
    'Graphisoft Archicad': '🏗️',
    'Autodesk AutoCAD': '📐',
    'Autodesk Revit': '🏛️',
    'Trimble SketchUp': '📦',
};

export function DesignSourceInfo({ asset, fileMeta, reviewAssets, onUploadDerivative, onOpenReviewAsset }: {
    asset: ProjectDesignAsset;
    fileMeta?: ProjectDesignFile | null;
    reviewAssets?: ProjectDesignAsset[];
    onUploadDerivative?: () => void;
    onOpenReviewAsset?: (asset: ProjectDesignAsset) => void;
}) {
    const cap = asset.formatCapability;
    const fallbackMsg = cap?.fallbackMessage ?? `${asset.extension.toUpperCase()} files require a compatible desktop application to view.`;
    const application = cap?.application ?? null;
    const versionLabel = fileMeta?.latestVersion?.label ?? '';
    const uploadedBy = fileMeta?.latestVersion?.uploadedBy;
    const uploadedAt = fileMeta?.latestVersion?.createdAt;
    const scanColor = asset.scanStatus === 'clean' ? 'success' : asset.scanStatus === 'failed' ? 'danger' : 'warning';
    const scanLabel = asset.scanStatus ? asset.scanStatus.charAt(0).toUpperCase() + asset.scanStatus.slice(1) : 'Pending';
    const appIcon = APP_ICONS[application ?? ''] ?? '📄';
    const hasReviewAssets = reviewAssets && reviewAssets.length > 0;

    return (
        <div className="mx-auto flex w-full max-w-[720px] flex-col gap-5 p-6">
            {/* Review asset selector */}
            {hasReviewAssets && (
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3">
                    <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
                        Review Assets
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                        <Chip size="sm" variant="flat" color="default" startContent={<HardDrive size={12} />}>
                            Source {asset.extension.toUpperCase()}
                        </Chip>
                        {reviewAssets.map((ra) => (
                            <Chip
                                key={ra.id}
                                size="sm"
                                variant="flat"
                                color={ra.mimeType === 'application/pdf' ? 'primary' : 'default'}
                                startContent={ra.mimeType === 'application/pdf' ? <FileText size={12} /> : <Image size={12} />}
                                onClick={() => onOpenReviewAsset?.(ra)}
                                className="cursor-pointer transition hover:opacity-80"
                            >
                                {ra.originalFilename}
                            </Chip>
                        ))}
                    </div>
                </div>
            )}

            {/* Main info card */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
                <div className="flex items-start gap-4">
                    <div className="flex size-14 items-center justify-center rounded-xl bg-[var(--surface-2)] text-2xl">
                        {appIcon}
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className="text-base font-semibold text-[var(--foreground)]">{cap?.label ?? asset.extension.toUpperCase()}</h3>
                        <p className="mt-0.5 truncate text-[12px] text-[var(--text-muted)]">{asset.originalFilename}</p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                            <Chip size="sm" variant="flat" color="default" startContent={<HardDrive size={11} />}>
                                Source stored
                            </Chip>
                            <Chip size="sm" variant="flat" color="warning" startContent={<FileWarning size={11} />}>
                                Desktop editing required
                            </Chip>
                            <Chip size="sm" variant="flat" color="danger" startContent={<Shield size={11} />}>
                                Browser preview unavailable
                            </Chip>
                            {hasReviewAssets && (
                                <Chip size="sm" variant="flat" color="success" startContent={<FileText size={11} />}>
                                    {reviewAssets.some(a => a.mimeType === 'application/pdf') ? 'PDF review available' : 'Review available'}
                                </Chip>
                            )}
                        </div>
                    </div>
                </div>

                <div className="my-4 h-px bg-[var(--border)]" />

                {/* Fallback message */}
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800/30 dark:bg-amber-900/10">
                    <div className="flex items-start gap-2">
                        <FileWarning size={16} className="mt-0.5 shrink-0 text-amber-500" />
                        <div>
                            <p className="text-[11px] font-medium text-amber-800 dark:text-amber-300">Browser preview unavailable</p>
                            <p className="mt-0.5 text-[10px] text-amber-700 dark:text-amber-400">
                                {fallbackMsg}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="my-4 h-px bg-[var(--border)]" />

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2">
                    {asset.downloadUrl ? (
                        <Button
                            size="sm"
                            variant="bordered"
                            startContent={<Download size={14} />}
                        >
                            <a href={asset.downloadUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5">
                                Download Source
                            </a>
                        </Button>
                    ) : null}
                    {onUploadDerivative && (
                        <Button
                            size="sm"
                            variant="bordered"
                            startContent={<ArrowUpFromLine size={14} />}
                            onPress={onUploadDerivative}
                        >
                            Upload Review Asset
                        </Button>
                    )}
                </div>

                <div className="my-4 h-px bg-[var(--border)]" />

                {/* Source metadata grid */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 text-[11px]">
                    <MetaRow icon={<FileText size={12} />} label="Format" value={asset.extension.toUpperCase()} />
                    <MetaRow icon={<Info size={12} />} label="MIME" value={asset.mimeType} />
                    <MetaRow icon={<HardDrive size={12} />} label="Size" value={formatFileSize(asset.sizeBytes)} />
                    {application && <MetaRow icon={<FileText size={12} />} label="Application" value={application} />}
                    {asset.sourceApplication && <MetaRow icon={<Info size={12} />} label="Source version" value={asset.sourceApplication} />}
                    {versionLabel && <MetaRow icon={<FileText size={12} />} label="Revision" value={versionLabel} />}
                    {uploadedBy && <MetaRow icon={<User size={12} />} label="Uploaded by" value={uploadedBy.name} />}
                    {uploadedAt && <MetaRow icon={<Clock size={12} />} label="Uploaded" value={formatDate(uploadedAt)} />}
                    <MetaRow
                        icon={<Shield size={12} />}
                        label="Scan status"
                        value={<Chip size="sm" variant="flat" color={scanColor as any} className="h-5 text-[9px]">{scanLabel}</Chip>}
                    />
                    {asset.conversionStatus && (
                        <MetaRow
                            icon={<Clock size={12} />}
                            label="Conversion"
                            value={<Chip size="sm" variant="flat" color={asset.conversionStatus === 'ready' ? 'success' : 'warning'} className="h-5 text-[9px]">{asset.conversionStatus}</Chip>}
                        />
                    )}
                </div>
            </div>

            {/* No review assets hint */}
            {!hasReviewAssets && (
                <div className="flex items-center gap-2 rounded-lg border border-dashed border-[var(--border)] px-4 py-3 text-[10px] text-[var(--text-muted)]">
                    <Info size={14} className="shrink-0" />
                    <span>No review assets have been added to this version. Upload a PDF, IFC, or image to enable browser review.</span>
                </div>
            )}
        </div>
    );
}

function MetaRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode | string }) {
    return (
        <div className="flex items-center gap-2">
            <span className="shrink-0 text-[var(--text-muted)]">{icon}</span>
            <span className="text-[var(--text-muted)]">{label}:</span>
            <span className="font-medium text-[var(--foreground)]">{value}</span>
        </div>
    );
}
