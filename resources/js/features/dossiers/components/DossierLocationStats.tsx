import type { DossierLocationStats as DossierLocationStatsType } from '@/features/dossiers/types';

type Props = {
    stats: DossierLocationStatsType;
    compact?: boolean;
};

function money(value: number) {
    return new Intl.NumberFormat('fr-MA', {
        style: 'currency',
        currency: 'MAD',
        maximumFractionDigits: 0,
    }).format(value || 0);
}

export function DossierLocationStats({ stats, compact = false }: Props) {
    const items = [
        { label: 'Projects', value: stats.projectsCount },
        { label: 'Open', value: stats.openCount },
        { label: 'Closed', value: stats.closedCount },
        { label: 'Documents', value: stats.documentsCount },
        { label: 'Finance docs', value: stats.financeDocumentsCount },
        { label: 'Invoices', value: money(stats.invoicesTotal) },
        { label: 'Paid', value: money(stats.paidTotal) },
        { label: 'Remaining', value: money(stats.remainingTotal) },
    ];

    return (
        <div className={compact ? 'grid gap-2 sm:grid-cols-2 xl:grid-cols-4' : 'grid gap-2 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-8'}>
            {items.slice(0, compact ? 4 : items.length).map((item) => (
                <div key={item.label} className="crm-panel-soft px-3 py-2">
                    <p className="truncate text-[9px] font-bold uppercase tracking-[0.16em] text-[var(--crm-text-soft)]">{item.label}</p>
                    <p className="mt-1 truncate text-sm font-semibold text-[var(--crm-text)]">{item.value}</p>
                </div>
            ))}
        </div>
    );
}