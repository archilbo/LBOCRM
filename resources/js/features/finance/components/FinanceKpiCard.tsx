import { type ReactNode, useId, useMemo } from 'react';
import { IconArrowDownRight, IconArrowUpRight } from '@tabler/icons-react';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';

import { cn } from '@/lib/cn';
import { formatCompactMoney, formatFullMoney } from '@/lib/currency';

export type FinanceKpiMetricSemantic = 'revenue' | 'expense' | 'overdue';

export type FinanceKpiCardProps = {
    icon?: ReactNode;
    label: ReactNode;
    value: string | number;
    detail?: ReactNode;
    sparklineData?: number[];
    trend?: { label: string; isUp: boolean } | null;
    metricType?: FinanceKpiMetricSemantic;
    accentColor?: string;
    /**
     * Disabled by default because a sparkline alone is not necessarily
     * a valid comparison period. Prefer a backend-provided `trend`.
     */
    showAutoTrend?: boolean;
    fullValue?: number;
    currency?: string;
    valueClassName?: string;
    className?: string;
    onPress?: () => void;
    isSelected?: boolean;
    disabled?: boolean;
    trailing?: ReactNode;
    /** Compact variant used by small count cards. */
    stacked?: boolean;
    /**
     * Kept for backward compatibility. When enabled, a numeric value is
     * formatted as money and the currency remains attached.
     */
    keepCurrencyAttached?: boolean;
    loading?: boolean;
    metricTypeSemantic?: FinanceKpiMetricSemantic;
};

type ParsedValue = {
    amount: string;
    currency: string;
};

function formatCompactMoneyParts(value: number, currency: string): ParsedValue {
    return parseFormattedValue(formatCompactMoney(value, currency), currency, true);
}

function parseFormattedValue(
    value: string | number,
    fallbackCurrency: string,
    formatNumericAsMoney: boolean,
): ParsedValue {
    if (typeof value === 'number') {
        if (formatNumericAsMoney && Number.isFinite(value)) {
            return formatCompactMoneyParts(value, fallbackCurrency);
        }

        return {
            amount: new Intl.NumberFormat('fr-FR').format(value),
            currency: '',
        };
    }

    const normalizedValue = value.trim();
    const match = normalizedValue.match(/^(.*?)\s+([A-Z]{3})$/u);

    if (match?.[1] && match[2]) {
        return {
            amount: match[1].trim(),
            currency: match[2],
        };
    }

    return {
        amount: normalizedValue,
        currency: '',
    };
}

function computeTrendPercent(data: number[]): number | null {
    if (data.length < 3) {
        return null;
    }

    const half = Math.floor(data.length / 2);

    if (half === 0) {
        return null;
    }

    const average = (values: number[]): number =>
        values.reduce((sum, currentValue) => sum + currentValue, 0) / values.length;

    const start = average(data.slice(0, half));
    const end = average(data.slice(-half));

    if (!Number.isFinite(start) || !Number.isFinite(end) || start === 0) {
        return null;
    }

    return ((end - start) / Math.abs(start)) * 100;
}

function isTrendFavorable(
    metricType: FinanceKpiMetricSemantic,
    isUp: boolean,
): boolean {
    return metricType === 'revenue' ? isUp : !isUp;
}

function formatTrendPercent(value: number): string {
    return new Intl.NumberFormat('fr-FR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 1,
    }).format(Math.abs(value));
}

export function FinanceKpiCard({
    icon,
    label,
    value,
    detail,
    sparklineData,
    trend,
    metricType = 'revenue',
    accentColor,
    showAutoTrend = false,
    fullValue,
    currency = 'MAD',
    valueClassName,
    className,
    onPress,
    isSelected = false,
    disabled = false,
    trailing,
    stacked = false,
    keepCurrencyAttached = false,
    loading = false,
    metricTypeSemantic,
}: FinanceKpiCardProps) {
    const effectiveMetricType = metricTypeSemantic ?? metricType;
    const gradientId = useId().replace(/:/g, '');

    const chartData = useMemo(
        () =>
            (sparklineData ?? [])
                .filter(Number.isFinite)
                .map((chartValue) => ({ value: chartValue })),
        [sparklineData],
    );

    const autoTrendPercent = useMemo(
        () => computeTrendPercent(sparklineData ?? []),
        [sparklineData],
    );

    const numericFullValue =
        typeof fullValue === 'number' && Number.isFinite(fullValue)
            ? fullValue
            : undefined;

    const parsedValue = useMemo(() => {
        if (numericFullValue !== undefined) {
            return formatCompactMoneyParts(numericFullValue, currency);
        }

        return parseFormattedValue(
            value,
            currency,
            keepCurrencyAttached,
        );
    }, [currency, keepCurrencyAttached, numericFullValue, value]);

    const exactValueTitle =
        numericFullValue === undefined
            ? undefined
            : formatFullMoney(numericFullValue, currency);

    const autoTrend =
        showAutoTrend &&
        trend == null &&
        autoTrendPercent !== null &&
        autoTrendPercent !== 0
            ? {
                  label: `${formatTrendPercent(autoTrendPercent)} %`,
                  isUp: autoTrendPercent > 0,
              }
            : null;

    const displayedTrend = trend ?? autoTrend;
    const favorableTrend = displayedTrend
        ? isTrendFavorable(effectiveMetricType, displayedTrend.isUp)
        : null;

    const resolvedSparklineColor =
        accentColor ??
        (favorableTrend === null
            ? 'var(--accent)'
            : favorableTrend
              ? '#10b981'
              : '#f43f5e');

    const rootClassName = cn(
        '@container relative h-full min-w-0 overflow-hidden rounded-2xl border',
        'border-[var(--border)] bg-[var(--surface)] text-left',
        'transition-[border-color,background-color] duration-200',
        stacked ? 'min-h-[104px]' : 'min-h-[152px]',
        isSelected &&
            'border-[color-mix(in_srgb,var(--accent)_48%,var(--border))] bg-[color-mix(in_srgb,var(--accent)_6%,var(--surface))]',
        onPress &&
            !disabled && [
                'cursor-pointer',
                'hover:border-[color-mix(in_srgb,var(--accent)_32%,var(--border))]',
                'hover:bg-[color-mix(in_srgb,var(--surface-2)_45%,var(--surface))]',
                'focus-visible:outline-none focus-visible:ring-2',
                'focus-visible:ring-[color-mix(in_srgb,var(--accent)_55%,transparent)]',
                'focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]',
            ],
        disabled && 'cursor-not-allowed opacity-60',
        loading && 'animate-pulse',
        className,
    );

    if (loading) {
        const skeleton = (
            <div
                className={cn(
                    'flex h-full min-w-0 flex-col',
                    stacked ? 'p-3' : 'p-4',
                )}
            >
                <div className="flex min-w-0 items-center gap-3">
                    <div className="size-9 shrink-0 rounded-xl bg-[var(--surface-3)]" />
                    <div className="h-3.5 w-28 max-w-[55%] rounded bg-[var(--surface-3)]" />
                    <div className="ml-auto h-6 w-14 rounded-full bg-[var(--surface-3)]" />
                </div>

                <div className={cn('h-8 w-36 max-w-[75%] rounded bg-[var(--surface-3)]', stacked ? 'mt-4' : 'mt-5')} />
                <div className="mt-2 h-3 w-24 max-w-[55%] rounded bg-[var(--surface-3)]" />

                {!stacked ? (
                    <div className="mt-auto h-7 w-full rounded-lg bg-[var(--surface-3)]" />
                ) : null}
            </div>
        );

        return <div className={rootClassName}>{skeleton}</div>;
    }

    const trendBadge = displayedTrend ? (
        <span
            className={cn(
                'inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1',
                'text-[11px] font-semibold leading-none tabular-nums',
                favorableTrend
                    ? 'bg-emerald-500/10 text-emerald-500'
                    : 'bg-rose-500/10 text-rose-500',
            )}
        >
            {displayedTrend.isUp ? (
                <IconArrowUpRight size={12} aria-hidden="true" />
            ) : (
                <IconArrowDownRight size={12} aria-hidden="true" />
            )}
            <span>{displayedTrend.label}</span>
        </span>
    ) : null;

    const content = (
        <div
            className={cn(
                'flex h-full min-w-0 flex-col',
                stacked ? 'p-3' : 'px-3 pb-2 pt-3 @[220px]:px-4 @[220px]:pb-3 @[220px]:pt-4',
            )}
        >
            <div className="flex min-w-0 items-start gap-2.5 @[220px]:gap-3">
                {icon ? (
                    <span
                        className={cn(
                            'flex shrink-0 items-center justify-center rounded-xl',
                            'bg-[var(--surface-2)] text-[var(--accent)]',
                            'size-8 @[220px]:size-9',
                        )}
                        aria-hidden="true"
                    >
                        {icon}
                    </span>
                ) : null}

                <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 items-start justify-between gap-2">
                        <div className="line-clamp-2 min-w-0 text-xs font-medium leading-4 text-[var(--text-muted)] @[220px]:text-sm @[220px]:leading-5">
                            {label}
                        </div>

                        {(trailing || trendBadge) ? (
                            <div className="flex shrink-0 items-center gap-1.5">
                                {trailing}
                                {trendBadge}
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>

            <div className={cn('min-w-0', stacked ? 'mt-4' : 'mt-4 @[220px]:mt-5')}>
                <div className="flex min-w-0 items-baseline gap-1.5">
                    <span
                        className={cn(
                            'min-w-0 overflow-hidden text-ellipsis whitespace-nowrap',
                            'font-bold leading-none tracking-tight tabular-nums text-[var(--text)]',
                            'text-[clamp(1.4rem,1.15rem+1.1cqi,2rem)]',
                            valueClassName,
                        )}
                        title={exactValueTitle}
                    >
                        {parsedValue.amount}
                    </span>

                    {parsedValue.currency ? (
                        <span className="shrink-0 text-xs font-semibold leading-none text-[var(--text-muted)] @[220px]:text-sm">
                            {parsedValue.currency}
                        </span>
                    ) : null}
                </div>

                {detail ? (
                    <div className="mt-2 truncate text-xs leading-4 text-[var(--text-muted)]">
                        {detail}
                    </div>
                ) : (
                    <div className="mt-2 h-4" aria-hidden="true" />
                )}
            </div>

            {!stacked ? (
                <div
                    className="mt-auto h-8 w-full pt-2 @[220px]:h-10 @[220px]:pt-3"
                    aria-hidden="true"
                >
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                                data={chartData}
                                margin={{ top: 1, right: 0, bottom: 0, left: 0 }}
                            >
                                <defs>
                                    <linearGradient
                                        id={`finance-kpi-${gradientId}`}
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop
                                            offset="0%"
                                            stopColor={resolvedSparklineColor}
                                            stopOpacity={0.16}
                                        />
                                        <stop
                                            offset="100%"
                                            stopColor={resolvedSparklineColor}
                                            stopOpacity={0}
                                        />
                                    </linearGradient>
                                </defs>

                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke={resolvedSparklineColor}
                                    strokeWidth={1.75}
                                    fill={`url(#finance-kpi-${gradientId})`}
                                    dot={false}
                                    activeDot={false}
                                    isAnimationActive={false}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex h-full items-end px-1 pb-1">
                            <div className="h-px w-full bg-[color-mix(in_srgb,var(--border)_72%,transparent)]" />
                        </div>
                    )}
                </div>
            ) : null}
        </div>
    );

    if (onPress) {
        return (
            <button
                type="button"
                className={cn(rootClassName, 'w-full appearance-none')}
                onClick={onPress}
                disabled={disabled}
            >
                {content}
            </button>
        );
    }

    return <div className={rootClassName}>{content}</div>;
};
