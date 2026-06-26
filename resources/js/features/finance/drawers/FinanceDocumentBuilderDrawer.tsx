import { useEffect, useMemo, useState } from 'react';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import { AppButton } from '@/components/ui/AppButton';
import { AppDrawer } from '@/components/ui/AppDrawer';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppTextField } from '@/components/ui/AppTextField';
import { AppTextarea } from '@/components/ui/AppTextarea';
import { FinanceClientDossierFields } from '@/features/finance/components/FinanceClientDossierFields';
import { FinanceDateFields } from '@/features/finance/components/FinanceDateFields';
import { FinanceDocumentPreview } from '@/features/finance/components/FinanceDocumentPreview';
import { FinanceItemsTable } from '@/features/finance/components/FinanceItemsTable';
import { FinanceTotalsBox } from '@/features/finance/components/FinanceTotalsBox';
import type { ClientOption, DossierOption, FinanceDocument, FinanceDocumentItem, FinanceDocumentType, FinanceSettings, TemplateOption } from '@/features/finance/types';
import { calculateItem, calculateTotals, createEmptyItem, normalizeNumber } from '@/features/finance/utils/calculations';

type FinanceDocumentBuilderDrawerProps = {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    mode: 'create' | 'edit';
    type: FinanceDocumentType;
    document?: FinanceDocument | null;
    clients: ClientOption[];
    dossiers: DossierOption[];
    templates: TemplateOption[];
    settings: FinanceSettings;
};

type BuilderForm = {
    type: FinanceDocumentType;
    clientId: string;
    dossierId: string;
    issueDate: string;
    dueDate: string;
    validUntil: string;
    currency: string;
    tvaRate: number;
    discountTotal: number;
    notes: string;
    terms: string;
    templateId: string;
    items: FinanceDocumentItem[];
};

const today = () => new Date().toISOString().slice(0, 10);

function addDays(date: string, days: number): string {
    const value = new Date(`${date}T00:00:00`);
    value.setDate(value.getDate() + days);
    return value.toISOString().slice(0, 10);
}

function createForm(type: FinanceDocumentType, settings: FinanceSettings, document?: FinanceDocument | null): BuilderForm {
    const issueDate = document?.issueDate || today();

    if (document) {
        return {
            type: document.type,
            clientId: document.client ? String(document.client.id) : '',
            dossierId: document.dossier ? String(document.dossier.id) : '',
            issueDate,
            dueDate: document.dueDate || '',
            validUntil: document.validUntil || '',
            currency: document.currency || settings.defaultCurrency,
            tvaRate: normalizeNumber(document.tvaRate || settings.defaultTvaRate),
            discountTotal: normalizeNumber(document.discountTotal),
            notes: document.notes || '',
            terms: document.terms || '',
            templateId: document.templateId ? String(document.templateId) : '',
            items: document.items.length > 0
                ? document.items.map((item, index) => calculateItem({ ...item, position: index + 1 }, document.tvaRate || settings.defaultTvaRate))
                : [createEmptyItem(settings.defaultTvaRate)],
        };
    }

    return {
        type,
        clientId: '',
        dossierId: '',
        issueDate,
        dueDate: type === 'invoice' ? addDays(issueDate, settings.defaultPaymentTermsDays) : '',
        validUntil: type === 'quote' ? addDays(issueDate, settings.defaultQuoteValidityDays) : '',
        currency: settings.defaultCurrency,
        tvaRate: settings.defaultTvaRate,
        discountTotal: 0,
        notes: '',
        terms: '',
        templateId: '',
        items: [createEmptyItem(settings.defaultTvaRate)],
    };
}

export function FinanceDocumentBuilderDrawer({
    isOpen,
    onOpenChange,
    mode,
    type,
    document,
    clients,
    dossiers,
    templates,
    settings,
}: FinanceDocumentBuilderDrawerProps) {
    const [form, setForm] = useState<BuilderForm>(() => createForm(type, settings, document));

    useEffect(() => {
        if (isOpen) {
            setForm(createForm(type, settings, document));
        }
    }, [document, isOpen, settings, type]);

    const totals = useMemo(
        () => calculateTotals(form.items, form.discountTotal, form.tvaRate),
        [form.discountTotal, form.items, form.tvaRate],
    );

    const selectedClient = clients.find((client) => client.id === form.clientId);
    const selectedDossier = dossiers.find((dossier) => dossier.id === form.dossierId);
    const title = mode === 'edit'
        ? `Modifier ${document?.number || 'document'}`
        : form.type === 'quote'
            ? 'Nouveau devis'
            : form.type === 'invoice'
                ? 'Nouvelle facture'
                : 'Nouveau recu';

    function update<K extends keyof BuilderForm>(key: K, value: BuilderForm[K]) {
        setForm((prev) => ({ ...prev, [key]: value }));
    }

    function submit() {
        const payload = {
            type: form.type,
            client_id: form.clientId || null,
            dossier_id: form.dossierId || null,
            issue_date: form.issueDate || null,
            due_date: form.dueDate || null,
            valid_until: form.validUntil || null,
            currency: form.currency,
            tva_rate: form.tvaRate,
            discount_total: form.discountTotal,
            notes: form.notes || null,
            terms: form.terms || null,
            template_id: form.templateId || null,
            items: form.items.map((item, index) => ({
                title: item.title || `Ligne ${index + 1}`,
                description: item.description || null,
                quantity: item.quantity || 1,
                unit: item.unit || null,
                unit_price: item.unitPrice || 0,
                discount_rate: item.discountRate || 0,
                tva_rate: item.tvaRate || form.tvaRate,
            })),
        };

        const options = {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(mode === 'edit' ? 'Document mis a jour.' : 'Document cree.');
                onOpenChange(false);
            },
            onError: () => toast.error('Impossible enregistrer le document.'),
        };

        if (mode === 'edit' && document) {
            router.put(`/finance/documents/${document.id}`, payload, options);
            return;
        }

        router.post('/finance/documents', payload, options);
    }

    return (
        <AppDrawer
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            title={title}
            description="Construire le document avec calcul HT, TVA, TTC et apercu en direct."
            panelClassName="!w-[min(1200px,calc(100vw-24px))] !max-w-[1200px] sm:!w-[min(1200px,calc(100vw-40px))]"
            footer={
                <>
                    <AppButton variant="ghost" onPress={() => onOpenChange(false)}>Annuler</AppButton>
                    <AppButton variant="primary" onPress={submit}>Enregistrer</AppButton>
                </>
            }
        >
            <div className="finance-builder-container"><div className="finance-builder-layout">
                <div className="min-w-0 space-y-5">
                    <div className="grid gap-3 sm:grid-cols-3">
                        <AppSelect
                            label="Type"
                            options={[
                                { id: 'quote', label: 'Devis' },
                                { id: 'invoice', label: 'Facture' },
                                { id: 'receipt', label: 'Recu' },
                            ]}
                            selectedKey={form.type}
                            onSelectionChange={(key) => update('type', String(key || 'quote') as FinanceDocumentType)}
                        />
                        <AppTextField label="Devise" value={form.currency} onChange={(value) => update('currency', value)} />
                        <AppTextField label="TVA par defaut (%)" type="number" min="0" max="100" step="0.01" value={String(form.tvaRate)} onChange={(value) => update('tvaRate', normalizeNumber(value))} />
                    </div>

                    <FinanceClientDossierFields
                        clientId={form.clientId}
                        dossierId={form.dossierId}
                        clients={clients}
                        dossiers={dossiers}
                        onClientChange={(value) => update('clientId', value)}
                        onDossierChange={(value) => update('dossierId', value)}
                    />

                    <FinanceDateFields
                        type={form.type}
                        issueDate={form.issueDate}
                        dueDate={form.dueDate}
                        validUntil={form.validUntil}
                        onChange={(field, value) => update(field, value)}
                    />

                    <div className="grid gap-3 sm:grid-cols-2">
                        <AppTextField label="Remise document" type="number" min="0" step="0.01" value={String(form.discountTotal)} onChange={(value) => update('discountTotal', normalizeNumber(value))} />
                        <AppSelect
                            label="Template"
                            placeholder="Template optionnel"
                            options={[{ id: '', label: 'Aucun template' }, ...templates.filter((template) => template.type === form.type || template.type === 'finance')]}
                            selectedKey={form.templateId || null}
                            onSelectionChange={(key) => update('templateId', key ? String(key) : '')}
                        />
                    </div>

                    <FinanceItemsTable
                        items={totals.items}
                        defaultTvaRate={form.tvaRate}
                        currency={form.currency}
                        onChange={(items) => update('items', items)}
                    />

                    <FinanceTotalsBox
                        subtotalHt={totals.subtotalHt}
                        discountTotal={totals.discountTotal}
                        taxTotal={totals.taxTotal}
                        totalTtc={totals.totalTtc}
                        paidTotal={document?.paidTotal || 0}
                        remainingTotal={document ? Math.max(0, totals.totalTtc - document.paidTotal) : totals.totalTtc}
                        currency={form.currency}
                    />

                    <div className="grid gap-3 lg:grid-cols-2">
                        <AppTextarea label="Notes" value={form.notes} onChange={(value) => update('notes', value)} />
                        <AppTextarea label="Conditions" value={form.terms} onChange={(value) => update('terms', value)} />
                    </div>
                </div>

                <FinanceDocumentPreview
                    type={form.type}
                    number={document?.number}
                    clientLabel={selectedClient?.label}
                    dossierLabel={selectedDossier?.label}
                    issueDate={form.issueDate}
                    dueDate={form.dueDate}
                    validUntil={form.validUntil}
                    currency={form.currency}
                    items={totals.items}
                    subtotalHt={totals.subtotalHt}
                    discountTotal={totals.discountTotal}
                    taxTotal={totals.taxTotal}
                    totalTtc={totals.totalTtc}
                    notes={form.notes}
                    terms={form.terms}
                />
            </div></div>
        </AppDrawer>
    );
}

