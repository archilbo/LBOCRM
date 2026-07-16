import { type ReactNode, useMemo } from 'react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '@/lib/cn';
import { formatFullMoney, getTrendHex, type MetricSemantic } from '@/features/finance/utils/calculations';

type KpiCardProps = {
    icon: ReactNode;
    label: string;
    value: string | number;
    sparklineData: number[];
    trend?: { label: string; isUp: boolean } | null;
    detail?: string;
    className?: string;
    metricType?: MetricSemantic;
    fullValue?: number;
    currency?: string;
};

function computeTrendPct(data: number[]): number {
    if (data.length < 3) return 0;
    const n = data.length;
    const half = Math.floor(n / 2);
    const firstHalf = data.slice(0, half);
    const secondHalf = data.slice(n - half);
    const avgFirst = firstHalf.reduce((s, v) => s + v, 0) / half;
    const avgSecond = secondHalf.reduce((s, v) => s + v, 0) / half;
    if (avgFirst === 0) return 0;
    return ((avgSecond - avgFirst) / Math.abs(avgFirst)) * 100;
}

export function MetricSparklineCard({ icon, label, value, sparklineData, trend, detail, className, metricType = 'revenue', fullValue, currency = 'MAD' }: KpiCardProps) {
    const trendPct = useMemo(() => computeTrendPct(sparklineData), [sparklineData]);
    const trendIsUp = trendPct >= 0;
    const lineColor = trend
        ? (trend.isUp ? getTrendHex(metricType, 1) : getTrendHex(metricType, -1))
        : getTrendHex(metricType, trendPct);
    const sparkId = `mspark-${label.replace(/\s+/g, '')}`;
    const fullTitle = fullValue !== undefined ? formatFullMoney(fullValue, currency) : undefined;

    const chartData = useMemo(
        () => sparklineData.map((v) => ({ v })),
        [sparklineData],
    );

    const trendColor = trend
        ? (trend.isUp ? getTrendHex(metricType, 1) : getTrendHex(metricType, -1))
        : getTrendHex(metricType, trendPct);
    const trendIsFavorable = trendColor === '#10b981';
    const trendTextClass = trendIsFavorable ? 'text-emerald-400' : 'text-rose-400';

    return (
        <div className={cn('rounded-xl border border-[var(--border)] bg-[var(--surface)]', className)}>
            <div className="p-4 pb-2">
                <div className="flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                        {icon}
                        {label}
                    </div>
                    <div className="shrink-0">
                        {trend ? (
                            <span className={`inline-flex items-center gap-0.5 text-[11px] font-medium ${trendTextClass}`}>
                                {trend.isUp ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                                {trend.label}
                            </span>
                        ) : trendPct !== 0 ? (
                            <span className={`inline-flex items-center gap-0.5 text-[11px] font-medium ${trendTextClass}`}>
                                {trendIsUp ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                                {Math.abs(trendPct).toFixed(1)}%
                            </span>
                        ) : null}
                    </div>
                </div>
                <p className="mt-1 text-lg font-bold tracking-tight text-[var(--text)]" title={fullTitle}>{value}</p>
                {detail && (
                    <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">{detail}</p>
                )}
            </div>
            <div className="h-7 w-full px-1 pb-1.5">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                        <defs>
                            <linearGradient id={sparkId} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={lineColor} stopOpacity={0.3} />
                                <stop offset="100%" stopColor={lineColor} stopOpacity={0.02} />
                            </linearGradient>
                        </defs>
                        <Area
                            type="monotone"
                            dataKey="v"
                            stroke={lineColor}
                            strokeWidth={1.5}
                            fill={`url(#${sparkId})`}
                            dot={false}
                            activeDot={false}
                            isAnimationActive={true}
                            animationDuration={300}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
