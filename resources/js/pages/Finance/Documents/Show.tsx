import { Head, router } from '@inertiajs/react';
import {
    ArrowLeft,
    BadgeDollarSign,
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
import type { ReactNode } from 'react';
import { useState } from 'react';
import { toast } from 'sonner';
import { AppShell } from '@/components/layout/AppShell';
import { AppButton } from '@/components/ui/AppButton';
import { AppModal } from '@/components/ui/AppModal';
import { FinanceDocumentLockBadge, FinanceDocumentLockNotice } from '@/features/finance/components/FinanceDocumentLockNotice';
import type { FinanceDocument, FinanceDocumentItem, Payment } from '@/features/finance/types';

const FORCE_FINANCE_SHOW_REDESIGN_53N = true;

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

function statusClass(status: string) {
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

function typeIcon(type: string): LucideIcon {
    if (type === 'invoice') {
        return Landmark;
    }

    if (type === 'receipt') {
        return ReceiptText;
    }

    return FileText;
}

function InfoTile({ label, value }: { label: string; value: ReactNode }) {
    return (
        <div className="rounded-xl border border-[var(--crm-border)] bg-[var(--crm-elevated)] p-3">
            <p className="crm-kpi-label">{label}</p>
            <div className="mt-2 truncate text-sm font-semibold text-[var(--crm-text)]">{value || '-'}</div>
        </div>
    );
}

function StatTile({
    label,
    value,
    hint,
    icon: Icon,
    tone = 'text-[var(--crm-accent)]',
}: {
    label: string;
    value: string | number;
    hint: string;
    icon: LucideIcon;
    tone?: string;
}) {
    return (
        <div className="crm-kpi-card">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="crm-kpi-label">{label}</p>
                    <p className={`crm-kpi-value ${tone}`}>{value}</p>
                </div>
                <div className="flex size-10 items-center justify-center rounded-xl bg-white/5">
                    <Icon size={18} className={tone} />
                </div>
            </div>
            <p className="mt-2 text-xs text-[var(--crm-muted)]">{hint}</p>
        </div>
    );
}

function ActionButton({
    children,
    onClick,
    tone = 'default',
    disabled = false,
}: {
    children: ReactNode;
    onClick: () => void;
    tone?: 'default' | 'primary' | 'danger' | 'success';
    disabled?: boolean;
}) {
    const toneClass = {
        default: 'border-[var(--crm-border)] text-[var(--crm-text)]',
        primary: 'border-[var(--crm-accent)] bg-[color-mix(in_srgb,var(--crm-accent)_18%,transparent)] text-[var(--crm-accent)]',
        danger: 'border-red-500/30 bg-red-500/10 text-red-300',
        success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    }[tone];

    return (
        <button
            type="button"
            disabled={disabled}
            onClick={onClick}
            className={`crm-action-button justify-center py-3 disabled:cursor-not-allowed disabled:opacity-45 ${toneClass}`}
        >
            {children}
        </button>
    );
}

function EmptyState({ label }: { label: string }) {
    return (
        <div className="rounded-xl border border-dashed border-[var(--crm-border)] bg-black/10 px-4 py-10 text-center text-sm text-[var(--crm-muted)]">
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
        <>
            <Head title={document.number} />

            <AppShell
                eyebrowKey="nav.financeDocuments"
                titleKey="nav.financeDocuments"
                subtitleKey="dashboardHome.subtitle"
                action={
                    <div className="flex flex-wrap gap-2">
                        <AppButton variant="secondary" onPress={() => router.visit('/finance/documents')}>
                            <ArrowLeft size={16} />
                            Finance
                        </AppButton>
                        <AppButton variant="primary" onPress={() => putAction(document.generateUrl, 'Document generated.')}>
                            <RotateCcw size={16} />
                            Generate
                        </AppButton>
                    </div>
                }
            >
                <div className="crm-page mx-auto max-w-[1540px] pt-6 xl:pt-8" data-ui-marker={FORCE_FINANCE_SHOW_REDESIGN_53N ? 'FORCE_FINANCE_SHOW_REDESIGN_53N' : undefined}>
                    <section className="crm-panel overflow-hidden shadow-[0_18px_60px_rgba(0,0,0,0.24)]">
                        <div className="grid gap-5 p-5 xl:grid-cols-[minmax(0,1fr)_430px] xl:items-start">
                            <div className="flex min-w-0 items-start gap-4">
                                <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--crm-accent)_18%,transparent)] text-[var(--crm-accent)]">
                                    <Icon size={24} />
                                </div>

                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="crm-eyebrow">{document.typeLabel}</p>
                                        <FinanceDocumentLockBadge document={document} />
                                    </div>

                                    <h1 className="mt-2 truncate text-2xl font-black text-[var(--crm-text)]">{document.number}</h1>
                                    <p className="mt-1 text-sm text-[var(--crm-muted)]">
                                        {document.client?.name || 'No client'} / {document.dossier?.number || 'No dossier'}
                                    </p>

                                    <div className="mt-3 flex flex-wrap gap-2">
                                        <span className={`rounded-full border px-2 py-1 text-xs font-bold ${statusClass(document.status)}`}>
                                            {document.status}
                                        </span>
                                        <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-2 py-1 text-xs font-bold text-blue-300">
                                            TVA {document.tvaRate}%
                                        </span>
                                        {locked ? (
                                            <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/25 bg-amber-500/10 px-2 py-1 text-xs font-bold text-amber-300">
                                                <LockKeyhole size={12} />
                                                Locked
                                            </span>
                                        ) : null}
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-2 text-sm text-[var(--crm-muted)]">
                                <span className="flex items-center gap-2">
                                    <UserRound size={15} />
                                    {document.client?.name || '-'} / {document.client?.cin || '-'}
                                </span>
                                <span className="flex items-center gap-2">
                                    <FileText size={15} />
                                    {document.dossier?.number || '-'} / {document.dossier?.projectObject || '-'}
                                </span>
                                <div className="mt-2 grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        className="crm-action-button justify-center"
                                        onClick={() => document.client?.id ? router.visit(`/clients/${document.client.id}`) : router.visit('/clients')}
                                    >
                                        Client
                                    </button>
                                    <button
                                        type="button"
                                        className="crm-action-button justify-center"
                                        onClick={() => document.dossier?.id ? router.visit(`/dossiers/${document.dossier.id}`) : router.visit('/dossiers')}
                                    >
                                        Project
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="grid border-t border-[var(--crm-border)] md:grid-cols-5">
                            <div className="border-b border-[var(--crm-border)] p-4 md:border-b-0 md:border-r">
                                <p className="crm-kpi-label">Issue date</p>
                                <p className="mt-2 text-sm font-black">{dateLabel(document.issueDate)}</p>
                            </div>
                            <div className="border-b border-[var(--crm-border)] p-4 md:border-b-0 md:border-r">
                                <p className="crm-kpi-label">Due date</p>
                                <p className="mt-2 text-sm font-black">{dateLabel(document.dueDate)}</p>
                            </div>
                            <div className="border-b border-[var(--crm-border)] p-4 md:border-b-0 md:border-r">
                                <p className="crm-kpi-label">Valid until</p>
                                <p className="mt-2 text-sm font-black">{dateLabel(document.validUntil)}</p>
                            </div>
                            <div className="border-b border-[var(--crm-border)] p-4 md:border-b-0 md:border-r">
                                <p className="crm-kpi-label">PDF</p>
                                <p className="mt-2 text-sm font-black">{document.hasPdf ? 'Ready' : 'Missing'}</p>
                            </div>
                            <div className="p-4">
                                <p className="crm-kpi-label">Excel</p>
                                <p className="mt-2 text-sm font-black">{document.hasExcel ? 'Ready' : 'Missing'}</p>
                            </div>
                        </div>
                    </section>

                    {locked ? (
                        <FinanceDocumentLockNotice document={document} />
                    ) : null}

                    <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                        <StatTile label="Subtotal HT" value={money(document.subtotalHt, currency)} hint="Before TVA" icon={FileSpreadsheet} />
                        <StatTile label="TVA" value={money(document.taxTotal, currency)} hint={`${document.tvaRate}% tax`} icon={Landmark} tone="text-blue-300" />
                        <StatTile label="Total TTC" value={money(document.totalTtc, currency)} hint="Document total" icon={BadgeDollarSign} />
                        <StatTile label="Remaining" value={money(document.remainingTotal, currency)} hint="Amount still due" icon={ReceiptText} tone="text-amber-300" />
                    </section>

                    <section className="grid min-w-0 items-start gap-5 2xl:grid-cols-[minmax(0,1fr)_400px]">
                        <main className="grid min-w-0 gap-5">
                            <section className="crm-panel overflow-hidden">
                                <div className="flex items-start justify-between gap-4 border-b border-[var(--crm-border)] px-5 py-4">
                                    <div>
                                        <h2 className="text-sm font-black">Document lines</h2>
                                        <p className="mt-1 text-xs text-[var(--crm-muted)]">{items.length} item(s)</p>
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="crm-table">
                                        <thead>
                                            <tr>
                                                <th>Item</th>
                                                <th>Qty</th>
                                                <th>Unit</th>
                                                <th>Unit price</th>
                                                <th>TVA</th>
                                                <th className="text-right">Total TTC</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {items.map((item: FinanceDocumentItem) => (
                                                <tr key={item.id ?? item.position}>
                                                    <td>
                                                        <div className="min-w-0">
                                                            <p className="max-w-[360px] truncate font-semibold text-[var(--crm-text)]">{item.title}</p>
                                                            <p className="max-w-[420px] truncate text-xs text-[var(--crm-muted)]">{item.description || '-'}</p>
                                                        </div>
                                                    </td>
                                                    <td>{item.quantity}</td>
                                                    <td>{item.unit || '-'}</td>
                                                    <td>{money(item.unitPrice, currency)}</td>
                                                    <td>{item.tvaRate}%</td>
                                                    <td className="text-right font-black text-[var(--crm-accent)]">{money(item.totalTtc, currency)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {items.length === 0 ? <div className="p-5"><EmptyState label="No items in this document." /></div> : null}
                            </section>

                            <section className="crm-panel overflow-hidden">
                                <div className="flex items-start justify-between gap-4 border-b border-[var(--crm-border)] px-5 py-4">
                                    <div>
                                        <h2 className="text-sm font-black">Payments</h2>
                                        <p className="mt-1 text-xs text-[var(--crm-muted)]">{payments.length} payment(s)</p>
                                    </div>
                                </div>

                                <div className="p-5">
                                    {payments.length > 0 ? (
                                        <div className="grid gap-2">
                                            {payments.map((payment: Payment) => (
                                                <div key={payment.id} className="grid gap-2 rounded-xl border border-[var(--crm-border)] bg-[var(--crm-elevated)] px-3 py-2 md:grid-cols-[1fr_auto] md:items-center">
                                                    <div className="min-w-0">
                                                        <p className="truncate text-sm font-semibold text-[var(--crm-text)]">{payment.paymentNumber}</p>
                                                        <p className="text-xs text-[var(--crm-muted)]">
                                                            {payment.method || '-'} / {payment.reference || '-'} / {dateLabel(payment.paidAt)}
                                                        </p>
                                                    </div>
                                                    <div className="text-sm font-black text-emerald-300">{money(payment.amount, currency)}</div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <EmptyState label="No payments recorded for this document." />
                                    )}
                                </div>
                            </section>

                            <section className="crm-panel p-5">
                                <h2 className="text-sm font-black">Notes and terms</h2>
                                <div className="mt-4 grid gap-4 xl:grid-cols-2">
                                    <div className="rounded-xl border border-[var(--crm-border)] bg-[var(--crm-elevated)] p-4">
                                        <p className="crm-kpi-label">Notes</p>
                                        <p className="mt-3 text-sm leading-6 text-[var(--crm-muted)]">{document.notes || 'No notes saved.'}</p>
                                    </div>
                                    <div className="rounded-xl border border-[var(--crm-border)] bg-[var(--crm-elevated)] p-4">
                                        <p className="crm-kpi-label">Terms</p>
                                        <p className="mt-3 text-sm leading-6 text-[var(--crm-muted)]">{document.terms || 'No terms saved.'}</p>
                                    </div>
                                </div>
                            </section>
                        </main>

                        <aside className="grid min-w-0 gap-5 2xl:sticky 2xl:top-24">
                            <section className="crm-panel p-5">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck size={15} className="text-[var(--crm-accent)]" />
                                    <h2 className="text-sm font-black">Actions</h2>
                                </div>

                                <div className="mt-4 grid gap-2">
                                    <ActionButton tone="primary" onClick={() => putAction(document.generateUrl, 'Document generated.')}>
                                        <RotateCcw size={15} />
                                        Generate PDF + Excel
                                    </ActionButton>

                                    <div className="grid grid-cols-2 gap-2">
                                        <ActionButton onClick={() => putAction(document.generatePdfUrl, 'PDF generated.')}>
                                            <FileText size={15} />
                                            PDF
                                        </ActionButton>
                                        <ActionButton onClick={() => putAction(document.generateExcelUrl, 'Excel generated.')}>
                                            <FileSpreadsheet size={15} />
                                            Excel
                                        </ActionButton>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <ActionButton disabled={!document.pdfDownloadUrl} onClick={() => download(document.pdfDownloadUrl)}>
                                            <Download size={15} />
                                            PDF
                                        </ActionButton>
                                        <ActionButton disabled={!document.excelDownloadUrl} onClick={() => download(document.excelDownloadUrl)}>
                                            <Download size={15} />
                                            Excel
                                        </ActionButton>
                                    </div>

                                    {document.acceptUrl ? (
                                        <ActionButton tone="success" onClick={() => putAction(document.acceptUrl, 'Quote accepted.')}>
                                            <CheckCircle2 size={15} />
                                            Accept quote
                                        </ActionButton>
                                    ) : null}

                                    {document.rejectUrl ? (
                                        <ActionButton tone="danger" onClick={() => putAction(document.rejectUrl, 'Quote rejected.')}>
                                            <XCircle size={15} />
                                            Reject quote
                                        </ActionButton>
                                    ) : null}

                                    {document.convertToInvoiceUrl ? (
                                        <ActionButton tone="primary" onClick={() => postAction(document.convertToInvoiceUrl, 'Invoice created.')}>
                                            <Landmark size={15} />
                                            Convert to invoice
                                        </ActionButton>
                                    ) : null}

                                    <ActionButton onClick={() => putAction(document.cancelUrl, 'Document cancelled.')}>
                                        <XCircle size={15} />
                                        Cancel
                                    </ActionButton>

                                    <ActionButton tone="danger" onClick={deleteDocument}>
                                        <Trash2 size={15} />
                                        Delete
                                    </ActionButton>
                                </div>
                            </section>

                            <section className="crm-panel p-5">
                                <h2 className="text-sm font-black">Document details</h2>
                                <div className="mt-4 grid gap-3">
                                    <InfoTile label="Type" value={document.typeLabel} />
                                    <InfoTile label="Status" value={<span className={`rounded-full border px-2 py-1 text-xs font-bold ${statusClass(document.status)}`}>{document.status}</span>} />
                                    <InfoTile label="Generated" value={dateLabel(document.generatedAt)} />
                                    <InfoTile label="Created" value={dateLabel(document.createdAt)} />
                                    <InfoTile label="Updated" value={dateLabel(document.updatedAt)} />
                                </div>
                            </section>

                            <section className="crm-panel p-5">
                                <h2 className="text-sm font-black">Client and project</h2>
                                <div className="mt-4 grid gap-3">
                                    <InfoTile label="Client" value={document.client?.name || '-'} />
                                    <InfoTile label="CIN" value={document.client?.cin || '-'} />
                                    <InfoTile label="Dossier" value={document.dossier?.number || '-'} />
                                    <InfoTile label="Project" value={document.dossier?.projectObject || '-'} />
                                </div>
                            </section>
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
        </>
    );
}