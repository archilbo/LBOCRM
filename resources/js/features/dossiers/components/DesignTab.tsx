import { useState, useCallback, useEffect, useRef } from 'react';
import { Layers, Activity, HardDrive, FolderKanban, FolderPlus, Search, X, ArrowUpDown, FileType, Archive, RotateCcw, Eye, Clock, User, ChevronRight, ChevronDown, Folder, File, Plus, Filter, Trash2, Upload } from 'lucide-react';
import { cn } from '@/lib/cn';
import { AppEmptyState } from '@/components/ui/AppEmptyState';
import { AppButton } from '@/components/ui/AppButton';
import { AppModal } from '@/components/ui/AppModal';
import { DesignUploadZone } from '@/features/dossiers/components/DesignUploadZone';
import { DesignFileViewer } from '@/features/dossiers/components/DesignFileViewer';
import { toast } from 'sonner';

type DesignMode = 'files' | 'activity';

type Summary = { folders: number; files: number; versions: number; activities: number; canUpload: boolean };
type FolderNode = { id: number; dossierId: number; parentId: number | null; name: string; slug: string; filesCount: number };
type DesignFile = { id: number; dossierId: number; folderId: number | null; name: string; description: string | null; type: string; status: string; sortOrder: number; recordVersion: number; versionsCount: number; latestVersion: DesignVersion | null; createdAt: string; updatedAt: string };
type DesignVersion = { id: number; fileId: number; versionNumber: number; status: string; fileSize: number | null; mimeType: string | null; originalFilename: string | null; uploadedBy: { id: number; name: string } | null; notes: string | null; createdAt: string };
type ActivityItem = { id: number; action: string; description: string | null; metadata: Record<string, unknown> | null; user: { id: number; name: string } | null; createdAt: string };

const MODES: { id: DesignMode; label: string }[] = [
    { id: 'files', label: 'Files' },
    { id: 'activity', label: 'Activity' },
];

function SummaryBar({ summary }: { summary: Summary | null }) {
    const items = [
        { label: 'Folders', value: summary?.folders ?? 0, icon: FolderKanban },
        { label: 'Files', value: summary?.files ?? 0, icon: HardDrive },
        { label: 'Versions', value: summary?.versions ?? 0, icon: Layers },
        { label: 'Activities', value: summary?.activities ?? 0, icon: Activity },
    ];
    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {items.map((item) => (
                <div key={item.label} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-sm">
                    <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                            <p className="text-[11px] font-medium text-[var(--text-muted)]">{item.label}</p>
                            <p className="mt-0.5 text-base font-semibold text-[var(--foreground)]">{item.value}</p>
                        </div>
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-2)] text-[var(--text-muted)]">
                            <item.icon size={14} />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

function FolderTree({ folders, selectedFolderId, onSelect }: { folders: FolderNode[]; selectedFolderId: number | null; onSelect: (id: number | null) => void }) {
    const rootFolders = folders.filter((f) => !f.parentId);
    const childMap = new Map<number, FolderNode[]>();
    for (const f of folders) {
        if (f.parentId) {
            const children = childMap.get(f.parentId) ?? [];
            children.push(f);
            childMap.set(f.parentId, children);
        }
    }
    const [expanded, setExpanded] = useState<Set<number>>(new Set());

    function renderFolder(folder: FolderNode, depth: number) {
        const children = childMap.get(folder.id) ?? [];
        const isExpanded = expanded.has(folder.id);
        const hasChildren = children.length > 0;
        return (
            <div key={folder.id}>
                <button type="button" onClick={() => onSelect(folder.id)}
                    className={cn(
                        'flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-left text-[12px] transition',
                        selectedFolderId === folder.id ? 'bg-[var(--accent)]/10 text-[var(--accent)]' : 'hover:bg-[var(--surface-2)] text-[var(--foreground)]',
                    )} style={{ paddingLeft: `${8 + depth * 16}px` }}>
                    <button type="button" onClick={(e) => { e.stopPropagation(); setExpanded((prev) => { const next = new Set(prev); if (isExpanded) next.delete(folder.id); else next.add(folder.id); return next; }); }}
                        className="flex size-4 shrink-0 items-center justify-center rounded text-[var(--text-muted)] hover:bg-[var(--surface-3)]">
                        {hasChildren ? (isExpanded ? <ChevronDown size={11} /> : <ChevronRight size={11} />) : null}
                    </button>
                    <Folder size={13} className="shrink-0 text-[var(--text-muted)]" />
                    <span className="truncate">{folder.name}</span>
                    <span className="ml-auto text-[10px] text-[var(--text-subtle)]">{folder.filesCount}</span>
                </button>
                {isExpanded && children.map((child) => renderFolder(child, depth + 1))}
            </div>
        );
    }

    return (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2">
            <button type="button" onClick={() => onSelect(null)}
                className={cn(
                    'flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-[12px] font-medium transition',
                    selectedFolderId === null ? 'bg-[var(--accent)]/10 text-[var(--accent)]' : 'hover:bg-[var(--surface-2)] text-[var(--foreground)]',
                )}>
                <HardDrive size={13} />
                All files
            </button>
            <div className="mt-1 space-y-0.5">
                {rootFolders.map((f) => renderFolder(f, 0))}
            </div>
        </div>
    );
}

function NewFolderModal({ isOpen, onClose, dossierId }: { isOpen: boolean; onClose: () => void; dossierId: number }) {
    const [name, setName] = useState('');
    const [saving, setSaving] = useState(false);

    async function handleSubmit() {
        if (!name.trim()) return;
        setSaving(true);
        try {
            const res = await fetch('/dossiers/design/folders', {
                method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
                body: JSON.stringify({ dossier_id: dossierId, name: name.trim() }),
            });
            if (!res.ok) throw new Error();
            toast.success('Folder created.');
            setName('');
            onClose();
        } catch {
            toast.error('Could not create folder.');
        } finally {
            setSaving(false);
        }
    }

    return (
        <AppModal isOpen={isOpen} onOpenChange={(o) => { if (!o) onClose(); }} title="New folder" size="sm">
            <div className="space-y-4">
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Folder name..."
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-[13px] outline-none focus:border-[var(--accent)]"
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }} />
                <div className="flex justify-end gap-2">
                    <AppButton variant="bordered" size="sm" onPress={onClose}>Cancel</AppButton>
                    <AppButton size="sm" onPress={handleSubmit} isDisabled={!name.trim()} isLoading={saving}>Create</AppButton>
                </div>
            </div>
        </AppModal>
    );
}

function FileRow({ file, onSelect, onArchive }: { file: DesignFile; onSelect: (f: DesignFile) => void; onArchive: (f: DesignFile) => void }) {
    const typeIcons: Record<string, typeof File> = { source: File, review: FileType, supporting: HardDrive };
    const TypeIcon = typeIcons[file.type] ?? File;
    const statusColors: Record<string, string> = { active: 'text-emerald-400', archived: 'text-amber-400' };

    return (
        <div className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 transition hover:border-[var(--accent)]/30 cursor-pointer" onClick={() => onSelect(file)}>
            <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-[var(--accent)]/10">
                <TypeIcon size={15} className="text-[var(--accent)]" />
            </div>
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                    <p className="truncate text-[13px] font-medium text-[var(--foreground)]">{file.name}</p>
                    {file.latestVersion && (
                        <span className="shrink-0 rounded bg-[var(--surface-2)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--text-muted)]">
                            v{file.latestVersion.versionNumber}
                        </span>
                    )}
                </div>
                <p className="truncate text-[11px] text-[var(--text-muted)]">
                    {file.latestVersion?.originalFilename ?? '-'} · {file.versionsCount} version(s)
                </p>
            </div>
            <span className={cn('text-[11px] font-medium', statusColors[file.status] ?? '')}>{file.status}</span>
            <div className="flex items-center gap-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                {file.status === 'archived' ? (
                    <button type="button" onClick={() => onArchive(file)} title="Restore"
                        className="flex size-7 items-center justify-center rounded-md text-[var(--text-muted)] transition hover:bg-emerald-400/10 hover:text-emerald-400">
                        <RotateCcw size={13} />
                    </button>
                ) : (
                    <button type="button" onClick={() => onArchive(file)} title="Archive"
                        className="flex size-7 items-center justify-center rounded-md text-[var(--text-muted)] transition hover:bg-amber-400/10 hover:text-amber-400">
                        <Archive size={13} />
                    </button>
                )}
            </div>
        </div>
    );
}

function FileDrawer({ file, isOpen, onClose, dossierId }: { file: DesignFile | null; isOpen: boolean; onClose: () => void; dossierId: number }) {
    const [versions, setVersions] = useState<DesignVersion[]>([]);
    const [loadingVersions, setLoadingVersions] = useState(false);
    const [previewVersion, setPreviewVersion] = useState<DesignVersion | null>(null);

    useEffect(() => {
        if (!file || !isOpen) { setVersions([]); return; }
        setLoadingVersions(true);
        fetch(`/dossiers/design/files/${file.id}/versions`, { headers: { 'X-Requested-With': 'XMLHttpRequest' } })
            .then((r) => r.json())
            .then((data) => setVersions(data.data ?? []))
            .catch(() => {})
            .finally(() => setLoadingVersions(false));
    }, [file?.id, isOpen]);

    if (!file) return null;

    const statusColors: Record<string, string> = {
        draft: 'bg-amber-400/10 text-amber-400', submitted: 'bg-blue-400/10 text-blue-400',
        approved: 'bg-emerald-400/10 text-emerald-400', rejected: 'bg-red-400/10 text-red-400',
    };

    return (
        <>
            <AppModal isOpen={isOpen} onOpenChange={(o) => { if (!o) onClose(); }} title={file.name} size="md">
                <div className="space-y-5">
                    <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                            <p className="text-[10px] font-medium text-[var(--text-muted)]">Type</p>
                            <p className="text-[13px] font-semibold text-[var(--foreground)]">{file.type}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-medium text-[var(--text-muted)]">Status</p>
                            <p className="text-[13px] font-semibold text-[var(--foreground)]">{file.status}</p>
                        </div>
                        <div className="sm:col-span-2">
                            <p className="text-[10px] font-medium text-[var(--text-muted)]">Description</p>
                            <p className="text-[13px] text-[var(--foreground)]">{file.description || '-'}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-medium text-[var(--text-muted)]">Versions</p>
                            <p className="text-[13px] font-semibold text-[var(--foreground)]">{file.versionsCount}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-medium text-[var(--text-muted)]">Created</p>
                            <p className="text-[13px] text-[var(--foreground)]">{file.createdAt ? new Date(file.createdAt).toLocaleDateString() : '-'}</p>
                        </div>
                    </div>

                    <div>
                        <p className="mb-2 text-[12px] font-semibold text-[var(--foreground)]">Version history</p>
                        {loadingVersions ? (
                            <div className="flex items-center justify-center py-6 text-[12px] text-[var(--text-muted)]">Loading...</div>
                        ) : versions.length === 0 ? (
                            <div className="flex items-center justify-center py-6 text-[12px] text-[var(--text-muted)]">No versions yet.</div>
                        ) : (
                            <div className="space-y-2">
                                {versions.map((v) => (
                                    <div key={v.id} className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2">
                                        <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-[var(--surface-3)]">
                                            <Layers size={12} className="text-[var(--text-muted)]" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[12px] font-medium text-[var(--foreground)]">v{v.versionNumber}</span>
                                                <span className={cn('rounded px-1.5 py-0.5 text-[9px] font-semibold', statusColors[v.status] ?? '')}>{v.status}</span>
                                            </div>
                                            <p className="text-[11px] text-[var(--text-muted)]">{v.originalFilename ?? '-'}{v.fileSize ? ` · ${(v.fileSize / 1024).toFixed(1)} KB` : ''}</p>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button type="button" onClick={() => setPreviewVersion(v)} title="Preview"
                                                className="flex size-7 items-center justify-center rounded-md text-[var(--text-muted)] transition hover:bg-[var(--accent)]/10 hover:text-[var(--accent)]">
                                                <Eye size={13} />
                                            </button>
                                            <div className="text-right">
                                                <p className="text-[11px] text-[var(--text-muted)]">{v.uploadedBy?.name ?? '-'}</p>
                                                <p className="text-[10px] text-[var(--text-subtle)]">{v.createdAt ? new Date(v.createdAt).toLocaleDateString() : ''}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </AppModal>
            {previewVersion && (
                <DesignFileViewer
                    versionId={previewVersion.id}
                    mimeType={previewVersion.mimeType ?? 'application/octet-stream'}
                    filename={previewVersion.originalFilename ?? `v${previewVersion.versionNumber}`}
                    isOpen={!!previewVersion}
                    onClose={() => setPreviewVersion(null)}
                />
            )}
        </>
    );
}

function DesignFileBrowser({ dossierId }: { dossierId: number }) {
    const [summary, setSummary] = useState<Summary | null>(null);
    const [folders, setFolders] = useState<FolderNode[]>([]);
    const [files, setFiles] = useState<DesignFile[]>([]);
    const [meta, setMeta] = useState({ currentPage: 1, lastPage: 1, total: 0 });
    const [showUpload, setShowUpload] = useState(false);
    const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
    const [selectedFile, setSelectedFile] = useState<DesignFile | null>(null);
    const [fileDrawerOpen, setFileDrawerOpen] = useState(false);
    const [newFolderOpen, setNewFolderOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [sort, setSort] = useState('sort_order');
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout>>();

    const fetchFiles = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (selectedFolderId) params.set('folder_id', String(selectedFolderId));
            if (search) params.set('search', search);
            if (typeFilter) params.set('type', typeFilter);
            if (statusFilter) params.set('status', statusFilter);
            params.set('sort', sort);
            params.set('page', String(page));
            const res = await fetch(`/dossiers/${dossierId}/design/files?${params}`, { headers: { 'X-Requested-With': 'XMLHttpRequest' } });
            if (!res.ok) throw new Error();
            const data = await res.json();
            setFiles(data.data ?? []);
            setMeta(data.meta ?? { currentPage: 1, lastPage: 1, total: 0 });
        } catch {
            toast.error('Could not load files.');
        } finally {
            setLoading(false);
        }
    }, [dossierId, selectedFolderId, search, typeFilter, statusFilter, sort, page]);

    useEffect(() => { fetchFiles(); }, [fetchFiles]);

    const fetchSummary = useCallback(async () => {
        try {
            const res = await fetch(`/dossiers/${dossierId}/design/summary`, { headers: { 'X-Requested-With': 'XMLHttpRequest' } });
            if (res.ok) setSummary(await res.json());
        } catch {}
    }, [dossierId]);

    const fetchFolders = useCallback(async () => {
        try {
            const res = await fetch(`/dossiers/${dossierId}/design/folders`, { headers: { 'X-Requested-With': 'XMLHttpRequest' } });
            if (res.ok) { const data = await res.json(); setFolders(data.data ?? []); }
        } catch {}
    }, [dossierId]);

    useEffect(() => { fetchSummary(); fetchFolders(); }, [fetchSummary, fetchFolders]);

    function handleSearch(val: string) {
        setSearch(val);
        setPage(1);
    }

    async function handleArchive(file: DesignFile) {
        try {
            if (file.status === 'archived') {
                const res = await fetch(`/dossiers/design/files/${file.id}/restore`, { method: 'POST', headers: { 'X-Requested-With': 'XMLHttpRequest' } });
                if (!res.ok) throw new Error();
                toast.success('File restored.');
            } else {
                const res = await fetch(`/dossiers/design/files/${file.id}`, {
                    method: 'PUT', headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
                    body: JSON.stringify({ status: 'archived', record_version: file.recordVersion }),
                });
                if (res.status === 409) { toast.error('This record was changed by another user. Reload the latest data before saving.'); return; }
                if (!res.ok) throw new Error();
                toast.success('File archived.');
            }
            fetchFiles(); fetchSummary();
        } catch {
            toast.error('Could not update file.');
        }
    }

    function handleFileSelect(file: DesignFile) {
        setSelectedFile(file);
        setFileDrawerOpen(true);
    }

    return (
        <div className="flex flex-col gap-4">
            <SummaryBar summary={summary} />

            <div className="flex items-center gap-2">
                <AppButton variant={showUpload ? 'solid' : 'bordered'} size="sm" className="h-8 text-[11px]" onPress={() => setShowUpload(!showUpload)}>
                    <Upload size={13} /> {showUpload ? 'Close upload' : 'Upload'}
                </AppButton>
                <div className="relative flex-1 max-w-xs">
                    <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input value={search} onChange={(e) => handleSearch(e.target.value)} placeholder="Search files..."
                        className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] py-1.5 pl-8 pr-3 text-[12px] outline-none transition focus:border-[var(--accent)]" />
                    {search && <button type="button" onClick={() => handleSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--foreground)]"><X size={13} /></button>}
                </div>
                <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
                    className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-[12px] outline-none">
                    <option value="">All types</option>
                    <option value="source">Source</option>
                    <option value="review">Review</option>
                    <option value="supporting">Supporting</option>
                </select>
                <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                    className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-[12px] outline-none">
                    <option value="">All status</option>
                    <option value="active">Active</option>
                    <option value="archived">Archived</option>
                </select>
                <select value={sort} onChange={(e) => setSort(e.target.value)}
                    className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-[12px] outline-none">
                    <option value="sort_order">Sort: Default</option>
                    <option value="name">Sort: Name</option>
                    <option value="created_at">Sort: Created</option>
                    <option value="updated_at">Sort: Updated</option>
                </select>
                <AppButton variant="bordered" size="sm" className="h-8 text-[11px]" onPress={() => setNewFolderOpen(true)}>
                    <FolderPlus size={13} /> Folder
                </AppButton>
            </div>

            {showUpload && (
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
                    <DesignUploadZone dossierId={dossierId} onUploadComplete={() => { fetchFiles(); fetchSummary(); fetchFolders(); }} />
                </div>
            )}

            <div className="flex gap-4">
                <div className="hidden w-56 shrink-0 sm:block">
                    <FolderTree folders={folders} selectedFolderId={selectedFolderId} onSelect={(id) => { setSelectedFolderId(id); setPage(1); }} />
                </div>
                <div className="flex-1 min-w-0">
                    {loading ? (
                        <div className="flex items-center justify-center py-12 text-[13px] text-[var(--text-muted)]">Loading files...</div>
                    ) : files.length === 0 ? (
                        <AppEmptyState icon={<HardDrive size={15} />} title="No files found" description={search || typeFilter || statusFilter ? 'Try changing your filters.' : 'Upload design files to get started.'} />
                    ) : (
                        <div className="space-y-2">
                            {files.map((f) => (
                                <FileRow key={f.id} file={f} onSelect={handleFileSelect} onArchive={handleArchive} />
                            ))}
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

            <NewFolderModal isOpen={newFolderOpen} onClose={() => { setNewFolderOpen(false); fetchFolders(); fetchSummary(); }} dossierId={dossierId} />
            <FileDrawer file={selectedFile} isOpen={fileDrawerOpen} onClose={() => setFileDrawerOpen(false)} dossierId={dossierId} />
        </div>
    );
}

function ActivityFeed({ dossierId }: { dossierId: number }) {
    const [items, setItems] = useState<ActivityItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        fetch(`/dossiers/${dossierId}/design/activity`, { headers: { 'X-Requested-With': 'XMLHttpRequest' } })
            .then((r) => r.json())
            .then((data) => setItems(data.data ?? []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [dossierId]);

    if (loading) {
        return <div className="flex items-center justify-center py-12 text-[13px] text-[var(--text-muted)]">Loading activity...</div>;
    }

    if (items.length === 0) {
        return <AppEmptyState icon={<Activity size={15} />} title="No recent activity" description="Design file changes, annotations, and review actions will appear here." />;
    }

    return (
        <div className="space-y-2">
            {items.map((item) => (
                <div key={item.id} className="flex items-start gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5">
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-[var(--surface-2)]">
                        <Clock size={13} className="text-[var(--text-muted)]" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-[12px] font-medium text-[var(--foreground)]">{item.action.replace(/\./g, ' ')}</p>
                        {item.metadata && <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">{JSON.stringify(item.metadata)}</p>}
                    </div>
                    <div className="shrink-0 text-right">
                        <p className="text-[11px] text-[var(--text-muted)]">{item.user?.name ?? 'System'}</p>
                        <p className="text-[10px] text-[var(--text-subtle)]">{item.createdAt}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}

function DesignTabContent({ dossierId }: { dossierId: number }) {
    const params = new URLSearchParams(window.location.search);
    const initialMode = params.get('dmode') as DesignMode | null;
    const [mode, setMode] = useState<DesignMode>(initialMode && MODES.some((m) => m.id === initialMode) ? initialMode : 'files');

    function handleModeChange(newMode: DesignMode) {
        setMode(newMode);
        const p = new URLSearchParams(window.location.search);
        p.set('dmode', newMode);
        window.history.replaceState(null, '', window.location.pathname + '?' + p.toString());
    }

    return (
        <div className="flex flex-col gap-5">
            <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
                <div className="flex overflow-x-auto border-b border-[var(--border)]">
                    {MODES.map((m) => (
                        <button key={m.id} type="button" onClick={() => handleModeChange(m.id)}
                            className={cn(
                                'relative flex items-center justify-center px-4 py-2.5 text-[13px] font-medium outline-none transition whitespace-nowrap',
                                mode === m.id ? 'text-[var(--accent)] after:absolute after:bottom-0 after:left-2 after:right-2 after:h-0.5 after:rounded-full after:bg-[var(--accent)]' : 'text-[var(--text-muted)] hover:text-[var(--foreground)]',
                            )}>
                            {m.label}
                        </button>
                    ))}
                </div>
                <div className="p-4 sm:p-5">
                    {mode === 'files' ? <DesignFileBrowser dossierId={dossierId} /> : <ActivityFeed dossierId={dossierId} />}
                </div>
            </div>
        </div>
    );
}

export function DesignTab({ dossierId, canDesign }: { dossierId: number; canDesign?: boolean }) {
    if (canDesign === false) {
        return <AppEmptyState icon={<Layers size={15} />} title="Access restricted" description="You do not have permission to view project designs." />;
    }

    return <DesignTabContent dossierId={dossierId} />;
}
