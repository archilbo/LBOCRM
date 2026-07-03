import { Spinner } from '@heroui/react';
import { cn } from '@/lib/cn';

type LoadingStateProps = {
    label?: string;
    className?: string;
    fullPage?: boolean;
    size?: 'sm' | 'md' | 'lg';
};

export function LoadingState({ label, className, fullPage, size = 'lg' }: LoadingStateProps) {
    return (
        <div
            className={cn(
                'flex flex-col items-center justify-center gap-3',
                fullPage ? 'fixed inset-0 z-50 bg-[var(--background)]' : 'py-12',
                className,
            )}
        >
            <Spinner color="current" size={size} />
            {label ? (
                <p className="text-sm text-[var(--text-muted)]">{label}</p>
            ) : null}
        </div>
    );
}
