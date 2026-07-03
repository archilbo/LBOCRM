import { Link } from '@inertiajs/react';
import { ArrowUpRight } from 'lucide-react';
import { AppCard } from '@/components/ui/AppCard';
import { AppBadge } from '@/components/ui/AppBadge';
import { DashboardKpi } from '@/features/dashboard/data/mockDashboard';
import { useTranslation } from '@/lib/i18n';

type DashboardKpiCardProps = {
    item: DashboardKpi;
};

export function DashboardKpiCard({ item }: DashboardKpiCardProps) {
    const { t } = useTranslation();

    return (
        <Link href={item.href} className="block">
            <AppCard className="group p-4 transition hover:border-[var(--accent)] hover:bg-[color-mix(in_srgb,var(--accent)_5%,var(--surface))]">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <p className="text-sm text-[var(--text-muted)]">{t(item.labelKey)}</p>
                        <p className="mt-2 truncate text-2xl font-semibold">{item.value}</p>
                        <p className="mt-1 truncate text-xs text-[var(--text-muted)]">
                            {item.description}
                        </p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                        <AppBadge tone={item.tone}>{t('dashboardHome.health.active')}</AppBadge>
                        <ArrowUpRight
                            size={16}
                            className="text-[var(--text-muted)] transition group-hover:text-[var(--accent)]"
                        />
                    </div>
                </div>
            </AppCard>
        </Link>
    );
}
