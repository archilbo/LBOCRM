import { CheckCircle2, Circle, Clock3 } from 'lucide-react';
import { AppBadge } from '@/components/ui/AppBadge';
import { AppCard } from '@/components/ui/AppCard';
import { useTranslation } from '@/lib/i18n';

const steps = [
    { key: 'devisCreated', done: true },
    { key: 'invoiceGenerated', done: true },
    { key: 'paymentReceived', active: true },
    { key: 'remainingFollowUp', done: false },
    { key: 'closed', done: false },
];

export function FinanceTimeline() {
    const { t } = useTranslation();

    return (
        <AppCard className="min-w-0 p-4">
            <div className="mb-4">
                <h2 className="text-sm font-semibold">{t('financeWorkspace.timeline.title')}</h2>
                <p className="mt-1 text-sm text-[var(--text-muted)]">
                    {t('financeWorkspace.timeline.description')}
                </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                {steps.map((step) => (
                    <div key={step.key} className="rounded-2xl border bg-[var(--surface)] p-3">
                        <div className="mb-3 flex items-center justify-between gap-3">
                            <div className="flex size-8 items-center justify-center rounded-full bg-[var(--surface-2)]">
                                {step.done ? (
                                    <CheckCircle2 size={16} className="text-[var(--success)]" />
                                ) : step.active ? (
                                    <Clock3 size={16} className="text-[var(--warning)]" />
                                ) : (
                                    <Circle size={16} className="text-[var(--text-muted)]" />
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
                            {t(`financeWorkspace.timeline.${step.key}`)}
                        </p>
                    </div>
                ))}
            </div>
        </AppCard>
    );
}
