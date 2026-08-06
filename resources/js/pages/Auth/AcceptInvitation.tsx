import { Head, router, usePage } from '@inertiajs/react';
import { FormEvent, useRef, useState } from 'react';
import { Check, X } from 'lucide-react';
import { IconEye, IconEyeOff } from '@tabler/icons-react';
import { AppButton } from '@/components/ui/AppButton';
import { AppFormErrorSummary } from '@/components/ui/AppFormErrorSummary';
import { AppTextField } from '@/components/ui/AppTextField';
import { useTranslation } from '@/lib/i18n';
import type { FormErrors } from '@/lib/formErrors';
import { firstError } from '@/lib/formErrors';
import {
    allPasswordRequirementsMet,
    checkPasswordRequirements,
    type PasswordRequirementKey,
} from '@/lib/passwordChecks';

type AcceptInvitationProps = {
    token: string;
    name: string;
    email: string;
};

const REQUIREMENT_KEYS: readonly PasswordRequirementKey[] = ['length', 'uppercase', 'lowercase', 'number', 'symbol'];

const REQUIREMENT_I18N_KEYS: Record<PasswordRequirementKey, string> = {
    length: 'auth.acceptInvitation.minLength',
    uppercase: 'auth.acceptInvitation.uppercase',
    lowercase: 'auth.acceptInvitation.lowercase',
    number: 'auth.acceptInvitation.number',
    symbol: 'auth.acceptInvitation.symbol',
};

export default function AcceptInvitation({ token, name, email }: AcceptInvitationProps) {
    const { errors: pageErrors } = usePage<{ errors: FormErrors }>().props;
    const { t } = useTranslation();
    const [form, setForm] = useState({ name, password: '', password_confirmation: '' });
    const [localErrors, setLocalErrors] = useState<FormErrors>({});
    const [dismissedKeys, setDismissedKeys] = useState<Set<string>>(() => new Set());
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);

    const nameFieldRef = useRef<HTMLDivElement>(null);
    const passwordFieldRef = useRef<HTMLDivElement>(null);
    const confirmationFieldRef = useRef<HTMLDivElement>(null);

    const requirements = checkPasswordRequirements(form.password);

    // Current, actionable errors only: local validation errors plus server
    // errors that have not been dismissed by editing the corresponding field.
    // Inertia `pageErrors` survive on the page indefinitely, so without this
    // dismissal they would keep re-appearing after the user fixes the input.
    const currentErrors: FormErrors = {};
    for (const [key, message] of Object.entries({ ...pageErrors, ...localErrors })) {
        if (message && !dismissedKeys.has(key)) {
            currentErrors[key] = message;
        }
    }

    function dismissError(key: string) {
        setDismissedKeys((current) => {
            if (current.has(key)) {
                return current;
            }

            const next = new Set(current);
            next.add(key);

            return next;
        });

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
        if (!form.name.trim()) {
            nextErrors.name = t('auth.acceptInvitation.nameRequired');
        }
        if (!form.password) {
            nextErrors.password = t('auth.acceptInvitation.passwordRequired');
        } else if (!allPasswordRequirementsMet(form.password)) {
            nextErrors.password = t('auth.acceptInvitation.passwordRequirements');
        }
        if (!form.password_confirmation) {
            nextErrors.password_confirmation = t('auth.acceptInvitation.confirmPasswordRequired');
        } else if (form.password !== form.password_confirmation) {
            nextErrors.password_confirmation = t('auth.acceptInvitation.passwordsMismatch');
        }

        setLocalErrors(nextErrors);
        if (Object.keys(nextErrors).length > 0) {
            // Focus the first invalid field.
            if (nextErrors.name) {
                nameFieldRef.current?.querySelector('input')?.focus();
            } else if (nextErrors.password) {
                passwordFieldRef.current?.querySelector('input')?.focus();
            } else if (nextErrors.password_confirmation) {
                confirmationFieldRef.current?.querySelector('input')?.focus();
            }

            return;
        }

        setLoading(true);
        router.post(`/accept-invitation/${token}`, {
            name: form.name.trim(),
            password: form.password,
            password_confirmation: form.password_confirmation,
        }, {
            onError: () => {
                // New backend errors are current until the user edits the field.
                setDismissedKeys(new Set());
                setLoading(false);
            },
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
                        <AppFormErrorSummary errors={currentErrors} />

                        <div ref={nameFieldRef}>
                            <AppTextField
                                label={t('auth.acceptInvitation.name')}
                                value={form.name}
                                onChange={(value) => {
                                    setForm((prev) => ({ ...prev, name: value }));
                                    dismissError('name');
                                }}
                                error={firstError(currentErrors, 'name')}
                            />
                        </div>

                        <AppTextField
                            label={t('auth.acceptInvitation.email')}
                            value={email}
                            isDisabled
                        />

                        <div ref={passwordFieldRef}>
                            <AppTextField
                                label={t('auth.acceptInvitation.password')}
                                type={showPassword ? 'text' : 'password'}
                                value={form.password}
                                onChange={(value) => {
                                    setForm((prev) => ({ ...prev, password: value }));
                                    dismissError('password');
                                }}
                                error={firstError(currentErrors, 'password')}
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

                            <div className="mt-2 grid gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface-2)]/40 px-3 py-2.5">
                                <p className="text-[11px] font-semibold text-[var(--text-muted)]">
                                    {t('auth.acceptInvitation.passwordRequirementsLabel')}
                                </p>

                                {REQUIREMENT_KEYS.map((key) => {
                                    const passed = requirements[key];
                                    const StatusIcon = passed ? Check : X;

                                    return (
                                        <div key={key} className="flex items-center gap-2 text-[11px]">
                                            <StatusIcon
                                                size={12}
                                                strokeWidth={3}
                                                aria-hidden
                                                className={passed ? 'text-[var(--crm-success)]' : 'text-[var(--text-muted)]'}
                                            />
                                            <span className={passed ? 'text-[var(--foreground)]' : 'text-[var(--text-muted)]'}>
                                                {t(REQUIREMENT_I18N_KEYS[key])}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div ref={confirmationFieldRef}>
                            <AppTextField
                                label={t('auth.acceptInvitation.confirmPassword')}
                                type={showConfirmation ? 'text' : 'password'}
                                placeholder={t('auth.acceptInvitation.confirmPasswordPlaceholder')}
                                value={form.password_confirmation}
                                onChange={(value) => {
                                    setForm((prev) => ({ ...prev, password_confirmation: value }));
                                    dismissError('password_confirmation');
                                }}
                                error={firstError(currentErrors, 'password_confirmation')}
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
                        </div>

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
