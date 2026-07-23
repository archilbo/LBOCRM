import { useCallback } from 'react';
import type { DesignMode } from '../types/projectDesign';

export type InspectorTab = 'remarks' | 'details' | 'versions' | 'activity';

export interface WorkspaceState {
    mode: DesignMode;
    fileId: number | null;
    versionId: number | null;
    assetId: number | null;
    pageNumber: number | null;
    remarkId: number | null;
    inspectorTab: InspectorTab;
}

export function parseWorkspaceState(urlState?: { mode?: string; file?: string; version?: string; asset?: string; page?: string; remark?: string; inspector?: string }): WorkspaceState {
    const normalizedMode = urlState?.mode === 'review-queue' ? 'reviews' : urlState?.mode;
    const mode = normalizedMode === 'reviews' || normalizedMode === 'remarks' || normalizedMode === 'activity'
        ? (normalizedMode as DesignMode)
        : 'files';
    const inspectorTab = (urlState?.inspector === 'details' || urlState?.inspector === 'versions' || urlState?.inspector === 'activity')
        ? urlState.inspector as InspectorTab
        : 'remarks';
    return {
        mode,
        fileId: urlState?.file ? parseInt(urlState.file, 10) || null : null,
        versionId: urlState?.version ? parseInt(urlState.version, 10) || null : null,
        assetId: urlState?.asset ? parseInt(urlState.asset, 10) || null : null,
        pageNumber: urlState?.page ? parseInt(urlState.page, 10) || null : null,
        remarkId: urlState?.remark ? parseInt(urlState.remark, 10) || null : null,
        inspectorTab,
    };
}

export type WorkspaceUpdate = { mode?: string; file?: string; version?: string; asset?: string; page?: string; remark?: string; inspector?: string };

export function useWorkspaceNavigation(onNavigate?: (updates: WorkspaceUpdate) => void) {
    const navigateFile = useCallback((fileId: number | null) => {
        onNavigate?.({ file: fileId?.toString() ?? '', version: '', asset: '', page: '', remark: '', inspector: '' });
    }, [onNavigate]);

    const navigateVersion = useCallback((fileId: number | null, versionId: number | null) => {
        onNavigate?.({ file: fileId?.toString() ?? '', version: versionId?.toString() ?? '', asset: '', page: '', remark: '' });
    }, [onNavigate]);

    const navigateRemark = useCallback((fileId: number | null, versionId: number | null, remarkId: number | null) => {
        onNavigate?.({
            file: fileId?.toString() ?? '',
            version: versionId?.toString() ?? '',
            asset: '', page: '',
            remark: remarkId?.toString() ?? '',
        });
    }, [onNavigate]);

    const navigateAsset = useCallback((fileId: number | null, versionId: number | null, assetId: number | null) => {
        onNavigate?.({ file: fileId?.toString() ?? '', version: versionId?.toString() ?? '', asset: assetId?.toString() ?? '' });
    }, [onNavigate]);

    return { navigateFile, navigateVersion, navigateRemark, navigateAsset };
}
