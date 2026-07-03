import { Head, router } from '@inertiajs/react';
import {
    CheckCircle2,
    Download,
    Eye,
    FileText,
    FolderKanban,
    Pencil,
    Plus,
    RefreshCcw,
    ScrollText,
    Search,
    Trash2,
    X,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FormErrors } from '@/lib/formErrors';
import { toast } from 'sonner';
import { AppShell } from '@/components/layout/AppShell';
import { AppButton } from '@/components/ui/AppButton';
import { AppPagination } from '@/components/ui/AppPagination';
import { ContractDrawer } from '@/features/contracts/drawers/ContractDrawer';
import type {
    ContractDossierOption,
    ContractFormPayload,
    ContractRow,
    ContractStatus,
} from '@/features/contracts/types';
import { countByValue, filterByValue } from '@/lib/filters';
import { useTranslation } from '@/lib/i18n';

/* FORCE_CONTRACTS_REDESIGN_53F */

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

function formatMoney(value: number) {
    return new Intl.NumberFormat('fr-MA', {
        style: 'currency',
        currency: 'MAD',
        maximumFractionDigits: 0,
    }).format(value || 0);
}

function formatNumber(value: number) {
    return new Intl.NumberFormat('fr-MA').format(value || 0);
}

function statusClass(status: ContractStatus) {
    if (status === 'signed') return 'border-emerald-400/25 bg-emerald-400/10 text-emerald-300';
    if (status === 'generated') return 'border-violet-400/25 bg-violet-400/10 text-violet-300';
    if (status === 'draft') return 'border-amber-400/25 bg-amber-400/10 text-amber-300';
    if (status === 'cancelled') return 'border-red-400/25 bg-red-400/10 text-red-300';

    return 'border-zinc-500/30 bg-zinc-500/10 text-zinc-300';
}

function modeLabel(contract: ContractRow) {
    if (contract.calculationMode === 'forfait') {
        return 'FORFAIT';
    }

    return `${contract.feeRatePercent}%`;
}

function toBackendPayload(payload: ContractFormPayload) {
    return {
        dossier_id: payload.dossierId,
        status: payload.status || 'draft',
        surface: payload.surface || null,
        price_per_square_meter: payload.pricePerSquareMeter || null,
        calculation_mode: payload.calculationMode || 'percentage',
        fee_rate_percent: payload.feeRatePercent || null,
        forfait_ttc: payload.calculationMode === 'forfait' ? payload.forfaitTtc || null : null,
        notes: payload.notes || null,
    };
}

function matchesSearch(contract: ContractRow, query: string) {
    if (!query.trim()) {
        return true;
    }

    return [
        contract.contractNumber,
        contract.dossierNumber,
        contract.projectObject,
        contract.clientName,
        contract.clientCin,
        contract.status,
        contract.calculationMode,
        contract.notes,
    ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(query.trim().toLowerCase());
}

function downloadGenerated(contract: ContractRow) {
    window.location.href = contract.generatedDocumentDownloadUrl || `/contracts/${contract.id}/download/generated`;
}

function downloadPdf(contract: ContractRow) {
    window.location.href = contract.pdfDownloadUrl || `/contracts/${contract.id}/download/pdf`;
}

function KpiCard({
    label,
    value,
    detail,
}: {
    label: string;
    value: string | number;
    detail: string;
}) {
    return (
        <div className="crm-kpi-card">
            <p className="crm-kpi-label">{label}</p>
            <p className="crm-kpi-value">{value}</p>
            <p className="mt-2 truncate text-xs text-[var(--crm-text-soft)]">{detail}</p>
        </div>
    );
}

function FileState({ contract }: { contract: ContractRow }) {
    return (
        <div className="grid grid-cols-2 gap-2">
            <div className={[
                'crm-panel-soft p-3',
                contract.hasGeneratedDocument ? 'border-emerald-400/20' : '',
            ].join(' ')}>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--crm-text-soft)]">DOCX</p>
                <p className="mt-1 text-sm font-semibold">{contract.hasGeneratedDocument ? 'Generated' : 'Missing'}</p>
                <p className="truncate text-xs text-[var(--crm-text-muted)]">{contract.generatedAt || '-'}</p>
            </div>

            <div className={[
                'crm-panel-soft p-3',
                contract.hasPdf ? 'border-emerald-400/20' : '',
            ].join(' ')}>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--crm-text-soft)]">PDF</p>
                <p className="mt-1 text-sm font-semibold">{contract.hasPdf ? 'Exported' : 'Missing'}</p>
                <p className="truncate text-xs text-[var(--crm-text-muted)]">{contract.pdfPath ? 'Ready' : '-'}</p>
            </div>
        </div>
    );
}

function ContractDetailPanel({
    contract,
    onGenerate,
    onExportPdf,
    onMarkSigned,
    onEdit,
    onDelete,
}: {
    contract: ContractRow | null;
    onGenerate: (contract: ContractRow) => void;
    onExportPdf: (contract: ContractRow) => void;
    onMarkSigned: (contract: ContractRow) => void;
    onEdit: (contract: ContractRow) => void;
    onDelete: (contract: ContractRow) => void;
}) {
    if (!contract) {
        return (
            <aside className="crm-panel p-4">
                <p className="text-sm font-semibold">Contract details</p>
                <p className="mt-2 text-sm text-[var(--crm-text-muted)]">
                    Select a contract to generate, export, sign, or download files.
                </p>
            </aside>
        );
    }

    return (
        <aside className="crm-panel overflow-hidden">
            <div className="border-b border-[var(--crm-border)] p-4">
                <p className="crm-eyebrow">Selected contract</p>
                <div className="mt-2 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <h2 className="truncate text-lg font-semibold">{contract.contractNumber}</h2>
                        <p className="text-sm text-[var(--crm-text-muted)]">{contract.dossierNumber}</p>
                    </div>

                    <span className={`shrink-0 rounded-full border px-2 py-1 text-[11px] font-semibold ${statusClass(contract.status)}`}>
                        {contract.status}
                    </span>
                </div>
            </div>

            <div className="space-y-5 p-5">
                <div className="grid grid-cols-2 gap-3">
                    <div className="crm-panel-soft p-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--crm-text-soft)]">Project</p>
                        <p className="mt-1 truncate text-sm font-semibold">{contract.projectObject}</p>
                        <p className="truncate text-xs text-[var(--crm-text-muted)]">{contract.clientName}</p>
                    </div>

                    <div className="crm-panel-soft p-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--crm-text-soft)]">Mode</p>
                        <p className="mt-1 truncate text-sm font-semibold text-[var(--crm-gold)]">{modeLabel(contract)}</p>
                        <p className="truncate text-xs text-[var(--crm-text-muted)]">{contract.surface} m2</p>
                    </div>

                    <div className="crm-panel-soft p-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--crm-text-soft)]">HT</p>
                        <p className="mt-1 truncate text-sm font-semibold">{formatMoney(contract.ht)}</p>
                        <p className="truncate text-xs text-[var(--crm-text-muted)]">Before tax</p>
                    </div>

                    <div className="crm-panel-soft p-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--crm-text-soft)]">TTC</p>
                        <p className="mt-1 truncate text-sm font-semibold text-[var(--crm-gold)]">{formatMoney(contract.ttc)}</p>
                        <p className="truncate text-xs text-[var(--crm-text-muted)]">Total contract</p>
                    </div>
                </div>

                <FileState contract={contract} />

                {contract.notes ? (
                    <div className="crm-panel-soft p-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--crm-text-soft)]">Notes</p>
                        <p className="mt-2 text-sm text-[var(--crm-text-muted)]">{contract.notes}</p>
                    </div>
                ) : null}

                <div className="grid gap-2">
                    <AppButton variant="primary" onPress={() => onGenerate(contract)}>
                        <RefreshCcw size={15} />
                        Generate DOCX
                    </AppButton>

                    <div className="grid grid-cols-2 gap-2">
                        <AppButton variant="secondary" size="sm" onPress={() => downloadGenerated(contract)}>
                            <Download size={14} />
                            DOCX
                        </AppButton>

                        <AppButton variant="secondary" size="sm" onPress={() => downloadPdf(contract)}>
                            <FileText size={14} />
                            PDF
                        </AppButton>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <AppButton variant="secondary" size="sm" onPress={() => onExportPdf(contract)}>
                            <FileText size={14} />
                            Export PDF
                        </AppButton>

                        <AppButton variant="secondary" size="sm" onPress={() => onMarkSigned(contract)}>
                            <CheckCircle2 size={14} />
                            Signed
                        </AppButton>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <AppButton variant="secondary" size="sm" onPress={() => onEdit(contract)}>
                            <Pencil size={14} />
                            Edit
                        </AppButton>

                        <AppButton variant="danger" size="sm" onPress={() => onDelete(contract)}>
                            <Trash2 size={14} />
                            Delete
                        </AppButton>
                    </div>
                </div>
            </div>
        </aside>
    );
}

export default function ContractsIndex({
    contracts,
    dossiers,
    metrics,
}: PageProps) {
    const { t } = useTranslation();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all');
    const [query, setQuery] = useState('');
    const [formErrors, setFormErrors] = useState<FormErrors>({});
    const [drawerMode, setDrawerMode] = useState<'create' | 'edit'>('create');
    const [selectedContract, setSelectedContract] = useState<ContractRow | null>(
        contracts[0] ?? null,
    );

    const [tablePage, setTablePage] = useState(1);
    const TABLE_PAGE_SIZE = 15;

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

    const filteredContracts = useMemo(() => {
        return filterByValue(contracts, statusFilter, (contract) => contract.status)
            .filter((contract) => matchesSearch(contract, query));
    }, [contracts, query, statusFilter]);

    useEffect(() => {
        setTablePage(1);
    }, [query, statusFilter]);

    const pagedContracts = useMemo(
        () => filteredContracts.slice((tablePage - 1) * TABLE_PAGE_SIZE, tablePage * TABLE_PAGE_SIZE),
        [filteredContracts, tablePage],
    );

    const selectedVisible = selectedContract && filteredContracts.some((contract) => contract.id === selectedContract.id)
        ? selectedContract
        : filteredContracts[0] ?? null;

    function openCreateDrawer() {
        setSelectedContract(null);
        setDrawerMode('create');
        setFormErrors({});
        setDrawerOpen(true);
    }

    function openEditDrawer(contract: ContractRow) {
        setSelectedContract(contract);
        setDrawerMode('edit');
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
                onError: (errors) => {
                    setFormErrors(errors as FormErrors);
                    toast.error('Please check contract form errors.');
                },
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

    function exportPdf(contract: ContractRow) {
        router.put(`/contracts/${contract.id}/export-pdf`, {}, {
            preserveScroll: true,
            onSuccess: () => toast.success('Contract PDF exported successfully.'),
            onError: () => toast.error('Contract PDF could not be exported.'),
        });
    }

    function markSigned(contract: ContractRow) {
        router.put(`/contracts/${contract.id}/signed`, {}, {
            preserveScroll: true,
            onSuccess: () => toast.success('Contract marked as signed.'),
            onError: () => toast.error('Contract could not be marked as signed.'),
        });
    }

    function deleteContract(contract: ContractRow) {
        if (!window.confirm(`Delete ${contract.contractNumber}?`)) {
            return;
        }

        router.delete(`/contracts/${contract.id}`, {
            preserveScroll: true,
            onSuccess: () => toast.success('Contract deleted successfully.'),
            onError: () => toast.error('Contract could not be deleted.'),
        });
    }

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
                <section className="crm-kpi-grid max-xl:grid-cols-3 max-md:grid-cols-1">
                    <KpiCard label="Total TTC" value={formatMoney(metrics.totalTtc)} detail="All contracts value" />
                    <KpiCard label="Contracts" value={formatNumber(metrics.total)} detail="Total contract records" />
                    <KpiCard label="Draft" value={formatNumber(metrics.draft)} detail="Need generation" />
                    <KpiCard label="Generated" value={formatNumber(metrics.generated)} detail="DOCX ready" />
                    <KpiCard label="Signed" value={formatNumber(metrics.signed)} detail="Signed contracts" />
                </section>

                <section className="crm-panel p-4">
                    <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                        <div className="flex flex-wrap gap-2">
                            {statusOptions.map((option) => {
                                const active = option.id === statusFilter;

                                return (
                                    <button
                                        key={option.id}
                                        type="button"
                                        onClick={() => setStatusFilter(option.id)}
                                        className={[
                                            'inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-sm font-semibold transition',
                                            active
                                                ? 'border-[var(--crm-gold)] bg-[var(--crm-gold-soft)] text-[var(--crm-gold)]'
                                                : 'border-[var(--crm-border)] bg-[var(--crm-surface)] text-[var(--crm-text-muted)] hover:text-[var(--crm-text)]',
                                        ].join(' ')}
                                    >
                                        {option.label}
                                        <span className="rounded-full bg-black/20 px-2 py-0.5 text-xs">{option.count}</span>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="crm-command-input relative w-full xl:w-[390px]">
                            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--crm-text-soft)]" />
                            <input
                                value={query}
                                onChange={(event) => setQuery(event.target.value)}
                                placeholder="Search contracts, projects, clients..."
                                className="h-full w-full bg-transparent pl-9 pr-9 text-sm outline-none placeholder:text-[var(--crm-text-soft)]"
                            />
                            {query ? (
                                <button
                                    type="button"
                                    onClick={() => setQuery('')}
                                    className="absolute right-2 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-[var(--crm-text-soft)] hover:bg-[var(--crm-surface-2)]"
                                >
                                    <X size={14} />
                                </button>
                            ) : null}
                        </div>
                    </div>
                </section>

                <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
                    <div className="crm-panel overflow-hidden">
                        <div className="flex items-center justify-between border-b border-[var(--crm-border)] px-5 py-4">
                            <div>
                                <p className="text-sm font-semibold">Contract workspace</p>
                                <p className="text-xs text-[var(--crm-text-muted)]">{filteredContracts.length} visible contract(s)</p>
                            </div>

                            <AppButton variant="secondary" size="sm" onPress={() => setStatusFilter('all')}>
                                Reset
                            </AppButton>
                        </div>

                        <div className="app-scrollbar overflow-x-auto">
                            <table className="crm-table min-w-[1080px]">
                                <thead>
                                    <tr>
                                        <th>Contract</th>
                                        <th>Project</th>
                                        <th>Calculation</th>
                                        <th>Amounts</th>
                                        <th>Files</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredContracts.length > 0 ? (
                                        pagedContracts.map((contract) => {
                                            const selected = selectedVisible?.id === contract.id;

                                            return (
                                                <tr
                                                    key={contract.id}
                                                    className={selected ? 'bg-[color-mix(in_srgb,var(--crm-gold)_8%,transparent)]' : ''}
                                                    onClick={() => setSelectedContract(contract)}
                                                >
                                                    <td>
                                                        <div className="flex items-center gap-3">
                                                            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[var(--crm-gold-soft)] text-[var(--crm-gold)]">
                                                                <ScrollText size={16} />
                                                            </span>
                                                            <div className="min-w-0">
                                                                <p className="max-w-[220px] truncate font-semibold text-[var(--crm-text)]">{contract.contractNumber}</p>
                                                                <p className="text-xs text-[var(--crm-text-muted)]">{contract.dossierNumber}</p>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td>
                                                        <div className="flex items-start gap-2">
                                                            <FolderKanban size={14} className="mt-0.5 shrink-0 text-[var(--crm-text-soft)]" />
                                                            <div className="min-w-0">
                                                                <p className="max-w-[230px] truncate font-medium text-[var(--crm-text)]">{contract.projectObject}</p>
                                                                <p className="max-w-[230px] truncate text-xs text-[var(--crm-text-muted)]">{contract.clientName}</p>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td>
                                                        <span className="inline-flex rounded-full border border-[var(--crm-border)] bg-[var(--crm-surface-2)] px-2 py-1 text-[11px] font-semibold text-[var(--crm-gold)]">
                                                            {modeLabel(contract)}
                                                        </span>
                                                        <p className="mt-1 text-xs text-[var(--crm-text-muted)]">{contract.surface} m2</p>
                                                    </td>

                                                    <td>
                                                        <p className="font-semibold text-[var(--crm-text)]">{formatMoney(contract.ttc)}</p>
                                                        <p className="text-xs text-[var(--crm-text-muted)]">HT {formatMoney(contract.ht)} · TVA {formatMoney(contract.tva)}</p>
                                                    </td>

                                                    <td>
                                                        <div className="flex flex-wrap gap-1">
                                                            <span className={[
                                                                'rounded-full border px-2 py-1 text-[11px] font-semibold',
                                                                contract.hasGeneratedDocument ? 'border-emerald-400/25 bg-emerald-400/10 text-emerald-300' : 'border-amber-400/25 bg-amber-400/10 text-amber-300',
                                                            ].join(' ')}>
                                                                DOCX
                                                            </span>
                                                            <span className={[
                                                                'rounded-full border px-2 py-1 text-[11px] font-semibold',
                                                                contract.hasPdf ? 'border-emerald-400/25 bg-emerald-400/10 text-emerald-300' : 'border-zinc-500/30 bg-zinc-500/10 text-zinc-300',
                                                            ].join(' ')}>
                                                                PDF
                                                            </span>
                                                        </div>
                                                    </td>

                                                    <td>
                                                        <span className={`inline-flex rounded-full border px-2 py-1 text-[11px] font-semibold ${statusClass(contract.status)}`}>
                                                            {contract.status}
                                                        </span>
                                                    </td>

                                                    <td>
                                                        <div className="flex justify-end gap-1">
                                                            <button type="button" className="crm-action-button" title="Preview" onClick={(event) => { event.stopPropagation(); setSelectedContract(contract); }}>
                                                                <Eye size={14} />
                                                            </button>
                                                            <button type="button" className="crm-action-button" title="Edit" onClick={(event) => { event.stopPropagation(); openEditDrawer(contract); }}>
                                                                <Pencil size={14} />
                                                            </button>
                                                            <button type="button" className="crm-action-button" title="Generate" onClick={(event) => { event.stopPropagation(); generateContract(contract); }}>
                                                                <RefreshCcw size={14} />
                                                            </button>
                                                            <button type="button" className="crm-action-button" title="Download DOCX" onClick={(event) => { event.stopPropagation(); downloadGenerated(contract); }}>
                                                                <Download size={14} />
                                                            </button>
                                                            <button type="button" className="crm-action-button" title="Download PDF" onClick={(event) => { event.stopPropagation(); downloadPdf(contract); }}>
                                                                <FileText size={14} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={7}>
                                                <div className="py-10 text-center">
                                                    <p className="text-sm font-semibold">No contracts found</p>
                                                    <p className="mt-1 text-sm text-[var(--crm-text-muted)]">Change filters or create a contract from a project.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <ContractDetailPanel
                        contract={selectedVisible}
                        onGenerate={generateContract}
                        onExportPdf={exportPdf}
                        onMarkSigned={markSigned}
                        onEdit={openEditDrawer}
                        onDelete={deleteContract}
                    />
                </section>

                <AppPagination page={tablePage} pageSize={TABLE_PAGE_SIZE} total={filteredContracts.length} onChange={setTablePage} />

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