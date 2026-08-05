import { IconCoin, IconFileText, IconReceipt2, IconWallet } from '@tabler/icons-react';

import { AppMetricCard } from '@/components/ui/AppMetricCard';
import { formatCompactMoney } from '@/features/finance/utils/calculations';

export type FinanceMetrics = {
    totalQuotes: number;
    totalInvoices: number;
    paidTotal: number;
    remainingTotal: number;
    overdueTotal: number;
    totalExpenses: number;
    draftCount: number;
    currency: string;
};

type FinanceMetricCardsProps = {
    metrics: FinanceMetrics;
};

export function FinanceMetricCards({ metrics }: FinanceMetricCardsProps) {
    const cards = [
        { label: 'Total Devis', value: formatCompactMoney(metrics.totalQuotes, metrics.currency), icon: <IconFileText size={18} /> },
        { label: 'Total Factures', value: formatCompactMoney(metrics.totalInvoices, metrics.currency), icon: <IconReceipt2 size={18} /> },
        { label: 'Encaisse', value: formatCompactMoney(metrics.paidTotal, metrics.currency), icon: <IconWallet size={18} /> },
        { label: 'Restant', value: formatCompactMoney(metrics.remainingTotal, metrics.currency), icon: <IconCoin size={18} /> },
        { label: 'En retard', value: formatCompactMoney(metrics.overdueTotal, metrics.currency), icon: <IconCoin size={18} /> },
        { label: 'Brouillons', value: metrics.draftCount, icon: <IconFileText size={18} /> },
    ];

    return (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
            {cards.map((card) => (
                <AppMetricCard key={card.label} {...card} />
            ))}
        </div>
    );
}
