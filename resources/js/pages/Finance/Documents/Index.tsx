import { Head, router } from '@inertiajs/react';
import {
    ArrowDownToLine,
    ArrowUpDown,
    Check,
    CheckCircle2,
    CircleDollarSign,
    Download,
    Eye,
    FileSpreadsheet,
    FileText,
    Pencil,
    Printer,
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
import { AppCard } from '@/components/ui/AppCard';
import { AppConfirmDialog } from '@/components/ui/AppConfirmDialog';
import { AppFilterTabs } from '@/components/ui/AppFilterTabs';
import { AppInput } from '@/components/ui/AppInput';
import { AppModal } from '@/components/ui/AppModal';
import { AppPagination } from '@/components/ui/AppPagination';
import { type FinanceMetrics } from '@/features/finance/components/FinanceMetricCards';
import { calculateAgingBuckets, type AgingBucket } from '@/features/finance/utils/calculations';
import { formatCompactMoney } from '@/lib/currency';
import { TreasuryDashboard } from '@/features/finance/components/TreasuryDashboard';
import { FinanceMonthlySummary } from '@/features/finance/components/FinanceMonthlySummary';
import { FinanceDocumentLockBadge, getFinanceDocumentLockedAt } from '@/features/finance/components/FinanceDocumentLockNotice';
import { FinanceTabs } from '@/features/finance/components/FinanceTabs';
import { FinanceTemplateManager } from '@/features/finance/components/FinanceTemplateManager';
import { FinanceSettingsSummary } from '@/features/finance/components/FinanceSettingsSummary';
import { FinanceWorkspaceHeader } from '@/features/finance/components/FinanceWorkspaceHeader';
import { FinanceDocumentBuilderDrawer, PaymentDrawer, ExpenseDrawer } from '@/components/drawers';
import type { ExpenseViewMode } from '@/components/drawers/entities/ExpenseDrawer';
import { AppKpiCard } from '@/components/ui/AppKpiCard';
import { ExpensesWorkspace } from '@/features/finance/components/ExpensesWorkspace';
import { FinanceSortableHeader, nextFinanceSortDirection, type FinanceSortDirection } from '@/features/finance/components/FinanceSortableHeader';
import { FinanceRowActions, type FinanceRowAction } from '@/features/finance/components/FinanceRowActions';
import { createFinanceDocumentActions, type FinanceDocumentActionHandlers } from '@/features/finance/components/FinanceDocumentActions';
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
    meta?: { current_page: number; per_page: number; total: number; last_page: number };
    current_page?: number;
    per_page?: number;
    total?: number;
    last_page?: number;
};

type PageProps = {
    documents?: Paginated<FinanceDocument> | FinanceDocument[];
    payments?: Paginated<Payment> | Payment[];
    expenses?: Paginated<Expense> | Expense[];
    monthlySummaries?: FinanceMonthSummary[];
    metrics?: Partial<FinanceMetrics>;
    clients?: ClientOption[];
    dossiers?: DossierOption[];
    templates?: TemplateOption[];
    templateEditorUrl: string;
    settingsEditorUrl: string;
    settings?: Partial<FinanceSettings>;
    filters?: {
        tab?: string; search?: string; status?: string; type?: string; page?: number; per_page?: number;
        sort?: string; direction?: FinanceSortDirection;
        payment_search?: string; payment_sort?: string; payment_direction?: FinanceSortDirection;
        payments_page?: number; payments_per_page?: number;
        expense_search?: string; expense_category?: string; expense_sort?: string;
        expense_direction?: FinanceSortDirection; expenses_page?: number; expenses_per_page?: number;
    };
};

function paginationOf<T>(value?: Paginated<T> | T[]) {
    if (!value || Array.isArray(value)) return { page: 1, pageSize: 15, total: Array.isArray(value) ? value.length : 0 };
    const meta = value.meta;
    return {
        page: meta?.current_page ?? value.current_page ?? 1,
        pageSize: meta?.per_page ?? value.per_page ?? 15,
        total: meta?.total ?? value.total ?? unwrap(value).length,
    };
}

type DocumentActionHandlers = FinanceDocumentActionHandlers & {
    onSelect: (document: FinanceDocument) => void;
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
    { id: 'all', label: 'Tous' },
    { id: 'draft', label: 'Brouillon' },
    { id: 'issued', label: 'Emis' },
    { id: 'sent', label: 'Envoye' },
    { id: 'accepted', label: 'Accepte' },
    { id: 'partially_paid', label: 'Partiel' },
    { id: 'paid', label: 'Paye' },
    { id: 'overdue', label: 'En retard' },
    { id: 'rejected', label: 'Refuse' },
    { id: 'cancelled', label: 'Annule' },
];

const typeFilterOptions = [
    { id: 'all', label: 'All types' },
    { id: 'quote', label: 'Devis' },
    { id: 'invoice', label: 'Facture' },
    { id: 'receipt', label: 'Recu' },
];

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
                    <div className="grid grid-cols-2 gap-1.5">
                        <AppButton variant="flat" size="sm" onPress={() => actions.onView(document)}>
                            <Eye size={13} /> View
                        </AppButton>
                        <AppButton variant="flat" size="sm" onPress={() => actions.onPrint(document)}>
                            <Printer size={13} /> Print
                        </AppButton>
                    </div>
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
    pagination,
    filters,
    activeTab,
}: {
    documents: FinanceDocument[];
    currency: string;
    selected: FinanceDocument | null;
    onSelect: (document: FinanceDocument) => void;
    actions: DocumentActionHandlers;
    searchPlaceholder: string;
    pagination: { page: number; pageSize: number; total: number };
    filters?: PageProps['filters'];
    activeTab: string;
}) {
    const [query, setQuery] = useState(filters?.search || '');
    const [showFilters, setShowFilters] = useState(false);
    const [statusFilter, setStatusFilter] = useState(filters?.status || 'all');
    const [typeFilter, setTypeFilter] = useState(filters?.type || 'all');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const filtered = documents;
    const [selectedRows, setSelectedRows] = useState<number[]>([]);
    const pagedFiltered = filtered;
    const selectedVisible = selected && filtered.some((document) => document.id === selected.id) ? selected : filtered[0] ?? null;
    const allPageRowsSelected = pagedFiltered.length > 0 && pagedFiltered.every((document) => selectedRows.includes(document.id));
    const sort = filters?.sort || 'created_at';
    const direction = filters?.direction || 'desc';

    function applyServerFilters(overrides: Record<string, string | number | undefined> = {}) {
        router.get('/finance/documents', {
            tab: activeTab,
            search: query || undefined,
            status: statusFilter === 'all' ? undefined : statusFilter,
            type: typeFilter === 'all' ? undefined : typeFilter,
            per_page: pagination.pageSize,
            sort,
            direction,
            ...overrides,
        }, { preserveState: true, preserveScroll: true, replace: true });
    }

    function changeSort(column: string) {
        applyServerFilters({
            sort: column,
            direction: nextFinanceSortDirection(sort, direction, column),
            page: 1,
        });
    }

    function rowActionsFor(document: FinanceDocument): FinanceRowAction[] {
        return createFinanceDocumentActions(document, {
            ...actions,
            onOpen: () => router.visit(docShowUrl(document.id)),
            onPreview: actions.onView,
        });
    }

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
        <section className="min-w-0 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)]">
            {/* Toolbar */}
            <div className="flex flex-col gap-2 px-3 py-2.5 sm:flex-row sm:items-center">
                <div className="flex min-w-0 items-center gap-1.5">
                    <div className="relative min-w-0 flex-1 sm:w-[260px] sm:flex-none">
                        <Search size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                        <input
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            onKeyDown={(event) => { if (event.key === 'Enter') applyServerFilters({ search: query || undefined, page: 1 }); }}
                            placeholder={searchPlaceholder}
                            className="h-7 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] pl-7 pr-6 text-xs text-[var(--text)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--accent)_18%,transparent)]"
                        />
                        {query ? (
                            <button
                                type="button"
                                onClick={() => {
                                    setQuery('');
                                    applyServerFilters({ search: undefined, page: 1 });
                                }}
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
                <div className="border-t border-[var(--border)] bg-[color-mix(in_srgb,var(--surface-2)_35%,transparent)] px-3 py-3">
                    <div className="grid min-w-0 gap-3 lg:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)]">
                        <AppFilterTabs
                            label="Statut"
                            value={statusFilter}
                            options={statusFilterOptions}
                            onChange={(value) => {
                                setStatusFilter(value);
                                applyServerFilters({ status: value === 'all' ? undefined : value, page: 1 });
                            }}
                        />
                        <AppFilterTabs
                            label="Type de document"
                            value={typeFilter}
                            options={typeFilterOptions}
                            onChange={(value) => {
                                setTypeFilter(value);
                                applyServerFilters({ type: value === 'all' ? undefined : value, page: 1 });
                            }}
                        />
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
            <div className="finance-table-shell hidden md:block">
                <table className="finance-table min-w-[980px] text-sm">
                    <thead>
                        <tr className="border-b border-[var(--border)] text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                            <th className="w-10 px-3 py-2">
                                <Checkbox checked={allPageRowsSelected} onChange={togglePageRows} label="Select all visible" />
                            </th>
                            <FinanceSortableHeader column="number" label={<><ReceiptText size={11} /> Document</>} sort={sort} direction={direction} onSort={changeSort} />
                            <FinanceSortableHeader column="type" label="Type" sort={sort} direction={direction} onSort={changeSort} />
                            <th className="px-3 py-2">
                                <span className="inline-flex items-center gap-1.5">
                                    <FileText size={11} />
                                    Client / Dossier
                                </span>
                            </th>
                            <FinanceSortableHeader column="status" label="Status" sort={sort} direction={direction} onSort={changeSort} />
                            <FinanceSortableHeader column="total_ttc" label="Total" sort={sort} direction={direction} onSort={changeSort} align="right" />
                            <FinanceSortableHeader column="paid_total" label="Paid" sort={sort} direction={direction} onSort={changeSort} align="right" />
                            <FinanceSortableHeader column="remaining_total" label="Remaining" sort={sort} direction={direction} onSort={changeSort} align="right" />
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
                                            <FinanceRowActions actions={rowActionsFor(document)} />
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
                        <FinanceRowActions actions={rowActionsFor(document)} visibleCount={1} className="justify-end" />
                    </div>
                ))}
            </div>

            <AppPagination page={pagination.page} pageSize={pagination.pageSize} total={pagination.total} onChange={(page) => applyServerFilters({ page })} variant="reference" />
        </section>
    );
}

function PaymentWorkspace({
    payments,
    currency,
    onReceipt,
    pagination,
    filters,
}: {
    payments: Payment[];
    currency: string;
    onReceipt: (url: string | null | undefined) => void;
    pagination: { page: number; pageSize: number; total: number };
    filters?: PageProps['filters'];
}) {
    const [query, setQuery] = useState(filters?.payment_search || '');
    const pagedFiltered = payments;
    const sort = filters?.payment_sort || 'paid_at';
    const direction = filters?.payment_direction || 'desc';

    const totalAmount = useMemo(() => payments.reduce((sum, payment) => sum + payment.amount, 0), [payments]);

    function applyPaymentFilters(overrides: Record<string, string | number | undefined> = {}) {
        router.get('/finance/documents', {
            ...Object.fromEntries(new URLSearchParams(window.location.search)),
            tab: 'payments',
            payment_search: query || undefined,
            payment_sort: sort,
            payment_direction: direction,
            payments_per_page: pagination.pageSize,
            ...overrides,
        }, { preserveState: true, preserveScroll: true, replace: true });
    }

    function changeSort(column: string) {
        applyPaymentFilters({
            payment_sort: column,
            payment_direction: nextFinanceSortDirection(sort, direction, column),
            payments_page: 1,
        });
    }

    function paymentActionsFor(payment: Payment): FinanceRowAction[] {
        return [
            payment.receipt?.urls?.show && { id: 'view-receipt', label: 'Voir le recu', icon: <Eye size={13} />, onPress: () => onReceipt(payment.receipt?.urls?.show) },
            payment.receipt?.urls?.pdf && { id: 'download-pdf', label: 'Telecharger PDF', icon: <FileText size={13} />, onPress: () => onReceipt(payment.receipt?.urls?.pdf), tone: 'accent' },
            payment.receipt?.urls?.excel && { id: 'download-excel', label: 'Telecharger Excel', icon: <FileSpreadsheet size={13} />, onPress: () => onReceipt(payment.receipt?.urls?.excel), tone: 'accent' },
        ].filter((action): action is FinanceRowAction => Boolean(action));
    }

    return (
        <section className="min-w-0 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)]">
            {/* Toolbar */}
            <div className="flex flex-col gap-2 px-3 py-2.5 sm:flex-row sm:items-center">
                <div className="flex min-w-0 items-center gap-1.5">
                    <div className="relative min-w-0 flex-1 sm:w-[280px] sm:flex-none">
                        <Search size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                        <input
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            onKeyDown={(event) => { if (event.key === 'Enter') applyPaymentFilters({ payment_search: query || undefined, payments_page: 1 }); }}
                            placeholder="Rechercher paiements, factures, clients..."
                            className="h-7 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] pl-7 pr-6 text-xs text-[var(--text)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--accent)_18%,transparent)]"
                        />
                        {query && (
                            <button
                                type="button"
                                onClick={() => {
                                    setQuery('');
                                    applyPaymentFilters({ payment_search: undefined, payments_page: 1 });
                                }}
                                className="absolute right-0.5 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center rounded text-[var(--text-muted)] hover:bg-[var(--surface-2)]"
                            >
                                <X size={11} />
                            </button>
                        )}
                    </div>
                </div>

                <div className="ml-auto hidden text-[11px] font-medium text-[var(--text-muted)] md:block">
                    {pagination.total} paiement{pagination.total !== 1 ? 's' : ''} / page {formatCompactMoney(totalAmount, currency)}
                </div>
            </div>

            {/* Desktop table */}
            <div className="finance-table-shell hidden md:block">
                <table className="finance-table min-w-[720px] text-sm">
                    <thead>
                        <tr className="border-b border-[var(--border)] text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                            <FinanceSortableHeader column="payment_number" label={<><CircleDollarSign size={11} /> Paiement</>} sort={sort} direction={direction} onSort={changeSort} />
                            <th className="px-3 py-2">
                                <span className="inline-flex items-center gap-1.5">
                                    <ReceiptText size={11} />
                                    Facture / Client
                                </span>
                            </th>
                            <FinanceSortableHeader column="amount" label="Montant" sort={sort} direction={direction} onSort={changeSort} align="right" />
                            <th className="px-3 py-2">Recu</th>
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
                                        <FinanceRowActions actions={paymentActionsFor(payment)} visibleCount={1} />
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
                            <FinanceRowActions actions={paymentActionsFor(payment)} visibleCount={1} className="justify-end" />
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

            <AppPagination page={pagination.page} pageSize={pagination.pageSize} total={pagination.total} onChange={(page) => applyPaymentFilters({ payments_page: page })} />
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
            <section className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
                <AppKpiCard
                    icon={<FileText size={16} className="text-sky-400" />}
                    label="Quotes"
                    value={formatCompactMoney(metrics.totalQuotes, currency)}
                    sparklineData={sparklines.quotes}
                    detail="Total devis TTC"
                    metricType="revenue"
                    fullValue={metrics.totalQuotes}
                    currency={currency}
                />
                <AppKpiCard
                    icon={<ReceiptText size={16} className="text-violet-400" />}
                    label="Invoices"
                    value={formatCompactMoney(metrics.totalInvoices, currency)}
                    sparklineData={sparklines.invoices}
                    detail="Total factures TTC"
                    metricType="revenue"
                    fullValue={metrics.totalInvoices}
                    currency={currency}
                />
                <AppKpiCard
                    icon={<CircleDollarSign size={16} className="text-amber-400" />}
                    label="Remaining"
                    value={formatCompactMoney(metrics.remainingTotal, currency)}
                    sparklineData={sparklines.remaining}
                    detail="Still to collect"
                    metricType="revenue"
                    fullValue={metrics.remainingTotal}
                    currency={currency}
                />
                <AppKpiCard
                    icon={<Timer size={16} className="text-rose-400" />}
                    label="Overdue"
                    value={formatCompactMoney(metrics.overdueTotal, currency)}
                    sparklineData={sparklines.overdue}
                    detail={`${metrics.draftCount} draft(s)`}
                    metricType="overdue"
                    fullValue={metrics.overdueTotal}
                    currency={currency}
                />
                <AppKpiCard
                    icon={<ArrowDownToLine size={16} className="text-emerald-400" />}
                    label="Encaisse"
                    value={formatCompactMoney(metrics.paidTotal, currency)}
                    sparklineData={sparklines.paid}
                    detail="Total encaissé"
                    metricType="revenue"
                    fullValue={metrics.paidTotal}
                    currency={currency}
                />
                <AppKpiCard
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
    templateEditorUrl,
    settingsEditorUrl,
    settings: rawSettings,
    filters,
}: PageProps) {
    const documents = unwrap(rawDocuments);
    const documentPagination = paginationOf(rawDocuments);
    const payments = unwrap(rawPayments);
    const paymentPagination = paginationOf(rawPayments);
    const expenses = unwrap(rawExpenses) as Expense[];
    const expensePagination = paginationOf(rawExpenses);

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
    const [renameTemplate, setRenameTemplate] = useState<TemplateOption | null>(null);
    const [renameTemplateName, setRenameTemplateName] = useState('');
    const [renameTemplateError, setRenameTemplateError] = useState<string>();

    function changeTab(tab: string) {
        setActiveTab(tab);
        router.get('/finance/documents', { tab }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            only: ['documents', 'payments', 'expenses', 'filters'],
        });
    }

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

    useEffect(() => {
        if (new URLSearchParams(window.location.search).get('command') !== 'create-invoice') return;
        setActiveTab('invoices');
        openCreate('invoice');
        window.history.replaceState({}, '', `${window.location.pathname}?tab=invoices`);
    }, []);

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

    function openTemplateRename(template: TemplateOption) {
        setRenameTemplate(template);
        setRenameTemplateName(template.label);
        setRenameTemplateError(undefined);
    }

    function submitTemplateRename() {
        if (!renameTemplate?.renameUrl) return;
        const name = renameTemplateName.trim();
        if (!name) {
            setRenameTemplateError('Le nom du template est obligatoire.');
            return;
        }

        router.patch(renameTemplate.renameUrl, { name }, {
            preserveScroll: true,
            only: ['templates'],
            onSuccess: () => {
                toast.success('Template renomme.');
                setRenameTemplate(null);
            },
            onError: (errors) => setRenameTemplateError(String(errors.name || 'Impossible de renommer le template.')),
        });
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
        onOpen: (document) => router.visit(docShowUrl(document.id)),
        onView: (document) => window.open(document.viewUrl || document.showUrl || docShowUrl(document.id), '_blank', 'noopener,noreferrer'),
        onPreview: (document) => window.open(document.viewUrl || document.showUrl || docShowUrl(document.id), '_blank', 'noopener,noreferrer'),
        onPrint: (document) => window.open(document.printUrl || document.viewUrl || docShowUrl(document.id), '_blank', 'noopener,noreferrer'),
        onDownloadPdf: (document) => document.pdfDownloadUrl && window.open(document.pdfDownloadUrl, '_blank', 'noopener,noreferrer'),
        onDownloadExcel: (document) => document.excelDownloadUrl && window.open(document.excelDownloadUrl, '_blank', 'noopener,noreferrer'),
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

            <AppShell>
                <FinanceWorkspaceHeader
                    metrics={metrics}
                    currency={settings.defaultCurrency}
                    documentsCount={documentPagination.total}
                    onCreatePayment={() => openPayment()}
                    onCreateExpense={() => { setSelectedExpense(null); setExpenseDrawerMode('create'); setExpenseDrawerOpen(true); }}
                    onCreateInvoice={() => openCreate('invoice')}
                    onCreateQuote={() => openCreate('quote')}
                />

                <FinanceTabs
                    selectedKey={activeTab}
                    onSelectionChange={changeTab}
                    counts={{
                        quotes: quotes.length,
                        invoices: invoices.length,
                        payments: paymentPagination.total,
                        expenses: expensePagination.total,
                        monthly: monthlySummaries.length,
                        templates: templates.length,
                    }}
                >
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
                            pagination={documentPagination}
                            filters={filters}
                            activeTab={activeTab}
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
                            pagination={documentPagination}
                            filters={filters}
                            activeTab={activeTab}
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
                            pagination={paymentPagination}
                            filters={filters}
                        />
                    </TabPanel>

                    <TabPanel id="expenses" className="outline-none">
                        <ExpensesWorkspace
                            expenses={expenses}
                            currency={settings.defaultCurrency}
                            pagination={expensePagination}
                            filters={filters}
                            onEdit={(expense) => { setSelectedExpense(expense); setExpenseDrawerMode('edit'); setExpenseDrawerOpen(true); }}
                            onView={(expense) => { setSelectedExpense(expense); setExpenseDrawerMode('view'); setExpenseDrawerOpen(true); }}
                        />
                    </TabPanel>

                    <TabPanel id="templates" className="outline-none">
                        <FinanceTemplateManager
                            templates={templates}
                            editorUrl={templateEditorUrl}
                            onOpenEditor={(url) => router.visit(url)}
                            onRename={openTemplateRename}
                        />
                    </TabPanel>

                    <TabPanel id="settings" className="outline-none">
                        <FinanceSettingsSummary
                            settings={settings}
                            settingsUrl={settingsEditorUrl}
                            onOpen={(url) => router.visit(url)}
                        />
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
                clients={clients}
            />

            <ExpenseDrawer
                isOpen={expenseDrawerOpen}
                onOpenChange={setExpenseDrawerOpen}
                expense={selectedExpense}
                mode={expenseDrawerMode}
            />

            <AppModal
                isOpen={!!renameTemplate}
                onOpenChange={(open) => { if (!open) setRenameTemplate(null); }}
                title="Renommer le template"
                size="sm"
            >
                <form onSubmit={(event) => { event.preventDefault(); submitTemplateRename(); }}>
                    <AppInput
                        label="Nom"
                        value={renameTemplateName}
                        onChange={(value) => {
                            setRenameTemplateName(value);
                            setRenameTemplateError(undefined);
                        }}
                        error={renameTemplateError}
                        autoFocus
                    />
                    <div className="mt-5 flex justify-end gap-2">
                        <AppButton variant="secondary" onPress={() => setRenameTemplate(null)}>Annuler</AppButton>
                        <AppButton type="submit" isDisabled={!renameTemplateName.trim()}>Renommer</AppButton>
                    </div>
                </form>
            </AppModal>

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
