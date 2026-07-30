import { type ReactNode } from 'react';
import { cn } from '@/lib/cn';

type AppMetricGridProps = {
    children: ReactNode;
    className?: string;
    columns?: 2 | 3 | 4 | 5 | 6;
};

export function AppMetricGrid({ children, className, columns = 4 }: AppMetricGridProps) {
    const gridClasses: Record<number, string> = {
        2: 'grid-cols-1 sm:grid-cols-2',
        3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
        4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
        5: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5',
        6: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
    };

    return (
        <div className={cn('grid gap-3', gridClasses[columns], className)}>
            {children}
        </div>
    );
}
