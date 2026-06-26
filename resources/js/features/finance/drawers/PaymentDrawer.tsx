import { useEffect, useMemo, useState } from 'react';
import { router } from '@inertiajs/react';
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

const today = () => new Date().toISOString().slice(0, 10);

export function PaymentDrawer({ isOpen, onOpenChange, invoices, invoice }: PaymentDrawerProps) {
    const selectedInvoice = useMemo(
        () => invoice || invoices[0] || null,
        [invoice, invoices],
    );

    const [form, setForm] = useState<PaymentForm>({
        financeDocumentId: selectedInvoice ? String(selectedInvoice.id) : '',
        amount: selectedInvoice ? String(selectedInvoice.remainingTotal) : '',
        method: 'cash',
        reference: '',
        paidAt: today(),
        notes: '',
    });

    useEffect(() => {
        if (isOpen) {
            setForm({
                financeDocumentId: selectedInvoice ? String(selectedInvoice.id) : '',
                amount: selectedInvoice ? String(selectedInvoice.remainingTotal) : '',
                method: 'cash',
                reference: '',
                paidAt: today(),
                notes: '',
            });
        }
    }, [isOpen, selectedInvoice]);

    const activeInvoice = invoices.find((row) => String(row.id) === form.financeDocumentId) || selectedInvoice;
    const remainingAfter = Math.max(0, (activeInvoice?.remainingTotal || 0) - normalizeNumber(form.amount));

    function submit() {
        router.post('/finance/payments', {
            finance_document_id: form.financeDocumentId,
            amount: normalizeNumber(form.amount),
            method: form.method || null,
            reference: form.reference || null,
            paid_at: form.paidAt || null,
            notes: form.notes || null,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Paiement enregistre.');
                onOpenChange(false);
            },
            onError: () => toast.error('Impossible enregistrer le paiement.'),
        });
    }

    return (
        <AppDrawer
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            title="Enregistrer un paiement"
            description="Ajouter un paiement sur une facture existante."
            footer={
                <>
                    <AppButton variant="ghost" onPress={() => onOpenChange(false)}>Annuler</AppButton>
                    <AppButton variant="primary" onPress={submit} isDisabled={!form.financeDocumentId || normalizeNumber(form.amount) <= 0}>Enregistrer</AppButton>
                </>
            }
        >
            <div className="space-y-4">
                <AppSelect
                    label="Facture"
                    options={invoices.map((row) => ({ id: String(row.id), label: `${row.number} - ${row.client?.name || 'Client'}` }))}
                    selectedKey={form.financeDocumentId || null}
                    onSelectionChange={(key) => setForm((prev) => ({ ...prev, financeDocumentId: key ? String(key) : '' }))}
                />
                {activeInvoice ? (
                    <div className="grid gap-2 rounded-2xl border bg-[var(--surface-2)] p-3 text-sm sm:grid-cols-3">
                        <p>Total: <strong>{formatMoney(activeInvoice.totalTtc, activeInvoice.currency)}</strong></p>
                        <p>Paye: <strong>{formatMoney(activeInvoice.paidTotal, activeInvoice.currency)}</strong></p>
                        <p>Restant apres: <strong>{formatMoney(remainingAfter, activeInvoice.currency)}</strong></p>
                    </div>
                ) : null}
                <AppTextField label="Montant" type="number" min="0" step="0.01" value={form.amount} onChange={(value) => setForm((prev) => ({ ...prev, amount: value }))} />
                <AppSelect
                    label="Mode de paiement"
                    options={[
                        { id: 'cash', label: 'Espece' },
                        { id: 'bank_transfer', label: 'Virement' },
                        { id: 'check', label: 'Cheque' },
                        { id: 'card', label: 'Carte' },
                        { id: 'other', label: 'Autre' },
                    ]}
                    selectedKey={form.method}
                    onSelectionChange={(key) => setForm((prev) => ({ ...prev, method: key ? String(key) : '' }))}
                />
                <AppTextField label="Reference" value={form.reference} onChange={(value) => setForm((prev) => ({ ...prev, reference: value }))} />
                <AppDatePicker label="Date paiement" value={form.paidAt} onChange={(value) => setForm((prev) => ({ ...prev, paidAt: value }))} />
                <AppTextarea label="Notes" value={form.notes} onChange={(value) => setForm((prev) => ({ ...prev, notes: value }))} />
            </div>
        </AppDrawer>
    );
}

