import { router } from '@inertiajs/react';
import { IconAlertTriangle, IconCircleCheck, IconChevronDown, IconArrowsSort, IconChevronUp, IconEye, IconFolder, IconFilter, IconMapPin, IconDots, IconPencil, IconPlus, IconRefresh, IconSearch, IconAdjustmentsHorizontal, IconTrash, IconX, IconUserCircle, IconMap2, IconGitBranch, IconClockHour3, IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import type { Icon } from '@tabler/icons-react';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Avatar, Button, Card, Chip, Dropdown } from '@heroui/react';
import { AppShell } from '@/components/layout/AppShell';
import { AppButton } from '@/components/ui/AppButton';
import { AppDrawer } from '@/components/ui/AppDrawer';
import { AppModal } from '@/components/ui/AppModal';
import { AppWorkspaceTable, type AppWorkspaceTableColumn } from '@/components/ui/AppWorkspaceTable';
import { AppEmptyState } from '@/components/ui/AppEmptyState';
import { cn } from '@/lib/cn';
import type { City, DossierFormPayload, DossierLocationGroup, DossierRow } from '@/features/dossiers/types';
import type { FormErrors } from '@/lib/formErrors';
import { ProjectDrawer } from '@/features/dossiers/drawers/ProjectDrawer';
import { DossierLocationExplorer } from '@/features/dossiers/components/DossierLocationExplorer';
import { usePermissions } from '@/hooks/usePermissions';
import {
    dossierWorkflowOptions, getDossierReadiness, getDossierWorkflowLabel,
} from '@/config/statuses';
import type { MonthlyCount } from '@/features/intermediaries/types';

type PageProps = {
    dossiers: DossierRow[];
    locationGroups: DossierLocationGroup[];
    clients: { id: string; label: string }[];
    intermediaries: { id: string; label: string }[];
    cities: City[];
    monthlyProjects: MonthlyCount[];
    metrics: { total: number; active: number; opened: number; closed: number; documentsTotal: number };
};

function toBackendPayload(payload: DossierFormPayload) {
    const current = payload as DossierFormPayload & { address?: string; projectAddress?: string; notes?: string };
    return {
        client_id: payload.clientId,
        intermediary_id: payload.intermediaryId || null,
        city_id: payload.cityId,
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

type SortField = 'projectObject' | 'clientName' | 'status' | 'documentsCount' | 'updatedAt';
type SortDir = 'asc' | 'desc';

export default function DossiersIndex({ dossiers, locationGroups, clients, intermediaries, cities, metrics }: PageProps) {
    const { can, canAny } = usePermissions();

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [drawerMode, setDrawerMode] = useState<'create' | 'edit'>('create');
    const [previewDossier, setPreviewDossier] = useState<DossierRow | null>(null);
    const [selectedDossier, setSelectedDossier] = useState<DossierRow | null>(null);
    const [formErrors, setFormErrors] = useState<FormErrors>({});
    const [query, setQuery] = useState('');
    const [workflowFilter, setWorkflowFilter] = useState('all');
    const [sortField, setSortField] = useState<SortField>('updatedAt');
    const [sortDir, setSortDir] = useState<SortDir>('desc');
    const [deleteTarget, setDeleteTarget] = useState<DossierRow | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [viewMode, setViewMode] = useState<'workspace' | 'location'>('workspace');

    const statusOptions = useMemo(() => [
        { id: 'all', label: 'Tous', count: dossiers.length },
        ...dossierWorkflowOptions.map((o) => ({
            id: o.id, label: o.label, count: dossiers.filter((d) => d.workflowStep === o.id).length,
        })),
    ], [dossiers]);

    const filteredDossiers = useMemo(() => {
        const q = query.trim().toLowerCase();
        return dossiers
            .filter((d) => {
                if (workflowFilter !== 'all' && d.workflowStep !== workflowFilter) return false;
                if (!q) return true;
                return [d.projectObject, d.dossierNumber, d.clientName, d.clientNumber, d.clientCin, d.province, d.commune]
                    .filter(Boolean).join(' ').toLowerCase().includes(q);
            })
            .sort((a, b) => {
                const va = String(a[sortField] ?? '').toLowerCase();
                const vb = String(b[sortField] ?? '').toLowerCase();
                return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
            });
    }, [dossiers, query, workflowFilter, sortField, sortDir]);

    const pageSize = 15;
    const pageCount = Math.max(1, Math.ceil(filteredDossiers.length / pageSize));
    const [page, setPage] = useState(0);
    const pageDossiers = filteredDossiers.slice(page * pageSize, (page + 1) * pageSize);

    const metricCards = [
        { label: 'Total projets', value: metrics.total, icon: IconFolder, color: 'text-[var(--text-muted)]', bgClass: 'bg-[var(--surface-2)]' },
        { label: 'Actifs', value: metrics.active, icon: IconCircleCheck, color: metrics.active > 0 ? 'text-emerald-400' : 'text-[var(--text-muted)]', bgClass: metrics.active > 0 ? 'bg-emerald-400/10' : 'bg-[var(--surface-2)]' },
        { label: 'Ouverts', value: metrics.opened, icon: IconAlertTriangle, color: 'text-[var(--accent)]', bgClass: 'bg-[color-mix(in_srgb,var(--accent)_14%,transparent)]' },
        { label: 'Fermes', value: metrics.closed, icon: IconCircleCheck, color: metrics.closed > 0 ? 'text-[var(--text-muted)]' : 'text-[var(--text-muted)]', bgClass: 'bg-[var(--surface-2)]' },
    ];

    function toggleSort(field: SortField) {
        if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
        else { setSortField(field); setSortDir('asc'); }
    }

    function SortIcon({ col }: { col: SortField }) {
        if (sortField !== col) return <IconArrowsSort size={11} className="text-[var(--text-muted)]" />;
        return sortDir === 'asc' ? <IconChevronUp size={11} className="text-[var(--accent)]" /> : <IconChevronDown size={11} className="text-[var(--accent)]" />;
    }

    useEffect(() => {
        setPage((currentPage) => Math.min(currentPage, pageCount - 1));
    }, [pageCount]);

    function ColumnHeader({ label, icon: Icon, field }: { label: string; icon: Icon; field?: SortField }) {
        const content = (<><Icon size={13} strokeWidth={1.9} /><span>{label}</span>{field ? <SortIcon col={field} /> : null}</>);

        if (!field) {
            return <span className="inline-flex items-center gap-1.5">{content}</span>;
        }

        return (
            <button type="button" onClick={() => toggleSort(field)} className="inline-flex items-center gap-1.5 text-left transition hover:text-[var(--foreground)]">
                {content}
            </button>
        );
    }

    const dossierColumns: AppWorkspaceTableColumn<DossierRow>[] = [
        {
            id: 'folder',
            label: '',
            headerClassName: 'w-8',
            reorderable: false,
            render: () => (
                <span className="flex size-5 items-center justify-center rounded bg-[color-mix(in_srgb,var(--accent)_14%,transparent)] text-[9px] font-bold text-[var(--accent)]">
                    <IconFolder size={10} />
                </span>
            ),
        },
        {
            id: 'project',
            label: <ColumnHeader label="Projet" icon={IconFolder} field="projectObject" />,
            render: (dossier) => <div className="min-w-0"><p className="max-w-[180px] truncate font-medium text-[var(--text)]">{dossier.projectObject}</p><p className="max-w-[180px] truncate text-[var(--text-muted)]">{dossier.dossierNumber}</p></div>,
        },
        {
            id: 'client',
            label: <ColumnHeader label="Client" icon={IconUserCircle} field="clientName" />,
            render: (dossier) => (
                <div className="flex items-center gap-2">
                    <Avatar size="sm" className="shrink-0 size-6 bg-[color-mix(in_srgb,var(--accent)_14%,transparent)] text-[9px] font-bold text-[var(--accent)]"><Avatar.Fallback>{dossier.clientName || '?'}</Avatar.Fallback></Avatar>
                    <span className="truncate text-[var(--text)]">{dossier.clientName || '-'}</span>
                </div>
            ),
        },
        {
            id: 'city',
            label: <ColumnHeader label="Ville" icon={IconMapPin} />,
            render: (dossier) => dossier.city ? (
                <span className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-sm ring-1 ring-black/10" style={{ backgroundColor: dossier.city.color }} />
                    <span className="text-[var(--text-muted)]">{dossier.city.code}</span>
                </span>
            ) : <span className="text-[var(--text-muted)]">—</span>,
        },
        {
            id: 'location',
            label: <ColumnHeader label="Localisation" icon={IconMap2} />,
            render: (dossier) => (
                <div className="min-w-0">
                    <p className="max-w-[120px] truncate text-[var(--text-muted)]">{dossier.province || '-'}</p>
                    <p className="max-w-[120px] truncate text-[var(--text-muted)]">{dossier.commune || ''}</p>
                </div>
            ),
        },
        {
            id: 'workflow',
            label: <ColumnHeader label="Workflow" icon={IconGitBranch} />,
            render: (dossier) => <Chip variant="soft" size="sm" color={workflowChipColor[dossier.workflowStep] || 'default'}>{getDossierWorkflowLabel(dossier.workflowStep)}</Chip>,
        },
        {
            id: 'status',
            label: <ColumnHeader label="Statut" icon={IconCircleCheck} field="status" />,
            render: (dossier) => <Chip variant="soft" size="sm" color={statusChipColor[dossier.status] || 'default'}>{statusLabel[dossier.status] || dossier.status}</Chip>,
        },
        {
            id: 'updated',
            label: <ColumnHeader label="Modifie" icon={IconClockHour3} field="updatedAt" />,
            render: (dossier) => <span className="whitespace-nowrap text-[var(--text-muted)]">{dossier.updatedAt || '-'}</span>,
        },
        {
            id: 'actions',
            label: '',
            headerClassName: 'w-24',
            reorderable: false,
            render: (dossier) => <div onClick={(event) => event.stopPropagation()}><RowMenu dossier={dossier} /></div>,
        },
    ];

    function openCreateDrawer() {
        if (!can('dossiers.create')) return;
        setSelectedDossier(null);
        setDrawerMode('create');
        setFormErrors({});
        setDrawerOpen(true);
    }

    useEffect(() => {
        if (new URLSearchParams(window.location.search).get('command') !== 'create') return;
        openCreateDrawer();
        window.history.replaceState({}, '', window.location.pathname);
    }, []);

    function openEditDrawer(dossier: DossierRow) {
        if (!can('dossiers.update')) return;
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
                onSuccess: () => { setDrawerOpen(false); setFormErrors({}); toast.success('Project updated successfully.'); },
                onError: (errors) => { setFormErrors(errors as FormErrors); toast.error('Please check project form errors.'); },
            });
            return;
        }
        router.post('/dossiers', backendPayload, {
            preserveScroll: true,
            onSuccess: () => { setDrawerOpen(false); setFormErrors({}); toast.success('Project created successfully.'); },
            onError: (errors) => { setFormErrors(errors as FormErrors); toast.error('Please check project form errors.'); },
        });
    }

    function confirmDelete() {
        if (!deleteTarget || !can('dossiers.delete')) return;
        setActionLoading(true);
        router.delete(`/dossiers/${deleteTarget.id}`, {
            preserveScroll: true,
            onSuccess: () => { toast.success('Dossier supprime avec succes.'); setDeleteTarget(null); setActionLoading(false); },
            onError: () => { toast.error('Impossible de supprimer le dossier.'); setActionLoading(false); },
        });
    }

    type ActionId = 'open' | 'edit' | 'documents' | 'finance' | 'archive' | 'delete';

    function handleAction(dossier: DossierRow, action: ActionId) {
        switch (action) {
            case 'open': router.visit(`/dossiers/${dossier.id}`); break;
            case 'edit': openEditDrawer(dossier); break;
            case 'documents': router.visit(`/documents?dossier_id=${dossier.id}`); break;
            case 'finance': router.visit(`/finance/documents?dossier_id=${dossier.id}`); break;
            case 'archive': router.visit('/archives'); break;
            case 'delete': setDeleteTarget(dossier); break;
        }
    }

    function RowMenu({ dossier }: { dossier: DossierRow }) {
        const hasMenuActions = canAny(['documents.view', 'finance.view', 'archive.view', 'dossiers.delete']);
        return (
            <div className="flex items-center gap-0.5">
                <button type="button" onClick={() => setPreviewDossier(dossier)}
                    className="flex size-6 items-center justify-center rounded text-[var(--text-muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--text)]" title="Apercu">
                    <IconEye size={12} />
                </button>
                {can('dossiers.update') ? <button type="button" onClick={() => openEditDrawer(dossier)}
                    className="flex size-6 items-center justify-center rounded text-[var(--text-muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--text)]" title="Modifier">
                    <IconPencil size={12} />
                </button> : null}
                {hasMenuActions ? <Dropdown>
                    <Dropdown.Trigger className="flex size-6 items-center justify-center rounded text-[var(--text-muted)] transition hover:bg-[var(--surface-2)] data-[open]:text-[var(--accent)]">
                        <span className="contents"><IconDots size={12} /></span>
                    </Dropdown.Trigger>
                    <Dropdown.Popover placement="bottom end"
                        className="min-w-40 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-0.5 shadow-xl">
                        <Dropdown.Menu aria-label="Actions"
                            onAction={(key) => handleAction(dossier, key as ActionId)}>
                            <Dropdown.Item key="open" id="open" className="text-[var(--text)]">
                                <div className="flex items-center gap-2">
                                    <IconEye size={13} className="text-[var(--accent)] shrink-0" />
                                    <span>View project</span>
                                </div>
                            </Dropdown.Item>
                            {can('documents.view') ? <Dropdown.Item key="documents" id="documents" className="text-[var(--text)]">
                                <div className="flex items-center gap-2">
                                    <IconFolder size={13} className="text-sky-400 shrink-0" />
                                    <span>Documents</span>
                                </div>
                            </Dropdown.Item> : null}
                            {can('finance.view') ? <Dropdown.Item key="finance" id="finance" className="text-[var(--text)]">
                                <div className="flex items-center gap-2">
                                    <IconAdjustmentsHorizontal size={13} className="text-amber-400 shrink-0" />
                                    <span>Finance</span>
                                </div>
                            </Dropdown.Item> : null}
                            {can('archive.view') ? <Dropdown.Item key="archive" id="archive" className="text-[var(--text)]">
                                <div className="flex items-center gap-2">
                                    <IconTrash size={13} className="text-[var(--text-muted)] shrink-0" />
                                    <span>Archiver</span>
                                </div>
                            </Dropdown.Item> : null}
                            {can('dossiers.delete') ? <Dropdown.Section>
                                <div className="mb-0.5 px-2 pb-0.5 pt-1.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">Danger</div>
                                <Dropdown.Item key="delete" id="delete" className="text-red-400 data-[hover]:bg-red-400/10">
                                    <div className="flex items-center gap-2">
                                        <IconTrash size={13} className="shrink-0 text-red-400" />
                                        <span>Supprimer</span>
                                    </div>
                                </Dropdown.Item>
                            </Dropdown.Section> : null}
                        </Dropdown.Menu>
                    </Dropdown.Popover>
                </Dropdown> : null}
            </div>
        );
    }

    const statusFilterBg: Record<string, string> = {
        draft: 'bg-amber-400/10', generated: 'bg-sky-400/10', signed: 'bg-emerald-400/10', cancelled: 'bg-red-400/10',
    };
    const statusFilterColor: Record<string, string> = {
        draft: 'text-amber-300', generated: 'text-sky-300', signed: 'text-emerald-300', cancelled: 'text-red-300',
    };

    return (
        <>
            <AppShell>
                {/* ── Page header ── */}
                <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                        <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">Projets</p>
                        <h1 className="text-2xl font-bold tracking-[-0.02em] text-[var(--foreground)]">Dossiers</h1>
                        <p className="mt-1 max-w-3xl text-sm text-[var(--text-muted)]">
                            Suivez et gerez tous les projets et dossiers.
                        </p>
                    </div>
                    {can('dossiers.create') ? <AppButton isIconOnly compact variant="solid" color="primary" tooltip="Nouveau projet" aria-label="Nouveau projet" onPress={openCreateDrawer}><IconPlus size={14} /></AppButton> : null}
                </header>

                {/* ── Tab bar ── */}
                <div className="flex items-center gap-6 border-b border-[var(--border)]">
                    {['workspace', 'location'].map((mode) => (
                        <button key={mode} type="button" onClick={() => setViewMode(mode as typeof viewMode)}
                            className={cn(
                                'relative pb-2.5 text-[11px] font-semibold transition',
                                viewMode === mode ? 'text-[var(--foreground)]' : 'text-[var(--text-muted)] hover:text-[var(--foreground)]',
                            )}>
                            {mode === 'workspace' ? 'Tableau' : 'Localisation'}
                            {viewMode === mode ? (
                                <span className="absolute -bottom-px left-0 right-0 h-0.5 rounded-full bg-[var(--accent)]" />
                            ) : null}
                        </button>
                    ))}
                    <div className="ml-auto">
                        <p className="text-[9px] text-[var(--text-muted)]">{filteredDossiers.length} dossier(s)</p>
                    </div>
                </div>

                {viewMode === 'location' ? (
                    <DossierLocationExplorer groups={locationGroups} />
                ) : (
                    <>
                        {/* ── Metric cards ── */}
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                            {metricCards.map((card) => {
                                const Icon = card.icon;
                                return (
                                    <div key={card.label}
                                        className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-sm">
                                        <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-lg', card.bgClass)}>
                                            <Icon size={15} className={card.color} />
                                        </span>
                                        <div className="min-w-0">
                                            <p className="text-[10px] font-medium text-[var(--text-muted)]">{card.label}</p>
                                            <p className={cn('text-lg font-semibold text-[var(--foreground)]', card.color)}>{card.value}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* ── Table card ── */}
                        <AppWorkspaceTable
                            ariaLabel="Liste des projets"
                            columns={dossierColumns}
                            columnOrderStorageKey="archilbo.dossiers.table.columns.v1"
                            columnOrderHint="Glisser pour reordonner les colonnes"
                            data={pageDossiers}
                            rowKey={(dossier) => dossier.id}
                            minTableWidthClassName="min-w-[860px]"
                            onRowPress={(dossier) => setPreviewDossier(dossier)}
                            emptyContent={
                                query || workflowFilter !== 'all'
                                    ? <AppEmptyState title="Aucun dossier trouve" description="Essayez de modifier votre recherche ou vos filtres." />
                                    : <AppEmptyState title="Creez un projet pour commencer" description="Utilisez le bouton Nouveau projet pour ajouter votre premier dossier." />
                            }
                            toolbar={
                                <div className="flex flex-wrap items-center gap-2 px-3 py-2">
                                <div className="relative max-w-[220px] flex-1">
                                    <IconSearch size={12} className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                                    <input value={query} onChange={(e) => { setQuery(e.target.value); setPage(0); }}
                                        placeholder="Rechercher par projet, client..."
                                        className="h-7 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] pl-7 pr-2 text-[10px] text-[var(--text)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--accent)_18%,transparent)]"
                                    />
                                    {query ? (
                                        <button type="button" onClick={() => setQuery('')}
                                            className="absolute right-1 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)]">
                                            <IconX size={12} />
                                        </button>
                                    ) : null}
                                </div>
                                <div className="ml-auto flex items-center gap-1">
                                    <Dropdown>
                                        <Dropdown.Trigger className={cn("inline-flex h-7 items-center gap-1.5 rounded-lg border px-2.5 text-[10px] font-medium transition hover:border-[var(--accent)]/30", workflowFilter !== 'all' ? 'border-[var(--accent)] text-[var(--accent)]' : 'border-[var(--border)] text-[var(--text-muted)]')}>
                                            <span className="contents">
                                                <IconFilter size={12} />
                                                {workflowFilter === 'all' ? 'Tous' : statusOptions.find((o) => o.id === workflowFilter)?.label}
                                                <span className="rounded bg-[var(--surface-2)] px-1 py-px text-[9px] font-semibold text-[var(--text-muted)]">
                                                    {statusOptions.find((o) => o.id === workflowFilter)?.count ?? dossiers.length}
                                                </span>
                                            </span>
                                        </Dropdown.Trigger>
                                        <Dropdown.Popover placement="bottom start"
                                            className="min-w-44 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1 shadow-xl">
                                            <Dropdown.Menu aria-label="Filtre workflow" selectionMode="single"
                                                disabledKeys={statusOptions.filter((o) => o.count === 0).map((o) => o.id)}
                                                onAction={(key) => { setWorkflowFilter(key as string); setPage(0); }}>
                                                {statusOptions.map((opt) => {
                                                    const Icon = opt.id === 'all' ? IconFilter : IconAlertTriangle;
                                                    return (
                                                        <Dropdown.Item key={opt.id}
                                                            id={opt.id}
                                                            textValue={opt.label} className="rounded-lg px-2 py-1.5 text-[11px] font-medium text-[var(--text)] transition data-[hover]:bg-[var(--surface-2)] data-[disabled]:opacity-40">
                                                            <div className="flex w-full items-center gap-2">
                                                                <Dropdown.ItemIndicator>
                                                                    <IconCircleCheck size={14} className="text-[var(--accent)]" />
                                                                </Dropdown.ItemIndicator>
                                                                <Icon size={14} className="shrink-0" />
                                                                <span className="flex-1">{opt.label}</span>
                                                                <span className="rounded bg-[var(--surface-2)] px-1.5 py-px text-[9px] font-semibold text-[var(--text-muted)]">{opt.count}</span>
                                                            </div>
                                                        </Dropdown.Item>
                                                    );
                                                })}
                                            </Dropdown.Menu>
                                        </Dropdown.Popover>
                                    </Dropdown>
                                    <AppButton variant="ghost" isIconOnly size="sm" onPress={() => router.reload()} className="size-7 text-[var(--text-muted)]" aria-label="Actualiser"><IconRefresh size={12} /></AppButton>
                                </div>
                                </div>
                            }
                            footer={
                                <div className="flex items-center justify-between px-3 py-2">
                                    <span className="text-[9px] text-[var(--text-muted)]">{filteredDossiers.length} dossier(s)</span>
                                    <div className="flex items-center gap-1.5">
                                        <AppButton isIconOnly compact size="sm" variant="quiet" tooltip="Page precedente" aria-label="Page precedente" isDisabled={page === 0} onPress={() => setPage((current) => current - 1)}><IconChevronLeft size={14} /></AppButton>
                                        <span className="min-w-10 text-center text-[9px] font-semibold tabular-nums text-[var(--text-muted)]">{page + 1} / {pageCount}</span>
                                        <AppButton isIconOnly compact size="sm" variant="quiet" tooltip="Page suivante" aria-label="Page suivante" isDisabled={page >= pageCount - 1} onPress={() => setPage((current) => current + 1)}><IconChevronRight size={14} /></AppButton>
                                    </div>
                                </div>
                            }
                        />

                        {/* ── Preview drawer ── */}
                        <AppDrawer
                            isOpen={!!previewDossier}
                            onOpenChange={(open) => { if (!open) setPreviewDossier(null); }}
                            title={previewDossier?.projectObject || ''}
                            size="md"
                        >
                            {previewDossier ? (
                                <PreviewContent dossier={previewDossier} canEdit={can('dossiers.update')} canDelete={can('dossiers.delete')} canArchive={can('archive.view')} onEdit={openEditDrawer}
                                    onDelete={() => { setDeleteTarget(previewDossier); setPreviewDossier(null); }} />
                            ) : null}
                        </AppDrawer>

                        {/* ── Create/Edit drawer ── */}
                        <ProjectDrawer
                            isOpen={drawerOpen}
                            mode={drawerMode}
                            dossier={selectedDossier}
                            clients={clients}
                            intermediaries={intermediaries}
                            cities={cities}
                            onOpenChange={setDrawerOpen}
                            onSubmit={handleSubmit}
                            errors={formErrors}
                        />

                        {/* ── Delete confirmation modal ── */}
                        <AppModal
                            isOpen={!!deleteTarget}
                            onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
                            title="Supprimer le dossier ?"
                            size="sm"
                        >
                            <p className="mb-5 flex items-start gap-2 text-sm text-[var(--text-muted)]">
                                <IconTrash size={16} className="mt-0.5 shrink-0 text-red-400" />
                                <span>Confirmez la suppression de <strong>{deleteTarget?.dossierNumber}</strong>. Cette action est <span className="font-semibold text-red-400">irreversible</span>.</span>
                            </p>
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onPress={() => setDeleteTarget(null)} isDisabled={actionLoading}>Annuler</Button>
                                <Button variant="danger" onPress={confirmDelete} isPending={actionLoading}>Supprimer</Button>
                            </div>
                        </AppModal>
                    </>
                )}
            </AppShell>
        </>
    );
}

const statusLabel: Record<string, string> = {
    active: 'Actif', opened: 'Ouvert', closed: 'Ferme', archived: 'Archive', paused: 'Suspendu',
};

const statusChipColor: Record<string, 'success' | 'accent' | 'default' | 'warning'> = {
    active: 'success', opened: 'accent', closed: 'default', archived: 'warning', paused: 'warning',
};

const workflowChipColor: Record<string, 'default' | 'accent' | 'success' | 'warning' | 'danger'> = {
    client: 'accent',
    bureau_etude: 'accent',
    documents: 'warning',
    contract: 'success',
    authorization: 'accent',
    finance: 'accent',
    archive: 'default',
};

function PreviewContent({ dossier, canEdit, canDelete, canArchive, onEdit, onDelete }: { dossier: DossierRow; canEdit: boolean; canDelete: boolean; canArchive: boolean; onEdit: (d: DossierRow) => void; onDelete: (d: DossierRow) => void }) {
    const readiness = getDossierReadiness(dossier);
    const doneSteps = readiness.filter((i) => i.done).length;

    return (
        <div className="space-y-5 pb-8">
            <div className="flex items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--accent)_14%,transparent)] text-[var(--accent)]">
                    <IconFolder size={18} />
                </span>
                <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 font-semibold text-[var(--foreground)]">
                        {dossier.projectObject}
                        <Chip variant="soft" size="sm" color={statusChipColor[dossier.status] || 'default'}>{statusLabel[dossier.status] || dossier.status}</Chip>
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">{dossier.dossierNumber}</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <Card className="gap-0 border border-[var(--border)] bg-[var(--surface-2)] p-3 shadow-sm">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--text-subtle)]">Client</p>
                    <p className="mt-1 truncate text-sm font-semibold text-[var(--foreground)]">{dossier.clientName || '-'}</p>
                    <p className="truncate text-xs text-[var(--text-muted)]">{dossier.clientNumber}</p>
                </Card>
                <Card className="gap-0 border border-[var(--border)] bg-[var(--surface-2)] p-3 shadow-sm">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--text-subtle)]">Workflow</p>
                    <p className="mt-1 text-sm font-semibold text-[var(--accent)]">{getDossierWorkflowLabel(dossier.workflowStep)}</p>
                </Card>
                <Card className="gap-0 border border-[var(--border)] bg-[var(--surface-2)] p-3 shadow-sm">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--text-subtle)]">Ville</p>
                    {dossier.city ? (
                        <span className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--foreground)]">
                            <span className="h-2.5 w-2.5 rounded-sm ring-1 ring-black/10" style={{ backgroundColor: dossier.city.color }} />
                            {dossier.city.name}
                        </span>
                    ) : (
                        <p className="mt-1 text-sm font-semibold text-[var(--foreground)]">-</p>
                    )}
                </Card>
                <Card className="gap-0 border border-[var(--border)] bg-[var(--surface-2)] p-3 shadow-sm">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--text-subtle)]">Localisation</p>
                    <p className="mt-1 truncate text-sm font-semibold text-[var(--foreground)]">{dossier.province || '-'}</p>
                    <p className="truncate text-xs text-[var(--text-muted)]">{dossier.commune || '-'}</p>
                </Card>
                <Card className="gap-0 border border-[var(--border)] bg-[var(--surface-2)] p-3 shadow-sm">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--text-subtle)]">Surface</p>
                    <p className="mt-1 text-sm font-semibold text-[var(--foreground)]">{dossier.floorArea ? `${formatNumber(dossier.floorArea)} m2` : '-'}</p>
                </Card>
                <Card className="gap-0 border border-[var(--border)] bg-[var(--surface-2)] p-3 shadow-sm">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--text-subtle)]">Statut</p>
                    <div className="mt-1">
                        <Chip variant="soft" size="sm" color={statusChipColor[dossier.status] || 'default'}>{statusLabel[dossier.status] || dossier.status}</Chip>
                    </div>
                </Card>
            </div>

            <Card className="gap-0 border border-[var(--border)] p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-subtle)]">Readiness</p>
                    <span className="text-[10px] text-[var(--text-muted)]">{doneSteps}/6</span>
                </div>
                <div className="mb-3 h-1.5 rounded-full bg-[var(--surface-3)]">
                    <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${(doneSteps / 6) * 100}%` }} />
                </div>
                <div className="flex flex-wrap gap-1.5">
                    {readiness.map((item) => (
                        <span key={item.key}
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-semibold ${
                                item.done
                                    ? 'bg-emerald-500/10 text-emerald-500'
                                    : 'bg-[var(--surface-3)] text-[var(--text-muted)]'
                            }`}>
                            {item.label}
                        </span>
                    ))}
                </div>
            </Card>

            <div className="grid grid-cols-1 gap-1 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-1.5 shadow-sm sm:grid-cols-2">
                <Button variant="primary" size="sm" className="h-8 min-w-0 px-1.5 text-[9px] whitespace-nowrap" onPress={() => router.visit(`/dossiers/${dossier.id}`)}>
                    <IconEye size={13} /> View project
                </Button>
                {canEdit ? <Button variant="outline" size="sm" className="h-8 min-w-0 px-1.5 text-[9px] whitespace-nowrap" onPress={() => onEdit(dossier)}>
                    <IconPencil size={13} /> Modifier
                </Button> : null}
                {canArchive ? <Button variant="outline" size="sm" className="h-8 min-w-0 px-1.5 text-[9px] whitespace-nowrap" onPress={() => router.visit('/archives')}>
                    <IconTrash size={13} /> Archiver
                </Button> : null}
                {canDelete ? <Button variant="ghost" size="sm" className="h-8 min-w-0 px-1.5 text-[9px] whitespace-nowrap text-red-400" onPress={() => onDelete(dossier)}>
                    <IconTrash size={13} /> Supprimer
                </Button> : null}
            </div>
        </div>
    );
}
