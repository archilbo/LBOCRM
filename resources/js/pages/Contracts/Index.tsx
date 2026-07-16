import { router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import {
    AlertTriangle, CheckCircle2, Download, Eye, FileText, FileUp, FolderKanban,
    MoreHorizontal, Pencil, Plus, RefreshCw, ScrollText, Search, Trash2, X, FileDown,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { Selection } from 'react-aria-components';
import { Avatar, Badge, Button, Card, Chip, Dropdown, Input, Separator } from '@heroui/react';
import type { FormErrors } from '@/lib/formErrors';
import { toast } from 'sonner';
import { AppShell } from '@/components/layout/AppShell';
import { AppDataTable } from '@/components/ui/AppDataTable';
import { AppDrawer } from '@/components/ui/AppDrawer';
import { AppModal } from '@/components/ui/AppModal';
import { ContractDrawer } from '@/features/contracts/drawers/ContractDrawer';
import type { ContractDossierOption, ContractFormPayload, ContractRow, ContractStatus } from '@/features/contracts/types';
import { cn } from '@/lib/cn';

type PageProps = {
    contracts: ContractRow[];
    dossiers: ContractDossierOption[];
    metrics: { total: number; draft: number; generated: number; signed: number; totalTtc: number };
};

function formatMoney(value: number) {
    return new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 }).format(value || 0);
}

const statusLabel: Record<string, string> = {
    draft: 'Brouillon', generated: 'Genere', signed: 'Signe', cancelled: 'Annule', completed: 'Complete',
};

const statusColor: Record<string, 'warning' | 'primary' | 'success' | 'danger' | 'default'> = {
    draft: 'warning', generated: 'primary', signed: 'success', cancelled: 'danger', completed: 'success',
};

function hasSearchMatch(contract: ContractRow, query: string) {
    if (!query.trim()) return true;
    return [contract.contractNumber, contract.clientName, contract.clientCin,
        contract.dossierNumber, contract.projectObject, contract.status]
        .filter(Boolean).join(' ').toLowerCase().includes(query.trim().toLowerCase());
}

type ActionId = 'preview' | 'edit' | 'generate-docx' | 'generate-pdf' | 'download-pdf' | 'download-docx' | 'delete';

export default function ContractsIndex({ contracts, dossiers, metrics }: PageProps) {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [drawerMode, setDrawerMode] = useState<'create' | 'edit'>('create');
    const [selectedContract, setSelectedContract] = useState<ContractRow | null>(null);
    const [previewContract, setPreviewContract] = useState<ContractRow | null>(null);
    const [formErrors, setFormErrors] = useState<FormErrors>({});
    const [statusFilter, setStatusFilter] = useState('all');
    const [query, setQuery] = useState('');
    const [deleteTarget, setDeleteTarget] = useState<ContractRow | null>(null);
    const [generatingId, setGeneratingId] = useState<number | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const statusOptions = useMemo(() => [
        { id: 'all', label: 'Tous', count: contracts.length },
        { id: 'draft', label: 'Brouillon', count: contracts.filter((c) => c.status === 'draft').length },
        { id: 'generated', label: 'Genere', count: contracts.filter((c) => c.status === 'generated').length },
        { id: 'signed', label: 'Signe', count: contracts.filter((c) => c.status === 'signed').length },
        { id: 'cancelled', label: 'Annule', count: contracts.filter((c) => c.status === 'cancelled').length },
    ], [contracts]);

    const filteredContracts = useMemo(
        () => contracts.filter((c) => (statusFilter === 'all' || c.status === statusFilter) && (!query.trim() || hasSearchMatch(c, query))),
        [contracts, query, statusFilter],
    );

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
                onSuccess: () => { setDrawerOpen(false); setFormErrors({}); setIsSubmitting(false); toast.success('Contrat mis a jour avec succes.'); },
                onError: (errors) => { setFormErrors(errors as FormErrors); setIsSubmitting(false); toast.error('Veuillez corriger les erreurs du formulaire.'); },
            });
            return;
        }
        router.post('/contracts', payload, {
            preserveScroll: true,
            onSuccess: () => { setDrawerOpen(false); setFormErrors({}); setIsSubmitting(false); toast.success('Contrat cree avec succes.'); },
            onError: (errors) => { setFormErrors(errors as FormErrors); setIsSubmitting(false); toast.error('Veuillez corriger les erreurs du formulaire.'); },
        });
    }

    function confirmDelete() {
        if (!deleteTarget) return;
        setActionLoading(true);
        router.delete(`/contracts/${deleteTarget.id}`, {
            preserveScroll: true,
            onSuccess: () => { toast.success('Contrat supprime avec succes.'); setDeleteTarget(null); setActionLoading(false); },
            onError: () => { toast.error('Impossible de supprimer le contrat.'); setActionLoading(false); },
        });
    }

    function generateDocument(contractId: number, type: 'pdf' | 'docx') {
        setGeneratingId(contractId);
        const url = type === 'pdf' ? `/contracts/${contractId}/export-pdf` : `/contracts/${contractId}/generate`;
        router.put(url, {}, {
            preserveScroll: true,
            onSuccess: () => { toast.success(type === 'pdf' ? 'PDF genere avec succes.' : 'Document genere avec succes.'); setGeneratingId(null); },
            onError: () => { toast.error('Echec de la generation.'); setGeneratingId(null); },
        });
    }

    function handleAction(contract: ContractRow, action: ActionId) {
        switch (action) {
            case 'preview': setPreviewContract(contract); break;
            case 'edit': openEditDrawer(contract); break;
            case 'generate-docx': generateDocument(contract.id, 'docx'); break;
            case 'generate-pdf': generateDocument(contract.id, 'pdf'); break;
            case 'download-pdf': if (contract.pdfDownloadUrl) window.location.href = contract.pdfDownloadUrl; break;
            case 'download-docx': if (contract.generatedDocumentDownloadUrl) window.location.href = contract.generatedDocumentDownloadUrl; break;
            case 'delete': setDeleteTarget(contract); break;
        }
    }

    const metricCards = useMemo(() => [
        { label: 'Total contrats', value: metrics.total, detail: 'Tous les contrats', icon: ScrollText, color: 'default' as const },
        { label: 'Brouillon', value: metrics.draft, detail: 'Non genere', icon: AlertTriangle, color: 'warning' as const },
        { label: 'Genere', value: metrics.generated, detail: 'DOCX/PDF cree', icon: FileText, color: 'primary' as const },
        { label: 'Signe', value: metrics.signed, detail: 'Signature client', icon: CheckCircle2, color: 'success' as const },
        { label: 'Total TTC', value: formatMoney(metrics.totalTtc), detail: 'Somme tous contrats', icon: ScrollText, color: 'primary' as const },
    ], [metrics]);

    const columns = useMemo<ColumnDef<ContractRow, unknown>[]>(() => [
        {
            accessorKey: 'contractNumber',
            header: 'Contrat',
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--accent)_14%,transparent)] text-[var(--accent)]">
                        <ScrollText size={16} />
                    </span>
                    <div className="min-w-0">
                        <p className="max-w-[200px] truncate text-[13px] font-semibold text-[var(--foreground)]">{row.original.contractNumber}</p>
                        <p className="max-w-[200px] truncate text-[11px] text-[var(--text-muted)]">{row.original.projectObject || '-'}</p>
                    </div>
                </div>
            ),
        },
        {
            accessorKey: 'dossierNumber',
            header: 'Dossier',
            cell: ({ row }) => (
                <div className="flex items-start gap-2">
                    <FolderKanban size={14} className="mt-0.5 shrink-0 text-[var(--text-subtle)]" />
                    <div className="min-w-0">
                        <p className="max-w-[170px] truncate text-[13px] font-medium text-[var(--foreground)]">{row.original.dossierNumber || '-'}</p>
                        <p className="max-w-[170px] truncate text-[11px] text-[var(--text-muted)]">{row.original.clientCin || ''}</p>
                    </div>
                </div>
            ),
        },
        {
            accessorKey: 'clientName',
            header: 'Client',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Avatar name={row.original.clientName || '?'} size="sm" className="shrink-0" classNames={{ base: 'bg-[color-mix(in_srgb,var(--accent)_14%,transparent)] text-[var(--accent)] text-[10px] font-bold' }} />
                    <div className="min-w-0">
                        <p className="truncate text-[13px] font-medium text-[var(--foreground)]">{row.original.clientName || '-'}</p>
                        <p className="truncate text-[11px] text-[var(--text-muted)]">{row.original.clientCin || ''}</p>
                    </div>
                </div>
            ),
        },
        {
            accessorKey: 'ttc',
            header: 'Montant',
            cell: ({ row }) => <span className="text-[13px] font-bold text-[var(--foreground)]">{formatMoney(row.original.ttc)}</span>,
        },
        {
            accessorKey: 'status',
            header: 'Statut',
            cell: ({ row }) => (
                <Chip variant="flat" size="sm" color={statusColor[row.original.status] || 'default'}>
                    {statusLabel[row.original.status] || row.original.status}
                </Chip>
            ),
        },
        {
            accessorKey: 'updatedAt',
            header: 'Modifie',
            cell: ({ row }) => <span className="text-[12px] text-[var(--text-muted)]">{row.original.updatedAt || '-'}</span>,
        },
        {
            id: 'actions',
            header: '',
            cell: ({ row }) => {
                const c = row.original;
                const isDraft = c.status === 'draft';
                const hasPdf = c.hasPdf && c.pdfDownloadUrl;
                const hasDocx = c.hasGeneratedDocument && c.generatedDocumentDownloadUrl;
                const generating = generatingId === c.id;
                return (
                    <Dropdown>
                        <Dropdown.Trigger>
                            <Button variant="light" size="sm" isIconOnly className="text-[var(--text-muted)] data-[open]:text-[var(--accent)]">
                                <MoreHorizontal size={15} />
                            </Button>
                        </Dropdown.Trigger>
                        <Dropdown.Popover placement="bottom end">
                            <Dropdown.Menu aria-label="Actions" selectionMode="single" disabledKeys={generating ? ['generate-docx', 'generate-pdf'] : []}
                                onAction={(key) => handleAction(c, key as ActionId)}
                                itemClasses={{ base: 'text-[12px]' }}>
                                <Dropdown.Item key="preview" startContent={<Eye size={14} />}>Apercu</Dropdown.Item>
                                <Dropdown.Item key="edit" startContent={<Pencil size={14} />}>Modifier</Dropdown.Item>
                                <Dropdown.Section title="Generation">
                                    <Dropdown.Item key="generate-docx" startContent={<FileUp size={14} />}>
                                        {generating ? 'Generation...' : 'Generer DOCX'}
                                    </Dropdown.Item>
                                    {isDraft ? (
                                        <Dropdown.Item key="generate-pdf" startContent={<FileText size={14} />}>
                                            {generating ? 'Generation...' : 'Generer PDF'}
                                        </Dropdown.Item>
                                    ) : null}
                                </Dropdown.Section>
                                {(hasPdf || hasDocx) ? (
                                    <Dropdown.Section title="Telechargement">
                                        {hasPdf ? <Dropdown.Item key="download-pdf" startContent={<Download size={14} />}>Telecharger PDF</Dropdown.Item> : null}
                                        {hasDocx ? <Dropdown.Item key="download-docx" startContent={<FileDown size={14} />}>Telecharger DOCX</Dropdown.Item> : null}
                                    </Dropdown.Section>
                                ) : null}
                                <Dropdown.Section title="Danger">
                                    <Dropdown.Item key="delete" startContent={<Trash2 size={14} />} className="text-red-400 data-[hover]:bg-red-400/10">
                                        Supprimer
                                    </Dropdown.Item>
                                </Dropdown.Section>
                            </Dropdown.Menu>
                        </Dropdown.Popover>
                    </Dropdown>
                );
            },
        },
    ], [generatingId]);

    return (
        <>
            <AppShell>
                <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                        <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
                            Finance
                        </p>
                        <h1 className="text-2xl font-bold tracking-[-0.02em] text-[var(--foreground)]">
                            Contrats
                        </h1>
                        <p className="mt-1 max-w-3xl text-sm text-[var(--text-muted)]">
                            Preparez les calculs de contrats, generer les fichiers DOCX/PDF officiels, et suivez le workflow de signature.
                        </p>
                    </div>
                    <Button variant="solid" color="primary" size="sm" className="h-9 shrink-0" onPress={openCreateDrawer}>
                        <Plus size={15} /> Nouveau contrat
                    </Button>
                </header>

                <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
                    {metricCards.map((card) => {
                        const Icon = card.icon;
                        return (
                            <Card key={card.label} className="gap-0 p-4 shadow-sm transition hover:shadow-md" classNames={{ base: 'border border-[var(--border)]' }}>
                                <div className="mb-2 flex size-9 items-center justify-center rounded-lg bg-[var(--surface-2)]">
                                    <Icon size={16} className={cn(card.color === 'primary' && 'text-[var(--accent)]', card.color === 'warning' && 'text-amber-400', card.color === 'success' && 'text-emerald-400', card.color === 'default' && 'text-[var(--text-muted)]')} />
                                </div>
                                <p className="text-[11px] font-medium text-[var(--text-muted)]">{card.label}</p>
                                <p className={cn('mt-0.5 text-2xl font-semibold text-[var(--foreground)]', card.color === 'primary' && 'text-[var(--accent)]', card.color === 'warning' && 'text-amber-400', card.color === 'success' && 'text-emerald-400')}>{card.value}</p>
                                <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">{card.detail}</p>
                            </Card>
                        );
                    })}
                </section>

                <div className="flex flex-wrap items-center gap-2">
                    <Input
                        placeholder="Rechercher par contrat, client, projet, CIN ou statut..."
                        value={query}
                        onValueChange={setQuery}
                        variant="bordered"
                        size="sm"
                        className="flex-1 min-w-[200px] max-w-sm"
                        startContent={<Search size={14} className="text-[var(--text-muted)]" />}
                        endContent={query ? (
                            <Button variant="light" size="sm" isIconOnly className="size-5 min-w-0" onPress={() => setQuery('')}>
                                <X size={13} />
                            </Button>
                        ) : null}
                    />
                    <div className="flex flex-wrap gap-2">
                        {statusOptions.map((option) => (
                            <Chip key={option.id} variant={statusFilter === option.id ? 'solid' : 'bordered'} color="primary" size="sm"
                                classNames={{ base: 'cursor-pointer transition', content: 'flex items-center gap-1 text-[12px] font-medium' }}
                                onClick={() => setStatusFilter(option.id)}>
                                {option.label}
                                <Badge size="sm" classNames={{ base: 'ml-0.5 size-4 min-w-0 text-[10px]' }}>{option.count}</Badge>
                            </Chip>
                        ))}
                    </div>
                    <Button variant="bordered" size="sm" isIconOnly className="h-8 w-8 min-w-0" onPress={() => router.reload({ preserveScroll: true })}>
                        <RefreshCw size={13} />
                    </Button>
                </div>

                <AppDataTable
                    data={filteredContracts}
                    columns={columns}
                    searchPlaceholder=""
                    emptyTitle="Aucun contrat trouve"
                    emptyDescription="Creez un contrat a partir d'un dossier approuve."
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
                                        <Chip variant="flat" size="sm" color={statusColor[previewContract.status] || 'default'}>
                                            {statusLabel[previewContract.status] || previewContract.status}
                                        </Chip>
                                    </p>
                                    <p className="text-xs text-[var(--text-muted)]">{previewContract.projectObject || '-'}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { label: 'Client', value: previewContract.clientName, sub: previewContract.clientCin },
                                    { label: 'Dossier', value: previewContract.dossierNumber, sub: null },
                                    { label: 'Montant', value: formatMoney(previewContract.ttc), sub: null, accent: true },
                                    { label: 'Statut', value: <Chip variant="flat" size="sm" color={statusColor[previewContract.status] || 'default'}>{statusLabel[previewContract.status] || previewContract.status}</Chip>, sub: null },
                                ].map((item) => (
                                    <Card key={item.label} className="gap-0 p-3" classNames={{ base: 'border border-[var(--border)] bg-[var(--surface-2)]' }}>
                                        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-subtle)]">{item.label}</p>
                                        <p className={cn('mt-1 truncate text-sm font-semibold', item.accent ? 'text-lg text-[var(--accent)]' : 'text-[var(--foreground)]')}>{item.value || '-'}</p>
                                        {item.sub ? <p className="truncate text-xs text-[var(--text-muted)]">{item.sub}</p> : null}
                                    </Card>
                                ))}
                            </div>

                            <Card className="gap-0 p-4 shadow-sm" classNames={{ base: 'border border-[var(--border)]' }}>
                                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-subtle)]">Calcul</p>
                                <div className="grid grid-cols-3 gap-2 text-center">
                                    {[
                                        { label: 'HT', value: formatMoney(previewContract.ht) },
                                        { label: 'TVA', value: formatMoney(previewContract.tva) },
                                        { label: 'TTC', value: formatMoney(previewContract.ttc), accent: true },
                                    ].map((item) => (
                                        <div key={item.label} className={cn('rounded-lg p-2', item.accent ? 'bg-[color-mix(in_srgb,var(--accent)_10%,var(--surface-2))]' : 'bg-[var(--surface-2)]')}>
                                            <p className={cn('text-[10px]', item.accent ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]')}>{item.label}</p>
                                            <p className={cn('text-sm font-semibold', item.accent ? 'text-[var(--accent)]' : 'text-[var(--foreground)]')}>{item.value}</p>
                                        </div>
                                    ))}
                                </div>
                                <Separator className="my-3" />
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { label: 'Mode', value: previewContract.calculationMode },
                                        { label: 'Taux', value: `${previewContract.feeRatePercent}%` },
                                        { label: 'Surface', value: previewContract.surface ? `${previewContract.surface} m²` : '-' },
                                        { label: 'Prix/m²', value: formatMoney(previewContract.pricePerSquareMeter) },
                                    ].map((item) => (
                                        <div key={item.label} className="flex items-center justify-between rounded-lg bg-[var(--surface-2)] px-2 py-1.5">
                                            <span className="text-[11px] text-[var(--text-muted)]">{item.label}</span>
                                            <span className="text-[12px] font-medium text-[var(--foreground)]">{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </Card>

                            {previewContract.notes ? (
                                <Card className="gap-0 p-4 shadow-sm" classNames={{ base: 'border border-[var(--border)]' }}>
                                    <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-subtle)]">Notes</p>
                                    <p className="text-sm text-[var(--text-muted)]">{previewContract.notes}</p>
                                </Card>
                            ) : null}

                            <Card className="gap-0 p-4 shadow-sm" classNames={{ base: 'border border-[var(--border)]' }}>
                                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-subtle)]">Chronologie</p>
                                <div className="space-y-3">
                                    {[
                                        { label: 'Cree', date: previewContract.createdAt, dot: 'bg-[var(--accent)]' },
                                        { label: 'Genere', date: previewContract.generatedAt, dot: 'bg-purple-400' },
                                        { label: 'Signe', date: previewContract.signedAt, dot: 'bg-emerald-400' },
                                    ].filter((e) => e.date).map((event) => (
                                        <div key={event.label} className="flex items-center gap-3">
                                            <div className="flex size-7 items-center justify-center rounded-full bg-[var(--surface-2)]">
                                                <div className={cn('size-2 rounded-full', event.dot)} />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-[12px] font-medium text-[var(--foreground)]">{event.label}</p>
                                                <p className="text-[11px] text-[var(--text-muted)]">{event.date}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>

                            <div className="flex flex-col gap-2">
                                <Button variant="solid" color="primary" size="sm" onPress={() => { openEditDrawer(previewContract); setPreviewContract(null); }}>
                                    <Pencil size={14} /> Modifier le contrat
                                </Button>
                                {previewContract.status === 'draft' ? (
                                    <div className="grid grid-cols-2 gap-2">
                                        <Button variant="bordered" size="sm" isLoading={generatingId === previewContract.id} isDisabled={generatingId === previewContract.id} onPress={() => generateDocument(previewContract.id, 'docx')}>
                                            <FileUp size={14} /> Generer DOCX
                                        </Button>
                                        <Button variant="bordered" size="sm" isLoading={generatingId === previewContract.id} isDisabled={generatingId === previewContract.id} onPress={() => generateDocument(previewContract.id, 'pdf')}>
                                            <FileText size={14} /> Generer PDF
                                        </Button>
                                    </div>
                                ) : null}
                                {previewContract.hasPdf && previewContract.pdfDownloadUrl ? (
                                    <Button variant="bordered" size="sm" onPress={() => { window.location.href = previewContract.pdfDownloadUrl!; }}>
                                        <Download size={14} /> Telecharger PDF
                                    </Button>
                                ) : null}
                                {previewContract.hasGeneratedDocument && previewContract.generatedDocumentDownloadUrl ? (
                                    <Button variant="bordered" size="sm" onPress={() => { window.location.href = previewContract.generatedDocumentDownloadUrl!; }}>
                                        <FileDown size={14} /> Telecharger DOCX
                                    </Button>
                                ) : null}
                                {previewContract.hasPdf && previewContract.pdfPublicUrl ? (
                                    <Button variant="bordered" size="sm" onPress={() => { window.open(previewContract.pdfPublicUrl!, '_blank'); }}>
                                        <Eye size={14} /> Apercu PDF
                                    </Button>
                                ) : null}
                                <Button variant="solid" color="danger" size="sm" onPress={() => { setDeleteTarget(previewContract); setPreviewContract(null); }}>
                                    <Trash2 size={14} /> Supprimer le contrat
                                </Button>
                            </div>
                        </div>
                    ) : null}
                </AppDrawer>

                <AppModal
                    isOpen={!!deleteTarget}
                    onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
                    title="Supprimer le contrat ?"
                    size="sm"
                >
                    <p className="mb-5 text-sm text-[var(--text-muted)]">
                        Confirmez la suppression de <strong>{deleteTarget?.contractNumber}</strong>.
                        Cette action est irreversible.
                    </p>
                    <div className="flex justify-end gap-2">
                        <Button variant="bordered" color="default" onPress={() => setDeleteTarget(null)} isDisabled={actionLoading}>Annuler</Button>
                        <Button variant="solid" color="danger" onPress={confirmDelete} isLoading={actionLoading}>Supprimer</Button>
                    </div>
                </AppModal>
            </AppShell>
        </>
    );
}
