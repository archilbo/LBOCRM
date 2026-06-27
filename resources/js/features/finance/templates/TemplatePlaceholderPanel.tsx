import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { AppCard } from '@/components/ui/AppCard';
import { AppTextField } from '@/components/ui/AppTextField';
import type { TemplatePlaceholder } from '@/features/finance/types';

export function TemplatePlaceholderPanel({ placeholders }: { placeholders: TemplatePlaceholder[] }) {
    const [search, setSearch] = useState('');
    const filtered = useMemo(() => placeholders.map((group) => ({ ...group, items: group.items.filter((item) => item.toLowerCase().includes(search.toLowerCase())) })).filter((group) => group.items.length), [placeholders, search]);

    async function copy(value: string) {
        await navigator.clipboard?.writeText(value);
        toast.success('Copied');
    }

    return (
        <AppCard className="p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold">Placeholders</h2>
                <span className="text-xs text-[var(--text-muted)]">Click copy</span>
            </div>
            <AppTextField label="Search" value={search} onChange={setSearch} icon={<Search size={15} />} placeholder="company, total..." />
            <div className="mt-3 max-h-72 space-y-3 overflow-auto pr-1">
                {filtered.map((group) => (
                    <div key={group.group}>
                        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">{group.group}</p>
                        <div className="flex flex-wrap gap-1">
                            {group.items.map((item) => <button key={item} type="button" onClick={() => copy(item)} className="rounded-lg border bg-[var(--surface-2)] px-2 py-1 font-mono text-[11px] hover:border-[var(--accent)] hover:text-[var(--accent)]">{item}</button>)}
                        </div>
                    </div>
                ))}
            </div>
        </AppCard>
    );
}
