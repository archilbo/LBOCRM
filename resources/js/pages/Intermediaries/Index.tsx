import { Head, router } from '@inertiajs/react';
import {
    Eye, MoreHorizontal, Pencil, Plus, RefreshCw, Search, SlidersHorizontal, Trash2, TrendingUp, X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { MiniLineChart } from '@/components/charts/MiniLineChart';
import { AppShell } from '@/components/layout/AppShell';
import { AppButton } from '@/components/ui/AppButton';
import { AppEmptyState } from '@/components/ui/AppEmptyState';
import { AppModal } from '@/components/ui/AppModal';
import { StatusPill } from '@/components/ui/StatusPill';
import { cn } from '@/lib/cn';
import { IntermediaryDrawer } from '@/features/intermediaries/drawers/IntermediaryDrawer';
import type { IntermediaryFormPayload, IntermediaryRow, MonthlyCount } from '@/features/intermediaries/types';
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
    monthlyClients: MonthlyCount[];
    topIntermediaries: { id: number; name: string; clientsCount: number }[];
};

type SortField = 'name' | 'type' | 'clientsCount' | 'isActive' | 'updatedAt';
type SortDir = 'asc' | 'desc';

function typeLabel(type: string) {
    switch (type) {
        case 'person': return 'Person';
        case 'agency': return 'Agency';
        case 'architect_partner': return 'Architect partner';
        case 'business_referral': return 'Business referral';
        default: return type || 'Other';
    }
}

function formatContact(value: string | null | undefined) {
    return value && value.trim() !== '' ? value : '-';
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

export default function IntermediariesIndex({ intermediaries, metrics, monthlyClients, topIntermediaries }: PageProps) {
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
    const [showFilters, setShowFilters] = useState(false);
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
    const searchRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (openMenuId === null) return;
        function handleClick(e: MouseEvent) {
            const target = e.target as HTMLElement;
            if (!target.closest('[data-row-menu]')) setOpenMenuId(null);
        }
        function handleKey(e: KeyboardEvent) { if (e.key === 'Escape') setOpenMenuId(null); }
        document.addEventListener('mousedown', handleClick);
        document.addEventListener('keydown', handleKey);
        return () => { document.removeEventListener('mousedown', handleClick); document.removeEventListener('keydown', handleKey); };
    }, [openMenuId]);

    const filteredIntermediaries = useMemo(() => {
        const q = query.trim().toLowerCase();
        return intermediaries
            .filter((item) => {
                if (statusFilter === 'active' && !item.isActive) return false;
                if (statusFilter === 'inactive' && item.isActive) return false;
                if (!q) return true;
                return [item.name, item.code, item.phone, item.email, item.type]
                    .filter(Boolean).join(' ').toLowerCase().includes(q);
            })
            .sort((a, b) => {
                let cmp = 0;
                if (sortField === 'name') cmp = a.name.localeCompare(b.name);
                else if (sortField === 'type') cmp = a.type.localeCompare(b.type);
                else if (sortField === 'clientsCount') cmp = a.clientsCount - b.clientsCount;
                else if (sortField === 'isActive') cmp = Number(b.isActive) - Number(a.isActive);
                else if (sortField === 'updatedAt') cmp = (a.updatedAt ?? '').localeCompare(b.updatedAt ?? '');
                return sortDir === 'asc' ? cmp : -cmp;
            });
    }, [intermediaries, query, statusFilter, sortField, sortDir]);

    const hasActiveFilters = statusFilter !== 'all' || query.trim() !== '';

    const statusOptions = [
        { id: 'all' as const, label: 'All', count: intermediaries.length },
        { id: 'active' as const, label: 'Active', count: metrics.active },
        { id: 'inactive' as const, label: 'Inactive', count: metrics.inactive },
    ];

    function toggleSort(field: SortField) {
        if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
        else { setSortField(field); setSortDir('asc'); }
    }

    function SortIcon({ field }: { field: SortField }) {
        if (sortField !== field) return null;
        return sortDir === 'asc'
            ? <span className="ml-1 text-[10px] opacity-60">▲</span>
            : <span className="ml-1 text-[10px] opacity-60">▼</span>;
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
            onError: () => toast.error('Cannot delete this intermediary.'),
        });
    }

    function RowMenu({ item, isOpen, onToggle }: { item: IntermediaryRow; isOpen: boolean; onToggle: () => void }) {
        const items = [
            { id: 'view', label: t('intermediaries.viewIntermediary'), icon: <Eye size={14} />, action: () => router.visit(`/intermediaries/${item.id}`), danger: false },
            { id: 'edit', label: t('intermediaries.editIntermediary'), icon: <Pencil size={14} />, action: () => openEditDrawer(item), danger: false },
            { id: 'delete', label: t('intermediaries.deleteIntermediary'), icon: <Trash2 size={14} />, action: () => setDeleteTarget(item), danger: true },
        ];
        return (
            <div className="relative inline-flex" data-row-menu>
                <button type="button" onClick={(e) => { e.stopPropagation(); onToggle(); }}
                    className="flex size-8 items-center justify-center rounded-lg border border-transparent text-[var(--text-muted)] transition hover:border-[var(--border)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]"
                    aria-label="Actions">
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

    const metricCards = [
        { label: t('intermediaries.title'), value: metrics.total, detail: 'agencies & people' },
        { label: 'Active', value: metrics.active, detail: `${Math.round((metrics.active / Math.max(metrics.total, 1)) * 100)}% of total` },
        { label: t('intermediaries.linkedClients'), value: metrics.linkedClients, detail: 'across all partners' },
        { label: 'This month', value: `+${metrics.clientsThisMonth}`, detail: 'new clients added' },
    ];

    const maxClientCount = Math.max(1, ...topIntermediaries.map((i) => i.clientsCount));

    return (
        <>
            <Head title={t('intermediaries.title')} />

            <AppShell>
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
                            {t('intermediaries.eyebrow')}
                        </p>
                        <h1 className="text-2xl font-bold tracking-[-0.02em] text-[var(--foreground)]">
                            {t('intermediaries.title')}
                        </h1>
                        <p className="mt-1 max-w-2xl text-sm text-[var(--text-muted)]">
                            {t('intermediaries.subtitle')}
                        </p>
                    </div>
                    <AppButton variant="solid" color="primary" onPress={openCreateDrawer}>
                        <Plus size={16} />
                        {t('intermediaries.newIntermediary')}
                    </AppButton>
                </div>

                <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {metricCards.map((card) => (
                        <div key={card.label}
                            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
                            <div className="flex items-start justify-between gap-3">
                                <div />
                            </div>
                            <p className="mt-3 text-[12px] font-medium text-[var(--text-muted)]">{card.label}</p>
                            <p className="mt-0.5 text-2xl font-semibold text-[var(--foreground)]">{card.value}</p>
                            {card.detail ? (
                                <p className="mt-1 text-[11px] text-[var(--text-muted)]">{card.detail}</p>
                            ) : null}
                        </div>
                    ))}
                </div>

                <div className="mb-6 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
                        <div className="mb-3 flex items-center justify-between">
                            <div>
                                <h3 className="text-[12px] font-semibold text-[var(--foreground)]">{t('intermediaries.monthlyClients')}</h3>
                                <p className="text-[10px] text-[var(--text-subtle)]">Network growth trend</p>
                            </div>
                            <TrendingUp size={16} className="text-[var(--accent)]" />
                        </div>
                        {monthlyClients.length > 0 ? (
                            <MiniLineChart data={monthlyClients} height={150} />
                        ) : (
                            <div className="flex h-[150px] items-center justify-center">
                                <p className="text-[11px] text-[var(--text-subtle)]">No data yet</p>
                            </div>
                        )}
                    </div>

                    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
                        <h3 className="mb-3 text-[12px] font-semibold text-[var(--foreground)]">{t('intermediaries.topPerformers')}</h3>
                        {topIntermediaries.length > 0 ? (
                            <div className="space-y-2.5">
                                {topIntermediaries.map((item, rank) => (
                                    <button key={item.id} type="button"
                                        onClick={() => router.visit(`/intermediaries/${item.id}`)}
                                        className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition hover:bg-[var(--surface-2)]">
                                        <span className={cn(
                                            'flex size-6 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold',
                                            rank === 0 ? 'bg-amber-500/15 text-amber-500' :
                                            rank === 1 ? 'bg-slate-400/15 text-slate-400' :
                                            rank === 2 ? 'bg-orange-400/15 text-orange-400' :
                                            'bg-[var(--surface-3)] text-[var(--text-muted)]',
                                        )}>{rank + 1}</span>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-[12px] font-medium text-[var(--foreground)]">{item.name}</p>
                                            <div className="flex items-center gap-2">
                                                <div className="h-1 flex-1 rounded-full bg-[var(--surface-3)]">
                                                    <div className="h-full rounded-full bg-[var(--accent)]"
                                                        style={{ width: `${(item.clientsCount / maxClientCount) * 100}%` }} />
                                                </div>
                                                <span className="text-[11px] font-medium text-[var(--text-muted)]">{item.clientsCount}</span>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <p className="text-[11px] text-[var(--text-subtle)]">No intermediaries yet</p>
                        )}
                    </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
                    <div className="flex flex-wrap items-center gap-2 border-b border-[var(--border)] p-3">
                        <div className="relative flex-1 min-w-[200px] max-w-sm">
                            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                            <input
                                ref={searchRef}
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder={t('intermediaries.searchPlaceholder')}
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
                            <option value="name:asc">Name A-Z</option>
                            <option value="name:desc">Name Z-A</option>
                            <option value="clientsCount:desc">Most clients</option>
                            <option value="clientsCount:asc">Least clients</option>
                            <option value="isActive:desc">Active first</option>
                            <option value="isActive:asc">Inactive first</option>
                        </select>

                        <button type="button" onClick={() => router.reload({ preserveScroll: true })}
                            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 text-[12px] font-medium text-[var(--text-muted)] transition hover:border-[var(--accent)] hover:text-[var(--foreground)]">
                            <RefreshCw size={13} />
                            Update
                        </button>

                        <div className="hidden sm:block">
                            <AppButton variant="solid" color="primary" size="sm" onPress={openCreateDrawer}>
                                <Plus size={14} />
                                {t('intermediaries.newIntermediary')}
                            </AppButton>
                        </div>
                    </div>

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

                    {hasActiveFilters ? (
                        <div className="flex items-center gap-2 border-b border-[var(--border)] px-3 py-2">
                            <p className="text-[12px] text-[var(--text-muted)]">
                                {filteredIntermediaries.length} result(s)
                            </p>
                            <button type="button" onClick={() => { setQuery(''); setStatusFilter('all'); }}
                                className="inline-flex items-center gap-1 text-[12px] font-medium text-[var(--accent)] hover:underline">
                                <X size={12} />
                                Reset filters
                            </button>
                        </div>
                    ) : (
                        <div className="border-b border-[var(--border)] px-3 py-2">
                            <p className="text-[12px] text-[var(--text-muted)]">
                                {filteredIntermediaries.length} result(s)
                            </p>
                        </div>
                    )}

                    <div className="hidden md:block overflow-x-auto">
                        {filteredIntermediaries.length > 0 ? (
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-[var(--border)]">
                                        {[
                                            { key: 'name' as SortField, label: t('intermediaries.title') },
                                            { key: 'type' as SortField, label: t('intermediaries.type') },
                                            { key: null, label: t('intermediaries.contact') },
                                            { key: 'clientsCount' as SortField, label: t('intermediaries.clientsCount') },
                                            { key: 'isActive' as SortField, label: t('intermediaries.status') },
                                            { key: 'updatedAt' as SortField, label: t('intermediaries.updated') },
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
                                    {filteredIntermediaries.map((item) => (
                                        <tr key={item.id}
                                            className="border-b border-[var(--border)] transition last:border-0 hover:bg-[var(--surface-2)] group cursor-pointer"
                                            onClick={() => router.visit(`/intermediaries/${item.id}`)}>
                                            <td className="px-3 py-2.5">
                                                <div className="flex items-center gap-2.5">
                                                    <span className={cn(
                                                        'flex size-8 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold',
                                                        avatarColor(item.id),
                                                    )}>
                                                        {item.name.charAt(0).toUpperCase()}
                                                    </span>
                                                    <div className="min-w-0">
                                                        <p className="truncate text-[13px] font-semibold text-[var(--foreground)]">{item.name}</p>
                                                        <p className="truncate text-[11px] text-[var(--text-muted)]">{item.code}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-3 py-2.5">
                                                <StatusPill label={typeLabel(item.type)} color="primary" size="sm" />
                                            </td>
                                            <td className="px-3 py-2.5">
                                                <div className="grid gap-0.5">
                                                    <span className="text-[13px] text-[var(--foreground)]">{formatContact(item.phone)}</span>
                                                    <span className="truncate text-[11px] text-[var(--text-muted)]">{formatContact(item.email)}</span>
                                                </div>
                                            </td>
                                            <td className="px-3 py-2.5">
                                                <span className="inline-flex items-center justify-center rounded-md bg-[var(--surface-2)] px-2 py-0.5 text-[12px] font-medium text-[var(--foreground)]">
                                                    {item.clientsCount}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2.5">
                                                <StatusPill
                                                    label={item.isActive ? 'Active' : 'Inactive'}
                                                    color={item.isActive ? 'success' : 'default'}
                                                    size="sm"
                                                />
                                            </td>
                                            <td className="px-3 py-2.5 text-[12px] text-[var(--text-muted)] whitespace-nowrap">
                                                {item.updatedAt || '-'}
                                            </td>
                                            <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                                                <RowMenu item={item} isOpen={openMenuId === item.id}
                                                    onToggle={() => setOpenMenuId(openMenuId === item.id ? null : item.id)} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="p-6">
                                <AppEmptyState
                                    title={t('intermediaries.noResults')}
                                    description={t('intermediaries.noResultsDesc')}
                                />
                            </div>
                        )}
                    </div>

                    <div className="block md:hidden divide-y divide-[var(--border)]">
                        {filteredIntermediaries.length > 0 ? filteredIntermediaries.map((item) => (
                            <div key={item.id}
                                className="flex items-start gap-3 p-3 transition hover:bg-[var(--surface-2)]"
                                onClick={() => router.visit(`/intermediaries/${item.id}`)}>
                                <span className={cn(
                                    'flex size-9 shrink-0 items-center justify-center rounded-lg text-[12px] font-bold',
                                    avatarColor(item.id),
                                )}>
                                    {item.name.charAt(0).toUpperCase()}
                                </span>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                        <p className="truncate text-[13px] font-semibold text-[var(--foreground)]">{item.name}</p>
                                        <StatusPill
                                            label={item.isActive ? 'Active' : 'Inactive'}
                                            color={item.isActive ? 'success' : 'default'}
                                            size="sm"
                                        />
                                    </div>
                                    <p className="mt-0.5 text-[12px] text-[var(--text-muted)]">
                                        {item.type ? `${typeLabel(item.type)} · ` : ''}{item.phone || item.email || '-'}
                                    </p>
                                    <div className="mt-1 flex items-center gap-3 text-[11px] text-[var(--text-muted)]">
                                        <span>{item.clientsCount} client(s)</span>
                                        <span>{item.updatedAt || '-'}</span>
                                    </div>
                                </div>
                                <div onClick={(e) => e.stopPropagation()}>
                                    <RowMenu item={item} isOpen={openMenuId === item.id}
                                        onToggle={() => setOpenMenuId(openMenuId === item.id ? null : item.id)} />
                                </div>
                            </div>
                        )) : (
                            <div className="p-6">
                                <AppEmptyState
                                    title={t('intermediaries.noResults')}
                                    description={t('intermediaries.noResultsDesc')}
                                />
                            </div>
                        )}
                    </div>
                </div>

                <IntermediaryDrawer
                    isOpen={drawerOpen}
                    mode={drawerMode}
                    intermediary={editTarget}
                    onOpenChange={setDrawerOpen}
                    onSubmit={handleSubmit}
                    errors={formErrors}
                />

                <AppModal
                    isOpen={!!deleteTarget}
                    onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
                    title={t('intermediaries.deleteIntermediary')}
                    size="sm"
                >
                    <p className="mb-5 text-sm text-[var(--text-muted)]">
                        {t('intermediaries.deleteConfirm')} <strong>{deleteTarget?.name}</strong>? {t('intermediaries.deleteWarning')}
                    </p>
                    {deleteTarget && deleteTarget.clientsCount > 0 ? (
                        <div className="mb-4 rounded-lg border border-[var(--danger)]/30 bg-[var(--danger)]/5 px-3 py-2 text-[12px] text-[var(--danger)]">
                            {t('intermediaries.deleteHasClients', 'This intermediary has {count} linked client(s). Deleting will unlink them.', { count: String(deleteTarget.clientsCount) })}
                        </div>
                    ) : null}
                    <div className="flex justify-end gap-2">
                        <AppButton variant="bordered" onPress={() => setDeleteTarget(null)}>Cancel</AppButton>
                        <AppButton color="danger" variant="solid" onPress={confirmDelete}>Delete</AppButton>
                    </div>
                </AppModal>
            </AppShell>
        </>
    );
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