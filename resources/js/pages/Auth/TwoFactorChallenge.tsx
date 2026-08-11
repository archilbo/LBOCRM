import { Head, router, usePage } from '@inertiajs/react';
import { type FormEvent, useState } from 'react';
import { IconShieldLock } from '@tabler/icons-react';
import { AppButton } from '@/components/ui/AppButton';
import { AppTextField } from '@/components/ui/AppTextField';
import type { FormErrors } from '@/lib/formErrors';
import { firstError } from '@/lib/formErrors';

export default function TwoFactorChallenge() {
    const { errors } = usePage<{ errors: FormErrors }>().props; const [code, setCode] = useState(''); const [submitting, setSubmitting] = useState(false);
    function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setSubmitting(true); router.post('/two-factor-challenge', { code }, { onFinish: () => setSubmitting(false) }); }
    return <><Head title="Two-step verification" /><main className="flex min-h-dvh items-center justify-center bg-[var(--surface)] px-4"><section className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] p-6 shadow-2xl"><div className="mb-6 flex gap-3"><IconShieldLock className="text-[var(--accent)]" size={22} /><div><h1 className="font-semibold">Vérification en deux étapes</h1><p className="mt-1 text-sm text-[var(--text-muted)]">Saisissez le code de votre application ou un code de récupération.</p></div></div><form onSubmit={submit} className="space-y-4"><AppTextField label="Code" value={code} onChange={setCode} autoComplete="one-time-code" error={firstError(errors, 'code')} isRequired /><AppButton type="submit" variant="primary" className="w-full" isDisabled={submitting}>{submitting ? 'Vérification…' : 'Vérifier'}</AppButton></form></section></main></>;
}
