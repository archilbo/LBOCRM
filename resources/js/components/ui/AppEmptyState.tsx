import { type ReactNode } from 'react';
import { IconInbox } from '@tabler/icons-react';

import { cn } from '@/lib/cn';

type AppEmptyStateProps = {
    title: string;
    description?: string;
    icon?: ReactNode;
    action?: ReactNode;
    className?: string;
};

export function AppEmptyState({ title, description, icon, action, className }: AppEmptyStateProps) {
    return (
        <div
            className={cn(
                'flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] px-6 py-12 text-center',
                className,
            )}
        >
            <div className="flex size-11 items-center justify-center rounded-2xl bg-[var(--surface-2)] text-[var(--text-muted)]">
                {icon ?? <IconInbox size={20} />}
            </div>

            <h3 className="mt-4 text-sm font-semibold text-[var(--foreground)]">{title}</h3>

            {description ? (
                <p className="mt-1 max-w-md text-sm text-[var(--text-muted)]">{description}</p>
            ) : null}

            {action ? <div className="mt-5">{action}</div> : null}
        </div>
    );
}
