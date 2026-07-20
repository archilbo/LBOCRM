import { Input, ListBox, Select } from '@heroui/react';
import { AlertTriangle, CheckCircle2, ChevronDown, ChevronRight, Circle } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import type { DocumentTemplate, TemplatePlaceholder } from '@/features/finance/types';
import { validateTemplateContent } from '@/features/finance/templates/templateValidation';
import { TemplateCodeEditor } from './TemplateCodeEditor';
import type { TemplateCodeEditorHandle } from './TemplateCodeEditor';
import { TemplatePlaceholderPanel } from './TemplatePlaceholderPanel';

type TemplateDraft = DocumentTemplate;

type TemplateEditorFormProps = {
    draft: TemplateDraft;
    onUpdate: (patch: Partial<TemplateDraft>) => void;
    placeholders: TemplatePlaceholder[];
    activeSection: 'bodyHtml' | 'headerHtml' | 'footerHtml' | 'css';
    onSectionChange: (section: 'bodyHtml' | 'headerHtml' | 'footerHtml' | 'css') => void;
    onSave: () => void;
};

const TABS: Array<{ key: TemplateDraftSection; label: string; language: 'html' | 'css' }> = [
    { key: 'bodyHtml', label: 'Body', language: 'html' },
    { key: 'headerHtml', label: 'Header', language: 'html' },
    { key: 'footerHtml', label: 'Footer', language: 'html' },
    { key: 'css', label: 'CSS', language: 'css' },
];

type TemplateDraftSection = 'bodyHtml' | 'headerHtml' | 'footerHtml' | 'css';

const compactField = 'h-8 w-full rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-2 text-xs text-[var(--text)] outline-none focus:border-[var(--accent)]';
const selectPopover = 'z-[80] min-w-[var(--trigger-width)] rounded-lg border border-[var(--border)] bg-[var(--surface)] p-1 shadow-xl';
const selectItem = 'cursor-pointer rounded-md px-2 py-1.5 text-xs text-[var(--text)] outline-none data-[focus-visible]:bg-[var(--surface-2)] data-[selected]:text-[var(--accent)]';

function EditorSelect<T extends string>({ label, value, options, onChange }: {
    label: string;
    value: T;
    options: Array<{ id: T; label: string }>;
    onChange: (value: T) => void;
}) {
    return (
        <label className="space-y-1">
            <span className="text-[10px] font-semibold text-[var(--text-muted)]">{label}</span>
            <Select selectedKey={value} onSelectionChange={(key) => onChange(String(key) as T)} aria-label={label}>
                <Select.Trigger className={compactField}>
                    <Select.Value className="flex-1 truncate text-left" />
                    <Select.Indicator><ChevronDown size={13} className="text-[var(--text-muted)]" /></Select.Indicator>
                </Select.Trigger>
                <Select.Popover isNonModal className={selectPopover}>
                    <ListBox className="outline-none">
                        {options.map((option) => (
                            <ListBox.Item key={option.id} id={option.id} textValue={option.label} className={selectItem}>
                                {option.label}
                            </ListBox.Item>
                        ))}
                    </ListBox>
                </Select.Popover>
            </Select>
        </label>
    );
}

export function TemplateEditorForm({
    draft,
    onUpdate,
    placeholders,
    activeSection,
    onSectionChange,
    onSave,
}: TemplateEditorFormProps) {
    const [metaOpen, setMetaOpen] = useState(false);
    const editorRef = useRef<TemplateCodeEditorHandle>(null);

    const currentValue = draft[activeSection] as string;
    const currentLang = TABS.find((t) => t.key === activeSection)?.language ?? 'html';

    function handleChange(value: string) {
        onUpdate({ [activeSection]: value } as Partial<TemplateDraft>);
    }

    function handleInsert(text: string) {
        editorRef.current?.insertAtCursor(text);
    }

    function hasContent(key: TemplateDraftSection): boolean {
        return !!(draft[key] as string)?.trim();
    }

    const validation = useMemo(() => validateTemplateContent(
        draft.type,
        [draft.headerHtml, draft.bodyHtml, draft.footerHtml, draft.css].filter(Boolean).join('\n'),
        placeholders,
    ), [draft, placeholders]);
    const validationMessage = [...validation.errors, ...validation.warnings].join(' ');
    const metaSummary = `${draft.name} / ${draft.paperSize} ${draft.orientation}`;

    return (
        <div className="flex flex-col min-h-0 flex-1">
            {/* Collapsible meta section */}
            <div className="border-b border-[var(--border)]">
                <button
                    type="button"
                    onClick={() => setMetaOpen((v) => !v)}
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-[var(--text-muted)] hover:text-[var(--text)]"
                >
                    {metaOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                    <span className="truncate">{metaOpen ? 'Details' : metaSummary}</span>
                </button>

                {metaOpen ? (
                    <div className="grid grid-cols-1 gap-3 border-t border-[var(--border)] px-3 pb-3 pt-2 sm:grid-cols-2 xl:grid-cols-4">
                        <label className="space-y-1">
                            <span className="text-[10px] font-semibold text-[var(--text-muted)]">Name</span>
                            <Input
                                className="h-8 w-full rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-2 text-xs text-[var(--text)] outline-none focus:border-[var(--accent)]"
                                value={draft.name}
                                onChange={(e) => onUpdate({ name: e.target.value })}
                            />
                        </label>
                        <label className="space-y-1">
                            <span className="text-[10px] font-semibold text-[var(--text-muted)]">Slug</span>
                            <Input
                                className="h-8 w-full rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-2 text-xs text-[var(--text)] outline-none focus:border-[var(--accent)]"
                                value={draft.slug}
                                onChange={(e) => onUpdate({ slug: e.target.value })}
                            />
                        </label>
                        <EditorSelect
                            label="Papier"
                            value={draft.paperSize}
                            options={[{ id: 'A4', label: 'A4' }, { id: 'A5', label: 'A5' }, { id: 'Letter', label: 'Letter' }]}
                            onChange={(paperSize) => onUpdate({ paperSize })}
                        />
                        <EditorSelect
                            label="Orientation"
                            value={draft.orientation}
                            options={[{ id: 'portrait', label: 'Portrait' }, { id: 'landscape', label: 'Paysage' }]}
                            onChange={(orientation) => onUpdate({ orientation })}
                        />
                    </div>
                ) : null}
            </div>

            {/* Editor tabs */}
            <div className="flex w-full items-center border-b border-[var(--border)] bg-[var(--surface-2)] px-2">
                {TABS.map((tab) => {
                    const active = activeSection === tab.key;
                    return (
                        <button
                            key={tab.key}
                            type="button"
                            onClick={() => onSectionChange(tab.key)}
                            className={`flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2 text-xs font-medium transition ${
                                active
                                    ? 'border-[var(--accent)] text-[var(--accent)]'
                                    : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text)]'
                            }`}
                        >
                            {hasContent(tab.key) ? (
                                <Circle size={6} className="fill-current" />
                            ) : (
                                <Circle size={6} className="text-[var(--text-muted)]" />
                            )}
                            {tab.label}
                        </button>
                    );
                })}
                <div className="ml-auto flex min-w-0 items-center gap-2 pl-2">
                    {validation.errors.length > 0 ? (
                        <span className="flex items-center gap-1 text-[10px] font-medium text-[var(--danger)]" title={validationMessage}>
                            <AlertTriangle size={11} /> {validation.errors.length} erreur(s)
                        </span>
                    ) : validation.warnings.length > 0 ? (
                        <span className="flex items-center gap-1 text-[10px] font-medium text-[var(--warning)]" title={validationMessage}>
                            <AlertTriangle size={11} /> {validation.warnings.length} alerte(s)
                        </span>
                    ) : (
                        <span className="flex items-center gap-1 text-[10px] font-medium text-[var(--success)]">
                            <CheckCircle2 size={11} /> Valide
                        </span>
                    )}
                    <span className="hidden truncate text-[10px] text-[var(--text-muted)] sm:inline">{activeSection.replace('Html', '.html').replace('css', '.css')}</span>
                </div>
            </div>

            {/* Single CodeMirror fills remaining height */}
            <div className="flex-1 min-h-0 overflow-hidden">
                <TemplateCodeEditor
                    ref={editorRef}
                    value={currentValue}
                    onChange={handleChange}
                    language={currentLang}
                    minHeight="0"
                    onSave={onSave}
                />
            </div>

            {/* Variables bar */}
            <TemplatePlaceholderPanel placeholders={placeholders} onInsert={handleInsert} />
        </div>
    );
}

export default TemplateEditorForm;
