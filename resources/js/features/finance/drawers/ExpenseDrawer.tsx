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
import { formatCompactMoney } from '@/features/finance/utils/calculations';

export type ExpenseViewMode = 'create' | 'edit' | 'view';

type ExpenseDrawerProps = {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    expense?: Expense | null;
    mode?: ExpenseViewMode;
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

const categoryLabel = (id: string) => categories.find((c) => c.id === id)?.label ?? id;
const paymentLabel = (id: string) => paymentMethods.find((p) => p.id === id)?.label ?? id;

const categoryBadgeColors: Record<string, string> = {
    administrative: 'border-sky-400/25 bg-sky-400/10 text-sky-300',
    travel: 'border-violet-400/25 bg-violet-400/10 text-violet-300',
    supplies: 'border-amber-400/25 bg-amber-400/10 text-amber-300',
    equipment: 'border-emerald-400/25 bg-emerald-400/10 text-emerald-300',
    utilities: 'border-rose-400/25 bg-rose-400/10 text-rose-300',
    professional_fees: 'border-indigo-400/25 bg-indigo-400/10 text-indigo-300',
    taxes: 'border-red-400/25 bg-red-400/10 text-red-300',
    other: 'border-zinc-500/30 bg-zinc-500/10 text-zinc-300',
};

function categoryBadge(category: string) {
    return categoryBadgeColors[category] || categoryBadgeColors.other;
}

export function ExpenseDrawer({ isOpen, onOpenChange, expense, mode = expense ? 'edit' : 'create' }: ExpenseDrawerProps) {
    const [form, setForm] = useState<ExpenseForm>(() => formFromExpense(expense));
    const isEditing = mode === 'edit';
    const isViewOnly = mode === 'view';

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
            title={isViewOnly ? 'Depense' : isEditing ? 'Modifier la depense' : 'Nouvelle depense'}
            description={isViewOnly ? '' : 'Enregistrez une depense liee a un dossier ou generale.'}
            footer={
                isViewOnly ? (
                    <AppButton variant="ghost" onPress={() => onOpenChange(false)}>Fermer</AppButton>
                ) : (
                <>
                    <AppButton variant="ghost" onPress={() => onOpenChange(false)}>Annuler</AppButton>
                    <AppButton variant="primary" onPress={submit}>
                        {isEditing ? 'Enregistrer' : 'Ajouter la depense'}
                    </AppButton>
                </>
                )
            }
        >
            {isViewOnly && expense ? (
                <div className="space-y-5">
                    {/* Hero — montant + categorie */}
                    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4 sm:p-5">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="space-y-1">
                                <p className="text-2xl font-bold tracking-tight text-rose-300">{formatCompactMoney(expense.amount, expense.currency)}</p>
                                <p className="text-[13px] text-[var(--text-muted)]">{expense.expenseDate} &middot; {expense.vendor || <span className="italic">Fournisseur non renseigne</span>}</p>
                            </div>
                            <span className={`self-start rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${categoryBadge(expense.category)}`}>
                                {categoryLabel(expense.category)}
                            </span>
                        </div>
                    </div>

                    {/* Grille info */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3.5 py-3">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">Mode de paiement</p>
                            <p className="mt-1 text-sm font-medium text-[var(--text)]">{expense.paymentMethod ? paymentLabel(expense.paymentMethod) : <span className="text-[var(--text-muted)] italic">Non renseigne</span>}</p>
                        </div>
                        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3.5 py-3">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">Dossier</p>
                            <p className="mt-1 text-sm font-medium text-[var(--text)]">{expense.dossier ? expense.dossier.number : <span className="text-[var(--text-muted)] italic">Non lie a un dossier</span>}</p>
                        </div>
                    </div>

                    {/* Notes */}
                    {expense.notes ? (
                        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3.5 py-3">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">Notes</p>
                            <p className="mt-1 whitespace-pre-wrap text-sm text-[var(--text)]">{expense.notes}</p>
                        </div>
                    ) : null}

                    {/* Meta */}
                    <div className="border-t border-[var(--border)] pt-3">
                        <p className="text-[10px] text-[var(--text-muted)]">
                            Cree par <span className="font-medium text-[var(--text)]">{expense.createdBy || '—'}</span>
                            {expense.createdAt ? <span> &middot; {expense.createdAt}</span> : null}
                        </p>
                    </div>
                </div>
            ) : (
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
            )}
        </AppDrawer>
    );
}
