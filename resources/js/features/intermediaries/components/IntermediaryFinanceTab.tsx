import { Input } from '@heroui/react';
import {
    IconAlertTriangle,
    IconArrowUpRight,
    IconCalendar,
    IconCash,
    IconFileText,
    IconFilter,
    IconReceipt,
    IconTrash,
    IconWallet,
} from '@tabler/icons-react';
import { router } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { AppButton } from '@/components/ui/AppButton';
import { AppEmptyState } from '@/components/ui/AppEmptyState';
import { AppModal } from '@/components/ui/AppModal';
import type { IntermediaryFinance } from '@/features/intermediaries/types';

const methods = [
    { value: 'cash', label: 'Espèces' },
    { value: 'bank_transfer', label: 'Virement bancaire' },
    { value: 'check', label: 'Chèque' },
    { value: 'card', label: 'Carte' },
    { value: 'other', label: 'Autre' },
] as const;

const filters = [
    { value: 'all', label: 'Tous' },
    { value: 'unpaid', label: 'Impayés' },
    { value: 'partial', label: 'Partiels' },
    { value: 'paid', label: 'Payés' },
    { value: 'no_invoice', label: 'Sans facture' },
] as const;

type ProjectStatus = IntermediaryFinance['projects'][number]['status'];
type ProjectFilter = 'all' | ProjectStatus;

const money = (value: number, currency: string) => new Intl.NumberFormat('fr-MA', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
}).format(value);

const progress = (paid: number, total: number) => Math.min(100, Math.max(0, total > 0 ? (paid / total) * 100 : 0));

export function IntermediaryFinanceTab({ intermediaryId, finance, canCreate, canReverse }: {
    intermediaryId: number;
    finance: IntermediaryFinance;
    canCreate: boolean;
    canReverse: boolean;
}) {
    const [isPaymentOpen, setPaymentOpen] = useState(false);
    const [isCancellationOpen, setCancellationOpen] = useState(false);
    const [selectedBatchId, setSelectedBatchId] = useState<number | null>(null);
    const [amount, setAmount] = useState('');
    const [paidAt, setPaidAt] = useState(new Date().toISOString().slice(0, 10));
    const [method, setMethod] = useState<(typeof methods)[number]['value']>('cash');
    const [reference, setReference] = useState('');
    const [notes, setNotes] = useState('');
    const [cancellationReason, setCancellationReason] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [filter, setFilter] = useState<ProjectFilter>('all');
    const [isSubmitting, setSubmitting] = useState(false);

    const projects = useMemo(
        () => finance.projects.filter((project) => filter === 'all' || project.status === filter),
        [filter, finance.projects],
    );
    const noInvoiceCount = finance.projects.filter((project) => project.status === 'no_invoice').length;

    const closePayment = () => {
        setPaymentOpen(false);
        setErrors({});
    };

    const submitPayment = () => {
        setSubmitting(true);
        router.post(`/intermediaries/${intermediaryId}/finance/payments`, {
            amount,
            paid_at: paidAt,
            method,
            reference: reference || null,
            notes: notes || null,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                closePayment();
                setAmount('');
                setReference('');
                setNotes('');
            },
            onError: (nextErrors) => setErrors(nextErrors as Record<string, string>),
            onFinish: () => setSubmitting(false),
        });
    };

    const openCancellation = (batchId: number) => {
        setSelectedBatchId(batchId);
        setCancellationReason('');
        setErrors({});
        setCancellationOpen(true);
    };

    const submitCancellation = () => {
        if (!selectedBatchId) return;

        setSubmitting(true);
        router.delete(`/intermediaries/${intermediaryId}/finance/payments/${selectedBatchId}`, {
            data: { cancellation_reason: cancellationReason.trim() },
            preserveScroll: true,
            onSuccess: () => {
                setCancellationOpen(false);
                setSelectedBatchId(null);
                setCancellationReason('');
            },
            onError: (nextErrors) => setErrors(nextErrors as Record<string, string>),
            onFinish: () => setSubmitting(false),
        });
    };

    return (
        <div className="space-y-5">
            <section className="flex flex-col gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="max-w-2xl">
                    <h2 className="text-sm font-semibold text-[var(--foreground)]">Suivi financier</h2>
                    <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">
                        Les règlements sont affectés automatiquement aux factures les plus anciennes encore ouvertes.
                    </p>
                </div>
                {canCreate ? <AppButton size="sm" variant="primary" isDisabled={finance.summary.remaining <= 0} onPress={() => setPaymentOpen(true)} tooltip={finance.summary.remaining <= 0 ? 'Aucun montant à encaisser' : undefined}>
                    <IconWallet size={15} /> Enregistrer un paiement
                </AppButton> : null}
            </section>

            {noInvoiceCount > 0 ? <div className="flex flex-wrap items-center gap-2 rounded-xl border border-amber-400/30 bg-amber-400/10 px-3 py-2.5 text-xs text-amber-200">
                <IconAlertTriangle size={16} className="shrink-0" />
                <span className="mr-auto"><strong>{noInvoiceCount}</strong> projet{noInvoiceCount > 1 ? 's' : ''} sans facture nécessite{noInvoiceCount > 1 ? 'nt' : ''} un suivi.</span>
                <AppButton compact size="sm" variant="quiet" onPress={() => setFilter('no_invoice')}>Voir les projets</AppButton>
            </div> : null}

            <div className="grid gap-3 sm:grid-cols-3">
                {[
                    ['Facturé', finance.summary.invoiced, IconReceipt, 'text-[var(--foreground)]'],
                    ['Encaissé', finance.summary.paid, IconWallet, 'text-emerald-500'],
                    ['À encaisser', finance.summary.remaining, IconCash, 'text-amber-500'],
                ].map(([label, value, Icon, valueClass]) => {
                    const SummaryIcon = Icon as typeof IconReceipt;
                    return <div key={String(label)} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
                        <div className="flex items-center justify-between text-xs text-[var(--text-muted)]"><span>{label}</span><SummaryIcon size={16} /></div>
                        <p className={`mt-2 text-xl font-semibold tracking-tight ${String(valueClass)}`}>{money(value as number, finance.currency)}</p>
                    </div>;
                })}
            </div>

            <section className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
                <div className="flex flex-col gap-3 border-b border-[var(--border)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div><h3 className="text-sm font-semibold text-[var(--foreground)]">Projets suivis</h3><p className="mt-0.5 text-xs text-[var(--text-muted)]">{finance.summary.projectsCount} projet{finance.summary.projectsCount > 1 ? 's' : ''} rattaché{finance.summary.projectsCount > 1 ? 's' : ''}</p></div>
                    <div className="flex max-w-full items-center gap-1 overflow-x-auto rounded-lg bg-[var(--surface-2)] p-1">
                        <IconFilter size={14} className="ml-1 shrink-0 text-[var(--text-muted)]" />
                        {filters.map((item) => <AppButton key={item.value} compact size="sm" variant={filter === item.value ? 'accent' : 'quiet'} onPress={() => setFilter(item.value)}>
                            {item.value === 'no_invoice' && noInvoiceCount ? `${item.label} (${noInvoiceCount})` : item.label}
                        </AppButton>)}
                    </div>
                </div>
                {projects.length ? <div className="divide-y divide-[var(--border)]">
                    {projects.map((project) => <button key={project.id} type="button" onClick={() => router.visit(`/dossiers/${project.id}`)} className="group grid w-full gap-3 px-4 py-3.5 text-left transition hover:bg-[var(--surface-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                        <div className="min-w-0">
                            <div className="flex items-center gap-2"><span className="truncate text-sm font-medium text-[var(--foreground)]">{project.name || project.number}</span><IconArrowUpRight size={14} className="shrink-0 text-[var(--text-muted)] opacity-0 transition group-hover:opacity-100" /></div>
                            <p className="mt-1 truncate text-xs text-[var(--text-muted)]">{project.number} · {project.clientName || 'Client non renseigné'} · {project.invoicesCount} facture{project.invoicesCount > 1 ? 's' : ''}</p>
                            <div className="mt-2 h-1.5 max-w-sm overflow-hidden rounded-full bg-[var(--surface-3)]"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${progress(project.paid, project.total)}%` }} /></div>
                        </div>
                        <dl className="grid grid-cols-3 gap-x-4 text-right text-xs sm:gap-x-6"><div><dt className="text-[10px] text-[var(--text-muted)]">Facturé</dt><dd className="mt-0.5 font-medium text-[var(--foreground)]">{money(project.total, finance.currency)}</dd></div><div><dt className="text-[10px] text-[var(--text-muted)]">Encaissé</dt><dd className="mt-0.5 font-medium text-emerald-500">{money(project.paid, finance.currency)}</dd></div><div><dt className="text-[10px] text-[var(--text-muted)]">Reste</dt><dd className="mt-0.5 font-medium text-amber-500">{money(project.remaining, finance.currency)}</dd></div></dl>
                    </button>)}
                </div> : <div className="p-8"><AppEmptyState title="Aucun projet pour ce filtre" /></div>}
            </section>

            <section className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
                <div className="border-b border-[var(--border)] px-4 py-3"><h3 className="text-sm font-semibold text-[var(--foreground)]">Historique des paiements</h3><p className="mt-0.5 text-xs text-[var(--text-muted)]">Chaque règlement conserve ses factures et son reçu associés.</p></div>
                {finance.batches.length ? <div className="divide-y divide-[var(--border)]">{finance.batches.map((batch) => <article key={batch.id} className="flex gap-3 px-4 py-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500"><IconWallet size={16} /></div>
                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1"><p className="text-sm font-semibold text-[var(--foreground)]">{money(batch.amount, finance.currency)}</p><p className="flex items-center gap-1 text-xs text-[var(--text-muted)]"><IconCalendar size={13} />{batch.paidAt || 'Date non renseignée'}</p></div>
                        <p className="mt-1 text-xs text-[var(--text-muted)]">{methods.find((item) => item.value === batch.method)?.label ?? 'Mode non précisé'}{batch.reference ? ` · ${batch.reference}` : ''}</p>
                        <ul className="mt-3 space-y-1.5 border-l border-[var(--border)] pl-3">{batch.allocations.map((allocation) => <li key={allocation.id} className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs"><span className="text-[var(--foreground)]">{allocation.projectName || 'Projet non renseigné'}{allocation.invoiceNumber ? ` · ${allocation.invoiceNumber}` : ''}</span><span className="font-medium text-[var(--text-muted)]">{money(allocation.amount, finance.currency)}</span>{allocation.receiptUrl ? <a href={allocation.receiptUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-[var(--accent)] underline-offset-2 hover:underline"><IconFileText size={13} /> Reçu</a> : null}</li>)}</ul>
                        {batch.cancelledAt ? <p className="mt-3 inline-flex rounded-full bg-[var(--danger)]/10 px-2 py-1 text-[10px] font-semibold text-[var(--danger)]">Annulé</p> : null}
                    </div>
                    {canReverse && batch.canCancel ? <AppButton isIconOnly compact size="sm" variant="quiet" color="danger" aria-label="Annuler le paiement" tooltip="Annuler ce paiement" onPress={() => openCancellation(batch.id)}><IconTrash size={15} /></AppButton> : null}
                </article>)}</div> : <div className="p-8"><AppEmptyState title="Aucun paiement enregistré" /></div>}
            </section>

            <AppModal isOpen={isPaymentOpen} onOpenChange={(open) => open ? setPaymentOpen(true) : closePayment()} title="Enregistrer un paiement" size="sm">
                <div className="space-y-4"><p className="rounded-lg bg-[var(--surface-2)] px-3 py-2 text-xs text-[var(--text-muted)]">Montant restant à répartir : <strong className="text-[var(--foreground)]">{money(finance.summary.remaining, finance.currency)}</strong></p><label className="block text-sm font-medium text-[var(--foreground)]">Montant<Input type="number" min="0.01" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} className="mt-1 w-full" /></label>{errors.amount ? <p className="text-xs text-[var(--danger)]">{errors.amount}</p> : null}<label className="block text-sm font-medium text-[var(--foreground)]">Date de paiement<Input type="date" value={paidAt} onChange={(event) => setPaidAt(event.target.value)} className="mt-1 w-full" /></label><label className="block text-sm font-medium text-[var(--foreground)]">Mode de paiement<select value={method} onChange={(event) => setMethod(event.target.value as typeof method)} className="mt-1 h-9 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 text-sm">{methods.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label><label className="block text-sm font-medium text-[var(--foreground)]">Référence <span className="font-normal text-[var(--text-muted)]">(facultatif)</span><Input value={reference} onChange={(event) => setReference(event.target.value)} className="mt-1 w-full" /></label><label className="block text-sm font-medium text-[var(--foreground)]">Note <span className="font-normal text-[var(--text-muted)]">(facultatif)</span><Input value={notes} onChange={(event) => setNotes(event.target.value)} className="mt-1 w-full" /></label><div className="flex justify-end gap-2 pt-2"><AppButton variant="quiet" onPress={closePayment} isDisabled={isSubmitting}>Annuler</AppButton><AppButton variant="primary" onPress={submitPayment} isDisabled={isSubmitting}>{isSubmitting ? 'Enregistrement…' : 'Enregistrer le paiement'}</AppButton></div></div>
            </AppModal>

            <AppModal isOpen={isCancellationOpen} onOpenChange={(open) => { if (!open && !isSubmitting) setCancellationOpen(false); }} title="Annuler ce paiement" size="sm">
                <div className="space-y-4"><div className="rounded-lg border border-[var(--danger)]/25 bg-[var(--danger)]/10 px-3 py-2.5 text-xs leading-5 text-[var(--foreground)]">Cette action restaure les montants sur les factures liées et annule le reçu associé.</div><label className="block text-sm font-medium text-[var(--foreground)]">Motif de l’annulation<Input value={cancellationReason} onChange={(event) => setCancellationReason(event.target.value)} className="mt-1 w-full" aria-invalid={Boolean(errors.cancellation_reason)} /></label>{errors.cancellation_reason ? <p className="text-xs text-[var(--danger)]">{errors.cancellation_reason}</p> : null}<div className="flex justify-end gap-2 pt-2"><AppButton variant="quiet" onPress={() => setCancellationOpen(false)} isDisabled={isSubmitting}>Conserver le paiement</AppButton><AppButton variant="danger" onPress={submitCancellation} isDisabled={isSubmitting || cancellationReason.trim().length < 3}>{isSubmitting ? 'Annulation…' : 'Confirmer l’annulation'}</AppButton></div></div>
            </AppModal>
        </div>
    );
}
