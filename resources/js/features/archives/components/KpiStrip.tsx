import { cn } from '@/lib/cn';
import { AppKpiCard } from '@/components/ui/AppKpiCard';
import { useTranslation } from '@/lib/i18n';
import { useMemo } from 'react';

type KpiProps = {
    kpis: {
        total: number;
        ready: number;
        stored: number;
        checkedOut: number;
        returned: number;
        overdue: number;
        lost: number;
    };
    activeFilter: string | null;
    onFilter: (key: string | null) => void;
    className?: string;
};

const KPI_CONFIG = [
    { key: null as string | null, valueKey: 'total' as const, dot: '' },
    { key: 'ready', valueKey: 'ready' as const, dot: 'bg-[var(--crm-success)]' },
    { key: 'stored', valueKey: 'stored' as const, dot: 'bg-[var(--crm-info)]' },
    { key: 'checked_out', valueKey: 'checkedOut' as const, dot: 'bg-[var(--crm-gold)]' },
    { key: 'overdue', valueKey: 'overdue' as const, dot: 'bg-[var(--crm-danger)]' },
    { key: 'returned', valueKey: 'returned' as const, dot: 'bg-[var(--crm-violet)]' },
    { key: 'lost', valueKey: 'lost' as const, dot: 'bg-[var(--crm-text-soft)]' },
] as const;

export function KpiStrip({ kpis, activeFilter, onFilter, className }: KpiProps) {
    const { t } = useTranslation();

    const kpiItems = useMemo(() => KPI_CONFIG.map((item) => ({
        ...item,
        label: t(`kpi.${item.valueKey}`),
    })), [t]);

    return (
        <div className={cn('grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-7', className)}>
            {kpiItems.map((item) => {
                const value = kpis[item.valueKey];
                const isActive = activeFilter === item.key;

                return (
                    <AppKpiCard
                        key={item.key ?? 'total'}
                        label={item.label}
                        value={value}
                        icon={item.dot ? <span className={cn('size-2 rounded-full', item.dot)} /> : undefined}
                        onPress={item.key ? () => onFilter(isActive ? null : item.key) : undefined}
                        isSelected={isActive}
                        stacked
                    />
                );
            })}
        </div>
    );
}
