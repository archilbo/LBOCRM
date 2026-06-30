import { router } from '@inertiajs/react';
import {
    ChevronRight,
    Download,
    Eye,
    FileCheck2,
    FileText,
    FolderKanban,
    MapPinned,
    Search,
    UserRound,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { AppButton } from '@/components/ui/AppButton';
import { AppEmptyState } from '@/components/ui/AppEmptyState';
import type {
    DocumentClientGroup,
    DocumentCommuneGroup,
    DocumentGroupRow,
    DocumentLocationGroup,
    DocumentProjectGroup,
    DocumentStatus,
    DocumentTypeGroup,
} from '@/features/documents/types';

/* COLUMN_DOCUMENT_BROWSER_53EC */

type Props = {
    groups: DocumentLocationGroup[];
};

type Level = 'clients' | 'projects' | 'types';

function statusClass(status: DocumentStatus) {
    if (status === 'verified') return 'border-emerald-400/25 bg-emerald-400/10 text-emerald-300';
    if (status === 'uploaded') return 'border-sky-400/25 bg-sky-400/10 text-sky-300';
    if (status === 'missing') return 'border-amber-400/25 bg-amber-400/10 text-amber-300';
    if (status === 'rejected') return 'border-red-400/25 bg-red-400/10 text-red-300';

    return 'border-zinc-500/30 bg-zinc-500/10 text-zinc-300';
}

function searchDocument(document: DocumentGroupRow, query: string) {
    if (!query.trim()) {
        return true;
    }

    return [
        document.templateName,
        document.documentType,
        document.documentNumber,
        document.originalFilename,
        document.status,
        document.dossierNumber,
        document.projectObject,
        document.clientName,
    ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(query.trim().toLowerCase());
}

function ColumnButton({
    active,
    icon,
    title,
    subtitle,
    onClick,
}: {
    active: boolean;
    icon?: React.ReactNode;
    title: string;
    subtitle: string;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={[
                'flex w-full items-center justify-between gap-3 border-b border-[var(--crm-border)] px-3 py-3 text-left transition',
                active
                    ? 'bg-[var(--crm-gold-soft)] text-[var(--crm-gold)]'
                    : 'text-[var(--crm-text-muted)] hover:bg-[var(--crm-surface-hover)] hover:text-[var(--crm-text)]',
            ].join(' ')}
        >
            <span className="flex min-w-0 items-center gap-2">
                {icon ? <span className="shrink-0">{icon}</span> : null}
                <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">{title}</span>
                    <span className="block truncate text-xs opacity-75">{subtitle}</span>
                </span>
            </span>

            <ChevronRight size={15} className="shrink-0" />
        </button>
    );
}

function DocumentCard({ document }: { document: DocumentGroupRow }) {
    return (
        <article className="crm-panel-soft p-3 transition hover:border-[var(--crm-gold)]">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                <div className="min-w-0">
                    <div className="flex min-w-0 items-center gap-3">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[var(--crm-gold-soft)] text-[var(--crm-gold)]">
                            <FileText size={16} />
                        </span>

                        <div className="min-w-0">
                            <h3 className="truncate text-sm font-semibold text-[var(--crm-text)]">
                                {document.templateName || document.originalFilename || 'Document'}
                            </h3>
                            <p className="text-xs text-[var(--crm-text-muted)]">
                                {document.documentNumber || document.documentType || 'No number'}
                            </p>
                        </div>
                    </div>

                    <p className="mt-2 truncate text-xs text-[var(--crm-text-soft)]">
                        {document.originalFilename || 'No uploaded file'}
                    </p>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <span className={`inline-flex rounded-full border px-2 py-1 text-[11px] font-semibold ${statusClass(document.status)}`}>
                        {document.status}
                    </span>

                    <AppButton variant="secondary" size="sm" onPress={() => router.visit(`/dossiers/${document.dossierId}`)}>
                        <Eye size={14} />
                        Project
                    </AppButton>

                    <button
                        type="button"
                        className="crm-action-button"
                        title="Download"
                        onClick={() => window.location.assign(`/documents/${document.id}/download`)}
                    >
                        <Download size={14} />
                    </button>
                </div>
            </div>

            <div className="mt-3 grid gap-2 md:grid-cols-3">
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--crm-text-soft)]">Project</p>
                    <p className="mt-1 truncate text-sm font-semibold">{document.dossierNumber || '-'}</p>
                    <p className="truncate text-xs text-[var(--crm-text-muted)]">{document.projectObject || '-'}</p>
                </div>

                <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--crm-text-soft)]">Client</p>
                    <p className="mt-1 truncate text-sm font-semibold">{document.clientName || '-'}</p>
                </div>

                <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--crm-text-soft)]">Uploaded</p>
                    <p className="mt-1 truncate text-sm font-semibold">{document.uploadedAt || '-'}</p>
                </div>
            </div>
        </article>
    );
}

function flattenClientDocuments(client: DocumentClientGroup): DocumentGroupRow[] {
    return client.projects.flatMap((project) =>
        project.types.flatMap((type) => type.documents),
    );
}

function flattenProjectDocuments(project: DocumentProjectGroup): DocumentGroupRow[] {
    return project.types.flatMap((type) => type.documents);
}

export function DocumentGroupedExplorer({ groups }: Props) {
    const [selectedProvince, setSelectedProvince] = useState(groups[0]?.province ?? '');
    const selectedProvinceGroup = groups.find((group) => group.province === selectedProvince) ?? groups[0] ?? null;

    const [selectedCommune, setSelectedCommune] = useState(selectedProvinceGroup?.communes[0]?.commune ?? '');
    const selectedCommuneGroup = selectedProvinceGroup?.communes.find((commune) => commune.commune === selectedCommune)
        ?? selectedProvinceGroup?.communes[0]
        ?? null;

    const [level, setLevel] = useState<Level>('clients');
    const [selectedClient, setSelectedClient] = useState(selectedCommuneGroup?.clients[0]?.clientName ?? '');
    const activeClient = selectedCommuneGroup?.clients.find((client) => client.clientName === selectedClient)
        ?? selectedCommuneGroup?.clients[0]
        ?? null;

    const [selectedProject, setSelectedProject] = useState(activeClient?.projects[0]?.dossierNumber ?? '');
    const activeProject = activeClient?.projects.find((project) => project.dossierNumber === selectedProject)
        ?? activeClient?.projects[0]
        ?? null;

    const [selectedType, setSelectedType] = useState(activeProject?.types[0]?.type ?? '');
    const activeType = activeProject?.types.find((type) => type.type === selectedType)
        ?? activeProject?.types[0]
        ?? null;

    const [query, setQuery] = useState('');

    const documents = useMemo(() => {
        let rows: DocumentGroupRow[] = [];

        if (level === 'clients' && activeClient) {
            rows = flattenClientDocuments(activeClient);
        }

        if (level === 'projects' && activeProject) {
            rows = flattenProjectDocuments(activeProject);
        }

        if (level === 'types' && activeType) {
            rows = activeType.documents;
        }

        return rows.filter((document) => searchDocument(document, query));
    }, [activeClient, activeProject, activeType, level, query]);

    if (!groups.length) {
        return (
            <AppEmptyState
                title="No document groups found"
                description="Upload project documents to see province, commune, client, project, and type grouping."
            />
        );
    }

    function chooseProvince(group: DocumentLocationGroup) {
        const firstCommune = group.communes[0] ?? null;
        const firstClient = firstCommune?.clients[0] ?? null;
        const firstProject = firstClient?.projects[0] ?? null;
        const firstType = firstProject?.types[0] ?? null;

        setSelectedProvince(group.province);
        setSelectedCommune(firstCommune?.commune ?? '');
        setSelectedClient(firstClient?.clientName ?? '');
        setSelectedProject(firstProject?.dossierNumber ?? '');
        setSelectedType(firstType?.type ?? '');
        setLevel('clients');
        setQuery('');
    }

    function chooseCommune(commune: DocumentCommuneGroup) {
        const firstClient = commune.clients[0] ?? null;
        const firstProject = firstClient?.projects[0] ?? null;
        const firstType = firstProject?.types[0] ?? null;

        setSelectedCommune(commune.commune);
        setSelectedClient(firstClient?.clientName ?? '');
        setSelectedProject(firstProject?.dossierNumber ?? '');
        setSelectedType(firstType?.type ?? '');
        setLevel('clients');
        setQuery('');
    }

    function chooseClient(client: DocumentClientGroup) {
        const firstProject = client.projects[0] ?? null;
        const firstType = firstProject?.types[0] ?? null;

        setSelectedClient(client.clientName);
        setSelectedProject(firstProject?.dossierNumber ?? '');
        setSelectedType(firstType?.type ?? '');
        setLevel('clients');
        setQuery('');
    }

    function chooseProject(project: DocumentProjectGroup) {
        const firstType = project.types[0] ?? null;

        setSelectedProject(project.dossierNumber);
        setSelectedType(firstType?.type ?? '');
        setLevel('projects');
        setQuery('');
    }

    function chooseType(type: DocumentTypeGroup) {
        setSelectedType(type.type);
        setLevel('types');
        setQuery('');
    }

    return (
        <section className="crm-panel overflow-hidden">
            <div className="grid min-h-[640px] grid-cols-1 xl:grid-cols-[210px_210px_250px_minmax(0,1fr)]">
                <aside className="border-b border-[var(--crm-border)] xl:border-b-0 xl:border-r">
                    <div className="border-b border-[var(--crm-border)] p-3">
                        <div className="flex items-center gap-2">
                            <span className="flex size-8 items-center justify-center rounded-lg bg-[var(--crm-gold-soft)] text-[var(--crm-gold)]">
                                <MapPinned size={15} />
                            </span>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--crm-text-soft)]">Provinces</p>
                                <p className="text-xs text-[var(--crm-text-muted)]">{groups.length} province(s)</p>
                            </div>
                        </div>
                    </div>

                    <div className="app-scrollbar max-h-[580px] overflow-y-auto">
                        {groups.map((group) => (
                            <ColumnButton
                                key={group.province}
                                active={selectedProvinceGroup?.province === group.province}
                                icon={<MapPinned size={14} />}
                                title={group.province}
                                subtitle={`${group.communes.length} communes · ${group.stats.documentsCount} docs`}
                                onClick={() => chooseProvince(group)}
                            />
                        ))}
                    </div>
                </aside>

                <aside className="border-b border-[var(--crm-border)] xl:border-b-0 xl:border-r">
                    <div className="border-b border-[var(--crm-border)] p-3">
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--crm-text-soft)]">Communes</p>
                        <p className="truncate text-xs text-[var(--crm-text-muted)]">{selectedProvinceGroup?.province}</p>
                    </div>

                    <div className="app-scrollbar max-h-[580px] overflow-y-auto">
                        {(selectedProvinceGroup?.communes ?? []).map((commune) => (
                            <ColumnButton
                                key={`${selectedProvinceGroup?.province}-${commune.commune}`}
                                active={selectedCommuneGroup?.commune === commune.commune}
                                title={commune.commune}
                                subtitle={`${commune.clients.length} clients · ${commune.stats.documentsCount} docs`}
                                onClick={() => chooseCommune(commune)}
                            />
                        ))}
                    </div>
                </aside>

                <aside className="border-b border-[var(--crm-border)] xl:border-b-0 xl:border-r">
                    <div className="border-b border-[var(--crm-border)] p-3">
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--crm-text-soft)]">Scope</p>
                        <p className="truncate text-xs text-[var(--crm-text-muted)]">Client / project / type</p>
                    </div>

                    <div className="app-scrollbar max-h-[580px] overflow-y-auto">
                        <div className="border-b border-[var(--crm-border)] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--crm-text-soft)]">
                            Clients
                        </div>
                        {(selectedCommuneGroup?.clients ?? []).map((client) => (
                            <ColumnButton
                                key={`${selectedCommuneGroup?.commune}-${client.clientName}`}
                                active={level === 'clients' && activeClient?.clientName === client.clientName}
                                icon={<UserRound size={14} />}
                                title={client.clientName}
                                subtitle={`${client.projects.length} projects · ${client.stats.documentsCount} docs`}
                                onClick={() => chooseClient(client)}
                            />
                        ))}

                        {activeClient ? (
                            <>
                                <div className="border-b border-[var(--crm-border)] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--crm-text-soft)]">
                                    Projects
                                </div>
                                {activeClient.projects.map((project) => (
                                    <ColumnButton
                                        key={`${activeClient.clientName}-${project.dossierNumber}`}
                                        active={level === 'projects' && activeProject?.dossierNumber === project.dossierNumber}
                                        icon={<FolderKanban size={14} />}
                                        title={project.projectObject || project.dossierNumber}
                                        subtitle={`${project.types.length} types · ${project.stats.documentsCount} docs`}
                                        onClick={() => chooseProject(project)}
                                    />
                                ))}
                            </>
                        ) : null}

                        {activeProject ? (
                            <>
                                <div className="border-b border-[var(--crm-border)] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--crm-text-soft)]">
                                    Types
                                </div>
                                {activeProject.types.map((type) => (
                                    <ColumnButton
                                        key={`${activeProject.dossierNumber}-${type.type}`}
                                        active={level === 'types' && activeType?.type === type.type}
                                        icon={<FileCheck2 size={14} />}
                                        title={type.type}
                                        subtitle={`${type.stats.documentsCount} docs`}
                                        onClick={() => chooseType(type)}
                                    />
                                ))}
                            </>
                        ) : null}
                    </div>
                </aside>

                <main className="min-w-0">
                    <div className="flex flex-col gap-3 border-b border-[var(--crm-border)] p-4 xl:flex-row xl:items-center xl:justify-between">
                        <div className="min-w-0">
                            <p className="crm-eyebrow">Document browser</p>
                            <h2 className="mt-1 truncate text-lg font-semibold">
                                {selectedProvinceGroup?.province || '-'} / {selectedCommuneGroup?.commune || '-'}
                            </h2>
                            <p className="mt-1 text-sm text-[var(--crm-text-muted)]">
                                {documents.length} visible document(s). Select province, commune, then client/project/type.
                            </p>
                        </div>

                        <div className="crm-command-input relative w-full xl:w-[340px]">
                            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--crm-text-soft)]" />
                            <input
                                value={query}
                                onChange={(event) => setQuery(event.target.value)}
                                placeholder="Search documents in scope..."
                                className="h-full w-full bg-transparent pl-9 pr-9 text-sm outline-none placeholder:text-[var(--crm-text-soft)]"
                            />
                        </div>
                    </div>

                    <div className="app-scrollbar max-h-[580px] space-y-3 overflow-y-auto p-4">
                        {documents.length > 0 ? (
                            documents.map((document) => (
                                <DocumentCard key={document.id} document={document} />
                            ))
                        ) : (
                            <div className="py-16 text-center">
                                <p className="text-sm font-semibold">No documents found</p>
                                <p className="mt-1 text-sm text-[var(--crm-text-muted)]">Choose another scope or clear search.</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </section>
    );
}