import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { AppButton } from '@/components/ui/AppButton';
import { AppDrawer } from '@/components/ui/AppDrawer';
import { AppFormErrorSummary } from '@/components/ui/AppFormErrorSummary';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppTextField } from '@/components/ui/AppTextField';
import { AppTextarea } from '@/components/ui/AppTextarea';
import type { FormErrors } from '@/lib/formErrors';

type UiLockAwareFinanceDocument = {
    numberLocked?: boolean;
    numberLockedAt?: string | null;
    lock?: {
        isLocked?: boolean;
        lockedAtFormatted?: string | null;
        message?: string;
        canEditNumberFields?: boolean;
        canRegenerateExports?: boolean;
        canGeneratePdf?: boolean;
        canGenerateExcel?: boolean;
    } | null;
};

function isFinanceDocumentLocked(document: UiLockAwareFinanceDocument | null | undefined) {
    return Boolean(document?.lock?.isLocked ?? document?.numberLocked);
}

function canEditFinanceDocumentNumberFields(document: UiLockAwareFinanceDocument | null | undefined) {
    return document?.lock?.canEditNumberFields ?? !isFinanceDocumentLocked(document);
}

function FinanceDocumentLockedInlineBadge({ document }: { document: UiLockAwareFinanceDocument | null | undefined }) {
    if (!isFinanceDocumentLocked(document)) {
        return null;
    }

    const lockedAt = document?.lock?.lockedAtFormatted ?? document?.numberLockedAt ?? null;

    return (
        <span
            className="ml-2 inline-flex items-center rounded-full border border-amber-400/40 bg-amber-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-300"
            title={lockedAt ? `Locked at ${lockedAt}` : 'Locked after export'}
        >
            
            <FinanceDocumentLockInlineNotice document={document} />
Locked
        </span>
    );
}

function FinanceDocumentLockInlineNotice({ document }: { document: UiLockAwareFinanceDocument | null | undefined }) {
    if (!isFinanceDocumentLocked(document)) {
        return null;
    }

    const lockedAt = document?.lock?.lockedAtFormatted ?? document?.numberLockedAt ?? null;
    const message = document?.lock?.message ?? 'Document locked after export. Number, type, and issue date cannot be changed.';

    return (
        <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
            <div className="font-semibold text-amber-200">Locked document</div>
            <div className="mt-1 text-amber-100/80">{message}</div>
            {lockedAt ? <div className="mt-1 text-xs text-amber-100/60">Locked at {lockedAt}</div> : null}
        </div>
    );
}


type ClientOption = { id: string; label: string };
type DossierOption = { id: string; label: string };

type LineItemForm = {
    key: number;
    title: string;
    description: string;
    quantity: string;
    unit: string;
    unit_price: string;
    discount_rate: string;
    tva_rate: string;
};

export type FinanceDocFormPayload = {
    type: string;
    client_id: string;
    dossier_id: string;
    issue_date: string;
    due_date: string;
    valid_until: string;
    currency: string;
    tva_rate: string;
    notes: string;
    terms: string;
    items: LineItemForm[];
};

type CalculatedTotals = {
    subtotalHt: number;
    discountTotal: number;
    taxTotal: number;
    totalTtc: number;
};

type LineItemCalculations = {
    totalHt: number;
    totalTva: number;
    totalTtc: number;
};

const emptyItem = (key: number, tvaRate = '20'): LineItemForm => ({
    key,
    title: '',
    description: '',
    quantity: '1',
    unit: '',
    unit_price: '0',
    discount_rate: '0',
    tva_rate: tvaRate,
});

const emptyForm: FinanceDocFormPayload = {
    type: 'quote',
    client_id: '',
    dossier_id: '',
    issue_date: new Date().toISOString().slice(0, 10),
    due_date: '',
    valid_until: '',
    currency: 'MAD',
    tva_rate: '20',
    notes: '',
    terms: '',
    items: [emptyItem(1, '20')],
};

const calculateLineItem = (item: LineItemForm): LineItemCalculations => {
    const quantity = parseFloat(item.quantity) || 0;
    const unitPrice = parseFloat(item.unit_price) || 0;
    const discountRate = parseFloat(item.discount_rate) || 0;
    const tvaRate = parseFloat(item.tva_rate) || 0;

    const subtotal = quantity * unitPrice;
    const discountAmount = (subtotal * discountRate) / 100;
    const totalHt = subtotal - discountAmount;
    const totalTva = (totalHt * tvaRate) / 100;
    const totalTtc = totalHt + totalTva;

    return { totalHt, totalTva, totalTtc };
};

type Props = {
    isOpen: boolean;
    mode: 'create' | 'edit';
    clients: ClientOption[];
    dossiers: DossierOption[];
    onOpenChange: (open: boolean) => void;
    onSubmit: (payload: FinanceDocFormPayload) => void;
    initialType?: string;
    errors?: FormErrors;
};

export function FinanceDocumentDrawer({
    isOpen,
    mode,
    clients,
    dossiers,
    onOpenChange,
    onSubmit,
    initialType,
    errors = {},
}: Props) {
    const [form, setForm] = useState<FinanceDocFormPayload>(emptyForm);
    const [nextItemKey, setNextItemKey] = useState(2);

    useEffect(() => {
        if (isOpen && mode === 'create') {
            setForm({
                ...emptyForm,
                type: initialType || emptyForm.type,
                items: [emptyItem(1, emptyForm.tva_rate)],
            });
            setNextItemKey(2);
        }
    }, [isOpen, mode, initialType]);

    const update = useCallback(
        <K extends keyof FinanceDocFormPayload>(
            key: K,
            value: FinanceDocFormPayload[K],
        ) => setForm((prev) => ({ ...prev, [key]: value })),
        [],
    );

    const updateItem = useCallback(
        (itemKey: number, field: keyof LineItemForm, value: string) => {
            setForm((prev) => ({
                ...prev,
                items: prev.items.map((item) =>
                    item.key === itemKey ? { ...item, [field]: value } : item,
                ),
            }));
        },
        [],
    );

    const addItem = useCallback(() => {
        setForm((prev) => ({
            ...prev,
            items: [
                ...prev.items,
                emptyItem(nextItemKey, prev.tva_rate),
            ],
        }));
        setNextItemKey((k) => k + 1);
    }, [nextItemKey]);

    const removeItem = useCallback((itemKey: number) => {
        setForm((prev) => ({
            ...prev,
            items: prev.items.filter((item) => item.key !== itemKey),
        }));
    }, []);

    const totals: CalculatedTotals = useMemo(() => {
        let subtotalHt = 0;
        let discountTotal = 0;
        let taxTotal = 0;

        form.items.forEach(item => {
            const calc = calculateLineItem(item);
            const quantity = parseFloat(item.quantity) || 0;
            const unitPrice = parseFloat(item.unit_price) || 0;
            const discountRate = parseFloat(item.discount_rate) || 0;
            
            subtotalHt += calc.totalHt;
            taxTotal += calc.totalTva;
            discountTotal += (quantity * unitPrice * discountRate) / 100;
        });

        const totalTtc = subtotalHt + taxTotal;

        return { subtotalHt, discountTotal, taxTotal, totalTtc };
    }, [form.items]);

    const formatCurrency = (amount: number): string => {
        return amount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    function handleSubmit() {
        onSubmit(form);
    }

    const typeOptions = [
        { id: 'quote', label: 'Devis' },
        { id: 'invoice', label: 'Facture' },
        { id: 'receipt', label: 'Reçu' },
    ];

    const clientOptions = clients.map((c) => ({ id: c.id, label: c.label }));
    const dossierOptions = dossiers.map((d) => ({ id: d.id, label: d.label }));

    return (
        <AppDrawer
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            title={mode === 'create' ? 'New document' : 'Edit document'}
            description={
                mode === 'create'
                    ? 'Create a new devis, invoice, or receipt.'
                    : 'Update the document details and items.'
            }
            footer={
                <>
                    <AppButton variant="ghost" onPress={() => onOpenChange(false)}>
                        Cancel
                    </AppButton>
                    <AppButton variant="primary" onPress={handleSubmit}>
                        {mode === 'create' ? 'Create' : 'Save'}
                    </AppButton>
                </>
            }
        >
            <div className="space-y-5">
                <AppFormErrorSummary errors={errors} />

                <AppSelect
                    label="Type"
                    options={typeOptions}
                    selectedKey={form.type}
                    onSelectionChange={(key) => update('type', String(key))}
                />

                <AppSelect
                    label="Client"
                    placeholder="Select client"
                    options={
                        form.client_id
                            ? [{ id: '', label: 'None' }, ...clientOptions]
                            : clientOptions
                    }
                    selectedKey={form.client_id || undefined}
                    onSelectionChange={(key) => update('client_id', key ? String(key) : '')}
                />

                <AppSelect
                    label="Project"
                    placeholder="Select project"
                    options={
                        form.dossier_id
                            ? [{ id: '', label: 'None' }, ...dossierOptions]
                            : dossierOptions
                    }
                    selectedKey={form.dossier_id || undefined}
                    onSelectionChange={(key) => update('dossier_id', key ? String(key) : '')}
                />

                <div className="grid grid-cols-2 gap-3">
                    <AppTextField
                        label="Issue date"
                        type="date"
                        value={form.issue_date}
                        onChange={(v) => update('issue_date', v)}
                    />
                    <AppTextField
                        label="Due date"
                        type="date"
                        value={form.due_date}
                        onChange={(v) => update('due_date', v)}
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <AppTextField
                        label="Valid until"
                        type="date"
                        value={form.valid_until}
                        onChange={(v) => update('valid_until', v)}
                    />
                    <AppTextField
                        label="TVA rate (%)"
                        type="number"
                        value={form.tva_rate}
                        onChange={(v) => update('tva_rate', v)}
                    />
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-[var(--text)]">
                            Line items
                        </h3>
                        <AppButton variant="ghost" size="sm" onPress={addItem}>
                            <Plus size={14} />
                            Add item
                        </AppButton>
                    </div>

                    <div className="space-y-3">
                        {form.items.map((item, idx) => {
                            const itemTotals = calculateLineItem(item);
                            return (
                            <div
                                key={item.key}
                                className="space-y-2 rounded-2xl border p-3"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-[var(--text-muted)]">
                                        Item {idx + 1}
                                    </span>
                                    {form.items.length > 1 && (
                                        <AppButton
                                            variant="ghost"
                                            size="sm"
                                            onPress={() => removeItem(item.key)}
                                        >
                                            <Trash2 size={13} />
                                        </AppButton>
                                    )}
                                </div>

                                <AppTextField
                                    label="Title"
                                    value={item.title}
                                    onChange={(v) => updateItem(item.key, 'title', v)}
                                />

                                <AppTextarea
                                    label="Description"
                                    value={item.description}
                                    onChange={(v) =>
                                        updateItem(item.key, 'description', v)
                                    }
                                />

                                <div className="grid grid-cols-4 gap-2">
                                    <AppTextField
                                        label="Qty"
                                        type="number"
                                        step="0.001"
                                        value={item.quantity}
                                        onChange={(v) =>
                                            updateItem(item.key, 'quantity', v)
                                        }
                                    />
                                    <AppTextField
                                        label="Unit"
                                        value={item.unit}
                                        onChange={(v) =>
                                            updateItem(item.key, 'unit', v)
                                        }
                                    />
                                    <AppTextField
                                        label="Unit price"
                                        type="number"
                                        step="0.01"
                                        value={item.unit_price}
                                        onChange={(v) =>
                                            updateItem(item.key, 'unit_price', v)
                                        }
                                    />
                                    <AppTextField
                                        label="Disc. %"
                                        type="number"
                                        step="0.01"
                                        value={item.discount_rate}
                                        onChange={(v) =>
                                            updateItem(item.key, 'discount_rate', v)
                                        }
                                    />
                                </div>

                                <div className="mt-2 flex justify-between text-xs text-[var(--text-muted)]">
                                    <span>HT: {formatCurrency(itemTotals.totalHt)} MAD</span>
                                    <span>TVA: {formatCurrency(itemTotals.totalTva)} MAD</span>
                                    <span>TTC: {formatCurrency(itemTotals.totalTtc)} MAD</span>
                                </div>
                            </div>
                        );})}
                    </div>
                </div>

                <div className="rounded-2xl border p-4 bg-[var(--card-muted)]">
                    <h3 className="mb-3 text-sm font-medium text-[var(--text)]">Totals</h3>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-sm text-[var(--text-muted)]">Subtotal HT</span>
                            <span className="font-mono text-sm">{formatCurrency(totals.subtotalHt)} MAD</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-[var(--text-muted)]">Discount</span>
                            <span className="font-mono text-sm text-[var(--danger)]">-{formatCurrency(totals.discountTotal)} MAD</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-[var(--text-muted)]">TVA ({form.tva_rate}%)</span>
                            <span className="font-mono text-sm">{formatCurrency(totals.taxTotal)} MAD</span>
                        </div>
                        <div className="pt-2 border-t border-[var(--border)] flex justify-between">
                            <span className="text-base font-semibold text-[var(--text)]">Total TTC</span>
                            <span className="font-mono text-base font-bold text-[var(--primary)]">{formatCurrency(totals.totalTtc)} MAD</span>
                        </div>
                    </div>
                </div>

                <AppTextarea
                    label="Notes"
                    value={form.notes}
                    onChange={(v) => update('notes', v)}
                />

                <AppTextarea
                    label="Terms"
                    value={form.terms}
                    onChange={(v) => update('terms', v)}
                />
            </div>
        </AppDrawer>
    );
}