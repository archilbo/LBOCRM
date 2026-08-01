import { type ReactNode } from 'react';
import { cn } from '@/lib/cn';

type AppPageHeaderProps = {
    eyebrow?: string;
    title: string;
    subtitle?: string;
    actions?: ReactNode;
    compact?: boolean;
    className?: string;
};

export function AppPageHeader({
    eyebrow,
    title,
    subtitle,
    actions,
    compact = false,
    className,
}: AppPageHeaderProps) {
    return (
        <div className={cn('flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between', className)}>
            <div className="min-w-0 flex-1">
                {eyebrow ? (
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
                        {eyebrow}
                    </p>
                ) : null}

                <h1 className={cn('truncate font-bold tracking-[-0.02em] text-[var(--text)]', compact ? 'text-lg' : 'text-xl sm:text-2xl')}>
                    {title}
                </h1>

                {subtitle ? (
                    <p className="mt-1 max-w-3xl text-sm leading-6 text-[var(--text-muted)]">
                        {subtitle}
                    </p>
                ) : null}
            </div>

            {actions ? (
                <div className="flex shrink-0 flex-wrap items-center justify-start gap-2 sm:justify-end">
                    {actions}
                </div>
            ) : null}
        </div>
    );
}
