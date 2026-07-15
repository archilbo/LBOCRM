import { Head, router } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    CheckCircle2,
    Download,
    FileSpreadsheet,
    FileText,
    Landmark,
    LockKeyhole,
    ReceiptText,
    RotateCcw,
    ShieldCheck,
    Trash2,
    UserRound,
    XCircle,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { AppShell } from '@/components/layout/AppShell';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppModal } from '@/components/ui/AppModal';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { FinanceDocumentLockBadge, FinanceDocumentLockNotice } from '@/features/finance/components/FinanceDocumentLockNotice';
import type { FinanceDocument, FinanceDocumentItem, Payment } from '@/features/finance/types';

type PageProps = {
    document: FinanceDocument;
};

function money(value: number, currency = 'MAD') {
    return `${Number(value || 0).toLocaleString('fr-MA')} ${currency || 'MAD'}`;
}

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

function typeIcon(type: string | undefined | null): LucideIcon {
    if (type === 'invoice') return Landmark;
    if (type === 'receipt') return ReceiptText;
    if (type === 'quote') return FileText;
    return FileText;
}

function StatBar({ values }: {
    values: { label: string; value: string; hint: string; color: string }[];
}) {
    return (
        <div className="grid grid-cols-2 divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] bg-[var(--surface)] md:grid-cols-4 md:divide-x md:divide-y-0">
            {values.map((v) => (
                <div key={v.label} className="px-4 py-3">
                    <p className="text-[11px] text-[var(--text-muted)]">{v.label}</p>
                    <p className={`mt-0.5 text-lg font-bold ${v.color}`}>{v.value}</p>
                    <p className="mt-0.5 text-[10px] text-[var(--text-muted)]">{v.hint}</p>
                </div>
            ))}
        </div>
    );
}

function EmptyState({ label }: { label: string }) {
    return (
        <div className="rounded-xl border border-dashed border-[var(--border)] bg-black/10 px-4 py-10 text-center text-sm text-[var(--text-muted)]">
            {label}
        </div>
    );
}

export default function FinanceDocumentShow({ document }: PageProps) {
    const Icon = typeIcon(document.type);
    const currency = document.currency || 'MAD';
    const items = document.items ?? [];
    const payments = document.payments ?? [];
    const locked = Boolean(document.lock?.isLocked ?? document.numberLocked);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    function putAction(url: string | null | undefined, successMessage: string) {
        if (!url) {
            toast.error('Action is not available.');
            return;
        }

        router.put(url, {}, {
            preserveScroll: true,
            onSuccess: () => toast.success(successMessage),
            onError: () => toast.error('Action failed.'),
        });
    }

    function postAction(url: string | null | undefined, successMessage: string) {
        if (!url) {
            toast.error('Action is not available.');
            return;
        }

        router.post(url, {}, {
            preserveScroll: true,
            onSuccess: () => toast.success(successMessage),
            onError: () => toast.error('Action failed.'),
        });
    }

    function download(url: string | null | undefined) {
        if (!url) {
            toast.error('File is not available.');
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
                toast.success('Document deleted.');
                router.visit('/finance/documents');
            },
            onError: () => toast.error('Document could not be deleted.'),
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
                    <div className="flex items-center gap-1.5">
                        <AppButton variant="bordered" size="sm" onPress={() => router.visit('/finance/documents')}>
                            <ArrowLeft size={14} />
                            Back
                        </AppButton>
                        <AppButton variant="primary" size="sm" onPress={() => putAction(document.generateUrl, 'Document generated.')}>
                            <RotateCcw size={14} />
                            Regenerate
                        </AppButton>
                    </div>
                }
            >
                <div className="mx-auto mt-6 max-w-[1540px] space-y-5 xl:mt-8">

                    {/* ── Hero Header ── */}
                    <AppCard className="overflow-hidden p-0">
                        <div className="flex flex-col gap-5 p-5 xl:flex-row xl:items-center xl:justify-between">
                            <div className="flex min-w-0 items-start gap-4">
                                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] text-[var(--accent)]">
                                    <Icon size={20} />
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--accent)]">{document.typeLabel}</p>
                                        <FinanceDocumentLockBadge document={document} />
                                    </div>
                                    <h1 className="mt-1 truncate text-xl font-bold text-[var(--text)]">{document.number}</h1>
                                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                                        <span className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${statusClass(document.status)}`}>
                                            {document.status?.replace(/_/g, ' ') || document.status}
                                        </span>
                                        <span className="inline-flex rounded-full border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-[11px] font-semibold text-blue-300">
                                            TVA {document.tvaRate}%
                                        </span>
                                        {locked ? (
                                            <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/25 bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-300">
                                                <LockKeyhole size={11} />
                                                Locked
                                            </span>
                                        ) : null}
                                    </div>
                                </div>
                            </div>
                            <div className="shrink-0 text-right">
                                <p className="text-[11px] text-[var(--text-muted)]">Total TTC</p>
                                <p className="text-3xl font-bold text-[var(--text)]">{money(document.totalTtc, currency)}</p>
                                <p className="text-[11px] text-[var(--text-muted)]">
                                    Remaining: <span className={document.remainingTotal > 0 ? 'font-semibold text-amber-300' : 'font-semibold text-emerald-400'}>
                                        {money(document.remainingTotal, currency)}
                                    </span>
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-wrap border-t border-[var(--border)] text-xs">
                            <div className="flex items-center gap-2 border-b border-[var(--border)] px-4 py-2.5 md:border-b-0 md:border-r">
                                <span className="text-[var(--text-muted)]">Issue</span>
                                <span className="font-semibold text-[var(--text)]">{dateLabel(document.issueDate)}</span>
                            </div>
                            <div className="flex items-center gap-2 border-b border-[var(--border)] px-4 py-2.5 md:border-b-0 md:border-r">
                                <span className="text-[var(--text-muted)]">Due</span>
                                <span className="font-semibold text-[var(--text)]">{dateLabel(document.dueDate)}</span>
                            </div>
                            <div className="flex items-center gap-2 border-b border-[var(--border)] px-4 py-2.5 md:border-b-0 md:border-r">
                                <span className="text-[var(--text-muted)]">Valid</span>
                                <span className="font-semibold text-[var(--text)]">{dateLabel(document.validUntil)}</span>
                            </div>
                            <div className="flex items-center gap-2 border-b border-[var(--border)] px-4 py-2.5 md:border-b-0 md:border-r">
                                <span className="text-[var(--text-muted)]">Client</span>
                                <span className="font-semibold text-[var(--text)]">{document.client?.name || '-'}</span>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2.5">
                                <span className="text-[var(--text-muted)]">Dossier</span>
                                <span className="font-semibold text-[var(--text)]">{document.dossier?.number || '-'}</span>
                            </div>
                        </div>
                    </AppCard>

                    {locked ? <FinanceDocumentLockNotice document={document} /> : null}

                    {/* ── Stat Bar ── */}
                    <StatBar values={[
                        { label: 'Subtotal HT', value: money(document.subtotalHt, currency), hint: 'Before TVA', color: 'text-[var(--text)]' },
                        { label: 'TVA', value: money(document.taxTotal, currency), hint: `${document.tvaRate}% tax rate`, color: 'text-blue-400' },
                        { label: 'Total TTC', value: money(document.totalTtc, currency), hint: 'Grand total', color: 'text-[var(--accent)]' },
                        {
                            label: 'Remaining',
                            value: money(document.remainingTotal, currency),
                            hint: document.remainingTotal > 0 ? 'Still to collect' : 'Fully paid',
                            color: document.remainingTotal > 0 ? 'text-amber-400' : 'text-emerald-400',
                        },
                    ]} />

                    {/* ── Body: 2-column ── */}
                    <section className="grid min-w-0 items-start gap-5 xl:grid-cols-[1fr_360px]">
                        <main className="grid min-w-0 gap-5">

                            {/* Document Lines */}
                            <AppCard className="overflow-hidden p-0">
                                <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
                                    <h2 className="text-xs font-semibold">Document lines</h2>
                                    <span className="text-[11px] text-[var(--text-muted)]">{items.length} item(s)</span>
                                </div>
                                {items.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-xs">
                                            <thead>
                                                <tr className="border-b border-[var(--border)] text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                                                    <th className="px-4 py-2.5">Item</th>
                                                    <th className="px-4 py-2.5">Qty</th>
                                                    <th className="px-4 py-2.5">Unit</th>
                                                    <th className="px-4 py-2.5">Price</th>
                                                    <th className="px-4 py-2.5 text-right">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {items.map((item: FinanceDocumentItem) => (
                                                    <tr key={item.id ?? item.position} className="border-b border-[var(--border)] transition hover:bg-[var(--surface-2)] last:border-0">
                                                        <td className="px-4 py-2.5">
                                                            <p className="max-w-[320px] truncate font-semibold text-[var(--text)]">{item.title}</p>
                                                            {item.description ? <p className="max-w-[380px] truncate text-[11px] text-[var(--text-muted)]">{item.description}</p> : null}
                                                        </td>
                                                        <td className="px-4 py-2.5 text-[var(--text)]">{item.quantity}</td>
                                                        <td className="px-4 py-2.5 text-[var(--text-muted)]">{item.unit || '-'}</td>
                                                        <td className="px-4 py-2.5 text-[var(--text-muted)]">{money(item.unitPrice, currency)}</td>
                                                        <td className="px-4 py-2.5 text-right font-semibold text-[var(--accent)]">{money(item.totalTtc, currency)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="px-4 py-8"><EmptyState label="No items in this document." /></div>
                                )}
                            </AppCard>

                            {/* Payments */}
                            <AppCard className="overflow-hidden p-0">
                                <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
                                    <h2 className="text-xs font-semibold">Payments</h2>
                                    <span className="text-[11px] text-[var(--text-muted)]">{payments.length} payment(s)</span>
                                </div>
                                {payments.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-xs">
                                            <thead>
                                                <tr className="border-b border-[var(--border)] text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                                                    <th className="px-4 py-2.5">Reference</th>
                                                    <th className="px-4 py-2.5">Method</th>
                                                    <th className="px-4 py-2.5">Date</th>
                                                    <th className="px-4 py-2.5 text-right">Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {payments.map((payment: Payment) => (
                                                    <tr key={payment.id} className="border-b border-[var(--border)] transition hover:bg-[var(--surface-2)] last:border-0">
                                                        <td className="px-4 py-2.5 font-semibold text-[var(--text)]">{payment.paymentNumber}</td>
                                                        <td className="px-4 py-2.5 text-[var(--text-muted)]">{payment.method || '-'}{payment.reference ? ` / ${payment.reference}` : ''}</td>
                                                        <td className="px-4 py-2.5 text-[var(--text-muted)]">{dateLabel(payment.paidAt)}</td>
                                                        <td className="px-4 py-2.5 text-right font-semibold text-emerald-400">{money(payment.amount, currency)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="px-4 py-8"><EmptyState label="No payments recorded for this document." /></div>
                                )}
                            </AppCard>

                            {/* Notes + Terms */}
                            <AppCard className="p-4">
                                <h2 className="text-xs font-semibold">Notes &amp; terms</h2>
                                <div className="mt-3 grid gap-3 xl:grid-cols-2">
                                    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5">
                                        <p className="text-[11px] font-semibold text-[var(--text-muted)]">Notes</p>
                                        <p className="mt-1.5 text-xs leading-5 text-[var(--text)]">{document.notes || 'No notes saved.'}</p>
                                    </div>
                                    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5">
                                        <p className="text-[11px] font-semibold text-[var(--text-muted)]">Terms</p>
                                        <p className="mt-1.5 text-xs leading-5 text-[var(--text)]">{document.terms || 'No terms saved.'}</p>
                                    </div>
                                </div>
                            </AppCard>
                        </main>

                        {/* ── Sidebar ── */}
                        <aside className="grid min-w-0 gap-4 xl:sticky xl:top-24">

                            {/* Actions */}
                            <AppCard className="overflow-hidden p-0">
                                <div className="flex items-center gap-2 border-b border-[var(--border)] px-4 py-3">
                                    <ShieldCheck size={14} className="text-[var(--accent)]" />
                                    <h2 className="text-xs font-semibold">Actions</h2>
                                </div>
                                <div className="divide-y divide-[var(--border)]">

                                    {/* Generate + quick downloads */}
                                    <div className="p-3">
                                        <AppButton variant="primary" className="w-full" size="sm" onPress={() => putAction(document.generateUrl, 'Document generated.')}>
                                            <RotateCcw size={14} />
                                            Generate documents
                                        </AppButton>
                                        <div className="mt-2 grid grid-cols-2 gap-2">
                                            <AppButton
                                                variant="flat"
                                                size="sm"
                                                isDisabled={!document.pdfDownloadUrl}
                                                onPress={() => document.pdfDownloadUrl ? download(document.pdfDownloadUrl) : putAction(document.generatePdfUrl, 'PDF generated.')}
                                                className="h-auto flex-col gap-0 py-2 leading-tight"
                                            >
                                                <FileText size={15} />
                                                <span className="text-[11px] font-semibold">PDF</span>
                                                <span className="text-[10px] font-normal text-[var(--text-muted)]">{document.hasPdf ? 'Download' : 'Generate'}</span>
                                            </AppButton>
                                            <AppButton
                                                variant="flat"
                                                size="sm"
                                                isDisabled={!document.excelDownloadUrl}
                                                onPress={() => document.excelDownloadUrl ? download(document.excelDownloadUrl) : putAction(document.generateExcelUrl, 'Excel generated.')}
                                                className="h-auto flex-col gap-0 py-2 leading-tight"
                                            >
                                                <FileSpreadsheet size={15} />
                                                <span className="text-[11px] font-semibold">Excel</span>
                                                <span className="text-[10px] font-normal text-[var(--text-muted)]">{document.hasExcel ? 'Download' : 'Generate'}</span>
                                            </AppButton>
                                        </div>
                                    </div>

                                    {/* Quote workflow — only for quotes */}
                                    {document.acceptUrl || document.rejectUrl ? (
                                        <div className="space-y-1.5 p-3">
                                            {document.acceptUrl ? (
                                                <AppButton variant="solid" color="success" className="w-full" size="sm" onPress={() => putAction(document.acceptUrl, 'Quote accepted.')}>
                                                    <CheckCircle2 size={14} />
                                                    Accept quote
                                                </AppButton>
                                            ) : null}
                                            {document.rejectUrl ? (
                                                <AppButton variant="solid" color="danger" className="w-full" size="sm" onPress={() => putAction(document.rejectUrl, 'Quote rejected.')}>
                                                    <XCircle size={14} />
                                                    Reject quote
                                                </AppButton>
                                            ) : null}
                                        </div>
                                    ) : null}
                                    {document.convertToInvoiceUrl ? (
                                        <div className="p-3">
                                            <AppButton variant="flat" className="w-full text-[var(--accent)]" size="sm" onPress={() => postAction(document.convertToInvoiceUrl, 'Invoice created.')}>
                                                <Landmark size={14} />
                                                Convert to invoice
                                            </AppButton>
                                        </div>
                                    ) : null}

                                    {/* Cancel & Delete */}
                                    <div className="flex gap-2 p-3">
                                        <AppButton variant="flat" className="flex-1 text-amber-400" size="sm" onPress={() => putAction(document.cancelUrl, 'Document cancelled.')}>
                                            <RotateCcw size={13} />
                                            Cancel
                                        </AppButton>
                                        <AppButton variant="solid" color="danger" className="flex-1" size="sm" onPress={deleteDocument}>
                                            <Trash2 size={13} />
                                            Delete
                                        </AppButton>
                                    </div>
                                </div>
                            </AppCard>

                            {/* Details */}
                            <AppCard className="overflow-hidden p-0">
                                <div className="flex items-center gap-2 border-b border-[var(--border)] px-4 py-3">
                                    <ReceiptText size={14} className="text-[var(--text-muted)]" />
                                    <h2 className="text-xs font-semibold">Details</h2>
                                </div>
                                <div className="divide-y divide-[var(--border)] text-xs">
                                    <div className="flex items-center justify-between px-4 py-2.5">
                                        <span className="text-[var(--text-muted)]">Type</span>
                                        <span className="font-semibold text-[var(--text)]">{document.typeLabel}</span>
                                    </div>
                                    <div className="flex items-center justify-between px-4 py-2.5">
                                        <span className="text-[var(--text-muted)]">Status</span>
                                        <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusClass(document.status)}`}>
                                            {document.status?.replace(/_/g, ' ') || document.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between px-4 py-2.5">
                                        <span className="text-[var(--text-muted)]">PDF</span>
                                        <span className={`font-semibold ${document.hasPdf ? 'text-emerald-400' : 'text-[var(--text-muted)]'}`}>
                                            {document.hasPdf ? 'Ready' : 'Missing'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between px-4 py-2.5">
                                        <span className="text-[var(--text-muted)]">Excel</span>
                                        <span className={`font-semibold ${document.hasExcel ? 'text-emerald-400' : 'text-[var(--text-muted)]'}`}>
                                            {document.hasExcel ? 'Ready' : 'Missing'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between px-4 py-2.5">
                                        <span className="text-[var(--text-muted)]">Generated</span>
                                        <span className="font-semibold text-[var(--text)]">{dateLabel(document.generatedAt)}</span>
                                    </div>
                                    <div className="flex items-center justify-between px-4 py-2.5">
                                        <span className="text-[var(--text-muted)]">Created</span>
                                        <span className="font-semibold text-[var(--text)]">{dateLabel(document.createdAt)}</span>
                                    </div>
                                </div>
                            </AppCard>

                            {/* Client & Project */}
                            <AppCard className="overflow-hidden p-0">
                                <div className="flex items-center gap-2 border-b border-[var(--border)] px-4 py-3">
                                    <UserRound size={14} className="text-[var(--text-muted)]" />
                                    <h2 className="text-xs font-semibold">Client &amp; project</h2>
                                </div>
                                <div className="divide-y divide-[var(--border)] text-xs">
                                    <div className="flex items-center justify-between px-4 py-2.5">
                                        <span className="text-[var(--text-muted)]">Client</span>
                                        <span className="font-semibold text-[var(--text)]">{document.client?.name || '-'}</span>
                                    </div>
                                    <div className="flex items-center justify-between px-4 py-2.5">
                                        <span className="text-[var(--text-muted)]">CIN</span>
                                        <span className="font-semibold text-[var(--text)]">{document.client?.cin || '-'}</span>
                                    </div>
                                    <div className="flex items-center justify-between px-4 py-2.5">
                                        <span className="text-[var(--text-muted)]">Dossier</span>
                                        <span className="font-semibold text-[var(--text)]">{document.dossier?.number || '-'}</span>
                                    </div>
                                    <div className="flex items-center justify-between px-4 py-2.5">
                                        <span className="text-[var(--text-muted)]">Project</span>
                                        <span className="font-semibold text-[var(--text)]">{document.dossier?.projectObject || '-'}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2 border-t border-[var(--border)] p-3">
                                    <AppButton
                                        variant="flat"
                                        color="primary"
                                        className="flex-1"
                                        size="sm"
                                        startContent={<UserRound size={14} />}
                                        endContent={<ArrowRight size={13} className="text-[var(--text-muted)]" />}
                                        onPress={() => document.client?.id ? router.visit(`/clients/${document.client.id}`) : router.visit('/clients')}
                                    >
                                        Client
                                    </AppButton>
                                    <AppButton
                                        variant="flat"
                                        color="primary"
                                        className="flex-1"
                                        size="sm"
                                        startContent={<FileText size={14} />}
                                        endContent={<ArrowRight size={13} className="text-[var(--text-muted)]" />}
                                        onPress={() => document.dossier?.id ? router.visit(`/dossiers/${document.dossier.id}`) : router.visit('/dossiers')}
                                    >
                                        Project
                                    </AppButton>
                                </div>
                            </AppCard>
                        </aside>
                    </section>
                </div>
            </AppShell>

            <AppModal
                isOpen={showDeleteConfirm}
                onOpenChange={setShowDeleteConfirm}
                title="Delete document?"
                size="sm"
            >
                <p className="mb-5 text-sm text-[var(--text-muted)]">
                    Delete <strong>{document.number}</strong>? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-2">
                    <AppButton variant="secondary" onPress={() => setShowDeleteConfirm(false)}>Cancel</AppButton>
                    <AppButton variant="danger" onPress={confirmDelete}>Delete</AppButton>
                </div>
            </AppModal>
        </ErrorBoundary>
    );
}