import { Link } from '@inertiajs/react';
import { ArrowUpRight } from 'lucide-react';
import { AppCard } from '@/components/ui/AppCard';
import { AppBadge } from '@/components/ui/AppBadge';
import { moduleOverview } from '@/features/dashboard/data/mockDashboard';
import { useTranslation } from '@/lib/i18n';

export function DashboardModulesOverview() {
    const { t } = useTranslation();

    return (
        <AppCard className="min-w-0 p-5">
            <div className="mb-5">
                <h2 className="text-sm font-semibold">{t('dashboardHome.modulesTitle')}</h2>
                <p className="mt-1 text-sm text-[var(--text-muted)]">
                    {t('dashboardHome.modulesDescription')}
                </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {moduleOverview.map((module) => (
                    <Link key={module.key} href={module.href} className="block">
                        <div className="h-full rounded-2xl border bg-[var(--surface)] p-4 transition hover:border-[var(--accent)] hover:bg-[color-mix(in_srgb,var(--accent)_5%,var(--surface))]">
                            <div className="mb-3 flex items-center justify-between gap-3">
                                <AppBadge tone={module.tone}>{t(module.statusKey)}</AppBadge>
                                <ArrowUpRight size={15} className="text-[var(--text-muted)]" />
                            </div>

                            <p className="text-sm font-semibold">{t(module.titleKey)}</p>
                            <p className="mt-1 line-clamp-2 text-sm text-[var(--text-muted)]">
                                {module.description}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
        </AppCard>
    );
}
