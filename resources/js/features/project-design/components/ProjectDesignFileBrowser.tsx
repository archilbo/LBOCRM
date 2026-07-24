import { useMemo, useState } from 'react';
import {
    Button,
    Card,
    Chip,
    Input,
    ListBox,
    Popover,
    Select,
    Spinner,
    Tooltip,
} from '@heroui/react';
import {
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    File,
    Filter,
    FolderPlus,
    HardDrive,
    Search,
    Upload,
    X,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { useFolders, useFiles } from '../hooks/useProjectDesignQueries';
import { ProjectDesignFolderTree } from './ProjectDesignFolderTree';
import { DesignUploadDrawer } from '@/features/dossiers/components/DesignUploadDrawer';
import { NewFolderModal } from './ProjectDesignNewFolderModal';
import { STATUS_BADGE, DISCIPLINE_COLORS } from '../utils/projectDesignFormatters';
import type { ProjectDesignFile } from '../types/projectDesign';

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

function IconAction({
    label,
    onPress,
    children,
    active,
    isDisabled,
}: {
    label: string;
    onPress: () => void;
    children: React.ReactNode;
    active?: boolean;
    isDisabled?: boolean;
}) {
    return (
        <Tooltip delay={350}>
            <Tooltip.Trigger>
                <Button
                    isIconOnly
                    size="sm"
                    variant="ghost"
                    aria-label={label}
                    onPress={onPress}
                    isDisabled={isDisabled}
                    className={cn(
                        'h-8 w-8 min-w-0 rounded-lg border',
                        active
                            ? 'border-[var(--accent)]/35 bg-[var(--accent)]/12 text-[var(--accent)]'
                            : 'border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]',
                    )}
                >
                    {children}
                </Button>
            </Tooltip.Trigger>
            <Tooltip.Content>{label}</Tooltip.Content>
        </Tooltip>
    );
}

function CompactSelect({
    label,
    value,
    options,
    onChange,
}: {
    label: string;
    value: string;
    options: { id: string; label: string }[];
    onChange: (value: string) => void;
}) {
    return (
        <Select
            aria-label={label}
            placeholder={label}
            value={value || null}
            onChange={(key) => onChange(key === '__all__' || key == null ? '' : String(key))}
            fullWidth
            variant="secondary"
            className="w-full"
        >
            <Select.Trigger className="h-8 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-2.5 text-[11px]">
                <Select.Value />
                <Select.Indicator />
            </Select.Trigger>
            <Select.Popover className="z-[180] min-w-[180px] rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1 shadow-2xl">
                <ListBox>
                    <ListBox.Item id="__all__" textValue={`All ${label.toLowerCase()}`} className="rounded-lg px-2 py-1.5 text-[11px]">
                        All {label.toLowerCase()}
                    </ListBox.Item>
                    {options.map((option) => (
                        <ListBox.Item
                            key={option.id}
                            id={option.id}
                            textValue={option.label}
                            className="rounded-lg px-2 py-1.5 text-[11px]"
                        >
                            {option.label}
                        </ListBox.Item>
                    ))}
                </ListBox>
            </Select.Popover>
        </Select>
    );
}

function FileRow({
    file,
    onSelect,
    isSelected,
}: {
    file: ProjectDesignFile;
    onSelect: (file: ProjectDesignFile) => void;
    isSelected: boolean;
}) {
    return (
        <Button
            size="sm"
            variant="ghost"
            onPress={() => onSelect(file)}
            aria-pressed={isSelected}
            className={cn(
                'group h-auto min-h-11 w-full justify-start gap-2 rounded-xl border px-2 py-1.5 text-left',
                isSelected
                    ? 'border-[var(--accent)]/35 bg-[var(--accent)]/10 text-[var(--foreground)] shadow-sm'
                    : 'border-transparent text-[var(--foreground)] hover:border-[var(--border)] hover:bg-[var(--surface-2)]/75',
            )}
        >
            <span
                className={cn(
                    'flex size-7 shrink-0 items-center justify-center rounded-lg',
                    DISCIPLINE_COLORS[file.discipline ?? '']
                        ?? 'bg-[var(--surface-2)] text-[var(--text-muted)]',
                )}
            >
                <File size={12} />
            </span>
            <span className="min-w-0 flex-1">
                <span className="flex min-w-0 items-center gap-1.5">
                    <span className="min-w-0 flex-1 truncate text-[11px] font-medium">{file.name}</span>
                    {file.latestVersion ? (
                        <Chip size="sm" variant="soft" className="h-4 shrink-0 px-1 text-[8px]">
                            v{file.latestVersion.versionNumber}
                        </Chip>
                    ) : null}
                </span>
                <span className="mt-0.5 flex items-center gap-1.5 text-[9px] text-[var(--text-muted)]">
                    {file.discipline ? <span className="capitalize">{file.discipline}</span> : <span>Unassigned</span>}
                    <span className="text-[var(--text-subtle)]">·</span>
                    <span>{file.versionsCount} version{file.versionsCount === 1 ? '' : 's'}</span>
                </span>
            </span>
            <span className="flex shrink-0 items-center gap-1">
                {file.openRemarksCount > 0 ? (
                    <Chip size="sm" variant="soft" className="h-4 bg-amber-400/10 px-1 text-[8px] text-amber-300">
                        {file.openRemarksCount}
                    </Chip>
                ) : null}
                <span className={cn('size-1.5 rounded-full', STATUS_BADGE[file.status]?.includes('emerald') ? 'bg-emerald-400' : 'bg-amber-400')} />
            </span>
        </Button>
    );
}

export function ProjectDesignFileBrowser({
    dossierId,
    onFileSelect,
    selectedFileId,
    portalContainer,
}: {
    dossierId: number;
    onFileSelect: (file: ProjectDesignFile) => void;
    selectedFileId: number | null;
    portalContainer?: HTMLElement | null;
}) {
    const [uploadOpen, setUploadOpen] = useState(false);
    const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
    const [newFolderOpen, setNewFolderOpen] = useState(false);
    const [foldersExpanded, setFoldersExpanded] = useState(true);
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
    const meta = useMemo(() => ({
        currentPage: filesData?.current_page ?? 1,
        lastPage: filesData?.last_page ?? 1,
        total: filesData?.total ?? 0,
    }), [filesData]);
    const hasActiveFilters = Boolean(search || disciplineFilter || statusFilter);

    const grouped = useMemo(() => {
        if (selectedFolderId) return null;
        const groups = new Map<string, ProjectDesignFile[]>();
        const uncategorized: ProjectDesignFile[] = [];
        for (const file of files) {
            if (!file.discipline) {
                uncategorized.push(file);
                continue;
            }
            const current = groups.get(file.discipline) ?? [];
            current.push(file);
            groups.set(file.discipline, current);
        }
        return {
            groups: [...groups.entries()].sort(([left], [right]) => left.localeCompare(right)),
            uncategorized,
        };
    }, [files, selectedFolderId]);

    function resetFilters() {
        setSearch('');
        setDisciplineFilter('');
        setStatusFilter('');
        setPage(1);
    }

    return (
        <div className="flex h-full min-h-0 flex-col overflow-hidden bg-[var(--surface)]">
            <div className="shrink-0 space-y-2 border-b border-[var(--border)] p-2">
                <div className="flex items-center gap-1.5">
                    <div className="relative min-w-0 flex-1">
                        <Search className="pointer-events-none absolute left-2.5 top-1/2 z-10 -translate-y-1/2 text-[var(--text-subtle)]" size={13} />
                        <Input
                            value={search}
                            onChange={(event) => {
                                setSearch(event.target.value);
                                setPage(1);
                            }}
                            placeholder="Search files"
                            aria-label="Search design files"
                            variant="secondary"
                            fullWidth
                            className="h-8 pl-8 pr-8 text-[11px]"
                        />
                        {search ? (
                            <Button
                                isIconOnly
                                size="sm"
                                variant="ghost"
                                aria-label="Clear search"
                                onPress={() => {
                                    setSearch('');
                                    setPage(1);
                                }}
                                className="absolute right-0.5 top-0.5 z-10 h-7 w-7 min-w-0 text-[var(--text-muted)]"
                            >
                                <X size={12} />
                            </Button>
                        ) : null}
                    </div>

                    <Popover>
                        <Popover.Trigger>
                            <Button
                                isIconOnly
                                size="sm"
                                variant="ghost"
                                aria-label="Filter and sort files"
                                className={cn(
                                    'relative h-8 w-8 min-w-0 rounded-lg border',
                                    hasActiveFilters
                                        ? 'border-[var(--accent)]/35 bg-[var(--accent)]/12 text-[var(--accent)]'
                                        : 'border-[var(--border)] text-[var(--text-muted)]',
                                )}
                            >
                                <Filter size={13} />
                                {hasActiveFilters ? <span className="absolute right-1 top-1 size-1.5 rounded-full bg-[var(--accent)]" /> : null}
                            </Button>
                        </Popover.Trigger>
                        <Popover.Content
                            placement="bottom end"
                            offset={8}
                            className="z-[180] w-60 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl"
                        >
                            <Popover.Dialog className="space-y-2 p-3">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                                    Filter & sort
                                </p>
                                <CompactSelect label="Disciplines" value={disciplineFilter} options={DISCIPLINE_OPTIONS} onChange={(value) => { setDisciplineFilter(value); setPage(1); }} />
                                <CompactSelect label="Statuses" value={statusFilter} options={STATUS_OPTIONS} onChange={(value) => { setStatusFilter(value); setPage(1); }} />
                                <CompactSelect label="Sort" value={sort} options={SORT_OPTIONS} onChange={(value) => setSort(value || 'name')} />
                                {hasActiveFilters ? (
                                    <Button size="sm" variant="ghost" fullWidth onPress={resetFilters} className="h-8 text-[11px]">
                                        <X size={12} />
                                        Clear filters
                                    </Button>
                                ) : null}
                            </Popover.Dialog>
                        </Popover.Content>
                    </Popover>

                    <IconAction label="Upload design file" onPress={() => setUploadOpen(true)}>
                        <Upload size={13} />
                    </IconAction>
                    <IconAction label="Create folder" onPress={() => setNewFolderOpen(true)}>
                        <FolderPlus size={13} />
                    </IconAction>
                </div>

                <Card variant="secondary" className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface-2)]/35">
                    <Card.Content className="p-1.5">
                        <Button
                            size="sm"
                            variant="ghost"
                            fullWidth
                            onPress={() => setFoldersExpanded((current) => !current)}
                            aria-expanded={foldersExpanded}
                            className="h-7 justify-start gap-2 rounded-lg px-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]"
                        >
                            <HardDrive size={12} />
                            <span className="flex-1 text-left">Folders</span>
                            <Chip size="sm" variant="soft" className="h-4 px-1 text-[8px]">{folders.length}</Chip>
                            {foldersExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        </Button>
                        {foldersExpanded ? (
                            <div className="mt-1 max-h-44 overflow-y-auto pr-0.5">
                                <ProjectDesignFolderTree
                                    folders={folders}
                                    selectedFolderId={selectedFolderId}
                                    onSelect={(folderId) => {
                                        setSelectedFolderId(folderId);
                                        setPage(1);
                                    }}
                                />
                            </div>
                        ) : null}
                    </Card.Content>
                </Card>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
                <div className="mb-2 flex items-center justify-between px-1">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                        {selectedFolderId ? 'Folder files' : 'Project files'}
                    </p>
                    <span className="text-[9px] tabular-nums text-[var(--text-subtle)]">{meta.total}</span>
                </div>

                {isLoading ? (
                    <div className="flex min-h-40 items-center justify-center">
                        <Spinner size="sm" />
                    </div>
                ) : files.length === 0 ? (
                    <Card variant="secondary" className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-2)]/25">
                        <Card.Content className="flex min-h-40 flex-col items-center justify-center p-5 text-center">
                            <span className="flex size-9 items-center justify-center rounded-xl bg-[var(--surface-2)] text-[var(--text-muted)]">
                                <HardDrive size={16} />
                            </span>
                            <p className="mt-2 text-[11px] font-medium text-[var(--foreground)]">No files found</p>
                            <p className="mt-1 max-w-52 text-[9px] leading-4 text-[var(--text-muted)]">
                                {hasActiveFilters ? 'Change the current search or filters.' : 'Upload a design file to start reviewing.'}
                            </p>
                            {!hasActiveFilters ? (
                                <Button size="sm" variant="secondary" onPress={() => setUploadOpen(true)} className="mt-3 h-8 text-[10px]">
                                    <Upload size={12} />
                                    Upload file
                                </Button>
                            ) : null}
                        </Card.Content>
                    </Card>
                ) : (
                    <div className="space-y-2">
                        {grouped ? (
                            <>
                                {grouped.groups.map(([discipline, groupFiles]) => (
                                    <section key={discipline}>
                                        <div className={cn('mb-1 flex items-center gap-1.5 rounded-lg px-2 py-1', DISCIPLINE_COLORS[discipline] ?? '')}>
                                            <span className="text-[8px] font-semibold uppercase tracking-[0.14em]">{discipline}</span>
                                            <span className="text-[8px] opacity-60">{groupFiles.length}</span>
                                        </div>
                                        <div className="space-y-0.5">
                                            {groupFiles.map((file) => (
                                                <FileRow key={file.id} file={file} onSelect={onFileSelect} isSelected={selectedFileId === file.id} />
                                            ))}
                                        </div>
                                    </section>
                                ))}
                                {grouped.uncategorized.length ? (
                                    <section>
                                        <div className="mb-1 flex items-center gap-1.5 rounded-lg bg-[var(--surface-2)] px-2 py-1 text-[var(--text-muted)]">
                                            <span className="text-[8px] font-semibold uppercase tracking-[0.14em]">Other</span>
                                            <span className="text-[8px] opacity-60">{grouped.uncategorized.length}</span>
                                        </div>
                                        <div className="space-y-0.5">
                                            {grouped.uncategorized.map((file) => (
                                                <FileRow key={file.id} file={file} onSelect={onFileSelect} isSelected={selectedFileId === file.id} />
                                            ))}
                                        </div>
                                    </section>
                                ) : null}
                            </>
                        ) : (
                            <div className="space-y-0.5">
                                {files.map((file) => (
                                    <FileRow key={file.id} file={file} onSelect={onFileSelect} isSelected={selectedFileId === file.id} />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {meta.lastPage > 1 ? (
                <div className="flex h-10 shrink-0 items-center justify-between border-t border-[var(--border)] px-2">
                    <span className="text-[9px] tabular-nums text-[var(--text-muted)]">
                        {meta.currentPage} / {meta.lastPage}
                    </span>
                    <div className="flex items-center gap-1">
                        <IconAction label="Previous page" isDisabled={meta.currentPage <= 1} onPress={() => setPage((current) => Math.max(1, current - 1))}>
                            <ChevronLeft size={12} />
                        </IconAction>
                        <IconAction label="Next page" isDisabled={meta.currentPage >= meta.lastPage} onPress={() => setPage((current) => Math.min(meta.lastPage, current + 1))}>
                            <ChevronRight size={12} />
                        </IconAction>
                    </div>
                </div>
            ) : null}

            <DesignUploadDrawer
                dossierId={dossierId}
                folders={folders}
                isOpen={uploadOpen}
                onOpenChange={setUploadOpen}
                onComplete={() => undefined}
                portalContainer={portalContainer}
            />
            <NewFolderModal
                isOpen={newFolderOpen}
                onClose={() => setNewFolderOpen(false)}
                dossierId={dossierId}
                portalContainer={portalContainer}
            />
        </div>
    );
}
