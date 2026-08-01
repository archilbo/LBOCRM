import { router, usePage } from '@inertiajs/react';
import {
    Banknote,
    Building2,
    Calculator,
    FileText,
    ImageIcon,
    Landmark,
    RotateCcw,
    Save,
    ScrollText,
    Settings,
    Upload,
} from 'lucide-react';
import { type ChangeEvent, type FormEvent, type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Chip, Description, FieldError, Input, Label, TextArea, TextField } from '@heroui/react';
import { AppCard } from '@/components/ui/AppCard';
import { AppButton } from '@/components/ui/AppButton';
import { AppModal } from '@/components/ui/AppModal';

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

export type FinanceSettingsFormProps = {
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
};

function toStringValue(value: unknown): string {
    return value === null || value === undefined ? '' : String(value);
}

function fromSettings(settings: FinanceSettingsFormProps['settings']): FinanceSettingsForm {
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
        <TextField type={type} value={value} onChange={onChange} isInvalid={Boolean(error)} className="min-w-0">
            <Label className="mb-1.5 block text-xs font-semibold text-[var(--text)]">{label}</Label>
            <Input placeholder={placeholder} className="h-11 rounded-xl" />
            {help ? <Description className="mt-1 text-[10px] text-[var(--text-muted)]">{help}</Description> : null}
            {error ? <FieldError className="mt-1 text-[10px] font-semibold">{error}</FieldError> : null}
        </TextField>
    );
}

function TextAreaField({
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
        <TextField value={value} onChange={onChange} isInvalid={Boolean(error)} className="min-w-0">
            <Label className="mb-1.5 block text-xs font-semibold text-[var(--text)]">{label}</Label>
            <TextArea rows={4} placeholder={placeholder} className="w-full resize-y rounded-xl" />
            {error ? <FieldError className="mt-1 text-[10px] font-semibold">{error}</FieldError> : null}
        </TextField>
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
        <AppCard className="overflow-hidden p-0">
            <div className="flex items-start gap-3 border-b border-[var(--border)] px-5 py-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--accent)_14%,transparent)] text-[var(--accent)]">
                    <Icon size={18} />
                </div>
                <div className="min-w-0">
                    <h2 className="text-sm font-semibold text-[var(--text)]">{title}</h2>
                    <p className="mt-1 text-xs text-[var(--text-muted)]">{description}</p>
                </div>
            </div>
            <div className="p-5">{children}</div>
        </AppCard>
    );
}

function PreviewTile({ label, value }: { label: string; value: ReactNode }) {
    return (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5">
            <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">{label}</p>
            <div className="mt-1 truncate text-[12px] font-semibold text-[var(--text)]">{value || '-'}</div>
        </div>
    );
}

export function FinanceSettingsForm({ settings, routes }: FinanceSettingsFormProps) {
    const { errors = {} } = usePage().props as { errors?: Record<string, string> };
    const initialForm = useMemo(() => fromSettings(settings), [settings]);

    const [form, setForm] = useState<FinanceSettingsForm>(initialForm);
    const [processing, setProcessing] = useState(false);
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [showRemoveLogoConfirm, setShowRemoveLogoConfirm] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const isDirty = useMemo(() => !sameForm(form, initialForm), [form, initialForm]);
    const hasLogo = Boolean(form.company.companyLogoPath || form.company.companyLogoUrl);

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
        setShowResetConfirm(true);
    }

    function confirmResetDefaults() {
        router.put(routes.reset, {}, {
            preserveScroll: true,
            onSuccess: () => toast.success('Finance defaults reset.'),
            onError: () => toast.error('Could not reset finance defaults.'),
        });
        setShowResetConfirm(false);
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
        setShowRemoveLogoConfirm(true);
    }

    function confirmDeleteLogo() {
        router.delete(routes.deleteLogo, {
            preserveScroll: true,
            onSuccess: () => toast.success('Logo removed.'),
            onError: () => toast.error('Could not remove logo.'),
        });
        setShowRemoveLogoConfirm(false);
    }

    return (
        <>
            <form
                id="finance-settings-form"
                className="mx-auto mt-6 max-w-[1540px] space-y-5 xl:mt-8"
                onSubmit={save}
            >
                <AppCard className="p-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <Settings size={15} className="text-[var(--accent)]" />
                                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--accent)]">Finance settings</p>
                            </div>
                            <h1 className="mt-2 text-2xl font-bold tracking-tight text-[var(--text)]">
                                Company and finance defaults
                            </h1>
                            <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--text-muted)]">
                                Manage TVA, currency, company legal information, logo, bank details and default values used in Devis, Factures and PDF templates.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <Chip size="sm" variant="soft" color={isDirty ? 'warning' : 'success'}>
                                {isDirty ? 'Unsaved changes' : 'Saved'}
                            </Chip>

                            <AppButton variant="secondary" onPress={() => router.visit(routes.templates)}>
                                <FileText size={16} />
                                Templates
                            </AppButton>
                            <AppButton variant="secondary" onPress={resetDefaults}>
                                <RotateCcw size={16} />
                                Reset finance
                            </AppButton>
                            <AppButton variant="primary" type="submit" form="finance-settings-form" isDisabled={!isDirty || processing}>
                                <Save size={16} />
                                {processing ? 'Saving...' : 'Save'}
                            </AppButton>
                        </div>
                    </div>
                </AppCard>

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

                                <div className="md:col-span-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <div className="flex items-start gap-3">
                                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--accent)_14%,transparent)] text-[var(--accent)]">
                                                <ImageIcon size={18} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-[var(--text)]">Company logo</p>
                                                <p className="mt-1 text-xs text-[var(--text-muted)]">
                                                    Upload PNG, JPG, WEBP or SVG. Use {'{{company.logo_html}}'} inside templates.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2">
                                            <AppButton variant="secondary" onPress={() => fileInputRef.current?.click()}>
                                                <Upload size={15} />
                                                Upload logo
                                            </AppButton>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept=".png,.jpg,.jpeg,.webp,.svg"
                                                className="hidden"
                                                onChange={uploadLogo}
                                            />

                                            {hasLogo ? (
                                                <AppButton variant="secondary" onPress={deleteLogo}>
                                                    Remove
                                                </AppButton>
                                            ) : null}
                                        </div>
                                    </div>

                                    {form.company.companyLogoUrl ? (
                                        <div className="mt-4 flex items-center gap-3 rounded-xl border border-[var(--border)] bg-black/20 p-3">
                                            <img src={form.company.companyLogoUrl} alt="Company logo" className="h-12 w-12 rounded-xl object-contain" />
                                            <div className="min-w-0">
                                                <p className="text-xs font-semibold text-[var(--text)]">Current logo</p>
                                                <p className="mt-1 truncate text-xs text-[var(--text-muted)]">{form.company.companyLogoPath}</p>
                                            </div>
                                        </div>
                                    ) : form.company.companyLogoPath ? (
                                        <div className="mt-4 rounded-xl border border-[var(--border)] bg-black/20 p-3 text-xs text-[var(--text-muted)]">
                                            Current path: {form.company.companyLogoPath}
                                        </div>
                                    ) : null}
                                </div>

                                <div className="md:col-span-2">
                                    <TextAreaField label="Company address" value={form.company.companyAddress} onChange={(value) => updateCompany('companyAddress', value)} error={errors['company.company_address']} />
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
                        <AppCard className="p-5">
                            <div className="mb-4 flex items-center gap-3">
                                <div className="flex size-10 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--accent)_14%,transparent)] text-[var(--accent)]">
                                    <FileText size={18} />
                                </div>
                                <div>
                                    <h2 className="text-sm font-semibold text-[var(--text)]">Document impact</h2>
                                    <p className="text-xs text-[var(--text-muted)]">Values used by templates.</p>
                                </div>
                            </div>

                            <div className="grid gap-2.5">
                                <PreviewTile label="Company" value={form.company.companyName || '-'} />
                                <PreviewTile label="TVA" value={`${form.finance.defaultTvaRate || 0}%`} />
                                <PreviewTile label="Currency" value={form.finance.defaultCurrency || 'MAD'} />
                                <PreviewTile label="Payment days" value={form.finance.defaultPaymentTermsDays || '-'} />
                                <PreviewTile label="Unit price/m2" value={`${form.finance.defaultUnitPriceM2 || 0} ${form.finance.defaultCurrency || 'MAD'}`} />
                            </div>
                        </AppCard>

                        <AppCard className="p-5">
                            <div className="flex items-start gap-3">
                                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--accent)_14%,transparent)] text-[var(--accent)]">
                                    <ScrollText size={18} />
                                </div>
                                <div className="min-w-0">
                                    <h2 className="text-sm font-semibold text-[var(--text)]">Legal footer</h2>
                                    <p className="mt-2 text-[12px] leading-6 text-[var(--text-muted)]">
                                        ICE: {form.company.companyIce || '-'} / CNSS: {form.company.companyCnss || '-'} / Patente: {form.company.companyPatente || '-'} / TVA: {form.company.companyTva || '-'}
                                    </p>
                                </div>
                            </div>
                        </AppCard>

                        <AppCard className="p-5">
                            <div className="flex items-start gap-3">
                                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--accent)_14%,transparent)] text-[var(--accent)]">
                                    <Landmark size={18} />
                                </div>
                                <div className="min-w-0">
                                    <h2 className="text-sm font-semibold text-[var(--text)]">Bank</h2>
                                    <p className="mt-2 text-[12px] leading-6 text-[var(--text-muted)]">
                                        {form.bank.bankName || 'No bank selected'}
                                        <br />
                                        {form.bank.bankRib || 'No RIB'}
                                    </p>
                                </div>
                            </div>
                        </AppCard>
                    </aside>
                </section>
            </form>

            <AppModal isOpen={showResetConfirm} onOpenChange={setShowResetConfirm} title="Reset finance defaults">
                <p>Reset finance defaults? Company and bank information will not be changed.</p>
                <div className="mt-4 flex justify-end gap-2">
                    <AppButton variant="secondary" onPress={() => setShowResetConfirm(false)}>Cancel</AppButton>
                    <AppButton variant="primary" onPress={confirmResetDefaults}>Reset</AppButton>
                </div>
            </AppModal>

            <AppModal isOpen={showRemoveLogoConfirm} onOpenChange={setShowRemoveLogoConfirm} title="Remove company logo">
                <p>Remove company logo?</p>
                <div className="mt-4 flex justify-end gap-2">
                    <AppButton variant="secondary" onPress={() => setShowRemoveLogoConfirm(false)}>Cancel</AppButton>
                    <AppButton variant="danger" onPress={confirmDeleteLogo}>Remove</AppButton>
                </div>
            </AppModal>
        </>
    );
}
