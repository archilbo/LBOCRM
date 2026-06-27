import { Braces, Code2 } from 'lucide-react';
import { KeyboardEvent, useMemo } from 'react';
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
    { label: 'A4 Base', value: 'body{font-family:DejaVu Sans,Arial,sans-serif;font-size:12px;color:#172033}.document-shell{padding:28px}' },
    { label: 'Table', value: '.items-table{width:100%;border-collapse:collapse}.items-table th{background:#1a365d;color:#fff}.items-table td,.items-table th{border:1px solid #d7dde8;padding:8px}' },
    { label: 'Right', value: '.text-right{text-align:right}' },
    { label: 'Footer', value: '.legal-footer{margin-top:24px;padding-top:10px;border-top:1px solid #d7dde8;text-align:center;color:#64748b}' },
];

export function TemplateCodeEditor({ label, language, value, onChange, onSave, placeholders, minRows = 18 }: TemplateCodeEditorProps) {
    const lines = useMemo(() => Math.max(minRows, value.split('\n').length), [minRows, value]);
    const lineNumbers = useMemo(() => Array.from({ length: lines }, (_, index) => index + 1), [lines]);
    const snippets = language === 'html' ? htmlSnippets : cssSnippets;
    const commonPlaceholders = placeholders.flatMap((group) => group.items).slice(0, 12);

    function insertText(text: string) {
        onChange(value ? `${value}\n${text}` : text);
    }

    function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
            event.preventDefault();
            onSave();
            return;
        }

        if (event.key === 'Tab') {
            event.preventDefault();
            const target = event.currentTarget;
            const start = target.selectionStart;
            const end = target.selectionEnd;
            const next = `${value.slice(0, start)}  ${value.slice(end)}`;
            onChange(next);
            window.requestAnimationFrame(() => {
                target.selectionStart = start + 2;
                target.selectionEnd = start + 2;
            });
        }
    }

    return (
        <div className="overflow-hidden rounded-2xl border bg-[#0b1020] text-slate-100 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-[#111827] px-3 py-2">
                <div className="flex items-center gap-2">
                    <Code2 size={15} className="text-sky-300" />
                    <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-300">{label}</span>
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] uppercase text-slate-400">{language}</span>
                </div>
                <p className="text-[11px] text-slate-400">Tab = indent · Ctrl+S = save</p>
            </div>

            <div className="border-b border-white/10 bg-[#0f172a] px-3 py-2">
                <div className="mb-2 flex items-center gap-1 text-[11px] font-medium uppercase tracking-[0.12em] text-slate-400">
                    <Braces size={13} /> Snippets
                </div>
                <div className="flex flex-wrap gap-1.5">
                    {snippets.map((snippet) => (
                        <button key={snippet.label} type="button" onClick={() => insertText(snippet.value)} className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-slate-200 hover:bg-white/10">
                            {snippet.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid max-h-[620px] grid-cols-[48px_minmax(0,1fr)] overflow-auto">
                <pre aria-hidden className="select-none bg-[#080d1a] px-3 py-3 text-right font-mono text-xs leading-5 text-slate-600">
                    {lineNumbers.map((number) => <span key={number} className="block">{number}</span>)}
                </pre>
                <textarea
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    onKeyDown={handleKeyDown}
                    spellCheck={false}
                    rows={lines}
                    className="min-h-[360px] w-full resize-y border-0 bg-[#0b1020] px-3 py-3 font-mono text-xs leading-5 text-slate-100 outline-none placeholder:text-slate-600"
                    placeholder={language === 'html' ? '<section>...</section>' : '.document-shell { ... }'}
                />
            </div>

            <div className="border-t border-white/10 bg-[#0f172a] px-3 py-2">
                <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.12em] text-slate-400">Quick placeholders</p>
                <div className="flex max-h-20 flex-wrap gap-1.5 overflow-auto">
                    {commonPlaceholders.map((placeholder) => (
                        <button key={placeholder} type="button" onClick={() => insertText(placeholder)} className="rounded-lg bg-sky-500/10 px-2 py-1 font-mono text-[11px] text-sky-200 hover:bg-sky-500/20">
                            {placeholder}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
