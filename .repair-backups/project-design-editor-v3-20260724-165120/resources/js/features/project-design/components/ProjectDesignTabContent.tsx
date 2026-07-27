import { useState, useCallback, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { FolderOpen, NotebookTabs, Undo2, Loader2, FileWarning, PanelLeft, PanelRight } from 'lucide-react';
import { Chip, Tooltip, Button } from '@heroui/react';
import { AppButton } from '@/components/ui/AppButton';
import { ProjectDesignFileBrowser } from './ProjectDesignFileBrowser';
import { ProjectDesignEditorToolbar } from './ProjectDesignEditorToolbar';
import { ProjectDesignEditorLayout } from './ProjectDesignEditorLayout';
import { ProjectDesignLayoutContext, type ProjectDesignLayoutControls } from './ProjectDesignLayoutContext';
import { DesignReviewQueue } from '@/features/dossiers/components/DesignReviewQueue';
import { DesignRemarksTab } from '@/features/dossiers/components/DesignRemarksTab';
import { ProjectDesignActivityFeed } from './ProjectDesignActivityFeed';
import { DesignViewerTabs } from '@/features/dossiers/components/DesignViewerTabs';
import { DesignInspector } from '@/features/dossiers/components/DesignInspector';
import { useFileDetail, useVersions } from '../hooks/useProjectDesignQueries';
import { useProjectDesignViewerController } from '../viewer/useProjectDesignViewerController';
import type { DesignMode, ProjectDesignFile, ProjectDesignAsset } from '../types/projectDesign';
import type { WorkspaceState, WorkspaceUpdate } from '../hooks/useProjectDesignWorkspace';

const MODES: { id: DesignMode; label: string }[] = [
    { id: 'files', label: 'Files' },
    { id: 'reviews', label: 'Review Queue' },
    { id: 'remarks', label: 'Remarks' },
    { id: 'activity', label: 'Activity' },
];

export function ProjectDesignTabContent({ dossierId, workspaceState, onModeChange, onFileSelect, onNavigate }: {
    dossierId: number;
    workspaceState: WorkspaceState;
    onModeChange: (m: DesignMode) => void;
    onFileSelect: (f: ProjectDesignFile) => void;
    onNavigate?: (updates: WorkspaceUpdate) => void;
}) {
    const { mode } = workspaceState;
    const { data: selectedFile, isLoading: loadingFile } = useFileDetail(dossierId, workspaceState.fileId);

    const nav = useCallback((updates: WorkspaceUpdate) => onNavigate?.(updates), [onNavigate]);

    return (
        <div className="flex h-full flex-col overflow-hidden project-design-editor-active">
            {workspaceState.fileId && mode === 'files' ? (
                loadingFile ? (
                    <div className="flex flex-1 items-center justify-center">
                        <Loader2 size={20} className="animate-spin text-[var(--text-muted)]" />
                    </div>
                ) : selectedFile ? (
                    <EditorWorkspace
                        key={`${selectedFile.id}-${workspaceState.versionId}`}
                        dossierId={dossierId}
                        selectedFile={selectedFile}
                        workspaceState={workspaceState}
                        onNavigate={nav}
                    />
                ) : null
            ) : (
                <div className="flex flex-1 flex-col overflow-hidden">
                    <div className="flex items-center gap-2 border-b border-[var(--border)] px-4 py-2">
                        <span className="text-sm font-semibold text-[var(--foreground)]">
                            <NotebookTabs size={16} className="inline mr-1.5 text-[var(--accent)]" />
                            Project Design
                        </span>
                    </div>
                    <div className="flex border-b border-[var(--border)] shrink-0">
                        {MODES.map((m) => (
                            <button key={m.id} type="button" role="tab" aria-selected={mode === m.id}
                                onClick={() => onModeChange(m.id)}
                                className={`relative px-4 py-2 text-[13px] font-medium outline-none transition whitespace-nowrap ${
                                    mode === m.id
                                        ? 'text-[var(--accent)] after:absolute after:bottom-0 after:left-2 after:right-2 after:h-0.5 after:rounded-full after:bg-[var(--accent)]'
                                        : 'text-[var(--text-muted)] hover:text-[var(--foreground)]'
                                }`}>
                                {m.label}
                            </button>
                        ))}
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 project-design-editor-scroll-root">
                        {mode === 'files' && (
                            <ProjectDesignFileBrowser
                                dossierId={dossierId}
                                onFileSelect={(f) => { onFileSelect(f); }}
                                selectedFileId={workspaceState.fileId}
                            />
                        )}
                        {mode === 'reviews' && <DesignReviewQueue dossierId={dossierId} />}
                        {mode === 'remarks' && <DesignRemarksTab dossierId={dossierId} />}
                        {mode === 'activity' && <ProjectDesignActivityFeed dossierId={dossierId} />}
                    </div>
                </div>
            )}
        </div>
    );
}

function EditorWorkspace({ dossierId, selectedFile, workspaceState, onNavigate }: {
    dossierId: number;
    selectedFile: ProjectDesignFile;
    workspaceState: WorkspaceState;
    onNavigate?: (updates: WorkspaceUpdate) => void;
}) {
    const ctrl = useProjectDesignViewerController();
    const [editorFullscreen, setEditorFullscreen] = useState(false);
    const [layoutControls, setLayoutControls] = useState<ProjectDesignLayoutControls>({
        toggleBrowser: () => {}, toggleInspector: () => {},
        openBrowser: () => {}, openInspector: () => {},
        closeBrowser: () => {}, closeInspector: () => {},
        browserAvailable: false, inspectorAvailable: false,
    });

    useEffect(() => {
        const root = document.documentElement;
        root.classList.add('pd-editor-workspace-open');
        if (editorFullscreen) root.classList.add('pd-editor-fullscreen');
        return () => {
            root.classList.remove('pd-editor-workspace-open');
            root.classList.remove('pd-editor-fullscreen');
        };
    }, [editorFullscreen]);

    const { data: versionsData } = useVersions(dossierId, selectedFile.id);
    const versions = versionsData?.data ?? [];
    const version = workspaceState.versionId
        ? versions.find((v) => v.id === workspaceState.versionId) ?? selectedFile.latestVersion
        : selectedFile.latestVersion;
    const assets = version?.assets ?? [];
    const activeAssetId = workspaceState.assetId;

    const nav = useCallback((updates: WorkspaceUpdate) => onNavigate?.(updates), [onNavigate]);

    const authUser = ((usePage().props as Record<string, unknown>).auth as { user?: { id: number; companyId?: number } } | undefined)?.user;
    const userId = authUser?.id;
    const companyId = authUser?.companyId ?? null;

    if (!assets.length) {
        const msg = !version
            ? 'This file has no uploaded versions yet.'
            : 'The latest version has no assets.';
        return (
            <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
                <FileWarning size={32} className="text-amber-400" />
                <p className="mt-3 text-sm font-medium text-[var(--foreground)]">No assets available</p>
                <p className="mt-1 text-xs text-[var(--text-muted)]">{msg}</p>
                <AppButton size="sm" className="mt-4 h-8 text-[11px]"
                    onPress={() => nav({ file: '', version: '', asset: '', page: '', remark: '', mode: 'files' })}>
                    <Undo2 size={13} /> Back to Files
                </AppButton>
            </div>
        );
    }

    return <EditorWorkspaceContent
        dossierId={dossierId}
        selectedFile={selectedFile}
        version={version}
        versions={versions}
        assets={assets}
        activeAssetId={activeAssetId}
        workspaceState={workspaceState}
        onNavigate={nav}
        ctrl={ctrl}
        editorFullscreen={editorFullscreen}
        setEditorFullscreen={setEditorFullscreen}
        setLayoutControls={setLayoutControls}
        layoutControls={layoutControls}
        userId={userId}
        companyId={companyId}
    />;
}

function EditorWorkspaceContent({ dossierId, selectedFile, version, versions, assets, activeAssetId, workspaceState, onNavigate, ctrl, editorFullscreen, setEditorFullscreen, setLayoutControls, layoutControls, userId, companyId }: {
    dossierId: number;
    selectedFile: ProjectDesignFile;
    version: NonNullable<ReturnType<typeof useVersions>['data']>['data'][number] | null;
    versions: NonNullable<ReturnType<typeof useVersions>['data']>['data'];
    assets: ProjectDesignAsset[];
    activeAssetId?: number | null;
    workspaceState: WorkspaceState;
    onNavigate?: (updates: WorkspaceUpdate) => void;
    ctrl: ReturnType<typeof useProjectDesignViewerController>;
    editorFullscreen: boolean;
    setEditorFullscreen: React.Dispatch<React.SetStateAction<boolean>>;
    setLayoutControls: React.Dispatch<React.SetStateAction<ProjectDesignLayoutControls>>;
    layoutControls: ProjectDesignLayoutControls;
    userId: number | undefined;
    companyId: number | null;
}) {
    const viewerAsset = assets.find(a => a.id === activeAssetId) ?? assets[0];
    const nav = useCallback((updates: WorkspaceUpdate) => onNavigate?.(updates), [onNavigate]);

    const handlePageChange = useCallback((p: number) => {
        ctrl.setPageNumber(p);
        nav({ page: String(p) });
    }, [ctrl, nav]);

    const handleFullscreenToggle = useCallback(() => {
        ctrl.toggleFullscreen();
        setEditorFullscreen((f) => !f);
    }, [ctrl, setEditorFullscreen]);

    const handleSave = useCallback(async () => {
        ctrl.setSaving(true);
        try {
            ctrl.setSaving(false);
            ctrl.setHasUnsaved(false);
        } catch {
            ctrl.setSaving(false);
        }
    }, [ctrl]);

    const toolbarState = {
        activeTool: ctrl.state.activeTool,
        onToolChange: ctrl.setActiveTool,
        zoom: ctrl.state.zoom,
        onZoomChange: ctrl.setZoom,
        rotation: ctrl.state.rotation,
        onRotate: ctrl.rotate,
        fullscreen: ctrl.state.fullscreen,
        onFullscreenToggle: handleFullscreenToggle,
        onFitWidth: ctrl.fitWidth,
        onFitPage: ctrl.fitPage,
        pageNumber: ctrl.state.pageNumber,
        totalPages: ctrl.state.totalPages,
        onPageChange: handlePageChange,
        downloadUrl: viewerAsset?.downloadUrl ?? undefined,
        suppressAnnotations: false,
        continuous: false,
        onContinuousToggle: undefined,
        onSave: handleSave,
        saving: ctrl.state.saving,
        hasUnsaved: ctrl.state.hasUnsaved,
    };

    const handleTotalPages = useCallback((n: number) => {
        ctrl.setTotalPages(n);
        if (ctrl.state.pageNumber > n) {
            ctrl.setPageNumber(n);
            nav?.({ page: String(n) });
        }
    }, [ctrl, nav]);

    return (
        <ProjectDesignLayoutContext.Provider value={layoutControls}>
            <div className="flex h-full flex-col overflow-hidden project-design-editor-scroll-root">
                <div className="flex items-center border-b border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 shrink-0 gap-2">
                    {layoutControls.browserAvailable ? (
                        <Tooltip>
                            <Button isIconOnly size="sm" variant="ghost" className="h-7 w-7 min-w-0"
                                aria-label="Toggle file browser"
                                onPress={layoutControls.toggleBrowser}>
                                <PanelLeft size={14} />
                            </Button>
                            <Tooltip.Content className="bg-[var(--surface)] text-[var(--text)] border border-[var(--border)]">Toggle file browser</Tooltip.Content>
                        </Tooltip>
                    ) : (
                        <Tooltip>
                            <Button isIconOnly size="sm" variant="ghost" className="h-7 w-7 min-w-0"
                                aria-label="Open file browser"
                                onPress={layoutControls.openBrowser}>
                                <PanelLeft size={14} />
                            </Button>
                            <Tooltip.Content className="bg-[var(--surface)] text-[var(--text)] border border-[var(--border)]">Open file browser</Tooltip.Content>
                        </Tooltip>
                    )}
                    <div className="flex items-center gap-1.5 min-w-0 shrink-0">
                        <FolderOpen size={13} className="shrink-0 text-[var(--text-muted)]" />
                        <span className="truncate text-[12px] font-medium text-[var(--foreground)] max-w-[120px]">{selectedFile.name}</span>
                        {version && (
                            <Chip size="sm" variant="soft" className="h-5 text-[9px] shrink-0">{version.label}</Chip>
                        )}
                    </div>
                    <div className="flex items-center flex-1 justify-center min-w-0 overflow-x-auto">
                        <ProjectDesignEditorToolbar {...toolbarState} />
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                        {layoutControls.inspectorAvailable ? (
                            <Tooltip>
                                <Button isIconOnly size="sm" variant="ghost" className="h-7 w-7 min-w-0"
                                    aria-label="Toggle inspector"
                                    onPress={layoutControls.toggleInspector}>
                                    <PanelRight size={14} />
                                </Button>
                                <Tooltip.Content className="bg-[var(--surface)] text-[var(--text)] border border-[var(--border)]">Toggle inspector</Tooltip.Content>
                            </Tooltip>
                        ) : (
                            <Tooltip>
                                <Button isIconOnly size="sm" variant="ghost" className="h-7 w-7 min-w-0"
                                    aria-label="Open inspector"
                                    onPress={layoutControls.openInspector}>
                                    <PanelRight size={14} />
                                </Button>
                                <Tooltip.Content className="bg-[var(--surface)] text-[var(--text)] border border-[var(--border)]">Open inspector</Tooltip.Content>
                            </Tooltip>
                        )}
                    </div>
                </div>

                <div className="relative flex-1 min-h-0 h-full">
                    <ProjectDesignEditorLayout
                        fullscreen={editorFullscreen}
                        onFullscreenToggle={() => setEditorFullscreen((f) => !f)}
                        userId={userId}
                        companyId={companyId}
                        onControlsChange={setLayoutControls}
                        browser={
                            <ProjectDesignFileBrowser
                                dossierId={dossierId}
                                onFileSelect={(f) => nav({ file: String(f.id), version: '', asset: '', page: '', remark: '' })}
                                selectedFileId={selectedFile.id}
                            />
                        }
                        viewer={
                            <DesignViewerTabs
                                assets={assets}
                                dossierId={dossierId}
                                versionId={version!.id}
                                fileMeta={selectedFile}
                                activeAssetId={activeAssetId}
                                onAssetChange={(id) => nav({ asset: String(id) })}
                                onOpenReviewAsset={(asset) => nav({ asset: String(asset.id) })}
                                pageNumber={ctrl.state.pageNumber}
                                onPageNumberChange={handlePageChange}
                                viewerToolbar={toolbarState}
                                onTotalPages={handleTotalPages}
                                state={ctrl.state}
                                dispatch={ctrl.dispatch}
                                interactionHandlers={ctrl.interactionHandlers}
                                spaceHeldRef={ctrl.spaceHeldRef}
                            />
                        }
                        inspector={
                            <DesignInspector
                                file={selectedFile}
                                versions={versions}
                                assets={assets}
                                activeAsset={assets.find(a => a.id === activeAssetId) ?? assets[0]}
                                dossierId={dossierId}
                                versionId={version?.id}
                                defaultTab={workspaceState.inspectorTab}
                                onOpenReviewAsset={(asset) => nav({ asset: String(asset.id) })}
                                onSwitchVersion={(versionId) => nav({ version: String(versionId), asset: '', page: '' })}
                                onTabChange={(tab) => nav({ inspector: tab })}
                            />
                        }
                    />
                </div>

                <div className="flex items-center justify-between border-t border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-[11px] shrink-0">
                    <div className="flex items-center gap-3 min-w-0">
                        <span className="text-[var(--text-muted)] truncate">{selectedFile.name}</span>
                        {version?.uploadedBy && (
                            <span className="text-[var(--text-muted)] hidden sm:inline">
                                <span className="inline mr-1">{version.uploadedBy.name}</span>
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                        {version && (
                            <span className="flex items-center gap-1.5 text-[var(--text-muted)]">
                                <span className="mr-1">{version.label}</span>
                                <span className={`inline-block size-1.5 rounded-full ${
                                    version.status === 'approved' ? 'bg-emerald-500' :
                                    version.status === 'rejected' ? 'bg-red-500' :
                                    'bg-amber-500'
                                }`} />
                                {version.status}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </ProjectDesignLayoutContext.Provider>
    );
}
