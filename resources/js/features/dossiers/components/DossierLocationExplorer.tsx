import { router } from '@inertiajs/react';
import {
    BadgeDollarSign,
    ChevronRight,
    Eye,
    FileCheck2,
    FolderKanban,
    MapPinned,
    Search,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { AppButton } from '@/components/ui/AppButton';
import { AppEmptyState } from '@/components/ui/AppEmptyState';
import type {
    DossierCommuneGroup,
    DossierLocationGroup,
    DossierLocationRow,
} from '@/features/dossiers/types';

/* COLUMN_LOCATION_BROWSER_53DE */

type Props = {
    groups: DossierLocationGroup[];
};

function money(value: number) {
    return new Intl.NumberFormat('fr-MA', {
        style: 'currency',
        currency: 'MAD',
        maximumFractionDigits: 0,
    }).format(value || 0);
}

function statusClass(status: string) {
    if (status === 'active') return 'border-emerald-400/25 bg-emerald-400/10 text-emerald-300';
    if (status === 'opened') return 'border-sky-400/25 bg-sky-400/10 text-sky-300';
    if (status === 'closed') return 'border-zinc-500/30 bg-zinc-500/10 text-zinc-300';
    if (status === 'archived') return 'border-violet-400/25 bg-violet-400/10 text-violet-300';

    return 'border-amber-400/25 bg-amber-400/10 text-amber-300';
}

function workflowLabel(value: string) {
    const labels: Record<string, string> = {
        client: 'Client',
        documents: 'Documents',
        contract: 'Contract',
        authorization: 'Authorization',
        finance: 'Finance',
        archive: 'Archive',
    };

    return labels[value] ?? value;
}

function searchProject(project: DossierLocationRow, query: string) {
    if (!query.trim()) {
        return true;
    }

    return [
        project.dossierNumber,
        project.projectObject,
        project.projectAddress,
        project.ownerName,
        project.clientNumber,
        project.status,
        project.workflowStep,
    ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(query.trim().toLowerCase());
}

function ProjectRow({ project }: { project: DossierLocationRow }) {
    return (
        <article className="crm-panel-soft p-3 transition hover:border-[var(--crm-gold)]">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                <div className="min-w-0">
                    <div className="flex min-w-0 items-center gap-3">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[var(--crm-gold-soft)] text-[var(--crm-gold)]">
                            <FolderKanban size={16} />
                        </span>

                        <div className="min-w-0">
                            <h3 className="truncate text-sm font-semibold text-[var(--crm-text)]">
                                {project.projectObject || project.dossierNumber}
                            </h3>
                            <p className="text-xs text-[var(--crm-text-muted)]">{project.dossierNumber}</p>
                        </div>
                    </div>

                    <p className="mt-2 truncate text-xs text-[var(--crm-text-soft)]">
                        {project.projectAddress || 'No address'}
                    </p>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <span className={`inline-flex rounded-full border px-2 py-1 text-[11px] font-semibold ${statusClass(project.status)}`}>
                        {project.status}
                    </span>

                    <AppButton variant="secondary" size="sm" onPress={() => router.visit(`/dossiers/${project.id}`)}>
                        <Eye size={14} />
                        Open
                    </AppButton>
                </div>
            </div>

            <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--crm-text-soft)]">Client</p>
                    <p className="mt-1 truncate text-sm font-semibold">{project.ownerName || '-'}</p>
                    <p className="truncate text-xs text-[var(--crm-text-muted)]">{project.clientNumber || '-'}</p>
                </div>

                <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--crm-text-soft)]">Workflow</p>
                    <p className="mt-1 truncate text-sm font-semibold text-[var(--crm-gold)]">{workflowLabel(project.workflowStep)}</p>
                </div>

                <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--crm-text-soft)]">Documents</p>
                    <p className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-[var(--crm-info)]">
                        <FileCheck2 size={14} />
                        {project.documentsCount} docs
                    </p>
                </div>

                <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--crm-text-soft)]">Finance</p>
                    <p className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-[var(--crm-violet)]">
                        <BadgeDollarSign size={14} />
                        {project.financeDocumentsCount} docs
                    </p>
                    <p className="truncate text-xs text-[var(--crm-text-muted)]">Remaining: {money(project.remainingTotal)}</p>
                </div>
            </div>
        </article>
    );
}

function ColumnButton({
    active,
    title,
    subtitle,
    onClick,
}: {
    active: boolean;
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
            <span className="min-w-0">
                <span className="block truncate text-sm font-semibold">{title}</span>
                <span className="block truncate text-xs opacity-75">{subtitle}</span>
            </span>

            <ChevronRight size={15} className="shrink-0" />
        </button>
    );
}

export function DossierLocationExplorer({ groups }: Props) {
    const [selectedProvince, setSelectedProvince] = useState(groups[0]?.province ?? '');
    const selectedProvinceGroup = groups.find((group) => group.province === selectedProvince) ?? groups[0] ?? null;

    const [selectedCommune, setSelectedCommune] = useState(selectedProvinceGroup?.communes[0]?.commune ?? '');
    const [query, setQuery] = useState('');

    const activeCommune = useMemo<DossierCommuneGroup | null>(() => {
        if (!selectedProvinceGroup) {
            return null;
        }

        const exact = selectedProvinceGroup.communes.find((commune) => commune.commune === selectedCommune);

        return exact ?? selectedProvinceGroup.communes[0] ?? null;
    }, [selectedCommune, selectedProvinceGroup]);

    const projects = useMemo(() => {
        return (activeCommune?.dossiers ?? []).filter((project) => searchProject(project, query));
    }, [activeCommune, query]);

    if (!groups.length) {
        return (
            <AppEmptyState
                title="No location groups found"
                description="Create projects with province and commune to see the location browser."
            />
        );
    }

    function chooseProvince(group: DossierLocationGroup) {
        setSelectedProvince(group.province);
        setSelectedCommune(group.communes[0]?.commune ?? '');
        setQuery('');
    }

    return (
        <section className="crm-panel overflow-hidden">
            <div className="grid min-h-[620px] grid-cols-1 lg:grid-cols-[220px_220px_minmax(0,1fr)]">
                <aside className="border-b border-[var(--crm-border)] lg:border-b-0 lg:border-r">
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

                    <div className="app-scrollbar max-h-[560px] overflow-y-auto">
                        {groups.map((group) => (
                            <ColumnButton
                                key={group.province}
                                active={selectedProvinceGroup?.province === group.province}
                                title={group.province}
                                subtitle={`${group.communes.length} communes · ${group.stats.projectsCount} projects`}
                                onClick={() => chooseProvince(group)}
                            />
                        ))}
                    </div>
                </aside>

                <aside className="border-b border-[var(--crm-border)] lg:border-b-0 lg:border-r">
                    <div className="border-b border-[var(--crm-border)] p-3">
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--crm-text-soft)]">Communes</p>
                        <p className="truncate text-xs text-[var(--crm-text-muted)]">{selectedProvinceGroup?.province}</p>
                    </div>

                    <div className="app-scrollbar max-h-[560px] overflow-y-auto">
                        {(selectedProvinceGroup?.communes ?? []).map((commune) => (
                            <ColumnButton
                                key={`${selectedProvinceGroup?.province}-${commune.commune}`}
                                active={activeCommune?.commune === commune.commune}
                                title={commune.commune}
                                subtitle={`${commune.stats.projectsCount} projects · ${commune.stats.documentsCount} docs`}
                                onClick={() => {
                                    setSelectedCommune(commune.commune);
                                    setQuery('');
                                }}
                            />
                        ))}
                    </div>
                </aside>

                <main className="min-w-0">
                    <div className="flex flex-col gap-3 border-b border-[var(--crm-border)] p-4 xl:flex-row xl:items-center xl:justify-between">
                        <div className="min-w-0">
                            <p className="crm-eyebrow">Location browser</p>
                            <h2 className="mt-1 truncate text-lg font-semibold">
                                {selectedProvinceGroup?.province || '-'} / {activeCommune?.commune || '-'}
                            </h2>
                            <p className="mt-1 text-sm text-[var(--crm-text-muted)]">
                                {projects.length} visible project(s). Select province, then commune, then open project details.
                            </p>
                        </div>

                        <div className="crm-command-input relative w-full xl:w-[340px]">
                            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--crm-text-soft)]" />
                            <input
                                value={query}
                                onChange={(event) => setQuery(event.target.value)}
                                placeholder="Search projects in commune..."
                                className="h-full w-full bg-transparent pl-9 pr-9 text-sm outline-none placeholder:text-[var(--crm-text-soft)]"
                            />
                        </div>
                    </div>

                    <div className="app-scrollbar max-h-[560px] space-y-3 overflow-y-auto p-4">
                        {projects.length > 0 ? (
                            projects.map((project) => (
                                <ProjectRow key={project.id} project={project} />
                            ))
                        ) : (
                            <div className="py-16 text-center">
                                <p className="text-sm font-semibold">No projects found</p>
                                <p className="mt-1 text-sm text-[var(--crm-text-muted)]">Choose another commune or clear search.</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </section>
    );
}