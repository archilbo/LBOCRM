import { FileCode2, RotateCcw, Save } from 'lucide-react';
import { useMemo, useState } from 'react';
import { AppBadge } from '@/components/ui/AppBadge';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppTextField } from '@/components/ui/AppTextField';
import type { DocumentTemplate, TemplatePlaceholder } from '@/features/finance/types';
import { TemplateCodeEditor } from '@/features/finance/templates/TemplateCodeEditor';
import { validateTemplateContent } from '@/features/finance/templates/templateValidation';

type Props = {
    value: DocumentTemplate;
    placeholders: TemplatePlaceholder[];
    onChange: (template: DocumentTemplate) => void;
    onSave: () => void;
    onReset: () => void;
};

type EditorTab = 'body' | 'header' | 'footer' | 'css';

const editorTabs: Array<{ id: EditorTab; label: string; language: 'html' | 'css' }> = [
    { id: 'body', label: 'Body', language: 'html' },
    { id: 'header', label: 'Header', language: 'html' },
    { id: 'footer', label: 'Footer', language: 'html' },
    { id: 'css', label: 'CSS', language: 'css' },
];

export function TemplateEditorForm({ value, placeholders, onChange, onSave, onReset }: Props) {
    const [activeEditor, setActiveEditor] = useState<EditorTab>('body');
    const validation = useMemo(() => validateTemplateContent(value.type, value.bodyHtml, placeholders), [value.type, value.bodyHtml, placeholders]);
    const update = <K extends keyof DocumentTemplate>(key: K, next: DocumentTemplate[K]) => onChange({ ...value, [key]: next });
    const activeTab = editorTabs.find((tab) => tab.id === activeEditor) || editorTabs[0];
    const activeValue = activeEditor === 'body' ? value.bodyHtml : activeEditor === 'header' ? value.headerHtml : activeEditor === 'footer' ? value.footerHtml : value.css;

    function updateActive(next: string) {
        if (activeEditor === 'body') update('bodyHtml', next);
        if (activeEditor === 'header') update('headerHtml', next);
        if (activeEditor === 'footer') update('footerHtml', next);
        if (activeEditor === 'css') update('css', next);
    }

    return (
        <AppCard className="overflow-hidden p-0">
            <div className="border-b bg-[var(--surface-2)] px-3 py-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                        <FileCode2 size={15} className="shrink-0 text-[var(--accent)]" />
                        <div className="min-w-0">
                            <div className="flex min-w-0 items-center gap-2">
                                <h2 className="truncate text-sm font-semibold leading-5">{value.name}</h2>
                                {value.isDefault ? <AppBadge tone="green" className="shrink-0 text-[10px]">Defaut</AppBadge> : null}
                            </div>
                            <p className="truncate font-mono text-[10px] text-[var(--text-muted)]">{value.slug} / {value.typeLabel}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <AppButton size="sm" variant="secondary" onPress={onReset}><RotateCcw size={13} /> Reset</AppButton>
                        <AppButton size="sm" variant="primary" onPress={onSave} isDisabled={validation.errors.length > 0}><Save size={13} /> Save</AppButton>
                    </div>
                </div>
            </div>

            <div className="space-y-2 p-3">
                <div className="grid gap-2 md:grid-cols-3 xl:grid-cols-6">
                    <AppTextField label="Nom" value={value.name} onChange={(name) => update('name', name)} />
                    <AppTextField label="Slug" value={value.slug} onChange={(slug) => update('slug', slug)} />
                    <AppSelect label="Format" selectedKey={value.paperSize} onSelectionChange={(key) => update('paperSize', String(key || 'A4'))} options={[{ id: 'A4', label: 'A4' }, { id: 'A5', label: 'A5' }, { id: 'Letter', label: 'Letter' }]} />
                    <AppSelect label="Orientation" selectedKey={value.orientation} onSelectionChange={(key) => update('orientation', String(key || 'portrait'))} options={[{ id: 'portrait', label: 'Portrait' }, { id: 'landscape', label: 'Landscape' }]} />
                    <AppTextField label="Logo" value={value.logoPath || ''} onChange={(logoPath) => update('logoPath', logoPath)} />
                    <AppTextField label="Accent" value={String(value.settings?.accent_color || '')} onChange={(accent) => update('settings', { ...value.settings, accent_color: accent })} />
                </div>

                <div className="flex items-center justify-between gap-2 rounded-xl border bg-[var(--surface-2)] p-1">
                    <div className="flex flex-wrap gap-1">
                        {editorTabs.map((tab) => (
                            <button key={tab.id} type="button" onClick={() => setActiveEditor(tab.id)} className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${activeEditor === tab.id ? 'bg-[var(--accent)] text-[var(--accent-foreground)] shadow-sm' : 'text-[var(--text-muted)] hover:bg-[var(--surface)] hover:text-[var(--text)]'}`}>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                    <span className="hidden pr-2 text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)] sm:inline">{activeTab.language}</span>
                </div>

                <TemplateCodeEditor label={activeTab.label} language={activeTab.language} value={activeValue} onChange={updateActive} onSave={onSave} placeholders={placeholders} minRows={activeEditor === 'body' ? 18 : 10} />

                {(validation.errors.length || validation.warnings.length) ? (
                    <div className="grid gap-1.5 rounded-xl border bg-[var(--surface-2)] p-2 text-xs md:grid-cols-2">
                        {validation.errors.map((error) => <p key={error} className="font-medium text-[var(--danger)]">{error}</p>)}
                        {validation.warnings.map((warning) => <p key={warning} className="text-amber-600 dark:text-amber-300">{warning}</p>)}
                        {validation.unsupported.length ? <p className="text-[var(--text-muted)] md:col-span-2">Unsupported: {validation.unsupported.join(', ')}</p> : null}
                    </div>
                ) : null}
            </div>
        </AppCard>
    );
}
