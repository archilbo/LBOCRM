import { Head, router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import {
    CheckCircle2,
    Download,
    Eye,
    FileText,
    Pencil,
    Plus,
    RefreshCcw,
    Trash2,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from '@/lib/i18n';
import type { FormErrors } from '@/lib/formErrors';
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
import { ContractDrawer } from '@/features/contracts/drawers/ContractDrawer';
import type {
    ContractDossierOption,
    ContractFormPayload,
    ContractRow,
    ContractStatus,
} from '@/features/contracts/types';
import { countByValue, filterByValue } from '@/lib/filters';

type PageProps = {
    contracts: ContractRow[];
    dossiers: ContractDossierOption[];
    metrics: {
        total: number;
        draft: number;
        generated: number;
        signed: number;
        totalTtc: number;
    };
};

type BadgeTone = 'neutral' | 'blue' | 'green' | 'amber' | 'red' | 'violet';

function formatMoney(value: number) {
    return new Intl.NumberFormat('en-MA', {
        style: 'currency',
        currency: 'MAD',
        maximumFractionDigits: 0,
    }).format(value);
}

function getStatusTone(status: ContractStatus): BadgeTone {
    switch (status) {
        case 'draft':
            return 'amber';
        case 'generated':
            return 'violet';
        case 'signed':
            return 'green';
        case 'cancelled':
            return 'red';
        default:
            return 'neutral';
    }
}

function getStatusIcon(status: ContractStatus): 'dot' | 'check' | 'clock' | 'warning' {
    switch (status) {
        case 'signed':
            return 'check';
        case 'cancelled':
            return 'warning';
        case 'draft':
        case 'generated':
            return 'clock';
        default:
            return 'dot';
    }
}

function toBackendPayload(payload: ContractFormPayload) {
    return {
        dossier_id: payload.dossierId,
        status: payload.status || 'draft',
        surface: payload.surface || null,
        price_per_square_meter: payload.pricePerSquareMeter || null,
        notes: payload.notes || null,
    };
}

export default function ContractsIndex({
    contracts,
    dossiers,
    metrics,
}: PageProps) {
    const { t } = useTranslation();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all');
    const [formErrors, setFormErrors] = useState<FormErrors>({});
    const [drawerMode, setDrawerMode] = useState<'create' | 'edit'>('create');
    const [selectedContract, setSelectedContract] = useState<ContractRow | null>(
        contracts[0] ?? null,
    );

    const filteredContracts = useMemo(
        () => filterByValue(contracts, statusFilter, (contract) => contract.status),
        [contracts, statusFilter],
    );

    const statusOptions = useMemo(
        () => [
            { id: 'all', label: 'All', count: contracts.length },
            { id: 'draft', label: 'Draft', count: countByValue(contracts, (contract) => contract.status, 'draft') },
            { id: 'generated', label: 'Generated', count: countByValue(contracts, (contract) => contract.status, 'generated') },
            { id: 'signed', label: 'Signed', count: countByValue(contracts, (contract) => contract.status, 'signed') },
            { id: 'cancelled', label: 'Cancelled', count: countByValue(contracts, (contract) => contract.status, 'cancelled') },
        ],
        [contracts],
    );
    function openCreateDrawer() {
        setSelectedContract(null);
        setDrawerMode('create');
        setFormErrors({});
        setFormErrors({});
        setDrawerOpen(true);
    }

    function openEditDrawer(contract: ContractRow) {
        setSelectedContract(contract);
        setDrawerMode('edit');
        setFormErrors({});
        setFormErrors({});
        setDrawerOpen(true);
    }

    function handleSubmit(payload: ContractFormPayload) {
        const backendPayload = toBackendPayload(payload);

        if (drawerMode === 'edit' && selectedContract) {
            router.put(`/contracts/${selectedContract.id}`, backendPayload, {
                preserveScroll: true,
                onSuccess: () => {
                    setDrawerOpen(false);
                    setFormErrors({});
                    toast.success('Contract updated successfully.');
                },
                onError: () => toast.error('Please check contract form errors.'),
            });

            return;
        }

        router.post('/contracts', backendPayload, {
            preserveScroll: true,
            onSuccess: () => {
                setDrawerOpen(false);
                    setFormErrors({});
                toast.success('Contract created successfully.');
            },
            onError: (errors) => {
                    setFormErrors(errors as FormErrors);
                    toast.error('Please check contract form errors. Maybe this dossier already has a contract.');
                },
        });
    }

    function generateContract(contract: ContractRow) {
        router.put(`/contracts/${contract.id}/generate`, {}, {
            preserveScroll: true,
            onSuccess: () => toast.success('Contract generated successfully.'),
            onError: () => toast.error('Contract could not be generated.'),
        });
    }

    function downloadGenerated(contract: ContractRow) {
        window.location.href = `/contracts/${contract.id}/download/generated`;
    }

    function downloadPdf(contract: ContractRow) {
        window.location.href = `/contracts/${contract.id}/download/pdf`;
    }

    function markSigned(contract: ContractRow) {
        router.put(`/contracts/${contract.id}/signed`, {}, {
            preserveScroll: true,
            onSuccess: () => toast.success('Contract marked as signed.'),
            onError: () => toast.error('Contract could not be marked as signed.'),
        });
    }

    function deleteContract(contract: ContractRow) {
        const confirmed = window.confirm(`Delete ${contract.contractNumber}?`);

        if (!confirmed) {
            return;
        }

        router.delete(`/contracts/${contract.id}`, {
            preserveScroll: true,
            onSuccess: () => toast.success('Contract deleted successfully.'),
            onError: () => toast.error('Contract could not be deleted.'),
        });
    }

    const columns = useMemo<ColumnDef<ContractRow, unknown>[]>(
        () => [
            {
                accessorKey: 'contractNumber',
                header: 'Contract',
                cell: ({ row }) => (
                    <div className="app-table-primary-cell">
                        <div className="flex items-center gap-2">
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] text-[var(--accent)]">
                                <FileText size={15} />
                            </div>

                            <div className="min-w-0">
                                <p className="max-w-[220px] truncate text-sm font-semibold">
                                    {row.original.contractNumber}
                                </p>
                                <p className="text-xs text-[var(--text-muted)]">
                                    {row.original.dossierNumber}
                                </p>
                            </div>
                        </div>
                    </div>
                ),
            },
            {
                accessorKey: 'projectObject',
                header: 'Project',
                cell: ({ row }) => (
                    <div>
                        <p className="max-w-[240px] truncate text-sm font-medium">
                            {row.original.projectObject}
                        </p>
                        <p className="text-xs text-[var(--text-muted)]">
                            {row.original.clientName}
                        </p>
                    </div>
                ),
            },
            {
                accessorKey: 'surface',
                header: 'Surface',
                cell: ({ row }) => (
                    <AppBadge tone="blue">{row.original.surface} mÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â²</AppBadge>
                ),
            },
            {
                accessorKey: 'ttc',
                header: 'TTC',
                cell: ({ row }) => (
                    <span className="text-sm font-semibold">
                        {formatMoney(row.original.ttc)}
                    </span>
                ),
            },
            {
                accessorKey: 'status',
                header: 'Status',
                cell: ({ row }) => (
                    <AppStatusBadge
                        label={row.original.status}
                        tone={getStatusTone(row.original.status)}
                        icon={getStatusIcon(row.original.status)}
                    />
                ),
            },
            {
                accessorKey: 'generatedAt',
                header: 'Generated',
                cell: ({ row }) => (
                    <span className="text-sm text-[var(--text-muted)]">
                        {row.original.generatedAt || '-'}
                    </span>
                ),
            },
            {
                id: 'actions',
                header: 'Actions',
                cell: ({ row }) => (
                    <AppTableActions>
                        <AppTableActionButton
                            label="Preview"
                            tone="view"
                            onPress={() => setSelectedContract(row.original)}
                        >
                            <Eye size={15} />
                        </AppTableActionButton>

                        <AppTableActionButton
                            label="Edit"
                            tone="edit"
                            onPress={() => openEditDrawer(row.original)}
                        >
                            <Pencil size={15} />
                        </AppTableActionButton>

                        <AppTableActionButton
                            label="Generate"
                            tone="create"
                            onPress={() => generateContract(row.original)}
                        >
                            <RefreshCcw size={15} />
                        </AppTableActionButton>

                        <AppTableActionButton
                            label="Signed"
                            tone="archive"
                            onPress={() => markSigned(row.original)}
                        >
                            <CheckCircle2 size={15} />
                        </AppTableActionButton>

                        <AppTableActionButton
                            label="Download DOCX"
                            tone="documents"
                            onPress={() => downloadGenerated(row.original)}
                        >
                            <Download size={15} />
                        </AppTableActionButton>

                        <AppTableActionButton
                            label="Download PDF"
                            tone="create"
                            onPress={() => downloadPdf(row.original)}
                        >
                            <FileText size={15} />
                        </AppTableActionButton>

                        <AppTableActionButton
                            label="Delete"
                            tone="delete"
                            onPress={() => deleteContract(row.original)}
                        >
                            <Trash2 size={15} />
                        </AppTableActionButton>
                    </AppTableActions>
                ),
            },
        ],
        [],
    );

    const metricCards = [
        {
            label: 'Total TTC',
            value: formatMoney(metrics.totalTtc),
        },
        {
            label: 'Contracts',
            value: metrics.total,
        },
        {
            label: 'Generated',
            value: metrics.generated,
        },
        {
            label: 'Signed',
            value: metrics.signed,
        },
    ];

    return (
        <>
            <Head title="Contracts" />

            <AppShell
                eyebrowKey="contractsWorkspace.eyebrow"
                titleKey="contractsWorkspace.title"
                subtitleKey="contractsWorkspace.subtitle"
                action={
                    <AppButton variant="primary" onPress={openCreateDrawer}>
                        <Plus size={16} />
                        New contract
                    </AppButton>
                }
            >
                <AppFilterBar
                    label="Contract status"
                    value={statusFilter}
                    options={statusOptions}
                    onChange={setStatusFilter}
                />
                <section className="grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {metricCards.map((metric) => (
                        <AppCard key={metric.label} className="p-4">
                            <p className="text-sm text-[var(--text-muted)]">{metric.label}</p>
                            <p className="mt-3 truncate text-2xl font-semibold">{metric.value}</p>
                        </AppCard>
                    ))}
                </section>

                <section className="grid min-w-0 gap-5 2xl:grid-cols-[minmax(0,1fr)_340px]">
                    <div className="min-w-0">
                        <AppDataTable
                            data={filteredContracts}
                            columns={columns}
                            searchPlaceholder="Search by contract, dossier, project, client, or status..."
                            emptyTitle="No contracts found"
                            emptyDescription="Create the first contract from an existing project."
                            pageSize={8}
                        />
                    </div>

                    <aside className="min-w-0 space-y-5 2xl:sticky 2xl:top-24 2xl:self-start">
                        <AppCard className="p-5">
                            <div className="mb-4 flex items-start gap-3">
                                <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] text-[var(--accent)]">
                                    <FileText size={18} />
                                </div>

                                <div className="min-w-0">
                                    <h2 className="text-sm font-semibold">Contract preview</h2>
                                    <p className="mt-1 text-sm text-[var(--text-muted)]">
                                        Selected contract information.
                                    </p>
                                </div>
                            </div>

                            {selectedContract ? (
                                <div className="space-y-3">
                                    <div className="rounded-2xl border bg-[var(--surface)] p-4">
                                        <p className="text-xs text-[var(--text-muted)]">Contract</p>
                                        <p className="mt-1 text-sm font-semibold">
                                            {selectedContract.contractNumber}
                                        </p>
                                        <p className="mt-1 text-xs text-[var(--text-muted)]">
                                            {selectedContract.dossierNumber}
                                        </p>
                                    </div>

                                    <div className="rounded-2xl border bg-[var(--surface)] p-4">
                                        <p className="text-xs text-[var(--text-muted)]">Project</p>
                                        <p className="mt-1 text-sm font-semibold">
                                            {selectedContract.projectObject}
                                        </p>
                                        <p className="mt-1 text-xs text-[var(--text-muted)]">
                                            {selectedContract.clientName}
                                        </p>
                                    </div>

                                    <div className="grid gap-2 md:grid-cols-2 2xl:grid-cols-1">
                                        <div className="rounded-2xl border bg-[var(--surface)] p-4">
                                            <p className="text-xs text-[var(--text-muted)]">HT</p>
                                            <p className="mt-1 text-sm font-semibold">
                                                {formatMoney(selectedContract.ht)}
                                            </p>
                                        </div>

                                        <div className="rounded-2xl border bg-[var(--surface)] p-4">
                                            <p className="text-xs text-[var(--text-muted)]">TVA</p>
                                            <p className="mt-1 text-sm font-semibold">
                                                {formatMoney(selectedContract.tva)}
                                            </p>
                                        </div>

                                        <div className="rounded-2xl border bg-[var(--surface)] p-4">
                                            <p className="text-xs text-[var(--text-muted)]">TTC</p>
                                            <p className="mt-1 text-sm font-semibold">
                                                {formatMoney(selectedContract.ttc)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <AppStatusBadge
                                            label={selectedContract.status}
                                            tone={getStatusTone(selectedContract.status)}
                                            icon={getStatusIcon(selectedContract.status)}
                                        />
                                        <AppBadge tone={selectedContract.hasGeneratedDocument ? 'green' : 'amber'}>
                                            {selectedContract.hasGeneratedDocument ? 'Generated file' : 'No file'}
                                        </AppBadge>
                                    </div>

                                    <div className="grid gap-2">
                                        <AppButton
                                            variant="primary"
                                            onPress={() => generateContract(selectedContract)}
                                        >
                                            <RefreshCcw size={16} />
                                            Generate
                                        </AppButton>

                                        <AppButton
                                            variant="secondary"
                                            onPress={() => downloadGenerated(selectedContract)}
                                        >
                                            <Download size={16} />
                                            Download
                                        </AppButton>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-[var(--text-muted)]">
                                    Select a contract from the table.
                                </p>
                            )}
                        </AppCard>
                    </aside>
                </section>

                <ContractDrawer
                    isOpen={drawerOpen}
                    mode={drawerMode}
                    contract={selectedContract}
                    dossiers={dossiers}
                    onOpenChange={setDrawerOpen}
                    onSubmit={handleSubmit}
                    errors={formErrors}
                />
            </AppShell>
        </>
    );
}