import { FormEvent, useEffect, useState } from 'react';
import {
    BadgeDollarSign, CalendarClock, CalendarDays, CalendarPlus, ChevronDown, FileText,
    Hash, Percent, PiggyBank, ReceiptText,
} from 'lucide-react';
import { ListBox, Select } from '@heroui/react';
import { AppButton } from '@/components/ui/AppButton';
import { AppDrawer } from '@/components/ui/AppDrawer';
import { AppFormErrorSummary } from '@/components/ui/AppFormErrorSummary';
import { AppTextField } from '@/components/ui/AppTextField';
import { AppTextarea } from '@/components/ui/AppTextarea';
import type {
    FinanceDossierOption,
    FinanceFormPayload,
    FinanceRecordRow,
} from '@/features/finance/types';
import type { FormErrors } from '@/lib/formErrors';
import { firstError } from '@/lib/formErrors';
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
    { id: 'invoice', label: 'Facture' },
    { id: 'payment', label: 'Paiement' },
];

const statusOptions = [
    { id: 'draft', label: 'Brouillon' },
    { id: 'sent', label: 'Envoyé' },
    { id: 'paid', label: 'Payé' },
    { id: 'partially_paid', label: 'Partiellement payé' },
    { id: 'overdue', label: 'En retard' },
    { id: 'cancelled', label: 'Annulé' },
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
        if (!isOpen) return;
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

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        onSubmit(form);
    }

    return (
        <AppDrawer
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            title={mode === 'create' ? 'Nouvel enregistrement' : 'Modifier l\'enregistrement'}
            description="Enregistrez un devis, une facture ou un paiement."
            footer={
                <div className="flex w-full items-center justify-end gap-2">
                    <AppButton variant="light" onPress={() => onOpenChange(false)}>
                        Annuler
                    </AppButton>
                    <AppButton variant="solid" color="primary" type="submit" form="finance-form">
                        Enregistrer
                    </AppButton>
                </div>
            }
        >
            <form id="finance-form" className="space-y-3" onSubmit={handleSubmit}>
                <AppFormErrorSummary errors={errors} />

                <div>
                    <p className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--text-subtle)]">
                        <BadgeDollarSign size={12} /> Projet & type
                    </p>
                    <div className="grid gap-2">
                        <HeroSelect
                            placeholder="Sélectionner un dossier"
                            value={form.dossierId}
                            onChange={(v) => updateField('dossierId', v)}
                            options={dossiers}
                            error={firstError(errors, 'dossier_id')}
                        />
                        <div className="grid gap-2 md:grid-cols-2">
                            <HeroSelect
                                placeholder="Type"
                                value={form.type}
                                onChange={(v) => updateField('type', v)}
                                options={typeOptions}
                                error={firstError(errors, 'type')}
                            />
                            <HeroSelect
                                placeholder="Statut"
                                value={form.status}
                                onChange={(v) => updateField('status', v)}
                                options={statusOptions}
                                error={firstError(errors, 'status')}
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <p className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--text-subtle)]">
                        <ReceiptText size={12} /> Montants
                    </p>
                    <div className="grid gap-2 md:grid-cols-2">
                        <AppTextField
                            placeholder="HT"
                            value={form.ht}
                            onChange={(value) => updateField('ht', value)}
                            error={firstError(errors, 'ht')}
                            icon={<Hash size={13} />}
                            size="sm"
                        />
                        <AppTextField
                            placeholder="TVA"
                            value={form.tva}
                            onChange={(value) => updateField('tva', value)}
                            error={firstError(errors, 'tva')}
                            icon={<Percent size={13} />}
                            size="sm"
                        />
                        <AppTextField
                            placeholder="Total TTC"
                            value={form.totalTtc}
                            onChange={(value) => updateField('totalTtc', value)}
                            error={firstError(errors, 'total_ttc')}
                            icon={<BadgeDollarSign size={13} />}
                            size="sm"
                        />
                        <AppTextField
                            placeholder="Payé"
                            value={form.paid}
                            onChange={(value) => updateField('paid', value)}
                            error={firstError(errors, 'paid')}
                            icon={<PiggyBank size={13} />}
                            size="sm"
                        />
                    </div>
                </div>

                <div>
                    <p className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--text-subtle)]">
                        <CalendarDays size={12} /> Dates
                    </p>
                    <div className="grid gap-2 md:grid-cols-3">
                        <AppTextField
                            placeholder="Date d'émission"
                            value={form.issuedAt}
                            onChange={(value) => updateField('issuedAt', value)}
                            error={firstError(errors, 'issued_at')}
                            icon={<CalendarPlus size={13} />}
                            size="sm"
                        />
                        <AppTextField
                            placeholder="Date d'échéance"
                            value={form.dueDate}
                            onChange={(value) => updateField('dueDate', value)}
                            error={firstError(errors, 'due_date')}
                            icon={<CalendarClock size={13} />}
                            size="sm"
                        />
                        <AppTextField
                            placeholder="Date de paiement"
                            value={form.paidAt}
                            onChange={(value) => updateField('paidAt', value)}
                            error={firstError(errors, 'paid_at')}
                            icon={<CalendarDays size={13} />}
                            size="sm"
                        />
                    </div>
                </div>

                <div>
                    <p className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--text-subtle)]">
                        <FileText size={12} /> Notes
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
