import { cn } from '@/lib/cn';

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
                    <button
                        key={item.key ?? 'total'}
                        type="button"
                        onClick={() => onFilter(isActive ? null : item.key)}
                        data-active={isActive}
                        className={cn(
                            'flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2.5 text-left transition hover:border-white/10 hover:bg-white/[0.04]',
                            isActive && 'border-amber-500/40 bg-amber-500/[0.06]',
                            !item.key && 'cursor-default',
                        )}
                    >
                        <div className="min-w-0">
                            <div className="text-[11px] uppercase tracking-wide text-white/50">{item.label}</div>
                            <div className="mt-0.5 text-xl font-semibold tabular-nums text-white">{value}</div>
                        </div>
                        {item.dot ? <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', item.dot)} /> : null}
                    </button>
                );
            })}
        </div>
    );
}
