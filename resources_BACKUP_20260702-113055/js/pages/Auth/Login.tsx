import { Head, router } from '@inertiajs/react';
import {
    ArrowRight,
    BadgeDollarSign,
    Building2,
    CheckCircle2,
    FileCheck2,
    FolderKanban,
    LockKeyhole,
    Mail,
    ShieldCheck,
} from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { AppButton } from '@/components/ui/AppButton';
import { AppTextField } from '@/components/ui/AppTextField';

const FORCE_LOGIN_REDESIGN_53L = true;

type LoginForm = {
    email: string;
    password: string;
    remember: boolean;
};

type PageProps = {
    errors?: Record<string, string>;
    status?: string;
};

const modules = [
    { label: 'Clients', value: 'Identity and contacts', icon: Building2 },
    { label: 'Projects', value: 'Architecture workflow', icon: FolderKanban },
    { label: 'Documents', value: 'Files and missing pieces', icon: FileCheck2 },
    { label: 'Finance', value: 'Quotes, invoices, receipts', icon: BadgeDollarSign },
];

const checks = [
    'Private CRM workspace',
    'Role protected modules',
    'Finance document lock guard',
    'Local document storage',
];

export default function Login({ errors = {}, status }: PageProps) {
    useEffect(() => {
        document.documentElement.classList.add('login-no-scroll');
        document.body.classList.add('login-no-scroll');

        return () => {
            document.documentElement.classList.remove('login-no-scroll');
            document.body.classList.remove('login-no-scroll');
        };
    }, []);

    const [form, setForm] = useState<LoginForm>({
        email: '',
        password: '',
        remember: false,
    });
    const [processing, setProcessing] = useState(false);

    function updateField<K extends keyof LoginForm>(field: K, value: LoginForm[K]) {
        setForm((current) => ({ ...current, [field]: value }));
    }

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setProcessing(true);

        router.post('/login', form, {
            onSuccess: () => toast.success('Signed in.'),
            onError: () => {
                toast.error('Login failed. Check your email and password.');
                setProcessing(false);
            },
            onFinish: () => setProcessing(false),
        });
    }

    return (
        <>
            <Head title="Login" />

            <main
                className="fixed inset-0 h-[100dvh] w-screen overflow-hidden bg-[var(--crm-bg)] text-[var(--crm-text)]"
                data-ui-marker={FORCE_LOGIN_REDESIGN_53L ? 'FORCE_LOGIN_REDESIGN_53L' : undefined}
            >
                <div className="grid h-[100dvh] overflow-hidden lg:grid-cols-[minmax(0,1fr)_480px]">
                    <section className="relative hidden h-[100dvh] overflow-hidden border-r border-[var(--crm-border)] bg-[radial-gradient(circle_at_top_left,color-mix(in_srgb,var(--crm-accent)_18%,transparent),transparent_34%),linear-gradient(135deg,#080806,#11100c_55%,#050505)] p-8 lg:block">
                        <div className="relative z-10 flex h-full flex-col">
                            <div className="flex items-center gap-3">
                                <div className="flex size-12 items-center justify-center rounded-2xl bg-[var(--crm-accent)] text-black">
                                    <Building2 size={24} />
                                </div>
                                <div>
                                    <p className="text-lg font-black tracking-tight">ARCHI LBO <span className="text-[var(--crm-accent)]">OS</span></p>
                                    <p className="text-xs text-[var(--crm-muted)]">Architecture office operating system</p>
                                </div>
                            </div>

                            <div className="mt-auto max-w-3xl">
                                <p className="crm-eyebrow">Secure workspace</p>
                                <h1 className="mt-4 max-w-2xl text-5xl font-black leading-tight tracking-tight">
                                    One command center for projects, documents, finance and archive.
                                </h1>
                                <p className="mt-5 max-w-xl text-base leading-7 text-[var(--crm-text-muted)]">
                                    Internal CRM access for managing client files from request to authorization, billing, payment and physical archive.
                                </p>

                                <div className="mt-8 grid max-w-4xl gap-3 xl:grid-cols-2">
                                    {modules.map((module) => {
                                        const Icon = module.icon;

                                        return (
                                            <div key={module.label} className="rounded-2xl border border-[var(--crm-border)] bg-black/25 p-4 backdrop-blur">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex size-10 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--crm-accent)_16%,transparent)] text-[var(--crm-accent)]">
                                                        <Icon size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black">{module.label}</p>
                                                        <p className="text-xs text-[var(--crm-muted)]">{module.value}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="mt-8 flex flex-wrap gap-2">
                                    {checks.map((check) => (
                                        <span key={check} className="inline-flex items-center gap-2 rounded-full border border-[var(--crm-border)] bg-black/25 px-3 py-2 text-xs font-semibold text-[var(--crm-text-muted)]">
                                            <CheckCircle2 size={14} className="text-emerald-300" />
                                            {check}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="flex h-[100dvh] items-center justify-center overflow-hidden p-5 sm:p-8">
                        <div className="w-full max-w-md">
                            <div className="mb-8 flex items-center gap-3 lg:hidden">
                                <div className="flex size-11 items-center justify-center rounded-2xl bg-[var(--crm-accent)] text-black">
                                    <Building2 size={22} />
                                </div>
                                <div>
                                    <p className="text-lg font-black">ARCHI LBO <span className="text-[var(--crm-accent)]">OS</span></p>
                                    <p className="text-xs text-[var(--crm-muted)]">Architecture office operating system</p>
                                </div>
                            </div>

                            <div className="crm-panel max-h-[calc(100vh-3rem)] overflow-hidden">
                                <div className="border-b border-[var(--crm-border)] p-5">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <p className="crm-eyebrow">Private access</p>
                                            <h2 className="mt-3 text-2xl font-black">Sign in</h2>
                                            <p className="mt-2 text-sm text-[var(--crm-muted)]">
                                                Use your ARCHI LBO company account.
                                            </p>
                                        </div>
                                        <div className="flex size-11 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--crm-accent)_16%,transparent)] text-[var(--crm-accent)]">
                                            <LockKeyhole size={20} />
                                        </div>
                                    </div>

                                    {status ? (
                                        <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
                                            {status}
                                        </div>
                                    ) : null}
                                </div>

                                <form className="grid gap-4 p-5" onSubmit={handleSubmit}>
                                    <AppTextField
                                        label="Email"
                                        type="email"
                                        value={form.email}
                                        onChange={(value) => updateField('email', value)}
                                        error={errors.email}
                                        placeholder="admin@archilbo.local"
                                        autoComplete="username"
                                    />

                                    <AppTextField
                                        label="Password"
                                        type="password"
                                        value={form.password}
                                        onChange={(value) => updateField('password', value)}
                                        error={errors.password}
                                        placeholder="Your password"
                                        autoComplete="current-password"
                                    />

                                    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-[var(--crm-border)] bg-[var(--crm-elevated)] px-3 py-3">
                                        <span className="flex items-center gap-3 text-sm font-semibold">
                                            <input
                                                type="checkbox"
                                                checked={form.remember}
                                                onChange={(event) => updateField('remember', event.target.checked)}
                                                className="size-4 accent-[var(--crm-accent)]"
                                            />
                                            Remember session
                                        </span>
                                        <ShieldCheck size={16} className="text-[var(--crm-muted)]" />
                                    </label>

                                    <AppButton variant="primary" type="submit" isDisabled={processing}>
                                        {processing ? 'Signing in...' : 'Enter workspace'}
                                        <ArrowRight size={16} />
                                    </AppButton>
                                </form>

                                <div className="border-t border-[var(--crm-border)] bg-black/10 px-5 py-3">
                                    <div className="flex items-center gap-2 text-xs text-[var(--crm-muted)]">
                                        <Mail size={14} />
                                        Local default: admin@archilbo.local / password
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </>
    );
}