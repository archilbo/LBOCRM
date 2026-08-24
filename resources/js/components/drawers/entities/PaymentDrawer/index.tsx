import { Fragment, useEffect, useMemo, useState } from 'react';
import { router } from '@inertiajs/react';
import { IconAlertTriangle, IconCircleCheck, IconPrinter, IconReceipt2 } from '@tabler/icons-react';

import { Button, Card, Input, ListBox, Modal, Select, TextArea } from '@heroui/react';
import { AppAutocomplete } from '@/components/ui/AppAutocomplete';
import { toast } from 'sonner';
import { AppDrawer } from '@/components/ui/AppDrawer';
import { DateField } from '@/features/archives/components/DateField';
import { FinanceItemsTable } from '@/features/finance/components/FinanceItemsTable';
import { strToDate, dateToStr } from '@/lib/dateUtils';
import type { ClientOption, DossierOption, FinanceDocument, FinanceDocumentItem } from '@/features/finance/types';
import { calculateItem, calculateTotals, formatCompactMoney, normalizeNumber } from '@/features/finance/utils/calculations';

type PaymentDrawerProps = {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    invoices: FinanceDocument[];
    invoice?: FinanceDocument | null;
    clients?: ClientOption[];
    dossiers?: DossierOption[];
    defaultClientId?: string;
    defaultDossierId?: string;
    lockClientContext?: boolean;
    lockDossierContext?: boolean;
    returnTo?: string;
};

type PaymentForm = { financeDocumentId: string; dossierId: string; method: string; reference: string; paidAt: string; notes: string; };
type PaymentMode = 'invoice' | 'negotiated';

type PaymentReceiptFlash = {
    paymentNumber: string;
    number: string;
    clientName: string | null;
    amount: number;
    currency: string;
    remainingTotal: number;
    showUrl: string | null;
    printUrl: string | null;
    generatePdfUrl: string | null;
    generateExcelUrl: string | null;
    pdfDownloadUrl: string | null;
    excelDownloadUrl: string | null;
};

type PaymentSuccessPage = { props?: { flash?: { receipt?: PaymentReceiptFlash | null; }; }; };

const paymentMethods = [
    { id: 'cash', label: 'Especes' }, { id: 'bank_transfer', label: 'Virement bancaire' },
    { id: 'check', label: 'Cheque' }, { id: 'card', label: 'Carte bancaire' }, { id: 'other', label: 'Autre' },
];

const labelCls = 'text-[9px] font-semibold uppercase tracking-[0.08em] text-[var(--text-subtle)]';
const compactInput = 'h-8 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-2.5 text-xs text-[var(--foreground)] placeholder:text-[var(--text-muted)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--accent)_14%,transparent)]';
const compactTrigger = 'flex h-8 w-full min-w-0 items-center gap-2 rounded-[var(--radius-md)] border bg-[var(--surface)] px-2.5 text-xs text-[var(--foreground)] outline-none transition border-[var(--border)] hover:border-[var(--accent)] focus-visible:border-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--accent)_18%,transparent)]';
const compactItem = 'flex cursor-pointer items-center rounded-lg px-2.5 py-2 text-xs text-[var(--foreground)] outline-none transition hover:bg-[var(--surface-2)] data-[focus-visible]:bg-[var(--surface-2)] data-[selected]:bg-[var(--accent)]/10';
const compactTextarea = 'min-h-20 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1.5 text-xs text-[var(--foreground)] placeholder:text-[var(--text-muted)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--accent)_14%,transparent)]';
const compactPopover = 'z-[70] min-w-[var(--trigger-width)] overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-lg';

function makeForm(selectedInvoice?: FinanceDocument | null, defaultDossierId?: string): PaymentForm {
    return {
        financeDocumentId: selectedInvoice ? String(selectedInvoice.id) : '',
        dossierId: selectedInvoice?.dossier?.id ? String(selectedInvoice.dossier.id) : (defaultDossierId || ''),
        method: 'cash', reference: '', paidAt: new Date().toISOString().slice(0, 10), notes: '',
    };
}

function makeReceiptItems(amount: number, invoice?: FinanceDocument | null): FinanceDocumentItem[] {
    const documentLabel = invoice
        ? `Paiement recu - Facture ${invoice.number}`
        : 'Avance recue';

    return [calculateItem({
        position: 1,
        title: documentLabel,
        description: '',
        quantity: 1,
        unit: 'payment',
        unitPrice: amount,
    })];
}

function makeNegotiatedReceiptItems(amount: number, designation: string): FinanceDocumentItem[] {
    return [calculateItem({
        position: 1,
        title: designation.trim() || 'Avance negociee',
        description: '',
        quantity: 1,
        unit: 'payment',
        unitPrice: amount,
    })];
}

export function PaymentDrawer({ isOpen, onOpenChange, invoices, invoice, clients = [], dossiers = [], defaultClientId, defaultDossierId, lockClientContext = false, lockDossierContext = false, returnTo }: PaymentDrawerProps) {
    const [form, setForm] = useState<PaymentForm>(() => makeForm(invoice, defaultDossierId));
    const [selectedClientId, setSelectedClientId] = useState(defaultClientId || '');
    const [paymentMode, setPaymentMode] = useState<PaymentMode>(invoice ? 'invoice' : 'negotiated');
    const [negotiatedLineId, setNegotiatedLineId] = useState('');
    const [newDesignation, setNewDesignation] = useState('');
    const [newNegotiatedAmount, setNewNegotiatedAmount] = useState('');
    const [advanceAmount, setAdvanceAmount] = useState('');
    const [receiptItems, setReceiptItems] = useState<FinanceDocumentItem[]>(() => makeReceiptItems(invoice?.remainingTotal || 0, invoice));
    const [receiptPrompt, setReceiptPrompt] = useState<PaymentReceiptFlash | null>(null);
    const clientOptions = useMemo(() => {
        if (!invoice?.client || clients.some((client) => client.id === String(invoice.client?.id))) return clients;

        return [{
            id: String(invoice.client.id),
            label: invoice.client.name,
            cin: invoice.client.cin,
            address: invoice.client.address,
        }, ...clients];
    }, [clients, invoice]);
    const dossierOptions = useMemo(() => {
        if (!invoice?.dossier || dossiers.some((dossier) => dossier.id === String(invoice.dossier?.id))) return dossiers;

        return [{
            id: String(invoice.dossier.id),
            label: [invoice.dossier.number, invoice.dossier.projectObject].filter(Boolean).join(' - '),
            clientId: invoice.client ? String(invoice.client.id) : '',
            projectObject: invoice.dossier.projectObject,
            address: invoice.dossier.address,
            floorArea: invoice.dossier.floorArea,
            landSurface: invoice.dossier.landSurface,
        }, ...dossiers];
    }, [dossiers, invoice]);
    const payableInvoices = useMemo(
        () => {
            const payable = invoices.filter((item) => item.type === 'invoice' && item.status !== 'cancelled' && item.remainingTotal > 0);
            if (!invoice || payable.some((item) => item.id === invoice.id) || invoice.type !== 'invoice' || invoice.status === 'cancelled' || invoice.remainingTotal <= 0) {
                return payable;
            }

            return [invoice, ...payable];
        },
        [invoices, invoice],
    );
    const activeInvoices = useMemo(
        () => invoices.filter((item) => item.type === 'invoice' && item.status !== 'cancelled'),
        [invoices],
    );
    const filteredInvoices = useMemo(
        () => payableInvoices.filter((item) => {
            const matchesClient = !selectedClientId || String(item.client?.id) === selectedClientId;
            const matchesDossier = !form.dossierId || String(item.dossier?.id) === form.dossierId;

            return matchesClient && matchesDossier;
        }),
        [form.dossierId, payableInvoices, selectedClientId],
    );
    const filteredDossiers = useMemo(
        () => dossierOptions.filter((dossier) => !selectedClientId || (dossier.clientIds?.includes(selectedClientId) ?? dossier.clientId === selectedClientId)),
        [dossierOptions, selectedClientId],
    );
    const settledInvoiceCount = useMemo(
        () => activeInvoices.filter((item) => (!selectedClientId || String(item.client?.id) === selectedClientId) && item.remainingTotal <= 0).length,
        [activeInvoices, selectedClientId],
    );
    const activeInvoice = paymentMode === 'invoice'
        ? filteredInvoices.find((item) => String(item.id) === form.financeDocumentId) || (invoice && String(invoice.id) === form.financeDocumentId ? invoice : null)
        : null;
    const selectedDossier = filteredDossiers.find((dossier) => dossier.id === form.dossierId) || null;
    const selectedNegotiatedLine = selectedDossier?.negotiatedPaymentLines?.find((line) => line.id === negotiatedLineId) || null;
    const negotiatedLimit = selectedNegotiatedLine?.remainingAmount ?? normalizeNumber(newNegotiatedAmount);
    const receiptTotal = calculateTotals(receiptItems, 0, 0).totalTtc;
    const amount = receiptTotal;
    const remainingBefore = activeInvoice?.remainingTotal || 0;
    const remainingAfter = Math.max(0, remainingBefore - amount);
    const isOverpayment = paymentMode === 'invoice'
        ? amount > remainingBefore && remainingBefore > 0
        : amount > negotiatedLimit && negotiatedLimit > 0;
    const isFullPayment = activeInvoice ? amount === remainingBefore && amount > 0 : false;
    const receiptLinesAreComplete = receiptItems.every((item) => item.title.trim() !== '' && item.quantity > 0 && item.unitPrice >= 0);
    const canSubmit = paymentMode === 'invoice'
        ? Boolean(activeInvoice) && amount > 0 && !isOverpayment && receiptLinesAreComplete
        : Boolean(selectedDossier)
            && Boolean(selectedNegotiatedLine || (newDesignation.trim() && normalizeNumber(newNegotiatedAmount) > 0))
            && amount > 0
            && !isOverpayment
            && receiptLinesAreComplete;

    useEffect(() => {
        if (!isOpen) return;

        setForm(makeForm(invoice, defaultDossierId));
        setSelectedClientId(invoice?.client?.id ? String(invoice.client.id) : (defaultClientId || ''));
        setPaymentMode(invoice ? 'invoice' : 'negotiated');
        setNegotiatedLineId('');
        setNewDesignation('');
        setNewNegotiatedAmount('');
        setAdvanceAmount('');
        setReceiptItems(makeReceiptItems(invoice?.remainingTotal || 0, invoice));
    }, [defaultClientId, defaultDossierId, invoice, isOpen]);

    useEffect(() => {
        if (!isOpen) return;

        setReceiptItems(makeReceiptItems(activeInvoice?.remainingTotal || 0, activeInvoice));
    }, [activeInvoice?.id, isOpen]);

    function update<K extends keyof PaymentForm>(key: K, value: PaymentForm[K]) { setForm((p) => ({ ...p, [key]: value })); }

    function updateAdvance(value: string) {
        setAdvanceAmount(value);
        const designation = selectedNegotiatedLine?.designation || newDesignation;
        setReceiptItems(makeNegotiatedReceiptItems(normalizeNumber(value), designation));
    }

    function selectPaymentMode(mode: PaymentMode) {
        setPaymentMode(mode);
        setForm((previous) => ({ ...previous, financeDocumentId: '' }));
        setNegotiatedLineId('');
        setAdvanceAmount('');
        setReceiptItems(makeReceiptItems(0));
    }

    function submit() {
        if (!canSubmit) {
            toast.error(
                isOverpayment
                    ? 'Le montant depasse le reste a payer.'
                    : !receiptLinesAreComplete
                        ? 'Completez chaque ligne du recu.'
                        : paymentMode === 'negotiated'
                            ? 'Choisissez un client, un projet et une ligne negociee.'
                            : 'Choisissez une facture.',
            );
            return;
        }
        router.post('/finance/payments', {
            payment_mode: paymentMode,
            finance_document_id: activeInvoice ? form.financeDocumentId : null,
            client_id: paymentMode === 'negotiated' ? (selectedClientId || null) : null,
            dossier_id: paymentMode === 'negotiated' ? form.dossierId : null,
            dossier_negotiated_payment_line_id: paymentMode === 'negotiated' && selectedNegotiatedLine ? selectedNegotiatedLine.id : null,
            negotiated_line: paymentMode === 'negotiated' && !selectedNegotiatedLine ? {
                designation: newDesignation.trim(),
                negotiated_amount: normalizeNumber(newNegotiatedAmount),
            } : null,
            amount, method: form.method || null,
            reference: form.reference || null, paid_at: form.paidAt || null, notes: form.notes || null,
            receipt_items: receiptItems.map((item) => ({
                title: item.title,
                description: item.description || null,
                quantity: item.quantity,
                unit: item.unit || null,
                unit_price: item.unitPrice,
            })),
            return_to: returnTo || null,
        }, {
            preserveScroll: true, preserveState: true,
            onSuccess: (page) => {
                const receipt = (page as PaymentSuccessPage).props?.flash?.receipt ?? null;
                toast.success('Paiement enregistre.');
                onOpenChange(false);
                if (receipt) setReceiptPrompt(receipt);
            },
            onError: (errors) => toast.error(typeof Object.values(errors)[0] === 'string' ? Object.values(errors)[0] as string : 'Erreur.'),
        });
    }

    function openUrl(url: string | null | undefined, msg = 'Lien indisponible.') { if (!url) { toast.error(msg); return; } window.open(url, '_blank'); }

    return (
        <>
            <AppDrawer
                isOpen={isOpen} onOpenChange={onOpenChange}
                title="Enregistrer un paiement"
                description="Réglez une facture ou enregistrez des avances négociées pour un projet."
                size="full"
                panelClassName="max-w-[min(96vw,1120px)]"
                contentClassName="px-4 sm:px-5 lg:px-6"
                footer={
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onPress={() => onOpenChange(false)}>Annuler</Button>
                        <Button variant="primary" size="sm" onPress={submit} isDisabled={!canSubmit}>Enregistrer + recu</Button>
                    </div>
                }
            >
                <div className="space-y-3">
                    <Card className="p-3 space-y-3">
                        <div className="flex items-center gap-1.5 mb-2"><IconReceipt2 size={13} className="text-[var(--text-subtle)]" /><p className={labelCls}>Paiement</p></div>
                        <div className="flex min-w-0 flex-col gap-1">
                            <label className={labelCls}>Type de paiement</label>
                            <Select selectedKey={paymentMode} onSelectionChange={(key) => selectPaymentMode(String(key) as PaymentMode)}>
                                <Select.Trigger className={compactTrigger}><Select.Value className="flex-1 text-xs text-[var(--foreground)]" /><Select.Indicator /></Select.Trigger>
                                <Select.Popover className={compactPopover}><ListBox className="p-1 gap-0">
                                    <ListBox.Item id="invoice" textValue="Paiement facture" className={compactItem}>Paiement facture</ListBox.Item>
                                    <ListBox.Item id="negotiated" textValue="Paiement negocie du projet" className={compactItem}>Paiement negocie du projet</ListBox.Item>
                                </ListBox></Select.Popover>
                            </Select>
                        </div>
                        {clientOptions.length > 0 ? (
                            <div className="flex min-w-0 flex-col gap-1">
                                <label className={labelCls}>Client</label>
                                <AppAutocomplete
                                    value={selectedClientId}
                                    onChange={(v) => {
                                        setSelectedClientId(v);
                                        setForm((prev) => ({ ...prev, financeDocumentId: '', dossierId: '' }));
                                        setNegotiatedLineId('');
                                        setAdvanceAmount('');
                                        setReceiptItems(makeReceiptItems(0));
                                    }}
                                    options={clientOptions}
                                    placeholder="Tous les clients"
                                    isDisabled={lockClientContext}
                                />
                            </div>
                        ) : null}
                        {dossierOptions.length > 0 ? (
                            <div className="flex min-w-0 flex-col gap-1">
                                <label className={labelCls}>Dossier</label>
                                <AppAutocomplete
                                    value={form.dossierId}
                                    onChange={(v) => {
                                        setForm((prev) => ({ ...prev, dossierId: v, financeDocumentId: '' }));
                                        setNegotiatedLineId('');
                                        setAdvanceAmount('');
                                        setReceiptItems(makeReceiptItems(0));
                                    }}
                                    options={filteredDossiers}
                                    placeholder="Choisir un dossier"
                                    isDisabled={lockDossierContext}
                                />
                            </div>
                        ) : null}
                        <div className="flex min-w-0 flex-col gap-1">
                            <label className={labelCls}>Document à régler</label>
                            <Select
                                className={paymentMode === 'invoice' ? '' : 'hidden'}
                                placeholder={selectedClientId && filteredInvoices.length === 0 ? 'Aucune facture impayee disponible' : 'Choisir une facture'}
                                selectedKey={form.financeDocumentId || null}
                                isDisabled={paymentMode !== 'invoice' || Boolean(invoice && lockClientContext)}
                                onSelectionChange={(key) => {
                                    const id = key != null ? String(key) : '';
                                    const selected = filteredInvoices.find((item) => String(item.id) === id);
                                    setSelectedClientId(selected?.client?.id ? String(selected.client.id) : '');
                                    setForm((prev) => ({
                                        ...prev,
                                        financeDocumentId: id,
                                        dossierId: selected?.dossier?.id ? String(selected.dossier.id) : '',
                                    }));
                                    setReceiptItems(makeReceiptItems(selected?.remainingTotal || 0, selected));
                                }}
                            >
                                <Select.Trigger className={compactTrigger}><Select.Value className="flex-1 text-xs text-[var(--foreground)]" /><Select.Indicator /></Select.Trigger>
                                <Select.Popover className={compactPopover}><ListBox className="p-1 gap-0">
                                    {filteredInvoices.map((item) => (
                                        <ListBox.Item key={String(item.id)} id={String(item.id)} textValue={`${item.number} - ${formatCompactMoney(item.remainingTotal, item.currency)} restant`} className={compactItem}>
                                            {item.number} - {formatCompactMoney(item.remainingTotal, item.currency)} restant
                                        </ListBox.Item>
                                    ))}
                                </ListBox></Select.Popover>
                            </Select>
                            {paymentMode === 'invoice' && selectedClientId && filteredInvoices.length === 0 ? (
                                <p className="flex items-start gap-1.5 text-[10px] leading-4 text-[var(--text-muted)]">
                                    <IconAlertTriangle size={13} className="mt-0.5 shrink-0 text-amber-400" />
                                    {settledInvoiceCount > 0
                                        ? "Les factures de ce client sont deja reglees. Creez une nouvelle facture ou corrigez un paiement existant avant d'enregistrer un autre reglement."
                                        : 'Aucune facture active a regler pour ce client.'}
                                </p>
                            ) : null}
                        </div>
                    </Card>

                    {paymentMode === 'negotiated' ? (
                        <Card className="space-y-3 p-3">
                            <div>
                                <p className="text-xs font-semibold">Lignes negociees du projet</p>
                                <p className="mt-1 text-[10px] text-[var(--text-muted)]">Chaque avance est enregistree sur une ligne et diminue son reste. Les avances existantes restent visibles et auditees.</p>
                            </div>

                            {selectedDossier?.negotiatedPaymentLines?.length ? (
                                <div className="overflow-x-auto rounded-[var(--radius-md)] border border-[var(--border)]">
                                    <table className="min-w-[760px] w-full text-left text-xs">
                                        <thead className="bg-[var(--surface-2)] text-[10px] uppercase tracking-wide text-[var(--text-muted)]">
                                            <tr><th className="px-3 py-2">Date</th><th className="px-3 py-2">Designation / objet</th><th className="px-3 py-2 text-right">Montant negocie</th><th className="px-3 py-2 text-right">Avance</th><th className="px-3 py-2">Mode</th><th className="px-3 py-2 text-right">Reste</th></tr>
                                        </thead>
                                        <tbody>
                                            {selectedDossier.negotiatedPaymentLines.map((line) => (
                                                <Fragment key={line.id}>
                                                    <tr className="border-t border-[var(--border)] bg-[var(--surface-2)]/35">
                                                        <td className="px-3 py-2 text-[var(--text-muted)]">—</td><td className="px-3 py-2 font-semibold">{line.designation}</td><td className="px-3 py-2 text-right tabular-nums">{formatCompactMoney(line.negotiatedAmount, 'MAD')}</td><td className="px-3 py-2 text-right tabular-nums">{formatCompactMoney(line.paidAmount, 'MAD')}</td><td className="px-3 py-2 text-[var(--text-muted)]">—</td><td className="px-3 py-2 text-right font-semibold tabular-nums">{formatCompactMoney(line.remainingAmount, 'MAD')}</td>
                                                    </tr>
                                                    {line.payments.map((payment) => (
                                                        <tr key={payment.id} className="border-t border-[var(--border)]">
                                                            <td className="px-3 py-2">{payment.paidAt || '—'}</td><td className="px-3 py-2 pl-6 text-[var(--text-muted)]">Avance</td><td className="px-3 py-2 text-right text-[var(--text-muted)]">—</td><td className="px-3 py-2 text-right tabular-nums text-emerald-500">{formatCompactMoney(payment.amount, 'MAD')}</td><td className="px-3 py-2">{paymentMethods.find((method) => method.id === payment.method)?.label || payment.method || '—'}</td><td className="px-3 py-2 text-right text-[var(--text-muted)]">—</td>
                                                        </tr>
                                                    ))}
                                                </Fragment>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : <p className="rounded-[var(--radius-md)] border border-dashed border-[var(--border)] p-3 text-xs text-[var(--text-muted)]">Aucune ligne negociee pour ce projet. Creez la premiere ligne ci-dessous.</p>}

                            <div className="grid gap-2 sm:grid-cols-2">
                                <div className="flex min-w-0 flex-col gap-1">
                                    <label className={labelCls}>Ligne existante</label>
                                    <Select selectedKey={negotiatedLineId || null} onSelectionChange={(key) => {
                                        const id = key != null ? String(key) : '';
                                        const line = selectedDossier?.negotiatedPaymentLines?.find((item) => item.id === id);
                                        setNegotiatedLineId(id);
                                        setNewDesignation('');
                                        setNewNegotiatedAmount('');
                                        setReceiptItems(makeNegotiatedReceiptItems(normalizeNumber(advanceAmount), line?.designation || ''));
                                    }}>
                                        <Select.Trigger className={compactTrigger}><Select.Value className="flex-1 text-xs text-[var(--foreground)]" /><Select.Indicator /></Select.Trigger>
                                        <Select.Popover className={compactPopover}><ListBox className="p-1 gap-0">
                                            {(selectedDossier?.negotiatedPaymentLines || []).filter((line) => line.remainingAmount > 0).map((line) => <ListBox.Item key={line.id} id={line.id} textValue={line.designation} className={compactItem}>{line.designation} · reste {formatCompactMoney(line.remainingAmount, 'MAD')}</ListBox.Item>)}
                                        </ListBox></Select.Popover>
                                    </Select>
                                </div>
                                <div className="flex min-w-0 flex-col gap-1">
                                    <label className={labelCls}>Avance</label>
                                    <Input className={compactInput} type="number" min="0" step="0.01" value={advanceAmount} onChange={(event) => updateAdvance(event.target.value)} aria-invalid={isOverpayment} />
                                    {isOverpayment ? <p className="text-[10px] text-[var(--danger)]">L avance depasse le reste negocie.</p> : null}
                                </div>
                            </div>

                            {!selectedNegotiatedLine ? <div className="grid gap-2 sm:grid-cols-2">
                                <div className="flex min-w-0 flex-col gap-1"><label className={labelCls}>Nouvelle designation / objet</label><Input className={compactInput} value={newDesignation} onChange={(event) => { setNewDesignation(event.target.value); setReceiptItems(makeNegotiatedReceiptItems(normalizeNumber(advanceAmount), event.target.value)); }} placeholder="Etude architecturale" /></div>
                                <div className="flex min-w-0 flex-col gap-1"><label className={labelCls}>Montant negocie</label><Input className={compactInput} type="number" min="0" step="0.01" value={newNegotiatedAmount} onChange={(event) => setNewNegotiatedAmount(event.target.value)} /></div>
                            </div> : null}

                            <div className="flex items-center justify-between gap-3 border-t border-[var(--border)] pt-3 text-xs">
                                <span className="text-[var(--text-muted)]">Reste apres cette avance</span>
                                <strong className="tabular-nums">{formatCompactMoney(Math.max(0, negotiatedLimit - amount), 'MAD')}</strong>
                            </div>
                        </Card>
                    ) : null}

                    {activeInvoice ? (
                        <Card className="p-3">
                            <div className="flex items-center gap-2 text-xs font-semibold"><IconReceipt2 size={14} />{activeInvoice.number}</div>
                            <div className="mt-2 grid gap-2 text-[10px] sm:grid-cols-3">
                                <p>Total TTC : <strong>{formatCompactMoney(activeInvoice.totalTtc, activeInvoice.currency)}</strong></p>
                                <p>Payé : <strong>{formatCompactMoney(activeInvoice.paidTotal, activeInvoice.currency)}</strong></p>
                                <p>Restant: <strong>{formatCompactMoney(activeInvoice.remainingTotal, activeInvoice.currency)}</strong></p>
                            </div>
                        </Card>
                    ) : null}

                    <div className="max-w-md">
                        <DateField label="Date paiement" value={strToDate(form.paidAt)} onChange={(d) => update('paidAt', dateToStr(d))} />
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2">
                        <div className="flex min-w-0 flex-col gap-1">
                            <label className={labelCls}>Mode de paiement</label>
                            <Select
                                selectedKey={form.method || null}
                                onSelectionChange={(key) => { update('method', key != null ? String(key) : ''); }}
                            >
                                <Select.Trigger className={compactTrigger}><Select.Value className="flex-1 text-xs text-[var(--foreground)]" /><Select.Indicator /></Select.Trigger>
                                <Select.Popover className={compactPopover}><ListBox className="p-1 gap-0">
                                    {paymentMethods.map((pm) => (
                                        <ListBox.Item key={pm.id} id={pm.id} textValue={pm.label} className={compactItem}>{pm.label}</ListBox.Item>
                                    ))}
                                </ListBox></Select.Popover>
                            </Select>
                        </div>
                        <div className="flex min-w-0 flex-col gap-1">
                            <label className={labelCls}>Reference</label>
                            <Input className={compactInput} value={form.reference} onChange={(e) => update('reference', e.target.value)} />
                        </div>
                    </div>

                    {paymentMode === 'invoice' ? (
                        <Card className="p-3">
                            <FinanceItemsTable
                                items={receiptItems}
                                currency={activeInvoice?.currency || 'MAD'}
                                tvaRate={0}
                                onChange={setReceiptItems}
                            />
                            <div className="mt-3 flex items-center justify-between gap-3 border-t border-[var(--border)] pt-3 text-xs text-[var(--text-muted)]">
                                <span>Le total des lignes sera utilisé pour le paiement.</span>
                                <strong className="shrink-0 tabular-nums">{formatCompactMoney(receiptTotal, activeInvoice?.currency || 'MAD')}</strong>
                            </div>
                        </Card>
                    ) : null}

                    {activeInvoice ? (
                        <Card className={`p-3 ${isOverpayment ? 'border-red-300' : ''}`}>
                            <div className="flex items-center gap-2 text-xs font-semibold">
                                {isOverpayment ? <IconAlertTriangle size={14} className="text-red-500" /> : null}
                                Resultat apres paiement
                            </div>
                            <div className="mt-2 grid gap-2 text-[10px] sm:grid-cols-3">
                                <p>Paiement: <strong>{formatCompactMoney(amount, activeInvoice.currency)}</strong></p>
                                <p>Reste: <strong>{formatCompactMoney(remainingAfter, activeInvoice.currency)}</strong></p>
                                <p>Statut: <strong>{isFullPayment ? 'Complet' : 'Partiel'}</strong></p>
                            </div>
                        </Card>
                    ) : null}

                    <div className="flex min-w-0 flex-col gap-1">
                        <label className={labelCls}>Notes</label>
                        <TextArea className={compactTextarea} value={form.notes} onChange={(e) => update('notes', e.target.value)} />
                    </div>
                </div>
            </AppDrawer>

            <Modal.Backdrop isOpen={Boolean(receiptPrompt)} onOpenChange={(open) => { if (!open) setReceiptPrompt(null); }} isDismissable className="z-[90] bg-black/65 backdrop-blur-sm">
                <Modal.Container size="md" placement="center" className="p-3">
                    <Modal.Dialog className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] shadow-2xl">
                        <Modal.Header className="border-b border-[var(--border)] px-5 py-4 pr-12">
                            <div className="flex min-w-0 items-center gap-3">
                                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/12 text-emerald-500"><IconCircleCheck size={21} /></div>
                                <div className="min-w-0"><Modal.Heading className="text-sm font-semibold">Paiement enregistré</Modal.Heading><p className="mt-0.5 text-xs text-[var(--text-muted)]">Reçu {receiptPrompt?.number} prêt.</p></div>
                            </div>
                            <Modal.CloseTrigger aria-label="Fermer" />
                        </Modal.Header>
                        <Modal.Body className="space-y-4 px-5 py-4">
                            <div className="grid gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)]/60 p-3 text-xs sm:grid-cols-2">
                                <div><p className={labelCls}>Client</p><p className="mt-1 truncate font-semibold">{receiptPrompt?.clientName || 'Client non renseigné'}</p></div>
                                <div><p className={labelCls}>Montant reçu</p><p className="mt-1 font-semibold tabular-nums text-emerald-500">{formatCompactMoney(receiptPrompt?.amount || 0, receiptPrompt?.currency || 'MAD')}</p></div>
                                <div className="sm:col-span-2"><p className={labelCls}>Reste à encaisser</p><p className="mt-1 font-semibold tabular-nums">{formatCompactMoney(receiptPrompt?.remainingTotal || 0, receiptPrompt?.currency || 'MAD')}</p></div>
                            </div>
                        </Modal.Body>
                        <Modal.Footer className="flex flex-col-reverse gap-2 border-t border-[var(--border)] px-5 py-3 sm:flex-row sm:justify-end">
                            <Button variant="ghost" size="sm" onPress={() => setReceiptPrompt(null)}>Plus tard</Button>
                            <Button variant="secondary" size="sm" onPress={() => openUrl(receiptPrompt?.showUrl, 'Reçu indisponible.')}><IconReceipt2 size={14} /> Ouvrir</Button>
                            <Button variant="primary" size="sm" onPress={() => openUrl(receiptPrompt?.printUrl, 'Impression indisponible.')}><IconPrinter size={14} /> Imprimer maintenant</Button>
                        </Modal.Footer>
                    </Modal.Dialog>
                </Modal.Container>
            </Modal.Backdrop>
        </>
    );
}
