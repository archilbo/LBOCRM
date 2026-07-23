import { useState, useMemo } from 'react';
import { FileText, FileImage, Box, HardDrive, Loader2, XCircle } from 'lucide-react';
import { Chip } from '@heroui/react';
import { cn } from '@/lib/cn';
import { DesignFileViewer } from './DesignFileViewer';
import type { ProjectDesignEditorToolbarState } from '@/features/project-design/components/ProjectDesignEditorToolbar';
import { DesignSourceInfo } from './DesignSourceInfo';
import { DesignConversionStatus } from './DesignConversionStatus';
import { resolveProjectDesignViewer, getReviewAssets } from '../utils/viewerResolver';
import type { ProjectDesignAsset, ProjectDesignFile } from '@/features/project-design/types/projectDesign';

export type { ResolvedViewer, ViewerType } from '../utils/viewerResolver';

export function DesignViewerTabs({ assets, dossierId, versionId, fileMeta, onUploadDerivative, onOpenReviewAsset, activeAssetId: externalAssetId, onAssetChange, pageNumber, onPageNumberChange, viewerToolbar, onControlsReady }: {
    assets: ProjectDesignAsset[];
    dossierId: number;
    versionId: number;
    fileMeta?: ProjectDesignFile | null;
    onUploadDerivative?: () => void;
    onOpenReviewAsset?: (asset: ProjectDesignAsset) => void;
    activeAssetId?: number | null;
    onAssetChange?: (assetId: number) => void;
    pageNumber?: number;
    onPageNumberChange?: (page: number) => void;
    viewerToolbar?: ProjectDesignEditorToolbarState;
    onControlsReady?: (controls: { fitWidth: () => void; fitPage: () => void }) => void;
}) {
    const [internalAssetId, setInternalAssetId] = useState<number | null>(null);
    const activeAssetId = externalAssetId ?? internalAssetId;
    const setActiveAssetId = (id: number) => {
        setInternalAssetId(id);
        onAssetChange?.(id);
    };

    const viewer = useMemo(() => resolveProjectDesignViewer(assets, activeAssetId), [assets, activeAssetId]);
    const categorized = useMemo(() => getReviewAssets(assets), [assets]);

    const allTabs = useMemo(() => {
        const tabs: { id: string; label: string; asset: ProjectDesignAsset; group: string }[] = [];
        for (const a of categorized.source) tabs.push({ id: `src-${a.id}`, label: a.originalFilename, asset: a, group: 'Source' });
        for (const a of categorized.review) tabs.push({ id: `rev-${a.id}`, label: a.originalFilename, asset: a, group: 'Review' });
        for (const a of categorized.ifc) tabs.push({ id: `ifc-${a.id}`, label: a.originalFilename, asset: a, group: '3D' });
        for (const a of categorized.converting) tabs.push({ id: `conv-${a.id}`, label: a.originalFilename, asset: a, group: 'Processing' });
        for (const a of categorized.failed) tabs.push({ id: `fail-${a.id}`, label: a.originalFilename, asset: a, group: 'Failed' });
        return tabs;
    }, [categorized]);

    const isSourceAsset = viewer.type === 'source-fallback';
    const isDirectView = viewer.type === 'pdf' || viewer.type === 'image';

    function renderContent() {
        switch (viewer.type) {
            case 'pdf':
            case 'image':
                return (
                    <DesignFileViewer
                        previewUrl={viewer.asset.previewUrl ?? ''}
                        downloadUrl={viewer.asset.downloadUrl ?? ''}
                        mimeType={viewer.asset.mimeType}
                        filename={viewer.asset.originalFilename}
                        assetId={viewer.asset.id}
                        isOpen={true}
                        onClose={() => {}}
                        versionId={versionId}
                        dossierId={dossierId}
                        suppressAnnotations={isSourceAsset}
                        pageNumber={pageNumber}
                        onPageNumberChange={onPageNumberChange}
                        viewerToolbar={viewerToolbar}
                        onControlsReady={onControlsReady}
                    />
                );
            case 'converting':
                return (
                    <DesignConversionStatus
                        conversionStatus={viewer.asset.conversionStatus!}
                        filename={viewer.asset.originalFilename}
                        onRetry={undefined}
                    />
                );
            case 'failed':
                return (
                    <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
                        <XCircle size={40} className="text-red-400" />
                        <p className="text-sm font-medium text-[var(--foreground)]">Conversion failed</p>
                        <p className="text-[12px] text-[var(--text-muted)]">{viewer.asset.originalFilename}</p>
                    </div>
                );
            case 'source-fallback':
            default:
                return (
                    <DesignSourceInfo
                        asset={viewer.asset}
                        fileMeta={fileMeta}
                        reviewAssets={[...categorized.review, ...categorized.ifc]}
                        onUploadDerivative={onUploadDerivative}
                        onOpenReviewAsset={(asset) => {
                            setActiveAssetId(asset.id);
                            onOpenReviewAsset?.(asset);
                        }}
                    />
                );
        }
    }

    return (
        <div className="flex h-full w-full flex-col">
            {/* Asset tabs */}
            {allTabs.length > 1 && (
                <div className="flex items-center gap-0.5 border-b border-[var(--border)] bg-[var(--surface)] px-2 py-1 overflow-x-auto">
                    {['Source', 'Review', '3D', 'Processing', 'Failed'].map((group) => {
                        const groupTabs = allTabs.filter((t) => t.group === group);
                        if (!groupTabs.length) return null;
                        return (
                            <div key={group} className="flex items-center gap-0.5 mr-2">
                                {groupTabs.length > 1 && (
                                    <span className="mr-0.5 px-1 text-[9px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                                        {group}
                                    </span>
                                )}
                                {groupTabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => setActiveAssetId(tab.asset.id)}
                                        className={cn(
                                            'flex items-center gap-1 rounded-md px-2 py-1.5 text-[11px] font-medium transition whitespace-nowrap',
                                            viewer.asset.id === tab.asset.id
                                                ? 'bg-[var(--accent)]/10 text-[var(--accent)]'
                                                : 'text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]',
                                        )}
                                    >
                                        <TabIcon group={group} />
                                        <span className="truncate max-w-[16ch]">{tab.asset.originalFilename}</span>
                                        {tab.group === 'Processing' && <Loader2 size={10} className="animate-spin text-amber-400" />}
                                        {tab.group === 'Failed' && <XCircle size={10} className="text-red-400" />}
                                    </button>
                                ))}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Viewer */}
            <div className="relative flex-1 overflow-hidden bg-[var(--surface-2)]/50">
                {renderContent()}
            </div>
        </div>
    );
}

function TabIcon({ group }: { group: string }) {
    switch (group) {
        case 'Review': return <FileText size={12} />;
        case '3D': return <Box size={12} />;
        case 'Processing': return <Loader2 size={12} className="animate-spin text-amber-400" />;
        case 'Failed': return <XCircle size={12} className="text-red-400" />;
        default: return <HardDrive size={12} />;
    }
}
