import { useState } from 'react';
import { router } from '@inertiajs/react';
import {
    BadgeDollarSign,
    Eye,
    Pencil,
    RefreshCw,
    Search,
    Settings2,
    Trash2,
    X,
} from 'lucide-react';
import { toast } from 'sonner';
import { AppButton } from '@/components/ui/AppButton';
import { AppConfirmDialog } from '@/components/ui/AppConfirmDialog';
import { AppFilterTabs } from '@/components/ui/AppFilterTabs';
import { AppPagination } from '@/components/ui/AppPagination';
import { AppEmptyState } from '@/components/ui/AppEmptyState';
import type { Expense } from '@/features/finance/types';
import { formatCompactMoney } from '@/features/finance/utils/calculations';
import { FinanceSortableHeader, nextFinanceSortDirection, type FinanceSortDirection } from '@/features/finance/components/FinanceSortableHeader';
import { FinanceRowActions } from '@/features/finance/components/FinanceRowActions';

type ExpensesWorkspaceProps = {
    expenses: Expense[];
    currency: string;
    onEdit: (expense: Expense) => void;
    onView: (expense: Expense) => void;
    pagination: { page: number; pageSize: number; total: number };
    filters?: {
        expense_search?: string;
        expense_category?: string;
        expense_sort?: string;
        expense_direction?: FinanceSortDirection;
    };
    canEdit: boolean;
    canDelete: boolean;
};

const categoryOptions = [
    { id: 'administrative', label: 'Administratif' },
    { id: 'travel', label: 'Deplacement' },
    { id: 'supplies', label: 'Fournitures' },
    { id: 'equipment', label: 'Equipement' },
    { id: 'utilities', label: 'Services publics' },
    { id: 'professional_fees', label: 'Honoraires professionnels' },
    { id: 'taxes', label: 'Impot et taxes' },
    { id: 'other', label: 'Autre' },
];

const categoryLabels: Record<string, string> = Object.fromEntries(categoryOptions.map((c) => [c.id, c.label]));

const categoryFilterOptions = [{ id: 'all', label: 'Toutes' }, ...categoryOptions];

export function ExpensesWorkspace({ expenses, currency, onEdit, onView, pagination, filters, canEdit, canDelete }: ExpensesWorkspaceProps) {
    const [query, setQuery] = useState(filters?.expense_search || '');
    const [categoryFilter, setCategoryFilter] = useState(filters?.expense_category || 'all');
    const [showFilters, setShowFilters] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null);
    const pagedFiltered = expenses;
    const sort = filters?.expense_sort || 'expense_date';
    const direction = filters?.expense_direction || 'desc';

    function applyExpenseFilters(overrides: Record<string, string | number | undefined> = {}) {
        router.get('/finance/documents', {
            ...Object.fromEntries(new URLSearchParams(window.location.search)),
            tab: 'expenses',
            expense_search: query || undefined,
            expense_category: categoryFilter === 'all' ? undefined : categoryFilter,
            expense_sort: sort,
            expense_direction: direction,
            expenses_per_page: pagination.pageSize,
            ...overrides,
        }, { preserveState: true, preserveScroll: true, replace: true });
    }

    function changeSort(column: string) {
        applyExpenseFilters({
            expense_sort: column,
            expense_direction: nextFinanceSortDirection(sort, direction, column),
            expenses_page: 1,
        });
    }

    function handleDelete() {
        if (!deleteTarget) return;
        router.delete(`/finance/expenses/${deleteTarget.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Depense supprimee.');
                setDeleteTarget(null);
            },
            onError: () => toast.error('Impossible supprimer la depense.'),
        });
    }

    function categoryBadge(category: string) {
        const colors: Record<string, string> = {
            administrative: 'border-sky-400/25 bg-sky-400/10 text-sky-300',
            travel: 'border-violet-400/25 bg-violet-400/10 text-violet-300',
            supplies: 'border-amber-400/25 bg-amber-400/10 text-amber-300',
            equipment: 'border-emerald-400/25 bg-emerald-400/10 text-emerald-300',
            utilities: 'border-rose-400/25 bg-rose-400/10 text-rose-300',
            professional_fees: 'border-indigo-400/25 bg-indigo-400/10 text-indigo-300',
            taxes: 'border-red-400/25 bg-red-400/10 text-red-300',
            other: 'border-zinc-500/30 bg-zinc-500/10 text-zinc-300',
        };
        return colors[category] || colors.other;
    }

    const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    return (
        <section className="min-w-0 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)]">
            <div className="flex flex-col gap-2 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full sm:max-w-[300px]">
                    <Search size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        onKeyDown={(event) => { if (event.key === 'Enter') applyExpenseFilters({ expense_search: query || undefined, expenses_page: 1 }); }}
                        placeholder="Rechercher fournisseur, notes, dossier..."
                        className="h-8 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] pl-8 pr-7 text-xs text-[var(--text)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--accent)_18%,transparent)]"
                    />
                    {query ? (
                        <button
                            type="button"
                            onClick={() => {
                                setQuery('');
                                applyExpenseFilters({ expense_search: undefined, expenses_page: 1 });
                            }}
                            className="absolute right-1 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center rounded text-[var(--text-muted)] hover:bg-[var(--surface-2)]"
                        >
                            <X size={12} />
                        </button>
                    ) : null}
                </div>

                <div className="flex items-center gap-1.5">
                    <button type="button" className="flex h-7 items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 text-[11px] font-medium text-[var(--text-muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--text)]" onClick={() => router.reload({ only: ['expenses'] })}>
                        <RefreshCw size={12} />
                        Actualiser
                    </button>
                    <button type="button" className={`flex h-7 items-center gap-1.5 rounded-lg border px-2 text-[11px] font-medium transition ${
                        showFilters
                            ? 'border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] text-[var(--accent)]'
                            : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]'
                    }`} onClick={() => setShowFilters((v) => !v)}>
                        <Settings2 size={12} />
                        Filtres
                    </button>
                </div>

                <div className="hidden text-[11px] font-medium text-[var(--text-muted)] md:block">
                    {pagination.total} depense(s) / page {formatCompactMoney(totalAmount, currency)}
                </div>
            </div>

            {showFilters && (
                <div className="border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--surface-2)_35%,transparent)] px-3 py-3">
                    <AppFilterTabs
                        label="Categorie"
                        value={categoryFilter}
                        options={categoryFilterOptions}
                        onChange={(value) => {
                            setCategoryFilter(value);
                            applyExpenseFilters({ expense_category: value === 'all' ? undefined : value, expenses_page: 1 });
                        }}
                    />
                </div>
            )}

            <div className="finance-table-shell hidden md:block">
                <table className="finance-table min-w-[820px] text-xs">
                    <thead>
                        <tr className="border-b border-[var(--border)] text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                            <FinanceSortableHeader column="expense_date" label={<><BadgeDollarSign size={11} /> Date</>} sort={sort} direction={direction} onSort={changeSort} />
                            <FinanceSortableHeader column="category" label="Categorie" sort={sort} direction={direction} onSort={changeSort} />
                            <FinanceSortableHeader column="vendor" label="Fournisseur" sort={sort} direction={direction} onSort={changeSort} />
                            <th className="px-3 py-2">Dossier</th>
                            <FinanceSortableHeader column="amount" label="Montant" sort={sort} direction={direction} onSort={changeSort} />
                            <FinanceSortableHeader column="payment_method" label="Paiement" sort={sort} direction={direction} onSort={changeSort} />
                            <th className="px-3 py-2 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pagedFiltered.length > 0 ? (
                            pagedFiltered.map((expense) => (
                                <tr key={expense.id} className="group border-b border-[var(--border)] transition hover:bg-[var(--surface-2)] last:border-0">
                                    <td className="px-3 py-2 font-semibold text-[var(--text)]">{expense.expenseDate}</td>
                                    <td className="px-3 py-2">
                                        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${categoryBadge(expense.category)}`}>
                                            {categoryLabels[expense.category] || expense.category}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2 text-[var(--text)]">{expense.vendor || <span className="text-[var(--text-muted)]">-</span>}</td>
                                    <td className="px-3 py-2">
                                        {expense.dossier ? (
                                            <span className="font-medium text-[var(--text)]">{expense.dossier.number}</span>
                                        ) : (
                                            <span className="text-[var(--text-muted)]">-</span>
                                        )}
                                    </td>
                                    <td className="px-3 py-2 font-semibold text-rose-300">{formatCompactMoney(expense.amount, currency)}</td>
                                    <td className="px-3 py-2 text-[var(--text-muted)]">{expense.paymentMethod || <span className="text-[var(--text-muted)]">-</span>}</td>
                                    <td className="px-3 py-2">
                                        <FinanceRowActions actions={[
                                            { id: 'view', label: 'Voir', icon: <Eye size={13} />, onPress: () => onView(expense) },
                                            canEdit && { id: 'edit', label: 'Modifier', icon: <Pencil size={13} />, onPress: () => onEdit(expense) },
                                            canDelete && { id: 'delete', label: 'Supprimer', icon: <Trash2 size={13} />, onPress: () => setDeleteTarget(expense), tone: 'danger', dividerBefore: true },
                                        ].filter(Boolean) as Parameters<typeof FinanceRowActions>[0]['actions']} />
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={7} className="p-6">
                                    <AppEmptyState
                                        title="Aucune depense"
                                        description="Ajoutez une depense pour commencer le suivi."
                                    />
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="divide-y divide-[var(--border)] md:hidden">
                {pagedFiltered.length > 0 ? pagedFiltered.map((expense) => (
                    <article key={expense.id} className="space-y-3 p-3">
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${categoryBadge(expense.category)}`}>
                                        {categoryLabels[expense.category] || expense.category}
                                    </span>
                                    <span className="text-[10px] text-[var(--text-muted)]">{expense.expenseDate}</span>
                                </div>
                                <p className="mt-1.5 truncate text-xs font-semibold text-[var(--text)]">{expense.vendor || 'Sans fournisseur'}</p>
                                <p className="mt-0.5 truncate text-[10px] text-[var(--text-muted)]">
                                    {expense.dossier?.number || 'Sans dossier'} / {expense.paymentMethod || 'Paiement non precise'}
                                </p>
                            </div>
                            <span className="shrink-0 text-sm font-semibold tabular-nums text-rose-300">
                                {formatCompactMoney(expense.amount, currency)}
                            </span>
                        </div>
                        <div className={`grid gap-1.5 ${canEdit && canDelete ? 'grid-cols-3' : canEdit || canDelete ? 'grid-cols-2' : 'grid-cols-1'}`}>
                            <AppButton size="sm" variant="outline" className="h-8 text-[11px]" onPress={() => onView(expense)}>
                                <Eye size={12} /> Voir
                            </AppButton>
                            {canEdit ? <AppButton size="sm" variant="outline" className="h-8 text-[11px]" onPress={() => onEdit(expense)}>
                                <Pencil size={12} /> Modifier
                            </AppButton> : null}
                            {canDelete ? <AppButton size="sm" variant="danger-soft" className="h-8 text-[11px]" onPress={() => setDeleteTarget(expense)}>
                                <Trash2 size={12} /> Supprimer
                            </AppButton> : null}
                        </div>
                    </article>
                )) : (
                    <div className="p-5">
                        <AppEmptyState title="Aucune depense" description="Ajoutez une depense pour commencer le suivi." />
                    </div>
                )}
            </div>

            <AppPagination page={pagination.page} pageSize={pagination.pageSize} total={pagination.total} onChange={(page) => applyExpenseFilters({ expenses_page: page })} variant="reference" />

            <AppConfirmDialog
                isOpen={Boolean(deleteTarget)}
                title="Supprimer la depense ?"
                description={`Confirmer la suppression de la depense ${categoryLabels[deleteTarget?.category || 'other']} de ${deleteTarget ? formatCompactMoney(deleteTarget.amount, currency) : ''}.`}
                confirmLabel="Supprimer"
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
                variant="danger"
            />
        </section>
    );
}
