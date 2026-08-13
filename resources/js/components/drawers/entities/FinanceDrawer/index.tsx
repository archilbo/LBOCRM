import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Button, Card, Input, ListBox, Select, TextArea } from '@heroui/react';
import { AppAutocomplete } from '@/components/ui/AppAutocomplete';
import { AppDrawer } from '@/components/ui/AppDrawer';
import { DateField } from '@/features/archives/components/DateField';
import { strToDate, dateToStr } from '@/lib/dateUtils';
import type { ClientOption, FinanceDossierOption, FinanceFormPayload, FinanceRecordRow } from '@/features/finance/types';
import type { FormErrors } from '@/lib/formErrors';
import { firstError } from '@/lib/formErrors';

type FinanceDrawerProps = {
    isOpen: boolean;
    mode: 'create' | 'edit';
    record: FinanceRecordRow | null;
    dossiers: FinanceDossierOption[];
    clients?: ClientOption[];
    onOpenChange: (isOpen: boolean) => void;
    onSubmit: (payload: FinanceFormPayload) => void;
    errors?: FormErrors;
};

const emptyForm: FinanceFormPayload = {
    dossierId: '', type: 'devis', status: 'draft', ht: '', tva: '', totalTtc: '', paid: '0',
    issuedAt: '', dueDate: '', paidAt: '', notes: '',
};

const labelCls = 'text-[9px] font-semibold uppercase tracking-[0.08em] text-[var(--text-subtle)]';
const compactInput = 'h-8 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-2.5 text-xs text-[var(--foreground)] placeholder:text-[var(--text-muted)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--accent)_14%,transparent)] aria-invalid:border-[var(--danger)] aria-invalid:ring-2 aria-invalid:ring-[color-mix(in_srgb,var(--danger)_12%,transparent)]';
const compactTrigger = 'flex h-8 w-full min-w-0 items-center gap-2 rounded-[var(--radius-md)] border bg-[var(--surface)] px-2.5 text-xs text-[var(--foreground)] outline-none transition border-[var(--border)] hover:border-[var(--accent)] focus-visible:border-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--accent)_18%,transparent)]';
const compactItem = 'flex cursor-pointer items-center rounded-lg px-2.5 py-2 text-xs text-[var(--foreground)] outline-none transition hover:bg-[var(--surface-2)] data-[focus-visible]:bg-[var(--surface-2)] data-[selected]:bg-[var(--accent)]/10';
const compactTextarea = 'min-h-20 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1.5 text-xs text-[var(--foreground)] placeholder:text-[var(--text-muted)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--accent)_14%,transparent)]';
const compactPopover = 'z-[70] min-w-[var(--trigger-width)] overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-lg';

export function FinanceDrawer({ isOpen, mode, record, dossiers, clients = [], onOpenChange, onSubmit, errors = {} }: FinanceDrawerProps) {
    const [form, setForm] = useState<FinanceFormPayload>(emptyForm);
    const [selectedClientId, setSelectedClientId] = useState('');

    useEffect(() => {
        if (!isOpen) return;
        setSelectedClientId('');
        if (mode === 'edit' && record) {
            setForm({
                dossierId: record.dossierId || '', type: record.type || 'devis', status: record.status || 'draft',
                ht: record.ht ? String(record.ht) : '', tva: record.tva ? String(record.tva) : '',
                totalTtc: record.totalTtc ? String(record.totalTtc) : '', paid: record.paid ? String(record.paid) : '0',
                issuedAt: record.issuedAt || '', dueDate: record.dueDate || '', paidAt: record.paidAt || '',
                notes: record.notes || '',
            });
            return;
        }
        setForm(emptyForm);
    }, [isOpen, mode, record]);

    const filteredDossiers = useMemo(
        () => (selectedClientId ? dossiers.filter((d) => d.clientId === selectedClientId) : dossiers),
        [dossiers, selectedClientId],
    );

    useEffect(() => {
        if (selectedClientId && form.dossierId && !filteredDossiers.some((d) => d.id === form.dossierId)) {
            setForm((p) => ({ ...p, dossierId: '' }));
        }
    }, [selectedClientId, form.dossierId, filteredDossiers]);

    function updateField(field: keyof FinanceFormPayload, value: string) {
        setForm((c) => ({ ...c, [field]: value }));
    }

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        onSubmit(form);
    }

    return (
        <AppDrawer
            isOpen={isOpen} onOpenChange={onOpenChange}
            title={mode === 'create' ? "Nouvel enregistrement" : "Modifier l'enregistrement"}
            description="Enregistrez un devis, une facture ou un paiement."
            footer={
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onPress={() => onOpenChange(false)}>Annuler</Button>
                    <Button variant="primary" size="sm" type="submit" form="finance-form">Enregistrer</Button>
                </div>
            }
        >
            <form id="finance-form" className="space-y-3" onSubmit={handleSubmit}>
                <Card className="p-3 space-y-3">
                    <p className={labelCls}>Projet & type</p>
                    {clients.length > 0 ? (
                        <div className="grid gap-2 md:grid-cols-2">
                            <div className="flex min-w-0 flex-col gap-1">
                                <label className={labelCls}>Client</label>
                                <AppAutocomplete
                                    value={selectedClientId}
                                    onChange={(v) => { setSelectedClientId(v); }}
                                    options={clients}
                                    placeholder="Tous les clients"
                                />
                            </div>
                            <div className="flex min-w-0 flex-col gap-1">
                                <label className={labelCls}>Dossier</label>
                                <AppAutocomplete
                                    value={form.dossierId}
                                    onChange={(v) => updateField('dossierId', v)}
                                    options={filteredDossiers}
                                    placeholder="Selectionner un dossier"
                                />
                            </div>
                        </div>
                    ) : (
                    <div className="flex min-w-0 flex-col gap-1">
                        <label className={labelCls}>Dossier</label>
                        <AppAutocomplete
                            value={form.dossierId}
                            onChange={(v) => updateField('dossierId', v)}
                            options={dossiers}
                            placeholder="Selectionner un dossier"
                        />
                    </div>
                    )}
                    <div className="grid gap-2 md:grid-cols-2">
                        <div className="flex min-w-0 flex-col gap-1">
                            <label className={labelCls}>Type</label>
                            <Select
                                selectedKey={form.type}
                                onSelectionChange={(key) => { updateField('type', key != null ? String(key) : ''); }}
                                aria-invalid={Boolean(errors.type)}
                            >
                                <Select.Trigger className={compactTrigger}><Select.Value className="flex-1 text-xs text-[var(--foreground)]" /><Select.Indicator /></Select.Trigger>
                                <Select.Popover className={compactPopover}><ListBox className="p-1 gap-0">
                                    <ListBox.Item id="devis" textValue="Devis" className={compactItem}>Devis</ListBox.Item>
                                    <ListBox.Item id="invoice" textValue="Facture" className={compactItem}>Facture</ListBox.Item>
                                    <ListBox.Item id="payment" textValue="Paiement" className={compactItem}>Paiement</ListBox.Item>
                                </ListBox></Select.Popover>
                            </Select>
                        </div>
                        <div className="flex min-w-0 flex-col gap-1">
                            <label className={labelCls}>Statut</label>
                            <Select
                                selectedKey={form.status}
                                onSelectionChange={(key) => { updateField('status', key != null ? String(key) : ''); }}
                                aria-invalid={Boolean(errors.status)}
                            >
                                <Select.Trigger className={compactTrigger}><Select.Value className="flex-1 text-xs text-[var(--foreground)]" /><Select.Indicator /></Select.Trigger>
                                <Select.Popover className={compactPopover}><ListBox className="p-1 gap-0">
                                    <ListBox.Item id="draft" textValue="Brouillon" className={compactItem}>Brouillon</ListBox.Item>
                                    <ListBox.Item id="sent" textValue="Envoye" className={compactItem}>Envoye</ListBox.Item>
                                    <ListBox.Item id="paid" textValue="Paye" className={compactItem}>Paye</ListBox.Item>
                                    <ListBox.Item id="partially_paid" textValue="Partiellement paye" className={compactItem}>Partiellement paye</ListBox.Item>
                                    <ListBox.Item id="overdue" textValue="En retard" className={compactItem}>En retard</ListBox.Item>
                                    <ListBox.Item id="cancelled" textValue="Annule" className={compactItem}>Annule</ListBox.Item>
                                </ListBox></Select.Popover>
                            </Select>
                        </div>
                    </div>
                </Card>

                <Card className="p-3 space-y-3">
                    <p className={labelCls}>Montants</p>
                    <div className="grid gap-2 md:grid-cols-2">
                        {([['ht', 'HT', 'ht'], ['tva', 'TVA', 'tva'], ['totalTtc', 'Total TTC', 'total_ttc'], ['paid', 'Paye', 'paid']] as const).map(([field, label, errorKey]) => (
                            <div key={field} className="flex min-w-0 flex-col gap-1">
                                <label className={labelCls}>{label}</label>
                                <Input className={compactInput} value={form[field]} onChange={(e) => updateField(field, e.target.value)} aria-invalid={Boolean(errors[errorKey])} />
                                {firstError(errors, errorKey) ? <p className="text-[10px] text-[var(--danger)]">{firstError(errors, errorKey)}</p> : null}
                            </div>
                        ))}
                    </div>
                </Card>

                <Card className="p-3 space-y-3">
                    <p className={labelCls}>Dates</p>
                    <div className="grid gap-2 md:grid-cols-3">
                        {([['issuedAt', "Date d'emission", 'issued_at'], ['dueDate', "Date d'echeance", 'due_date'], ['paidAt', 'Date de paiement', 'paid_at']] as const).map(([field, label, errKey]) => (
                            <DateField key={field} label={label} value={strToDate(form[field])} onChange={(d) => updateField(field, dateToStr(d))} error={firstError(errors, errKey)} />
                        ))}
                    </div>
                </Card>

                <Card className="p-3 space-y-3">
                    <p className={labelCls}>Notes</p>
                    <div className="flex min-w-0 flex-col gap-1">
                        <label className={labelCls}>Notes internes</label>
                        <TextArea className={compactTextarea} value={form.notes} onChange={(e) => updateField('notes', e.target.value)} aria-invalid={Boolean(errors.notes)} />
                        {firstError(errors, 'notes') ? <p className="text-[10px] text-[var(--danger)]">{firstError(errors, 'notes')}</p> : null}
                    </div>
                </Card>
            </form>
        </AppDrawer>
    );
}
