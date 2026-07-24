import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
    FileText, MapPin, MessageSquareText, Ruler, Users,
} from 'lucide-react';
import { Input, TextArea } from '@heroui/react';
import { AppButton } from '@/components/ui/AppButton';
import { AppDrawer } from '@/components/ui/AppDrawer';
import { DrawerField, DrawerSelect, DrawerSection, drawerStyles } from '@/components/drawers';
import type {
    City,
    ClientOption,
    DossierFormPayload,
    DossierRow,
} from '@/features/dossiers/types';
import type { FormErrors } from '@/lib/formErrors';
import { firstError } from '@/lib/formErrors';
import { dossierStatusOptions, dossierWorkflowOptions } from '@/config/statuses';

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
            description={
                mode === 'create'
                    ? 'Renseignez les informations du nouveau dossier.'
                    : 'Mettez à jour les informations du dossier.'
            }
            size="lg"
            placement="right"
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
            <form
                id="project-form"
                className="min-w-0 space-y-4"
                onSubmit={handleSubmit}
            >
                <DrawerSection icon={<Users size={12} />} title="Client & workflow">
                    <div className="flex flex-col gap-2">
                        <DrawerField label="Client" error={firstError(errors, 'client_id')}>
                            <DrawerSelect
                                value={form.clientId}
                                onChange={(v) => updateField('clientId', v)}
                                options={clients}
                                placeholder="Sélectionner un client"
                                isDisabled={mode === 'edit'}
                            />
                        </DrawerField>
                        <DrawerField label="Ville" error={firstError(errors, 'city_id')}>
                            <DrawerSelect
                                value={form.cityId}
                                onChange={(v) => updateField('cityId', v)}
                                options={cityOptions}
                                placeholder="Sélectionner une ville"
                            />
                        </DrawerField>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                            <DrawerField label="Statut" error={firstError(errors, 'status')}>
                                <DrawerSelect
                                    value={form.status}
                                    onChange={(v) => updateField('status', v)}
                                    options={dossierStatusOptions}
                                    placeholder="Statut"
                                />
                            </DrawerField>
                            <DrawerField label="Étape workflow" error={firstError(errors, 'workflow_step')}>
                                <DrawerSelect
                                    value={form.workflowStep}
                                    onChange={(v) => updateField('workflowStep', v)}
                                    options={dossierWorkflowOptions}
                                    placeholder="Étape workflow"
                                />
                            </DrawerField>
                        </div>
                    </div>
                </DrawerSection>

                <DrawerSection icon={<FileText size={12} />} title="Informations projet">
                    <div className="flex flex-col gap-2">
                        <DrawerField label="Objet du projet" error={firstError(errors, 'project_object')}>
                            <Input type="text" value={form.projectObject} onChange={(e) => updateField('projectObject', e.target.value)}
                                placeholder="Objet du projet" className={drawerStyles.input} />
                        </DrawerField>
                        <DrawerField label="Description" error={firstError(errors, 'description')}>
                            <TextArea value={form.description} onChange={(e) => updateField('description', e.target.value)}
                                placeholder="Description" className={drawerStyles.textarea} />
                        </DrawerField>
                    </div>
                </DrawerSection>

                <DrawerSection icon={<MapPin size={12} />} title="Localisation">
                    <div className="flex flex-col gap-2">
                        <DrawerField label="Adresse du projet" error={firstError(errors, 'project_address', 'address')}>
                            <Input type="text" value={form.projectAddress} onChange={(e) => updateField('projectAddress', e.target.value)}
                                placeholder="Adresse du projet" className={drawerStyles.input} />
                        </DrawerField>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                            <DrawerField label="Province" error={firstError(errors, 'province')}>
                                <Input type="text" value={form.province} onChange={(e) => updateField('province', e.target.value)}
                                    placeholder="Province" className={drawerStyles.input} />
                            </DrawerField>
                            <DrawerField label="Commune" error={firstError(errors, 'commune')}>
                                <Input type="text" value={form.commune} onChange={(e) => updateField('commune', e.target.value)}
                                    placeholder="Commune" className={drawerStyles.input} />
                            </DrawerField>
                        </div>
                    </div>
                </DrawerSection>

                <DrawerSection icon={<Ruler size={12} />} title="Terrain & superficie">
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <DrawerField label="N° titre foncier" error={firstError(errors, 'land_title_number')}>
                            <Input type="text" value={form.landTitleNumber} onChange={(e) => updateField('landTitleNumber', e.target.value)}
                                placeholder="N° titre foncier" className={drawerStyles.input} />
                        </DrawerField>
                        <DrawerField label="Surface terrain" error={firstError(errors, 'land_surface')}>
                            <Input type="text" value={form.landSurface} onChange={(e) => updateField('landSurface', e.target.value)}
                                placeholder="Surface terrain" className={drawerStyles.input} />
                        </DrawerField>
                        <DrawerField label="Surface plancher" error={firstError(errors, 'floor_area')}>
                            <Input type="text" value={form.floorArea} onChange={(e) => updateField('floorArea', e.target.value)}
                                placeholder="Surface plancher" className={drawerStyles.input} />
                        </DrawerField>
                    </div>
                </DrawerSection>

                <DrawerSection icon={<MessageSquareText size={12} />} title="Notes">
                    <DrawerField label="Notes" error={firstError(errors, 'notes')}>
                        <TextArea value={form.notes} onChange={(e) => updateField('notes', e.target.value)}
                            placeholder="Notes internes" className={drawerStyles.textarea} />
                    </DrawerField>
                </DrawerSection>
            </form>
        </AppDrawer>
    );
}
