import { Head, router, usePage } from '@inertiajs/react';
import { type FormEvent, useState } from 'react';
import { IconKey, IconShieldCheck } from '@tabler/icons-react';

import { AppButton } from '@/components/ui/AppButton';
import { AppFormErrorSummary } from '@/components/ui/AppFormErrorSummary';
import { AppTextField } from '@/components/ui/AppTextField';
import type { FormErrors } from '@/lib/formErrors';
import { firstError } from '@/lib/formErrors';

type ResetPasswordProps = {
    token: string;
    email: string;
};

export default function ResetPassword({ token, email }: ResetPasswordProps) {
    const { errors } = usePage<{ errors: FormErrors }>().props;
    const [form, setForm] = useState({ password: '', passwordConfirmation: '' });
    const [submitting, setSubmitting] = useState(false);

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setSubmitting(true);
        router.post('/reset-password', {
            token,
            email,
            password: form.password,
            password_confirmation: form.passwordConfirmation,
        }, {
            onFinish: () => setSubmitting(false),
        });
    }

    return (
        <>
            <Head title="Reset password" />
            <main className="flex min-h-dvh items-center justify-center bg-[var(--surface)] px-4 py-8">
                <section className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] p-6 shadow-2xl">
                    <div className="mb-6 flex items-start gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--crm-gold-soft)] text-[var(--accent)]"><IconKey size={18} /></div>
                        <div>
                            <h1 className="text-lg font-semibold text-[var(--foreground)]">Choose a new password</h1>
                            <p className="mt-1 text-sm text-[var(--text-muted)]">Use a strong, unique password for your ARCHI LBO account.</p>
                        </div>
                    </div>

                    <form onSubmit={submit} className="space-y-4">
                        <AppFormErrorSummary errors={errors} />
                        <AppTextField label="Email" value={email} isDisabled />
                        <AppTextField label="New password" type="password" placeholder="At least 12 characters" value={form.password} onChange={(password) => setForm((current) => ({ ...current, password }))} error={firstError(errors, 'password')} isRequired />
                        <AppTextField label="Confirm new password" type="password" placeholder="Repeat the new password" value={form.passwordConfirmation} onChange={(passwordConfirmation) => setForm((current) => ({ ...current, passwordConfirmation }))} error={firstError(errors, 'password_confirmation')} isRequired />
                        <p className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]"><IconShieldCheck size={13} className="text-[var(--crm-success)]" /> 12+ characters with uppercase, lowercase, number, and symbol.</p>
                        <AppButton variant="primary" type="submit" className="w-full" isDisabled={submitting}>{submitting ? 'Updating password...' : 'Update password'}</AppButton>
                    </form>
                </section>
            </main>
        </>
    );
}
