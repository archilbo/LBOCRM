import { FormEvent, useEffect, useState } from 'react';
import type { Key } from 'react-aria-components';
import { AppButton } from '@/components/ui/AppButton';
import { AppFormErrorSummary } from '@/components/ui/AppFormErrorSummary';
import { AppDrawer } from '@/components/ui/AppDrawer';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppTextField } from '@/components/ui/AppTextField';
import { AppTextarea } from '@/components/ui/AppTextarea';
import type { FormErrors } from '@/lib/formErrors';
import { firstError } from '@/lib/formErrors';
import type {
    ClientFormPayload,
    ClientRow,
    IntermediaryOption,
} from '@/features/clients/types';
import { useTranslation } from '@/lib/i18n';

type ClientDrawerProps = {
    isOpen: boolean;
    mode: 'create' | 'edit';
    client: ClientRow | null;
    intermediaries: IntermediaryOption[];
    onOpenChange: (isOpen: boolean) => void;
    onSubmit: (payload: ClientFormPayload) => void;
    errors?: FormErrors;
};

const emptyForm: ClientFormPayload = {
    firstName: '',
    lastName: '',
    cin: '',
    phone: '',
    email: '',
    address: '',
    fatherName: '',
    motherName: '',
    cniExpirationDate: '',
    intermediaryId: '',
    notes: '',
};

export function ClientDrawer({
    isOpen,
    mode,
    client,
    intermediaries,
    onOpenChange,
    onSubmit,
    errors = {},
}: ClientDrawerProps) {
    const { t } = useTranslation();
    const [form, setForm] = useState<ClientFormPayload>(emptyForm);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        if (mode === 'edit' && client) {
            setForm({
                firstName: client.firstName ?? '',
                lastName: client.lastName ?? '',
                cin: client.cin ?? '',
                phone: client.phone ?? '',
                email: client.email ?? '',
                address: client.address ?? '',
                fatherName: client.fatherName ?? '',
                motherName: client.motherName ?? '',
                cniExpirationDate: client.cniExpirationDate ?? '',
                intermediaryId: client.intermediaryId ?? '',
                notes: client.notes ?? '',
            });
            return;
        }

        setForm(emptyForm);
    }, [client, isOpen, mode]);

    function updateField(field: keyof ClientFormPayload, value: string) {
        setForm((current) => ({ ...current, [field]: value }));
    }

    function updateSelect(value: Key | null) {
        setForm((current) => ({ ...current, intermediaryId: value ? String(value) : '' }));
    }

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        onSubmit(form);
    }

    const intermediaryOptions = [
        {
            id: '',
            label: t('clientFormExtra.none'),
        },
        ...intermediaries,
    ];

    return (
        <AppDrawer
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            title={mode === 'create' ? t('clients.drawer.createTitle') : t('clients.drawer.editTitle')}
            description={mode === 'create' ? t('clients.drawer.createDescription') : t('clients.drawer.editDescription')}
            footer={
                <>
                    <AppButton variant="secondary" onPress={() => onOpenChange(false)}>
                        {t('actions.cancel')}
                    </AppButton>

                    <AppButton variant="primary" type="submit" form="client-form">
                        {t('actions.save')}
                    </AppButton>
                </>
            }
        >
            <form id="client-form" className="space-y-6" onSubmit={handleSubmit}>`r`n                <AppFormErrorSummary errors={errors} />
                <section>
                    <h3 className="mb-3 text-sm font-semibold">{t('clients.form.identity')}</h3>

                    <div className="grid gap-4 md:grid-cols-2">
                        <AppTextField
                            label={t('clients.form.firstName')}
                            placeholder={t('clients.form.firstNamePlaceholder')}
                            error={firstError(errors, 'first_name')}
                            value={form.firstName}
                            onChange={(value) => updateField('firstName', value)}
                        />
                        <AppTextField
                            label={t('clients.form.lastName')}
                            placeholder={t('clients.form.lastNamePlaceholder')}
                            error={firstError(errors, 'last_name')}
                            value={form.lastName}
                            onChange={(value) => updateField('lastName', value)}
                        />
                        <AppTextField
                            label={t('clients.form.cin')}
                            placeholder={t('clients.form.cinPlaceholder')}
                            error={firstError(errors, 'cin')}
                            value={form.cin}
                            onChange={(value) => updateField('cin', value)}
                        />
                        <AppTextField
                            label={t('clients.form.fatherName')}
                            value={form.fatherName}
                            onChange={(value) => updateField('fatherName', value)}
                        />
                        <AppTextField
                            label={t('clientFormExtra.motherName')}
                            value={form.motherName}
                            onChange={(value) => updateField('motherName', value)}
                        />
                        <AppSelect
                            label={t('clientFormExtra.intermediary')}
                            placeholder={t('clientFormExtra.intermediaryPlaceholder')}
                            error={firstError(errors, 'intermediary_id')}
                            selectedKey={form.intermediaryId}
                            onSelectionChange={updateSelect}
                            options={intermediaryOptions}
                        />
                    </div>
                </section>

                <section>
                    <h3 className="mb-3 text-sm font-semibold">{t('clients.form.contact')}</h3>

                    <div className="grid gap-4 md:grid-cols-2">
                        <AppTextField
                            label={t('clients.form.phone')}
                            placeholder={t('clients.form.phonePlaceholder')}
                            error={firstError(errors, 'phone')}
                            value={form.phone}
                            onChange={(value) => updateField('phone', value)}
                        />
                        <AppTextField
                            label={t('clients.form.email')}
                            placeholder={t('clients.form.emailPlaceholder')}
                            error={firstError(errors, 'email')}
                            value={form.email}
                            onChange={(value) => updateField('email', value)}
                        />
                        <div className="md:col-span-2">
                            <AppTextField
                                label={t('clients.form.address')}
                                placeholder={t('clients.form.addressPlaceholder')}
                                value={form.address}
                                onChange={(value) => updateField('address', value)}
                            />
                        </div>
                    </div>
                </section>

                <section>
                    <h3 className="mb-3 text-sm font-semibold">{t('clients.form.extra')}</h3>

                    <div className="grid gap-4 md:grid-cols-2">
                        <AppTextField
                            label={t('clients.form.cniExpirationDate')}
                            value={form.cniExpirationDate}
                            onChange={(value) => updateField('cniExpirationDate', value)}
                        />
                        <div className="md:col-span-2">
                            <AppTextarea
                                label={t('clients.form.notes')}
                                placeholder={t('clients.form.notesPlaceholder')}
                                value={form.notes}
                                onChange={(value) => updateField('notes', value)}
                            />
                        </div>
                    </div>
                </section>
            </form>
        </AppDrawer>
    );
}