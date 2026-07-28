import { Banknote, ExternalLink, FileText, Plus, ReceiptText, Trash2, Wallet } from 'lucide-react';
import { AppButton } from '@/components/ui/AppButton';
import { AppEmptyState } from '@/components/ui/AppEmptyState';
import { AppKpiCard } from '@/components/ui/AppKpiCard';
import { AppTableActionButton } from '@/components/ui/AppTableActionButton';
import { StatusPill } from '@/components/ui/StatusPill';
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

function money(value: number, currency: string) {
    return new Intl.NumberFormat('fr-MA', {
        style: 'currency',
        currency: currency || 'MAD',
        maximumFractionDigits: 2,
    }).format(value || 0);
}

function date(value: string | null) {
    return value ? new Intl.DateTimeFormat('fr-MA', { dateStyle: 'medium' }).format(new Date(value)) : '-';
}

export function ClientFinanceTab({ project, onCreateDocument, onCreatePayment, documentActions, onOpenFinance, onDeletePayment }: ClientFinanceTabProps) {
    if (!project) {
        return <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm"><AppEmptyState title="Aucun projet sélectionné" description="Sélectionnez ou créez un projet avant de gérer sa finance." /></div>;
    }

    const currency = project.currency || 'MAD';
    const metricCards = [
        { label: 'Devis', value: money(project.quotesTotal, currency), detail: `${project.financeDocuments.filter((document) => document.type === 'quote').length} document(s)`, icon: <FileText size={16} className="text-sky-400" />, accentColor: '#38bdf8', valueClassName: 'text-sky-300' },
        { label: 'Facturé', value: money(project.invoicesTotal, currency), detail: 'Total TTC des factures', icon: <ReceiptText size={16} className="text-violet-400" />, accentColor: '#a78bfa', valueClassName: 'text-violet-300' },
        { label: 'Encaissé', value: money(project.paidTotal, currency), detail: `${project.paymentsCount} paiement(s)`, icon: <Wallet size={16} className="text-emerald-400" />, accentColor: '#34d399', valueClassName: 'text-emerald-300' },
        { label: 'À recevoir', value: money(project.remainingTotal, currency), detail: 'Solde des factures', icon: <Banknote size={16} className="text-amber-400" />, accentColor: '#fbbf24', valueClassName: 'text-amber-300' },
    ];

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Finance du projet</p>
                    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                        <h2 className="truncate text-sm font-semibold text-[var(--foreground)]">{project.projectObject}</h2>
                        <span className="text-xs text-[var(--text-muted)]">{project.dossierNumber}</span>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <AppButton variant="bordered" size="sm" onPress={onOpenFinance}><ExternalLink size={14} /> Ouvrir finance</AppButton>
                    <AppButton variant="bordered" size="sm" onPress={onCreatePayment}><Wallet size={14} /> Paiement</AppButton>
                    <AppButton variant="bordered" size="sm" onPress={() => onCreateDocument('invoice')} isDisabled={!project.financeEligibility.canCreateInvoice}><ReceiptText size={14} /> Facture</AppButton>
                    <AppButton variant="solid" color="primary" size="sm" onPress={() => onCreateDocument('quote')} isDisabled={!project.financeEligibility.canCreateQuote}><Plus size={14} /> Nouveau devis</AppButton>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                {metricCards.map((metric) => <AppKpiCard key={metric.label} {...metric} />)}
            </div>

            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(280px,0.85fr)]">
                <section className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
                    <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
                        <div><h3 className="text-[13px] font-semibold text-[var(--foreground)]">Documents financiers</h3><p className="mt-0.5 text-[11px] text-[var(--text-muted)]">Devis, factures et reçus liés au projet.</p></div>
                        <span className="rounded bg-[var(--surface-2)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--text-muted)]">{project.financeDocuments.length}</span>
                    </div>
                    {project.financeDocuments.length ? (
                        <div className="divide-y divide-[var(--border)]">
                            {project.financeDocuments.map((document) => (
                                <div key={document.id} className="flex flex-col gap-3 px-4 py-3 transition hover:bg-[var(--surface-2)] sm:flex-row sm:items-center">
                                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--accent)_14%,transparent)] text-[var(--accent)]"><FileText size={15} /></span>
                                    <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="font-medium text-[var(--foreground)]">{document.number}</p><StatusPill label={document.statusLabel || document.status} color={statusColor(document.status)} size="sm" /></div><p className="mt-0.5 text-[11px] text-[var(--text-muted)]">{document.typeLabel} · Émis le {date(document.issueDate)}</p></div>
                                    <div className="grid grid-cols-3 gap-3 text-right text-[11px] sm:min-w-[250px]"><div><p className="text-[var(--text-muted)]">TTC</p><p className="mt-0.5 font-semibold text-[var(--foreground)]">{money(document.totalTtc, document.currency)}</p></div><div><p className="text-[var(--text-muted)]">Payé</p><p className="mt-0.5 font-semibold text-emerald-400">{money(document.paidTotal, document.currency)}</p></div><div><p className="text-[var(--text-muted)]">Reste</p><p className="mt-0.5 font-semibold text-amber-400">{money(document.remainingTotal, document.currency)}</p></div></div>
                                    <FinanceDocumentActions document={document} handlers={documentActions} visibleCount={2} />
                                </div>
                            ))}
                        </div>
                    ) : <div className="p-6"><AppEmptyState title="Aucun document financier" description="Créez un devis ou une facture pour ce projet." /></div>}
                </section>

                <section className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
                    <div className="border-b border-[var(--border)] px-4 py-3"><h3 className="text-[13px] font-semibold text-[var(--foreground)]">Paiements récents</h3><p className="mt-0.5 text-[11px] text-[var(--text-muted)]">Encaissements enregistrés.</p></div>
                    {project.payments.length ? (
                        <div className="divide-y divide-[var(--border)]">
                            {project.payments.map((payment) => (
                                <div key={payment.id} className="px-4 py-3">
                                    <div className="flex items-center justify-between gap-3">
                                        <p className="truncate text-[12px] font-medium text-[var(--foreground)]">{payment.paymentNumber}</p>
                                        <div className="flex shrink-0 items-center gap-2">
                                            <p className="text-[12px] font-semibold text-emerald-400">{money(payment.amount, currency)}</p>
                                            {payment.canDelete ? (
                                                <AppTableActionButton label="Supprimer le paiement" tone="delete" onPress={() => onDeletePayment(payment)}>
                                                    <Trash2 size={13} />
                                                </AppTableActionButton>
                                            ) : null}
                                        </div>
                                    </div>
                                    <div className="mt-1 flex items-center justify-between gap-3 text-[11px] text-[var(--text-muted)]">
                                        <span className="truncate">{payment.documentNumber || 'Paiement non lié'}</span>
                                        <span>{date(payment.paidAt)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : <div className="p-6"><AppEmptyState title="Aucun paiement" description="Les paiements liés aux factures apparaîtront ici." /></div>}
                </section>
            </div>
        </div>
    );
}
