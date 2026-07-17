import { Head, router } from '@inertiajs/react';
import {
    ArrowDownToLine,
    ArrowUpDown,
    Check,
    CheckCircle2,
    CircleDollarSign,
    Download,
    EllipsisVertical,
    Eye,
    FileSpreadsheet,
    FileText,
    Pencil,
    Plus,
    RefreshCw,
    ReceiptText,
    Search,
    Settings2,
    ShoppingCart,
    Timer,
    Trash2,
    WalletCards,
    WandSparkles,
    X,
    XCircle,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { TabPanel } from 'react-aria-components';
import { toast } from 'sonner';
import { AppShell } from '@/components/layout/AppShell';
import { AppButton } from '@/components/ui/AppButton';
import { Tooltip } from '@heroui/react';
import { AppCard } from '@/components/ui/AppCard';
import { AppConfirmDialog } from '@/components/ui/AppConfirmDialog';
import { AppEmptyState } from '@/components/ui/AppEmptyState';
import { AppPagination } from '@/components/ui/AppPagination';
import { type FinanceMetrics } from '@/features/finance/components/FinanceMetricCards';
import { calculateAgingBuckets, type AgingBucket } from '@/features/finance/utils/calculations';
import { formatCompactMoney } from '@/lib/currency';
import { TreasuryDashboard } from '@/features/finance/components/TreasuryDashboard';
import { FinanceMonthlySummary } from '@/features/finance/components/FinanceMonthlySummary';
import { FinanceDocumentLockBadge, getFinanceDocumentLockedAt } from '@/features/finance/components/FinanceDocumentLockNotice';
import { FinanceTabs } from '@/features/finance/components/FinanceTabs';
import { FinanceDocumentBuilderDrawer } from '@/features/finance/drawers/FinanceDocumentBuilderDrawer';
import { PaymentDrawer } from '@/features/finance/drawers/PaymentDrawer';
import { MetricSparklineCard } from '@/features/finance/components/MetricSparklineCard';
import { ExpensesWorkspace } from '@/features/finance/components/ExpensesWorkspace';
import { ExpenseDrawer, type ExpenseViewMode } from '@/features/finance/drawers/ExpenseDrawer';
import type {
    ClientOption,
    DossierOption,
    Expense,
    FinanceDocument,
    FinanceDocumentType,
    FinanceMonthSummary,
    FinanceSettings,
    Payment,
    TemplateOption,
} from '@/features/finance/types';

const defaultSettings: FinanceSettings = {
    defaultTvaRate: 20,
    defaultCurrency: 'MAD',
    defaultPaymentTermsDays: 30,
    defaultQuoteValidityDays: 30,
    defaultUnitPriceM2: 0,
    defaultArchitectRate: 0,
    companyInfo: {},
    bankInfo: {},
};

const docShowUrl = (id: number) => `/finance/documents/${id}?from=${new URLSearchParams(window.location.search).get('tab') || 'overview'}`;

type Paginated<T> = {
    data: T[] | Paginated<T>;
};

type PageProps = {
    documents?: Paginated<FinanceDocument> | FinanceDocument[];
    payments?: Paginated<Payment> | Payment[];
    expenses?: Expense[];
    monthlySummaries?: FinanceMonthSummary[];
    metrics?: Partial<FinanceMetrics>;
    clients?: ClientOption[];
    dossiers?: DossierOption[];
    templates?: TemplateOption[];
    defaultTemplates?: Array<TemplateOption & { slug?: string }>;
    templateEditorUrl?: string;
    settings?: Partial<FinanceSettings>;
    filters?: { tab?: string };
};

type DocumentActionHandlers = {
    onEdit: (document: FinanceDocument) => void;
    onAccept: (document: FinanceDocument) => void;
    onReject: (document: FinanceDocument) => void;
    onConvert: (document: FinanceDocument) => void;
    onPayment: (document: FinanceDocument) => void;
    onCancel: (document: FinanceDocument) => void;
    onDelete: (document: FinanceDocument) => void;
    onSelect: (document: FinanceDocument) => void;
    onGeneratePdf: (document: FinanceDocument) => void;
    onGenerateExcel: (document: FinanceDocument) => void;
};

function unwrap<T>(value?: Paginated<T> | T[] | { data?: unknown }): T[] {
    if (!value) return [];
    if (Array.isArray(value)) return value;

    const data = value.data;

    if (Array.isArray(data)) return data as T[];
    if (data && typeof data === 'object' && 'data' in data) return unwrap<T>(data as Paginated<T>);

    return [];
}

function statusClass(status: string | undefined | null) {
    if (!status) return 'border-zinc-500/30 bg-zinc-500/10 text-zinc-300';
    if (status === 'paid' || status === 'accepted') return 'border-emerald-400/25 bg-emerald-400/10 text-emerald-300';
    if (status === 'issued' || status === 'sent') return 'border-sky-400/25 bg-sky-400/10 text-sky-300';
    if (status === 'partially_paid' || status === 'draft') return 'border-amber-400/25 bg-amber-400/10 text-amber-300';
    if (status === 'overdue' || status === 'rejected' || status === 'cancelled') return 'border-red-400/25 bg-red-400/10 text-red-300';

    return 'border-zinc-500/30 bg-zinc-500/10 text-zinc-300';
}

function typeLabel(type: string) {
    if (type === 'quote') return 'Devis';
    if (type === 'invoice') return 'Facture';
    if (type === 'receipt') return 'Recu';
    return type;
}

function documentMatches(document: FinanceDocument, query: string, statusFilter?: string, typeFilter?: string) {
    if (statusFilter && statusFilter !== 'all' && document.status !== statusFilter) return false;
    if (typeFilter && typeFilter !== 'all' && document.type !== typeFilter) return false;
    if (!query.trim()) return true;

    return [
        document.number,
        document.type,
        document.typeLabel,
        document.status,
        document.client?.name,
        document.dossier?.number,
        document.dossier?.projectObject,
    ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(query.trim().toLowerCase());
}

const statusFilterOptions = [
    { id: 'all', label: 'All' },
    { id: 'draft', label: 'Draft' },
    { id: 'issued', label: 'Issued' },
    { id: 'sent', label: 'Sent' },
    { id: 'accepted', label: 'Accepted' },
    { id: 'partially_paid', label: 'Partial' },
    { id: 'paid', label: 'Paid' },
    { id: 'overdue', label: 'Overdue' },
    { id: 'rejected', label: 'Rejected' },
    { id: 'cancelled', label: 'Cancelled' },
];

const typeFilterOptions = [
    { id: 'all', label: 'All types' },
    { id: 'quote', label: 'Devis' },
    { id: 'invoice', label: 'Facture' },
    { id: 'receipt', label: 'Recu' },
];

function paymentMatches(payment: Payment, query: string) {
    if (!query.trim()) return true;

    return [
        payment.paymentNumber,
        payment.method,
        payment.paidAt,
        payment.document?.number,
        payment.client?.name,
        payment.receipt?.number,
        payment.receipt?.status,
    ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(query.trim().toLowerCase());
}

function DocumentFileBadges({ document }: { document: FinanceDocument }) {
    return (
        <div className="flex flex-nowrap items-center gap-1">
            <span className={[
                'whitespace-nowrap rounded border px-1.5 py-0.5 text-[10px] font-semibold',
                document.hasExcel ? 'border-emerald-400/25 bg-emerald-400/10 text-emerald-300' : 'border-zinc-500/30 bg-zinc-500/10 text-zinc-300',
            ].join(' ')}>
                XLS
            </span>
            <span className={[
                'whitespace-nowrap rounded border px-1.5 py-0.5 text-[10px] font-semibold',
                document.hasPdf ? 'border-emerald-400/25 bg-emerald-400/10 text-emerald-300' : 'border-zinc-500/30 bg-zinc-500/10 text-zinc-300',
            ].join(' ')}>
                PDF
            </span>
            <FinanceDocumentLockBadge document={document} compact />
        </div>
    );
}

function FinanceDocumentDetailPanel({
    document,
    actions,
}: {
    document: FinanceDocument | null;
    actions: DocumentActionHandlers;
}) {
    if (!document) {
        return (
            <AppCard className="p-3">
                <p className="text-xs font-semibold text-[var(--text)]">Document finance</p>
                <p className="mt-1 text-[11px] text-[var(--text-muted)]">
                    Select a quote, invoice, or receipt to see actions and totals.
                </p>
            </AppCard>
        );
    }

    const lockedAt = getFinanceDocumentLockedAt(document);

    return (
        <AppCard className="overflow-hidden p-0">
            <div className="border-b border-[var(--border)] px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--accent)]">Selected document</p>
                <div className="mt-1.5 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                            <h2 className="truncate text-sm font-semibold text-[var(--text)]">{document.number}</h2>
                            <FinanceDocumentLockBadge document={document} compact />
                        </div>
                        <p className="text-[11px] text-[var(--text-muted)]">{typeLabel(document.type)} &middot; {document.dossier?.number || '-'}</p>
                    </div>
                    <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusClass(document.status)}`}>
                        {document.status?.replace(/_/g, ' ') || document.status}
                    </span>
                </div>
            </div>

            <div className="space-y-3 p-4">
                <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Client</p>
                        <p className="mt-0.5 truncate text-xs font-semibold text-[var(--text)]">{document.client?.name || '-'}</p>
                        <p className="truncate text-[10px] text-[var(--text-muted)]">{document.client?.cin || '-'}</p>
                    </div>
                    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Dossier</p>
                        <p className="mt-0.5 truncate text-xs font-semibold text-[var(--text)]">{document.dossier?.number || '-'}</p>
                        <p className="truncate text-[10px] text-[var(--text-muted)]">{document.dossier?.projectObject || '-'}</p>
                    </div>
                    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Total TTC</p>
                        <p className="mt-0.5 truncate text-xs font-semibold text-[var(--accent)]">{formatCompactMoney(document.totalTtc, document.currency)}</p>
                        <p className="truncate text-[10px] text-[var(--text-muted)]">HT {formatCompactMoney(document.subtotalHt, document.currency)}</p>
                    </div>
                    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Remaining</p>
                        <p className="mt-0.5 truncate text-xs font-semibold text-[var(--text)]">{formatCompactMoney(document.remainingTotal, document.currency)}</p>
                        <p className="truncate text-[10px] text-[var(--text-muted)]">Paid {formatCompactMoney(document.paidTotal, document.currency)}</p>
                    </div>
                </div>

                <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Files</p>
                    <div className="mt-1.5">
                        <DocumentFileBadges document={document} />
                    </div>
                    {lockedAt ? <p className="mt-1.5 text-[10px] text-[var(--text-muted)]">Locked: {lockedAt}</p> : null}
                </div>

                <div className="space-y-1.5">
                    <AppButton variant="primary" className="w-full" size="sm" onPress={() => actions.onGeneratePdf(document)}>
                        <FileText size={13} />
                        Generate PDF
                    </AppButton>
                    <div className="grid grid-cols-2 gap-1.5">
                        <AppButton variant="flat" size="sm" onPress={() => actions.onGenerateExcel(document)}>
                            <FileSpreadsheet size={13} />
                            Excel
                        </AppButton>
                        <AppButton variant="flat" size="sm" onPress={() => actions.onEdit(document)}>
                            <Pencil size={13} />
                            Edit
                        </AppButton>
                    </div>

                    {document.type === 'quote' ? (
                        <div className="grid grid-cols-2 gap-1.5">
                            <AppButton variant="flat" className="border-emerald-500/20 text-emerald-400" size="sm" onPress={() => actions.onAccept(document)}>
                                <CheckCircle2 size={13} />
                                Accept
                            </AppButton>
                            <AppButton variant="flat" className="border-[var(--accent)]/20 text-[var(--accent)]" size="sm" onPress={() => actions.onConvert(document)}>
                                <ReceiptText size={13} />
                                Invoice
                            </AppButton>
                        </div>
                    ) : null}

                    {document.type === 'invoice' ? (
                        <AppButton variant="flat" className="w-full" size="sm" onPress={() => actions.onPayment(document)}>
                            <WalletCards size={13} />
                            Register payment
                        </AppButton>
                    ) : null}

                    <AppButton variant="danger" className="w-full" size="sm" onPress={() => actions.onDelete(document)}>
                        <Trash2 size={13} />
                        Delete
                    </AppButton>
                </div>
            </div>
        </AppCard>
    );
}

function FinanceDocumentWorkspace({
    documents,
    currency,
    selected,
    onSelect,
    actions,
    searchPlaceholder,
}: {
    documents: FinanceDocument[];
    currency: string;
    selected: FinanceDocument | null;
    onSelect: (document: FinanceDocument) => void;
    actions: DocumentActionHandlers;
    searchPlaceholder: string;
}) {
    const [query, setQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const filtered = useMemo(() => documents.filter((document) => documentMatches(document, query, statusFilter, typeFilter)), [documents, query, statusFilter, typeFilter]);
    const [tablePage, setTablePage] = useState(1);
    const [selectedRows, setSelectedRows] = useState<number[]>([]);
    const TABLE_PAGE_SIZE = 15;
    useEffect(() => { setTablePage(1); }, [query, statusFilter, typeFilter]);
    const pagedFiltered = useMemo(() => filtered.slice((tablePage - 1) * TABLE_PAGE_SIZE, tablePage * TABLE_PAGE_SIZE), [filtered, tablePage]);
    const selectedVisible = selected && filtered.some((document) => document.id === selected.id) ? selected : filtered[0] ?? null;
    const allPageRowsSelected = pagedFiltered.length > 0 && pagedFiltered.every((document) => selectedRows.includes(document.id));

    function toggleRow(documentId: number) {
        setSelectedRows((current) => (
            current.includes(documentId)
                ? current.filter((id) => id !== documentId)
                : [...current, documentId]
        ));
    }

    function togglePageRows() {
        setSelectedRows((current) => {
            const pageIds = pagedFiltered.map((document) => document.id);

            if (pageIds.every((id) => current.includes(id))) {
                return current.filter((id) => !pageIds.includes(id));
            }

            return Array.from(new Set([...current, ...pageIds]));
        });
    }

    function statusStyle(status: string | undefined | null) {
        if (!status) return 'bg-zinc-500/10 text-zinc-300 border-zinc-500/20';
        if (status === 'paid' || status === 'accepted') return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20';
        if (status === 'issued' || status === 'sent') return 'bg-blue-500/10 text-blue-300 border-blue-500/20';
        if (status === 'draft') return 'bg-zinc-500/10 text-zinc-300 border-zinc-500/20';
        if (status === 'partially_paid') return 'bg-amber-500/10 text-amber-300 border-amber-500/20';
        if (status === 'overdue') return 'bg-red-500/10 text-red-300 border-red-500/20';
        if (status === 'rejected' || status === 'cancelled') return 'bg-white/5 text-white/40 border-white/10';
        return 'bg-zinc-500/10 text-zinc-300 border-zinc-500/20';
    }

    function Checkbox({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
        return (
            <button
                type="button"
                role="checkbox"
                aria-checked={checked}
                aria-label={label}
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === ' ') { e.preventDefault(); onChange(); } }}
                onClick={(e) => { e.stopPropagation(); onChange(); }}
                className={`flex size-4 shrink-0 items-center justify-center rounded border transition ${
                    checked
                        ? 'border-[var(--accent)] bg-[var(--accent)] text-black'
                        : 'border-[var(--border)] bg-transparent hover:border-[var(--accent)]'
                }`}
            >
                {checked ? <Check size={11} strokeWidth={3} /> : null}
            </button>
        );
    }

    return (
        <section className="min-w-0 rounded-xl border border-[var(--border)] bg-[var(--surface)]">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-2 px-3 py-2.5">
                <div className="flex items-center gap-1.5">
                    <div className="relative w-[200px]">
                        <Search size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                        <input
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder={searchPlaceholder}
                            className="h-7 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] pl-7 pr-6 text-xs text-[var(--text)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--accent)_18%,transparent)]"
                        />
                        {query ? (
                            <button
                                type="button"
                                onClick={() => setQuery('')}
                                className="absolute right-0.5 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center rounded text-[var(--text-muted)] hover:bg-[var(--surface-2)]"
                            >
                                <X size={11} />
                            </button>
                        ) : null}
                    </div>
                    <button type="button" className={`flex h-7 items-center gap-1 rounded-lg border border-[var(--border)] px-2 text-[11px] font-medium transition hover:bg-[var(--surface-2)] ${
                        isRefreshing ? 'bg-[var(--surface)] text-[var(--accent)]' : 'bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text)]'
                    }`} disabled={isRefreshing} onClick={() => { setIsRefreshing(true); router.reload({ only: ['documents'], onFinish: () => setIsRefreshing(false) }); }}>
                        <RefreshCw size={11} className={isRefreshing ? 'animate-spin' : ''} />
                        {isRefreshing ? '...' : null}
                    </button>
                    <button type="button" className={`flex h-7 items-center gap-1 rounded-lg border px-2 text-[11px] font-medium transition ${
                        showFilters
                            ? 'border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] text-[var(--accent)]'
                            : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]'
                    }`} onClick={() => setShowFilters((v) => !v)}>
                        <Settings2 size={11} />
                        {statusFilter !== 'all' || typeFilter !== 'all' ? (
                            <span className="ml-0.5 flex size-3.5 items-center justify-center rounded-full bg-[var(--accent)] text-[8px] font-bold text-black">!</span>
                        ) : null}
                    </button>
                </div>

                <div className="ml-auto hidden text-[11px] font-medium text-[var(--text-muted)] md:block">
                    {filtered.length} document{filtered.length !== 1 ? 's' : ''}
                </div>
            </div>

            {/* Filter panel */}
            {showFilters ? (
                <div className="border-t border-[var(--border)] px-3 py-2.5">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="space-y-1">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Status</p>
                            <div className="flex flex-wrap gap-1">
                                {statusFilterOptions.map((opt) => (
                                    <button key={opt.id} type="button" onClick={() => setStatusFilter(opt.id)}
                                        className={[
                                            'rounded-lg border px-2 py-1 text-[11px] font-medium transition',
                                            statusFilter === opt.id
                                                ? 'border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] text-[var(--accent)]'
                                                : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--text)]',
                                        ].join(' ')}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Type</p>
                            <div className="flex flex-wrap gap-1">
                                {typeFilterOptions.map((opt) => (
                                    <button key={opt.id} type="button" onClick={() => setTypeFilter(opt.id)}
                                        className={[
                                            'rounded-lg border px-2 py-1 text-[11px] font-medium transition',
                                            typeFilter === opt.id
                                                ? 'border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] text-[var(--accent)]'
                                                : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--text)]',
                                        ].join(' ')}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}

            {/* Bulk action bar */}
            {selectedRows.length > 0 ? (
                <div className="flex flex-wrap items-center gap-2 border-t border-[var(--border)] bg-[color-mix(in_srgb,var(--accent)_6%,transparent)] px-3 py-2">
                    <span className="text-xs font-semibold text-[var(--accent)]">{selectedRows.length} selected</span>
                    <div className="ml-auto flex items-center gap-1">
                        <button type="button" className="flex h-7 items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 text-[11px] font-medium text-[var(--text-muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--text)]" onClick={() => { selectedRows.forEach((id) => { const doc = filtered.find((d) => d.id === id); if (doc) actions.onGeneratePdf(doc); }); }}>
                            <FileText size={12} /> PDF
                        </button>
                        <button type="button" className="flex h-7 items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 text-[11px] font-medium text-[var(--text-muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--text)]" onClick={() => { selectedRows.forEach((id) => { const doc = filtered.find((d) => d.id === id); if (doc) actions.onGenerateExcel(doc); }); }}>
                            <FileSpreadsheet size={12} /> Excel
                        </button>
                        <div className="mx-1 h-5 w-px bg-[var(--border)]" />
                        <button type="button" className="flex h-7 items-center gap-1.5 rounded-lg px-2 text-[11px] font-medium text-[var(--text-muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--text)]" onClick={() => setSelectedRows([])}>
                            <X size={12} /> Clear
                        </button>
                    </div>
                </div>
            ) : null}

            {/* Desktop table */}
            <div className="hidden md:block">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-[var(--border)] text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                            <th className="w-10 px-3 py-2">
                                <Checkbox checked={allPageRowsSelected} onChange={togglePageRows} label="Select all visible" />
                            </th>
                            <th className="px-3 py-2">
                                <span className="inline-flex items-center gap-1.5">
                                    <ReceiptText size={11} />
                                    Document
                                </span>
                            </th>
                            <th className="px-3 py-2">Type</th>
                            <th className="px-3 py-2">
                                <span className="inline-flex items-center gap-1.5">
                                    <FileText size={11} />
                                    Client / Dossier
                                </span>
                            </th>
                            <th className="px-3 py-2">Status</th>
                            <th className="px-3 py-2 text-right">Total</th>
                            <th className="px-3 py-2 text-right">Paid</th>
                            <th className="px-3 py-2 text-right">Remaining</th>
                            <th className="w-24 px-3 py-2 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length > 0 ? (
                            pagedFiltered.map((document) => {
                                const rowSelected = selectedVisible?.id === document.id;
                                const rowChecked = selectedRows.includes(document.id);

                                return (
                                    <tr
                                        key={document.id}
                            onClick={() => router.visit(docShowUrl(document.id))}
                                        className={`group cursor-pointer border-b border-[var(--border)] text-xs transition last:border-0 ${
                                            rowSelected
                                                ? 'bg-[color-mix(in_srgb,var(--accent)_6%,transparent)]'
                                                : 'hover:bg-[var(--surface-2)]'
                                        }`}
                                    >
                                        <td className="px-3 py-2">
                                            <Checkbox checked={rowChecked} onChange={() => toggleRow(document.id)} label={`Select ${document.number}`} />
                                        </td>
                                        <td className="px-3 py-2">
                                            <div className="flex items-center gap-2">
                                                <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] text-[var(--accent)]">
                                                    <ReceiptText size={12} />
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-1">
                                                        <span className="max-w-[140px] truncate text-xs font-semibold text-[var(--text)]">{document.number}</span>
                                                        <FinanceDocumentLockBadge document={document} compact />
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-3 py-2">
                                            <span className="text-[11px] font-medium text-[var(--text-muted)]">{document.typeLabel || typeLabel(document.type)}</span>
                                        </td>
                                        <td className="px-3 py-2">
                                            <p className="max-w-[180px] truncate text-xs font-medium text-[var(--text)]">{document.client?.name || '-'}</p>
                                            <p className="max-w-[180px] truncate text-[10px] text-[var(--text-muted)]">{document.dossier?.number || ''}{document.dossier?.projectObject ? ` · ${document.dossier.projectObject}` : ''}</p>
                                        </td>
                                        <td className="px-3 py-2">
                                            <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusStyle(document.status)}`}>
                                                {document.status?.replace(/_/g, ' ') || document.status}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2 text-right text-xs font-semibold text-[var(--text)]">{formatCompactMoney(document.totalTtc, currency)}</td>
                                        <td className="px-3 py-2 text-right text-xs font-medium text-emerald-400">{formatCompactMoney(document.paidTotal, currency)}</td>
                                        <td className={`px-3 py-2 text-right text-xs font-medium ${document.remainingTotal > 0 ? 'text-red-400' : 'text-[var(--text-muted)]'}`}>
                                            {formatCompactMoney(document.remainingTotal, currency)}
                                        </td>
                                        <td className="px-3 py-2">
                                            <div className="flex justify-end gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                                                <Tooltip delay={500}>
                                                    <AppButton isIconOnly size="sm" variant="light" className="min-w-0 h-7 w-7 text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]" onPress={() => router.visit(docShowUrl(document.id))}>
                                                        <Eye size={13} />
                                                    </AppButton>
                                                    <Tooltip.Content className="bg-[var(--surface)] text-[var(--text)] border border-[var(--border)]">Open</Tooltip.Content>
                                                </Tooltip>
                                                <Tooltip delay={500}>
                                                    <AppButton isIconOnly size="sm" variant="light" className="min-w-0 h-7 w-7 text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]" onPress={() => actions.onEdit(document)}>
                                                        <Pencil size={13} />
                                                    </AppButton>
                                                    <Tooltip.Content className="bg-[var(--surface)] text-[var(--text)] border border-[var(--border)]">Edit</Tooltip.Content>
                                                </Tooltip>
                                                <div className="relative group/more">
                                                    <Tooltip delay={500}>
                                                        <AppButton isIconOnly size="sm" variant="light" className="min-w-0 h-7 w-7 text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]">
                                                            <EllipsisVertical size={13} />
                                                        </AppButton>
                                                        <Tooltip.Content className="bg-[var(--surface)] text-[var(--text)] border border-[var(--border)]">More</Tooltip.Content>
                                                    </Tooltip>
                                                    <div className="absolute right-0 top-full z-20 mt-0.5 hidden w-44 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)] py-1 shadow-lg group-hover/more:block group-focus-within/more:block">
                                                        <button type="button" className="flex w-full items-center gap-2 px-2.5 py-1.5 text-[11px] text-[var(--text-muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--text)]" onClick={(e) => { e.stopPropagation(); actions.onGeneratePdf(document); }}>
                                                            <FileText size={12} /> Generate PDF
                                                        </button>
                                                        <button type="button" className="flex w-full items-center gap-2 px-2.5 py-1.5 text-[11px] text-[var(--text-muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--text)]" onClick={(e) => { e.stopPropagation(); actions.onGenerateExcel(document); }}>
                                                            <FileSpreadsheet size={12} /> Generate Excel
                                                        </button>
                                                        {document.type === 'invoice' ? (
                                                            <button type="button" className="flex w-full items-center gap-2 px-2.5 py-1.5 text-[11px] text-[var(--text-muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--text)]" onClick={(e) => { e.stopPropagation(); actions.onPayment(document); }}>
                                                                <WalletCards size={12} /> Record payment
                                                            </button>
                                                        ) : null}
                                                        <div className="my-1 h-px bg-[var(--border)]" />
                                                        {document.type === 'quote' ? (
                                                            <button type="button" className="flex w-full items-center gap-2 px-2.5 py-1.5 text-[11px] text-[var(--text-muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--text)]" onClick={(e) => { e.stopPropagation(); actions.onReject(document); }}>
                                                                <XCircle size={12} /> Reject
                                                            </button>
                                                        ) : null}
                                                        <button type="button" className="flex w-full items-center gap-2 px-2.5 py-1.5 text-[11px] text-[var(--text-muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--text)]" onClick={(e) => { e.stopPropagation(); actions.onCancel(document); }}>
                                                            <XCircle size={12} /> Cancel
                                                        </button>
                                                        <div className="my-1 h-px bg-[var(--border)]" />
                                                        <button type="button" className="flex w-full items-center gap-2 px-2.5 py-1.5 text-[11px] text-red-400 transition hover:bg-[var(--surface-2)]" onClick={(e) => { e.stopPropagation(); actions.onDelete(document); }}>
                                                            <Trash2 size={12} /> Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={9} className="p-6 text-center">
                                    <div className="flex flex-col items-center gap-1.5">
                                        <FileText size={24} className="text-[var(--text-muted)]" />
                                        <p className="text-xs font-semibold text-[var(--text)]">No finance documents found</p>
                                        <p className="text-[11px] text-[var(--text-muted)]">Change search or create a new document.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile cards */}
            <div className="divide-y divide-[var(--border)] md:hidden">
                {pagedFiltered.map((document) => (
                    <div key={document.id} className="space-y-2.5 p-3" onClick={() => onSelect(document)}>
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                                <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] text-[var(--accent)]">
                                    <ReceiptText size={12} />
                                </div>
                                <div className="min-w-0">
                                    <p className="truncate text-xs font-semibold">{document.number}</p>
                                    <p className="truncate text-[11px] text-[var(--text-muted)]">{document.client?.name || '-'} / {document.dossier?.number || '-'}</p>
                                </div>
                            </div>
                            <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusStyle(document.status)}`}>
                                {document.status?.replace(/_/g, ' ') || document.status}
                            </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-[11px]">
                            <span className="text-[var(--text-muted)]">Total <span className="font-semibold text-[var(--text)]">{formatCompactMoney(document.totalTtc, currency)}</span></span>
                            <span className="text-[var(--text-muted)]">Paid <span className="font-semibold text-emerald-400">{formatCompactMoney(document.paidTotal, currency)}</span></span>
                            <span className="text-[var(--text-muted)]">Due <span className={`font-semibold ${document.remainingTotal > 0 ? 'text-red-400' : 'text-[var(--text-muted)]'}`}>{formatCompactMoney(document.remainingTotal, currency)}</span></span>
                        </div>
                        <div className="flex gap-1.5">
                            <button type="button" className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1.5 text-[11px] font-medium text-[var(--text)] transition hover:bg-[var(--surface-2)]" onClick={(e) => { e.stopPropagation(); router.visit(docShowUrl(document.id)); }}>Open</button>
                            <div className="relative group/more">
                                <button type="button" className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1.5 text-[11px] font-medium text-[var(--text)] transition hover:bg-[var(--surface-2)]" onClick={(e) => e.stopPropagation()}>
                                    <EllipsisVertical size={13} />
                                </button>
                                <div className="absolute bottom-full right-0 z-20 mb-1 hidden w-44 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)] py-1 shadow-lg group-hover/more:block group-focus-within/more:block">
                                    <button type="button" className="flex w-full items-center gap-2 px-2.5 py-1.5 text-[11px] text-[var(--text-muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--text)]" onClick={(e) => { e.stopPropagation(); actions.onEdit(document); }}>
                                        <Pencil size={12} /> Edit
                                    </button>
                                    <button type="button" className="flex w-full items-center gap-2 px-2.5 py-1.5 text-[11px] text-[var(--text-muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--text)]" onClick={(e) => { e.stopPropagation(); actions.onGeneratePdf(document); }}>
                                        <FileText size={12} /> Generate PDF
                                    </button>
                                    <button type="button" className="flex w-full items-center gap-2 px-2.5 py-1.5 text-[11px] text-[var(--text-muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--text)]" onClick={(e) => { e.stopPropagation(); actions.onGenerateExcel(document); }}>
                                        <FileSpreadsheet size={12} /> Generate Excel
                                    </button>
                                    {document.type === 'invoice' ? (
                                        <button type="button" className="flex w-full items-center gap-2 px-2.5 py-1.5 text-[11px] text-[var(--text-muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--text)]" onClick={(e) => { e.stopPropagation(); actions.onPayment(document); }}>
                                            <WalletCards size={12} /> Payment
                                        </button>
                                    ) : null}
                                    <div className="my-1 h-px bg-[var(--border)]" />
                                    {document.type === 'quote' ? (
                                        <button type="button" className="flex w-full items-center gap-2 px-2.5 py-1.5 text-[11px] text-[var(--text-muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--text)]" onClick={(e) => { e.stopPropagation(); actions.onReject(document); }}>
                                            <XCircle size={12} /> Reject
                                        </button>
                                    ) : null}
                                    <button type="button" className="flex w-full items-center gap-2 px-2.5 py-1.5 text-[11px] text-[var(--text-muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--text)]" onClick={(e) => { e.stopPropagation(); actions.onCancel(document); }}>
                                        <XCircle size={12} /> Cancel
                                    </button>
                                    <div className="my-1 h-px bg-[var(--border)]" />
                                    <button type="button" className="flex w-full items-center gap-2 px-2.5 py-1.5 text-[11px] text-red-400 transition hover:bg-[var(--surface-2)]" onClick={(e) => { e.stopPropagation(); actions.onDelete(document); }}>
                                        <Trash2 size={12} /> Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <AppPagination page={tablePage} pageSize={TABLE_PAGE_SIZE} total={filtered.length} onChange={setTablePage} variant="reference" />
        </section>
    );
}

function PaymentWorkspace({
    payments,
    currency,
    onReceipt,
}: {
    payments: Payment[];
    currency: string;
    onReceipt: (url: string | null | undefined) => void;
}) {
    const [query, setQuery] = useState('');
    const filtered = useMemo(() => payments.filter((payment) => paymentMatches(payment, query)), [payments, query]);
    const [tablePage, setTablePage] = useState(1);
    const TABLE_PAGE_SIZE = 15;
    useEffect(() => { setTablePage(1); }, [query]);
    const pagedFiltered = useMemo(() => filtered.slice((tablePage - 1) * TABLE_PAGE_SIZE, tablePage * TABLE_PAGE_SIZE), [filtered, tablePage]);

    const totalAmount = useMemo(() => filtered.reduce((s, p) => s + p.amount, 0), [filtered]);

    return (
        <section className="min-w-0 rounded-xl border border-[var(--border)] bg-[var(--surface)]">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-2 px-3 py-2.5">
                <div className="flex items-center gap-1.5">
                    <div className="relative w-[200px]">
                        <Search size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                        <input
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Search payments, invoices, clients..."
                            className="h-7 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] pl-7 pr-6 text-xs text-[var(--text)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--accent)_18%,transparent)]"
                        />
                        {query && (
                            <button
                                type="button"
                                onClick={() => setQuery('')}
                                className="absolute right-0.5 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center rounded text-[var(--text-muted)] hover:bg-[var(--surface-2)]"
                            >
                                <X size={11} />
                            </button>
                        )}
                    </div>
                </div>

                <div className="ml-auto hidden text-[11px] font-medium text-[var(--text-muted)] md:block">
                    {filtered.length} paiement{filtered.length !== 1 ? 's' : ''} · {formatCompactMoney(totalAmount, currency)}
                </div>
            </div>

            {/* Desktop table */}
            <div className="hidden md:block">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-[var(--border)] text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                            <th className="px-3 py-2">
                                <span className="inline-flex items-center gap-1.5">
                                    <CircleDollarSign size={11} />
                                    Payment
                                </span>
                            </th>
                            <th className="px-3 py-2">
                                <span className="inline-flex items-center gap-1.5">
                                    <ReceiptText size={11} />
                                    Invoice / Client
                                </span>
                            </th>
                            <th className="px-3 py-2 text-right">Amount</th>
                            <th className="px-3 py-2">Receipt</th>
                            <th className="w-24 px-3 py-2 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pagedFiltered.length > 0 ? (
                            pagedFiltered.map((payment) => (
                                <tr key={payment.id} className="group cursor-pointer border-b border-[var(--border)] text-xs transition hover:bg-[var(--surface-2)] last:border-0">
                                    <td className="px-3 py-2">
                                        <div className="flex items-center gap-2">
                                            <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] text-[var(--accent)]">
                                                <CircleDollarSign size={12} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-semibold text-[var(--text)]">{payment.paymentNumber}</p>
                                                <p className="text-[10px] text-[var(--text-muted)]">
                                                    {payment.paidAt || '-'}
                                                    {payment.method ? <><span className="mx-1">·</span>{payment.method}</> : null}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-3 py-2">
                                        <p className="max-w-[180px] truncate text-xs font-medium text-[var(--text)]">{payment.document?.number || '-'}</p>
                                        <p className="max-w-[180px] truncate text-[10px] text-[var(--text-muted)]">{payment.client?.name || '-'}</p>
                                    </td>
                                    <td className="px-3 py-2 text-right text-xs font-semibold tabular-nums text-emerald-400">{formatCompactMoney(payment.amount, currency)}</td>
                                    <td className="px-3 py-2">
                                        {payment.receipt ? (
                                            <div className="flex items-center gap-1.5">
                                                <span className="inline-block size-1.5 rounded-full bg-emerald-400" />
                                                <span className="text-[11px] font-medium text-[var(--text)]">{payment.receipt.number}</span>
                                            </div>
                                        ) : (
                                            <span className="text-[11px] text-[var(--text-muted)]">—</span>
                                        )}
                                    </td>
                                    <td className="px-3 py-2">
                                        <div className="flex justify-end gap-0.5">
                                            {payment.receipt?.urls?.show ? (
                                                <Tooltip delay={500}>
                                                    <AppButton isIconOnly size="sm" variant="light" className="min-w-0 h-6 w-6 text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]" onPress={() => onReceipt(payment.receipt?.urls?.show)}>
                                                        <Eye size={11} />
                                                    </AppButton>
                                                    <Tooltip.Content className="bg-[var(--surface)] text-[var(--text)] border border-[var(--border)]">Voir le reçu</Tooltip.Content>
                                                </Tooltip>
                                            ) : null}
                                            {payment.receipt?.urls?.pdf ? (
                                                <Tooltip delay={500}>
                                                    <AppButton isIconOnly size="sm" variant="light" className="min-w-0 h-6 w-6 text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]" onPress={() => onReceipt(payment.receipt?.urls?.pdf)}>
                                                        <FileText size={11} />
                                                    </AppButton>
                                                    <Tooltip.Content className="bg-[var(--surface)] text-[var(--text)] border border-[var(--border)]">Télécharger PDF</Tooltip.Content>
                                                </Tooltip>
                                            ) : null}
                                            {payment.receipt?.urls?.excel ? (
                                                <Tooltip delay={500}>
                                                    <AppButton isIconOnly size="sm" variant="light" className="min-w-0 h-6 w-6 text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]" onPress={() => onReceipt(payment.receipt?.urls?.excel)}>
                                                        <FileSpreadsheet size={11} />
                                                    </AppButton>
                                                    <Tooltip.Content className="bg-[var(--surface)] text-[var(--text)] border border-[var(--border)]">Télécharger Excel</Tooltip.Content>
                                                </Tooltip>
                                            ) : null}
                                            {!payment.receipt?.urls?.show && !payment.receipt?.urls?.pdf && !payment.receipt?.urls?.excel ? (
                                                <span className="text-[10px] text-[var(--text-muted)]">—</span>
                                            ) : null}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="p-6 text-center">
                                    <div className="flex flex-col items-center gap-1.5">
                                        <WalletCards size={24} className="text-[var(--text-muted)]" />
                                        <p className="text-xs font-semibold text-[var(--text)]">Aucun paiement trouvé</p>
                                        <p className="text-[11px] text-[var(--text-muted)]">Enregistrez un paiement depuis une facture.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile cards */}
            <div className="divide-y divide-[var(--border)] md:hidden">
                {pagedFiltered.length > 0 ? (
                    pagedFiltered.map((payment) => (
                        <div key={payment.id} className="space-y-2.5 p-3">
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                    <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] text-[var(--accent)]">
                                        <CircleDollarSign size={12} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="truncate text-xs font-semibold text-[var(--text)]">{payment.paymentNumber}</p>
                                        <p className="truncate text-[11px] text-[var(--text-muted)]">{payment.paidAt || '-'} / {payment.method || '-'}</p>
                                    </div>
                                </div>
                                <span className="shrink-0 text-xs font-semibold tabular-nums text-emerald-400">{formatCompactMoney(payment.amount, currency)}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-[11px]">
                                <span className="text-[var(--text-muted)]">Invoice <span className="font-semibold text-[var(--text)]">{payment.document?.number || '-'}</span></span>
                                <span className="text-[var(--text-muted)]">Client <span className="font-semibold text-[var(--text)]">{payment.client?.name || '-'}</span></span>
                            </div>
                            <div className="flex gap-1.5">
                                {payment.receipt ? (
                                    <>
                                        {payment.receipt.urls?.show ? (
                                            <AppButton variant="bordered" size="sm" className="flex-1 text-[11px]" onPress={() => onReceipt(payment.receipt?.urls?.show)}>View</AppButton>
                                        ) : null}
                                        {payment.receipt.urls?.pdf ? (
                                            <AppButton variant="bordered" size="sm" className="flex-1 text-[11px]" onPress={() => onReceipt(payment.receipt?.urls?.pdf)}>PDF</AppButton>
                                        ) : null}
                                        {payment.receipt.urls?.excel ? (
                                            <AppButton variant="bordered" size="sm" className="flex-1 text-[11px]" onPress={() => onReceipt(payment.receipt?.urls?.excel)}>Excel</AppButton>
                                        ) : null}
                                    </>
                                ) : (
                                    <span className="w-full py-1.5 text-center text-[11px] text-[var(--text-muted)]">No receipt</span>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center gap-1.5 px-4 py-12 text-center">
                        <WalletCards size={24} className="text-[var(--text-muted)]" />
                        <p className="text-xs font-semibold text-[var(--text)]">Aucun paiement trouvé</p>
                        <p className="text-[11px] text-[var(--text-muted)]">Enregistrez un paiement depuis une facture.</p>
                    </div>
                )}
            </div>

            <AppPagination page={tablePage} pageSize={TABLE_PAGE_SIZE} total={filtered.length} onChange={setTablePage} />
        </section>
    );
};

function sparklineFor(months: FinanceMonthSummary[], field: (m: FinanceMonthSummary) => number): number[] {
    return [...months]
        .sort((a, b) => {
            const ka = a.year * 12 + a.month;
            const kb = b.year * 12 + b.month;
            return ka - kb;
        })
        .slice(-6)
        .map(field);
}

function OverviewWorkspace({
    metrics,
    quotes,
    invoices,
    currency,
    monthlySummaries,
    allDocuments,
    onSelect,
}: {
    metrics: FinanceMetrics;
    quotes: FinanceDocument[];
    invoices: FinanceDocument[];
    currency: string;
    monthlySummaries: FinanceMonthSummary[];
    allDocuments: FinanceDocument[];
    onSelect: (document: FinanceDocument) => void;
}) {
    const agingBuckets = useMemo(() => calculateAgingBuckets(allDocuments), [allDocuments]);

    const sparklines = useMemo(() => ({
        quotes: sparklineFor(monthlySummaries, (m) => m.quotesTotalTtc),
        invoices: sparklineFor(monthlySummaries, (m) => m.invoicesTotalTtc),
        paid: sparklineFor(monthlySummaries, (m) => m.paidTotal),
        remaining: sparklineFor(monthlySummaries, (m) => m.remainingTotal),
        overdue: sparklineFor(monthlySummaries, (m) => m.overdueTotal),
        expenses: sparklineFor(monthlySummaries, (m) => m.expensesTotal),
    }), [monthlySummaries]);

    return (
        <section className="space-y-4">
            <section className="grid gap-4 grid-cols-2 md:grid-cols-3">
                <MetricSparklineCard
                    icon={<FileText size={16} className="text-sky-400" />}
                    label="Quotes"
                    value={formatCompactMoney(metrics.totalQuotes, currency)}
                    sparklineData={sparklines.quotes}
                    detail="Total devis TTC"
                    metricType="revenue"
                    fullValue={metrics.totalQuotes}
                    currency={currency}
                />
                <MetricSparklineCard
                    icon={<ReceiptText size={16} className="text-violet-400" />}
                    label="Invoices"
                    value={formatCompactMoney(metrics.totalInvoices, currency)}
                    sparklineData={sparklines.invoices}
                    detail="Total factures TTC"
                    metricType="revenue"
                    fullValue={metrics.totalInvoices}
                    currency={currency}
                />
                <MetricSparklineCard
                    icon={<CircleDollarSign size={16} className="text-amber-400" />}
                    label="Remaining"
                    value={formatCompactMoney(metrics.remainingTotal, currency)}
                    sparklineData={sparklines.remaining}
                    detail="Still to collect"
                    metricType="revenue"
                    fullValue={metrics.remainingTotal}
                    currency={currency}
                />
                <MetricSparklineCard
                    icon={<Timer size={16} className="text-rose-400" />}
                    label="Overdue"
                    value={formatCompactMoney(metrics.overdueTotal, currency)}
                    sparklineData={sparklines.overdue}
                    detail={`${metrics.draftCount} draft(s)`}
                    metricType="overdue"
                    fullValue={metrics.overdueTotal}
                    currency={currency}
                />
                <MetricSparklineCard
                    icon={<ArrowDownToLine size={16} className="text-emerald-400" />}
                    label="Encaisse"
                    value={formatCompactMoney(metrics.paidTotal, currency)}
                    sparklineData={sparklines.paid}
                    detail="Total encaissé"
                    metricType="revenue"
                    fullValue={metrics.paidTotal}
                    currency={currency}
                />
                <MetricSparklineCard
                    icon={<ShoppingCart size={16} className="text-orange-400" />}
                    label="Dépenses"
                    value={formatCompactMoney(metrics.totalExpenses ?? 0, currency)}
                    sparklineData={sparklines.expenses}
                    detail="Total dépenses"
                    metricType="expense"
                    fullValue={metrics.totalExpenses ?? 0}
                    currency={currency}
                />
            </section>

            <TreasuryDashboard months={monthlySummaries} currency={currency} />

            <div className="grid gap-4 xl:grid-cols-2">
                <RecentDocuments title="Derniers devis" documents={quotes.slice(0, 6)} onSelect={onSelect} />
                <RecentDocuments title="Dernieres factures" documents={invoices.slice(0, 6)} onSelect={onSelect} />
            </div>
        </section>
    );
}

function RecentDocuments({ title, documents, onSelect, agingBuckets, currency }: {
    title: string;
    documents: FinanceDocument[];
    onSelect: (document: FinanceDocument) => void;
    agingBuckets?: AgingBucket[];
    currency?: string;
}) {
    if (agingBuckets) {
        const total = agingBuckets.reduce((s, b) => s + b.total, 0);
        return (
            <AppCard className="overflow-hidden p-0">
                <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-2.5">
                    <h2 className="text-xs font-semibold text-[var(--text)]">{title}</h2>
                    <span className="text-[11px] text-[var(--text-muted)]">{formatCompactMoney(total, currency || 'MAD')}</span>
                </div>
                <div className="p-4">
                    {agingBuckets.some((b) => b.count > 0) ? (
                        <div className="space-y-3">
                            {agingBuckets.map((bucket) => {
                                const pct = total > 0 ? (bucket.total / total) * 100 : 0;
                                return (
                                    <div key={bucket.label}>
                                        <div className="mb-1 flex items-center justify-between text-xs">
                                            <span className="font-medium text-[var(--text)]">{bucket.label}</span>
                                            <span className="font-semibold text-[var(--text)]">{formatCompactMoney(bucket.total, currency || 'MAD')}</span>
                                        </div>
                                        <div className="h-1.5 overflow-hidden rounded-full bg-[var(--surface-2)]">
                                            <div
                                                className="h-full rounded-full bg-rose-400 transition-all"
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                        <span className="mt-0.5 block text-[11px] text-[var(--text-muted)]">{bucket.count} document{bucket.count > 1 ? 's' : ''}</span>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="py-6 text-center text-xs text-[var(--text-muted)]">Aucun impayé.</p>
                    )}
                </div>
            </AppCard>
        );
    }

    const statusBarColor: Record<string, string> = {
        draft: '#a8a29e', sent: '#60a5fa', accepted: '#34d399', rejected: '#f87171',
        converted: '#a78bfa', issued: '#60a5fa', partially_paid: '#fbbf24',
        paid: '#34d399', overdue: '#f87171', cancelled: '#a8a29e',
    };

    return (
        <AppCard className="overflow-hidden p-0">
            <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-2.5">
                <h2 className="text-xs font-semibold text-[var(--text)]">{title}</h2>
                <span className="rounded-full bg-[var(--surface-2)] px-2 py-0.5 text-[11px] font-medium text-[var(--text-muted)]">
                    {documents.length}
                </span>
            </div>
            <div className="divide-y divide-[var(--border)]">
                {documents.length > 0 ? documents.map((document) => {
                    const paidPct = document.totalTtc > 0 ? (document.paidTotal / document.totalTtc) * 100 : 0;
                    const barColor = statusBarColor[document.status] || '#a8a29e';
                    return (
                        <button
                            key={document.id}
                            type="button"
                            onClick={(e) => { e.stopPropagation(); router.visit(docShowUrl(document.id)); }}
                            className="group relative flex w-full items-stretch text-left transition hover:bg-[var(--surface-2)]"
                        >
                            <div
                                className="w-0.5 shrink-0 transition-colors group-hover:opacity-80"
                                style={{ backgroundColor: barColor }}
                            />
                            <div className="min-w-0 flex-1 px-3 py-2">
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-1.5 min-w-0">
                                        <span
                                            className="inline-block size-1.5 shrink-0 rounded-full"
                                            style={{ backgroundColor: barColor }}
                                        />
                                        <span className="truncate text-[11px] font-semibold text-[var(--text)]">{document.number}</span>
                                        <FinanceDocumentLockBadge document={document} />
                                    </div>
                                    <span className="shrink-0 text-[11px] font-semibold tabular-nums text-[var(--accent)]">{formatCompactMoney(document.totalTtc, document.currency)}</span>
                                </div>
                                <div className="mt-0.5 flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-muted)] min-w-0">
                                        <span className="truncate">{document.client?.name || '-'}</span>
                                        {document.dossier && (
                                            <>
                                                <span className="shrink-0">·</span>
                                                <span className="truncate">{document.dossier.number}</span>
                                            </>
                                        )}
                                        {document.issueDate && (
                                            <>
                                                <span className="shrink-0">·</span>
                                                <span className="shrink-0">{document.issueDate}</span>
                                            </>
                                        )}
                                    </div>
                                    {document.remainingTotal > 0 && (
                                        <div className="flex items-center gap-1.5 shrink-0">
                                            <div className="h-1 w-12 overflow-hidden rounded-full bg-[var(--surface-2)]">
                                                <div
                                                    className="h-full rounded-full transition-all"
                                                    style={{ width: `${Math.min(paidPct, 100)}%`, backgroundColor: barColor }}
                                                />
                                            </div>
                                            <span className="text-[10px] text-[var(--text-muted)]">{Math.round(paidPct)}%</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </button>
                    );
                }) : (
                    <p className="p-4 text-xs text-[var(--text-muted)]">Aucun document recent.</p>
                )}
            </div>
        </AppCard>
    );
}

export default function FinanceDocumentsIndex({
    documents: rawDocuments,
    payments: rawPayments,
    expenses: rawExpenses,
    monthlySummaries = [],
    metrics: rawMetrics,
    clients = [],
    dossiers = [],
    templates = [],
    defaultTemplates = [],
    templateEditorUrl = '/finance/templates',
    settings: rawSettings,
    filters,
}: PageProps) {
    const documents = unwrap(rawDocuments);
    const payments = unwrap(rawPayments);
    const expenses = unwrap(rawExpenses) as Expense[];
    const settings = { ...defaultSettings, ...rawSettings };
    const [activeTab, setActiveTab] = useState(filters?.tab || new URLSearchParams(window.location.search).get('tab') || 'overview');
    const [builderOpen, setBuilderOpen] = useState(false);
    const [builderMode, setBuilderMode] = useState<'create' | 'edit'>('create');
    const [builderType, setBuilderType] = useState<FinanceDocumentType>('quote');
    const [selectedDocument, setSelectedDocument] = useState<FinanceDocument | null>(documents[0] ?? null);
    const [paymentOpen, setPaymentOpen] = useState(false);
    const [paymentInvoice, setPaymentInvoice] = useState<FinanceDocument | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<FinanceDocument | null>(null);
    const [expenseDrawerOpen, setExpenseDrawerOpen] = useState(false);
    const [expenseDrawerMode, setExpenseDrawerMode] = useState<ExpenseViewMode>('create');
    const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

    const quotes = useMemo(() => documents.filter((doc) => doc.type === 'quote'), [documents]);
    const invoices = useMemo(() => documents.filter((doc) => doc.type === 'invoice'), [documents]);

    const totalExpenses = useMemo(() =>
        expenses.reduce((sum, e) => sum + e.amount, 0),
    [expenses]);

    const metrics: FinanceMetrics = {
        totalQuotes: rawMetrics?.totalQuotes ?? quotes.reduce((sum, doc) => sum + doc.totalTtc, 0),
        totalInvoices: rawMetrics?.totalInvoices ?? invoices.reduce((sum, doc) => sum + doc.totalTtc, 0),
        paidTotal: rawMetrics?.paidTotal ?? invoices.reduce((sum, doc) => sum + doc.paidTotal, 0),
        remainingTotal: rawMetrics?.remainingTotal ?? invoices.reduce((sum, doc) => sum + doc.remainingTotal, 0),
        overdueTotal: rawMetrics?.overdueTotal ?? invoices.filter((doc) => doc.status === 'overdue').reduce((sum, doc) => sum + doc.remainingTotal, 0),
        totalExpenses: rawMetrics?.totalExpenses ?? totalExpenses,
        draftCount: rawMetrics?.draftCount ?? documents.filter((doc) => doc.status === 'draft').length,
        currency: rawMetrics?.currency ?? settings.defaultCurrency,
    };

    function openCreate(type: FinanceDocumentType) {
        setSelectedDocument(null);
        setBuilderMode('create');
        setBuilderType(type);
        setBuilderOpen(true);
    }

    function openEdit(document: FinanceDocument) {
        setSelectedDocument(document);
        setBuilderMode('edit');
        setBuilderType(document.type);
        setBuilderOpen(true);
    }

    function openPayment(document?: FinanceDocument | null) {
        setPaymentInvoice(document || null);
        setPaymentOpen(true);
    }

    function openPaymentReceiptUrl(url: string | null | undefined) {
        if (!url) {
            toast.error('Recu indisponible.');
            return;
        }

        window.open(url, '_blank');
    }

    function putAction(url: string | null | undefined, success: string, error: string) {
        if (!url) {
            toast.error('Action non disponible.');
            return;
        }

        router.put(url, {}, {
            preserveScroll: true,
            onSuccess: () => toast.success(success),
            onError: () => toast.error(error),
        });
    }

    function postAction(url: string | null | undefined, success: string, error: string) {
        if (!url) {
            toast.error('Action non disponible.');
            return;
        }

        router.post(url, {}, {
            preserveScroll: true,
            onSuccess: () => toast.success(success),
            onError: () => toast.error(error),
        });
    }

    function handleDelete() {
        if (!deleteTarget) return;

        router.delete(deleteTarget.deleteUrl || `/finance/documents/${deleteTarget.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Document supprime.');
                setDeleteTarget(null);
            },
            onError: () => toast.error('Impossible supprimer le document.'),
        });
    }

    const commonActions: DocumentActionHandlers = {
        onEdit: openEdit,
        onAccept: (document) => putAction(document.acceptUrl || `/finance/documents/${document.id}/accept`, 'Devis accepte.', 'Impossible accepter le devis.'),
        onReject: (document) => putAction(document.rejectUrl || `/finance/documents/${document.id}/reject`, 'Devis refuse.', 'Impossible refuser le devis.'),
        onConvert: (document) => postAction(document.convertToInvoiceUrl || `/finance/documents/${document.id}/convert-to-invoice`, 'Facture creee depuis le devis.', 'Impossible convertir le devis.'),
        onPayment: openPayment,
        onCancel: (document) => putAction(document.cancelUrl || `/finance/documents/${document.id}/cancel`, 'Document annule.', 'Annulation impossible.'),
        onDelete: setDeleteTarget,
        onSelect: setSelectedDocument,
        onGeneratePdf: (document) => putAction(document.generatePdfUrl || `/finance/documents/${document.id}/generate-pdf`, 'PDF genere.', 'Generation PDF impossible.'),
        onGenerateExcel: (document) => putAction(document.generateExcelUrl || `/finance/documents/${document.id}/generate-excel`, 'Excel genere.', 'Generation Excel impossible.'),
    };

    return (
        <>
            <Head title="Finance" />

            <AppShell
                eyebrowKey="financeWorkspace.eyebrow"
                titleKey="financeWorkspace.title"
                subtitleKey="financeWorkspace.subtitle"
                action={
                    <div className="flex flex-wrap gap-2">
                        <AppButton variant="secondary" onPress={() => openPayment()}>
                            <WalletCards size={16} />
                            Paiement
                        </AppButton>
                        <AppButton variant="secondary" onPress={() => { setSelectedExpense(null); setExpenseDrawerMode('create'); setExpenseDrawerOpen(true); }}>
                            <Plus size={16} />
                            Depense
                        </AppButton>
                        <AppButton variant="secondary" onPress={() => openCreate('invoice')}>
                            <ReceiptText size={16} />
                            Nouvelle facture
                        </AppButton>
                        <AppButton variant="primary" onPress={() => openCreate('quote')}>
                            <Plus size={16} />
                            Nouveau devis
                        </AppButton>
                    </div>
                }
            >
                <FinanceTabs selectedKey={activeTab} onSelectionChange={setActiveTab}>
                    <TabPanel id="overview" className="space-y-5 outline-none">
                        <OverviewWorkspace
                            metrics={metrics}
                            quotes={quotes}
                            invoices={invoices}
                            currency={settings.defaultCurrency}
                            monthlySummaries={monthlySummaries}
                            allDocuments={documents}
                            onSelect={(document) => {
                                setSelectedDocument(document);
                                setActiveTab(document.type === 'invoice' ? 'invoices' : 'quotes');
                            }}
                        />
                    </TabPanel>

                    <TabPanel id="quotes" className="outline-none">
                        <FinanceDocumentWorkspace
                            documents={quotes}
                            currency={settings.defaultCurrency}
                            selected={selectedDocument}
                            onSelect={setSelectedDocument}
                            actions={commonActions}
                            searchPlaceholder="Search quotes, clients, dossiers..."
                        />
                    </TabPanel>

                    <TabPanel id="invoices" className="outline-none">
                        <FinanceDocumentWorkspace
                            documents={invoices}
                            currency={settings.defaultCurrency}
                            selected={selectedDocument}
                            onSelect={setSelectedDocument}
                            actions={commonActions}
                            searchPlaceholder="Search invoices, clients, dossiers..."
                        />
                    </TabPanel>

                    <TabPanel id="monthly" className="outline-none">
                        <FinanceMonthlySummary months={monthlySummaries} currency={settings.defaultCurrency} />
                    </TabPanel>

                    <TabPanel id="payments" className="outline-none">
                        <PaymentWorkspace
                            payments={payments}
                            currency={settings.defaultCurrency}
                            onReceipt={openPaymentReceiptUrl}
                        />
                    </TabPanel>

                    <TabPanel id="expenses" className="outline-none">
                        <ExpensesWorkspace
                            expenses={expenses}
                            currency={settings.defaultCurrency}
                            onEdit={(expense) => { setSelectedExpense(expense); setExpenseDrawerMode('edit'); setExpenseDrawerOpen(true); }}
                            onView={(expense) => { setSelectedExpense(expense); setExpenseDrawerMode('view'); setExpenseDrawerOpen(true); }}
                        />
                    </TabPanel>

                    <TabPanel id="templates" className="outline-none">
                        <AppCard className="p-6">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                <div>
                                    <h2 className="text-base font-semibold">Templates finance</h2>
                                    <p className="mt-1 text-sm text-[var(--text-muted)]">Modifiez les modeles PDF des devis, factures et recus.</p>
                                </div>
                                <AppButton variant="primary" onPress={() => router.visit(templateEditorUrl)}>
                                    <Settings2 size={16} />
                                    Ouvrir l editeur
                                </AppButton>
                            </div>
                            <div className="mt-5 grid gap-3 md:grid-cols-3">
                                {defaultTemplates.length ? defaultTemplates.map((template) => (
                                    <div key={template.id} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
                                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">{template.type}</p>
                                        <p className="mt-2 font-semibold">{template.label}</p>
                                        <p className="mt-1 text-xs text-[var(--text-muted)]">{template.slug || '-'}</p>
                                    </div>
                                )) : <AppEmptyState title="Aucun template defaut" description="Ouvrez l editeur pour recreer les templates par defaut." />}
                            </div>
                        </AppCard>
                    </TabPanel>

                    <TabPanel id="settings" className="outline-none">
                        <AppCard className="p-6">
                            <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                                <p>Devise: <strong>{settings.defaultCurrency}</strong></p>
                                <p>TVA: <strong>{settings.defaultTvaRate}%</strong></p>
                                <p>Delai paiement: <strong>{settings.defaultPaymentTermsDays} jours</strong></p>
                                <p>Validite devis: <strong>{settings.defaultQuoteValidityDays} jours</strong></p>
                            </div>
                        </AppCard>
                    </TabPanel>
                </FinanceTabs>
            </AppShell>

            <FinanceDocumentBuilderDrawer
                isOpen={builderOpen}
                onOpenChange={setBuilderOpen}
                mode={builderMode}
                type={builderType}
                document={selectedDocument}
                clients={clients}
                dossiers={dossiers}
                templates={templates}
                settings={settings}
                onSaved={(savedType) => setActiveTab(savedType === 'quote' ? 'quotes' : savedType === 'invoice' ? 'invoices' : 'overview')}
            />

            <PaymentDrawer
                isOpen={paymentOpen}
                onOpenChange={setPaymentOpen}
                invoices={invoices}
                invoice={paymentInvoice}
            />

            <ExpenseDrawer
                isOpen={expenseDrawerOpen}
                onOpenChange={setExpenseDrawerOpen}
                expense={selectedExpense}
                mode={expenseDrawerMode}
            />

            <AppConfirmDialog
                isOpen={Boolean(deleteTarget)}
                title="Supprimer le document ?"
                description={`Confirmer la suppression de ${deleteTarget?.number || 'ce document'}.`}
                confirmLabel="Supprimer"
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
                variant="danger"
            />
        </>
    );
}
