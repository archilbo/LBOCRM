import { Search, Variable } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';

type TemplatePlaceholderPanelProps = {
    placeholders: Array<{ group: string; items: string[] }>;
    onInsert: (text: string) => void;
};

export function TemplatePlaceholderPanel({ placeholders, onInsert }: TemplatePlaceholderPanelProps) {
    const [query, setQuery] = useState('');
    const [open, setOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const filtered = useMemo(() => {
        if (!query.trim()) return placeholders;
        const q = query.toLowerCase();
        return placeholders
            .map((g) => ({
                ...g,
                items: g.items.filter((item) => item.toLowerCase().includes(q)),
            }))
            .filter((g) => g.items.length > 0);
    }, [placeholders, query]);

    function handleSelect(item: string) {
        onInsert(`{{${item}}}`);
        setQuery('');
        setOpen(false);
    }

    if (!placeholders.length) return null;

    return (
        <div className="relative h-10 shrink-0 border-t border-[var(--border)]">
            <div className="flex h-full items-center gap-2 px-3">
                <Variable size={14} className="shrink-0 text-[var(--text-muted)]" />
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
                    onFocus={() => setOpen(true)}
                    placeholder="Search and insert variable…"
                    className="h-7 flex-1 rounded-md border-0 bg-transparent px-2 text-xs text-[var(--text)] outline-none placeholder:text-[var(--text-muted)]"
                />
            </div>

            {open ? (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
                    <div className="absolute bottom-full left-2 right-2 z-20 mb-1 max-h-[280px] overflow-y-auto rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2 shadow-xl">
                        {filtered.length === 0 ? (
                            <p className="py-4 text-center text-xs text-[var(--text-muted)]">No variables match</p>
                        ) : (
                            filtered.map((group) => (
                                <div key={group.group}>
                                    <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                                        {group.group}
                                    </p>
                                    {group.items.map((item) => (
                                        <button
                                            key={item}
                                            type="button"
                                            onClick={() => handleSelect(item)}
                                            className="flex w-full items-center rounded-md px-2 py-1.5 text-left text-xs text-[var(--text)] transition hover:bg-[var(--surface-2)]"
                                        >
                                            <code className="text-[11px]">{`{{${item}}}`}</code>
                                        </button>
                                    ))}
                                </div>
                            ))
                        )}
                    </div>
                </>
            ) : null}
        </div>
    );
}

export default TemplatePlaceholderPanel;
