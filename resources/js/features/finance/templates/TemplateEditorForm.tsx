import { RotateCcw, Save } from 'lucide-react';
import { useMemo } from 'react';
import { AppBadge } from '@/components/ui/AppBadge';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppTextField } from '@/components/ui/AppTextField';
import { AppTextarea } from '@/components/ui/AppTextarea';
import type { DocumentTemplate, TemplatePlaceholder } from '@/features/finance/types';
import { validateTemplateContent } from '@/features/finance/templates/templateValidation';

type Props = {
    value: DocumentTemplate;
    placeholders: TemplatePlaceholder[];
    onChange: (template: DocumentTemplate) => void;
    onSave: () => void;
    onReset: () => void;
};

export function TemplateEditorForm({ value, placeholders, onChange, onSave, onReset }: Props) {
    const validation = useMemo(() => validateTemplateContent(value.type, value.bodyHtml, placeholders), [value.type, value.bodyHtml, placeholders]);
    const update = <K extends keyof DocumentTemplate>(key: K, next: DocumentTemplate[K]) => onChange({ ...value, [key]: next });

    return (
        <AppCard className="space-y-4 p-4">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h2 className="text-sm font-semibold">Edition template</h2>
                    <p className="text-xs text-[var(--text-muted)]">HTML/CSS structure, sans editeur lourd.</p>
                </div>
                {value.isDefault ? <AppBadge tone="green">Defaut</AppBadge> : null}
            </div>

            <div className="grid gap-3 md:grid-cols-2">
                <AppTextField label="Nom" value={value.name} onChange={(name) => update('name', name)} />
                <AppTextField label="Slug" value={value.slug} onChange={(slug) => update('slug', slug)} />
                <AppSelect label="Format" selectedKey={value.paperSize} onSelectionChange={(key) => update('paperSize', String(key || 'A4'))} options={[{ id: 'A4', label: 'A4' }, { id: 'A5', label: 'A5' }, { id: 'Letter', label: 'Letter' }]} />
                <AppSelect label="Orientation" selectedKey={value.orientation} onSelectionChange={(key) => update('orientation', String(key || 'portrait'))} options={[{ id: 'portrait', label: 'Portrait' }, { id: 'landscape', label: 'Landscape' }]} />
                <AppTextField label="Logo path" value={value.logoPath || ''} onChange={(logoPath) => update('logoPath', logoPath)} />
                <AppTextField label="Accent color" value={String(value.settings?.accent_color || '')} onChange={(accent) => update('settings', { ...value.settings, accent_color: accent })} />
            </div>

            <AppTextarea label="Header HTML" rows={5} value={value.headerHtml} onChange={(headerHtml) => update('headerHtml', headerHtml)} className="font-mono" />
            <AppTextarea label="Body HTML" rows={12} value={value.bodyHtml} onChange={(bodyHtml) => update('bodyHtml', bodyHtml)} className="font-mono" />
            <AppTextarea label="Footer HTML" rows={5} value={value.footerHtml} onChange={(footerHtml) => update('footerHtml', footerHtml)} className="font-mono" />
            <AppTextarea label="CSS" rows={10} value={value.css} onChange={(css) => update('css', css)} className="font-mono" />

            {(validation.errors.length || validation.warnings.length) ? (
                <div className="space-y-2 rounded-2xl border bg-[var(--surface-2)] p-3 text-xs">
                    {validation.errors.map((error) => <p key={error} className="text-[var(--danger)]">{error}</p>)}
                    {validation.warnings.map((warning) => <p key={warning} className="text-amber-600 dark:text-amber-300">{warning}</p>)}
                    {validation.unsupported.length ? <p className="text-[var(--text-muted)]">Unsupported: {validation.unsupported.join(', ')}</p> : null}
                </div>
            ) : null}

            <div className="flex flex-wrap justify-end gap-2">
                <AppButton variant="secondary" onPress={onReset}><RotateCcw size={16} /> Reset</AppButton>
                <AppButton variant="primary" onPress={onSave} isDisabled={validation.errors.length > 0}><Save size={16} /> Enregistrer</AppButton>
            </div>
        </AppCard>
    );
}
