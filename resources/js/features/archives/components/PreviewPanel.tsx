import { IconAlertCircle, IconArrowUpRight } from '@tabler/icons-react';

import type { ArchiveRecordRow } from '@/features/archives/types';
import { StatusPill } from '@/components/ui/StatusPill';
import { AppButton } from '@/components/ui/AppButton';
import { router } from '@inertiajs/react';
import { useTranslation } from '@/lib/i18n';

type PreviewPanelProps = {
    record: ArchiveRecordRow | null;
};

/** BNG-2026-0001 → BNG-0001 (drop the year segment; leave anything unexpected untouched). */
function archiveNumberWithoutYear(archiveNumber: string): string {
    const parts = archiveNumber.split('-');
    if (parts.length < 3) return archiveNumber;
    parts.splice(parts.length - 2, 1);
    return parts.join('-');
}

export function PreviewPanel({ record }: PreviewPanelProps) {
    const { t } = useTranslation();
    if (!record) {
        return (
            <div className="flex h-32 items-center justify-center">
                <p className="text-sm text-[var(--crm-text-muted)]">{t('preview.selectArchive')}</p>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-[var(--crm-border-soft)]">
                <div className="flex items-center gap-2 min-w-0">
                    <span aria-hidden className="size-2 shrink-0 rounded-full" style={{ backgroundColor: record.city?.color ?? 'var(--crm-gold)' }} />
                    <span className="text-xs text-[var(--crm-text-muted)] shrink-0">{archiveNumberWithoutYear(record.archiveNumber)}</span>
                    <h3 className="text-sm font-semibold text-[var(--crm-text)] truncate">{record.projectObject}</h3>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <AppButton
                        variant="bordered"
                        size="sm"
                        className="h-6 min-h-6 gap-1 px-2 text-[10px]"
                        onPress={() => router.visit(`/archives/${record.id}`)}
                    >
                        <IconArrowUpRight size={11} />
                        {t('preview.open')}
                    </AppButton>
                    {record.isOverdue ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-[var(--crm-danger)]">
                            <IconAlertCircle size={11} /> {t('preview.overdue')}
                        </span>
                    ) : null}
                    <StatusPill
                        status={record.status}
                        isOverdue={record.isOverdue}
                        label={t(`status.${record.isOverdue ? 'overdue' : record.status}`)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5 px-4 py-3 text-xs">
                <div className="flex items-center gap-3">
                    <span className="text-[var(--crm-text-muted)] w-28 shrink-0">{t('preview.dossier')}</span>
                    <span className="text-[var(--crm-text)] truncate">{record.archiveNumber || '-'}</span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-[var(--crm-text-muted)] w-28 shrink-0">{t('preview.client')}</span>
                    <span className="text-[var(--crm-text)] truncate">{record.clientName || '-'}</span>
                </div>
                {record.city ? (
                    <div className="flex items-center gap-3">
                        <span className="text-[var(--crm-text-muted)] w-28 shrink-0">{t('preview.city')}</span>
                        <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium"
                            style={{ backgroundColor: `${record.city.color}20`, color: record.city.color }}>
                            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: record.city.color }} />
                            {record.city.name}
                        </span>
                    </div>
                ) : null}
                <div className="flex items-center gap-3">
                    <span className="text-[var(--crm-text-muted)] w-28 shrink-0">{t('preview.location')}</span>
                    <span className="text-[var(--crm-text)] truncate">
                        {[record.room, record.box].filter(Boolean).join(' / ') || '-'}
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-[var(--crm-text-muted)] w-28 shrink-0">{t('preview.requester')}</span>
                    <span className="text-[var(--crm-text)] truncate">{record.requestedBy || '-'}</span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-[var(--crm-text-muted)] w-28 shrink-0">{t('preview.inOut')}</span>
                    <span className="text-[var(--crm-text)]">
                        {record.inDate || '-'} {record.outDate ? `/ ${record.outDate}` : ''}
                    </span>
                </div>
                {record.dueAt ? (
                    <div className="flex items-center gap-3">
                        <span className="text-[var(--crm-text-muted)] w-28 shrink-0">{t('preview.due')}</span>
                        <span className={record.isOverdue ? 'text-[var(--crm-danger)]' : 'text-[var(--crm-text)]'}>
                            {record.dueAt}
                        </span>
                    </div>
                ) : null}
            </div>

            {record.notes ? (
                <div className="mx-4 mb-2.5 rounded-md bg-[var(--crm-elevated)]/60 px-3 py-1.5 text-xs text-[var(--crm-text-muted)] leading-relaxed">
                    {record.notes}
                </div>
            ) : null}
        </div>
    );
}
