import { Head, router, usePage } from '@inertiajs/react';
import { type FormEvent, useState } from 'react';
import { IconArrowLeft, IconMail, IconShieldLock } from '@tabler/icons-react';
import { AppButton } from '@/components/ui/AppButton';
import { AppTextField } from '@/components/ui/AppTextField';
import type { FormErrors } from '@/lib/formErrors';
import { firstError } from '@/lib/formErrors';

export default function ForgotPassword() {
    const { errors, flash } = usePage<{ errors: FormErrors; flash?: { status?: string } }>().props;
    const [email, setEmail] = useState('');
    const [submitting, setSubmitting] = useState(false);

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault(); setSubmitting(true);
        router.post('/forgot-password', { email }, { onFinish: () => setSubmitting(false) });
    }

    return <><Head title="Forgot password" /><main className="flex min-h-dvh items-center justify-center bg-[var(--surface)] px-4 py-8"><section className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] p-6 shadow-2xl"><div className="mb-6 flex items-start gap-3"><div className="flex size-10 items-center justify-center rounded-xl bg-[var(--crm-gold-soft)] text-[var(--accent)]"><IconShieldLock size={18} /></div><div><h1 className="text-lg font-semibold text-[var(--foreground)]">Forgot your password?</h1><p className="mt-1 text-sm text-[var(--text-muted)]">Enter your sign-in or verified backup email. We will send a secure reset link if it matches an account.</p></div></div>{flash?.status ? <p className="mb-4 rounded-xl border border-[color-mix(in_srgb,var(--success)_35%,transparent)] bg-[color-mix(in_srgb,var(--success)_10%,transparent)] p-3 text-sm text-[var(--success)]">{flash.status}</p> : null}<form onSubmit={submit} className="space-y-4"><AppTextField label="Email" type="email" autoComplete="email" value={email} onChange={setEmail} placeholder="name@company.com" icon={<IconMail size={15} />} error={firstError(errors, 'email')} isRequired /><AppButton variant="primary" type="submit" className="w-full" isDisabled={submitting}>{submitting ? 'Sending…' : 'Send reset link'}</AppButton></form><a href="/login" className="mt-5 flex items-center justify-center gap-1.5 text-sm text-[var(--accent)] hover:underline"><IconArrowLeft size={14} />Back to sign in</a></section></main></>;
}
