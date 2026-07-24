import { useMemo, useState } from 'react';
import {
    Button,
    Input,
    ListBox,
    Popover,
    Select,
    Spinner,
    Tooltip,
} from '@heroui/react';
import {
    ChevronsDownUp,
    ChevronsUpDown,
    ChevronDown ,
    ChevronLeft,
    ChevronRight,
    Filter,
    FolderPlus,
    MoreHorizontal,
    RefreshCw,
    Search,
    Upload,
    X,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { useFolders, useFiles } from '../hooks/useProjectDesignQueries';
import {
    ProjectDesignFolderTree,
    type ProjectDesignTreeCommand,
} from './ProjectDesignFolderTree';
import { DesignUploadDrawer } from '@/features/dossiers/components/DesignUploadDrawer';
import { NewFolderModal } from './ProjectDesignNewFolderModal';
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
    { id: 'updated_at', label: 'Last modified' },
    { id: 'discipline', label: 'Discipline' },
];

function ExplorerAction({
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
                        'h-7 w-7 min-w-0 rounded-md text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]',
                        active && 'bg-[var(--accent)]/12 text-[var(--accent)]',
                    )}
                >
                    {children}
                </Button>
            </Tooltip.Trigger>
            <Tooltip.Content>{label}</Tooltip.Content>
        </Tooltip>
    );
}

function FilterSelect({
    label,
    value,
    options,
    onChange,
}: {
    label: string;
    value: string;
    options: Array<{ id: string; label: string }>;
    onChange: (value: string) => void;
}) {
    return (
        <Select
            aria-label={label}
            value={value || null}
            onChange={(key) => onChange(key == null || key === '__all__' ? '' : String(key))}
            variant="secondary"
            fullWidth
        >
            <Select.Trigger className="h-8 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-2.5 text-[11px]">
                <Select.Value />
                <Select.Indicator />
            </Select.Trigger>
            <Select.Popover className="z-[190] min-w-48 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1 shadow-2xl">
                <ListBox>
                    <ListBox.Item id="__all__" textValue={`All ${label.toLowerCase()}`} className="rounded-lg px-2 py-1.5 text-[11px]">
                        All {label.toLowerCase()}
                    </ListBox.Item>
                    {options.map((option) => (
                        <ListBox.Item key={option.id} id={option.id} textValue={option.label} className="rounded-lg px-2 py-1.5 text-[11px]">
                            {option.label}
                        </ListBox.Item>
                    ))}
                </ListBox>
            </Select.Popover>
        </Select>
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
    const [newFolderOpen, setNewFolderOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [discipline, setDiscipline] = useState('');
    const [status, setStatus] = useState('');
    const [sort, setSort] = useState('name');
    const [page, setPage] = useState(1);
    const [treeCommand, setTreeCommand] = useState<ProjectDesignTreeCommand | null>(null);

    const { data: folders = [], isFetching: foldersRefreshing, refetch: refetchFolders } = useFolders(dossierId);
    const {
        data: filesData,
        isLoading,
        isFetching: filesRefreshing,
        refetch: refetchFiles,
    } = useFiles(dossierId, {
        search: search || undefined,
        discipline: discipline || undefined,
        status: status || undefined,
        sort,
        page,
        per_page: 100,
    });

    const files = useMemo(() => filesData?.data ?? [], [filesData]);
    const meta = useMemo(() => ({
        currentPage: filesData?.current_page ?? 1,
        lastPage: filesData?.last_page ?? 1,
        total: filesData?.total ?? 0,
    }), [filesData]);
    const hasFilters = Boolean(search || discipline || status || sort !== 'name');
    const refreshing = foldersRefreshing || filesRefreshing;

    function issueTreeCommand(type: ProjectDesignTreeCommand['type']) {
        setTreeCommand({ type, key: Date.now() });
    }

    function resetFilters() {
        setSearch('');
        setDiscipline('');
        setStatus('');
        setSort('name');
        setPage(1);
    }

    return (
        <div className="flex h-full min-h-0 flex-col overflow-hidden bg-[var(--surface)]">
            <div className="flex h-9 shrink-0 items-center border-b border-[var(--border)] px-2">
                <span className="min-w-0 flex-1 truncate text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--foreground)]">
                    Explorer
                </span>
                <ExplorerAction label="New folder" onPress={() => setNewFolderOpen(true)}>
                    <FolderPlus size={13} />
                </ExplorerAction>
                <ExplorerAction label="Upload file" onPress={() => setUploadOpen(true)}>
                    <Upload size={13} />
                </ExplorerAction>
                <ExplorerAction label="Refresh explorer" onPress={() => void Promise.all([refetchFolders(), refetchFiles()])}>
                    <RefreshCw size={13} className={cn(refreshing && 'animate-spin')} />
                </ExplorerAction>
                <Popover>
                    <Popover.Trigger>
                        <Button isIconOnly size="sm" variant="ghost" aria-label="More explorer actions" className="h-7 w-7 min-w-0 rounded-md text-[var(--text-muted)]">
                            <MoreHorizontal size={14} />
                        </Button>
                    </Popover.Trigger>
                    <Popover.Content placement="bottom end" offset={6} className="z-[190] w-44 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1 shadow-2xl">
                        <Popover.Dialog className="space-y-0.5">
                            <Button size="sm" variant="ghost" fullWidth onPress={() => issueTreeCommand('expand-all')} className="h-8 justify-start gap-2 rounded-lg px-2 text-[11px]">
                                <ChevronsUpDown size={13} /> Expand all
                            </Button>
                            <Button size="sm" variant="ghost" fullWidth onPress={() => issueTreeCommand('collapse-all')} className="h-8 justify-start gap-2 rounded-lg px-2 text-[11px]">
                                <ChevronsDownUp size={13} /> Collapse all
                            </Button>
                        </Popover.Dialog>
                    </Popover.Content>
                </Popover>
            </div>

            <div className="shrink-0 border-b border-[var(--border)] p-1.5">
                <div className="flex items-center gap-1">
                    <div className="relative min-w-0 flex-1">
                        <Search size={12} className="pointer-events-none absolute left-2 top-1/2 z-10 -translate-y-1/2 text-[var(--text-subtle)]" />
                        <Input
                            value={search}
                            onChange={(event) => { setSearch(event.target.value); setPage(1); }}
                            placeholder="Filter files"
                            aria-label="Filter project design files"
                            variant="secondary"
                            fullWidth
                            className="h-7 rounded-md pl-7 pr-7 text-[10px]"
                        />
                        {search ? (
                            <Button isIconOnly size="sm" variant="ghost" aria-label="Clear file filter" onPress={() => { setSearch(''); setPage(1); }} className="absolute right-0 top-0 z-10 h-7 w-7 min-w-0 rounded-md text-[var(--text-muted)]">
                                <X size={11} />
                            </Button>
                        ) : null}
                    </div>
                    <Popover>
                        <Popover.Trigger>
                            <Button
                                isIconOnly
                                size="sm"
                                variant="ghost"
                                aria-label="Filter explorer"
                                className={cn('relative h-7 w-7 min-w-0 rounded-md text-[var(--text-muted)]', hasFilters && 'bg-[var(--accent)]/12 text-[var(--accent)]')}
                            >
                                <Filter size={12} />
                                {hasFilters ? <span className="absolute right-1 top-1 size-1 rounded-full bg-[var(--accent)]" /> : null}
                            </Button>
                        </Popover.Trigger>
                        <Popover.Content placement="bottom end" offset={6} className="z-[190] w-60 rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl">
                            <Popover.Dialog className="space-y-2 p-3">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">Filter & sort</p>
                                <FilterSelect label="Disciplines" value={discipline} options={DISCIPLINE_OPTIONS} onChange={(value) => { setDiscipline(value); setPage(1); }} />
                                <FilterSelect label="Statuses" value={status} options={STATUS_OPTIONS} onChange={(value) => { setStatus(value); setPage(1); }} />
                                <FilterSelect label="Sort" value={sort} options={SORT_OPTIONS} onChange={(value) => { setSort(value || 'name'); setPage(1); }} />
                                {hasFilters ? (
                                    <Button size="sm" variant="ghost" fullWidth onPress={resetFilters} className="h-8 text-[11px]">
                                        <X size={12} /> Clear filters
                                    </Button>
                                ) : null}
                            </Popover.Dialog>
                        </Popover.Content>
                    </Popover>
                </div>
            </div>

            <div className="flex h-7 shrink-0 items-center border-b border-[var(--border)] bg-[var(--surface-2)]/35 px-2">
                <ChevronDown size={12} className="mr-1 text-[var(--text-subtle)]" />
                <span className="min-w-0 flex-1 truncate text-[10px] font-semibold uppercase tracking-[0.09em] text-[var(--foreground)]">Project design</span>
                <span className="text-[9px] tabular-nums text-[var(--text-subtle)]">{meta.total}</span>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
                {isLoading ? (
                    <div className="flex min-h-32 items-center justify-center"><Spinner size="sm" /></div>
                ) : (
                    <ProjectDesignFolderTree
                        dossierId={dossierId}
                        folders={folders}
                        files={files}
                        selectedFileId={selectedFileId}
                        onFileSelect={onFileSelect}
                        command={treeCommand}
                    />
                )}
            </div>

            <div className="flex h-8 shrink-0 items-center border-t border-[var(--border)] px-2">
                <span className="min-w-0 flex-1 truncate text-[9px] text-[var(--text-subtle)]">
                    {meta.total} file{meta.total === 1 ? '' : 's'}{meta.lastPage > 1 ? ` · page ${meta.currentPage}/${meta.lastPage}` : ''}
                </span>
                {meta.lastPage > 1 ? (
                    <div className="flex items-center">
                        <ExplorerAction label="Previous file page" isDisabled={meta.currentPage <= 1} onPress={() => setPage((current) => Math.max(1, current - 1))}>
                            <ChevronLeft size={12} />
                        </ExplorerAction>
                        <ExplorerAction label="Next file page" isDisabled={meta.currentPage >= meta.lastPage} onPress={() => setPage((current) => Math.min(meta.lastPage, current + 1))}>
                            <ChevronRight size={12} />
                        </ExplorerAction>
                    </div>
                ) : null}
            </div>

            <DesignUploadDrawer
                dossierId={dossierId}
                folders={folders}
                isOpen={uploadOpen}
                onOpenChange={setUploadOpen}
                onComplete={() => void Promise.all([refetchFolders(), refetchFiles()])}
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
