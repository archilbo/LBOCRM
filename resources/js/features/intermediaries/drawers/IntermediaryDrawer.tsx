import { FormEvent, useEffect, useState } from 'react';
import { Input, TextArea } from '@heroui/react';
import { AppButton } from '@/components/ui/AppButton';
import { AppDrawer } from '@/components/ui/AppDrawer';
import { DrawerField, DrawerSelect, drawerStyles } from '@/components/drawers';
import type { IntermediaryFormPayload, IntermediaryRow } from '@/features/intermediaries/types';
import type { FormErrors } from '@/lib/formErrors';
import { firstError } from '@/lib/formErrors';
import { useTranslation } from '@/lib/i18n';

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

export function IntermediaryDrawer({
    isOpen,
    mode,
    intermediary,
    onOpenChange,
    onSubmit,
    errors = {},
}: IntermediaryDrawerProps) {
    const { t } = useTranslation();
    const [form, setForm] = useState<IntermediaryFormPayload>(emptyForm);
    const typeOptions = [
        { id: 'person', label: t('intermediaries.types.person') },
        { id: 'agency', label: t('intermediaries.types.agency') },
        { id: 'architect_partner', label: t('intermediaries.types.architect_partner') },
        { id: 'business_referral', label: t('intermediaries.types.business_referral') },
        { id: 'other', label: t('intermediaries.types.other') },
    ];
    const statusOptions = [
        { id: 'active', label: t('intermediaries.statuses.active') },
        { id: 'inactive', label: t('intermediaries.statuses.inactive') },
    ];

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

    function updateType(value: string) {
        updateField('type', value || 'person');
    }

    function updateStatus(value: string) {
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
            title={mode === 'create' ? t('intermediaries.form.createTitle') : t('intermediaries.form.editTitle')}
            description={t('intermediaries.form.description')}
            footer={
                <>
                    <AppButton variant="secondary" onPress={() => onOpenChange(false)}>
                        {t('intermediaries.cancel')}
                    </AppButton>
                    <AppButton variant="primary" type="submit" form="intermediary-form">
                        {t('intermediaries.save')}
                    </AppButton>
                </>
            }
        >
            <form id="intermediary-form" className="space-y-4" onSubmit={handleSubmit}>
                <DrawerField label={t('intermediaries.form.name')} error={firstError(errors, 'name')}>
                    <Input type="text" value={form.name} onChange={(e) => updateField('name', e.target.value)}
                        className={drawerStyles.input} />
                </DrawerField>

                <div className="grid gap-4 md:grid-cols-2">
                    <DrawerField label={t('intermediaries.type')} error={firstError(errors, 'type')}>
                        <DrawerSelect value={form.type} onChange={updateType} options={typeOptions} />
                    </DrawerField>

                    <DrawerField label={t('intermediaries.status')} error={firstError(errors, 'is_active')}>
                        <DrawerSelect value={form.isActive ? 'active' : 'inactive'} onChange={updateStatus} options={statusOptions} />
                    </DrawerField>

                    <DrawerField label={t('intermediaries.form.phone')} error={firstError(errors, 'phone')}>
                        <Input type="tel" value={form.phone} onChange={(e) => updateField('phone', e.target.value)}
                            className={drawerStyles.input} />
                    </DrawerField>

                    <DrawerField label={t('intermediaries.form.email')} error={firstError(errors, 'email')}>
                        <Input type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)}
                            className={drawerStyles.input} />
                    </DrawerField>
                </div>

                <DrawerField label={t('intermediaries.form.notes')} error={firstError(errors, 'notes')}>
                    <TextArea value={form.notes} onChange={(e) => updateField('notes', e.target.value)}
                        className={drawerStyles.textarea} />
                </DrawerField>
            </form>
        </AppDrawer>
    );
}
