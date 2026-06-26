import { BadgeDollarSign, FileText, ReceiptText, WalletCards } from 'lucide-react';
import { AppMetricCard } from '@/components/ui/AppMetricCard';
import { formatMoney } from '@/features/finance/utils/calculations';

export type FinanceMetrics = {
    totalQuotes: number;
    totalInvoices: number;
    paidTotal: number;
    remainingTotal: number;
    overdueTotal: number;
    draftCount: number;
    currency: string;
};

type FinanceMetricCardsProps = {
    metrics: FinanceMetrics;
};

export function FinanceMetricCards({ metrics }: FinanceMetricCardsProps) {
    const cards = [
        { label: 'Total Devis', value: formatMoney(metrics.totalQuotes, metrics.currency), icon: <FileText size={18} /> },
        { label: 'Total Factures', value: formatMoney(metrics.totalInvoices, metrics.currency), icon: <ReceiptText size={18} /> },
        { label: 'Encaisse', value: formatMoney(metrics.paidTotal, metrics.currency), icon: <WalletCards size={18} /> },
        { label: 'Restant', value: formatMoney(metrics.remainingTotal, metrics.currency), icon: <BadgeDollarSign size={18} /> },
        { label: 'En retard', value: formatMoney(metrics.overdueTotal, metrics.currency), icon: <BadgeDollarSign size={18} /> },
        { label: 'Brouillons', value: metrics.draftCount, icon: <FileText size={18} /> },
    ];

    return (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
            {cards.map((card) => (
                <AppMetricCard key={card.label} {...card} />
            ))}
        </div>
    );
}
