import { Head, router } from '@inertiajs/react';
import { IconArrowRight, IconCoin, IconBuilding, IconCircleCheck, IconEye, IconEyeOff, IconFileCheck, IconFolder, IconLock, IconMail, IconShieldCheck } from '@tabler/icons-react';

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
    { label: 'Clients', value: 'Identity and contacts', icon: IconBuilding },
    { label: 'Projects', value: 'Architecture workflow', icon: IconFolder },
    { label: 'Documents', value: 'Files and missing pieces', icon: IconFileCheck },
    { label: 'Finance', value: 'Quotes, invoices, receipts', icon: IconCoin },
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
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

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
                <div className="grid h-[100dvh] overflow-hidden lg:grid-cols-[minmax(0,1fr)_minmax(560px,640px)]">
                    <section className="relative hidden h-[100dvh] overflow-hidden border-r border-[var(--crm-border)] bg-[#110e09] p-8 lg:block xl:p-10">
                        <img
                            src="/images/login-architecture-workspace.png"
                            alt=""
                            className="absolute inset-0 h-full w-full object-cover object-center"
                        />
                        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,7,5,0.92)_0%,rgba(8,7,5,0.66)_42%,rgba(8,7,5,0.17)_100%)]" />
                        <div className="absolute inset-x-0 bottom-0 h-[48%] bg-[linear-gradient(0deg,rgba(8,7,5,0.94)_0%,rgba(8,7,5,0.52)_56%,transparent_100%)]" />
                        <div className="relative z-10 flex h-full flex-col">
                            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/25 px-4 py-3 backdrop-blur-sm">
                                <div className="flex size-11 items-center justify-center rounded-xl bg-[var(--crm-accent)] text-black shadow-[0_10px_24px_rgba(234,179,8,0.18)]">
                                    <IconBuilding size={24} />
                                </div>
                                <div>
                                    <p className="text-[16px] font-semibold tracking-[-0.03em]">ARCHI LBO <span className="text-[var(--crm-accent)]">OS</span></p>
                                    <p className="mt-0.5 text-xs leading-4 text-[var(--crm-muted)]">Architecture office operating system</p>
                                </div>
                            </div>

                            <div className="mt-auto max-w-4xl rounded-[28px] border border-white/10 bg-black/30 p-6 shadow-2xl backdrop-blur-md xl:p-8">
                                <p className="crm-eyebrow">Secure workspace</p>
                                <h1 className="mt-3 max-w-2xl text-[2.5rem] font-semibold leading-[1.04] tracking-[-0.052em] xl:text-[3.25rem]">
                                    One command center for projects, documents, finance and archive.
                                </h1>
                                <p className="mt-5 max-w-2xl text-[14px] leading-7 text-[var(--crm-text-muted)]">
                                    Internal CRM access for managing client files from request to authorization, billing, payment and physical archive.
                                </p>

                                <div className="mt-7 grid max-w-4xl gap-2 xl:grid-cols-2">
                                    {modules.map((module) => {
                                        const Icon = module.icon;

                                        return (
                                            <div key={module.label} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 backdrop-blur-sm">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex size-9 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--crm-accent)_16%,transparent)] text-[var(--crm-accent)]">
                                                        <Icon size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[12px] font-semibold tracking-[-0.015em]">{module.label}</p>
                                                        <p className="mt-0.5 text-xs leading-4 text-[var(--crm-muted)]">{module.value}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="mt-6 flex flex-wrap gap-2">
                                    {checks.map((check) => (
                                        <span key={check} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-2 text-[10px] font-medium tracking-[-0.01em] text-[var(--crm-text-muted)]">
                                            <IconCircleCheck size={14} className="text-emerald-300" />
                                            {check}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="flex h-[100dvh] items-center justify-center overflow-y-auto bg-[var(--crm-bg)] p-5 sm:p-8 lg:px-10 xl:px-14">
                        <div className="w-full max-w-lg py-4">
                            <div className="mb-8 flex items-center gap-3 lg:hidden">
                                <div className="flex size-11 items-center justify-center rounded-2xl bg-[var(--crm-accent)] text-black">
                                    <IconBuilding size={22} />
                                </div>
                                <div>
                                    <p className="text-[16px] font-semibold tracking-[-0.03em]">ARCHI LBO <span className="text-[var(--crm-accent)]">OS</span></p>
                                    <p className="mt-0.5 text-xs leading-4 text-[var(--crm-muted)]">Architecture office operating system</p>
                                </div>
                            </div>

                            <div className="crm-panel overflow-hidden shadow-[0_24px_70px_rgba(0,0,0,0.28)]">
                                <div className="border-b border-[var(--crm-border)] p-6 sm:p-7">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <p className="crm-eyebrow">Private access</p>
                                            <h2 className="mt-3 text-[29px] font-semibold leading-[1.1] tracking-[-0.042em]">Sign in</h2>
                                            <p className="mt-2.5 text-[13px] leading-6 text-[var(--crm-muted)]">
                                                Use your ARCHI LBO company account.
                                            </p>
                                        </div>
                                        <div className="flex size-11 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--crm-accent)_16%,transparent)] text-[var(--crm-accent)]">
                                            <IconLock size={20} />
                                        </div>
                                    </div>

                                    {status ? (
                                        <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
                                            {status}
                                        </div>
                                    ) : null}
                                </div>

                                <form className="grid gap-5 p-6 sm:p-7" onSubmit={handleSubmit}>
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
                                        type={isPasswordVisible ? 'text' : 'password'}
                                        value={form.password}
                                        onChange={(value) => updateField('password', value)}
                                        error={errors.password}
                                        placeholder="Your password"
                                        autoComplete="current-password"
                                        endContent={
                                            <AppButton
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                isIconOnly
                                                aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
                                                className="size-8 min-w-0 text-[var(--crm-muted)] hover:bg-[var(--crm-elevated)] hover:text-[var(--crm-accent)]"
                                                onPress={() => setIsPasswordVisible((visible) => !visible)}
                                            >
                                                {isPasswordVisible ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                                            </AppButton>
                                        }
                                    />

                                    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-[var(--crm-border)] bg-[var(--crm-elevated)] px-3 py-3">
                                        <span className="flex items-center gap-3 text-[12px] font-medium tracking-[-0.01em]">
                                            <input
                                                type="checkbox"
                                                checked={form.remember}
                                                onChange={(event) => updateField('remember', event.target.checked)}
                                                className="size-4 accent-[var(--crm-accent)]"
                                            />
                                            Remember session
                                        </span>
                                        <IconShieldCheck size={16} className="text-[var(--crm-muted)]" />
                                    </label>

                                    <AppButton variant="primary" type="submit" isDisabled={processing}>
                                        {processing ? 'Signing in...' : 'Enter workspace'}
                                        <IconArrowRight size={16} />
                                    </AppButton>
                                </form>

                                <div className="border-t border-[var(--crm-border)] bg-black/10 px-6 py-4 sm:px-7">
                                    <div className="flex items-center gap-2 text-[10px] leading-4 text-[var(--crm-muted)]">
                                        <IconMail size={14} />
                                        Local account password is configured in `.env`.
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
