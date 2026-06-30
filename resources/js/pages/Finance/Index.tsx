import { Head, router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import {
    BadgeDollarSign,
    CheckCircle2,
    Download,
    Eye,
    FileSpreadsheet,
    FileText,
    Pencil,
    Plus,
    Trash2,
    WandSparkles,
} from 'lucide-react';
import { useMemo, useState } from 'react';
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
import { FinanceDrawer } from '@/features/finance/drawers/FinanceDrawer';
import { countByValue, filterByValue } from '@/lib/filters';
import type {
    FinanceDossierOption,
    FinanceFormPayload,
    FinanceRecordRow,
    FinanceRecordStatus,
    FinanceRecordType,
} from '@/features/finance/types';

type PageProps = {
    financeRecords: FinanceRecordRow[];
    dossiers: FinanceDossierOption[];
    metrics: {
        totalRecords: number;
        totalTtc: number;
        paid: number;
        remaining: number;
        overdue: number;
        draft: number;
        sent: number;
        paidCount: number;
        partiallyPaid: number;
        overdueCount: number;
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

function getStatusTone(status: FinanceRecordStatus): BadgeTone {
    switch (status) {
        case 'paid':
            return 'green';
        case 'sent':
            return 'blue';
        case 'partially_paid':
            return 'amber';
        case 'overdue':
            return 'red';
        case 'cancelled':
            return 'neutral';
        default:
            return 'violet';
    }
}

function getStatusIcon(status: FinanceRecordStatus): 'dot' | 'check' | 'clock' | 'warning' {
    switch (status) {
        case 'paid':
            return 'check';
        case 'overdue':
            return 'warning';
        case 'sent':
        case 'partially_paid':
            return 'clock';
        default:
            return 'dot';
    }
}

function getTypeTone(type: FinanceRecordType): BadgeTone {
    switch (type) {
        case 'invoice':
            return 'blue';
        case 'payment':
            return 'green';
        default:
            return 'violet';
    }
}

function toBackendPayload(payload: FinanceFormPayload) {
    return {
        dossier_id: payload.dossierId,
        type: payload.type || 'devis',
        status: payload.status || 'draft',
        ht: payload.ht || null,
        tva: payload.tva || null,
        total_ttc: payload.totalTtc || 0,
        paid: payload.paid || 0,
        issued_at: payload.issuedAt || null,
        due_date: payload.dueDate || null,
        paid_at: payload.paidAt || null,
        notes: payload.notes || null,
    };
}

function MiniBar({ value }: { value: number }) {
    return (
        <div className="h-2 overflow-hidden rounded-full bg-[var(--surface-2)]">
            <div
                className="h-full rounded-full bg-[var(--accent)]"
                style={{ width: `${Math.max(0, Math.min(value, 100))}%` }}
            />
        </div>
    );
}

export default function FinanceIndex({
    financeRecords,
    dossiers,
    metrics,
}: PageProps) {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [typeFilter, setTypeFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [drawerMode, setDrawerMode] = useState<'create' | 'edit'>('create');
    const [selectedRecord, setSelectedRecord] = useState<FinanceRecordRow | null>(
        financeRecords[0] ?? null,
    );
    const [formErrors, setFormErrors] = useState<FormErrors>({});

    const filteredFinanceRecords = useMemo(() => {
        const byType = filterByValue(financeRecords, typeFilter, (record) => record.type);
        return filterByValue(byType, statusFilter, (record) => record.status);
    }, [financeRecords, typeFilter, statusFilter]);

    const typeOptions = useMemo(
        () => [
            { id: 'all', label: 'All', count: financeRecords.length },
            { id: 'devis', label: 'Devis', count: countByValue(financeRecords, (record) => record.type, 'devis') },
            { id: 'invoice', label: 'Invoice', count: countByValue(financeRecords, (record) => record.type, 'invoice') },
            { id: 'payment', label: 'Payment', count: countByValue(financeRecords, (record) => record.type, 'payment') },
        ],
        [financeRecords],
    );

    const statusOptions = useMemo(
        () => [
            { id: 'all', label: 'All', count: financeRecords.length },
            { id: 'draft', label: 'Draft', count: countByValue(financeRecords, (record) => record.status, 'draft') },
            { id: 'sent', label: 'Sent', count: countByValue(financeRecords, (record) => record.status, 'sent') },
            { id: 'paid', label: 'Paid', count: countByValue(financeRecords, (record) => record.status, 'paid') },
            { id: 'partially_paid', label: 'Partial', count: countByValue(financeRecords, (record) => record.status, 'partially_paid') },
            { id: 'overdue', label: 'Overdue', count: countByValue(financeRecords, (record) => record.status, 'overdue') },
        ],
        [financeRecords],
    );

    function openCreateDrawer() {
        setSelectedRecord(null);
        setDrawerMode('create');
        setFormErrors({});
        setDrawerOpen(true);
    }

    function openEditDrawer(record: FinanceRecordRow) {
        setSelectedRecord(record);
        setDrawerMode('edit');
        setFormErrors({});
        setDrawerOpen(true);
    }

    function handleSubmit(payload: FinanceFormPayload) {
        const backendPayload = toBackendPayload(payload);

        if (drawerMode === 'edit' && selectedRecord) {
            router.put(`/finance/${selectedRecord.id}`, backendPayload, {
                preserveScroll: true,
                onSuccess: () => {
                    setDrawerOpen(false);
                    toast.success('Finance record updated successfully.');
                },
                onError: (errors) => {
                    setFormErrors(errors as FormErrors);
                    toast.error('Please check finance form errors.');
                },
            });

            return;
        }

        router.post('/finance', backendPayload, {
            preserveScroll: true,
            onSuccess: () => {
                setDrawerOpen(false);
                toast.success('Finance record created successfully.');
            },
            onError: (errors) => {
                setFormErrors(errors as FormErrors);
                toast.error('Please check finance form errors.');
            },
        });
    }

    function markPaid(record: FinanceRecordRow) {
        router.put(`/finance/${record.id}/paid`, {}, {
            preserveScroll: true,
            onSuccess: () => toast.success('Finance record marked as paid.'),
            onError: () => toast.error('Finance record could not be marked as paid.'),
        });
    }

    function deleteRecord(record: FinanceRecordRow) {
        const confirmed = window.confirm(`Delete ${record.recordNumber}?`);

        if (!confirmed) {
            return;
        }

        router.delete(`/finance/${record.id}`, {
            preserveScroll: true,
            onSuccess: () => toast.success('Finance record deleted successfully.'),
            onError: () => toast.error('Finance record could not be deleted.'),
        });
    }

    function generateRecord(record: FinanceRecordRow) {
        router.put(`/finance/${record.id}/generate`, {}, {
            preserveScroll: true,
            onSuccess: () => toast.success('Excel document generated successfully.'),
            onError: () => toast.error('Generation failed.'),
        });
    }

    function downloadRecord(record: FinanceRecordRow) {
        if (!record.hasGeneratedFile) {
            toast.error('No generated document found. Please generate first.');
            return;
        }
        window.location.href = record.downloadUrl;
    }

    function exportPdf(record: FinanceRecordRow) {
        router.put(`/finance/${record.id}/export-pdf`, {}, {
            preserveScroll: true,
            onSuccess: () => toast.success('PDF exported successfully.'),
            onError: () => toast.error('PDF export failed.'),
        });
    }

    function downloadPdf(record: FinanceRecordRow) {
        if (!record.hasPdf) {
            toast.error('No PDF found. Please export PDF first.');
            return;
        }
        window.location.href = record.pdfDownloadUrl;
    }

    const columns = useMemo<ColumnDef<FinanceRecordRow, unknown>[]>(
        () => [
            {
                accessorKey: 'recordNumber',
                header: 'Record',
                cell: ({ row }) => (
                    <div className="app-table-primary-cell">
                        <div className="flex items-center gap-2">
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] text-[var(--accent)]">
                                <BadgeDollarSign size={15} />
                            </div>

                            <div className="min-w-0">
                                <p className="max-w-[220px] truncate text-sm font-semibold">
                                    {row.original.recordNumber}
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
                accessorKey: 'type',
                header: 'Type',
                cell: ({ row }) => (
                    <AppBadge tone={getTypeTone(row.original.type)}>
                        {row.original.type}
                    </AppBadge>
                ),
            },
            {
                accessorKey: 'totalTtc',
                header: 'Total TTC',
                cell: ({ row }) => (
                    <span className="text-sm font-semibold">
                        {formatMoney(row.original.totalTtc)}
                    </span>
                ),
            },
            {
                accessorKey: 'remaining',
                header: 'Remaining',
                cell: ({ row }) => (
                    <span className="text-sm font-semibold">
                        {formatMoney(row.original.remaining)}
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
                accessorKey: 'dueDate',
                header: 'Due date',
                cell: ({ row }) => (
                    <span className="text-sm text-[var(--text-muted)]">
                        {row.original.dueDate || '-'}
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
                            onPress={() => setSelectedRecord(row.original)}
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
                            tone="documents"
                            onPress={() => generateRecord(row.original)}
                        >
                            <WandSparkles size={15} />
                        </AppTableActionButton>

                        <AppTableActionButton
                            label="Download Excel"
                            tone="documents"
                            onPress={() => downloadRecord(row.original)}
                        >
                            <FileSpreadsheet size={15} />
                        </AppTableActionButton>

                        <AppTableActionButton
                            label="Export PDF"
                            tone="documents"
                            onPress={() => exportPdf(row.original)}
                        >
                            <FileText size={15} />
                        </AppTableActionButton>

                        <AppTableActionButton
                            label="Download PDF"
                            tone="documents"
                            onPress={() => downloadPdf(row.original)}
                        >
                            <Download size={15} />
                        </AppTableActionButton>

                        <AppTableActionButton
                            label="Mark paid"
                            tone="create"
                            onPress={() => markPaid(row.original)}
                        >
                            <CheckCircle2 size={15} />
                        </AppTableActionButton>

                        <AppTableActionButton
                            label="Delete"
                            tone="delete"
                            onPress={() => deleteRecord(row.original)}
                        >
                            <Trash2 size={15} />
                        </AppTableActionButton>
                    </AppTableActions>
                ),
            },
        ],
        [],
    );

    const collectionRate = metrics.totalTtc > 0
        ? Math.round((metrics.paid / metrics.totalTtc) * 100)
        : 0;

    const metricCards = [
        {
            label: 'Total TTC',
            value: formatMoney(metrics.totalTtc),
        },
        {
            label: 'Paid',
            value: formatMoney(metrics.paid),
        },
        {
            label: 'Remaining',
            value: formatMoney(metrics.remaining),
        },
        {
            label: 'Overdue',
            value: formatMoney(metrics.overdue),
        },
    ];

    return (
        <>
            <Head title="Finance" />

            <AppShell
                eyebrowKey="finance.eyebrow"
                titleKey="finance.title"
                subtitleKey="finance.subtitle"
                action={
                    <AppButton variant="primary" onPress={openCreateDrawer}>
                        <Plus size={16} />
                        New finance record
                    </AppButton>
                }
            >
                <section className="grid gap-5 xl:grid-cols-2">
                    <AppFilterBar
                        label="Finance type"
                        value={typeFilter}
                        options={typeOptions}
                        onChange={setTypeFilter}
                    />

                    <AppFilterBar
                        label="Payment status"
                        value={statusFilter}
                        options={statusOptions}
                        onChange={setStatusFilter}
                    />
                </section>
                <section className="grid min-w-0 gap-5 md:grid-cols-2 xl:grid-cols-4">
                    {metricCards.map((metric) => (
                        <AppCard key={metric.label} className="p-4">
                            <p className="text-sm text-[var(--text-muted)]">{metric.label}</p>
                            <p className="mt-3 truncate text-2xl font-semibold">{metric.value}</p>
                        </AppCard>
                    ))}
                </section>

                <AppCard className="p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                            <p className="text-sm font-semibold">Collection rate</p>
                            <p className="mt-1 text-sm text-[var(--text-muted)]">
                                Paid amount compared to total TTC.
                            </p>
                        </div>

                        <div className="w-full md:max-w-sm">
                            <div className="mb-2 flex items-center justify-between text-sm">
                                <span>{collectionRate}% collected</span>
                                <span className="text-[var(--text-muted)]">
                                    {metrics.totalRecords} records
                                </span>
                            </div>
                            <MiniBar value={collectionRate} />
                        </div>
                    </div>
                </AppCard>

                <section className="grid min-w-0 gap-5 2xl:grid-cols-[minmax(0,1fr)_340px]">
                    <div className="min-w-0">
                        <AppDataTable
                            data={filteredFinanceRecords}
                            columns={columns}
                            searchPlaceholder="Search by record, project, client, type, status, or amount..."
                            emptyTitle="No finance records found"
                            emptyDescription="Create the first devis, invoice, or payment."
                            pageSize={8}
                        />
                    </div>

                    <aside className="min-w-0 space-y-5 2xl:sticky 2xl:top-24 2xl:self-start">
                        <AppCard className="p-5">
                            <div className="mb-4 flex items-start gap-3">
                                <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] text-[var(--accent)]">
                                    <BadgeDollarSign size={18} />
                                </div>

                                <div className="min-w-0">
                                    <h2 className="text-sm font-semibold">Finance preview</h2>
                                    <p className="mt-1 text-sm text-[var(--text-muted)]">
                                        Selected finance record information.
                                    </p>
                                </div>
                            </div>

                            {selectedRecord ? (
                                <div className="space-y-3">
                                    <div className="rounded-2xl border bg-[var(--surface)] p-4">
                                        <p className="text-xs text-[var(--text-muted)]">Record</p>
                                        <p className="mt-1 text-sm font-semibold">
                                            {selectedRecord.recordNumber}
                                        </p>
                                        <p className="mt-1 text-xs text-[var(--text-muted)]">
                                            {selectedRecord.dossierNumber} · {selectedRecord.clientName}
                                        </p>
                                    </div>

                                    <div className="grid gap-2">
                                        <div className="rounded-2xl border bg-[var(--surface)] p-4">
                                            <p className="text-xs text-[var(--text-muted)]">Total TTC</p>
                                            <p className="mt-1 text-sm font-semibold">
                                                {formatMoney(selectedRecord.totalTtc)}
                                            </p>
                                        </div>

                                        <div className="rounded-2xl border bg-[var(--surface)] p-4">
                                            <p className="text-xs text-[var(--text-muted)]">Paid</p>
                                            <p className="mt-1 text-sm font-semibold">
                                                {formatMoney(selectedRecord.paid)}
                                            </p>
                                        </div>

                                        <div className="rounded-2xl border bg-[var(--surface)] p-4">
                                            <p className="text-xs text-[var(--text-muted)]">Remaining</p>
                                            <p className="mt-1 text-sm font-semibold">
                                                {formatMoney(selectedRecord.remaining)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <AppStatusBadge
                                            label={selectedRecord.status}
                                            tone={getStatusTone(selectedRecord.status)}
                                            icon={getStatusIcon(selectedRecord.status)}
                                        />
                                        <AppBadge tone={getTypeTone(selectedRecord.type)}>
                                            {selectedRecord.type}
                                        </AppBadge>
                                    </div>

                                    <div className="space-y-2">
                                        <AppButton
                                            variant="primary"
                                            onPress={() => generateRecord(selectedRecord)}
                                        >
                                            <WandSparkles size={16} />
                                            Generate
                                        </AppButton>

                                        <div className="grid grid-cols-2 gap-2">
                                            <AppButton
                                                variant="secondary"
                                                onPress={() => downloadRecord(selectedRecord)}
                                            >
                                                <FileSpreadsheet size={16} />
                                                Excel
                                            </AppButton>

                                            <AppButton
                                                variant="secondary"
                                                onPress={() => exportPdf(selectedRecord)}
                                            >
                                                <FileText size={16} />
                                                PDF
                                            </AppButton>
                                        </div>

                                        {selectedRecord.hasPdf && (
                                            <AppButton
                                                variant="secondary"
                                                onPress={() => downloadPdf(selectedRecord)}
                                            >
                                                <Download size={16} />
                                                Download PDF
                                            </AppButton>
                                        )}

                                        <AppButton
                                            variant="secondary"
                                            onPress={() => markPaid(selectedRecord)}
                                        >
                                            <CheckCircle2 size={16} />
                                            Mark paid
                                        </AppButton>
                                    </div>

                                    <div className="rounded-2xl border bg-[var(--surface)] p-4">
                                        <p className="text-xs text-[var(--text-muted)]">Notes</p>
                                        <p className="mt-2 whitespace-pre-line text-sm leading-6 text-[var(--text-muted)]">
                                            {selectedRecord.notes || 'No notes.'}
                                        </p>
                                    </div>

                                    {selectedRecord.generatedAt && (
                                        <div className="rounded-2xl border bg-[var(--surface)] p-4">
                                            <p className="text-xs text-[var(--text-muted)]">Generated at</p>
                                            <p className="mt-1 text-sm">
                                                {selectedRecord.generatedAt}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-sm text-[var(--text-muted)]">
                                    Select a finance record from the table.
                                </p>
                            )}
                        </AppCard>
                    </aside>
                </section>

                <FinanceDrawer
                    isOpen={drawerOpen}
                    mode={drawerMode}
                    record={selectedRecord}
                    dossiers={dossiers}
                    onOpenChange={setDrawerOpen}
                    onSubmit={handleSubmit}
                    errors={formErrors}
                />
            </AppShell>
        </>
    );
}
