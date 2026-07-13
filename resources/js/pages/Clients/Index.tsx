import { Head, router } from '@inertiajs/react';
import {
    ChevronDown, ChevronUp, Eye, MoreHorizontal, Pencil, Plus,
    RefreshCw, Search, SlidersHorizontal, Trash2, Users, X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { AppShell } from '@/components/layout/AppShell';
import { AppButton } from '@/components/ui/AppButton';
import { AppEmptyState } from '@/components/ui/AppEmptyState';
import { AppModal } from '@/components/ui/AppModal';
import { StatusPill } from '@/components/ui/StatusPill';
import { cn } from '@/lib/cn';
import { useTranslation } from '@/lib/i18n';
import type { ClientFormPayload, ClientRow, ClientStatus, IntermediaryOption } from '@/features/clients/types';
import { ClientDrawer } from '@/features/clients/drawers/ClientDrawer';
import type { FormErrors } from '@/lib/formErrors';

type PageProps = {
    clients: ClientRow[];
    intermediaries: IntermediaryOption[];
    metrics: { total: number; active: number; inactive: number; archived: number };
};

function toBackendPayload(payload: ClientFormPayload, status: ClientStatus = 'active') {
    return {
        intermediary_id: payload.intermediaryId || null,
        civility: payload.civility || null,
        first_name: payload.firstName || null,
        last_name: payload.lastName || null,
        cin: payload.cin || null,
        phone: payload.phone || null,
        email: payload.email || null,
        address: payload.address || null,
        father_name: payload.fatherName || null,
        mother_name: payload.motherName || null,
        cni_expiration_date: payload.cniExpirationDate || null,
        status,
        notes: payload.notes || null,
    };
}

const AVATAR_COLORS = [
    'bg-blue-500/15 text-blue-600 dark:text-blue-400',
    'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
    'bg-violet-500/15 text-violet-600 dark:text-violet-400',
    'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    'bg-rose-500/15 text-rose-600 dark:text-rose-400',
    'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400',
];

function avatarColor(id: number) {
    return AVATAR_COLORS[id % AVATAR_COLORS.length];
}

function initials(client: ClientRow) {
    const first = client.firstName?.charAt(0) ?? '';
    const last = client.lastName?.charAt(0) ?? '';
    return (first + last).trim() || client.fullName.slice(0, 2).toUpperCase();
}

function formatContact(value: string | null | undefined) {
    return value && value.trim() !== '' ? value : '-';
}

type SortField = 'fullName' | 'cin' | 'projectsCount' | 'status' | 'updatedAt';
type SortDir = 'asc' | 'desc';

export default function ClientsIndex({ clients, intermediaries, metrics }: PageProps) {
    const { t } = useTranslation();

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [drawerMode, setDrawerMode] = useState<'create' | 'edit'>('create');
    const [selectedClient, setSelectedClient] = useState<ClientRow | null>(null);
    const [formErrors, setFormErrors] = useState<FormErrors>({});
    const [query, setQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | ClientStatus>('all');
    const [sortField, setSortField] = useState<SortField>('updatedAt');
    const [sortDir, setSortDir] = useState<SortDir>('desc');
    const [deleteTarget, setDeleteTarget] = useState<ClientRow | null>(null);
    const [showFilters, setShowFilters] = useState(false);
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
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

    const statusOptions = [
        { id: 'all' as const, label: t('clients.status.all'), count: clients.length },
        { id: 'active' as const, label: t('clients.status.active'), count: metrics.active },
        { id: 'inactive' as const, label: t('clients.status.inactive'), count: metrics.inactive },
        { id: 'archived' as const, label: t('clients.status.archived'), count: metrics.archived },
    ];

    const filteredClients = useMemo(() => {
        const q = query.trim().toLowerCase();
        return clients
            .filter((client) => {
                if (statusFilter !== 'all' && client.status !== statusFilter) return false;
                if (!q) return true;
                const searchable = [
                    client.fullName, client.clientNumber, client.cin, client.phone,
                    client.email, client.intermediaryName, client.address,
                ].filter(Boolean).join(' ').toLowerCase();
                return searchable.includes(q);
            })
            .sort((a, b) => {
                let cmp = 0;
                if (sortField === 'fullName') cmp = a.fullName.localeCompare(b.fullName);
                else if (sortField === 'cin') cmp = (a.cin ?? '').localeCompare(b.cin ?? '');
                else if (sortField === 'projectsCount') cmp = a.projectsCount - b.projectsCount;
                else if (sortField === 'status') cmp = a.status.localeCompare(b.status);
                else if (sortField === 'updatedAt') cmp = (a.updatedAt ?? '').localeCompare(b.updatedAt ?? '');
                return sortDir === 'asc' ? cmp : -cmp;
            });
    }, [clients, query, statusFilter, sortField, sortDir]);

    const hasActiveFilters = statusFilter !== 'all' || query.trim() !== '';

    const metricCards = [
        { label: t('clients.metrics.total'), value: metrics.total, detail: 'Registered client records', icon: <Users size={16} /> },
        { label: t('clients.metrics.active'), value: metrics.active, detail: 'Can start new projects' },
        { label: t('clients.metrics.inactive'), value: metrics.inactive, detail: 'Needs review' },
        { label: t('clients.metrics.archived'), value: metrics.archived, detail: 'Closed relationships' },
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
        setSelectedClient(null);
        setDrawerMode('create');
        setFormErrors({});
        setDrawerOpen(true);
    }

    function openEditDrawer(client: ClientRow) {
        setSelectedClient(client);
        setDrawerMode('edit');
        setFormErrors({});
        setDrawerOpen(true);
    }

    function handleSubmit(payload: ClientFormPayload) {
        if (drawerMode === 'edit' && selectedClient) {
            router.put(`/clients/${selectedClient.id}`, toBackendPayload(payload, selectedClient.status), {
                preserveScroll: true,
                onSuccess: () => { setDrawerOpen(false); setFormErrors({}); toast.success(t('clients.updated')); },
                onError: (errors) => { setFormErrors(errors as FormErrors); toast.error(t('clients.formError')); },
            });
            return;
        }
        router.post('/clients', toBackendPayload(payload), {
            preserveScroll: true,
            onSuccess: () => { setDrawerOpen(false); setFormErrors({}); toast.success(t('clients.created')); },
            onError: (errors) => { setFormErrors(errors as FormErrors); toast.error(t('clients.formError')); },
        });
    }

    function confirmDelete() {
        if (!deleteTarget) return;
        router.delete(`/clients/${deleteTarget.id}`, {
            preserveScroll: true,
            onSuccess: () => { toast.success(t('clients.deleted')); setDeleteTarget(null); },
            onError: () => toast.error(t('clients.deleteError')),
        });
    }

    function RowMenu({ client, isOpen, onToggle }: { client: ClientRow; isOpen: boolean; onToggle: () => void }) {
        const items = [
            { id: 'view', label: t('clients.view'), icon: <Eye size={14} />, action: () => router.visit(`/clients/${client.id}`), danger: false },
            { id: 'edit', label: t('clients.edit'), icon: <Pencil size={14} />, action: () => openEditDrawer(client), danger: false },
            { id: 'delete', label: t('clients.delete'), icon: <Trash2 size={14} />, action: () => setDeleteTarget(client), danger: true },
        ];

        return (
            <div className="relative inline-flex" data-row-menu>
                <button type="button" onClick={(e) => { e.stopPropagation(); onToggle(); }}
                    className="flex size-8 items-center justify-center rounded-lg border border-transparent text-[var(--text-muted)] transition hover:border-[var(--border)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]"
                    aria-label={t('clients.actions')}>
                    <MoreHorizontal size={16} />
                </button>
                {isOpen ? (
                    <div className="absolute right-0 top-full z-50 mt-1 min-w-[160px] rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1.5 shadow-xl"
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
            <Head title={t('clients.title')} />

            <AppShell>
                {/* ── Page header ── */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
                            {t('clients.eyebrow')}
                        </p>
                        <h1 className="text-2xl font-bold tracking-[-0.02em] text-[var(--foreground)]">
                            {t('clients.title')}
                        </h1>
                        <p className="mt-1 max-w-2xl text-sm text-[var(--text-muted)]">
                            {t('clients.subtitle')}
                        </p>
                    </div>
                    <AppButton variant="solid" color="primary" onPress={openCreateDrawer}>
                        <Plus size={16} />
                        {t('clients.newClient')}
                    </AppButton>
                </div>

                {/* ── Metric cards ── */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {metricCards.map((card) => (
                        <div key={card.label}
                            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
                            <div className="flex items-start justify-between gap-3">
                                {card.icon ? (
                                    <div className="flex size-9 items-center justify-center rounded-lg bg-[var(--surface-2)] text-[var(--text-muted)]">
                                        {card.icon}
                                    </div>
                                ) : <div />}
                            </div>
                            <p className="mt-3 text-[12px] font-medium text-[var(--text-muted)]">{card.label}</p>
                            <p className="mt-0.5 text-2xl font-semibold text-[var(--foreground)]">{card.value}</p>
                            {card.detail ? (
                                <p className="mt-1 text-[11px] text-[var(--text-muted)]">{card.detail}</p>
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
                                placeholder={t('clients.searchPlaceholder')}
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
                                showFilters || statusFilter !== 'all'
                                    ? 'border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] text-[var(--accent)]'
                                    : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--foreground)]',
                            )}>
                            <SlidersHorizontal size={13} />
                            {t('clients.filter')}
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
                            <option value="updatedAt:desc">{t('clients.sort.newest')}</option>
                            <option value="updatedAt:asc">{t('clients.sort.oldest')}</option>
                            <option value="fullName:asc">{t('clients.sort.nameAZ')}</option>
                            <option value="fullName:desc">{t('clients.sort.nameZA')}</option>
                            <option value="projectsCount:desc">{t('clients.sort.mostProjects')}</option>
                            <option value="projectsCount:asc">{t('clients.sort.leastProjects')}</option>
                            <option value="status:asc">{t('clients.sort.statusAZ')}</option>
                        </select>

                        <button type="button" onClick={() => router.reload({ preserveScroll: true })}
                            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 text-[12px] font-medium text-[var(--text-muted)] transition hover:border-[var(--accent)] hover:text-[var(--foreground)]">
                            <RefreshCw size={13} />
                            {t('clients.update')}
                        </button>

                        <div className="hidden sm:block">
                            <AppButton variant="solid" color="primary" size="sm" onPress={openCreateDrawer}>
                                <Plus size={14} />
                                {t('clients.addClient')}
                            </AppButton>
                        </div>
                    </div>

                    {/* Filter chips */}
                    {showFilters ? (
                        <div className="border-b border-[var(--border)] px-3 py-3">
                            <div className="flex flex-wrap gap-2">
                                {statusOptions.map((option) => (
                                    <button key={option.id} type="button" onClick={() => setStatusFilter(option.id)}
                                        className={cn(
                                            'inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-[12px] font-medium transition',
                                            statusFilter === option.id
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
                                {filteredClients.length} {t('clients.resultCount')}
                            </p>
                            <button type="button" onClick={() => { setQuery(''); setStatusFilter('all'); }}
                                className="inline-flex items-center gap-1 text-[12px] font-medium text-[var(--accent)] hover:underline">
                                <X size={12} />
                                {t('clients.resetFilters')}
                            </button>
                        </div>
                    ) : (
                        <div className="border-b border-[var(--border)] px-3 py-2">
                            <p className="text-[12px] text-[var(--text-muted)]">
                                {filteredClients.length} {t('clients.resultCount')}
                            </p>
                        </div>
                    )}

                    {/* ── Desktop table ── */}
                    <div className="hidden md:block overflow-x-auto">
                        {filteredClients.length > 0 ? (
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-[var(--border)]">
                                        {[
                                            { key: 'fullName' as SortField, label: t('clients.table.client') },
                                            { key: 'cin' as SortField, label: t('clients.table.cin') },
                                            { key: null, label: t('clients.table.contact') },
                                            { key: null, label: t('clients.table.intermediary') },
                                            { key: 'projectsCount' as SortField, label: t('clients.table.projects') },
                                            { key: 'status' as SortField, label: t('clients.table.status') },
                                            { key: 'updatedAt' as SortField, label: t('clients.table.updated') },
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
                                    {filteredClients.map((client) => (
                                        <tr key={client.id}
                                            className="border-b border-[var(--border)] transition last:border-0 hover:bg-[var(--surface-2)] group cursor-pointer"
                                            onClick={() => router.visit(`/clients/${client.id}`)}>
                                            <td className="px-3 py-2.5">
                                                <div className="flex items-center gap-2.5">
                                                    <span className={cn(
                                                        'flex size-8 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold',
                                                        avatarColor(client.id),
                                                    )}>
                                                        {initials(client)}
                                                    </span>
                                                    <div className="min-w-0">
                                                        <p className="truncate text-[13px] font-semibold text-[var(--foreground)]">
                                                            {client.fullName}
                                                        </p>
                                                        <p className="truncate text-[11px] text-[var(--text-muted)]">
                                                            {client.clientNumber}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-3 py-2.5 text-[13px] text-[var(--text-muted)]">
                                                {client.cin || '-'}
                                            </td>
                                            <td className="px-3 py-2.5">
                                                <div className="grid gap-0.5">
                                                    <span className="text-[13px] text-[var(--foreground)]">{formatContact(client.phone)}</span>
                                                    <span className="truncate text-[11px] text-[var(--text-muted)]">{formatContact(client.email)}</span>
                                                </div>
                                            </td>
                                            <td className="px-3 py-2.5 text-[13px] text-[var(--text-muted)]">
                                                {client.intermediaryName && client.intermediaryName !== 'None' ? client.intermediaryName : '-'}
                                            </td>
                                            <td className="px-3 py-2.5">
                                                <span className="inline-flex items-center justify-center rounded-md bg-[var(--surface-2)] px-2 py-0.5 text-[12px] font-medium text-[var(--foreground)]">
                                                    {client.projectsCount}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2.5">
                                                <StatusPill
                                                    label={t(`clients.status.${client.status}`, client.status)}
                                                    color={client.status === 'active' ? 'success' : client.status === 'inactive' ? 'warning' : 'default'}
                                                    size="sm"
                                                />
                                            </td>
                                            <td className="px-3 py-2.5 text-[12px] text-[var(--text-muted)] whitespace-nowrap">
                                                {client.updatedAt || '-'}
                                            </td>
                                            <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                                                <RowMenu client={client} isOpen={openMenuId === client.id}
                                                    onToggle={() => setOpenMenuId(openMenuId === client.id ? null : client.id)} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="p-6">
                                <AppEmptyState
                                    title={t('clients.emptyTitle')}
                                    description={t('clients.emptyDescription')}
                                />
                            </div>
                        )}
                    </div>

                    {/* ── Mobile cards ── */}
                    <div className="block md:hidden divide-y divide-[var(--border)]">
                        {filteredClients.length > 0 ? filteredClients.map((client) => (
                            <div key={client.id}
                                className="flex items-start gap-3 p-3 transition hover:bg-[var(--surface-2)]"
                                onClick={() => router.visit(`/clients/${client.id}`)}>
                                <span className={cn(
                                    'flex size-9 shrink-0 items-center justify-center rounded-lg text-[12px] font-bold',
                                    avatarColor(client.id),
                                )}>
                                    {initials(client)}
                                </span>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                        <p className="truncate text-[13px] font-semibold text-[var(--foreground)]">{client.fullName}</p>
                                        <StatusPill
                                            label={t(`clients.status.${client.status}`, client.status)}
                                            color={client.status === 'active' ? 'success' : client.status === 'inactive' ? 'warning' : 'default'}
                                            size="sm"
                                        />
                                    </div>
                                    <p className="mt-0.5 text-[12px] text-[var(--text-muted)]">
                                        {client.cin ? `${client.cin} · ` : ''}{client.phone || client.email || '-'}
                                    </p>
                                    <div className="mt-1 flex items-center gap-3 text-[11px] text-[var(--text-muted)]">
                                        <span>{client.projectsCount} project(s)</span>
                                        <span>{client.updatedAt || '-'}</span>
                                    </div>
                                </div>
                                <div onClick={(e) => e.stopPropagation()}>
                                    <RowMenu client={client} isOpen={openMenuId === client.id}
                                        onToggle={() => setOpenMenuId(openMenuId === client.id ? null : client.id)} />
                                </div>
                            </div>
                        )) : (
                            <div className="p-6">
                                <AppEmptyState
                                    title={t('clients.emptyTitle')}
                                    description={t('clients.emptyDescription')}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Create/Edit drawer ── */}
                <ClientDrawer
                    isOpen={drawerOpen}
                    mode={drawerMode}
                    client={drawerMode === 'edit' ? selectedClient : null}
                    intermediaries={intermediaries}
                    onOpenChange={setDrawerOpen}
                    onSubmit={handleSubmit}
                    errors={formErrors}
                />

                {/* ── Delete confirmation modal ── */}
                <AppModal
                    isOpen={!!deleteTarget}
                    onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
                    title={t('clients.deleteTitle')}
                >
                    <p className="mb-5 text-sm text-[var(--text-muted)]">
                        {t('clients.deleteConfirm')} <strong>{deleteTarget?.fullName}</strong>?
                        {t('clients.deleteWarning')}
                    </p>
                    {deleteTarget && deleteTarget.projectsCount > 0 ? (
                        <div className="mb-4 rounded-lg border border-[var(--danger)]/30 bg-[var(--danger)]/5 px-3 py-2 text-[12px] text-[var(--danger)]">
                            {t('clients.deleteHasProjects', 'This client has {count} linked project(s). Deleting will remove them all.', { count: String(deleteTarget.projectsCount) })}
                        </div>
                    ) : null}
                    <div className="flex justify-end gap-2">
                        <AppButton variant="bordered" onPress={() => setDeleteTarget(null)}>
                            {t('clients.cancel')}
                        </AppButton>
                        <AppButton color="danger" variant="solid" onPress={confirmDelete}>
                            {t('clients.delete')}
                        </AppButton>
                    </div>
                </AppModal>
            </AppShell>
        </>
    );
}
