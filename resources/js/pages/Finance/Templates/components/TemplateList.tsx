import { Input } from '@heroui/react';
import { Search, ChevronLeft, ChevronRight, Star, FileText, Pencil } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { DocumentTemplate } from '@/features/finance/types';

type TemplateListProps = {
    templates: DocumentTemplate[];
    selectedId: number | undefined;
    onSelect: (template: DocumentTemplate) => void;
    onRename: (template: DocumentTemplate) => void;
    collapsed: boolean;
    onToggleCollapse: () => void;
};

export function TemplateList({
    templates,
    selectedId,
    onSelect,
    onRename,
    collapsed,
    onToggleCollapse,
}: TemplateListProps) {
    const [search, setSearch] = useState('');

    const filtered = useMemo(() => {
        if (!search.trim()) return templates;
        const q = search.toLowerCase();
        return templates.filter(
            (t) => t.name.toLowerCase().includes(q) || t.slug.toLowerCase().includes(q),
        );
    }, [templates, search]);

    if (collapsed) {
        return (
            <div className="flex w-3 shrink-0 flex-col items-center border-r border-[var(--border)] bg-[var(--surface)] pt-2">
                <button
                    type="button"
                    onClick={onToggleCollapse}
                    className="flex size-5 items-center justify-center rounded text-[var(--text-muted)] hover:text-[var(--text)]"
                    title="Afficher la liste"
                >
                    <ChevronRight size={14} />
                </button>
            </div>
        );
    }

    return (
        <aside className="flex w-64 shrink-0 flex-col border-r border-[var(--border)] bg-[var(--surface)]">
            <div className="flex items-center gap-2 border-b border-[var(--border)] px-3 py-2">
                <Search size={14} className="shrink-0 text-[var(--text-muted)]" />
                <Input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Rechercher un template..."
                    className="h-7 flex-1 border-0 bg-transparent text-xs text-[var(--text)] outline-none placeholder:text-[var(--text-muted)]"
                />
                <button
                    type="button"
                    onClick={onToggleCollapse}
                    className="flex size-5 items-center justify-center rounded text-[var(--text-muted)] hover:text-[var(--text)]"
                    title="Reduire la liste"
                >
                    <ChevronLeft size={14} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0">
                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <FileText size={20} className="text-[var(--text-muted)]" />
                        <p className="mt-2 text-xs text-[var(--text-muted)]">
                            {search ? 'Aucun resultat' : 'Aucun template'}
                        </p>
                    </div>
                ) : (
                    filtered.map((template) => {
                        const active = template.id === selectedId;
                        const timeAgo = template.updatedAt
                            ? formatTimeAgo(template.updatedAt)
                            : '';

                        return (
                            <div
                                key={template.id}
                                className={`group flex w-full items-center border-l-2 transition ${
                                    active
                                        ? 'border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_10%,transparent)]'
                                        : 'border-transparent hover:bg-[var(--surface-2)]'
                                }`}
                            >
                                <button
                                    type="button"
                                    onClick={() => onSelect(template)}
                                    className="min-w-0 flex-1 px-3 py-2 text-left"
                                >
                                    <div className="flex items-center gap-1.5">
                                        <p className="truncate text-sm font-medium text-[var(--text)]">
                                            {template.name}
                                        </p>
                                        {template.isDefault ? (
                                            <Star size={12} className="shrink-0 fill-[var(--accent)] text-[var(--accent)]" />
                                        ) : null}
                                    </div>
                                    <p className="truncate text-[10px] text-[var(--text-muted)]">
                                        {template.paperSize} / {template.orientation}
                                        {timeAgo ? ` / ${timeAgo}` : ''}
                                    </p>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onRename(template)}
                                    className="mr-2 flex size-7 shrink-0 items-center justify-center rounded-md text-[var(--text-muted)] opacity-0 transition hover:bg-[var(--surface-3)] hover:text-[var(--accent)] focus:opacity-100 group-hover:opacity-100"
                                    title="Renommer le template"
                                    aria-label={`Renommer ${template.name}`}
                                >
                                    <Pencil size={13} />
                                </button>
                            </div>
                        );
                    })
                )}
            </div>
        </aside>
    );
}

function formatTimeAgo(dateStr: string): string {
    const normalized = dateStr.includes('T') ? dateStr : dateStr.replace(' ', 'T');
    const date = new Date(normalized);
    if (isNaN(date.getTime())) return dateStr;
    const diff = Date.now() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'a l instant';
    if (mins < 60) return `il y a ${mins} min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `il y a ${hours} h`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `il y a ${days} j`;
    return `il y a ${Math.floor(days / 30)} mois`;
}

export default TemplateList;
