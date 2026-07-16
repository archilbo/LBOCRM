import { router } from '@inertiajs/react';
import {
    AlertTriangle, CheckCircle2, ChevronDown, ChevronUp, ChevronsUpDown, FileX,
    Download, Eye, FileText, FileUp, FolderKanban, ListFilter,
    Pencil, Plus, Printer, RefreshCw, ScrollText, Search, Trash2, X, FileDown, MoreHorizontal,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Avatar, Button, Card, Chip, Dropdown } from '@heroui/react';
import type { FormErrors } from '@/lib/formErrors';
import { toast } from 'sonner';
import { AppShell } from '@/components/layout/AppShell';
import { AppDrawer } from '@/components/ui/AppDrawer';
import { AppModal } from '@/components/ui/AppModal';
import { ContractDrawer } from '@/features/contracts/drawers/ContractDrawer';
import type { ContractClientOption, ContractDossierOption, ContractFormPayload, ContractRow, ContractStatus } from '@/features/contracts/types';
import { cn } from '@/lib/cn';
import { currencyFormat } from '@/lib/currency';

type PageProps = {
    contracts: ContractRow[];
    dossiers: ContractDossierOption[];
    clients: ContractClientOption[];
    metrics: { total: number; draft: number; generated: number; signed: number; totalTtc: number };
};

const statusLabel: Record<string, string> = {
    draft: 'Brouillon', generated: 'Genere', signed: 'Signe', cancelled: 'Annule', completed: 'Complete',
};

const statusChipColor: Record<string, 'warning' | 'primary' | 'success' | 'danger' | 'default'> = {
    draft: 'warning', generated: 'primary', signed: 'success', cancelled: 'danger', completed: 'success',
};

function hasSearchMatch(contract: ContractRow, query: string) {
    if (!query.trim()) return true;
    return [contract.contractNumber, contract.clientName, contract.clientCin,
        contract.dossierNumber, contract.projectObject, contract.status]
        .filter(Boolean).join(' ').toLowerCase().includes(query.trim().toLowerCase());
}

type ActionId = 'preview' | 'edit' | 'print' | 'mark-signed' | 'generate-docx' | 'generate-pdf' | 'download-pdf' | 'download-docx' | 'delete';

type SortKey = 'contractNumber' | 'dossierNumber' | 'clientName' | 'ttc' | 'status' | 'updatedAt';
type SortDir = 'asc' | 'desc';

export default function ContractsIndex({ contracts, dossiers, clients, metrics }: PageProps) {
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
    const [sortKey, setSortKey] = useState<SortKey>('updatedAt');
    const [sortDir, setSortDir] = useState<SortDir>('desc');
    const [page, setPage] = useState(0);
    const pageSize = 15;

    const statusOptions = useMemo(() => [
        { id: 'all', label: 'Tous', count: contracts.length },
        { id: 'draft', label: 'Brouillon', count: contracts.filter((c) => c.status === 'draft').length },
        { id: 'generated', label: 'Genere', count: contracts.filter((c) => c.status === 'generated').length },
        { id: 'signed', label: 'Signe', count: contracts.filter((c) => c.status === 'signed').length },
        { id: 'cancelled', label: 'Annule', count: contracts.filter((c) => c.status === 'cancelled').length },
    ], [contracts]);

    const filteredContracts = useMemo(() => {
        let list = contracts;
        if (statusFilter !== 'all') list = list.filter((c) => c.status === statusFilter);
        if (query.trim()) { const q = query.trim().toLowerCase(); list = list.filter((c) => hasSearchMatch(c, q)); }
        list.sort((a, b) => {
            const va = String(a[sortKey] ?? '').toLowerCase();
            const vb = String(b[sortKey] ?? '').toLowerCase();
            return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
        });
        return list;
    }, [contracts, query, statusFilter, sortKey, sortDir]);

    const pageCount = Math.max(1, Math.ceil(filteredContracts.length / pageSize));
    const pageContracts = filteredContracts.slice(page * pageSize, (page + 1) * pageSize);

    function toggleSort(key: SortKey) {
        if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
        else { setSortKey(key); setSortDir('asc'); }
    }

    function SortIcon({ col }: { col: SortKey }) {
        if (sortKey !== col) return <ChevronsUpDown size={11} className="text-[var(--text-muted)]" />;
        return sortDir === 'asc' ? <ChevronUp size={11} className="text-[var(--accent)]" /> : <ChevronDown size={11} className="text-[var(--accent)]" />;
    }

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
        const label = type === 'pdf' ? 'PDF' : 'DOCX';
        toast.loading(`Generation du ${label}...`);
        const url = type === 'pdf' ? `/contracts/${contractId}/export-pdf` : `/contracts/${contractId}/generate`;
        router.put(url, {}, {
            preserveScroll: true,
            onSuccess: () => { setGeneratingId(null); toast.dismiss(); toast.success(`${label} genere avec succes.`); },
            onError: () => { setGeneratingId(null); toast.dismiss(); toast.error(`Echec de la generation du ${label}.`); },
        });
    }

    function handleAction(contract: ContractRow, action: ActionId) {
        switch (action) {
            case 'preview': setPreviewContract(contract); break;
            case 'edit': openEditDrawer(contract); break;
            case 'print': window.open(`/contracts/${contract.id}/print`, '_blank'); break;
            case 'mark-signed':
                router.put(`/contracts/${contract.id}/signed`, {}, {
                    preserveScroll: true,
                    onSuccess: () => toast.success('Contrat marque comme signe.'),
                    onError: () => toast.error('Erreur lors de la mise a jour.'),
                });
                break;
            case 'generate-docx': generateDocument(contract.id, 'docx'); break;
            case 'generate-pdf': generateDocument(contract.id, 'pdf'); break;
            case 'download-pdf': if (contract.pdfDownloadUrl) window.location.href = contract.pdfDownloadUrl; break;
            case 'download-docx': if (contract.generatedDocumentDownloadUrl) window.location.href = contract.generatedDocumentDownloadUrl; break;
            case 'delete': setDeleteTarget(contract); break;
        }
    }

    const metricCards = useMemo(() => [
        { label: 'Total contrats', value: metrics.total, detail: 'Tous les contrats', icon: ScrollText, color: '' },
        { label: 'Brouillon', value: metrics.draft, detail: 'Non genere', icon: AlertTriangle, color: metrics.draft > 0 ? 'text-amber-400' : 'text-[var(--text-muted)]' },
        { label: 'Genere', value: metrics.generated, detail: 'DOCX/PDF cree', icon: FileText, color: metrics.generated > 0 ? 'text-sky-400' : 'text-[var(--text-muted)]' },
        { label: 'Signe', value: metrics.signed, detail: 'Signature client', icon: CheckCircle2, color: metrics.signed > 0 ? 'text-emerald-400' : 'text-[var(--text-muted)]' },
        { label: 'Total TTC', value: currencyFormat(metrics.totalTtc), detail: 'Somme tous contrats', icon: ScrollText, color: 'text-[var(--accent)]' },
    ], [metrics]);

    const statusFilterBg: Record<string, string> = {
        draft: 'bg-amber-400/10', generated: 'bg-sky-400/10', signed: 'bg-emerald-400/10', cancelled: 'bg-red-400/10',
    };
    const statusFilterColor: Record<string, string> = {
        draft: 'text-amber-300', generated: 'text-sky-300', signed: 'text-emerald-300', cancelled: 'text-red-300',
    };

    const generating = (id: number) => generatingId === id;

    return (
        <>
            <AppShell>
                <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                        <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">Finance</p>
                        <h1 className="text-2xl font-bold tracking-[-0.02em] text-[var(--foreground)]">Contrats</h1>
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
                            <Card key={card.label} className="gap-0 border border-[var(--border)] p-4 shadow-sm transition hover:shadow-md">
                                <div className={cn('mb-2 flex size-9 items-center justify-center rounded-lg bg-[var(--surface-2)]', card.color || 'text-[var(--text-muted)]')}>
                                    <Icon size={16} />
                                </div>
                                <p className="text-[11px] font-medium text-[var(--text-muted)]">{card.label}</p>
                                <p className={cn('mt-0.5 text-2xl font-semibold text-[var(--foreground)]', card.color)}>{card.value}</p>
                                <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">{card.detail}</p>
                            </Card>
                        );
                    })}
                </section>

                <div className="min-w-0 rounded-xl border border-[var(--border)] bg-[var(--surface)]">
                    <div className="flex flex-wrap items-center gap-2 border-b border-[var(--border)] px-3 py-2">
                        <div className="relative max-w-[220px] flex-1">
                            <Search size={12} className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                            <input value={query} onChange={(e) => { setQuery(e.target.value); setPage(0); }}
                                placeholder="Rechercher par contrat, client..."
                                className="h-7 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] pl-7 pr-2 text-[11px] text-[var(--text)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]"
                            />
                            {query ? (
                                <button type="button" onClick={() => setQuery('')}
                                    className="absolute right-1 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)]">
                                    <X size={12} />
                                </button>
                            ) : null}
                        </div>
                        <div className="ml-auto flex items-center gap-1">
                            <Dropdown>
                                <Dropdown.Trigger className={cn("inline-flex h-7 items-center gap-1.5 rounded-lg border px-2.5 text-[11px] font-medium transition hover:border-[var(--accent)]/30", statusFilter !== 'all' ? 'border-[var(--accent)] text-[var(--accent)]' : 'border-[var(--border)] text-[var(--text-muted)]')}>
                                    <span className="contents">
                                        <ListFilter size={12} />
                                        {statusFilter === 'all' ? 'Tous' : statusOptions.find((o) => o.id === statusFilter)?.label}
                                        <span className="rounded bg-[var(--surface-2)] px-1 py-px text-[9px] font-semibold text-[var(--text-muted)]">
                                            {statusOptions.find((o) => o.id === statusFilter)?.count ?? contracts.length}
                                         </span>
                                    </span>
                                </Dropdown.Trigger>
                                <Dropdown.Popover placement="bottom start"
                                    className="min-w-44 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1 shadow-xl">
                                    <Dropdown.Menu aria-label="Filtre statut" selectionMode="single"
                                        disabledKeys={statusOptions.filter((o) => o.count === 0).map((o) => o.id)}
                                        onAction={(key) => { setStatusFilter(key as string); setPage(0); }}
                                        itemClasses={{
                                            base: 'rounded-lg px-2 py-1.5 text-[12px] font-medium text-[var(--text)] transition data-[hover]:bg-[var(--surface-2)] data-[disabled]:opacity-40',
                                        }}>
                                        {statusOptions.map((opt) => {
                                            const Icon = opt.id === 'all' ? ListFilter
                                                : opt.id === 'draft' ? AlertTriangle
                                                : opt.id === 'generated' ? FileText
                                                : opt.id === 'signed' ? CheckCircle2
                                                : FileX;
                                            const color = opt.id === 'all' ? '' : statusFilterColor[opt.id];
                                            return (
                                                <Dropdown.Item key={opt.id}
                                                    id={opt.id}
                                                    textValue={opt.label}>
                                                    <div className="flex w-full items-center gap-2">
                                                        <Dropdown.ItemIndicator>
                                                            <CheckCircle2 size={14} className="text-[var(--accent)]" />
                                                        </Dropdown.ItemIndicator>
                                                        <Icon size={14} className={cn('shrink-0', color)} />
                                                        <span className="flex-1">{opt.label}</span>
                                                        <span className="rounded bg-[var(--surface-2)] px-1.5 py-px text-[10px] font-semibold text-[var(--text-muted)]">{opt.count}</span>
                                                    </div>
                                                </Dropdown.Item>
                                            );
                                        })}
                                    </Dropdown.Menu>
                                </Dropdown.Popover>
                            </Dropdown>
                            <Button variant="light" size="sm" isIconOnly className="h-7 w-7 min-w-0 text-[var(--text-muted)]" onPress={() => router.reload({ preserveScroll: true })}>
                                <RefreshCw size={12} />
                            </Button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-xs min-w-[700px]">
                            <thead>
                                <tr className="border-b border-[var(--border)] text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                                    <th className="w-8 px-3 py-2"></th>
                                    <th className="px-3 py-2">
                                        <button type="button" onClick={() => toggleSort('contractNumber')} className="inline-flex items-center gap-1 transition hover:text-[var(--text)]">
                                            Contrat <SortIcon col="contractNumber" />
                                        </button>
                                    </th>
                                    <th className="px-3 py-2">
                                        <button type="button" onClick={() => toggleSort('dossierNumber')} className="inline-flex items-center gap-1 transition hover:text-[var(--text)]">
                                            Dossier <SortIcon col="dossierNumber" />
                                        </button>
                                    </th>
                                    <th className="px-3 py-2">
                                        <button type="button" onClick={() => toggleSort('clientName')} className="inline-flex items-center gap-1 transition hover:text-[var(--text)]">
                                            Client <SortIcon col="clientName" />
                                        </button>
                                    </th>
                                    <th className="px-3 py-2">
                                        <button type="button" onClick={() => toggleSort('ttc')} className="inline-flex items-center gap-1 transition hover:text-[var(--text)]">
                                            Montant <SortIcon col="ttc" />
                                        </button>
                                    </th>
                                    <th className="px-3 py-2">
                                        <button type="button" onClick={() => toggleSort('status')} className="inline-flex items-center gap-1 transition hover:text-[var(--text)]">
                                            Statut <SortIcon col="status" />
                                        </button>
                                    </th>
                                    <th className="px-3 py-2">
                                        <button type="button" onClick={() => toggleSort('updatedAt')} className="inline-flex items-center gap-1 transition hover:text-[var(--text)]">
                                            Modifie <SortIcon col="updatedAt" />
                                        </button>
                                    </th>
                                    <th className="w-10 px-3 py-2"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {pageContracts.length > 0 ? pageContracts.map((c) => (
                                    <tr key={c.id}
                                        className="border-b border-[var(--border)] transition hover:bg-[var(--surface-2)] last:border-0">
                                        <td className="px-3 py-2">
                                            <span className="flex size-5 items-center justify-center rounded bg-[color-mix(in_srgb,var(--accent)_14%,transparent)] text-[10px] font-bold text-[var(--accent)]">
                                                <ScrollText size={10} />
                                            </span>
                                        </td>
                                        <td className="px-3 py-2">
                                            <p className="max-w-[180px] truncate font-medium text-[var(--text)]">{c.contractNumber}</p>
                                            <p className="max-w-[180px] truncate text-[var(--text-muted)]">{c.projectObject || '-'}</p>
                                        </td>
                                        <td className="px-3 py-2 text-[var(--text-muted)]">
                                            <p className="max-w-[150px] truncate">{c.dossierNumber || '-'}</p>
                                            <p className="max-w-[150px] truncate">{c.clientCin || ''}</p>
                                        </td>
                                        <td className="px-3 py-2">
                                            <div className="flex items-center gap-2">
                                                <Avatar name={c.clientName || '?'} size="sm" className="shrink-0 size-6 text-[9px] font-bold" classNames={{ base: 'bg-[color-mix(in_srgb,var(--accent)_14%,transparent)] text-[var(--accent)]' }} />
                                                <span className="truncate text-[var(--text)]">{c.clientName || '-'}</span>
                                            </div>
                                        </td>
                                        <td className="px-3 py-2 text-right font-semibold text-[var(--text)]">{currencyFormat(c.ttc)}</td>
                                        <td className="px-3 py-2">
                                            <Chip variant="flat" size="sm" color={statusChipColor[c.status] || 'default'}>
                                                {statusLabel[c.status] || c.status}
                                            </Chip>
                                        </td>
                                        <td className="px-3 py-2 text-[var(--text-muted)]">{c.updatedAt || '-'}</td>
                                        <td className="px-3 py-2">
                                            <div className="flex items-center gap-0.5">
                                                <button type="button" onClick={() => handleAction(c, 'preview')}
                                                    className="flex size-6 items-center justify-center rounded text-[var(--text-muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--text)]" title="Apercu">
                                                    <Eye size={12} />
                                                </button>
                                                <button type="button" onClick={() => handleAction(c, 'edit')}
                                                    className="flex size-6 items-center justify-center rounded text-[var(--text-muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--text)]" title="Modifier">
                                                    <Pencil size={12} />
                                                </button>
                                                <Dropdown>
                                                    <Dropdown.Trigger className="flex size-6 items-center justify-center rounded text-[var(--text-muted)] transition hover:bg-[var(--surface-2)] data-[open]:text-[var(--accent)]">
                                                        <span className="contents">
                                                            <MoreHorizontal size={12} />
                                                        </span>
                                                    </Dropdown.Trigger>
                                                    <Dropdown.Popover placement="bottom end"
                                                        className="min-w-40 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-0.5 shadow-xl">
                                                        <Dropdown.Menu aria-label="Actions"
                                                            disabledKeys={generating(c.id) ? ['generate-docx', 'generate-pdf'] : []}
                                                            onAction={(key) => handleAction(c, key as ActionId)}
                                                            itemClasses={{
                                                                base: 'rounded-lg px-2 py-1 text-[11px] font-medium text-[var(--text)] transition data-[hover]:bg-[var(--surface-2)] data-[disabled]:opacity-30',
                                                            }}>
                                                            <Dropdown.Section title="Document"
                                                                classNames={{ heading: 'mb-0.5 px-2 pb-0.5 pt-1.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]' }}>
                                                                {c.hasGeneratedDocument ? (
                                                                    <Dropdown.Item key="download-docx" id="download-docx" className="text-[var(--text)]">
                                                                        <div className="flex items-center gap-2">
                                                                            <FileDown size={13} className="text-emerald-400 shrink-0" />
                                                                            <span>Telecharger DOCX</span>
                                                                        </div>
                                                                    </Dropdown.Item>
                                                                ) : (
                                                                    <Dropdown.Item key="generate-docx" id="generate-docx" className="text-[var(--text)]">
                                                                        <div className="flex items-center gap-2">
                                                                            <FileUp size={13} className="text-blue-400 shrink-0" />
                                                                            <span>{generating(c.id) ? 'Generation...' : 'Generer DOCX'}</span>
                                                                        </div>
                                                                    </Dropdown.Item>
                                                                )}
                                                                {c.hasPdf ? (
                                                                    <Dropdown.Item key="download-pdf" id="download-pdf" className="text-[var(--text)]">
                                                                        <div className="flex items-center gap-2">
                                                                            <Download size={13} className="text-emerald-400 shrink-0" />
                                                                            <span>Telecharger PDF</span>
                                                                        </div>
                                                                    </Dropdown.Item>
                                                                ) : c.hasGeneratedDocument ? (
                                                                    <Dropdown.Item key="generate-pdf" id="generate-pdf" className="text-[var(--text)]">
                                                                        <div className="flex items-center gap-2">
                                                                            <FileText size={13} className="text-violet-400 shrink-0" />
                                                                            <span>{generating(c.id) ? 'Generation...' : 'Generer PDF'}</span>
                                                                        </div>
                                                                    </Dropdown.Item>
                                                                ) : null}
                                                            </Dropdown.Section>
                                                            <Dropdown.Item key="print" id="print" className="text-[var(--text)]">
                                                                <div className="flex items-center gap-2">
                                                                    <Printer size={13} className="text-amber-400 shrink-0" />
                                                                    <span>Imprimer</span>
                                                                </div>
                                                            </Dropdown.Item>
                                                            {c.status !== 'signed' && (
                                                                <Dropdown.Item key="mark-signed" id="mark-signed" className="text-[var(--text)]">
                                                                    <div className="flex items-center gap-2">
                                                                        <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                                                                        <span>Marquer signe</span>
                                                                    </div>
                                                                </Dropdown.Item>
                                                            )}
                                                            <Dropdown.Section title="Danger"
                                                                classNames={{ heading: 'mb-0.5 px-2 pb-0.5 pt-1.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]' }}>
                                                                <Dropdown.Item key="delete" id="delete" className="text-red-400 data-[hover]:bg-red-400/10">
                                                                    <div className="flex items-center gap-2">
                                                                        <Trash2 size={13} className="shrink-0" />
                                                                        <span>Supprimer</span>
                                                                    </div>
                                                                </Dropdown.Item>
                                                            </Dropdown.Section>
                                                        </Dropdown.Menu>
                                                    </Dropdown.Popover>
                                                </Dropdown>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={8} className="px-3 py-8 text-center text-xs text-[var(--text-muted)]">
                                            {query || statusFilter !== 'all' ? 'Aucun contrat trouve.' : 'Creez un contrat a partir d\'un dossier approuve.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex items-center justify-between border-t border-[var(--border)] px-3 py-2">
                        <p className="text-[10px] text-[var(--text-muted)]">{filteredContracts.length} element(s)</p>
                        <div className="flex items-center gap-2">
                            <button type="button" disabled={page === 0} onClick={() => setPage((p) => p - 1)}
                                className="inline-flex h-7 items-center gap-1 rounded-lg border border-[var(--border)] px-2.5 text-[10px] font-medium text-[var(--text-muted)] transition hover:text-[var(--text)] disabled:opacity-40">
                                Precedent
                            </button>
                            <span className="text-[10px] text-[var(--text-muted)]">{page + 1} / {pageCount}</span>
                            <button type="button" disabled={page >= pageCount - 1} onClick={() => setPage((p) => p + 1)}
                                className="inline-flex h-7 items-center gap-1 rounded-lg border border-[var(--border)] px-2.5 text-[10px] font-medium text-[var(--text-muted)] transition hover:text-[var(--text)] disabled:opacity-40">
                                Suivant
                            </button>
                        </div>
                    </div>
                </div>

                <ContractDrawer
                    isOpen={drawerOpen}
                    mode={drawerMode}
                    contract={drawerMode === 'edit' ? selectedContract : null}
                    clients={clients}
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
                                        <Chip variant="flat" size="sm" color={statusChipColor[previewContract.status] || 'default'}>
                                            {statusLabel[previewContract.status] || previewContract.status}
                                        </Chip>
                                    </p>
                                    <p className="text-xs text-[var(--text-muted)]">{previewContract.projectObject || '-'}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <Card className="gap-0 p-3" classNames={{ base: 'border border-[var(--border)] bg-[var(--surface-2)] shadow-sm' }}>
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-subtle)]">Client</p>
                                    <p className="mt-1 truncate text-sm font-semibold text-[var(--foreground)]">{previewContract.clientName || '-'}</p>
                                    <p className="truncate text-xs text-[var(--text-muted)]">{previewContract.clientCin}</p>
                                </Card>
                                <Card className="gap-0 p-3" classNames={{ base: 'border border-[var(--border)] bg-[var(--surface-2)] shadow-sm' }}>
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-subtle)]">Dossier</p>
                                    <p className="mt-1 truncate text-sm font-semibold text-[var(--foreground)]">{previewContract.dossierNumber || '-'}</p>
                                </Card>
                                <Card className="gap-0 p-3" classNames={{ base: 'border border-[var(--border)] bg-[var(--surface-2)] shadow-sm' }}>
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-subtle)]">Montant</p>
                                    <p className="mt-1 text-lg font-semibold text-[var(--accent)]">{currencyFormat(previewContract.ttc)}</p>
                                </Card>
                                <Card className="gap-0 p-3" classNames={{ base: 'border border-[var(--border)] bg-[var(--surface-2)] shadow-sm' }}>
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-subtle)]">Statut</p>
                                    <div className="mt-1">
                                        <Chip variant="flat" size="sm" color={statusChipColor[previewContract.status] || 'default'}>
                                            {statusLabel[previewContract.status] || previewContract.status}
                                        </Chip>
                                    </div>
                                </Card>
                            </div>

                            <Card className="gap-0 p-4" classNames={{ base: 'border border-[var(--border)] shadow-sm' }}>
                                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-subtle)]">Calcul</p>
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="rounded-lg bg-[var(--surface-2)] p-2 text-center">
                                        <p className="text-[10px] text-[var(--text-muted)]">HT</p>
                                        <p className="text-sm font-semibold text-[var(--foreground)]">{currencyFormat(previewContract.ht)}</p>
                                    </div>
                                    <div className="rounded-lg bg-[var(--surface-2)] p-2 text-center">
                                        <p className="text-[10px] text-[var(--text-muted)]">TVA</p>
                                        <p className="text-sm font-semibold text-[var(--foreground)]">{currencyFormat(previewContract.tva)}</p>
                                    </div>
                                    <div className="rounded-lg bg-[color-mix(in_srgb,var(--accent)_10%,var(--surface-2))] p-2 text-center">
                                        <p className="text-[10px] text-[var(--accent)]">TTC</p>
                                        <p className="text-sm font-semibold text-[var(--accent)]">{currencyFormat(previewContract.ttc)}</p>
                                    </div>
                                </div>
                                <div className="my-3 h-px bg-[var(--border)]" />
                                <div className="space-y-1">
                                    {[
                                        { label: 'Mode', value: previewContract.calculationMode },
                                        { label: 'Taux', value: `${previewContract.feeRatePercent}%` },
                                        { label: 'Surface', value: previewContract.surface ? `${previewContract.surface} m²` : '-' },
                                        { label: 'Prix/m²', value: currencyFormat(previewContract.pricePerSquareMeter) },
                                    ].map((item) => (
                                        <div key={item.label} className="flex items-center justify-between rounded-lg bg-[var(--surface-2)] px-2.5 py-1.5">
                                            <span className="text-[11px] text-[var(--text-muted)]">{item.label}</span>
                                            <span className="text-[12px] font-medium text-[var(--foreground)]">{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </Card>

                            {previewContract.notes ? (
                                <Card className="gap-0 p-4" classNames={{ base: 'border border-[var(--border)] bg-[var(--surface-2)] shadow-sm' }}>
                                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-subtle)]">Notes</p>
                                    <p className="text-sm leading-relaxed text-[var(--text-muted)]">{previewContract.notes}</p>
                                </Card>
                            ) : null}

                            <Card className="gap-0 p-4" classNames={{ base: 'border border-[var(--border)] shadow-sm' }}>
                                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-subtle)]">Chronologie</p>
                                <div className="space-y-3">
                                    {[
                                        { label: 'Cree', date: previewContract.createdAt, color: 'bg-[var(--accent)]', icon: ScrollText },
                                        { label: 'Genere', date: previewContract.generatedAt, color: 'bg-purple-400', icon: FileText },
                                        { label: 'Signe', date: previewContract.signedAt, color: 'bg-emerald-400', icon: CheckCircle2 },
                                    ].filter((e) => e.date).map((event, idx, arr) => (
                                        <div key={event.label} className="flex items-center gap-3">
                                            <div className="relative flex flex-col items-center">
                                                <div className={cn('flex size-8 items-center justify-center rounded-full', event.color === 'bg-[var(--accent)]' ? 'bg-[color-mix(in_srgb,var(--accent)_14%,transparent)]' : `${event.color}/15`)}>
                                                    <div className={cn('size-2.5 rounded-full', event.color)} />
                                                </div>
                                                {idx < arr.length - 1 ? (
                                                    <div className="w-px flex-1 bg-[var(--border)]" />
                                                ) : null}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-[12px] font-medium text-[var(--foreground)]">{event.label}</p>
                                                <p className="text-[11px] text-[var(--text-muted)]">{event.date}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>

                            <div className="flex flex-wrap items-center justify-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-2 shadow-sm">
                                <Button variant="solid" color="primary" size="sm" className="min-w-0 h-8 text-[11px]" onPress={() => { openEditDrawer(previewContract); setPreviewContract(null); }}>
                                    <Pencil size={13} /> Modifier
                                </Button>
                                <span className="h-5 w-px bg-[var(--border)]" />
                                {previewContract.hasGeneratedDocument ? (
                                    <Button variant="bordered" size="sm" className="min-w-0 h-8 text-[11px] border-emerald-400/40 text-emerald-600 hover:bg-emerald-500/10" onPress={() => { window.location.href = previewContract.generatedDocumentDownloadUrl!; }}>
                                        <FileDown size={13} /> DOCX
                                    </Button>
                                ) : (
                                    <Button variant="bordered" size="sm" className="min-w-0 h-8 text-[11px] border-blue-400/40 text-blue-600 hover:bg-blue-500/10" isLoading={generatingId === previewContract.id} isDisabled={generatingId === previewContract.id} onPress={() => { const id = previewContract.id; generateDocument(id, 'docx'); setPreviewContract(null); }}>
                                        <FileUp size={13} /> DOCX
                                    </Button>
                                )}
                                {previewContract.hasPdf ? (
                                    <Button variant="bordered" size="sm" className="min-w-0 h-8 text-[11px] border-emerald-400/40 text-emerald-600 hover:bg-emerald-500/10" onPress={() => { window.location.href = previewContract.pdfDownloadUrl!; }}>
                                        <Download size={13} /> PDF
                                    </Button>
                                ) : previewContract.hasGeneratedDocument ? (
                                    <Button variant="bordered" size="sm" className="min-w-0 h-8 text-[11px] border-violet-400/40 text-violet-600 hover:bg-violet-500/10" isLoading={generatingId === previewContract.id} isDisabled={generatingId === previewContract.id} onPress={() => { const id = previewContract.id; generateDocument(id, 'pdf'); setPreviewContract(null); }}>
                                        <FileText size={13} /> PDF
                                    </Button>
                                ) : null}
                                <span className="h-5 w-px bg-[var(--border)]" />
                                <Button variant="bordered" size="sm" className="min-w-0 size-8 p-0 hover:bg-[var(--surface-3)]" onPress={() => { window.open(`/contracts/${previewContract.id}/print`, '_blank'); }} title="Imprimer">
                                    <Printer size={13} />
                                </Button>
                                {previewContract.status !== 'signed' && (
                                    <Button variant="bordered" size="sm" className="min-w-0 h-8 text-[11px] border-emerald-400/40 text-emerald-600 hover:bg-emerald-500/10" onPress={() => { router.put(`/contracts/${previewContract.id}/signed`, {}, { preserveScroll: true, onSuccess: () => { toast.success('Contrat marque comme signe.'); setPreviewContract(null); }, onError: () => toast.error('Erreur lors de la mise a jour.') }); }}>
                                        <CheckCircle2 size={13} /> Signer
                                    </Button>
                                )}
                                <span className="h-5 w-px bg-[var(--border)]" />
                                <Button variant="solid" color="danger" size="sm" className="min-w-0 size-8 p-0 hover:opacity-80" onPress={() => { setDeleteTarget(previewContract); setPreviewContract(null); }} title="Supprimer">
                                    <Trash2 size={13} />
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
