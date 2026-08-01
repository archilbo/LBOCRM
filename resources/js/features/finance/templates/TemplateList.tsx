import { Copy, Star, Trash2 } from 'lucide-react';
import { AppBadge } from '@/components/ui/AppBadge';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import type { DocumentTemplate } from '@/features/finance/types';

type Props = {
    templates: DocumentTemplate[];
    selectedId?: number;
    onSelect: (template: DocumentTemplate) => void;
    onDuplicate: (template: DocumentTemplate) => void;
    onSetDefault: (template: DocumentTemplate) => void;
    onDelete: (template: DocumentTemplate) => void;
};

export function TemplateList({ templates, selectedId, onSelect, onDuplicate, onSetDefault, onDelete }: Props) {
    return (
        <AppCard className="sticky top-3 max-h-[calc(100vh-104px)] overflow-auto p-2">
            <div className="mb-1.5 flex items-center justify-between gap-2">
                <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">Templates</h2>
                <span className="rounded-md bg-[var(--surface-2)] px-1.5 py-0.5 text-[9px] text-[var(--text-muted)]">{templates.length}</span>
            </div>
            <div className="space-y-1">
                {templates.map((template) => (
                    <div key={template.id} className={`rounded-lg border p-1.5 transition ${selectedId === template.id ? 'border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_8%,transparent)]' : 'bg-[var(--surface)] hover:bg-[var(--surface-2)]'}`}>
                        <button type="button" onClick={() => onSelect(template)} className="w-full text-left">
                            <div className="flex items-center justify-between gap-1.5">
                                <p className="truncate text-xs font-semibold leading-5">{template.name}</p>
                                {template.isDefault ? <AppBadge tone="green" className="text-[9px]">Defaut</AppBadge> : null}
                            </div>
                            <p className="truncate font-mono text-[9px] text-[var(--text-muted)]">{template.slug}</p>
                        </button>
                        <div className="mt-1 flex gap-1">
                            <AppButton size="sm" variant="ghost" onPress={() => onDuplicate(template)}><Copy size={12} /></AppButton>
                            <AppButton size="sm" variant="ghost" onPress={() => onSetDefault(template)} isDisabled={template.isDefault}><Star size={12} /></AppButton>
                            <AppButton size="sm" variant="ghost" onPress={() => onDelete(template)}><Trash2 size={12} /></AppButton>
                        </div>
                    </div>
                ))}
                {templates.length === 0 ? <p className="p-2 text-sm text-[var(--text-muted)]">Aucun template.</p> : null}
            </div>
        </AppCard>
    );
}
