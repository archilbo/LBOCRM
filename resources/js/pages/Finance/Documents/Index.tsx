import { Head, router } from '@inertiajs/react';
import {
    BadgeDollarSign,
    CheckCircle2,
    Download,
    Eye,
    FileSpreadsheet,
    FileText,
    Pencil,
    Plus,
    ReceiptText,
    Search,
    Settings2,
    Trash2,
    WalletCards,
    WandSparkles,
    X,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { TabPanel } from 'react-aria-components';
import { toast } from 'sonner';
import { AppShell } from '@/components/layout/AppShell';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppConfirmDialog } from '@/components/ui/AppConfirmDialog';
import { AppEmptyState } from '@/components/ui/AppEmptyState';
import { AppPagination } from '@/components/ui/AppPagination';
import { FinanceMetricCards, type FinanceMetrics } from '@/features/finance/components/FinanceMetricCards';
import { FinanceMonthlySummary } from '@/features/finance/components/FinanceMonthlySummary';
import { FinanceDocumentLockBadge, getFinanceDocumentLockedAt } from '@/features/finance/components/FinanceDocumentLockNotice';
import { FinanceStatusBadge } from '@/features/finance/components/FinanceStatusBadge';
import { FinanceTabs } from '@/features/finance/components/FinanceTabs';
import { FinanceDocumentBuilderDrawer } from '@/features/finance/drawers/FinanceDocumentBuilderDrawer';
import { PaymentDrawer } from '@/features/finance/drawers/PaymentDrawer';
import type {
    ClientOption,
    DossierOption,
    FinanceDocument,
    FinanceDocumentType,
    FinanceMonthSummary,
    FinanceSettings,
    Payment,
    TemplateOption,
} from '@/features/finance/types';

/* FORCE_FINANCE_REDESIGN_53H */

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

type Paginated<T> = {
    data: T[] | Paginated<T>;
};

type PageProps = {
    documents?: Paginated<FinanceDocument> | FinanceDocument[];
    payments?: Paginated<Payment> | Payment[];
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

function formatMoney(value: number | null | undefined, currency = 'MAD') {
    return new Intl.NumberFormat('fr-MA', {
        style: 'currency',
        currency,
        maximumFractionDigits: 0,
    }).format(value || 0);
}

function statusClass(status: string) {
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

function documentMatches(document: FinanceDocument, query: string) {
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

function DocumentFileBadges({ document }: { document: FinanceDocument }) {
    return (
        <div className="flex flex-wrap gap-1">
            <span className={[
                'rounded-full border px-2 py-1 text-[11px] font-semibold',
                document.hasExcel ? 'border-emerald-400/25 bg-emerald-400/10 text-emerald-300' : 'border-zinc-500/30 bg-zinc-500/10 text-zinc-300',
            ].join(' ')}>
                Excel
            </span>
            <span className={[
                'rounded-full border px-2 py-1 text-[11px] font-semibold',
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
            <aside className="crm-panel p-4">
                <p className="text-sm font-semibold">Document finance</p>
                <p className="mt-2 text-sm text-[var(--crm-text-muted)]">
                    Select a quote, invoice, or receipt to see actions and totals.
                </p>
            </aside>
        );
    }

    const lockedAt = getFinanceDocumentLockedAt(document);

    return (
        <aside className="crm-panel overflow-hidden">
            <div className="border-b border-[var(--crm-border)] p-4">
                <p className="crm-eyebrow">Selected finance document</p>
                <div className="mt-2 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <h2 className="truncate text-lg font-semibold">{document.number}</h2>
                            <FinanceDocumentLockBadge document={document} compact />
                        </div>
                        <p className="text-sm text-[var(--crm-text-muted)]">{typeLabel(document.type)} · {document.dossier?.number || '-'}</p>
                    </div>

                    <span className={`shrink-0 rounded-full border px-2 py-1 text-[11px] font-semibold ${statusClass(document.status)}`}>
                        {document.status}
                    </span>
                </div>
            </div>

            <div className="space-y-5 p-5">
                <div className="grid grid-cols-2 gap-3">
                    <div className="crm-panel-soft p-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--crm-text-soft)]">Client</p>
                        <p className="mt-1 truncate text-sm font-semibold">{document.client?.name || '-'}</p>
                        <p className="truncate text-xs text-[var(--crm-text-muted)]">{document.client?.cin || '-'}</p>
                    </div>

                    <div className="crm-panel-soft p-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--crm-text-soft)]">Dossier</p>
                        <p className="mt-1 truncate text-sm font-semibold">{document.dossier?.number || '-'}</p>
                        <p className="truncate text-xs text-[var(--crm-text-muted)]">{document.dossier?.projectObject || '-'}</p>
                    </div>

                    <div className="crm-panel-soft p-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--crm-text-soft)]">Total TTC</p>
                        <p className="mt-1 truncate text-sm font-semibold text-[var(--crm-gold)]">{formatMoney(document.totalTtc, document.currency)}</p>
                        <p className="truncate text-xs text-[var(--crm-text-muted)]">HT {formatMoney(document.subtotalHt, document.currency)}</p>
                    </div>

                    <div className="crm-panel-soft p-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--crm-text-soft)]">Remaining</p>
                        <p className="mt-1 truncate text-sm font-semibold">{formatMoney(document.remainingTotal, document.currency)}</p>
                        <p className="truncate text-xs text-[var(--crm-text-muted)]">Paid {formatMoney(document.paidTotal, document.currency)}</p>
                    </div>
                </div>

                <div className="crm-panel-soft p-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--crm-text-soft)]">Files</p>
                    <div className="mt-2">
                        <DocumentFileBadges document={document} />
                    </div>
                    {lockedAt ? <p className="mt-2 text-xs text-[var(--crm-text-muted)]">Locked: {lockedAt}</p> : null}
                </div>

                <div className="grid gap-2">
                    <AppButton variant="primary" onPress={() => actions.onGeneratePdf(document)}>
                        <FileText size={15} />
                        Generate PDF
                    </AppButton>

                    <div className="grid grid-cols-2 gap-2">
                        <AppButton variant="secondary" size="sm" onPress={() => actions.onGenerateExcel(document)}>
                            <FileSpreadsheet size={14} />
                            Excel
                        </AppButton>

                        <AppButton variant="secondary" size="sm" onPress={() => actions.onEdit(document)}>
                            <Pencil size={14} />
                            Edit
                        </AppButton>
                    </div>

                    {document.type === 'quote' ? (
                        <div className="grid grid-cols-2 gap-2">
                            <AppButton variant="secondary" size="sm" onPress={() => actions.onAccept(document)}>
                                <CheckCircle2 size={14} />
                                Accept
                            </AppButton>

                            <AppButton variant="secondary" size="sm" onPress={() => actions.onConvert(document)}>
                                <ReceiptText size={14} />
                                Invoice
                            </AppButton>
                        </div>
                    ) : null}

                    {document.type === 'invoice' ? (
                        <AppButton variant="secondary" size="sm" onPress={() => actions.onPayment(document)}>
                            <WalletCards size={14} />
                            Register payment
                        </AppButton>
                    ) : null}

                    <AppButton variant="danger" size="sm" onPress={() => actions.onDelete(document)}>
                        <Trash2 size={14} />
                        Delete
                    </AppButton>
                </div>
            </div>
        </aside>
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
    const filtered = useMemo(() => documents.filter((document) => documentMatches(document, query)), [documents, query]);
    const [tablePage, setTablePage] = useState(1);
    const TABLE_PAGE_SIZE = 15;
    useEffect(() => { setTablePage(1); }, [query]);
    const pagedFiltered = useMemo(() => filtered.slice((tablePage - 1) * TABLE_PAGE_SIZE, tablePage * TABLE_PAGE_SIZE), [filtered, tablePage]);
    const selectedVisible = selected && filtered.some((document) => document.id === selected.id) ? selected : filtered[0] ?? null;

    return (
        <section className="space-y-5">
            <div className="crm-panel p-4">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                    <div>
                        <p className="text-sm font-semibold">Finance document workspace</p>
                        <p className="text-xs text-[var(--crm-text-muted)]">{filtered.length} visible document(s)</p>
                    </div>

                    <div className="crm-command-input relative w-full xl:w-[420px]">
                        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--crm-text-soft)]" />
                        <input
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder={searchPlaceholder}
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
            </div>

            <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
                <div className="crm-panel overflow-hidden">
                    <div className="app-scrollbar overflow-x-auto">
                        <table className="crm-table min-w-[1080px]">
                            <thead>
                                <tr>
                                    <th>Document</th>
                                    <th>Client / Dossier</th>
                                    <th>Status</th>
                                    <th>Total</th>
                                    <th>Paid</th>
                                    <th>Remaining</th>
                                    <th>Files</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length > 0 ? (
                                    pagedFiltered.map((document) => {
                                        const rowSelected = selectedVisible?.id === document.id;

                                        return (
                                            <tr
                                                key={document.id}
                                                className={rowSelected ? 'bg-[color-mix(in_srgb,var(--crm-gold)_8%,transparent)]' : ''}
                                                onClick={() => onSelect(document)}
                                            >
                                                <td>
                                                    <div className="flex items-center gap-3">
                                                        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[var(--crm-gold-soft)] text-[var(--crm-gold)]">
                                                            <ReceiptText size={16} />
                                                        </span>
                                                        <div className="min-w-0">
                                                            <div className="flex flex-wrap items-center gap-1.5">
                                                                <p className="max-w-[190px] truncate font-semibold text-[var(--crm-text)]">{document.number}</p>
                                                                <FinanceDocumentLockBadge document={document} compact />
                                                            </div>
                                                            <p className="text-xs text-[var(--crm-text-muted)]">{document.typeLabel || typeLabel(document.type)}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <p className="max-w-[200px] truncate font-medium text-[var(--crm-text)]">{document.client?.name || '-'}</p>
                                                    <p className="max-w-[200px] truncate text-xs text-[var(--crm-text-muted)]">{document.dossier?.number || '-'} {document.dossier?.projectObject || ''}</p>
                                                </td>
                                                <td>
                                                    <FinanceStatusBadge status={document.status} />
                                                </td>
                                                <td className="font-semibold">{formatMoney(document.totalTtc, currency)}</td>
                                                <td className="text-emerald-300">{formatMoney(document.paidTotal, currency)}</td>
                                                <td className={document.remainingTotal > 0 ? 'text-red-300' : 'text-[var(--crm-text-muted)]'}>
                                                    {formatMoney(document.remainingTotal, currency)}
                                                </td>
                                                <td>
                                                    <DocumentFileBadges document={document} />
                                                </td>
                                                <td>
                                                    <div className="flex justify-end gap-1">
                                                        <button type="button" className="crm-action-button" title="Open" onClick={(event) => { event.stopPropagation(); router.visit(`/finance/documents/${document.id}`); }}>
                                                            <Eye size={14} />
                                                        </button>
                                                        <button type="button" className="crm-action-button" title="Edit" onClick={(event) => { event.stopPropagation(); actions.onEdit(document); }}>
                                                            <Pencil size={14} />
                                                        </button>
                                                        <button type="button" className="crm-action-button" title="Generate PDF" onClick={(event) => { event.stopPropagation(); actions.onGeneratePdf(document); }}>
                                                            <FileText size={14} />
                                                        </button>
                                                        <button type="button" className="crm-action-button" title="Generate Excel" onClick={(event) => { event.stopPropagation(); actions.onGenerateExcel(document); }}>
                                                            <FileSpreadsheet size={14} />
                                                        </button>
                                                        {document.type === 'invoice' ? (
                                                            <button type="button" className="crm-action-button" title="Payment" onClick={(event) => { event.stopPropagation(); actions.onPayment(document); }}>
                                                                <WalletCards size={14} />
                                                            </button>
                                                        ) : null}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={8}>
                                            <div className="py-10 text-center">
                                                <p className="text-sm font-semibold">No finance documents found</p>
                                                <p className="mt-1 text-sm text-[var(--crm-text-muted)]">Change search or create a new document.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <FinanceDocumentDetailPanel document={selectedVisible} actions={actions} />
            </section>

            <AppPagination page={tablePage} pageSize={TABLE_PAGE_SIZE} total={filtered.length} onChange={setTablePage} />
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

    return (
        <section className="space-y-4">
            <div className="crm-panel p-3">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                    <div>
                        <p className="text-sm font-semibold">Payment workspace</p>
                        <p className="text-xs text-[var(--crm-text-muted)]">{filtered.length} visible payment(s)</p>
                    </div>

                    <div className="crm-command-input relative w-full xl:w-[420px]">
                        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--crm-text-soft)]" />
                        <input
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Search payments, invoices, clients..."
                            className="h-full w-full bg-transparent pl-9 pr-9 text-sm outline-none placeholder:text-[var(--crm-text-soft)]"
                        />
                    </div>
                </div>
            </div>

            <div className="crm-panel overflow-hidden">
                <div className="app-scrollbar overflow-x-auto">
                    <table className="crm-table min-w-[980px]">
                        <thead>
                            <tr>
                                <th>Payment</th>
                                <th>Invoice</th>
                                <th>Client</th>
                                <th>Amount</th>
                                <th>Method</th>
                                <th>Date</th>
                                <th>Receipt</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length > 0 ? (
                                pagedFiltered.map((payment) => (
                                    <tr key={payment.id}>
                                        <td className="font-semibold">{payment.paymentNumber}</td>
                                        <td>{payment.document?.number || '-'}</td>
                                        <td>{payment.client?.name || '-'}</td>
                                        <td className="font-semibold text-emerald-300">{formatMoney(payment.amount, currency)}</td>
                                        <td>{payment.method || '-'}</td>
                                        <td>{payment.paidAt || '-'}</td>
                                        <td>
                                            {payment.receipt ? (
                                                <div>
                                                    <p className="font-semibold">{payment.receipt.number}</p>
                                                    <p className="text-xs text-[var(--crm-text-muted)]">{payment.receipt.status}</p>
                                                </div>
                                            ) : (
                                                <span className="text-[var(--crm-text-muted)]">-</span>
                                            )}
                                        </td>
                                        <td>
                                            {payment.receipt ? (
                                                <div className="flex justify-end gap-1">
                                                    <button type="button" className="crm-action-button" onClick={() => onReceipt(payment.receipt?.urls.show)} title="View">
                                                        <Eye size={14} />
                                                    </button>
                                                    <button type="button" className="crm-action-button" onClick={() => onReceipt(payment.receipt?.urls.pdf || payment.receipt?.urls.download)} title="PDF">
                                                        <FileText size={14} />
                                                    </button>
                                                    <button type="button" className="crm-action-button" onClick={() => onReceipt(payment.receipt?.urls.excel)} title="Excel">
                                                        <FileSpreadsheet size={14} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-[var(--crm-text-muted)]">No receipt</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={8}>
                                        <div className="py-10 text-center">
                                            <p className="text-sm font-semibold">No payments found</p>
                                            <p className="mt-1 text-sm text-[var(--crm-text-muted)]">Register a payment from an invoice.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <AppPagination page={tablePage} pageSize={TABLE_PAGE_SIZE} total={filtered.length} onChange={setTablePage} />
        </section>
    );
}

function OverviewWorkspace({
    metrics,
    quotes,
    invoices,
    currency,
    onSelect,
}: {
    metrics: FinanceMetrics;
    quotes: FinanceDocument[];
    invoices: FinanceDocument[];
    currency: string;
    onSelect: (document: FinanceDocument) => void;
}) {
    return (
        <section className="space-y-5">
            <section className="crm-kpi-grid max-xl:grid-cols-3 max-md:grid-cols-1">
                <KpiCard label="Quotes" value={formatMoney(metrics.totalQuotes, currency)} detail="Total devis TTC" />
                <KpiCard label="Invoices" value={formatMoney(metrics.totalInvoices, currency)} detail="Total factures TTC" />
                <KpiCard label="Paid" value={formatMoney(metrics.paidTotal, currency)} detail="Collected invoices" />
                <KpiCard label="Remaining" value={formatMoney(metrics.remainingTotal, currency)} detail="Still to collect" />
                <KpiCard label="Overdue" value={formatMoney(metrics.overdueTotal, currency)} detail={`${metrics.draftCount} draft(s)`} />
            </section>

            <div className="grid gap-5 xl:grid-cols-2">
                <RecentDocuments title="Derniers devis" documents={quotes.slice(0, 6)} onSelect={onSelect} />
                <RecentDocuments title="Dernieres factures" documents={invoices.slice(0, 6)} onSelect={onSelect} />
            </div>
        </section>
    );
}

function RecentDocuments({ title, documents, onSelect }: { title: string; documents: FinanceDocument[]; onSelect: (document: FinanceDocument) => void }) {
    return (
        <div className="crm-panel overflow-hidden">
            <div className="border-b border-[var(--crm-border)] px-4 py-3">
                <h2 className="text-sm font-semibold">{title}</h2>
            </div>
            <div className="divide-y divide-[var(--crm-border)]">
                {documents.length > 0 ? documents.map((document) => (
                    <button
                        key={document.id}
                        type="button"
                        onClick={() => onSelect(document)}
                        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-[var(--crm-surface-hover)]"
                    >
                        <span className="min-w-0">
                            <span className="flex flex-wrap items-center gap-2">
                                <span className="truncate text-sm font-semibold">{document.number}</span>
                                <FinanceDocumentLockBadge document={document} compact />
                            </span>
                            <span className="block truncate text-xs text-[var(--crm-text-muted)]">{document.client?.name || '-'}</span>
                        </span>
                        <span className="shrink-0 text-sm font-semibold text-[var(--crm-gold)]">{formatMoney(document.totalTtc, document.currency)}</span>
                    </button>
                )) : (
                    <p className="p-4 text-sm text-[var(--crm-text-muted)]">Aucun document recent.</p>
                )}
            </div>
        </div>
    );
}

export default function FinanceDocumentsIndex({
    documents: rawDocuments,
    payments: rawPayments,
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
    const settings = { ...defaultSettings, ...rawSettings };
    const [activeTab, setActiveTab] = useState(filters?.tab || new URLSearchParams(window.location.search).get('tab') || 'overview');
    const [builderOpen, setBuilderOpen] = useState(false);
    const [builderMode, setBuilderMode] = useState<'create' | 'edit'>('create');
    const [builderType, setBuilderType] = useState<FinanceDocumentType>('quote');
    const [selectedDocument, setSelectedDocument] = useState<FinanceDocument | null>(documents[0] ?? null);
    const [paymentOpen, setPaymentOpen] = useState(false);
    const [paymentInvoice, setPaymentInvoice] = useState<FinanceDocument | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<FinanceDocument | null>(null);

    const quotes = useMemo(() => documents.filter((doc) => doc.type === 'quote'), [documents]);
    const invoices = useMemo(() => documents.filter((doc) => doc.type === 'invoice'), [documents]);

    const metrics: FinanceMetrics = {
        totalQuotes: rawMetrics?.totalQuotes ?? quotes.reduce((sum, doc) => sum + doc.totalTtc, 0),
        totalInvoices: rawMetrics?.totalInvoices ?? invoices.reduce((sum, doc) => sum + doc.totalTtc, 0),
        paidTotal: rawMetrics?.paidTotal ?? invoices.reduce((sum, doc) => sum + doc.paidTotal, 0),
        remainingTotal: rawMetrics?.remainingTotal ?? invoices.reduce((sum, doc) => sum + doc.remainingTotal, 0),
        overdueTotal: rawMetrics?.overdueTotal ?? invoices.filter((doc) => doc.status === 'overdue').reduce((sum, doc) => sum + doc.remainingTotal, 0),
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
                                    <div key={template.id} className="crm-panel-soft p-4">
                                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--crm-text-muted)]">{template.type}</p>
                                        <p className="mt-2 font-semibold">{template.label}</p>
                                        <p className="mt-1 text-xs text-[var(--crm-text-muted)]">{template.slug || '-'}</p>
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