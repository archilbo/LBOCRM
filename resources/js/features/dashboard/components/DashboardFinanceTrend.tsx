import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { IconChartBar } from '@tabler/icons-react';

import type { DashboardFinanceTrendPoint } from '@/features/dashboard/types';
import { formatCompactMoney } from '@/lib/currency';
import { useTranslation } from '@/lib/i18n';

type Props = {
    points: DashboardFinanceTrendPoint[];
};

type TooltipEntry = {
    name?: string;
    value?: number;
    color?: string;
};

function FinanceTooltip({
    active,
    label,
    payload,
}: {
    active?: boolean;
    label?: string;
    payload?: TooltipEntry[];
}) {
    if (!active || !payload?.length) {
        return null;
    }

    return (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-xs shadow-xl">
            <p className="mb-2 font-semibold text-[var(--foreground)]">{label}</p>
            <div className="space-y-1.5">
                {payload.map((entry) => (
                    <div key={entry.name} className="flex items-center justify-between gap-5">
                        <span className="flex items-center gap-1.5 text-[var(--text-muted)]">
                            <span className="size-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
                            {entry.name}
                        </span>
                        <span className="font-semibold tabular-nums text-[var(--foreground)]">{formatCompactMoney(entry.value ?? 0)}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function DashboardFinanceTrend({ points }: Props) {
    const { t } = useTranslation();
    const totalInvoiced = points.reduce((total, point) => total + point.invoiced, 0);
    const totalCollected = points.reduce((total, point) => total + point.collected, 0);
    const hasData = points.some((point) => point.invoiced > 0 || point.collected > 0);

    if (!hasData) {
        return (
            <div className="flex min-h-52 flex-col items-center justify-center px-4 text-center">
                <span className="flex size-10 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] text-[var(--accent)]"><IconChartBar size={18} /></span>
                <p className="mt-3 text-sm font-semibold text-[var(--foreground)]">{t('dashboard.chart.noFinanceData')}</p>
                <p className="mt-1 max-w-xs text-xs leading-5 text-[var(--text-muted)]">{t('dashboard.chart.noFinanceDataDetail')}</p>
            </div>
        );
    }

    return (
        <div className="px-4 pb-4 pt-3">
            <div className="mb-3 flex flex-wrap items-baseline gap-x-5 gap-y-1">
                <p className="text-lg font-semibold tracking-[-0.03em] text-[var(--foreground)]">{formatCompactMoney(totalCollected)}</p>
                <p className="text-xs text-[var(--text-muted)]"><span className="font-medium text-[var(--foreground)]">{formatCompactMoney(totalInvoiced)}</span> {t('dashboard.chart.invoiced').toLowerCase()}</p>
                <div className="ml-auto flex items-center gap-3 text-[10px] font-medium text-[var(--text-muted)]">
                    <span className="flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-emerald-500" />{t('dashboard.chart.collected')}</span>
                    <span className="flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-[var(--accent)]" />{t('dashboard.chart.invoiced')}</span>
                </div>
            </div>
            <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={points} margin={{ top: 4, right: 2, left: -18, bottom: 0 }}>
                        <defs>
                            <linearGradient id="dashboard-collected-gradient" x1="0" x2="0" y1="0" y2="1">
                                <stop offset="0%" stopColor="#10b981" stopOpacity={0.34} />
                                <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="dashboard-invoiced-gradient" x1="0" x2="0" y1="0" y2="1">
                                <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.2} />
                                <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 5" />
                        <XAxis axisLine={false} dataKey="label" tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                        <YAxis axisLine={false} tickLine={false} tick={false} width={18} />
                        <Tooltip content={<FinanceTooltip />} cursor={{ stroke: 'var(--border-strong)', strokeWidth: 1 }} />
                        <Area dataKey="invoiced" name={t('dashboard.chart.invoiced')} stroke="var(--accent)" strokeWidth={2} fill="url(#dashboard-invoiced-gradient)" type="monotone" />
                        <Area dataKey="collected" name={t('dashboard.chart.collected')} stroke="#10b981" strokeWidth={2} fill="url(#dashboard-collected-gradient)" type="monotone" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
