import { useEffect, useMemo, useState } from 'react';
import { router } from '@inertiajs/react';
import {
    BadgeDollarSign,
    Pencil,
    RefreshCw,
    Search,
    Settings2,
    Trash2,
    X,
} from 'lucide-react';
import { toast } from 'sonner';
import { AppConfirmDialog } from '@/components/ui/AppConfirmDialog';
import { AppPagination } from '@/components/ui/AppPagination';
import { AppEmptyState } from '@/components/ui/AppEmptyState';
import type { Expense } from '@/features/finance/types';
import { formatMoney } from '@/features/finance/utils/calculations';

type ExpensesWorkspaceProps = {
    expenses: Expense[];
    currency: string;
    onEdit: (expense: Expense) => void;
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

function expenseMatches(expense: Expense, query: string, categoryFilter: string) {
    if (categoryFilter !== 'all' && expense.category !== categoryFilter) return false;
    if (!query.trim()) return true;
    return [
        expense.vendor,
        expense.notes,
        expense.category,
        expense.dossier?.number,
        expense.paymentMethod,
    ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(query.trim().toLowerCase());
}

export function ExpensesWorkspace({ expenses, currency, onEdit }: ExpensesWorkspaceProps) {
    const [query, setQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [showFilters, setShowFilters] = useState(false);
    const [tablePage, setTablePage] = useState(1);
    const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null);
    const TABLE_PAGE_SIZE = 15;

    const filtered = useMemo(() => {
        return expenses.filter((expense) => expenseMatches(expense, query, categoryFilter));
    }, [expenses, query, categoryFilter]);

    useEffect(() => { setTablePage(1); }, [query, categoryFilter]);
    const pagedFiltered = useMemo(() => filtered.slice((tablePage - 1) * TABLE_PAGE_SIZE, tablePage * TABLE_PAGE_SIZE), [filtered, tablePage]);

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

    const totalAmount = filtered.reduce((sum, e) => sum + e.amount, 0);

    return (
        <section className="min-w-0 rounded-xl border border-[var(--border)] bg-[var(--surface)]">
            <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5">
                <div className="relative w-full max-w-[260px]">
                    <Search size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Rechercher fournisseur, notes, dossier..."
                        className="h-8 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] pl-8 pr-7 text-xs text-[var(--text)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--accent)_18%,transparent)]"
                    />
                    {query ? (
                        <button
                            type="button"
                            onClick={() => setQuery('')}
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
                    {filtered.length} depense(s) · Total {formatMoney(totalAmount, currency)}
                </div>
            </div>

            {showFilters && (
                <div className="border-b border-[var(--border)] px-3 py-2.5">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="space-y-1.5">
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Categorie</p>
                            <div className="flex flex-wrap gap-1.5">
                                {categoryFilterOptions.map((c) => (
                                    <button key={c.id} type="button" onClick={() => setCategoryFilter(c.id)}
                                        className={[
                                            'rounded-lg border px-2.5 py-1 text-[11px] font-medium transition',
                                            categoryFilter === c.id
                                                ? 'border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] text-[var(--accent)]'
                                                : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--text)]',
                                        ].join(' ')}
                                    >
                                        {c.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="w-full text-xs min-w-[900px]">
                    <thead>
                        <tr className="border-b border-[var(--border)] text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                            <th className="px-3 py-2"><BadgeDollarSign size={11} className="mr-1 inline" /> Date</th>
                            <th className="px-3 py-2">Categorie</th>
                            <th className="px-3 py-2">Fournisseur</th>
                            <th className="px-3 py-2">Dossier</th>
                            <th className="px-3 py-2">Montant</th>
                            <th className="px-3 py-2">Paiement</th>
                            <th className="px-3 py-2 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length > 0 ? (
                            pagedFiltered.map((expense) => (
                                <tr key={expense.id} className="border-b border-[var(--border)] transition hover:bg-[var(--surface-2)] last:border-0">
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
                                    <td className="px-3 py-2 font-semibold text-rose-300">{formatMoney(expense.amount, currency)}</td>
                                    <td className="px-3 py-2 text-[var(--text-muted)]">{expense.paymentMethod || <span className="text-[var(--text-muted)]">-</span>}</td>
                                    <td className="px-3 py-2">
                                        <div className="flex justify-end gap-0.5">
                                            <button type="button" className="flex size-7 items-center justify-center rounded-lg text-[var(--text-muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--text)]" title="Modifier" onClick={() => onEdit(expense)}>
                                                <Pencil size={13} />
                                            </button>
                                            <button type="button" className="flex size-7 items-center justify-center rounded-lg text-[var(--text-muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--text)]" title="Supprimer" onClick={() => setDeleteTarget(expense)}>
                                                <Trash2 size={13} />
                                            </button>
                                        </div>
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

            <AppPagination page={tablePage} pageSize={TABLE_PAGE_SIZE} total={filtered.length} onChange={setTablePage} variant="reference" />

            <AppConfirmDialog
                isOpen={Boolean(deleteTarget)}
                title="Supprimer la depense ?"
                description={`Confirmer la suppression de la depense ${categoryLabels[deleteTarget?.category || 'other']} de ${deleteTarget ? formatMoney(deleteTarget.amount, currency) : ''}.`}
                confirmLabel="Supprimer"
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
                variant="danger"
            />
        </section>
    );
}
