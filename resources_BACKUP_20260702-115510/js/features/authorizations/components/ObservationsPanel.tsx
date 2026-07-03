import { AlertTriangle, CheckCircle2, Circle } from 'lucide-react';
import { toast } from 'sonner';
import { AppButton } from '@/components/ui/AppButton';
import { AppBadge } from '@/components/ui/AppBadge';
import { AppCard } from '@/components/ui/AppCard';
import { AuthorizationObservation } from '@/features/authorizations/data/mockAuthorizations';
import { useTranslation } from '@/lib/i18n';

type ObservationsPanelProps = {
    observations: AuthorizationObservation[];
};

export function ObservationsPanel({ observations }: ObservationsPanelProps) {
    const { t } = useTranslation();

    return (
        <AppCard className="p-5">
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                    <h2 className="text-sm font-semibold">{t('authorizationsWorkspace.observationsPanel.title')}</h2>
                    <p className="mt-1 text-sm text-[var(--text-muted)]">
                        {t('authorizationsWorkspace.observationsPanel.description')}
                    </p>
                </div>

                <AppButton
                    size="sm"
                    variant="primary"
                    onPress={() => toast.info(t('authorizationsWorkspace.toast.addObservation'))}
                >
                    <AlertTriangle size={15} />
                    {t('authorizationsWorkspace.addObservation')}
                </AppButton>
            </div>

            <div className="space-y-3">
                {observations.length > 0 ? (
                    observations.map((observation) => (
                        <div key={observation.id} className="rounded-2xl border bg-[var(--surface)] p-4">
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5">
                                    {observation.status === 'resolved' ? (
                                        <CheckCircle2 size={17} className="text-[var(--success)]" />
                                    ) : observation.status === 'blocked' ? (
                                        <AlertTriangle size={17} className="text-[var(--danger)]" />
                                    ) : (
                                        <Circle size={17} className="text-[var(--warning)]" />
                                    )}
                                </div>

                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="text-sm font-semibold">{observation.title}</p>
                                        <AppBadge tone={observation.status === 'resolved' ? 'green' : observation.status === 'blocked' ? 'red' : 'amber'}>
                                            {t(`authorizationsWorkspace.observationsPanel.${observation.status}`)}
                                        </AppBadge>
                                    </div>

                                    <p className="mt-1 text-sm text-[var(--text-muted)]">
                                        {observation.description}
                                    </p>

                                    <p className="mt-2 text-xs text-[var(--text-subtle)]">
                                        {t('authorizationsWorkspace.observationsPanel.dueDate')}: {observation.dueDate}
                                    </p>
                                </div>

                                <AppButton
                                    size="sm"
                                    variant="secondary"
                                    onPress={() => toast.success(t('authorizationsWorkspace.toast.resolveObservation'))}
                                >
                                    {t('authorizationsWorkspace.observationsPanel.resolve')}
                                </AppButton>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="rounded-2xl border border-dashed bg-[var(--surface)] p-8 text-center">
                        <CheckCircle2 className="mx-auto text-[var(--success)]" size={30} />
                        <p className="mt-3 text-sm font-semibold">{t('common.completed')}</p>
                        <p className="mt-1 text-sm text-[var(--text-muted)]">
                            0 {t('authorizationsWorkspace.table.observations').toLowerCase()}
                        </p>
                    </div>
                )}
            </div>
        </AppCard>
    );
}
