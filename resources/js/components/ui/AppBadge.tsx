import { type PropsWithChildren } from 'react';
import { cn } from '@/lib/cn';

type AppBadgeProps = PropsWithChildren<{
    className?: string;
    variant?: 'solid' | 'outlined' | 'subtle';
    tone?: 'neutral' | 'blue' | 'green' | 'amber' | 'red' | 'violet';
}>;

const toneStyles: Record<string, Record<string, string>> = {
    solid: {
        neutral: 'bg-[var(--text-muted)] text-white',
        blue: 'bg-blue-500 text-white',
        green: 'bg-green-500 text-white',
        amber: 'bg-amber-500 text-white',
        red: 'bg-red-500 text-white',
        violet: 'bg-violet-500 text-white',
    },
    outlined: {
        neutral: 'border-[var(--border)] text-[var(--text-muted)]',
        blue: 'border-blue-500/40 text-blue-600 dark:text-blue-400',
        green: 'border-green-500/40 text-green-600 dark:text-green-400',
        amber: 'border-amber-500/40 text-amber-600 dark:text-amber-400',
        red: 'border-red-500/40 text-red-600 dark:text-red-400',
        violet: 'border-violet-500/40 text-violet-600 dark:text-violet-400',
    },
    subtle: {
        neutral: 'bg-[var(--surface-2)] text-[var(--text-muted)]',
        blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
        green: 'bg-green-500/10 text-green-600 dark:text-green-400',
        amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
        red: 'bg-red-500/10 text-red-600 dark:text-red-400',
        violet: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
    },
};

export function AppBadge({ children, className, variant = 'subtle', tone = 'neutral' }: AppBadgeProps) {
    return (
        <span
            className={cn(
                'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium leading-tight',
                variant !== 'solid' && 'border',
                toneStyles[variant]?.[tone],
                className,
            )}
        >
            {children}
        </span>
    );
}
