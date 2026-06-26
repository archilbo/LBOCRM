import { PropsWithChildren } from 'react';
import { cn } from '@/lib/cn';

type AppTableActionsProps = PropsWithChildren<{
    className?: string;
}>;

export function AppTableActions({ children, className }: AppTableActionsProps) {
    return (
        <div className={cn('flex items-center justify-end gap-1.5', className)}>
            {children}
        </div>
    );
}
