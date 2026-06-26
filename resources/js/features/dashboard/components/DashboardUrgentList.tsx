import { Link } from '@inertiajs/react';
import { AlertTriangle, ArrowUpRight } from 'lucide-react';
import { AppCard } from '@/components/ui/AppCard';
import { AppBadge } from '@/components/ui/AppBadge';
import { urgentItems } from '@/features/dashboard/data/mockDashboard';
import { useTranslation } from '@/lib/i18n';

export function DashboardUrgentList() {
    const { t } = useTranslation();

    return (
        <AppCard className="min-w-0 p-5">
            <div className="mb-4 flex items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-500">
                    <AlertTriangle size={17} />
                </div>

                <div className="min-w-0">
                    <h2 className="text-sm font-semibold">{t('dashboardHome.urgentTitle')}</h2>
                    <p className="mt-1 text-sm text-[var(--text-muted)]">
                        {t('dashboardHome.urgentDescription')}
                    </p>
                </div>
            </div>

            <div className="space-y-3">
                {urgentItems.map((item) => (
                    <Link key={item.id} href={item.href} className="block">
                        <div className="rounded-2xl border bg-[var(--surface)] p-4 transition hover:border-[var(--accent)] hover:bg-[color-mix(in_srgb,var(--accent)_5%,var(--surface))]">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <div className="mb-2 flex items-center gap-2">
                                        <AppBadge tone={item.tone}>Action</AppBadge>
                                    </div>
                                    <p className="text-sm font-semibold">{item.title}</p>
                                    <p className="mt-1 text-sm text-[var(--text-muted)]">
                                        {item.description}
                                    </p>
                                </div>

                                <ArrowUpRight size={15} className="shrink-0 text-[var(--text-muted)]" />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </AppCard>
    );
}
