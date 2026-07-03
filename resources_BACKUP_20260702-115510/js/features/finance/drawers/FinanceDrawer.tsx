import { FormEvent, useEffect, useState } from 'react';
import type { Key } from 'react-aria-components';
import { AppButton } from '@/components/ui/AppButton';
import { AppFormErrorSummary } from '@/components/ui/AppFormErrorSummary';
import { AppDrawer } from '@/components/ui/AppDrawer';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppTextField } from '@/components/ui/AppTextField';
import { AppTextarea } from '@/components/ui/AppTextarea';
import type {
    FinanceDossierOption,
    FinanceFormPayload,
    FinanceRecordRow,
} from '@/features/finance/types';

type FinanceDrawerProps = {
    isOpen: boolean;
    mode: 'create' | 'edit';
    record: FinanceRecordRow | null;
    dossiers: FinanceDossierOption[];
    onOpenChange: (isOpen: boolean) => void;
    onSubmit: (payload: FinanceFormPayload) => void;
    errors?: FormErrors;
};

const emptyForm: FinanceFormPayload = {
    dossierId: '',
    type: 'devis',
    status: 'draft',
    ht: '',
    tva: '',
    totalTtc: '',
    paid: '0',
    issuedAt: '',
    dueDate: '',
    paidAt: '',
    notes: '',
};

const typeOptions = [
    { id: 'devis', label: 'Devis' },
    { id: 'invoice', label: 'Invoice' },
    { id: 'payment', label: 'Payment' },
];

const statusOptions = [
    { id: 'draft', label: 'Draft' },
    { id: 'sent', label: 'Sent' },
    { id: 'paid', label: 'Paid' },
    { id: 'partially_paid', label: 'Partially paid' },
    { id: 'overdue', label: 'Overdue' },
    { id: 'cancelled', label: 'Cancelled' },
];

export function FinanceDrawer({
    isOpen,
    mode,
    record,
    dossiers,
    onOpenChange,
    onSubmit,
    errors = {},
}: FinanceDrawerProps) {
    const [form, setForm] = useState<FinanceFormPayload>(emptyForm);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        if (mode === 'edit' && record) {
            setForm({
                dossierId: record.dossierId || '',
                type: record.type || 'devis',
                status: record.status || 'draft',
                ht: record.ht ? String(record.ht) : '',
                tva: record.tva ? String(record.tva) : '',
                totalTtc: record.totalTtc ? String(record.totalTtc) : '',
                paid: record.paid ? String(record.paid) : '0',
                issuedAt: record.issuedAt || '',
                dueDate: record.dueDate || '',
                paidAt: record.paidAt || '',
                notes: record.notes || '',
            });
            return;
        }

        setForm(emptyForm);
    }, [isOpen, mode, record]);

    function updateField(field: keyof FinanceFormPayload, value: string) {
        setForm((current) => ({ ...current, [field]: value }));
    }

    function updateSelect(field: keyof FinanceFormPayload, value: Key | null) {
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
            title={mode === 'create' ? 'Create finance record' : 'Edit finance record'}
            description="Save devis, invoice, or payment tracking to the database."
            footer={
                <>
                    <AppButton variant="secondary" onPress={() => onOpenChange(false)}>
                        Cancel
                    </AppButton>

                    <AppButton variant="primary" type="submit" form="finance-form">
                        Save
                    </AppButton>
                </>
            }
        >
            <form id="finance-form" className="space-y-6" onSubmit={handleSubmit}>
                <AppFormErrorSummary errors={errors} />
                <section>
                    <h3 className="mb-3 text-sm font-semibold">Project and type</h3>

                    <div className="grid gap-4">
                        <AppSelect
                            label="Dossier / Project"
                            placeholder="Select dossier"
                            selectedKey={form.dossierId}
                            onSelectionChange={(value) => updateSelect('dossierId', value)}
                            options={dossiers}
                        />

                        <div className="grid gap-4 md:grid-cols-2">
                            <AppSelect
                                label="Type"
                                selectedKey={form.type}
                                onSelectionChange={(value) => updateSelect('type', value)}
                                options={typeOptions}
                            />

                            <AppSelect
                                label="Status"
                                selectedKey={form.status}
                                onSelectionChange={(value) => updateSelect('status', value)}
                                options={statusOptions}
                            />
                        </div>
                    </div>
                </section>

                <section>
                    <h3 className="mb-3 text-sm font-semibold">Amounts</h3>

                    <div className="grid gap-4 md:grid-cols-2">
                        <AppTextField
                            label="HT"
                            value={form.ht}
                            onChange={(value) => updateField('ht', value)}
                        />

                        <AppTextField
                            label="TVA"
                            value={form.tva}
                            onChange={(value) => updateField('tva', value)}
                        />

                        <AppTextField
                            label="Total TTC"
                            value={form.totalTtc}
                            onChange={(value) => updateField('totalTtc', value)}
                        />

                        <AppTextField
                            label="Paid"
                            value={form.paid}
                            onChange={(value) => updateField('paid', value)}
                        />
                    </div>
                </section>

                <section>
                    <h3 className="mb-3 text-sm font-semibold">Dates</h3>

                    <div className="grid gap-4 md:grid-cols-3">
                        <AppTextField
                            label="Issued at"
                            value={form.issuedAt}
                            onChange={(value) => updateField('issuedAt', value)}
                        />

                        <AppTextField
                            label="Due date"
                            value={form.dueDate}
                            onChange={(value) => updateField('dueDate', value)}
                        />

                        <AppTextField
                            label="Paid at"
                            value={form.paidAt}
                            onChange={(value) => updateField('paidAt', value)}
                        />
                    </div>
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