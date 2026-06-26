import { PropsWithChildren } from 'react';
import { cn } from '@/lib/cn';

type AppCardProps = PropsWithChildren<{
    className?: string;
}>;

export function AppCard({ children, className }: AppCardProps) {
    return (
        <section className={cn('app-surface', className)}>
            {children}
        </section>
    );
}
