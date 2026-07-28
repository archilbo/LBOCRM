import { Head, router } from '@inertiajs/react';
import {
    Building2, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, ChevronsUpDown, ChevronUp,
    ContactRound, Eye, ListFilter, MoreHorizontal, Pencil, Phone, Plus, RefreshCw, Search,
    Trash2, UserCheck, UserRoundCheck, UserRoundX, Users, X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Dropdown, Input } from '@heroui/react';
import { toast } from 'sonner';
import { AppShell } from '@/components/layout/AppShell';
import { AppButton } from '@/components/ui/AppButton';
import { AppEmptyState } from '@/components/ui/AppEmptyState';
import { AppKpiCard } from '@/components/ui/AppKpiCard';
import { AppModal } from '@/components/ui/AppModal';
import { AppWorkspaceTable, type AppWorkspaceTableColumn } from '@/components/ui/AppWorkspaceTable';
import { StatusPill } from '@/components/ui/StatusPill';
import { IntermediaryDrawer } from '@/features/intermediaries/drawers/IntermediaryDrawer';
import type { IntermediaryFormPayload, IntermediaryRow } from '@/features/intermediaries/types';
import { cn } from '@/lib/cn';
import type { FormErrors } from '@/lib/formErrors';
import { useTranslation } from '@/lib/i18n';

type PageProps = {
    intermediaries: IntermediaryRow[];
    metrics: {
        total: number;
        active: number;
        inactive: number;
        linkedClients: number;
        clientsThisMonth: number;
    };
};

type SortField = 'name' | 'type' | 'clientsCount' | 'isActive' | 'updatedAt';
type SortDir = 'asc' | 'desc';

const AVATAR_COLORS = [
    'bg-blue-500/15 text-blue-600 dark:text-blue-400',
    'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
    'bg-violet-500/15 text-violet-600 dark:text-violet-400',
    'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    'bg-rose-500/15 text-rose-600 dark:text-rose-400',
    'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400',
];

const INTERMEDIARY_KPI_TONES = {
    total: { icon: <Users size={16} className="text-sky-400" />, accentColor: '#38bdf8', valueClassName: 'text-sky-300' },
    active: { icon: <UserCheck size={16} className="text-emerald-400" />, accentColor: '#34d399', valueClassName: 'text-emerald-300' },
    inactive: { icon: <UserRoundX size={16} className="text-amber-400" />, accentColor: '#fbbf24', valueClassName: 'text-amber-300' },
    linkedClients: { icon: <UserRoundCheck size={16} className="text-violet-400" />, accentColor: '#a78bfa', valueClassName: 'text-violet-300' },
} as const;

function avatarColor(id: number) {
    return AVATAR_COLORS[id % AVATAR_COLORS.length];
}

function formatContact(value: string | null | undefined) {
    return value && value.trim() !== '' ? value : '-';
}

function toBackendPayload(payload: IntermediaryFormPayload) {
    return {
        name: payload.name,
        type: payload.type || 'person',
        phone: payload.phone || null,
        email: payload.email || null,
        notes: payload.notes || null,
        is_active: payload.isActive,
    };
}

export default function IntermediariesIndex({ intermediaries, metrics }: PageProps) {
    const { t } = useTranslation();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [drawerMode, setDrawerMode] = useState<'create' | 'edit'>('create');
    const [editTarget, setEditTarget] = useState<IntermediaryRow | null>(null);
    const [formErrors, setFormErrors] = useState<FormErrors>({});
    const [deleteTarget, setDeleteTarget] = useState<IntermediaryRow | null>(null);
    const [query, setQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
    const [sortField, setSortField] = useState<SortField>('updatedAt');
    const [sortDir, setSortDir] = useState<SortDir>('desc');
    const [page, setPage] = useState(0);

    const statusOptions = [
        { id: 'all' as const, label: t('intermediaries.statuses.all'), count: intermediaries.length },
        { id: 'active' as const, label: t('intermediaries.statuses.active'), count: metrics.active },
        { id: 'inactive' as const, label: t('intermediaries.statuses.inactive'), count: metrics.inactive },
    ];

    const filteredIntermediaries = useMemo(() => {
        const search = query.trim().toLowerCase();

        return intermediaries
            .filter((item) => {
                if (statusFilter === 'active' && !item.isActive) return false;
                if (statusFilter === 'inactive' && item.isActive) return false;
                if (!search) return true;

                return [item.name, item.code, item.phone, item.email, item.type]
                    .filter(Boolean)
                    .join(' ')
                    .toLowerCase()
                    .includes(search);
            })
            .sort((left, right) => {
                let comparison = 0;

                if (sortField === 'name') comparison = left.name.localeCompare(right.name);
                else if (sortField === 'type') comparison = left.type.localeCompare(right.type);
                else if (sortField === 'clientsCount') comparison = left.clientsCount - right.clientsCount;
                else if (sortField === 'isActive') comparison = Number(left.isActive) - Number(right.isActive);
                else comparison = (left.updatedAt ?? '').localeCompare(right.updatedAt ?? '');

                return sortDir === 'asc' ? comparison : -comparison;
            });
    }, [intermediaries, query, sortDir, sortField, statusFilter]);

    const pageSize = 10;
    const pageCount = Math.max(1, Math.ceil(filteredIntermediaries.length / pageSize));
    const pageIntermediaries = filteredIntermediaries.slice(page * pageSize, (page + 1) * pageSize);

    useEffect(() => {
        setPage((currentPage) => Math.min(currentPage, pageCount - 1));
    }, [pageCount]);

    function toggleSort(field: SortField) {
        if (sortField === field) {
            setSortDir((current) => (current === 'asc' ? 'desc' : 'asc'));
            return;
        }

        setSortField(field);
        setSortDir('asc');
    }

    function typeLabel(type: string) {
        const typeKey = ['person', 'agency', 'architect_partner', 'business_referral'].includes(type) ? type : 'other';
        return t(`intermediaries.types.${typeKey}`);
    }

    function SortIcon({ field }: { field: SortField }) {
        if (sortField !== field) return <ChevronsUpDown size={11} className="text-[var(--text-muted)]" />;

        return sortDir === 'asc'
            ? <ChevronUp size={11} className="text-[var(--accent)]" />
            : <ChevronDown size={11} className="text-[var(--accent)]" />;
    }

    function ColumnHeader({ label, icon: Icon, field }: { label: string; icon: LucideIcon; field?: SortField }) {
        const content = <><Icon size={13} strokeWidth={1.9} /><span>{label}</span>{field ? <SortIcon field={field} /> : null}</>;

        if (!field) return <span className="inline-flex items-center gap-1.5">{content}</span>;

        return (
            <button type="button" onClick={() => toggleSort(field)} className="inline-flex items-center gap-1.5 text-left transition hover:text-[var(--foreground)]">
                {content}
            </button>
        );
    }

    function openCreateDrawer() {
        setEditTarget(null);
        setDrawerMode('create');
        setFormErrors({});
        setDrawerOpen(true);
    }

    function openEditDrawer(intermediary: IntermediaryRow) {
        setEditTarget(intermediary);
        setDrawerMode('edit');
        setFormErrors({});
        setDrawerOpen(true);
    }

    function handleSubmit(payload: IntermediaryFormPayload) {
        if (drawerMode === 'edit' && editTarget) {
            router.put(`/intermediaries/${editTarget.id}`, toBackendPayload(payload), {
                preserveScroll: true,
                onSuccess: () => { setDrawerOpen(false); toast.success(t('intermediaries.updateSuccess')); },
                onError: (errors) => { setFormErrors(errors as FormErrors); toast.error(t('intermediaries.formError')); },
            });
            return;
        }

        router.post('/intermediaries', toBackendPayload(payload), {
            preserveScroll: true,
            onSuccess: () => { setDrawerOpen(false); toast.success(t('intermediaries.createSuccess')); },
            onError: (errors) => { setFormErrors(errors as FormErrors); toast.error(t('intermediaries.formError')); },
        });
    }

    function confirmDelete() {
        if (!deleteTarget) return;

        router.delete(`/intermediaries/${deleteTarget.id}`, {
            preserveScroll: true,
            onSuccess: () => { toast.success(t('intermediaries.deleteSuccess')); setDeleteTarget(null); },
            onError: () => toast.error(t('intermediaries.deleteError')),
        });
    }

    function RowMenu({ item }: { item: IntermediaryRow }) {
        const items = [{ id: 'delete', label: t('intermediaries.deleteIntermediary'), icon: <Trash2 size={14} />, action: () => setDeleteTarget(item) }];

        return (
            <div className="flex items-center gap-0.5">
                <AppButton isIconOnly compact variant="quiet" size="sm" tooltip={t('intermediaries.viewIntermediary')} aria-label={t('intermediaries.viewIntermediary')} onPress={() => router.visit(`/intermediaries/${item.id}`)} className="size-7 text-[var(--text-muted)]"><Eye size={13} /></AppButton>
                <AppButton isIconOnly compact variant="quiet" size="sm" tooltip={t('intermediaries.editIntermediary')} aria-label={t('intermediaries.editIntermediary')} onPress={() => openEditDrawer(item)} className="size-7 text-[var(--text-muted)]"><Pencil size={13} /></AppButton>
                <Dropdown>
                    <Dropdown.Trigger className="flex size-7 items-center justify-center rounded text-[var(--text-muted)] transition hover:bg-[var(--surface-2)] data-[open]:text-[var(--accent)]" aria-label={t('intermediaries.actions')}><MoreHorizontal size={13} /></Dropdown.Trigger>
                    <Dropdown.Popover placement="bottom end" className="min-w-40 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1 shadow-xl">
                        <Dropdown.Menu aria-label={t('intermediaries.actions')} onAction={(key) => items.find((menuItem) => menuItem.id === key)?.action()} itemClasses={{ base: 'rounded-lg px-2 py-1 text-[11px] font-medium text-[var(--text)] transition data-[hover]:bg-[var(--danger)]/10' }}>
                            {items.map((menuItem) => <Dropdown.Item key={menuItem.id} id={menuItem.id} textValue={menuItem.label} className="text-[var(--danger)]"><div className="flex items-center gap-2"><span className="flex size-4 shrink-0 items-center justify-center">{menuItem.icon}</span><span>{menuItem.label}</span></div></Dropdown.Item>)}
                        </Dropdown.Menu>
                    </Dropdown.Popover>
                </Dropdown>
            </div>
        );
    }

    const metricCards = [
        { label: t('intermediaries.metrics.total'), value: metrics.total, detail: t('intermediaries.metrics.totalDetail'), ...INTERMEDIARY_KPI_TONES.total },
        { label: t('intermediaries.metrics.active'), value: metrics.active, detail: t('intermediaries.metrics.activeDetail', { percent: Math.round((metrics.active / Math.max(metrics.total, 1)) * 100) }), ...INTERMEDIARY_KPI_TONES.active },
        { label: t('intermediaries.metrics.inactive'), value: metrics.inactive, detail: t('intermediaries.metrics.inactiveDetail'), ...INTERMEDIARY_KPI_TONES.inactive },
        { label: t('intermediaries.linkedClients'), value: metrics.linkedClients, detail: t('intermediaries.metrics.linkedClientsDetail'), ...INTERMEDIARY_KPI_TONES.linkedClients },
    ];

    const intermediaryColumns: AppWorkspaceTableColumn<IntermediaryRow>[] = [
        { id: 'avatar', label: '', headerClassName: 'w-8', reorderable: false, render: (item) => <span className={cn('flex size-6 shrink-0 items-center justify-center rounded text-[10px] font-bold', avatarColor(item.id))}>{item.name.charAt(0).toUpperCase()}</span> },
        { id: 'intermediary', label: <ColumnHeader label={t('intermediaries.table.intermediary')} icon={Building2} field="name" />, render: (item) => <div className="min-w-0"><p className="max-w-[180px] truncate font-medium text-[var(--text)]">{item.name}</p><p className="max-w-[180px] truncate text-[var(--text-muted)]">{item.code}</p></div> },
        { id: 'type', label: <ColumnHeader label={t('intermediaries.table.type')} icon={ContactRound} field="type" />, render: (item) => <StatusPill label={typeLabel(item.type)} color="primary" size="sm" /> },
        { id: 'contact', label: <ColumnHeader label={t('intermediaries.table.contact')} icon={Phone} />, render: (item) => <div className="grid gap-0.5"><span className="text-[var(--text)]">{formatContact(item.phone)}</span><span className="max-w-[160px] truncate text-[11px] text-[var(--text-muted)]">{formatContact(item.email)}</span></div> },
        { id: 'clients', label: <ColumnHeader label={t('intermediaries.table.clients')} icon={Users} field="clientsCount" />, render: (item) => <span className="inline-flex min-w-6 items-center justify-center rounded bg-[var(--surface-2)] px-1.5 py-0.5 text-[11px] font-medium text-[var(--text)]">{item.clientsCount}</span> },
        { id: 'status', label: <ColumnHeader label={t('intermediaries.table.status')} icon={CheckCircle2} field="isActive" />, render: (item) => <StatusPill label={item.isActive ? t('intermediaries.statuses.active') : t('intermediaries.statuses.inactive')} color={item.isActive ? 'success' : 'warning'} size="sm" /> },
        { id: 'updated', label: <ColumnHeader label={t('intermediaries.table.updated')} icon={RefreshCw} field="updatedAt" />, render: (item) => <span className="whitespace-nowrap text-[var(--text-muted)]">{item.updatedAt || '-'}</span> },
        { id: 'actions', label: '', headerClassName: 'w-24', reorderable: false, render: (item) => <div onClick={(event) => event.stopPropagation()}><RowMenu item={item} /></div> },
    ];

    return (
        <>
            <Head title={t('intermediaries.title')} />
            <AppShell>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">{t('intermediaries.eyebrow')}</p>
                        <h1 className="text-2xl font-bold tracking-[-0.02em] text-[var(--foreground)]">{t('intermediaries.title')}</h1>
                        <p className="mt-1 max-w-2xl text-sm text-[var(--text-muted)]">{t('intermediaries.subtitle')}</p>
                    </div>
                    <AppButton isIconOnly compact variant="solid" color="primary" tooltip={t('intermediaries.newIntermediary')} aria-label={t('intermediaries.newIntermediary')} onPress={openCreateDrawer}><Plus size={16} /></AppButton>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {metricCards.map((card) => <AppKpiCard key={card.label} label={card.label} value={card.value} detail={card.detail} icon={card.icon} accentColor={card.accentColor} valueClassName={card.valueClassName} />)}
                </div>

                <AppWorkspaceTable
                    ariaLabel={t('intermediaries.title')}
                    columns={intermediaryColumns}
                    columnOrderStorageKey="archilbo.intermediaries.table.columns.v1"
                    columnOrderHint={t('intermediaries.table.reorderHint')}
                    data={pageIntermediaries}
                    rowKey={(item) => item.id}
                    minTableWidthClassName="min-w-[820px]"
                    onRowPress={(item) => router.visit(`/intermediaries/${item.id}`)}
                    emptyContent={<AppEmptyState title={t('intermediaries.noResults')} description={t('intermediaries.noResultsDesc')} />}
                    toolbar={<div className="flex flex-wrap items-center gap-2 px-3 py-2"><div className="relative max-w-[220px] flex-1"><Search size={12} className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" /><Input type="text" value={query} onChange={(event) => { setQuery(event.target.value); setPage(0); }} placeholder={t('intermediaries.searchPlaceholder')} className="h-7 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] pl-7 pr-7 text-[11px] text-[var(--text)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]" />{query ? <button type="button" onClick={() => { setQuery(''); setPage(0); }} className="absolute right-1 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)]" aria-label={t('intermediaries.resetFilters')}><X size={12} /></button> : null}</div><div className="ml-auto flex items-center gap-1"><Dropdown><Dropdown.Trigger className={cn('inline-flex h-7 items-center gap-1.5 rounded-lg border px-2.5 text-[11px] font-medium transition hover:border-[var(--accent)]/30', statusFilter !== 'all' ? 'border-[var(--accent)] text-[var(--accent)]' : 'border-[var(--border)] text-[var(--text-muted)]')}><span className="contents"><ListFilter size={12} />{statusOptions.find((option) => option.id === statusFilter)?.label}<span className="rounded bg-[var(--surface-2)] px-1 py-px text-[9px] font-semibold text-[var(--text-muted)]">{statusOptions.find((option) => option.id === statusFilter)?.count ?? intermediaries.length}</span></span></Dropdown.Trigger><Dropdown.Popover placement="bottom end" className="min-w-40 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1 shadow-xl"><Dropdown.Menu aria-label={t('intermediaries.filter')} selectionMode="single" disabledKeys={statusOptions.filter((option) => option.count === 0).map((option) => option.id)} onAction={(key) => { setStatusFilter(key as typeof statusFilter); setPage(0); }} itemClasses={{ base: 'rounded-lg px-2 py-1.5 text-[12px] font-medium text-[var(--text)] transition data-[hover]:bg-[var(--surface-2)] data-[disabled]:opacity-40' }}>{statusOptions.map((option) => <Dropdown.Item key={option.id} id={option.id} textValue={option.label}><div className="flex w-full items-center gap-2"><Dropdown.ItemIndicator><CheckCircle2 size={14} className="text-[var(--accent)]" /></Dropdown.ItemIndicator><span className="flex-1">{option.label}</span><span className="rounded bg-[var(--surface-2)] px-1.5 py-px text-[10px] font-semibold text-[var(--text-muted)]">{option.count}</span></div></Dropdown.Item>)}</Dropdown.Menu></Dropdown.Popover></Dropdown><AppButton variant="ghost" isIconOnly size="sm" tooltip={t('intermediaries.update')} aria-label={t('intermediaries.update')} onPress={() => router.reload({ preserveScroll: true })} className="size-7 text-[var(--text-muted)]"><RefreshCw size={12} /></AppButton></div></div>}
                    renderMobileRow={(item) => <div key={item.id} className="flex items-start gap-2 p-3 transition hover:bg-[var(--surface-2)]"><span className={cn('flex size-9 shrink-0 items-center justify-center rounded-lg text-[12px] font-bold', avatarColor(item.id))}>{item.name.charAt(0).toUpperCase()}</span><AppButton variant="ghost" size="sm" onPress={() => router.visit(`/intermediaries/${item.id}`)} className="h-auto min-w-0 flex-1 justify-start p-0 text-left"><span className="min-w-0 flex-1"><div className="flex items-center gap-2"><p className="truncate text-[13px] font-semibold text-[var(--foreground)]">{item.name}</p><StatusPill label={item.isActive ? t('intermediaries.statuses.active') : t('intermediaries.statuses.inactive')} color={item.isActive ? 'success' : 'warning'} size="sm" /></div><p className="mt-0.5 text-[12px] text-[var(--text-muted)]">{typeLabel(item.type)} · {item.phone || item.email || '-'}</p><div className="mt-1 flex items-center gap-3 text-[11px] text-[var(--text-muted)]"><span>{t('intermediaries.pagination.clients', { count: item.clientsCount })}</span><span>{item.updatedAt || '-'}</span></div></span></AppButton><RowMenu item={item} /></div>}
                    footer={<div className="flex items-center justify-between px-3 py-2"><span className="text-[10px] text-[var(--text-muted)]">{filteredIntermediaries.length} {t('intermediaries.resultCount')}</span><div className="flex items-center gap-1.5"><AppButton isIconOnly compact size="sm" variant="quiet" tooltip={t('intermediaries.pagination.previous')} aria-label={t('intermediaries.pagination.previous')} isDisabled={page === 0} onPress={() => setPage((current) => current - 1)}><ChevronLeft size={14} /></AppButton><span className="min-w-10 text-center text-[10px] font-semibold tabular-nums text-[var(--text-muted)]">{page + 1} / {pageCount}</span><AppButton isIconOnly compact size="sm" variant="quiet" tooltip={t('intermediaries.pagination.next')} aria-label={t('intermediaries.pagination.next')} isDisabled={page >= pageCount - 1} onPress={() => setPage((current) => current + 1)}><ChevronRight size={14} /></AppButton></div></div>}
                />

                <IntermediaryDrawer isOpen={drawerOpen} mode={drawerMode} intermediary={editTarget} onOpenChange={setDrawerOpen} onSubmit={handleSubmit} errors={formErrors} />

                <AppModal isOpen={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }} title={t('intermediaries.deleteIntermediary')} size="sm">
                    <p className="mb-5 text-sm text-[var(--text-muted)]">{t('intermediaries.deleteConfirm')} <strong>{deleteTarget?.name}</strong>? {t('intermediaries.deleteWarning')}</p>
                    {deleteTarget && deleteTarget.clientsCount > 0 ? <div className="mb-4 rounded-lg border border-[var(--danger)]/30 bg-[var(--danger)]/5 px-3 py-2 text-[12px] text-[var(--danger)]">{t('intermediaries.deleteHasClients', { count: deleteTarget.clientsCount })}</div> : null}
                    <div className="flex justify-end gap-2"><AppButton variant="bordered" onPress={() => setDeleteTarget(null)}>{t('intermediaries.cancel')}</AppButton><AppButton color="danger" variant="solid" onPress={confirmDelete}>{t('intermediaries.delete')}</AppButton></div>
                </AppModal>
            </AppShell>
        </>
    );
}
