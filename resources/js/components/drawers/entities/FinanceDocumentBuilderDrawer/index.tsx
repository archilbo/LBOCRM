import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { router } from '@inertiajs/react';
import { Button, Card, Input, ListBox, Select, TextArea } from '@heroui/react';
import { IconCalendar, IconCheck, IconChevronLeft, IconChevronRight, IconEye, IconEyeOff, IconFileText, IconSettings, IconUser } from '@tabler/icons-react';

import { toast } from 'sonner';
import { AppDrawer } from '@/components/ui/AppDrawer';
import { DocPreviewIframe } from '@/features/finance/components/DocPreviewIframe';
import { FinanceClientDossierFields } from '@/features/finance/components/FinanceClientDossierFields';
import { FinanceDateFields } from '@/features/finance/components/FinanceDateFields';
import { FinanceDocumentLockNotice, getFinanceDocumentLockMessage, isFinanceDocumentLocked } from '@/features/finance/components/FinanceDocumentLockNotice';
import { FinanceItemsTable } from '@/features/finance/components/FinanceItemsTable';
import { FinanceTotalsBox } from '@/features/finance/components/FinanceTotalsBox';
import type { ClientOption, DossierOption, FinanceDocument, FinanceDocumentItem, FinanceDocumentType, FinanceSettings, TemplateOption } from '@/features/finance/types';
import { calculateItem, calculateTotals, createEmptyItem, formatCompactMoney, normalizeCurrency, normalizeNumber } from '@/features/finance/utils/calculations';

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
    onSaved?: (type: FinanceDocumentType) => void;
    defaultClientId?: string;
    defaultDossierId?: string;
    defaultFinanceTtc?: number | null;
    returnTo?: string;
    restrictedDossierIds?: string[];
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

function createForm(type: FinanceDocumentType, settings: FinanceSettings, document?: FinanceDocument | null, defaultClientId?: string, defaultDossierId?: string, templates?: TemplateOption[], defaultFinanceTtc?: number | null): BuilderForm {
    const issueDate = document?.issueDate || today();
    if (document) {
        return {
            type: document.type,
            clientId: document.client ? String(document.client.id) : '',
            dossierId: document.dossier ? String(document.dossier.id) : '',
            issueDate,
            dueDate: document.dueDate || '',
            validUntil: document.validUntil || '',
            currency: normalizeCurrency(document.currency || settings.defaultCurrency),
            tvaRate: normalizeNumber(document.tvaRate || settings.defaultTvaRate),
            discountTotal: normalizeNumber(document.discountTotal),
            notes: document.notes || '',
            terms: document.terms || '',
            templateId: document.templateId ? String(document.templateId) : '',
            items: document.items.length > 0
                ? document.items.map((item, index) => calculateItem({ ...item, position: index + 1 }))
                : [createEmptyItem()],
        };
    }
    const defaultTemplate = (templates || []).find((t) => t.type === type || t.type === 'finance');
    return {
        type, clientId: defaultClientId || '', dossierId: defaultDossierId || '', issueDate,
        dueDate: type === 'invoice' ? addDays(issueDate, settings.defaultPaymentTermsDays) : '',
        validUntil: type === 'quote' ? addDays(issueDate, settings.defaultQuoteValidityDays) : '',
        currency: normalizeCurrency(settings.defaultCurrency), tvaRate: settings.defaultTvaRate, discountTotal: 0,
        notes: '', terms: '', templateId: defaultTemplate ? String(defaultTemplate.id) : '',
        items: defaultFinanceTtc && defaultFinanceTtc > 0
            ? [calculateItem({ position: 1, title: 'Honoraires architecte', quantity: 1, unit: 'forfait', unitPrice: defaultFinanceTtc })]
            : [createEmptyItem()],
    };
}

const labelCls = 'text-[9px] font-semibold uppercase tracking-[0.08em] text-[var(--text-subtle)]';
const compactInput = 'h-8 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-2.5 text-xs text-[var(--foreground)] placeholder:text-[var(--text-muted)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--accent)_14%,transparent)]';
const compactTrigger = 'flex h-8 w-full min-w-0 items-center gap-2 rounded-[var(--radius-md)] border bg-[var(--surface)] px-2.5 text-xs text-[var(--foreground)] outline-none transition border-[var(--border)] hover:border-[var(--accent)] focus-visible:border-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--accent)_18%,transparent)]';
const compactItem = 'flex cursor-pointer items-center rounded-lg px-2.5 py-2 text-xs text-[var(--foreground)] outline-none transition hover:bg-[var(--surface-2)] data-[focus-visible]:bg-[var(--surface-2)] data-[selected]:bg-[var(--accent)]/10';
const compactTextarea = 'min-h-20 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1.5 text-xs text-[var(--foreground)] placeholder:text-[var(--text-muted)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--accent)_14%,transparent)]';
const compactPopover = 'z-[70] min-w-[var(--trigger-width)] overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-lg';

const steps = [
    { label: 'Client & dossier', icon: IconUser },
    { label: 'Lignes, dates & remise', icon: IconFileText },
    { label: 'Template & confirmation', icon: IconSettings },
];

export function FinanceDocumentBuilderDrawer({
    isOpen, onOpenChange, mode, type, document, clients, dossiers, templates, settings, onSaved, defaultClientId, defaultDossierId, defaultFinanceTtc, returnTo, restrictedDossierIds = [],
}: FinanceDocumentBuilderDrawerProps) {
    const [form, setForm] = useState<BuilderForm>(() => createForm(type, settings, isOpen ? null : document, defaultClientId, defaultDossierId, templates, defaultFinanceTtc));
    const [step, setStep] = useState(0);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewHtml, setPreviewHtml] = useState<string | null>(null);
    const [previewLoading, setPreviewLoading] = useState(false);
    const previewDebounce = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const isLocked = isFinanceDocumentLocked(document);
    const canEditNumberFields = !isLocked && (document?.lock?.canEditNumberFields ?? true);
    const lockMessage = isLocked ? getFinanceDocumentLockMessage(document) : undefined;
    const selectedTemplate = templates.find((t) => String(t.id) === form.templateId);

    const formInitRef = useRef({ type, settings, document, defaultClientId, defaultDossierId, templates, defaultFinanceTtc });
    useEffect(() => { formInitRef.current = { type, settings, document, defaultClientId, defaultDossierId, templates, defaultFinanceTtc }; });
    useEffect(() => {
        if (isOpen) {
            const { type: t, settings: s, document: d, defaultClientId: c, defaultDossierId: dossierId, templates: tmpl, defaultFinanceTtc: financeTtc } = formInitRef.current;
            setForm(createForm(t, s, d, c, dossierId, tmpl, financeTtc));
            setStep(0);
            setPreviewHtml(null);
        }
         
    }, [isOpen, document?.id]);

    const fetchPreview = useCallback(async () => {
        if (!form.templateId && !document?.templateId) return;
        setPreviewLoading(true);
        try {
            const body = {
                type: form.type,
                template_id: form.templateId,
                client_id: form.clientId,
                dossier_id: form.dossierId,
                issue_date: form.issueDate,
                due_date: form.dueDate,
                valid_until: form.validUntil,
                currency: form.currency,
                tva_rate: form.tvaRate,
                discount_total: form.discountTotal,
                notes: form.notes,
                terms: form.terms,
                items: form.items.map((item) => ({
                    title: item.title,
                    description: item.description,
                    quantity: item.quantity,
                    unit: item.unit,
                    unit_price: item.unitPrice,
                    total_ht: item.totalHt,
                    total_tva: item.totalTva,
                    total_ttc: item.totalTtc,
                })),
            };
            const token = window.document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
            const response = await fetch('/finance/documents/preview', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-CSRF-TOKEN': token, 'X-Requested-With': 'XMLHttpRequest' },
                body: JSON.stringify(body),
            });
            if (!response.ok) throw new Error('Preview failed');
            const data = await response.json();
            setPreviewHtml(data.html);
        } catch {
            setPreviewHtml(null);
        } finally {
            setPreviewLoading(false);
        }
    }, [form, document?.templateId]);

    useEffect(() => {
        if (!previewOpen) { setPreviewHtml(null); return; }
        clearTimeout(previewDebounce.current);
        previewDebounce.current = setTimeout(fetchPreview, 400);
        return () => clearTimeout(previewDebounce.current);
    }, [previewOpen, fetchPreview]);

    const userDossiers = useMemo(
        () => (form.clientId ? dossiers.filter((d) => d.clientId === form.clientId) : dossiers),
        [dossiers, form.clientId],
    );
    const hasNoDossiers = Boolean(form.clientId) && userDossiers.length === 0;
    const isDossierRestricted = Boolean(form.dossierId) && restrictedDossierIds.includes(form.dossierId);
    const isBlocked = mode === 'create' && (hasNoDossiers || isDossierRestricted);
    const canAdvanceStep0 = Boolean(form.clientId && form.dossierId) && !isBlocked;

    const totals = useMemo(() => calculateTotals(form.items, form.discountTotal), [form.discountTotal, form.items]);
    const selectedClient = clients.find((c) => c.id === form.clientId);
    const selectedDossier = dossiers.find((d) => d.id === form.dossierId);
    const title = mode === 'edit'
        ? `Modifier ${document?.number || 'document'}`
        : form.type === 'quote' ? 'Nouveau devis' : form.type === 'invoice' ? 'Nouvelle facture' : 'Nouveau recu';

    function update<K extends keyof BuilderForm>(key: K, value: BuilderForm[K]) {
        setForm((prev) => ({ ...prev, [key]: value }));
    }

    function submit() {
        const payload = {
            ...(mode === 'edit' && isLocked ? {} : { type: form.type, issue_date: form.issueDate || null }),
            ...(mode === 'edit' ? {} : { client_id: form.clientId || null, dossier_id: form.dossierId || null }),
            due_date: form.dueDate || null, valid_until: form.validUntil || null,
            currency: form.currency, tva_rate: form.tvaRate, discount_total: form.discountTotal,
            notes: form.notes || null, terms: form.terms || null, template_id: form.templateId || null,
            return_to: returnTo || null,
            items: form.items.map((item, i) => ({ title: item.title || `Ligne ${i + 1}`, description: item.description || null, quantity: item.quantity || 1, unit: item.unit || null, unit_price: item.unitPrice || 0 })),
        };
        const opts = { preserveScroll: true, preserveState: false, onSuccess: () => { toast.success(mode === 'edit' ? 'Document mis à jour.' : 'Document créé.'); onSaved?.(form.type); onOpenChange(false); }, onError: () => toast.error("Impossible d'enregistrer le document.") };
        if (mode === 'edit' && document) { router.put(`/finance/documents/${document.id}`, payload, opts); return; }
        router.post('/finance/documents', payload, opts);
    }

    return (
        <AppDrawer
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            title={title}
            description="Construire le document avec calcul HT, TVA, TTC et aperçu en direct."
            panelClassName="!w-[min(1200px,calc(100vw-24px))] !max-w-[1200px] sm:!w-[min(1200px,calc(100vw-40px))]"
            footer={
                <div className="flex items-center justify-between gap-2">
                    <Button variant="ghost" size="sm" onPress={() => onOpenChange(false)}>Annuler</Button>
                    <div className="flex items-center gap-2">
                        {step > 0 ? (
                            <Button variant="tertiary" size="sm" onPress={() => setStep(step - 1)}>
                                <IconChevronLeft size={14} /> Précédent
                            </Button>
                        ) : null}
                        {step < steps.length - 1 ? (
                            <Button variant="primary" size="sm" isDisabled={step === 0 && !canAdvanceStep0} onPress={() => setStep(step + 1)}>
                                Suivant <IconChevronRight size={14} />
                            </Button>
                        ) : (
                            <Button variant="primary" size="sm" onPress={submit} isDisabled={isBlocked}>Creer le document</Button>
                        )}
                    </div>
                </div>
            }
        >
            <div className="finance-builder-container">
                {/* Step indicators */}
                <div className="mb-4 flex items-center gap-1">
                    {steps.map((s, i) => {
                        const StepIcon = s.icon;
                        const isActive = i === step;
                        const isPast = i < step;
                        return (
                            <div key={s.label} className="flex items-center gap-1">
                                {i > 0 ? <div className="mx-1 h-px w-6 bg-[var(--border)]" /> : null}
                                <button
                                    type="button"
                                    onClick={() => { if (i <= step) setStep(i); }}
                                    className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                                        isActive ? 'bg-[var(--accent)]/10 text-[var(--accent)]' : isPast ? 'text-[var(--text-muted)]' : 'text-[var(--text-muted)] opacity-50'
                                    }`}
                                >
                                    {isPast ? <IconCheck size={12} /> : <StepIcon size={12} />}
                                    <span className="hidden sm:inline">{s.label}</span>
                                </button>
                            </div>
                        );
                    })}
                </div>

                <div className={`finance-builder-layout${previewOpen ? '' : ' !grid-cols-1'}`}>
                    <div className="min-w-0 space-y-3">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex flex-wrap items-center gap-2">
                                <FinanceDocumentLockNotice document={document} compact />
                                {lockMessage && !canEditNumberFields ? <p className="text-[9px] text-amber-400">{lockMessage}</p> : null}
                                {hasNoDossiers ? <p className="text-[9px] text-amber-400">Impossible de créer un document : ce client n&apos;a aucun dossier</p> : null}
                                {isDossierRestricted ? <p className="text-[9px] text-red-400">Impossible de créer un document : ce dossier a déjà un devis/facture</p> : null}
                            </div>
                            <Button variant="ghost" size="sm" onPress={() => setPreviewOpen((p) => !p)} className="shrink-0">
                                {previewOpen ? <IconEyeOff size={14} /> : <IconEye size={14} />}
                                {previewOpen ? 'Masquer' : 'Apercu'}
                            </Button>
                        </div>

                        {step === 0 ? (
                            <>
                                <FinanceClientDossierFields
                                    clientId={form.clientId} dossierId={form.dossierId}
                                    clients={clients} dossiers={userDossiers}
                                    onClientChange={(v) => update('clientId', v)} onDossierChange={(v) => {
                                        update('dossierId', v);
                                        const financeTtc = userDossiers.find((dossier) => dossier.id === v)?.financeTtc;

                                        if (mode === 'create' && financeTtc && financeTtc > 0) {
                                            setForm((current) => {
                                                const isEmptySingleLine = current.items.length === 1
                                                    && current.items[0].totalTtc === 0;

                                                return isEmptySingleLine
                                                    ? { ...current, items: [calculateItem({ position: 1, title: 'Honoraires architecte', quantity: 1, unit: 'forfait', unitPrice: financeTtc })] }
                                                    : current;
                                            });
                                        }
                                    }}
                                    disabled={mode === 'edit'}
                                    restrictedDossierIds={restrictedDossierIds}
                                />
                                <div className="grid gap-2 lg:grid-cols-2">
                                    <div className="flex min-w-0 flex-col gap-1">
                                        <label className={labelCls}>Notes</label>
                                        <TextArea className={compactTextarea} value={form.notes} onChange={(e) => update('notes', e.target.value)} />
                                    </div>
                                    <div className="flex min-w-0 flex-col gap-1">
                                        <label className={labelCls}>Conditions</label>
                                        <TextArea className={compactTextarea} value={form.terms} onChange={(e) => update('terms', e.target.value)} />
                                    </div>
                                </div>
                            </>
                        ) : null}

                        {step === 1 ? (
                            <>
                                <FinanceItemsTable items={totals.items} currency={form.currency} onChange={(items) => update('items', items)} disabled={isBlocked} />

                                <FinanceTotalsBox
                                    subtotalHt={totals.subtotalHt} discountTotal={totals.discountTotal} taxTotal={totals.taxTotal}
                                    totalTtc={totals.totalTtc} paidTotal={document?.paidTotal || 0}
                                    remainingTotal={document ? Math.max(0, totals.totalTtc - document.paidTotal) : totals.totalTtc}
                                    currency={form.currency}
                                />

                                <FinanceDateFields
                                    type={form.type} issueDate={form.issueDate} dueDate={form.dueDate} validUntil={form.validUntil}
                                    isIssueDateDisabled={!canEditNumberFields}
                                    isDisabled={isBlocked}
                                    onChange={(f, v) => update(f, v)}
                                />

                                <Card className="p-3 space-y-3">
                                    <div className="flex items-center gap-1.5 mb-2"><IconSettings size={13} className="text-[var(--text-subtle)]" /><p className={labelCls}>Remise</p></div>
                                    <div className="grid gap-2 sm:grid-cols-2">
                                        <div className="flex min-w-0 flex-col gap-1">
                                            <label className={labelCls}>Remise document</label>
                                            <Input disabled={isBlocked} className={compactInput} type="number" min="0" step="0.01" value={String(form.discountTotal)} onChange={(e) => update('discountTotal', normalizeNumber(e.target.value))} />
                                        </div>
                                    </div>
                                </Card>
                            </>
                        ) : null}

                        {step === 2 ? (
                            <>
                                <Card className="p-3 space-y-3">
                                    <div className="flex items-center gap-1.5 mb-2"><IconSettings size={13} className="text-[var(--text-subtle)]" /><p className={labelCls}>Template</p></div>
                                    <Select
                                        isDisabled={isBlocked}
                                        selectedKey={form.templateId || null}
                                        onSelectionChange={(key) => update('templateId', key != null ? String(key) : '')}
                                    >
                                        <Select.Trigger className={compactTrigger}><Select.Value className="flex-1 text-xs text-[var(--foreground)]" /><Select.Indicator /></Select.Trigger>
                                        <Select.Popover className={compactPopover}><ListBox className="p-1 gap-0">
                                            <ListBox.Item id="" textValue="Aucun template" className={compactItem}>Aucun template</ListBox.Item>
                                            {templates.filter((t) => t.type === form.type || t.type === 'finance').map((t) => (
                                                <ListBox.Item key={String(t.id)} id={String(t.id)} textValue={t.label} className={compactItem}>{t.label}</ListBox.Item>
                                            ))}
                                        </ListBox></Select.Popover>
                                    </Select>
                                </Card>

                                <Card className="p-3 space-y-3">
                                    <div className="flex items-center gap-1.5 mb-2"><IconFileText size={13} className="text-[var(--text-subtle)]" /><p className={labelCls}>Resume du document</p></div>
                                    <div className="grid gap-3 text-[10px] sm:grid-cols-2">
                                        <div>
                                            <p className="font-semibold text-[var(--text)]">Client</p>
                                            <p className="text-[var(--text-muted)]">{selectedClient?.label || '-'}</p>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-[var(--text)]">Dossier</p>
                                            <p className="text-[var(--text-muted)]">{selectedDossier?.label || '-'}</p>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-[var(--text)]">Date emission</p>
                                            <p className="text-[var(--text-muted)]">{form.issueDate || '-'}</p>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-[var(--text)]">{form.type === 'invoice' ? 'Echeance' : 'Validite'}</p>
                                            <p className="text-[var(--text-muted)]">{form.type === 'invoice' ? (form.dueDate || '-') : (form.validUntil || '-')}</p>
                                        </div>
                                    </div>
                                    <div className="border-t border-[var(--border)] pt-3">
                                        <p className="mb-1.5 font-semibold text-[var(--text)]">Lignes ({totals.items.length})</p>
                                        <div className="space-y-1">
                                            {totals.items.slice(0, 5).map((item, i) => (
                                                <div key={i} className="flex items-center justify-between text-[10px] text-[var(--text-muted)]">
                                                    <span className="truncate mr-2">{item.title || `Ligne ${i + 1}`}</span>
                                                    <span className="shrink-0 font-mono">{item.quantity} x {formatCompactMoney(item.unitPrice, form.currency)}</span>
                                                </div>
                                            ))}
                                            {totals.items.length > 5 ? <p className="text-[9px] text-[var(--text-muted)]">... et {totals.items.length - 5} ligne(s) supplementaire(s)</p> : null}
                                        </div>
                                    </div>
                                    <FinanceTotalsBox
                                        subtotalHt={totals.subtotalHt} discountTotal={totals.discountTotal} taxTotal={totals.taxTotal}
                                        totalTtc={totals.totalTtc} paidTotal={document?.paidTotal || 0}
                                        remainingTotal={document ? Math.max(0, totals.totalTtc - document.paidTotal) : totals.totalTtc}
                                        currency={form.currency}
                                    />
                                </Card>
                            </>
                        ) : null}


                    </div>

                    {previewOpen ? (
                        previewLoading ? (
                            <div className="finance-builder-preview flex items-center justify-center rounded-[var(--radius-md)] border bg-[var(--surface-2)] p-8">
                                <p className="text-xs text-[var(--text-muted)]">Apercu en cours...</p>
                            </div>
                        ) : previewHtml ? (
                            <DocPreviewIframe html={previewHtml} className="finance-builder-preview" />
                        ) : form.templateId ? (
                            <div className="finance-builder-preview flex items-center justify-center rounded-[var(--radius-md)] border bg-[var(--surface-2)] p-8">
                                <p className="text-xs text-[var(--text-muted)]">Impossible de generer l&apos;apercu.</p>
                            </div>
                        ) : (
                            <div className="finance-builder-preview flex items-center justify-center rounded-[var(--radius-md)] border bg-[var(--surface-2)] p-8">
                                <p className="text-xs text-[var(--text-muted)]">Selectionnez un template pour voir l&apos;apercu.</p>
                            </div>
                        )
                    ) : null}
                </div>
            </div>
        </AppDrawer>
    );
}
