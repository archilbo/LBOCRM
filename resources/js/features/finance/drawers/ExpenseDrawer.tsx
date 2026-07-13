import { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import { AppButton } from '@/components/ui/AppButton';
import { AppDatePicker } from '@/components/ui/AppDatePicker';
import { AppDrawer } from '@/components/ui/AppDrawer';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppTextField } from '@/components/ui/AppTextField';
import { AppTextarea } from '@/components/ui/AppTextarea';
import type { Expense } from '@/features/finance/types';

type ExpenseDrawerProps = {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    expense?: Expense | null;
};

type ExpenseForm = {
    category: string;
    vendor: string;
    amount: string;
    currency: string;
    expenseDate: string;
    paymentMethod: string;
    notes: string;
    dossierId: string;
};

const categories = [
    { id: 'administrative', label: 'Administratif' },
    { id: 'travel', label: 'Deplacement' },
    { id: 'supplies', label: 'Fournitures' },
    { id: 'equipment', label: 'Equipement' },
    { id: 'utilities', label: 'Services publics' },
    { id: 'professional_fees', label: 'Honoraires professionnels' },
    { id: 'taxes', label: 'Impot et taxes' },
    { id: 'other', label: 'Autre' },
];

const paymentMethods = [
    { id: 'cash', label: 'Especes' },
    { id: 'bank_transfer', label: 'Virement bancaire' },
    { id: 'check', label: 'Cheque' },
    { id: 'card', label: 'Carte bancaire' },
    { id: 'other', label: 'Autre' },
];

const today = () => new Date().toISOString().slice(0, 10);

const defaultForm: ExpenseForm = {
    category: 'other',
    vendor: '',
    amount: '',
    currency: 'MAD',
    expenseDate: today(),
    paymentMethod: 'cash',
    notes: '',
    dossierId: '',
};

function formFromExpense(expense?: Expense | null): ExpenseForm {
    if (!expense) return { ...defaultForm };
    return {
        category: expense.category,
        vendor: expense.vendor ?? '',
        amount: String(expense.amount),
        currency: expense.currency,
        expenseDate: expense.expenseDate,
        paymentMethod: expense.paymentMethod ?? '',
        notes: expense.notes ?? '',
        dossierId: String(expense.dossier?.id ?? ''),
    };
}

export function ExpenseDrawer({ isOpen, onOpenChange, expense }: ExpenseDrawerProps) {
    const [form, setForm] = useState<ExpenseForm>(() => formFromExpense(expense));
    const isEditing = Boolean(expense);

    useEffect(() => {
        if (isOpen) {
            setForm(formFromExpense(expense));
        }
    }, [expense, isOpen]);

    function update<K extends keyof ExpenseForm>(key: K, value: ExpenseForm[K]) {
        setForm((prev) => ({ ...prev, [key]: value }));
    }

    function submit() {
        const payload = {
            category: form.category,
            vendor: form.vendor || null,
            amount: Number.parseFloat(form.amount) || 0,
            currency: form.currency || 'MAD',
            expense_date: form.expenseDate || null,
            payment_method: form.paymentMethod || null,
            notes: form.notes || null,
            dossier_id: form.dossierId || null,
        };

        if (!payload.amount || payload.amount <= 0) {
            toast.error('Le montant doit etre superieur a 0.');
            return;
        }

        if (isEditing && expense) {
            router.put(`/finance/expenses/${expense.id}`, payload, {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    toast.success('Depense mise a jour.');
                    onOpenChange(false);
                },
                onError: (errors) => {
                    const firstError = Object.values(errors)[0];
                    toast.error(typeof firstError === 'string' ? firstError : 'Erreur de validation.');
                },
            });
        } else {
            router.post('/finance/expenses', payload, {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    toast.success('Depense enregistree.');
                    onOpenChange(false);
                },
                onError: (errors) => {
                    const firstError = Object.values(errors)[0];
                    toast.error(typeof firstError === 'string' ? firstError : 'Erreur de validation.');
                },
            });
        }
    }

    return (
        <AppDrawer
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            title={isEditing ? 'Modifier la depense' : 'Nouvelle depense'}
            description="Enregistrez une depense liee a un dossier ou generale."
            footer={
                <>
                    <AppButton variant="ghost" onPress={() => onOpenChange(false)}>Annuler</AppButton>
                    <AppButton variant="primary" onPress={submit}>
                        {isEditing ? 'Enregistrer' : 'Ajouter la depense'}
                    </AppButton>
                </>
            }
        >
            <div className="space-y-5">
                <AppSelect
                    label="Categorie"
                    placeholder="Choisir une categorie"
                    options={categories}
                    selectedKey={form.category}
                    onSelectionChange={(key) => update('category', key ? String(key) : 'other')}
                />

                <div className="grid gap-3 sm:grid-cols-2">
                    <AppTextField
                        label="Montant"
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.amount}
                        onChange={(value) => update('amount', value)}
                    />
                    <AppDatePicker
                        label="Date depense"
                        value={form.expenseDate}
                        onChange={(value) => update('expenseDate', value)}
                    />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                    <AppTextField
                        label="Fournisseur / Beneficiaire"
                        value={form.vendor}
                        onChange={(value) => update('vendor', value)}
                    />
                    <AppSelect
                        label="Mode de paiement"
                        options={paymentMethods}
                        selectedKey={form.paymentMethod}
                        onSelectionChange={(key) => update('paymentMethod', key ? String(key) : '')}
                    />
                </div>

                <AppTextarea
                    label="Notes"
                    value={form.notes}
                    onChange={(value) => update('notes', value)}
                />
            </div>
        </AppDrawer>
    );
}
