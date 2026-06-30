import { FormEvent, useEffect, useState } from 'react';
import type { Key } from 'react-aria-components';
import { AppButton } from '@/components/ui/AppButton';
import { AppDrawer } from '@/components/ui/AppDrawer';
import { AppFormErrorSummary } from '@/components/ui/AppFormErrorSummary';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppTextField } from '@/components/ui/AppTextField';
import { AppTextarea } from '@/components/ui/AppTextarea';
import type { IntermediaryFormPayload, IntermediaryRow } from '@/features/intermediaries/types';
import type { FormErrors } from '@/lib/formErrors';
import { firstError } from '@/lib/formErrors';

type IntermediaryDrawerProps = {
    isOpen: boolean;
    mode: 'create' | 'edit';
    intermediary: IntermediaryRow | null;
    onOpenChange: (isOpen: boolean) => void;
    onSubmit: (payload: IntermediaryFormPayload) => void;
    errors?: FormErrors;
};

const emptyForm: IntermediaryFormPayload = {
    name: '',
    type: 'person',
    phone: '',
    email: '',
    notes: '',
    isActive: true,
};

const typeOptions = [
    { id: 'person', label: 'Personne' },
    { id: 'agency', label: 'Agence' },
    { id: 'architect_partner', label: 'Partenaire architecte' },
    { id: 'business_referral', label: 'Apporteur affaires' },
    { id: 'other', label: 'Autre' },
];

const statusOptions = [
    { id: 'active', label: 'Actif' },
    { id: 'inactive', label: 'Inactif' },
];

export function IntermediaryDrawer({
    isOpen,
    mode,
    intermediary,
    onOpenChange,
    onSubmit,
    errors = {},
}: IntermediaryDrawerProps) {
    const [form, setForm] = useState<IntermediaryFormPayload>(emptyForm);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        if (mode === 'edit' && intermediary) {
            setForm({
                name: intermediary.name ?? '',
                type: intermediary.type ?? 'person',
                phone: intermediary.phone ?? '',
                email: intermediary.email ?? '',
                notes: intermediary.notes ?? '',
                isActive: intermediary.isActive,
            });
            return;
        }

        setForm(emptyForm);
    }, [intermediary, isOpen, mode]);

    function updateField(field: keyof IntermediaryFormPayload, value: string | boolean) {
        setForm((current) => ({ ...current, [field]: value }));
    }

    function updateType(value: Key | null) {
        updateField('type', value ? String(value) : 'person');
    }

    function updateStatus(value: Key | null) {
        updateField('isActive', value !== 'inactive');
    }

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        onSubmit(form);
    }

    return (
        <AppDrawer
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            title={mode === 'create' ? 'Nouvel intermediaire' : 'Modifier intermediaire'}
            description="Gerer les apporteurs, agences et contacts qui orientent les clients."
            footer={
                <>
                    <AppButton variant="secondary" onPress={() => onOpenChange(false)}>
                        Annuler
                    </AppButton>
                    <AppButton variant="primary" type="submit" form="intermediary-form">
                        Enregistrer
                    </AppButton>
                </>
            }
        >
            <form id="intermediary-form" className="space-y-5" onSubmit={handleSubmit}>
                <AppFormErrorSummary errors={errors} />

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="md:col-span-2">
                        <AppTextField
                            label="Nom"
                            value={form.name}
                            error={firstError(errors, 'name')}
                            onChange={(value) => updateField('name', value)}
                        />
                    </div>

                    <AppSelect
                        label="Type"
                        selectedKey={form.type}
                        options={typeOptions}
                        error={firstError(errors, 'type')}
                        onSelectionChange={updateType}
                    />

                    <AppSelect
                        label="Statut"
                        selectedKey={form.isActive ? 'active' : 'inactive'}
                        options={statusOptions}
                        error={firstError(errors, 'is_active')}
                        onSelectionChange={updateStatus}
                    />

                    <AppTextField
                        label="Telephone"
                        value={form.phone}
                        error={firstError(errors, 'phone')}
                        onChange={(value) => updateField('phone', value)}
                    />

                    <AppTextField
                        label="Email"
                        value={form.email}
                        error={firstError(errors, 'email')}
                        onChange={(value) => updateField('email', value)}
                    />

                    <div className="md:col-span-2">
                        <AppTextarea
                            label="Notes"
                            value={form.notes}
                            error={firstError(errors, 'notes')}
                            onChange={(value) => updateField('notes', value)}
                        />
                    </div>
                </div>
            </form>
        </AppDrawer>
    );
}
