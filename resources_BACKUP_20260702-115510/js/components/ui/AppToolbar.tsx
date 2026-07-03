import { type ReactNode } from 'react';
import { cn } from '@/lib/cn';

type AppToolbarProps = {
    children: ReactNode;
    className?: string;
};

export function AppToolbar({ children, className }: AppToolbarProps) {
    return (
        <div className={cn('flex flex-wrap items-center justify-between gap-2', className)}>
            {children}
        </div>
    );
}
