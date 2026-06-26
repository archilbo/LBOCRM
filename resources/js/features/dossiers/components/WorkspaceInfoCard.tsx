import { ReactNode } from 'react';
import { AppCard } from '@/components/ui/AppCard';

type WorkspaceInfoCardProps = {
    title: string;
    value: string;
    description?: string;
    icon?: ReactNode;
};

export function WorkspaceInfoCard({
    title,
    value,
    description,
    icon,
}: WorkspaceInfoCardProps) {
    return (
        <AppCard className="p-4">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-xs font-medium text-[var(--text-muted)]">{title}</p>
                    <p className="mt-1 truncate text-lg font-semibold">{value}</p>
                    {description ? (
                        <p className="mt-1 text-xs text-[var(--text-muted)]">{description}</p>
                    ) : null}
                </div>

                {icon ? (
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] text-[var(--accent)]">
                        {icon}
                    </div>
                ) : null}
            </div>
        </AppCard>
    );
}
