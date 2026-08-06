import { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import { Button, Card, Input, ListBox, Select, TextArea } from '@heroui/react';
import { toast } from 'sonner';
import { AppDrawer } from '@/components/ui/AppDrawer';
import { DateField } from '@/features/archives/components/DateField';
import { strToDate, dateToStr } from '@/lib/dateUtils';
import type { Expense } from '@/features/finance/types';
import { formatCompactMoney } from '@/features/finance/utils/calculations';

export type ExpenseViewMode = 'create' | 'edit' | 'view';

type ExpenseDrawerProps = { isOpen: boolean; onOpenChange: (open: boolean) => void; expense?: Expense | null; mode?: ExpenseViewMode; };

type ExpenseForm = {
    category: string; vendor: string; amount: string; currency: string;
    expenseDate: string; paymentMethod: string; notes: string; dossierId: string;
};

const categories = [
    { id: 'administrative', label: 'Administratif' }, { id: 'travel', label: 'Deplacement' },
    { id: 'supplies', label: 'Fournitures' }, { id: 'equipment', label: 'Equipement' },
    { id: 'utilities', label: 'Services publics' }, { id: 'professional_fees', label: 'Honoraires professionnels' },
    { id: 'taxes', label: 'Impot et taxes' }, { id: 'other', label: 'Autre' },
];

const paymentMethods = [
    { id: 'cash', label: 'Especes' }, { id: 'bank_transfer', label: 'Virement bancaire' },
    { id: 'check', label: 'Cheque' }, { id: 'card', label: 'Carte bancaire' }, { id: 'other', label: 'Autre' },
];

const today = () => new Date().toISOString().slice(0, 10);

const defaultForm: ExpenseForm = {
    category: 'other', vendor: '', amount: '', currency: 'MAD',
    expenseDate: today(), paymentMethod: 'cash', notes: '', dossierId: '',
};

function formFromExpense(expense?: Expense | null): ExpenseForm {
    if (!expense) return { ...defaultForm };
    return {
        category: expense.category, vendor: expense.vendor ?? '', amount: String(expense.amount),
        currency: expense.currency, expenseDate: expense.expenseDate,
        paymentMethod: expense.paymentMethod ?? '', notes: expense.notes ?? '',
        dossierId: String(expense.dossier?.id ?? ''),
    };
}

const categoryLabel = (id: string) => categories.find((c) => c.id === id)?.label ?? id;
const paymentLabel = (id: string) => paymentMethods.find((p) => p.id === id)?.label ?? id;

const categoryBadgeColors: Record<string, string> = {
    administrative: 'border-sky-400/25 bg-sky-400/10 text-sky-300', travel: 'border-violet-400/25 bg-violet-400/10 text-violet-300',
    supplies: 'border-amber-400/25 bg-amber-400/10 text-amber-300', equipment: 'border-emerald-400/25 bg-emerald-400/10 text-emerald-300',
    utilities: 'border-rose-400/25 bg-rose-400/10 text-rose-300', professional_fees: 'border-indigo-400/25 bg-indigo-400/10 text-indigo-300',
    taxes: 'border-red-400/25 bg-red-400/10 text-red-300', other: 'border-zinc-500/30 bg-zinc-500/10 text-zinc-300',
};

const labelCls = 'text-[9px] font-semibold uppercase tracking-[0.08em] text-[var(--text-subtle)]';
const compactInput = 'h-8 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-2.5 text-xs text-[var(--foreground)] placeholder:text-[var(--text-muted)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--accent)_14%,transparent)]';
const compactTrigger = 'flex h-8 w-full min-w-0 items-center gap-2 rounded-[var(--radius-md)] border bg-[var(--surface)] px-2.5 text-xs text-[var(--foreground)] outline-none transition border-[var(--border)] hover:border-[var(--accent)] focus-visible:border-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--accent)_18%,transparent)]';
const compactItem = 'flex cursor-pointer items-center rounded-lg px-2.5 py-2 text-xs text-[var(--foreground)] outline-none transition hover:bg-[var(--surface-2)] data-[focus-visible]:bg-[var(--surface-2)] data-[selected]:bg-[var(--accent)]/10';
const compactTextarea = 'min-h-20 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1.5 text-xs text-[var(--foreground)] placeholder:text-[var(--text-muted)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--accent)_14%,transparent)]';
const compactPopover = 'z-[70] min-w-[var(--trigger-width)] overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-lg';

function categoryBadge(category: string) { return categoryBadgeColors[category] || categoryBadgeColors.other; }

export function ExpenseDrawer({ isOpen, onOpenChange, expense, mode = expense ? 'edit' : 'create' }: ExpenseDrawerProps) {
    const [form, setForm] = useState<ExpenseForm>(() => formFromExpense(expense));
    const isEditing = mode === 'edit';
    const isViewOnly = mode === 'view';

    useEffect(() => { if (isOpen) setForm(formFromExpense(expense)); }, [expense, isOpen]);

    function update<K extends keyof ExpenseForm>(k: K, v: ExpenseForm[K]) { setForm((p) => ({ ...p, [k]: v })); }

    function submit() {
        const payload = {
            category: form.category, vendor: form.vendor || null, amount: Number.parseFloat(form.amount) || 0,
            currency: form.currency || 'MAD', expense_date: form.expenseDate || null,
            payment_method: form.paymentMethod || null, notes: form.notes || null, dossier_id: form.dossierId || null,
        };
        if (!payload.amount || payload.amount <= 0) { toast.error('Le montant doit etre superieur a 0.'); return; }
        const opts = {
            preserveScroll: true, preserveState: true,
            onSuccess: () => { toast.success(isEditing ? 'Depense mise a jour.' : 'Depense enregistree.'); onOpenChange(false); },
            onError: (errors: Record<string, string>) => toast.error(Object.values(errors)[0] || 'Erreur.'),
        };
        if (isEditing && expense) { router.put(`/finance/expenses/${expense.id}`, payload, opts); return; }
        router.post('/finance/expenses', payload, opts);
    }

    return (
        <AppDrawer
            isOpen={isOpen} onOpenChange={onOpenChange}
            title={isViewOnly ? 'Dépense' : isEditing ? 'Modifier la dépense' : 'Nouvelle dépense'}
            description={isViewOnly ? '' : 'Enregistrez une dépense.'}
            footer={
                isViewOnly
                    ? <Button variant="light" size="sm" onPress={() => onOpenChange(false)}>Fermer</Button>
                    : <div className="flex items-center gap-2">
                        <Button variant="light" size="sm" onPress={() => onOpenChange(false)}>Annuler</Button>
                        <Button color="warning" size="sm" onPress={submit}>{isEditing ? 'Enregistrer' : 'Ajouter'}</Button>
                    </div>
            }
        >
            {isViewOnly && expense ? (
                <div className="space-y-3">
                    <Card className="p-3">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <div className="space-y-1">
                                <p className="text-xl font-bold tracking-tight text-rose-300">{formatCompactMoney(expense.amount, expense.currency)}</p>
                                <p className="text-xs text-[var(--text-muted)]">{expense.expenseDate} &middot; {expense.vendor || <span className="italic">—</span>}</p>
                            </div>
                            <span className={`self-start rounded-full border px-2 py-0.5 text-[9px] font-semibold ${categoryBadge(expense.category)}`}>{categoryLabel(expense.category)}</span>
                        </div>
                    </Card>
                    <div className="grid gap-2 sm:grid-cols-2">
                        <Card className="p-3">
                            <p className={labelCls}>Mode de paiement</p>
                            <p className="mt-1 text-xs font-medium text-[var(--text)]">{expense.paymentMethod ? paymentLabel(expense.paymentMethod) : <span className="italic text-[var(--text-muted)]">—</span>}</p>
                        </Card>
                        <Card className="p-3">
                            <p className={labelCls}>Dossier</p>
                            <p className="mt-1 text-xs font-medium text-[var(--text)]">{expense.dossier ? expense.dossier.number : <span className="italic text-[var(--text-muted)]">—</span>}</p>
                        </Card>
                    </div>
                    {expense.notes ? (
                        <Card className="p-3">
                            <p className={labelCls}>Notes</p>
                            <p className="mt-1 whitespace-pre-wrap text-xs text-[var(--text)]">{expense.notes}</p>
                        </Card>
                    ) : null}
                    <div className="border-t border-[var(--border)] pt-2">
                        <p className="text-[9px] text-[var(--text-muted)]">Cree par <span className="font-medium text-[var(--text)]">{expense.createdBy || '—'}</span>{expense.createdAt ? <span> &middot; {expense.createdAt}</span> : null}</p>
                    </div>
                </div>
            ) : (
            <div className="space-y-3">
                <Card className="p-3 space-y-3">
                    <div className="flex min-w-0 flex-col gap-1">
                        <label className={labelCls}>Categorie</label>
                        <Select
                            placeholder="Choisir une categorie"
                            selectedKeys={[form.category]}
                            onSelectionChange={(key) => { update('category', key != null ? String(key) : ''); }}
                        >
                            <Select.Trigger className={compactTrigger}><Select.Value className="flex-1 text-xs text-[var(--foreground)]" /><Select.Indicator /></Select.Trigger>
                            <Select.Popover className={compactPopover}><ListBox className="p-1 gap-0">
                                {categories.map((c) => (
                                    <ListBox.Item key={c.id} id={c.id} textValue={c.label} className={compactItem}>{c.label}</ListBox.Item>
                                ))}
                            </ListBox></Select.Popover>
                        </Select>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                        <div className="flex min-w-0 flex-col gap-1">
                            <label className={labelCls}>Montant</label>
                            <Input className={compactInput} type="number" min="0" step="0.01" value={form.amount} onChange={(e) => update('amount', e.target.value)} />
                        </div>
                        <DateField label="Date dépense" value={strToDate(form.expenseDate)} onChange={(d) => update('expenseDate', dateToStr(d))} />
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                        <div className="flex min-w-0 flex-col gap-1">
                            <label className={labelCls}>Fournisseur</label>
                            <Input className={compactInput} value={form.vendor} onChange={(e) => update('vendor', e.target.value)} />
                        </div>
                        <div className="flex min-w-0 flex-col gap-1">
                            <label className={labelCls}>Mode de paiement</label>
                            <Select
                                selectedKeys={[form.paymentMethod]}
                                onSelectionChange={(key) => { update('paymentMethod', key != null ? String(key) : ''); }}
                            >
                                <Select.Trigger className={compactTrigger}><Select.Value className="flex-1 text-xs text-[var(--foreground)]" /><Select.Indicator /></Select.Trigger>
                                <Select.Popover className={compactPopover}><ListBox className="p-1 gap-0">
                                    {paymentMethods.map((pm) => (
                                        <ListBox.Item key={pm.id} id={pm.id} textValue={pm.label} className={compactItem}>{pm.label}</ListBox.Item>
                                    ))}
                                </ListBox></Select.Popover>
                            </Select>
                        </div>
                    </div>
                </Card>
                <div className="flex min-w-0 flex-col gap-1">
                    <label className={labelCls}>Notes</label>
                    <TextArea className={compactTextarea} value={form.notes} onChange={(e) => update('notes', e.target.value)} />
                </div>
            </div>
            )}
        </AppDrawer>
    );
}
