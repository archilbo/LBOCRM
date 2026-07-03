import { type ReactNode } from 'react';
import { cn } from '@/lib/cn';

type AppPageProps = {
    children: ReactNode;
    className?: string;
};

export function AppPage({ children, className }: AppPageProps) {
    return (
        <div className={cn('flex w-full flex-col gap-4 px-3 py-3 sm:px-4 lg:px-5', className)}>
            {children}
        </div>
    );
}
