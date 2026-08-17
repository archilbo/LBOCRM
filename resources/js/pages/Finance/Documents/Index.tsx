import { Head, router } from '@inertiajs/react';
import { IconArrowDownToArc, IconArrowsSort, IconCircleCheck, IconCurrencyDollar, IconDownload, IconEye, IconFileSpreadsheet, IconFileText, IconPencil, IconPrinter, IconRefresh, IconReceipt2, IconSearch, IconSettings2, IconShoppingCart, IconStopwatch, IconTrash, IconWallet, IconWand, IconX, IconCircleX } from '@tabler/icons-react';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { TabPanel } from 'react-aria-components';
import { Checkbox } from '@heroui/react';
import { toast } from 'sonner';
import { AppShell } from '@/components/layout/AppShell';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppConfirmDialog } from '@/components/ui/AppConfirmDialog';
import { AppFilterTabs } from '@/components/ui/AppFilterTabs';
import { AppInput } from '@/components/ui/AppInput';
import { AppModal } from '@/components/ui/AppModal';
import { AppPagination } from '@/components/ui/AppPagination';
import { AppWorkspaceTable } from '@/components/ui/AppWorkspaceTable';
import { type FinanceMetrics } from '@/features/finance/components/FinanceMetricCards';
import type { AgingBucket } from '@/features/finance/utils/calculations';
import { formatCompactMoney } from '@/lib/currency';
import { TreasuryDashboard } from '@/features/finance/components/TreasuryDashboard';
import { FinanceMonthlySummary } from '@/features/finance/components/FinanceMonthlySummary';
import { FinanceDocumentLockBadge, getFinanceDocumentLockedAt } from '@/features/finance/components/FinanceDocumentLockNotice';
import { financeDocumentTypeLabel, financeStatusLabel } from '@/features/finance/components/FinanceStatusBadge';
import { FinanceTabs } from '@/features/finance/components/FinanceTabs';
import { ReceivablesWorkspace } from '@/features/finance/components/ReceivablesWorkspace';
import { PaymentReminderDrawer } from '@/features/finance/components/PaymentReminderDrawer';
import { PaymentPromiseDrawer } from '@/features/finance/components/PaymentPromiseDrawer';
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
import { usePermissions } from '@/hooks/usePermissions';
import { useTranslation } from '@/lib/i18n';
import { paymentMethodLabel } from '@/features/finance/paymentMethodLabel';
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
    receivables?: Paginated<FinanceDocument> | FinanceDocument[];
    expenses?: Paginated<Expense> | Expense[];
    monthlySummaries?: FinanceMonthSummary[];
    metrics?: Partial<FinanceMetrics>;
    collectionMetrics?: { toReceive: number; overdue: number; dueToday: number; promisesUpcoming?: number; currency: string; aging?: Record<string, number>; clientsToRemind?: Array<{ clientId: number; clientName: string; outstanding: number; oldestDueDate: string | null }> } | null;
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
        collection_filter?: string; collection_search?: string; collection_sort?: string;
        collection_page?: number; collection_per_page?: number;
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
    onView: (document: FinanceDocument) => void;
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
    if (type === 'internal_invoice') return 'Facture interne';
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

function DocumentFileBadges({ document }: { document: FinanceDocument }) {
    return (
        <div className="flex flex-nowrap items-center gap-1">
            <span className={[
                'whitespace-nowrap rounded border px-1.5 py-0.5 text-[9px] font-semibold',
                document.hasExcel ? 'border-emerald-400/25 bg-emerald-400/10 text-emerald-300' : 'border-zinc-500/30 bg-zinc-500/10 text-zinc-300',
            ].join(' ')}>
                XLS
            </span>
            <span className={[
                'whitespace-nowrap rounded border px-1.5 py-0.5 text-[9px] font-semibold',
                document.hasPdf ? 'border-emerald-400/25 bg-emerald-400/10 text-emerald-300' : 'border-zinc-500/30 bg-zinc-500/10 text-zinc-300',
            ].join(' ')}>
                PDF
            </span>
            <FinanceDocumentLockBadge document={document} compact />
        </div>
    );
}

function FinanceTableCheckbox({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
    return (
        <span className="inline-flex shrink-0" onClick={(event) => event.stopPropagation()} onPointerDown={(event) => event.stopPropagation()}>
            <Checkbox isSelected={checked} onChange={onChange} aria-label={label}>
                <Checkbox.Content>
                    <Checkbox.Control className="size-4 rounded border border-[color-mix(in_srgb,var(--text-muted)_35%,transparent)] bg-[var(--surface)]">
                        <Checkbox.Indicator className="text-black" />
                    </Checkbox.Control>
                </Checkbox.Content>
            </Checkbox>
        </span>
    );
}

function FinanceDocumentDetailPanel({
    document,
    actions,
}: {
    document: FinanceDocument | null;
    actions: DocumentActionHandlers;
}) {
    const { can } = usePermissions();

    if (!document) {
        return (
            <AppCard className="p-3">
                <p className="text-xs font-semibold text-[var(--text)]">Document finance</p>
                <p className="mt-1 text-[10px] text-[var(--text-muted)]">
                    Select a quote, invoice, or receipt to see actions and totals.
                </p>
            </AppCard>
        );
    }

    const lockedAt = getFinanceDocumentLockedAt(document);

    return (
        <AppCard className="overflow-hidden p-0">
            <div className="border-b border-[var(--border)] px-4 py-3">
                <p className="text-[9px] font-semibold uppercase tracking-wider text-[var(--accent)]">Selected document</p>
                <div className="mt-1.5 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                            <h2 className="truncate text-sm font-semibold text-[var(--text)]">{document.number}</h2>
                            <FinanceDocumentLockBadge document={document} compact />
                        </div>
                        <p className="text-[10px] text-[var(--text-muted)]">{typeLabel(document.type)} &middot; {document.dossier?.number || '-'}</p>
                    </div>
                    <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-semibold ${statusClass(document.status)}`}>
                        {document.status?.replace(/_/g, ' ') || document.status}
                    </span>
                </div>
            </div>

            <div className="space-y-3 p-4">
                <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2">
                        <p className="text-[9px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Client</p>
                        <p className="mt-0.5 truncate text-xs font-semibold text-[var(--text)]">{document.client?.name || '-'}</p>
                        <p className="truncate text-[9px] text-[var(--text-muted)]">{document.client?.cin || '-'}</p>
                    </div>
                    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2">
                        <p className="text-[9px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Dossier</p>
                        <p className="mt-0.5 truncate text-xs font-semibold text-[var(--text)]">{document.dossier?.number || '-'}</p>
                        <p className="truncate text-[9px] text-[var(--text-muted)]">{document.dossier?.projectObject || '-'}</p>
                    </div>
                    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2">
                        <p className="text-[9px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Total TTC</p>
                        <p className="mt-0.5 truncate text-xs font-semibold text-[var(--accent)]">{formatCompactMoney(document.totalTtc, document.currency)}</p>
                        <p className="truncate text-[9px] text-[var(--text-muted)]">HT {formatCompactMoney(document.subtotalHt, document.currency)}</p>
                    </div>
                    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2">
                        <p className="text-[9px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Remaining</p>
                        <p className="mt-0.5 truncate text-xs font-semibold text-[var(--text)]">{formatCompactMoney(document.remainingTotal, document.currency)}</p>
                        <p className="truncate text-[9px] text-[var(--text-muted)]">Paid {formatCompactMoney(document.paidTotal, document.currency)}</p>
                    </div>
                </div>

                <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2">
                    <p className="text-[9px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Files</p>
                    <div className="mt-1.5">
                        <DocumentFileBadges document={document} />
                    </div>
                    {lockedAt ? <p className="mt-1.5 text-[9px] text-[var(--text-muted)]">Locked: {lockedAt}</p> : null}
                </div>

                <div className="space-y-1.5">
                    <div className="grid grid-cols-2 gap-1.5">
                        <AppButton variant="flat" size="sm" onPress={() => actions.onView(document)}>
                            <IconEye size={13} /> View
                        </AppButton>
                        <AppButton variant="flat" size="sm" onPress={() => actions.onPrint(document)}>
                            <IconPrinter size={13} /> Print
                        </AppButton>
                    </div>
                    {can('finance.documents.update') ? <AppButton variant="primary" className="w-full" size="sm" onPress={() => actions.onGeneratePdf(document)}>
                        <IconFileText size={13} />
                        Generate PDF
                    </AppButton> : null}
                    {can('finance.documents.update') ? <div className="grid grid-cols-2 gap-1.5">
                        <AppButton variant="flat" size="sm" onPress={() => actions.onGenerateExcel(document)}>
                            <IconFileSpreadsheet size={13} />
                            Excel
                        </AppButton>
                        <AppButton variant="flat" size="sm" onPress={() => actions.onEdit(document)}>
                            <IconPencil size={13} />
                            Edit
                        </AppButton>
                    </div> : null}

                    {can('finance.documents.issue') && document.type === 'quote' ? (
                        <div className="grid grid-cols-2 gap-1.5">
                            <AppButton variant="flat" className="border-emerald-500/20 text-emerald-400" size="sm" onPress={() => actions.onAccept(document)}>
                                <IconCircleCheck size={13} />
                                Accept
                            </AppButton>
                            {can('finance.documents.create') ? <AppButton variant="flat" className="border-[var(--accent)]/20 text-[var(--accent)]" size="sm" onPress={() => actions.onConvert(document)}>
                                <IconReceipt2 size={13} />
                                Invoice
                            </AppButton> : null}
                        </div>
                    ) : null}

                    {can('finance.payments.create') && (document.type === 'invoice' || document.type === 'internal_invoice') ? (
                        <AppButton variant="flat" className="w-full" size="sm" onPress={() => actions.onPayment(document)}>
                            <IconWallet size={13} />
                            Register payment
                        </AppButton>
                    ) : null}

                    {can('finance.documents.delete') ? <AppButton variant="danger" className="w-full" size="sm" onPress={() => actions.onDelete(document)}>
                        <IconTrash size={13} />
                        Delete
                    </AppButton> : null}
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
    onBulkDelete,
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
    onBulkDelete: (documentIds: number[]) => void;
}) {
    const { can } = usePermissions();
    const { t } = useTranslation();
    const [query, setQuery] = useState(filters?.search || '');
    const [showFilters, setShowFilters] = useState(false);
    const [statusFilter, setStatusFilter] = useState(filters?.status || 'all');
    const [typeFilter, setTypeFilter] = useState(filters?.type || 'all');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const statusFilterOptions = useMemo(() => [
        { id: 'all', label: t('finance.statuses.all') }, { id: 'draft', label: t('finance.statuses.draft') },
        { id: 'issued', label: t('finance.statuses.issued') }, { id: 'sent', label: t('finance.statuses.sent') },
        { id: 'accepted', label: t('finance.statuses.accepted') }, { id: 'partially_paid', label: t('finance.statuses.partiallyPaid') },
        { id: 'paid', label: t('finance.statuses.paid') }, { id: 'overdue', label: t('finance.statuses.overdue') },
        { id: 'rejected', label: t('finance.statuses.rejected') }, { id: 'cancelled', label: t('finance.statuses.cancelled') },
    ], [t]);
    const typeFilterOptions = useMemo(() => [
        { id: 'all', label: t('finance.table.allTypes') }, { id: 'quote', label: t('finance.types.quote') },
        { id: 'invoice', label: t('finance.types.invoice') }, { id: 'receipt', label: t('finance.types.receipt') },
    ], [t]);
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
        }, can, t);
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

    return (
        <section className="min-w-0 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)]">
            {/* Toolbar */}
            <div className="flex flex-col gap-2 px-3 py-2.5 sm:flex-row sm:items-center">
                <div className="flex min-w-0 items-center gap-1.5">
                    <div className="relative min-w-0 flex-1 sm:w-[260px] sm:flex-none">
                        <IconSearch size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                        <input
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            onKeyDown={(event) => { if (event.key === 'Enter') applyServerFilters({ search: query || undefined, page: 1 }); }}
                            placeholder={searchPlaceholder}
                            className="h-7 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] pl-7 pr-6 text-xs text-[var(--text)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--accent)_18%,transparent)]"
                        />
                        {query ? (
                            <AppButton
                                isIconOnly
                                compact
                                variant="quiet"
                                tooltip={t('finance.table.clearSearch')}
                                aria-label={t('finance.table.clearSearch')}
                                onPress={() => {
                                    setQuery('');
                                    applyServerFilters({ search: undefined, page: 1 });
                                }}
                                className="absolute right-0.5 top-1/2 size-6 min-h-6 min-w-6 -translate-y-1/2"
                            >
                                <IconX size={11} />
                            </AppButton>
                        ) : null}
                    </div>
                    <AppButton isIconOnly compact variant="toolbar" tooltip={t('finance.table.refresh')} aria-label={t('finance.table.refresh')} isDisabled={isRefreshing} className="size-7 min-h-7 min-w-7" onPress={() => { setIsRefreshing(true); router.reload({ only: ['documents'], onFinish: () => setIsRefreshing(false) }); }}>
                        <IconRefresh size={11} className={isRefreshing ? 'animate-spin' : ''} />
                    </AppButton>
                    <AppButton isIconOnly compact variant={showFilters ? 'accent' : 'toolbar'} tooltip={t('finance.table.filters')} aria-label={t('finance.table.filters')} className="size-7 min-h-7 min-w-7" onPress={() => setShowFilters((v) => !v)}>
                        <IconSettings2 size={11} />
                        {statusFilter !== 'all' || typeFilter !== 'all' ? (
                            <span className="ml-0.5 flex size-3.5 items-center justify-center rounded-full bg-[var(--accent)] text-[8px] font-bold text-black">!</span>
                        ) : null}
                    </AppButton>
                </div>

                <div className="ml-auto hidden text-[10px] font-medium text-[var(--text-muted)] md:block">
                    {t('finance.table.documentsCount', { count: filtered.length })}
                </div>
            </div>

            {/* Filter panel */}
            {showFilters ? (
                <div className="border-t border-[var(--border)] bg-[color-mix(in_srgb,var(--surface-2)_35%,transparent)] px-3 py-3">
                    <div className="grid min-w-0 gap-3 lg:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)]">
                        <AppFilterTabs
                            label={t('finance.table.status')}
                            value={statusFilter}
                            options={statusFilterOptions}
                            onChange={(value) => {
                                setStatusFilter(value);
                                applyServerFilters({ status: value === 'all' ? undefined : value, page: 1 });
                            }}
                        />
                        <AppFilterTabs
                            label={t('finance.table.type')}
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
                    <span className="text-xs font-semibold text-[var(--accent)]">{t('finance.table.selected', { count: selectedRows.length })}</span>
                    <div className="ml-auto flex items-center gap-1">
                        <AppButton compact size="sm" variant="toolbar" onPress={() => { selectedRows.forEach((id) => { const doc = filtered.find((d) => d.id === id); if (doc) actions.onGeneratePdf(doc); }); }}>
                            <IconFileText size={12} /> {t('finance.table.generatePdf')}
                        </AppButton>
                        <AppButton compact size="sm" variant="toolbar" onPress={() => { selectedRows.forEach((id) => { const doc = filtered.find((d) => d.id === id); if (doc) actions.onGenerateExcel(doc); }); }}>
                            <IconFileSpreadsheet size={12} /> {t('finance.table.generateExcel')}
                        </AppButton>
                        {can('finance.documents.delete') ? <AppButton compact size="sm" variant="danger-soft" onPress={() => onBulkDelete(selectedRows)}>
                            <IconTrash size={12} /> {t('finance.actions.delete')}
                        </AppButton> : null}
                        <div className="mx-1 h-5 w-px bg-[var(--border)]" />
                        <AppButton compact size="sm" variant="quiet" onPress={() => setSelectedRows([])}>
                            <IconX size={12} /> {t('finance.table.clearSelection')}
                        </AppButton>
                    </div>
                </div>
            ) : null}

            {/* Desktop table */}
            <div className="finance-table-shell hidden md:block">
                <table className="finance-table min-w-[980px] text-sm">
                    <thead>
                        <tr className="border-b border-[var(--border)] text-left text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                            <th className="w-10 px-3 py-2">
                                <FinanceTableCheckbox checked={allPageRowsSelected} onChange={togglePageRows} label={t('finance.table.selectAll')} />
                            </th>
                            <FinanceSortableHeader column="number" label={<><IconReceipt2 size={11} /> {t('finance.table.document')}</>} sort={sort} direction={direction} onSort={changeSort} />
                            <FinanceSortableHeader column="type" label={t('finance.table.type')} sort={sort} direction={direction} onSort={changeSort} />
                            <th className="px-3 py-2">
                                <span className="inline-flex items-center gap-1.5">
                                    <IconFileText size={11} />
                                    {t('finance.table.clientProject')}
                                </span>
                            </th>
                            <FinanceSortableHeader column="status" label={t('finance.table.status')} sort={sort} direction={direction} onSort={changeSort} />
                            <FinanceSortableHeader column="total_ttc" label={t('finance.table.total')} sort={sort} direction={direction} onSort={changeSort} align="right" />
                            <FinanceSortableHeader column="paid_total" label={t('finance.table.paid')} sort={sort} direction={direction} onSort={changeSort} align="right" />
                            <FinanceSortableHeader column="remaining_total" label={t('finance.table.remaining')} sort={sort} direction={direction} onSort={changeSort} align="right" />
                            <th className="w-24 px-3 py-2 text-right">{t('finance.table.actions')}</th>
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
                                            <FinanceTableCheckbox checked={rowChecked} onChange={() => toggleRow(document.id)} label={t('finance.table.selectDocument', { number: document.number })} />
                                        </td>
                                        <td className="px-3 py-2">
                                            <div className="flex items-center gap-2">
                                                <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] text-[var(--accent)]">
                                                    <IconReceipt2 size={12} />
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
                                            <span className="text-[10px] font-medium text-[var(--text-muted)]">{financeDocumentTypeLabel(document.type, t)}</span>
                                        </td>
                                        <td className="px-3 py-2">
                                            <p className="max-w-[180px] truncate text-xs font-medium text-[var(--text)]">{document.client?.name || '-'}</p>
                                            <p className="max-w-[180px] truncate text-[9px] text-[var(--text-muted)]">{document.dossier?.number || ''}{document.dossier?.projectObject ? ` · ${document.dossier.projectObject}` : ''}</p>
                                        </td>
                                        <td className="px-3 py-2">
                                            <span className={`inline-flex rounded-full border px-2 py-0.5 text-[9px] font-semibold ${statusStyle(document.status)}`}>
                                                {financeStatusLabel(document.status, t)}
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
                                        <IconFileText size={24} className="text-[var(--text-muted)]" />
                                        <p className="text-xs font-semibold text-[var(--text)]">{t('finance.table.noDocumentsTitle')}</p>
                                        <p className="text-[10px] text-[var(--text-muted)]">{t('finance.table.noDocumentsDescription')}</p>
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
                                    <IconReceipt2 size={12} />
                                </div>
                                <div className="min-w-0">
                                    <p className="truncate text-xs font-semibold">{document.number}</p>
                                    <p className="truncate text-[10px] text-[var(--text-muted)]">{document.client?.name || '-'} / {document.dossier?.number || '-'}</p>
                                </div>
                            </div>
                            <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-semibold ${statusStyle(document.status)}`}>
                                {financeStatusLabel(document.status, t)}
                            </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-[10px]">
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
    const { can } = usePermissions();
    const { t } = useTranslation();
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
        const actions: Array<FinanceRowAction | false> = [
            can('finance.payments.view') && Boolean(payment.receipt?.urls?.show) && { id: 'view-receipt', label: t('finance.actions.open'), icon: <IconEye size={13} />, onPress: () => onReceipt(payment.receipt?.urls?.show) },
            can('finance.payments.view') && Boolean(payment.receipt?.urls?.pdf) && { id: 'download-pdf', label: t('finance.actions.downloadPdf'), icon: <IconFileText size={13} />, onPress: () => onReceipt(payment.receipt?.urls?.pdf), tone: 'accent' },
            can('finance.payments.view') && Boolean(payment.receipt?.urls?.excel) && { id: 'download-excel', label: t('finance.actions.downloadExcel'), icon: <IconFileSpreadsheet size={13} />, onPress: () => onReceipt(payment.receipt?.urls?.excel), tone: 'accent' },
        ];

        return actions.filter((action): action is FinanceRowAction => action !== false);
    }

    return (
        <AppWorkspaceTable ariaLabel={t('finance.table.payment')} className="min-w-0 overflow-hidden">
            {/* Toolbar */}
            <div className="flex flex-col gap-2 px-3 py-2.5 sm:flex-row sm:items-center">
                <div className="flex min-w-0 items-center gap-1.5">
                    <div className="relative min-w-0 flex-1 sm:w-[280px] sm:flex-none">
                        <IconSearch size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                        <input
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            onKeyDown={(event) => { if (event.key === 'Enter') applyPaymentFilters({ payment_search: query || undefined, payments_page: 1 }); }}
                            placeholder={t('finance.table.searchPayments')}
                            className="h-7 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] pl-7 pr-6 text-xs text-[var(--text)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--accent)_18%,transparent)]"
                        />
                        {query && (
                            <AppButton
                                isIconOnly
                                compact
                                variant="quiet"
                                tooltip={t('finance.table.clearSearch')}
                                aria-label={t('finance.table.clearSearch')}
                                onPress={() => {
                                    setQuery('');
                                    applyPaymentFilters({ payment_search: undefined, payments_page: 1 });
                                }}
                                className="absolute right-0.5 top-1/2 size-6 min-h-6 min-w-6 -translate-y-1/2"
                            >
                                <IconX size={11} />
                            </AppButton>
                        )}
                    </div>
                </div>

                <div className="ml-auto hidden text-[10px] font-medium text-[var(--text-muted)] md:block">
                    {t('finance.table.paymentsCount', { count: pagination.total })} · {t('finance.table.pageTotal')} {formatCompactMoney(totalAmount, currency)}
                </div>
            </div>

            {/* Desktop table */}
            <div className="finance-table-shell hidden md:block">
                <table className="finance-table min-w-[720px] text-sm">
                    <thead>
                        <tr className="border-b border-[var(--border)] text-left text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                            <FinanceSortableHeader column="payment_number" label={<><IconCurrencyDollar size={11} /> {t('finance.table.payment')}</>} sort={sort} direction={direction} onSort={changeSort} />
                            <th className="px-3 py-2">
                                <span className="inline-flex items-center gap-1.5">
                                    <IconReceipt2 size={11} />
                                    {t('finance.table.invoiceClient')}
                                </span>
                            </th>
                            <FinanceSortableHeader column="amount" label={t('finance.table.amount')} sort={sort} direction={direction} onSort={changeSort} align="right" />
                            <th className="px-3 py-2">{t('finance.table.methodReference')}</th>
                            <th className="px-3 py-2">{t('finance.table.receipt')}</th>
                            <th className="w-24 px-3 py-2 text-right">{t('finance.table.actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pagedFiltered.length > 0 ? (
                            pagedFiltered.map((payment) => (
                                <tr key={payment.id} className="group cursor-pointer border-b border-[var(--border)] text-xs transition hover:bg-[var(--surface-2)] last:border-0">
                                    <td className="px-3 py-2">
                                        <div className="flex items-center gap-2">
                                            <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] text-[var(--accent)]">
                                                <IconCurrencyDollar size={12} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-semibold text-[var(--text)]">{payment.paymentNumber}</p>
                                                <p className="text-[9px] text-[var(--text-muted)]">
                                                    {payment.paidAt || '—'}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-3 py-2">
                                        <p className="max-w-[180px] truncate text-xs font-medium text-[var(--text)]">{payment.document?.number || '-'}</p>
                                        <p className="max-w-[180px] truncate text-[9px] text-[var(--text-muted)]">{payment.client?.name || '-'}</p>
                                    </td>
                                    <td className="px-3 py-2 text-right text-xs font-semibold tabular-nums text-emerald-400">{formatCompactMoney(payment.amount, currency)}</td>
                                    <td className="px-3 py-2">
                                        <p className="text-xs text-[var(--text)]">{paymentMethodLabel(payment.method, t)}</p>
                                        <p className="max-w-[140px] truncate text-[9px] text-[var(--text-muted)]">{payment.reference || t('finance.table.noReference')}</p>
                                    </td>
                                    <td className="px-3 py-2">
                                        {payment.receipt ? (
                                            <div className="flex items-center gap-1.5">
                                                <span className="inline-block size-1.5 rounded-full bg-emerald-400" />
                                                <span className="text-[10px] font-medium text-[var(--text)]">{payment.receipt.number}</span>
                                            </div>
                                        ) : (
                                            <span className="text-[10px] text-[var(--text-muted)]">—</span>
                                        )}
                                    </td>
                                    <td className="px-3 py-2">
                                        <FinanceRowActions actions={paymentActionsFor(payment)} visibleCount={1} />
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="p-6 text-center">
                                    <div className="flex flex-col items-center gap-1.5">
                                        <IconWallet size={24} className="text-[var(--text-muted)]" />
                                        <p className="text-xs font-semibold text-[var(--text)]">{t('finance.table.noPaymentsTitle')}</p>
                                        <p className="text-[10px] text-[var(--text-muted)]">{t('finance.table.noPaymentsDescription')}</p>
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
                                        <IconCurrencyDollar size={12} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="truncate text-xs font-semibold text-[var(--text)]">{payment.paymentNumber}</p>
                                        <p className="truncate text-[10px] text-[var(--text-muted)]">{payment.paidAt || '—'} · {paymentMethodLabel(payment.method, t)}</p>
                                    </div>
                                </div>
                                <span className="shrink-0 text-xs font-semibold tabular-nums text-emerald-400">{formatCompactMoney(payment.amount, currency)}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-[10px]">
                                <span className="text-[var(--text-muted)]">{t('finance.types.invoice')} <span className="font-semibold text-[var(--text)]">{payment.document?.number || '-'}</span></span>
                                <span className="text-[var(--text-muted)]">Client <span className="font-semibold text-[var(--text)]">{payment.client?.name || '-'}</span></span>
                            </div>
                            {payment.reference ? <p className="text-[10px] text-[var(--text-muted)]">{t('finance.table.referenceLabel')} <span className="font-medium text-[var(--text)]">{payment.reference}</span></p> : null}
                            <FinanceRowActions actions={paymentActionsFor(payment)} visibleCount={1} className="justify-end" />
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center gap-1.5 px-4 py-12 text-center">
                        <IconWallet size={24} className="text-[var(--text-muted)]" />
                        <p className="text-xs font-semibold text-[var(--text)]">{t('finance.table.noPaymentsTitle')}</p>
                        <p className="text-[10px] text-[var(--text-muted)]">{t('finance.table.noPaymentsDescription')}</p>
                    </div>
                )}
            </div>

            <AppPagination page={pagination.page} pageSize={pagination.pageSize} total={pagination.total} onChange={(page) => applyPaymentFilters({ payments_page: page })} />
        </AppWorkspaceTable>
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
    collectionMetrics,
    onSelect,
}: {
    metrics: FinanceMetrics;
    quotes: FinanceDocument[];
    invoices: FinanceDocument[];
    currency: string;
    monthlySummaries: FinanceMonthSummary[];
    allDocuments: FinanceDocument[];
    collectionMetrics: PageProps['collectionMetrics'];
    onSelect: (document: FinanceDocument) => void;
}) {
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
                    stacked
                    keepCurrencyAttached
                    icon={<IconFileText size={16} className="text-sky-400" />}
                    label="Quotes"
                    value={formatCompactMoney(metrics.totalQuotes, currency)}
                    sparklineData={sparklines.quotes}
                    detail="Total devis TTC"
                    metricType="revenue"
                    fullValue={metrics.totalQuotes}
                    currency={currency}
                />
                <AppKpiCard
                    stacked
                    keepCurrencyAttached
                    icon={<IconReceipt2 size={16} className="text-violet-400" />}
                    label="Invoices"
                    value={formatCompactMoney(metrics.totalInvoices, currency)}
                    sparklineData={sparklines.invoices}
                    detail="Total factures TTC"
                    metricType="revenue"
                    fullValue={metrics.totalInvoices}
                    currency={currency}
                />
                <AppKpiCard
                    stacked
                    keepCurrencyAttached
                    icon={<IconCurrencyDollar size={16} className="text-amber-400" />}
                    label="Remaining"
                    value={formatCompactMoney(metrics.remainingTotal, currency)}
                    sparklineData={sparklines.remaining}
                    detail="Still to collect"
                    metricType="revenue"
                    fullValue={metrics.remainingTotal}
                    currency={currency}
                />
                <AppKpiCard
                    stacked
                    keepCurrencyAttached
                    icon={<IconStopwatch size={16} className="text-rose-400" />}
                    label="Overdue"
                    value={formatCompactMoney(metrics.overdueTotal, currency)}
                    sparklineData={sparklines.overdue}
                    detail={`${metrics.draftCount} draft(s)`}
                    metricType="overdue"
                    fullValue={metrics.overdueTotal}
                    currency={currency}
                />
                <AppKpiCard
                    stacked
                    keepCurrencyAttached
                    icon={<IconArrowDownToArc size={16} className="text-emerald-400" />}
                    label="Encaisse"
                    value={formatCompactMoney(metrics.paidTotal, currency)}
                    sparklineData={sparklines.paid}
                    detail="Total encaissé"
                    metricType="revenue"
                    fullValue={metrics.paidTotal}
                    currency={currency}
                />
                <AppKpiCard
                    stacked
                    keepCurrencyAttached
                    icon={<IconShoppingCart size={16} className="text-orange-400" />}
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

            <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
                <AppCard className="p-4">
                    <div className="flex items-center justify-between gap-3"><div><h2 className="text-sm font-semibold text-[var(--text)]">Ancienneté des impayés</h2><p className="mt-0.5 text-xs text-[var(--text-muted)]">Montants restant à encaisser par retard.</p></div><span className="shrink-0 text-xs font-semibold text-[var(--accent)]">{formatCompactMoney(collectionMetrics?.toReceive || 0, currency)}</span></div>
                    <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
                        {[['À jour', 'current', 'text-sky-400'], ['1–7 j', '1_7', 'text-amber-400'], ['8–30 j', '8_30', 'text-orange-400'], ['31–60 j', '31_60', 'text-red-400'], ['61+ j', '61_plus', 'text-red-500']].map(([label, key, color]) => <div key={key} className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)]/50 p-2"><p className="text-[10px] text-[var(--text-muted)]">{label}</p><p className={`mt-1 text-xs font-semibold tabular-nums ${color}`}>{formatCompactMoney(collectionMetrics?.aging?.[key] || 0, currency)}</p></div>)}
                    </div>
                </AppCard>
                <AppCard className="overflow-hidden p-0"><div className="border-b border-[var(--border)] px-4 py-3"><h2 className="text-sm font-semibold text-[var(--text)]">Clients à relancer</h2></div><div className="divide-y divide-[var(--border)]">{collectionMetrics?.clientsToRemind?.length ? collectionMetrics.clientsToRemind.map((client) => <button type="button" key={client.clientId} onClick={() => router.visit(`/finance/documents?tab=collections&collection_filter=overdue&collection_client_id=${client.clientId}`)} className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left transition hover:bg-[var(--surface-2)]"><div className="min-w-0"><p className="truncate text-xs font-semibold text-[var(--text)]">{client.clientName}</p><p className="mt-0.5 text-[10px] text-[var(--text-muted)]">Depuis le {client.oldestDueDate || '—'}</p></div><span className="shrink-0 text-xs font-semibold tabular-nums text-amber-400">{formatCompactMoney(client.outstanding, currency)}</span></button>) : <p className="px-4 py-8 text-center text-xs text-[var(--text-muted)]">Aucun client à relancer.</p>}</div></AppCard>
            </div>

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
                    <span className="text-[10px] text-[var(--text-muted)]">{formatCompactMoney(total, currency || 'MAD')}</span>
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
                                        <span className="mt-0.5 block text-[10px] text-[var(--text-muted)]">{bucket.count} document{bucket.count > 1 ? 's' : ''}</span>
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
                <span className="rounded-full bg-[var(--surface-2)] px-2 py-0.5 text-[10px] font-medium text-[var(--text-muted)]">
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
                                        <span className="truncate text-[10px] font-semibold text-[var(--text)]">{document.number}</span>
                                        <FinanceDocumentLockBadge document={document} />
                                    </div>
                                    <span className="shrink-0 text-[10px] font-semibold tabular-nums text-[var(--accent)]">{formatCompactMoney(document.totalTtc, document.currency)}</span>
                                </div>
                                <div className="mt-0.5 flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-1.5 text-[9px] text-[var(--text-muted)] min-w-0">
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
                                            <span className="text-[9px] text-[var(--text-muted)]">{Math.round(paidPct)}%</span>
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
    receivables: rawReceivables,
    expenses: rawExpenses,
    monthlySummaries = [],
    metrics: rawMetrics,
    collectionMetrics,
    clients = [],
    dossiers = [],
    templates = [],
    templateEditorUrl,
    settingsEditorUrl,
    settings: rawSettings,
    filters,
}: PageProps) {
    const { can } = usePermissions();
    const { t } = useTranslation();
    const documents = unwrap(rawDocuments);
    const documentPagination = paginationOf(rawDocuments);
    const payments = unwrap(rawPayments);
    const receivables = unwrap(rawReceivables);
    const paymentPagination = paginationOf(rawPayments);
    const receivablePagination = paginationOf(rawReceivables);
    const expenses = unwrap(rawExpenses) as Expense[];
    const expensePagination = paginationOf(rawExpenses);

    const settings = { ...defaultSettings, ...rawSettings };
    const [activeTab, setActiveTab] = useState(filters?.tab || new URLSearchParams(window.location.search).get('tab') || 'overview');
    const visibleFinanceTabs = useMemo(() => [
        'overview',
        'quotes',
        'invoices',
        'internals',
        ...(can('finance.collections.view') ? ['collections'] : []),
        'monthly',
        ...(can('finance.payments.view') ? ['payments'] : []),
        ...(can('finance.expenses.view') ? ['expenses'] : []),
        ...(can('finance.templates.view') ? ['templates'] : []),
        ...(can('finance.settings.view') ? ['settings'] : []),
    ], [can]);
    const selectedFinanceTab = visibleFinanceTabs.includes(activeTab) ? activeTab : 'overview';
    const [builderOpen, setBuilderOpen] = useState(false);
    const [builderMode, setBuilderMode] = useState<'create' | 'edit'>('create');
    const [builderType, setBuilderType] = useState<FinanceDocumentType>('quote');
    const [selectedDocument, setSelectedDocument] = useState<FinanceDocument | null>(documents[0] ?? null);
    const [paymentOpen, setPaymentOpen] = useState(false);
    const [paymentInvoice, setPaymentInvoice] = useState<FinanceDocument | null>(null);
    const [reminderInvoice, setReminderInvoice] = useState<FinanceDocument | null>(null);
    const [promiseInvoice, setPromiseInvoice] = useState<FinanceDocument | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<FinanceDocument | null>(null);
    const [bulkDeleteDocumentIds, setBulkDeleteDocumentIds] = useState<number[]>([]);
    const [expenseDrawerOpen, setExpenseDrawerOpen] = useState(false);
    const [expenseDrawerMode, setExpenseDrawerMode] = useState<ExpenseViewMode>('create');
    const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
    const [renameTemplate, setRenameTemplate] = useState<TemplateOption | null>(null);
    const [renameTemplateName, setRenameTemplateName] = useState('');
    const [renameTemplateError, setRenameTemplateError] = useState<string>();

    function changeTab(tab: string) {
        if (!visibleFinanceTabs.includes(tab)) return;
        setActiveTab(tab);
        router.get('/finance/documents', { tab }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            only: ['documents', 'payments', 'receivables', 'collectionMetrics', 'expenses', 'filters'],
        });
    }

    const quotes = useMemo(() => documents.filter((doc) => doc.type === 'quote'), [documents]);
    const invoices = useMemo(() => documents.filter((doc) => doc.type === 'invoice'), [documents]);
    const internalInvoices = useMemo(() => documents.filter((doc) => doc.type === 'internal_invoice'), [documents]);

    const totalExpenses = useMemo(() =>
        expenses.reduce((sum, e) => sum + e.amount, 0),
    [expenses]);

    const metrics: FinanceMetrics = {
        totalQuotes: rawMetrics?.totalQuotes ?? quotes.reduce((sum, doc) => sum + doc.totalTtc, 0),
        expectedTotal: rawMetrics?.expectedTotal ?? internalInvoices.reduce((sum, doc) => sum + doc.totalTtc, 0),
        expectedRemainingTotal: rawMetrics?.expectedRemainingTotal ?? internalInvoices.reduce((sum, doc) => sum + doc.remainingTotal, 0),
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

    function applyCollectionQuery(query: Record<string, string | number | undefined>) {
        router.get('/finance/documents', { tab: 'collections', ...query }, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
            only: ['receivables', 'collectionMetrics', 'filters'],
        });
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

    function handleBulkDelete() {
        if (bulkDeleteDocumentIds.length === 0) return;

        router.post('/finance/documents/bulk-delete', { document_ids: bulkDeleteDocumentIds }, {
            preserveScroll: true,
            onSuccess: () => { toast.success(`${bulkDeleteDocumentIds.length} document(s) supprime(s).`); setBulkDeleteDocumentIds([]); },
            onError: () => toast.error('Impossible de supprimer les documents selectionnes.'),
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
                    onCreateInternalInvoice={() => openCreate('internal_invoice')}
                    onCreateQuote={() => openCreate('quote')}
                    canCreateDocument={can('finance.documents.create')}
                    canCreatePayment={can('finance.payments.create')}
                    canCreateExpense={can('finance.expenses.create')}
                />

                <FinanceTabs
                    selectedKey={selectedFinanceTab}
                    onSelectionChange={changeTab}
                    visibleTabIds={visibleFinanceTabs}
                    counts={{
                        quotes: quotes.length,
                        invoices: invoices.length,
                        internals: internalInvoices.length,
                        collections: receivablePagination.total,
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
                            collectionMetrics={collectionMetrics ?? null}
                            onSelect={(document) => {
                                setSelectedDocument(document);
                                setActiveTab(document.type === 'invoice' ? 'invoices' : document.type === 'internal_invoice' ? 'internals' : 'quotes');
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
                            searchPlaceholder={t('finance.table.searchDocuments')}
                            pagination={documentPagination}
                            filters={filters}
                            activeTab={activeTab}
                            onBulkDelete={setBulkDeleteDocumentIds}
                        />
                    </TabPanel>

                    <TabPanel id="invoices" className="outline-none">
                        <FinanceDocumentWorkspace
                            documents={invoices}
                            currency={settings.defaultCurrency}
                            selected={selectedDocument}
                            onSelect={setSelectedDocument}
                            actions={commonActions}
                            searchPlaceholder={t('finance.table.searchDocuments')}
                            pagination={documentPagination}
                            filters={filters}
                            activeTab={activeTab}
                            onBulkDelete={setBulkDeleteDocumentIds}
                        />
                    </TabPanel>

                    <TabPanel id="internals" className="outline-none">
                        <FinanceDocumentWorkspace
                            documents={internalInvoices}
                            currency={settings.defaultCurrency}
                            selected={selectedDocument}
                            onSelect={setSelectedDocument}
                            actions={commonActions}
                            searchPlaceholder="Rechercher une facture interne"
                            pagination={documentPagination}
                            filters={filters}
                            activeTab={activeTab}
                            onBulkDelete={setBulkDeleteDocumentIds}
                        />
                    </TabPanel>

                    {can('finance.collections.view') ? (
                        <TabPanel id="collections" className="outline-none">
                            <ReceivablesWorkspace
                                receivables={receivables}
                                metrics={collectionMetrics ?? null}
                                filters={filters}
                                pagination={receivablePagination}
                                canCreatePayment={can('finance.payments.create')}
                                canManageReminders={can('finance.reminders.manage')}
                                canManagePromises={can('finance.promises.manage')}
                                onQuery={applyCollectionQuery}
                                onPayment={openPayment}
                                onReminder={setReminderInvoice}
                                onPromise={setPromiseInvoice}
                                onOpen={(document) => router.visit(docShowUrl(document.id))}
                            />
                        </TabPanel>
                    ) : null}

                    <TabPanel id="monthly" className="outline-none">
                        <FinanceMonthlySummary months={monthlySummaries} currency={settings.defaultCurrency} />
                    </TabPanel>

                    {can('finance.payments.view') ? (
                        <TabPanel id="payments" className="outline-none">
                            <PaymentWorkspace
                                payments={payments}
                                currency={settings.defaultCurrency}
                                onReceipt={openPaymentReceiptUrl}
                                pagination={paymentPagination}
                                filters={filters}
                            />
                        </TabPanel>
                    ) : null}

                    {can('finance.expenses.view') ? (
                        <TabPanel id="expenses" className="outline-none">
                            <ExpensesWorkspace
                                expenses={expenses}
                                currency={settings.defaultCurrency}
                                pagination={expensePagination}
                                filters={filters}
                                onEdit={(expense) => { setSelectedExpense(expense); setExpenseDrawerMode('edit'); setExpenseDrawerOpen(true); }}
                                onView={(expense) => { setSelectedExpense(expense); setExpenseDrawerMode('view'); setExpenseDrawerOpen(true); }}
                                canEdit={can('finance.expenses.update')}
                                canDelete={can('finance.expenses.delete')}
                            />
                        </TabPanel>
                    ) : null}

                    {can('finance.templates.view') ? (
                        <TabPanel id="templates" className="outline-none">
                            <FinanceTemplateManager
                                templates={templates}
                                editorUrl={templateEditorUrl}
                                onOpenEditor={(url) => router.visit(url)}
                                onRename={openTemplateRename}
                                canManage={can('finance.templates.manage')}
                            />
                        </TabPanel>
                    ) : null}

                    {can('finance.settings.view') ? (
                        <TabPanel id="settings" className="outline-none">
                            <FinanceSettingsSummary
                                settings={settings}
                                settingsUrl={settingsEditorUrl}
                                onOpen={(url) => router.visit(url)}
                                canManage={can('finance.settings.update')}
                            />
                        </TabPanel>
                    ) : null}
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
                onSaved={(savedType) => setActiveTab(savedType === 'quote' ? 'quotes' : savedType === 'invoice' ? 'invoices' : savedType === 'internal_invoice' ? 'internals' : 'overview')}
            />

            <PaymentDrawer
                isOpen={paymentOpen}
                onOpenChange={setPaymentOpen}
                invoices={[...invoices, ...internalInvoices]}
                invoice={paymentInvoice}
                clients={clients}
                dossiers={dossiers}
                allowAdvancePayment={true}
            />

            <PaymentReminderDrawer
                isOpen={Boolean(reminderInvoice)}
                onOpenChange={(open) => { if (!open) setReminderInvoice(null); }}
                invoice={reminderInvoice}
            />

            <PaymentPromiseDrawer
                isOpen={Boolean(promiseInvoice)}
                onOpenChange={(open) => { if (!open) setPromiseInvoice(null); }}
                invoice={promiseInvoice}
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

            <AppModal isOpen={bulkDeleteDocumentIds.length > 0} onOpenChange={(open) => { if (!open) setBulkDeleteDocumentIds([]); }} title="Supprimer les documents selectionnes ?" size="sm">
                <p className="mb-5 text-sm text-[var(--text-muted)]">Supprimer {bulkDeleteDocumentIds.length} document(s) selectionne(s) ? Cette action est irreversible.</p>
                <div className="flex justify-end gap-2"><AppButton variant="bordered" onPress={() => setBulkDeleteDocumentIds([])}>Annuler</AppButton><AppButton variant="solid" color="danger" className="bg-[var(--danger)] text-white hover:bg-[var(--danger-hover)]" onPress={handleBulkDelete}>Supprimer</AppButton></div>
            </AppModal>
        </>
    );
}
