import { AppCard } from '@/components/ui/AppCard';
import { FinanceRecordRow } from '@/features/finance/data/mockFinance';
import { formatMoney } from '@/lib/currency';
import { useTranslation } from '@/lib/i18n';

type FinanceBreakdownPanelProps = {
    record: FinanceRecordRow | null;
};

function Row({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between gap-3 rounded-xl border bg-[var(--surface)] p-3">
            <span className="text-sm text-[var(--text-muted)]">{label}</span>
            <span className="font-semibold">{value}</span>
        </div>
    );
}

export function FinanceBreakdownPanel({ record }: FinanceBreakdownPanelProps) {
    const { t } = useTranslation();

    return (
        <AppCard className="min-w-0 p-4">
            <div className="mb-4">
                <h2 className="text-sm font-semibold">{t('financeWorkspace.breakdown.title')}</h2>
                <p className="mt-1 text-sm text-[var(--text-muted)]">
                    {t('financeWorkspace.breakdown.description')}
                </p>
            </div>

            {record ? (
                <div className="grid gap-2">
                    <Row label={t('financeWorkspace.breakdown.ht')} value={formatMoney(record.ht)} />
                    <Row label={t('financeWorkspace.breakdown.tva')} value={formatMoney(record.tva)} />
                    <Row label={t('financeWorkspace.breakdown.ttc')} value={formatMoney(record.totalTtc)} />
                    <Row label={t('financeWorkspace.breakdown.paid')} value={formatMoney(record.paid)} />
                    <Row label={t('financeWorkspace.breakdown.remaining')} value={formatMoney(record.remaining)} />
                </div>
            ) : null}
        </AppCard>
    );
}
