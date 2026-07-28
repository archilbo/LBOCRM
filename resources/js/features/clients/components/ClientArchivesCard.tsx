import { router } from '@inertiajs/react';
import { Archive, ExternalLink } from 'lucide-react';
import { AppButton } from '@/components/ui/AppButton';
import type { ClientSelectedProjectWorkspace } from '@/features/clients/types';
import { useTranslation } from '@/lib/i18n';

type Props = {
    project: ClientSelectedProjectWorkspace | null;
};

export function ClientArchivesCard({ project }: Props) {
    const { t } = useTranslation();

    if (!project) return null;

    const archive = project.archiveRecord;

    return (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Archive size={16} className="text-[var(--accent)]" />
                    <span className="text-sm font-semibold text-[var(--foreground)]">{t('clients.archives.title')}</span>
                </div>
            </div>

            {archive ? (
                <div className="mt-2 space-y-1 text-xs text-[var(--text-muted)]">
                    <p><span className="font-medium text-[var(--foreground)]">{archive.archiveNumber}</span> &middot; {archive.status}</p>
                </div>
            ) : (
                <p className="mt-2 text-xs text-[var(--text-muted)]">{t('clients.archives.empty')}</p>
            )}

            <div className="mt-3 flex justify-end">
                {archive ? (
                    <AppButton isIconOnly compact variant="quiet" tooltip={t('clients.archives.view')} aria-label={t('clients.archives.view')} onPress={() => router.visit(`/archives/${archive.id}`)}>
                        <ExternalLink size={14} />
                    </AppButton>
                ) : (
                    <AppButton isIconOnly compact variant="quiet" tooltip={t('clients.archives.create')} aria-label={t('clients.archives.create')} onPress={() => router.visit('/archives')}>
                        <ExternalLink size={14} />
                    </AppButton>
                )}
            </div>
        </div>
    );
}
