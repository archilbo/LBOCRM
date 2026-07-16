import { router } from '@inertiajs/react';
import { ChevronRight, Download, FileSpreadsheet, FileText, FileDown, Files, Receipt, Search, Wallet, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Popover } from '@heroui/react';
import { AppButton } from '@/components/ui/AppButton';
import { toast } from 'sonner';
import type { FinanceMonthDocumentRow, FinanceMonthPaymentRow, FinanceMonthSummary as FinanceMonthSummaryType } from '@/features/finance/types';
import { formatCompactMoney } from '@/features/finance/utils/calculations';

type Props = {
    months: FinanceMonthSummaryType[];
    currency: string;
};

function statusStyle(status: string) {
    const colors: Record<string, string> = {
        draft: 'border-zinc-500/30 bg-zinc-500/10 text-zinc-300',
        sent: 'border-sky-400/25 bg-sky-400/10 text-sky-300',
        accepted: 'border-emerald-400/25 bg-emerald-400/10 text-emerald-300',
        rejected: 'border-red-400/25 bg-red-400/10 text-red-300',
        cancelled: 'border-zinc-500/30 bg-zinc-500/10 text-zinc-300',
        paid: 'border-emerald-400/25 bg-emerald-400/10 text-emerald-300',
        partial: 'border-amber-400/25 bg-amber-400/10 text-amber-300',
        overdue: 'border-red-400/25 bg-red-400/10 text-red-300',
        converted: 'border-violet-400/25 bg-violet-400/10 text-violet-300',
    };
    return colors[status] || colors.draft;
}

function statusLabel(status: string) {
    const labels: Record<string, string> = {
        draft: 'Brouillon', sent: 'Envoye', accepted: 'Accepte', rejected: 'Refuse',
        cancelled: 'Annule', paid: 'Paye', partial: 'Partiel', overdue: 'En retard', converted: 'Converti',
    };
    return labels[status] || status;
}

function typeMeta(type: string) {
    if (type === 'quote') return { label: 'D', color: 'text-sky-300', bg: 'bg-sky-400/10' };
    if (type === 'invoice') return { label: 'F', color: 'text-violet-300', bg: 'bg-violet-400/10' };
    if (type === 'receipt') return { label: 'R', color: 'text-emerald-300', bg: 'bg-emerald-400/10' };
    if (type === 'payment') return { label: 'P', color: 'text-amber-300', bg: 'bg-amber-400/10' };
    return { label: '—', color: 'text-[var(--text-muted)]', bg: 'bg-[var(--surface-2)]' };
}

type Row = (FinanceMonthDocumentRow & { _type: 'document' }) | (FinanceMonthPaymentRow & { _type: 'payment' });

export function FinanceMonthlySummary({ months, currency }: Props) {
    const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set(months.length ? months.map((m) => m.key) : []));
    const [expandedYears, setExpandedYears] = useState<Set<number>>(new Set());
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('all');

    function toggleMonth(key: string) {
        setSelectedKeys((prev) => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    }

    const sortedMonths = useMemo(() => [...months].sort((a, b) => b.key.localeCompare(a.key)), [months]);

    const years = useMemo(() => {
        const map = new Map<number, FinanceMonthSummaryType[]>();
        for (const m of sortedMonths) {
            const arr = map.get(m.year) ?? [];
            arr.push(m);
            map.set(m.year, arr);
        }
        return Array.from(map.entries()).sort(([a], [b]) => b - a);
    }, [sortedMonths]);

    function toggleYear(year: number) {
        setExpandedYears((prev) => {
            const next = new Set(prev);
            if (next.has(year)) next.delete(year);
            else next.add(year);
            return next;
        });
    }

    const selectedMonths = useMemo(
        () => months.filter((m) => selectedKeys.has(m.key)),
        [months, selectedKeys],
    );

    const aggregated = useMemo(() => {
        const acc = {
            quotesCount: 0, quotesTotal: 0,
            invoicesCount: 0, invoicesTotal: 0,
            receiptsCount: 0, receiptsTotal: 0,
            paymentsCount: 0, paidTotal: 0,
            expensesTotal: 0,
            remainingTotal: 0, overdueTotal: 0,
        };
        for (const m of selectedMonths) {
            acc.quotesCount += m.quotesCount;
            acc.quotesTotal += m.quotesTotalTtc;
            acc.invoicesCount += m.invoicesCount;
            acc.invoicesTotal += m.invoicesTotalTtc;
            acc.receiptsCount += m.receiptsCount;
            acc.receiptsTotal += m.receiptsTotalTtc;
            acc.paymentsCount += m.paymentsCount;
            acc.paidTotal += m.paidTotal;
            acc.expensesTotal += m.expensesTotal;
            acc.remainingTotal += m.remainingTotal;
            acc.overdueTotal += m.overdueTotal;
        }
        return acc;
    }, [selectedMonths]);

    const netTotal = aggregated.paidTotal - aggregated.expensesTotal;

    const rows: Row[] = useMemo(() => {
        const result: Row[] = [];
        for (const m of selectedMonths) {
            for (const doc of m.documents) result.push({ ...doc, _type: 'document' });
            for (const pay of m.payments) result.push({ ...pay, _type: 'payment' });
        }
        return result;
    }, [selectedMonths]);

    const filteredRows = useMemo(() => {
        let r = rows;
        if (typeFilter !== 'all') {
            if (typeFilter === 'payment') r = r.filter((row) => row._type === 'payment');
            else r = r.filter((row) => row._type === 'document' && row.type === typeFilter);
        }
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            r = r.filter((row) => {
                const fields = row._type === 'document'
                    ? [row.number, row.clientName, row.dossierNumber, row.commune, row.province]
                    : [row.paymentNumber, row.clientName, row.documentNumber, row.dossierNumber];
                return fields.filter(Boolean).some((v) => v!.toLowerCase().includes(q));
            });
        }
        return r;
    }, [rows, typeFilter, searchQuery]);

    const typeCounts = useMemo(() => {
        const counts: Record<string, number> = { all: rows.length };
        for (const type of ['quote', 'invoice', 'receipt', 'payment']) {
            counts[type] = type === 'payment'
                ? rows.filter((r) => r._type === 'payment').length
                : rows.filter((r) => r._type === 'document' && r.type === type).length;
        }
        return counts;
    }, [rows]);

    const typeFilters = [
        { id: 'all', label: 'Tous', icon: Files, color: 'text-[var(--text)]', activeColor: 'text-[var(--accent)]', bg: 'bg-[var(--surface-2)]' },
        { id: 'quote', label: 'Devis', icon: FileText, color: 'text-sky-300', activeColor: 'text-sky-300', bg: 'bg-sky-400/10' },
        { id: 'invoice', label: 'Factures', icon: Receipt, color: 'text-violet-300', activeColor: 'text-violet-300', bg: 'bg-violet-400/10' },
        { id: 'receipt', label: 'Recus', icon: FileText, color: 'text-emerald-300', activeColor: 'text-emerald-300', bg: 'bg-emerald-400/10' },
        { id: 'payment', label: 'Paiements', icon: Wallet, color: 'text-amber-300', activeColor: 'text-amber-300', bg: 'bg-amber-400/10' },
    ];
    const activeFilter = typeFilters.find((f) => f.id === typeFilter)!;
    const exportLabel = activeFilter.id === 'all' ? 'Tous les types' : activeFilter.label;

    const allSelected = selectedKeys.size === sortedMonths.length;
    const exportQuery = `months=${Array.from(selectedKeys).join(',')}&type=${typeFilter}`;

    function exportPdf() {
        if (selectedKeys.size === 0) {
            toast.error('Selectionnez au moins un mois pour exporter.');
            return;
        }
        const label = activeFilter.id === 'all' ? 'Tous' : activeFilter.label;
        toast.success(`Export PDF : ${label} en cours de telechargement...`);
        window.open(`/finance/monthly-summary/export-pdf?${exportQuery}`, '_blank');
    }

    function exportExcel() {
        if (selectedKeys.size === 0) {
            toast.error('Selectionnez au moins un mois pour exporter.');
            return;
        }
        const label = activeFilter.id === 'all' ? 'Tous' : activeFilter.label;
        toast.success(`Export Excel : ${label} en cours de telechargement...`);
        window.open(`/finance/monthly-summary/export-excel?${exportQuery}`, '_blank');
    }

    function exportCsv() {
        if (selectedKeys.size === 0) {
            toast.error('Selectionnez au moins un mois pour exporter.');
            return;
        }
        const label = activeFilter.id === 'all' ? 'Tous' : activeFilter.label;
        toast.success(`Export CSV : ${label} en cours de telechargement...`);
        window.open(`/finance/monthly-summary/export-csv?${exportQuery}`, '_blank');
    }

    if (!months.length) {
        return (
            <section className="flex flex-col items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] px-6 py-12 text-center">
                <p className="text-sm font-semibold text-[var(--text)]">Aucune synthese mensuelle</p>
                <p className="mt-1 text-xs text-[var(--text-muted)]">Les donnees apparaitront ici une fois les documents crees.</p>
            </section>
        );
    }

    return (
        <section className="space-y-4">
            {/* Month filter — popover with years accordion */}
            <Popover placement="bottom-start">
                <Popover.Trigger>
                    <button type="button"
                        className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-[11px] font-medium text-[var(--text)] transition hover:border-[var(--accent)]">
                        <span>{selectedKeys.size} mois selectionne(s)</span>
                        <ChevronRight size={12} className="text-[var(--text-muted)]" />
                    </button>
                </Popover.Trigger>
                <Popover.Content className="w-64 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-1.5 shadow-xl">
                    <div className="max-h-72 overflow-y-auto">
                        <div className="mb-1.5 flex items-center justify-between gap-2 px-2 py-1">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Mois</span>
                            <button type="button" onClick={() => setSelectedKeys(allSelected ? new Set() : new Set(sortedMonths.map((m) => m.key)))}
                                className={`rounded-lg border px-2 py-0.5 text-[10px] font-medium transition ${
                                    allSelected
                                        ? 'border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] text-[var(--accent)]'
                                        : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--text)]'
                                }`}>
                                {allSelected ? 'Tout deselectionner' : 'Tout selectionner'}
                            </button>
                        </div>
                        <div className="border-t border-[var(--border)]">
                            {years.map(([year, yearMonths]) => {
                                const isOpen = expandedYears.has(year);
                                const selectedInYear = yearMonths.filter((m) => selectedKeys.has(m.key)).length;
                                return (
                                    <div key={year} className="border-b border-[var(--border)] last:border-0">
                                        <button type="button" onClick={() => toggleYear(year)}
                                            className="flex w-full items-center gap-2 px-2 py-1.5 text-left text-[11px] font-semibold text-[var(--text)] transition hover:bg-[var(--surface-2)] rounded-md">
                                            <span className={`transition-transform duration-150 ${isOpen ? 'rotate-90' : ''}`}>
                                                <ChevronRight size={12} />
                                            </span>
                                            {year}
                                            <span className="ml-auto text-[10px] font-normal text-[var(--text-muted)]">
                                                {selectedInYear > 0 && <span className="text-[var(--accent)]">{selectedInYear}/{yearMonths.length} </span>}
                                                {yearMonths.length} mois
                                            </span>
                                        </button>
                                        {isOpen && (
                                            <div className="flex flex-wrap gap-1 px-2 pb-2 pt-0.5">
                                                {yearMonths.map((month) => {
                                                    const active = selectedKeys.has(month.key);
                                                    return (
                                                        <button key={month.key} type="button" onClick={() => toggleMonth(month.key)}
                                                            className={`rounded-lg border px-2 py-0.5 text-[10px] font-medium transition ${
                                                                active
                                                                    ? 'border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] text-[var(--accent)]'
                                                                    : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--text)]'
                                                            }`}>
                                                            {month.label}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </Popover.Content>
            </Popover>

            {/* Aggregated KPIs */}
            {selectedMonths.length > 0 ? (
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
                    <KPICard label="Devis" value={aggregated.quotesTotal} sub={`${aggregated.quotesCount} doc(s)`} color="text-sky-300" currency={currency} />
                    <KPICard label="Factures" value={aggregated.invoicesTotal} sub={`${aggregated.invoicesCount} doc(s)`} color="text-violet-300" currency={currency} />
                    <KPICard label="Encaisse" value={aggregated.paidTotal} sub={`${aggregated.paymentsCount} paiement(s)`} color="text-emerald-300" currency={currency} />
                    <KPICard label="Depenses" value={aggregated.expensesTotal} sub={`sur ${selectedMonths.length} mois`} color="text-rose-300" currency={currency} />
                    <KPICard label="Net" value={netTotal} sub={netTotal >= 0 ? 'Recettes - Depenses' : 'Depenses > Recettes'} color={netTotal >= 0 ? 'text-emerald-300' : 'text-rose-300'} currency={currency} />
                    <KPICard label="En retard" value={aggregated.overdueTotal} sub={`Restant: ${formatCompactMoney(aggregated.remainingTotal, currency)}`} color="text-red-300" currency={currency} />
                </div>
            ) : (
                <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-6 text-center text-xs text-[var(--text-muted)]">
                    Selectionnez un ou plusieurs mois pour afficher les indicateurs.
                </div>
            )}

            {/* Documents & Payments unified table */}
            <div className="min-w-0 rounded-xl border border-[var(--border)] bg-[var(--surface)]">
                <div className="flex flex-wrap items-center gap-2 border-b border-[var(--border)] px-3 py-2">
                    <div className="flex flex-wrap items-center gap-1">
                        {typeFilters.map((f) => {
                            const Icon = f.icon;
                            const active = typeFilter === f.id;
                            return (
                                <button key={f.id} type="button" onClick={() => setTypeFilter(f.id)}
                                    className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[11px] font-medium transition ${
                                        active
                                            ? 'border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] text-[var(--accent)]'
                                            : 'border-transparent text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]'
                                    }`}>
                                    <Icon size={12} className={active ? f.activeColor : f.color} />
                                    {f.label}
                                    <span className={`ml-0.5 rounded px-1 py-px text-[9px] font-semibold ${
                                        active ? f.bg + ' ' + f.activeColor : 'bg-[var(--surface-2)] text-[var(--text-muted)]'
                                    }`}>
                                        {typeCounts[f.id]}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                    <div className="ml-auto flex items-center gap-1">
                        <Popover placement="bottom-end">
                            <Popover.Trigger>
                                <AppButton size="sm" variant="ghost"
                                    className="h-7 min-w-0 gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 text-[11px] font-medium text-[var(--text)] transition hover:border-[var(--accent)]">
                                    <Download size={12} />
                                    Exporter
                                </AppButton>
                            </Popover.Trigger>
                            <Popover.Content className="min-w-44 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-1 shadow-xl">
                                <button type="button" onClick={exportPdf}
                                    className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-[11px] font-medium text-rose-400 transition hover:bg-rose-500/10">
                                    <FileText size={14} />
                                    <span className="flex flex-col items-start leading-tight">
                                        <span>PDF</span>
                                        <span className="text-[9px] font-normal text-[var(--text-muted)]">{exportLabel}</span>
                                    </span>
                                </button>
                                <button type="button" onClick={exportExcel}
                                    className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-[11px] font-medium text-emerald-400 transition hover:bg-emerald-500/10">
                                    <FileSpreadsheet size={14} />
                                    <span className="flex flex-col items-start leading-tight">
                                        <span>Excel</span>
                                        <span className="text-[9px] font-normal text-[var(--text-muted)]">{exportLabel}</span>
                                    </span>
                                </button>
                                <button type="button" onClick={exportCsv}
                                    className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-[11px] font-medium text-[var(--text)] transition hover:bg-[var(--surface-2)]">
                                    <FileDown size={14} />
                                    <span className="flex flex-col items-start leading-tight">
                                        <span>CSV</span>
                                        <span className="text-[9px] font-normal text-[var(--text-muted)]">{exportLabel}</span>
                                    </span>
                                </button>
                            </Popover.Content>
                        </Popover>
                        <div className="relative max-w-[180px]">
                            <Search size={12} className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                            <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Rechercher..."
                                className="h-7 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] pl-7 pr-2 text-[11px] text-[var(--text)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]"
                            />
                            {searchQuery ? (
                                <button type="button" onClick={() => setSearchQuery('')}
                                    className="absolute right-1 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)]">
                                    <X size={12} />
                                </button>
                            ) : null}
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-xs min-w-[700px]">
                        <thead>
                            <tr className="border-b border-[var(--border)] text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                                <th className="w-8 px-3 py-2"></th>
                                <th className="px-3 py-2">Numero</th>
                                <th className="px-3 py-2">Client</th>
                                <th className="px-3 py-2">Date</th>
                                <th className="px-3 py-2">Statut</th>
                                <th className="px-3 py-2 text-right">Total</th>
                                <th className="px-3 py-2 text-right">Restant</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRows.length > 0 ? filteredRows.map((row) => {
                                const type = row._type === 'payment' ? 'payment' : (row as FinanceMonthDocumentRow).type;
                                const meta = typeMeta(type);
                                return (
                                    <tr key={`${row._type}-${row.id}`}
                                        className="cursor-pointer border-b border-[var(--border)] transition hover:bg-[var(--surface-2)] last:border-0"
                                        onClick={() => row._type === 'document' && router.visit(`/finance/documents/${row.id}`)}>
                                        <td className="px-3 py-2">
                                            <span className={`inline-flex size-5 items-center justify-center rounded text-[10px] font-bold ${meta.bg} ${meta.color}`}>
                                                {meta.label}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2 font-medium text-[var(--text)]">
                                            {row._type === 'document' ? row.number : row.paymentNumber}
                                        </td>
                                        <td className="px-3 py-2 text-[var(--text-muted)]">
                                            {row.clientName || <span className="italic">—</span>}
                                        </td>
                                        <td className="px-3 py-2 text-[var(--text-muted)]">
                                            {row._type === 'document' ? row.issueDate : row.paidAt}
                                        </td>
                                        <td className="px-3 py-2">
                                            {row._type === 'document' ? (
                                                <span className={`rounded-full border px-1.5 py-0.5 text-[10px] font-medium ${statusStyle(row.status)}`}>
                                                    {statusLabel(row.status)}
                                                </span>
                                            ) : (
                                                <span className="text-[10px] text-[var(--text-muted)]">Paiement</span>
                                            )}
                                        </td>
                                        <td className="px-3 py-2 text-right font-semibold text-[var(--text)]">
                                            {formatCompactMoney(row._type === 'document' ? row.totalTtc : row.amount, currency)}
                                        </td>
                                        <td className="px-3 py-2 text-right text-[var(--text-muted)]">
                                            {row._type === 'document' ? (
                                                row.remainingTotal > 0 ? formatCompactMoney(row.remainingTotal, currency) : <span className="text-emerald-300">0</span>
                                            ) : <span className="text-[var(--text-muted)]">—</span>}
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan={7} className="px-3 py-8 text-center text-xs text-[var(--text-muted)]">
                                        {selectedKeys.size === 0
                                            ? 'Selectionnez un ou plusieurs mois pour afficher les documents.'
                                            : 'Aucun document trouve.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex items-center justify-between border-t border-[var(--border)] px-3 py-2">
                    <p className="text-[10px] text-[var(--text-muted)]">{filteredRows.length} element(s)</p>
                    <p className="text-[10px] text-[var(--text-muted)]">{selectedMonths.length} mois selectionne(s)</p>
                </div>
            </div>
        </section>
    );
}

function KPICard({ label, value, sub, color, currency }: { label: string; value: number; sub: string; color: string; currency: string }) {
    return (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">{label}</p>
            <p className={`mt-0.5 text-sm font-semibold ${color}`}>{formatCompactMoney(value, currency)}</p>
            <p className="text-[10px] text-[var(--text-muted)]">{sub}</p>
        </div>
    );
}
