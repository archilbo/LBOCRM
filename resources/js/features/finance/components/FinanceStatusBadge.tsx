import { AppStatusBadge } from '@/components/ui/AppStatusBadge';
import type { FinanceDocumentStatus } from '@/features/finance/types';

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

export function financeStatusLabel(status: string): string {
    return statusLabels[status as FinanceDocumentStatus] ?? status;
}

export function FinanceStatusBadge({ status }: { status: FinanceDocumentStatus | string }) {
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
            label={financeStatusLabel(status)}
            tone={statusTones[typedStatus] ?? 'neutral'}
            icon={icon}
        />
    );
}
