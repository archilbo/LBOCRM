import { Building2, FileCheck2, Hash, ShieldCheck } from 'lucide-react';
import { AppCard } from '@/components/ui/AppCard';
import { AppStatusBadge } from '@/components/ui/AppStatusBadge';
import { AuthorizationRow, AuthorizationStatus } from '@/features/authorizations/data/mockAuthorizations';
import { useTranslation } from '@/lib/i18n';

type AuthorizationBoardProps = {
    authorization: AuthorizationRow | null;
};

const statusTone: Record<AuthorizationStatus, 'neutral' | 'blue' | 'green' | 'amber' | 'red' | 'violet'> = {
    notStarted: 'neutral',
    preparing: 'amber',
    submitted: 'blue',
    observations: 'red',
    approved: 'green',
    received: 'green',
    rejected: 'red',
};

export function AuthorizationBoard({ authorization }: AuthorizationBoardProps) {
    const { t } = useTranslation();

    if (!authorization) {
        return null;
    }

    const items = [
        {
            label: t('authorizationsWorkspace.board.authority'),
            value: authorization.authorityName,
            icon: Building2,
        },
        {
            label: t('authorizationsWorkspace.board.submissionNumber'),
            value: authorization.submissionNumber,
            icon: Hash,
        },
        {
            label: t('authorizationsWorkspace.board.submittedAt'),
            value: authorization.submittedAt,
            icon: FileCheck2,
        },
        {
            label: t('authorizationsWorkspace.board.authorizationNumber'),
            value: authorization.authorizationNumber,
            icon: ShieldCheck,
        },
    ];

    return (
        <AppCard className="p-5">
            <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                    <h2 className="text-sm font-semibold">{t('authorizationsWorkspace.board.title')}</h2>
                    <p className="mt-1 max-w-2xl text-sm text-[var(--text-muted)]">
                        {t('authorizationsWorkspace.board.description')}
                    </p>
                </div>

                <AppStatusBadge
                    label={t(`authorizationsWorkspace.status.${authorization.status}`)}
                    tone={statusTone[authorization.status]}
                    icon={authorization.status === 'received' ? 'check' : authorization.status === 'observations' ? 'warning' : 'clock'}
                />
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                {items.map((item) => {
                    const Icon = item.icon;

                    return (
                        <div key={item.label} className="rounded-2xl border bg-[var(--surface-2)] p-4">
                            <div className="mb-3 flex items-center justify-between">
                                <p className="text-xs text-[var(--text-muted)]">{item.label}</p>
                                <Icon size={16} className="text-[var(--text-muted)]" />
                            </div>
                            <p className="truncate text-sm font-semibold">{item.value}</p>
                        </div>
                    );
                })}
            </div>

            <div className="mt-4 rounded-2xl border bg-[color-mix(in_srgb,var(--accent)_8%,var(--surface))] p-4">
                <p className="text-xs font-medium text-[var(--accent)]">
                    {t('authorizationsWorkspace.board.nextAction')}
                </p>
                <p className="mt-1 text-sm text-[var(--text-muted)]">
                    {t('authorizationsWorkspace.board.nextActionValue')}
                </p>
            </div>
        </AppCard>
    );
}
