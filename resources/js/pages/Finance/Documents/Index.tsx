import { Head, router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { FileSpreadsheet, Plus, Trash2, WandSparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { AppShell } from '@/components/layout/AppShell';
import { AppBadge } from '@/components/ui/AppBadge';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppConfirmDialog } from '@/components/ui/AppConfirmDialog';
import { AppDataTable } from '@/components/ui/AppDataTable';
import { AppStatusBadge } from '@/components/ui/AppStatusBadge';
import { AppTableActionButton } from '@/components/ui/AppTableActionButton';
import { AppTableActions } from '@/components/ui/AppTableActions';
import { useTranslation } from '@/lib/i18n';
import { FinanceDocumentDrawer } from '@/features/finance/drawers/FinanceDocumentDrawer';
import type {
    FinanceDocFormPayload,
} from '@/features/finance/drawers/FinanceDocumentDrawer';
import type { FinanceDocRow } from '@/features/finance/types';
import type { FormErrors } from '@/lib/formErrors';

type PaginatedData = {
    data: FinanceDocRow[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
};

type Option = { id: string; label: string };

type PageProps = {
    documents: PaginatedData;
    metrics: {
        totalTtc: number;
        paidTotal: number;
        remainingTotal: number;
        draftCount: number;
    };
    clients: Option[];
    dossiers: Option[];
    filters: {
        type?: string;
        status?: string;
        search?: string;
    };
};

const typeColors: Record<string, 'blue' | 'amber' | 'green'> = {
    quote: 'blue',
    invoice: 'amber',
    receipt: 'green',
};

const statusColors: Record<string, 'gray' | 'blue' | 'green' | 'amber' | 'red'> = {
    draft: 'gray',
    sent: 'blue',
    accepted: 'green',
    rejected: 'red',
    partially_paid: 'amber',
    paid: 'green',
    overdue: 'red',
    cancelled: 'gray',
};

const fieldKey = (type: string) => {
    switch (type) {
        case 'quote':
            return 'financeWorkspace.type.devis';
        case 'invoice':
            return 'financeWorkspace.type.invoice';
        case 'receipt':
            return 'financeWorkspace.type.payment';
        default:
            return type;
    }
};

const statusKey = (status: string) => `financeWorkspace.status.${status}`;

export default function FinanceDocumentsIndex({
    documents,
    metrics,
    clients,
    dossiers,
}: PageProps) {
    const { t } = useTranslation();
    const [search, setSearch] = useState('');
    const [deleteTarget, setDeleteTarget] = useState<FinanceDocRow | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [formErrors, setFormErrors] = useState<FormErrors>({});

    const columns = useMemo<ColumnDef<FinanceDocRow>[]>(
        () => [
            {
                header: 'Document',
                accessorKey: 'number',
                cell: ({ row }) => (
                    <div>
                        <div className="font-medium text-[var(--text)]">
                            {row.original.number}
                        </div>
                        <div className="text-xs text-[var(--text-muted)]">
                            {row.original.clientName}
                        </div>
                    </div>
                ),
            },
            {
                header: 'Project',
                accessorKey: 'dossierNumber',
                cell: ({ row }) => (
                    <div>
                        <div className="text-sm text-[var(--text)]">
                            {row.original.dossierNumber || '-'}
                        </div>
                        <div className="text-xs text-[var(--text-muted)] truncate max-w-[200px]">
                            {row.original.projectObject || '-'}
                        </div>
                    </div>
                ),
            },
            {
                header: 'Type',
                accessorKey: 'type',
                meta: { className: 'w-24' },
                cell: ({ row }) => (
                    <AppBadge
                        variant={typeColors[row.original.type] ?? 'gray'}
                    >
                        {t(fieldKey(row.original.type))}
                    </AppBadge>
                ),
            },
            {
                header: 'Total TTC',
                accessorKey: 'totalTtc',
                meta: { className: 'w-28 text-right' },
                cell: ({ row }) => (
                    <span className="font-mono text-sm tabular-nums">
                        {row.original.totalTtc.toLocaleString('fr-FR', {
                            minimumFractionDigits: 2,
                        })}{' '}
                        {row.original.currency}
                    </span>
                ),
            },
            {
                header: 'Paid',
                accessorKey: 'paidTotal',
                meta: { className: 'w-24 text-right' },
                cell: ({ row }) => (
                    <span className="font-mono text-sm tabular-nums text-[var(--success)]">
                        {row.original.paidTotal.toLocaleString('fr-FR', {
                            minimumFractionDigits: 2,
                        })}
                    </span>
                ),
            },
            {
                header: 'Remaining',
                accessorKey: 'remainingTotal',
                meta: { className: 'w-24 text-right' },
                cell: ({ row }) => (
                    <span className="font-mono text-sm tabular-nums text-[var(--danger)]">
                        {row.original.remainingTotal.toLocaleString('fr-FR', {
                            minimumFractionDigits: 2,
                        })}
                    </span>
                ),
            },
            {
                header: 'Status',
                accessorKey: 'status',
                meta: { className: 'w-28' },
                cell: ({ row }) => (
                    <AppStatusBadge
                        status={row.original.status}
                        color={statusColors[row.original.status] ?? 'gray'}
                        labelKey={statusKey(row.original.status)}
                    />
                ),
            },
            {
                header: 'Actions',
                id: 'actions',
                meta: { className: 'w-24 text-right' },
                cell: ({ row }) => (
                    <AppTableActions>
                        {!row.original.hasGeneratedFile ? (
                            <AppTableActionButton
                                icon={WandSparkles}
                                label="Generate"
                                tone="primary"
                                onPress={() => handleGenerate(row.original)}
                            />
                        ) : null}
                        {row.original.downloadUrl ? (
                            <AppTableActionButton
                                icon={FileSpreadsheet}
                                label="Download"
                                tone="primary"
                                onPress={() =>
                                    window.open(
                                        row.original.downloadUrl!,
                                        '_blank',
                                    )
                                }
                            />
                        ) : null}
                        <AppTableActionButton
                            icon={Trash2}
                            label="Delete"
                            tone="danger"
                            onPress={() => setDeleteTarget(row.original)}
                        />
                    </AppTableActions>
                ),
            },
        ],
        [t],
    );

    function handleSearch(value: string) {
        setSearch(value);
        router.get(
            '/finance/documents',
            { search: value || undefined },
            { preserveState: true, replace: true },
        );
    }

    function handleSubmit(payload: FinanceDocFormPayload) {
        setFormErrors({});
        router.post('/finance/documents', payload, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Document created.');
                setDrawerOpen(false);
                setFormErrors({});
            },
            onError: (err) => {
                setFormErrors(err);
                toast.error('Failed to create document.');
            },
        });
    }

    function handleGenerate(doc: FinanceDocRow) {
        router.put(
            `/finance/documents/${doc.id}/generate`,
            {},
            {
                onSuccess: () => toast.success('Document generated.'),
                onError: () => toast.error('Generation failed.'),
            },
        );
    }

    function handleDelete() {
        if (!deleteTarget) return;
        router.delete(`/finance/documents/${deleteTarget.id}`, {
            onSuccess: () => {
                toast.success('Document deleted.');
                setDeleteTarget(null);
            },
            onError: () => {
                toast.error('Failed to delete document.');
                setDeleteTarget(null);
            },
        });
    }

    return (
        <>
            <Head title="Finance Documents" />

            <AppShell
                eyebrowKey="financeWorkspace.eyebrow"
                titleKey="financeWorkspace.title"
                subtitleKey="financeWorkspace.subtitle"
                action={
                    <AppButton
                        variant="primary"
                        onPress={() => setDrawerOpen(true)}
                    >
                        <Plus size={16} />
                        New document
                    </AppButton>
                }
            >
                <div className="mb-6 grid gap-4 sm:grid-cols-4">
                    <AppCard>
                        <p className="text-xs text-[var(--text-muted)]">
                            Total TTC
                        </p>
                        <p className="mt-1 text-xl font-bold text-[var(--text)]">
                            {metrics.totalTtc.toLocaleString('fr-FR', {
                                minimumFractionDigits: 2,
            })}{' '}
                            MAD
                        </p>
                    </AppCard>
                    <AppCard>
                        <p className="text-xs text-[var(--text-muted)]">Paid</p>
                        <p className="mt-1 text-xl font-bold text-[var(--success)]">
                            {metrics.paidTotal.toLocaleString('fr-FR', {
                                minimumFractionDigits: 2,
                            })}{' '}
                            MAD
                        </p>
                    </AppCard>
                    <AppCard>
                        <p className="text-xs text-[var(--text-muted)]">
                            Remaining
                        </p>
                        <p className="mt-1 text-xl font-bold text-[var(--danger)]">
                            {metrics.remainingTotal.toLocaleString('fr-FR', {
                                minimumFractionDigits: 2,
                            })}{' '}
                            MAD
                        </p>
                    </AppCard>
                    <AppCard>
                        <p className="text-xs text-[var(--text-muted)]">
                            Drafts
                        </p>
                        <p className="mt-1 text-xl font-bold text-[var(--text)]">
                            {metrics.draftCount}
                        </p>
                    </AppCard>
                </div>

                <AppDataTable
                    columns={columns}
                    data={documents.data}
                    searchValue={search}
                    onSearchChange={handleSearch}
                    searchPlaceholder="Search documents..."
                    pagination={{
                        currentPage: documents.current_page,
                        lastPage: documents.last_page,
                        perPage: documents.per_page,
                        total: documents.total,
                        onPageChange: (page) =>
                            router.get(
                                '/finance/documents',
                                { page },
                                { preserveState: true, replace: true },
                            ),
                    }}
                />
            </AppShell>

            <FinanceDocumentDrawer
                isOpen={drawerOpen}
                mode="create"
                clients={clients}
                dossiers={dossiers}
                onOpenChange={setDrawerOpen}
                onSubmit={handleSubmit}
                errors={formErrors}
            />

            <AppConfirmDialog
                isOpen={!!deleteTarget}
                title="Delete document?"
                description={`Are you sure you want to delete ${deleteTarget?.number}? This action cannot be undone.`}
                confirmLabel="Delete"
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
                variant="danger"
            />
        </>
    );
}
