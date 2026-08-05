import { Head, router } from '@inertiajs/react';
import { IconCode, IconFileText } from '@tabler/icons-react';

import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { AppShell } from '@/components/layout/AppShell';
import { AppButton } from '@/components/ui/AppButton';
import { AppInput } from '@/components/ui/AppInput';
import { AppModal } from '@/components/ui/AppModal';
import type { DocumentTemplate, FinanceDocumentType, TemplatePlaceholder } from '@/features/finance/types';
import { validateTemplateContent } from '@/features/finance/templates/templateValidation';
import { TemplatePreviewPanel } from './TemplatePreviewPanel';
import { TemplateList } from './components/TemplateList';
import { TemplateToolbar } from './components/TemplateToolbar';
import { TemplateEditorForm } from './components/TemplateEditorForm';

type PageProps = {
    templates?: DocumentTemplate[] | { data?: DocumentTemplate[] };
    placeholders: TemplatePlaceholder[];
    sampleData: Record<string, unknown>;
    routes: {
        store: string;
        close: string;
    };
};

type TemplateDraft = DocumentTemplate;
type EditorSection = 'bodyHtml' | 'headerHtml' | 'footerHtml' | 'css';

const documentTypes: Array<{ type: FinanceDocumentType; label: string }> = [
    { type: 'quote', label: 'Devis' },
    { type: 'invoice', label: 'Factures' },
    { type: 'receipt', label: 'Recus' },
];

function unwrapTemplates(value?: DocumentTemplate[] | { data?: DocumentTemplate[] }): DocumentTemplate[] {
    return Array.isArray(value) ? value : value?.data || [];
}

function cloneTemplate(template: DocumentTemplate): TemplateDraft {
    return JSON.parse(JSON.stringify(template)) as TemplateDraft;
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

export default function FinanceTemplatesIndex({
    templates: rawTemplates,
    placeholders,
    sampleData,
    routes,
}: PageProps) {
    const templates = useMemo(() => unwrapTemplates(rawTemplates), [rawTemplates]);
    const params = new URLSearchParams(window.location.search);
    const requestedType = params.get('type') as FinanceDocumentType | null;
    const requestedTypeExists = documentTypes.some((item) => item.type === requestedType)
        && templates.some((template) => template.type === requestedType);
    const firstPersistedType = templates.find((template) =>
        documentTypes.some((item) => item.type === template.type),
    )?.type;
    const initialType = requestedTypeExists ? requestedType! : firstPersistedType || 'quote';

    const [selectedType, setSelectedType] = useState<FinanceDocumentType>(initialType);
    const visibleTemplates = useMemo(
        () => templates.filter((t) => t.type === selectedType),
        [templates, selectedType],
    );

    const [selectedId, setSelectedId] = useState<number | undefined>(() => {
        const id = params.get('template');
        return id ? Number(id) : undefined;
    });

    const selectedTemplate = useMemo(
        () => visibleTemplates.find((t) => t.id === selectedId) || visibleTemplates[0] || null,
        [selectedId, visibleTemplates],
    );

    const [draft, setDraft] = useState<TemplateDraft | null>(() =>
        selectedTemplate ? cloneTemplate(selectedTemplate) : null,
    );
    const [rawPreviewHtml, setRawPreviewHtml] = useState(() =>
        draft ? renderPreview(draft, sampleData) : '',
    );

    const dirty = isDirty(draft, selectedTemplate);
    const [deleteTarget, setDeleteTarget] = useState<DocumentTemplate | null>(null);
    const [renameTarget, setRenameTarget] = useState<DocumentTemplate | null>(null);
    const [renameName, setRenameName] = useState('');
    const [renameError, setRenameError] = useState<string>();
    const [showStarterModal, setShowStarterModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [pendingConfirmAction, setPendingConfirmAction] = useState<(() => void) | null>(null);
    const [leftCollapsed, setLeftCollapsed] = useState(() => localStorage.getItem('tpl_left_collapsed') === '1');
    const [previewCollapsed, setPreviewCollapsed] = useState(() => localStorage.getItem('tpl_preview_collapsed') === '1');
    const [activeSection, setActiveSection] = useState<EditorSection>('bodyHtml');

    // Debounce preview (400ms)
    const [previewHtml, setPreviewHtml] = useState(rawPreviewHtml);
    const debounceRef = useRef<ReturnType<typeof setTimeout>>();
    useEffect(() => {
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => setPreviewHtml(rawPreviewHtml), 400);
        return () => clearTimeout(debounceRef.current);
    }, [rawPreviewHtml]);

    useEffect(() => {
        localStorage.setItem('tpl_left_collapsed', leftCollapsed ? '1' : '0');
    }, [leftCollapsed]);

    useEffect(() => {
        localStorage.setItem('tpl_preview_collapsed', previewCollapsed ? '1' : '0');
    }, [previewCollapsed]);

    useEffect(() => {
        if (!dirty) return;
        const preventAccidentalExit = (event: BeforeUnloadEvent) => {
            event.preventDefault();
            event.returnValue = '';
        };
        window.addEventListener('beforeunload', preventAccidentalExit);
        return () => window.removeEventListener('beforeunload', preventAccidentalExit);
    }, [dirty]);

    useEffect(() => {
        if (!selectedTemplate) {
            setDraft(null);
            setRawPreviewHtml('');
            setActiveSection('bodyHtml');
            return;
        }
        const next = cloneTemplate(selectedTemplate);
        setDraft(next);
        setRawPreviewHtml(renderPreview(next, sampleData));
    }, [selectedTemplate?.id, selectedTemplate?.name, selectedTemplate?.updatedAt]);

    useEffect(() => {
        if (selectedTemplate && selectedId !== selectedTemplate.id) {
            setSelectedId(selectedTemplate.id);
        }
    }, [selectedId, selectedTemplate?.id]);

    // Keyboard shortcuts
    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            const ctrl = e.ctrlKey || e.metaKey;
            if (ctrl && e.key === 's') {
                e.preventDefault();
                save();
                return;
            }
            if (ctrl && ['1', '2', '3', '4'].includes(e.key)) {
                e.preventDefault();
                const sections: EditorSection[] = ['bodyHtml', 'headerHtml', 'footerHtml', 'css'];
                const idx = parseInt(e.key, 10) - 1;
                if (idx < sections.length) setActiveSection(sections[idx]);
                return;
            }
        }
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [draft, dirty]);

    const typeCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        for (const t of templates) {
            counts[t.type] = (counts[t.type] || 0) + 1;
        }
        return counts;
    }, [templates]);

    function selectType(type: FinanceDocumentType) {
        if (dirty) {
            setPendingConfirmAction(() => () => {
                const first = templates.find((t) => t.type === type);
                setSelectedType(type);
                setSelectedId(first?.id);
                setActiveSection('bodyHtml');
                const url = new URL(window.location.href);
                url.searchParams.set('type', type);
                if (first) url.searchParams.set('template', String(first.id));
                else url.searchParams.delete('template');
                window.history.replaceState({}, '', url.toString());
            });
            return;
        }
        const first = templates.find((t) => t.type === type);
        setSelectedType(type);
        setSelectedId(first?.id);
        setActiveSection('bodyHtml');
        const url = new URL(window.location.href);
        url.searchParams.set('type', type);
        if (first) url.searchParams.set('template', String(first.id));
        else url.searchParams.delete('template');
        window.history.replaceState({}, '', url.toString());
    }

    function selectTemplate(template: DocumentTemplate) {
        if (dirty) {
            setPendingConfirmAction(() => () => {
                setSelectedId(template.id);
                setDraft(cloneTemplate(template));
                setRawPreviewHtml(renderPreview(template, sampleData));
                setActiveSection('bodyHtml');
                const url = new URL(window.location.href);
                url.searchParams.set('type', template.type);
                url.searchParams.set('template', String(template.id));
                window.history.replaceState({}, '', url.toString());
            });
            return;
        }
        setSelectedId(template.id);
        setDraft(cloneTemplate(template));
        setRawPreviewHtml(renderPreview(template, sampleData));
        setActiveSection('bodyHtml');
        const url = new URL(window.location.href);
        url.searchParams.set('type', template.type);
        url.searchParams.set('template', String(template.id));
        window.history.replaceState({}, '', url.toString());
    }

    function updateDraft(patch: Partial<TemplateDraft>) {
        if (!draft) return;
        const next = { ...draft, ...patch };
        setDraft(next);
        setRawPreviewHtml(renderPreview(next, sampleData));
    }

    function save() {
        if (!draft || !dirty || saving) return;
        const validation = validateTemplateContent(
            draft.type,
            [draft.headerHtml, draft.bodyHtml, draft.footerHtml, draft.css].filter(Boolean).join('\n'),
            placeholders,
        );
        if (validation.errors.length > 0) {
            toast.error(validation.errors[0]);
            return;
        }
        router.put(draft.urls.update, templatePayload(draft), {
            preserveScroll: true,
            onStart: () => setSaving(true),
            onSuccess: () => toast.success('Template saved.'),
            onError: () => toast.error('Could not save template.'),
            onFinish: () => setSaving(false),
        });
    }

    function closeEditor() {
        const close = () => router.visit(routes.close);
        if (dirty) {
            setPendingConfirmAction(() => close);
            return;
        }
        close();
    }

    function createTemplate() {
        setShowStarterModal(true);
    }

    function createFromStarter(starter: { name: string; slug: string; bodyHtml: string }) {
        setShowStarterModal(false);
        router.post(routes.store, {
            type: selectedType,
            name: starter.name,
            slug: starter.slug,
            header_html: '',
            body_html: starter.bodyHtml,
            footer_html: '',
            css: '',
            paper_size: 'A4',
            orientation: 'portrait',
            is_default: false,
        }, {
            preserveScroll: true,
            onSuccess: () => toast.success(`Template "${starter.name}" created.`),
            onError: () => toast.error('Could not create template.'),
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
        setDeleteTarget(template);
    }

    function openRename(template: DocumentTemplate) {
        setRenameTarget(template);
        setRenameName(template.name);
        setRenameError(undefined);
    }

    function confirmRename() {
        if (!renameTarget) return;
        const name = renameName.trim();
        if (!name) {
            setRenameError('Le nom du template est obligatoire.');
            return;
        }

        router.patch(renameTarget.urls.rename, { name }, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Template renomme.');
                setRenameTarget(null);
                setRenameError(undefined);
            },
            onError: (errors) => setRenameError(String(errors.name || 'Impossible de renommer le template.')),
        });
    }

    function confirmDelete() {
        if (!deleteTarget) return;
        router.delete(`/finance/templates/${deleteTarget.id}`, {
            preserveScroll: true,
            onSuccess: () => { toast.success('Template deleted.'); setDeleteTarget(null); },
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
        if (dirty) {
            toast.warning('Enregistrez le template avant de charger l apercu exact.');
            return;
        }
        try {
            const response = await fetch(draft.urls.preview, { headers: { Accept: 'application/json' } });
            const data = await response.json() as { html?: string };
            setRawPreviewHtml(data.html || renderPreview(draft, sampleData));
            toast.success('Exact preview loaded.');
        } catch {
            toast.error('Exact preview failed.');
        }
    }

    const STARTER_TEMPLATES = [
        {
            name: 'Minimal',
            slug: 'minimal-template',
            description: 'Clean layout with basic header and items table',
            bodyHtml: '<h1>{{company_name}}</h1>\n<p>{{client_name}}</p>\n{{items_table}}\n<p>Total: {{total_ttc}}</p>',
        },
        {
            name: 'Classic',
            slug: 'classic-template',
            description: 'Traditional document with header/footer sections',
            bodyHtml: '<div class="header">{{company_name}} — {{document_number}}</div>\n{{items_table}}\n<div class="footer">Page {{page_number}}</div>',
        },
        {
            name: 'Modern',
            slug: 'modern-template',
            description: 'Modern design with accent colors and columns',
            bodyHtml: '<section class="hero">{{company_name}}</section>\n<section>{{client_name}} — {{document_date}}</section>\n{{items_table}}\n<hr/>\n<p><strong>Total TTC:</strong> {{total_ttc}}</p>',
        },
    ];

    // Mobile tab state
    const [mobileTab, setMobileTab] = useState<'templates' | 'editor' | 'preview'>('editor');

    function renderMainContent() {
        if (draft) {
            return (
                <TemplateEditorForm
                    draft={draft}
                    onUpdate={updateDraft}
                    placeholders={placeholders}
                    activeSection={activeSection}
                    onSectionChange={setActiveSection}
                    onSave={save}
                />
            );
        }
        return (
            <div className="flex min-h-0 flex-1 items-center justify-center text-center">
                <div>
                    <IconFileText className="mx-auto text-[var(--accent)]" size={28} />
                    <h2 className="mt-2 text-sm font-semibold text-[var(--text)]">No template selected</h2>
                    <p className="mt-1 text-xs text-[var(--text-muted)]">Create or reset a default template.</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <Head title="Finance templates" />

            <AppShell fullBleed>
                <div className="flex h-full w-full flex-col min-h-0">
                    <TemplateToolbar
                        selectedType={selectedType}
                        documentTypes={documentTypes}
                        typeCounts={typeCounts}
                        onSelectType={selectType}
                        templatesTotal={templates.length}
                        variablesTotal={placeholders.reduce((s, g) => s + g.items.length, 0)}
                        draftName={draft?.name}
                        dirty={dirty}
                        saving={saving}
                        onNew={createTemplate}
                        onSave={save}
                        onVersions={draft?.urls.versions ? () => router.visit(draft.urls.versions!) : undefined}
                        onDuplicate={() => draft && duplicateTemplate(draft)}
                        onRename={() => draft && openRename(draft)}
                        onDelete={() => draft && deleteTemplate(draft)}
                        onSetDefault={() => draft && setDefault(draft)}
                        onClose={closeEditor}
                    />

                    {/* Desktop 3-pane layout — fills all width */}
                    <div className="hidden xl:flex flex-1 min-h-0 w-full">
                        <TemplateList
                            templates={visibleTemplates}
                            selectedId={selectedId}
                            onSelect={selectTemplate}
                            onRename={openRename}
                            collapsed={leftCollapsed}
                            onToggleCollapse={() => setLeftCollapsed((v) => !v)}
                        />

                        <div className="flex min-w-[480px] flex-1 flex-col min-h-0 bg-[var(--surface)]">
                            {renderMainContent()}
                        </div>

                        <TemplatePreviewPanel
                            html={previewHtml}
                            onRefresh={() => void exactPreview()}
                            paperSize={(draft?.paperSize as 'A4' | 'A5' | 'Letter') || 'A4'}
                            orientation={(draft?.orientation as 'portrait' | 'landscape') || 'portrait'}
                            collapsed={previewCollapsed}
                            onToggleCollapse={() => setPreviewCollapsed((v) => !v)}
                        />
                    </div>

                    {/* Tablet: 1024-1279px — preview collapsed by default */}
                    <div className="hidden lg:flex xl:hidden flex-1 min-h-0 w-full">
                        <TemplateList
                            templates={visibleTemplates}
                            selectedId={selectedId}
                            onSelect={selectTemplate}
                            onRename={openRename}
                            collapsed={leftCollapsed}
                            onToggleCollapse={() => setLeftCollapsed((v) => !v)}
                        />
                        <div className="flex min-w-0 flex-1 flex-col min-h-0 bg-[var(--surface)]">
                            {renderMainContent()}
                        </div>
                        <TemplatePreviewPanel
                            html={previewHtml}
                            onRefresh={() => void exactPreview()}
                            paperSize={(draft?.paperSize as 'A4' | 'A5' | 'Letter') || 'A4'}
                            orientation={(draft?.orientation as 'portrait' | 'landscape') || 'portrait'}
                            collapsed={true}
                        />
                    </div>

                    {/* Mobile tabbed layout (<1024px) */}
                    <div className="flex flex-col min-h-0 flex-1 lg:hidden">
                        <div className="flex border-b border-[var(--border)] bg-[var(--surface-2)]">
                            {(['templates', 'editor', 'preview'] as const).map((tab) => (
                                <button
                                    key={tab}
                                    type="button"
                                    onClick={() => setMobileTab(tab)}
                                    className={`flex-1 py-2 text-center text-xs font-medium transition ${
                                        mobileTab === tab
                                            ? 'border-b-2 border-[var(--accent)] text-[var(--accent)]'
                                            : 'text-[var(--text-muted)]'
                                    }`}
                                >
                                    {tab === 'templates' ? 'Templates' : tab === 'editor' ? 'Editor' : 'Preview'}
                                </button>
                            ))}
                        </div>
                        <div className="flex-1 min-h-0 overflow-hidden">
                            {mobileTab === 'templates' ? (
                                <TemplateList
                                    templates={visibleTemplates}
                                    selectedId={selectedId}
                                    onSelect={(t) => { selectTemplate(t); setMobileTab('editor'); }}
                                    onRename={openRename}
                                    collapsed={false}
                                    onToggleCollapse={() => {}}
                                />
                            ) : mobileTab === 'editor' ? (
                                <div className="flex flex-col h-full min-h-0 bg-[var(--surface)]">
                                    {renderMainContent()}
                                </div>
                            ) : (
                                <TemplatePreviewPanel
                                    html={previewHtml}
                                    onRefresh={() => void exactPreview()}
                                    paperSize={(draft?.paperSize as 'A4' | 'A5' | 'Letter') || 'A4'}
                                    orientation={(draft?.orientation as 'portrait' | 'landscape') || 'portrait'}
                                    collapsed={false}
                                />
                            )}
                        </div>
                    </div>
                </div>

                <AppModal
                    isOpen={!!renameTarget}
                    onOpenChange={(open) => { if (!open) setRenameTarget(null); }}
                    title="Renommer le template"
                    size="sm"
                >
                    <form
                        onSubmit={(event) => {
                            event.preventDefault();
                            confirmRename();
                        }}
                    >
                        <AppInput
                            label="Nom"
                            value={renameName}
                            onChange={(value) => {
                                setRenameName(value);
                                setRenameError(undefined);
                            }}
                            error={renameError}
                            autoFocus
                        />
                        <p className="mt-2 text-xs text-[var(--text-muted)]">
                            Le slug reste inchange afin de proteger les references existantes.
                        </p>
                        <div className="mt-5 flex justify-end gap-2">
                            <AppButton variant="secondary" onPress={() => setRenameTarget(null)}>Annuler</AppButton>
                            <AppButton type="submit" isDisabled={!renameName.trim()}>Renommer</AppButton>
                        </div>
                    </form>
                </AppModal>

                <AppModal
                    isOpen={!!deleteTarget}
                    onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
                    title="Delete template?"
                    size="sm"
                >
                    <p className="mb-5 text-sm text-[var(--text-muted)]">
                        Delete <strong>{deleteTarget?.name}</strong>? This action cannot be undone.
                    </p>
                    <div className="flex justify-end gap-2">
                        <AppButton variant="secondary" onPress={() => setDeleteTarget(null)}>Cancel</AppButton>
                        <AppButton variant="danger" onPress={confirmDelete}>Delete</AppButton>
                    </div>
                </AppModal>

                <AppModal
                    isOpen={!!pendingConfirmAction}
                    onOpenChange={(open) => { if (!open) setPendingConfirmAction(null); }}
                    title="Unsaved changes"
                    size="sm"
                >
                    <p className="mb-5 text-sm text-[var(--text-muted)]">
                        You have unsaved changes. Discard them and continue?
                    </p>
                    <div className="flex justify-end gap-2">
                        <AppButton variant="secondary" onPress={() => setPendingConfirmAction(null)}>Cancel</AppButton>
                        <AppButton variant="danger" onPress={() => { pendingConfirmAction?.(); setPendingConfirmAction(null); }}>Discard</AppButton>
                    </div>
                </AppModal>

                <AppModal
                    isOpen={showStarterModal}
                    onOpenChange={setShowStarterModal}
                    title="Choose a starter template"
                    size="md"
                >
                    <p className="mb-4 text-sm text-[var(--text-muted)]">
                        Pick a starting point for your new {documentTypes.find((d) => d.type === selectedType)?.label} template.
                    </p>
                    <div className="grid gap-3 sm:grid-cols-3">
                        {STARTER_TEMPLATES.map((starter) => (
                            <button
                                key={starter.slug}
                                type="button"
                                onClick={() => createFromStarter(starter)}
                                className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-left transition hover:border-[var(--accent)]"
                            >
                                <div className="mb-2 flex size-10 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] text-[var(--accent)]">
                                    <IconCode size={18} />
                                </div>
                                <h3 className="font-semibold text-[var(--text)]">{starter.name}</h3>
                                <p className="mt-1 text-xs text-[var(--text-muted)]">{starter.description}</p>
                            </button>
                        ))}
                    </div>
                    <div className="mt-4 flex justify-end gap-2">
                        <AppButton variant="secondary" onPress={() => setShowStarterModal(false)}>Cancel</AppButton>
                    </div>
                </AppModal>
            </AppShell>
        </>
    );
}
