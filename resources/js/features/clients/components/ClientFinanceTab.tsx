import { Banknote, ExternalLink, FileText, Plus, ReceiptText, Trash2, Wallet } from 'lucide-react';
import { AppButton } from '@/components/ui/AppButton';
import { AppEmptyState } from '@/components/ui/AppEmptyState';
import { AppKpiCard } from '@/components/ui/AppKpiCard';
import { AppTableActionButton } from '@/components/ui/AppTableActionButton';
import { StatusPill } from '@/components/ui/StatusPill';
import { formatCompactMoney } from '@/lib/currency';
import { useTranslation } from '@/lib/i18n';
import { usePermissions } from '@/hooks/usePermissions';
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

function formatDate(value: string | null, locale: string) {
    return value ? new Intl.DateTimeFormat(locale === 'fr' ? 'fr-MA' : 'en-US', { dateStyle: 'medium' }).format(new Date(value)) : '-';
}

export function ClientFinanceTab({ project, onCreateDocument, onCreatePayment, documentActions, onOpenFinance, onDeletePayment }: ClientFinanceTabProps) {
    const { t, locale } = useTranslation();
    const { can } = usePermissions();

    if (!project) {
        return <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm"><AppEmptyState title={t('clients.finance.noProjectTitle')} description={t('clients.finance.noProjectDescription')} /></div>;
    }

    const currency = project.currency || 'MAD';
    const metricCards = [
        { label: t('clients.finance.quotes'), value: formatCompactMoney(project.quotesTotal, currency), detail: t('clients.finance.documentsCount', { count: project.financeDocuments.filter((document) => document.type === 'quote').length }), icon: <FileText size={16} className="text-sky-400" />, accentColor: '#38bdf8', valueClassName: 'text-sky-300' },
        { label: t('clients.finance.invoiced'), value: formatCompactMoney(project.invoicesTotal, currency), detail: t('clients.finance.invoicesTotal'), icon: <ReceiptText size={16} className="text-violet-400" />, accentColor: '#a78bfa', valueClassName: 'text-violet-300' },
        { label: t('clients.finance.paid'), value: formatCompactMoney(project.paidTotal, currency), detail: t('clients.finance.paymentsCount', { count: project.paymentsCount }), icon: <Wallet size={16} className="text-emerald-400" />, accentColor: '#34d399', valueClassName: 'text-emerald-300' },
        { label: t('clients.finance.remaining'), value: formatCompactMoney(project.remainingTotal, currency), detail: t('clients.finance.invoiceBalance'), icon: <Banknote size={16} className="text-amber-400" />, accentColor: '#fbbf24', valueClassName: 'text-amber-300' },
    ];

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-3 rounded-xl px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">{t('clients.finance.projectEyebrow')}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                        <h2 className="truncate text-sm font-semibold text-[var(--foreground)]">{project.projectObject}</h2>
                        <span className="text-xs text-[var(--text-muted)]">{project.dossierNumber}</span>
                    </div>
                </div>
                <div className="flex flex-wrap items-center justify-end gap-1.5">
                    <AppButton isIconOnly compact variant="quiet" tooltip={t('clients.finance.openFinance')} aria-label={t('clients.finance.openFinance')} onPress={onOpenFinance}><ExternalLink size={14} /></AppButton>
                    {can('finance.payments.create') ? <AppButton isIconOnly compact variant="quiet" tooltip={t('clients.finance.recordPayment')} aria-label={t('clients.finance.recordPayment')} onPress={onCreatePayment}><Wallet size={14} /></AppButton> : null}
                    {can('finance.documents.create') ? <AppButton isIconOnly compact variant="quiet" tooltip={t('clients.finance.newInvoice')} aria-label={t('clients.finance.newInvoice')} onPress={() => onCreateDocument('invoice')} isDisabled={!project.financeEligibility.canCreateInvoice}><ReceiptText size={14} /></AppButton> : null}
                    {can('finance.documents.create') ? <AppButton isIconOnly compact variant="solid" color="primary" tooltip={t('clients.finance.newQuote')} aria-label={t('clients.finance.newQuote')} onPress={() => onCreateDocument('quote')} isDisabled={!project.financeEligibility.canCreateQuote}><Plus size={14} /></AppButton> : null}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                {metricCards.map((metric) => <AppKpiCard key={metric.label} {...metric} />)}
            </div>

            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(280px,0.85fr)]">
                <section className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
                    <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
                        <div><h3 className="text-[12px] font-semibold text-[var(--foreground)]">{t('clients.finance.financialDocuments')}</h3><p className="mt-0.5 text-[10px] text-[var(--text-muted)]">{t('clients.finance.financialDocumentsDescription')}</p></div>
                        <span className="rounded bg-[var(--surface-2)] px-1.5 py-0.5 text-[9px] font-semibold text-[var(--text-muted)]">{project.financeDocuments.length}</span>
                    </div>
                    {project.financeDocuments.length ? (
                        <div className="divide-y divide-[var(--border)]">
                            {project.financeDocuments.map((document) => (
                                <div key={document.id} className="flex flex-col gap-3 px-4 py-3 transition hover:bg-[var(--surface-2)] sm:flex-row sm:items-center">
                                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--accent)_14%,transparent)] text-[var(--accent)]"><FileText size={15} /></span>
                                    <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="font-medium text-[var(--foreground)]">{document.number}</p><StatusPill label={document.statusLabel || document.status} color={statusColor(document.status)} size="sm" /></div><p className="mt-0.5 text-[10px] text-[var(--text-muted)]">{document.typeLabel} - {t('clients.finance.issuedOn', { date: formatDate(document.issueDate, locale) })}</p></div>
                                    <div className="grid grid-cols-3 gap-3 text-right text-[10px] sm:min-w-[250px]"><div><p className="text-[var(--text-muted)]">{t('clients.finance.totalTtc')}</p><p className="mt-0.5 font-semibold text-[var(--foreground)]">{formatCompactMoney(document.totalTtc, document.currency)}</p></div><div><p className="text-[var(--text-muted)]">{t('clients.finance.paidAmount')}</p><p className="mt-0.5 font-semibold text-emerald-400">{formatCompactMoney(document.paidTotal, document.currency)}</p></div><div><p className="text-[var(--text-muted)]">{t('clients.finance.remainingAmount')}</p><p className="mt-0.5 font-semibold text-amber-400">{formatCompactMoney(document.remainingTotal, document.currency)}</p></div></div>
                                    <FinanceDocumentActions document={document} handlers={documentActions} visibleCount={2} buttonClassName="border-0 bg-transparent" />
                                </div>
                            ))}
                        </div>
                    ) : <div className="p-6"><AppEmptyState title={t('clients.finance.noFinancialDocuments')} description={t('clients.finance.noFinancialDocumentsDescription')} /></div>}
                </section>

                <section className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
                    <div className="border-b border-[var(--border)] px-4 py-3"><h3 className="text-[12px] font-semibold text-[var(--foreground)]">{t('clients.finance.recentPayments')}</h3><p className="mt-0.5 text-[10px] text-[var(--text-muted)]">{t('clients.finance.recentPaymentsDescription')}</p></div>
                    {project.payments.length ? (
                        <div className="divide-y divide-[var(--border)]">
                            {project.payments.map((payment) => (
                                <div key={payment.id} className="px-4 py-3">
                                    <div className="flex items-center justify-between gap-3">
                                        <p className="truncate text-[11px] font-medium text-[var(--foreground)]">{payment.paymentNumber}</p>
                                        <div className="flex shrink-0 items-center gap-2">
                                            <p className="text-[11px] font-semibold text-emerald-400">{formatCompactMoney(payment.amount, currency)}</p>
                                            {can('finance.payments.reverse') && payment.canDelete ? <AppTableActionButton label={t('clients.finance.deletePayment')} tone="delete" onPress={() => onDeletePayment(payment)}><Trash2 size={13} /></AppTableActionButton> : null}
                                        </div>
                                    </div>
                                    <div className="mt-1 flex items-center justify-between gap-3 text-[10px] text-[var(--text-muted)]">
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
