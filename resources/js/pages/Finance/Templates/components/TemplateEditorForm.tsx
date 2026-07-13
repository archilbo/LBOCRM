import { ChevronDown, ChevronRight, Circle } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import type { DocumentTemplate, TemplatePlaceholder } from '@/features/finance/types';
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
};

const TABS: Array<{ key: TemplateDraftSection; label: string; language: 'html' | 'css' }> = [
    { key: 'bodyHtml', label: 'Body', language: 'html' },
    { key: 'headerHtml', label: 'Header', language: 'html' },
    { key: 'footerHtml', label: 'Footer', language: 'html' },
    { key: 'css', label: 'CSS', language: 'css' },
];

type TemplateDraftSection = 'bodyHtml' | 'headerHtml' | 'footerHtml' | 'css';

export function TemplateEditorForm({
    draft,
    onUpdate,
    placeholders,
    activeSection,
    onSectionChange,
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

    const metaSummary = `${draft.name} · ${draft.paperSize} ${draft.orientation}`;

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
                    <div className="grid grid-cols-4 gap-3 border-t border-[var(--border)] px-3 pb-3 pt-2">
                        <label className="space-y-1">
                            <span className="text-[10px] font-semibold text-[var(--text-muted)]">Name</span>
                            <input
                                className="h-8 w-full rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-2 text-xs text-[var(--text)] outline-none focus:border-[var(--accent)]"
                                value={draft.name}
                                onChange={(e) => onUpdate({ name: e.target.value })}
                            />
                        </label>
                        <label className="space-y-1">
                            <span className="text-[10px] font-semibold text-[var(--text-muted)]">Slug</span>
                            <input
                                className="h-8 w-full rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-2 text-xs text-[var(--text)] outline-none focus:border-[var(--accent)]"
                                value={draft.slug}
                                onChange={(e) => onUpdate({ slug: e.target.value })}
                            />
                        </label>
                        <label className="space-y-1">
                            <span className="text-[10px] font-semibold text-[var(--text-muted)]">Paper</span>
                            <select
                                className="h-8 w-full rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-2 text-xs text-[var(--text)] outline-none focus:border-[var(--accent)]"
                                value={draft.paperSize}
                                onChange={(e) => onUpdate({ paperSize: e.target.value })}
                            >
                                <option value="A4">A4</option>
                                <option value="A5">A5</option>
                                <option value="Letter">Letter</option>
                            </select>
                        </label>
                        <label className="space-y-1">
                            <span className="text-[10px] font-semibold text-[var(--text-muted)]">Orientation</span>
                            <select
                                className="h-8 w-full rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-2 text-xs text-[var(--text)] outline-none focus:border-[var(--accent)]"
                                value={draft.orientation}
                                onChange={(e) => onUpdate({ orientation: e.target.value })}
                            >
                                <option value="portrait">Portrait</option>
                                <option value="landscape">Landscape</option>
                            </select>
                        </label>
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
                <span className="ml-auto truncate text-[10px] text-[var(--text-muted)]">{activeSection.replace('Html', '.html').replace('css', '.css')}</span>
            </div>

            {/* Single CodeMirror fills remaining height */}
            <div className="flex-1 min-h-0 overflow-hidden">
                <TemplateCodeEditor
                    ref={editorRef}
                    value={currentValue}
                    onChange={handleChange}
                    language={currentLang}
                    minHeight="0"
                />
            </div>

            {/* Variables bar */}
            <TemplatePlaceholderPanel placeholders={placeholders} onInsert={handleInsert} />
        </div>
    );
}

export default TemplateEditorForm;
