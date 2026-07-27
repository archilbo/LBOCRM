import { cn } from '@/lib/cn';
import { AppKpiCard } from '@/components/ui/AppKpiCard';

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

const KPI_ITEMS = [
    { key: null as string | null, label: 'Total', valueKey: 'total' as const, dot: '' },
    { key: 'ready', label: 'Ready', valueKey: 'ready' as const, dot: 'bg-emerald-500' },
    { key: 'stored', label: 'Stored', valueKey: 'stored' as const, dot: 'bg-sky-500' },
    { key: 'checked_out', label: 'Out', valueKey: 'checkedOut' as const, dot: 'bg-amber-500' },
    { key: 'overdue', label: 'Overdue', valueKey: 'overdue' as const, dot: 'bg-red-500' },
    { key: 'returned', label: 'Returned', valueKey: 'returned' as const, dot: 'bg-violet-500' },
    { key: 'lost', label: 'Lost', valueKey: 'lost' as const, dot: 'bg-zinc-500' },
] as const;

export function KpiStrip({ kpis, activeFilter, onFilter, className }: KpiProps) {
    return (
        <div className={cn('grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-7', className)}>
            {KPI_ITEMS.map((item) => {
                const value = kpis[item.valueKey];
                const isActive = activeFilter === item.key;

                return (
                    <AppKpiCard
                        key={item.key ?? 'total'}
                        label={item.label}
                        value={value}
                        icon={item.dot ? <span className={cn('size-1.5 rounded-full', item.dot)} /> : undefined}
                        onPress={item.key ? () => onFilter(isActive ? null : item.key) : undefined}
                        isSelected={isActive}
                    />
                );
            })}
        </div>
    );
}
