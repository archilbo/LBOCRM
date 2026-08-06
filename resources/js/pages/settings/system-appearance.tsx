import { Head, router } from '@inertiajs/react';
import { IconBuilding, IconCircleCheck, IconDeviceFloppy, IconEye, IconLoader2, IconPalette, IconRotate } from '@tabler/icons-react';

import { type FormEvent, type ReactNode, useMemo, useState } from 'react';
import { Chip, Description, FieldError, Input, Label, TextArea, TextField } from '@heroui/react';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppPageHeader } from '@/components/ui/AppPageHeader';
import { AppShell } from '@/components/layout/AppShell';
import type { PublicBrandingSettings } from '@/types/branding';
import type { FormErrors } from '@/lib/formErrors';

type PageProps = {
    branding: PublicBrandingSettings;
    permissions: {
        view: boolean;
        update: boolean;
    };
};

const DEFAULT_BRANDING = {
    appName: 'ARCHI LBO OS',
    shortName: 'LBO OS',
    description: '',
    accentColor: '#F6B725',
};

const ACCENT_PRESETS = [
    { color: '#F6B725', label: 'Brand Gold' },
    { color: '#2563EB', label: 'Blue' },
    { color: '#10B981', label: 'Emerald' },
    { color: '#7C3AED', label: 'Violet' },
    { color: '#E11D48', label: 'Rose' },
    { color: '#EA580C', label: 'Orange' },
];

type BrandingForm = {
    appName: string;
    shortName: string;
    description: string;
    accentColor: string;
};

function fromBranding(branding: PublicBrandingSettings): BrandingForm {
    return {
        appName: branding.appName,
        shortName: branding.shortName,
        description: branding.description ?? '',
        accentColor: branding.accentColor,
    };
}

function sameForm(a: BrandingForm, b: BrandingForm): boolean {
    return a.appName === b.appName
        && a.shortName === b.shortName
        && a.description === b.description
        && a.accentColor === b.accentColor;
}

function validateLocal(form: BrandingForm, hex: string): FormErrors {
    const errors: FormErrors = {};

    if (form.appName.trim().length < 2) {
        errors.app_name = 'Le nom de l’application doit contenir au moins 2 caractères.';
    }
    if (!form.shortName.trim()) {
        errors.short_name = 'Le nom court est obligatoire.';
    }
    if (hex.length !== 6 || !/^[0-9A-F]{6}$/.test(hex)) {
        errors.accent_color = 'Utilisez exactement 6 caractères hexadécimaux, par exemple F6B725.';
    }

    return errors;
}

function Field({
    label,
    value,
    onChange,
    error,
    placeholder,
    help,
    maxLength,
    isDisabled,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    placeholder?: string;
    help?: string;
    maxLength?: number;
    isDisabled?: boolean;
}) {
    return (
        <TextField value={value} onChange={onChange} isInvalid={Boolean(error)} isDisabled={isDisabled} className="min-w-0">
            <Label className="mb-1 block text-[11px] font-semibold text-[var(--text)]">{label}</Label>
            <Input placeholder={placeholder} maxLength={maxLength} className="h-9 rounded-lg text-sm" />
            {help ? <Description className="mt-1 text-[10px] leading-4 text-[var(--text-muted)]">{help}</Description> : null}
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
    icon: typeof IconBuilding;
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

function LivePreview({ form }: { form: BrandingForm }) {
    const accent = form.accentColor;
    const accentSoft = `color-mix(in srgb, ${accent} 14%, transparent)`;

    return (
        <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
            <div className="flex items-center gap-1.5 border-b border-[var(--border)] bg-[var(--surface-2)] px-3 py-2">
                <span className="size-1.5 rounded-full bg-[var(--text-muted)]/40" />
                <span className="size-1.5 rounded-full bg-[var(--text-muted)]/40" />
                <span className="size-1.5 rounded-full bg-[var(--text-muted)]/40" />
                <span className="ml-auto truncate text-[9px] text-[var(--text-muted)]">{form.appName || 'ARCHI LBO OS'}</span>
            </div>
            <div className="flex gap-3 p-3">
                <div className="w-28 shrink-0 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-2">
                    <div className="flex items-center gap-1.5">
                        <div className="flex size-5 shrink-0 items-center justify-center rounded-md text-black" style={{ backgroundColor: accent }}>
                            <IconBuilding size={11} />
                        </div>
                        <span className="truncate text-[9px] font-semibold text-[var(--text)]">{form.shortName || 'LBO OS'}</span>
                    </div>
                    <div className="mt-2 space-y-1">
                        <span className="block truncate rounded-md px-1.5 py-1 text-[9px] font-medium" style={{ backgroundColor: accentSoft, color: accent }}>Tableau de bord</span>
                        <span className="block rounded-md px-1.5 py-1 text-[9px] text-[var(--text-muted)]">Dossiers</span>
                        <span className="block rounded-md px-1.5 py-1 text-[9px] text-[var(--text-muted)]">Documents</span>
                        <span className="block rounded-md px-1.5 py-1 text-[9px] text-[var(--text-muted)]">Finance</span>
                    </div>
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                    <div className="truncate text-[11px] font-semibold text-[var(--text)]">{form.appName || 'ARCHI LBO OS'}</div>
                    <p className="truncate text-[9px] leading-4 text-[var(--text-muted)]">
                        {form.description || 'Bureau d’architecture — conception, suivi et gestion de projets.'}
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5">
                        <button
                            type="button"
                            tabIndex={-1}
                            className="inline-flex h-6 items-center gap-1 rounded-md px-2 text-[9px] font-semibold text-black"
                            style={{ backgroundColor: accent }}
                        >
                            Nouveau projet
                        </button>
                        <span className="rounded-md border border-[var(--border)] px-1.5 py-1 text-[9px] text-[var(--text-muted)]">Devis</span>
                    </div>
                    <div className="rounded-md border-2 bg-[var(--surface)] px-2 py-1.5" style={{ borderColor: accent }}>
                        <span className="text-[9px] text-[var(--text-muted)]">Recherche… (état focus)</span>
                    </div>
                    <div className="flex items-center gap-1.5 pt-0.5">
                        <span className="size-1.5 shrink-0 rounded-full" style={{ backgroundColor: accent }} />
                        <span className="truncate font-mono text-[9px] text-[var(--text-muted)]">{accent}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function SystemAppearance({ branding, permissions }: PageProps) {
    const canUpdate = permissions.update;
    const initialForm = useMemo(() => fromBranding(branding), [branding]);

    const [form, setForm] = useState<BrandingForm>(initialForm);
    const [hexDraft, setHexDraft] = useState(initialForm.accentColor.slice(1));
    const [errors, setErrors] = useState<FormErrors>({});
    const [processing, setProcessing] = useState(false);

    const isDirty = useMemo(() => !sameForm(form, initialForm), [form, initialForm]);

    function clearError(key: string) {
        setErrors((current) => {
            if (!(key in current)) {
                return current;
            }

            const next = { ...current };
            delete next[key];

            return next;
        });
    }

    function updateField<K extends keyof BrandingForm>(field: K, value: BrandingForm[K]) {
        clearError(field);
        setForm((current) => ({ ...current, [field]: value }));
    }

    function applyAccent(color: string) {
        clearError('accent_color');
        setForm((current) => ({ ...current, accentColor: color }));
        setHexDraft(color.slice(1));
    }

    function handleHexChange(raw: string) {
        const cleaned = raw.replace(/[^0-9A-Fa-f]/g, '').toUpperCase().slice(0, 6);
        clearError('accent_color');
        setHexDraft(cleaned);

        if (cleaned.length === 6) {
            setForm((current) => ({ ...current, accentColor: `#${cleaned}` }));
        }
    }

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!canUpdate || processing) {
            return;
        }

        const localErrors = validateLocal(form, hexDraft);

        if (Object.keys(localErrors).length > 0) {
            setErrors(localErrors);

            return;
        }

        setProcessing(true);

        router.put('/settings/system-appearance', {
            app_name: form.appName,
            short_name: form.shortName,
            description: form.description,
            accent_color: form.accentColor,
        }, {
            preserveScroll: true,
            onSuccess: () => setErrors({}),
            onError: (err) => setErrors(err as FormErrors),
            onFinish: () => setProcessing(false),
        });
    }

    function handleCancel() {
        setForm(initialForm);
        setHexDraft(initialForm.accentColor.slice(1));
        setErrors({});
    }

    function handleRestoreDefaults() {
        setForm(DEFAULT_BRANDING);
        setHexDraft(DEFAULT_BRANDING.accentColor.slice(1));
        setErrors({});
    }

    return (
        <>
            <Head title="Système & apparence" />
            <AppShell fullBleed>
                <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto">
                    <div className="mx-auto w-full max-w-[1540px] px-4 py-6 sm:px-6 lg:px-8">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <AppPageHeader
                                eyebrow="Administration"
                                title="Système & apparence"
                                subtitle="Personnalisez l’identité visuelle et les informations générales de l’application."
                                actions={
                                    <Chip size="sm" variant="soft" color={isDirty ? 'warning' : 'success'}>
                                        <span className={`size-1.5 rounded-full ${isDirty ? 'bg-[var(--warning)]' : 'bg-[var(--success)]'}`} />
                                        {isDirty ? 'Modifications non enregistrées' : 'Enregistré'}
                                    </Chip>
                                }
                            />

                            {!canUpdate ? (
                                <div className="flex items-center gap-2 rounded-xl border border-[color-mix(in_srgb,var(--accent)_30%,var(--border))] bg-[color-mix(in_srgb,var(--accent)_8%,transparent)] px-3 py-2 text-xs text-[var(--text-muted)]">
                                    <IconCircleCheck size={15} className="shrink-0 text-[var(--accent)]" />
                                    Consultation uniquement : vous n’avez pas l’autorisation de modifier ces paramètres.
                                </div>
                            ) : null}

                            <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
                                <main className="min-w-0 space-y-4">
                                    <Section
                                        icon={IconBuilding}
                                        title="Identité de l’application"
                                        description="Informations générales affichées dans la navigation, la connexion et les titres de page."
                                    >
                                        <div className="grid gap-4">
                                            <Field
                                                label="Nom de l’application"
                                                value={form.appName}
                                                onChange={(value) => updateField('appName', value)}
                                                error={errors.app_name}
                                                placeholder="Ex. ARCHI LBO OS"
                                                help="Affiché dans la navigation, la connexion et les titres de page."
                                                maxLength={80}
                                                isDisabled={!canUpdate}
                                            />
                                            <Field
                                                label="Nom court"
                                                value={form.shortName}
                                                onChange={(value) => updateField('shortName', value)}
                                                error={errors.short_name}
                                                placeholder="Ex. LBO OS"
                                                help="Utilisé lorsque l’espace disponible est limité."
                                                maxLength={30}
                                                isDisabled={!canUpdate}
                                            />
                                            <TextField
                                                value={form.description}
                                                onChange={(value) => updateField('description', value)}
                                                isInvalid={Boolean(errors.description)}
                                                isDisabled={!canUpdate}
                                                className="min-w-0"
                                            >
                                                <Label className="mb-1 block text-[11px] font-semibold text-[var(--text)]">Description</Label>
                                                <TextArea
                                                    rows={3}
                                                    maxLength={180}
                                                    placeholder="Ex. Bureau d’architecture — conception, suivi et gestion de projets."
                                                    className="w-full resize-y rounded-lg text-sm"
                                                />
                                                <div className="mt-1 flex items-center justify-between gap-2">
                                                    <Description className="text-[10px] leading-4 text-[var(--text-muted)]">
                                                        Courte description affichée sur les surfaces d’accueil.
                                                    </Description>
                                                    <span className="text-[10px] tabular-nums text-[var(--text-muted)]">{form.description.length}/180</span>
                                                </div>
                                                {errors.description ? <FieldError className="mt-1 text-[10px] font-semibold">{errors.description}</FieldError> : null}
                                            </TextField>
                                        </div>
                                    </Section>

                                    <Section
                                        icon={IconPalette}
                                        title="Couleur de marque"
                                        description="Couleur principale appliquée aux éléments interactifs et à l’identité visuelle de l’application."
                                    >
                                        <div className="space-y-4">
                                            <div className="flex flex-wrap items-center gap-3">
                                                <div className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-1.5 pr-3">
                                                    <Input
                                                        type="color"
                                                        value={form.accentColor}
                                                        onChange={(event) => applyAccent(event.target.value.toUpperCase())}
                                                        aria-label="Choisir une couleur personnalisée"
                                                        disabled={!canUpdate}
                                                        className="size-9 shrink-0 cursor-pointer rounded-md border border-[var(--border)] bg-transparent p-0.5"
                                                    />
                                                    <Input
                                                        type="text"
                                                        value={hexDraft}
                                                        onChange={(event) => handleHexChange(event.target.value)}
                                                        maxLength={6}
                                                        placeholder="F6B725"
                                                        aria-label="Valeur hexadécimale de la couleur de marque"
                                                        disabled={!canUpdate}
                                                        startContent={<span className="font-mono text-xs text-[var(--text-muted)]">#</span>}
                                                        className="h-8 w-28 rounded-lg bg-transparent font-mono text-xs uppercase"
                                                    />
                                                </div>
                                                <AppButton variant="ghost" compact onPress={() => applyAccent(DEFAULT_BRANDING.accentColor)} isDisabled={!canUpdate}>
                                                    <IconRotate size={13} />
                                                    Défaut (#F6B725)
                                                </AppButton>
                                            </div>
                                            {errors.accent_color ? <FieldError className="text-[10px] font-semibold">{errors.accent_color}</FieldError> : null}

                                            <div>
                                                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">Présélections</p>
                                                <div className="flex flex-wrap items-center gap-1.5">
                                                    {ACCENT_PRESETS.map(({ color, label }) => (
                                                        <button
                                                            key={color}
                                                            type="button"
                                                            onClick={() => applyAccent(color)}
                                                            disabled={!canUpdate}
                                                            aria-label={`Sélectionner la couleur ${label}`}
                                                            title={label}
                                                            className={`size-7 rounded-md ring-1 ring-inset transition hover:scale-110 ${form.accentColor === color ? 'scale-110 ring-2 ring-[var(--accent)]' : 'ring-[var(--border)]'}`}
                                                            style={{ backgroundColor: color }}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </Section>
                                </main>

                                <aside className="min-w-0 xl:sticky xl:top-5 xl:self-start">
                                    <Section
                                        icon={IconEye}
                                        title="Aperçu en direct"
                                        description="Rendu avec les valeurs saisies ci-dessous, avant enregistrement."
                                    >
                                        <LivePreview form={form} />
                                    </Section>
                                </aside>
                            </section>

                            <AppCard className="flex flex-wrap items-center justify-between gap-3 p-4">
                                <p className="text-xs leading-5 text-[var(--text-muted)]">
                                    Les changements sont appliqués à toute l’application après enregistrement.
                                </p>
                                <div className="flex flex-wrap items-center gap-2">
                                    <AppButton variant="ghost" compact onPress={handleRestoreDefaults} isDisabled={!canUpdate || processing}>
                                        <IconRotate size={14} />
                                        Restaurer les valeurs par défaut
                                    </AppButton>
                                    <AppButton variant="bordered" compact onPress={handleCancel} isDisabled={!canUpdate || processing}>
                                        Annuler
                                    </AppButton>
                                    <AppButton variant="primary" compact type="submit" isDisabled={!canUpdate || !isDirty || processing}>
                                        {processing ? <IconLoader2 size={14} className="animate-spin" /> : <IconDeviceFloppy size={14} />}
                                        Enregistrer
                                    </AppButton>
                                </div>
                            </AppCard>
                        </form>
                    </div>
                </div>
            </AppShell>
        </>
    );
}
