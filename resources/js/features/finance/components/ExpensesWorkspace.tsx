import { useEffect, useMemo, useState } from 'react';
import { router } from '@inertiajs/react';
import {
    ArrowUpDown,
    BadgeDollarSign,
    Pencil,
    Plus,
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
        <section className="crm-reference-table-shell">
            <div className="crm-reference-toolbar">
                <div className="crm-reference-search">
                    <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--crm-text-soft)]" />
                    <input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Rechercher fournisseur, notes, dossier..."
                    />
                    {query ? (
                        <button
                            type="button"
                            onClick={() => setQuery('')}
                            className="absolute right-2 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-[var(--crm-text-soft)] hover:bg-[var(--crm-surface-2)]"
                        >
                            <X size={14} />
                        </button>
                    ) : null}
                </div>

                <div className="crm-reference-toolbar-actions">
                    <button type="button" className="crm-reference-button" onClick={() => router.reload({ only: ['expenses'] })}>
                        <RefreshCw size={13} />
                        Actualiser
                    </button>
                    <button type="button" className={'crm-reference-button' + (showFilters ? ' is-active' : '')} onClick={() => setShowFilters((v) => !v)}>
                        <Settings2 size={13} />
                        Filtres
                    </button>
                </div>

                <div className="hidden text-xs font-semibold text-[var(--crm-text-muted)] md:block">
                    {filtered.length} depense(s) · Total {formatMoney(totalAmount, currency)}
                </div>
            </div>

            {showFilters && (
                <div className="border-b border-[var(--crm-border)] p-3">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="space-y-1.5">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-subtle)]">Categorie</p>
                            <div className="flex flex-wrap gap-1.5">
                                {categoryFilterOptions.map((c) => (
                                    <button key={c.id} type="button" onClick={() => setCategoryFilter(c.id)}
                                        className={[
                                            'rounded-xl border px-3 py-1.5 text-[12px] font-medium transition',
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

            <div className="crm-reference-table-card">
                <div className="crm-reference-table-scroll">
                    <table className="crm-reference-table min-w-[900px]">
                        <thead>
                            <tr>
                                <th><span className="crm-reference-header-cell"><BadgeDollarSign size={13} /> Date</span></th>
                                <th><span className="crm-reference-header-cell">Categorie</span></th>
                                <th><span className="crm-reference-header-cell">Fournisseur</span></th>
                                <th><span className="crm-reference-header-cell">Dossier</span></th>
                                <th><span className="crm-reference-header-cell">Montant</span></th>
                                <th><span className="crm-reference-header-cell">Paiement</span></th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length > 0 ? (
                                pagedFiltered.map((expense) => (
                                    <tr key={expense.id}>
                                        <td className="font-semibold">{expense.expenseDate}</td>
                                        <td>
                                            <span className={`rounded-full border px-2 py-1 text-[11px] font-semibold ${categoryBadge(expense.category)}`}>
                                                {categoryLabels[expense.category] || expense.category}
                                            </span>
                                        </td>
                                        <td>{expense.vendor || <span className="text-[var(--crm-text-muted)]">-</span>}</td>
                                        <td>
                                            {expense.dossier ? (
                                                <span className="font-medium">{expense.dossier.number}</span>
                                            ) : (
                                                <span className="text-[var(--crm-text-muted)]">-</span>
                                            )}
                                        </td>
                                        <td className="font-semibold text-rose-300">{formatMoney(expense.amount, currency)}</td>
                                        <td>{expense.paymentMethod || <span className="text-[var(--crm-text-muted)]">-</span>}</td>
                                        <td>
                                            <div className="flex justify-end gap-1">
                                                <button type="button" className="crm-reference-kebab" title="Modifier" onClick={() => onEdit(expense)}>
                                                    <Pencil size={14} />
                                                </button>
                                                <button type="button" className="crm-reference-kebab" title="Supprimer" onClick={() => setDeleteTarget(expense)}>
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7}>
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
            </div>

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
