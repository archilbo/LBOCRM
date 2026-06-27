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
        <AppCard className="p-4">
            <h2 className="mb-3 text-sm font-semibold">Templates</h2>
            <div className="space-y-2">
                {templates.map((template) => (
                    <div key={template.id} className={`rounded-2xl border p-3 transition ${selectedId === template.id ? 'border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_8%,transparent)]' : 'bg-[var(--surface)]'}`}>
                        <button type="button" onClick={() => onSelect(template)} className="w-full text-left">
                            <div className="flex items-center justify-between gap-2">
                                <p className="truncate text-sm font-semibold">{template.name}</p>
                                {template.isDefault ? <AppBadge tone="green">Defaut</AppBadge> : null}
                            </div>
                            <p className="mt-1 truncate text-xs text-[var(--text-muted)]">{template.slug}</p>
                        </button>
                        <div className="mt-3 flex flex-wrap gap-2">
                            <AppButton size="sm" variant="ghost" onPress={() => onDuplicate(template)}><Copy size={14} /> Copier</AppButton>
                            <AppButton size="sm" variant="ghost" onPress={() => onSetDefault(template)} isDisabled={template.isDefault}><Star size={14} /> Defaut</AppButton>
                            <AppButton size="sm" variant="ghost" onPress={() => onDelete(template)}><Trash2 size={14} /> Supprimer</AppButton>
                        </div>
                    </div>
                ))}
                {templates.length === 0 ? <p className="text-sm text-[var(--text-muted)]">Aucun template.</p> : null}
            </div>
        </AppCard>
    );
}
