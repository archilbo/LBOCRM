import type { ProjectDesignAsset, FormatCapability } from '@/features/project-design/types/projectDesign';

export type ViewerType = 'pdf' | 'image' | 'ifc-3d' | 'autodesk-2d' | 'autodesk-3d' | 'source-fallback' | 'converting' | 'failed';

export interface ResolvedViewer {
    type: ViewerType;
    asset: ProjectDesignAsset;
    fallbackMessage?: string;
}

const VIEWER_MIME_TYPES = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];

function isDirectPreview(asset: ProjectDesignAsset): boolean {
    return asset.previewable && VIEWER_MIME_TYPES.includes(asset.mimeType);
}

function isIfc(asset: ProjectDesignAsset): boolean {
    return asset.extension === 'ifc' || asset.mimeType === 'application/x-step' || asset.mimeType === 'application/x-ifc';
}

function isConverting(asset: ProjectDesignAsset): boolean {
    if (!asset.conversionStatus) return false;
    return ['uploaded', 'queued', 'validating', 'converting', 'extracting_metadata', 'generating_thumbnails'].includes(asset.conversionStatus);
}

function isFailed(asset: ProjectDesignAsset): boolean {
    return asset.conversionStatus === 'failed';
}

function is2dCategory(category?: string): boolean {
    return category === 'cad' || category === 'document' || category === 'image' || !category;
}

function is3dCategory(category?: string): boolean {
    return category === 'bim' || category === '3d-model';
}

export function resolveProjectDesignViewer(
    assets: ProjectDesignAsset[],
    selectedAssetId?: number | null,
): ResolvedViewer {
    if (!assets.length) {
        throw new Error('No assets to resolve viewer for');
    }

    // 1. If a specific asset is selected and valid, use it
    if (selectedAssetId) {
        const selected = assets.find(a => a.id === selectedAssetId);
        if (selected) {
            if (isDirectPreview(selected)) {
                return { type: selected.mimeType === 'application/pdf' ? 'pdf' : 'image', asset: selected };
            }
            if (isIfc(selected)) {
                return { type: 'ifc-3d', asset: selected };
            }
            if (isConverting(selected)) {
                return { type: 'converting', asset: selected };
            }
            if (isFailed(selected)) {
                return { type: 'failed', asset: selected };
            }
            return {
                type: 'source-fallback',
                asset: selected,
                fallbackMessage: selected.formatCapability?.fallbackMessage ?? undefined,
            };
        }
    }

    const firstAsset = assets[0];
    const cap = firstAsset.formatCapability;
    const category = cap?.category;

    // Determine priority based on category
    const is2d = is2dCategory(category);
    const is3d = is3dCategory(category);

    // For 2D: PDF > image > Autodesk 2D > source fallback
    if (is2d) {
        const pdf = assets.find(a => a.mimeType === 'application/pdf' && a.previewable);
        if (pdf) return { type: 'pdf', asset: pdf };

        const img = assets.find(a => a.mimeType.startsWith('image/') && a.previewable);
        if (img) return { type: 'image', asset: img };

        const autodesk2d = assets.find(a => a.formatCapability?.supportedViewer === 'autodesk-2d');
        if (autodesk2d) return { type: 'autodesk-2d', asset: autodesk2d };
    }

    // For 3D: IFC > Autodesk 3D > image > source fallback
    if (is3d) {
        const ifcAsset = assets.find(a => isIfc(a));
        if (ifcAsset) return { type: 'ifc-3d', asset: ifcAsset };

        const autodesk3d = assets.find(a => a.formatCapability?.supportedViewer === 'autodesk-3d');
        if (autodesk3d) return { type: 'autodesk-3d', asset: autodesk3d };

        const img = assets.find(a => a.mimeType.startsWith('image/') && a.previewable);
        if (img) return { type: 'image', asset: img };
    }

    // Fallback to any previewable, or first non-converting source
    const anyPreview = assets.find(a => isDirectPreview(a));
    if (anyPreview) {
        return { type: anyPreview.mimeType === 'application/pdf' ? 'pdf' : 'image', asset: anyPreview };
    }

    const converting = assets.find(a => isConverting(a));
    if (converting) return { type: 'converting', asset: converting };

    const failed = assets.find(a => isFailed(a));
    if (failed) return { type: 'failed', asset: failed };

    // Default to first asset as source fallback
    return {
        type: 'source-fallback',
        asset: firstAsset,
        fallbackMessage: firstAsset.formatCapability?.fallbackMessage ?? undefined,
    };
}

export function getReviewAssets(assets: ProjectDesignAsset[]): {
    review: ProjectDesignAsset[];
    ifc: ProjectDesignAsset[];
    source: ProjectDesignAsset[];
    converting: ProjectDesignAsset[];
    failed: ProjectDesignAsset[];
} {
    const review: ProjectDesignAsset[] = [];
    const ifc: ProjectDesignAsset[] = [];
    const source: ProjectDesignAsset[] = [];
    const converting: ProjectDesignAsset[] = [];
    const failed: ProjectDesignAsset[] = [];

    for (const a of assets) {
        if (isDirectPreview(a)) review.push(a);
        else if (isIfc(a)) ifc.push(a);
        else if (isConverting(a)) converting.push(a);
        else if (isFailed(a)) failed.push(a);
        else source.push(a);
    }

    return { review, ifc, source, converting, failed };
}
