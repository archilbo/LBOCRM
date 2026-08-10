import { Head, router } from '@inertiajs/react';
import { IconArrowLeft, IconCurrencyDollar, IconFileText, IconBuildingBank, IconLock, IconPercentage, IconReceipt2 } from '@tabler/icons-react';


import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { AppShell } from '@/components/layout/AppShell';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppModal } from '@/components/ui/AppModal';
import { AppKpiCard } from '@/components/ui/AppKpiCard';
import { AppPagination } from '@/components/ui/AppPagination';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { FinanceDocumentLockBadge, FinanceDocumentLockNotice } from '@/features/finance/components/FinanceDocumentLockNotice';
import { FinanceSidebarActions } from '@/features/finance/components/FinanceSidebarActions';
import { FinanceSidebarDetails } from '@/features/finance/components/FinanceSidebarDetails';
import { FinanceSidebarClientProject } from '@/features/finance/components/FinanceSidebarClientProject';
import { financeDocumentTypeLabel, financeStatusLabel } from '@/features/finance/components/FinanceStatusBadge';
import { useFinanceTablePagination } from '@/features/finance/components/useFinanceTablePagination';
import type { FinanceDocument, FinanceDocumentItem, Payment } from '@/features/finance/types';
import { formatCompactMoney } from '@/lib/currency';
import { useTranslation } from '@/lib/i18n';
import { paymentMethodLabel } from '@/features/finance/paymentMethodLabel';

type PageProps = {
    document: FinanceDocument;
};

const money = formatCompactMoney;

function dateLabel(value: string | null | undefined) {
    if (!value) {
        return '-';
    }

    return value.slice(0, 10);
}

function statusClass(status: string | undefined | null) {
    if (!status) return 'border-zinc-500/30 bg-zinc-500/10 text-zinc-300';
    if (['paid', 'accepted', 'generated', 'sent', 'issued'].includes(status)) {
        return 'border-emerald-500/25 bg-emerald-500/10 text-emerald-300';
    }

    if (['partially_paid', 'draft'].includes(status)) {
        return 'border-amber-500/25 bg-amber-500/10 text-amber-300';
    }

    if (['rejected', 'cancelled', 'overdue'].includes(status)) {
        return 'border-red-500/25 bg-red-500/10 text-red-300';
    }

    return 'border-blue-500/25 bg-blue-500/10 text-blue-300';
}

function DocumentTypeIcon({ type }: { type: string | undefined | null }) {
    if (type === 'invoice') return <IconBuildingBank size={20} />;
    if (type === 'receipt') return <IconReceipt2 size={20} />;

    return <IconFileText size={20} />;
}

const FINANCE_DOCUMENT_KPI_TONES = {
    subtotal: { icon: <IconReceipt2 size={16} className="text-zinc-400" />, accentColor: '#a1a1aa', valueClassName: 'text-zinc-300' },
    tax: { icon: <IconPercentage size={16} className="text-blue-400" />, accentColor: '#60a5fa', valueClassName: 'text-blue-300' },
    total: { icon: <IconCurrencyDollar size={16} className="text-emerald-400" />, accentColor: '#34d399', valueClassName: 'text-emerald-300' },
    remaining: { icon: <IconBuildingBank size={16} className="text-amber-400" />, accentColor: '#fbbf24', valueClassName: 'text-amber-300' },
} as const;

function EmptyState({ label }: { label: string }) {
    return (
        <div className="rounded-xl border border-dashed border-[var(--border)] bg-black/10 px-4 py-10 text-center text-sm text-[var(--text-muted)]">
            {label}
        </div>
    );
}

export default function FinanceDocumentShow({ document }: PageProps) {
    const { t } = useTranslation();
    const currency = document.currency || 'MAD';
    const items = document.items ?? [];
    const payments = document.payments ?? [];
    const itemPagination = useFinanceTablePagination(items);
    const paymentPagination = useFinanceTablePagination(payments);
    const locked = Boolean(document.lock?.isLocked ?? document.numberLocked);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    function putAction(url: string | null | undefined, successMessage: string) {
        if (!url) {
            toast.error(t('finance.documentShow.actionUnavailable'));
            return;
        }

        router.put(url, {}, {
            preserveScroll: true,
            onSuccess: () => toast.success(successMessage),
            onError: () => toast.error(t('finance.documentShow.actionFailed')),
        });
    }

    function postAction(url: string | null | undefined, successMessage: string) {
        if (!url) {
            toast.error(t('finance.documentShow.actionUnavailable'));
            return;
        }

        router.post(url, {}, {
            preserveScroll: true,
            onSuccess: () => toast.success(successMessage),
            onError: () => toast.error(t('finance.documentShow.actionFailed')),
        });
    }

    const fromTab = useMemo(() => new URLSearchParams(window.location.search).get('from') || 'overview', []);

    function download(url: string | null | undefined) {
        if (!url) {
            toast.error(t('finance.documentShow.fileUnavailable'));
            return;
        }

        window.location.href = url;
    }

    function deleteDocument() {
        if (!document.deleteUrl) return;
        setShowDeleteConfirm(true);
    }

    function confirmDelete() {
        if (!document.deleteUrl) return;
        router.delete(document.deleteUrl, {
            onSuccess: () => {
                toast.success(t('finance.documentShow.documentDeleted'));
                router.visit(`/finance/documents?tab=${fromTab}`);
            },
            onError: () => toast.error(t('finance.documentShow.documentDeleteFailed')),
        });
    }

    return (
        <ErrorBoundary>
            <Head title={document.number} />

            <AppShell
                eyebrowKey="nav.financeDocuments"
                titleKey="nav.financeDocuments"
                subtitleKey="dashboardHome.subtitle"
                action={
                    <AppButton variant="bordered" size="sm" onPress={() => router.visit(`/finance/documents?tab=${fromTab}`)}>
                        <IconArrowLeft size={14} />
                        {t('finance.documentShow.back')}
                    </AppButton>
                }
            >
                <div className="mx-auto mt-6 max-w-[1540px] space-y-5 xl:mt-8">

                    {/* ── Hero Header ── */}
                    <AppCard className="overflow-hidden p-0">
                        <div className="flex flex-col gap-5 p-5 xl:flex-row xl:items-center xl:justify-between">
                            <div className="flex min-w-0 items-start gap-4">
                                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] text-[var(--accent)]">
                                    <DocumentTypeIcon type={document.type} />
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--accent)]">{financeDocumentTypeLabel(document.type, t)}</p>
                                        <FinanceDocumentLockBadge document={document} />
                                    </div>
                                    <h1 className="mt-1 truncate text-xl font-bold text-[var(--text)]">{document.number}</h1>
                                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                                        <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusClass(document.status)}`}>
                                            {financeStatusLabel(document.status, t)}
                                        </span>
                                        <span className="inline-flex rounded-full border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-300">
                                            TVA {document.tvaRate}%
                                        </span>
                                        {locked ? (
                                            <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/25 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
                                                <IconLock size={11} />
                                                {t('finance.documentShow.locked')}
                                            </span>
                                        ) : null}
                                    </div>
                                </div>
                            </div>
                            <div className="shrink-0 text-right">
                                <p className="text-[10px] text-[var(--text-muted)]">{t('finance.documentShow.totalTtc')}</p>
                                <p className="text-3xl font-bold text-[var(--text)]">{money(document.totalTtc, currency)}</p>
                                <p className="text-[10px] text-[var(--text-muted)]">
                                    {t('finance.documentShow.remaining')}: <span className={document.remainingTotal > 0 ? 'font-semibold text-amber-300' : 'font-semibold text-emerald-400'}>
                                        {money(document.remainingTotal, currency)}
                                    </span>
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-wrap border-t border-[var(--border)] text-xs">
                            <div className="flex items-center gap-2 border-b border-[var(--border)] px-4 py-2.5 md:border-b-0 md:border-r">
                                <span className="text-[var(--text-muted)]">{t('finance.documentShow.issueDate')}</span>
                                <span className="font-semibold text-[var(--text)]">{dateLabel(document.issueDate)}</span>
                            </div>
                            <div className="flex items-center gap-2 border-b border-[var(--border)] px-4 py-2.5 md:border-b-0 md:border-r">
                                <span className="text-[var(--text-muted)]">{t('finance.documentShow.dueDate')}</span>
                                <span className="font-semibold text-[var(--text)]">{dateLabel(document.dueDate)}</span>
                            </div>
                            <div className="flex items-center gap-2 border-b border-[var(--border)] px-4 py-2.5 md:border-b-0 md:border-r">
                                <span className="text-[var(--text-muted)]">{t('finance.documentShow.validUntil')}</span>
                                <span className="font-semibold text-[var(--text)]">{dateLabel(document.validUntil)}</span>
                            </div>
                            <div className="flex items-center gap-2 border-b border-[var(--border)] px-4 py-2.5 md:border-b-0 md:border-r">
                                <span className="text-[var(--text-muted)]">{t('finance.documentShow.client')}</span>
                                <span className="font-semibold text-[var(--text)]">{document.client?.name || '-'}</span>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2.5">
                                <span className="text-[var(--text-muted)]">{t('finance.documentShow.dossier')}</span>
                                <span className="font-semibold text-[var(--text)]">{document.dossier?.number || '-'}</span>
                            </div>
                        </div>
                    </AppCard>

                    {locked ? <FinanceDocumentLockNotice document={document} /> : null}

                    {/* ── Stat Bar ── */}
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                        <AppKpiCard label={t('finance.documentShow.subtotalHt')} value={money(document.subtotalHt, currency)} detail={t('finance.documentShow.beforeTax')} icon={FINANCE_DOCUMENT_KPI_TONES.subtotal.icon} accentColor={FINANCE_DOCUMENT_KPI_TONES.subtotal.accentColor} valueClassName={FINANCE_DOCUMENT_KPI_TONES.subtotal.valueClassName} />
                        <AppKpiCard label="TVA" value={money(document.taxTotal, currency)} detail={t('finance.documentShow.taxRate', { rate: document.tvaRate })} icon={FINANCE_DOCUMENT_KPI_TONES.tax.icon} accentColor={FINANCE_DOCUMENT_KPI_TONES.tax.accentColor} valueClassName={FINANCE_DOCUMENT_KPI_TONES.tax.valueClassName} />
                        <AppKpiCard label={t('finance.documentShow.totalTtc')} value={money(document.totalTtc, currency)} detail={t('finance.documentShow.grandTotal')} icon={FINANCE_DOCUMENT_KPI_TONES.total.icon} accentColor={FINANCE_DOCUMENT_KPI_TONES.total.accentColor} valueClassName={FINANCE_DOCUMENT_KPI_TONES.total.valueClassName} />
                        <AppKpiCard
                            label={t('finance.documentShow.remaining')}
                            value={money(document.remainingTotal, currency)}
                            detail={document.remainingTotal > 0 ? t('finance.documentShow.stillToCollect') : t('finance.documentShow.fullyPaid')}
                            icon={FINANCE_DOCUMENT_KPI_TONES.remaining.icon}
                            accentColor={FINANCE_DOCUMENT_KPI_TONES.remaining.accentColor}
                            valueClassName={document.remainingTotal > 0 ? 'text-amber-300' : 'text-emerald-300'}
                        />
                    </div>

                    {/* ── Body: 2-column ── */}
                    <section className="grid min-w-0 items-start gap-5 xl:grid-cols-[1fr_360px]">
                        <main className="grid min-w-0 gap-5">

                            {/* Document Lines */}
                            <AppCard className="overflow-hidden p-0">
                                <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
                                    <h2 className="text-xs font-semibold">{t('finance.documentShow.documentLines')}</h2>
                                    <span className="text-[10px] text-[var(--text-muted)]">{t('finance.documentShow.itemsCount', { count: items.length })}</span>
                                </div>
                                {items.length > 0 ? (
                                    <div className="finance-table-shell">
                                        <table className="finance-table min-w-[620px] text-xs">
                                            <thead>
                                                <tr className="border-b border-[var(--border)] text-left text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                                                    <th className="px-4 py-2.5">{t('finance.documentShow.item')}</th>
                                                    <th className="px-4 py-2.5">{t('finance.documentShow.quantity')}</th>
                                                    <th className="px-4 py-2.5">{t('finance.documentShow.unit')}</th>
                                                    <th className="px-4 py-2.5">{t('finance.documentShow.price')}</th>
                                                    <th className="px-4 py-2.5 text-right">{t('finance.documentShow.total')}</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {itemPagination.paginatedRows.map((item: FinanceDocumentItem) => (
                                                    <tr key={item.id ?? item.position} className="border-b border-[var(--border)] transition hover:bg-[var(--surface-2)] last:border-0">
                                                        <td className="px-4 py-2.5">
                                                            <p className="max-w-[320px] truncate font-semibold text-[var(--text)]">{item.title}</p>
                                                            {item.description ? <p className="max-w-[380px] truncate text-[10px] text-[var(--text-muted)]">{item.description}</p> : null}
                                                        </td>
                                                        <td className="px-4 py-2.5 text-[var(--text)]">{item.quantity}</td>
                                                        <td className="px-4 py-2.5 text-[var(--text-muted)]">{item.unit || '-'}</td>
                                                        <td className="px-4 py-2.5 text-[var(--text-muted)]">{money(item.unitPrice, currency)}</td>
                                                        <td className="px-4 py-2.5 text-right font-semibold text-[var(--accent)]">{money(item.totalTtc, currency)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        <AppPagination page={itemPagination.page} pageSize={itemPagination.pageSize} total={itemPagination.total} onChange={itemPagination.setPage} variant="reference" />
                                    </div>
                                ) : (
                                    <div className="px-4 py-8"><EmptyState label={t('finance.documentShow.noItems')} /></div>
                                )}
                            </AppCard>

                            {/* Payments */}
                            <AppCard className="overflow-hidden p-0">
                                <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
                                    <h2 className="text-xs font-semibold">{t('finance.documentShow.payments')}</h2>
                                    <span className="text-[10px] text-[var(--text-muted)]">{t('finance.documentShow.paymentsCount', { count: payments.length })}</span>
                                </div>
                                {payments.length > 0 ? (
                                    <div className="finance-table-shell">
                                        <table className="finance-table min-w-[520px] text-xs">
                                            <thead>
                                                <tr className="border-b border-[var(--border)] text-left text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                                                    <th className="px-4 py-2.5">{t('finance.documentShow.reference')}</th>
                                                    <th className="px-4 py-2.5">{t('finance.documentShow.method')}</th>
                                                    <th className="px-4 py-2.5">{t('finance.documentShow.date')}</th>
                                                    <th className="px-4 py-2.5 text-right">{t('finance.documentShow.amount')}</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {paymentPagination.paginatedRows.map((payment: Payment) => (
                                                    <tr key={payment.id} className="border-b border-[var(--border)] transition hover:bg-[var(--surface-2)] last:border-0">
                                                        <td className="px-4 py-2.5 font-semibold text-[var(--text)]">{payment.paymentNumber}</td>
                                                        <td className="px-4 py-2.5 text-[var(--text-muted)]">{paymentMethodLabel(payment.method, t)}{payment.reference ? ` · ${payment.reference}` : ''}</td>
                                                        <td className="px-4 py-2.5 text-[var(--text-muted)]">{dateLabel(payment.paidAt)}</td>
                                                        <td className="px-4 py-2.5 text-right font-semibold text-emerald-400">{money(payment.amount, currency)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        <AppPagination page={paymentPagination.page} pageSize={paymentPagination.pageSize} total={paymentPagination.total} onChange={paymentPagination.setPage} variant="reference" />
                                    </div>
                                ) : (
                                    <div className="px-4 py-8"><EmptyState label={t('finance.documentShow.noPayments')} /></div>
                                )}
                            </AppCard>

                            {/* Notes + Terms */}
                            <AppCard className="p-4">
                                <h2 className="text-xs font-semibold">{t('finance.documentShow.notesAndTerms')}</h2>
                                <div className="mt-3 grid gap-3 xl:grid-cols-2">
                                    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5">
                                        <p className="text-[10px] font-semibold text-[var(--text-muted)]">{t('finance.documentShow.notes')}</p>
                                        <p className="mt-1.5 text-xs leading-5 text-[var(--text)]">{document.notes || t('finance.documentShow.noNotes')}</p>
                                    </div>
                                    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5">
                                        <p className="text-[10px] font-semibold text-[var(--text-muted)]">{t('finance.documentShow.terms')}</p>
                                        <p className="mt-1.5 text-xs leading-5 text-[var(--text)]">{document.terms || t('finance.documentShow.noTerms')}</p>
                                    </div>
                                </div>
                            </AppCard>
                        </main>

                        {/* ── Sidebar ── */}
                        <aside className="grid min-w-0 gap-4 xl:sticky xl:top-24">
                            <FinanceSidebarActions
                                document={document}
                                isProcessing={false}
                                onGenerate={() => putAction(document.generateUrl, t('finance.documentShow.documentGenerated'))}
                                onView={() => document.viewUrl && window.open(document.viewUrl, '_blank', 'noopener,noreferrer')}
                                onPrint={() => document.printUrl && window.open(document.printUrl, '_blank', 'noopener,noreferrer')}
                                onDownloadPdf={() => document.pdfDownloadUrl ? download(document.pdfDownloadUrl) : putAction(document.generatePdfUrl, t('finance.documentShow.pdfGenerated'))}
                                onDownloadExcel={() => document.excelDownloadUrl ? download(document.excelDownloadUrl) : putAction(document.generateExcelUrl, t('finance.documentShow.excelGenerated'))}
                                onAcceptQuote={() => putAction(document.acceptUrl, t('finance.documentShow.quoteAccepted'))}
                                onRejectQuote={() => putAction(document.rejectUrl, t('finance.documentShow.quoteRejected'))}
                                onConvertToInvoice={() => postAction(document.convertToInvoiceUrl, t('finance.documentShow.invoiceCreated'))}
                                onCancel={() => putAction(document.cancelUrl, t('finance.documentShow.documentCancelled'))}
                                onDelete={deleteDocument}
                            />
                            <FinanceSidebarDetails document={document} />
                            <FinanceSidebarClientProject document={document} />
                        </aside>
                    </section>
                </div>
            </AppShell>

            <AppModal
                isOpen={showDeleteConfirm}
                onOpenChange={setShowDeleteConfirm}
                title={t('finance.documentShow.deleteTitle')}
                size="sm"
            >
                <p className="mb-5 text-sm text-[var(--text-muted)]">
                    {t('finance.documentShow.deleteDescription', { number: document.number })}
                </p>
                <div className="flex justify-end gap-2">
                    <AppButton variant="bordered" onPress={() => setShowDeleteConfirm(false)}>{t('finance.documentShow.cancel')}</AppButton>
                    <AppButton variant="danger" onPress={confirmDelete}>{t('finance.actions.delete')}</AppButton>
                </div>
            </AppModal>
        </ErrorBoundary>
    );
}
