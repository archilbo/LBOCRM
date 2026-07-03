import { PropsWithChildren } from 'react';
import { cn } from '@/lib/cn';

type AppBadgeProps = PropsWithChildren<{
    className?: string;
    tone?: 'neutral' | 'blue' | 'green' | 'amber' | 'red' | 'violet';
}>;

const tones: Record<NonNullable<AppBadgeProps['tone']>, string> = {
    neutral: 'border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-muted)]',
    blue: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300',
    green: 'border-green-200 bg-green-50 text-green-700 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-300',
    amber: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300',
    red: 'border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300',
    violet: 'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-300',
};

export function AppBadge({ children, className, tone = 'neutral' }: AppBadgeProps) {
    return (
        <span
            className={cn(
                'app-compact-badge inline-flex max-w-full items-center gap-1 rounded-full border font-medium',
                tones[tone],
                className,
            )}
        >
            {children}
        </span>
    );
}
