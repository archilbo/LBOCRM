import { IconAlertTriangle, IconCircleCheck, IconCode, IconCopy, IconFileCode2, IconFileText, IconLayout, IconPalette, IconArrowRotaryFirstLeft, IconDeviceFloppy, IconSearch, IconSparkles } from '@tabler/icons-react';

import { useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import type { DocumentTemplate, TemplatePlaceholder } from '@/features/finance/types';

type TemplateEditorFormProps = {
    value: DocumentTemplate;
    placeholders: TemplatePlaceholder[];
    onChange: (value: DocumentTemplate) => void;
    onSave: () => void;
    onReset: () => void;
};

type EditorTab = 'body' | 'header' | 'footer' | 'css';

type Warning = {
    type: 'error' | 'warning' | 'info';
    message: string;
};

const tabConfig: Array<{
    id: EditorTab;
    label: string;
    icon: typeof IconFileText;
    language: string;
    help: string;
}> = [
    {
        id: 'body',
        label: 'Body',
        icon: IconFileText,
        language: 'HTML',
        help: 'Main document content. For Devis/Facture, keep {{items_table}}.',
    },
    {
        id: 'header',
        label: 'Header',
        icon: IconLayout,
        language: 'HTML',
        help: 'Top section of the A4 document. Recommended logo placeholder: {{company.logo_html}}.',
    },
    {
        id: 'footer',
        label: 'Footer',
        icon: IconFileCode2,
        language: 'HTML',
        help: 'Legal footer, company identifiers, contact and final closing tags.',
    },
    {
        id: 'css',
        label: 'CSS',
        icon: IconPalette,
        language: 'CSS',
        help: 'Visual design for PDF and preview. Keep DomPDF-compatible CSS.',
    },
];

function getCode(value: DocumentTemplate, tab: EditorTab): string {
    if (tab === 'header') {
        return value.headerHtml || '';
    }

    if (tab === 'footer') {
        return value.footerHtml || '';
    }

    if (tab === 'css') {
        return value.css || '';
    }

    return value.bodyHtml || '';
}

function setCode(value: DocumentTemplate, tab: EditorTab, code: string): DocumentTemplate {
    if (tab === 'header') {
        return { ...value, headerHtml: code };
    }

    if (tab === 'footer') {
        return { ...value, footerHtml: code };
    }

    if (tab === 'css') {
        return { ...value, css: code };
    }

    return { ...value, bodyHtml: code };
}

function allTemplateCode(value: DocumentTemplate): string {
    return [
        value.headerHtml || '',
        value.bodyHtml || '',
        value.footerHtml || '',
        value.css || '',
    ].join('\n');
}

function flattenPlaceholders(groups: TemplatePlaceholder[]): string[] {
    return groups.flatMap((group) => group.items || []);
}

function extractPlaceholders(code: string): string[] {
    const matches = code.match(/{{\s*[a-zA-Z0-9_.]+\s*}}/g) || [];

    return Array.from(new Set(matches.map((item) => item.replace(/\s+/g, ''))));
}

function validateTemplate(value: DocumentTemplate, placeholders: TemplatePlaceholder[]): Warning[] {
    const warnings: Warning[] = [];
    const code = allTemplateCode(value);
    const supported = new Set(flattenPlaceholders(placeholders).map((item) => item.replace(/\s+/g, '')));
    const used = extractPlaceholders(code);

    if (/<script\b/i.test(code)) {
        warnings.push({
            type: 'error',
            message: 'Script tags are not allowed and will be removed by backend validation.',
        });
    }

    if (/\son[a-z]+\s*=/i.test(code)) {
        warnings.push({
            type: 'error',
            message: 'Inline event handlers like onclick/onload are unsafe and should be removed.',
        });
    }

    const unsupported = used.filter((item) => !supported.has(item));

    if (unsupported.length > 0) {
        warnings.push({
            type: 'warning',
            message: `Unsupported placeholders: ${unsupported.slice(0, 8).join(', ')}${unsupported.length > 8 ? '...' : ''}`,
        });
    }

    if ((value.type === 'quote' || value.type === 'invoice') && !code.includes('{{items_table}}')) {
        warnings.push({
            type: 'warning',
            message: 'This template type should include {{items_table}}.',
        });
    }

    if (value.type === 'receipt' && !code.includes('{{payments_table}}')) {
        warnings.push({
            type: 'info',
            message: 'Receipt templates usually include {{payments_table}}.',
        });
    }

    if (!code.includes('{{company.logo_html}}')) {
        warnings.push({
            type: 'info',
            message: 'Add {{company.logo_html}} in the header to use the uploaded logo.',
        });
    }

    if (!value.bodyHtml?.trim()) {
        warnings.push({
            type: 'warning',
            message: 'Body HTML is empty.',
        });
    }

    if (!value.css?.trim()) {
        warnings.push({
            type: 'info',
            message: 'CSS is empty. The document may look unstyled.',
        });
    }

    return warnings;
}

function Field({
    label,
    value,
    onChange,
    placeholder,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}) {
    return (
        <label className="min-w-0">
            <span className="mb-1.5 block text-xs font-semibold text-[var(--text)]">{label}</span>

            <input
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                className="h-10 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] outline-none transition hover:border-[var(--accent)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--accent)_20%,transparent)]"
            />
        </label>
    );
}

function SelectField({
    label,
    value,
    onChange,
    options,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: Array<{ value: string; label: string }>;
}) {
    return (
        <label className="min-w-0">
            <span className="mb-1.5 block text-xs font-semibold text-[var(--text)]">{label}</span>

            <select
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="h-10 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] outline-none transition hover:border-[var(--accent)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--accent)_20%,transparent)]"
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </label>
    );
}

function WarningBox({ warnings }: { warnings: Warning[] }) {
    if (!warnings.length) {
        return (
            <div className="flex items-start gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-500">
                <IconCircleCheck size={15} className="mt-0.5 shrink-0" />
                <div>
                    <p className="font-semibold">Template looks healthy.</p>
                    <p className="mt-1 opacity-80">No major structure issues detected.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {warnings.map((warning, index) => {
                const tone =
                    warning.type === 'error'
                        ? 'border-red-500/20 bg-red-500/10 text-red-500'
                        : warning.type === 'warning'
                          ? 'border-amber-500/20 bg-amber-500/10 text-amber-500'
                          : 'border-sky-500/20 bg-sky-500/10 text-sky-500';

                return (
                    <div key={`${warning.message}-${index}`} className={`flex items-start gap-2 rounded-2xl border p-3 text-xs ${tone}`}>
                        <IconAlertTriangle size={15} className="mt-0.5 shrink-0" />
                        <p>{warning.message}</p>
                    </div>
                );
            })}
        </div>
    );
}

export function TemplateEditorForm({
    value,
    placeholders,
    onChange,
    onSave,
    onReset,
}: TemplateEditorFormProps) {
    const [activeTab, setActiveTab] = useState<EditorTab>('body');
    const [placeholderSearch, setPlaceholderSearch] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    const activeConfig = tabConfig.find((item) => item.id === activeTab) || tabConfig[0];
    const code = getCode(value, activeTab);
    const warnings = useMemo(() => validateTemplate(value, placeholders), [value, placeholders]);

    const flatPlaceholders = useMemo(() => {
        const query = placeholderSearch.trim().toLowerCase();

        return flattenPlaceholders(placeholders)
            .filter((item) => !query || item.toLowerCase().includes(query))
            .slice(0, 20);
    }, [placeholders, placeholderSearch]);

    const usedCount = useMemo(() => extractPlaceholders(allTemplateCode(value)).length, [value]);

    function update<K extends keyof DocumentTemplate>(key: K, nextValue: DocumentTemplate[K]) {
        onChange({
            ...value,
            [key]: nextValue,
        });
    }

    function updateCode(nextCode: string) {
        onChange(setCode(value, activeTab, nextCode));
    }

    function insertPlaceholder(placeholder: string) {
        const textarea = textareaRef.current;

        if (!textarea) {
            updateCode(`${code}${placeholder}`);
            return;
        }

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const nextCode = `${code.slice(0, start)}${placeholder}${code.slice(end)}`;

        updateCode(nextCode);

        requestAnimationFrame(() => {
            textarea.focus();
            textarea.setSelectionRange(start + placeholder.length, start + placeholder.length);
        });
    }

    async function copyCurrentCode() {
        await navigator.clipboard.writeText(code);
        toast.success(`${activeConfig.label} code copied.`);
    }

    function beautifyCode() {
        const next = code
            .replace(/>\s+</g, '>\n<')
            .replace(/\n{3,}/g, '\n\n')
            .trim();

        updateCode(next);
        toast.success('Code cleaned lightly.');
    }

    return (
        <section className="overflow-hidden rounded-2xl border bg-[var(--surface)]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b px-3 py-2">
                <div className="flex min-w-0 items-center gap-2">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] text-[var(--accent)]">
                        <IconCode size={17} />
                    </div>

                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <h2 className="truncate text-sm font-semibold">{value.name || 'Template editor'}</h2>

                            {value.isDefault ? (
                                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[9px] font-bold text-emerald-500">
                                    Default
                                </span>
                            ) : null}
                        </div>

                        <p className="mt-0.5 truncate text-[10px] text-[var(--text-muted)]">
                            {value.slug || 'template'} / {value.typeLabel || value.type}
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                    <button
                        type="button"
                        onClick={onReset}
                        className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border bg-[var(--surface)] px-3 text-xs font-semibold text-[var(--text-muted)] transition hover:border-amber-500 hover:text-amber-500"
                    >
                        <IconArrowRotaryFirstLeft size={14} />
                        Reset
                    </button>

                    <button
                        type="button"
                        onClick={onSave}
                        className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-3 text-xs font-semibold text-white transition hover:opacity-90"
                    >
                        <IconDeviceFloppy size={14} />
                        IconDeviceFloppy
                    </button>
                </div>
            </div>

            <div className="grid gap-3 p-3 xl:grid-cols-[minmax(0,1fr)_280px]">
                <div className="min-w-0 space-y-3">
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
                        <div className="xl:col-span-2">
                            <Field
                                label="Name"
                                value={value.name || ''}
                                onChange={(next) => update('name', next)}
                            />
                        </div>

                        <div className="xl:col-span-2">
                            <Field
                                label="Slug"
                                value={value.slug || ''}
                                onChange={(next) => update('slug', next)}
                            />
                        </div>

                        <SelectField
                            label="Format"
                            value={value.paperSize || 'A4'}
                            onChange={(next) => update('paperSize', next)}
                            options={[
                                { value: 'A4', label: 'A4' },
                                { value: 'A5', label: 'A5' },
                                { value: 'Letter', label: 'Letter' },
                            ]}
                        />

                        <SelectField
                            label="Orientation"
                            value={value.orientation || 'portrait'}
                            onChange={(next) => update('orientation', next)}
                            options={[
                                { value: 'portrait', label: 'Portrait' },
                                { value: 'landscape', label: 'Landscape' },
                            ]}
                        />

                        <div className="md:col-span-2 xl:col-span-3">
                            <Field
                                label="Logo path"
                                value={value.logoPath || ''}
                                onChange={(next) => update('logoPath', next)}
                                placeholder="Optional template-specific logo path"
                            />
                        </div>

                        <div className="md:col-span-2 xl:col-span-3">
                            <Field
                                label="Accent"
                                value={String((value.settings as Record<string, unknown> | undefined)?.accent_color || '')}
                                onChange={(next) =>
                                    update('settings', {
                                        ...((value.settings as Record<string, unknown> | undefined) || {}),
                                        accent_color: next,
                                    })
                                }
                                placeholder="#d8aa26"
                            />
                        </div>
                    </div>

                    <div className="rounded-2xl border bg-[var(--surface-2)] p-1">
                        <div className="grid grid-cols-4 gap-1">
                            {tabConfig.map((tab) => {
                                const Icon = tab.icon;
                                const active = activeTab === tab.id;

                                return (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => setActiveTab(tab.id)}
                                        className={[
                                            'inline-flex h-9 items-center justify-center gap-2 rounded-xl text-xs font-semibold transition',
                                            active
                                                ? 'bg-[var(--accent)] text-white'
                                                : 'text-[var(--text-muted)] hover:bg-[var(--surface)] hover:text-[var(--text)]',
                                        ].join(' ')}
                                    >
                                        <Icon size={14} />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-2xl border">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-[var(--surface-2)] px-3 py-2">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                                    {activeConfig.label} / {activeConfig.language}
                                </p>
                                <p className="mt-0.5 text-[10px] text-[var(--text-muted)]">{activeConfig.help}</p>
                            </div>

                            <div className="flex items-center gap-1.5">
                                <button
                                    type="button"
                                    onClick={beautifyCode}
                                    className="inline-flex h-8 items-center justify-center gap-1.5 rounded-xl border bg-[var(--surface)] px-2.5 text-xs font-semibold text-[var(--text-muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                                >
                                    <IconSparkles size={13} />
                                    Clean
                                </button>

                                <button
                                    type="button"
                                    onClick={() => void copyCurrentCode()}
                                    className="inline-flex h-8 items-center justify-center gap-1.5 rounded-xl border bg-[var(--surface)] px-2.5 text-xs font-semibold text-[var(--text-muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                                >
                                    <IconCopy size={13} />
                                    IconCopy
                                </button>
                            </div>
                        </div>

                        <textarea
                            ref={textareaRef}
                            value={code}
                            onChange={(event) => updateCode(event.target.value)}
                            spellCheck={false}
                            className="min-h-[520px] w-full resize-y bg-[#111827] px-4 py-3 font-mono text-[11px] leading-6 text-slate-100 outline-none selection:bg-[var(--accent)]/30"
                        />
                    </div>
                </div>

                <aside className="space-y-3">
                    <div className="rounded-2xl border bg-[var(--surface-2)] p-3">
                        <div className="mb-3 flex items-center justify-between gap-2">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                                    Template status
                                </p>
                                <p className="mt-1 text-xs text-[var(--text-muted)]">{usedCount} placeholders used</p>
                            </div>

                            <span className="rounded-full bg-[var(--surface)] px-2 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                                {warnings.filter((item) => item.type === 'error').length} errors
                            </span>
                        </div>

                        <WarningBox warnings={warnings} />
                    </div>

                    <div className="rounded-2xl border bg-[var(--surface-2)] p-3">
                        <div className="mb-3">
                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                                Insert placeholder
                            </p>

                            <label className="mt-2 flex h-10 items-center gap-2 rounded-2xl border bg-[var(--surface)] px-3">
                                <IconSearch size={14} className="text-[var(--text-muted)]" />
                                <input
                                    value={placeholderSearch}
                                    onChange={(event) => setPlaceholderSearch(event.target.value)}
                                    placeholder="IconSearch company, total..."
                                    className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--text-muted)]"
                                />
                            </label>
                        </div>

                        <div className="max-h-[360px] space-y-1 overflow-auto">
                            {flatPlaceholders.map((placeholder) => (
                                <button
                                    key={placeholder}
                                    type="button"
                                    onClick={() => insertPlaceholder(placeholder)}
                                    className="block w-full truncate rounded-xl bg-[var(--surface)] px-3 py-2 text-left font-mono text-[10px] text-[var(--text-muted)] transition hover:bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] hover:text-[var(--accent)]"
                                    title={placeholder}
                                >
                                    {placeholder}
                                </button>
                            ))}
                        </div>
                    </div>
                </aside>
            </div>
        </section>
    );
}

export default TemplateEditorForm;