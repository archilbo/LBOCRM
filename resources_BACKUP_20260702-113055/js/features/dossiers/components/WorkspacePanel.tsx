import { ReactNode } from 'react';
import { AppCard } from '@/components/ui/AppCard';

type WorkspacePanelProps = {
    title: string;
    description?: string;
    action?: ReactNode;
    children: ReactNode;
};

export function WorkspacePanel({
    title,
    description,
    action,
    children,
}: WorkspacePanelProps) {
    return (
        <AppCard className="p-5">
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                    <h2 className="text-sm font-semibold">{title}</h2>
                    {description ? (
                        <p className="mt-1 max-w-2xl text-sm text-[var(--text-muted)]">
                            {description}
                        </p>
                    ) : null}
                </div>

                {action ? <div className="shrink-0">{action}</div> : null}
            </div>

            {children}
        </AppCard>
    );
}
