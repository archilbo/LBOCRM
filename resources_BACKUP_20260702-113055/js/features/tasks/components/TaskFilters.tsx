import { CalendarDays, ChevronDown, Columns3, LayoutDashboard, List, Search, Table2, Timeline, X } from 'lucide-react';
import { useRef, useState } from 'react';
import type { ViewMode } from '@/features/tasks/types';

const FILTERS = [
    { id: 'all', label: 'All' },
    { id: 'my', label: 'My tasks' },
    { id: 'assigned_by_me', label: 'Assigned by me' },
    { id: 'watching', label: 'Watching' },
    { id: 'overdue', label: 'Overdue' },
    { id: 'due_today', label: 'Due today' },
    { id: 'due_week', label: 'Due this week' },
    { id: 'blocked', label: 'Blocked' },
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

const PRIORITY_OPTIONS = [
    { id: 'all', label: 'All priorities' },
    { id: 'urgent', label: 'Urgent' },
    { id: 'high', label: 'High' },
    { id: 'medium', label: 'Medium' },
    { id: 'low', label: 'Low' },
];

const VIEW_TABS: { id: ViewMode; label: string; icon: typeof LayoutDashboard }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'board', label: 'Board', icon: Columns3 },
    { id: 'list', label: 'List', icon: List },
    { id: 'table', label: 'Table', icon: Table2 },
    { id: 'timeline', label: 'Timeline', icon: Timeline },
    { id: 'calendar', label: 'Calendar', icon: CalendarDays },
];

type Props = {
    filter: string;
    category: string;
    priorityFilter: string;
    query: string;
    viewMode: ViewMode;
    onFilterChange: (f: string) => void;
    onCategoryChange: (c: string) => void;
    onPriorityFilterChange: (p: string) => void;
    onQueryChange: (q: string) => void;
    onViewModeChange: (v: ViewMode) => void;
};

export function TaskFilters({ filter, category, priorityFilter, query, viewMode, onFilterChange, onCategoryChange, onPriorityFilterChange, onQueryChange, onViewModeChange }: Props) {
    const [scopeOpen, setScopeOpen] = useState(false);
    const [moduleOpen, setModuleOpen] = useState(false);
    const [priorityOpen, setPriorityOpen] = useState(false);
    const scopeRef = useRef<HTMLDivElement>(null);
    const moduleRef = useRef<HTMLDivElement>(null);
    const priorityRef = useRef<HTMLDivElement>(null);

    const activeFilter = FILTERS.find((item) => item.id === filter) ?? FILTERS[0];
    const activeCategory = CATEGORIES.find((item) => item.id === category) ?? CATEGORIES[0];
    const activePriority = PRIORITY_OPTIONS.find((item) => item.id === priorityFilter) ?? PRIORITY_OPTIONS[0];

    const hasActive = filter !== 'all' || category !== 'all' || priorityFilter !== 'all' || !!query;

    const dropClass = (active: boolean) =>
        `flex w-full items-center justify-between rounded-lg border px-2.5 py-2 text-xs font-semibold transition ${active ? 'border-[var(--crm-gold)] bg-[var(--crm-gold)] text-black' : 'border-transparent text-[var(--crm-text)] hover:bg-[var(--crm-surface)]'}`;

    return (
        <section className="overflow-visible rounded-xl border border-[var(--crm-border)] bg-[var(--crm-elevated)]">
            <div className="flex flex-wrap items-center gap-2 p-2.5">
                <div className="relative min-w-[200px] flex-1">
                    <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--crm-muted)]" />
                    <input value={query} onChange={(e) => onQueryChange(e.target.value)} placeholder="Search tasks, clients, projects..."
                        className="h-9 w-full rounded-lg border border-[var(--crm-border)] bg-[var(--crm-surface)] pl-8 pr-8 text-xs text-[var(--crm-text)] outline-none placeholder:text-[var(--crm-muted)] focus:border-[var(--crm-gold)]" />
                    {query ? <button type="button" onClick={() => onQueryChange('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--crm-muted)] hover:text-[var(--crm-gold)]"><X size={14} /></button> : null}
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                    <DropdownSelect ref={scopeRef} isOpen={scopeOpen} onToggle={() => { setScopeOpen(!scopeOpen); setModuleOpen(false); setPriorityOpen(false); }}
                        onClose={() => setScopeOpen(false)} label={activeFilter.label} width="140px">
                        {FILTERS.map((item) => (
                            <button key={item.id} type="button" onClick={() => { onFilterChange(item.id); setScopeOpen(false); }} className={dropClass(filter === item.id)}>{item.label}</button>
                        ))}
                    </DropdownSelect>

                    <DropdownSelect ref={moduleRef} isOpen={moduleOpen} onToggle={() => { setModuleOpen(!moduleOpen); setScopeOpen(false); setPriorityOpen(false); }}
                        onClose={() => setModuleOpen(false)} label={activeCategory.label} width="140px">
                        {CATEGORIES.map((item) => (
                            <button key={item.id} type="button" onClick={() => { onCategoryChange(item.id); setModuleOpen(false); }} className={dropClass(category === item.id)}>{item.label}</button>
                        ))}
                    </DropdownSelect>

                    <DropdownSelect ref={priorityRef} isOpen={priorityOpen} onToggle={() => { setPriorityOpen(!priorityOpen); setScopeOpen(false); setModuleOpen(false); }}
                        onClose={() => setPriorityOpen(false)} label={activePriority.label} width="130px">
                        {PRIORITY_OPTIONS.map((item) => (
                            <button key={item.id} type="button" onClick={() => { onPriorityFilterChange(item.id); setPriorityOpen(false); }} className={dropClass(priorityFilter === item.id)}>{item.label}</button>
                        ))}
                    </DropdownSelect>
                </div>

                <div className="flex shrink-0 items-center gap-0.5 rounded-lg border border-[var(--crm-border)] bg-[var(--crm-surface)] p-0.5">
                    {VIEW_TABS.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button key={tab.id} type="button" onClick={() => onViewModeChange(tab.id)}
                                className={`inline-flex h-7 items-center gap-1 rounded-md px-2 text-[10px] font-semibold transition ${viewMode === tab.id ? 'bg-[var(--crm-gold)] text-black' : 'text-[var(--crm-text-muted)] hover:text-[var(--crm-text)]'}`}
                                title={tab.label}>
                                <Icon size={12} />
                                <span className="hidden md:inline">{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                <button type="button" onClick={() => { onFilterChange('all'); onCategoryChange('all'); onPriorityFilterChange('all'); onQueryChange(''); }}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--crm-border)] text-[var(--crm-muted)] transition hover:border-[var(--crm-gold)] hover:text-[var(--crm-text)]">
                    <X size={13} />
                </button>
            </div>

            {hasActive ? (
                <div className="flex flex-wrap items-center gap-1.5 border-t border-[var(--crm-border)] px-3 py-1.5">
                    {filter !== 'all' ? <Chip label={activeFilter.label} onRemove={() => onFilterChange('all')} /> : null}
                    {category !== 'all' ? <Chip label={activeCategory.label} onRemove={() => onCategoryChange('all')} /> : null}
                    {priorityFilter !== 'all' ? <Chip label={activePriority.label} onRemove={() => onPriorityFilterChange('all')} /> : null}
                    {query ? <Chip label={`"${query}"`} onRemove={() => onQueryChange('')} /> : null}
                </div>
            ) : null}
        </section>
    );
}

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
    return (
        <span className="inline-flex items-center gap-1 rounded-full border border-[var(--crm-border)] bg-[var(--crm-surface)] px-2 py-0.5 text-[10px] font-semibold text-[var(--crm-text)]">
            {label}
            <button type="button" onClick={onRemove} className="text-[var(--crm-muted)] hover:text-red-400"><X size={10} /></button>
        </span>
    );
}

const DropdownSelect = ({ ref, isOpen, onToggle, onClose, label, width, children }: {
    ref: React.RefObject<HTMLDivElement | null>;
    isOpen: boolean;
    onToggle: () => void;
    onClose: () => void;
    label: string;
    width: string;
    children: React.ReactNode;
}) => (
    <div ref={ref} className="relative" onBlur={(e) => { if (!ref.current?.contains(e.relatedTarget)) onClose(); }}>
        <button type="button" onClick={onToggle}
            className="inline-flex h-8 items-center justify-between gap-2 rounded-lg border border-[var(--crm-border)] bg-[var(--crm-surface)] px-2.5 text-xs font-semibold text-[var(--crm-text)] transition hover:border-[var(--crm-gold)]"
            style={{ width }}>
            <span className="truncate">{label}</span>
            <ChevronDown size={12} className={`shrink-0 transition ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        {isOpen ? (
            <div className="absolute left-0 top-9 z-50 min-w-[180px] rounded-xl border border-[var(--crm-border)] bg-[var(--crm-elevated)] p-1 shadow-2xl shadow-black/40">
                {children}
            </div>
        ) : null}
    </div>
);
