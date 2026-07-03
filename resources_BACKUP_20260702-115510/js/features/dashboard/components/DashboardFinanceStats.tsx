import { BadgeDollarSign } from 'lucide-react';
import { AppCard } from '@/components/ui/AppCard';
import { financeRows, formatMoney, getFinanceMetrics } from '@/features/finance/data/mockFinance';
import { useTranslation } from '@/lib/i18n';

function MiniBar({ value }: { value: number }) {
    return (
        <div className="h-2 overflow-hidden rounded-full bg-[var(--surface-2)]">
            <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${value}%` }} />
        </div>
    );
}

export function DashboardFinanceStats() {
    const { t } = useTranslation();
    const metrics = getFinanceMetrics();
    const collectionRate = metrics.totalTtc > 0 ? Math.round((metrics.paid / metrics.totalTtc) * 100) : 0;

    return (
        <AppCard className="min-w-0 p-4">
            <div className="mb-4 flex items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] text-[var(--accent)]">
                    <BadgeDollarSign size={17} />
                </div>
                <div>
                    <h2 className="text-sm font-semibold">{t('dashboardCompact.financeTitle')}</h2>
                    <p className="mt-1 text-xs text-[var(--text-muted)]">
                        {t('dashboardCompact.financeDescription')}
                    </p>
                </div>
            </div>

            <div className="grid gap-3 md:grid-cols-4">
                <div className="rounded-xl border bg-[var(--surface)] p-3">
                    <p className="text-[11px] text-[var(--text-muted)]">{t('dashboardCompact.totalTtc')}</p>
                    <p className="mt-1 truncate text-sm font-semibold">{formatMoney(metrics.totalTtc)}</p>
                </div>
                <div className="rounded-xl border bg-[var(--surface)] p-3">
                    <p className="text-[11px] text-[var(--text-muted)]">{t('dashboardCompact.paid')}</p>
                    <p className="mt-1 truncate text-sm font-semibold">{formatMoney(metrics.paid)}</p>
                </div>
                <div className="rounded-xl border bg-[var(--surface)] p-3">
                    <p className="text-[11px] text-[var(--text-muted)]">{t('dashboardCompact.remaining')}</p>
                    <p className="mt-1 truncate text-sm font-semibold">{formatMoney(metrics.remaining)}</p>
                </div>
                <div className="rounded-xl border bg-[var(--surface)] p-3">
                    <p className="text-[11px] text-[var(--text-muted)]">{t('dashboardCompact.collectionRate')}</p>
                    <p className="mt-1 truncate text-sm font-semibold">{collectionRate}%</p>
                </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
                {financeRows.slice(0, 4).map((row) => {
                    const value = row.totalTtc > 0 ? Math.round((row.paid / row.totalTtc) * 100) : 0;

                    return (
                        <div key={row.id} className="rounded-xl border bg-[var(--surface)] p-3">
                            <div className="mb-2 flex items-center justify-between gap-3">
                                <p className="truncate text-xs font-semibold">{row.recordNumber}</p>
                                <p className="text-[11px] text-[var(--text-muted)]">{value}%</p>
                            </div>
                            <MiniBar value={value} />
                        </div>
                    );
                })}
            </div>
        </AppCard>
    );
}
