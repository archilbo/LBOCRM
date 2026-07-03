import { Head, router, usePage } from '@inertiajs/react';
import { Building2, Lock, Mail } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { toast } from 'sonner';
import { AppButton } from '@/components/ui/AppButton';
import { AppTextField } from '@/components/ui/AppTextField';

type PageProps = {
    errors?: Record<string, string>;
    status?: string | null;
};

export default function Login() {
    const { errors = {}, status } = usePage<PageProps>().props;

    const [form, setForm] = useState({
        email: '',
        password: '',
        remember: true,
    });

    const [processing, setProcessing] = useState(false);

    function updateField(field: keyof typeof form, value: string | boolean) {
        setForm((current) => ({
            ...current,
            [field]: value,
        }));
    }

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setProcessing(true);

        router.post('/login', form, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Logged in successfully.');
            },
            onError: () => {
                toast.error('Login failed. Check your email and password.');
            },
            onFinish: () => {
                setProcessing(false);
            },
        });
    }

    return (
        <>
            <Head title="Login" />

            <main className="min-h-screen bg-(--app-bg) text-[var(--text)]">
                <div className="grid min-h-screen lg:grid-cols-[minmax(0,1fr)_520px]">
                    <section className="hidden overflow-hidden border-r bg-[radial-gradient(circle_at_top_left,color-mix(in_srgb,var(--accent)_24%,transparent),transparent_38%),linear-gradient(135deg,var(--surface),var(--surface-2))] p-10 lg:flex lg:flex-col lg:justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex size-12 items-center justify-center rounded-2xl bg-[var(--accent)] text-white">
                                <Building2 size={22} />
                            </div>

                            <div>
                                <p className="text-sm font-semibold">ARCHI LBO OS</p>
                                <p className="text-xs text-[var(--text-muted)]">
                                    Architecture office management
                                </p>
                            </div>
                        </div>

                        <div className="max-w-xl">
                            <p className="text-sm uppercase tracking-[0.3em] text-[var(--text-muted)]">
                                Private workspace
                            </p>
                            <h1 className="mt-4 text-5xl font-semibold tracking-tight">
                                Client, dossier, documents, finance and archive in one secure system.
                            </h1>
                            <p className="mt-5 text-base leading-7 text-[var(--text-muted)]">
                                This internal platform is restricted to ARCHI LBO company users only.
                            </p>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            {['Clients', 'Projects', 'Finance'].map((item) => (
                                <div key={item} className="rounded-3xl border bg-[var(--surface)] p-4">
                                    <p className="text-sm font-semibold">{item}</p>
                                    <p className="mt-1 text-xs text-[var(--text-muted)]">
                                        Protected module
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="flex items-center justify-center p-5">
                        <div className="w-full max-w-md">
                            <div className="mb-8 lg:hidden">
                                <div className="flex items-center gap-3">
                                    <div className="flex size-11 items-center justify-center rounded-2xl bg-[var(--accent)] text-white">
                                        <Building2 size={20} />
                                    </div>

                                    <div>
                                        <p className="text-sm font-semibold">ARCHI LBO OS</p>
                                        <p className="text-xs text-[var(--text-muted)]">
                                            Private workspace
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-[2rem] border bg-[var(--surface)] p-6 shadow-2xl">
                                <div className="mb-6">
                                    <p className="text-sm uppercase tracking-[0.25em] text-[var(--text-muted)]">
                                        Sign in
                                    </p>
                                    <h1 className="mt-2 text-2xl font-semibold">
                                        Access your workspace
                                    </h1>
                                    <p className="mt-2 text-sm text-[var(--text-muted)]">
                                        Use your company account to continue.
                                    </p>
                                </div>

                                {status ? (
                                    <div className="mb-4 rounded-2xl border bg-[var(--surface-2)] p-3 text-sm">
                                        {status}
                                    </div>
                                ) : null}

                                <form className="space-y-4" onSubmit={handleSubmit}>
                                    <AppTextField
                                        label="Email"
                                        type="email"
                                        value={form.email}
                                        onChange={(value) => updateField('email', value)}
                                        error={errors.email}
                                        icon={<Mail size={16} />}
                                        placeholder="admin@archilbo.local"
                                        autoComplete="email"
                                    />

                                    <AppTextField
                                        label="Password"
                                        type="password"
                                        value={form.password}
                                        onChange={(value) => updateField('password', value)}
                                        error={errors.password}
                                        icon={<Lock size={16} />}
                                        placeholder="Your password"
                                        autoComplete="current-password"
                                    />

                                    <label className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                                        <input
                                            type="checkbox"
                                            checked={form.remember}
                                            onChange={(event) => updateField('remember', event.target.checked)}
                                            className="size-4 rounded border"
                                        />
                                        Remember me
                                    </label>

                                    <AppButton
                                        variant="primary"
                                        type="submit"
                                        className="w-full"
                                        isDisabled={processing}
                                    >
                                        {processing ? 'Signing in...' : 'Sign in'}
                                    </AppButton>
                                </form>

                                <div className="mt-5 rounded-2xl bg-[var(--surface-2)] p-3 text-xs text-[var(--text-muted)]">
                                    Local default: admin@archilbo.local / password
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </>
    );
}