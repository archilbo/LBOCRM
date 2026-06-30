import { Search, X } from 'lucide-react';

const FILTERS = [
    { id: 'all', label: 'All' },
    { id: 'my', label: 'My tasks' },
    { id: 'assigned_by_me', label: 'Assigned by me' },
    { id: 'overdue', label: 'Overdue' },
    { id: 'due_today', label: 'Due today' },
    { id: 'due_week', label: 'Due this week' },
    { id: 'completed', label: 'Completed' },
];

const CATEGORIES = [
    { id: 'all', label: 'All projects' },
    { id: 'documents', label: 'Documents' },
    { id: 'client_follow_up', label: 'Client' },
    { id: 'contract', label: 'Contracts' },
    { id: 'authorization', label: 'Authorizations' },
    { id: 'finance', label: 'Finance' },
    { id: 'archive', label: 'Archive' },
    { id: 'general_admin', label: 'General' },
];

type Props = {
    filter: string;
    category: string;
    query: string;
    viewMode: 'board' | 'list' | 'calendar';
    onFilterChange: (f: string) => void;
    onCategoryChange: (c: string) => void;
    onQueryChange: (q: string) => void;
    onViewModeChange: (v: 'board' | 'list' | 'calendar') => void;
};

export function TaskFilters({ filter, category, query, viewMode, onFilterChange, onCategoryChange, onQueryChange, onViewModeChange }: Props) {
    return (
        <section className="crm-panel p-3">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex flex-wrap gap-1.5">
                    {FILTERS.map((f) => (
                        <button key={f.id} type="button" onClick={() => onFilterChange(f.id)}
                            className={`inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition ${filter === f.id ? 'border-[var(--crm-gold)] bg-[var(--crm-gold-soft)] text-[var(--crm-gold)]' : 'border-[var(--crm-border)] text-[var(--crm-text-muted)] hover:text-[var(--crm-text)]'}`}>
                            {f.label}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--crm-muted)]" />
                        <input value={query} onChange={(e) => onQueryChange(e.target.value)} placeholder="Search tasks..." className="crm-command-input h-8 w-[200px] pl-8 text-xs" />
                        {query ? <button type="button" onClick={() => onQueryChange('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--crm-muted)]"><X size={12} /></button> : null}
                    </div>
                    <div className="flex rounded-lg border border-[var(--crm-border)] p-0.5">
                        <button type="button" onClick={() => onViewModeChange('board')} className={`h-7 rounded-md px-2 text-xs font-semibold ${viewMode === 'board' ? 'bg-[var(--crm-gold)] text-black' : 'text-[var(--crm-text-muted)]'}`}>Board</button>
                        <button type="button" onClick={() => onViewModeChange('list')} className={`h-7 rounded-md px-2 text-xs font-semibold ${viewMode === 'list' ? 'bg-[var(--crm-gold)] text-black' : 'text-[var(--crm-text-muted)]'}`}>List</button>
                        <button type="button" onClick={() => onViewModeChange('calendar')} className={`h-7 rounded-md px-2 text-xs font-semibold ${viewMode === 'calendar' ? 'bg-[var(--crm-gold)] text-black' : 'text-[var(--crm-text-muted)]'}`}>Calendar</button>
                    </div>
                </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
                {CATEGORIES.map((c) => (
                    <button key={c.id} type="button" onClick={() => onCategoryChange(c.id)}
                        className={`inline-flex h-7 items-center rounded-lg border px-2.5 text-[11px] font-semibold transition ${category === c.id ? 'border-[var(--crm-gold)] bg-[var(--crm-gold-soft)] text-[var(--crm-gold)]' : 'border-[var(--crm-border)] text-[var(--crm-text-muted)] hover:text-[var(--crm-text)]'}`}>
                        {c.label}
                    </button>
                ))}
            </div>
        </section>
    );
}
