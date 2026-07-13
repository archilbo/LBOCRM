import { Head, router } from '@inertiajs/react';
import {
    ChevronDown, ChevronUp, Eye, FolderKanban, MapPin, MoreHorizontal,
    Pencil, Plus, RefreshCw, Search, SlidersHorizontal, Trash2, X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { AppShell } from '@/components/layout/AppShell';
import { AppButton } from '@/components/ui/AppButton';
import { AppDrawer } from '@/components/ui/AppDrawer';
import { AppEmptyState } from '@/components/ui/AppEmptyState';
import { AppModal } from '@/components/ui/AppModal';
import { StatusPill } from '@/components/ui/StatusPill';
import { cn } from '@/lib/cn';
import { useTranslation } from '@/lib/i18n';
import type { DossierFormPayload, DossierRow } from '@/features/dossiers/types';
import type { FormErrors } from '@/lib/formErrors';
import { ProjectDrawer } from '@/features/dossiers/drawers/ProjectDrawer';
import { DossierLocationExplorer } from '@/features/dossiers/components/DossierLocationExplorer';
import {
    dossierWorkflowOptions, getDossierReadiness, getDossierWorkflowLabel,
} from '@/config/statuses';
import type { MonthlyCount } from '@/features/intermediaries/types';

type PageProps = {
    dossiers: DossierRow[];
    locationGroups: { province: string; communes: { commune: string; stats: unknown; dossiers: unknown[] }[] }[];
    clients: { id: string; label: string }[];
    monthlyProjects: MonthlyCount[];
    metrics: { total: number; active: number; opened: number; closed: number; documentsTotal: number };
};

function toBackendPayload(payload: DossierFormPayload) {
    const current = payload as DossierFormPayload & { address?: string; projectAddress?: string; notes?: string };
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

type SortField = 'projectObject' | 'clientName' | 'status' | 'documentsCount' | 'updatedAt';
type SortDir = 'asc' | 'desc';

export default function DossiersIndex({ dossiers, locationGroups, clients, metrics }: PageProps) {
    const { t } = useTranslation();

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
    const [showFilters, setShowFilters] = useState(false);
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
    const [viewMode, setViewMode] = useState<'workspace' | 'location'>('workspace');
    const searchRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (openMenuId === null) return;
        function handleClick(e: MouseEvent) {
            const target = e.target as HTMLElement;
            if (!target.closest('[data-row-menu]')) {
                setOpenMenuId(null);
            }
        }
        function handleKey(e: KeyboardEvent) { if (e.key === 'Escape') setOpenMenuId(null); }
        document.addEventListener('mousedown', handleClick);
        document.addEventListener('keydown', handleKey);
        return () => { document.removeEventListener('mousedown', handleClick); document.removeEventListener('keydown', handleKey); };
    }, [openMenuId]);

    const workflowOptions = useMemo(() => [
        { id: 'all', label: 'All', count: dossiers.length },
        ...dossierWorkflowOptions.map((o) => ({
            ...o,
            count: dossiers.filter((d) => d.workflowStep === o.id).length,
        })),
    ], [dossiers]);

    const filteredDossiers = useMemo(() => {
        const q = query.trim().toLowerCase();
        return dossiers
            .filter((d) => {
                if (workflowFilter !== 'all' && d.workflowStep !== workflowFilter) return false;
                if (!q) return true;
                const searchable = [
                    d.projectObject, d.dossierNumber, d.clientName, d.clientNumber,
                    d.clientCin, d.province, d.commune, d.projectAddress,
                ].filter(Boolean).join(' ').toLowerCase();
                return searchable.includes(q);
            })
            .sort((a, b) => {
                let cmp = 0;
                if (sortField === 'projectObject') cmp = a.projectObject.localeCompare(b.projectObject);
                else if (sortField === 'clientName') cmp = a.clientName.localeCompare(b.clientName);
                else if (sortField === 'status') cmp = a.status.localeCompare(b.status);
                else if (sortField === 'documentsCount') cmp = a.documentsCount - b.documentsCount;
                else if (sortField === 'updatedAt') cmp = (a.updatedAt ?? '').localeCompare(b.updatedAt ?? '');
                return sortDir === 'asc' ? cmp : -cmp;
            });
    }, [dossiers, query, workflowFilter, sortField, sortDir]);

    const hasActiveFilters = workflowFilter !== 'all' || query.trim() !== '';

    const metricCards = [
        { label: 'Total projects', value: metrics.total, detail: 'All registered dossiers', icon: <FolderKanban size={16} />, accent: undefined as string | undefined },
        { label: 'Active', value: metrics.active, detail: 'In current workflow', accent: metrics.active > 0 ? 'text-emerald-500' : 'text-[var(--text-muted)]' },
        { label: 'Opened', value: metrics.opened, detail: 'Newly started', accent: 'text-[var(--accent)]' },
        { label: 'Closed', value: metrics.closed, detail: 'Completed dossiers', accent: metrics.closed > 0 ? 'text-[var(--text-muted)]' : undefined },
    ];

    function toggleSort(field: SortField) {
        if (sortField === field) {
            setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortField(field);
            setSortDir('asc');
        }
    }

    function SortIcon({ field }: { field: SortField }) {
        if (sortField !== field) return <ChevronUp size={11} className="ml-1 opacity-30" />;
        return sortDir === 'asc'
            ? <ChevronUp size={11} className="ml-1" />
            : <ChevronDown size={11} className="ml-1" />;
    }

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
        if (!deleteTarget) return;
        router.delete(`/dossiers/${deleteTarget.id}`, {
            preserveScroll: true,
            onSuccess: () => { toast.success('Project deleted successfully.'); setDeleteTarget(null); },
            onError: () => toast.error('Project could not be deleted.'),
        });
    }

    function RowMenu({ dossier, isOpen, onToggle }: { dossier: DossierRow; isOpen: boolean; onToggle: () => void }) {
        const items = [
            { id: 'open', label: 'Open', icon: <Eye size={14} />, action: () => router.visit(`/dossiers/${dossier.id}`), danger: false },
            { id: 'edit', label: 'Edit', icon: <Pencil size={14} />, action: () => openEditDrawer(dossier), danger: false },
            { id: 'documents', label: 'Documents', icon: <FolderKanban size={14} />, action: () => router.visit(`/documents?search=${encodeURIComponent(dossier.dossierNumber)}`), danger: false },
            { id: 'finance', label: 'Finance', icon: <SlidersHorizontal size={14} />, action: () => router.visit(`/finance/documents?search=${encodeURIComponent(dossier.dossierNumber)}`), danger: false },
            { id: 'archive', label: 'Archive', icon: <Trash2 size={14} />, action: () => router.visit('/archives'), danger: false },
            { id: 'delete', label: 'Delete', icon: <Trash2 size={14} />, action: () => setDeleteTarget(dossier), danger: true },
        ];

        return (
            <div className="relative inline-flex" data-row-menu>
                <button type="button" onClick={(e) => { e.stopPropagation(); onToggle(); }}
                    className="flex size-8 items-center justify-center rounded-lg border border-transparent text-[var(--text-muted)] transition hover:border-[var(--border)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]"
                    aria-label="Actions">
                    <MoreHorizontal size={16} />
                </button>
                {isOpen ? (
                    <div className="absolute right-0 top-full z-50 mt-1 min-w-[170px] rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1.5 shadow-xl"
                        onClick={(e) => e.stopPropagation()}>
                        {items.map((item) => (
                            <button key={item.id} type="button" onClick={() => { item.action(); setOpenMenuId(null); }}
                                className={cn(
                                    'flex h-[34px] w-full items-center gap-2.5 rounded-lg px-2.5 text-left text-[13px] font-medium transition',
                                    item.danger
                                        ? 'text-[var(--danger)] hover:bg-[var(--danger)]/10'
                                        : 'text-[var(--foreground)] hover:bg-[var(--surface-2)]',
                                )}>
                                <span className="flex size-[15px] shrink-0 items-center justify-center">{item.icon}</span>
                                <span>{item.label}</span>
                            </button>
                        ))}
                    </div>
                ) : null}
            </div>
        );
    }

    return (
        <>
            <Head title={t('dossiers.title')} />

            <AppShell>
                {/* ── Page header ── */}
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
                            {t('dossiers.eyebrow')}
                        </p>
                        <h1 className="text-2xl font-bold tracking-[-0.02em] text-[var(--foreground)]">
                            {t('dossiers.title')}
                        </h1>
                        <p className="mt-1 max-w-2xl text-sm text-[var(--text-muted)]">
                            {t('dossiers.subtitle')}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="inline-flex rounded-lg border border-[var(--border)] bg-[var(--surface)] p-0.5">
                            <button type="button" onClick={() => setViewMode('workspace')}
                                className={`h-7 rounded-md px-2.5 text-[11px] font-semibold ${viewMode === 'workspace' ? 'bg-[var(--accent)] text-black' : 'text-[var(--text-muted)] hover:text-[var(--foreground)]'}`}>
                                Workspace
                            </button>
                            <button type="button" onClick={() => setViewMode('location')}
                                className={`h-7 rounded-md px-2.5 text-[11px] font-semibold ${viewMode === 'location' ? 'bg-[var(--accent)] text-black' : 'text-[var(--text-muted)] hover:text-[var(--foreground)]'}`}>
                                Location
                            </button>
                        </div>
                        <AppButton variant="solid" color="primary" onPress={openCreateDrawer}>
                            <Plus size={16} />
                            New project
                        </AppButton>
                    </div>
                </div>

                {viewMode === 'location' ? (
                    <DossierLocationExplorer groups={locationGroups} />
                ) : (
                    <>
                        {/* ── Metric cards ── */}
                        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                            {metricCards.map((card) => (
                                <div key={card.label}
                                    className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm transition hover:border-[var(--accent)]/40 hover:shadow-md">
                                    {card.icon ? (
                                        <div className={cn('mb-2 flex size-9 items-center justify-center rounded-lg bg-[var(--surface-2)]', card.accent || 'text-[var(--text-muted)]')}>
                                            {card.icon}
                                        </div>
                                    ) : null}
                                    <p className="text-[12px] font-medium text-[var(--text-muted)]">{card.label}</p>
                                    <p className={cn('mt-0.5 text-2xl font-semibold text-[var(--foreground)]', card.accent)}>{card.value}</p>
                                    {card.detail ? (
                                        <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">{card.detail}</p>
                                    ) : null}
                                </div>
                            ))}
                        </div>

                        {/* ── Table card ── */}
                        <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
                            {/* Toolbar */}
                            <div className="flex flex-wrap items-center gap-2 border-b border-[var(--border)] p-3">
                                <div className="relative flex-1 min-w-[200px] max-w-sm">
                                    <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                                    <input
                                        ref={searchRef}
                                        type="text"
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        placeholder="Search projects, clients, dossiers..."
                                        className="h-9 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] pl-9 pr-8 text-[13px] text-[var(--foreground)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--accent)_20%,transparent)]"
                                    />
                                    {query ? (
                                        <button type="button" onClick={() => setQuery('')}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 flex size-5 items-center justify-center rounded text-[var(--text-muted)] hover:text-[var(--foreground)]">
                                            <X size={13} />
                                        </button>
                                    ) : null}
                                </div>

                                <button type="button" onClick={() => setShowFilters((v) => !v)}
                                    className={cn(
                                        'inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-[12px] font-medium transition',
                                        showFilters || workflowFilter !== 'all'
                                            ? 'border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] text-[var(--accent)]'
                                            : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--foreground)]',
                                    )}>
                                    <SlidersHorizontal size={13} />
                                    Filter
                                </button>

                                <select
                                    value={`${sortField}:${sortDir}`}
                                    onChange={(e) => {
                                        const [f, d] = e.target.value.split(':') as [SortField, SortDir];
                                        setSortField(f);
                                        setSortDir(d);
                                    }}
                                    className="h-9 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 text-[12px] text-[var(--foreground)] outline-none hover:border-[var(--accent)] focus:border-[var(--accent)]"
                                >
                                    <option value="updatedAt:desc">Newest</option>
                                    <option value="updatedAt:asc">Oldest</option>
                                    <option value="projectObject:asc">Name A-Z</option>
                                    <option value="projectObject:desc">Name Z-A</option>
                                    <option value="status:asc">Status A-Z</option>
                                </select>

                                <button type="button" onClick={() => router.reload({ preserveScroll: true })}
                                    className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 text-[12px] font-medium text-[var(--text-muted)] transition hover:border-[var(--accent)] hover:text-[var(--foreground)]">
                                    <RefreshCw size={13} />
                                    Update
                                </button>

                                <div className="hidden sm:block">
                                    <AppButton variant="solid" color="primary" size="sm" onPress={openCreateDrawer}>
                                        <Plus size={14} />
                                        Add Project
                                    </AppButton>
                                </div>
                            </div>

                            {/* Filter chips */}
                            {showFilters ? (
                                <div className="border-b border-[var(--border)] px-3 py-3">
                                    <div className="flex flex-wrap gap-2">
                                        {workflowOptions.map((option) => (
                                            <button key={option.id} type="button" onClick={() => setWorkflowFilter(option.id)}
                                                className={cn(
                                                    'inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-[12px] font-medium transition',
                                                    workflowFilter === option.id
                                                        ? 'border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] text-[var(--accent)]'
                                                        : 'border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--foreground)]',
                                                )}>
                                                {option.label}
                                                <span className="rounded-full bg-[var(--surface-2)] px-1.5 py-0.5 text-[10px]">{option.count}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : null}

                            {/* Result count */}
                            {hasActiveFilters ? (
                                <div className="flex items-center gap-2 border-b border-[var(--border)] px-3 py-2">
                                    <p className="text-[12px] text-[var(--text-muted)]">
                                        {filteredDossiers.length} result(s)
                                    </p>
                                    <button type="button" onClick={() => { setQuery(''); setWorkflowFilter('all'); }}
                                        className="inline-flex items-center gap-1 text-[12px] font-medium text-[var(--accent)] hover:underline">
                                        <X size={12} />
                                        Reset filters
                                    </button>
                                </div>
                            ) : (
                                <div className="border-b border-[var(--border)] px-3 py-2">
                                    <p className="text-[12px] text-[var(--text-muted)]">
                                        {filteredDossiers.length} result(s)
                                    </p>
                                </div>
                            )}

                            {/* ── Desktop table ── */}
                            <div className="hidden md:block overflow-x-auto">
                                {filteredDossiers.length > 0 ? (
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-[var(--border)]">
                                                {[
                                                    { key: 'projectObject' as SortField, label: 'Project' },
                                                    { key: 'clientName' as SortField, label: 'Client' },
                                                    { key: null, label: 'Location' },
                                                    { key: null, label: 'Workflow' },
                                                    { key: null, label: 'Readiness' },
                                                    { key: 'status' as SortField, label: 'Status' },
                                                    { key: 'updatedAt' as SortField, label: 'Updated' },
                                                    { key: null, label: '' },
                                                ].map((col) => (
                                                    <th key={col.label || 'actions'}
                                                        className={cn(
                                                            'h-10 px-3 text-[12px] font-semibold text-[var(--text-muted)] text-left whitespace-nowrap',
                                                            col.key && 'cursor-pointer select-none hover:text-[var(--foreground)]',
                                                        )}
                                                        onClick={col.key ? () => toggleSort(col.key) : undefined}>
                                                        <span className="inline-flex items-center">
                                                            {col.label}
                                                            {col.key ? <SortIcon field={col.key} /> : null}
                                                        </span>
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredDossiers.map((dossier) => {
                                                const readiness = getDossierReadiness(dossier);
                                                const doneSteps = readiness.filter((i) => i.done).length;
                                                return (
                                                    <tr key={dossier.id}
                                                        className="border-b border-[var(--border)] transition last:border-0 hover:bg-[var(--surface-2)] group cursor-pointer"
                                                        onClick={() => setPreviewDossier(dossier)}>
                                                        <td className="px-3 py-2.5">
                                                            <div className="flex items-center gap-2.5">
                                                                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-2)] text-[var(--text-muted)]">
                                                                    <FolderKanban size={15} />
                                                                </span>
                                                                <div className="min-w-0">
                                                                    <p className="truncate text-[13px] font-semibold text-[var(--foreground)]">
                                                                        {dossier.projectObject}
                                                                    </p>
                                                                    <p className="truncate text-[11px] text-[var(--text-muted)]">
                                                                        {dossier.dossierNumber}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-3 py-2.5">
                                                            <div className="min-w-0">
                                                                <p className="truncate text-[13px] font-medium text-[var(--foreground)]">{dossier.clientName}</p>
                                                                <p className="truncate text-[11px] text-[var(--text-muted)]">{dossier.clientNumber}</p>
                                                            </div>
                                                        </td>
                                                        <td className="px-3 py-2.5">
                                                            <div className="flex items-center gap-1.5">
                                                                <MapPin size={12} className="shrink-0 text-[var(--text-muted)]" />
                                                                <div className="min-w-0">
                                                                    <p className="truncate text-[12px] text-[var(--foreground)]">{dossier.province || '-'}</p>
                                                                    <p className="truncate text-[10px] text-[var(--text-muted)]">{dossier.commune || '-'}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-3 py-2.5">
                                                            <StatusPill label={getDossierWorkflowLabel(dossier.workflowStep)} color="primary" size="sm" />
                                                        </td>
                                                        <td className="px-3 py-2.5">
                                                            <div className="min-w-0 max-w-[100px]">
                                                                <div className="flex items-center gap-1.5">
                                                                    <div className="h-1.5 flex-1 rounded-full bg-[var(--surface-3)]">
                                                                        <div className="h-full rounded-full bg-[var(--accent)]"
                                                                            style={{ width: `${(doneSteps / 6) * 100}%` }} />
                                                                    </div>
                                                                    <span className="text-[10px] font-medium text-[var(--text-muted)]">{doneSteps}/6</span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-3 py-2.5">
                                                            <StatusPill
                                                                label={dossier.status}
                                                                color={statusColor(dossier.status)}
                                                                size="sm"
                                                            />
                                                        </td>
                                                        <td className="px-3 py-2.5 text-[12px] text-[var(--text-muted)] whitespace-nowrap">
                                                            {dossier.updatedAt || '-'}
                                                        </td>
                                                        <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                                                            <RowMenu dossier={dossier} isOpen={openMenuId === dossier.id}
                                                                onToggle={() => setOpenMenuId(openMenuId === dossier.id ? null : dossier.id)} />
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="p-6">
                                        <AppEmptyState
                                            title="No projects found"
                                            description="Create your first project to start tracking."
                                        />
                                    </div>
                                )}
                            </div>

                            {/* ── Mobile cards ── */}
                            <div className="block md:hidden divide-y divide-[var(--border)]">
                                {filteredDossiers.length > 0 ? filteredDossiers.map((dossier) => (
                                    <div key={dossier.id}
                                        className="flex items-start gap-3 p-3 transition hover:bg-[var(--surface-2)]"
                                        onClick={() => setPreviewDossier(dossier)}>
                                        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-2)] text-[var(--text-muted)]">
                                            <FolderKanban size={16} />
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <p className="truncate text-[13px] font-semibold text-[var(--foreground)]">{dossier.projectObject}</p>
                                                <StatusPill label={dossier.status} color={statusColor(dossier.status)} size="sm" />
                                            </div>
                                            <p className="mt-0.5 text-[12px] text-[var(--text-muted)]">
                                                {dossier.clientName} · {dossier.dossierNumber}
                                            </p>
                                            <div className="mt-1 flex items-center gap-3 text-[11px] text-[var(--text-muted)]">
                                                <span>{getDossierWorkflowLabel(dossier.workflowStep)}</span>
                                                <span>{dossier.updatedAt || '-'}</span>
                                            </div>
                                        </div>
                                        <div onClick={(e) => e.stopPropagation()}>
                                            <RowMenu dossier={dossier} isOpen={openMenuId === dossier.id}
                                                onToggle={() => setOpenMenuId(openMenuId === dossier.id ? null : dossier.id)} />
                                        </div>
                                    </div>
                                )) : (
                                    <div className="p-6">
                                        <AppEmptyState
                                            title="No projects found"
                                            description="Create your first project to start tracking."
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ── Preview drawer ── */}
                        <AppDrawer
                            isOpen={!!previewDossier}
                            onOpenChange={(open) => { if (!open) setPreviewDossier(null); }}
                            title={previewDossier?.projectObject || ''}
                            classNames={{ base: 'max-w-[480px]' }}
                        >
                            {previewDossier ? (
                                <PreviewContent dossier={previewDossier} onEdit={openEditDrawer}
                                    onDelete={() => { setDeleteTarget(previewDossier); setPreviewDossier(null); }} />
                            ) : null}
                        </AppDrawer>

                        {/* ── Create/Edit drawer ── */}
                        <ProjectDrawer
                            isOpen={drawerOpen}
                            mode={drawerMode}
                            dossier={selectedDossier}
                            clients={clients}
                            onOpenChange={setDrawerOpen}
                            onSubmit={handleSubmit}
                            errors={formErrors}
                        />

                        {/* ── Delete confirmation modal ── */}
                        <AppModal
                            isOpen={!!deleteTarget}
                            onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
                            title="Delete project?"
                            size="sm"
                        >
                            <p className="mb-5 text-sm text-[var(--text-muted)]">
                                Are you sure you want to delete <strong>{deleteTarget?.dossierNumber}</strong>?
                                This action cannot be undone.
                            </p>
                            <div className="flex justify-end gap-2">
                                <AppButton variant="bordered" onPress={() => setDeleteTarget(null)}>Cancel</AppButton>
                                <AppButton color="danger" variant="solid" onPress={confirmDelete}>Delete</AppButton>
                            </div>
                        </AppModal>
                    </>
                )}
            </AppShell>
        </>
    );
}

function PreviewContent({ dossier, onEdit, onDelete }: { dossier: DossierRow; onEdit: (d: DossierRow) => void; onDelete: (d: DossierRow) => void }) {
    const readiness = getDossierReadiness(dossier);
    const doneSteps = readiness.filter((i) => i.done).length;

    return (
        <div className="space-y-5">
            <div className="flex items-center gap-2.5">
                <StatusPill label={dossier.status} color={statusColor(dossier.status)} size="sm" />
                <span className="text-[11px] text-[var(--text-muted)]">{dossier.dossierNumber}</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-3">
                    <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--text-subtle)]">Client</p>
                    <p className="mt-1 truncate text-[13px] font-semibold text-[var(--foreground)]">{dossier.clientName}</p>
                    <p className="truncate text-[11px] text-[var(--text-muted)]">{dossier.clientNumber}</p>
                </div>
                <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-3">
                    <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--text-subtle)]">Step</p>
                    <p className="mt-1 truncate text-[13px] font-semibold text-[var(--accent)]">{getDossierWorkflowLabel(dossier.workflowStep)}</p>
                    <p className="truncate text-[11px] text-[var(--text-muted)]">Current workflow</p>
                </div>
                <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-3">
                    <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--text-subtle)]">Location</p>
                    <p className="mt-1 truncate text-[13px] font-semibold text-[var(--foreground)]">{dossier.province || '-'}</p>
                    <p className="truncate text-[11px] text-[var(--text-muted)]">{dossier.commune || '-'}</p>
                </div>
                <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-3">
                    <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--text-subtle)]">Surface</p>
                    <p className="mt-1 truncate text-[13px] font-semibold text-[var(--foreground)]">{dossier.floorArea ? `${formatNumber(dossier.floorArea)} m2` : '-'}</p>
                    <p className="truncate text-[11px] text-[var(--text-muted)]">Floor area</p>
                </div>
            </div>

            <div>
                <div className="mb-2 flex items-center justify-between">
                    <p className="text-[12px] font-semibold text-[var(--foreground)]">Readiness</p>
                    <span className="text-[11px] text-[var(--text-muted)]">{doneSteps}/6</span>
                </div>
                <div className="h-1.5 rounded-full bg-[var(--surface-3)]">
                    <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${(doneSteps / 6) * 100}%` }} />
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                    {readiness.map((item) => (
                        <span key={item.key}
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                item.done
                                    ? 'bg-emerald-500/10 text-emerald-500'
                                    : 'bg-[var(--surface-3)] text-[var(--text-muted)]'
                            }`}>
                            {item.label}
                        </span>
                    ))}
                </div>
            </div>

            <AppButton variant="solid" color="primary" className="w-full" onPress={() => router.visit(`/dossiers/${dossier.id}`)}>
                <Eye size={15} />
                Open full project
            </AppButton>

            <div className="flex gap-2">
                <AppButton variant="bordered" size="sm" className="flex-1" onPress={() => onEdit(dossier)}>
                    <Pencil size={14} /> Edit
                </AppButton>
                <AppButton variant="bordered" size="sm" className="flex-1" onPress={() => router.visit('/archives')}>
                    <Trash2 size={14} /> Archive
                </AppButton>
                <AppButton color="danger" variant="solid" size="sm" className="flex-1" onPress={() => onDelete(dossier)}>
                    <Trash2 size={14} /> Delete
                </AppButton>
            </div>
        </div>
    );
}

function statusColor(status: string) {
    if (status === 'active') return 'success';
    if (status === 'opened') return 'primary';
    if (status === 'closed') return 'default';
    if (status === 'archived' || status === 'paused') return 'warning';
    return 'default';
}
