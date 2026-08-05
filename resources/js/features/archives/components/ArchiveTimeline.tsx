import { IconCircleCheck, IconCircle, IconClockHour3 } from '@tabler/icons-react';

import { AppBadge } from '@/components/ui/AppBadge';
import { AppCard } from '@/components/ui/AppCard';
import { useTranslation } from '@/lib/i18n';

const steps = [
    { key: 'projectClosed', done: true },
    { key: 'documentsVerified', done: true },
    { key: 'archiveNumberAssigned', done: true },
    { key: 'fileStored', active: true },
    { key: 'retrievalTracked', done: false },
];

export function ArchiveTimeline() {
    const { t } = useTranslation();

    return (
        <AppCard className="min-w-0 p-4">
            <div className="mb-4">
                <h2 className="text-sm font-semibold">{t('archivesWorkspace.timeline.title')}</h2>
                <p className="mt-1 text-sm text-[var(--text-muted)]">
                    {t('archivesWorkspace.timeline.description')}
                </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                {steps.map((step) => (
                    <div key={step.key} className="rounded-2xl border bg-[var(--surface)] p-3">
                        <div className="mb-3 flex items-center justify-between gap-3">
                            <div className="flex size-8 items-center justify-center rounded-full bg-[var(--surface-2)]">
                                {step.done ? (
                                    <IconCircleCheck size={16} className="text-[var(--success)]" />
                                ) : step.active ? (
                                    <IconClockHour3 size={16} className="text-[var(--warning)]" />
                                ) : (
                                    <IconCircle size={16} className="text-[var(--text-muted)]" />
                                )}
                            </div>

                            <AppBadge tone={step.done ? 'green' : step.active ? 'amber' : 'neutral'}>
                                {step.done
                                    ? t('common.completed')
                                    : step.active
                                      ? t('common.pending')
                                      : t('common.ready')}
                            </AppBadge>
                        </div>

                        <p className="text-sm font-medium">
                            {t(`archivesWorkspace.timeline.${step.key}`)}
                        </p>
                    </div>
                ))}
            </div>
        </AppCard>
    );
}
