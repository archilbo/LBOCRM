import { autocompletion, CompletionContext } from '@codemirror/autocomplete';
import { defaultKeymap, indentWithTab } from '@codemirror/commands';
import { css } from '@codemirror/lang-css';
import { html } from '@codemirror/lang-html';
import { EditorView, keymap } from '@codemirror/view';
import CodeMirror from '@uiw/react-codemirror';
import { Braces, Code2 } from 'lucide-react';
import { useMemo } from 'react';
import { oneDark } from '@codemirror/theme-one-dark';
import type { TemplatePlaceholder } from '@/features/finance/types';

type TemplateCodeEditorProps = {
    label: string;
    language: 'html' | 'css';
    value: string;
    onChange: (value: string) => void;
    onSave: () => void;
    placeholders: TemplatePlaceholder[];
    minRows?: number;
};

const htmlSnippets = [
    { label: 'Section', value: '<section class="block">\n  <h2>Titre</h2>\n  <p>Contenu</p>\n</section>' },
    { label: 'Client', value: '<div class="info-card">\n  <p class="eyebrow">Client</p>\n  <h3>{{client.name}}</h3>\n  <p>{{client.address}}</p>\n</div>' },
    { label: 'Items', value: '{{items_table}}' },
    { label: 'Totals', value: '<table class="totals-table">\n  <tr><td>Total HT</td><td>{{totals.subtotal_ht}}</td></tr>\n  <tr class="grand-total"><td>Total TTC</td><td>{{totals.total_ttc}}</td></tr>\n</table>' },
];

const cssSnippets = [
    { label: 'A4', value: 'body{font-family:DejaVu Sans,Arial,sans-serif;font-size:12px;color:#172033}.document-shell{padding:28px}' },
    { label: 'Table', value: '.items-table{width:100%;border-collapse:collapse}.items-table th{background:#1a365d;color:#fff}.items-table td,.items-table th{border:1px solid #d7dde8;padding:8px}' },
    { label: 'Right', value: '.text-right{text-align:right}' },
    { label: 'Footer', value: '.legal-footer{margin-top:24px;padding-top:10px;border-top:1px solid #d7dde8;text-align:center;color:#64748b}' },
];

function placeholderCompletion(placeholders: string[]) {
    return (context: CompletionContext) => {
        const word = context.matchBefore(/\{\{?[\w.]*$/);

        if (!word && !context.explicit) {
            return null;
        }

        return {
            from: word?.from ?? context.pos,
            options: placeholders.map((placeholder) => ({
                label: placeholder,
                type: 'variable',
                apply: placeholder,
                detail: 'ARCHI LBO',
            })),
        };
    };
}

export function TemplateCodeEditor({ label, language, value, onChange, onSave, placeholders, minRows = 14 }: TemplateCodeEditorProps) {
    const snippets = language === 'html' ? htmlSnippets : cssSnippets;
    const allPlaceholders = useMemo(() => placeholders.flatMap((group) => group.items), [placeholders]);
    const commonPlaceholders = allPlaceholders.slice(0, 8);
    const minHeight = `${Math.max(280, minRows * 18)}px`;
    const extensions = useMemo(() => [
        language === 'html' ? html() : css(),
        EditorView.lineWrapping,
        autocompletion({ override: [placeholderCompletion(allPlaceholders)] }),
        keymap.of([
            { key: 'Mod-s', run: () => { onSave(); return true; } },
            indentWithTab,
            ...defaultKeymap,
        ]),
        EditorView.theme({
            '&': { minHeight, fontSize: '12px' },
            '.cm-content': { minHeight, paddingTop: '8px', paddingBottom: '8px', fontFamily: 'var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)' },
            '.cm-gutters': { minHeight },
            '.cm-line': { paddingLeft: '8px', paddingRight: '8px' },
            '.cm-scroller': { minHeight, maxHeight: '520px' },
            '.cm-tooltip': { zIndex: 80 },
        }),
    ], [allPlaceholders, language, minHeight, onSave]);

    function insertText(text: string) {
        onChange(value ? `${value}\n${text}` : text);
    }

    return (
        <div className="overflow-hidden rounded-xl border bg-[#0b1020] text-slate-100 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-[#101827] px-2.5 py-1.5">
                <div className="flex min-w-0 items-center gap-2">
                    <Code2 size={14} className="shrink-0 text-sky-300" />
                    <span className="truncate text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-300">{label}</span>
                    <span className="rounded-md bg-white/10 px-1.5 py-0.5 text-[9px] uppercase text-slate-400">CodeMirror / {language}</span>
                </div>
                <p className="text-[9px] text-slate-500">Tab / Ctrl+S / autocomplete</p>
            </div>

            <div className="flex flex-wrap items-center gap-1 border-b border-white/10 bg-[#0f172a] px-2.5 py-1.5">
                <span className="mr-1 inline-flex items-center gap-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-500"><Braces size={12} /> Insert</span>
                {snippets.map((snippet) => (
                    <button key={snippet.label} type="button" onClick={() => insertText(snippet.value)} className="rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[9px] text-slate-200 hover:bg-white/10">
                        {snippet.label}
                    </button>
                ))}
                <span className="mx-1 h-4 w-px bg-white/10" />
                {commonPlaceholders.map((placeholder) => (
                    <button key={placeholder} type="button" onClick={() => insertText(placeholder)} className="rounded-md bg-sky-500/10 px-1.5 py-0.5 font-mono text-[9px] text-sky-200 hover:bg-sky-500/20">
                        {placeholder}
                    </button>
                ))}
            </div>

            <CodeMirror
                value={value}
                height={minHeight}
                theme={oneDark}
                basicSetup={{ lineNumbers: true, foldGutter: true, highlightActiveLine: true, autocompletion: true, bracketMatching: true }}
                extensions={extensions}
                onChange={onChange}
            />
        </div>
    );
}
