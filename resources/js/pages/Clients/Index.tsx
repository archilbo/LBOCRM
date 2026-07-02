import { Head, router } from '@inertiajs/react';
import {
    ArrowRight,
    ArrowUpDown,
    BriefcaseBusiness,
    Building2,
    CalendarDays,
    CheckCircle2,
    FileText,
    FolderKanban,
    Mail,
    MoreVertical,
    Pencil,
    Phone,
    Plus,
    RefreshCw,
    Search,
    SlidersHorizontal,
    Trash2,
    UserRound,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { AppShell } from '@/components/layout/AppShell';
import { AppButton } from '@/components/ui/AppButton';
import { AppPagination } from '@/components/ui/AppPagination';
import { ClientDrawer } from '@/features/clients/drawers/ClientDrawer';
import type {
    ClientFormPayload,
    ClientRow,
    ClientStatus,
    IntermediaryOption,
} from '@/features/clients/types';
import type { FormErrors } from '@/lib/formErrors';

const FORCE_CLIENTS_REDESIGN_53J = true;

type PageProps = {
    clients: ClientRow[];
    intermediaries: IntermediaryOption[];
    metrics: {
        total: number;
        active: number;
        inactive: number;
        archived: number;
    };
};

function toBackendPayload(payload: ClientFormPayload, status: ClientStatus = 'active') {
    return {
        intermediary_id: payload.intermediaryId || null,
        civility: 'Mr',
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

function statusClass(status: string) {
    if (status === 'active') {
        return 'border-emerald-500/25 bg-emerald-500/10 text-emerald-300';
    }

    if (status === 'inactive') {
        return 'border-amber-500/25 bg-amber-500/10 text-amber-300';
    }

    return 'border-white/10 bg-white/5 text-[var(--crm-muted)]';
}

function initials(client: ClientRow) {
    const first = client.firstName?.charAt(0) ?? '';
    const last = client.lastName?.charAt(0) ?? '';
    const value = `${first}${last}`.trim();

    return value || client.fullName.slice(0, 2).toUpperCase();
}

function formatContact(value: string | null | undefined) {
    return value && value.trim() !== '' ? value : '-';
}

export default function ClientsIndex({ clients, intermediaries, metrics }: PageProps) {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [drawerMode, setDrawerMode] = useState<'create' | 'edit'>('create');
    const [selectedClient, setSelectedClient] = useState<ClientRow | null>(clients[0] ?? null);
    const [formErrors, setFormErrors] = useState<FormErrors>({});
    const [statusFilter, setStatusFilter] = useState<'all' | ClientStatus>('all');
    const [query, setQuery] = useState('');
    const [tablePage, setTablePage] = useState(1);
    const [selectedRows, setSelectedRows] = useState<number[]>([]);
    const TABLE_PAGE_SIZE = 15;

    const filteredClients = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();

        return clients.filter((client) => {
            const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
            const searchable = [
                client.fullName,
                client.clientNumber,
                client.cin,
                client.phone,
                client.email,
                client.intermediaryName,
                client.address,
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();

            return matchesStatus && (normalizedQuery === '' || searchable.includes(normalizedQuery));
        });
    }, [clients, query, statusFilter]);

    useEffect(() => {
        setTablePage(1);
    }, [query, statusFilter]);

    const pagedClients = useMemo(
        () => filteredClients.slice((tablePage - 1) * TABLE_PAGE_SIZE, tablePage * TABLE_PAGE_SIZE),
        [filteredClients, tablePage],
    );

    const activeClient = selectedClient && filteredClients.some((client) => client.id === selectedClient.id)
        ? selectedClient
        : filteredClients[0] ?? clients[0] ?? null;

    const allPageRowsSelected = pagedClients.length > 0 && pagedClients.every((client) => selectedRows.includes(client.id));

    const statusOptions = [
        { id: 'all' as const, label: 'All', count: clients.length },
        { id: 'active' as const, label: 'Active', count: metrics.active },
        { id: 'inactive' as const, label: 'Inactive', count: metrics.inactive },
        { id: 'archived' as const, label: 'Archived', count: metrics.archived },
    ];

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
                onSuccess: () => {
                    setDrawerOpen(false);
                    setFormErrors({});
                    toast.success('Client updated successfully.');
                },
                onError: (errors) => {
                    setFormErrors(errors as FormErrors);
                    toast.error('Please check client form errors.');
                },
            });

            return;
        }

        router.post('/clients', toBackendPayload(payload), {
            preserveScroll: true,
            onSuccess: () => {
                setDrawerOpen(false);
                setFormErrors({});
                toast.success('Client created successfully.');
            },
            onError: (errors) => {
                setFormErrors(errors as FormErrors);
                toast.error('Please check client form errors.');
            },
        });
    }

    function deleteClient(client: ClientRow) {
        if (!window.confirm(`Delete ${client.fullName}?`)) {
            return;
        }

        router.delete(`/clients/${client.id}`, {
            preserveScroll: true,
            onSuccess: () => toast.success('Client deleted successfully.'),
            onError: () => toast.error('Client could not be deleted.'),
        });
    }

    function toggleRow(clientId: number) {
        setSelectedRows((current) => (
            current.includes(clientId)
                ? current.filter((id) => id !== clientId)
                : [...current, clientId]
        ));
    }

    function togglePageRows() {
        setSelectedRows((current) => {
            const pageIds = pagedClients.map((client) => client.id);

            if (pageIds.every((id) => current.includes(id))) {
                return current.filter((id) => !pageIds.includes(id));
            }

            return Array.from(new Set([...current, ...pageIds]));
        });
    }

    return (
        <>
            <Head title="Clients" />

            <AppShell
                eyebrowKey="clients.eyebrow"
                titleKey="clients.title"
                subtitleKey="clients.subtitle"
                action={
                    <AppButton variant="primary" onPress={openCreateDrawer}>
                        <Plus size={16} />
                        New client
                    </AppButton>
                }
            >
                <div className="crm-page" data-ui-marker={FORCE_CLIENTS_REDESIGN_53J ? 'FORCE_CLIENTS_REDESIGN_53J' : undefined}>
                    <section className="crm-kpi-grid">
                        <div className="crm-kpi-card">
                            <p className="crm-kpi-label">Total clients</p>
                            <p className="crm-kpi-value">{metrics.total}</p>
                            <p className="mt-2 text-xs text-[var(--crm-muted)]">Registered client records</p>
                        </div>
                        <div className="crm-kpi-card">
                            <p className="crm-kpi-label">Active</p>
                            <p className="crm-kpi-value text-emerald-300">{metrics.active}</p>
                            <p className="mt-2 text-xs text-[var(--crm-muted)]">Can start new projects</p>
                        </div>
                        <div className="crm-kpi-card">
                            <p className="crm-kpi-label">Inactive</p>
                            <p className="crm-kpi-value text-amber-300">{metrics.inactive}</p>
                            <p className="mt-2 text-xs text-[var(--crm-muted)]">Needs review</p>
                        </div>
                        <div className="crm-kpi-card">
                            <p className="crm-kpi-label">Archived</p>
                            <p className="crm-kpi-value">{metrics.archived}</p>
                            <p className="mt-2 text-xs text-[var(--crm-muted)]">Closed relationships</p>
                        </div>
                    </section>

                    <section className="crm-reference-table-shell">
                        <div className="crm-reference-toolbar">
                            <div className="crm-reference-search">
                                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--crm-text-soft)]" size={14} />
                                <input
                                    value={query}
                                    onChange={(event) => setQuery(event.target.value)}
                                    placeholder="Search..."
                                />
                            </div>

                            <div className="crm-reference-toolbar-actions">
                                <button type="button" className="crm-reference-button" onClick={() => router.reload({ only: ['clients'] })}>
                                    <RefreshCw size={13} />
                                    Update
                                </button>
                                <button type="button" className="crm-reference-button">
                                    <SlidersHorizontal size={13} />
                                    Filter
                                </button>
                                <button type="button" className="crm-reference-button">
                                    <ArrowUpDown size={13} />
                                    Sort
                                </button>
                            </div>

                            <div className="crm-reference-filter-bar">
                                {statusOptions.map((option) => (
                                    <button
                                        key={option.id}
                                        type="button"
                                        onClick={() => setStatusFilter(option.id)}
                                        className={[
                                            'crm-reference-filter',
                                            statusFilter === option.id ? 'crm-reference-filter-active' : '',
                                        ].join(' ')}
                                    >
                                        {option.label}
                                        <span>{option.count}</span>
                                    </button>
                                ))}
                            </div>

                            <button type="button" className="crm-reference-button crm-reference-button-primary" onClick={openCreateDrawer}>
                                <Plus size={13} />
                                Add Client
                            </button>
                        </div>

                        <div className="crm-reference-table-card">
                            <div className="crm-reference-table-scroll">
                                <table className="crm-reference-table">
                                    <thead>
                                        <tr>
                                            <th className="w-10">
                                                <input
                                                    aria-label="Select visible clients"
                                                    type="checkbox"
                                                    className="crm-reference-check"
                                                    checked={allPageRowsSelected}
                                                    onChange={togglePageRows}
                                                />
                                            </th>
                                            <th><span className="crm-reference-header-cell"><UserRound size={13} /> Client Name <ArrowUpDown className="crm-reference-header-sort" size={10} /></span></th>
                                            <th><span className="crm-reference-header-cell"><FileText size={13} /> CIN <ArrowUpDown className="crm-reference-header-sort" size={10} /></span></th>
                                            <th><span className="crm-reference-header-cell"><Phone size={13} /> Contact</span></th>
                                            <th><span className="crm-reference-header-cell"><Building2 size={13} /> Intermediary <ArrowUpDown className="crm-reference-header-sort" size={10} /></span></th>
                                            <th><span className="crm-reference-header-cell"><BriefcaseBusiness size={13} /> Project</span></th>
                                            <th><span className="crm-reference-header-cell"><CheckCircle2 size={13} /> Status <ArrowUpDown className="crm-reference-header-sort" size={10} /></span></th>
                                            <th><span className="crm-reference-header-cell"><CalendarDays size={13} /> Updated <ArrowUpDown className="crm-reference-header-sort" size={10} /></span></th>
                                            <th className="text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pagedClients.map((client) => {
                                            const selected = selectedRows.includes(client.id);
                                            const statusVariant = client.status === 'active'
                                                ? 'crm-reference-status-success'
                                                : client.status === 'inactive'
                                                    ? 'crm-reference-status-warning'
                                                    : 'crm-reference-status-muted';

                                            return (
                                                <tr key={client.id} className={selected ? 'is-selected' : undefined}>
                                                    <td>
                                                        <input
                                                            aria-label={`Select ${client.fullName}`}
                                                            type="checkbox"
                                                            className="crm-reference-check"
                                                            checked={selected}
                                                            onChange={() => toggleRow(client.id)}
                                                        />
                                                    </td>
                                                    <td>
                                                        <button
                                                            type="button"
                                                            className="inline-flex max-w-[190px] items-center gap-2 text-left"
                                                            onClick={() => router.visit(`/clients/${client.id}`)}
                                                        >
                                                            <span className="crm-reference-avatar">{initials(client)}</span>
                                                            <span className="truncate font-semibold text-[var(--crm-text)]">{client.fullName}</span>
                                                        </button>
                                                    </td>
                                                    <td>{client.cin || '-'}</td>
                                                    <td>
                                                        <div className="grid gap-0.5">
                                                            <span>{formatContact(client.phone)}</span>
                                                            <span className="truncate text-[10px] text-[var(--crm-text-soft)]">{formatContact(client.email)}</span>
                                                        </div>
                                                    </td>
                                                    <td>{client.intermediaryName || '-'}</td>
                                                    <td>{client.projectsCount} project(s)</td>
                                                    <td>
                                                        <span className={`crm-reference-status ${statusVariant}`}>
                                                            {client.status}
                                                        </span>
                                                    </td>
                                                    <td>{client.updatedAt || '-'}</td>
                                                    <td>
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                type="button"
                                                                className="crm-reference-kebab"
                                                                onClick={() => setSelectedClient(client)}
                                                            >
                                                                <MoreVertical size={14} />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="crm-reference-kebab"
                                                                onClick={() => openEditDrawer(client)}
                                                            >
                                                                <Pencil size={13} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            <div className="crm-reference-mobile-list">
                                {pagedClients.map((client) => (
                                    <article key={client.id} className="crm-reference-mobile-card">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-bold">{client.fullName}</p>
                                                <p className="text-xs text-[var(--crm-text-muted)]">{client.clientNumber} / {client.cin || '-'}</p>
                                            </div>
                                            <span className={`crm-reference-status ${client.status === 'active' ? 'crm-reference-status-success' : 'crm-reference-status-muted'}`}>
                                                {client.status}
                                            </span>
                                        </div>
                                        <div className="mt-3 grid gap-1 text-xs text-[var(--crm-text-muted)]">
                                            <span>{formatContact(client.phone)}</span>
                                            <span>{client.projectsCount} project(s)</span>
                                            <span>{client.intermediaryName || 'No intermediary'}</span>
                                        </div>
                                        <div className="mt-3 flex gap-2">
                                            <button type="button" className="crm-reference-button flex-1" onClick={() => router.visit(`/clients/${client.id}`)}>Open</button>
                                            <button type="button" className="crm-reference-button" onClick={() => openEditDrawer(client)}>Edit</button>
                                        </div>
                                    </article>
                                ))}
                            </div>

                            {filteredClients.length === 0 ? (
                                <div className="px-4 py-12 text-center text-sm text-[var(--crm-text-muted)]">
                                    No clients match the current filters.
                                </div>
                            ) : null}

                            <AppPagination
                                page={tablePage}
                                pageSize={TABLE_PAGE_SIZE}
                                total={filteredClients.length}
                                onChange={setTablePage}
                                variant="reference"
                            />
                        </div>
                    </section>
                </div>

                <ClientDrawer
                    isOpen={drawerOpen}
                    mode={drawerMode}
                    client={drawerMode === 'edit' ? selectedClient : null}
                    intermediaries={intermediaries}
                    onOpenChange={setDrawerOpen}
                    onSubmit={handleSubmit}
                    errors={formErrors}
                />
            </AppShell>
        </>
    );
}
