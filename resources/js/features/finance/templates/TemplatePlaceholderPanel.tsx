import { IconSearch } from '@tabler/icons-react';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { AppCard } from '@/components/ui/AppCard';
import { AppTextField } from '@/components/ui/AppTextField';
import type { TemplatePlaceholder } from '@/features/finance/types';

export function TemplatePlaceholderPanel({ placeholders }: { placeholders: TemplatePlaceholder[] }) {
    const [search, setSearch] = useState('');
    const filtered = useMemo(() => placeholders.map((group) => ({ ...group, items: group.items.filter((item) => item.toLowerCase().includes(search.toLowerCase())) })).filter((group) => group.items.length), [placeholders, search]);
    const total = placeholders.reduce((sum, group) => sum + group.items.length, 0);

    async function copy(value: string) {
        await navigator.clipboard?.writeText(value);
        toast.success('Copied');
    }

    return (
        <AppCard className="p-2">
            <div className="mb-1.5 flex items-center justify-between gap-2">
                <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">Placeholders</h2>
                <span className="rounded-md bg-[var(--surface-2)] px-1.5 py-0.5 text-[9px] text-[var(--text-muted)]">{total}</span>
            </div>
            <AppTextField label="IconSearch" value={search} onChange={setSearch} icon={<IconSearch size={14} />} placeholder="company, total..." />
            <div className="mt-2 max-h-44 space-y-2 overflow-auto pr-1">
                {filtered.map((group) => (
                    <div key={group.group}>
                        <p className="mb-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">{group.group}</p>
                        <div className="flex flex-wrap gap-1">
                            {group.items.map((item) => <button key={item} type="button" onClick={() => copy(item)} className="rounded-md border bg-[var(--surface-2)] px-1.5 py-0.5 font-mono text-[9px] hover:border-[var(--accent)] hover:text-[var(--accent)]">{item}</button>)}
                        </div>
                    </div>
                ))}
            </div>
        </AppCard>
    );
}
