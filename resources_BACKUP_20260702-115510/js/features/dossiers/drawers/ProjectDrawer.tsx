import { FormEvent, useEffect, useState } from 'react';
import type { Key } from 'react-aria-components';
import { AppButton } from '@/components/ui/AppButton';
import { AppDrawer } from '@/components/ui/AppDrawer';
import { AppFormErrorSummary } from '@/components/ui/AppFormErrorSummary';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppTextField } from '@/components/ui/AppTextField';
import { AppTextarea } from '@/components/ui/AppTextarea';
import type {
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
    initialClientId?: string;
    onOpenChange: (isOpen: boolean) => void;
    onSubmit: (payload: DossierFormPayload) => void;
    errors?: FormErrors;
};

const emptyForm: DossierFormPayload = {
    clientId: '',
    projectObject: '',
    description: '',
    address: '',
    province: '',
    commune: '',
    landTitleNumber: '',
    landSurface: '',
    floorArea: '',
    status: 'opened',
    workflowStep: 'client',
};

function stringValue(value: unknown): string {
    if (value === null || value === undefined) {
        return '';
    }

    return String(value);
}

export function ProjectDrawer({
    isOpen,
    mode,
    dossier,
    clients,
    initialClientId = '',
    onOpenChange,
    onSubmit,
    errors = {},
}: ProjectDrawerProps) {
    const [form, setForm] = useState<DossierFormPayload>(emptyForm);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        if (mode === 'edit' && dossier) {
            const current = dossier as unknown as Record<string, unknown>;

            setForm({
                clientId: stringValue(current.clientId),
                projectObject: stringValue(current.projectObject),
                description: stringValue(current.description),
                address: stringValue(current.address),
                province: stringValue(current.province),
                commune: stringValue(current.commune),
                landTitleNumber: stringValue(current.landTitleNumber),
                landSurface: stringValue(current.landSurface),
                floorArea: stringValue(current.floorArea),
                status: stringValue(current.status) || 'opened',
                workflowStep: stringValue(current.workflowStep) || 'client',
            });

            return;
        }

        setForm({
            ...emptyForm,
            clientId: initialClientId,
        });
    }, [dossier, initialClientId, isOpen, mode]);

    function updateField(field: keyof DossierFormPayload, value: string) {
        setForm((current) => ({ ...current, [field]: value }));
    }

    function updateSelect(field: keyof DossierFormPayload, value: Key | null) {
        setForm((current) => ({ ...current, [field]: value ? String(value) : '' }));
    }

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        onSubmit(form);
    }

    return (
        <AppDrawer
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            title={mode === 'create' ? 'Create project' : 'Edit project'}
            description="Save project/dossier information to the database."
            footer={
                <>
                    <AppButton variant="secondary" onPress={() => onOpenChange(false)}>
                        Cancel
                    </AppButton>

                    <AppButton variant="primary" type="submit" form="project-form">
                        Save
                    </AppButton>
                </>
            }
        >
            <form id="project-form" className="space-y-6" onSubmit={handleSubmit}>
                <AppFormErrorSummary errors={errors} />

                <section>
                    <h3 className="mb-3 text-sm font-semibold">Client and workflow</h3>

                    <div className="grid gap-4">
                        <AppSelect
                            label="Client"
                            placeholder="Select client"
                            selectedKey={form.clientId}
                            onSelectionChange={(value) => updateSelect('clientId', value)}
                            options={clients}
                            error={firstError(errors, 'client_id')}
                        />

                        <div className="grid gap-4 md:grid-cols-2">
                            <AppSelect
                                label="Status"
                                selectedKey={form.status}
                                onSelectionChange={(value) => updateSelect('status', value)}
                                options={dossierStatusOptions}
                                error={firstError(errors, 'status')}
                            />

                            <AppSelect
                                label="Workflow step"
                                selectedKey={form.workflowStep}
                                onSelectionChange={(value) => updateSelect('workflowStep', value)}
                                options={dossierWorkflowOptions}
                                error={firstError(errors, 'workflow_step')}
                            />
                        </div>
                    </div>
                </section>

                <section>
                    <h3 className="mb-3 text-sm font-semibold">Project information</h3>

                    <div className="grid gap-4">
                        <AppTextField
                            label="Project object"
                            placeholder="Example: Villa construction study"
                            value={form.projectObject}
                            onChange={(value) => updateField('projectObject', value)}
                            error={firstError(errors, 'project_object')}
                        />

                        <AppTextarea
                            label="Description"
                            value={form.description}
                            onChange={(value) => updateField('description', value)}
                            error={firstError(errors, 'description')}
                        />
                    </div>
                </section>

                <section>
                    <h3 className="mb-3 text-sm font-semibold">Location</h3>

                    <div className="grid gap-4">
                        <AppTextField
                            label="Address"
                            value={form.address}
                            onChange={(value) => updateField('address', value)}
                            error={firstError(errors, 'project_address', 'address')}
                        />

                        <div className="grid gap-4 md:grid-cols-2">
                            <AppTextField
                                label="Province"
                                value={form.province}
                                onChange={(value) => updateField('province', value)}
                                error={firstError(errors, 'province')}
                            />

                            <AppTextField
                                label="Commune"
                                value={form.commune}
                                onChange={(value) => updateField('commune', value)}
                                error={firstError(errors, 'commune')}
                            />
                        </div>
                    </div>
                </section>

                <section>
                    <h3 className="mb-3 text-sm font-semibold">Land and surface</h3>

                    <div className="grid gap-4 md:grid-cols-3">
                        <AppTextField
                            label="Land title number"
                            value={form.landTitleNumber}
                            onChange={(value) => updateField('landTitleNumber', value)}
                            error={firstError(errors, 'land_title_number')}
                        />

                        <AppTextField
                            label="Land surface"
                            value={form.landSurface}
                            onChange={(value) => updateField('landSurface', value)}
                            error={firstError(errors, 'land_surface')}
                        />

                        <AppTextField
                            label="Floor area"
                            value={form.floorArea}
                            onChange={(value) => updateField('floorArea', value)}
                            error={firstError(errors, 'floor_area')}
                        />
                    </div>
                </section>
            </form>
        </AppDrawer>
    );
}
