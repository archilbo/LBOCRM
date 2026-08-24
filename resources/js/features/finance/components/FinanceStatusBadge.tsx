import { AppStatusBadge } from '@/components/ui/AppStatusBadge';
import type { FinanceDocumentStatus } from '@/features/finance/types';
import { t, useTranslation } from '@/lib/i18n';

type StatusTone = 'neutral' | 'blue' | 'green' | 'amber' | 'red' | 'violet';

const statusLabels: Record<FinanceDocumentStatus, string> = {
    draft: 'Brouillon',
    sent: 'Envoye',
    accepted: 'Accepte',
    rejected: 'Refuse',
    converted: 'Converti',
    issued: 'Emis',
    partially_paid: 'Partiellement paye',
    paid: 'Paye',
    overdue: 'En retard',
    cancelled: 'Annule',
};

const statusTones: Record<FinanceDocumentStatus, StatusTone> = {
    draft: 'neutral',
    sent: 'blue',
    accepted: 'green',
    rejected: 'red',
    converted: 'violet',
    issued: 'blue',
    partially_paid: 'amber',
    paid: 'green',
    overdue: 'red',
    cancelled: 'neutral',
};

export function financeStatusLabel(status: string, translate: (key: string) => string = t): string {
    const keys: Record<string, string> = {
        draft: 'finance.statuses.draft', sent: 'finance.statuses.sent', accepted: 'finance.statuses.accepted', rejected: 'finance.statuses.rejected',
        converted: 'finance.statuses.converted', issued: 'finance.statuses.issued', partially_paid: 'finance.statuses.partiallyPaid',
        partial: 'finance.statuses.partiallyPaid', paid: 'finance.statuses.paid', overdue: 'finance.statuses.overdue', cancelled: 'finance.statuses.cancelled',
    };

    const key = keys[status];

    return key
        ? translate(key)
        : statusLabels[status as FinanceDocumentStatus] ?? status;
}

export function financeDocumentTypeLabel(type: string, translate: (key: string) => string = t): string {
    const keys: Record<string, string> = {
        quote: 'finance.types.quote', invoice: 'finance.types.invoice', receipt: 'finance.types.receipt',
    };

    return keys[type] ? translate(keys[type]) : type;
}

export function financeExpenseCategoryLabel(category: string, translate: (key: string) => string = t): string {
    const keys: Record<string, string> = {
        administrative: 'finance.expenses.administrative',
        travel: 'finance.expenses.travel',
        supplies: 'finance.expenses.supplies',
        equipment: 'finance.expenses.equipment',
        utilities: 'finance.expenses.utilities',
        professional_fees: 'finance.expenses.professionalFees',
        taxes: 'finance.expenses.taxes',
        other: 'finance.expenses.other',
    };

    return keys[category] ? translate(keys[category]) : category;
}

export function FinanceStatusBadge({ status }: { status: FinanceDocumentStatus | string }) {
    const { t } = useTranslation();
    const typedStatus = status as FinanceDocumentStatus;
    const icon = typedStatus === 'paid' || typedStatus === 'accepted'
        ? 'check'
        : typedStatus === 'overdue' || typedStatus === 'rejected'
            ? 'warning'
            : typedStatus === 'sent' || typedStatus === 'partially_paid'
                ? 'clock'
                : 'dot';

    return (
        <AppStatusBadge
            label={financeStatusLabel(status, t)}
            tone={statusTones[typedStatus] ?? 'neutral'}
            icon={icon}
        />
    );
}
