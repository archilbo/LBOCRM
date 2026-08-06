import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { IconAlertTriangle, IconClockHour3, IconShieldExclamation, IconUserCheck, IconUsers } from '@tabler/icons-react';
import { AppButton } from '@/components/ui/AppButton';
import { useTranslation } from '@/lib/i18n';

type InvitationStatus = 'invalid' | 'expired' | 'accepted' | 'suspended' | 'conflict';

type InvitationStatusProps = {
    status: InvitationStatus;
    token?: string;
    currentEmail?: string;
    invitedEmail?: string;
};

const STATUS_ICONS = {
    invalid: IconAlertTriangle,
    expired: IconClockHour3,
    accepted: IconUserCheck,
    suspended: IconShieldExclamation,
    conflict: IconUsers,
} as const;

const STATUS_TITLES = {
    invalid: 'invalidInvitation',
    expired: 'expiredInvitation',
    accepted: 'alreadyAccepted',
    suspended: 'suspendedAccount',
    conflict: 'sessionConflict',
} as const;

const STATUS_BODIES = {
    invalid: 'invalidOrReplaced',
    expired: 'expiredInvitation',
    accepted: 'alreadyAccepted',
    suspended: 'suspendedAccount',
    conflict: 'sessionConflictBody',
} as const;

export default function InvitationStatus({ status, token, currentEmail, invitedEmail }: InvitationStatusProps) {
    const { t } = useTranslation();
    const [switching, setSwitching] = useState(false);
    const Icon = STATUS_ICONS[status];

    const isConflict = status === 'conflict';
    const titleKey = `auth.acceptInvitation.${STATUS_TITLES[status]}`;
    const bodyKey = `auth.acceptInvitation.${STATUS_BODIES[status]}`;

    return (
        <>
            <Head title={t('auth.acceptInvitation.pageTitle')} />
            <div className="flex min-h-dvh items-center justify-center bg-[var(--surface)] px-4">
                <div className="w-full max-w-md">
                    <div className="mb-8 text-center">
                        <h1 className="text-2xl font-black text-[var(--text)]">{t('auth.acceptInvitation.title')}</h1>
                        <p className="mt-2 text-sm text-[var(--text-muted)]">{t('auth.acceptInvitation.subtitle')}</p>
                    </div>

                    <div className="app-surface space-y-5 p-6">
                        <div className="flex items-start gap-3">
                            <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${isConflict ? 'bg-[var(--crm-info-soft)] text-[var(--crm-info)]' : 'bg-[var(--crm-gold-soft)] text-[var(--accent)]'}`}>
                                <Icon size={20} />
                            </div>
                            <div className="min-w-0">
                                <h2 className="text-base font-semibold text-[var(--foreground)]">{t(titleKey)}</h2>
                                <p className="mt-1 text-sm leading-relaxed text-[var(--text-muted)]">{t(bodyKey)}</p>
                            </div>
                        </div>

                        {isConflict && currentEmail && invitedEmail ? (
                            <div className="grid gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-2)]/50 p-3">
                                <div className="flex items-center justify-between gap-3 text-xs">
                                    <span className="text-[var(--text-muted)]">{t('auth.acceptInvitation.signedInAs', { email: currentEmail })}</span>
                                </div>
                                <div className="flex items-center justify-between gap-3 text-xs">
                                    <span className="font-medium text-[var(--foreground)]">{t('auth.acceptInvitation.invitedEmailFor', { email: invitedEmail })}</span>
                                </div>
                            </div>
                        ) : null}

                        <div className="flex flex-col gap-2 border-t border-[var(--border)] pt-4 sm:flex-row sm:items-center sm:justify-end">
                            {isConflict ? (
                                <>
                                    <AppButton
                                        variant="bordered"
                                        isDisabled={switching}
                                        onPress={() => router.visit('/')}
                                    >
                                        {t('auth.acceptInvitation.cancel')}
                                    </AppButton>
                                    <AppButton
                                        variant="primary"
                                        isDisabled={switching}
                                        onPress={() => {
                                            if (!token || switching) {
                                                return;
                                            }
                                            setSwitching(true);
                                            router.post(`/accept-invitation/${token}/continue`, {}, {
                                                preserveScroll: true,
                                                onFinish: () => setSwitching(false),
                                            });
                                        }}
                                    >
                                        {t('auth.acceptInvitation.signOutAndContinue')}
                                    </AppButton>
                                </>
                            ) : (
                                <AppButton
                                    variant="primary"
                                    className="w-full sm:w-auto"
                                    onPress={() => router.visit('/login')}
                                >
                                    {t('auth.acceptInvitation.returnToSignIn')}
                                </AppButton>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
