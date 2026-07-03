import { FormEvent, useEffect, useState } from 'react';
import type { Key } from 'react-aria-components';
import { AppButton } from '@/components/ui/AppButton';
import { AppDrawer } from '@/components/ui/AppDrawer';
import { AppFormErrorSummary } from '@/components/ui/AppFormErrorSummary';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppTextarea } from '@/components/ui/AppTextarea';
import { AppTextField } from '@/components/ui/AppTextField';
import { useTranslation } from '@/lib/i18n';
import type { FormErrors } from '@/lib/formErrors';
import { firstError } from '@/lib/formErrors';
import type { ClientFormPayload, ClientRow, IntermediaryOption } from '@/features/clients/types';

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
    firstName: '', lastName: '', cin: '', phone: '', email: '',
    address: '', fatherName: '', motherName: '', cniExpirationDate: '',
    intermediaryId: '', notes: '',
};

export function ClientDrawer({ isOpen, mode, client, intermediaries, onOpenChange, onSubmit, errors = {} }: ClientDrawerProps) {
    const { t } = useTranslation();
    const [form, setForm] = useState<ClientFormPayload>(emptyForm);

    useEffect(() => {
        if (!isOpen) return;
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
        setForm((prev) => ({ ...prev, [field]: value }));
    }

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        onSubmit(form);
    }

    const title = mode === 'create' ? t('clients.drawer.createTitle') : t('clients.drawer.editTitle');
    const description = mode === 'create' ? t('clients.drawer.createDescription') : t('clients.drawer.editDescription');

    return (
        <AppDrawer
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            title={title}
            description={description}
            footer={
                <>
                    <AppButton variant="bordered" onPress={() => onOpenChange(false)}>
                        {t('clients.cancel')}
                    </AppButton>
                    <AppButton variant="solid" color="primary" type="submit" form="client-form">
                        {mode === 'create' ? t('clients.create') : t('clients.save')}
                    </AppButton>
                </>
            }
        >
            <form id="client-form" onSubmit={handleSubmit} className="space-y-6">
                <AppFormErrorSummary errors={errors} />

                {/* ── Identity section ── */}
                <div>
                    <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
                        {t('clients.form.identity')}
                    </p>
                    <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <AppTextField
                                label={t('clients.form.firstName')}
                                placeholder={t('clients.form.firstNamePlaceholder')}
                                value={form.firstName}
                                onChange={(v) => updateField('firstName', v)}
                                error={errors.first_name}
                            />
                            <AppTextField
                                label={t('clients.form.lastName')}
                                placeholder={t('clients.form.lastNamePlaceholder')}
                                value={form.lastName}
                                onChange={(v) => updateField('lastName', v)}
                                error={errors.last_name}
                            />
                        </div>
                        <AppTextField
                            label={t('clients.form.cin')}
                            placeholder={t('clients.form.cinPlaceholder')}
                            value={form.cin}
                            onChange={(v) => updateField('cin', v)}
                            error={errors.cin}
                        />
                    </div>
                </div>

                {/* ── Contact section ── */}
                <div>
                    <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
                        {t('clients.form.contact')}
                    </p>
                    <div className="space-y-3">
                        <AppTextField
                            label={t('clients.form.phone')}
                            placeholder={t('clients.form.phonePlaceholder')}
                            value={form.phone}
                            onChange={(v) => updateField('phone', v)}
                            error={errors.phone}
                        />
                        <AppTextField
                            label={t('clients.form.email')}
                            placeholder={t('clients.form.emailPlaceholder')}
                            value={form.email}
                            onChange={(v) => updateField('email', v)}
                            error={errors.email}
                        />
                        <AppTextField
                            label={t('clients.form.address')}
                            placeholder={t('clients.form.addressPlaceholder')}
                            value={form.address}
                            onChange={(v) => updateField('address', v)}
                            error={errors.address}
                        />
                    </div>
                </div>

                {/* ── Relationship section ── */}
                <div>
                    <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
                        {t('clients.form.extra')}
                    </p>
                    <div className="space-y-3">
                        <AppSelect
                            label={t('clients.form.intermediaryName')}
                            placeholder={t('clients.selectIntermediary')}
                            options={intermediaries}
                            selectedKey={form.intermediaryId || null}
                            onSelectionChange={(key: Key | null) => updateField('intermediaryId', key ? String(key) : '')}
                            error={errors.intermediary_id}
                        />
                        <AppTextarea
                            label={t('clients.form.notes')}
                            placeholder={t('clients.form.notesPlaceholder')}
                            value={form.notes}
                            onChange={(v) => updateField('notes', v)}
                            error={errors.notes}
                            rows={3}
                        />
                    </div>
                </div>
            </form>
        </AppDrawer>
    );
}
