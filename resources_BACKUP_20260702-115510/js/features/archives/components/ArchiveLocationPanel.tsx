import { Archive, Box, Folder, MapPin } from 'lucide-react';
import { AppCard } from '@/components/ui/AppCard';
import { ArchiveRecordRow } from '@/features/archives/data/mockArchives';
import { useTranslation } from '@/lib/i18n';

type ArchiveLocationPanelProps = {
    record: ArchiveRecordRow | null;
};

function LocationItem({
    label,
    value,
    icon,
}: {
    label: string;
    value: string;
    icon: React.ReactNode;
}) {
    return (
        <div className="flex items-center gap-3 rounded-xl border bg-[var(--surface)] p-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-2)] text-[var(--text-muted)]">
                {icon}
            </div>

            <div className="min-w-0">
                <p className="text-[11px] font-medium text-[var(--text-muted)]">{label}</p>
                <p className="mt-0.5 truncate text-sm font-semibold">{value}</p>
            </div>
        </div>
    );
}

export function ArchiveLocationPanel({ record }: ArchiveLocationPanelProps) {
    const { t } = useTranslation();

    return (
        <AppCard className="min-w-0 p-4">
            <div className="mb-4">
                <h2 className="text-sm font-semibold">{t('archivesWorkspace.location.title')}</h2>
                <p className="mt-1 text-sm text-[var(--text-muted)]">
                    {t('archivesWorkspace.location.description')}
                </p>
            </div>

            {record ? (
                <div className="grid gap-2">
                    <LocationItem label={t('archivesWorkspace.location.room')} value={record.room} icon={<MapPin size={15} />} />
                    <LocationItem label={t('archivesWorkspace.location.shelf')} value={record.shelf} icon={<Archive size={15} />} />
                    <LocationItem label={t('archivesWorkspace.location.box')} value={record.box} icon={<Box size={15} />} />
                    <LocationItem label={t('archivesWorkspace.location.folder')} value={record.folder} icon={<Folder size={15} />} />
                </div>
            ) : null}
        </AppCard>
    );
}
