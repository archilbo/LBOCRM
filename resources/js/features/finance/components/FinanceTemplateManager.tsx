import { IconCode, IconFileText, IconPencil, IconReceipt2, IconSearch, IconSettings2, IconStar, IconWallet, IconX } from '@tabler/icons-react';

import { useMemo, useState } from 'react';
import { AppButton } from '@/components/ui/AppButton';
import { AppEmptyState } from '@/components/ui/AppEmptyState';
import { AppFilterTabs } from '@/components/ui/AppFilterTabs';
import type { FinanceDocumentType, TemplateOption } from '@/features/finance/types';

type Props = {
    templates: TemplateOption[];
    editorUrl: string;
    onOpenEditor: (url: string) => void;
    onRename: (template: TemplateOption) => void;
    canManage?: boolean;
};

const templateTypes: Array<{ id: 'all' | FinanceDocumentType; label: string }> = [
    { id: 'all', label: 'Tous' },
    { id: 'quote', label: 'Devis' },
    { id: 'invoice', label: 'Factures' },
    { id: 'receipt', label: 'Recus' },
];

function typeMeta(type: string) {
    if (type === 'quote') return { label: 'Devis', icon: IconFileText, tone: 'text-sky-300 bg-sky-400/10' };
    if (type === 'invoice') return { label: 'Facture', icon: IconReceipt2, tone: 'text-violet-300 bg-violet-400/10' };
    return { label: 'Recu', icon: IconWallet, tone: 'text-emerald-300 bg-emerald-400/10' };
}

export function FinanceTemplateManager({ templates, editorUrl, onOpenEditor, onRename, canManage = false }: Props) {
    const [query, setQuery] = useState('');
    const [type, setType] = useState<'all' | FinanceDocumentType>('all');
    const [showFilters, setShowFilters] = useState(false);

    const templateTypeOptions = useMemo(
        () => templateTypes.map((option) => ({
            ...option,
            count: option.id === 'all' ? templates.length : templates.filter((template) => template.type === option.id).length,
        })),
        [templates],
    );

    const filtered = useMemo(() => {
        const needle = query.trim().toLowerCase();
        return templates.filter((template) => {
            if (type !== 'all' && template.type !== type) return false;
            if (!needle) return true;
            return `${template.label} ${template.slug || ''}`.toLowerCase().includes(needle);
        });
    }, [query, templates, type]);

    return (
        <section className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)]">
            <header className="flex flex-col gap-3 border-b border-[var(--border)] px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <h2 className="text-sm font-semibold text-[var(--text)]">Templates finance</h2>
                        <span className="rounded-full bg-[var(--surface-2)] px-2 py-0.5 text-[9px] font-semibold text-[var(--text-muted)]">{templates.length}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-[var(--text-muted)]">Modeles disponibles pour les devis, factures et recus.</p>
                </div>
                {canManage ? (
                    <AppButton
                        isIconOnly
                        compact
                        size="sm"
                        variant="ghost"
                        tooltip="Ouvrir l’éditeur"
                        aria-label="Ouvrir l’éditeur"
                        className="size-8 min-h-8 min-w-8 bg-[var(--accent)] text-black hover:bg-[var(--accent-hover)]"
                        onPress={() => onOpenEditor(editorUrl)}
                    >
                        <IconCode size={15} />
                    </AppButton>
                ) : null}
            </header>

            <div className="flex flex-col gap-2 border-b border-[var(--border)] px-3 py-2.5 sm:flex-row sm:items-center">
                <div className="flex min-w-0 items-center gap-1.5">
                    <div className="relative min-w-0 flex-1 sm:w-[260px] sm:flex-none">
                        <IconSearch size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                        <input
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Rechercher un template..."
                            className="h-7 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] pl-7 pr-6 text-xs text-[var(--text)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--accent)_18%,transparent)]"
                        />
                        {query ? (
                            <button type="button" onClick={() => setQuery('')} className="absolute right-0.5 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center rounded text-[var(--text-muted)] hover:bg-[var(--surface-2)]" aria-label="Effacer la recherche">
                                <IconX size={11} />
                            </button>
                        ) : null}
                    </div>
                    <button
                        type="button"
                        className={`flex h-7 items-center gap-1 rounded-lg border px-2 text-[10px] font-medium transition ${
                            showFilters
                                ? 'border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] text-[var(--accent)]'
                                : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]'
                        }`}
                        onClick={() => setShowFilters((value) => !value)}
                        aria-expanded={showFilters}
                        aria-label="Afficher les filtres"
                    >
                        <IconSettings2 size={11} />
                        {type !== 'all' ? <span className="ml-0.5 size-1.5 rounded-full bg-[var(--accent)]" /> : null}
                    </button>
                </div>

                <div className="ml-auto hidden text-[10px] font-medium text-[var(--text-muted)] md:block">
                    {filtered.length} template{filtered.length !== 1 ? 's' : ''}
                </div>
            </div>

            {showFilters ? (
                <div className="border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--surface-2)_35%,transparent)] px-3 py-3">
                    <AppFilterTabs
                        label="Type de template"
                        value={type}
                        options={templateTypeOptions}
                        onChange={(value) => setType(value as 'all' | FinanceDocumentType)}
                    />
                </div>
            ) : null}

            {filtered.length ? (
                <div className="grid gap-3 p-4 md:grid-cols-2 2xl:grid-cols-3">
                    {filtered.map((template) => {
                        const meta = typeMeta(template.type);
                        const Icon = meta.icon;
                        return (
                            <article key={template.id} className="group rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 transition hover:border-[color-mix(in_srgb,var(--accent)_50%,var(--border))] hover:bg-[var(--surface-2)]">
                                <div className="flex items-start gap-3">
                                    <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${meta.tone}`}><Icon size={16} /></div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-1.5">
                                            <p className="truncate text-sm font-semibold text-[var(--text)]">{template.label}</p>
                                            {template.isDefault ? <IconStar size={12} className="shrink-0 fill-[var(--accent)] text-[var(--accent)]" /> : null}
                                        </div>
                                        <p className="mt-0.5 truncate font-mono text-[9px] text-[var(--text-muted)]">{template.slug || '-'}</p>
                                    </div>
                                    {canManage ? (
                                        <button type="button" onClick={() => onRename(template)} className="flex size-7 shrink-0 items-center justify-center rounded-md text-[var(--text-muted)] transition hover:bg-[var(--surface-3)] hover:text-[var(--accent)]" title="Renommer">
                                            <IconPencil size={13} />
                                        </button>
                                    ) : null}
                                </div>
                                <div className="mt-3 flex items-center justify-between gap-2 border-t border-[var(--border)] pt-2.5">
                                    <span className="text-[9px] text-[var(--text-muted)]">{template.updatedAt ? `Mis a jour ${template.updatedAt}` : meta.label}</span>
                                    {canManage ? (
                                        <AppButton size="sm" variant="ghost" onPress={() => onOpenEditor(template.editorUrl || editorUrl)}>
                                            Modifier
                                        </AppButton>
                                    ) : null}
                                </div>
                            </article>
                        );
                    })}
                </div>
            ) : (
                <div className="p-5"><AppEmptyState title="Aucun template trouve" description="Modifiez la recherche ou creez un template dans l editeur." /></div>
            )}
        </section>
    );
}
