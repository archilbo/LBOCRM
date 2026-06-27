import { Head, router, usePage } from '@inertiajs/react';
import {
    Banknote,
    Building2,
    Calculator,
    FileText,
    RotateCcw,
    Save,
    Settings,
    Upload,
} from 'lucide-react';
import { type ChangeEvent, type FormEvent, type ReactNode, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { AppShell } from '@/components/layout/AppShell';

type FinanceSettingsForm = {
    finance: {
        defaultTvaRate: string;
        defaultCurrency: string;
        defaultPaymentTermsDays: string;
        defaultQuoteValidityDays: string;
        defaultUnitPriceM2: string;
        defaultArchitectRate: string;
    };
    company: {
        companyName: string;
        companyAddress: string;
        companyPhone: string;
        companyEmail: string;
        companyIce: string;
        companyTva: string;
        companyPatente: string;
        companyCnss: string;
        companyLogoPath: string;
        companyLogoUrl?: string;
    };
    bank: {
        bankName: string;
        bankRib: string;
    };
};

type PageProps = {
    settings: {
        finance: {
            defaultTvaRate: number | string;
            defaultCurrency: string;
            defaultPaymentTermsDays: number | string;
            defaultQuoteValidityDays: number | string;
            defaultUnitPriceM2: number | string;
            defaultArchitectRate: number | string;
        };
        company: {
            companyName: string;
            companyAddress: string;
            companyPhone: string;
            companyEmail: string;
            companyIce: string;
            companyTva: string;
            companyPatente: string;
            companyCnss: string;
            companyLogoPath: string;
            companyLogoUrl?: string;
        };
        bank: {
            bankName: string;
            bankRib: string;
        };
    };
    routes: {
        update: string;
        reset: string;
        templates: string;
        finance: string;
        uploadLogo: string;
        deleteLogo: string;
    };
    errors?: Record<string, string>;
};

function toStringValue(value: unknown): string {
    return value === null || value === undefined ? '' : String(value);
}

function fromSettings(settings: PageProps['settings']): FinanceSettingsForm {
    return {
        finance: {
            defaultTvaRate: toStringValue(settings.finance.defaultTvaRate),
            defaultCurrency: toStringValue(settings.finance.defaultCurrency || 'MAD'),
            defaultPaymentTermsDays: toStringValue(settings.finance.defaultPaymentTermsDays),
            defaultQuoteValidityDays: toStringValue(settings.finance.defaultQuoteValidityDays),
            defaultUnitPriceM2: toStringValue(settings.finance.defaultUnitPriceM2),
            defaultArchitectRate: toStringValue(settings.finance.defaultArchitectRate),
        },
        company: {
            companyName: toStringValue(settings.company.companyName),
            companyAddress: toStringValue(settings.company.companyAddress),
            companyPhone: toStringValue(settings.company.companyPhone),
            companyEmail: toStringValue(settings.company.companyEmail),
            companyIce: toStringValue(settings.company.companyIce),
            companyTva: toStringValue(settings.company.companyTva),
            companyPatente: toStringValue(settings.company.companyPatente),
            companyCnss: toStringValue(settings.company.companyCnss),
            companyLogoPath: toStringValue(settings.company.companyLogoPath),
            companyLogoUrl: toStringValue(settings.company.companyLogoUrl),
        },
        bank: {
            bankName: toStringValue(settings.bank.bankName),
            bankRib: toStringValue(settings.bank.bankRib),
        },
    };
}

function toPayload(form: FinanceSettingsForm) {
    return {
        finance: {
            default_tva_rate: form.finance.defaultTvaRate,
            default_currency: form.finance.defaultCurrency,
            default_payment_terms_days: form.finance.defaultPaymentTermsDays,
            default_quote_validity_days: form.finance.defaultQuoteValidityDays,
            default_unit_price_m2: form.finance.defaultUnitPriceM2,
            default_architect_rate: form.finance.defaultArchitectRate,
        },
        company: {
            company_name: form.company.companyName,
            company_address: form.company.companyAddress,
            company_phone: form.company.companyPhone,
            company_email: form.company.companyEmail,
            company_ice: form.company.companyIce,
            company_tva: form.company.companyTva,
            company_patente: form.company.companyPatente,
            company_cnss: form.company.companyCnss,
            company_logo_path: form.company.companyLogoPath,
        },
        bank: {
            bank_name: form.bank.bankName,
            bank_rib: form.bank.bankRib,
        },
    };
}

function sameForm(a: FinanceSettingsForm, b: FinanceSettingsForm): boolean {
    return JSON.stringify(a) === JSON.stringify(b);
}

function Field({
    label,
    value,
    onChange,
    error,
    type = 'text',
    placeholder,
    help,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    type?: string;
    placeholder?: string;
    help?: string;
}) {
    return (
        <label className="block min-w-0">
            <span className="mb-1.5 block text-xs font-semibold text-[var(--text)]">{label}</span>

            <input
                type={type}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                className={[
                    'h-10 w-full rounded-2xl border bg-[var(--surface)] px-3 text-sm text-[var(--text)] outline-none transition',
                    'border-[var(--border)] hover:border-[var(--accent)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--accent)_20%,transparent)]',
                    error ? 'border-red-500/70' : '',
                ].join(' ')}
            />

            {help ? <span className="mt-1 block text-xs text-[var(--text-muted)]">{help}</span> : null}
            {error ? <span className="mt-1 block text-xs font-medium text-red-500">{error}</span> : null}
        </label>
    );
}

function TextArea({
    label,
    value,
    onChange,
    error,
    placeholder,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    placeholder?: string;
}) {
    return (
        <label className="block min-w-0">
            <span className="mb-1.5 block text-xs font-semibold text-[var(--text)]">{label}</span>

            <textarea
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                rows={4}
                className={[
                    'w-full resize-y rounded-2xl border bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] outline-none transition',
                    'border-[var(--border)] hover:border-[var(--accent)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--accent)_20%,transparent)]',
                    error ? 'border-red-500/70' : '',
                ].join(' ')}
            />

            {error ? <span className="mt-1 block text-xs font-medium text-red-500">{error}</span> : null}
        </label>
    );
}

function Section({
    icon,
    title,
    description,
    children,
}: {
    icon: ReactNode;
    title: string;
    description: string;
    children: ReactNode;
}) {
    return (
        <section className="rounded-2xl border bg-[var(--surface)] p-4">
            <div className="mb-4 flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] text-[var(--accent)]">
                    {icon}
                </div>

                <div>
                    <h2 className="text-sm font-semibold">{title}</h2>
                    <p className="mt-1 text-sm text-[var(--text-muted)]">{description}</p>
                </div>
            </div>

            {children}
        </section>
    );
}

export default function FinanceSettingsIndex({ settings, routes }: PageProps) {
    const { errors = {} } = usePage<PageProps>().props;

    const initialForm = useMemo(() => fromSettings(settings), [settings]);

    const [form, setForm] = useState<FinanceSettingsForm>(initialForm);
    const [processing, setProcessing] = useState(false);

    const isDirty = useMemo(() => !sameForm(form, initialForm), [form, initialForm]);

    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
                event.preventDefault();

                if (isDirty && !processing) {
                    save();
                }
            }
        }

        window.addEventListener('keydown', handleKeyDown);

        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [form, isDirty, processing]);

    function updateFinance(key: keyof FinanceSettingsForm['finance'], value: string) {
        setForm((current) => ({
            ...current,
            finance: {
                ...current.finance,
                [key]: value,
            },
        }));
    }

    function updateCompany(key: keyof FinanceSettingsForm['company'], value: string) {
        setForm((current) => ({
            ...current,
            company: {
                ...current.company,
                [key]: value,
            },
        }));
    }

    function updateBank(key: keyof FinanceSettingsForm['bank'], value: string) {
        setForm((current) => ({
            ...current,
            bank: {
                ...current.bank,
                [key]: value,
            },
        }));
    }

    function save(event?: FormEvent<HTMLFormElement>) {
        event?.preventDefault();

        setProcessing(true);

        router.put(routes.update, toPayload(form), {
            preserveScroll: true,
            onSuccess: () => toast.success('Finance settings saved.'),
            onError: () => toast.error('Please check the settings form.'),
            onFinish: () => setProcessing(false),
        });
    }

    function resetDefaults() {
        if (!window.confirm('Reset finance defaults? Company and bank information will not be changed.')) {
            return;
        }

        router.put(
            routes.reset,
            {},
            {
                preserveScroll: true,
                onSuccess: () => toast.success('Finance defaults reset.'),
                onError: () => toast.error('Could not reset finance defaults.'),
            },
        );
    }

    function uploadLogo(event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        const formData = new FormData();
        formData.append('logo', file);

        router.post(routes.uploadLogo, formData, {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => toast.success('Logo uploaded.'),
            onError: () => toast.error('Could not upload logo.'),
            onFinish: () => {
                event.target.value = '';
            },
        });
    }

    function deleteLogo() {
        if (!window.confirm('Remove company logo?')) {
            return;
        }

        router.delete(routes.deleteLogo, {
            preserveScroll: true,
            onSuccess: () => toast.success('Logo removed.'),
            onError: () => toast.error('Could not remove logo.'),
        });
    }

    return (
        <>
            <Head title="Finance Settings" />

            <AppShell
                eyebrowKey="financeWorkspace.eyebrow"
                titleKey="financeWorkspace.title"
                subtitleKey="financeWorkspace.subtitle"
            >
                <form className="space-y-4 px-3 py-3 lg:px-4" onSubmit={save}>
                    <div className="rounded-2xl border bg-[var(--surface)] p-4">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div className="min-w-0">
                                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                                    <Settings size={14} />
                                    Finance Settings
                                </div>

                                <h1 className="mt-2 text-2xl font-semibold tracking-tight">
                                    Company and finance defaults
                                </h1>

                                <p className="mt-1 max-w-2xl text-sm text-[var(--text-muted)]">
                                    Manage TVA, currency, company legal information, bank details and defaults used in Devis, Factures and PDF templates.
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                {isDirty ? (
                                    <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs font-bold text-amber-500">
                                        Unsaved changes
                                    </span>
                                ) : null}

                                <button
                                    type="button"
                                    onClick={() => router.visit(routes.templates)}
                                    className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl border bg-[var(--surface)] px-4 text-sm font-semibold text-[var(--text-muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                                >
                                    <FileText size={16} />
                                    Templates
                                </button>

                                <button
                                    type="button"
                                    onClick={resetDefaults}
                                    className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl border bg-[var(--surface)] px-4 text-sm font-semibold text-[var(--text-muted)] transition hover:border-amber-500 hover:text-amber-500"
                                >
                                    <RotateCcw size={16} />
                                    Reset
                                </button>

                                <button
                                    type="submit"
                                    disabled={!isDirty || processing}
                                    className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl bg-[var(--accent)] px-4 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    <Save size={16} />
                                    {processing ? 'Saving...' : 'Save settings'}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
                        <div className="space-y-4">
                            <Section
                                icon={<Calculator size={18} />}
                                title="Finance defaults"
                                description="Used by the finance builder for TVA, due dates and automatic calculations."
                            >
                                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                                    <Field
                                        label="Default TVA rate (%)"
                                        type="number"
                                        value={form.finance.defaultTvaRate}
                                        onChange={(value) => updateFinance('defaultTvaRate', value)}
                                        error={errors['finance.default_tva_rate']}
                                    />

                                    <Field
                                        label="Currency"
                                        value={form.finance.defaultCurrency}
                                        onChange={(value) => updateFinance('defaultCurrency', value)}
                                        error={errors['finance.default_currency']}
                                        placeholder="MAD"
                                    />

                                    <Field
                                        label="Payment terms days"
                                        type="number"
                                        value={form.finance.defaultPaymentTermsDays}
                                        onChange={(value) => updateFinance('defaultPaymentTermsDays', value)}
                                        error={errors['finance.default_payment_terms_days']}
                                    />

                                    <Field
                                        label="Quote validity days"
                                        type="number"
                                        value={form.finance.defaultQuoteValidityDays}
                                        onChange={(value) => updateFinance('defaultQuoteValidityDays', value)}
                                        error={errors['finance.default_quote_validity_days']}
                                    />

                                    <Field
                                        label="Default unit price/mÂ²"
                                        type="number"
                                        value={form.finance.defaultUnitPriceM2}
                                        onChange={(value) => updateFinance('defaultUnitPriceM2', value)}
                                        error={errors['finance.default_unit_price_m2']}
                                    />

                                    <Field
                                        label="Default architect rate (%)"
                                        type="number"
                                        value={form.finance.defaultArchitectRate}
                                        onChange={(value) => updateFinance('defaultArchitectRate', value)}
                                        error={errors['finance.default_architect_rate']}
                                    />
                                </div>
                            </Section>

                            <Section
                                icon={<Building2 size={18} />}
                                title="Company information"
                                description="Used in template headers, legal footers and generated PDF documents."
                            >
                                <div className="grid gap-3 md:grid-cols-2">
                                    <Field
                                        label="Company name"
                                        value={form.company.companyName}
                                        onChange={(value) => updateCompany('companyName', value)}
                                        error={errors['company.company_name']}
                                    />

                                    <Field
                                        label="Company email"
                                        type="email"
                                        value={form.company.companyEmail}
                                        onChange={(value) => updateCompany('companyEmail', value)}
                                        error={errors['company.company_email']}
                                    />

                                    <Field
                                        label="Company phone"
                                        value={form.company.companyPhone}
                                        onChange={(value) => updateCompany('companyPhone', value)}
                                        error={errors['company.company_phone']}
                                    />

                                    <Field
                                        label="Logo path"
                                        value={form.company.companyLogoPath}
                                        onChange={(value) => updateCompany('companyLogoPath', value)}
                                        error={errors['company.company_logo_path']}
                                        help="Use a public URL or upload the logo below."
                                    />

                                    <div className="md:col-span-2 rounded-2xl border bg-[var(--surface-2)] p-3">
                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                            <div>
                                                <p className="text-sm font-semibold">Company logo</p>
                                                <p className="mt-1 text-xs text-[var(--text-muted)]">
                                                    Upload PNG, JPG, WEBP or SVG. Use {'{{company.logo_html}}'} inside templates.
                                                </p>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-2">
                                                <label className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[var(--accent)] px-4 text-sm font-semibold text-white transition hover:opacity-90">
                                                    <Upload size={16} />
                                                    Upload logo
                                                    <input
                                                        type="file"
                                                        accept=".png,.jpg,.jpeg,.webp,.svg"
                                                        className="hidden"
                                                        onChange={uploadLogo}
                                                    />
                                                </label>

                                                {form.company.companyLogoPath ? (
                                                    <button
                                                        type="button"
                                                        onClick={deleteLogo}
                                                        className="inline-flex h-10 items-center justify-center rounded-2xl border px-4 text-sm font-semibold text-red-500 transition hover:border-red-500"
                                                    >
                                                        Remove
                                                    </button>
                                                ) : null}
                                            </div>
                                        </div>

                                        {form.company.companyLogoUrl ? (
                                            <div className="mt-3 flex items-center gap-3 rounded-xl border bg-[var(--surface)] p-3">
                                                <img
                                                    src={form.company.companyLogoUrl}
                                                    alt="Company logo"
                                                    className="h-12 w-12 rounded-xl object-contain"
                                                />

                                                <div className="min-w-0">
                                                    <p className="text-xs font-semibold">Current logo</p>
                                                    <p className="mt-1 truncate text-xs text-[var(--text-muted)]">
                                                        {form.company.companyLogoPath}
                                                    </p>
                                                </div>
                                            </div>
                                        ) : form.company.companyLogoPath ? (
                                            <div className="mt-3 rounded-xl border bg-[var(--surface)] p-3 text-xs text-[var(--text-muted)]">
                                                Current path: {form.company.companyLogoPath}
                                            </div>
                                        ) : null}
                                    </div>

                                    <div className="md:col-span-2">
                                        <TextArea
                                            label="Company address"
                                            value={form.company.companyAddress}
                                            onChange={(value) => updateCompany('companyAddress', value)}
                                            error={errors['company.company_address']}
                                        />
                                    </div>

                                    <Field
                                        label="ICE"
                                        value={form.company.companyIce}
                                        onChange={(value) => updateCompany('companyIce', value)}
                                        error={errors['company.company_ice']}
                                    />

                                    <Field
                                        label="TVA"
                                        value={form.company.companyTva}
                                        onChange={(value) => updateCompany('companyTva', value)}
                                        error={errors['company.company_tva']}
                                    />

                                    <Field
                                        label="Patente"
                                        value={form.company.companyPatente}
                                        onChange={(value) => updateCompany('companyPatente', value)}
                                        error={errors['company.company_patente']}
                                    />

                                    <Field
                                        label="CNSS"
                                        value={form.company.companyCnss}
                                        onChange={(value) => updateCompany('companyCnss', value)}
                                        error={errors['company.company_cnss']}
                                    />
                                </div>
                            </Section>

                            <Section
                                icon={<Banknote size={18} />}
                                title="Bank information"
                                description="Used in documents when bank transfer details are needed."
                            >
                                <div className="grid gap-3 md:grid-cols-2">
                                    <Field
                                        label="Bank name"
                                        value={form.bank.bankName}
                                        onChange={(value) => updateBank('bankName', value)}
                                        error={errors['bank.bank_name']}
                                    />

                                    <Field
                                        label="RIB"
                                        value={form.bank.bankRib}
                                        onChange={(value) => updateBank('bankRib', value)}
                                        error={errors['bank.bank_rib']}
                                    />
                                </div>
                            </Section>
                        </div>

                        <aside className="space-y-4">
                            <section className="sticky top-20 rounded-2xl border bg-[var(--surface)] p-4">
                                <div className="mb-4 flex items-center gap-2">
                                    <div className="flex size-9 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] text-[var(--accent)]">
                                        <FileText size={17} />
                                    </div>

                                    <div>
                                        <h2 className="text-sm font-semibold">Document impact</h2>
                                        <p className="text-xs text-[var(--text-muted)]">Preview of values used by templates.</p>
                                    </div>
                                </div>

                                <div className="space-y-3 text-sm">
                                    <div className="rounded-2xl bg-[var(--surface-2)] p-3">
                                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                                            Company
                                        </p>
                                        <p className="mt-2 font-semibold">{form.company.companyName || '-'}</p>
                                        <p className="mt-1 text-xs text-[var(--text-muted)]">{form.company.companyAddress || '-'}</p>
                                        <p className="mt-1 text-xs text-[var(--text-muted)]">
                                            {form.company.companyEmail || '-'} / {form.company.companyPhone || '-'}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="rounded-2xl bg-[var(--surface-2)] p-3">
                                            <p className="text-xs text-[var(--text-muted)]">TVA</p>
                                            <p className="mt-1 text-lg font-semibold">{form.finance.defaultTvaRate || 0}%</p>
                                        </div>

                                        <div className="rounded-2xl bg-[var(--surface-2)] p-3">
                                            <p className="text-xs text-[var(--text-muted)]">Currency</p>
                                            <p className="mt-1 text-lg font-semibold">{form.finance.defaultCurrency || 'MAD'}</p>
                                        </div>
                                    </div>

                                    <div className="rounded-2xl bg-[var(--surface-2)] p-3">
                                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                                            Legal footer
                                        </p>
                                        <p className="mt-2 text-xs leading-5">
                                            ICE: {form.company.companyIce || '-'} Â· CNSS: {form.company.companyCnss || '-'} Â· Patente: {form.company.companyPatente || '-'} Â· TVA: {form.company.companyTva || '-'}
                                        </p>
                                    </div>

                                    <div className="rounded-2xl bg-[var(--surface-2)] p-3">
                                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                                            Bank
                                        </p>
                                        <p className="mt-2 text-xs leading-5">
                                            {form.bank.bankName || 'No bank selected'}<br />
                                            {form.bank.bankRib || 'No RIB'}
                                        </p>
                                    </div>
                                </div>
                            </section>
                        </aside>
                    </div>
                </form>
            </AppShell>
        </>
    );
}