import { ArchiveSummaryCard } from '@/features/archives/components/ArchiveSummaryCard';
import type { ClientSelectedProjectWorkspace } from '@/features/clients/types';
import { usePermissions } from '@/hooks/usePermissions';
import { useTranslation } from '@/lib/i18n';

type Props = {
    project: ClientSelectedProjectWorkspace | null;
};

export function ClientArchivesCard({ project }: Props) {
    const { t } = useTranslation();
    const { can } = usePermissions();

    if (!project) return null;

    return (
        <ArchiveSummaryCard
            archive={project.archiveRecord}
            canView={can('archive.view')}
            title={t('clients.archives.title')}
            emptyLabel={t('clients.archives.empty')}
        />
    );
}
