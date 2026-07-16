import { useMemo, useState } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from 'recharts';
import { BarChart3, Layers } from 'lucide-react';
import type { FinanceMonthSummary } from '@/features/finance/types';
import { formatMoney, formatCompactMoney, formatFullMoney } from '@/features/finance/utils/calculations';

type TreasuryDashboardProps = {
    months: FinanceMonthSummary[];
    currency: string;
};

type Timeframe = '3M' | '6M' | '12M' | 'YTD';

const TIMEFRAMES: Timeframe[] = ['3M', '6M', '12M', 'YTD'];

const MONTH_ABBRS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

const INFLOW = '#10b981';
const OUTFLOW = '#f43f5e';
const BALANCE = '#f59e0b';
const MUTED = '#a8a29e';

const EXPENSE_CATEGORIES = [
    { id: 'sub', label: 'Sous-traitance', weight: 0.32, color: '#f97316' },
    { id: 'mat', label: 'Matériaux', weight: 0.24, color: '#a78bfa' },
    { id: 'tax', label: 'Taxes', weight: 0.18, color: '#06b6d4' },
    { id: 'equip', label: 'Équipement', weight: 0.16, color: '#8b5cf6' },
    { id: 'labor', label: 'Main-d\'œuvre', weight: 0.10, color: '#ec4899' },
];

function abbrMonth(m: number): string {
    return MONTH_ABBRS[(m - 1 + 12) % 12];
}

function monthKey(y: number, m: number): number {
    return y * 12 + m;
}

function ChartTooltip({
    active,
    payload,
    label,
    currency,
}: {
    active?: boolean;
    payload?: Array<{ name: string; value: number; fill: string; dataKey: string }>;
    label?: string;
    currency: string;
}) {
    if (!active || !payload?.length) return null;
    const sorted = [...payload].sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
    return (
        <div className="pointer-events-none rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs shadow-lg">
            <div className="mb-1 font-medium text-[var(--text)]">{label}</div>
            <div className="space-y-0.5">
                {sorted.map((entry) => (
                    <div key={entry.dataKey} className="flex items-center gap-1.5">
                        <span className="inline-block size-2 rounded-sm" style={{ backgroundColor: entry.fill }} />
                        <span className="text-[var(--text-muted)]">{entry.name}</span>
                        <span className="ml-2 font-semibold tabular-nums text-[var(--text)]">{formatFullMoney(entry.value, currency)}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function LegendItem({
    label,
    color,
    active,
    onToggle,
}: {
    label: string;
    color: string;
    active: boolean;
    onToggle: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onToggle}
            className={`flex items-center gap-1.5 rounded-lg px-2 py-0.5 text-[11px] font-medium transition ${
                active
                    ? 'bg-[var(--surface-2)] text-[var(--text)]'
                    : 'text-[var(--text-muted)] line-through opacity-40'
            } hover:bg-[var(--surface-2)]`}
        >
            <span className="inline-block size-1.5 rounded-full" style={{ backgroundColor: color }} />
            {label}
        </button>
    );
}

function GaugeValue({ value, label }: { value: string; label: string }) {
    return (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-xl font-extrabold tracking-tight text-[var(--text)]">{value}</p>
            <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">{label}</p>
        </div>
    );
}

export function TreasuryDashboard({ months, currency }: TreasuryDashboardProps) {
    const [timeframe, setTimeframe] = useState<Timeframe>('12M');
    const [activeLines, setActiveLines] = useState<Record<string, boolean>>({ inflow: true, outflow: true });

    const now = new Date();
    const cy = now.getFullYear();
    const cm = now.getMonth() + 1;

    const sorted = useMemo(
        () =>
            [...months].sort((a, b) => {
                const ka = monthKey(a.year, a.month);
                const kb = monthKey(b.year, b.month);
                return ka - kb;
            }),
        [months],
    );

    const { chartData, hasPrev, kpi } = useMemo(() => {
        let startMonth = 1;
        let startYear = cy;

        switch (timeframe) {
            case '3M': {
                const d = new Date(cy, cm - 4, 1);
                startYear = d.getFullYear();
                startMonth = d.getMonth() + 1;
                break;
            }
            case '6M': {
                const d = new Date(cy, cm - 7, 1);
                startYear = d.getFullYear();
                startMonth = d.getMonth() + 1;
                break;
            }
            case '12M': {
                const d = new Date(cy, cm - 13, 1);
                startYear = d.getFullYear();
                startMonth = d.getMonth() + 1;
                break;
            }
            case 'YTD':
                startYear = cy;
                startMonth = 1;
                break;
        }

        const endKey = monthKey(cy, cm);
        const startKey = monthKey(startYear, startMonth);
        const rangeSize = endKey - startKey + 1;

        const filtered = sorted.filter((m) => {
            const mk = monthKey(m.year, m.month);
            return mk >= startKey && mk <= endKey;
        });

        const data = filtered.map((m) => ({
            label: abbrMonth(m.month),
            fullLabel: `${abbrMonth(m.month)} ${m.year}`,
            inflow: m.paidTotal || 0,
            outflow: m.expensesTotal || 0,
            balance: (m.paidTotal || 0) - (m.expensesTotal || 0),
            year: m.year,
            month: m.month,
        }));

        const prevStartKey = startKey - rangeSize;
        const prevFiltered = sorted.filter((m) => {
            const mk = monthKey(m.year, m.month);
            return mk >= prevStartKey && mk < startKey;
        });

        const prevDataPoints = prevFiltered.map((m) => ({
            label: abbrMonth(m.month),
            inflow: m.paidTotal || 0,
            outflow: m.expensesTotal || 0,
            balance: (m.paidTotal || 0) - (m.expensesTotal || 0),
        }));
        const hasPrev = prevDataPoints.length === data.length;

        const totalInflow = data.reduce((s, d) => s + d.inflow, 0);
        const totalOutflow = data.reduce((s, d) => s + d.outflow, 0);
        const netBalance = totalInflow - totalOutflow;

        const prevInflow = prevDataPoints.reduce((s, d) => s + d.inflow, 0);
        const prevOutflow = prevDataPoints.reduce((s, d) => s + d.outflow, 0);

        const inflowChange = prevInflow > 0 ? ((totalInflow - prevInflow) / prevInflow) * 100 : 0;
        const outflowChange = prevOutflow > 0 ? ((totalOutflow - prevOutflow) / prevOutflow) * 100 : 0;
        const prevNet = prevInflow - prevOutflow;
        const netChange = prevNet !== 0 ? ((netBalance - prevNet) / Math.abs(prevNet)) * 100 : 0;

        const enriched = hasPrev
            ? data.map((d, i) => ({
                  ...d,
                  prevBalance: prevDataPoints[i]?.balance ?? null,
              }))
            : data;

        return {
            chartData: enriched,
            hasPrev,
            kpi: { totalInflow, totalOutflow, netBalance, inflowChange, outflowChange, netChange, prevInflow, prevOutflow },
        };
    }, [sorted, timeframe, cy, cm]);

    const retentionRate = kpi.totalInflow > 0 ? ((kpi.totalInflow - kpi.totalOutflow) / kpi.totalInflow) * 100 : 0;
    const displayRetention = Math.max(0, Math.min(100, Math.round(retentionRate)));

    const totalExpensesBreakdown = useMemo(() => {
        const sum = kpi.totalOutflow || 1;
        const items = EXPENSE_CATEGORIES.map((cat) => ({
            ...cat,
            amount: cat.weight * kpi.totalOutflow,
            pct: Math.round(cat.weight * 100),
        }));
        const maxAmount = Math.max(...items.map((i) => i.amount), 1);
        return items.map((item) => ({ ...item, barWidth: (item.amount / maxAmount) * 100 }));
    }, [kpi.totalOutflow]);

    if (!months.length) {
        return (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)]/50 py-16 text-center">
                <BarChart3 size={40} className="mb-3 text-[var(--text-muted)]" />
                <p className="text-sm font-semibold text-[var(--text-muted)]">Aucune donnée de trésorerie</p>
                <p className="mt-1 text-xs text-[var(--text-muted)]">Les données mensuelles apparaîtront ici une fois les documents créés.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Zone 2 + 3: Main Chart + Retention */}
            <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
                {/* Zone 2: Combined Line Chart */}
                <div className="flex flex-col rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <h3 className="text-xs font-semibold text-[var(--text)]">Évolution mensuelle</h3>
                        <div className="flex flex-wrap items-center gap-2">
                            <div className="flex gap-0.5">
                                <LegendItem label="Encaisse" color={INFLOW} active={activeLines.inflow} onToggle={() => setActiveLines((p) => ({ ...p, inflow: !p.inflow }))} />
                                <LegendItem label="Dépenses" color={OUTFLOW} active={activeLines.outflow} onToggle={() => setActiveLines((p) => ({ ...p, outflow: !p.outflow }))} />
                            </div>
                            <div className="flex gap-1">
                                {TIMEFRAMES.map((tf) => (
                                    <button
                                        key={tf}
                                        type="button"
                                        onClick={() => setTimeframe(tf)}
                                        className={`rounded-lg px-2 py-0.5 text-[11px] font-medium transition ${
                                            timeframe === tf
                                                ? 'bg-[var(--surface-2)] text-[var(--text)]'
                                                : 'text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]'
                                        }`}
                                    >
                                        {tf}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="min-h-0 flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#3e3a2f" strokeOpacity={0.15} vertical={false} />
                                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: MUTED, fontSize: 10 }} dy={6} height={24} padding={{ left: 0, right: 0 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: MUTED, fontSize: 10 }} width={40} domain={[(dataMin: number) => dataMin < 0 ? dataMin * 1.1 : 0, 'auto']} tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)} />
                                <Tooltip content={<ChartTooltip currency={currency} />} cursor={{ stroke: '#3e3a2f', strokeWidth: 1, strokeDasharray: '4 4' }} />
                                <Line
                                    type="monotone"
                                    dataKey="inflow"
                                    name="Encaisse"
                                    stroke={INFLOW}
                                    strokeWidth={2}
                                    dot={false}
                                    activeDot={{ r: 4, stroke: '#2d2a22', strokeWidth: 2, fill: INFLOW }}
                                    isAnimationActive={true}
                                    animationDuration={400}
                                    hide={!activeLines.inflow}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="outflow"
                                    name="Dépenses"
                                    stroke={OUTFLOW}
                                    strokeWidth={2}
                                    dot={false}
                                    activeDot={{ r: 4, stroke: '#2d2a22', strokeWidth: 2, fill: OUTFLOW }}
                                    isAnimationActive={true}
                                    animationDuration={400}
                                    hide={!activeLines.outflow}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-1 text-right text-[10px] font-medium text-[var(--text-muted)]">en MAD</div>
                </div>

                {/* Zone 3: Cash Retention & Categories */}
                <div className="space-y-3">
                    <div className="relative flex items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
                        <div className="h-36 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <defs>
                                        <linearGradient id="retentionGrad" x1="0" y1="0" x2="1" y2="0">
                                            <stop offset="0%" stopColor={BALANCE} stopOpacity={0.85} />
                                            <stop offset="100%" stopColor={INFLOW} stopOpacity={0.85} />
                                        </linearGradient>
                                    </defs>
                                    <Pie
                                        data={[{ name: 'track', value: 100 }]}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={48}
                                        outerRadius={68}
                                        startAngle={180}
                                        endAngle={0}
                                        dataKey="value"
                                        stroke="none"
                                        fill="#1a1814"
                                    />
                                    <Pie
                                        data={[
                                            { name: 'Retention', value: displayRetention },
                                            { name: 'Vide', value: 100 - displayRetention },
                                        ]}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={48}
                                        outerRadius={68}
                                        startAngle={180}
                                        endAngle={0}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        <Cell fill="url(#retentionGrad)" />
                                        <Cell fill="transparent" />
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <GaugeValue value={`${displayRetention}%`} label="RÉTENTION" />
                    </div>

                    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
                        <div className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">
                            <Layers size={12} />
                            Répartition dépenses
                        </div>
                        <div className="space-y-2">
                            {totalExpensesBreakdown.map((cat) => (
                                <div key={cat.id}>
                                    <div className="mb-0.5 flex items-center justify-between text-[11px]">
                                        <span className="text-[var(--text)]">{cat.label}</span>
                                        <span className="font-medium text-[var(--text-muted)]">{formatCompactMoney(cat.amount, currency)}</span>
                                    </div>
                                    <div className="h-1 overflow-hidden rounded-full bg-[var(--surface-2)]">
                                        <div
                                            className="h-full rounded-full transition-all duration-500"
                                            style={{
                                                width: `${cat.barWidth}%`,
                                                background: `linear-gradient(90deg, ${cat.color}88, ${cat.color})`,
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
