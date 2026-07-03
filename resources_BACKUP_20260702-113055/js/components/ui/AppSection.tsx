import { type ReactNode } from 'react';
import { cn } from '@/lib/cn';

type AppSectionProps = {
    title?: string;
    description?: string;
    actions?: ReactNode;
    children: ReactNode;
    className?: string;
};

export function AppSection({
    title, description, actions, children, className }: AppSectionProps) {
        return (
            <section className={cn('app-surface p-4', className)}>
                {(title || actions) ? (
                <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    {title ? (
                        <div className="min-w-0 flex-1">
                            <h2 className="text-sm font-semibold text-[var(--text)]">
                                {title}
                            </h2>
                            {description ? (
                                <p className="mt-1 text-xs text-[var(--text-muted)]">
                                    {description}
                                </p>
                            ) : null}
                        </div>
                    ) : null}

                    {actions ? (
                        <div className="flex shrink-0 items-center gap-2">
                            {actions}
                        </div>
                    ) : null}
                </div>
            ) : null}

            {children}
        </section>
    );
}
