import { Head, router, usePage } from '@inertiajs/react';
import {
    Banknote,
    Building2,
    Calculator,
    FileText,
    ImageIcon,
    RotateCcw,
    Save,
    Settings,
    Upload,
} from 'lucide-react';
import { type ChangeEvent, type FormEvent, type ReactNode, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { AppShell } from '@/components/layout/AppShell';
import { AppButton } from '@/components/ui/AppButton';

const FORCE_FINANCE_SETTINGS_REDESIGN_53O = true;

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
            <span className="mb-1.5 block text-xs font-bold text-[var(--crm-text)]">{label}</span>
            <input
                type={type}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                className={[
                    'h-11 w-full rounded-xl border border-[var(--crm-border)] bg-[var(--crm-elevated)] px-3 text-sm text-[var(--crm-text)] outline-none transition',
                    'hover:border-[color-mix(in_srgb,var(--crm-accent)_45%,var(--crm-border))] focus:border-[var(--crm-accent)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--crm-accent)_18%,transparent)]',
                    error ? 'border-red-500/70' : '',
                ].join(' ')}
            />
            {help ? <span className="mt-1 block text-xs text-[var(--crm-muted)]">{help}</span> : null}
            {error ? <span className="mt-1 block text-xs font-semibold text-red-400">{error}</span> : null}
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
            <span className="mb-1.5 block text-xs font-bold text-[var(--crm-text)]">{label}</span>
            <textarea
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                rows={4}
                className={[
                    'w-full resize-y rounded-xl border border-[var(--crm-border)] bg-[var(--crm-elevated)] px-3 py-2 text-sm text-[var(--crm-text)] outline-none transition',
                    'hover:border-[color-mix(in_srgb,var(--crm-accent)_45%,var(--crm-border))] focus:border-[var(--crm-accent)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--crm-accent)_18%,transparent)]',
                    error ? 'border-red-500/70' : '',
                ].join(' ')}
            />
            {error ? <span className="mt-1 block text-xs font-semibold text-red-400">{error}</span> : null}
        </label>
    );
}

function Section({
    icon: Icon,
    title,
    description,
    children,
}: {
    icon: typeof Settings;
    title: string;
    description: string;
    children: ReactNode;
}) {
    return (
        <section className="crm-panel overflow-hidden">
            <div className="flex items-start gap-3 border-b border-[var(--crm-border)] px-5 py-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--crm-accent)_16%,transparent)] text-[var(--crm-accent)]">
                    <Icon size={18} />
                </div>
                <div className="min-w-0">
                    <h2 className="text-sm font-black text-[var(--crm-text)]">{title}</h2>
                    <p className="mt-1 text-xs text-[var(--crm-muted)]">{description}</p>
                </div>
            </div>
            <div className="p-5">{children}</div>
        </section>
    );
}

function PreviewTile({ label, value }: { label: string; value: ReactNode }) {
    return (
        <div className="rounded-xl border border-[var(--crm-border)] bg-[var(--crm-elevated)] p-3">
            <p className="crm-kpi-label">{label}</p>
            <div className="mt-2 text-sm font-black text-[var(--crm-text)]">{value || '-'}</div>
        </div>
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
        setForm((current) => ({ ...current, finance: { ...current.finance, [key]: value } }));
    }

    function updateCompany(key: keyof FinanceSettingsForm['company'], value: string) {
        setForm((current) => ({ ...current, company: { ...current.company, [key]: value } }));
    }

    function updateBank(key: keyof FinanceSettingsForm['bank'], value: string) {
        setForm((current) => ({ ...current, bank: { ...current.bank, [key]: value } }));
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

        router.put(routes.reset, {}, {
            preserveScroll: true,
            onSuccess: () => toast.success('Finance defaults reset.'),
            onError: () => toast.error('Could not reset finance defaults.'),
        });
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
                action={
                    <div className="flex flex-wrap gap-2">
                        <AppButton variant="secondary" onPress={() => router.visit(routes.templates)}>
                            <FileText size={16} />
                            Templates
                        </AppButton>
                        <AppButton variant="primary" type="submit" form="finance-settings-form" isDisabled={!isDirty || processing}>
                            <Save size={16} />
                            {processing ? 'Saving...' : 'Save'}
                        </AppButton>
                    </div>
                }
            >
                <form
                    id="finance-settings-form"
                    className="crm-page mx-auto max-w-[1540px] pt-6 xl:pt-8"
                    data-ui-marker={FORCE_FINANCE_SETTINGS_REDESIGN_53O ? 'FORCE_FINANCE_SETTINGS_REDESIGN_53O' : undefined}
                    onSubmit={save}
                >
                    <section className="crm-panel overflow-hidden shadow-[0_18px_60px_rgba(0,0,0,0.24)]">
                        <div className="flex flex-wrap items-start justify-between gap-4 p-5">
                            <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                    <Settings size={15} className="text-[var(--crm-accent)]" />
                                    <p className="crm-eyebrow">Finance settings</p>
                                </div>
                                <h1 className="mt-2 text-2xl font-black tracking-tight text-[var(--crm-text)]">
                                    Company and finance defaults
                                </h1>
                                <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--crm-muted)]">
                                    Manage TVA, currency, company legal information, logo, bank details and default values used in Devis, Factures and PDF templates.
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                {isDirty ? (
                                    <span className="rounded-full border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-xs font-black text-amber-300">
                                        Unsaved changes
                                    </span>
                                ) : (
                                    <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-xs font-black text-emerald-300">
                                        Saved
                                    </span>
                                )}

                                <button type="button" onClick={resetDefaults} className="crm-action-button py-3 text-amber-300">
                                    <RotateCcw size={15} />
                                    Reset finance
                                </button>
                            </div>
                        </div>
                    </section>

                    <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
                        <main className="grid min-w-0 gap-5">
                            <Section
                                icon={Calculator}
                                title="Finance defaults"
                                description="Used by the finance builder for TVA, due dates and automatic calculations."
                            >
                                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                    <Field label="Default TVA rate (%)" type="number" value={form.finance.defaultTvaRate} onChange={(value) => updateFinance('defaultTvaRate', value)} error={errors['finance.default_tva_rate']} />
                                    <Field label="Currency" value={form.finance.defaultCurrency} onChange={(value) => updateFinance('defaultCurrency', value)} error={errors['finance.default_currency']} placeholder="MAD" />
                                    <Field label="Payment terms days" type="number" value={form.finance.defaultPaymentTermsDays} onChange={(value) => updateFinance('defaultPaymentTermsDays', value)} error={errors['finance.default_payment_terms_days']} />
                                    <Field label="Quote validity days" type="number" value={form.finance.defaultQuoteValidityDays} onChange={(value) => updateFinance('defaultQuoteValidityDays', value)} error={errors['finance.default_quote_validity_days']} />
                                    <Field label="Default unit price/m2" type="number" value={form.finance.defaultUnitPriceM2} onChange={(value) => updateFinance('defaultUnitPriceM2', value)} error={errors['finance.default_unit_price_m2']} />
                                    <Field label="Default architect rate (%)" type="number" value={form.finance.defaultArchitectRate} onChange={(value) => updateFinance('defaultArchitectRate', value)} error={errors['finance.default_architect_rate']} />
                                </div>
                            </Section>

                            <Section
                                icon={Building2}
                                title="Company information"
                                description="Used in template headers, legal footers and generated PDF documents."
                            >
                                <div className="grid gap-4 md:grid-cols-2">
                                    <Field label="Company name" value={form.company.companyName} onChange={(value) => updateCompany('companyName', value)} error={errors['company.company_name']} />
                                    <Field label="Company email" type="email" value={form.company.companyEmail} onChange={(value) => updateCompany('companyEmail', value)} error={errors['company.company_email']} />
                                    <Field label="Company phone" value={form.company.companyPhone} onChange={(value) => updateCompany('companyPhone', value)} error={errors['company.company_phone']} />
                                    <Field label="Logo path" value={form.company.companyLogoPath} onChange={(value) => updateCompany('companyLogoPath', value)} error={errors['company.company_logo_path']} help="Use a public URL or upload the logo below." />

                                    <div className="md:col-span-2 rounded-xl border border-[var(--crm-border)] bg-[var(--crm-elevated)] p-4">
                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                            <div className="flex items-start gap-3">
                                                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--crm-accent)_16%,transparent)] text-[var(--crm-accent)]">
                                                    <ImageIcon size={18} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black">Company logo</p>
                                                    <p className="mt-1 text-xs text-[var(--crm-muted)]">
                                                        Upload PNG, JPG, WEBP or SVG. Use {'{{company.logo_html}}'} inside templates.
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-2">
                                                <label className="crm-action-button cursor-pointer border-[var(--crm-accent)] bg-[color-mix(in_srgb,var(--crm-accent)_18%,transparent)] py-3 text-[var(--crm-accent)]">
                                                    <Upload size={15} />
                                                    Upload logo
                                                    <input type="file" accept=".png,.jpg,.jpeg,.webp,.svg" className="hidden" onChange={uploadLogo} />
                                                </label>

                                                {form.company.companyLogoPath ? (
                                                    <button type="button" onClick={deleteLogo} className="crm-action-button py-3 text-red-300">
                                                        Remove
                                                    </button>
                                                ) : null}
                                            </div>
                                        </div>

                                        {form.company.companyLogoUrl ? (
                                            <div className="mt-4 flex items-center gap-3 rounded-xl border border-[var(--crm-border)] bg-black/20 p-3">
                                                <img src={form.company.companyLogoUrl} alt="Company logo" className="h-12 w-12 rounded-xl object-contain" />
                                                <div className="min-w-0">
                                                    <p className="text-xs font-black">Current logo</p>
                                                    <p className="mt-1 truncate text-xs text-[var(--crm-muted)]">{form.company.companyLogoPath}</p>
                                                </div>
                                            </div>
                                        ) : form.company.companyLogoPath ? (
                                            <div className="mt-4 rounded-xl border border-[var(--crm-border)] bg-black/20 p-3 text-xs text-[var(--crm-muted)]">
                                                Current path: {form.company.companyLogoPath}
                                            </div>
                                        ) : null}
                                    </div>

                                    <div className="md:col-span-2">
                                        <TextArea label="Company address" value={form.company.companyAddress} onChange={(value) => updateCompany('companyAddress', value)} error={errors['company.company_address']} />
                                    </div>

                                    <Field label="ICE" value={form.company.companyIce} onChange={(value) => updateCompany('companyIce', value)} error={errors['company.company_ice']} />
                                    <Field label="TVA" value={form.company.companyTva} onChange={(value) => updateCompany('companyTva', value)} error={errors['company.company_tva']} />
                                    <Field label="Patente" value={form.company.companyPatente} onChange={(value) => updateCompany('companyPatente', value)} error={errors['company.company_patente']} />
                                    <Field label="CNSS" value={form.company.companyCnss} onChange={(value) => updateCompany('companyCnss', value)} error={errors['company.company_cnss']} />
                                </div>
                            </Section>

                            <Section
                                icon={Banknote}
                                title="Bank information"
                                description="Used in documents when bank transfer details are needed."
                            >
                                <div className="grid gap-4 md:grid-cols-2">
                                    <Field label="Bank name" value={form.bank.bankName} onChange={(value) => updateBank('bankName', value)} error={errors['bank.bank_name']} />
                                    <Field label="RIB" value={form.bank.bankRib} onChange={(value) => updateBank('bankRib', value)} error={errors['bank.bank_rib']} />
                                </div>
                            </Section>
                        </main>

                        <aside className="grid min-w-0 gap-5 xl:sticky xl:top-24 xl:self-start">
                            <section className="crm-panel p-5">
                                <div className="mb-4 flex items-center gap-3">
                                    <div className="flex size-10 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--crm-accent)_16%,transparent)] text-[var(--crm-accent)]">
                                        <FileText size={18} />
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-black">Document impact</h2>
                                        <p className="text-xs text-[var(--crm-muted)]">Values used by templates.</p>
                                    </div>
                                </div>

                                <div className="grid gap-3">
                                    <PreviewTile label="Company" value={form.company.companyName || '-'} />
                                    <PreviewTile label="TVA" value={`${form.finance.defaultTvaRate || 0}%`} />
                                    <PreviewTile label="Currency" value={form.finance.defaultCurrency || 'MAD'} />
                                    <PreviewTile label="Payment days" value={form.finance.defaultPaymentTermsDays || '-'} />
                                    <PreviewTile label="Unit price/m2" value={`${form.finance.defaultUnitPriceM2 || 0} ${form.finance.defaultCurrency || 'MAD'}`} />
                                </div>
                            </section>

                            <section className="crm-panel p-5">
                                <h2 className="text-sm font-black">Legal footer</h2>
                                <p className="mt-3 text-sm leading-6 text-[var(--crm-muted)]">
                                    ICE: {form.company.companyIce || '-'} / CNSS: {form.company.companyCnss || '-'} / Patente: {form.company.companyPatente || '-'} / TVA: {form.company.companyTva || '-'}
                                </p>
                            </section>

                            <section className="crm-panel p-5">
                                <h2 className="text-sm font-black">Bank</h2>
                                <p className="mt-3 text-sm leading-6 text-[var(--crm-muted)]">
                                    {form.bank.bankName || 'No bank selected'}<br />
                                    {form.bank.bankRib || 'No RIB'}
                                </p>
                            </section>
                        </aside>
                    </section>
                </form>
            </AppShell>
        </>
    );
}