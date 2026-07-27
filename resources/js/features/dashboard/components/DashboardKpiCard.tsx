import { Link } from '@inertiajs/react';
import { ArrowUpRight } from 'lucide-react';
import { AppBadge } from '@/components/ui/AppBadge';
import { AppKpiCard } from '@/components/ui/AppKpiCard';
import { DashboardKpi } from '@/features/dashboard/data/mockDashboard';
import { useTranslation } from '@/lib/i18n';

type DashboardKpiCardProps = {
    item: DashboardKpi;
};

export function DashboardKpiCard({ item }: DashboardKpiCardProps) {
    const { t } = useTranslation();

    return (
        <Link href={item.href} className="block">
            <AppKpiCard
                label={t(item.labelKey)}
                value={item.value}
                detail={item.description}
                trailing={<><AppBadge tone={item.tone}>{t('dashboardHome.health.active')}</AppBadge><ArrowUpRight size={16} className="text-[var(--text-muted)]" /></>}
            />
        </Link>
    );
}
