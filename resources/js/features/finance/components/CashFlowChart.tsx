import { useMemo } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer,
} from 'recharts';
import { AppCard } from '@/components/ui/AppCard';
import type { FinanceMonthSummary } from '@/features/finance/types';
import { formatMoney } from '@/features/finance/utils/calculations';

type CashFlowChartProps = {
    monthlySummaries: FinanceMonthSummary[];
    currency: string;
};

function CustomTooltip({ active, payload, label, currency }: { active?: boolean; payload?: Array<{ name: string; value: number; fill: string }>; label?: string; currency: string }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm shadow-sm">
            <p className="mb-2 font-semibold">{label}</p>
            <div className="space-y-1">
                {payload.map((entry) => (
                    <div key={entry.name} className="flex items-center gap-2">
                        <span className="inline-block size-2.5 rounded" style={{ backgroundColor: entry.fill }} />
                        <span className="text-[var(--text-muted)]">{entry.name}</span>
                        <span className="ml-auto font-semibold">{formatMoney(entry.value, currency)}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function CashFlowChart({ monthlySummaries, currency }: CashFlowChartProps) {
    const chartData = useMemo(() => {
        return [...monthlySummaries]
            .sort((a, b) => {
                const ka = a.year * 12 + a.month;
                const kb = b.year * 12 + b.month;
                return ka - kb;
            })
            .slice(-6)
            .map((m) => ({
                label: m.label.slice(2),
                paid: m.paidTotal || 0,
                expenses: m.expensesTotal || 0,
            }));
    }, [monthlySummaries]);

    const totalPaid = chartData.reduce((s, m) => s + m.paid, 0);
    const totalExp = chartData.reduce((s, m) => s + m.expenses, 0);

    if (chartData.length === 0) return null;

    return (
        <AppCard className="p-5">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
                <h3 className="text-sm font-semibold">Tresorerie mensuelle</h3>
                <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--text-muted)]">
                    <span className="flex items-center gap-1.5">
                        <span className="inline-block size-2.5 rounded-sm bg-emerald-500" /> Encaisse
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="inline-block size-2.5 rounded-sm bg-rose-500" /> Depenses
                    </span>
                    <span className="text-xs text-[var(--text-muted)]">
                        Solde: <span className="font-semibold text-[var(--text)]">{formatMoney(totalPaid - totalExp, currency)}</span>
                    </span>
                </div>
            </div>

            <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} barGap={4} barCategoryGap="20%" margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="paidGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#4ade80" stopOpacity="1" />
                                <stop offset="100%" stopColor="#4ade80" stopOpacity="0.5" />
                            </linearGradient>
                            <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#fb5c5c" stopOpacity="1" />
                                <stop offset="100%" stopColor="#fb5c5c" stopOpacity="0.4" />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.3} vertical={false} />
                        <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} dy={6} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} width={60} tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)} />
                        <Tooltip content={<CustomTooltip currency={currency} />} cursor={{ fill: 'var(--border)', opacity: 0.15, radius: 8 }} />
                        <Bar dataKey="expenses" name="Depenses" fill="url(#expGrad)" radius={[6, 6, 0, 0]} maxBarSize={28} />
                        <Bar dataKey="paid" name="Encaisse" fill="url(#paidGrad)" radius={[6, 6, 0, 0]} maxBarSize={28} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </AppCard>
    );
}
