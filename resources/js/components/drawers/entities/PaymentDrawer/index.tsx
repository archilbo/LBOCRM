import { useEffect, useMemo, useState } from 'react';
import { router } from '@inertiajs/react';
import { Dialog, Heading, Modal, ModalOverlay } from 'react-aria-components';
import { IconAlertTriangle, IconFileDownload, IconFileSpreadsheet, IconFileText, IconPrinter, IconReceipt2 } from '@tabler/icons-react';

import { Button, Card, Input, ListBox, Select, TextArea } from '@heroui/react';
import { AppAutocomplete } from '@/components/ui/AppAutocomplete';
import { toast } from 'sonner';
import { AppDrawer } from '@/components/ui/AppDrawer';
import { DateField } from '@/features/archives/components/DateField';
import { strToDate, dateToStr } from '@/lib/dateUtils';
import type { ClientOption, DossierOption, FinanceDocument } from '@/features/finance/types';
import { formatCompactMoney, normalizeNumber } from '@/features/finance/utils/calculations';

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
    allowAdvancePayment?: boolean;
    returnTo?: string;
};

type PaymentForm = { financeDocumentId: string; dossierId: string; amount: string; method: string; reference: string; paidAt: string; notes: string; };

type PaymentReceiptFlash = { paymentNumber: string; number: string; showUrl: string | null; generatePdfUrl: string | null; generateExcelUrl: string | null; pdfDownloadUrl: string | null; excelDownloadUrl: string | null; };

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
        amount: selectedInvoice ? String(selectedInvoice.remainingTotal) : '',
        method: 'cash', reference: '', paidAt: new Date().toISOString().slice(0, 10), notes: '',
    };
}

export function PaymentDrawer({ isOpen, onOpenChange, invoices, invoice, clients = [], dossiers = [], defaultClientId, defaultDossierId, lockClientContext = false, lockDossierContext = false, allowAdvancePayment = false, returnTo }: PaymentDrawerProps) {
    const [form, setForm] = useState<PaymentForm>(() => makeForm(invoice, defaultDossierId));
    const [selectedClientId, setSelectedClientId] = useState(defaultClientId || '');
    const [receiptPrompt, setReceiptPrompt] = useState<PaymentReceiptFlash | null>(null);
    const payableInvoices = useMemo(
        () => invoices.filter((item) => item.type === 'invoice' && item.status !== 'cancelled' && item.remainingTotal > 0),
        [invoices],
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
        () => dossiers.filter((dossier) => !selectedClientId || dossier.clientId === selectedClientId),
        [dossiers, selectedClientId],
    );
    const settledInvoiceCount = useMemo(
        () => activeInvoices.filter((item) => (!selectedClientId || String(item.client?.id) === selectedClientId) && item.remainingTotal <= 0).length,
        [activeInvoices, selectedClientId],
    );
    const activeInvoice = filteredInvoices.find((item) => String(item.id) === form.financeDocumentId) || (invoice && String(invoice.id) === form.financeDocumentId ? invoice : null);
    const selectedDossier = filteredDossiers.find((dossier) => dossier.id === form.dossierId) || null;
    const canRecordAdvance = allowAdvancePayment && !activeInvoice && Boolean(selectedDossier);
    const amount = normalizeNumber(form.amount);
    const remainingBefore = activeInvoice?.remainingTotal || 0;
    const remainingAfter = Math.max(0, remainingBefore - amount);
    const isOverpayment = amount > remainingBefore && remainingBefore > 0;
    const isFullPayment = activeInvoice ? amount === remainingBefore && amount > 0 : false;
    const canSubmit = (Boolean(activeInvoice) && amount > 0 && !isOverpayment) || (canRecordAdvance && amount > 0);

    useEffect(() => {
        if (!isOpen) return;

        setForm(makeForm(invoice, defaultDossierId));
        setSelectedClientId(invoice?.client?.id ? String(invoice.client.id) : (defaultClientId || ''));
    }, [defaultClientId, defaultDossierId, invoice, isOpen]);

    function update<K extends keyof PaymentForm>(key: K, value: PaymentForm[K]) { setForm((p) => ({ ...p, [key]: value })); }

    function submit() {
        if (!canSubmit) { toast.error(isOverpayment ? 'Le montant depasse le reste a payer.' : 'Choisissez une facture ou un dossier pour l avance.'); return; }
        router.post('/finance/payments', {
            finance_document_id: activeInvoice ? form.financeDocumentId : null,
            client_id: activeInvoice ? null : (selectedClientId || null),
            dossier_id: canRecordAdvance ? form.dossierId : null,
            amount, method: form.method || null,
            reference: form.reference || null, paid_at: form.paidAt || null, notes: form.notes || null, return_to: returnTo || null,
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

    function generateReceiptFile(url: string | null | undefined, label: string) {
        if (!url) { toast.error('Action indisponible.'); return; }
        router.put(url, { return_to: returnTo || null }, { preserveScroll: true, preserveState: true, onStart: () => toast.loading(`${label}...`, { id: label }), onSuccess: () => toast.success(`${label} fait.`, { id: label }), onError: () => toast.error(`${label} impossible.`, { id: label }) });
    }

    return (
        <>
            <AppDrawer
                isOpen={isOpen} onOpenChange={onOpenChange}
                title="Enregistrer un paiement"
                                description="Reglez une facture ou enregistrez une avance avant la creation des documents financiers."
                footer={
                    <div className="flex items-center gap-2">
                        <Button variant="light" size="sm" onPress={() => onOpenChange(false)}>Annuler</Button>
                        <Button color="warning" size="sm" onPress={submit} isDisabled={!canSubmit}>Enregistrer + recu</Button>
                    </div>
                }
            >
                <div className="space-y-3">
                    <Card className="p-3 space-y-3">
                        <div className="flex items-center gap-1.5 mb-2"><IconReceipt2 size={13} className="text-[var(--text-subtle)]" /><p className={labelCls}>Paiement</p></div>
                        {clients.length > 0 ? (
                            <div className="flex min-w-0 flex-col gap-1">
                                <label className={labelCls}>Client</label>
                                <AppAutocomplete
                                    value={selectedClientId}
                                    onChange={(v) => {
                                        setSelectedClientId(v);
                                        setForm((prev) => ({ ...prev, financeDocumentId: '', dossierId: '' }));
                                    }}
                                    options={clients}
                                    placeholder="Tous les clients"
                                    isDisabled={lockClientContext}
                                />
                            </div>
                        ) : null}
                        {dossiers.length > 0 ? (
                            <div className="flex min-w-0 flex-col gap-1">
                                <label className={labelCls}>Dossier</label>
                                <AppAutocomplete
                                    value={form.dossierId}
                                    onChange={(v) => {
                                        setForm((prev) => ({ ...prev, dossierId: v, financeDocumentId: '' }));
                                    }}
                                    options={filteredDossiers}
                                    placeholder="Choisir un dossier"
                                    isDisabled={lockDossierContext}
                                />
                            </div>
                        ) : null}
                        <div className="flex min-w-0 flex-col gap-1">
                            <label className={labelCls}>Facture</label>
                            <Select
                                placeholder={selectedClientId && filteredInvoices.length === 0 ? 'Aucune facture impayee disponible' : 'Choisir une facture'}
                                selectedKey={form.financeDocumentId || null}
                                isDisabled={Boolean(invoice && lockClientContext)}
                                onSelectionChange={(key) => {
                                    const id = key != null ? String(key) : '';
                                    const selected = filteredInvoices.find((item) => String(item.id) === id);
                                    setForm((prev) => ({ ...prev, financeDocumentId: id, amount: selected ? String(selected.remainingTotal) : '' }));
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
                            {selectedClientId && filteredInvoices.length === 0 && !canRecordAdvance ? (
                                <p className="flex items-start gap-1.5 text-[10px] leading-4 text-[var(--text-muted)]">
                                    <IconAlertTriangle size={13} className="mt-0.5 shrink-0 text-amber-400" />
                                    {settledInvoiceCount > 0
                                        ? "Les factures de ce client sont deja reglees. Creez une nouvelle facture ou corrigez un paiement existant avant d'enregistrer un autre reglement."
                                        : 'Aucune facture active a regler pour ce client.'}
                                </p>
                            ) : null}
                        </div>
                    </Card>

                    {canRecordAdvance ? (
                        <Card className="border border-[color-mix(in_srgb,var(--accent)_35%,var(--border))] bg-[color-mix(in_srgb,var(--accent)_8%,var(--surface))] p-3 text-xs text-[var(--foreground)]">
                            <p className="font-semibold">Avance dossier</p>
                            <p className="mt-1 leading-5 text-[var(--text-muted)]">Aucun devis ni facture active ne bloque ce paiement. Un recu sera cree et l avance sera rattachee automatiquement a la prochaine facture.</p>
                        </Card>
                    ) : null}

                    {activeInvoice ? (
                        <Card className="p-3">
                            <div className="flex items-center gap-2 text-xs font-semibold"><IconReceipt2 size={14} />{activeInvoice.number}</div>
                            <div className="mt-2 grid gap-2 text-[10px] sm:grid-cols-3">
                                <p>Total TTC: <strong>{formatCompactMoney(activeInvoice.totalTtc, activeInvoice.currency)}</strong></p>
                                <p>Paye: <strong>{formatCompactMoney(activeInvoice.paidTotal, activeInvoice.currency)}</strong></p>
                                <p>Restant: <strong>{formatCompactMoney(activeInvoice.remainingTotal, activeInvoice.currency)}</strong></p>
                            </div>
                        </Card>
                    ) : null}

                    <div className="grid gap-2 sm:grid-cols-2">
                        <div className="flex min-w-0 flex-col gap-1">
                            <label className={labelCls}>Montant paye</label>
                            <Input className={compactInput} type="number" min="0" step="0.01" value={form.amount}
                                onChange={(e) => update('amount', e.target.value)}
                                validationState={isOverpayment ? 'invalid' : 'valid'}
                                errorMessage={isOverpayment ? 'Depasse le reste a payer.' : undefined}
                            />
                        </div>
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

            <ModalOverlay isOpen={Boolean(receiptPrompt)} onOpenChange={(open) => { if (!open) setReceiptPrompt(null); }} className="app-modal-overlay app-dialog-overlay" isDismissable>
                <Modal className="app-dialog-panel max-w-xl">
                    <Dialog className="outline-none">
                        {({ close }) => (
                            <div className="p-5">
                                <div className="flex gap-4">
                                    <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300"><IconReceipt2 size={20} /></div>
                                    <div className="min-w-0">
                                        <Heading slot="title" className="text-base font-semibold">Recu cree: {receiptPrompt?.number}</Heading>
                                        <p className="mt-1 text-sm leading-6 text-[var(--text-muted)]">Paiement {receiptPrompt?.paymentNumber} enregistre. Voulez-vous ouvrir, imprimer ou sauvegarder le recu ?</p>
                                    </div>
                                </div>
                                <div className="mt-5 grid gap-2 sm:grid-cols-2">
                                    <Button color="warning" size="sm" onPress={() => openUrl(receiptPrompt?.showUrl)}><IconPrinter size={14} /> Ouvrir / imprimer</Button>
                                    <Button variant="flat" size="sm" onPress={() => generateReceiptFile(receiptPrompt?.generatePdfUrl, 'Generation PDF')}><IconFileText size={14} /> Generer PDF</Button>
                                    <Button variant="flat" size="sm" onPress={() => openUrl(receiptPrompt?.pdfDownloadUrl, 'PDF non genere.')}><IconFileDownload size={14} /> Telecharger PDF</Button>
                                    <Button variant="flat" size="sm" onPress={() => receiptPrompt?.excelDownloadUrl ? openUrl(receiptPrompt.excelDownloadUrl) : generateReceiptFile(receiptPrompt?.generateExcelUrl, 'Generation Excel')}><IconFileSpreadsheet size={14} /> Excel</Button>
                                </div>
                                <div className="mt-5 flex justify-end"><Button variant="light" size="sm" onPress={close}>Plus tard</Button></div>
                            </div>
                        )}
                    </Dialog>
                </Modal>
            </ModalOverlay>
        </>
    );
}
