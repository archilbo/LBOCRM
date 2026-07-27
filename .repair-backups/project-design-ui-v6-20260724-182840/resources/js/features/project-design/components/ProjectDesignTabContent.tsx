import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePage } from '@inertiajs/react';
import {
    FileWarning,
    FolderOpen,
    Loader2,
    NotebookTabs,
    PanelLeft,
    PanelRight,
    Undo2,
} from 'lucide-react';
import { Button, Chip, Tooltip } from '@heroui/react';
import { AppButton } from '@/components/ui/AppButton';
import { ProjectDesignFileBrowser } from './ProjectDesignFileBrowser';
import {
    ProjectDesignEditorToolbar,
    type ProjectDesignAnnotationToolbarState,
    type ProjectDesignEditorToolbarState,
} from './ProjectDesignEditorToolbar';
import { ProjectDesignEditorLayout } from './ProjectDesignEditorLayout';
import {
    ProjectDesignLayoutContext,
    type ProjectDesignLayoutControls,
} from './ProjectDesignLayoutContext';
import { DesignReviewQueue } from '@/features/dossiers/components/DesignReviewQueue';
import { DesignRemarksTab } from '@/features/dossiers/components/DesignRemarksTab';
import { ProjectDesignActivityFeed } from './ProjectDesignActivityFeed';
import { DesignViewerTabs } from '@/features/dossiers/components/DesignViewerTabs';
import { DesignInspector } from '@/features/dossiers/components/DesignInspector';
import { resolveProjectDesignViewer } from '@/features/dossiers/utils/viewerResolver';
import { useActivity, useFileDetail, useRemarks, useVersions } from '../hooks/useProjectDesignQueries';
import { useProjectDesignViewerController } from '../viewer/useProjectDesignViewerController';
import type { DesignMode, ProjectDesignFile } from '../types/projectDesign';
import type { WorkspaceState, WorkspaceUpdate } from '../hooks/useProjectDesignWorkspace';

const MODES: { id: DesignMode; label: string }[] = [
    { id: 'files', label: 'Files' },
    { id: 'reviews', label: 'Review Queue' },
    { id: 'remarks', label: 'Remarks' },
    { id: 'activity', label: 'Activity' },
];

const EMPTY_ANNOTATION_COMMANDS: ProjectDesignAnnotationToolbarState = {
    saving: false,
    hasUnsaved: false,
    canRemark: false,
};

const EMPTY_LAYOUT_CONTROLS: ProjectDesignLayoutControls = {
    toggleBrowser: () => undefined,
    toggleInspector: () => undefined,
    openBrowser: () => undefined,
    openInspector: () => undefined,
    closeBrowser: () => undefined,
    closeInspector: () => undefined,
    browserAvailable: false,
    inspectorAvailable: false,
};

function IconControl({
    label,
    onPress,
    children,
}: {
    label: string;
    onPress: () => void;
    children: React.ReactNode;
}) {
    return (
        <Tooltip>
            <Button
                isIconOnly
                size="sm"
                variant="ghost"
                className="h-8 w-8 min-w-0 rounded-lg border border-transparent text-[var(--text-muted)] hover:border-[var(--border)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]"
                aria-label={label}
                onPress={onPress}
            >
                {children}
            </Button>
            <Tooltip.Content className="border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] shadow-xl">
                {label}
            </Tooltip.Content>
        </Tooltip>
    );
}

export function ProjectDesignTabContent({
    dossierId,
    workspaceState,
    onModeChange,
    onFileSelect,
    onNavigate,
}: {
    dossierId: number;
    workspaceState: WorkspaceState;
    onModeChange: (mode: DesignMode) => void;
    onFileSelect: (file: ProjectDesignFile) => void;
    onNavigate?: (updates: WorkspaceUpdate) => void;
}) {
    const { mode } = workspaceState;
    const { data: selectedFile, isLoading: loadingFile } = useFileDetail(
        dossierId,
        workspaceState.fileId,
    );
    const navigate = useCallback(
        (updates: WorkspaceUpdate) => onNavigate?.(updates),
        [onNavigate],
    );

    return (
        <div className="project-design-editor-active flex h-full min-h-0 flex-col overflow-hidden">
            {workspaceState.fileId && mode === 'files' ? (
                loadingFile ? (
                    <div className="flex flex-1 items-center justify-center bg-[var(--surface-2)]/30">
                        <Loader2 size={20} className="animate-spin text-[var(--accent)]" />
                    </div>
                ) : selectedFile ? (
                    <EditorWorkspace
                        key={`${selectedFile.id}-${workspaceState.versionId ?? 'latest'}`}
                        dossierId={dossierId}
                        selectedFile={selectedFile}
                        workspaceState={workspaceState}
                        onNavigate={navigate}
                    />
                ) : (
                    <div className="flex flex-1 items-center justify-center p-8 text-center">
                        <div>
                            <FileWarning size={30} className="mx-auto text-amber-400" />
                            <p className="mt-3 text-sm font-medium text-[var(--foreground)]">Design file not found</p>
                            <AppButton
                                size="sm"
                                className="mt-4"
                                onPress={() => navigate({ file: '', version: '', asset: '', page: '', remark: '' })}
                            >
                                Back to files
                            </AppButton>
                        </div>
                    </div>
                )
            ) : (
                <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
                    <div className="flex shrink-0 items-center justify-between border-b border-[var(--border)] px-4 py-3">
                        <div className="min-w-0">
                            <span className="flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
                                <span className="flex size-8 items-center justify-center rounded-lg bg-[var(--accent)]/10 text-[var(--accent)]">
                                    <NotebookTabs size={15} />
                                </span>
                                Project Design
                            </span>
                            <p className="mt-1 text-[11px] text-[var(--text-muted)]">
                                Design files, revisions, review decisions and remarks.
                            </p>
                        </div>
                    </div>

                    <div className="app-scrollbar flex shrink-0 items-center gap-1 overflow-x-auto border-b border-[var(--border)] bg-[var(--surface-2)]/30 px-2 py-1.5">
                        {MODES.map((item) => (
                            <button
                                key={item.id}
                                type="button"
                                role="tab"
                                aria-selected={mode === item.id}
                                onClick={() => onModeChange(item.id)}
                                className={[
                                    'rounded-lg border px-3 py-1.5 text-[12px] font-medium outline-none transition whitespace-nowrap',
                                    mode === item.id
                                        ? 'border-[var(--accent)]/30 bg-[var(--accent)]/10 text-[var(--accent)]'
                                        : 'border-transparent text-[var(--text-muted)] hover:border-[var(--border)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]',
                                ].join(' ')}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>

                    <div className="project-design-editor-scroll-root min-h-0 flex-1 overflow-y-auto p-4">
                        {mode === 'files' ? (
                            <ProjectDesignFileBrowser
                                dossierId={dossierId}
                                onFileSelect={onFileSelect}
                                selectedFileId={workspaceState.fileId}
                            />
                        ) : null}
                        {mode === 'reviews' ? <DesignReviewQueue dossierId={dossierId} /> : null}
                        {mode === 'remarks' ? <DesignRemarksTab dossierId={dossierId} /> : null}
                        {mode === 'activity' ? <ProjectDesignActivityFeed dossierId={dossierId} /> : null}
                    </div>
                </div>
            )}
        </div>
    );
}

function EditorWorkspace({
    dossierId,
    selectedFile,
    workspaceState,
    onNavigate,
}: {
    dossierId: number;
    selectedFile: ProjectDesignFile;
    workspaceState: WorkspaceState;
    onNavigate?: (updates: WorkspaceUpdate) => void;
}) {
    const controller = useProjectDesignViewerController({
        pageNumber: workspaceState.pageNumber ?? 1,
    });
    const {
        state: viewerState,
        setZoom,
        setViewport,
        panTo,
        resetViewport,
        rotate,
        setActiveTool,
        setPageNumber,
        setTotalPages,
        setFullscreen,
        toggleFullscreen,
        registerViewerAPI,
        fitWidth,
        fitPage,
    } = controller;
    const {
        activeTool,
        zoom,
        panX,
        panY,
        rotation,
        fullscreen,
        pageNumber,
        totalPages,
    } = viewerState;
    const [layoutControls, setLayoutControls] = useState<ProjectDesignLayoutControls>(EMPTY_LAYOUT_CONTROLS);
    const [annotationCommands, setAnnotationCommands] = useState<ProjectDesignAnnotationToolbarState>(EMPTY_ANNOTATION_COMMANDS);
    const { data: versionsData, isLoading: loadingVersions } = useVersions(dossierId, selectedFile.id);
    const { data: remarksData } = useRemarks(dossierId, {});
    const { data: activityData } = useActivity(dossierId);
    const versions = versionsData?.data ?? [];

    const navigate = useCallback(
        (updates: WorkspaceUpdate) => onNavigate?.(updates),
        [onNavigate],
    );

    const requestedVersion = workspaceState.versionId
        ? versions.find((version) => version.id === workspaceState.versionId) ?? null
        : null;
    const version = workspaceState.versionId ? requestedVersion : selectedFile.latestVersion;
    const requestedVersionMissing = Boolean(
        workspaceState.versionId
        && !loadingVersions
        && versions.length > 0
        && !requestedVersion,
    );
    const assets = version?.assets ?? [];
    const defaultAsset = assets.length > 0 ? resolveProjectDesignViewer(assets).asset : null;
    const requestedAsset = workspaceState.assetId
        ? assets.find((asset) => asset.id === workspaceState.assetId) ?? null
        : null;
    const activeAsset = requestedAsset ?? (workspaceState.assetId == null ? defaultAsset : null);
    const requestedAssetMissing = Boolean(workspaceState.assetId && !requestedAsset);

    const authUser = ((usePage().props as Record<string, unknown>).auth as {
        user?: { id: number; companyId?: number };
    } | undefined)?.user;
    const userId = authUser?.id;
    const companyId = authUser?.companyId ?? null;

    useEffect(() => {
        const requestedPage = workspaceState.pageNumber ?? 1;
        if (requestedPage !== pageNumber) {
            setPageNumber(requestedPage);
        }
    }, [pageNumber, setPageNumber, workspaceState.pageNumber]);

    const previousAssetIdRef = useRef<number | null>(null);

    useEffect(() => {
        const previousAssetId = previousAssetIdRef.current;
        if (activeAsset && previousAssetId !== activeAsset.id) {
            if (previousAssetId != null) resetViewport();
            setTotalPages(1);
            setPageNumber(1);
            previousAssetIdRef.current = activeAsset.id;
        }
    }, [activeAsset, resetViewport, setPageNumber, setTotalPages]);

    useEffect(() => {
        const root = document.documentElement;
        root.classList.add('pd-editor-workspace-open');
        root.classList.toggle('pd-editor-fullscreen', fullscreen);

        return () => {
            root.classList.remove('pd-editor-workspace-open');
            root.classList.remove('pd-editor-fullscreen');
        };
    }, [fullscreen]);

    const handleControlsReady = registerViewerAPI;

    const handlePageChange = useCallback((page: number) => {
        setPageNumber(page);
        navigate({ page: String(page) });
    }, [navigate, setPageNumber]);

    const handleTotalPages = useCallback((total: number) => {
        setTotalPages(total);
        if (pageNumber > total) {
            const page = Math.max(1, total);
            setPageNumber(page);
            navigate({ page: String(page) });
        }
    }, [navigate, pageNumber, setPageNumber, setTotalPages]);

    const handleAnnotationCommands = useCallback((next: ProjectDesignAnnotationToolbarState) => {
        setAnnotationCommands((current) => (
            current.onSave === next.onSave
            && current.onRemark === next.onRemark
            && current.saving === next.saving
            && current.hasUnsaved === next.hasUnsaved
            && current.canRemark === next.canRemark
                ? current
                : next
        ));
    }, []);

    const toolbarState = useMemo<ProjectDesignEditorToolbarState>(() => ({
        activeTool: activeTool,
        onToolChange: setActiveTool,
        zoom: zoom,
        panX: panX,
        panY: panY,
        onZoomChange: setZoom,
        onPanChange: panTo,
        onViewportChange: setViewport,
        rotation: rotation,
        onRotate: rotate,
        fullscreen: fullscreen,
        onFullscreenToggle: toggleFullscreen,
        onFullscreenChange: setFullscreen,
        onFitWidth: fitWidth,
        onFitPage: fitPage,
        pageNumber: pageNumber,
        totalPages: totalPages,
        onPageChange: handlePageChange,
        downloadUrl: activeAsset?.downloadUrl ?? undefined,
        suppressAnnotations: activeAsset?.assetType === 'source',
        onSave: annotationCommands.onSave,
        onRemark: annotationCommands.onRemark,
        saving: annotationCommands.saving,
        hasUnsaved: annotationCommands.hasUnsaved,
        canRemark: annotationCommands.canRemark,
        continuous: false,
    }), [
        activeAsset?.assetType,
        activeAsset?.downloadUrl,
        activeTool,
        annotationCommands,
        fitPage,
        fitWidth,
        fullscreen,
        handlePageChange,
        pageNumber,
        panTo,
        panX,
        panY,
        rotate,
        rotation,
        setActiveTool,
        setFullscreen,
        setViewport,
        setZoom,
        toggleFullscreen,
        totalPages,
        zoom,
    ]);

    if (workspaceState.versionId && loadingVersions && !requestedVersion) {
        return (
            <div className="flex flex-1 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)]">
                <Loader2 size={20} className="animate-spin text-[var(--accent)]" />
            </div>
        );
    }

    if (requestedVersionMissing) {
        return (
            <StaleEditorContext
                title="Selected version is no longer available"
                description="Return to the latest version and update the editor link."
                onReset={() => navigate({ version: '', asset: '', page: '', remark: '' })}
            />
        );
    }

    if (!version || !assets.length) {
        const description = !version
            ? 'This file has no uploaded versions yet.'
            : 'The selected version has no assets.';

        return (
            <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center">
                <FileWarning size={34} className="text-amber-400" />
                <p className="mt-3 text-sm font-medium text-[var(--foreground)]">No assets available</p>
                <p className="mt-1 text-xs text-[var(--text-muted)]">{description}</p>
                <AppButton
                    size="sm"
                    className="mt-4 h-8 text-[11px]"
                    onPress={() => navigate({ file: '', version: '', asset: '', page: '', remark: '', mode: 'files' })}
                >
                    <Undo2 size={13} />
                    Back to files
                </AppButton>
            </div>
        );
    }

    if (requestedAssetMissing || !activeAsset) {
        return (
            <StaleEditorContext
                title="Selected asset is no longer available"
                description="Open an available source or review asset to repair the editor link."
                onReset={() => navigate({ asset: '', page: '', remark: '' })}
            />
        );
    }

    const editorClassName = fullscreen
        ? 'fixed inset-0 z-[120] flex h-dvh w-screen flex-col overflow-hidden bg-[#0d0f11] p-2 sm:p-3'
        : 'project-design-editor-scroll-root flex h-full min-h-0 flex-col overflow-hidden';

    return (
        <ProjectDesignLayoutContext.Provider value={layoutControls}>
            <div className={editorClassName}>
                <div className="flex shrink-0 items-center gap-2 rounded-t-xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_96%,transparent)] px-2 py-1.5 shadow-sm backdrop-blur">
                    <IconControl
                        label={layoutControls.browserAvailable ? 'Toggle file browser' : 'Open file browser'}
                        onPress={layoutControls.browserAvailable ? layoutControls.toggleBrowser : layoutControls.openBrowser}
                    >
                        <PanelLeft size={15} />
                    </IconControl>

                    <div className="hidden min-w-0 max-w-[220px] shrink-0 items-center gap-2 border-r border-[var(--border)] pr-2 md:flex">
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)]/10 text-[var(--accent)]">
                            <FolderOpen size={13} />
                        </span>
                        <div className="min-w-0">
                            <p className="truncate text-[11px] font-semibold text-[var(--foreground)]">{selectedFile.name}</p>
                            <div className="mt-0.5 flex items-center gap-1.5">
                                <Chip size="sm" variant="soft" className="h-4 px-1 text-[8px]">{version.label}</Chip>
                                <span className="truncate text-[9px] text-[var(--text-muted)]">{activeAsset.originalFilename}</span>
                            </div>
                        </div>
                    </div>

                    <div className="min-w-0 flex-1">
                        <ProjectDesignEditorToolbar {...toolbarState} />
                    </div>

                    <IconControl
                        label={layoutControls.inspectorAvailable ? 'Toggle inspector' : 'Open inspector'}
                        onPress={layoutControls.inspectorAvailable ? layoutControls.toggleInspector : layoutControls.openInspector}
                    >
                        <PanelRight size={15} />
                    </IconControl>
                </div>

                <div className="relative min-h-0 flex-1">
                    <ProjectDesignEditorLayout
                        fullscreen={fullscreen}
                        onFullscreenToggle={toggleFullscreen}
                        userId={userId}
                        companyId={companyId}
                        onControlsChange={setLayoutControls}
                        browser={(
                            <ProjectDesignFileBrowser
                                dossierId={dossierId}
                                onFileSelect={(file) => navigate({
                                    file: String(file.id),
                                    version: '',
                                    asset: '',
                                    page: '',
                                    remark: '',
                                })}
                                selectedFileId={selectedFile.id}
                            />
                        )}
                        viewer={(
                            <DesignViewerTabs
                                assets={assets}
                                dossierId={dossierId}
                                versionId={version.id}
                                fileMeta={selectedFile}
                                activeAssetId={activeAsset.id}
                                onAssetChange={(id) => navigate({ asset: String(id), page: '', remark: '' })}
                                onOpenReviewAsset={(asset) => navigate({ asset: String(asset.id), page: '', remark: '' })}
                                pageNumber={pageNumber}
                                onPageNumberChange={handlePageChange}
                                viewerToolbar={toolbarState}
                                onControlsReady={handleControlsReady}
                                onTotalPages={handleTotalPages}
                                onToolbarStateChange={handleAnnotationCommands}
                            />
                        )}
                        inspector={(
                            <DesignInspector
                                file={selectedFile}
                                versions={versions}
                                assets={assets}
                                activeAsset={activeAsset}
                                remarks={(remarksData?.data ?? []).filter((remark) => remark.versionId === version.id)}
                                activities={activityData?.data ?? null}
                                activeTab={workspaceState.inspectorTab}
                                onTabChange={(tab) => navigate({ inspector: tab })}
                                onOpenReviewAsset={(asset) => navigate({ asset: String(asset.id), page: '', remark: '' })}
                                onSwitchVersion={(versionId) => navigate({ version: String(versionId), asset: '', page: '', remark: '' })}
                            />
                        )}
                    />
                </div>

                <div className="flex h-7 shrink-0 items-center justify-between rounded-b-xl border-x border-b border-[var(--border)] bg-[var(--surface)] px-3 text-[10px] text-[var(--text-muted)]">
                    <div className="flex min-w-0 items-center gap-2">
                        <span className="truncate">{selectedFile.name}</span>
                        <span className="text-[var(--text-subtle)]">·</span>
                        <span className="truncate">{activeAsset.originalFilename}</span>
                        {annotationCommands.hasUnsaved ? (
                            <span className="flex items-center gap-1 text-amber-300">
                                <span className="size-1.5 rounded-full bg-amber-400" />
                                Unsaved markup
                            </span>
                        ) : null}
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                        <span>{version.label}</span>
                        <span className={[
                            'size-1.5 rounded-full',
                            version.status === 'approved'
                                ? 'bg-emerald-500'
                                : version.status === 'rejected'
                                    ? 'bg-red-500'
                                    : 'bg-amber-500',
                        ].join(' ')} />
                        <span className="capitalize">{version.status.replace('_', ' ')}</span>
                    </div>
                </div>
            </div>
        </ProjectDesignLayoutContext.Provider>
    );
}

function StaleEditorContext({
    title,
    description,
    onReset,
}: {
    title: string;
    description: string;
    onReset: () => void;
}) {
    return (
        <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center">
            <FileWarning size={34} className="text-amber-400" />
            <p className="mt-3 text-sm font-medium text-[var(--foreground)]">{title}</p>
            <p className="mt-1 max-w-md text-xs text-[var(--text-muted)]">{description}</p>
            <AppButton size="sm" className="mt-4" onPress={onReset}>
                Repair editor context
            </AppButton>
        </div>
    );
}
