import { type ReactNode } from 'react';
import { cn } from '@/lib/cn';

type AppMetricCardProps = {
    icon?: ReactNode;
    label: string;
    value: number | string;
    trend?: string;
    trendUp?: boolean;
    className?: string;
};

export function AppMetricCard({ icon, label, value, trend, trendUp, className }: AppMetricCardProps) {
    return (
        <div className={cn('app-surface p-4', className)}>
            <div className="flex items-start justify-between gap-3">
                {icon ? (
                    <div className="flex size-10 items-center justify-center rounded-2xl bg-[var(--surface-2)] text-[var(--text-muted)]">
                        {icon}
                    </div>
                ) : null}

                <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-[var(--text-muted)]">
                        {label}
                    </p>
                    <p className="mt-1 text-xl font-semibold text-[var(--text)]">
                        {value}
                    </p>
                </div>
            </div>

            {trend ? (
                <p className={cn('mt-2 text-xs font-medium', trendUp ? 'text-[var(--success)]' : 'text-[var(--danger)]')}>
                    {trend}
                </p>
            ) : null}
        </div>
    );
}
