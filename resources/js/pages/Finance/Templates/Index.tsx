import { Head, router } from '@inertiajs/react';
import {
    FileText,
    Camera,
    LayoutTemplate,
    Maximize2,
    Minimize2,
    PanelLeftClose,
    PanelLeftOpen,
    PanelRightClose,
    PanelRightOpen,
    Plus,
    RefreshCcw,
    RotateCcw,
    Save,
    Sparkles,
} from 'lucide-react';
import { type CSSProperties, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { AppShell } from '@/components/layout/AppShell';
import type { DocumentTemplate, FinanceDocumentType, TemplatePlaceholder } from '@/features/finance/types';
import { TemplateEditorForm } from '@/features/finance/templates/TemplateEditorForm';
import { TemplateList } from '@/features/finance/templates/TemplateList';
import { TemplatePlaceholderPanel } from '@/features/finance/templates/TemplatePlaceholderPanel';
import { TemplatePreviewPanel } from '@/features/finance/templates/TemplatePreviewPanel';

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

type WorkbenchView = 'all' | 'editor' | 'preview';

const documentTypes: Array<{
    type: FinanceDocumentType;
    label: string;
    description: string;
}> = [
    {
        type: 'quote',
        label: 'Devis',
        description: 'Templates for client estimates',
    },
    {
        type: 'invoice',
        label: 'Facture',
        description: 'Templates for invoices',
    },
    {
        type: 'receipt',
        label: 'ReÃ§u',
        description: 'Templates for payment receipts',
    },
];

function unwrapTemplates(value?: DocumentTemplate[] | { data?: DocumentTemplate[] }): DocumentTemplate[] {
    return Array.isArray(value) ? value : value?.data || [];
}

function clone(template: DocumentTemplate): DocumentTemplate {
    return JSON.parse(JSON.stringify(template)) as DocumentTemplate;
}

function getNestedValue(path: string, data: Record<string, unknown>): string {
    const value = path.split('.').reduce<unknown>((carry, key) => {
        if (!carry || typeof carry !== 'object') {
            return undefined;
        }

        return (carry as Record<string, unknown>)[key];
    }, data);

    return value?.toString() || '';
}

function sampleItemsTable(): string {
    return `
        <table class="items-table">
            <thead>
                <tr>
                    <th>DÃ©signation</th>
                    <th class="text-right">QtÃ©</th>
                    <th class="text-right">PU HT</th>
                    <th class="text-right">Total HT</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Ã‰tudes architecturales</td>
                    <td class="text-right">1</td>
                    <td class="text-right">8 000.00 MAD</td>
                    <td class="text-right">8 000.00 MAD</td>
                </tr>
                <tr>
                    <td>Suivi dossier administratif</td>
                    <td class="text-right">1</td>
                    <td class="text-right">2 000.00 MAD</td>
                    <td class="text-right">2 000.00 MAD</td>
                </tr>
            </tbody>
        </table>
    `;
}

function samplePaymentsTable(): string {
    return `
        <table class="payments-table">
            <thead>
                <tr>
                    <th>Paiement</th>
                    <th>Date</th>
                    <th class="text-right">Montant</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>PAY-2026-0001</td>
                    <td>27/06/2026</td>
                    <td class="text-right">4 000.00 MAD</td>
                </tr>
            </tbody>
        </table>
    `;
}

function renderLocalPreview(template: DocumentTemplate, sampleData: Record<string, unknown>): string {
    let content = `${template.headerHtml || ''}${template.bodyHtml || ''}${template.footerHtml || ''}`;

    content = content.replaceAll('{{items_table}}', sampleItemsTable());
    content = content.replaceAll('{{payments_table}}', samplePaymentsTable());

    content = content.replace(/{{\s*([a-zA-Z0-9_.]+)\s*}}/g, (_, key: string) => {
        return getNestedValue(key, sampleData);
    });

    return `
        <!doctype html>
        <html>
            <head>
                <meta charset="utf-8">
                <style>
                    html,
                    body {
                        margin: 0;
                        padding: 0;
                        background: #f3f4f6;
                    }

                    body {
                        font-family: Arial, sans-serif;
                    }

                    ${template.css || ''}
                </style>
            </head>
            <body>
                ${content}
            </body>
        </html>
    `;
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

function sameTemplate(a: DocumentTemplate | null, b: DocumentTemplate | null): boolean {
    if (!a || !b) {
        return false;
    }

    return JSON.stringify(toPayload(a)) === JSON.stringify(toPayload(b));
}

function countPlaceholders(placeholders: TemplatePlaceholder[]): number {
    return placeholders.reduce((total, group) => {
        const items = Array.isArray(group.items) ? group.items : [];

        return total + items.length;
    }, 0);
}

function templateTypeLabel(type: FinanceDocumentType): string {
    return documentTypes.find((item) => item.type === type)?.label || type;
}

function templateTypeDescription(type: FinanceDocumentType): string {
    return documentTypes.find((item) => item.type === type)?.description || '';
}

function resetUrlForType(type: FinanceDocumentType, routes: PageProps['routes']): string {
    if (type === 'invoice') {
        return routes.resetInvoice;
    }

    if (type === 'receipt') {
        return routes.resetReceipt;
    }

    return routes.resetQuote;
}

function TypeTabs({
    selectedType,
    templates,
    onChange,
}: {
    selectedType: FinanceDocumentType;
    templates: DocumentTemplate[];
    onChange: (type: FinanceDocumentType) => void;
}) {
    return (
        <div className="flex flex-wrap gap-2">
            {documentTypes.map((item) => {
                const count = templates.filter((template) => template.type === item.type).length;
                const active = selectedType === item.type;

                return (
                    <button
                        key={item.type}
                        type="button"
                        onClick={() => onChange(item.type)}
                        className={[
                            'group flex min-w-[150px] items-center justify-between gap-3 rounded-2xl border px-3 py-2 text-left transition',
                            active
                                ? 'border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] text-[var(--text)]'
                                : 'bg-[var(--surface)] text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--text)]',
                        ].join(' ')}
                    >
                        <span className="min-w-0">
                            <span className="block text-sm font-semibold">{item.label}</span>
                            <span className="mt-0.5 block truncate text-[11px] text-[var(--text-muted)]">
                                {item.description}
                            </span>
                        </span>

                        <span
                            className={[
                                'inline-flex size-7 shrink-0 items-center justify-center rounded-xl text-xs font-bold',
                                active
                                    ? 'bg-[var(--accent)] text-white'
                                    : 'bg-[var(--surface-2)] text-[var(--text-muted)] group-hover:text-[var(--text)]',
                            ].join(' ')}
                        >
                            {count}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}

function EmptyTemplateState({ onCreate }: { onCreate: () => void }) {
    return (
        <div className="flex min-h-[520px] items-center justify-center rounded-2xl border bg-[var(--surface)] p-6 text-center">
            <div className="max-w-sm">
                <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] text-[var(--accent)]">
                    <LayoutTemplate size={22} />
                </div>

                <h2 className="mt-4 text-base font-semibold">No template selected</h2>

                <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
                    Create a template or reset the default template for this document type.
                </p>

                <button
                    type="button"
                    onClick={onCreate}
                    className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-4 text-sm font-semibold text-white transition hover:opacity-90"
                >
                    <Plus size={16} />
                    New template
                </button>
            </div>
        </div>
    );
}

function CollapsedRail({
    label,
    side,
    onOpen,
}: {
    label: string;
    side: 'left' | 'right';
    onOpen: () => void;
}) {
    const Icon = side === 'left' ? PanelLeftOpen : PanelRightOpen;

    return (
        <button
            type="button"
            onClick={onOpen}
            className="sticky top-20 flex min-h-[calc(100vh-180px)] w-full items-start justify-center rounded-2xl border bg-[var(--surface)] px-1 py-4 text-[var(--text-muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
        >
            <span className="flex flex-col items-center gap-2">
                <Icon size={15} />
                <span className="rotate-180 text-[10px] font-semibold uppercase tracking-[0.16em] [writing-mode:vertical-rl]">
                    {label}
                </span>
            </span>
        </button>
    );
}

function MobileViewSwitch({
    view,
    onChange,
}: {
    view: WorkbenchView;
    onChange: (view: WorkbenchView) => void;
}) {
    const items: Array<{ id: WorkbenchView; label: string }> = [
        { id: 'all', label: 'All' },
        { id: 'editor', label: 'Editor' },
        { id: 'preview', label: 'Preview' },
    ];

    return (
        <div className="grid grid-cols-3 rounded-2xl border bg-[var(--surface)] p-1 xl:hidden">
            {items.map((item) => (
                <button
                    key={item.id}
                    type="button"
                    onClick={() => onChange(item.id)}
                    className={[
                        'h-9 rounded-xl text-xs font-semibold transition',
                        view === item.id
                            ? 'bg-[var(--accent)] text-white'
                            : 'text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]',
                    ].join(' ')}
                >
                    {item.label}
                </button>
            ))}
        </div>
    );
}

function WorkbenchHeader({
    selectedType,
    draft,
    selectedTemplate,
    leftCollapsed,
    rightCollapsed,
    previewFocus,
    isDirty,
    onToggleLeft,
    onToggleRight,
    onTogglePreviewFocus,
    onCreate,
    onResetDefault,
    onSave,
    onResetDraft,
    onBackendPreview,
    onOpenHistory,
    onSaveSnapshot,
}: {
    selectedType: FinanceDocumentType;
    draft: DocumentTemplate | null;
    selectedTemplate: DocumentTemplate | null;
    leftCollapsed: boolean;
    rightCollapsed: boolean;
    previewFocus: boolean;
    isDirty: boolean;
    onToggleLeft: () => void;
    onToggleRight: () => void;
    onTogglePreviewFocus: () => void;
    onCreate: () => void;
    onResetDefault: () => void;
    onSave: () => void;
    onResetDraft: () => void;
    onBackendPreview: () => void;
    onOpenHistory: () => void;
    onSaveSnapshot: () => void;
}) {
    return (
        <div className="sticky top-0 z-30 rounded-2xl border bg-[color-mix(in_srgb,var(--surface)_94%,transparent)] px-3 py-2 backdrop-blur-xl">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                    <button
                        type="button"
                        onClick={onToggleLeft}
                        className="inline-flex size-9 items-center justify-center rounded-xl border bg-[var(--surface)] text-[var(--text-muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                    >
                        {leftCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
                    </button>

                    <div className="flex size-9 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--accent)_14%,transparent)] text-[var(--accent)]">
                        <FileText size={17} />
                    </div>

                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <h2 className="truncate text-sm font-semibold">
                                {draft?.name || `${templateTypeLabel(selectedType)} template`}
                            </h2>

                            {draft?.isDefault ? (
                                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-500">
                                    Default
                                </span>
                            ) : null}

                            {isDirty ? (
                                <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-500">
                                    Unsaved
                                </span>
                            ) : null}
                        </div>

                        <p className="mt-0.5 truncate text-[11px] text-[var(--text-muted)]">
                            {draft?.slug || 'new-template'} / {templateTypeDescription(selectedType)}
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                    <button
                        type="button"
                        onClick={onCreate}
                        className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border bg-[var(--surface)] px-3 text-xs font-semibold text-[var(--text-muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                    >
                        <Plus size={14} />
                        New
                    </button>

                    <button
                        type="button"
                        onClick={onResetDefault}
                        className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border bg-[var(--surface)] px-3 text-xs font-semibold text-[var(--text-muted)] transition hover:border-amber-500 hover:text-amber-500"
                    >
                        <RefreshCcw size={14} />
                        Reset default
                    </button>

                    <button
                        type="button"
                        onClick={onResetDraft}
                        disabled={!selectedTemplate || !isDirty}
                        className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border bg-[var(--surface)] px-3 text-xs font-semibold text-[var(--text-muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <RotateCcw size={14} />
                        Revert
                    </button>

                    <button
                        type="button"
                        onClick={onBackendPreview}
                        disabled={!draft}
                        className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border bg-[var(--surface)] px-3 text-xs font-semibold text-[var(--text-muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <Sparkles size={14} />
                        Exact preview
                    </button>

                    <button
                        type="button"
                        onClick={onSave}
                        disabled={!draft || !isDirty}
                        className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-3 text-xs font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <Save size={14} />
                        Save
                    </button>

                    <button
                        type="button"
                        onClick={onTogglePreviewFocus}
                        className="inline-flex size-9 items-center justify-center rounded-xl border bg-[var(--surface)] text-[var(--text-muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                    >
                        {previewFocus ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
                    </button>

                    <button
                        type="button"
                        onClick={onToggleRight}
                        className="inline-flex size-9 items-center justify-center rounded-xl border bg-[var(--surface)] text-[var(--text-muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                    >
                        {rightCollapsed ? <PanelRightOpen size={16} /> : <PanelRightClose size={16} />}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function FinanceTemplatesIndex({
    templates: rawTemplates,
    placeholders,
    sampleData,
    routes,
}: PageProps) {
    const templates = useMemo(() => unwrapTemplates(rawTemplates), [rawTemplates]);
    const params = new URLSearchParams(window.location.search);

    const initialType = (params.get('type') as FinanceDocumentType) || 'quote';

    const [selectedType, setSelectedType] = useState<FinanceDocumentType>(
        documentTypes.some((item) => item.type === initialType) ? initialType : 'quote',
    );

    const [selectedId, setSelectedId] = useState<number | undefined>(() => {
        const id = params.get('template');

        return id ? Number(id) : undefined;
    });

    const [leftCollapsed, setLeftCollapsed] = useState(false);
    const [rightCollapsed, setRightCollapsed] = useState(false);
    const [previewFocus, setPreviewFocus] = useState(false);
    const [mobileView, setMobileView] = useState<WorkbenchView>('all');

    const visibleTemplates = useMemo(
        () => templates.filter((template) => template.type === selectedType),
        [templates, selectedType],
    );

    const selectedTemplate = useMemo(() => {
        return visibleTemplates.find((template) => template.id === selectedId) || visibleTemplates[0] || null;
    }, [selectedId, visibleTemplates]);

    const [draft, setDraft] = useState<DocumentTemplate | null>(() => {
        return selectedTemplate ? clone(selectedTemplate) : null;
    });

    const [previewHtml, setPreviewHtml] = useState(() => {
        return draft ? renderLocalPreview(draft, sampleData) : '';
    });

    const isDirty = useMemo(() => !sameTemplate(draft, selectedTemplate), [draft, selectedTemplate]);

    const placeholderCount = useMemo(() => countPlaceholders(placeholders), [placeholders]);

    const gridTemplateColumns = `${leftCollapsed ? '44px' : '240px'} minmax(0,1fr) ${
        rightCollapsed ? '44px' : previewFocus ? '560px' : '420px'
    }`;

    useEffect(() => {
        if (!selectedTemplate) {
            setDraft(null);
            setPreviewHtml('');
            return;
        }

        setDraft(clone(selectedTemplate));
        setPreviewHtml(renderLocalPreview(selectedTemplate, sampleData));
    }, [selectedTemplate?.id]);

    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            const isSave = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's';
            const isPreview = (event.ctrlKey || event.metaKey) && event.key === 'Enter';

            if (isSave) {
                event.preventDefault();

                if (draft && isDirty) {
                    save();
                }
            }

            if (isPreview) {
                event.preventDefault();

                void backendPreview();
            }
        }

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [draft, isDirty]);

    function selectTemplate(template: DocumentTemplate) {
        if (isDirty && !window.confirm('You have unsaved changes. Continue without saving?')) {
            return;
        }

        setSelectedId(template.id);
        setDraft(clone(template));
        setPreviewHtml(renderLocalPreview(template, sampleData));

        const url = new URL(window.location.href);
        url.searchParams.set('type', template.type);
        url.searchParams.set('template', String(template.id));
        window.history.replaceState({}, '', url.toString());
    }

    function changeType(type: FinanceDocumentType) {
        if (selectedType === type) {
            return;
        }

        if (isDirty && !window.confirm('You have unsaved changes. Continue without saving?')) {
            return;
        }

        const first = templates.find((template) => template.type === type);

        setSelectedType(type);
        setSelectedId(first?.id);
        setDraft(first ? clone(first) : null);
        setPreviewHtml(first ? renderLocalPreview(first, sampleData) : '');

        const url = new URL(window.location.href);
        url.searchParams.set('type', type);

        if (first?.id) {
            url.searchParams.set('template', String(first.id));
        } else {
            url.searchParams.delete('template');
        }

        window.history.replaceState({}, '', url.toString());
    }

    function updateDraft(next: DocumentTemplate) {
        setDraft(next);
        setPreviewHtml(renderLocalPreview(next, sampleData));
    }

    function save() {
        if (!draft) {
            return;
        }

        router.put(draft.urls.update, toPayload(draft), {
            preserveScroll: true,
            onSuccess: () => toast.success('Template saved.'),
            onError: () => toast.error('Could not save template.'),
        });
    }

    function createTemplate() {
        router.post(
            routes.store,
            {
                type: selectedType,
                name: `New ${templateTypeLabel(selectedType)} template`,
                body_html: '{{items_table}}',
                paper_size: 'A4',
                orientation: 'portrait',
            },
            {
                preserveScroll: true,
                onSuccess: () => toast.success('Template created.'),
                onError: () => toast.error('Could not create template.'),
            },
        );
    }

    function resetDefault() {
        router.put(
            resetUrlForType(selectedType, routes),
            {},
            {
                preserveScroll: true,
                onSuccess: () => toast.success('Default template recreated.'),
                onError: () => toast.error('Could not reset default template.'),
            },
        );
    }

    function duplicate(template: DocumentTemplate) {
        router.post(
            template.urls.duplicate,
            {},
            {
                preserveScroll: true,
                onSuccess: () => toast.success('Template duplicated.'),
                onError: () => toast.error('Could not duplicate template.'),
            },
        );
    }

    function setDefault(template: DocumentTemplate) {
        router.put(
            template.urls.setDefault,
            {},
            {
                preserveScroll: true,
                onSuccess: () => toast.success('Default template updated.'),
                onError: () => toast.error('Could not update default template.'),
            },
        );
    }

    function deleteTemplate(template: DocumentTemplate) {
        if (!window.confirm(`Delete "${template.name}"?`)) {
            return;
        }

        router.delete(template.urls.delete, {
            preserveScroll: true,
            onSuccess: () => toast.success('Template deleted.'),
            onError: () => toast.error('Could not delete this template.'),
        });
    }

    function resetDraft() {
        if (selectedTemplate) {
            setDraft(clone(selectedTemplate));
            setPreviewHtml(renderLocalPreview(selectedTemplate, sampleData));
        }
    }


    function openHistory() {
        const url = draft?.urls?.versions || selectedTemplate?.urls?.versions;

        if (!url) {
            toast.error('History URL is missing.');
            return;
        }

        router.visit(url);
    }

    function saveSnapshot() {
        const url = draft?.urls?.snapshot || selectedTemplate?.urls?.snapshot;

        if (!url) {
            toast.error('Snapshot URL is missing.');
            return;
        }

        router.post(
            url,
            {},
            {
                preserveScroll: true,
                onSuccess: () => toast.success('Template snapshot saved.'),
                onError: () => toast.error('Could not save snapshot.'),
            },
        );
    }
    async function backendPreview() {
        if (!draft?.urls.preview) {
            return;
        }

        try {
            const response = await fetch(draft.urls.preview, {
                headers: {
                    Accept: 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Preview request failed.');
            }

            const data = (await response.json()) as { html?: string };

            setPreviewHtml(data.html || renderLocalPreview(draft, sampleData));
            toast.success('Exact preview refreshed.');
        } catch {
            setPreviewHtml(renderLocalPreview(draft, sampleData));
            toast.error('Backend preview failed. Local preview is displayed.');
        }
    }

    return (
        <>
            <Head title="Finance Templates" />

            <AppShell
                eyebrowKey="financeWorkspace.eyebrow"
                titleKey="financeWorkspace.title"
                subtitleKey="financeWorkspace.subtitle"
            >
                <div className="space-y-3 px-3 py-3 lg:px-4">
                    <div className="rounded-2xl border bg-[var(--surface)] p-4">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div className="min-w-0">
                                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                                    <LayoutTemplate size={14} />
                                    Finance Template Studio
                                </div>

                                <h1 className="mt-2 text-2xl font-semibold tracking-tight">
                                    Edit document templates
                                </h1>

                                <p className="mt-1 max-w-2xl text-sm text-[var(--text-muted)]">
                                    Customize Devis, Facture and ReÃ§u templates. Edit source, check placeholders, and preview final documents before generating PDFs.
                                </p>
                            </div>

                            <div className="grid grid-cols-3 gap-2 text-center">
                                <div className="rounded-2xl border bg-[var(--surface-2)] px-3 py-2">
                                    <p className="text-lg font-semibold">{templates.length}</p>
                                    <p className="text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)]">
                                        Templates
                                    </p>
                                </div>

                                <div className="rounded-2xl border bg-[var(--surface-2)] px-3 py-2">
                                    <p className="text-lg font-semibold">{placeholderCount}</p>
                                    <p className="text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)]">
                                        Variables
                                    </p>
                                </div>

                                <div className="rounded-2xl border bg-[var(--surface-2)] px-3 py-2">
                                    <p className="text-lg font-semibold">
                                        {visibleTemplates.filter((item) => item.isDefault).length}
                                    </p>
                                    <p className="text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)]">
                                        Default
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4">
                            <TypeTabs selectedType={selectedType} templates={templates} onChange={changeType} />
                        </div>
                    </div>

                    <WorkbenchHeader
                        selectedType={selectedType}
                        draft={draft}
                        selectedTemplate={selectedTemplate}
                        leftCollapsed={leftCollapsed}
                        rightCollapsed={rightCollapsed}
                        previewFocus={previewFocus}
                        isDirty={isDirty}
                        onToggleLeft={() => setLeftCollapsed((value) => !value)}
                        onToggleRight={() => setRightCollapsed((value) => !value)}
                        onTogglePreviewFocus={() => setPreviewFocus((value) => !value)}
                        onCreate={createTemplate}
                        onResetDefault={resetDefault}
                        onSave={save}
                        onResetDraft={resetDraft}
                        onBackendPreview={() => void backendPreview()}
                        onOpenHistory={openHistory}
                        onSaveSnapshot={saveSnapshot}
                    />

                    <MobileViewSwitch view={mobileView} onChange={setMobileView} />

                    <div
                        className="grid gap-3 transition-[grid-template-columns] duration-200 xl:grid-cols-[var(--template-grid)]"
                        style={{ '--template-grid': gridTemplateColumns } as CSSProperties}
                    >
                        <div className={mobileView === 'preview' ? 'hidden xl:block' : ''}>
                            {leftCollapsed ? (
                                <CollapsedRail label="Templates" side="left" onOpen={() => setLeftCollapsed(false)} />
                            ) : (
                                <TemplateList
                                    templates={visibleTemplates}
                                    selectedId={draft?.id}
                                    onSelect={selectTemplate}
                                    onDuplicate={duplicate}
                                    onSetDefault={setDefault}
                                    onDelete={deleteTemplate}
                                />
                            )}
                        </div>

                        <div className={mobileView === 'preview' ? 'hidden xl:block' : ''}>
                            {draft ? (
                                <TemplateEditorForm
                                    value={draft}
                                    placeholders={placeholders}
                                    onChange={updateDraft}
                                    onSave={save}
                                    onReset={resetDraft}
                                />
                            ) : (
                                <EmptyTemplateState onCreate={createTemplate} />
                            )}
                        </div>

                        <div className={mobileView === 'editor' ? 'hidden xl:block' : ''}>
                            {rightCollapsed ? (
                                <CollapsedRail label="Inspector" side="right" onOpen={() => setRightCollapsed(false)} />
                            ) : (
                                <div className="sticky top-20 space-y-3 self-start">
                                    <TemplatePlaceholderPanel placeholders={placeholders} />

                                    <TemplatePreviewPanel
                                        html={previewHtml}
                                        onRefresh={() => void backendPreview()}
                                        isFocused={previewFocus}
                                        onToggleFocus={() => setPreviewFocus((value) => !value)}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </AppShell>
        </>
    );
}