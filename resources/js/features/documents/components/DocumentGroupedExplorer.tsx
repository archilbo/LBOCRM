import { router } from '@inertiajs/react';
import { IconAlertTriangle, IconBuilding, IconCircleCheck, IconChevronRight, IconCircleX, IconDownload, IconDots, IconEye, IconFileCheck, IconFileText, IconFolder, IconMapPin, IconSearch, IconTrash, IconUserCircle, IconX } from '@tabler/icons-react';

import { useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Dropdown } from '@heroui/react';
import { AppButton } from '@/components/ui/AppButton';
import { AppModal } from '@/components/ui/AppModal';
import { cn } from '@/lib/cn';
import type {
    DocumentClientGroup, DocumentCommuneGroup, DocumentGroupRow, DocumentLocationGroup,
} from '@/features/documents/types';

type Props = {
    groups: DocumentLocationGroup[];
    onPreview?: (doc: DocumentGroupRow) => void;
};

const STATUS_COLORS: Record<string, 'success' | 'primary' | 'warning' | 'danger' | 'default'> = {
    verified: 'success',
    uploaded: 'primary',
    missing: 'warning',
    rejected: 'danger',
};

const STATUS_LABELS: Record<string, string> = {
    verified: 'Vérifié',
    uploaded: 'Téléversé',
    missing: 'Manquant',
    rejected: 'Rejeté',
};

function fileTypeColor(mimeType: string | null | undefined): string {
    if (!mimeType) return 'bg-[var(--surface-2)] text-[var(--text-muted)]';
    if (mimeType === 'application/pdf') return 'bg-rose-500/10 text-rose-600';
    if (mimeType.includes('wordprocessingml')) return 'bg-sky-500/10 text-sky-600';
    if (mimeType.includes('spreadsheetml')) return 'bg-emerald-500/10 text-emerald-600';
    if (mimeType.startsWith('image/')) return 'bg-violet-500/10 text-violet-600';
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

function RowMenu({ doc, onPreview, onDelete }: {
    doc: DocumentGroupRow; onPreview?: (d: DocumentGroupRow) => void; onDelete: (d: DocumentGroupRow) => void;
}) {
    return (
        <Dropdown>
            <Dropdown.Trigger aria-label="Actions du document" className="flex size-6 items-center justify-center rounded-md text-[var(--text-muted)] outline-none transition hover:bg-[var(--surface-2)] hover:text-[var(--foreground)] data-[open]:bg-[var(--surface-2)] data-[open]:text-[var(--accent)]">
                <IconDots size={13} />
            </Dropdown.Trigger>
            <Dropdown.Popover placement="bottom end" className="min-w-40 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1 shadow-xl">
                <Dropdown.Menu
                    aria-label="Actions du document"
                    onAction={(key) => {
                        if (key === 'preview') onPreview?.(doc);
                        else if (key === 'verify') router.put(`/documents/${doc.id}/status`, { status: 'verified' }, { preserveScroll: true, onSuccess: () => toast.success('Document vérifié.'), onError: () => toast.error('Impossible de mettre à jour le statut.') });
                        else if (key === 'download') window.open(`/documents/${doc.id}/download`, '_blank');
                        else if (key === 'project') router.visit(`/dossiers/${doc.dossierId}`);
                        else if (key === 'missing') router.put(`/documents/${doc.id}/status`, { status: 'missing' }, { preserveScroll: true, onSuccess: () => toast.success('Marqué manquant.'), onError: () => toast.error('Impossible de mettre à jour.') });
                        else if (key === 'delete') onDelete(doc);
                    }}
                    className="outline-none"
                >
                    <Dropdown.Item key="preview" id="preview" textValue="Aperçu" className="rounded-lg px-2 py-1.5 text-[10px] font-medium text-[var(--foreground)] outline-none transition data-[hover]:bg-[var(--surface-2)]">
                        <div className="flex items-center gap-2">
                            <IconEye size={14} className="shrink-0 text-sky-600" />
                            <span>Aperçu</span>
                        </div>
                    </Dropdown.Item>
                    {doc.status !== 'verified' && (
                        <Dropdown.Item key="verify" id="verify" textValue="Marquer vérifié" className="rounded-lg px-2 py-1.5 text-[10px] font-medium text-[var(--foreground)] outline-none transition data-[hover]:bg-[var(--surface-2)]">
                            <div className="flex items-center gap-2">
                                <IconCircleCheck size={14} className="shrink-0 text-emerald-600" />
                                <span>Marquer vérifié</span>
                            </div>
                        </Dropdown.Item>
                    )}
                    <Dropdown.Item key="download" id="download" textValue="Télécharger" className="rounded-lg px-2 py-1.5 text-[10px] font-medium text-[var(--foreground)] outline-none transition data-[hover]:bg-[var(--surface-2)]">
                        <div className="flex items-center gap-2">
                            <IconDownload size={14} className="shrink-0 text-blue-600" />
                            <span>Télécharger</span>
                        </div>
                    </Dropdown.Item>
                    <Dropdown.Item key="project" id="project" textValue="Ouvrir le projet" className="rounded-lg px-2 py-1.5 text-[10px] font-medium text-[var(--foreground)] outline-none transition data-[hover]:bg-[var(--surface-2)]">
                        <div className="flex items-center gap-2">
                            <IconFolder size={14} className="shrink-0 text-violet-600" />
                            <span>Ouvrir le projet</span>
                        </div>
                    </Dropdown.Item>
                    <Dropdown.Item key="missing" id="missing" textValue="Marquer manquant" className="rounded-lg px-2 py-1.5 text-[10px] font-medium text-[var(--foreground)] outline-none transition data-[hover]:bg-[var(--surface-2)]">
                        <div className="flex items-center gap-2">
                            <IconCircleX size={14} className="shrink-0 text-amber-600" />
                            <span>Marquer manquant</span>
                        </div>
                    </Dropdown.Item>
                    <Dropdown.Item key="delete" id="delete" textValue="Supprimer" className="rounded-lg px-2 py-1.5 text-[10px] font-medium text-red-600 outline-none transition data-[hover]:bg-red-500/10">
                        <div className="flex items-center gap-2">
                            <IconTrash size={14} className="shrink-0 text-red-600" />
                            <span>Supprimer</span>
                        </div>
                    </Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown.Popover>
        </Dropdown>
    );
}

function DocumentBrowserCard({ doc, onPreview, onDelete }: {
    doc: DocumentGroupRow; onPreview?: (d: DocumentGroupRow) => void; onDelete: (d: DocumentGroupRow) => void;
}) {
    const mimeColor = fileTypeColor(null);
    return (
        <div onClick={() => onPreview?.(doc)}
            className="cursor-pointer rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2 shadow-sm transition hover:border-[var(--accent)]/30 hover:shadow-md">
            <div className="flex items-start justify-between gap-1.5">
                <div className="flex min-w-0 items-center gap-2">
                    <span className={cn('flex size-7 shrink-0 items-center justify-center rounded-md text-[var(--accent)]', mimeColor)}>
                        <IconFileText size={13} />
                    </span>
                    <div className="min-w-0">
                        <p className="truncate text-[11px] font-medium text-[var(--foreground)]">
                            {doc.templateName || doc.originalFilename || 'Document'}
                        </p>
                        <p className="truncate text-[9px] text-[var(--text-muted)]">{doc.documentNumber || doc.documentType || 'Sans numéro'}</p>
                    </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                    <span className={cn(
                        'rounded px-1 py-px text-[8px] font-semibold uppercase leading-tight',
                        STATUS_COLORS[doc.status] === 'success' && 'bg-emerald-500/15 text-emerald-600',
                        STATUS_COLORS[doc.status] === 'primary' && 'bg-sky-500/15 text-sky-600',
                        STATUS_COLORS[doc.status] === 'warning' && 'bg-amber-500/15 text-amber-600',
                        STATUS_COLORS[doc.status] === 'danger' && 'bg-red-500/15 text-red-600',
                        !STATUS_COLORS[doc.status] && 'bg-[var(--surface-2)] text-[var(--text-muted)]',
                    )}>{STATUS_LABELS[doc.status] || doc.status}</span>
                    <RowMenu doc={doc} onPreview={onPreview} onDelete={onDelete} />
                </div>
            </div>
            {doc.originalFilename && (
                <p className="mt-1 truncate text-[9px] text-[var(--text-subtle)]">{doc.originalFilename}</p>
            )}
            <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[9px] text-[var(--text-muted)]">
                <span><span className="text-[var(--text-subtle)]">Projet</span> {doc.dossierNumber || '-'}</span>
                <span><span className="text-[var(--text-subtle)]">Client</span> {doc.clientName || '-'}</span>
                <span><span className="text-[var(--text-subtle)]">Téléversé</span> {doc.uploadedAt || '-'}</span>
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

    const [selectedClient, setSelectedClient] = useState(selectedCommuneGroup?.clients[0]?.clientName ?? '');
    const activeClient = useMemo(
        () => selectedCommuneGroup?.clients.find((c) => c.clientName === selectedClient)
            ?? selectedCommuneGroup?.clients[0] ?? null,
        [selectedCommuneGroup, selectedClient],
    );

    const [query, setQuery] = useState('');
    const searchRef = useRef<HTMLInputElement>(null);
    const [deleteTarget, setDeleteTarget] = useState<DocumentGroupRow | null>(null);

    const documents = useMemo(() => {
        const rows = activeClient ? flattenClientDocs(activeClient) : [];
        return rows.filter((d) => searchDocument(d, query));
    }, [activeClient, query]);

    function chooseProvince(group: DocumentLocationGroup) {
        const fc = group.communes[0]?.clients[0];
        setSelectedProvince(group.province);
        setSelectedCommune(group.communes[0]?.commune ?? '');
        setSelectedClient(fc?.clientName ?? '');
        setQuery('');
    }

    function chooseCommune(commune: DocumentCommuneGroup) {
        const fc = commune.clients[0];
        setSelectedCommune(commune.commune);
        setSelectedClient(fc?.clientName ?? '');
        setQuery('');
    }

    function chooseClient(client: DocumentClientGroup) {
        setSelectedClient(client.clientName);
        setQuery('');
    }

    function PaneHeader({ icon, label, subtitle }: { icon: React.ReactNode; label: string; subtitle: string }) {
        return (
            <div className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--surface)] px-3 py-2.5">
                <div className="flex items-center gap-2">
                    <span className="text-[var(--accent)] shrink-0">{icon}</span>
                    <div className="min-w-0">
                        <p className="truncate text-[11px] font-semibold text-[var(--foreground)]">{label}</p>
                        <p className="truncate text-[9px] text-[var(--text-muted)]">{subtitle}</p>
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
                        'flex size-7 shrink-0 items-center justify-center rounded-md text-[10px] font-bold',
                        active ? 'bg-[var(--accent)]/15 text-[var(--accent)]' : 'bg-[var(--surface-2)] text-[var(--text-muted)]',
                    )}>{icon}</span>
                )}
                <div className="min-w-0 flex-1">
                    <p className={cn('truncate text-[11px] font-medium', active ? 'text-[var(--accent)]' : 'text-[var(--foreground)]')}>{title}</p>
                    <p className="truncate text-[9px] text-[var(--text-muted)]">{subtitle}</p>
                </div>
                <IconChevronRight size={13} className="shrink-0 text-[var(--text-subtle)]" />
            </button>
        );
    }

    function EmptyPane({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
        return (
            <div className="flex flex-col items-center gap-2 px-4 py-14 text-center">
                <span className="text-[var(--text-muted)]/30">{icon}</span>
                <p className="text-[11px] font-medium text-[var(--foreground)]">{title}</p>
                <p className="text-[9px] text-[var(--text-muted)]">{description}</p>
            </div>
        );
    }

    function confirmDelete() {
        if (!deleteTarget) return;
        router.delete(`/documents/${deleteTarget.id}`, {
            preserveScroll: true,
            onSuccess: () => { toast.success('Document supprimé.'); setDeleteTarget(null); },
            onError: () => toast.error('Impossible de supprimer.'),
        });
    }

    const summary = selectedProvinceGroup?.stats;

    return (
        <div className="flex flex-col gap-4">
            {summary && (
                <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-2 text-[10px] text-[var(--text-muted)]">
                        <IconMapPin size={13} className="text-[var(--accent)]" />
                        <span className="font-medium text-[var(--foreground)]">{selectedProvinceGroup?.province}</span>
                        <span>/</span>
                        <span className="font-medium text-[var(--accent)]">{selectedCommuneGroup?.commune || '-'}</span>
                    </div>
                    <span className="hidden sm:inline text-[9px] text-[var(--text-subtle)]">|</span>
                    <span className="text-[9px] text-[var(--text-muted)]">{documents.length} document(s)</span>
                </div>
            )}

            <div className="hidden xl:grid xl:grid-cols-[220px_240px_260px_minmax(0,1fr)] xl:rounded-xl xl:border xl:border-[var(--border)] xl:bg-[var(--surface)] xl:shadow-sm xl:overflow-hidden" style={{ maxHeight: 'calc(100vh - 240px)' }}>
                {/* Province */}
                <aside className="border-r border-[var(--border)] flex flex-col">
                    <PaneHeader icon={<IconMapPin size={14} />} label="Provinces" subtitle={`${groups.length} au total`} />
                    <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                        {groups.length > 0 ? groups.map((group) => (
                            <PaneRow key={group.province}
                                active={selectedProvinceGroup?.province === group.province}
                                icon={<span>{group.province.charAt(0)}</span>}
                                title={group.province}
                                subtitle={`${group.communes.length} communes · ${group.stats.documentsCount} docs`}
                                onClick={() => chooseProvince(group)}
                            />
                        )) : <EmptyPane icon={<IconMapPin size={24} />} title="Aucune province" description="Aucune donnée documentaire disponible." />}
                    </div>
                </aside>

                {/* Commune */}
                <aside className="border-r border-[var(--border)] flex flex-col">
                    <PaneHeader icon={<IconBuilding size={14} />} label="Communes" subtitle={selectedProvinceGroup?.province || 'Sélectionnez une province'} />
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
                        ) : <EmptyPane icon={<IconBuilding size={24} />} title="Sélectionnez une province" description="pour afficher les communes" />}
                    </div>
                </aside>

                {/* Scope */}
                <aside className="border-r border-[var(--border)] flex flex-col">
                    <PaneHeader icon={<IconFileCheck size={14} />} label="Portée" subtitle="Client / projet / type" />
                    <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                        {selectedCommuneGroup ? (
                            selectedCommuneGroup.clients.map((client) => (
                                <PaneRow key={client.clientName}
                                    active={activeClient?.clientName === client.clientName}
                                    icon={<IconUserCircle size={12} />}
                                    title={client.clientName}
                                    subtitle={`${client.projects.length} projets · ${client.stats.documentsCount} docs`}
                                    onClick={() => chooseClient(client)}
                                />
                            ))
                        ) : <EmptyPane icon={<IconFileCheck size={24} />} title="Sélectionnez une commune" description="pour parcourir les documents par portée" />}
                    </div>
                </aside>

                {/* Document browser */}
                <main className="flex flex-col min-w-0">
                    <div className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--surface)] px-4 py-2.5">
                        <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0 flex-1">
                                <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--text-subtle)]">Explorateur de documents</p>
                                <p className="truncate text-[11px] font-medium text-[var(--foreground)]">
                                    {selectedProvinceGroup?.province && selectedCommuneGroup?.commune
                                        ? `${selectedProvinceGroup.province} / ${selectedCommuneGroup.commune}`
                                        : 'Sélectionnez une localisation'}
                                </p>
                            </div>
                            <div className="relative w-[180px] shrink-0">
                                <IconSearch size={12} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                                <input ref={searchRef} type="text" value={query} onChange={(e) => setQuery(e.target.value)}
                                    aria-label="Rechercher des documents"
                                    className="h-7 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] pl-7 pr-6 text-[10px] text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--accent)_20%,transparent)]" />
                                {query ? (
                                    <button type="button" onClick={() => setQuery('')}
                                        className="absolute right-1.5 top-1/2 -translate-y-1/2 flex size-4 items-center justify-center rounded text-[var(--text-muted)] hover:text-[var(--foreground)]">
                                        <IconX size={10} />
                                    </button>
                                ) : null}
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-3 space-y-2" style={{ scrollbarWidth: 'thin' }}>
                        {selectedCommuneGroup ? (
                            documents.length > 0 ? (
                                documents.map((doc) => (
                                    <DocumentBrowserCard key={doc.id} doc={doc} onPreview={onPreview} onDelete={setDeleteTarget} />
                                ))
                            ) : (
                                <div className="flex flex-col items-center gap-2 py-16 text-center">
                                    <IconFileText size={28} className="text-[var(--text-muted)]/30" />
                                    <p className="text-[11px] font-medium text-[var(--foreground)]">Aucun document trouvé</p>
                                    <p className="text-[9px] text-[var(--text-muted)]">Choisissez une autre portée ou effacez la recherche.</p>
                                </div>
                            )
                        ) : (
                            <div className="flex flex-col items-center gap-2 py-16 text-center">
                                <IconBuilding size={28} className="text-[var(--text-muted)]/30" />
                                <p className="text-[11px] font-medium text-[var(--foreground)]">Sélectionnez une commune</p>
                                <p className="text-[9px] text-[var(--text-muted)]">pour parcourir les documents</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            <AppModal
                isOpen={!!deleteTarget}
                onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
                title="Supprimer le document ?"
                size="sm"
            >
                <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/8 px-4 py-3 mb-4">
                    <IconAlertTriangle size={18} className="shrink-0 text-red-600" />
                    <p className="text-xs text-[var(--text-muted)]">
                        Cette action est <span className="font-semibold text-red-600">irréversible</span>.
                    </p>
                </div>
                <p className="mb-5 text-sm text-[var(--text-muted)]">
                    Confirmez la suppression de <strong>{deleteTarget?.templateName || deleteTarget?.originalFilename || 'ce document'}</strong>.
                </p>
                <div className="flex justify-end gap-2">
                    <AppButton variant="light" onPress={() => setDeleteTarget(null)}>Annuler</AppButton>
                    <AppButton variant="solid" color="danger" onPress={confirmDelete}>Supprimer</AppButton>
                </div>
            </AppModal>
        </div>
    );
}
