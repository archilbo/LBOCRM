import { router } from '@inertiajs/react';
import {
    Building2, CheckCircle2, ChevronRight, Download, Eye, FileCheck2, FileText,
    FolderKanban, MapPinned, MoreHorizontal, Search, Trash2, UserRound, X, XCircle,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { AppButton } from '@/components/ui/AppButton';
import { StatusPill } from '@/components/ui/StatusPill';
import { cn } from '@/lib/cn';
import type {
    DocumentClientGroup, DocumentCommuneGroup, DocumentGroupRow,
    DocumentLocationGroup, DocumentProjectGroup, DocumentTypeGroup,
} from '@/features/documents/types';

type Props = {
    groups: DocumentLocationGroup[];
    onPreview?: (doc: DocumentGroupRow) => void;
};

type Level = 'clients' | 'projects' | 'types';

const STATUS_COLORS: Record<string, 'success' | 'primary' | 'warning' | 'danger' | 'default'> = {
    verified: 'success',
    uploaded: 'primary',
    missing: 'warning',
    rejected: 'danger',
};

function fileTypeColor(mimeType: string | null | undefined): string {
    if (!mimeType) return 'bg-[var(--surface-2)] text-[var(--text-muted)]';
    if (mimeType === 'application/pdf') return 'bg-rose-500/10 text-rose-400';
    if (mimeType.includes('wordprocessingml')) return 'bg-sky-500/10 text-sky-400';
    if (mimeType.includes('spreadsheetml')) return 'bg-emerald-500/10 text-emerald-400';
    if (mimeType.startsWith('image/')) return 'bg-violet-500/10 text-violet-400';
    return 'bg-[var(--surface-2)] text-[var(--text-muted)]';
}

function searchDocument(doc: DocumentGroupRow, query: string) {
    if (!query.trim()) return true;
    return [doc.templateName, doc.documentType, doc.documentNumber, doc.originalFilename,
        doc.status, doc.dossierNumber, doc.projectObject, doc.clientName]
        .filter(Boolean).join(' ').toLowerCase().includes(query.trim().toLowerCase());
}

function flattenClientDocs(client: DocumentClientGroup): DocumentGroupRow[] {
    return client.projects.flatMap((p) => p.types.flatMap((t) => t.documents));
}

function flattenProjectDocs(project: DocumentProjectGroup): DocumentGroupRow[] {
    return project.types.flatMap((t) => t.documents);
}

function RowMenu({ doc, onPreview }: { doc: DocumentGroupRow; onPreview?: (d: DocumentGroupRow) => void }) {
    const [open, setOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        function close(e: MouseEvent) {
            if (menuRef.current && e.target instanceof Node && menuRef.current.contains(e.target)) return;
            setOpen(false);
        }
        document.addEventListener('mousedown', close);
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
        return () => { document.removeEventListener('mousedown', close); };
    }, [open]);

    return (
        <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button type="button" onClick={() => setOpen(!open)}
                className={cn(
                    'flex size-6 items-center justify-center rounded-md transition',
                    open
                        ? 'bg-[var(--accent)]/10 text-[var(--accent)]'
                        : 'text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]',
                )}>
                <MoreHorizontal size={13} />
            </button>
            {open && (
                <div ref={menuRef} className="absolute right-0 top-full z-50 mt-1 min-w-[160px] rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1.5 shadow-xl">
                    <button type="button" onClick={() => { setOpen(false); onPreview?.(doc); }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[12px] text-[var(--foreground)] transition hover:bg-[var(--surface-2)]">
                        <Eye size={14} /> Preview
                    </button>
                    {doc.status !== 'verified' && (
                        <button type="button" onClick={() => { router.put(`/documents/${doc.id}/status`, { status: 'verified' }, { preserveScroll: true, onSuccess: () => toast.success('Document verified.'), onError: () => toast.error('Could not update status.') }); setOpen(false); }}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[12px] text-[var(--foreground)] transition hover:bg-[var(--surface-2)]">
                            <CheckCircle2 size={14} /> Mark verified
                        </button>
                    )}
                    <button type="button" onClick={() => { window.open(`/documents/${doc.id}/download`, '_blank'); setOpen(false); }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[12px] text-[var(--foreground)] transition hover:bg-[var(--surface-2)]">
                        <Download size={14} /> Download
                    </button>
                    <button type="button" onClick={() => { router.visit(`/dossiers/${doc.dossierId}`); setOpen(false); }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[12px] text-[var(--foreground)] transition hover:bg-[var(--surface-2)]">
                        <FolderKanban size={14} /> Open project
                    </button>
                    <button type="button" onClick={() => { router.put(`/documents/${doc.id}/status`, { status: 'missing' }, { preserveScroll: true, onSuccess: () => toast.success('Marked as missing.'), onError: () => toast.error('Could not update.') }); setOpen(false); }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[12px] text-amber-400 transition hover:bg-amber-400/10">
                        <XCircle size={14} /> Mark missing
                    </button>
                    <div className="my-1 border-t border-[var(--border)]" />
                    <button type="button" onClick={() => { if (confirm('Delete this document? This cannot be undone.')) { router.delete(`/documents/${doc.id}`, { preserveScroll: true, onSuccess: () => toast.success('Document deleted.'), onError: () => toast.error('Could not delete.') }); } setOpen(false); }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[12px] text-[var(--danger)] transition hover:bg-[var(--danger)]/10">
                        <Trash2 size={14} /> Delete
                    </button>
                </div>
            )}
        </div>
    );
}

function CollapsibleSection({ label, count, children }: { label: string; count: number; children: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    return (
        <div>
            <button type="button" onClick={() => setOpen(!open)}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--text-subtle)] transition hover:text-[var(--foreground)]">
                <ChevronRight size={11} className={cn('transition shrink-0', open && 'rotate-90')} />
                {label}
                <span className="ml-auto text-[9px] text-[var(--text-muted)]">{count}</span>
            </button>
            {open && children}
        </div>
    );
}

function DocumentBrowserCard({ doc, onPreview }: { doc: DocumentGroupRow; onPreview?: (d: DocumentGroupRow) => void }) {
    const mimeColor = fileTypeColor(null);
    return (
        <div onClick={() => onPreview?.(doc)}
            className="cursor-pointer rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2 shadow-sm transition hover:border-[var(--accent)]/30 hover:shadow-md">
            <div className="flex items-start justify-between gap-1.5">
                <div className="flex min-w-0 items-center gap-2">
                    <span className={cn('flex size-7 shrink-0 items-center justify-center rounded-md text-[var(--accent)]', mimeColor)}>
                        <FileText size={13} />
                    </span>
                    <div className="min-w-0">
                        <p className="truncate text-[12px] font-medium text-[var(--foreground)]">
                            {doc.templateName || doc.originalFilename || 'Document'}
                        </p>
                        <p className="truncate text-[10px] text-[var(--text-muted)]">{doc.documentNumber || doc.documentType || 'No number'}</p>
                    </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                    <span className={cn(
                        'rounded px-1 py-px text-[8px] font-semibold uppercase leading-tight',
                        STATUS_COLORS[doc.status] === 'success' && 'bg-emerald-500/15 text-emerald-400',
                        STATUS_COLORS[doc.status] === 'primary' && 'bg-sky-500/15 text-sky-400',
                        STATUS_COLORS[doc.status] === 'warning' && 'bg-amber-500/15 text-amber-400',
                        STATUS_COLORS[doc.status] === 'danger' && 'bg-red-500/15 text-red-400',
                        !STATUS_COLORS[doc.status] && 'bg-[var(--surface-2)] text-[var(--text-muted)]',
                    )}>{doc.status}</span>
                    <RowMenu doc={doc} onPreview={onPreview} />
                </div>
            </div>
            {doc.originalFilename && (
                <p className="mt-1 truncate text-[9px] text-[var(--text-subtle)]">{doc.originalFilename}</p>
            )}
            <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[9px] text-[var(--text-muted)]">
                <span><span className="text-[var(--text-subtle)]">Project</span> {doc.dossierNumber || '-'}</span>
                <span><span className="text-[var(--text-subtle)]">Client</span> {doc.clientName || '-'}</span>
                <span><span className="text-[var(--text-subtle)]">Uploaded</span> {doc.uploadedAt || '-'}</span>
            </div>
        </div>
    );
}

export function DocumentGroupedExplorer({ groups, onPreview }: Props) {
    const [selectedProvince, setSelectedProvince] = useState(groups[0]?.province ?? '');
    const selectedProvinceGroup = useMemo(
        () => groups.find((g) => g.province === selectedProvince) ?? groups[0] ?? null,
        [groups, selectedProvince],
    );

    const [selectedCommune, setSelectedCommune] = useState(selectedProvinceGroup?.communes[0]?.commune ?? '');
    const selectedCommuneGroup = useMemo(
        () => selectedProvinceGroup?.communes.find((c) => c.commune === selectedCommune)
            ?? selectedProvinceGroup?.communes[0] ?? null,
        [selectedProvinceGroup, selectedCommune],
    );

    const [level, setLevel] = useState<Level>('clients');
    const [selectedClient, setSelectedClient] = useState(selectedCommuneGroup?.clients[0]?.clientName ?? '');
    const activeClient = useMemo(
        () => selectedCommuneGroup?.clients.find((c) => c.clientName === selectedClient)
            ?? selectedCommuneGroup?.clients[0] ?? null,
        [selectedCommuneGroup, selectedClient],
    );

    const [selectedProject, setSelectedProject] = useState(activeClient?.projects[0]?.dossierNumber ?? '');
    const activeProject = useMemo(
        () => activeClient?.projects.find((p) => p.dossierNumber === selectedProject)
            ?? activeClient?.projects[0] ?? null,
        [activeClient, selectedProject],
    );

    const [selectedType, setSelectedType] = useState(activeProject?.types[0]?.type ?? '');
    const activeType = useMemo(
        () => activeProject?.types.find((t) => t.type === selectedType)
            ?? activeProject?.types[0] ?? null,
        [activeProject, selectedType],
    );

    const [query, setQuery] = useState('');
    const searchRef = useRef<HTMLInputElement>(null);

    const documents = useMemo(() => {
        let rows: DocumentGroupRow[] = [];
        if (level === 'clients' && activeClient) rows = flattenClientDocs(activeClient);
        if (level === 'projects' && activeProject) rows = flattenProjectDocs(activeProject);
        if (level === 'types' && activeType) rows = activeType.documents;
        return rows.filter((d) => searchDocument(d, query));
    }, [activeClient, activeProject, activeType, level, query]);

    function chooseProvince(group: DocumentLocationGroup) {
        const fc = group.communes[0]?.clients[0];
        const fp = fc?.projects[0];
        const ft = fp?.types[0];
        setSelectedProvince(group.province);
        setSelectedCommune(group.communes[0]?.commune ?? '');
        setSelectedClient(fc?.clientName ?? '');
        setSelectedProject(fp?.dossierNumber ?? '');
        setSelectedType(ft?.type ?? '');
        setLevel('clients');
        setQuery('');
    }

    function chooseCommune(commune: DocumentCommuneGroup) {
        const fc = commune.clients[0];
        const fp = fc?.projects[0];
        const ft = fp?.types[0];
        setSelectedCommune(commune.commune);
        setSelectedClient(fc?.clientName ?? '');
        setSelectedProject(fp?.dossierNumber ?? '');
        setSelectedType(ft?.type ?? '');
        setLevel('clients');
        setQuery('');
    }

    function chooseClient(client: DocumentClientGroup) {
        const fp = client.projects[0];
        const ft = fp?.types[0];
        setSelectedClient(client.clientName);
        setSelectedProject(fp?.dossierNumber ?? '');
        setSelectedType(ft?.type ?? '');
        setLevel('clients');
        setQuery('');
    }

    function chooseProject(project: DocumentProjectGroup) {
        const ft = project.types[0];
        setSelectedProject(project.dossierNumber);
        setSelectedType(ft?.type ?? '');
        setLevel('projects');
        setQuery('');
    }

    function chooseType(type: DocumentTypeGroup) {
        setSelectedType(type.type);
        setLevel('types');
        setQuery('');
    }

    function PaneHeader({ icon, label, subtitle }: { icon: React.ReactNode; label: string; subtitle: string }) {
        return (
            <div className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--surface)] px-3 py-2.5">
                <div className="flex items-center gap-2">
                    <span className="text-[var(--accent)] shrink-0">{icon}</span>
                    <div className="min-w-0">
                        <p className="truncate text-[12px] font-semibold text-[var(--foreground)]">{label}</p>
                        <p className="truncate text-[10px] text-[var(--text-muted)]">{subtitle}</p>
                    </div>
                </div>
            </div>
        );
    }

    function PaneRow({ active, icon, title, subtitle, onClick }: {
        active: boolean; icon?: React.ReactNode; title: string; subtitle: string; onClick: () => void;
    }) {
        return (
            <button type="button" onClick={onClick}
                className={cn(
                    'relative flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition',
                    active ? 'bg-[color-mix(in_srgb,var(--accent)_8%,transparent)]' : 'hover:bg-[var(--surface-2)]',
                )}>
                {active && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[var(--accent)]" />}
                {icon && (
                    <span className={cn(
                        'flex size-7 shrink-0 items-center justify-center rounded-md text-[11px] font-bold',
                        active ? 'bg-[var(--accent)]/15 text-[var(--accent)]' : 'bg-[var(--surface-2)] text-[var(--text-muted)]',
                    )}>{icon}</span>
                )}
                <div className="min-w-0 flex-1">
                    <p className={cn('truncate text-[12px] font-medium', active ? 'text-[var(--accent)]' : 'text-[var(--foreground)]')}>{title}</p>
                    <p className="truncate text-[10px] text-[var(--text-muted)]">{subtitle}</p>
                </div>
                <ChevronRight size={13} className="shrink-0 text-[var(--text-subtle)]" />
            </button>
        );
    }

    function EmptyPane({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
        return (
            <div className="flex flex-col items-center gap-2 px-4 py-14 text-center">
                <span className="text-[var(--text-muted)]/30">{icon}</span>
                <p className="text-[12px] font-medium text-[var(--foreground)]">{title}</p>
                <p className="text-[10px] text-[var(--text-muted)]">{description}</p>
            </div>
        );
    }

    const summary = selectedProvinceGroup?.stats;

    return (
        <div className="flex flex-col gap-4">
            {summary && (
                <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-2 text-[11px] text-[var(--text-muted)]">
                        <MapPinned size={13} className="text-[var(--accent)]" />
                        <span className="font-medium text-[var(--foreground)]">{selectedProvinceGroup?.province}</span>
                        <span>/</span>
                        <span className="font-medium text-[var(--accent)]">{selectedCommuneGroup?.commune || '-'}</span>
                    </div>
                    <span className="hidden sm:inline text-[10px] text-[var(--text-subtle)]">|</span>
                    <span className="text-[10px] text-[var(--text-muted)]">{documents.length} document(s)</span>
                </div>
            )}

            <div className="hidden xl:grid xl:grid-cols-[220px_240px_260px_minmax(0,1fr)] xl:rounded-xl xl:border xl:border-[var(--border)] xl:bg-[var(--surface)] xl:shadow-sm xl:overflow-hidden" style={{ maxHeight: 'calc(100vh - 240px)' }}>
                {/* Province */}
                <aside className="border-r border-[var(--border)] flex flex-col">
                    <PaneHeader icon={<MapPinned size={14} />} label="Provinces" subtitle={`${groups.length} total`} />
                    <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                        {groups.length > 0 ? groups.map((group) => (
                            <PaneRow key={group.province}
                                active={selectedProvinceGroup?.province === group.province}
                                icon={<span>{group.province.charAt(0)}</span>}
                                title={group.province}
                                subtitle={`${group.communes.length} communes · ${group.stats.documentsCount} docs`}
                                onClick={() => chooseProvince(group)}
                            />
                        )) : <EmptyPane icon={<MapPinned size={24} />} title="No provinces" description="No document data available." />}
                    </div>
                </aside>

                {/* Commune */}
                <aside className="border-r border-[var(--border)] flex flex-col">
                    <PaneHeader icon={<Building2 size={14} />} label="Communes" subtitle={selectedProvinceGroup?.province || 'Select a province'} />
                    <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                        {selectedProvinceGroup ? (
                            selectedProvinceGroup.communes.map((commune) => (
                                <PaneRow key={commune.commune}
                                    active={selectedCommuneGroup?.commune === commune.commune}
                                    icon={<span>{commune.commune.charAt(0)}</span>}
                                    title={commune.commune}
                                    subtitle={`${commune.clients.length} clients · ${commune.stats.documentsCount} docs`}
                                    onClick={() => chooseCommune(commune)}
                                />
                            ))
                        ) : <EmptyPane icon={<Building2 size={24} />} title="Select a province" description="to view communes" />}
                    </div>
                </aside>

                {/* Scope */}
                <aside className="border-r border-[var(--border)] flex flex-col">
                    <PaneHeader icon={<FileCheck2 size={14} />} label="Scope" subtitle="Client / project / type" />
                    <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                        {selectedCommuneGroup ? (
                            <>
                                <CollapsibleSection label="Clients" count={selectedCommuneGroup.clients.length}>
                                    {selectedCommuneGroup.clients.map((client) => (
                                        <PaneRow key={client.clientName}
                                            active={level === 'clients' && activeClient?.clientName === client.clientName}
                                            icon={<UserRound size={12} />}
                                            title={client.clientName}
                                            subtitle={`${client.projects.length} projects · ${client.stats.documentsCount} docs`}
                                            onClick={() => chooseClient(client)}
                                        />
                                    ))}
                                </CollapsibleSection>
                                {activeClient && (
                                    <CollapsibleSection label="Projects" count={activeClient.projects.length}>
                                        {activeClient.projects.map((project) => (
                                            <PaneRow key={project.dossierNumber}
                                                active={level === 'projects' && activeProject?.dossierNumber === project.dossierNumber}
                                                icon={<FolderKanban size={12} />}
                                                title={project.projectObject || project.dossierNumber}
                                                subtitle={`${project.types.length} types · ${project.stats.documentsCount} docs`}
                                                onClick={() => chooseProject(project)}
                                            />
                                        ))}
                                    </CollapsibleSection>
                                )}
                                {activeProject && (
                                    <CollapsibleSection label="Types" count={activeProject.types.length}>
                                        {activeProject.types.map((type) => (
                                            <PaneRow key={type.type}
                                                active={level === 'types' && activeType?.type === type.type}
                                                icon={<FileText size={12} />}
                                                title={type.type}
                                                subtitle={`${type.stats.documentsCount} docs`}
                                                onClick={() => chooseType(type)}
                                            />
                                        ))}
                                    </CollapsibleSection>
                                )}
                            </>
                        ) : <EmptyPane icon={<FileCheck2 size={24} />} title="Select a commune" description="to browse documents by scope" />}
                    </div>
                </aside>

                {/* Document browser */}
                <main className="flex flex-col min-w-0">
                    <div className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--surface)] px-4 py-2.5">
                        <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0 flex-1">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-subtle)]">Document browser</p>
                                <p className="truncate text-[12px] font-medium text-[var(--foreground)]">
                                    {selectedProvinceGroup?.province && selectedCommuneGroup?.commune
                                        ? `${selectedProvinceGroup.province} / ${selectedCommuneGroup.commune}`
                                        : 'Select location'}
                                </p>
                            </div>
                            <div className="relative w-[180px] shrink-0">
                                <Search size={12} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                                <input ref={searchRef} type="text" value={query} onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Search documents..."
                                    className="h-7 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] pl-7 pr-6 text-[11px] text-[var(--foreground)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--accent)_20%,transparent)]" />
                                {query ? (
                                    <button type="button" onClick={() => setQuery('')}
                                        className="absolute right-1.5 top-1/2 -translate-y-1/2 flex size-4 items-center justify-center rounded text-[var(--text-muted)] hover:text-[var(--foreground)]">
                                        <X size={10} />
                                    </button>
                                ) : null}
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-3 space-y-2" style={{ scrollbarWidth: 'thin' }}>
                        {selectedCommuneGroup ? (
                            documents.length > 0 ? (
                                documents.map((doc) => (
                                    <DocumentBrowserCard key={doc.id} doc={doc} onPreview={onPreview} />
                                ))
                            ) : (
                                <div className="flex flex-col items-center gap-2 py-16 text-center">
                                    <FileText size={28} className="text-[var(--text-muted)]/30" />
                                    <p className="text-[12px] font-medium text-[var(--foreground)]">No documents found</p>
                                    <p className="text-[10px] text-[var(--text-muted)]">Choose another scope or clear search.</p>
                                </div>
                            )
                        ) : (
                            <div className="flex flex-col items-center gap-2 py-16 text-center">
                                <Building2 size={28} className="text-[var(--text-muted)]/30" />
                                <p className="text-[12px] font-medium text-[var(--foreground)]">Select a commune</p>
                                <p className="text-[10px] text-[var(--text-muted)]">to browse documents</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
