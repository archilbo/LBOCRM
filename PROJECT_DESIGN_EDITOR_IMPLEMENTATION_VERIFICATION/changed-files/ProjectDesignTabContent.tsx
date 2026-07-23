import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { FolderOpen, NotebookTabs, Undo2, Loader2, FileWarning, PanelLeftClose, PanelLeft, PanelRightClose, PanelRight, Upload, CheckCircle2, User, GitBranch } from 'lucide-react';
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from 'react-resizable-panels';
import { Chip, Button, Tooltip } from '@heroui/react';
import { AppButton } from '@/components/ui/AppButton';
import { ProjectDesignFileBrowser } from './ProjectDesignFileBrowser';
import { ProjectDesignEditorToolbar, type AnnotationTool, type ProjectDesignEditorToolbarState } from './ProjectDesignEditorToolbar';
import { DesignReviewQueue } from '@/features/dossiers/components/DesignReviewQueue';
import { DesignRemarksTab } from '@/features/dossiers/components/DesignRemarksTab';
import { ProjectDesignActivityFeed } from './ProjectDesignActivityFeed';
import { ProjectDesignSummaryBar } from './ProjectDesignSummaryBar';
import { DesignViewerTabs } from '@/features/dossiers/components/DesignViewerTabs';
import { DesignInspector } from '@/features/dossiers/components/DesignInspector';
import { useFileDetail, useSummary, useVersions } from '../hooks/useProjectDesignQueries';
import { formatProjectDesignStatus } from '../utils/projectDesignFormatters';
import { useMediaQuery } from '@/lib/useMediaQuery';
import type { DesignMode, ProjectDesignFile, ProjectDesignAsset, ProjectDesignVersion } from '../types/projectDesign';
import type { WorkspaceState, InspectorTab, WorkspaceUpdate } from '../hooks/useProjectDesignWorkspace';

const MODES: { id: DesignMode; label: string }[] = [
    { id: 'files', label: 'Files' },
    { id: 'reviews', label: 'Review Queue' },
    { id: 'remarks', label: 'Remarks' },
    { id: 'activity', label: 'Activity' },
];

const PANEL_SIZES_KEY = 'pd-panel-sizes';

function loadPanelSizes(): { left: number; right: number } | null {
    try {
        const raw = localStorage.getItem(PANEL_SIZES_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (typeof parsed.left === 'number' && typeof parsed.right === 'number'
            && parsed.left >= 18 && parsed.left <= 30
            && parsed.right >= 22 && parsed.right <= 40) {
            return parsed;
        }
        return null;
    } catch { return null; }
}

function savePanelSizes(left: number, right: number) {
    try { localStorage.setItem(PANEL_SIZES_KEY, JSON.stringify({ left, right })); } catch {}
}

export function ProjectDesignTabContent({ dossierId, workspaceState, onModeChange, onFileSelect, onNavigate }: {
    dossierId: number;
    workspaceState: WorkspaceState;
    onModeChange: (m: DesignMode) => void;
    onFileSelect: (f: ProjectDesignFile) => void;
    onNavigate?: (updates: WorkspaceUpdate) => void;
}) {
    const { mode } = workspaceState;
    const { data: summary } = useSummary(dossierId);
    const { data: selectedFile, isLoading: loadingFile } = useFileDetail(dossierId, workspaceState.fileId);

    const nav = useCallback((updates: WorkspaceUpdate) => onNavigate?.(updates), [onNavigate]);

    return (
        <div className="flex h-full flex-col overflow-hidden">
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
                    <div className="flex-1 overflow-y-auto p-4">
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
    const isLg = useMediaQuery('(min-width: 1024px)');
    const isXl = useMediaQuery('(min-width: 1280px)');
    const [showBrowser, setShowBrowser] = useState(isLg);
    const [showInspector, setShowInspector] = useState(isXl);
    const savedSizes = useMemo(() => loadPanelSizes(), []);

    const [activeTool, setActiveTool] = useState<AnnotationTool>('select');
    const [editorZoom, setEditorZoom] = useState(1);
    const [editorRotation, setEditorRotation] = useState(0);
    const [editorFullscreen, setEditorFullscreen] = useState(false);
    const [totalPages, setTotalPages] = useState(1);
    const viewerControlsRef = useRef<{ fitWidth: () => void; fitPage: () => void }>({ fitWidth: () => {}, fitPage: () => {} });

    const handleControlsReady = useCallback((controls: { fitWidth: () => void; fitPage: () => void }) => {
        viewerControlsRef.current = controls;
    }, []);

    useEffect(() => {
        function handleTotalPages(e: Event) {
            setTotalPages((e as CustomEvent).detail.totalPages);
        }
        window.addEventListener('pd-editor-total-pages', handleTotalPages);
        return () => window.removeEventListener('pd-editor-total-pages', handleTotalPages);
    }, []);

    useEffect(() => { setShowBrowser(isLg); }, [isLg]);
    useEffect(() => { setShowInspector(isXl); }, [isXl]);

    const { data: versionsData } = useVersions(dossierId, selectedFile.id);
    const versions = versionsData?.data ?? [];
    const version = workspaceState.versionId
        ? versions.find((v) => v.id === workspaceState.versionId) ?? selectedFile.latestVersion
        : selectedFile.latestVersion;
    const assets = version?.assets ?? [];
    const activeAssetId = workspaceState.assetId;

    const nav = useCallback((updates: WorkspaceUpdate) => onNavigate?.(updates), [onNavigate]);

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

    const viewerAsset = assets.find(a => a.id === activeAssetId) ?? assets[0];
    const toolbarState: ProjectDesignEditorToolbarState = {
        activeTool,
        onToolChange: setActiveTool,
        zoom: editorZoom,
        onZoomChange: setEditorZoom,
        rotation: editorRotation,
        onRotate: () => setEditorRotation((r) => (r + 90) % 360),
        fullscreen: editorFullscreen,
        onFullscreenToggle: () => setEditorFullscreen((f) => !f),
        onFitWidth: () => viewerControlsRef.current.fitWidth(),
        onFitPage: () => viewerControlsRef.current.fitPage(),
        pageNumber: workspaceState.pageNumber ?? 1,
        totalPages,
        onPageChange: (page) => nav({ page: String(page) }),
        downloadUrl: viewerAsset?.downloadUrl ?? undefined,
        suppressAnnotations: false,
    };

    return (
        <div className="flex h-full flex-col overflow-hidden">
            {/* Editor header */}
            <div className="flex items-center border-b border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 shrink-0 gap-2">
                <div className="flex items-center gap-1.5 min-w-0 shrink-0">
                    <Tooltip content={showBrowser ? 'Hide file browser' : 'Show file browser'}>
                        <Button isIconOnly size="sm" variant="light" className="h-7 w-7 min-w-0" onPress={() => setShowBrowser(!showBrowser)}>
                            {showBrowser ? <PanelLeftClose size={14} /> : <PanelLeft size={14} />}
                        </Button>
                    </Tooltip>
                    <FolderOpen size={13} className="shrink-0 text-[var(--text-muted)]" />
                    <span className="truncate text-[12px] font-medium text-[var(--foreground)] max-w-[120px]">{selectedFile.name}</span>
                    {version && (
                        <Chip size="sm" variant="flat" className="h-5 text-[9px] shrink-0">{version.label}</Chip>
                    )}
                </div>
                <div className="hidden lg:flex items-center flex-1 justify-center min-w-0">
                    <ProjectDesignEditorToolbar {...toolbarState} />
                </div>
                <div className="flex items-center gap-1 shrink-0">
                    <AppButton variant="bordered" size="sm" className="h-7 text-[11px]" onPress={() => {}}>
                        <Upload size={12} /> Upload
                    </AppButton>
                    <Tooltip content={showInspector ? 'Hide inspector' : 'Show inspector'}>
                        <Button isIconOnly size="sm" variant="light" className="h-7 w-7 min-w-0" onPress={() => setShowInspector(!showInspector)}>
                            {showInspector ? <PanelRightClose size={14} /> : <PanelRight size={14} />}
                        </Button>
                    </Tooltip>
                </div>
            </div>

            {/* Three-panel resizable body */}
            <div className="flex flex-1 min-h-0">
                <PanelGroup direction="horizontal" className="h-full">
                    {showBrowser && (
                        <>
                            <Panel defaultSize={savedSizes?.left ?? 20} minSize={18} maxSize={30}>
                                <div className="h-full overflow-hidden">
                                    <ProjectDesignFileBrowser
                                        dossierId={dossierId}
                                        onFileSelect={(f) => nav({ file: String(f.id), version: '', asset: '', page: '', remark: '' })}
                                        selectedFileId={selectedFile.id}
                                    />
                                </div>
                            </Panel>
                            <PanelResizeHandle className="w-[3px] bg-[var(--border)] transition hover:w-[3px] hover:bg-[var(--accent)]/50 data-[resize-handle-active]:bg-[var(--accent)]/50" />
                        </>
                    )}

                    <Panel minSize={30}>
                        <div className="h-full overflow-hidden">
                            <DesignViewerTabs
                                assets={assets}
                                dossierId={dossierId}
                                versionId={version!.id}
                                fileMeta={selectedFile}
                                activeAssetId={activeAssetId}
                                onAssetChange={(id) => nav({ asset: String(id) })}
                                onUploadDerivative={() => {}}
                                onOpenReviewAsset={(asset) => nav({ asset: String(asset.id) })}
                                pageNumber={workspaceState.pageNumber ?? undefined}
                                onPageNumberChange={(page) => nav({ page: String(page) })}
                                viewerToolbar={toolbarState}
                                onControlsReady={handleControlsReady}
                            />
                        </div>
                    </Panel>

                    {showInspector && (
                        <>
                            <PanelResizeHandle className="w-[3px] bg-[var(--border)] transition hover:w-[3px] hover:bg-[var(--accent)]/50 data-[resize-handle-active]:bg-[var(--accent)]/50" />
                            <Panel defaultSize={savedSizes?.right ?? 26} minSize={22} maxSize={40}>
                                <div className="h-full overflow-hidden">
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
                                </div>
                            </Panel>
                        </>
                    )}
                </PanelGroup>
            </div>

            {/* Status bar */}
            <div className="flex items-center justify-between border-t border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-[11px] shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                    <span className="text-[var(--text-muted)] truncate">{selectedFile.name}</span>
                    {version?.uploadedBy && (
                        <span className="text-[var(--text-muted)] hidden sm:inline">
                            <User size={10} className="inline mr-1" />
                            {version.uploadedBy.name}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    {version && (
                        <span className="flex items-center gap-1.5 text-[var(--text-muted)]">
                            <GitBranch size={10} />
                            {version.label}
                            <span className={`inline-block size-1.5 rounded-full ${
                                version.status === 'approved' ? 'bg-emerald-500' :
                                version.status === 'rejected' ? 'bg-red-500' :
                                'bg-amber-500'
                            }`} />
                            {version.status}
                        </span>
                    )}
                    <span className="flex items-center gap-1 text-emerald-500">
                        <CheckCircle2 size={11} />
                        Saved
                    </span>
                </div>
            </div>

        </div>
    );
}
