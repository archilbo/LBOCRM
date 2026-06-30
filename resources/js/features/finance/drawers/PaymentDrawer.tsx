import { useEffect, useMemo, useState } from 'react';
import { router } from '@inertiajs/react';
import { Dialog, Heading, Modal, ModalOverlay } from 'react-aria-components';
import { AlertTriangle, FileDown, FileSpreadsheet, FileText, Printer, ReceiptText } from 'lucide-react';
import { toast } from 'sonner';
import { AppButton } from '@/components/ui/AppButton';
import { AppDatePicker } from '@/components/ui/AppDatePicker';
import { AppDrawer } from '@/components/ui/AppDrawer';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppTextField } from '@/components/ui/AppTextField';
import { AppTextarea } from '@/components/ui/AppTextarea';
import type { FinanceDocument } from '@/features/finance/types';
import { formatMoney, normalizeNumber } from '@/features/finance/utils/calculations';

type PaymentDrawerProps = {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    invoices: FinanceDocument[];
    invoice?: FinanceDocument | null;
};

type PaymentForm = {
    financeDocumentId: string;
    amount: string;
    method: string;
    reference: string;
    paidAt: string;
    notes: string;
};

type PaymentReceiptFlash = {
    paymentNumber: string;
    number: string;
    showUrl: string | null;
    generatePdfUrl: string | null;
    generateExcelUrl: string | null;
    pdfDownloadUrl: string | null;
    excelDownloadUrl: string | null;
};

type PaymentSuccessPage = {
    props?: {
        flash?: {
            receipt?: PaymentReceiptFlash | null;
        };
    };
};

const today = () => new Date().toISOString().slice(0, 10);

const paymentMethods = [
    { id: 'cash', label: 'Especes' },
    { id: 'bank_transfer', label: 'Virement bancaire' },
    { id: 'check', label: 'Cheque' },
    { id: 'card', label: 'Carte bancaire' },
    { id: 'other', label: 'Autre' },
];

function makeForm(selectedInvoice?: FinanceDocument | null): PaymentForm {
    return {
        financeDocumentId: selectedInvoice ? String(selectedInvoice.id) : '',
        amount: selectedInvoice ? String(selectedInvoice.remainingTotal) : '',
        method: 'cash',
        reference: '',
        paidAt: today(),
        notes: '',
    };
}

export function PaymentDrawer({ isOpen, onOpenChange, invoices, invoice }: PaymentDrawerProps) {
    const [form, setForm] = useState<PaymentForm>(() => makeForm(invoice));
    const [receiptPrompt, setReceiptPrompt] = useState<PaymentReceiptFlash | null>(null);
    const payableInvoices = useMemo(
        () => invoices.filter((item) => item.type === 'invoice' && item.status !== 'cancelled' && item.remainingTotal > 0),
        [invoices],
    );

    const activeInvoice = payableInvoices.find((item) => String(item.id) === form.financeDocumentId) || invoice || null;
    const amount = normalizeNumber(form.amount);
    const remainingBefore = activeInvoice?.remainingTotal || 0;
    const remainingAfter = Math.max(0, remainingBefore - amount);
    const isOverpayment = amount > remainingBefore && remainingBefore > 0;
    const isFullPayment = activeInvoice ? amount === remainingBefore && amount > 0 : false;
    const canSubmit = Boolean(form.financeDocumentId) && amount > 0 && !isOverpayment;

    useEffect(() => {
        if (isOpen) {
            setForm(makeForm(invoice));
        }
    }, [invoice, isOpen]);

    function update<K extends keyof PaymentForm>(key: K, value: PaymentForm[K]) {
        setForm((prev) => ({ ...prev, [key]: value }));
    }

    function submit() {
        if (!canSubmit) {
            toast.error(isOverpayment ? 'Le montant depasse le reste a payer.' : 'Paiement invalide.');
            return;
        }

        router.post('/finance/payments', {
            finance_document_id: form.financeDocumentId,
            amount,
            method: form.method || null,
            reference: form.reference || null,
            paid_at: form.paidAt || null,
            notes: form.notes || null,
        }, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: (page) => {
                const receipt = (page as PaymentSuccessPage).props?.flash?.receipt ?? null;
                toast.success('Paiement enregistre. Le recu est cree automatiquement.');
                onOpenChange(false);

                if (receipt) {
                    setReceiptPrompt(receipt);
                }
            },
            onError: (errors) => {
                const firstError = Object.values(errors)[0];
                toast.error(typeof firstError === 'string' ? firstError : 'Impossible enregistrer le paiement.');
            },
        });
    }

    function openUrl(url: string | null | undefined, errorMessage = 'Lien recu indisponible.') {
        if (!url) {
            toast.error(errorMessage);
            return;
        }

        window.open(url, '_blank');
    }

    function generateReceiptFile(url: string | null | undefined, label: string) {
        if (!url) {
            toast.error('Action recu indisponible.');
            return;
        }

        router.put(url, {}, {
            preserveScroll: true,
            preserveState: true,
            onStart: () => toast.loading(`${label} en cours...`, { id: label }),
            onSuccess: () => toast.success(`${label} termine.`, { id: label }),
            onError: () => toast.error(`${label} impossible.`, { id: label }),
        });
    }

    return (
        <>
            <AppDrawer
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                title="Enregistrer un paiement"
                description="Ajouter un paiement sur une facture. Le reste a payer est recalcule et un recu est cree automatiquement."
                footer={
                    <>
                        <AppButton variant="ghost" onPress={() => onOpenChange(false)}>Annuler</AppButton>
                        <AppButton variant="primary" onPress={submit} isDisabled={!canSubmit}>Enregistrer + creer recu</AppButton>
                    </>
                }
            >
                <div className="space-y-5">
                    <AppSelect
                        label="Facture"
                        placeholder="Choisir une facture"
                        options={payableInvoices.map((item) => ({
                            id: String(item.id),
                            label: `${item.number} - ${formatMoney(item.remainingTotal, item.currency)} restant`,
                        }))}
                        selectedKey={form.financeDocumentId || null}
                        onSelectionChange={(key) => {
                            const id = key ? String(key) : '';
                            const selected = payableInvoices.find((item) => String(item.id) === id);
                            setForm((prev) => ({
                                ...prev,
                                financeDocumentId: id,
                                amount: selected ? String(selected.remainingTotal) : '',
                            }));
                        }}
                    />

                    {activeInvoice ? (
                        <div className="rounded-2xl border bg-[var(--surface-2)] p-4 text-sm">
                            <div className="flex items-center gap-2 font-semibold">
                                <ReceiptText size={16} />
                                {activeInvoice.number}
                            </div>
                            <div className="mt-3 grid gap-2 sm:grid-cols-3">
                                <p>Total TTC: <strong>{formatMoney(activeInvoice.totalTtc, activeInvoice.currency)}</strong></p>
                                <p>Paye: <strong>{formatMoney(activeInvoice.paidTotal, activeInvoice.currency)}</strong></p>
                                <p>Restant: <strong>{formatMoney(activeInvoice.remainingTotal, activeInvoice.currency)}</strong></p>
                            </div>
                        </div>
                    ) : null}

                    <div className="grid gap-3 sm:grid-cols-2">
                        <AppTextField
                            label="Montant paye"
                            type="number"
                            min="0"
                            step="0.01"
                            value={form.amount}
                            onChange={(value) => update('amount', value)}
                            error={isOverpayment ? 'Le montant depasse le reste a payer.' : undefined}
                        />

                        <AppDatePicker
                            label="Date paiement"
                            value={form.paidAt}
                            onChange={(value) => update('paidAt', value)}
                        />
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                        <AppSelect
                            label="Mode de paiement"
                            options={paymentMethods}
                            selectedKey={form.method}
                            onSelectionChange={(key) => update('method', key ? String(key) : '')}
                        />

                        <AppTextField
                            label="Reference"
                            value={form.reference}
                            onChange={(value) => update('reference', value)}
                        />
                    </div>

                    {activeInvoice ? (
                        <div className={`rounded-2xl border p-4 text-sm ${isOverpayment ? 'border-red-300 bg-red-50 text-red-800' : 'bg-[var(--surface-2)]'}`}>
                            <div className="flex items-center gap-2 font-semibold">
                                {isOverpayment ? <AlertTriangle size={16} /> : null}
                                Resultat apres paiement
                            </div>
                            <div className="mt-3 grid gap-2 sm:grid-cols-3">
                                <p>Paiement: <strong>{formatMoney(amount, activeInvoice.currency)}</strong></p>
                                <p>Reste apres: <strong>{formatMoney(remainingAfter, activeInvoice.currency)}</strong></p>
                                <p>Statut: <strong>{isFullPayment ? 'Paiement complet' : 'Paiement partiel'}</strong></p>
                            </div>
                        </div>
                    ) : null}

                    <AppTextarea
                        label="Notes"
                        value={form.notes}
                        onChange={(value) => update('notes', value)}
                    />
                </div>
            </AppDrawer>

            <ModalOverlay
                isOpen={Boolean(receiptPrompt)}
                onOpenChange={(open) => {
                    if (!open) setReceiptPrompt(null);
                }}
                className="app-modal-overlay app-dialog-overlay"
                isDismissable
            >
                <Modal className="app-dialog-panel max-w-xl">
                    <Dialog className="outline-none">
                        {({ close }) => (
                            <div className="p-5">
                                <div className="flex gap-4">
                                    <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
                                        <ReceiptText size={20} />
                                    </div>
                                    <div className="min-w-0">
                                        <Heading slot="title" className="text-base font-semibold">
                                            Recu cree: {receiptPrompt?.number}
                                        </Heading>
                                        <p className="mt-1 text-sm leading-6 text-[var(--text-muted)]">
                                            Paiement {receiptPrompt?.paymentNumber} enregistre. Voulez-vous ouvrir, imprimer ou sauvegarder le recu maintenant ?
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-5 grid gap-2 sm:grid-cols-2">
                                    <AppButton variant="primary" onPress={() => openUrl(receiptPrompt?.showUrl)}>
                                        <Printer size={16} />
                                        Ouvrir / imprimer
                                    </AppButton>
                                    <AppButton variant="secondary" onPress={() => generateReceiptFile(receiptPrompt?.generatePdfUrl, 'Generation PDF recu')}>
                                        <FileText size={16} />
                                        Generer PDF
                                    </AppButton>
                                    <AppButton variant="secondary" onPress={() => openUrl(receiptPrompt?.pdfDownloadUrl, 'PDF recu non genere.')}>
                                        <FileDown size={16} />
                                        Telecharger PDF
                                    </AppButton>
                                    <AppButton variant="secondary" onPress={() => receiptPrompt?.excelDownloadUrl ? openUrl(receiptPrompt.excelDownloadUrl) : generateReceiptFile(receiptPrompt?.generateExcelUrl, 'Generation Excel recu')}>
                                        <FileSpreadsheet size={16} />
                                        Excel
                                    </AppButton>
                                </div>

                                <div className="mt-5 flex justify-end">
                                    <AppButton variant="ghost" onPress={close}>Plus tard</AppButton>
                                </div>
                            </div>
                        )}
                    </Dialog>
                </Modal>
            </ModalOverlay>
        </>
    );
}
