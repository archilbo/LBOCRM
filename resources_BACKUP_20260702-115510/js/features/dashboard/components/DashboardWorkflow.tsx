import { Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import { AppCard } from '@/components/ui/AppCard';
import { AppBadge } from '@/components/ui/AppBadge';
import { workflowSteps } from '@/features/dashboard/data/mockDashboard';
import { useTranslation } from '@/lib/i18n';

export function DashboardWorkflow() {
    const { t } = useTranslation();

    return (
        <AppCard className="min-w-0 p-5">
            <div className="mb-5">
                <h2 className="text-sm font-semibold">{t('dashboardHome.workflowTitle')}</h2>
                <p className="mt-1 text-sm text-[var(--text-muted)]">
                    {t('dashboardHome.workflowDescription')}
                </p>
            </div>

            <div className="app-scrollbar min-w-0 overflow-x-auto pb-1">
                <div className="flex min-w-[920px] items-center gap-3">
                    {workflowSteps.map((step, index) => (
                        <div key={step.key} className="flex flex-1 items-center gap-3">
                            <Link href={step.href} className="min-w-0 flex-1">
                                <div className="rounded-2xl border bg-[var(--surface-2)] p-4 transition hover:border-[var(--accent)] hover:bg-[color-mix(in_srgb,var(--accent)_6%,var(--surface))]">
                                    <div className="mb-3 flex items-center justify-between gap-2">
                                        <AppBadge tone={step.tone}>{step.value}</AppBadge>
                                        <span className="text-xs text-[var(--text-muted)]">
                                            0{index + 1}
                                        </span>
                                    </div>

                                    <p className="truncate text-sm font-semibold">{t(step.labelKey)}</p>
                                </div>
                            </Link>

                            {index < workflowSteps.length - 1 ? (
                                <ArrowRight size={16} className="shrink-0 text-[var(--text-muted)]" />
                            ) : null}
                        </div>
                    ))}
                </div>
            </div>
        </AppCard>
    );
}
