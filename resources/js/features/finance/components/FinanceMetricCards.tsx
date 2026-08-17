import { IconCoin, IconFileInvoice, IconFileText, IconReceipt2, IconWallet } from '@tabler/icons-react';

import { FinanceKpiCard } from '@/features/finance/components/FinanceKpiCard';
import { formatCompactMoney } from '@/features/finance/utils/calculations';

export type FinanceMetrics = {
    totalQuotes: number;
    expectedTotal: number;
    expectedRemainingTotal: number;
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
        { label: 'Total Devis', value: formatCompactMoney(metrics.totalQuotes, metrics.currency), icon: <IconFileText size={18} />, metricTypeSemantic: 'revenue' as const },
        { label: 'Prévision interne', value: formatCompactMoney(metrics.expectedTotal, metrics.currency), icon: <IconFileInvoice size={18} />, metricTypeSemantic: 'revenue' as const },
        { label: 'Factures officielles', value: formatCompactMoney(metrics.totalInvoices, metrics.currency), icon: <IconReceipt2 size={18} />, metricTypeSemantic: 'revenue' as const },
        { label: 'Encaisse', value: formatCompactMoney(metrics.paidTotal, metrics.currency), icon: <IconWallet size={18} />, metricTypeSemantic: 'revenue' as const },
        { label: 'Restant', value: formatCompactMoney(metrics.remainingTotal, metrics.currency), icon: <IconCoin size={18} />, metricTypeSemantic: 'revenue' as const },
        { label: 'En retard', value: formatCompactMoney(metrics.overdueTotal, metrics.currency), icon: <IconCoin size={18} />, metricTypeSemantic: 'overdue' as const },
        { label: 'Brouillons', value: metrics.draftCount, icon: <IconFileText size={18} />, metricTypeSemantic: 'revenue' as const },
    ];

    return (
        <div className="grid gap-3 grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))]">
            {cards.map((card) => (
                <FinanceKpiCard key={card.label} {...card} keepCurrencyAttached />
            ))}
        </div>
    );
}
