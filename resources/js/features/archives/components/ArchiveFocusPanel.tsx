import { Archive, CheckCircle2, LogOut, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { AppBadge } from '@/components/ui/AppBadge';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppStatusBadge } from '@/components/ui/AppStatusBadge';
import {
    ArchiveRecordRow,
    ArchiveRecordStatus,
} from '@/features/archives/data/mockArchives';
import { useTranslation } from '@/lib/i18n';

type ArchiveFocusPanelProps = {
    record: ArchiveRecordRow | null;
};

type BadgeTone = 'neutral' | 'blue' | 'green' | 'amber' | 'red' | 'violet';

function getStatusTone(status: ArchiveRecordStatus): BadgeTone {
    switch (status) {
        case 'readyToArchive':
            return 'amber';
        case 'stored':
        case 'returned':
            return 'green';
        case 'out':
            return 'blue';
        case 'pendingReturn':
            return 'red';
        case 'lost':
            return 'red';
        default:
            return 'neutral';
    }
}

function getStatusIcon(status: ArchiveRecordStatus): 'dot' | 'check' | 'clock' | 'warning' | 'archive' {
    switch (status) {
        case 'stored':
        case 'returned':
            return 'check';
        case 'out':
        case 'readyToArchive':
            return 'clock';
        case 'pendingReturn':
        case 'lost':
            return 'warning';
        default:
            return 'archive';
    }
}

function DetailItem({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-xl border bg-[var(--surface-2)] p-3">
            <p className="text-[11px] font-medium text-[var(--text-muted)]">{label}</p>
            <p className="mt-1 truncate text-sm font-semibold">{value}</p>
        </div>
    );
}

export function ArchiveFocusPanel({ record }: ArchiveFocusPanelProps) {
    const { t } = useTranslation();

    return (
        <AppCard className="min-w-0 p-4">
            <div className="mb-4">
                <h2 className="text-sm font-semibold">{t('archivesWorkspace.focus.title')}</h2>
                <p className="mt-1 text-sm text-[var(--text-muted)]">
                    {t('archivesWorkspace.focus.description')}
                </p>
            </div>

            {record ? (
                <div className="space-y-4">
                    <div className="flex items-start gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] text-[var(--accent)]">
                            <Archive size={18} />
                        </div>

                        <div className="min-w-0">
                            <p className="text-sm font-semibold">{record.archiveNumber}</p>
                            <p className="mt-1 truncate text-xs text-[var(--text-muted)]">
                                {record.dossierNumber} Â· {record.client}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <AppStatusBadge
                            label={t(`archivesWorkspace.status.${record.status}`)}
                            tone={getStatusTone(record.status)}
                            icon={getStatusIcon(record.status)}
                        />
                        <AppBadge tone="blue">{record.box}</AppBadge>
                    </div>

                    <div className="grid gap-2">
                        <DetailItem label={t('archivesWorkspace.focus.project')} value={record.projectObject} />
                        <DetailItem label={t('archivesWorkspace.focus.client')} value={record.client} />
                        <DetailItem label={t('archivesWorkspace.focus.inDate')} value={record.inDate} />
                        <DetailItem label={t('archivesWorkspace.focus.outDate')} value={record.outDate} />
                        <DetailItem label={t('archivesWorkspace.focus.returnedAt')} value={record.returnedAt} />
                        <DetailItem label={t('archivesWorkspace.focus.requestedBy')} value={record.requestedBy} />
                    </div>

                    <div className="rounded-2xl border bg-[color-mix(in_srgb,var(--accent)_8%,var(--surface))] p-4">
                        <p className="text-xs font-medium text-[var(--accent)]">
                            {t('archivesWorkspace.focus.nextAction')}
                        </p>
                        <p className="mt-1 text-sm text-[var(--text-muted)]">
                            {record.nextAction}
                        </p>
                    </div>

                    <div className="grid gap-2">
                        <AppButton
                            variant="primary"
                            onPress={() => toast.success(t('archivesWorkspace.toast.registerIn'))}
                        >
                            <CheckCircle2 size={16} />
                            {t('archivesWorkspace.registerIn')}
                        </AppButton>

                        <AppButton
                            variant="secondary"
                            onPress={() => toast.info(t('archivesWorkspace.toast.registerOut'))}
                        >
                            <LogOut size={16} />
                            {t('archivesWorkspace.registerOut')}
                        </AppButton>

                        <AppButton
                            variant="ghost"
                            onPress={() => toast.success(t('archivesWorkspace.toast.returnArchive'))}
                        >
                            <RotateCcw size={16} />
                            {t('archivesWorkspace.returnArchive')}
                        </AppButton>
                    </div>
                </div>
            ) : (
                <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed bg-[var(--surface-2)]">
                    <div className="px-6 text-center">
                        <Archive className="mx-auto text-[var(--text-muted)]" size={34} />
                        <p className="mt-3 text-sm font-semibold">{t('archivesWorkspace.focus.noRecord')}</p>
                        <p className="mt-1 max-w-sm text-sm text-[var(--text-muted)]">
                            {t('archivesWorkspace.focus.selectRecord')}
                        </p>
                    </div>
                </div>
            )}
        </AppCard>
    );
}
