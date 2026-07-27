import { Activity, Clock, Loader2 } from 'lucide-react';
import { AppEmptyState } from '@/components/ui/AppEmptyState';
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
        return <div className="flex items-center justify-center py-12"><Loader2 size={16} className="animate-spin text-[var(--text-muted)]" /></div>;
    }

    if (items.length === 0) {
        return <AppEmptyState icon={<Activity size={15} />} title="No recent activity" description="Design file changes, annotations, and review actions will appear here." />;
    }

    return (
        <div className="space-y-2">
            {items.map((item) => (
                <div key={item.id} className="flex items-start gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5">
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-[var(--surface-2)]">
                        <Clock size={13} className="text-[var(--text-muted)]" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-[12px] font-medium text-[var(--foreground)]">
                            <span className="font-semibold">{item.user?.name ?? 'System'}</span>
                            {' '}{describeAction(item.action)}
                            {item.description && <span> — {item.description}</span>}
                        </p>
                    </div>
                    <div className="shrink-0 text-right">
                        <p className="text-[10px] text-[var(--text-subtle)]">{formatProjectDesignDate(item.createdAt)}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
