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
        <AppCard className="p-4">
            <h2 className="mb-3 text-sm font-semibold">Placeholders</h2>
            <AppTextField label="Recherche" value={search} onChange={setSearch} icon={<Search size={15} />} placeholder="company, total..." />
            <div className="mt-4 space-y-4">
                {filtered.map((group) => (
                    <div key={group.group}>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">{group.group}</p>
                        <div className="flex flex-wrap gap-2">
                            {group.items.map((item) => <button key={item} type="button" onClick={() => copy(item)} className="rounded-full border bg-[var(--surface-2)] px-2.5 py-1 font-mono text-xs">{item}</button>)}
                        </div>
                    </div>
                ))}
            </div>
        </AppCard>
    );
}
