import { router, usePage } from '@inertiajs/react';
import { IconBuilding, IconBuildingBank, IconCalculator, IconCalendarCheck, IconCalendarDue, IconCashBanknote, IconCertificate, IconChevronDown, IconCircleCheck, IconChevronRight, IconCoin, IconCompass, IconCreditCard, IconDiscount, IconFileText, IconIdBadge, IconLoader2, IconMail, IconMapPin, IconMaximize, IconDeviceFloppy, IconPercentage, IconPhone, IconPhoto, IconPrinter, IconRuler, IconSettings, IconShieldCheck, IconTrash, IconUpload, IconUser } from '@tabler/icons-react';

import { type ChangeEvent, type DragEvent, type FormEvent, type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Chip, Description, FieldError, Input, Label, ListBox, Select, TextArea, TextField } from '@heroui/react';
import { AppCard } from '@/components/ui/AppCard';
import { AppButton } from '@/components/ui/AppButton';
import { AppModal } from '@/components/ui/AppModal';
import { AppPageHeader } from '@/components/ui/AppPageHeader';
import { cn } from '@/lib/cn';
import { ArchitectFeeOptionsSection, type ArchitectFeeOptionSettings } from '@/features/finance/components/ArchitectFeeOptionsSection';

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
        companyLegalRepresentative: string;
        companyAddress: string;
        companyPhone: string;
        companyFax: string;
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
            companyLegalRepresentative: string;
            companyAddress: string;
            companyPhone: string;
            companyFax: string;
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
        uploadLogo: string;
        deleteLogo: string;
    };
    /** Distinct architect rates found on contracts, used for the default-rate dropdown. */
    architectRates?: number[];
    architectFeeOptions?: ArchitectFeeOptionSettings[];
    contractTemplateOptions?: { id: string; label: string }[];
    canManage?: boolean;
    showHeader?: boolean;
    visibleSections?: SettingsSection[];
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
            companyLegalRepresentative: toStringValue(settings.company.companyLegalRepresentative),
            companyAddress: toStringValue(settings.company.companyAddress),
            companyPhone: toStringValue(settings.company.companyPhone),
            companyFax: toStringValue(settings.company.companyFax),
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
            company_legal_representative: form.company.companyLegalRepresentative,
            company_address: form.company.companyAddress,
            company_phone: form.company.companyPhone,
            company_fax: form.company.companyFax,
            company_email: form.company.companyEmail,
            company_ice: form.company.companyIce,
            company_tva: form.company.companyTva,
            company_patente: form.company.companyPatente,
            company_cnss: form.company.companyCnss,
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

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?[0-9][0-9\s().-]{6,24}$/;

function validateSettings(form: FinanceSettingsForm): Record<string, string> {
    const errors: Record<string, string> = {};
    const validateNumber = (key: string, value: string, label: string, min: number, max: number, integer = false) => {
        const number = Number(value);

        if (value === '' || !Number.isFinite(number) || number < min || number > max || (integer && !Number.isInteger(number))) {
            errors[key] = `${label} est invalide.`;
        }
    };

    validateNumber('finance.default_tva_rate', form.finance.defaultTvaRate, 'Le taux de TVA', 0, 100);
    validateNumber('finance.default_payment_terms_days', form.finance.defaultPaymentTermsDays, 'Le délai de paiement', 0, 365, true);
    validateNumber('finance.default_quote_validity_days', form.finance.defaultQuoteValidityDays, 'La validité du devis', 0, 365, true);
    validateNumber('finance.default_unit_price_m2', form.finance.defaultUnitPriceM2, 'Le prix unitaire', 0, Number.MAX_SAFE_INTEGER);
    validateNumber('finance.default_architect_rate', form.finance.defaultArchitectRate, 'Le taux architecte', 0, 100);

    if (!/^[A-Z]{3}$/.test(form.finance.defaultCurrency)) {
        errors['finance.default_currency'] = 'Utilisez un code devise de trois lettres, par exemple MAD.';
    }

    if (form.company.companyEmail && !EMAIL_PATTERN.test(form.company.companyEmail)) {
        errors['company.company_email'] = 'Saisissez une adresse e-mail valide.';
    }

    if (form.company.companyPhone && !PHONE_PATTERN.test(form.company.companyPhone)) {
        errors['company.company_phone'] = 'Saisissez un numéro de téléphone valide.';
    }

    if (form.company.companyFax && !PHONE_PATTERN.test(form.company.companyFax)) {
        errors['company.company_fax'] = 'Saisissez un numéro de fax valide.';
    }

    if (form.bank.bankRib && !/^[A-Za-z0-9][A-Za-z0-9\s-]{5,254}$/.test(form.bank.bankRib)) {
        errors['bank.bank_rib'] = 'Saisissez un RIB valide.';
    }

    return errors;
}

function Field({
    label,
    value,
    onChange,
    error,
    type = 'text',
    placeholder,
    help,
    isDisabled = false,
    inputMode,
    min,
    max,
    step,
    maxLength,
    pattern,
    autoComplete,
    icon,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    type?: string;
    placeholder?: string;
    help?: string;
    isDisabled?: boolean;
    inputMode?: 'text' | 'email' | 'tel' | 'numeric' | 'decimal';
    min?: number;
    max?: number;
    step?: number | 'any';
    maxLength?: number;
    pattern?: string;
    autoComplete?: string;
    icon?: ReactNode;
}) {
    return (
        <TextField type={type} value={value} onChange={onChange} isInvalid={Boolean(error)} isDisabled={isDisabled} className="min-w-0">
            <Label className="mb-1 block text-[11px] font-semibold text-[var(--text)]">{label}</Label>
            <div className="relative">
                {icon ? (
                    <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" aria-hidden>
                        {icon}
                    </span>
                ) : null}
                <Input placeholder={placeholder} inputMode={inputMode} min={min} max={max} step={step} maxLength={maxLength} pattern={pattern} autoComplete={autoComplete} className={cn('h-9 w-full rounded-lg text-sm', icon && 'pl-9')} />
            </div>
            {help ? <Description className="mt-1 text-[10px] leading-4 text-[var(--text-muted)]">{help}</Description> : null}
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
    isDisabled = false,
    icon,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    placeholder?: string;
    isDisabled?: boolean;
    icon?: ReactNode;
}) {
    return (
        <TextField value={value} onChange={onChange} isInvalid={Boolean(error)} isDisabled={isDisabled} className="min-w-0">
            <Label className="mb-1 block text-[11px] font-semibold text-[var(--text)]">{label}</Label>
            <div className="relative">
                {icon ? (
                    <span className="pointer-events-none absolute left-2.5 top-2.5 text-[var(--text-muted)]" aria-hidden>
                        {icon}
                    </span>
                ) : null}
                <TextArea rows={3} placeholder={placeholder} className={cn('w-full resize-y rounded-lg text-sm', icon && 'pl-9')} />
            </div>
            {error ? <FieldError className="mt-1 text-[10px] font-semibold">{error}</FieldError> : null}
        </TextField>
    );
}

function SelectField({
    label,
    value,
    onChange,
    error,
    options,
    isDisabled = false,
    icon,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    options: Array<{ value: string; label: string }>;
    isDisabled?: boolean;
    icon?: ReactNode;
}) {
    return (
        <div className="flex min-w-0 flex-col gap-1">
            <Label className="mb-1 block text-[11px] font-semibold text-[var(--text)]">{label}</Label>
            <div className="relative">
                {icon ? (
                    <span className="pointer-events-none absolute left-2.5 top-1/2 z-10 -translate-y-1/2 text-[var(--text-muted)]" aria-hidden>
                        {icon}
                    </span>
                ) : null}
                <Select
                    selectedKey={value || null}
                    onSelectionChange={(key) => onChange(key ? String(key) : '')}
                    isDisabled={isDisabled}
                    placeholder="Sélectionner…"
                    aria-label={label}
                >
                    <Select.Trigger
                        className={cn(
                            'flex h-9 w-full min-w-0 items-center gap-2 rounded-lg border bg-[var(--surface)] pr-2.5 text-sm text-[var(--text)] outline-none transition',
                            'border-[var(--border)] hover:border-[var(--accent)] focus-visible:border-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--accent)_18%,transparent)]',
                            'disabled:cursor-not-allowed disabled:opacity-60',
                            icon && 'pl-9',
                            error && 'border-[var(--danger)]',
                        )}
                    >
                        <Select.Value className="flex-1 truncate text-left text-sm" />
                        <Select.Indicator>
                            <IconChevronDown size={14} className="text-[var(--text-muted)]" />
                        </Select.Indicator>
                    </Select.Trigger>
                    <Select.Popover className="z-[120] w-[var(--trigger-width)] rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1 shadow-2xl">
                        <ListBox aria-label={label} className="gap-0">
                            {options.map((option) => (
                                <ListBox.Item
                                    key={option.value}
                                    id={option.value}
                                    textValue={option.label}
                                    className="flex cursor-pointer items-center rounded-lg px-2.5 py-2 text-xs text-[var(--text)] outline-none transition hover:bg-[var(--surface-2)] data-[focus-visible]:bg-[var(--surface-2)] data-[selected]:bg-[var(--accent)]/10"
                                >
                                    {option.label}
                                </ListBox.Item>
                            ))}
                        </ListBox>
                    </Select.Popover>
                </Select>
            </div>
            {error ? <FieldError className="mt-1 text-[10px] font-semibold">{error}</FieldError> : null}
        </div>
    );
}

function Section({
    icon: Icon,
    title,
    description,
    children,
}: {
    icon: typeof IconSettings;
    title: string;
    description: string;
    children: ReactNode;
}) {
    return (
        <AppCard className="overflow-hidden p-0">
            <div className="flex items-start gap-3 border-b border-[var(--border)] px-4 py-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--accent)_14%,transparent)] text-[var(--accent)]">
                    <Icon size={16} />
                </div>
                <div className="min-w-0">
                    <h2 className="text-sm font-semibold text-[var(--text)]">{title}</h2>
                    <p className="mt-0.5 text-[11px] leading-5 text-[var(--text-muted)]">{description}</p>
                </div>
            </div>
            <div className="p-4">{children}</div>
        </AppCard>
    );
}

function PreviewTile({ label, value }: { label: string; value: ReactNode }) {
    return (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 py-2">
            <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">{label}</p>
            <div className="mt-0.5 truncate text-xs font-semibold text-[var(--text)]">{value || '-'}</div>
        </div>
    );
}

export type SettingsSection = 'finance' | 'company' | 'bank';

const SETTINGS_SECTIONS: Array<{
    id: SettingsSection;
    label: string;
    description: string;
    icon: typeof IconSettings;
}> = [
    { id: 'finance', label: 'Règles financières', description: 'TVA, devise et calculs', icon: IconCalculator },
    { id: 'company', label: 'Entreprise', description: 'Identité et mentions légales', icon: IconBuilding },
    { id: 'bank', label: 'Coordonnées bancaires', description: 'Informations de paiement', icon: IconBuildingBank },
];

export function FinanceSettingsForm({ settings, routes, architectRates = [], architectFeeOptions = [], contractTemplateOptions = [], canManage = false, showHeader = true, visibleSections }: FinanceSettingsFormProps) {
    const { errors: serverErrors = {} } = usePage().props as { errors?: Record<string, string> };
    const initialForm = useMemo(() => fromSettings(settings), [settings]);

    const [form, setForm] = useState<FinanceSettingsForm>(initialForm);
    const [processing, setProcessing] = useState(false);
    const [autoSaveState, setAutoSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('saved');
    const [showRemoveLogoConfirm, setShowRemoveLogoConfirm] = useState(false);
    const [showLogoPreview, setShowLogoPreview] = useState(false);
    const [isLogoDragging, setIsLogoDragging] = useState(false);
    const [isLogoUploading, setIsLogoUploading] = useState(false);
    const [activeSection, setActiveSection] = useState<SettingsSection>('finance');
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const lastAutoSaveSnapshot = useRef<string | null>(null);

    const isDirty = useMemo(() => !sameForm(form, initialForm), [form, initialForm]);
    const hasLogo = Boolean(form.company.companyLogoUrl);
    const hasStoredLogo = Boolean(form.company.companyLogoPath);
    const validationErrors = useMemo(() => validateSettings(form), [form]);
    const errors = useMemo(() => ({ ...serverErrors, ...validationErrors }), [serverErrors, validationErrors]);
    const settingsSnapshot = useMemo(() => JSON.stringify(toPayload(form)), [form]);

    // Dropdown choices = rates found on contracts, always including the
    // current saved value (deduped, sorted numerically) so the selection
    // never renders blank for a previously saved custom rate.
    const architectRateOptions = useMemo(() => {
        const rates = [...architectRates];
        const current = Number(form.finance.defaultArchitectRate);

        if (Number.isFinite(current) && !rates.some((rate) => Math.abs(rate - current) < 1e-9)) {
            rates.push(current);
        }

        return [...new Map(rates.map((rate) => [String(rate), rate])).values()]
            .map((rate) => ({ value: String(rate), label: `${rate} %` }))
            .sort((a, b) => Number(a.value) - Number(b.value));
    }, [architectRates, form.finance.defaultArchitectRate]);
    const canAutoSave = Object.keys(validationErrors).length === 0;
    const availableSections = useMemo(
        () => SETTINGS_SECTIONS.filter((section) => !visibleSections || visibleSections.includes(section.id)),
        [visibleSections],
    );
    const selectedSection = availableSections.some((section) => section.id === activeSection)
        ? activeSection
        : availableSections[0]?.id ?? 'finance';
    const showSectionNav = availableSections.length > 1;
    const showsFinanceSettings = availableSections.some((section) => section.id === 'finance');
    const showsCompanySettings = availableSections.some((section) => section.id !== 'finance');
    const autosaveStatus = (
        <Chip size="sm" variant="soft" color={autoSaveState === 'error' ? 'danger' : (isDirty || autoSaveState === 'saving' ? 'warning' : 'success')}>
            {autoSaveState === 'saving' ? <IconLoader2 size={12} className="animate-spin" /> : <IconDeviceFloppy size={12} />}
            {autoSaveState === 'saving' ? 'Enregistrement...' : (autoSaveState === 'error' ? 'À corriger' : (isDirty ? 'Enregistrement auto' : 'Enregistré'))}
        </Chip>
    );

    useEffect(() => {
        setForm((current) => ({
            ...current,
            company: {
                ...current.company,
                companyLogoPath: initialForm.company.companyLogoPath,
                companyLogoUrl: initialForm.company.companyLogoUrl,
            },
        }));
    }, [initialForm.company.companyLogoPath, initialForm.company.companyLogoUrl]);

    const persistSettings = useCallback((silent = false) => {
        if (!canManage || processing) {
            return;
        }

        if (Object.keys(validationErrors).length > 0) {
            setAutoSaveState('error');

            if (!silent) {
                toast.error('Corrigez les champs signalés avant l’enregistrement.');
            }

            return;
        }

        setProcessing(true);
        setAutoSaveState('saving');

        router.put(routes.update, toPayload(form), {
            preserveScroll: true,
            preserveState: true,
            headers: silent ? { 'X-Archilbo-Autosave': '1' } : undefined,
            onSuccess: () => {
                setAutoSaveState('saved');

                if (!silent) {
                    toast.success('Parametres financiers enregistres.');
                }
            },
            onError: () => {
                setAutoSaveState('error');

                if (!silent) {
                    toast.error('Verifiez les champs des parametres.');
                }
            },
            onFinish: () => setProcessing(false),
        });
    }, [canManage, form, processing, routes.update, validationErrors]);

    useEffect(() => {
        if (!canManage || !isDirty || processing || !canAutoSave || lastAutoSaveSnapshot.current === settingsSnapshot) {
            return;
        }

        setAutoSaveState('idle');

        const timeout = window.setTimeout(() => {
            lastAutoSaveSnapshot.current = settingsSnapshot;
            persistSettings(true);
        }, 900);

        return () => window.clearTimeout(timeout);
    }, [canAutoSave, canManage, isDirty, persistSettings, processing, settingsSnapshot]);

    useEffect(() => {
        if (!canManage) {
            return;
        }

        function handleKeyDown(event: KeyboardEvent) {
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
                event.preventDefault();

                if (isDirty && !processing) {
                    persistSettings();
                }
            }
        }

        window.addEventListener('keydown', handleKeyDown);

        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isDirty, persistSettings, processing, canManage]);

    function updateFinance(key: keyof FinanceSettingsForm['finance'], value: string) {
        const isNumericField = key !== 'defaultCurrency';
        const nextValue = key === 'defaultCurrency'
            ? value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3)
            : (isNumericField ? value.replace(',', '.').replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1') : value);

        setForm((current) => ({ ...current, finance: { ...current.finance, [key]: nextValue } }));
    }

    function updateCompany(key: keyof FinanceSettingsForm['company'], value: string) {
        const nextValue = key === 'companyPhone' || key === 'companyFax'
            ? value.replace(/[^0-9+\s().-]/g, '').slice(0, 25)
            : value;

        setForm((current) => ({ ...current, company: { ...current.company, [key]: nextValue } }));
    }

    function updateBank(key: keyof FinanceSettingsForm['bank'], value: string) {
        const nextValue = key === 'bankRib'
            ? value.replace(/[^A-Za-z0-9\s-]/g, '').slice(0, 255)
            : value;

        setForm((current) => ({ ...current, bank: { ...current.bank, [key]: nextValue } }));
    }

    function save(event?: FormEvent<HTMLFormElement>) {
        event?.preventDefault();

        persistSettings();
    }

    function uploadLogoFile(file: File | undefined) {
        if (!file) {
            return;
        }

        const formData = new FormData();
        formData.append('logo', file);
        setIsLogoUploading(true);

        router.post(routes.uploadLogo, formData, {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => toast.success(hasStoredLogo ? 'Logo remplacé.' : 'Logo importé.'),
            onError: () => toast.error('Impossible d’importer le logo.'),
            onFinish: () => setIsLogoUploading(false),
        });
    }

    function uploadLogo(event: ChangeEvent<HTMLInputElement>) {
        uploadLogoFile(event.target.files?.[0]);
        event.target.value = '';
    }

    function handleLogoDrop(event: DragEvent<HTMLDivElement>) {
        event.preventDefault();
        setIsLogoDragging(false);

        if (canManage) {
            uploadLogoFile(event.dataTransfer.files?.[0]);
        }
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
            <form id="finance-settings-form" className="mx-auto max-w-[1440px] space-y-5" onSubmit={save}>
                {showHeader ? (
                    <AppPageHeader
                        eyebrow="Paramètres"
                        title="Paramètres finance"
                        subtitle="Centralisez les valeurs utilisées dans les devis, factures, reçus et modèles de documents."
                        actions={autosaveStatus}
                    />
                ) : (
                    <div className="flex justify-end">{autosaveStatus}</div>
                )}

                {!canManage ? (
                    <div className="flex items-center gap-2 rounded-xl border border-[color-mix(in_srgb,var(--accent)_30%,var(--border))] bg-[color-mix(in_srgb,var(--accent)_8%,transparent)] px-3 py-2 text-xs text-[var(--text-muted)]">
                        <IconCircleCheck size={15} className="shrink-0 text-[var(--accent)]" />
                        Consultation uniquement : vous n’avez pas l’autorisation de modifier ces paramètres.
                    </div>
                ) : null}

                <section className={`grid gap-4 ${showSectionNav ? 'xl:grid-cols-[204px_minmax(0,1fr)_280px]' : 'xl:grid-cols-[minmax(0,1fr)_280px]'}`}>
                    {showSectionNav ? (
                    <aside className="xl:sticky xl:top-5 xl:self-start">
                        <AppCard className="p-1.5">
                            <nav aria-label="Sections des paramètres" className="space-y-1">
                                {availableSections.map((section) => {
                                    const Icon = section.icon;
                                    const isActive = selectedSection === section.id;

                                    return (
                                        <AppButton
                                            key={section.id}
                                            variant={isActive ? 'secondary' : 'quiet'}
                                            className="h-auto w-full justify-start px-2.5 py-2.5 text-left"
                                            onPress={() => setActiveSection(section.id)}
                                        >
                                            <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] text-[var(--accent)]">
                                                <Icon size={14} />
                                            </span>
                                            <span className="min-w-0 flex-1">
                                                <span className="block text-[11px] font-semibold text-[var(--text)]">{section.label}</span>
                                                <span className="mt-0.5 block truncate text-[10px] font-normal text-[var(--text-muted)]">{section.description}</span>
                                            </span>
                                            <IconChevronRight size={14} className={isActive ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'} />
                                        </AppButton>
                                    );
                                })}
                            </nav>
                        </AppCard>
                    </aside>
                    ) : null}

                    <main className="min-w-0">
                        {selectedSection === 'finance' ? (
                            <Section
                                icon={IconCalculator}
                                title="Règles financières"
                                description="Valeurs par défaut appliquées aux nouveaux documents et calculs automatiques."
                            >
                            <div className="grid gap-3 md:grid-cols-2">
                                <Field label="Taux de TVA par défaut (%)" icon={<IconDiscount size={15} />} type="number" inputMode="decimal" min={0} max={100} step="any" value={form.finance.defaultTvaRate} onChange={(value) => updateFinance('defaultTvaRate', value)} error={errors['finance.default_tva_rate']} isDisabled={!canManage} />
                                <Field label="Devise" icon={<IconCoin size={15} />} value={form.finance.defaultCurrency} onChange={(value) => updateFinance('defaultCurrency', value)} error={errors['finance.default_currency']} placeholder="MAD" maxLength={3} pattern="[A-Z]{3}" autoComplete="off" isDisabled={!canManage} />
                                <Field label="Délai de paiement (jours)" icon={<IconCalendarDue size={15} />} type="number" inputMode="numeric" min={0} max={365} step={1} value={form.finance.defaultPaymentTermsDays} onChange={(value) => updateFinance('defaultPaymentTermsDays', value)} error={errors['finance.default_payment_terms_days']} isDisabled={!canManage} />
                                <Field label="Validité des devis (jours)" icon={<IconCalendarCheck size={15} />} type="number" inputMode="numeric" min={0} max={365} step={1} value={form.finance.defaultQuoteValidityDays} onChange={(value) => updateFinance('defaultQuoteValidityDays', value)} error={errors['finance.default_quote_validity_days']} isDisabled={!canManage} />
                                <Field label="Prix unitaire par m²" icon={<IconRuler size={15} />} type="number" inputMode="decimal" min={0} step="any" value={form.finance.defaultUnitPriceM2} onChange={(value) => updateFinance('defaultUnitPriceM2', value)} error={errors['finance.default_unit_price_m2']} isDisabled={!canManage} />
                            </div>
                            <div className="mt-4">
                                <ArchitectFeeOptionsSection options={architectFeeOptions} canManage={canManage} />
                            </div>
                            </Section>
                        ) : null}

                        {selectedSection === 'company' ? (
                            <Section
                                icon={IconBuilding}
                                title="Informations de l’entreprise"
                                description="Informations affichées dans les en-têtes, pieds de page et documents générés."
                            >
                            <div className="grid gap-4 md:grid-cols-2">
                                <Field label="Raison sociale" icon={<IconBuilding size={15} />} value={form.company.companyName} onChange={(value) => updateCompany('companyName', value)} error={errors['company.company_name']} isDisabled={!canManage} />
                                <Field label="Représentant légal" icon={<IconUser size={15} />} value={form.company.companyLegalRepresentative} onChange={(value) => updateCompany('companyLegalRepresentative', value)} error={errors['company.company_legal_representative']} maxLength={255} isDisabled={!canManage} />
                                <Field label="E-mail" icon={<IconMail size={15} />} type="email" inputMode="email" autoComplete="email" value={form.company.companyEmail} onChange={(value) => updateCompany('companyEmail', value)} error={errors['company.company_email']} isDisabled={!canManage} />
                                <Field label="Téléphone" icon={<IconPhone size={15} />} type="tel" inputMode="tel" autoComplete="tel" pattern="\+?[0-9][0-9\s().-]{6,24}" maxLength={25} value={form.company.companyPhone} onChange={(value) => updateCompany('companyPhone', value)} error={errors['company.company_phone']} isDisabled={!canManage} />
                                <Field label="Fax" icon={<IconPrinter size={15} />} type="tel" inputMode="tel" autoComplete="tel" pattern="\+?[0-9][0-9\s().-]{6,24}" maxLength={25} value={form.company.companyFax} onChange={(value) => updateCompany('companyFax', value)} error={errors['company.company_fax']} isDisabled={!canManage} />
                                <div className="md:col-span-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3">
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <div className="flex items-start gap-3">
                                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--accent)_14%,transparent)] text-[var(--accent)]">
                                                <IconPhoto size={18} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-[var(--text)]">Logo de l’entreprise</p>
                                                <p className="mt-1 text-xs text-[var(--text-muted)]">
                                                    PNG, JPG, WEBP ou SVG. Un nouvel import remplace automatiquement le logo actuel.
                                                </p>
                                            </div>
                                        </div>

                                    </div>

                                    <div
                                        className={`mt-4 rounded-xl border border-dashed p-3 transition-colors ${isLogoDragging ? 'border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_10%,transparent)]' : 'border-[var(--border)] bg-black/10'}`}
                                        onDragOver={(event) => {
                                            event.preventDefault();
                                            if (canManage) setIsLogoDragging(true);
                                        }}
                                        onDragLeave={(event) => {
                                            if (event.currentTarget === event.target) setIsLogoDragging(false);
                                        }}
                                        onDrop={handleLogoDrop}
                                    >
                                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                                            <div className="flex h-28 w-full shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)] sm:w-36">
                                                {form.company.companyLogoUrl ? (
                                                    <img
                                                        src={form.company.companyLogoUrl}
                                                        alt="Logo de l'entreprise"
                                                        className="h-full w-full object-contain p-3"
                                                        onError={() => setForm((current) => ({
                                                            ...current,
                                                            company: { ...current.company, companyLogoUrl: '' },
                                                        }))}
                                                    />
                                                ) : (
                                                    <IconPhoto size={24} className="text-[var(--text-muted)]" />
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <p className="text-sm font-semibold text-[var(--text)]">{hasLogo ? 'Logo actuel' : (hasStoredLogo ? 'Logo indisponible' : 'Aucun logo importé')}</p>
                                                    {hasLogo ? <Chip size="sm" variant="soft" color="success">Actif</Chip> : (hasStoredLogo ? <Chip size="sm" variant="soft" color="warning">À remplacer</Chip> : null)}
                                                </div>
                                                <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">Glissez un fichier ici ou utilisez l’import. PNG, JPG, WEBP ou SVG, jusqu’à 4 Mo.</p>
                                                <div className="mt-3 flex flex-wrap items-center gap-2">
                                                    <AppButton variant="secondary" compact onPress={() => fileInputRef.current?.click()} isDisabled={!canManage || isLogoUploading}>
                                                        {isLogoUploading ? <IconLoader2 size={15} className="animate-spin" /> : <IconUpload size={15} />}
                                                        {hasStoredLogo ? 'Remplacer' : 'Importer'}
                                                    </AppButton>
                                                    {form.company.companyLogoUrl ? (
                                                        <AppButton variant="quiet" compact isIconOnly tooltip="Aperçu du logo" aria-label="Aperçu du logo" onPress={() => setShowLogoPreview(true)}>
                                                            <IconMaximize size={15} />
                                                        </AppButton>
                                                    ) : null}
                                                    {hasStoredLogo ? (
                                                        <AppButton variant="danger-soft" compact isIconOnly tooltip="Supprimer le logo" aria-label="Supprimer le logo" onPress={deleteLogo} isDisabled={!canManage || isLogoUploading}>
                                                            <IconTrash size={15} />
                                                        </AppButton>
                                                    ) : null}
                                                </div>
                                            </div>
                                        </div>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept=".png,.jpg,.jpeg,.webp,.svg"
                                            className="hidden"
                                            onChange={uploadLogo}
                                            disabled={!canManage || isLogoUploading}
                                        />
                                    </div>

                                </div>

                                <div className="md:col-span-2">
                                    <TextAreaField icon={<IconMapPin size={15} />} label="Adresse" value={form.company.companyAddress} onChange={(value) => updateCompany('companyAddress', value)} error={errors['company.company_address']} isDisabled={!canManage} />
                                </div>

                            </div>
                            </Section>
                        ) : null}

                        {selectedSection === 'bank' ? (
                            <Section
                                icon={IconCashBanknote}
                                title="Coordonnées bancaires"
                                description="Informations de règlement et références administratives utilisées dans les documents."
                            >
                            <div className="grid gap-4 md:grid-cols-2">
                                <Field label="Banque" icon={<IconBuildingBank size={15} />} value={form.bank.bankName} onChange={(value) => updateBank('bankName', value)} error={errors['bank.bank_name']} isDisabled={!canManage} />
                                <Field label="RIB" icon={<IconCreditCard size={15} />} value={form.bank.bankRib} onChange={(value) => updateBank('bankRib', value)} error={errors['bank.bank_rib']} pattern="[A-Za-z0-9][A-Za-z0-9\s-]{5,254}" maxLength={255} autoComplete="off" isDisabled={!canManage} />
                                <Field label="ICE" icon={<IconIdBadge size={15} />} value={form.company.companyIce} onChange={(value) => updateCompany('companyIce', value)} error={errors['company.company_ice']} isDisabled={!canManage} />
                                <Field label="TVA" icon={<IconPercentage size={15} />} value={form.company.companyTva} onChange={(value) => updateCompany('companyTva', value)} error={errors['company.company_tva']} isDisabled={!canManage} />
                                <Field label="Patente" icon={<IconCertificate size={15} />} value={form.company.companyPatente} onChange={(value) => updateCompany('companyPatente', value)} error={errors['company.company_patente']} isDisabled={!canManage} />
                                <Field label="CNSS" icon={<IconShieldCheck size={15} />} value={form.company.companyCnss} onChange={(value) => updateCompany('companyCnss', value)} error={errors['company.company_cnss']} isDisabled={!canManage} />
                            </div>
                            </Section>
                        ) : null}
                    </main>

                    <aside className="min-w-0 xl:sticky xl:top-5 xl:self-start">
                        <AppCard className="divide-y divide-[var(--border)] overflow-hidden p-0">
                            {showsFinanceSettings ? (
                            <section className="p-4">
                            <div className="mb-3 flex items-center gap-3">
                                <div className="flex size-9 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--accent)_14%,transparent)] text-[var(--accent)]">
                                    <IconFileText size={16} />
                                </div>
                                <div>
                                    <h2 className="text-sm font-semibold text-[var(--text)]">Règles appliquées</h2>
                                    <p className="text-xs text-[var(--text-muted)]">Valeurs utilisées dans les nouveaux documents.</p>
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <PreviewTile label="TVA" value={`${form.finance.defaultTvaRate || 0}%`} />
                                <PreviewTile label="Devise" value={form.finance.defaultCurrency || 'MAD'} />
                                <PreviewTile label="Délai de paiement" value={`${form.finance.defaultPaymentTermsDays || '-'} jours`} />
                                <PreviewTile label="Prix par m²" value={`${form.finance.defaultUnitPriceM2 || 0} ${form.finance.defaultCurrency || 'MAD'}`} />
                                <PreviewTile label="Taux architecte" value={`${form.finance.defaultArchitectRate || 0}%`} />
                            </div>
                            </section>
                            ) : null}

                            {showsCompanySettings ? (
                            <>
                            <section className="p-4">
                            <div className="flex items-start gap-3">
                                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--accent)_14%,transparent)] text-[var(--accent)]">
                                    <IconFileText size={16} />
                                </div>
                                <div className="min-w-0">
                                    <h2 className="text-sm font-semibold text-[var(--text)]">Mentions légales</h2>
                                    <p className="mt-2 text-[12px] leading-6 text-[var(--text-muted)]">
                                        ICE: {form.company.companyIce || '-'} / CNSS: {form.company.companyCnss || '-'} / Patente: {form.company.companyPatente || '-'} / TVA: {form.company.companyTva || '-'}
                                    </p>
                                </div>
                            </div>
                            </section>

                            <section className="p-4">
                            <div className="flex items-start gap-3">
                                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--accent)_14%,transparent)] text-[var(--accent)]">
                                    <IconBuildingBank size={16} />
                                </div>
                                <div className="min-w-0">
                                    <h2 className="text-sm font-semibold text-[var(--text)]">Banque</h2>
                                    <p className="mt-2 text-[12px] leading-6 text-[var(--text-muted)]">
                                        {form.bank.bankName || 'Aucune banque renseignée'}
                                        <br />
                                        {form.bank.bankRib || 'Aucun RIB renseigné'}
                                    </p>
                                </div>
                            </div>
                            </section>
                            </>
                            ) : null}
                        </AppCard>
                    </aside>
                </section>
            </form>

            <AppModal isOpen={showRemoveLogoConfirm} onOpenChange={setShowRemoveLogoConfirm} title="Supprimer le logo de l’entreprise">
                <p>Supprimer le logo actuel ?</p>
                <div className="mt-4 flex justify-end gap-2">
                    <AppButton variant="secondary" onPress={() => setShowRemoveLogoConfirm(false)}>Annuler</AppButton>
                    <AppButton variant="danger" onPress={confirmDeleteLogo}>Supprimer</AppButton>
                </div>
            </AppModal>

            <AppModal isOpen={showLogoPreview} onOpenChange={setShowLogoPreview} title="Aperçu du logo" size="lg">
                {form.company.companyLogoUrl ? (
                    <div className="flex min-h-64 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
                        <img
                            src={form.company.companyLogoUrl}
                            alt="Logo de l'entreprise"
                            className="max-h-[60vh] max-w-full object-contain"
                            onError={() => setShowLogoPreview(false)}
                        />
                    </div>
                ) : null}
            </AppModal>
        </>
    );
}
