import { type ReactNode, useMemo } from 'react';
import { cn } from '@/lib/cn';

type KpiCardProps = {
    icon: ReactNode;
    label: string;
    value: string | number;
    sparklineData: number[];
    trend?: { label: string; isUp: boolean } | null;
    detail?: string;
    className?: string;
};

function SparklineSvg({ data, color }: { data: number[]; color: string }) {
    if (data.length < 2) return null;
    const w = 96;
    const h = 36;
    const mn = Math.min(...data);
    const mx = Math.max(...data);
    const rng = mx - mn || 1;
    const pad = 2;
    const pts = data
        .map((v, i) => {
            const x = pad + (i / (data.length - 1)) * (w - pad * 2);
            const y = h - pad - ((v - mn) / rng) * (h - pad * 2);
            return `${x.toFixed(1)},${y.toFixed(1)}`;
        })
        .join(' ');
    const area = `${pts} ${w - pad},${h - pad} ${pad},${h - pad}`;
    const gradId = `kpi-sg-${color.replace(/\W/g, '')}`;
    return (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="shrink-0" aria-hidden>
            <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.25" />
                    <stop offset="100%" stopColor={color} stopOpacity="0.02" />
                </linearGradient>
            </defs>
            <polygon fill={`url(#${gradId})`} points={area} />
            <polyline fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={pts} />
        </svg>
    );
}

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

export function MetricSparklineCard({ icon, label, value, sparklineData, trend, detail, className }: KpiCardProps) {
    const trendPct = useMemo(() => computeTrendPct(sparklineData), [sparklineData]);
    const trendIsUp = trendPct >= 0;
    const lineColor = trend ? (trend.isUp ? 'var(--crm-success)' : 'var(--crm-danger)') : trendIsUp ? 'var(--crm-success)' : 'var(--crm-danger)';

    return (
        <div className={cn('crm-panel overflow-hidden', className)}>
            <div className="flex items-start justify-between gap-3 p-4">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                    {icon ? (
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--crm-surface-2)] text-[var(--crm-text-soft)]">
                            {icon}
                        </div>
                    ) : null}
                    <div className="min-w-0 flex-1">
                        <p className="crm-kpi-label">{label}</p>
                        <p className="crm-kpi-value">{value}</p>
                    </div>
                </div>
                <SparklineSvg data={sparklineData} color={lineColor} />
            </div>
            <div className="flex items-center gap-3 border-t border-[var(--crm-border)] px-4 py-2.5">
                {trend ? (
                    <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[12px] font-semibold ${
                            trend.isUp
                                ? 'bg-emerald-400/10 text-emerald-300'
                                : 'bg-red-400/10 text-red-300'
                        }`}
                    >
                        {trend.isUp ? '\u25B2' : '\u25BC'} {trend.label}
                    </span>
                ) : trendPct !== 0 ? (
                    <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[12px] font-semibold ${
                            trendIsUp
                                ? 'bg-emerald-400/10 text-emerald-300'
                                : 'bg-red-400/10 text-red-300'
                        }`}
                    >
                        {trendIsUp ? '\u25B2' : '\u25BC'} {Math.abs(trendPct).toFixed(1)}%
                    </span>
                ) : null}
                {detail && (
                    <span className="truncate text-[12px] text-[var(--crm-text-soft)]">{detail}</span>
                )}
            </div>
        </div>
    );
}
