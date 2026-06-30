import { Head, router } from '@inertiajs/react';
import {
    ArrowRight,
    BriefcaseBusiness,
    FolderKanban,
    Mail,
    Pencil,
    Phone,
    Plus,
    Search,
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

<section className="crm-panel p-4">
                    <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                            <div className="flex flex-wrap gap-2">
                                {statusOptions.map((option) => (
                                    <button
                                        key={option.id}
                                        type="button"
                                        onClick={() => setStatusFilter(option.id)}
                                        className={[
                                            'inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition',
                                            statusFilter === option.id
                                                ? 'border-[var(--crm-accent)] bg-[color-mix(in_srgb,var(--crm-accent)_22%,transparent)] text-[var(--crm-accent)]'
                                                : 'border-[var(--crm-border)] bg-[var(--crm-elevated)] text-[var(--crm-text-muted)] hover:text-[var(--crm-text)]',
                                        ].join(' ')}
                                    >
                                        {option.label}
                                        <span className="rounded-full bg-black/25 px-2 py-0.5 text-xs">{option.count}</span>
                                    </button>
                                ))}
                            </div>

                            <div className="relative min-w-0 xl:w-[420px]">
                                <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--crm-muted)]" size={16} />
                                <input
                                    value={query}
                                    onChange={(event) => setQuery(event.target.value)}
                                    placeholder="Search clients, CIN, phone, email..."
                                    className="crm-command-input h-11 w-full pl-11"
                                />
                            </div>
                        </div>
                    </section>

                    <section className="grid min-w-0 gap-6 2xl:grid-cols-[minmax(0,1fr)_380px]">
                        <div className="crm-panel min-w-0 overflow-hidden">
                            <div className="flex items-center justify-between border-b border-[var(--crm-border)] px-5 py-4">
                                <div>
                                    <h2 className="text-sm font-semibold text-[var(--crm-text)]">Client workspace</h2>
                                    <p className="text-xs text-[var(--crm-muted)]">{filteredClients.length} visible client(s)</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={openCreateDrawer}
                                    className="crm-action-button border-[var(--crm-border)] text-[var(--crm-accent)]"
                                >
                                    <Plus size={14} />
                                    Client
                                </button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="crm-table">
                                    <thead>
                                        <tr>
                                            <th>Client</th>
                                            <th>CIN</th>
                                            <th>Contact</th>
                                            <th>Intermediary</th>
                                            <th>Projects</th>
                                            <th>Status</th>
                                            <th>Updated</th>
                                            <th className="text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pagedClients.map((client) => {
                                            const selected = activeClient?.id === client.id;

                                            return (
                                                <tr
                                                    key={client.id}
                                                    onClick={() => setSelectedClient(client)}
                                                    className={selected ? 'bg-[color-mix(in_srgb,var(--crm-accent)_12%,transparent)]' : undefined}
                                                >
                                                    <td>
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--crm-accent)_16%,transparent)] text-xs font-black text-[var(--crm-accent)]">
                                                                {initials(client)}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="max-w-[220px] truncate font-semibold text-[var(--crm-text)]">{client.fullName}</p>
                                                                <p className="text-xs text-[var(--crm-muted)]">{client.clientNumber}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-2 py-1 text-xs font-semibold text-blue-300">
                                                            {client.cin || '-'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div className="grid gap-1 text-xs text-[var(--crm-muted)]">
                                                            <span>{formatContact(client.phone)}</span>
                                                            <span>{formatContact(client.email)}</span>
                                                        </div>
                                                    </td>
                                                    <td>{client.intermediaryName || '-'}</td>
                                                    <td>
                                                        <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-xs font-semibold text-emerald-300">
                                                            {client.projectsCount} project(s)
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className={`rounded-full border px-2 py-1 text-xs font-semibold ${statusClass(client.status)}`}>
                                                            {client.status}
                                                        </span>
                                                    </td>
                                                    <td>{client.updatedAt || '-'}</td>
                                                    <td>
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                type="button"
                                                                className="crm-action-button"
                                                                onClick={(event) => {
                                                                    event.stopPropagation();
                                                                    router.visit(`/clients/${client.id}`);
                                                                }}
                                                            >
                                                                Open
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="crm-action-button"
                                                                onClick={(event) => {
                                                                    event.stopPropagation();
                                                                    openEditDrawer(client);
                                                                }}
                                                            >
                                                                <Pencil size={14} />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="crm-action-button text-red-300"
                                                                onClick={(event) => {
                                                                    event.stopPropagation();
                                                                    deleteClient(client);
                                                                }}
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {filteredClients.length === 0 ? (
                                <div className="px-4 py-12 text-center text-sm text-[var(--crm-muted)]">
                                    No clients match the current filters.
                                </div>
                            ) : null}
                        </div>

                        <aside className="crm-panel h-fit overflow-hidden">
                            {activeClient ? (
                                <>
                                    <div className="border-b border-[var(--crm-border)] p-4">
                                        <p className="crm-eyebrow">Selected client</p>
                                        <div className="mt-3 flex items-start gap-3">
                                            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--crm-accent)_18%,transparent)] text-sm font-black text-[var(--crm-accent)]">
                                                {initials(activeClient)}
                                            </div>
                                            <div className="min-w-0">
                                                <h2 className="truncate text-lg font-black text-[var(--crm-text)]">{activeClient.fullName}</h2>
                                                <p className="text-sm text-[var(--crm-muted)]">{activeClient.clientNumber}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid gap-3 p-4">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="rounded-xl border border-[var(--crm-border)] bg-[var(--crm-elevated)] p-3">
                                                <p className="crm-kpi-label">CIN</p>
                                                <p className="mt-2 truncate text-sm font-bold">{activeClient.cin || '-'}</p>
                                            </div>
                                            <div className="rounded-xl border border-[var(--crm-border)] bg-[var(--crm-elevated)] p-3">
                                                <p className="crm-kpi-label">Projects</p>
                                                <p className="mt-2 text-sm font-bold text-[var(--crm-accent)]">{activeClient.projectsCount}</p>
                                            </div>
                                        </div>

                                        <div className="rounded-xl border border-[var(--crm-border)] bg-[var(--crm-elevated)] p-3">
                                            <p className="crm-kpi-label">Contact</p>
                                            <div className="mt-3 grid gap-2 text-sm text-[var(--crm-muted)]">
                                                <span className="flex items-center gap-2"><Phone size={14} />{formatContact(activeClient.phone)}</span>
                                                <span className="flex items-center gap-2"><Mail size={14} />{formatContact(activeClient.email)}</span>
                                            </div>
                                        </div>

                                        <div className="rounded-xl border border-[var(--crm-border)] bg-[var(--crm-elevated)] p-3">
                                            <p className="crm-kpi-label">Intermediary</p>
                                            <p className="mt-2 text-sm font-semibold">{activeClient.intermediaryName || '-'}</p>
                                        </div>

                                        <div className="rounded-xl border border-[var(--crm-border)] bg-[var(--crm-elevated)] p-3">
                                            <p className="crm-kpi-label">Address</p>
                                            <p className="mt-2 text-sm leading-5 text-[var(--crm-muted)]">{activeClient.address || 'No address saved.'}</p>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => router.visit(`/clients/${activeClient.id}`)}
                                            className="crm-action-button justify-center border-[var(--crm-accent)] bg-[color-mix(in_srgb,var(--crm-accent)_18%,transparent)] py-3 text-[var(--crm-accent)]"
                                        >
                                            Open client workspace
                                            <ArrowRight size={15} />
                                        </button>

                                        <div className="grid grid-cols-2 gap-2">
                                            <button type="button" className="crm-action-button justify-center py-3" onClick={() => openEditDrawer(activeClient)}>
                                                <Pencil size={15} />
                                                Edit
                                            </button>
                                            <button type="button" className="crm-action-button justify-center py-3" onClick={() => router.visit('/dossiers')}>
                                                <FolderKanban size={15} />
                                                Project
                                            </button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="p-8 text-center text-sm text-[var(--crm-muted)]">Select a client.</div>
                            )}
                        </aside>

                        <AppPagination page={tablePage} pageSize={TABLE_PAGE_SIZE} total={filteredClients.length} onChange={setTablePage} />
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