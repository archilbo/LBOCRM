import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { AppShell } from '@/components/layout/AppShell';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppTextField } from '@/components/ui/AppTextField';
import { AppTextarea } from '@/components/ui/AppTextarea';
import { useTranslation } from '@/lib/i18n';

type SettingsData = {
    company_name: string;
    company_address: string;
    company_phone: string;
    company_email: string;
    company_ice: string;
    company_cin: string;
    quote_prefix: string;
    invoice_prefix: string;
    receipt_prefix: string;
    payment_prefix: string;
    tva_rate: number;
    currency: string;
    payment_terms: string;
    payment_days: number;
    bank_name: string;
    bank_rib: string;
    bank_iban: string;
    bank_bic: string;
};

type PageProps = {
    settings: SettingsData;
};

export default function FinanceSettings({ settings }: PageProps) {
    const { t } = useTranslation();
    const [form, setForm] = useState<SettingsData>({ ...settings });
    const [saving, setSaving] = useState(false);

    function update<K extends keyof SettingsData>(key: K, value: SettingsData[K]) {
        setForm((prev) => ({ ...prev, [key]: value }));
    }

    function handleSubmit() {
        setSaving(true);
        router.put(
            '/finance/settings',
            { ...form },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(t('financeSettings.saved'));
                    setSaving(false);
                },
                onError: () => {
                    toast.error(t('financeSettings.saveError'));
                    setSaving(false);
                },
                onFinish: () => setSaving(false),
            },
        );
    }

    function SectionCard({
        titleKey,
        children,
    }: {
        titleKey: string;
        children: React.ReactNode;
    }) {
        return (
            <AppCard>
                <h2 className="mb-4 text-lg font-semibold text-[var(--text)]">
                    {t(titleKey)}
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">{children}</div>
            </AppCard>
        );
    }

    function Field({
        name,
        type = 'text',
        multiline = false,
    }: {
        name: keyof SettingsData;
        type?: string;
        multiline?: boolean;
    }) {
        const label = t(`financeSettings.fields.${name}`);
        const description = t(`financeSettings.fields.${name}_desc`);
        const value = form[name];

        if (multiline) {
            return (
                <AppTextarea
                    label={label}
                    description={description}
                    value={String(value)}
                    onChange={(v) => update(name, v as SettingsData[typeof name])}
                />
            );
        }

        return (
            <AppTextField
                label={label}
                description={description}
                type={type}
                value={String(value)}
                onChange={(v) => update(name, v as SettingsData[typeof name])}
            />
        );
    }

    return (
        <>
            <Head title={t('financeSettings.title')} />

            <AppShell
                eyebrowKey="financeSettings.eyebrow"
                titleKey="financeSettings.title"
                subtitleKey="financeSettings.subtitle"
                action={
                    <AppButton
                        variant="primary"
                        onPress={handleSubmit}
                        isDisabled={saving}
                    >
                        {saving
                            ? t('financeSettings.saving')
                            : t('financeSettings.save')}
                    </AppButton>
                }
            >
                <div className="space-y-6">
                    <SectionCard titleKey="financeSettings.sections.company">
                        <Field name="company_name" />
                        <Field name="company_address" multiline />
                        <Field name="company_phone" />
                        <Field name="company_email" type="email" />
                        <Field name="company_ice" />
                        <Field name="company_cin" />
                    </SectionCard>

                    <SectionCard titleKey="financeSettings.sections.numbering">
                        <Field name="quote_prefix" />
                        <Field name="invoice_prefix" />
                        <Field name="receipt_prefix" />
                        <Field name="payment_prefix" />
                    </SectionCard>

                    <SectionCard titleKey="financeSettings.sections.tax">
                        <Field name="tva_rate" type="number" />
                        <Field name="currency" />
                        <Field name="payment_terms" multiline />
                        <Field name="payment_days" type="number" />
                    </SectionCard>

                    <SectionCard titleKey="financeSettings.sections.bank">
                        <Field name="bank_name" />
                        <Field name="bank_rib" />
                        <Field name="bank_iban" />
                        <Field name="bank_bic" />
                    </SectionCard>
                </div>
            </AppShell>
        </>
    );
}
