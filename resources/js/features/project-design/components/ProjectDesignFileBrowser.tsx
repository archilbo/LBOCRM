import { useState, useMemo } from 'react';
import { FolderPlus, Upload, File, HardDrive } from 'lucide-react';
import { cn } from '@/lib/cn';
import { AppButton } from '@/components/ui/AppButton';
import { AppEmptyState } from '@/components/ui/AppEmptyState';
import { AppInput } from '@/components/ui/AppInput';
import { AppSelect } from '@/components/ui/AppSelect';
import { useFolders, useFiles } from '../hooks/useProjectDesignQueries';
import { ProjectDesignFolderTree } from './ProjectDesignFolderTree';
import { DesignUploadDrawer } from '@/features/dossiers/components/DesignUploadDrawer';
import { NewFolderModal } from './ProjectDesignNewFolderModal';
import { STATUS_BADGE, DISCIPLINE_COLORS } from '../utils/projectDesignFormatters';
import type { ProjectDesignFile } from '../types/projectDesign';

function FileRow({ file, onSelect, isSelected }: {
    file: ProjectDesignFile;
    onSelect: (f: ProjectDesignFile) => void;
    isSelected: boolean;
}) {
    return (
        <button
            type="button"
            onClick={() => onSelect(file)}
            className={cn(
                'group flex w-full items-center gap-2.5 rounded-lg border bg-[var(--surface)] px-3 py-2 text-left transition',
                isSelected
                    ? 'border-[var(--accent)]/40 bg-[var(--accent)]/5'
                    : 'border-[var(--border)] hover:border-[var(--accent)]/30',
            )}
        >
            <div className={cn('flex size-7 shrink-0 items-center justify-center rounded-md', DISCIPLINE_COLORS[file.discipline ?? ''] ?? 'bg-[var(--surface-2)] text-[var(--text-muted)]')}>
                <File size={13} />
            </div>
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                    <p className="truncate text-[12.5px] font-medium text-[var(--foreground)]">{file.name}</p>
                    {file.latestVersion && (
                        <span className="shrink-0 rounded bg-[var(--surface-2)] px-1 py-0.5 text-[9px] font-semibold text-[var(--text-muted)] leading-none">v{file.latestVersion.versionNumber}</span>
                    )}
                </div>
                <div className="flex items-center gap-2 text-[10.5px] text-[var(--text-muted)]">
                    {file.discipline && <span className="capitalize">{file.discipline}</span>}
                    {file.versionsCount > 0 && <span>{file.versionsCount} version{file.versionsCount !== 1 ? 's' : ''}</span>}
                </div>
            </div>
            {file.openRemarksCount > 0 && (
                <span className="shrink-0 rounded bg-amber-400/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-400 leading-none">{file.openRemarksCount}</span>
            )}
            <span className={cn('shrink-0 rounded px-1.5 py-0.5 text-[9px] font-semibold leading-none', STATUS_BADGE[file.status] ?? '')}>{file.status}</span>
        </button>
    );
}

export function ProjectDesignFileBrowser({ dossierId, onFileSelect, selectedFileId }: {
    dossierId: number;
    onFileSelect: (f: ProjectDesignFile) => void;
    selectedFileId: number | null;
}) {
    const [uploadOpen, setUploadOpen] = useState(false);
    const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
    const [newFolderOpen, setNewFolderOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [disciplineFilter, setDisciplineFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [sort, setSort] = useState('name');
    const [page, setPage] = useState(1);

    const { data: folders = [] } = useFolders(dossierId);
    const { data: filesData, isLoading } = useFiles(dossierId, {
        folder_id: selectedFolderId ?? undefined,
        search: search || undefined,
        discipline: disciplineFilter || undefined,
        status: statusFilter || undefined,
        sort,
        page,
    });
    const files = useMemo(() => filesData?.data ?? [], [filesData]);
    const meta = useMemo(() => ({ currentPage: filesData?.current_page ?? 1, lastPage: filesData?.last_page ?? 1, total: filesData?.total ?? 0 }), [filesData]);

    const grouped = useMemo(() => {
        if (selectedFolderId) return null;
        const map = new Map<string, ProjectDesignFile[]>();
        const uncategorized: ProjectDesignFile[] = [];
        for (const f of files) {
            if (f.discipline) {
                const g = map.get(f.discipline) ?? [];
                g.push(f);
                map.set(f.discipline, g);
            } else {
                uncategorized.push(f);
            }
        }
        return { groups: [...map.entries()].sort((a, b) => a[0].localeCompare(b[0])), uncategorized };
    }, [files, selectedFolderId]);

    function handleSearch(val: string) { setSearch(val); setPage(1); }
    function handleFolderSelect(id: number | null) { setSelectedFolderId(id); setPage(1); }
    function handleFolderCreated() { setNewFolderOpen(false); }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-end gap-3">
                <div className="min-w-[220px] flex-1">
                    <AppInput
                        value={search}
                        onChange={(value) => handleSearch(value)}
                        placeholder="Search files..."
                        aria-label="Search files"
                    />
                </div>
                <div className="w-full min-w-[160px] sm:w-44">
                    <AppSelect
                        selectedKey={disciplineFilter || null}
                        onSelectionChange={(key) => {
                            setDisciplineFilter(key ? String(key) : '');
                            setPage(1);
                        }}
                        options={[
                            { id: 'architecture', label: 'Architecture' },
                            { id: 'structure', label: 'Structure' },
                            { id: 'mep', label: 'MEP' },
                            { id: 'interior', label: 'Interior' },
                            { id: 'landscape', label: 'Landscape' },
                        ]}
                        placeholder="All disciplines"
                        aria-label="Filter by discipline"
                        size="sm"
                    />
                </div>
                <div className="w-full min-w-[160px] sm:w-40">
                    <AppSelect
                        selectedKey={statusFilter || null}
                        onSelectionChange={(key) => {
                            setStatusFilter(key ? String(key) : '');
                            setPage(1);
                        }}
                        options={[
                            { id: 'active', label: 'Active' },
                            { id: 'archived', label: 'Archived' },
                        ]}
                        placeholder="All statuses"
                        aria-label="Filter by status"
                        size="sm"
                    />
                </div>
                <div className="w-full min-w-[160px] sm:w-36">
                    <AppSelect
                        selectedKey={sort}
                        onSelectionChange={(key) => setSort(String(key ?? 'name'))}
                        options={[
                            { id: 'name', label: 'Sort: Name' },
                            { id: 'discipline', label: 'Sort: Discipline' },
                            { id: 'created_at', label: 'Sort: Created' },
                            { id: 'updated_at', label: 'Sort: Updated' },
                        ]}
                        placeholder="Sort"
                        aria-label="Sort files"
                        size="sm"
                    />
                </div>
                <AppButton variant="bordered" size="sm" className="h-9 text-[11px]" onPress={() => setUploadOpen(true)}>
                    <Upload size={13} /> Upload
                </AppButton>
                <AppButton variant="bordered" size="sm" className="h-9 text-[11px]" onPress={() => setNewFolderOpen(true)}>
                    <FolderPlus size={13} /> Folder
                </AppButton>
            </div>

            <DesignUploadDrawer dossierId={dossierId} folders={folders} isOpen={uploadOpen}
                onOpenChange={setUploadOpen} onComplete={() => {}} />

            <div className="flex gap-4">
                <div className="hidden w-56 shrink-0 sm:block">
                    <ProjectDesignFolderTree folders={folders} selectedFolderId={selectedFolderId} onSelect={handleFolderSelect} />
                </div>
                <div className="flex-1 min-w-0">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12 text-[13px] text-[var(--text-muted)]">Loading files...</div>
                    ) : files.length === 0 ? (
                        <AppEmptyState icon={<HardDrive size={15} />} title="No files found"
                            description={search || disciplineFilter || statusFilter ? 'Try changing your filters.' : 'Upload design files to get started.'} />
                    ) : (
                        <div className="space-y-3">
                            {grouped ? (
                                <>
                                    {grouped.groups.map(([discipline, groupFiles]) => (
                                        <div key={discipline}>
                                            <div className={cn('mb-1.5 flex items-center gap-2 rounded-md px-2 py-1', DISCIPLINE_COLORS[discipline] ?? '')}>
                                                <span className="text-[10px] font-semibold uppercase tracking-wider">{discipline}</span>
                                                <span className="text-[10px] opacity-60">{groupFiles.length} file{groupFiles.length !== 1 ? 's' : ''}</span>
                                            </div>
                                            <div className="space-y-1.5">
                                                {groupFiles.map((f) => (
                                                    <FileRow
                                                        key={f.id}
                                                        file={f}
                                                        isSelected={selectedFileId === f.id}
                                                        onSelect={onFileSelect}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                    {grouped.uncategorized.length > 0 && (
                                        <div>
                                            <div className="mb-1.5 flex items-center gap-2 rounded-md bg-[var(--surface-2)] px-2 py-1">
                                                <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Other</span>
                                                <span className="text-[10px] text-[var(--text-subtle)]">{grouped.uncategorized.length} file{grouped.uncategorized.length !== 1 ? 's' : ''}</span>
                                            </div>
                                            <div className="space-y-1.5">
                                                {grouped.uncategorized.map((f) => (
                                                    <FileRow
                                                        key={f.id}
                                                        file={f}
                                                        isSelected={selectedFileId === f.id}
                                                        onSelect={onFileSelect}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="space-y-1.5">
                                    {files.map((f) => (
                                        <FileRow
                                            key={f.id}
                                            file={f}
                                            isSelected={selectedFileId === f.id}
                                            onSelect={onFileSelect}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                    {meta.lastPage > 1 && (
                        <div className="mt-4 flex items-center justify-between">
                            <p className="text-[11px] text-[var(--text-muted)]">{meta.total} file(s) · Page {meta.currentPage} of {meta.lastPage}</p>
                            <div className="flex gap-1.5">
                                <AppButton variant="bordered" size="sm" className="h-7 text-[11px]" isDisabled={page <= 1} onPress={() => setPage((p) => Math.max(1, p - 1))}>Previous</AppButton>
                                <AppButton variant="bordered" size="sm" className="h-7 text-[11px]" isDisabled={page >= meta.lastPage} onPress={() => setPage((p) => p + 1)}>Next</AppButton>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <NewFolderModal isOpen={newFolderOpen} onClose={handleFolderCreated} dossierId={dossierId} />
        </div>
    );
}
