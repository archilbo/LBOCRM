import { FormEvent, useEffect, useMemo, useState } from 'react';
import { IconFileText, IconMapPin, IconMessage2, IconRuler, IconUsers } from '@tabler/icons-react';

import { Input, TextArea } from '@heroui/react';
import { AppAutocomplete } from '@/components/ui/AppAutocomplete';
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
import { useTranslation } from '@/lib/i18n';

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
    const { t } = useTranslation();
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
            title={mode === 'create' ? t('dossiers.drawer.createTitle') : t('dossiers.drawer.editTitle')}
            description={
                mode === 'create'
                    ? t('dossiers.drawer.createDescription')
                    : t('dossiers.drawer.editDescription')
            }
            size="lg"
            placement="right"
            footer={
                <div className="flex w-full items-center justify-end gap-2">
                    <AppButton variant="light" onPress={() => onOpenChange(false)}>
                        {t('dossiers.drawer.cancel')}
                    </AppButton>
                    <AppButton variant="solid" color="primary" type="submit" form="project-form">
                        {t('dossiers.drawer.save')}
                    </AppButton>
                </div>
            }
        >
            <form
                id="project-form"
                className="min-w-0 space-y-4"
                onSubmit={handleSubmit}
            >
                <DrawerSection icon={<IconUsers size={12} />} title={t('dossiers.drawer.clientWorkflow')}>
                    <div className="flex flex-col gap-2">
                        <DrawerField label={t('dossiers.drawer.client')} error={firstError(errors, 'client_id')}>
                            <AppAutocomplete
                                value={form.clientId}
                                onChange={(v) => updateField('clientId', v)}
                                options={clients}
                                placeholder={t('dossiers.drawer.selectClient')}
                                isDisabled={mode === 'edit'}
                            />
                        </DrawerField>
                        <DrawerField label={t('dossiers.drawer.city')} error={firstError(errors, 'city_id')}>
                            <DrawerSelect
                                value={form.cityId}
                                onChange={(v) => updateField('cityId', v)}
                                options={cityOptions}
                                placeholder={t('dossiers.drawer.selectCity')}
                            />
                        </DrawerField>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                            <DrawerField label={t('dossiers.drawer.status')} error={firstError(errors, 'status')}>
                                <DrawerSelect
                                    value={form.status}
                                    onChange={(v) => updateField('status', v)}
                                    options={dossierStatusOptions}
                                    placeholder={t('dossiers.drawer.status')}
                                />
                            </DrawerField>
                            <DrawerField label={t('dossiers.drawer.workflowStep')} error={firstError(errors, 'workflow_step')}>
                                <DrawerSelect
                                    value={form.workflowStep}
                                    onChange={(v) => updateField('workflowStep', v)}
                                    options={dossierWorkflowOptions}
                                    placeholder={t('dossiers.drawer.workflowStep')}
                                />
                            </DrawerField>
                        </div>
                    </div>
                </DrawerSection>

                <DrawerSection icon={<IconFileText size={12} />} title={t('dossiers.drawer.projectInfo')}>
                    <div className="flex flex-col gap-2">
                        <DrawerField label={t('dossiers.drawer.projectObject')} error={firstError(errors, 'project_object')}>
                            <Input type="text" value={form.projectObject} onChange={(e) => updateField('projectObject', e.target.value)}
                                placeholder={t('dossiers.drawer.projectObject')} className={drawerStyles.input} />
                        </DrawerField>
                        <DrawerField label={t('dossiers.drawer.description')} error={firstError(errors, 'description')}>
                            <TextArea value={form.description} onChange={(e) => updateField('description', e.target.value)}
                                placeholder={t('dossiers.drawer.description')} className={drawerStyles.textarea} />
                        </DrawerField>
                    </div>
                </DrawerSection>

                <DrawerSection icon={<IconMapPin size={12} />} title={t('dossiers.drawer.location')}>
                    <div className="flex flex-col gap-2">
                        <DrawerField label={t('dossiers.drawer.address')} error={firstError(errors, 'project_address', 'address')}>
                            <Input type="text" value={form.projectAddress} onChange={(e) => updateField('projectAddress', e.target.value)}
                                placeholder={t('dossiers.drawer.address')} className={drawerStyles.input} />
                        </DrawerField>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                            <DrawerField label={t('dossiers.drawer.province')} error={firstError(errors, 'province')}>
                                <Input type="text" value={form.province} onChange={(e) => updateField('province', e.target.value)}
                                    placeholder={t('dossiers.drawer.province')} className={drawerStyles.input} />
                            </DrawerField>
                            <DrawerField label={t('dossiers.drawer.commune')} error={firstError(errors, 'commune')}>
                                <Input type="text" value={form.commune} onChange={(e) => updateField('commune', e.target.value)}
                                    placeholder={t('dossiers.drawer.commune')} className={drawerStyles.input} />
                            </DrawerField>
                        </div>
                    </div>
                </DrawerSection>

                <DrawerSection icon={<IconRuler size={12} />} title={t('dossiers.drawer.landSection')}>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <DrawerField label={t('dossiers.drawer.landTitleNumber')} error={firstError(errors, 'land_title_number')}>
                            <Input type="text" value={form.landTitleNumber} onChange={(e) => updateField('landTitleNumber', e.target.value)}
                                placeholder={t('dossiers.drawer.landTitleNumber')} className={drawerStyles.input} />
                        </DrawerField>
                        <DrawerField label={t('dossiers.drawer.landSurface')} error={firstError(errors, 'land_surface')}>
                            <Input type="text" value={form.landSurface} onChange={(e) => updateField('landSurface', e.target.value)}
                                placeholder={t('dossiers.drawer.landSurface')} className={drawerStyles.input} />
                        </DrawerField>
                        <DrawerField label={t('dossiers.drawer.floorArea')} error={firstError(errors, 'floor_area')}>
                            <Input type="text" value={form.floorArea} onChange={(e) => updateField('floorArea', e.target.value)}
                                placeholder={t('dossiers.drawer.floorArea')} className={drawerStyles.input} />
                        </DrawerField>
                    </div>
                </DrawerSection>

                <DrawerSection icon={<IconMessage2 size={12} />} title={t('dossiers.drawer.notes')}>
                    <DrawerField label={t('dossiers.drawer.notes')} error={firstError(errors, 'notes')}>
                        <TextArea value={form.notes} onChange={(e) => updateField('notes', e.target.value)}
                            placeholder={t('dossiers.drawer.notesPlaceholder')} className={drawerStyles.textarea} />
                    </DrawerField>
                </DrawerSection>
            </form>
        </AppDrawer>
    );
}
