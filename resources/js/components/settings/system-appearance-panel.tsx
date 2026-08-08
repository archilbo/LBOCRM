import { useForm } from '@inertiajs/react';
import {
    IconAbc,
    IconBuilding,
    IconCircleCheck,
    IconDeviceFloppy,
    IconDice5,
    IconEye,
    IconLoader2,
    IconNotes,
    IconPalette,
    IconPhoto,
    IconRotate,
} from '@tabler/icons-react';
import { type CSSProperties, type FormEvent, type ReactNode, useEffect, useState } from 'react';
import { Button, Chip, ColorArea, ColorField, ColorPicker, ColorSlider, ColorSwatch, ColorSwatchPicker, Description, FieldError, Input, Label, TextArea, TextField, parseColor } from '@heroui/react';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppPageHeader } from '@/components/ui/AppPageHeader';
import { BrandingAssetCard } from '@/components/settings/branding-asset-card';
import { cn } from '@/lib/cn';
import type { PublicBrandingSettings } from '@/types/branding';

export type SystemAppearancePermissions = {
    view: boolean;
    update: boolean;
    branding_update: boolean;
};

type SystemAppearancePageProps = {
    branding: PublicBrandingSettings;
    permissions: SystemAppearancePermissions;
};

type SystemAppearancePanelProps = {
    branding: PublicBrandingSettings;
    permissions: SystemAppearancePermissions;
    /**
     * When true the panel is rendered inside the Paramètres tab page: the
     * AppPageHeader is omitted in favor of a compact toolbar and the title
     * is provided by the parent page.
     */
    embedded?: boolean;
};

const DEFAULT_IDENTITY = {
    appName: 'ARCHI LBO OS',
    shortName: 'LBO OS',
    description: '',
};

const DEFAULT_ACCENT = '#C9A227';

// Module scope so the react-hooks purity rule does not flag Math.random
// inside the component (event handlers are pure by definition here).
function randomHslAccent(): string {
    const randomHue = Math.floor(Math.random() * 360);
    const randomSaturation = 50 + Math.floor(Math.random() * 50); // 50-100%
    const randomLightness = 40 + Math.floor(Math.random() * 30); // 40-70%

    return `hsl(${randomHue}, ${randomSaturation}%, ${randomLightness}%)`;
}

const ACCENT_PRESETS = [
    { color: '#C9A227', label: 'Brand Gold' },
    { color: '#2563EB', label: 'Bleu' },
    { color: '#10B981', label: 'Émeraude' },
    { color: '#7C3AED', label: 'Violet' },
    { color: '#E11D48', label: 'Rose' },
    { color: '#EA580C', label: 'Orange' },
];

const HEX_REGEX = /^#[0-9A-Fa-f]{6}$/;

type LocalErrors = {
    app_name?: string;
    short_name?: string;
    description?: string;
    accent_color?: string;
};

function Field({
    label,
    value,
    onChange,
    error,
    placeholder,
    help,
    maxLength,
    isDisabled,
    icon,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    placeholder?: string;
    help?: string;
    maxLength?: number;
    isDisabled?: boolean;
    icon?: ReactNode;
}) {
    return (
        <TextField value={value} onChange={onChange} isInvalid={Boolean(error)} isDisabled={isDisabled} className="min-w-0">
            <Label className="mb-1 block text-[11px] font-semibold text-[var(--text)]">{label}</Label>
            <div className="relative">
                {icon ? (
                    <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" aria-hidden>
                        {icon}
                    </span>
                ) : null}
                <Input placeholder={placeholder} maxLength={maxLength} className={cn('h-9 w-full rounded-lg text-sm', icon && 'pl-9')} />
            </div>
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
    footer,
}: {
    icon: typeof IconBuilding;
    title: string;
    description: string;
    children: ReactNode;
    footer?: ReactNode;
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
            {footer ? (
                <div className="flex flex-wrap items-center justify-end gap-2 border-t border-[var(--border)] px-4 py-3">
                    {footer}
                </div>
            ) : null}
        </AppCard>
    );
}

function LivePreview({
    appName,
    shortName,
    description,
    accent,
}: {
    appName: string;
    shortName: string;
    description: string;
    accent: string;
}) {
    const previewStyle = {
        '--preview-accent': accent,
        '--preview-accent-soft': `color-mix(in srgb, ${accent} 14%, transparent)`,
    } as CSSProperties;

    return (
        <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
            <div className="flex items-center gap-1.5 border-b border-[var(--border)] bg-[var(--surface-2)] px-3 py-2">
                <span className="size-1.5 rounded-full bg-[var(--text-muted)]/40" />
                <span className="size-1.5 rounded-full bg-[var(--text-muted)]/40" />
                <span className="size-1.5 rounded-full bg-[var(--text-muted)]/40" />
                <span className={cn('ml-auto truncate text-[9px]', appName ? 'text-[var(--text-muted)]' : 'italic text-[var(--text-muted)]/60')}>
                    {appName || 'Aperçu'}
                </span>
            </div>
            <div className="flex gap-3 p-3" style={previewStyle}>
                <div className="w-28 shrink-0 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-2">
                    <div className="flex items-center gap-1.5">
                        <div className="flex size-5 shrink-0 items-center justify-center rounded-md bg-[var(--preview-accent)] text-black">
                            <IconBuilding size={11} />
                        </div>
                        <span className={cn('truncate text-[9px] font-semibold', shortName ? 'text-[var(--text)]' : 'italic text-[var(--text-muted)]/60')}>
                            {shortName || 'LBO OS'}
                        </span>
                    </div>
                    <div className="mt-2 space-y-1">
                        <span className="block rounded-md px-1.5 py-1 text-[9px] text-[var(--text-muted)]">Aperçu</span>
                        <span className="flex items-center gap-1 rounded-md bg-[var(--preview-accent-soft)] px-1.5 py-1 text-[9px] font-semibold text-[var(--preview-accent)]">
                            <span className="size-1 shrink-0 rounded-full bg-[var(--preview-accent)]" />
                            Tableau de bord
                        </span>
                        <span className="block rounded-md px-1.5 py-1 text-[9px] text-[var(--text-muted)]">Projets</span>
                        <span className="block rounded-md px-1.5 py-1 text-[9px] text-[var(--text-muted)]">Clients</span>
                    </div>
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                    <div className={cn('truncate text-[11px] font-semibold', appName ? 'text-[var(--text)]' : 'italic text-[var(--text-muted)]/60')}>
                        {appName || 'Nom de l’application'}
                    </div>
                    <p className={cn('truncate text-[9px] leading-4', description ? 'text-[var(--text-muted)]' : 'italic text-[var(--text-muted)]/60')}>
                        {description || 'Courte description de l’application…'}
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5">
                        <span className="inline-flex h-6 items-center gap-1 rounded-md bg-[var(--preview-accent)] px-2 text-[9px] font-semibold text-black">
                            Nouveau projet
                        </span>
                        <span className="rounded-md border border-[var(--border)] px-1.5 py-1 text-[9px] text-[var(--text-muted)]">Devis</span>
                    </div>
                    <div className="rounded-md border-2 border-[var(--preview-accent)] bg-[var(--surface)] px-2 py-1.5 ring-2 ring-[var(--preview-accent-soft)]">
                        <span className="text-[9px] text-[var(--text-muted)]">Recherche… (état focus)</span>
                    </div>
                    <div className="flex items-center gap-1.5 pt-0.5">
                        <span className="size-1.5 shrink-0 rounded-full bg-[var(--preview-accent)]" />
                        <span className="truncate font-mono text-[9px] text-[var(--text-muted)]">{accent}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function SystemAppearancePanel({ branding, permissions, embedded = false }: SystemAppearancePanelProps) {
    const canUpdate = permissions.update;
    const canEditAssets = permissions.branding_update;

    const identityForm = useForm({
        app_name: branding.appName,
        short_name: branding.shortName,
        description: branding.description ?? '',
    });

    const appearanceForm = useForm({
        accent_color: branding.accentColor,
    });

    const [localErrors, setLocalErrors] = useState<LocalErrors>({});

    // The HeroUI ColorPicker is driven by a parsed Color object while the
    // form remains the single source of truth for the hex string. The picker
    // state follows the form value so every path (hex field, presets, reset,
    // backend resync) stays in sync.
    const [pickerColor, setPickerColor] = useState(() => parseColor(appearanceForm.data.accent_color));

    function handlePickerChange(color: ReturnType<typeof parseColor> | null) {
        if (!color) {
            return;
        }

        setPickerColor(color);
        applyAccent(color.toString('hex'));
    }

    function shuffleAccent() {
        const next = parseColor(randomHslAccent());
        setPickerColor(next);
        applyAccent(next.toString('hex'));
    }

    useEffect(() => {
        setPickerColor((current) => {
            if (current.toString('hex').toUpperCase() === appearanceForm.data.accent_color.toUpperCase()) {
                return current;
            }

            return parseColor(appearanceForm.data.accent_color);
        });
    }, [appearanceForm.data.accent_color]);

    // After a successful save, Inertia redirects back with the normalized
    // values stored on the backend; resync the submitted form (and only that
    // form, so in-progress edits in the other section survive) from the fresh
    // page props delivered by the onSuccess callback.
    function syncIdentityFromProps(next: PublicBrandingSettings) {
        const saved = {
            app_name: next.appName,
            short_name: next.shortName,
            description: next.description ?? '',
        };

        identityForm.setData(saved);
        identityForm.setDefaults(saved);
    }

    function syncAppearanceFromProps(next: PublicBrandingSettings) {
        appearanceForm.setData('accent_color', next.accentColor);
        appearanceForm.setDefaults('accent_color', next.accentColor);
    }

    const previewAccent = HEX_REGEX.test(appearanceForm.data.accent_color)
        ? appearanceForm.data.accent_color
        : branding.accentColor;

    const anyDirty = identityForm.isDirty || appearanceForm.isDirty;

    function clearLocalError(key: keyof LocalErrors) {
        setLocalErrors((current) => {
            if (!(key in current)) {
                return current;
            }

            const next = { ...current };
            delete next[key];

            return next;
        });
    }

    function updateIdentityField(field: 'app_name' | 'short_name' | 'description', value: string) {
        identityForm.setData(field, value);
        identityForm.clearErrors(field);
        clearLocalError(field);
    }

    function submitIdentity() {
        if (!canUpdate || !identityForm.isDirty || identityForm.processing) {
            return;
        }

        const next: LocalErrors = {};
        if (identityForm.data.app_name.trim().length < 2) {
            next.app_name = 'Le nom de l’application doit contenir au moins 2 caractères.';
        }
        if (!identityForm.data.short_name.trim()) {
            next.short_name = 'Le nom court est requis.';
        }

        setLocalErrors(next);
        if (Object.keys(next).length > 0) {
            return;
        }

        identityForm.put('/settings/system-appearance/identity', {
            preserveScroll: true,
            onSuccess: (page) => {
                syncIdentityFromProps((page.props as unknown as SystemAppearancePageProps).branding);
                setLocalErrors({});
            },
        });
    }

    function handleIdentitySubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        submitIdentity();
    }

    function cancelIdentity() {
        identityForm.reset();
        identityForm.clearErrors();
        setLocalErrors({});
    }

    function applyAccent(color: string) {
        const normalized = color.toUpperCase();
        appearanceForm.setData('accent_color', normalized);
        appearanceForm.clearErrors('accent_color');
        clearLocalError('accent_color');
    }

    function submitAppearance() {
        if (!canUpdate || !appearanceForm.isDirty || appearanceForm.processing) {
            return;
        }

        appearanceForm.put('/settings/system-appearance/appearance', {
            preserveScroll: true,
            onSuccess: (page) => {
                syncAppearanceFromProps((page.props as unknown as SystemAppearancePageProps).branding);
                setLocalErrors({});
            },
        });
    }

    function handleAppearanceSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        submitAppearance();
    }

    function cancelAppearance() {
        const saved = branding.accentColor;
        appearanceForm.reset();
        appearanceForm.clearErrors();
        clearLocalError('accent_color');
    }

    function handleRestoreDefaults() {
        identityForm.setData(DEFAULT_IDENTITY);
        identityForm.clearErrors();
        appearanceForm.setData('accent_color', DEFAULT_ACCENT);
        appearanceForm.clearErrors();
        setLocalErrors({});
    }

    const headerActions = (
        <div className="flex flex-wrap items-center gap-2">
            <Chip size="sm" variant="soft" color={anyDirty ? 'warning' : 'success'}>
                <span className={`size-1.5 rounded-full ${anyDirty ? 'bg-[var(--warning)]' : 'bg-[var(--success)]'}`} />
                {anyDirty ? 'Modifications non enregistrées' : 'Enregistré'}
            </Chip>
            {canUpdate ? (
                <AppButton
                    variant="bordered"
                    compact
                    onPress={handleRestoreDefaults}
                    isDisabled={identityForm.processing || appearanceForm.processing}
                >
                    <IconRotate size={14} />
                    Restaurer
                </AppButton>
            ) : null}
        </div>
    );

    return (
        <>
            {embedded ? (
                <div className="mb-4 flex flex-wrap items-center justify-end gap-2">
                    {headerActions}
                </div>
            ) : (
                <AppPageHeader
                    eyebrow="Administration"
                    title="Système & apparence"
                    subtitle="Personnalisez l’identité et l’apparence générale de l’application."
                    actions={headerActions}
                />
            )}

            {!canUpdate ? (
                <div className="mb-5 flex items-center gap-2 rounded-xl border border-[color-mix(in_srgb,var(--accent)_30%,var(--border))] bg-[color-mix(in_srgb,var(--accent)_8%,transparent)] px-3 py-2 text-xs text-[var(--text-muted)]">
                    <IconCircleCheck size={15} className="shrink-0 text-[var(--accent)]" />
                    Consultation uniquement : vous n’avez pas l’autorisation de modifier ces paramètres.
                </div>
            ) : null}

            <section className="grid gap-4 md:grid-cols-[minmax(0,1fr)_300px] lg:grid-cols-[minmax(0,1fr)_320px] 2xl:grid-cols-[minmax(0,1fr)_360px]">
                <main className="min-w-0 space-y-4">
                    <Section
                        icon={IconBuilding}
                        title="Identité de l’application"
                        description="Informations générales affichées dans la navigation, la connexion et les titres de page."
                        footer={
                            <>
                                <AppButton
                                    variant="ghost"
                                    compact
                                    onPress={cancelIdentity}
                                    isDisabled={!canUpdate || identityForm.processing}
                                >
                                    Annuler
                                </AppButton>
                                <AppButton
                                    variant="primary"
                                    compact
                                    onPress={submitIdentity}
                                    isDisabled={!canUpdate || !identityForm.isDirty || identityForm.processing}
                                >
                                    {identityForm.processing ? <IconLoader2 size={14} className="animate-spin" /> : <IconDeviceFloppy size={14} />}
                                    Enregistrer
                                </AppButton>
                            </>
                        }
                    >
                        <form onSubmit={handleIdentitySubmit} className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                        <Field
                                            label="Nom de l’application"
                                            icon={<IconBuilding size={15} />}
                                            value={identityForm.data.app_name}
                                            onChange={(value) => updateIdentityField('app_name', value)}
                                            error={identityForm.errors.app_name ?? localErrors.app_name}
                                            placeholder="Ex. ARCHI LBO OS"
                                            help="Affiché dans la navigation, la connexion et les titres de page."
                                            maxLength={80}
                                            isDisabled={!canUpdate}
                                        />
                                        <Field
                                            label="Nom court"
                                            icon={<IconAbc size={15} />}
                                            value={identityForm.data.short_name}
                                            onChange={(value) => updateIdentityField('short_name', value)}
                                            error={identityForm.errors.short_name ?? localErrors.short_name}
                                            placeholder="Ex. LBO OS"
                                            help="Utilisé lorsque l’espace disponible est limité."
                                            maxLength={30}
                                            isDisabled={!canUpdate}
                                        />
                            <TextField
                                value={identityForm.data.description}
                                onChange={(value) => updateIdentityField('description', value)}
                                isInvalid={Boolean(identityForm.errors.description ?? localErrors.description)}
                                isDisabled={!canUpdate}
                                className="min-w-0 sm:col-span-2"
                            >
                                            <Label className="mb-1 block text-[11px] font-semibold text-[var(--text)]">Description</Label>
                                            <div className="relative">
                                                <span className="pointer-events-none absolute left-2.5 top-2.5 text-[var(--text-muted)]" aria-hidden>
                                                    <IconNotes size={15} />
                                                </span>
                                                <TextArea
                                                    rows={3}
                                                    maxLength={180}
                                                    placeholder="Ex. Bureau d’architecture — conception, suivi et gestion de projets."
                                                    className="w-full resize-y rounded-lg pl-9 text-sm"
                                                />
                                            </div>
                                <div className="mt-1 flex items-center justify-between gap-2">
                                    <Description className="text-[10px] leading-4 text-[var(--text-muted)]">
                                        Courte description affichée sur les surfaces d’accueil.
                                    </Description>
                                    <span className="text-[10px] tabular-nums text-[var(--text-muted)]">
                                        {identityForm.data.description.length}/180
                                    </span>
                                </div>
                                {identityForm.errors.description ?? localErrors.description ? (
                                    <FieldError className="mt-1 text-[10px] font-semibold">
                                        {identityForm.errors.description ?? localErrors.description}
                                    </FieldError>
                                ) : null}
                            </TextField>
                            </div>
                        </form>
                    </Section>

                    <Section
                        icon={IconPalette}
                        title="Couleur de marque"
                        description="Couleur principale appliquée aux éléments interactifs et à l’identité visuelle de l’application."
                        footer={
                            <>
                                <AppButton
                                    variant="ghost"
                                    compact
                                    onPress={() => applyAccent(DEFAULT_ACCENT)}
                                    isDisabled={!canUpdate || appearanceForm.processing}
                                >
                                    <IconRotate size={14} />
                                    Couleur par défaut
                                </AppButton>
                                <AppButton
                                    variant="ghost"
                                    compact
                                    onPress={cancelAppearance}
                                    isDisabled={!canUpdate || appearanceForm.processing}
                                >
                                    Annuler
                                </AppButton>
                                <AppButton
                                    variant="primary"
                                    compact
                                    onPress={submitAppearance}
                                    isDisabled={!canUpdate || !appearanceForm.isDirty || appearanceForm.processing}
                                >
                                    {appearanceForm.processing ? <IconLoader2 size={14} className="animate-spin" /> : <IconDeviceFloppy size={14} />}
                                    Enregistrer
                                </AppButton>
                            </>
                        }
                    >
                        <form onSubmit={handleAppearanceSubmit} className="space-y-4">
                            <div className="min-w-0">
                                                <Label className="mb-1 block text-[11px] font-semibold text-[var(--text)]">
                                                    Couleur de marque
                                                </Label>
                                                <div className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-1.5">
                                                    <ColorPicker
                                                        value={pickerColor}
                                                        onChange={handlePickerChange}
                                                    >
                                                        <ColorPicker.Trigger
                                                            aria-label="Choisir une couleur personnalisée"
                                                            isDisabled={!canUpdate}
                                                            className="shrink-0 cursor-pointer rounded-lg outline-none transition focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
                                                        >
                                                            <ColorSwatch size="lg" className="rounded-md" />
                                                        </ColorPicker.Trigger>
                                                        <ColorPicker.Popover
                                                            placement="bottom start"
                                                            className="flex w-60 flex-col gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-xl"
                                                        >
                                                            <ColorSwatchPicker
                                                                size="xs"
                                                                aria-label="Couleurs prédéfinies"
                                                                className="justify-center pt-2"
                                                            >
                                                                {ACCENT_PRESETS.map(({ color, label }) => (
                                                                    <ColorSwatchPicker.Item key={color} color={color} aria-label={label}>
                                                                        <ColorSwatchPicker.Swatch />
                                                                    </ColorSwatchPicker.Item>
                                                                ))}
                                                            </ColorSwatchPicker>
                                                            <ColorArea
                                                                aria-label="Zone de saturation"
                                                                colorSpace="hsb"
                                                                xChannel="saturation"
                                                                yChannel="brightness"
                                                                isDisabled={!canUpdate}
                                                                className="h-32 w-full rounded-lg"
                                                            >
                                                                <ColorArea.Thumb />
                                                            </ColorArea>
                                                            <div className="flex items-center gap-2 px-1">
                                                                <ColorSlider
                                                                    aria-label="Teinte"
                                                                    channel="hue"
                                                                    colorSpace="hsb"
                                                                    isDisabled={!canUpdate}
                                                                    className="flex-1"
                                                                >
                                                                    <ColorSlider.Track>
                                                                        <ColorSlider.Thumb />
                                                                    </ColorSlider.Track>
                                                                </ColorSlider>
                                                                <Button
                                                                    isIconOnly
                                                                    aria-label="Couleur aléatoire"
                                                                    size="sm"
                                                                    variant="tertiary"
                                                                    isDisabled={!canUpdate}
                                                                    onPress={shuffleAccent}
                                                                >
                                                                    <IconDice5 className="size-4" />
                                                                </Button>
                                                            </div>
                                                            <ColorField
                                                                aria-label="Code hexadécimal"
                                                                value={pickerColor}
                                                                onChange={handlePickerChange}
                                                                isDisabled={!canUpdate}
                                                            >
                                                                <ColorField.Group variant="secondary">
                                                                    <ColorField.Prefix>
                                                                        <ColorSwatch size="xs" />
                                                                    </ColorField.Prefix>
                                                                    <ColorField.Input />
                                                                </ColorField.Group>
                                                            </ColorField>
                                                        </ColorPicker.Popover>
                                                    </ColorPicker>
                                                    <span className="min-w-0 truncate font-mono text-xs text-[var(--text)]">
                                                        {appearanceForm.data.accent_color}
                                                    </span>
                                                </div>
                                    <Description className="mt-1 text-[10px] leading-4 text-[var(--text-muted)]">
                                        Couleur principale des éléments interactifs et de l’identité visuelle.
                                    </Description>
                                </div>
                        </form>
                    </Section>

                    <Section
                        icon={IconPhoto}
                        title="Logos et icône"
                        description="Personnalisez les logos utilisés par l’interface de l’application."
                    >
                        <div className="grid gap-4 md:grid-cols-2">
                            <BrandingAssetCard
                                title="Logo clair"
                                description="Utilisé sur les surfaces claires de l’application."
                                assetType="logo_light"
                                currentUrl={branding.logoLightUrl}
                                recommendedSize="PNG/WEBP transparent recommandé."
                                canEdit={canEditAssets}
                            />
                            <BrandingAssetCard
                                title="Logo sombre"
                                description="Utilisé sur les surfaces sombres de l’application."
                                assetType="logo_dark"
                                currentUrl={branding.logoDarkUrl}
                                recommendedSize="Version claire du logo recommandée."
                                canEdit={canEditAssets}
                            />
                            <BrandingAssetCard
                                title="Logo compact"
                                description="Utilisé lorsque l’espace disponible est réduit."
                                assetType="logo_compact"
                                currentUrl={branding.logoCompactUrl}
                                recommendedSize="Format carré recommandé."
                                canEdit={canEditAssets}
                            />
                            <BrandingAssetCard
                                title="Favicon"
                                description="Icône affichée dans l’onglet du navigateur."
                                assetType="favicon"
                                currentUrl={branding.faviconUrl}
                                recommendedSize="Format carré recommandé."
                                canEdit={canEditAssets}
                            />
                        </div>
                    </Section>
                </main>

                <aside className="min-w-0 md:sticky md:top-5 md:self-start">
                    <Section
                        icon={IconEye}
                        title="Aperçu"
                        description="Rendu avec les valeurs saisies, avant enregistrement."
                    >
                        <LivePreview
                            appName={identityForm.data.app_name}
                            shortName={identityForm.data.short_name}
                            description={identityForm.data.description}
                            accent={previewAccent}
                        />
                    </Section>
                </aside>
            </section>
        </>
    );
}
