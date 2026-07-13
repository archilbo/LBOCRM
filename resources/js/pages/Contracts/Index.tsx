import { Head, router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import {
    AlertTriangle, CheckCircle2, Download, Eye, FileText, FileUp, FolderKanban,
    MoreHorizontal, Pencil, Plus, RefreshCw, ScrollText, Search, SlidersHorizontal, Trash2, X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { FormErrors } from '@/lib/formErrors';
import { toast } from 'sonner';
import { AppShell } from '@/components/layout/AppShell';
import { AppButton } from '@/components/ui/AppButton';
import { AppDataTable } from '@/components/ui/AppDataTable';
import { AppDrawer } from '@/components/ui/AppDrawer';
import { AppModal } from '@/components/ui/AppModal';
import { StatusPill } from '@/components/ui/StatusPill';
import { ContractDrawer } from '@/features/contracts/drawers/ContractDrawer';
import type { ContractDossierOption, ContractFormPayload, ContractRow, ContractStatus } from '@/features/contracts/types';
import { cn } from '@/lib/cn';
import { useTranslation } from '@/lib/i18n';

type PageProps = {
    contracts: ContractRow[];
    dossiers: ContractDossierOption[];
    metrics: { total: number; draft: number; generated: number; signed: number; totalTtc: number };
};

function formatMoney(value: number) {
    return new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 }).format(value || 0);
}

function statusConfig(status: ContractStatus) {
    if (status === 'signed') return { color: 'success' as const, label: 'Signed' };
    if (status === 'generated') return { color: 'primary' as const, label: 'Generated' };
    if (status === 'draft') return { color: 'warning' as const, label: 'Draft' };
    if (status === 'cancelled') return { color: 'danger' as const, label: 'Cancelled' };
    if (status === 'completed') return { color: 'success' as const, label: 'Completed' };
    return { color: 'default' as const, label: status };
}

function statusIcon(status: ContractStatus) {
    if (status === 'signed' || status === 'completed') return CheckCircle2;
    if (status === 'generated') return FileText;
    if (status === 'draft') return AlertTriangle;
    return AlertTriangle;
}

function hasSearchMatch(contract: ContractRow, query: string) {
    if (!query.trim()) return true;
    return [contract.contractNumber, contract.clientName, contract.clientNumber,
        contract.dossierNumber, contract.projectObject, contract.status]
        .filter(Boolean).join(' ').toLowerCase().includes(query.trim().toLowerCase());
}

export default function ContractsIndex({ contracts, dossiers, metrics }: PageProps) {
    const { t } = useTranslation();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [drawerMode, setDrawerMode] = useState<'create' | 'edit'>('create');
    const [selectedContract, setSelectedContract] = useState<ContractRow | null>(null);
    const [previewContract, setPreviewContract] = useState<ContractRow | null>(null);
    const [formErrors, setFormErrors] = useState<FormErrors>({});
    const [statusFilter, setStatusFilter] = useState('all');
    const [query, setQuery] = useState('');
    const [deleteTarget, setDeleteTarget] = useState<ContractRow | null>(null);
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
    const [generatingId, setGeneratingId] = useState<number | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const statusOptions = useMemo(() => [
        { id: 'all', label: 'All', count: contracts.length },
        { id: 'draft', label: 'Draft', count: contracts.filter((c) => c.status === 'draft').length },
        { id: 'generated', label: 'Generated', count: contracts.filter((c) => c.status === 'generated').length },
        { id: 'signed', label: 'Signed', count: contracts.filter((c) => c.status === 'signed').length },
        { id: 'cancelled', label: 'Cancelled', count: contracts.filter((c) => c.status === 'cancelled').length },
    ], [contracts]);

    const filteredContracts = useMemo(
        () => {
            let filtered = contracts;
            if (statusFilter !== 'all') {
                filtered = filtered.filter((c) => c.status === statusFilter);
            }
            if (query.trim()) {
                const q = query.trim().toLowerCase();
                filtered = filtered.filter((c) => hasSearchMatch(c, q));
            }
            return filtered;
        },
        [contracts, query, statusFilter],
    );

    useEffect(() => {
        if (!openMenuId) return;
        function close() { setOpenMenuId(null); }
        document.addEventListener('mousedown', close);
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
        return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', close); };
    }, [openMenuId]);

    function openCreateDrawer() {
        setSelectedContract(null); setDrawerMode('create'); setFormErrors({}); setDrawerOpen(true);
    }

    function openEditDrawer(contract: ContractRow) {
        setSelectedContract(contract); setDrawerMode('edit'); setFormErrors({}); setDrawerOpen(true);
    }

    function handleSubmit(payload: ContractFormPayload) {
        setIsSubmitting(true);
        if (drawerMode === 'edit' && selectedContract) {
            router.put(`/contracts/${selectedContract.id}`, payload, {
                preserveScroll: true,
                onSuccess: () => { setDrawerOpen(false); setFormErrors({}); setIsSubmitting(false); toast.success('Contract updated successfully.'); },
                onError: (errors) => { setFormErrors(errors as FormErrors); setIsSubmitting(false); toast.error('Please check contract form errors.'); },
            });
            return;
        }
        router.post('/contracts', payload, {
            preserveScroll: true,
            onSuccess: () => { setDrawerOpen(false); setFormErrors({}); setIsSubmitting(false); toast.success('Contract created successfully.'); },
            onError: (errors) => { setFormErrors(errors as FormErrors); setIsSubmitting(false); toast.error('Please check contract form errors.'); },
        });
    }

    function confirmDelete() {
        if (!deleteTarget) return;
        setActionLoading(true);
        router.delete(`/contracts/${deleteTarget.id}`, {
            preserveScroll: true,
            onSuccess: () => { toast.success('Contract deleted successfully.'); setDeleteTarget(null); setActionLoading(false); },
            onError: () => { toast.error('Contract could not be deleted.'); setActionLoading(false); },
        });
    }

    function generateDocument(contractId: number, type: 'pdf' | 'docx') {
        setGeneratingId(contractId);
        const url = type === 'pdf' ? `/contracts/${contractId}/export-pdf` : `/contracts/${contractId}/generate`;
        router.put(url, {}, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(type === 'pdf' ? 'PDF generated successfully.' : 'Document generated successfully.');
                setGeneratingId(null);
            },
            onError: () => {
                toast.error('Generation failed. Please try again.');
                setGeneratingId(null);
            },
        });
    }

    const metricCards = useMemo(() => [
        { label: 'Total contracts', value: metrics.total, detail: 'All contract records', icon: <ScrollText size={16} />, accent: undefined as string | undefined },
        { label: 'Draft', value: metrics.draft, detail: 'Not yet generated', icon: <AlertTriangle size={16} />, accent: metrics.draft > 0 ? 'text-amber-500' : 'text-[var(--text-muted)]' },
        { label: 'Generated', value: metrics.generated, detail: 'DOCX/PDF created', icon: <FileText size={16} />, accent: undefined },
        { label: 'Signed', value: metrics.signed, detail: 'Client signature done', icon: <CheckCircle2 size={16} />, accent: metrics.signed > 0 ? 'text-emerald-500' : 'text-[var(--text-muted)]' },
        { label: 'Total TTC', value: formatMoney(metrics.totalTtc), detail: 'Sum of all contracts', icon: <FileText size={16} />, accent: 'text-[var(--accent)]' },
    ], [metrics]);

    const columns = useMemo<ColumnDef<ContractRow, unknown>[]>(() => [
        {
            accessorKey: 'contractNumber',
            header: 'Contract',
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--accent)_14%,transparent)] text-[var(--accent)]">
                        <ScrollText size={16} />
                    </span>
                    <div className="min-w-0">
                        <p className="max-w-[200px] truncate font-semibold text-[var(--foreground)]">{row.original.contractNumber}</p>
                        <p className="max-w-[200px] truncate text-xs text-[var(--text-muted)]">{row.original.projectObject || '-'}</p>
                    </div>
                </div>
            ),
        },
        {
            accessorKey: 'dossierNumber',
            header: 'Project',
            cell: ({ row }) => (
                <div className="flex items-start gap-2">
                    <FolderKanban size={14} className="mt-0.5 shrink-0 text-[var(--text-subtle)]" />
                    <div className="min-w-0">
                        <p className="max-w-[170px] truncate font-medium text-[var(--foreground)]">{row.original.dossierNumber || '-'}</p>
                        <p className="max-w-[170px] truncate text-xs text-[var(--text-muted)]">{row.original.projectObject || '-'}</p>
                    </div>
                </div>
            ),
        },
        {
            accessorKey: 'clientName',
            header: 'Client',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--accent)_14%,transparent)] text-[10px] font-bold text-[var(--accent)]">
                        {(row.original.clientName || '?').charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                        <p className="truncate text-[13px] font-medium text-[var(--foreground)]">{row.original.clientName || '-'}</p>
                        <p className="truncate text-[11px] text-[var(--text-muted)]">{row.original.clientNumber || ''}</p>
                    </div>
                </div>
            ),
        },
        {
            accessorKey: 'ttc',
            header: 'Amount',
            cell: ({ row }) => <span className="font-semibold text-[var(--foreground)]">{formatMoney(row.original.ttc)}</span>,
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => {
                const cfg = statusConfig(row.original.status);
                return <StatusPill label={cfg.label} color={cfg.color} />;
            },
        },
        {
            accessorKey: 'updatedAt',
            header: 'Updated',
            cell: ({ row }) => <span className="text-sm text-[var(--text-muted)]">{row.original.updatedAt || '-'}</span>,
        },
        {
            id: 'actions',
            header: '',
            cell: ({ row }) => {
                const doc = row.original;
                const isOpen = openMenuId === doc.id;
                return (
                    <div className="relative flex justify-end">
                        <button type="button" onClick={(e) => { e.stopPropagation(); setOpenMenuId(isOpen ? null : doc.id); }}
                            className={cn(
                                'flex size-8 items-center justify-center rounded-lg border transition',
                                isOpen
                                    ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]'
                                    : 'border-transparent text-[var(--text-muted)] hover:border-[var(--border)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]',
                            )}>
                            <MoreHorizontal size={15} />
                        </button>
                        {isOpen ? (
                            <div className="absolute right-0 top-full z-50 mt-1 min-w-[170px] rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1.5 shadow-xl"
                                onClick={(e) => e.stopPropagation()}>
                                <button type="button" onClick={() => { setPreviewContract(doc); setOpenMenuId(null); }}
                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[12px] text-[var(--foreground)] transition hover:bg-[var(--surface-2)]">
                                    <Eye size={14} /> Preview
                                </button>
                                <button type="button" onClick={() => { openEditDrawer(doc); setOpenMenuId(null); }}
                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[12px] text-[var(--foreground)] transition hover:bg-[var(--surface-2)]">
                                    <Pencil size={14} /> Edit
                                </button>
                                {doc.status === 'draft' ? (
                                    <>
                                        <button type="button" disabled={generatingId === doc.id} onClick={() => { generateDocument(doc.id, 'docx'); setOpenMenuId(null); }}
                                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[12px] text-[var(--foreground)] transition hover:bg-[var(--surface-2)] disabled:opacity-40">
                                            <FileUp size={14} /> {generatingId === doc.id ? 'Generating...' : 'Generate DOCX'}
                                        </button>
                                        <button type="button" disabled={generatingId === doc.id} onClick={() => { generateDocument(doc.id, 'pdf'); setOpenMenuId(null); }}
                                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[12px] text-[var(--foreground)] transition hover:bg-[var(--surface-2)] disabled:opacity-40">
                                            <FileText size={14} /> {generatingId === doc.id ? 'Generating...' : 'Generate PDF'}
                                        </button>
                                    </>
                                ) : null}
                                {doc.hasPdf && doc.pdfDownloadUrl ? (
                                    <button type="button" onClick={() => { window.location.href = doc.pdfDownloadUrl!; setOpenMenuId(null); }}
                                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[12px] text-[var(--foreground)] transition hover:bg-[var(--surface-2)]">
                                        <Download size={14} /> Download PDF
                                    </button>
                                ) : null}
                                {doc.hasGeneratedDocument && doc.generatedDocumentDownloadUrl ? (
                                    <button type="button" onClick={() => { window.location.href = doc.generatedDocumentDownloadUrl!; setOpenMenuId(null); }}
                                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[12px] text-[var(--foreground)] transition hover:bg-[var(--surface-2)]">
                                        <Download size={14} /> Download DOCX
                                    </button>
                                ) : null}
                                <button type="button" onClick={() => { setDeleteTarget(doc); setOpenMenuId(null); }}
                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[12px] text-red-400 transition hover:bg-red-400/10">
                                    <Trash2 size={14} /> Delete
                                </button>
                            </div>
                        ) : null}
                    </div>
                );
            },
        },
    ], [openMenuId]);

    return (
        <>
            <Head title="Contracts" />

            <AppShell>
                <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                        <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
                            {t('contractsWorkspace.eyebrow')}
                        </p>
                        <h1 className="text-2xl font-bold tracking-[-0.02em] text-[var(--foreground)]">
                            {t('contractsWorkspace.title')}
                        </h1>
                        <p className="mt-1 max-w-3xl text-sm text-[var(--text-muted)]">
                            {t('contractsWorkspace.subtitle')}
                        </p>
                    </div>
                    <AppButton variant="solid" color="primary" size="sm" className="h-9 shrink-0" onPress={openCreateDrawer}>
                        <Plus size={15} /> {t('contractsWorkspace.newContract')}
                    </AppButton>
                </header>

                <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
                    {metricCards.map((card) => (
                        <div key={card.label} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm transition hover:border-[var(--accent)]/40 hover:shadow-md">
                            <div className={cn('mb-2 flex size-9 items-center justify-center rounded-lg bg-[var(--surface-2)]', card.accent || 'text-[var(--text-muted)]')}>
                                {card.icon}
                            </div>
                            <p className="text-[12px] font-medium text-[var(--text-muted)]">{card.label}</p>
                            <p className={cn('mt-0.5 text-2xl font-semibold text-[var(--foreground)]', card.accent)}>{card.value}</p>
                            <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">{card.detail}</p>
                        </div>
                    ))}
                </section>

                <div className="flex flex-wrap items-center gap-2">
                    <div className="relative flex-1 min-w-[200px] max-w-sm">
                        <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={t('contractsWorkspace.searchPlaceholder')}
                            className="h-9 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] pl-9 pr-8 text-[13px] text-[var(--foreground)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]"
                        />
                        {query ? (
                            <button type="button" onClick={() => setQuery('')}
                                className="absolute right-2 top-1/2 -translate-y-1/2 flex size-5 items-center justify-center rounded text-[var(--text-muted)] hover:text-[var(--foreground)]">
                                <X size={13} />
                            </button>
                        ) : null}
                    </div>

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
                                <span className="rounded-full bg-black/20 px-1.5 py-0.5 text-[10px]">{option.count}</span>
                            </button>
                        ))}
                    </div>

                    <button type="button" onClick={() => router.reload({ preserveScroll: true })}
                        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[var(--border)] px-2.5 text-[12px] font-medium text-[var(--text-muted)] transition hover:text-[var(--foreground)]">
                        <RefreshCw size={13} />
                    </button>
                </div>

                <AppDataTable
                    data={filteredContracts}
                    columns={columns}
                    searchPlaceholder=""
                    emptyTitle={t('contractsWorkspace.emptyTitle')}
                    emptyDescription={t('contractsWorkspace.emptyDescription')}
                    pageSize={15}
                    onRowClick={(contract) => setPreviewContract(contract)}
                />

                <ContractDrawer
                    isOpen={drawerOpen}
                    mode={drawerMode}
                    contract={drawerMode === 'edit' ? selectedContract : null}
                    dossiers={dossiers}
                    onOpenChange={setDrawerOpen}
                    onSubmit={handleSubmit}
                    errors={formErrors}
                    isSubmitting={isSubmitting}
                />

                <AppDrawer
                    isOpen={!!previewContract}
                    onOpenChange={(open) => { if (!open) setPreviewContract(null); }}
                    title={previewContract?.contractNumber || ''}
                >
                    {previewContract ? (
                        <div className="space-y-5 pb-8">
                            <div className="flex items-center gap-3">
                                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--accent)_14%,transparent)] text-[var(--accent)]">
                                    <ScrollText size={18} />
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p className="flex items-center gap-2 font-semibold text-[var(--foreground)]">
                                        {previewContract.contractNumber}
                                        <StatusPill label={statusConfig(previewContract.status).label} color={statusConfig(previewContract.status).color} size="sm" />
                                    </p>
                                    <p className="text-xs text-[var(--text-muted)]">{previewContract.projectObject || '-'}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3">
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-subtle)]">Client</p>
                                    <p className="mt-1 truncate text-sm font-semibold text-[var(--foreground)]">{previewContract.clientName || '-'}</p>
                                    <p className="truncate text-xs text-[var(--text-muted)]">{previewContract.clientNumber || ''}</p>
                                </div>
                                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3">
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-subtle)]">Project</p>
                                    <p className="mt-1 truncate text-sm font-semibold text-[var(--foreground)]">{previewContract.dossierNumber || '-'}</p>
                                </div>
                                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3">
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-subtle)]">Amount</p>
                                    <p className="mt-1 text-lg font-bold text-[var(--accent)]">{formatMoney(previewContract.ttc)}</p>
                                </div>
                                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3">
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-subtle)]">Workflow</p>
                                    <p className="mt-1 text-sm font-semibold text-[var(--foreground)]">
                                        <StatusPill label={statusConfig(previewContract.status).label} color={statusConfig(previewContract.status).color} size="sm" />
                                    </p>
                                </div>
                            </div>

                            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
                                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-subtle)]">Calculation</p>
                                <div className="grid grid-cols-3 gap-2 text-center">
                                    <div className="rounded-lg bg-[var(--surface-2)] p-2">
                                        <p className="text-[10px] text-[var(--text-muted)]">HT</p>
                                        <p className="text-sm font-semibold text-[var(--foreground)]">{formatMoney(previewContract.ht)}</p>
                                    </div>
                                    <div className="rounded-lg bg-[var(--surface-2)] p-2">
                                        <p className="text-[10px] text-[var(--text-muted)]">TVA</p>
                                        <p className="text-sm font-semibold text-[var(--foreground)]">{formatMoney(previewContract.tva)}</p>
                                    </div>
                                    <div className="rounded-lg bg-[color-mix(in_srgb,var(--accent)_10%,var(--surface-2))] p-2">
                                        <p className="text-[10px] text-[var(--accent)]">TTC</p>
                                        <p className="text-sm font-semibold text-[var(--accent)]">{formatMoney(previewContract.ttc)}</p>
                                    </div>
                                </div>
                                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                                    <div className="flex items-center justify-between rounded-lg bg-[var(--surface-2)] px-2 py-1.5">
                                        <span className="text-[11px] text-[var(--text-muted)]">Mode</span>
                                        <span className="text-[12px] font-medium text-[var(--foreground)]">{previewContract.calculationMode}</span>
                                    </div>
                                    <div className="flex items-center justify-between rounded-lg bg-[var(--surface-2)] px-2 py-1.5">
                                        <span className="text-[11px] text-[var(--text-muted)]">Rate</span>
                                        <span className="text-[12px] font-medium text-[var(--foreground)]">{previewContract.feeRatePercent}%</span>
                                    </div>
                                    <div className="flex items-center justify-between rounded-lg bg-[var(--surface-2)] px-2 py-1.5">
                                        <span className="text-[11px] text-[var(--text-muted)]">Surface</span>
                                        <span className="text-[12px] font-medium text-[var(--foreground)]">{previewContract.surface || '-'} m&sup2;</span>
                                    </div>
                                    <div className="flex items-center justify-between rounded-lg bg-[var(--surface-2)] px-2 py-1.5">
                                        <span className="text-[11px] text-[var(--text-muted)]">Price/m&sup2;</span>
                                        <span className="text-[12px] font-medium text-[var(--foreground)]">{formatMoney(previewContract.pricePerSquareMeter)}</span>
                                    </div>
                                </div>
                            </div>

                            {previewContract.notes ? (
                                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
                                    <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-subtle)]">Notes</p>
                                    <p className="text-sm text-[var(--text-muted)]">{previewContract.notes}</p>
                                </div>
                            ) : null}

                            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
                                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-subtle)]">Timeline</p>
                                <div className="space-y-3">
                                    {previewContract.createdAt ? (
                                        <div className="flex items-center gap-3">
                                            <div className="flex size-7 items-center justify-center rounded-full bg-[var(--surface-2)]">
                                                <div className="size-2 rounded-full bg-[var(--accent)]" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-[12px] font-medium text-[var(--foreground)]">Created</p>
                                                <p className="text-[11px] text-[var(--text-muted)]">{previewContract.createdAt}</p>
                                            </div>
                                        </div>
                                    ) : null}
                                    {previewContract.generatedAt ? (
                                        <div className="flex items-center gap-3">
                                            <div className="flex size-7 items-center justify-center rounded-full bg-[var(--surface-2)]">
                                                <div className="size-2 rounded-full bg-purple-400" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-[12px] font-medium text-[var(--foreground)]">Generated</p>
                                                <p className="text-[11px] text-[var(--text-muted)]">{previewContract.generatedAt}</p>
                                            </div>
                                        </div>
                                    ) : null}
                                    {previewContract.signedAt ? (
                                        <div className="flex items-center gap-3">
                                            <div className="flex size-7 items-center justify-center rounded-full bg-[var(--surface-2)]">
                                                <div className="size-2 rounded-full bg-emerald-400" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-[12px] font-medium text-[var(--foreground)]">Signed</p>
                                                <p className="text-[11px] text-[var(--text-muted)]">{previewContract.signedAt}</p>
                                            </div>
                                        </div>
                                    ) : null}
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <AppButton variant="solid" color="primary" size="sm" onPress={() => { openEditDrawer(previewContract); setPreviewContract(null); }}>
                                    <Pencil size={14} /> Edit contract
                                </AppButton>
                                {previewContract.status === 'draft' ? (
                                    <div className="grid grid-cols-2 gap-2">
                                        <AppButton variant="bordered" size="sm" isLoading={generatingId === previewContract.id} isDisabled={generatingId === previewContract.id} onPress={() => generateDocument(previewContract.id, 'docx')}>
                                            <FileUp size={14} /> Generate DOCX
                                        </AppButton>
                                        <AppButton variant="bordered" size="sm" isLoading={generatingId === previewContract.id} isDisabled={generatingId === previewContract.id} onPress={() => generateDocument(previewContract.id, 'pdf')}>
                                            <FileText size={14} /> Generate PDF
                                        </AppButton>
                                    </div>
                                ) : null}
                                {previewContract.hasPdf && previewContract.pdfDownloadUrl ? (
                                    <AppButton variant="bordered" size="sm" onPress={() => { window.location.href = previewContract.pdfDownloadUrl!; }}>
                                        <Download size={14} /> Download PDF
                                    </AppButton>
                                ) : null}
                                {previewContract.hasGeneratedDocument && previewContract.generatedDocumentDownloadUrl ? (
                                    <AppButton variant="bordered" size="sm" onPress={() => { window.location.href = previewContract.generatedDocumentDownloadUrl!; }}>
                                        <Download size={14} /> Download DOCX
                                    </AppButton>
                                ) : null}
                                {previewContract.hasPdf && previewContract.pdfPublicUrl ? (
                                    <AppButton variant="bordered" size="sm" onPress={() => { window.open(previewContract.pdfPublicUrl!, '_blank'); }}>
                                        <Eye size={14} /> Preview PDF
                                    </AppButton>
                                ) : null}
                                <AppButton variant="solid" color="danger" size="sm" onPress={() => { setDeleteTarget(previewContract); setPreviewContract(null); }}>
                                    <Trash2 size={14} /> Delete contract
                                </AppButton>
                            </div>
                        </div>
                    ) : null}
                </AppDrawer>

                <AppModal
                    isOpen={!!deleteTarget}
                    onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
                    title="Delete contract?"
                    size="sm"
                >
                    <p className="mb-5 text-sm text-[var(--text-muted)]">
                        Are you sure you want to delete <strong>{deleteTarget?.contractNumber}</strong>?
                        This action cannot be undone.
                    </p>
                    <div className="flex justify-end gap-2">
                        <AppButton variant="secondary" onPress={() => setDeleteTarget(null)} isDisabled={actionLoading}>Cancel</AppButton>
                        <AppButton variant="danger" onPress={confirmDelete} isLoading={actionLoading}>Delete</AppButton>
                    </div>
                </AppModal>
            </AppShell>
        </>
    );
}
