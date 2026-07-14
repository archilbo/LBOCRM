import { router } from '@inertiajs/react';
import { Archive, ExternalLink } from 'lucide-react';
import { AppButton } from '@/components/ui/AppButton';
import type { ClientSelectedProjectWorkspace } from '@/features/clients/types';

type Props = {
    project: ClientSelectedProjectWorkspace | null;
};

export function ClientArchivesCard({ project }: Props) {
    if (!project) return null;

    const archive = project.archiveRecord;

    return (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Archive size={16} className="text-[var(--accent)]" />
                    <span className="text-sm font-semibold text-[var(--foreground)]">Archive</span>
                </div>
            </div>

            {archive ? (
                <div className="mt-2 space-y-1 text-xs text-[var(--text-muted)]">
                    <p><span className="font-medium text-[var(--foreground)]">{archive.archiveNumber}</span> &middot; {archive.status}</p>
                </div>
            ) : (
                <p className="mt-2 text-xs text-[var(--text-muted)]">No archive record yet.</p>
            )}

            <div className="mt-3 flex gap-2">
                {archive ? (
                    <AppButton variant="bordered" size="sm" className="h-7 text-xs" onPress={() => router.visit(`/archives/${archive.id}`)}>
                        <ExternalLink size={12} /> View in Archives
                    </AppButton>
                ) : (
                    <AppButton variant="bordered" size="sm" className="h-7 text-xs" onPress={() => router.visit('/archives')}>
                        <ExternalLink size={12} /> Create in Archives
                    </AppButton>
                )}
            </div>
        </div>
    );
}
