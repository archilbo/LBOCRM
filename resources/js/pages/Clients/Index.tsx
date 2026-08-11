import { Head, router } from '@inertiajs/react';
import { IconArchive, IconBriefcase, IconCircleCheck, IconChevronDown, IconChevronLeft, IconChevronRight, IconCreditCard, IconArrowsSort, IconChevronUp, IconClockHour3, IconEye, IconFilter, IconDots, IconPencil, IconPhone, IconPlus, IconRefresh, IconSearch, IconShieldCheck, IconTrash, IconUserCheck, IconUserCircle, IconUserX, IconUsers, IconX } from '@tabler/icons-react';
import type { Icon } from '@tabler/icons-react';


import { useEffect, useMemo, useState } from 'react';
import { Checkbox, Dropdown, Input } from '@heroui/react';
import { toast } from 'sonner';
import { AppShell } from '@/components/layout/AppShell';
import { AppButton } from '@/components/ui/AppButton';
import { AppKpiCard } from '@/components/ui/AppKpiCard';
import { AppEmptyState } from '@/components/ui/AppEmptyState';
import { AppModal } from '@/components/ui/AppModal';
import { AppWorkspaceTable, type AppWorkspaceTableColumn } from '@/components/ui/AppWorkspaceTable';
import { StatusPill } from '@/components/ui/StatusPill';
import { cn } from '@/lib/cn';
import { useTranslation } from '@/lib/i18n';
import { usePermissions } from '@/hooks/usePermissions';
import type { ClientFormPayload, ClientRow, ClientStatus } from '@/features/clients/types';
import { ClientDrawer } from '@/components/drawers';
import type { FormErrors } from '@/lib/formErrors';

type PageProps = {
    clients: ClientRow[];
    metrics: { total: number; active: number; inactive: number; archived: number };
};

function toBackendPayload(payload: ClientFormPayload, status: ClientStatus = 'active') {
    return {
        client_type: payload.clientType,
        civility: payload.civility || null,
        first_name: payload.firstName || null,
        last_name: payload.lastName || null,
        company_name: payload.companyName || null,
        cin: payload.cin || null,
        ice: payload.ice || null,
        managers: payload.managers.filter(Boolean),
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

const CLIENT_KPI_TONES = {
    total: { icon: <IconUsers size={16} className="text-sky-400" />, accentColor: '#38bdf8', valueClassName: 'text-sky-300' },
    active: { icon: <IconUserCheck size={16} className="text-emerald-400" />, accentColor: '#34d399', valueClassName: 'text-emerald-300' },
    inactive: { icon: <IconUserX size={16} className="text-amber-400" />, accentColor: '#fbbf24', valueClassName: 'text-amber-300' },
    archived: { icon: <IconArchive size={16} className="text-zinc-400" />, accentColor: '#a1a1aa', valueClassName: 'text-zinc-300' },
} as const;

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

export default function ClientsIndex({ clients, metrics }: PageProps) {
    const { t } = useTranslation();
    const { can } = usePermissions();

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [drawerMode, setDrawerMode] = useState<'create' | 'edit'>('create');
    const [selectedClient, setSelectedClient] = useState<ClientRow | null>(null);
    const [formErrors, setFormErrors] = useState<FormErrors>({});
    const [query, setQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | ClientStatus>('all');
    const [sortField, setSortField] = useState<SortField>('updatedAt');
    const [sortDir, setSortDir] = useState<SortDir>('desc');
    const [deleteTarget, setDeleteTarget] = useState<ClientRow | null>(null);
    const [selectedClientIds, setSelectedClientIds] = useState<Set<number>>(new Set());
    const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
    const [page, setPage] = useState(0);
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

    const pageSize = 10;
    const pageCount = Math.max(1, Math.ceil(filteredClients.length / pageSize));
    const pageClients = filteredClients.slice(page * pageSize, (page + 1) * pageSize);
    const deletablePageClients = pageClients.filter((client) => client.capabilities.delete);
    const allDeletablePageClientsSelected = deletablePageClients.length > 0 && deletablePageClients.every((client) => selectedClientIds.has(client.id));

    useEffect(() => {
        setPage((currentPage) => Math.min(currentPage, pageCount - 1));
    }, [pageCount]);

    const metricCards = [
        { label: t('clients.metrics.total'), value: metrics.total, detail: t('clients.metrics.totalDetail'), ...CLIENT_KPI_TONES.total },
        { label: t('clients.metrics.active'), value: metrics.active, detail: t('clients.metrics.activeDetail'), ...CLIENT_KPI_TONES.active },
        { label: t('clients.metrics.inactive'), value: metrics.inactive, detail: t('clients.metrics.inactiveDetail'), ...CLIENT_KPI_TONES.inactive },
        { label: t('clients.metrics.archived'), value: metrics.archived, detail: t('clients.metrics.archivedDetail'), ...CLIENT_KPI_TONES.archived },
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
        if (sortField !== field) return <IconArrowsSort size={11} className="text-[var(--text-muted)]" />;
        return sortDir === 'asc'
            ? <IconChevronUp size={11} className="text-[var(--accent)]" />
            : <IconChevronDown size={11} className="text-[var(--accent)]" />;
    }

    function ColumnHeader({ label, icon: Icon, field }: { label: string; icon: Icon; field?: SortField }) {
        const content = <><Icon size={13} strokeWidth={1.9} /><span>{label}</span>{field ? <SortIcon field={field} /> : null}</>;

        if (!field) {
            return <span className="inline-flex items-center gap-1.5">{content}</span>;
        }

        return (
            <button type="button" onClick={() => toggleSort(field)} className="inline-flex items-center gap-1.5 text-left transition hover:text-[var(--foreground)]">
                {content}
            </button>
        );
    }

    function openCreateDrawer() {
        setSelectedClient(null);
        setDrawerMode('create');
        setFormErrors({});
        setDrawerOpen(true);
    }

    useEffect(() => {
        if (!can('clients.create') || new URLSearchParams(window.location.search).get('command') !== 'create') return;
        openCreateDrawer();
        window.history.replaceState({}, '', window.location.pathname);
    }, [can]);

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

    function toggleClientSelection(clientId: number) {
        setSelectedClientIds((current) => {
            const next = new Set(current);
            if (next.has(clientId)) next.delete(clientId);
            else next.add(clientId);
            return next;
        });
    }

    function togglePageSelection() {
        setSelectedClientIds((current) => {
            const next = new Set(current);
            if (allDeletablePageClientsSelected) {
                deletablePageClients.forEach((client) => next.delete(client.id));
            } else {
                deletablePageClients.forEach((client) => next.add(client.id));
            }
            return next;
        });
    }

    function confirmBulkDelete() {
        const clientIds = [...selectedClientIds];
        if (clientIds.length === 0) return;

        router.post('/clients/bulk-delete', { client_ids: clientIds }, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(t('clients.bulkDeleted', { count: clientIds.length }));
                setSelectedClientIds(new Set());
                setShowBulkDeleteConfirm(false);
            },
            onError: () => toast.error(t('clients.bulkDeleteError')),
        });
    }

    function RowMenu({ client }: { client: ClientRow }) {
        const items = client.capabilities.delete
            ? [{ id: 'delete', label: t('clients.delete'), icon: <IconTrash size={14} />, action: () => setDeleteTarget(client), danger: true }]
            : [];

        return (
            <div className="flex items-center gap-0.5 shrink-0">
                {client.capabilities.view ? <button type="button" className="flex size-6 items-center justify-center rounded text-[var(--text-muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--text)]" aria-label={t('clients.view')} onClick={() => router.visit(`/clients/${client.id}`)}><IconEye size={13} /></button> : null}
                {client.capabilities.update ? <button type="button" className="flex size-6 items-center justify-center rounded text-[var(--text-muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--text)]" aria-label={t('clients.edit')} onClick={() => openEditDrawer(client)}><IconPencil size={13} /></button> : null}
                {items.length ? <Dropdown>
                    <Dropdown.Trigger className="flex size-6 items-center justify-center rounded text-[var(--text-muted)] transition hover:bg-[var(--surface-2)] data-[open]:text-[var(--accent)]" aria-label={t('clients.actions')}>
                        <IconDots size={13} />
                    </Dropdown.Trigger>
                    <Dropdown.Popover placement="bottom end" className="min-w-40 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1 shadow-xl">
                        <Dropdown.Menu aria-label={t('clients.actions')} onAction={(key) => items.find((item) => item.id === key)?.action()} itemClasses={{ base: 'rounded-lg px-2 py-1 text-[10px] font-medium text-[var(--text)] transition data-[hover]:bg-[var(--surface-2)]' }}>
                            {items.map((item) => (
                                <Dropdown.Item key={item.id} id={item.id} textValue={item.label} className={cn(item.danger ? 'text-[var(--danger)] data-[hover]:bg-[var(--danger)]/10' : '')}>
                                    <div className="flex items-center gap-2"><span className="flex size-4 shrink-0 items-center justify-center">{item.icon}</span><span>{item.label}</span></div>
                                </Dropdown.Item>
                            ))}
                        </Dropdown.Menu>
                    </Dropdown.Popover>
                </Dropdown> : null}
            </div>
        );
    }

    const clientColumns: AppWorkspaceTableColumn<ClientRow>[] = [
        {
            id: 'select',
            label: can('clients.delete') ? (
                <Checkbox isSelected={allDeletablePageClientsSelected} onChange={togglePageSelection} aria-label={t('clients.selectAll')}>
                    <Checkbox.Content>
                        <Checkbox.Control className="size-4 rounded border border-[color-mix(in_srgb,var(--text-muted)_35%,transparent)] bg-[var(--surface)] data-[selected]:border-[var(--accent)] data-[selected]:bg-[var(--accent)]">
                            <Checkbox.Indicator className="text-black" />
                        </Checkbox.Control>
                    </Checkbox.Content>
                </Checkbox>
            ) : null,
            headerClassName: 'w-10',
            cellClassName: 'w-10',
            fixedPosition: 'start',
            reorderable: false,
            render: (client) => client.capabilities.delete ? (
                <span onClick={(event) => event.stopPropagation()} onPointerDown={(event) => event.stopPropagation()}>
                    <Checkbox isSelected={selectedClientIds.has(client.id)} onChange={() => toggleClientSelection(client.id)} aria-label={t('clients.selectClient', { name: client.fullName })}>
                        <Checkbox.Content>
                            <Checkbox.Control className="size-4 rounded border border-[color-mix(in_srgb,var(--text-muted)_35%,transparent)] bg-[var(--surface)] data-[selected]:border-[var(--accent)] data-[selected]:bg-[var(--accent)]">
                                <Checkbox.Indicator className="text-black" />
                            </Checkbox.Control>
                        </Checkbox.Content>
                    </Checkbox>
                </span>
            ) : null,
        },
        {
            id: 'avatar',
            label: '',
            headerClassName: 'w-8',
            reorderable: false,
            render: (client) => <span className={cn('flex size-6 shrink-0 items-center justify-center rounded text-[9px] font-bold', avatarColor(client.id))}>{initials(client)}</span>,
        },
        {
            id: 'client',
            label: <ColumnHeader label={t('clients.table.client')} icon={IconUserCircle} field="fullName" />,
            render: (client) => <div className="min-w-0"><p className="max-w-[180px] truncate font-medium text-[var(--text)]">{client.fullName}</p><p className="max-w-[180px] truncate text-[var(--text-muted)]">{client.clientNumber}</p></div>,
        },
        {
            id: 'cin',
            label: <ColumnHeader label={t('clients.table.cin')} icon={IconCreditCard} field="cin" />,
            render: (client) => <span className="text-[var(--text-muted)]">{client.cin || '-'}</span>,
        },
        {
            id: 'contact',
            label: <ColumnHeader label={t('clients.table.contact')} icon={IconPhone} />,
            render: (client) => <div className="grid gap-0.5"><span className="text-[var(--text)]">{formatContact(client.phone)}</span><span className="max-w-[160px] truncate text-[10px] text-[var(--text-muted)]">{formatContact(client.email)}</span></div>,
        },
        {
            id: 'intermediary',
            label: <ColumnHeader label={t('clients.table.intermediary')} icon={IconBriefcase} />,
            render: (client) => <span className="max-w-[150px] truncate text-[var(--text-muted)]">{client.intermediaryName && client.intermediaryName !== 'None' ? client.intermediaryName : '-'}</span>,
        },
        {
            id: 'projects',
            label: <ColumnHeader label={t('clients.table.projects')} icon={IconShieldCheck} field="projectsCount" />,
            render: (client) => <span className="inline-flex min-w-6 items-center justify-center rounded bg-[var(--surface-2)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--text)]">{client.projectsCount}</span>,
        },
        {
            id: 'status',
            label: <ColumnHeader label={t('clients.table.status')} icon={IconCircleCheck} field="status" />,
            render: (client) => <StatusPill label={t(`clients.status.${client.status}`, client.status)} color={client.status === 'active' ? 'success' : client.status === 'inactive' ? 'warning' : 'default'} size="sm" />,
        },
        {
            id: 'updated',
            label: <ColumnHeader label={t('clients.table.updated')} icon={IconClockHour3} field="updatedAt" />,
            render: (client) => <span className="whitespace-nowrap text-[var(--text-muted)]">{client.updatedAt || '-'}</span>,
        },
        {
            id: 'actions',
            label: '',
            headerClassName: 'w-10',
            reorderable: false,
            render: (client) => <div onClick={(event) => event.stopPropagation()}><RowMenu client={client} /></div>,
        },
    ];

    return (
        <>
            <Head title={t('clients.title')} />

            <AppShell>
                {/* ── Page header ── */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
                            {t('clients.eyebrow')}
                        </p>
                        <h1 className="text-2xl font-bold tracking-[-0.02em] text-[var(--foreground)]">
                            {t('clients.title')}
                        </h1>
                        <p className="mt-1 max-w-2xl text-sm text-[var(--text-muted)]">
                            {t('clients.subtitle')}
                        </p>
                    </div>
                    {can('clients.create') ? <AppButton isIconOnly compact variant="solid" color="primary" tooltip={t('clients.newClient')} aria-label={t('clients.newClient')} onPress={openCreateDrawer}>
                        <IconPlus size={16} />
                    </AppButton> : null}
                </div>

                {/* ── Metric cards ── */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {metricCards.map((card) => (
                        <AppKpiCard key={card.label} label={card.label} value={card.value} detail={card.detail} icon={card.icon} accentColor={card.accentColor} valueClassName={card.valueClassName} />
                    ))}
                </div>

                {/* ── Table card ── */}
                <div className="contents">
                    {/* Toolbar */}

                    {/* Filter chips */}

                    {/* Result count */}

                    {/* ── Desktop table ── */}
                    <AppWorkspaceTable
                        ariaLabel={t('clients.title')}
                        columns={clientColumns}
                        columnOrderStorageKey="archilbo.clients.table.columns.v1"
                        columnOrderHint={t('clients.table.reorderHint')}
                        data={pageClients}
                        rowKey={(client) => client.id}
                        minTableWidthClassName="min-w-[860px]"
                        onRowPress={(client) => router.visit(`/clients/${client.id}`)}
                        emptyContent={<AppEmptyState title={t('clients.emptyTitle')} description={t('clients.emptyDescription')} />}
                        toolbar={
                            <div className="flex flex-wrap items-center gap-2 px-3 py-2">
                                <div className="relative max-w-[220px] flex-1">
                                    <IconSearch size={12} className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                                    <Input type="text" value={query} onChange={(event) => { setQuery(event.target.value); setPage(0); }} placeholder={t('clients.searchPlaceholder')} className="h-7 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] pl-7 pr-7 text-[10px] text-[var(--text)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--accent)_18%,transparent)]" />
                                    {query ? <button type="button" onClick={() => { setQuery(''); setPage(0); }} className="absolute right-1 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)]" aria-label={t('clients.resetFilters')}><IconX size={12} /></button> : null}
                                </div>
                                <div className="ml-auto flex items-center gap-1">
                                    {selectedClientIds.size > 0 ? (
                                        <>
                                            <span className="mr-1 text-[10px] font-semibold text-[var(--accent)]">{t('clients.selected', { count: selectedClientIds.size })}</span>
                                            <AppButton isIconOnly compact size="sm" variant="danger-soft" tooltip={t('clients.bulkDelete')} aria-label={t('clients.bulkDelete')} onPress={() => setShowBulkDeleteConfirm(true)} className="size-7"><IconTrash size={13} /></AppButton>
                                            <AppButton isIconOnly compact size="sm" variant="quiet" tooltip={t('clients.clearSelection')} aria-label={t('clients.clearSelection')} onPress={() => setSelectedClientIds(new Set())} className="size-7"><IconX size={13} /></AppButton>
                                        </>
                                    ) : null}
                                    <Dropdown>
                                        <Dropdown.Trigger className={cn('inline-flex h-7 items-center gap-1.5 rounded-lg border px-2.5 text-[10px] font-medium transition hover:border-[var(--accent)]/30', statusFilter !== 'all' ? 'border-[var(--accent)] text-[var(--accent)]' : 'border-[var(--border)] text-[var(--text-muted)]')}>
                                            <span className="contents"><IconFilter size={12} />{statusOptions.find((option) => option.id === statusFilter)?.label}<span className="rounded bg-[var(--surface-2)] px-1 py-px text-[9px] font-semibold text-[var(--text-muted)]">{statusOptions.find((option) => option.id === statusFilter)?.count ?? clients.length}</span></span>
                                        </Dropdown.Trigger>
                                        <Dropdown.Popover placement="bottom start" className="min-w-44 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1 shadow-xl">
                                            <Dropdown.Menu aria-label={t('clients.filter')} selectionMode="single" disabledKeys={statusOptions.filter((option) => option.count === 0).map((option) => option.id)} onAction={(key) => { setStatusFilter(key as typeof statusFilter); setPage(0); }} itemClasses={{ base: 'rounded-lg px-2 py-1.5 text-[11px] font-medium text-[var(--text)] transition data-[hover]:bg-[var(--surface-2)] data-[disabled]:opacity-40' }}>
                                                {statusOptions.map((option) => <Dropdown.Item key={option.id} id={option.id} textValue={option.label}><div className="flex w-full items-center gap-2"><Dropdown.ItemIndicator><IconCircleCheck size={14} className="text-[var(--accent)]" /></Dropdown.ItemIndicator><span className="flex-1">{option.label}</span><span className="rounded bg-[var(--surface-2)] px-1.5 py-px text-[9px] font-semibold text-[var(--text-muted)]">{option.count}</span></div></Dropdown.Item>)}
                                            </Dropdown.Menu>
                                        </Dropdown.Popover>
                                    </Dropdown>
                                    <AppButton variant="ghost" isIconOnly size="sm" onPress={() => router.reload({ preserveScroll: true })} className="size-7 text-[var(--text-muted)]" aria-label={t('clients.update')}><IconRefresh size={12} /></AppButton>
                                </div>
                            </div>
                        }
                        renderMobileRow={(client) => (
                            <div key={client.id} className="flex items-start gap-2 p-3 transition hover:bg-[var(--surface-2)]">
                                {client.capabilities.delete ? <span className="pt-1" onClick={(event) => event.stopPropagation()}><Checkbox isSelected={selectedClientIds.has(client.id)} onChange={() => toggleClientSelection(client.id)} aria-label={t('clients.selectClient', { name: client.fullName })}><Checkbox.Content><Checkbox.Control className="size-4 rounded border border-[color-mix(in_srgb,var(--text-muted)_35%,transparent)] bg-[var(--surface)] data-[selected]:border-[var(--accent)] data-[selected]:bg-[var(--accent)]"><Checkbox.Indicator className="text-black" /></Checkbox.Control></Checkbox.Content></Checkbox></span> : null}
                                <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold', avatarColor(client.id))}>{initials(client)}</span>
                                <AppButton variant="ghost" size="sm" onPress={() => router.visit(`/clients/${client.id}`)} className="h-auto min-w-0 flex-1 justify-start p-0 text-left"><span className="min-w-0 flex-1"><div className="flex items-center gap-2"><p className="truncate text-[12px] font-semibold text-[var(--foreground)]">{client.fullName}</p><StatusPill label={t(`clients.status.${client.status}`, client.status)} color={client.status === 'active' ? 'success' : client.status === 'inactive' ? 'warning' : 'default'} size="sm" /></div><p className="mt-0.5 text-[11px] text-[var(--text-muted)]">{client.cin ? `${client.cin} · ` : ''}{client.phone || client.email || '-'}</p><div className="mt-1 flex items-center gap-3 text-[10px] text-[var(--text-muted)]"><span>{t('clients.pagination.projects', { count: client.projectsCount })}</span><span>{client.updatedAt || '-'}</span></div></span></AppButton>
                                <RowMenu client={client} />
                            </div>
                        )}
                        footer={<div className="flex items-center justify-between px-3 py-2"><span className="text-[9px] text-[var(--text-muted)]">{filteredClients.length} {t('clients.resultCount')}</span><div className="flex items-center gap-1.5"><AppButton isIconOnly compact size="sm" variant="quiet" tooltip={t('clients.pagination.previous')} aria-label={t('clients.pagination.previous')} isDisabled={page === 0} onPress={() => setPage((current) => current - 1)}><IconChevronLeft size={14} /></AppButton><span className="min-w-10 text-center text-[9px] font-semibold tabular-nums text-[var(--text-muted)]">{page + 1} / {pageCount}</span><AppButton isIconOnly compact size="sm" variant="quiet" tooltip={t('clients.pagination.next')} aria-label={t('clients.pagination.next')} isDisabled={page >= pageCount - 1} onPress={() => setPage((current) => current + 1)}><IconChevronRight size={14} /></AppButton></div></div>}
                    />

                    {/* ── Mobile cards ── */}
                </div>

                {/* ── Create/Edit drawer ── */}
                <ClientDrawer
                    isOpen={drawerOpen}
                    mode={drawerMode}
                    client={drawerMode === 'edit' ? selectedClient : null}
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
                        <div className="mb-4 rounded-lg border border-[var(--danger)]/30 bg-[var(--danger)]/5 px-3 py-2 text-[11px] text-[var(--danger)]">
                            {t('clients.deleteHasProjects', 'This client has {count} linked project(s). Deleting will remove them all.', { count: String(deleteTarget.projectsCount) })}
                        </div>
                    ) : null}
                    <div className="flex justify-end gap-2">
                        <AppButton variant="bordered" onPress={() => setDeleteTarget(null)}>
                            {t('clients.cancel')}
                        </AppButton>
                        <AppButton color="danger" variant="solid" className="bg-[var(--danger)] text-white hover:bg-[var(--danger-hover)]" onPress={confirmDelete}>
                            {t('clients.delete')}
                        </AppButton>
                    </div>
                </AppModal>

                <AppModal
                    isOpen={showBulkDeleteConfirm}
                    onOpenChange={setShowBulkDeleteConfirm}
                    title={t('clients.bulkDeleteTitle')}
                >
                    <p className="mb-5 text-sm text-[var(--text-muted)]">{t('clients.bulkDeleteDescription', { count: selectedClientIds.size })}</p>
                    <div className="flex justify-end gap-2">
                        <AppButton variant="bordered" onPress={() => setShowBulkDeleteConfirm(false)}>{t('clients.cancel')}</AppButton>
                        <AppButton color="danger" variant="solid" className="bg-[var(--danger)] text-white hover:bg-[var(--danger-hover)]" onPress={confirmBulkDelete}>{t('clients.delete')}</AppButton>
                    </div>
                </AppModal>
            </AppShell>
        </>
    );
}
