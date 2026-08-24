import { router } from '@inertiajs/react';
import { IconArchive, IconExternalLink } from '@tabler/icons-react';

import { AppButton } from '@/components/ui/AppButton';
import { StatusPill } from '@/components/ui/StatusPill';
import { archiveVisualStatus } from '@/config/statuses';
import { cn } from '@/lib/cn';
import { useTranslation } from '@/lib/i18n';

export type ArchiveSummaryCardRecord = {
    id: number;
    archiveNumber: string;
    status: string;
    isOverdue?: boolean;
    city?: {
        id: number;
        name: string;
        color: string;
    } | null;
};

type Props = {
    archive: ArchiveSummaryCardRecord | null;
    canView: boolean;
    title: string;
    emptyLabel: string;
    embedded?: boolean;
    className?: string;
};

export function ArchiveSummaryCard({ archive, canView, title, emptyLabel, embedded = false, className }: Props) {
    const { t } = useTranslation();
    const visualStatus = archive ? archiveVisualStatus(archive.status, archive.isOverdue ?? false) : null;
    const statusLabel = visualStatus ? t(`archives.status.${visualStatus.key}`) : '';

    return (
        <section className={cn(
            'min-w-0 bg-[var(--surface)] p-3.5',
            embedded ? 'border-t border-[var(--border)]' : 'rounded-xl border border-[var(--border)] shadow-sm',
            className,
        )}>
            <div className="flex min-w-0 items-center gap-2.5">
                <div className="flex min-w-0 items-center gap-2">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] text-[var(--accent)]">
                        <IconArchive size={15} stroke={1.9} />
                    </span>
                    <p className="truncate text-xs font-semibold text-[var(--foreground)]">{title}</p>
                </div>
                {archive ? (
                    <>
                    <span
                        className="inline-flex min-w-0 max-w-full items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-2.5 py-1 text-[10px] font-semibold text-[var(--foreground)]"
                        title={archive.city ? `${archive.city.name} · ${archive.archiveNumber}` : archive.archiveNumber}
                    >
                        <span
                            aria-hidden="true"
                            className="size-2 shrink-0 rounded-full"
                            style={{ backgroundColor: archive.city?.color ?? 'var(--text-muted)' }}
                        />
                        <span className="truncate">{archive.archiveNumber}</span>
                    </span>
                    {visualStatus ? <StatusPill status={visualStatus.key} isOverdue={archive.isOverdue} label={statusLabel} className="shrink-0 text-[10px]" /> : null}
                    {canView ? (
                        <AppButton
                            isIconOnly
                            compact
                            size="sm"
                            variant="quiet"
                            tooltip={t('archives.actions.view')}
                            aria-label={t('archives.actions.view')}
                            onPress={() => router.visit(`/archives/${archive.id}`)}
                            className="shrink-0"
                        >
                            <IconExternalLink size={14} />
                        </AppButton>
                    ) : null}
                    </>
                ) : <p className="min-w-0 truncate text-[11px] text-[var(--text-muted)]">{emptyLabel}</p>}
            </div>
        </section>
    );
}
