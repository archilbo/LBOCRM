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
        <AppCard className="sticky top-4 max-h-[calc(100vh-120px)] overflow-auto p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold">Templates</h2>
                <span className="text-xs text-[var(--text-muted)]">{templates.length}</span>
            </div>
            <div className="space-y-1.5">
                {templates.map((template) => (
                    <div key={template.id} className={`rounded-xl border p-2 transition ${selectedId === template.id ? 'border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_8%,transparent)]' : 'bg-[var(--surface)] hover:bg-[var(--surface-2)]'}`}>
                        <button type="button" onClick={() => onSelect(template)} className="w-full text-left">
                            <div className="flex items-center justify-between gap-2">
                                <p className="truncate text-sm font-semibold leading-5">{template.name}</p>
                                {template.isDefault ? <AppBadge tone="green" className="text-[10px]">Defaut</AppBadge> : null}
                            </div>
                            <p className="truncate font-mono text-[11px] text-[var(--text-muted)]">{template.slug}</p>
                        </button>
                        <div className="mt-2 flex gap-1">
                            <AppButton size="sm" variant="ghost" onPress={() => onDuplicate(template)}><Copy size={13} /></AppButton>
                            <AppButton size="sm" variant="ghost" onPress={() => onSetDefault(template)} isDisabled={template.isDefault}><Star size={13} /></AppButton>
                            <AppButton size="sm" variant="ghost" onPress={() => onDelete(template)}><Trash2 size={13} /></AppButton>
                        </div>
                    </div>
                ))}
                {templates.length === 0 ? <p className="p-2 text-sm text-[var(--text-muted)]">Aucun template.</p> : null}
            </div>
        </AppCard>
    );
}
