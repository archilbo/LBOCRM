import { useCallback } from 'react';
import type { DesignMode } from '../types/projectDesign';

export interface WorkspaceState {
    mode: DesignMode;
    fileId: number | null;
    versionId: number | null;
    remarkId: number | null;
}

export function parseWorkspaceState(urlState?: { mode?: string; file?: string; version?: string; remark?: string }): WorkspaceState {
    const normalizedMode = urlState?.mode === 'review-queue' ? 'reviews' : urlState?.mode;
    const mode = normalizedMode === 'reviews' || normalizedMode === 'remarks' || normalizedMode === 'activity'
        ? (normalizedMode as DesignMode)
        : 'files';
    return {
        mode,
        fileId: urlState?.file ? parseInt(urlState.file, 10) || null : null,
        versionId: urlState?.version ? parseInt(urlState.version, 10) || null : null,
        remarkId: urlState?.remark ? parseInt(urlState.remark, 10) || null : null,
    };
}

export function useWorkspaceNavigation(onNavigate?: (updates: { mode?: string; file?: string; version?: string; remark?: string }) => void) {
    const navigateFile = useCallback((fileId: number | null) => {
        onNavigate?.({ file: fileId?.toString() ?? '', version: '', remark: '' });
    }, [onNavigate]);

    const navigateVersion = useCallback((fileId: number | null, versionId: number | null) => {
        onNavigate?.({ file: fileId?.toString() ?? '', version: versionId?.toString() ?? '', remark: '' });
    }, [onNavigate]);

    const navigateRemark = useCallback((fileId: number | null, versionId: number | null, remarkId: number | null) => {
        onNavigate?.({
            file: fileId?.toString() ?? '',
            version: versionId?.toString() ?? '',
            remark: remarkId?.toString() ?? '',
        });
    }, [onNavigate]);

    return { navigateFile, navigateVersion, navigateRemark };
}
