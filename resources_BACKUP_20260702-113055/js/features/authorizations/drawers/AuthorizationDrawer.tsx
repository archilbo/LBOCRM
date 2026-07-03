import { FormEvent, useEffect, useMemo, useState } from 'react';
import type { Key } from 'react-aria-components';
import { AppButton } from '@/components/ui/AppButton';
import { AppFormErrorSummary } from '@/components/ui/AppFormErrorSummary';
import { AppDrawer } from '@/components/ui/AppDrawer';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppTextField } from '@/components/ui/AppTextField';
import { AppTextarea } from '@/components/ui/AppTextarea';
import type {
    AuthorizationDossierOption,
    AuthorizationFormPayload,
    AuthorizationRow,
} from '@/features/authorizations/types';

type AuthorizationDrawerProps = {
    isOpen: boolean;
    mode: 'create' | 'edit';
    authorization: AuthorizationRow | null;
    dossiers: AuthorizationDossierOption[];
    onOpenChange: (isOpen: boolean) => void;
    onSubmit: (payload: AuthorizationFormPayload) => void;
    errors?: FormErrors;
};

const emptyForm: AuthorizationFormPayload = {
    dossierId: '',
    authorizationNumber: '',
    submissionNumber: '',
    authorityName: '',
    authorityType: 'commune',
    status: 'not_started',
    submittedAt: '',
    approvedAt: '',
    receivedAt: '',
    observationsText: '',
    notes: '',
};

const statusOptions = [
    { id: 'not_started', label: 'Not started' },
    { id: 'submitted', label: 'Submitted' },
    { id: 'observations', label: 'Observations' },
    { id: 'approved', label: 'Approved' },
    { id: 'received', label: 'Received' },
    { id: 'rejected', label: 'Rejected' },
];

const authorityTypeOptions = [
    { id: 'commune', label: 'Commune' },
    { id: 'urban_agency', label: 'Urban agency' },
    { id: 'province', label: 'Province' },
    { id: 'other', label: 'Other' },
];

export function AuthorizationDrawer({
    isOpen,
    mode,
    authorization,
    dossiers,
    onOpenChange,
    onSubmit,
    errors = {},
}: AuthorizationDrawerProps) {
    const [form, setForm] = useState<AuthorizationFormPayload>(emptyForm);

    const dossierOptions = useMemo(
        () =>
            dossiers.map((dossier) => ({
                id: dossier.id,
                label:
                    mode === 'create' && dossier.hasAuthorization
                        ? `${dossier.label} - already has authorization`
                        : dossier.label,
            })),
        [dossiers, mode],
    );

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        if (mode === 'edit' && authorization) {
            setForm({
                dossierId: authorization.dossierId || '',
                authorizationNumber: authorization.authorizationNumber || '',
                submissionNumber: authorization.submissionNumber || '',
                authorityName: authorization.authorityName || '',
                authorityType: authorization.authorityType || 'commune',
                status: authorization.status || 'not_started',
                submittedAt: authorization.submittedAt || '',
                approvedAt: authorization.approvedAt || '',
                receivedAt: authorization.receivedAt || '',
                observationsText: authorization.observationsText || '',
                notes: authorization.notes || '',
            });
            return;
        }

        setForm(emptyForm);
    }, [authorization, isOpen, mode]);

    function updateField(field: keyof AuthorizationFormPayload, value: string) {
        setForm((current) => ({ ...current, [field]: value }));
    }

    function updateSelect(field: keyof AuthorizationFormPayload, value: Key | null) {
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
            title={mode === 'create' ? 'Create authorization' : 'Edit authorization'}
            description="Save administrative authorization tracking to the database."
            footer={
                <>
                    <AppButton variant="secondary" onPress={() => onOpenChange(false)}>
                        Cancel
                    </AppButton>

                    <AppButton variant="primary" type="submit" form="authorization-form">
                        Save
                    </AppButton>
                </>
            }
        >
            <form id="authorization-form" className="space-y-6" onSubmit={handleSubmit}>
                <AppFormErrorSummary errors={errors} />
                <section>
                    <h3 className="mb-3 text-sm font-semibold">Project and authority</h3>

                    <div className="grid gap-4">
                        <AppSelect
                            label="Dossier / Project"
                            placeholder="Select dossier"
                            selectedKey={form.dossierId}
                            onSelectionChange={(value) => updateSelect('dossierId', value)}
                            options={dossierOptions}
                        />

                        <div className="grid gap-4 md:grid-cols-2">
                            <AppTextField
                                label="Authority name"
                                value={form.authorityName}
                                onChange={(value) => updateField('authorityName', value)}
                            />

                            <AppSelect
                                label="Authority type"
                                selectedKey={form.authorityType}
                                onSelectionChange={(value) => updateSelect('authorityType', value)}
                                options={authorityTypeOptions}
                            />
                        </div>
                    </div>
                </section>

                <section>
                    <h3 className="mb-3 text-sm font-semibold">Numbers and status</h3>

                    <div className="grid gap-4 md:grid-cols-2">
                        <AppTextField
                            label="Submission number"
                            value={form.submissionNumber}
                            onChange={(value) => updateField('submissionNumber', value)}
                        />

                        <AppTextField
                            label="Authorization number"
                            value={form.authorizationNumber}
                            onChange={(value) => updateField('authorizationNumber', value)}
                        />

                        <AppSelect
                            label="Status"
                            selectedKey={form.status}
                            onSelectionChange={(value) => updateSelect('status', value)}
                            options={statusOptions}
                        />
                    </div>
                </section>

                <section>
                    <h3 className="mb-3 text-sm font-semibold">Dates</h3>

                    <div className="grid gap-4 md:grid-cols-3">
                        <AppTextField
                            label="Submitted at"
                            value={form.submittedAt}
                            onChange={(value) => updateField('submittedAt', value)}
                        />

                        <AppTextField
                            label="Approved at"
                            value={form.approvedAt}
                            onChange={(value) => updateField('approvedAt', value)}
                        />

                        <AppTextField
                            label="Received at"
                            value={form.receivedAt}
                            onChange={(value) => updateField('receivedAt', value)}
                        />
                    </div>
                </section>

                <section>
                    <AppTextarea
                        label="Observations"
                        value={form.observationsText}
                        onChange={(value) => updateField('observationsText', value)}
                    />
                </section>

                <section>
                    <AppTextarea
                        label="Notes"
                        value={form.notes}
                        onChange={(value) => updateField('notes', value)}
                    />
                </section>
            </form>
        </AppDrawer>
    );
}