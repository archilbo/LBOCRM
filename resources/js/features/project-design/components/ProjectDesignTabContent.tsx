import { FolderOpen, MessageSquareText, NotebookTabs, Undo2, Loader2, FileWarning, Download } from 'lucide-react';
import { AppButton } from '@/components/ui/AppButton';
import { ProjectDesignFileBrowser } from './ProjectDesignFileBrowser';
import { DesignReviewQueue } from '@/features/dossiers/components/DesignReviewQueue';
import { DesignRemarksTab } from '@/features/dossiers/components/DesignRemarksTab';
import { ProjectDesignActivityFeed } from './ProjectDesignActivityFeed';
import { ProjectDesignSummaryBar } from './ProjectDesignSummaryBar';
import { useFileDetail, useSummary } from '../hooks/useProjectDesignQueries';
import { formatProjectDesignStatus } from '../utils/projectDesignFormatters';
import { DesignFileViewer } from '@/features/dossiers/components/DesignFileViewer';
import type { DesignMode, ProjectDesignFile } from '../types/projectDesign';
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
    const version = selectedFile.latestVersion;
    const assets = version?.assets;
    const primaryAsset = assets?.find((a) => a.previewable) ?? assets?.[0];

    if (!primaryAsset) {
        const msg = !version
            ? 'This file has no uploaded versions yet.'
            : !assets?.length
                ? 'The latest version has no assets.'
                : 'Preview is being generated. Please refresh in a moment.';
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <FileWarning size={32} className="text-amber-400" />
                <p className="mt-3 text-sm font-medium text-[var(--foreground)]">No preview available</p>
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
            <div className="flex h-[70vh] flex-col">
                <DesignFileViewer
                    previewUrl={primaryAsset.previewUrl ?? ''}
                    downloadUrl={primaryAsset.downloadUrl ?? ''}
                    mimeType={primaryAsset.mimeType}
                    filename={primaryAsset.originalFilename}
                    isOpen={true}
                    onClose={() => onNavigate?.({ file: '', version: '', remark: '', mode: 'files' })}
                    versionId={version?.id}
                    dossierId={dossierId}
                />
            </div>
        </div>
    );
}
