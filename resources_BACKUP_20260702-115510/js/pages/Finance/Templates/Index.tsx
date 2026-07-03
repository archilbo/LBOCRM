import { Head, router } from '@inertiajs/react';
import {
    Copy,
    FileText,
    History,
    LayoutTemplate,
    Plus,
    RefreshCcw,
    Save,
    Sparkles,
    Star,
    Trash2,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { AppShell } from '@/components/layout/AppShell';
import type { DocumentTemplate, FinanceDocumentType, TemplatePlaceholder } from '@/features/finance/types';

type PageProps = {
    templates?: DocumentTemplate[] | { data?: DocumentTemplate[] };
    placeholders: TemplatePlaceholder[];
    sampleData: Record<string, unknown>;
    routes: {
        store: string;
        resetQuote: string;
        resetInvoice: string;
        resetReceipt: string;
    };
};

type TemplateDraft = DocumentTemplate;

const documentTypes: Array<{ type: FinanceDocumentType; label: string; hint: string }> = [
    { type: 'quote', label: 'Devis', hint: 'Client offers' },
    { type: 'invoice', label: 'Factures', hint: 'Billing documents' },
    { type: 'receipt', label: 'Recus', hint: 'Payment receipts' },
];

function unwrapTemplates(value?: DocumentTemplate[] | { data?: DocumentTemplate[] }): DocumentTemplate[] {
    return Array.isArray(value) ? value : value?.data || [];
}

function cloneTemplate(template: DocumentTemplate): TemplateDraft {
    return JSON.parse(JSON.stringify(template)) as TemplateDraft;
}

function resetUrlFor(type: FinanceDocumentType, routes: PageProps['routes']): string {
    if (type === 'invoice') return routes.resetInvoice;
    if (type === 'receipt') return routes.resetReceipt;
    return routes.resetQuote;
}

function templatePayload(template: TemplateDraft) {
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

function renderPreview(template: TemplateDraft, sampleData: Record<string, unknown>): string {
    let html = `${template.headerHtml || ''}${template.bodyHtml || ''}${template.footerHtml || ''}`;

    html = html.replaceAll('{{items_table}}', `
        <table class="items-table">
            <thead><tr><th>Designation</th><th>Qte</th><th>PU HT</th><th>Total</th></tr></thead>
            <tbody>
                <tr><td>Etudes architecturales</td><td>1</td><td>8 000 MAD</td><td>8 000 MAD</td></tr>
                <tr><td>Suivi administratif</td><td>1</td><td>2 000 MAD</td><td>2 000 MAD</td></tr>
            </tbody>
        </table>
    `);

    html = html.replaceAll('{{payments_table}}', `
        <table class="payments-table">
            <thead><tr><th>Paiement</th><th>Date</th><th>Montant</th></tr></thead>
            <tbody><tr><td>PAY-2026-0001</td><td>27/06/2026</td><td>4 000 MAD</td></tr></tbody>
        </table>
    `);

    html = html.replace(/{{\s*([a-zA-Z0-9_.]+)\s*}}/g, (_, key: string) => {
        const value = key.split('.').reduce<unknown>((carry, part) => {
            if (!carry || typeof carry !== 'object') return undefined;
            return (carry as Record<string, unknown>)[part];
        }, sampleData);

        return value?.toString() || '';
    });

    return `
        <!doctype html>
        <html>
            <head>
                <meta charset="utf-8">
                <style>
                    html, body { margin: 0; padding: 0; background: #f4f4f5; }
                    body { font-family: Arial, sans-serif; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { border-bottom: 1px solid #ddd; padding: 8px; text-align: left; }
                    ${template.css || ''}
                </style>
            </head>
            <body>${html}</body>
        </html>
    `;
}

function isDirty(draft: TemplateDraft | null, selected: DocumentTemplate | null): boolean {
    if (!draft || !selected) return false;
    return JSON.stringify(templatePayload(draft)) !== JSON.stringify(templatePayload(selected));
}

function placeholderItems(placeholders: TemplatePlaceholder[]): string[] {
    return placeholders.flatMap((group) => Array.isArray(group.items) ? group.items : []);
}

export default function FinanceTemplatesIndex({
    templates: rawTemplates,
    placeholders,
    sampleData,
    routes,
}: PageProps) {
    const templates = useMemo(() => unwrapTemplates(rawTemplates), [rawTemplates]);
    const params = new URLSearchParams(window.location.search);
    const requestedType = params.get('type') as FinanceDocumentType | null;
    const initialType = documentTypes.some((item) => item.type === requestedType) ? requestedType! : 'quote';

    const [selectedType, setSelectedType] = useState<FinanceDocumentType>(initialType);
    const visibleTemplates = useMemo(
        () => templates.filter((template) => template.type === selectedType),
        [templates, selectedType],
    );

    const [selectedId, setSelectedId] = useState<number | undefined>(() => {
        const id = params.get('template');
        return id ? Number(id) : undefined;
    });

    const selectedTemplate = useMemo(
        () => visibleTemplates.find((template) => template.id === selectedId) || visibleTemplates[0] || null,
        [selectedId, visibleTemplates],
    );

    const [draft, setDraft] = useState<TemplateDraft | null>(() => selectedTemplate ? cloneTemplate(selectedTemplate) : null);
    const [previewHtml, setPreviewHtml] = useState(() => draft ? renderPreview(draft, sampleData) : '');

    const dirty = isDirty(draft, selectedTemplate);
    const variables = placeholderItems(placeholders);

    useEffect(() => {
        if (!selectedTemplate) {
            setDraft(null);
            setPreviewHtml('');
            return;
        }

        const next = cloneTemplate(selectedTemplate);
        setDraft(next);
        setPreviewHtml(renderPreview(next, sampleData));
    }, [selectedTemplate?.id]);

    function selectType(type: FinanceDocumentType) {
        if (dirty && !window.confirm('Unsaved changes will be lost. Continue?')) return;

        const first = templates.find((template) => template.type === type);
        setSelectedType(type);
        setSelectedId(first?.id);

        const url = new URL(window.location.href);
        url.searchParams.set('type', type);
        if (first) url.searchParams.set('template', String(first.id));
        else url.searchParams.delete('template');
        window.history.replaceState({}, '', url.toString());
    }

    function selectTemplate(template: DocumentTemplate) {
        if (dirty && !window.confirm('Unsaved changes will be lost. Continue?')) return;

        setSelectedId(template.id);
        setDraft(cloneTemplate(template));
        setPreviewHtml(renderPreview(template, sampleData));

        const url = new URL(window.location.href);
        url.searchParams.set('type', template.type);
        url.searchParams.set('template', String(template.id));
        window.history.replaceState({}, '', url.toString());
    }

    function updateDraft(patch: Partial<TemplateDraft>) {
        if (!draft) return;
        const next = { ...draft, ...patch };
        setDraft(next);
        setPreviewHtml(renderPreview(next, sampleData));
    }

    function save() {
        if (!draft) return;

        router.put(draft.urls.update, templatePayload(draft), {
            preserveScroll: true,
            onSuccess: () => toast.success('Template saved.'),
            onError: () => toast.error('Could not save template.'),
        });
    }

    function createTemplate() {
        router.post(routes.store, {
            type: selectedType,
            name: `New ${selectedType} template`,
            slug: `new-${selectedType}-template`,
            body_html: '{{items_table}}',
            paper_size: 'A4',
            orientation: 'portrait',
            is_default: false,
        }, {
            preserveScroll: true,
            onSuccess: () => toast.success('Template created.'),
            onError: () => toast.error('Could not create template.'),
        });
    }

    function resetDefault() {
        router.put(resetUrlFor(selectedType, routes), {}, {
            preserveScroll: true,
            onSuccess: () => toast.success('Default template recreated.'),
            onError: () => toast.error('Could not reset default template.'),
        });
    }

    function duplicateTemplate(template: DocumentTemplate) {
        router.post(template.urls.duplicate, {}, {
            preserveScroll: true,
            onSuccess: () => toast.success('Template duplicated.'),
            onError: () => toast.error('Could not duplicate template.'),
        });
    }

    function deleteTemplate(template: DocumentTemplate) {
        if (!window.confirm(`Delete "${template.name}"?`)) return;

        router.delete(template.urls.delete, {
            preserveScroll: true,
            onSuccess: () => toast.success('Template deleted.'),
            onError: () => toast.error('Could not delete template.'),
        });
    }

    function setDefault(template: DocumentTemplate) {
        router.put(template.urls.setDefault, {}, {
            preserveScroll: true,
            onSuccess: () => toast.success('Default template updated.'),
            onError: () => toast.error('Could not set default template.'),
        });
    }

    async function exactPreview() {
        if (!draft?.urls.preview) return;

        try {
            const response = await fetch(draft.urls.preview, { headers: { Accept: 'application/json' } });
            const data = await response.json() as { html?: string };
            setPreviewHtml(data.html || renderPreview(draft, sampleData));
            toast.success('Exact preview loaded.');
        } catch {
            toast.error('Exact preview failed.');
        }
    }

    return (
        <>
            <Head title="Finance templates" />

            <AppShell
                eyebrowKey="financeWorkspace.eyebrow"
                titleKey="financeWorkspace.title"
                subtitleKey="financeWorkspace.subtitle"
            >
                <div className="crm-page FORCE_FINANCE_TEMPLATES_REDESIGN_53P">
                    <section className="crm-panel">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <p className="crm-kpi-label">TEMPLATE STUDIO</p>
                                <h1 className="mt-2 text-2xl font-semibold">Finance templates</h1>
                                <p className="mt-1 text-sm text-[var(--text-muted)]">
                                    Manage Devis, Factures and Recus templates using backend data, live variables and PDF-ready preview.
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <button type="button" onClick={createTemplate} className="crm-action-button bg-[var(--accent)] text-black">
                                    <Plus size={15} />
                                    New template
                                </button>
                                <button type="button" onClick={resetDefault} className="crm-action-button">
                                    <RefreshCcw size={15} />
                                    Reset default
                                </button>
                            </div>
                        </div>

                        <div className="crm-kpi-grid mt-5">
                            <div className="crm-kpi-card">
                                <p className="crm-kpi-label">Templates</p>
                                <p className="crm-kpi-value">{templates.length}</p>
                                <p className="text-xs text-[var(--text-muted)]">All document types</p>
                            </div>
                            <div className="crm-kpi-card">
                                <p className="crm-kpi-label">Selected type</p>
                                <p className="crm-kpi-value">{documentTypes.find((item) => item.type === selectedType)?.label}</p>
                                <p className="text-xs text-[var(--text-muted)]">{visibleTemplates.length} template(s)</p>
                            </div>
                            <div className="crm-kpi-card">
                                <p className="crm-kpi-label">Variables</p>
                                <p className="crm-kpi-value">{variables.length}</p>
                                <p className="text-xs text-[var(--text-muted)]">Available placeholders</p>
                            </div>
                            <div className="crm-kpi-card">
                                <p className="crm-kpi-label">Default</p>
                                <p className="crm-kpi-value">{visibleTemplates.filter((item) => item.isDefault).length}</p>
                                <p className="text-xs text-[var(--text-muted)]">For current type</p>
                            </div>
                        </div>
                    </section>

                    <section className="crm-panel">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex flex-wrap gap-2">
                                {documentTypes.map((item) => {
                                    const active = item.type === selectedType;
                                    const count = templates.filter((template) => template.type === item.type).length;

                                    return (
                                        <button
                                            key={item.type}
                                            type="button"
                                            onClick={() => selectType(item.type)}
                                            className={[
                                                'rounded-xl border px-4 py-2 text-left text-sm transition',
                                                active
                                                    ? 'border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_18%,transparent)] text-[var(--accent)]'
                                                    : 'text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--text)]',
                                            ].join(' ')}
                                        >
                                            <span className="font-semibold">{item.label}</span>
                                            <span className="ml-2 rounded-full bg-[var(--surface-2)] px-2 py-0.5 text-xs">{count}</span>
                                            <span className="block text-[11px] text-[var(--text-muted)]">{item.hint}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            {draft ? (
                                <div className="flex flex-wrap gap-2">
                                    {dirty ? <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs font-bold text-amber-400">Unsaved</span> : null}
                                    <button type="button" onClick={() => void exactPreview()} className="crm-action-button">
                                        <Sparkles size={15} />
                                        Exact preview
                                    </button>
                                    {draft.urls.versions ? (
                                        <button type="button" onClick={() => router.visit(draft.urls.versions!)} className="crm-action-button">
                                            <History size={15} />
                                            Versions
                                        </button>
                                    ) : null}
                                    <button type="button" onClick={save} disabled={!dirty} className="crm-action-button bg-[var(--accent)] text-black disabled:opacity-40">
                                        <Save size={15} />
                                        Save
                                    </button>
                                </div>
                            ) : null}
                        </div>
                    </section>

                    <section className="grid gap-6 xl:grid-cols-[310px_minmax(0,1fr)_430px]">
                        <aside className="crm-panel self-start">
                            <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
                                <div>
                                    <h2 className="font-semibold">Templates</h2>
                                    <p className="text-xs text-[var(--text-muted)]">{visibleTemplates.length} visible</p>
                                </div>
                                <LayoutTemplate className="text-[var(--accent)]" size={18} />
                            </div>

                            <div className="max-h-[720px] overflow-auto p-2">
                                {visibleTemplates.map((template) => {
                                    const active = selectedTemplate?.id === template.id;

                                    return (
                                        <button
                                            key={template.id}
                                            type="button"
                                            onClick={() => selectTemplate(template)}
                                            className={[
                                                'mb-2 w-full rounded-xl border p-3 text-left transition',
                                                active
                                                    ? 'border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_12%,transparent)]'
                                                    : 'hover:border-[var(--accent)]',
                                            ].join(' ')}
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="min-w-0">
                                                    <p className="truncate font-semibold">{template.name}</p>
                                                    <p className="truncate text-xs text-[var(--text-muted)]">{template.slug}</p>
                                                </div>
                                                {template.isDefault ? <Star className="shrink-0 fill-[var(--accent)] text-[var(--accent)]" size={15} /> : null}
                                            </div>
                                            <div className="mt-3 flex flex-wrap gap-1 text-[10px] font-bold uppercase">
                                                <span className="rounded-full bg-[var(--surface-2)] px-2 py-1">{template.paperSize}</span>
                                                <span className="rounded-full bg-[var(--surface-2)] px-2 py-1">{template.orientation}</span>
                                                <span className="rounded-full bg-[var(--surface-2)] px-2 py-1">{template.updatedAt || 'No update'}</span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </aside>

                        <main className="crm-panel min-w-0">
                            {draft ? (
                                <>
                                    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--border)] px-4 py-3">
                                        <div>
                                            <p className="crm-kpi-label">EDITOR</p>
                                            <h2 className="text-lg font-semibold">{draft.name}</h2>
                                            <p className="text-xs text-[var(--text-muted)]">{draft.typeLabel} / {draft.slug}</p>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            <button type="button" onClick={() => setDefault(draft)} className="crm-action-button">
                                                <Star size={15} />
                                                Default
                                            </button>
                                            <button type="button" onClick={() => duplicateTemplate(draft)} className="crm-action-button">
                                                <Copy size={15} />
                                                Duplicate
                                            </button>
                                            <button type="button" onClick={() => deleteTemplate(draft)} className="crm-action-button text-red-400">
                                                <Trash2 size={15} />
                                                Delete
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid gap-3 p-4 lg:grid-cols-2">
                                        <label className="space-y-1">
                                            <span className="text-xs font-semibold text-[var(--text-muted)]">Name</span>
                                            <input className="crm-command-input w-full" value={draft.name} onChange={(event) => updateDraft({ name: event.target.value })} />
                                        </label>

                                        <label className="space-y-1">
                                            <span className="text-xs font-semibold text-[var(--text-muted)]">Slug</span>
                                            <input className="crm-command-input w-full" value={draft.slug} onChange={(event) => updateDraft({ slug: event.target.value })} />
                                        </label>

                                        <label className="space-y-1">
                                            <span className="text-xs font-semibold text-[var(--text-muted)]">Paper</span>
                                            <select className="crm-command-input w-full" value={draft.paperSize} onChange={(event) => updateDraft({ paperSize: event.target.value })}>
                                                <option value="A4">A4</option>
                                                <option value="A5">A5</option>
                                                <option value="Letter">Letter</option>
                                            </select>
                                        </label>

                                        <label className="space-y-1">
                                            <span className="text-xs font-semibold text-[var(--text-muted)]">Orientation</span>
                                            <select className="crm-command-input w-full" value={draft.orientation} onChange={(event) => updateDraft({ orientation: event.target.value })}>
                                                <option value="portrait">Portrait</option>
                                                <option value="landscape">Landscape</option>
                                            </select>
                                        </label>
                                    </div>

                                    <div className="grid gap-3 px-4 pb-4">
                                        {[
                                            ['Header HTML', 'headerHtml'],
                                            ['Body HTML', 'bodyHtml'],
                                            ['Footer HTML', 'footerHtml'],
                                            ['CSS', 'css'],
                                        ].map(([label, key]) => (
                                            <label key={key} className="space-y-1">
                                                <span className="text-xs font-semibold text-[var(--text-muted)]">{label}</span>
                                                <textarea
                                                    className="min-h-[130px] w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 font-mono text-xs outline-none focus:border-[var(--accent)]"
                                                    value={(draft as unknown as Record<string, string>)[key] || ''}
                                                    onChange={(event) => updateDraft({ [key]: event.target.value } as Partial<TemplateDraft>)}
                                                />
                                            </label>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="flex min-h-[520px] items-center justify-center p-6 text-center">
                                    <div>
                                        <FileText className="mx-auto text-[var(--accent)]" size={32} />
                                        <h2 className="mt-3 font-semibold">No template selected</h2>
                                        <p className="mt-1 text-sm text-[var(--text-muted)]">Create or reset a default template.</p>
                                    </div>
                                </div>
                            )}
                        </main>

                        <aside className="space-y-4">
                            <div className="crm-panel overflow-hidden">
                                <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
                                    <div>
                                        <h2 className="font-semibold">Preview</h2>
                                        <p className="text-xs text-[var(--text-muted)]">Live rendered document</p>
                                    </div>
                                    <Sparkles className="text-[var(--accent)]" size={17} />
                                </div>
                                <iframe
                                    title="Template preview"
                                    className="h-[520px] w-full bg-white"
                                    srcDoc={previewHtml}
                                />
                            </div>

                            <div className="crm-panel p-4">
                                <h2 className="font-semibold">Variables</h2>
                                <p className="mt-1 text-xs text-[var(--text-muted)]">Clicking is not required. Copy variables manually into HTML.</p>
                                <div className="mt-3 flex max-h-[220px] flex-wrap gap-2 overflow-auto">
                                    {variables.map((item) => (
                                        <code key={item} className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-[11px] text-[var(--text-muted)]">
                                            {'{{'}{item}{'}}'}
                                        </code>
                                    ))}
                                </div>
                            </div>
                        </aside>
                    </section>
                </div>
            </AppShell>
        </>
    );
}