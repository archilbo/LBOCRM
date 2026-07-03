import { type PropsWithChildren } from 'react';
import { cn } from '@/lib/cn';

type AppCardProps = PropsWithChildren<{
    className?: string;
    variant?: 'elevated' | 'outlined' | 'flat';
    padding?: 'sm' | 'md' | 'lg';
}>;

export function AppCard({ children, className, variant = 'elevated', padding = 'md' }: AppCardProps) {
    return (
        <section
            className={cn(
                'rounded-[var(--radius-xl)]',
                variant === 'elevated' && 'border border-[var(--border)] bg-[var(--surface)] shadow-[0_1px_2px_rgb(15_23_42_/_0.05)]',
                variant === 'outlined' && 'border border-[var(--border)] bg-transparent',
                variant === 'flat' && 'bg-[var(--surface)]',
                padding === 'sm' && 'p-3',
                padding === 'md' && 'p-4',
                padding === 'lg' && 'p-5',
                className,
            )}
        >
            {children}
        </section>
    );
}
