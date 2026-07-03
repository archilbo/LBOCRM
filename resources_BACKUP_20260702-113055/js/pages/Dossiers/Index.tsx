import { Head, router } from '@inertiajs/react';
import {
    Archive,
    BadgeDollarSign,
    CheckCircle2,
    Circle,
    Eye,
    FileCheck2,
    FolderKanban,
    MapPin,
    Pencil,
    Plus,
    Search,
    Trash2,
    X,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FormErrors } from '@/lib/formErrors';
import { countByValue, filterByValue } from '@/lib/filters';
import { toast } from 'sonner';
import { AppShell } from '@/components/layout/AppShell';
import { AppButton } from '@/components/ui/AppButton';
import { ProjectDrawer } from '@/features/dossiers/drawers/ProjectDrawer';
import { DossierLocationExplorer } from '@/features/dossiers/components/DossierLocationExplorer';
import type {
    ClientOption,
    DossierFormPayload,
    DossierLocationGroup,
    DossierRow,
} from '@/features/dossiers/types';
import { useTranslation } from '@/lib/i18n';
import { AppPagination } from '@/components/ui/AppPagination';

/* FORCE_PROJECTS_REDESIGN_53D */

type PageProps = {
    dossiers: DossierRow[];
    locationGroups: DossierLocationGroup[];
    clients: ClientOption[];
    metrics: {
        total: number;
        active: number;
        opened: number;
        closed: number;
    };
};

type ViewMode = 'workspace' | 'location';

function toBackendPayload(payload: DossierFormPayload) {
    const current = payload as DossierFormPayload & {
        address?: string;
        projectAddress?: string;
        notes?: string;
    };

    return {
        client_id: payload.clientId,
        project_object: payload.projectObject,
        description: payload.description || null,
        project_address: current.projectAddress || current.address || null,
        province: payload.province || null,
        commune: payload.commune || null,
        land_title_number: payload.landTitleNumber || null,
        land_surface: payload.landSurface || null,
        floor_area: payload.floorArea || null,
        status: payload.status || 'opened',
        workflow_step: payload.workflowStep || 'client',
        notes: current.notes || null,
    };
}

function formatNumber(value: number) {
    return new Intl.NumberFormat('fr-MA').format(value || 0);
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

function statusClass(status: string) {
    if (status === 'active') return 'border-emerald-400/25 bg-emerald-400/10 text-emerald-300';
    if (status === 'opened') return 'border-sky-400/25 bg-sky-400/10 text-sky-300';
    if (status === 'closed') return 'border-zinc-500/30 bg-zinc-500/10 text-zinc-300';
    if (status === 'archived') return 'border-violet-400/25 bg-violet-400/10 text-violet-300';

    return 'border-amber-400/25 bg-amber-400/10 text-amber-300';
}

function readiness(dossier: DossierRow) {
    return [
        { label: 'Client', done: true },
        { label: 'Docs', done: dossier.documentsCount > 0 },
        { label: 'Contract', done: dossier.hasContract },
        { label: 'Auth', done: dossier.hasAuthorization },
        { label: 'Finance', done: dossier.financeRecordsCount > 0 },
        { label: 'Archive', done: dossier.hasArchiveRecord },
    ];
}

function matchesSearch(dossier: DossierRow, query: string) {
    if (!query.trim()) return true;

    return [
        dossier.projectObject,
        dossier.dossierNumber,
        dossier.clientName,
        dossier.clientNumber,
        dossier.province,
        dossier.commune,
        dossier.projectAddress,
        dossier.status,
        dossier.workflowStep,
    ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(query.trim().toLowerCase());
}

function openDocuments(dossier: DossierRow) {
    router.visit(`/documents?search=${encodeURIComponent(dossier.dossierNumber)}`);
}

function openFinance(dossier: DossierRow) {
    router.visit(`/finance/documents?search=${encodeURIComponent(dossier.dossierNumber)}`);
}

function KpiCard({ label, value, detail }: { label: string; value: string | number; detail: string }) {
    return (
        <div className="crm-kpi-card">
            <p className="crm-kpi-label">{label}</p>
            <p className="crm-kpi-value">{value}</p>
            <p className="mt-2 truncate text-xs text-[var(--crm-text-soft)]">{detail}</p>
        </div>
    );
}

function ProjectDetailPanel({
    dossier,
    onEdit,
    onDelete,
}: {
    dossier: DossierRow | null;
    onEdit: (dossier: DossierRow) => void;
    onDelete: (dossier: DossierRow) => void;
}) {
    if (!dossier) {
        return (
            <aside className="crm-panel p-4">
                <p className="text-sm font-semibold">Project details</p>
                <p className="mt-2 text-sm text-[var(--crm-text-muted)]">Select a project to see details.</p>
            </aside>
        );
    }

    const items = readiness(dossier);
    const done = items.filter((item) => item.done).length;

    return (
        <aside className="crm-panel overflow-hidden">
            <div className="border-b border-[var(--crm-border)] p-4">
                <p className="crm-eyebrow">Selected project</p>
                <div className="mt-2 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <h2 className="truncate text-lg font-semibold">{dossier.projectObject}</h2>
                        <p className="text-sm text-[var(--crm-text-muted)]">{dossier.dossierNumber}</p>
                    </div>
                    <span className={`shrink-0 rounded-full border px-2 py-1 text-[11px] font-semibold ${statusClass(dossier.status)}`}>
                        {dossier.status}
                    </span>
                </div>
            </div>

            <div className="space-y-5 p-5">
                <div className="grid grid-cols-2 gap-3">
                    <div className="crm-panel-soft p-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--crm-text-soft)]">Client</p>
                        <p className="mt-1 truncate text-sm font-semibold">{dossier.clientName}</p>
                        <p className="truncate text-xs text-[var(--crm-text-muted)]">{dossier.clientNumber}</p>
                    </div>
                    <div className="crm-panel-soft p-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--crm-text-soft)]">Step</p>
                        <p className="mt-1 truncate text-sm font-semibold text-[var(--crm-gold)]">{workflowLabel(dossier.workflowStep)}</p>
                        <p className="truncate text-xs text-[var(--crm-text-muted)]">Current workflow</p>
                    </div>
                    <div className="crm-panel-soft p-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--crm-text-soft)]">Province</p>
                        <p className="mt-1 truncate text-sm font-semibold">{dossier.province || '-'}</p>
                        <p className="truncate text-xs text-[var(--crm-text-muted)]">{dossier.commune || '-'}</p>
                    </div>
                    <div className="crm-panel-soft p-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--crm-text-soft)]">Surface</p>
                        <p className="mt-1 truncate text-sm font-semibold">{dossier.floorArea ? `${formatNumber(dossier.floorArea)} m2` : '-'}</p>
                        <p className="truncate text-xs text-[var(--crm-text-muted)]">Floor area</p>
                    </div>
                </div>

                <div>
                    <div className="mb-2 flex items-center justify-between">
                        <p className="text-sm font-semibold">Workflow readiness</p>
                        <p className="text-xs text-[var(--crm-text-muted)]">{done}/6 done</p>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        {items.map((item) => (
                            <div
                                key={item.label}
                                className={[
                                    'rounded-lg border px-2 py-2 text-[11px] font-semibold',
                                    item.done
                                        ? 'border-[color-mix(in_srgb,var(--crm-gold)_30%,transparent)] bg-[var(--crm-gold-soft)] text-[var(--crm-gold)]'
                                        : 'border-[var(--crm-border)] bg-[var(--crm-surface)] text-[var(--crm-text-soft)]',
                                ].join(' ')}
                            >
                                <span className="flex items-center gap-1">
                                    {item.done ? <CheckCircle2 size={13} /> : <Circle size={13} />}
                                    {item.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => openDocuments(dossier)} className="crm-panel-soft p-3 text-left hover:border-[var(--crm-gold)]">
                        <FileCheck2 size={16} className="text-[var(--crm-info)]" />
                        <p className="mt-2 text-sm font-semibold">{dossier.documentsCount} documents</p>
                        <p className="text-xs text-[var(--crm-text-muted)]">Open files</p>
                    </button>
                    <button type="button" onClick={() => openFinance(dossier)} className="crm-panel-soft p-3 text-left hover:border-[var(--crm-gold)]">
                        <BadgeDollarSign size={16} className="text-[var(--crm-violet)]" />
                        <p className="mt-2 text-sm font-semibold">{dossier.financeRecordsCount} finance</p>
                        <p className="text-xs text-[var(--crm-text-muted)]">Open finance</p>
                    </button>
                </div>

                <AppButton variant="primary" onPress={() => router.visit(`/dossiers/${dossier.id}`)}>
                    <Eye size={15} />
                    Open project
                </AppButton>

                <div className="grid grid-cols-3 gap-2">
                    <AppButton variant="secondary" size="sm" onPress={() => onEdit(dossier)}>
                        <Pencil size={14} />
                        Edit
                    </AppButton>
                    <AppButton variant="secondary" size="sm" onPress={() => router.visit('/archives')}>
                        <Archive size={14} />
                        Archive
                    </AppButton>
                    <AppButton variant="danger" size="sm" onPress={() => onDelete(dossier)}>
                        <Trash2 size={14} />
                        Delete
                    </AppButton>
                </div>
            </div>
        </aside>
    );
}

export default function DossiersIndex({ dossiers, locationGroups, clients, metrics }: PageProps) {
    const { t } = useTranslation();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [drawerMode, setDrawerMode] = useState<'create' | 'edit'>('create');
    const [selectedDossier, setSelectedDossier] = useState<DossierRow | null>(dossiers[0] ?? null);
    const [formErrors, setFormErrors] = useState<FormErrors>({});
    const [workflowFilter, setWorkflowFilter] = useState('all');
    const [query, setQuery] = useState('');
    const [viewMode, setViewMode] = useState<ViewMode>('workspace');
    const [tablePage, setTablePage] = useState(1);
    const TABLE_PAGE_SIZE = 15;

    const workflowOptions = useMemo(() => [
        { id: 'all', label: 'All', count: dossiers.length },
        { id: 'client', label: 'Client', count: countByValue(dossiers, (dossier) => dossier.workflowStep, 'client') },
        { id: 'documents', label: 'Documents', count: countByValue(dossiers, (dossier) => dossier.workflowStep, 'documents') },
        { id: 'contract', label: 'Contract', count: countByValue(dossiers, (dossier) => dossier.workflowStep, 'contract') },
        { id: 'authorization', label: 'Authorization', count: countByValue(dossiers, (dossier) => dossier.workflowStep, 'authorization') },
        { id: 'finance', label: 'Finance', count: countByValue(dossiers, (dossier) => dossier.workflowStep, 'finance') },
        { id: 'archive', label: 'Archive', count: countByValue(dossiers, (dossier) => dossier.workflowStep, 'archive') },
    ], [dossiers]);

    const filteredDossiers = useMemo(() => {
        return filterByValue(dossiers, workflowFilter, (dossier) => dossier.workflowStep)
            .filter((dossier) => matchesSearch(dossier, query));
    }, [dossiers, query, workflowFilter]);

    useEffect(() => {
        setTablePage(1);
    }, [query, workflowFilter]);

    const pagedDossiers = useMemo(
        () => filteredDossiers.slice((tablePage - 1) * TABLE_PAGE_SIZE, tablePage * TABLE_PAGE_SIZE),
        [filteredDossiers, tablePage],
    );

    const selectedVisible = selectedDossier && filteredDossiers.some((dossier) => dossier.id === selectedDossier.id)
        ? selectedDossier
        : filteredDossiers[0] ?? null;

    const totalDocuments = dossiers.reduce((sum, dossier) => sum + (dossier.documentsCount || 0), 0);

    function openCreateDrawer() {
        setSelectedDossier(null);
        setDrawerMode('create');
        setFormErrors({});
        setDrawerOpen(true);
    }

    function openEditDrawer(dossier: DossierRow) {
        setSelectedDossier(dossier);
        setDrawerMode('edit');
        setFormErrors({});
        setDrawerOpen(true);
    }

    function handleSubmit(payload: DossierFormPayload) {
        const backendPayload = toBackendPayload(payload);

        if (drawerMode === 'edit' && selectedDossier) {
            router.put(`/dossiers/${selectedDossier.id}`, backendPayload, {
                preserveScroll: true,
                onSuccess: () => {
                    setDrawerOpen(false);
                    setFormErrors({});
                    toast.success('Project updated successfully.');
                },
                onError: (errors) => {
                    setFormErrors(errors as FormErrors);
                    toast.error('Please check project form errors.');
                },
            });

            return;
        }

        router.post('/dossiers', backendPayload, {
            preserveScroll: true,
            onSuccess: () => {
                setDrawerOpen(false);
                setFormErrors({});
                toast.success('Project created successfully.');
            },
            onError: (errors) => {
                setFormErrors(errors as FormErrors);
                toast.error('Please check project form errors.');
            },
        });
    }

    function deleteDossier(dossier: DossierRow) {
        if (!window.confirm(`Delete ${dossier.dossierNumber}?`)) return;

        router.delete(`/dossiers/${dossier.id}`, {
            preserveScroll: true,
            onSuccess: () => toast.success('Project deleted successfully.'),
            onError: () => toast.error('Project could not be deleted.'),
        });
    }

    return (
        <>
            <Head title={t('dossiers.title')} />

            <AppShell
                eyebrowKey="dossiers.eyebrow"
                titleKey="dossiers.title"
                subtitleKey="dossiers.subtitle"
                action={
                    <AppButton variant="primary" onPress={openCreateDrawer}>
                        <Plus size={16} />
                        New project
                    </AppButton>
                }
            >
                <section className="crm-kpi-grid max-xl:grid-cols-3 max-md:grid-cols-1">
                    <KpiCard label="Total projects" value={metrics.total} detail="All registered dossiers" />
                    <KpiCard label="Active" value={metrics.active} detail="Moving through workflow" />
                    <KpiCard label="Opened" value={metrics.opened} detail="Recently opened" />
                    <KpiCard label="Closed" value={metrics.closed} detail="Completed projects" />
                    <KpiCard label="Documents" value={totalDocuments} detail="Linked project files" />
                </section>

                <section className="crm-panel p-4">
                    <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                        <div className="flex flex-wrap gap-2">
                            {workflowOptions.map((option) => {
                                const active = option.id === workflowFilter;

                                return (
                                    <button
                                        key={option.id}
                                        type="button"
                                        onClick={() => setWorkflowFilter(option.id)}
                                        className={[
                                            'inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-sm font-semibold transition',
                                            active
                                                ? 'border-[var(--crm-gold)] bg-[var(--crm-gold-soft)] text-[var(--crm-gold)]'
                                                : 'border-[var(--crm-border)] bg-[var(--crm-surface)] text-[var(--crm-text-muted)] hover:text-[var(--crm-text)]',
                                        ].join(' ')}
                                    >
                                        {option.label}
                                        <span className="rounded-full bg-black/20 px-2 py-0.5 text-xs">{option.count}</span>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                            <div className="crm-command-input relative w-full sm:w-[360px]">
                                <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--crm-text-soft)]" />
                                <input
                                    value={query}
                                    onChange={(event) => setQuery(event.target.value)}
                                    placeholder="Search projects, clients, dossier, location..."
                                    className="h-full w-full bg-transparent pl-9 pr-9 text-sm outline-none placeholder:text-[var(--crm-text-soft)]"
                                />
                                {query ? (
                                    <button
                                        type="button"
                                        onClick={() => setQuery('')}
                                        className="absolute right-2 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-[var(--crm-text-soft)] hover:bg-[var(--crm-surface-2)]"
                                    >
                                        <X size={14} />
                                    </button>
                                ) : null}
                            </div>

                            <div className="inline-flex rounded-lg border border-[var(--crm-border)] bg-[var(--crm-surface)] p-1">
                                <button
                                    type="button"
                                    onClick={() => setViewMode('workspace')}
                                    className={`h-8 rounded-md px-3 text-xs font-semibold ${viewMode === 'workspace' ? 'bg-[var(--crm-gold)] text-black' : 'text-[var(--crm-text-muted)'}`}
                                >
                                    Workspace
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setViewMode('location')}
                                    className={`h-8 rounded-md px-3 text-xs font-semibold ${viewMode === 'location' ? 'bg-[var(--crm-gold)] text-black' : 'text-[var(--crm-text-muted)]'}`}
                                >
                                    Location
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {viewMode === 'location' ? (
                    <DossierLocationExplorer groups={locationGroups} />
                ) : (
                    <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
                        <div className="crm-panel overflow-hidden">
                            <div className="flex items-center justify-between border-b border-[var(--crm-border)] px-5 py-4">
                                <div>
                                    <p className="text-sm font-semibold">Project workspace</p>
                                    <p className="text-xs text-[var(--crm-text-muted)]">{filteredDossiers.length} visible project(s)</p>
                                </div>
                                <AppButton variant="secondary" size="sm" onPress={() => setWorkflowFilter('all')}>
                                    Reset
                                </AppButton>
                            </div>

                            <div className="app-scrollbar overflow-x-auto">
                                <table className="crm-table min-w-[980px]">
                                    <thead>
                                        <tr>
                                            <th>Project</th>
                                            <th>Client</th>
                                            <th>Location</th>
                                            <th>Step</th>
                                            <th>Readiness</th>
                                            <th>Updated</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pagedDossiers.map((dossier) => {
                                            const done = readiness(dossier).filter((item) => item.done).length;
                                            const selected = selectedVisible?.id === dossier.id;

                                            return (
                                                <tr
                                                    key={dossier.id}
                                                    className={selected ? 'bg-[color-mix(in_srgb,var(--crm-gold)_8%,transparent)]' : ''}
                                                    onClick={() => setSelectedDossier(dossier)}
                                                >
                                                    <td>
                                                        <div className="flex items-center gap-3">
                                                            <span className="flex size-9 items-center justify-center rounded-lg bg-[var(--crm-gold-soft)] text-[var(--crm-gold)]">
                                                                <FolderKanban size={16} />
                                                            </span>
                                                            <div className="min-w-0">
                                                                <p className="max-w-[260px] truncate font-semibold text-[var(--crm-text)]">{dossier.projectObject}</p>
                                                                <p className="text-xs text-[var(--crm-text-muted)]">{dossier.dossierNumber}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <p className="max-w-[180px] truncate font-medium text-[var(--crm-text)]">{dossier.clientName}</p>
                                                        <p className="text-xs text-[var(--crm-text-muted)]">{dossier.clientNumber}</p>
                                                    </td>
                                                    <td>
                                                        <div className="flex items-start gap-2">
                                                            <MapPin size={14} className="mt-0.5 text-[var(--crm-text-soft)]" />
                                                            <div>
                                                                <p className="max-w-[170px] truncate">{dossier.province || '-'}</p>
                                                                <p className="max-w-[170px] truncate text-xs text-[var(--crm-text-muted)]">{dossier.commune || '-'}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className="rounded-full border border-[var(--crm-border)] bg-[var(--crm-surface-2)] px-2 py-1 text-[11px] font-semibold text-[var(--crm-gold)]">
                                                            {workflowLabel(dossier.workflowStep)}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div className="w-[140px]">
                                                            <div className="mb-1 flex justify-between text-xs text-[var(--crm-text-muted)]">
                                                                <span>{done}/6</span>
                                                                <span className={`rounded-full border px-2 py-0.5 ${statusClass(dossier.status)}`}>{dossier.status}</span>
                                                            </div>
                                                            <div className="h-1.5 rounded-full bg-[var(--crm-surface-3)]">
                                                                <div className="h-full rounded-full bg-[var(--crm-gold)]" style={{ width: `${Math.round((done / 6) * 100)}%` }} />
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>{dossier.updatedAt || '-'}</td>
                                                    <td>
                                                        <div className="flex justify-end gap-1">
                                                            <button type="button" className="crm-action-button" onClick={(event) => { event.stopPropagation(); router.visit(`/dossiers/${dossier.id}`); }}><Eye size={14} /></button>
                                                            <button type="button" className="crm-action-button" onClick={(event) => { event.stopPropagation(); openEditDrawer(dossier); }}><Pencil size={14} /></button>
                                                            <button type="button" className="crm-action-button" onClick={(event) => { event.stopPropagation(); openDocuments(dossier); }}><FileCheck2 size={14} /></button>
                                                            <button type="button" className="crm-action-button" onClick={(event) => { event.stopPropagation(); openFinance(dossier); }}><BadgeDollarSign size={14} /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <AppPagination page={tablePage} pageSize={TABLE_PAGE_SIZE} total={filteredDossiers.length} onChange={setTablePage} />

                        <ProjectDetailPanel dossier={selectedVisible} onEdit={openEditDrawer} onDelete={deleteDossier} />
                    </section>
                )}

                <ProjectDrawer
                    isOpen={drawerOpen}
                    mode={drawerMode}
                    dossier={selectedDossier}
                    clients={clients}
                    onOpenChange={setDrawerOpen}
                    onSubmit={handleSubmit}
                    errors={formErrors}
                />
            </AppShell>
        </>
    );
}