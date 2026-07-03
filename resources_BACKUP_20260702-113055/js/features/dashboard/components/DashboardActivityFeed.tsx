import { useState } from 'react';
import { ChevronDown, ChevronUp, Circle } from 'lucide-react';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppBadge } from '@/components/ui/AppBadge';
import { recentActivity } from '@/features/dashboard/data/mockDashboard';
import { useTranslation } from '@/lib/i18n';

export function DashboardActivityFeed() {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const visibleItems = isOpen ? recentActivity : recentActivity.slice(0, 2);

    return (
        <AppCard className="min-w-0 p-4">
            <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                    <h2 className="text-sm font-semibold">{t('dashboardCompact.recentActivity')}</h2>
                    <p className="mt-1 text-xs text-[var(--text-muted)]">
                        {t('dashboardHome.activityDescription')}
                    </p>
                </div>

                <AppButton
                    size="sm"
                    variant="ghost"
                    onPress={() => setIsOpen((current) => !current)}
                >
                    {isOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    {isOpen ? t('dashboardCompact.hideActivity') : t('dashboardCompact.showActivity')}
                </AppButton>
            </div>

            <div className="space-y-2">
                {visibleItems.map((item) => (
                    <div key={item.id} className="flex gap-3 rounded-xl border bg-[var(--surface)] p-3">
                        <Circle size={10} className="mt-1 shrink-0 fill-current text-[var(--accent)]" />

                        <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                                <p className="truncate text-sm font-semibold">{item.title}</p>
                                <AppBadge tone={item.tone}>{item.time}</AppBadge>
                            </div>

                            <p className="mt-0.5 line-clamp-1 text-xs text-[var(--text-muted)]">
                                {item.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </AppCard>
    );
}
