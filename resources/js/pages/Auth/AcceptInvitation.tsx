import { Head, router, usePage } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import { IconEye, IconEyeOff } from '@tabler/icons-react';
import { AppButton } from '@/components/ui/AppButton';
import { AppFormErrorSummary } from '@/components/ui/AppFormErrorSummary';
import { AppTextField } from '@/components/ui/AppTextField';
import { useTranslation } from '@/lib/i18n';
import type { FormErrors } from '@/lib/formErrors';
import { firstError, hasErrors } from '@/lib/formErrors';

type AcceptInvitationProps = {
    token: string;
    name: string;
    email: string;
};

export default function AcceptInvitation({ token, name, email }: AcceptInvitationProps) {
    const { errors: pageErrors } = usePage<{ errors: FormErrors }>().props;
    const { t } = useTranslation();
    const [form, setForm] = useState({ name, password: '', password_confirmation: '' });
    const [localErrors, setLocalErrors] = useState<FormErrors>({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);

    const errors: FormErrors = { ...pageErrors, ...localErrors };

    function clearLocalError(key: string) {
        setLocalErrors((current) => {
            if (!current[key]) {
                return current;
            }

            const next = { ...current };
            delete next[key];

            return next;
        });
    }

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (loading) {
            return;
        }

        const nextErrors: FormErrors = {};
        if (!form.password) {
            nextErrors.password = t('auth.acceptInvitation.passwordRequired');
        }
        if (!form.password_confirmation) {
            nextErrors.password_confirmation = t('auth.acceptInvitation.confirmPasswordRequired');
        } else if (form.password !== form.password_confirmation) {
            nextErrors.password_confirmation = t('auth.acceptInvitation.passwordsMismatch');
        }

        setLocalErrors(nextErrors);
        if (Object.keys(nextErrors).length > 0) {
            return;
        }

        setLoading(true);
        router.post(`/accept-invitation/${token}`, {
            name: form.name.trim(),
            password: form.password,
            password_confirmation: form.password_confirmation,
        }, {
            onFinish: () => setLoading(false),
        });
    }

    return (
        <>
            <Head title={t('auth.acceptInvitation.pageTitle')} />
            <div className="flex min-h-dvh items-center justify-center bg-[var(--surface)] px-4">
                <div className="w-full max-w-md">
                    <div className="mb-8 text-center">
                        <h1 className="text-2xl font-black text-[var(--text)]">{t('auth.acceptInvitation.title')}</h1>
                        <p className="mt-2 text-sm text-[var(--text-muted)]">{t('auth.acceptInvitation.subtitle')}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="app-surface space-y-6 p-6">
                        <AppFormErrorSummary errors={pageErrors} />

                        {hasErrors(localErrors) ? (
                            <p className="text-xs font-medium text-[var(--danger)]">{t('auth.acceptInvitation.checkForm')}</p>
                        ) : null}

                        <AppTextField
                            label={t('auth.acceptInvitation.name')}
                            value={form.name}
                            onChange={(value) => setForm((prev) => ({ ...prev, name: value }))}
                            error={firstError(errors, 'name')}
                        />

                        <AppTextField
                            label={t('auth.acceptInvitation.email')}
                            value={email}
                            isDisabled
                        />

                        <AppTextField
                            label={t('auth.acceptInvitation.password')}
                            type={showPassword ? 'text' : 'password'}
                            value={form.password}
                            onChange={(value) => {
                                setForm((prev) => ({ ...prev, password: value }));
                                clearLocalError('password');
                            }}
                            error={firstError(errors, 'password')}
                            description={t('auth.acceptInvitation.passwordRequirements')}
                            autoComplete="new-password"
                            endContent={
                                <AppButton
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    isIconOnly
                                    aria-label={showPassword ? t('auth.acceptInvitation.hidePassword') : t('auth.acceptInvitation.showPassword')}
                                    className="size-8 min-w-0 text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]"
                                    onPress={() => setShowPassword((visible) => !visible)}
                                >
                                    {showPassword ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                                </AppButton>
                            }
                        />

                        <AppTextField
                            label={t('auth.acceptInvitation.confirmPassword')}
                            type={showConfirmation ? 'text' : 'password'}
                            placeholder={t('auth.acceptInvitation.confirmPasswordPlaceholder')}
                            value={form.password_confirmation}
                            onChange={(value) => {
                                setForm((prev) => ({ ...prev, password_confirmation: value }));
                                clearLocalError('password_confirmation');
                            }}
                            error={firstError(errors, 'password_confirmation')}
                            autoComplete="new-password"
                            endContent={
                                <AppButton
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    isIconOnly
                                    aria-label={showConfirmation ? t('auth.acceptInvitation.hidePassword') : t('auth.acceptInvitation.showPassword')}
                                    className="size-8 min-w-0 text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]"
                                    onPress={() => setShowConfirmation((visible) => !visible)}
                                >
                                    {showConfirmation ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                                </AppButton>
                            }
                        />

                        <AppButton variant="primary" type="submit" className="w-full" isDisabled={loading}>
                            {loading ? t('auth.acceptInvitation.activating') : t('auth.acceptInvitation.activateAccount')}
                        </AppButton>
                    </form>

                    <p className="mt-6 text-center text-xs text-[var(--text-muted)]">
                        {t('auth.acceptInvitation.alreadyHaveAccount')}{' '}
                        <a href="/login" className="text-[var(--accent)] underline underline-offset-2">{t('auth.acceptInvitation.signIn')}</a>
                    </p>
                </div>
            </div>
        </>
    );
}
