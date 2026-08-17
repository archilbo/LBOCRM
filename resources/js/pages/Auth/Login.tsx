import { Head, router } from '@inertiajs/react';
import { IconArrowRight, IconCoin, IconBuilding, IconCircleCheck, IconEye, IconEyeOff, IconFileCheck, IconFolder, IconLock, IconMoon, IconShieldCheck, IconSun } from '@tabler/icons-react';

import { FormEvent, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button, Checkbox, FieldError, Input, Label, TextField } from '@heroui/react';
import { useTranslation } from '@/lib/i18n';
import { useBranding } from '@/hooks/useBranding';
import { cn } from '@/lib/cn';
import { useTheme } from '@/providers/ThemeProvider';

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
    { labelKey: 'auth.login.moduleClientsLabel', valueKey: 'auth.login.moduleClientsValue', icon: IconBuilding },
    { labelKey: 'auth.login.moduleProjectsLabel', valueKey: 'auth.login.moduleProjectsValue', icon: IconFolder },
    { labelKey: 'auth.login.moduleDocumentsLabel', valueKey: 'auth.login.moduleDocumentsValue', icon: IconFileCheck },
    { labelKey: 'auth.login.moduleFinanceLabel', valueKey: 'auth.login.moduleFinanceValue', icon: IconCoin },
];

const checks = [
    'auth.login.checkPrivateCrm',
    'auth.login.checkRoleProtected',
    'auth.login.checkFinanceLock',
    'auth.login.checkLocalStorage',
];

export default function Login({ errors = {}, status }: PageProps) {
    const { t } = useTranslation();
    const branding = useBranding();
    const { theme, toggleTheme } = useTheme();
    const appName = branding.appName || 'ARCHI LBO OS';
    const mobileLogoUrl = theme === 'dark'
        ? (branding.logoDarkUrl ?? branding.logoLightUrl)
        : (branding.logoLightUrl ?? branding.logoDarkUrl);

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
            onSuccess: () => toast.success(t('auth.login.successToast')),
            onError: () => {
                toast.error(t('auth.login.errorToast'));
                setProcessing(false);
            },
            onFinish: () => setProcessing(false),
        });
    }

    return (
        <>
            <Head title={t('auth.login.pageTitle')} />

            <main
                className="fixed inset-0 h-[100dvh] w-screen overflow-hidden bg-[var(--crm-bg)] text-[var(--crm-text)]"
                data-ui-marker={FORCE_LOGIN_REDESIGN_53L ? 'FORCE_LOGIN_REDESIGN_53L' : undefined}
            >
                <div className="grid h-[100dvh] overflow-hidden lg:grid-cols-[minmax(0,1fr)_minmax(560px,640px)]">
                    <section className="login-visual-panel relative hidden h-[100dvh] overflow-hidden bg-[#110e09] p-8 text-white lg:block xl:p-10">
                        <img
                            src="/images/login-architecture-workspace.png"
                            alt=""
                            className="absolute inset-0 h-full w-full object-cover object-center"
                        />
                        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,7,5,0.92)_0%,rgba(8,7,5,0.66)_42%,rgba(8,7,5,0.17)_100%)]" />
                        <div className="absolute inset-x-0 bottom-0 h-[48%] bg-[linear-gradient(0deg,rgba(8,7,5,0.94)_0%,rgba(8,7,5,0.52)_56%,transparent_100%)]" />
                        <div className="relative z-10 flex h-full flex-col">
                            <div className="login-visual-frame flex items-center gap-3 rounded-2xl bg-black/25 px-4 py-3 backdrop-blur-sm">
                                <div className={cn(
                                    'flex size-11 items-center justify-center',
                                    branding.logoDarkUrl ? 'bg-transparent' : 'rounded-xl bg-[var(--crm-accent)] text-black shadow-[0_10px_24px_rgba(234,179,8,0.18)]',
                                )}>
                                    {branding.logoDarkUrl ? (
                                        <img src={branding.logoDarkUrl} alt="" className="size-11 object-contain p-1" />
                                    ) : (
                                        <IconBuilding size={24} />
                                    )}
                                </div>
                                <div>
                                    <p className="text-[16px] font-semibold tracking-[-0.03em]">
                                        {appName === 'ARCHI LBO OS' ? (
                                            <>ARCHI LBO <span className="text-[var(--crm-accent)]">OS</span></>
                                        ) : (
                                            appName
                                        )}
                                    </p>
                                    <p className="mt-0.5 text-xs leading-4 text-[var(--login-visual-muted)]">{t('auth.login.leftPanelTagline')}</p>
                                </div>
                            </div>

                            <div className="login-visual-frame mt-auto max-w-4xl rounded-[28px] bg-black/30 p-6 shadow-2xl backdrop-blur-md xl:p-8">
                                <p className="crm-eyebrow">{t('auth.login.secureWorkspace')}</p>
                                <h1 className="mt-3 max-w-2xl text-[2.5rem] font-semibold leading-[1.04] tracking-[-0.052em] xl:text-[3.25rem]">
                                    {t('auth.login.headline')}
                                </h1>
                                <p className="mt-5 max-w-2xl text-[14px] leading-7 text-[var(--crm-text-muted)]">
                                    {t('auth.login.subheadline')}
                                </p>

                                <div className="mt-7 grid max-w-4xl gap-2 xl:grid-cols-2">
                                    {modules.map((module) => {
                                        const Icon = module.icon;

                                        return (
                                            <div key={module.labelKey} className="login-visual-frame rounded-2xl bg-black/20 px-4 py-3 backdrop-blur-sm">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex size-9 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--crm-accent)_16%,transparent)] text-[var(--crm-accent)]">
                                                        <Icon size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[12px] font-semibold tracking-[-0.015em]">{t(module.labelKey)}</p>
                                                        <p className="mt-0.5 text-xs leading-4 text-[var(--login-visual-muted)]">{t(module.valueKey)}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="mt-6 flex flex-wrap gap-2">
                                    {checks.map((check) => (
                                        <span key={check} className="login-visual-frame inline-flex items-center gap-2 rounded-full bg-black/20 px-3 py-2 text-[10px] font-medium tracking-[-0.01em] text-[var(--login-visual-muted)]">
                                            <IconCircleCheck size={14} className="text-emerald-300" />
                                            {t(check)}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="flex h-[100dvh] items-center justify-center overflow-y-auto bg-[var(--crm-bg)] p-5 sm:p-8 lg:px-10 xl:px-14">
                        <div className="w-full max-w-lg py-4">
                            <div className="mb-8 flex items-center gap-3 lg:hidden">
                                <div className={cn(
                                    'flex size-11 items-center justify-center',
                                    mobileLogoUrl ? 'bg-transparent' : 'rounded-2xl bg-[var(--crm-accent)] text-black',
                                )}>
                                    {mobileLogoUrl ? (
                                        <img src={mobileLogoUrl} alt="" className="size-11 object-contain p-1" />
                                    ) : (
                                        <IconBuilding size={22} />
                                    )}
                                </div>
                                <div>
                                    <p className="text-[16px] font-semibold tracking-[-0.03em]">
                                        {appName === 'ARCHI LBO OS' ? (
                                            <>ARCHI LBO <span className="text-[var(--crm-accent)]">OS</span></>
                                        ) : (
                                            appName
                                        )}
                                    </p>
                                    <p className="mt-0.5 text-xs leading-4 text-[var(--crm-muted)]">{t('auth.login.leftPanelTagline')}</p>
                                </div>
                            </div>

                            <div className="crm-panel overflow-hidden shadow-[0_24px_70px_color-mix(in_srgb,var(--foreground)_18%,transparent)]">
                                <div className="border-b border-[var(--crm-border)] p-6 sm:p-7">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <p className="crm-eyebrow">{t('auth.login.privateAccess')}</p>
                                            <h2 className="mt-3 text-[29px] font-semibold leading-[1.1] tracking-[-0.042em]">{t('auth.login.signIn')}</h2>
                                            <p className="mt-2.5 text-[13px] leading-6 text-[var(--crm-muted)]">
                                                {branding.description || t('auth.login.subtitle')}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                isIconOnly
                                                aria-label={theme === 'dark' ? 'Activer le mode clair' : 'Activer le mode sombre'}
                                                onPress={toggleTheme}
                                                className="size-10 min-w-0 rounded-xl border border-[var(--crm-border)] bg-[var(--crm-elevated)] text-[var(--crm-muted)] hover:border-[color-mix(in_srgb,var(--crm-accent)_42%,var(--crm-border))] hover:text-[var(--crm-accent)]"
                                            >
                                                {theme === 'dark' ? <IconSun size={18} /> : <IconMoon size={18} />}
                                            </Button>
                                            <div className="flex size-11 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--crm-accent)_16%,transparent)] text-[var(--crm-accent)]">
                                                <IconLock size={20} />
                                            </div>
                                        </div>
                                    </div>

                                    {status ? (
                                        <div className="mt-4 rounded-xl border border-[color-mix(in_srgb,var(--success)_28%,var(--crm-border))] bg-[color-mix(in_srgb,var(--success)_10%,transparent)] px-3 py-2 text-sm text-[var(--success)]">
                                            {status}
                                        </div>
                                    ) : null}
                                </div>

                                <form className="grid gap-5 p-6 sm:p-7" onSubmit={handleSubmit}>
                                    <TextField
                                        type="email"
                                        value={form.email}
                                        onChange={(value) => updateField('email', value)}
                                        isInvalid={Boolean(errors.email)}
                                        className="grid gap-1.5"
                                    >
                                        <Label className="text-sm font-medium text-[var(--crm-text)]">{t('auth.login.email')}</Label>
                                        <Input
                                            placeholder={t('auth.login.emailPlaceholder')}
                                            autoComplete="username"
                                            className="h-10 rounded-2xl border border-[var(--crm-border)] bg-[var(--crm-elevated)] px-3 text-sm text-[var(--crm-text)] outline-none transition placeholder:text-[var(--crm-muted)] focus:border-[var(--crm-accent)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--crm-accent)_14%,transparent)]"
                                        />
                                        {errors.email ? <FieldError className="text-xs font-medium text-[var(--crm-danger)]">{errors.email}</FieldError> : null}
                                    </TextField>

                                    <TextField
                                        type={isPasswordVisible ? 'text' : 'password'}
                                        value={form.password}
                                        onChange={(value) => updateField('password', value)}
                                        isInvalid={Boolean(errors.password)}
                                        className="grid gap-1.5"
                                    >
                                        <Label className="text-sm font-medium text-[var(--crm-text)]">{t('auth.login.password')}</Label>
                                        <div className="relative">
                                            <Input
                                                placeholder={t('auth.login.passwordPlaceholder')}
                                                autoComplete="current-password"
                                                className="h-10 w-full rounded-2xl border border-[var(--crm-border)] bg-[var(--crm-elevated)] px-3 pr-11 text-sm text-[var(--crm-text)] outline-none transition placeholder:text-[var(--crm-muted)] focus:border-[var(--crm-accent)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--crm-accent)_14%,transparent)]"
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                isIconOnly
                                                aria-label={isPasswordVisible ? t('auth.login.hidePassword') : t('auth.login.showPassword')}
                                                onPress={() => setIsPasswordVisible((visible) => !visible)}
                                                className="absolute right-1.5 top-1/2 z-10 size-8 min-w-0 -translate-y-1/2 text-[var(--crm-muted)] hover:bg-[var(--crm-elevated)] hover:text-[var(--crm-accent)]"
                                            >
                                                {isPasswordVisible ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                                            </Button>
                                        </div>
                                        {errors.password ? <FieldError className="text-xs font-medium text-[var(--crm-danger)]">{errors.password}</FieldError> : null}
                                    </TextField>

                                    <Checkbox
                                        isSelected={form.remember}
                                        onChange={(checked) => updateField('remember', checked)}
                                        className="flex w-full flex-row items-center justify-between gap-3 rounded-xl border border-[var(--crm-border)] bg-[var(--crm-elevated)] px-3 py-3"
                                    >
                                        <Checkbox.Content className="flex min-w-0 items-center gap-3 text-[12px] font-medium tracking-[-0.01em]">
                                            <Checkbox.Control className="rounded-md border border-[var(--crm-border)] bg-[var(--crm-bg)]">
                                                <Checkbox.Indicator className="text-[var(--crm-accent)]" />
                                            </Checkbox.Control>
                                            <span className="truncate">{t('auth.login.rememberSession')}</span>
                                        </Checkbox.Content>
                                        <IconShieldCheck size={16} className="shrink-0 text-[var(--crm-muted)]" />
                                    </Checkbox>

                                    <a href="/forgot-password" className="-mt-2 text-right text-xs font-medium text-[var(--crm-accent)] hover:underline">
                                        {t('auth.login.forgotPassword')}
                                    </a>

                                    <Button
                                        type="submit"
                                        variant="primary"
                                        isDisabled={processing}
                                        className="h-11 w-full rounded-xl text-sm font-semibold"
                                    >
                                        {processing ? t('auth.login.signingIn') : t('auth.login.enterWorkspace')}
                                        <IconArrowRight size={16} />
                                    </Button>
                                </form>

                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </>
    );
}
