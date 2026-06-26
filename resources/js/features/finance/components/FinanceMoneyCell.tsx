import { formatMoney } from '@/features/finance/utils/calculations';

export function FinanceMoneyCell({ value, currency = 'MAD', tone = 'default' }: { value: number; currency?: string; tone?: 'default' | 'success' | 'danger' }) {
    const toneClass = tone === 'success'
        ? 'text-[var(--success)]'
        : tone === 'danger'
            ? 'text-[var(--danger)]'
            : 'text-[var(--text)]';

    return (
        <span className={`whitespace-nowrap font-mono text-sm font-semibold tabular-nums ${toneClass}`}>
            {formatMoney(value, currency)}
        </span>
    );
}
