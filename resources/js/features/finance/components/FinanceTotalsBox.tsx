import { AppCard } from '@/components/ui/AppCard';
import { formatMoney } from '@/features/finance/utils/calculations';

type FinanceTotalsBoxProps = {
    subtotalHt: number;
    discountTotal: number;
    taxTotal: number;
    totalTtc: number;
    paidTotal?: number;
    remainingTotal?: number;
    currency: string;
};

export function FinanceTotalsBox({ subtotalHt, discountTotal, taxTotal, totalTtc, paidTotal = 0, remainingTotal, currency }: FinanceTotalsBoxProps) {
    const remaining = remainingTotal ?? Math.max(0, totalTtc - paidTotal);

    return (
        <AppCard className="p-4">
            <div className="space-y-2 text-sm">
                <Row label="Sous-total HT" value={formatMoney(subtotalHt, currency)} />
                <Row label="Remise document" value={`-${formatMoney(discountTotal, currency)}`} muted />
                <Row label="TVA" value={formatMoney(taxTotal, currency)} />
                <div className="my-2 border-t" />
                <Row label="Total TTC" value={formatMoney(totalTtc, currency)} strong />
                <Row label="Paye" value={formatMoney(paidTotal, currency)} />
                <Row label="Restant" value={formatMoney(remaining, currency)} strong danger={remaining > 0} />
            </div>
        </AppCard>
    );
}

function Row({ label, value, strong = false, muted = false, danger = false }: { label: string; value: string; strong?: boolean; muted?: boolean; danger?: boolean }) {
    return (
        <div className="flex items-center justify-between gap-4">
            <span className={muted ? 'text-[var(--text-muted)]' : 'text-[var(--text)]'}>{label}</span>
            <span className={`font-mono tabular-nums ${strong ? 'text-base font-bold' : 'font-medium'} ${danger ? 'text-[var(--danger)]' : ''}`}>{value}</span>
        </div>
    );
}
