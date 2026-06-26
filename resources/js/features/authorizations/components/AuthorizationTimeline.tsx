import { CheckCircle2, Circle, Clock3 } from 'lucide-react';
import { AppCard } from '@/components/ui/AppCard';
import { AppBadge } from '@/components/ui/AppBadge';
import { useTranslation } from '@/lib/i18n';

const steps = [
    {
        key: 'preparing',
        done: true,
    },
    {
        key: 'submitted',
        done: true,
    },
    {
        key: 'observations',
        active: true,
    },
    {
        key: 'corrections',
        done: false,
    },
    {
        key: 'approved',
        done: false,
    },
    {
        key: 'received',
        done: false,
    },
];

export function AuthorizationTimeline() {
    const { t } = useTranslation();

    return (
        <AppCard className="p-5">
            <div className="mb-4">
                <h2 className="text-sm font-semibold">{t('authorizationsWorkspace.timeline.title')}</h2>
                <p className="mt-1 text-sm text-[var(--text-muted)]">
                    {t('authorizationsWorkspace.timeline.description')}
                </p>
            </div>

            <div className="space-y-3">
                {steps.map((step) => (
                    <div key={step.key} className="flex items-center gap-3 rounded-2xl border bg-[var(--surface)] p-3">
                        <div className="flex size-8 items-center justify-center rounded-full bg-[var(--surface-2)]">
                            {step.done ? (
                                <CheckCircle2 size={16} className="text-[var(--success)]" />
                            ) : step.active ? (
                                <Clock3 size={16} className="text-[var(--warning)]" />
                            ) : (
                                <Circle size={16} className="text-[var(--text-muted)]" />
                            )}
                        </div>

                        <p className="flex-1 text-sm font-medium">
                            {t(`authorizationsWorkspace.timeline.${step.key}`)}
                        </p>

                        <AppBadge tone={step.done ? 'green' : step.active ? 'amber' : 'neutral'}>
                            {step.done ? t('common.completed') : step.active ? t('common.pending') : t('common.ready')}
                        </AppBadge>
                    </div>
                ))}
            </div>
        </AppCard>
    );
}
