import { useState } from 'react';
import { FolderOpen, MessageSquareText, NotebookTabs, Undo2, Loader2, FileWarning, PanelLeftClose, PanelLeft, PanelRightClose, PanelRight, HardDrive } from 'lucide-react';
import { AppButton } from '@/components/ui/AppButton';
import { Chip, Button } from '@heroui/react';
import { ProjectDesignFileBrowser } from './ProjectDesignFileBrowser';
import { DesignReviewQueue } from '@/features/dossiers/components/DesignReviewQueue';
import { DesignRemarksTab } from '@/features/dossiers/components/DesignRemarksTab';
import { ProjectDesignActivityFeed } from './ProjectDesignActivityFeed';
import { ProjectDesignSummaryBar } from './ProjectDesignSummaryBar';
import { DesignViewerTabs } from '@/features/dossiers/components/DesignViewerTabs';
import { DesignInspector } from '@/features/dossiers/components/DesignInspector';
import { useFileDetail, useSummary, useVersions } from '../hooks/useProjectDesignQueries';
import { formatProjectDesignStatus } from '../utils/projectDesignFormatters';
import type { DesignMode, ProjectDesignFile, ProjectDesignAsset, ProjectDesignVersion } from '../types/projectDesign';
import type { WorkspaceState } from '../hooks/useProjectDesignWorkspace';

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
    onNavigate?: (updates: { mode?: string; file?: string; version?: string; remark?: string }) => void;
}) {
    const { mode } = workspaceState;
    const { data: summary } = useSummary(dossierId);
    const { data: selectedFile, isLoading: loadingFile } = useFileDetail(dossierId, workspaceState.fileId);

    return (
        <div className="flex flex-col gap-5">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-4 shadow-sm sm:px-5">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <div className="flex size-9 items-center justify-center rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]">
                                <NotebookTabs size={17} />
                            </div>
                            <div className="min-w-0">
                                <h2 className="text-sm font-semibold text-[var(--foreground)] sm:text-base">Project Design</h2>
                                <p className="text-xs text-[var(--text-muted)]">
                                    Review repository, revisions, remarks, and activity inside this project workspace.
                                </p>
                            </div>
                        </div>

                        {selectedFile ? (
                            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]">
                                <span className="inline-flex items-center gap-1 rounded-full bg-[var(--surface-2)] px-2.5 py-1 text-[var(--foreground)]">
                                    <FolderOpen size={12} />
                                    {selectedFile.name}
                                </span>
                                <span>{formatProjectDesignStatus(selectedFile.status)}</span>
                                {workspaceState.versionId ? <span>Version #{workspaceState.versionId}</span> : null}
                                {workspaceState.remarkId ? (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-[var(--surface-2)] px-2.5 py-1">
                                        <MessageSquareText size={12} />
                                        Remark #{workspaceState.remarkId}
                                    </span>
                                ) : null}
                            </div>
                        ) : null}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {workspaceState.fileId ? (
                            <AppButton
                                variant="bordered"
                                size="sm"
                                className="h-9"
                                onPress={() => onNavigate?.({ file: '', version: '', remark: '', mode: 'files' })}
                            >
                                <Undo2 size={14} />
                                Back to Files
                            </AppButton>
                        ) : null}
                    </div>
                </div>
            </div>

            {workspaceState.fileId && mode === 'files' ? (
                loadingFile ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 size={20} className="animate-spin text-[var(--text-muted)]" />
                    </div>
                ) : selectedFile ? (
                    <EditorWorkspace
                        dossierId={dossierId}
                        selectedFile={selectedFile}
                        workspaceState={workspaceState}
                        onNavigate={onNavigate}
                    />
                ) : null
            ) : (
                <>
                    <ProjectDesignSummaryBar summary={summary ?? null} />
                    <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
                        <div className="flex overflow-x-auto border-b border-[var(--border)]" role="tablist" aria-label="Project Design modes">
                            {MODES.map((m) => (
                                <button
                                    key={m.id}
                                    type="button"
                                    role="tab"
                                    aria-selected={mode === m.id}
                                    onClick={() => onModeChange(m.id)}
                                    className={[
                                        'relative flex items-center justify-center px-4 py-2.5 text-[13px] font-medium outline-none transition whitespace-nowrap',
                                        mode === m.id
                                            ? 'text-[var(--accent)] after:absolute after:bottom-0 after:left-2 after:right-2 after:h-0.5 after:rounded-full after:bg-[var(--accent)]'
                                            : 'text-[var(--text-muted)] hover:text-[var(--foreground)]',
                                    ].join(' ')}
                                >
                                    {m.label}
                                </button>
                            ))}
                        </div>
                        <div className="p-4 sm:p-5">
                            {mode === 'files' && (
                                <ProjectDesignFileBrowser
                                    dossierId={dossierId}
                                    onFileSelect={onFileSelect}
                                    selectedFileId={workspaceState.fileId}
                                />
                            )}
                            {mode === 'reviews' && <DesignReviewQueue dossierId={dossierId} />}
                            {mode === 'remarks' && <DesignRemarksTab dossierId={dossierId} />}
                            {mode === 'activity' && <ProjectDesignActivityFeed dossierId={dossierId} />}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

function EditorWorkspace({ dossierId, selectedFile, workspaceState, onNavigate }: {
    dossierId: number;
    selectedFile: ProjectDesignFile;
    workspaceState: WorkspaceState;
    onNavigate?: (updates: { mode?: string; file?: string; version?: string; remark?: string }) => void;
}) {
    const [showBrowser, setShowBrowser] = useState(true);
    const [showInspector, setShowInspector] = useState(true);
    const [activeAssetId, setActiveAssetId] = useState<number | null>(null);

    const version = selectedFile.latestVersion;
    const assets = version?.assets ?? [];
    const { data: versionsData } = useVersions(dossierId, selectedFile.id);
    const versions = versionsData?.data ?? [];

    if (!assets.length) {
        const msg = !version
            ? 'This file has no uploaded versions yet.'
            : 'The latest version has no assets.';
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <FileWarning size={32} className="text-amber-400" />
                <p className="mt-3 text-sm font-medium text-[var(--foreground)]">No assets available</p>
                <p className="mt-1 text-xs text-[var(--text-muted)]">{msg}</p>
                <AppButton size="sm" className="mt-4 h-8 text-[11px]"
                    onPress={() => onNavigate?.({ file: '', version: '', remark: '', mode: 'files' })}>
                    <Undo2 size={13} /> Back to Files
                </AppButton>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
            {/* Editor header */}
            <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-3 py-2">
                <div className="flex items-center gap-2">
                    <Button isIconOnly size="sm" variant="light" className="h-7 w-7 min-w-0" onPress={() => setShowBrowser(!showBrowser)}>
                        {showBrowser ? <PanelLeftClose size={14} /> : <PanelLeft size={14} />}
                    </Button>
                    <AppButton variant="bordered" size="sm" className="h-7 text-[11px]"
                        onPress={() => onNavigate?.({ file: '', version: '', remark: '', mode: 'files' })}>
                        <Undo2 size={12} /> Files
                    </AppButton>
                    <span className="mx-1 h-4 w-px bg-[var(--border)]" />
                    <FolderOpen size={13} className="text-[var(--text-muted)]" />
                    <span className="text-[13px] font-medium text-[var(--foreground)]">{selectedFile.name}</span>
                    {version && (
                        <>
                            <span className="text-[11px] text-[var(--text-muted)]">·</span>
                            <Chip size="sm" variant="flat" className="h-5 text-[10px]">{version.label}</Chip>
                        </>
                    )}
                    <Chip size="sm" variant="flat" color="default" className="h-5 text-[10px]" startContent={<HardDrive size={10} />}>
                        {assets.length} asset(s)
                    </Chip>
                </div>
                <div className="flex items-center gap-2">
                    {/* Version selector */}
                    {versions.length > 1 && version && (
                        <div className="flex items-center gap-1">
                            {versions.slice(0, 5).map((v) => (
                                <button
                                    key={v.id}
                                    type="button"
                                    onClick={() => onNavigate?.({ file: String(selectedFile.id), version: String(v.id), remark: '' })}
                                    className={`rounded-md px-2 py-1 text-[10px] font-medium transition ${
                                        v.id === version.id
                                            ? 'bg-[var(--accent)]/10 text-[var(--accent)]'
                                            : 'text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]'
                                    }`}
                                >
                                    {v.label}
                                </button>
                            ))}
                            {versions.length > 5 && (
                                <span className="text-[10px] text-[var(--text-muted)]">+{versions.length - 5}</span>
                            )}
                        </div>
                    )}
                    <Button isIconOnly size="sm" variant="light" className="h-7 w-7 min-w-0" onPress={() => setShowInspector(!showInspector)}>
                        {showInspector ? <PanelRightClose size={14} /> : <PanelRight size={14} />}
                    </Button>
                </div>
            </div>

            {/* Three-panel body */}
            <div className="flex h-[70vh]">
                {/* Left: File browser */}
                {showBrowser && (
                    <div className="w-64 shrink-0 overflow-y-auto border-r border-[var(--border)]">
                        <ProjectDesignFileBrowser
                            dossierId={dossierId}
                            onFileSelect={(f) => onNavigate?.({ file: String(f.id), version: '', remark: '', mode: 'files' })}
                            selectedFileId={selectedFile.id}
                        />
                    </div>
                )}

                {/* Center: Viewer */}
                <div className="flex-1 overflow-hidden">
                    <DesignViewerTabs
                        assets={assets}
                        dossierId={dossierId}
                        versionId={version!.id}
                        fileMeta={selectedFile}
                        activeAssetId={activeAssetId}
                        onAssetChange={setActiveAssetId}
                        onUploadDerivative={() => {
                            // Will open upload drawer
                        }}
                        onOpenReviewAsset={(asset) => setActiveAssetId(asset.id)}
                    />
                </div>

                {/* Right: Inspector */}
                {showInspector && (
                    <div className="w-72 shrink-0">
                        <DesignInspector
                            file={selectedFile}
                            versions={versions}
                            assets={assets}
                            activeAsset={assets.find(a => a.id === activeAssetId) ?? assets[0]}
                            remarks={null}
                            activities={null}
                            onOpenReviewAsset={(asset) => setActiveAssetId(asset.id)}
                            onSwitchVersion={(versionId) => onNavigate?.({ file: String(selectedFile.id), version: String(versionId), remark: '' })}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
