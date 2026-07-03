import { Head, router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import {
    Eye,
    FolderPlus,
    Pencil,
    Plus,
    Trash2,
    UserRound,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import type { FormErrors } from '@/lib/formErrors';
import { countByValue, filterByValue } from '@/lib/filters';
import { toast } from 'sonner';
import { AppShell } from '@/components/layout/AppShell';
import { AppBadge } from '@/components/ui/AppBadge';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppDataTable } from '@/components/ui/AppDataTable';
import { AppFilterBar } from '@/components/ui/AppFilterBar';
import { AppStatusBadge } from '@/components/ui/AppStatusBadge';
import { AppTableActionButton } from '@/components/ui/AppTableActionButton';
import { AppTableActions } from '@/components/ui/AppTableActions';
import { ClientDrawer } from '@/features/clients/drawers/ClientDrawer';
import type {
    ClientFormPayload,
    ClientRow,
    ClientStatus,
    IntermediaryOption,
} from '@/features/clients/types';
import { useTranslation } from '@/lib/i18n';

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

type BadgeTone = 'neutral' | 'blue' | 'green' | 'amber' | 'red' | 'violet';

function getStatusTone(status: ClientStatus): BadgeTone {
    switch (status) {
        case 'active':
            return 'green';
        case 'inactive':
            return 'amber';
        case 'archived':
            return 'neutral';
        default:
            return 'neutral';
    }
}

function toBackendPayload(payload: ClientFormPayload) {
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
        status: 'active',
        notes: payload.notes || null,
    };
}

export default function ClientsIndex({
    clients,
    intermediaries,
    metrics,
}: PageProps) {
    const { t } = useTranslation();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all');
    const [formErrors, setFormErrors] = useState<FormErrors>({});
    const [drawerMode, setDrawerMode] = useState<'create' | 'edit'>('create');
    const [selectedClient, setSelectedClient] = useState<ClientRow | null>(null);

    function openCreateDrawer() {
        setSelectedClient(null);
        setDrawerMode('create');
        setFormErrors({});
        setFormErrors({});
        setDrawerOpen(true);
    }

    function openEditDrawer(client: ClientRow) {
        setSelectedClient(client);
        setDrawerMode('edit');
        setFormErrors({});
        setFormErrors({});
        setDrawerOpen(true);
    }

    function handleSubmit(payload: ClientFormPayload) {
        const backendPayload = toBackendPayload(payload);

        if (drawerMode === 'edit' && selectedClient) {
            router.put(`/clients/${selectedClient.id}`, backendPayload, {
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

        router.post('/clients', backendPayload, {
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
        const confirmed = window.confirm(`Delete ${client.fullName}?`);

        if (!confirmed) {
            return;
        }

        router.delete(`/clients/${client.id}`, {
            preserveScroll: true,
            onSuccess: () => toast.success('Client deleted successfully.'),
            onError: () => toast.error('Client could not be deleted.'),
        });
    }

    const filteredClients = useMemo(() => filterByValue(clients, statusFilter, (client) => client.status), [clients, statusFilter]);

    const statusOptions = useMemo(() => [
        { id: 'all', label: 'All', count: clients.length },
        { id: 'active', label: 'Active', count: countByValue(clients, (client) => client.status, 'active') },
        { id: 'inactive', label: 'Inactive', count: countByValue(clients, (client) => client.status, 'inactive') },
    ], [clients]);

    const columns = useMemo<ColumnDef<ClientRow, unknown>[]>(
        () => [
            {
                accessorKey: 'fullName',
                header: t('clients.table.client'),
                cell: ({ row }) => (
                    <div className="app-table-primary-cell">
                        <div className="flex items-center gap-2">
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] text-[var(--accent)]">
                                <UserRound size={15} />
                            </div>

                            <div className="min-w-0">
                                <p className="max-w-[240px] truncate text-sm font-semibold">
                                    {row.original.fullName}
                                </p>
                                <p className="text-xs text-[var(--text-muted)]">
                                    {row.original.clientNumber}
                                </p>
                            </div>
                        </div>
                    </div>
                ),
            },
            {
                accessorKey: 'cin',
                header: t('clients.table.cin'),
                cell: ({ row }) => (
                    <AppBadge tone="blue">{row.original.cin || '-'}</AppBadge>
                ),
            },
            {
                accessorKey: 'phone',
                header: t('clients.table.phone'),
                cell: ({ row }) => (
                    <span className="text-sm text-[var(--text-muted)]">
                        {row.original.phone || '-'}
                    </span>
                ),
            },
            {
                accessorKey: 'intermediaryName',
                header: t('clientFormExtra.intermediary'),
                cell: ({ row }) => (
                    <AppBadge tone="violet">{row.original.intermediaryName || '-'}</AppBadge>
                ),
            },
            {
                accessorKey: 'projectsCount',
                header: t('clients.table.projects'),
                cell: ({ row }) => (
                    <AppBadge tone="green">{row.original.projectsCount}</AppBadge>
                ),
            },
            {
                accessorKey: 'status',
                header: t('clients.table.status'),
                cell: ({ row }) => (
                    <AppStatusBadge
                        label={row.original.status}
                        tone={getStatusTone(row.original.status)}
                        icon={row.original.status === 'active' ? 'check' : 'clock'}
                    />
                ),
            },
            {
                accessorKey: 'updatedAt',
                header: t('clients.table.updated'),
                cell: ({ row }) => (
                    <span className="text-sm text-[var(--text-muted)]">
                        {row.original.updatedAt || '-'}
                    </span>
                ),
            },
            {
                id: 'actions',
                header: t('clients.table.actions'),
                cell: ({ row }) => (
                    <AppTableActions>
                        <AppTableActionButton
                            label={t('actions.view')}
                            tone="view"
                            onPress={() => router.visit(`/clients/${row.original.id}`)}
                        >
                            <Eye size={15} />
                        </AppTableActionButton>

                        <AppTableActionButton
                            label={t('actions.edit')}
                            tone="edit"
                            onPress={() => openEditDrawer(row.original)}
                        >
                            <Pencil size={15} />
                        </AppTableActionButton>

                        <AppTableActionButton
                            label="Create project"
                            tone="create"
                            onPress={() => router.visit('/dossiers')}
                        >
                            <FolderPlus size={15} />
                        </AppTableActionButton>

                        <AppTableActionButton
                            label={t('actions.delete')}
                            tone="delete"
                            onPress={() => deleteClient(row.original)}
                        >
                            <Trash2 size={15} />
                        </AppTableActionButton>
                    </AppTableActions>
                ),
            },
        ],
        [t],
    );

    const metricCards = [
        {
            label: t('clients.metrics.total'),
            value: metrics.total,
        },
        {
            label: t('clients.metrics.active'),
            value: metrics.active,
        },
        {
            label: t('clients.metrics.inactive'),
            value: metrics.inactive,
        },
        {
            label: t('clients.metrics.archived'),
            value: metrics.archived,
        },
    ];

    return (
        <>
            <Head title={t('clients.title')} />

            <AppShell
                eyebrowKey="clients.eyebrow"
                titleKey="clients.title"
                subtitleKey="clients.subtitle"
                action={
                    <AppButton variant="primary" onPress={openCreateDrawer}>
                        <Plus size={16} />
                        {t('clients.newClient')}
                    </AppButton>
                }
            >
                <AppFilterBar
                    label="Status filter"
                    value={statusFilter}
                    options={statusOptions}
                    onChange={setStatusFilter}
                />

                <section className="grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {metricCards.map((metric) => (
                        <AppCard key={metric.label} className="p-4">
                            <p className="text-sm text-[var(--text-muted)]">{metric.label}</p>
                            <p className="mt-3 text-2xl font-semibold">{metric.value}</p>
                        </AppCard>
                    ))}
                </section>

                <AppDataTable
                    data={filteredClients}
                    columns={columns}
                    searchPlaceholder={t('clients.searchPlaceholder')}
                    emptyTitle={t('clients.emptyTitle')}
                    emptyDescription={t('clients.emptyDescription')}
                    pageSize={8}
                />

                <ClientDrawer
                    isOpen={drawerOpen}
                    mode={drawerMode}
                    client={selectedClient}
                    intermediaries={intermediaries}
                    onOpenChange={setDrawerOpen}
                    onSubmit={handleSubmit}
                    errors={formErrors}
                />
            </AppShell>
        </>
    );
}