import { IconCircleCheck, IconCircle, IconClockHour3 } from '@tabler/icons-react';

import { AppCard } from '@/components/ui/AppCard';
import { AppBadge } from '@/components/ui/AppBadge';
import { useTranslation } from '@/lib/i18n';

const steps = [
    {
        key: 'calculation',
        done: true,
    },
    {
        key: 'docxGenerated',
        done: true,
    },
    {
        key: 'pdfGenerated',
        done: false,
    },
    {
        key: 'givenToClient',
        done: false,
    },
    {
        key: 'ownerSigned',
        done: false,
    },
    {
        key: 'submitted',
        done: false,
    },
    {
        key: 'returned',
        done: false,
    },
];

export function ContractWorkflow() {
    const { t } = useTranslation();

    return (
        <AppCard className="p-5">
            <div className="mb-4">
                <h2 className="text-sm font-semibold">{t('contractsWorkspace.workflow.title')}</h2>
                <p className="mt-1 text-sm text-[var(--text-muted)]">
                    {t('contractsWorkspace.workflow.description')}
                </p>
            </div>

            <div className="space-y-3">
                {steps.map((step, index) => {
                    const active = index === 2;

                    return (
                        <div key={step.key} className="flex items-center gap-3 rounded-2xl border bg-[var(--surface)] p-3">
                            <div className="flex size-8 items-center justify-center rounded-full bg-[var(--surface-2)]">
                                {step.done ? (
                                    <IconCircleCheck size={16} className="text-[var(--success)]" />
                                ) : active ? (
                                    <IconClockHour3 size={16} className="text-[var(--warning)]" />
                                ) : (
                                    <IconCircle size={16} className="text-[var(--text-muted)]" />
                                )}
                            </div>

                            <p className="flex-1 text-sm font-medium">
                                {t(`contractsWorkspace.workflow.${step.key}`)}
                            </p>

                            <AppBadge tone={step.done ? 'green' : active ? 'amber' : 'neutral'}>
                                {step.done ? t('common.completed') : active ? t('common.pending') : t('common.ready')}
                            </AppBadge>
                        </div>
                    );
                })}
            </div>
        </AppCard>
    );
}
