import { router } from '@inertiajs/react';
import { CalendarDays, Eye, FileText, ReceiptText, WalletCards } from 'lucide-react';
import { useMemo, useState } from 'react';
import { AppBadge } from '@/components/ui/AppBadge';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppEmptyState } from '@/components/ui/AppEmptyState';
import { FinanceStatusBadge } from '@/features/finance/components/FinanceStatusBadge';
import type { FinanceMonthDocumentRow, FinanceMonthPaymentRow, FinanceMonthSummary as FinanceMonthSummaryType } from '@/features/finance/types';

type Props = {
    months: FinanceMonthSummaryType[];
    currency: string;
};

function money(value: number, currency: string) {
    return new Intl.NumberFormat('fr-MA', {
        style: 'currency',
        currency,
        maximumFractionDigits: 0,
    }).format(value || 0);
}

function typeLabel(type: string) {
    if (type === 'quote') return 'Devis';
    if (type === 'invoice') return 'Facture';
    if (type === 'receipt') return 'Recu';

    return type;
}

function SummaryStat({ label, value, tone = 'default' }: { label: string; value: string | number; tone?: 'default' | 'success' | 'danger' | 'warning' }) {
    const toneClass = {
        default: '',
        success: 'text-emerald-300',
        danger: 'text-red-300',
        warning: 'text-amber-300',
    }[tone];

    return (
        <AppCard className="p-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">{label}</p>
            <p className={`mt-1 truncate text-sm font-semibold ${toneClass}`}>{value}</p>
        </AppCard>
    );
}

function DocumentList({ title, icon, documents, currency }: { title: string; icon: React.ReactNode; documents: FinanceMonthDocumentRow[]; currency: string }) {
    return (
        <AppCard className="p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <span className="text-[var(--accent)]">{icon}</span>
                    <h3 className="text-sm font-semibold">{title}</h3>
                </div>
                <AppBadge tone="blue">{documents.length}</AppBadge>
            </div>

            <div className="space-y-2">
                {documents.length ? documents.map((document) => (
                    <div key={document.id} className="grid gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 lg:grid-cols-[minmax(0,1fr)_160px_auto]">
                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">{document.number}</p>
                            <p className="truncate text-xs text-[var(--text-muted)]">{document.clientName || '-'} · {document.dossierNumber || '-'}</p>
                            <p className="truncate text-xs text-[var(--text-muted)]">{document.commune || '-'} {document.province ? `· ${document.province}` : ''}</p>
                        </div>

                        <div>
                            <FinanceStatusBadge status={document.status as never} />
                            <p className="mt-2 text-xs text-[var(--text-muted)]">{document.issueDate || '-'}</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                            <div className="text-right">
                                <p className="text-sm font-semibold">{money(document.totalTtc, currency)}</p>
                                <p className="text-xs text-[var(--text-muted)]">Rest: {money(document.remainingTotal, currency)}</p>
                            </div>
                            <AppButton variant="secondary" onPress={() => router.visit(`/finance/documents/${document.id}`)}>
                                <Eye size={15} />
                                Open
                            </AppButton>
                        </div>
                    </div>
                )) : (
                    <p className="text-sm text-[var(--text-muted)]">Aucun document.</p>
                )}
            </div>
        </AppCard>
    );
}

function PaymentList({ payments, currency }: { payments: FinanceMonthPaymentRow[]; currency: string }) {
    return (
        <AppCard className="p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <WalletCards size={17} className="text-[var(--accent)]" />
                    <h3 className="text-sm font-semibold">Paiements</h3>
                </div>
                <AppBadge tone="green">{payments.length}</AppBadge>
            </div>

            <div className="space-y-2">
                {payments.length ? payments.map((payment) => (
                    <div key={payment.id} className="grid gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 md:grid-cols-[minmax(0,1fr)_160px]">
                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">{payment.paymentNumber}</p>
                            <p className="truncate text-xs text-[var(--text-muted)]">{payment.clientName || '-'} · {payment.documentNumber || '-'}</p>
                            <p className="truncate text-xs text-[var(--text-muted)]">{payment.dossierNumber || '-'} · {payment.method || '-'}</p>
                        </div>
                        <div className="text-left md:text-right">
                            <p className="text-sm font-semibold text-emerald-300">{money(payment.amount, currency)}</p>
                            <p className="text-xs text-[var(--text-muted)]">{payment.paidAt || '-'}</p>
                        </div>
                    </div>
                )) : (
                    <p className="text-sm text-[var(--text-muted)]">Aucun paiement.</p>
                )}
            </div>
        </AppCard>
    );
}

export function FinanceMonthlySummary({ months, currency }: Props) {
    const [selectedKey, setSelectedKey] = useState(months[0]?.key ?? '');
    const selected = useMemo(
        () => months.find((month) => month.key === selectedKey) ?? months[0] ?? null,
        [months, selectedKey],
    );

    if (!months.length || !selected) {
        return (
            <AppEmptyState
                title="Aucune synthese mensuelle"
                description="Les devis, factures, recus et paiements apparaitront ici par mois."
            />
        );
    }

    const selectedQuotes = selected.documents.filter((document) => document.type === 'quote');
    const selectedInvoices = selected.documents.filter((document) => document.type === 'invoice');
    const selectedReceipts = selected.documents.filter((document) => document.type === 'receipt');

    return (
        <section className="space-y-5">
            <div className="grid gap-3 lg:grid-cols-3">
                {months.map((month) => {
                    const active = month.key === selected.key;

                    return (
                        <button
                            key={month.key}
                            type="button"
                            onClick={() => setSelectedKey(month.key)}
                            className={[
                                'rounded-2xl border p-4 text-left transition',
                                active
                                    ? 'border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_12%,transparent)]'
                                    : 'border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-2)]',
                            ].join(' ')}
                        >
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                    <CalendarDays size={17} className="text-[var(--accent)]" />
                                    <span className="font-semibold">{month.label}</span>
                                </div>
                                <AppBadge tone={active ? 'amber' : 'neutral'}>{month.documents.length} docs</AppBadge>
                            </div>
                            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-[var(--text-muted)]">
                                <span>Devis: {money(month.quotesTotalTtc, month.currency || currency)}</span>
                                <span>Factures: {money(month.invoicesTotalTtc, month.currency || currency)}</span>
                                <span>Payé: {money(month.paidTotal, month.currency || currency)}</span>
                                <span>Reste: {money(month.remainingTotal, month.currency || currency)}</span>
                            </div>
                        </button>
                    );
                })}
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <SummaryStat label="Devis" value={`${selected.quotesCount} · ${money(selected.quotesTotalTtc, selected.currency || currency)}`} />
                <SummaryStat label="Factures" value={`${selected.invoicesCount} · ${money(selected.invoicesTotalTtc, selected.currency || currency)}`} />
                <SummaryStat label="Recus" value={`${selected.receiptsCount} · ${money(selected.receiptsTotalTtc, selected.currency || currency)}`} />
                <SummaryStat label="Paiements" value={`${selected.paymentsCount} · ${money(selected.paidTotal, selected.currency || currency)}`} tone="success" />
                <SummaryStat label="Restant" value={money(selected.remainingTotal, selected.currency || currency)} tone="warning" />
                <SummaryStat label="En retard" value={money(selected.overdueTotal, selected.currency || currency)} tone="danger" />
                <SummaryStat label="HT" value={money(selected.subtotalHt, selected.currency || currency)} />
                <SummaryStat label="TVA" value={money(selected.taxTotal, selected.currency || currency)} />
            </div>

            <div className="grid gap-5 xl:grid-cols-2">
                <DocumentList title="Devis du mois" icon={<FileText size={17} />} documents={selectedQuotes} currency={selected.currency || currency} />
                <DocumentList title="Factures du mois" icon={<ReceiptText size={17} />} documents={selectedInvoices} currency={selected.currency || currency} />
                <DocumentList title="Recus du mois" icon={<ReceiptText size={17} />} documents={selectedReceipts} currency={selected.currency || currency} />
                <PaymentList payments={selected.payments} currency={selected.currency || currency} />
            </div>
        </section>
    );
}