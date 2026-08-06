import { type ReactNode, useId, useMemo } from 'react';
import { IconArrowDownRight, IconArrowUpRight } from '@tabler/icons-react';

import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/cn';
import { formatFullMoney } from '@/lib/currency';

export type KpiMetricSemantic = 'revenue' | 'expense' | 'overdue';

type AppKpiCardProps = {
    icon?: ReactNode;
    label: ReactNode;
    value: string | number;
    detail?: ReactNode;
    sparklineData?: number[];
    trend?: { label: string; isUp: boolean } | null;
    metricType?: KpiMetricSemantic;
    accentColor?: string;
    showAutoTrend?: boolean;
    fullValue?: number;
    currency?: string;
    valueClassName?: string;
    className?: string;
    onPress?: () => void;
    isSelected?: boolean;
    disabled?: boolean;
    trailing?: ReactNode;
    /** Stacked layout: row 1 = icon + label, row 2 = count value. */
    stacked?: boolean;
};

function computeTrendPct(data: number[]): number {
    if (data.length < 3) return 0;

    const half = Math.floor(data.length / 2);
    const average = (values: number[]) => values.reduce((sum, value) => sum + value, 0) / values.length;
    const start = average(data.slice(0, half));
    const end = average(data.slice(-half));

    return start === 0 ? 0 : ((end - start) / Math.abs(start)) * 100;
}

function trendColor(metricType: KpiMetricSemantic, percentChange: number): string {
    const increaseIsGood = metricType === 'revenue';
    const favorable = percentChange === 0 || (percentChange > 0) === increaseIsGood;

    return favorable ? '#10b981' : '#f43f5e';
}

export function AppKpiCard({
    icon,
    label,
    value,
    detail,
    sparklineData,
    trend,
    metricType = 'revenue',
    accentColor,
    showAutoTrend = true,
    fullValue,
    currency = 'MAD',
    valueClassName,
    className,
    onPress,
    isSelected = false,
    disabled = false,
    trailing,
    stacked = false,
}: AppKpiCardProps) {
    const gradientId = useId().replace(/:/g, '');
    const chartData = useMemo(() => sparklineData?.map((value) => ({ value })) ?? [], [sparklineData]);
    const trendPct = useMemo(() => computeTrendPct(sparklineData ?? []), [sparklineData]);
    const resolvedTrendColor = accentColor ?? (trend
        ? trendColor(metricType, trend.isUp ? 1 : -1)
        : trendColor(metricType, trendPct));
    const isFavorableTrend = (trend
        ? trendColor(metricType, trend.isUp ? 1 : -1)
        : trendColor(metricType, trendPct)) === '#10b981';
    const title = fullValue === undefined ? undefined : formatFullMoney(fullValue, currency);

    const content = stacked ? (
        <div className="flex flex-col gap-2 px-3 py-3">
            <div className="flex min-w-0 items-center gap-2">
                {icon ? <span className="flex shrink-0 items-center justify-center">{icon}</span> : null}
                <span className="truncate text-[9px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">{label}</span>
            </div>
            <p className={cn('text-2xl font-bold leading-none tracking-tight text-[var(--text)] tabular-nums', valueClassName)} title={title}>{value}</p>
        </div>
    ) : (
        <>
            <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] gap-x-2 py-4 px-3">
                {/* col 1, row-span 2 — icon tile (padding-based, sized to icon) */}
                {icon ? <span className="col-start-1 row-span-2 row-start-1 flex shrink-0 items-center justify-center rounded-lg bg-[var(--surface-2)] p-2">{icon}</span> : null}
                {/* col 2, row 1 — label */}
                <div className="col-start-2 row-start-1 flex min-w-0 items-center text-[9px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                    <span className="truncate">{label}</span>
                </div>
                {/* col 2, row 2 — other label (detail) + trend */}
                <div className="col-start-2 row-start-2 flex min-w-0 items-center gap-1.5">
                    {detail ? <p className="truncate text-[10px] text-[var(--text-muted)]">{detail}</p> : null}
                    <span className="ml-auto flex shrink-0 items-center gap-1.5">
                        {trailing}
                        {trend ? (
                            <span className={cn('inline-flex items-center gap-0.5 text-[10px] font-medium', isFavorableTrend ? 'text-emerald-600' : 'text-rose-600')}>
                                {trend.isUp ? <IconArrowUpRight size={11} /> : <IconArrowDownRight size={11} />}
                                {trend.label}
                            </span>
                        ) : showAutoTrend && sparklineData && trendPct !== 0 ? (
                            <span className={cn('inline-flex items-center gap-0.5 text-[10px] font-medium', isFavorableTrend ? 'text-emerald-600' : 'text-rose-600')}>
                                {trendPct >= 0 ? <IconArrowUpRight size={11} /> : <IconArrowDownRight size={11} />}
                                {Math.abs(trendPct).toFixed(1)}%
                            </span>
                        ) : null}
                    </span>
                </div>
                {/* col 3, row-span 2 — value number */}
                <p className={cn('col-start-3 row-span-2 row-start-1 flex items-center justify-end text-lg font-bold tracking-tight text-[var(--text)]', valueClassName)} title={title}>{value}</p>
            </div>
            {sparklineData ? (
                <div className="h-6 w-full px-1 pb-1" aria-hidden="true">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                            <defs>
                                <linearGradient id={`kpi-${gradientId}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={resolvedTrendColor} stopOpacity={0.3} />
                                    <stop offset="100%" stopColor={resolvedTrendColor} stopOpacity={0.02} />
                                </linearGradient>
                            </defs>
                            <Area type="monotone" dataKey="value" stroke={resolvedTrendColor} strokeWidth={1.5} fill={`url(#kpi-${gradientId})`} dot={false} activeDot={false} isAnimationActive animationDuration={300} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            ) : null}
        </>
    );

    const rootClassName = cn(
        'overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)] text-left transition hover:border-[color-mix(in_srgb,var(--accent)_35%,var(--border))]',
        isSelected && 'border-[color-mix(in_srgb,var(--accent)_48%,var(--border))] bg-[color-mix(in_srgb,var(--accent)_6%,var(--surface))]',
        onPress && !disabled && 'cursor-pointer hover:bg-[var(--surface-2)]',
        disabled && 'cursor-not-allowed opacity-60',
        className,
    );

    if (onPress) {
        return <button type="button" className={rootClassName} onClick={onPress} disabled={disabled}>{content}</button>;
    }

    return <div className={rootClassName}>{content}</div>;
}
