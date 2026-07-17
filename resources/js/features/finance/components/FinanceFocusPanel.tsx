import { BadgeDollarSign, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { AppBadge } from '@/components/ui/AppBadge';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppStatusBadge } from '@/components/ui/AppStatusBadge';
import {
    FinanceRecordRow,
    FinanceRecordStatus,
} from '@/features/finance/data/mockFinance';
import { formatMoney } from '@/lib/currency';
import { useTranslation } from '@/lib/i18n';

type FinanceFocusPanelProps = {
    record: FinanceRecordRow | null;
};

type BadgeTone = 'neutral' | 'blue' | 'green' | 'amber' | 'red' | 'violet';

function getStatusTone(status: FinanceRecordStatus): BadgeTone {
    switch (status) {
        case 'draft':
            return 'neutral';
        case 'sent':
            return 'blue';
        case 'partiallyPaid':
            return 'amber';
        case 'paid':
            return 'green';
        case 'overdue':
        case 'cancelled':
            return 'red';
        default:
            return 'neutral';
    }
}

function ProgressBar({ paid, total }: { paid: number; total: number }) {
    const value = total > 0 ? Math.round((paid / total) * 100) : 0;

    return (
        <div className="flex items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--surface-2)]">
                <div
                    className="h-full rounded-full bg-[var(--accent)]"
                    style={{ width: `${value}%` }}
                />
            </div>
            <span className="w-9 text-right text-[11px] font-medium text-[var(--text-muted)]">
                {value}%
            </span>
        </div>
    );
}

function DetailItem({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-xl border bg-[var(--surface-2)] p-3">
            <p className="text-[11px] font-medium text-[var(--text-muted)]">{label}</p>
            <p className="mt-1 truncate text-sm font-semibold">{value}</p>
        </div>
    );
}

export function FinanceFocusPanel({ record }: FinanceFocusPanelProps) {
    const { t } = useTranslation();

    return (
        <AppCard className="min-w-0 p-4">
            <div className="mb-4">
                <h2 className="text-sm font-semibold">{t('financeWorkspace.focus.title')}</h2>
                <p className="mt-1 text-sm text-[var(--text-muted)]">
                    {t('financeWorkspace.focus.description')}
                </p>
            </div>

            {record ? (
                <div className="space-y-4">
                    <div className="flex items-start gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] text-[var(--accent)]">
                            <BadgeDollarSign size={18} />
                        </div>

                        <div className="min-w-0">
                            <p className="text-sm font-semibold">{record.recordNumber}</p>
                            <p className="mt-1 truncate text-xs text-[var(--text-muted)]">
                                {record.dossierNumber} Â· {record.client}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <AppStatusBadge
                            label={t(`financeWorkspace.status.${record.status}`)}
                            tone={getStatusTone(record.status)}
                            icon={
                                record.status === 'paid'
                                    ? 'check'
                                    : record.status === 'overdue'
                                      ? 'warning'
                                      : 'clock'
                            }
                        />

                        <AppBadge tone="blue">{t(`financeWorkspace.type.${record.type}`)}</AppBadge>
                    </div>

                    <ProgressBar paid={record.paid} total={record.totalTtc} />

                    <div className="grid gap-2">
                        <DetailItem label={t('financeWorkspace.focus.totalTtc')} value={formatMoney(record.totalTtc)} />
                        <DetailItem label={t('financeWorkspace.focus.paid')} value={formatMoney(record.paid)} />
                        <DetailItem label={t('financeWorkspace.focus.remaining')} value={formatMoney(record.remaining)} />
                        <DetailItem label={t('financeWorkspace.focus.dueDate')} value={record.dueDate} />
                    </div>

                    <div className="rounded-2xl border bg-[color-mix(in_srgb,var(--accent)_8%,var(--surface))] p-4">
                        <p className="text-xs font-medium text-[var(--accent)]">
                            {t('financeWorkspace.focus.nextAction')}
                        </p>
                        <p className="mt-1 text-sm text-[var(--text-muted)]">
                            {record.nextAction}
                        </p>
                    </div>

                    <div className="grid gap-2">
                        <AppButton
                            variant="primary"
                            onPress={() => toast.success(t('financeWorkspace.toast.addPayment'))}
                        >
                            <BadgeDollarSign size={16} />
                            {t('financeWorkspace.addPayment')}
                        </AppButton>

                        <AppButton
                            variant="secondary"
                            onPress={() => toast.success(t('financeWorkspace.toast.markPaid'))}
                        >
                            <CheckCircle2 size={16} />
                            {t('financeWorkspace.status.paid')}
                        </AppButton>
                    </div>
                </div>
            ) : (
                <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed bg-[var(--surface-2)]">
                    <div className="px-6 text-center">
                        <BadgeDollarSign className="mx-auto text-[var(--text-muted)]" size={34} />
                        <p className="mt-3 text-sm font-semibold">{t('financeWorkspace.focus.noRecord')}</p>
                        <p className="mt-1 max-w-sm text-sm text-[var(--text-muted)]">
                            {t('financeWorkspace.focus.selectRecord')}
                        </p>
                    </div>
                </div>
            )}
        </AppCard>
    );
}
