import { Head, router, usePage } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import { AppButton } from '@/components/ui/AppButton';
import { AppFormErrorSummary } from '@/components/ui/AppFormErrorSummary';
import { AppTextField } from '@/components/ui/AppTextField';
import type { FormErrors } from '@/lib/formErrors';
import { firstError } from '@/lib/formErrors';

type AcceptInvitationProps = {
    token: string;
    name: string;
    email: string;
};

export default function AcceptInvitation({ token, name, email }: AcceptInvitationProps) {
    const { errors: pageErrors } = usePage<{ errors: FormErrors }>().props;
    const [form, setForm] = useState({ name, password: '', passwordConfirmation: '' });
    const [loading, setLoading] = useState(false);

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        router.post(`/accept-invitation/${token}`, form, {
            onFinish: () => setLoading(false),
            onError: () => setLoading(false),
        });
    }

    return (
        <>
            <Head title="Accept Invitation" />
            <div className="flex min-h-dvh items-center justify-center bg-[var(--surface)] px-4">
                <div className="w-full max-w-md">
                    <div className="mb-8 text-center">
                        <h1 className="text-2xl font-black text-[var(--text)]">Join ARCHI LBO</h1>
                        <p className="mt-2 text-sm text-[var(--text-muted)]">Set your password to activate your account</p>
                    </div>

                    <form onSubmit={handleSubmit} className="app-surface space-y-6 p-6">
                        <AppFormErrorSummary errors={pageErrors} />

                        <AppTextField
                            label="Name"
                            value={form.name}
                            onChange={(value) => setForm((prev) => ({ ...prev, name: value }))}
                            error={firstError(pageErrors, 'name')}
                        />

                        <AppTextField
                            label="Email"
                            value={email}
                            isDisabled
                        />

                        <AppTextField
                            label="Password"
                            type="password"
                            placeholder="Min. 8 characters"
                            value={form.password}
                            onChange={(value) => setForm((prev) => ({ ...prev, password: value }))}
                            error={firstError(pageErrors, 'password')}
                        />

                        <AppTextField
                            label="Confirm password"
                            type="password"
                            placeholder="Repeat your password"
                            value={form.passwordConfirmation}
                            onChange={(value) => setForm((prev) => ({ ...prev, passwordConfirmation: value }))}
                            error={firstError(pageErrors, 'password')}
                        />

                        <AppButton variant="primary" type="submit" className="w-full" isDisabled={loading}>
                            {loading ? 'Activating...' : 'Activate account'}
                        </AppButton>
                    </form>

                    <p className="mt-6 text-center text-xs text-[var(--text-muted)]">
                        Already have an account?{' '}
                        <a href="/login" className="text-[var(--accent)] underline underline-offset-2">Sign in</a>
                    </p>
                </div>
            </div>
        </>
    );
}
