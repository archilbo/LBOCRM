import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
    Building2, ChevronDown, FileText, FolderKanban, Globe, Hash, MapPin, Maximize2,
    MessageSquareText, Ruler, Users,
} from 'lucide-react';
import { ListBox, Select } from '@heroui/react';
import { AppButton } from '@/components/ui/AppButton';
import { AppDrawer } from '@/components/ui/AppDrawer';
import { AppFormErrorSummary } from '@/components/ui/AppFormErrorSummary';
import { AppTextField } from '@/components/ui/AppTextField';
import { AppTextarea } from '@/components/ui/AppTextarea';
import type {
    City,
    ClientOption,
    DossierFormPayload,
    DossierRow,
} from '@/features/dossiers/types';
import type { FormErrors } from '@/lib/formErrors';
import { firstError } from '@/lib/formErrors';
import { dossierStatusOptions, dossierWorkflowOptions } from '@/config/statuses';
import { cn } from '@/lib/cn';

const triggerSm = 'flex h-8 w-full min-w-0 items-center gap-2 rounded-[var(--radius-md)] border bg-[var(--surface)] px-2.5 text-xs text-[var(--foreground)] outline-none transition border-[var(--border)] hover:border-[var(--accent)] focus-visible:border-[var(--accent)]';
const popover = 'z-[70] min-w-[var(--trigger-width)] overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-lg';
const itemClass = 'flex cursor-pointer items-center rounded-lg px-3 py-2 text-xs text-[var(--foreground)] outline-none transition hover:bg-[var(--surface-2)] data-[focus-visible]:bg-[var(--surface-2)] data-[selected]:bg-[var(--accent)]/10';

function HeroSelect<T extends string>({ placeholder, options, value, onChange, error, isDisabled }: {
    placeholder: string; options: { id: T; label: string }[]; value: T | ''; onChange: (v: T) => void; error?: string; isDisabled?: boolean;
}) {
    return (
        <div className="flex min-w-0 flex-col gap-1">
            <Select
                selectedKey={value || null}
                onSelectionChange={(k) => onChange((k ?? '') as T)}
                placeholder={placeholder}
                shouldCloseOnBlur={false}
                aria-label={placeholder}
                isDisabled={isDisabled}
            >
                <Select.Trigger className={cn(triggerSm, error && 'border-[var(--danger)]')}>
                    <Select.Value className="flex-1 truncate text-left text-xs" />
                    <Select.Indicator>
                        <ChevronDown size={14} className="text-[var(--text-muted)]" />
                    </Select.Indicator>
                </Select.Trigger>
                <Select.Popover isNonModal className={popover}>
                    <ListBox className="max-h-56 overflow-y-auto p-1">
                        {options.map((opt) => (
                            <ListBox.Item key={opt.id} id={opt.id} textValue={opt.label} className={itemClass}>
                                {opt.label}
                            </ListBox.Item>
                        ))}
                    </ListBox>
                </Select.Popover>
            </Select>
            {error ? <p className="text-[10px] font-medium text-[var(--danger)]">{error}</p> : null}
        </div>
    );
}

type ProjectDrawerProps = {
    isOpen: boolean;
    mode: 'create' | 'edit';
    dossier: DossierRow | null;
    clients: ClientOption[];
    cities: City[];
    initialClientId?: string;
    onOpenChange: (isOpen: boolean) => void;
    onSubmit: (payload: DossierFormPayload) => void;
    errors?: FormErrors;
};

const emptyForm: DossierFormPayload = {
    clientId: '',
    cityId: '',
    projectObject: '',
    description: '',
    projectAddress: '',
    province: '',
    commune: '',
    landTitleNumber: '',
    landSurface: '',
    floorArea: '',
    status: 'opened',
    workflowStep: 'client',
    notes: '',
};

function stringValue(value: unknown): string {
    if (value === null || value === undefined) return '';
    return String(value);
}

export function ProjectDrawer({
    isOpen,
    mode,
    dossier,
    clients,
    cities = [],
    initialClientId = '',
    onOpenChange,
    onSubmit,
    errors = {},
}: ProjectDrawerProps) {
    const [form, setForm] = useState<DossierFormPayload>(emptyForm);

    const cityOptions = useMemo(() =>
        (cities ?? []).map((c) => ({ id: String(c.id), label: `${c.code} - ${c.name}` })),
    [cities]);

    useEffect(() => {
        if (!isOpen) return;

        if (mode === 'edit' && dossier) {
            const current = dossier as unknown as Record<string, unknown>;
            setForm({
                clientId: stringValue(current.clientId),
                cityId: stringValue((current as Record<string, unknown>).city && typeof (current as Record<string, unknown>).city === 'object'
                    ? ((current as Record<string, unknown>).city as Record<string, unknown>).id ?? ''
                    : ''),
                projectObject: stringValue(current.projectObject),
                description: stringValue(current.description),
                projectAddress: stringValue(current.projectAddress || current.address || ''),
                province: stringValue(current.province),
                commune: stringValue(current.commune),
                landTitleNumber: stringValue(current.landTitleNumber),
                landSurface: stringValue(current.landSurface),
                floorArea: stringValue(current.floorArea),
                status: stringValue(current.status) || 'opened',
                workflowStep: stringValue(current.workflowStep) || 'client',
                notes: stringValue(current.notes),
            });
            return;
        }

        setForm({ ...emptyForm, clientId: initialClientId });
    }, [dossier, initialClientId, isOpen, mode]);

    function updateField(field: keyof DossierFormPayload, value: string) {
        setForm((current) => ({ ...current, [field]: value }));
    }

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        onSubmit(form);
    }

    return (
        <AppDrawer
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            title={mode === 'create' ? 'Nouveau projet' : 'Modifier le projet'}
            description={mode === 'create' ? 'Renseignez les informations du nouveau dossier.' : 'Mettez à jour les informations du dossier.'}
            footer={
                <div className="flex w-full items-center justify-end gap-2">
                    <AppButton variant="light" onPress={() => onOpenChange(false)}>
                        Annuler
                    </AppButton>
                    <AppButton variant="solid" color="primary" type="submit" form="project-form">
                        Enregistrer
                    </AppButton>
                </div>
            }
        >
            <form id="project-form" className="space-y-3" onSubmit={handleSubmit}>
                <AppFormErrorSummary errors={errors} />

                <div>
                    <p className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--text-subtle)]">
                        <Users size={12} /> Client & workflow
                    </p>
                    <div className="grid gap-2">
                        <HeroSelect
                            placeholder="Sélectionner un client"
                            value={form.clientId}
                            onChange={(v) => updateField('clientId', v)}
                            options={clients}
                            error={firstError(errors, 'client_id')}
                            isDisabled={mode === 'edit'}
                        />
                        <HeroSelect
                            placeholder="Sélectionner une ville"
                            value={form.cityId}
                            onChange={(v) => updateField('cityId', v)}
                            options={cityOptions}
                            error={firstError(errors, 'city_id')}
                        />
                        <div className="grid gap-2 md:grid-cols-2">
                            <HeroSelect
                                placeholder="Statut"
                                value={form.status}
                                onChange={(v) => updateField('status', v)}
                                options={dossierStatusOptions}
                                error={firstError(errors, 'status')}
                            />
                            <HeroSelect
                                placeholder="Étape workflow"
                                value={form.workflowStep}
                                onChange={(v) => updateField('workflowStep', v)}
                                options={dossierWorkflowOptions}
                                error={firstError(errors, 'workflow_step')}
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <p className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--text-subtle)]">
                        <FileText size={12} /> Informations projet
                    </p>
                    <div className="grid gap-2">
                        <AppTextField
                            placeholder="Objet du projet"
                            value={form.projectObject}
                            onChange={(value) => updateField('projectObject', value)}
                            error={firstError(errors, 'project_object')}
                            icon={<FolderKanban size={13} />}
                            size="sm"
                        />
                        <AppTextarea
                            placeholder="Description"
                            value={form.description}
                            onChange={(value) => updateField('description', value)}
                            error={firstError(errors, 'description')}
                            size="sm"
                        />
                    </div>
                </div>

                <div>
                    <p className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--text-subtle)]">
                        <MapPin size={12} /> Localisation
                    </p>
                    <div className="grid gap-2">
                        <AppTextField
                            placeholder="Adresse du projet"
                            value={form.projectAddress}
                            onChange={(value) => updateField('projectAddress', value)}
                            error={firstError(errors, 'project_address', 'address')}
                            icon={<MapPin size={13} />}
                            size="sm"
                        />
                        <div className="grid gap-2 md:grid-cols-2">
                            <AppTextField
                                placeholder="Province"
                                value={form.province}
                                onChange={(value) => updateField('province', value)}
                                error={firstError(errors, 'province')}
                                icon={<Globe size={13} />}
                                size="sm"
                            />
                            <AppTextField
                                placeholder="Commune"
                                value={form.commune}
                                onChange={(value) => updateField('commune', value)}
                                error={firstError(errors, 'commune')}
                                icon={<Building2 size={13} />}
                                size="sm"
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <p className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--text-subtle)]">
                        <Ruler size={12} /> Terrain & superficie
                    </p>
                    <div className="grid gap-2 md:grid-cols-3">
                        <AppTextField
                            placeholder="N° titre foncier"
                            value={form.landTitleNumber}
                            onChange={(value) => updateField('landTitleNumber', value)}
                            error={firstError(errors, 'land_title_number')}
                            icon={<Hash size={13} />}
                            size="sm"
                        />
                        <AppTextField
                            placeholder="Surface terrain"
                            value={form.landSurface}
                            onChange={(value) => updateField('landSurface', value)}
                            error={firstError(errors, 'land_surface')}
                            icon={<Maximize2 size={13} />}
                            size="sm"
                        />
                        <AppTextField
                            placeholder="Surface plancher"
                            value={form.floorArea}
                            onChange={(value) => updateField('floorArea', value)}
                            error={firstError(errors, 'floor_area')}
                            icon={<Building2 size={13} />}
                            size="sm"
                        />
                    </div>
                </div>

                <div>
                    <p className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--text-subtle)]">
                        <MessageSquareText size={12} /> Notes
                    </p>
                    <AppTextarea
                        placeholder="Notes internes"
                        value={form.notes}
                        onChange={(value) => updateField('notes', value)}
                        error={firstError(errors, 'notes')}
                        size="sm"
                    />
                </div>
            </form>
        </AppDrawer>
    );
}