import { useState, useMemo } from 'react';
import { FolderPlus, Upload, File, HardDrive, Filter, X, Search } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Popover, PopoverTrigger, PopoverContent } from '@heroui/react';
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
                'group flex w-full items-center gap-2 rounded-lg border bg-[var(--surface)] px-2.5 py-1.5 text-left transition',
                isSelected
                    ? 'border-[var(--accent)]/40 bg-[var(--accent)]/5'
                    : 'border-transparent hover:border-[var(--accent)]/30',
            )}
        >
            <div className={cn('flex size-6 shrink-0 items-center justify-center rounded-md', DISCIPLINE_COLORS[file.discipline ?? ''] ?? 'bg-[var(--surface-2)] text-[var(--text-muted)]')}>
                <File size={11} />
            </div>
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                    <p className="truncate text-[12px] font-medium text-[var(--foreground)]">{file.name}</p>
                    {file.latestVersion && (
                        <span className="shrink-0 rounded bg-[var(--surface-2)] px-1 py-0.5 text-[9px] font-semibold text-[var(--text-muted)] leading-none">v{file.latestVersion.versionNumber}</span>
                    )}
                </div>
                <div className="flex items-center gap-2 text-[10px] text-[var(--text-muted)]">
                    {file.discipline && <span className="capitalize">{file.discipline}</span>}
                    {file.versionsCount > 0 && <span>{file.versionsCount}v</span>}
                </div>
            </div>
            {file.openRemarksCount > 0 && (
                <span className="shrink-0 rounded bg-amber-400/10 px-1.5 py-0.5 text-[9px] font-semibold text-amber-400 leading-none">{file.openRemarksCount}</span>
            )}
            <span className={cn('shrink-0 rounded px-1 py-0.5 text-[8px] font-semibold leading-none', STATUS_BADGE[file.status] ?? '')}>{file.status}</span>
        </button>
    );
}

const DISCIPLINE_OPTIONS = [
    { id: 'architecture', label: 'Architecture' },
    { id: 'structure', label: 'Structure' },
    { id: 'mep', label: 'MEP' },
    { id: 'interior', label: 'Interior' },
    { id: 'landscape', label: 'Landscape' },
];

const STATUS_OPTIONS = [
    { id: 'active', label: 'Active' },
    { id: 'archived', label: 'Archived' },
];

const SORT_OPTIONS = [
    { id: 'name', label: 'Name' },
    { id: 'discipline', label: 'Discipline' },
    { id: 'created_at', label: 'Created' },
    { id: 'updated_at', label: 'Updated' },
];

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

    const hasActiveFilters = !!(search || disciplineFilter || statusFilter);

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
        <div className="flex h-full flex-col overflow-hidden">
            {/* Compact toolbar row */}
            <div className="flex items-center gap-1.5 border-b border-[var(--border)] px-2 py-1.5 shrink-0">
                <div className="flex-1 min-w-0">
                    <AppInput
                        value={search}
                        onChange={(value) => handleSearch(value)}
                        placeholder="Search..."
                        aria-label="Search files"
                        size="sm"
                    />
                </div>
                <Popover>
                    <PopoverTrigger>
                        <AppButton size="sm" variant={hasActiveFilters ? 'solid' : 'bordered'} className="h-7 min-w-0 px-1.5 text-[11px]">
                            <Filter size={12} />
                            {hasActiveFilters && <span className="ml-0.5 rounded-full bg-[var(--accent)] size-1.5" />}
                        </AppButton>
                    </PopoverTrigger>
                    <PopoverContent className="w-56 p-3 space-y-3">
                        <AppSelect
                            selectedKey={disciplineFilter || null}
                            onSelectionChange={(key) => { setDisciplineFilter(key ? String(key) : ''); setPage(1); }}
                            options={DISCIPLINE_OPTIONS}
                            placeholder="All disciplines"
                            aria-label="Filter by discipline"
                            size="sm"
                        />
                        <AppSelect
                            selectedKey={statusFilter || null}
                            onSelectionChange={(key) => { setStatusFilter(key ? String(key) : ''); setPage(1); }}
                            options={STATUS_OPTIONS}
                            placeholder="All statuses"
                            aria-label="Filter by status"
                            size="sm"
                        />
                        <AppSelect
                            selectedKey={sort}
                            onSelectionChange={(key) => setSort(String(key ?? 'name'))}
                            options={SORT_OPTIONS}
                            placeholder="Sort"
                            aria-label="Sort files"
                            size="sm"
                        />
                        {hasActiveFilters && (
                            <AppButton size="sm" variant="ghost" className="w-full h-7 text-[11px]"
                                onPress={() => { setSearch(''); setDisciplineFilter(''); setStatusFilter(''); setPage(1); }}>
                                <X size={11} /> Clear filters
                            </AppButton>
                        )}
                    </PopoverContent>
                </Popover>
                <AppButton variant="bordered" size="sm" className="h-7 min-w-0 px-1.5 text-[11px]" onPress={() => setUploadOpen(true)}>
                    <Upload size={12} />
                </AppButton>
                <AppButton variant="bordered" size="sm" className="h-7 min-w-0 px-1.5 text-[11px]" onPress={() => setNewFolderOpen(true)}>
                    <FolderPlus size={12} />
                </AppButton>
            </div>

            <DesignUploadDrawer dossierId={dossierId} folders={folders} isOpen={uploadOpen}
                onOpenChange={setUploadOpen} onComplete={() => {}} />

            {/* Body: folder tree + file list */}
            <div className="flex flex-1 min-h-0">
                <div className="hidden w-44 shrink-0 overflow-y-auto overflow-x-hidden border-r border-[var(--border)] sm:block">
                    <ProjectDesignFolderTree folders={folders} selectedFolderId={selectedFolderId} onSelect={handleFolderSelect} />
                </div>
                <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8 text-[12px] text-[var(--text-muted)]">Loading files...</div>
                    ) : files.length === 0 ? (
                        <div className="flex flex-1 items-center justify-center p-4">
                            <AppEmptyState icon={<HardDrive size={14} />} title="No files found"
                                description={search || disciplineFilter || statusFilter ? 'Try changing your filters.' : 'Upload design files to get started.'} />
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-2">
                            <div className="space-y-2">
                                {grouped ? (
                                    <>
                                        {grouped.groups.map(([discipline, groupFiles]) => (
                                            <div key={discipline}>
                                                <div className={cn('mb-1 flex items-center gap-1.5 rounded-md px-2 py-0.5', DISCIPLINE_COLORS[discipline] ?? '')}>
                                                    <span className="text-[9px] font-semibold uppercase tracking-wider">{discipline}</span>
                                                    <span className="text-[9px] opacity-60">{groupFiles.length}</span>
                                                </div>
                                                <div className="space-y-0.5">
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
                                                <div className="mb-1 flex items-center gap-1.5 rounded-md bg-[var(--surface-2)] px-2 py-0.5">
                                                    <span className="text-[9px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Other</span>
                                                    <span className="text-[9px] text-[var(--text-subtle)]">{grouped.uncategorized.length}</span>
                                                </div>
                                                <div className="space-y-0.5">
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
                                    <div className="space-y-0.5">
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
                            {meta.lastPage > 1 && (
                                <div className="mt-3 flex items-center justify-between border-t border-[var(--border)] pt-2">
                                    <p className="text-[10px] text-[var(--text-muted)]">{meta.total} · {meta.currentPage}/{meta.lastPage}</p>
                                    <div className="flex gap-1">
                                        <AppButton variant="bordered" size="sm" className="h-6 text-[10px]" isDisabled={page <= 1} onPress={() => setPage((p) => Math.max(1, p - 1))}>Prev</AppButton>
                                        <AppButton variant="bordered" size="sm" className="h-6 text-[10px]" isDisabled={page >= meta.lastPage} onPress={() => setPage((p) => p + 1)}>Next</AppButton>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <NewFolderModal isOpen={newFolderOpen} onClose={handleFolderCreated} dossierId={dossierId} />
        </div>
    );
}
