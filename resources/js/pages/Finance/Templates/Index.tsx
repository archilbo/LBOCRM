import { Head, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { TabPanel } from 'react-aria-components';
import { toast } from 'sonner';
import { AppShell } from '@/components/layout/AppShell';
import type { DocumentTemplate, FinanceDocumentType, TemplatePlaceholder } from '@/features/finance/types';
import { TemplateEditorForm } from '@/features/finance/templates/TemplateEditorForm';
import { TemplateList } from '@/features/finance/templates/TemplateList';
import { TemplatePlaceholderPanel } from '@/features/finance/templates/TemplatePlaceholderPanel';
import { TemplatePreviewPanel } from '@/features/finance/templates/TemplatePreviewPanel';
import { TemplateToolbar } from '@/features/finance/templates/TemplateToolbar';

type PageProps = {
    templates?: DocumentTemplate[] | { data?: DocumentTemplate[] };
    placeholders: TemplatePlaceholder[];
    sampleData: Record<string, unknown>;
    routes: { store: string; resetQuote: string; resetInvoice: string; resetReceipt: string };
};

const types: FinanceDocumentType[] = ['quote', 'invoice', 'receipt'];

function unwrapTemplates(value?: DocumentTemplate[] | { data?: DocumentTemplate[] }): DocumentTemplate[] {
    return Array.isArray(value) ? value : value?.data || [];
}

function clone(template: DocumentTemplate): DocumentTemplate {
    return JSON.parse(JSON.stringify(template));
}

function getValue(path: string, data: Record<string, unknown>): string {
    const value = path.split('.').reduce<unknown>((carry, key) => (carry && typeof carry === 'object' ? (carry as Record<string, unknown>)[key] : undefined), data);
    return value?.toString() || '';
}

function renderLocalPreview(template: DocumentTemplate, sampleData: Record<string, unknown>): string {
    let html = `${template.headerHtml || ''}${template.bodyHtml || ''}${template.footerHtml || ''}`;
    html = html.replace('{{items_table}}', sampleItemsTable());
    html = html.replace('{{payments_table}}', samplePaymentsTable());
    html = html.replace(/{{\s*([a-zA-Z0-9_.]+)\s*}}/g, (_, key) => getValue(key, sampleData));

    return `<!doctype html><html><head><meta charset="utf-8"><style>${template.css || ''}</style></head><body>${html}</body></html>`;
}

function sampleItemsTable(): string {
    return '<table class="items-table"><thead><tr><th>Designation</th><th>Qt</th><th>PU HT</th><th>Total TTC</th></tr></thead><tbody><tr><td>Etudes architecturales</td><td class="text-right">1</td><td class="text-right">8 000.00 MAD</td><td class="text-right">9 600.00 MAD</td></tr><tr><td>Suivi dossier</td><td class="text-right">1</td><td class="text-right">2 000.00 MAD</td><td class="text-right">2 400.00 MAD</td></tr></tbody></table>';
}

function samplePaymentsTable(): string {
    return '<table class="payments-table"><thead><tr><th>Paiement</th><th>Date</th><th>Montant</th></tr></thead><tbody><tr><td>PAY-2026-0001</td><td>27/06/2026</td><td class="text-right">4 000.00 MAD</td></tr></tbody></table>';
}

function toPayload(template: DocumentTemplate) {
    return {
        type: template.type,
        name: template.name,
        slug: template.slug,
        paper_size: template.paperSize,
        orientation: template.orientation,
        header_html: template.headerHtml,
        body_html: template.bodyHtml,
        footer_html: template.footerHtml,
        css: template.css,
        settings: template.settings || {},
        logo_path: template.logoPath || '',
        is_default: template.isDefault,
    };
}

export default function FinanceTemplatesIndex({ templates: rawTemplates, placeholders, sampleData, routes }: PageProps) {
    const templates = unwrapTemplates(rawTemplates);
    const params = new URLSearchParams(window.location.search);
    const initialType = (params.get('type') as FinanceDocumentType) || 'quote';
    const [selectedType, setSelectedType] = useState<FinanceDocumentType>(types.includes(initialType) ? initialType : 'quote');
    const visibleTemplates = useMemo(() => templates.filter((template) => template.type === selectedType), [templates, selectedType]);
    const initialTemplate = visibleTemplates.find((template) => String(template.id) === params.get('template')) || visibleTemplates[0] || null;
    const [selectedId, setSelectedId] = useState<number | undefined>(initialTemplate?.id);
    const selectedTemplate = visibleTemplates.find((template) => template.id === selectedId) || visibleTemplates[0] || null;
    const [draft, setDraft] = useState<DocumentTemplate | null>(selectedTemplate ? clone(selectedTemplate) : null);
    const [previewHtml, setPreviewHtml] = useState(() => draft ? renderLocalPreview(draft, sampleData) : '');

    function selectTemplate(template: DocumentTemplate) {
        setSelectedId(template.id);
        setDraft(clone(template));
        setPreviewHtml(renderLocalPreview(template, sampleData));
    }

    function updateDraft(next: DocumentTemplate) {
        setDraft(next);
        setPreviewHtml(renderLocalPreview(next, sampleData));
    }

    function save() {
        if (!draft) return;
        router.put(draft.urls.update, toPayload(draft), { preserveScroll: true, onSuccess: () => toast.success('Template enregistre.'), onError: () => toast.error('Impossible enregistrer le template.') });
    }

    function createTemplate() {
        router.post(routes.store, { type: selectedType, name: 'Nouveau template', body_html: '{{items_table}}', paper_size: 'A4', orientation: 'portrait' }, { preserveScroll: true, onSuccess: () => toast.success('Template cree.'), onError: () => toast.error('Impossible creer le template.') });
    }

    function resetDefault() {
        const url = selectedType === 'quote' ? routes.resetQuote : selectedType === 'invoice' ? routes.resetInvoice : routes.resetReceipt;
        router.put(url, {}, { preserveScroll: true, onSuccess: () => toast.success('Template defaut recree.') });
    }

    function duplicate(template: DocumentTemplate) {
        router.post(template.urls.duplicate, {}, { preserveScroll: true, onSuccess: () => toast.success('Template duplique.') });
    }

    function setDefault(template: DocumentTemplate) {
        router.put(template.urls.setDefault, {}, { preserveScroll: true, onSuccess: () => toast.success('Template par defaut mis a jour.') });
    }

    function deleteTemplate(template: DocumentTemplate) {
        router.delete(template.urls.delete, { preserveScroll: true, onSuccess: () => toast.success('Template supprime.'), onError: () => toast.error('Impossible supprimer ce template.') });
    }

    async function backendPreview() {
        if (!draft) return;
        const response = await fetch(draft.urls.preview, { headers: { Accept: 'application/json' } });
        const data = await response.json();
        setPreviewHtml(data.html || renderLocalPreview(draft, sampleData));
    }

    return (
        <>
            <Head title="Finance Templates" />
            <AppShell eyebrowKey="financeWorkspace.eyebrow" titleKey="financeWorkspace.title" subtitleKey="financeWorkspace.subtitle">
                <TemplateToolbar selectedType={selectedType} onTypeChange={(type) => { setSelectedType(type); const first = templates.find((item) => item.type === type); if (first) selectTemplate(first); }} onCreate={createTemplate} onResetDefault={resetDefault}>
                    {types.map((type) => (
                        <TabPanel key={type} id={type} className="outline-none">
                            <div className="grid gap-3 xl:grid-cols-[240px_minmax(0,1fr)_340px]">
                                <TemplateList templates={visibleTemplates} selectedId={draft?.id} onSelect={selectTemplate} onDuplicate={duplicate} onSetDefault={setDefault} onDelete={deleteTemplate} />
                                {draft ? <TemplateEditorForm value={draft} placeholders={placeholders} onChange={updateDraft} onSave={save} onReset={() => selectedTemplate && selectTemplate(selectedTemplate)} /> : null}
                                <div className="sticky top-4 space-y-3 self-start">
                                    <TemplatePlaceholderPanel placeholders={placeholders} />
                                    <TemplatePreviewPanel html={previewHtml} onRefresh={backendPreview} />
                                </div>
                            </div>
                        </TabPanel>
                    ))}
                </TemplateToolbar>
            </AppShell>
        </>
    );
}
