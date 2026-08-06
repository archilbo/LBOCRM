import { Card, Spinner } from '@heroui/react';
import { IconActivity, IconClock } from '@tabler/icons-react';

import { useActivity } from '../hooks/useProjectDesignQueries';
import { formatProjectDesignDate } from '../utils/projectDesignFormatters';

const ACTIVITY_LABELS: Record<string, string> = {
    'version.uploaded': 'uploaded a new version',
    'version.submitted': 'submitted for review',
    'review.approved': 'approved',
    'review.rejected': 'rejected',
    'review.changes_requested': 'requested changes',
    'review.started': 'started review',
    'remark.created': 'created a remark',
    'remark.resolved': 'resolved a remark',
    'file.created': 'created a new file',
    'folder.created': 'created a new folder',
};

function describeAction(action: string): string {
    return ACTIVITY_LABELS[action] ?? action.replace(/\./g, ' ').replace(/_/g, ' ');
}

export function ProjectDesignActivityFeed({ dossierId }: { dossierId: number }) {
    const { data, isLoading } = useActivity(dossierId);
    const items = data?.data ?? [];

    if (isLoading) {
        return <div className="flex items-center justify-center py-12"><Spinner size="sm" /></div>;
    }

    if (items.length === 0) {
        return (
            <Card variant="secondary" className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface-2)]/25">
                <Card.Content className="flex min-h-52 flex-col items-center justify-center p-6 text-center">
                    <span className="flex size-10 items-center justify-center rounded-xl bg-[var(--surface-2)] text-[var(--text-muted)]">
                        <IconActivity size={17} />
                    </span>
                    <p className="mt-2 text-[11px] font-medium text-[var(--foreground)]">No recent activity</p>
                    <p className="mt-1 max-w-72 text-[9px] leading-4 text-[var(--text-muted)]">
                        Design file changes, annotations and review actions will appear here.
                    </p>
                </Card.Content>
            </Card>
        );
    }

    return (
        <div className="space-y-1.5">
            {items.map((item) => (
                <Card key={item.id} variant="secondary" className="rounded-xl border border-[var(--border)] bg-[var(--surface)]">
                    <Card.Content className="flex flex-row items-start gap-3 px-3 py-2.5">
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-2)] text-[var(--text-muted)]">
                            <IconClock size={13} />
                        </span>
                        <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-medium leading-4 text-[var(--foreground)]">
                                <span className="font-semibold">{item.user?.name ?? 'System'}</span>
                                {' '}{describeAction(item.action)}
                                {item.description ? <span className="text-[var(--text-muted)]"> — {item.description}</span> : null}
                            </p>
                        </div>
                        <span className="shrink-0 text-[9px] text-[var(--text-subtle)]">{formatProjectDesignDate(item.createdAt)}</span>
                    </Card.Content>
                </Card>
            ))}
        </div>
    );
}
