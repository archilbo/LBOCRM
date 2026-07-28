import { Banknote, ExternalLink, FileText, Plus, ReceiptText, Trash2, Wallet } from 'lucide-react';
import { AppButton } from '@/components/ui/AppButton';
import { AppEmptyState } from '@/components/ui/AppEmptyState';
import { AppKpiCard } from '@/components/ui/AppKpiCard';
import { AppTableActionButton } from '@/components/ui/AppTableActionButton';
import { StatusPill } from '@/components/ui/StatusPill';
import { useTranslation } from '@/lib/i18n';
import type { ClientProjectPayment, ClientSelectedProjectWorkspace } from '@/features/clients/types';
import { FinanceDocumentActions, type FinanceDocumentActionHandlers } from '@/features/finance/components/FinanceDocumentActions';
import type { FinanceDocumentType } from '@/features/finance/types';

type ClientFinanceTabProps = {
    project: ClientSelectedProjectWorkspace | null;
    onCreateDocument: (type: FinanceDocumentType) => void;
    onCreatePayment: () => void;
    documentActions: FinanceDocumentActionHandlers;
    onOpenFinance: () => void;
    onDeletePayment: (payment: ClientProjectPayment) => void;
};

const statusColor = (status: string): 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' => {
    if (status === 'paid' || status === 'accepted') return 'success';
    if (status === 'overdue' || status === 'rejected' || status === 'cancelled') return 'danger';
    if (status === 'partially_paid' || status === 'sent') return 'warning';
    if (status === 'issued' || status === 'generated') return 'primary';

    return 'default';
};

function money(value: number, currency: string, locale: string) {
    return new Intl.NumberFormat(locale === 'fr' ? 'fr-MA' : 'en-US', {
        style: 'currency',
        currency: currency || 'MAD',
        maximumFractionDigits: 2,
    }).format(value || 0);
}

function formatDate(value: string | null, locale: string) {
    return value ? new Intl.DateTimeFormat(locale === 'fr' ? 'fr-MA' : 'en-US', { dateStyle: 'medium' }).format(new Date(value)) : '-';
}

export function ClientFinanceTab({ project, onCreateDocument, onCreatePayment, documentActions, onOpenFinance, onDeletePayment }: ClientFinanceTabProps) {
    const { t, locale } = useTranslation();

    if (!project) {
        return <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm"><AppEmptyState title={t('clients.finance.noProjectTitle')} description={t('clients.finance.noProjectDescription')} /></div>;
    }

    const currency = project.currency || 'MAD';
    const metricCards = [
        { label: t('clients.finance.quotes'), value: money(project.quotesTotal, currency, locale), detail: t('clients.finance.documentsCount', { count: project.financeDocuments.filter((document) => document.type === 'quote').length }), icon: <FileText size={16} className="text-sky-400" />, accentColor: '#38bdf8', valueClassName: 'text-sky-300' },
        { label: t('clients.finance.invoiced'), value: money(project.invoicesTotal, currency, locale), detail: t('clients.finance.invoicesTotal'), icon: <ReceiptText size={16} className="text-violet-400" />, accentColor: '#a78bfa', valueClassName: 'text-violet-300' },
        { label: t('clients.finance.paid'), value: money(project.paidTotal, currency, locale), detail: t('clients.finance.paymentsCount', { count: project.paymentsCount }), icon: <Wallet size={16} className="text-emerald-400" />, accentColor: '#34d399', valueClassName: 'text-emerald-300' },
        { label: t('clients.finance.remaining'), value: money(project.remainingTotal, currency, locale), detail: t('clients.finance.invoiceBalance'), icon: <Banknote size={16} className="text-amber-400" />, accentColor: '#fbbf24', valueClassName: 'text-amber-300' },
    ];

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">{t('clients.finance.projectEyebrow')}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                        <h2 className="truncate text-sm font-semibold text-[var(--foreground)]">{project.projectObject}</h2>
                        <span className="text-xs text-[var(--text-muted)]">{project.dossierNumber}</span>
                    </div>
                </div>
                <div className="flex flex-wrap items-center justify-end gap-1.5">
                    <AppButton isIconOnly compact variant="quiet" tooltip={t('clients.finance.openFinance')} aria-label={t('clients.finance.openFinance')} onPress={onOpenFinance}><ExternalLink size={14} /></AppButton>
                    <AppButton isIconOnly compact variant="quiet" tooltip={t('clients.finance.recordPayment')} aria-label={t('clients.finance.recordPayment')} onPress={onCreatePayment}><Wallet size={14} /></AppButton>
                    <AppButton isIconOnly compact variant="quiet" tooltip={t('clients.finance.newInvoice')} aria-label={t('clients.finance.newInvoice')} onPress={() => onCreateDocument('invoice')} isDisabled={!project.financeEligibility.canCreateInvoice}><ReceiptText size={14} /></AppButton>
                    <AppButton isIconOnly compact variant="solid" color="primary" tooltip={t('clients.finance.newQuote')} aria-label={t('clients.finance.newQuote')} onPress={() => onCreateDocument('quote')} isDisabled={!project.financeEligibility.canCreateQuote}><Plus size={14} /></AppButton>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                {metricCards.map((metric) => <AppKpiCard key={metric.label} {...metric} />)}
            </div>

            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(280px,0.85fr)]">
                <section className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
                    <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
                        <div><h3 className="text-[13px] font-semibold text-[var(--foreground)]">{t('clients.finance.financialDocuments')}</h3><p className="mt-0.5 text-[11px] text-[var(--text-muted)]">{t('clients.finance.financialDocumentsDescription')}</p></div>
                        <span className="rounded bg-[var(--surface-2)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--text-muted)]">{project.financeDocuments.length}</span>
                    </div>
                    {project.financeDocuments.length ? (
                        <div className="divide-y divide-[var(--border)]">
                            {project.financeDocuments.map((document) => (
                                <div key={document.id} className="flex flex-col gap-3 px-4 py-3 transition hover:bg-[var(--surface-2)] sm:flex-row sm:items-center">
                                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--accent)_14%,transparent)] text-[var(--accent)]"><FileText size={15} /></span>
                                    <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="font-medium text-[var(--foreground)]">{document.number}</p><StatusPill label={document.statusLabel || document.status} color={statusColor(document.status)} size="sm" /></div><p className="mt-0.5 text-[11px] text-[var(--text-muted)]">{document.typeLabel} - {t('clients.finance.issuedOn', { date: formatDate(document.issueDate, locale) })}</p></div>
                                    <div className="grid grid-cols-3 gap-3 text-right text-[11px] sm:min-w-[250px]"><div><p className="text-[var(--text-muted)]">{t('clients.finance.totalTtc')}</p><p className="mt-0.5 font-semibold text-[var(--foreground)]">{money(document.totalTtc, document.currency, locale)}</p></div><div><p className="text-[var(--text-muted)]">{t('clients.finance.paidAmount')}</p><p className="mt-0.5 font-semibold text-emerald-400">{money(document.paidTotal, document.currency, locale)}</p></div><div><p className="text-[var(--text-muted)]">{t('clients.finance.remainingAmount')}</p><p className="mt-0.5 font-semibold text-amber-400">{money(document.remainingTotal, document.currency, locale)}</p></div></div>
                                    <FinanceDocumentActions document={document} handlers={documentActions} visibleCount={2} />
                                </div>
                            ))}
                        </div>
                    ) : <div className="p-6"><AppEmptyState title={t('clients.finance.noFinancialDocuments')} description={t('clients.finance.noFinancialDocumentsDescription')} /></div>}
                </section>

                <section className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
                    <div className="border-b border-[var(--border)] px-4 py-3"><h3 className="text-[13px] font-semibold text-[var(--foreground)]">{t('clients.finance.recentPayments')}</h3><p className="mt-0.5 text-[11px] text-[var(--text-muted)]">{t('clients.finance.recentPaymentsDescription')}</p></div>
                    {project.payments.length ? (
                        <div className="divide-y divide-[var(--border)]">
                            {project.payments.map((payment) => (
                                <div key={payment.id} className="px-4 py-3">
                                    <div className="flex items-center justify-between gap-3">
                                        <p className="truncate text-[12px] font-medium text-[var(--foreground)]">{payment.paymentNumber}</p>
                                        <div className="flex shrink-0 items-center gap-2">
                                            <p className="text-[12px] font-semibold text-emerald-400">{money(payment.amount, currency, locale)}</p>
                                            {payment.canDelete ? <AppTableActionButton label={t('clients.finance.deletePayment')} tone="delete" onPress={() => onDeletePayment(payment)}><Trash2 size={13} /></AppTableActionButton> : null}
                                        </div>
                                    </div>
                                    <div className="mt-1 flex items-center justify-between gap-3 text-[11px] text-[var(--text-muted)]">
                                        <span className="truncate">{payment.documentNumber || t('clients.finance.unlinkedPayment')}</span>
                                        <span>{formatDate(payment.paidAt, locale)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : <div className="p-6"><AppEmptyState title={t('clients.finance.noPayments')} description={t('clients.finance.noPaymentsDescription')} /></div>}
                </section>
            </div>
        </div>
    );
}
