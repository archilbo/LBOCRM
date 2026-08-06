import { IconChevronDown, IconCircleCheck, IconX } from '@tabler/icons-react';

import { Button, Card, Chip, Dropdown } from '@heroui/react';
import { AppButton } from '@/components/ui/AppButton';
import { AppSearchInput } from '@/components/ui/AppSearchInput';
import { cn } from '@/lib/cn';
import { useTranslation } from '@/lib/i18n';

const FILTERS = [
    { id: 'all', key: 'tasks.filters.all' },
    { id: 'my', key: 'tasks.filters.my' },
    { id: 'assigned_by_me', key: 'tasks.filters.assignedByMe' },
    { id: 'watching', key: 'tasks.filters.watching' },
    { id: 'overdue', key: 'tasks.filters.overdue' },
    { id: 'due_today', key: 'tasks.filters.dueToday' },
    { id: 'due_week', key: 'tasks.filters.dueThisWeek' },
    { id: 'blocked', key: 'tasks.filters.blocked' },
    { id: 'completed', key: 'tasks.filters.completed' },
];

const CATEGORIES = [
    { id: 'all', key: 'tasks.filters.allProjects' },
    { id: 'documents', key: 'tasks.categories.documents' },
    { id: 'client_follow_up', key: 'tasks.categories.client_follow_up' },
    { id: 'contract', key: 'tasks.categories.contract' },
    { id: 'finance', key: 'tasks.categories.finance' },
    { id: 'archive', key: 'tasks.categories.archive' },
    { id: 'general_admin', key: 'tasks.categories.general_admin' },
];

const PRIORITY_OPTIONS = [
    { id: 'all', key: 'tasks.filters.allPriorities' },
    { id: 'urgent', key: 'tasks.priorities.urgent' },
    { id: 'high', key: 'tasks.priorities.high' },
    { id: 'medium', key: 'tasks.priorities.medium' },
    { id: 'low', key: 'tasks.priorities.low' },
];

type Option = { id: string; key: string };

type Props = {
    filter: string;
    category: string;
    priorityFilter: string;
    query: string;
    onFilterChange: (f: string) => void;
    onCategoryChange: (c: string) => void;
    onPriorityFilterChange: (p: string) => void;
    onQueryChange: (q: string) => void;
};

function FilterSelect({ label, width, options, value, onSelect }: { label: string; width: string; options: Option[]; value: string; onSelect: (id: string) => void }) {
    const { t } = useTranslation();
    return (
        <Dropdown>
            <Dropdown.Trigger
                className={cn(
                    'group inline-flex h-8 items-center justify-between gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 text-xs font-semibold text-[var(--text)] transition hover:border-[var(--accent)]/30',
                    width,
                    value !== 'all' && 'border-[var(--accent)] text-[var(--accent)]',
                )}
            >
                <span className="truncate">{label}</span>
                <IconChevronDown size={12} className="shrink-0 text-[var(--text-muted)] transition group-data-[open]:rotate-180" />
            </Dropdown.Trigger>
            <Dropdown.Popover placement="bottom start" className="min-w-44 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1 shadow-xl">
                <Dropdown.Menu
                    aria-label={label}
                    selectionMode="single"
                    selectedKeys={[value]}
                    onAction={(key) => onSelect(String(key))}
                >
                    {options.map((option) => (
                        <Dropdown.Item
                            key={option.id}
                            id={option.id}
                            textValue={t(option.key)}
                            className="rounded-lg px-2 py-1.5 text-[11px] font-medium text-[var(--text)] outline-none transition data-[hovered]:bg-[var(--surface-2)]"
                        >
                            <div className="flex w-full items-center gap-2">
                                <Dropdown.ItemIndicator><IconCircleCheck size={14} className="text-[var(--accent)]" /></Dropdown.ItemIndicator>
                                <span className="flex-1">{t(option.key)}</span>
                            </div>
                        </Dropdown.Item>
                    ))}
                </Dropdown.Menu>
            </Dropdown.Popover>
        </Dropdown>
    );
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
    const { t } = useTranslation();
    return (
        <Chip size="sm" className="h-6 rounded-full border border-[var(--border)] bg-[var(--surface-2)] text-[9px] font-semibold text-[var(--text)]">
            {label}
            <Button isIconOnly size="sm" aria-label={t('tasks.filters.removeChip', { label })} onPress={onRemove} className="ml-0.5 size-4 min-w-4 p-0 text-[var(--text-muted)] hover:text-[var(--danger)]">
                <IconX size={10} />
            </Button>
        </Chip>
    );
}

export function TaskFilters({ filter, category, priorityFilter, query, onFilterChange, onCategoryChange, onPriorityFilterChange, onQueryChange }: Props) {
    const { t } = useTranslation();
    const activeFilter = FILTERS.find((item) => item.id === filter) ?? FILTERS[0];
    const activeCategory = CATEGORIES.find((item) => item.id === category) ?? CATEGORIES[0];
    const activePriority = PRIORITY_OPTIONS.find((item) => item.id === priorityFilter) ?? PRIORITY_OPTIONS[0];

    const hasActive = filter !== 'all' || category !== 'all' || priorityFilter !== 'all' || !!query;

    const reset = () => {
        onFilterChange('all');
        onCategoryChange('all');
        onPriorityFilterChange('all');
        onQueryChange('');
    };

    return (
        <Card className="gap-0 overflow-visible rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
            <Card.Content className="flex flex-row flex-nowrap items-center gap-2 overflow-x-auto p-2.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                <AppSearchInput value={query} onChange={onQueryChange} placeholder={t('tasks.filters.search')} ariaLabel={t('tasks.filters.searchAria')} maxWidth="" className="min-w-[140px] flex-1" />

                <div className="flex shrink-0 items-center gap-1.5">
                    <FilterSelect label={t(activeFilter.key)} width="w-[132px]" options={FILTERS} value={filter} onSelect={onFilterChange} />
                    <FilterSelect label={t(activeCategory.key)} width="w-[142px]" options={CATEGORIES} value={category} onSelect={onCategoryChange} />
                    <FilterSelect label={t(activePriority.key)} width="w-[124px]" options={PRIORITY_OPTIONS} value={priorityFilter} onSelect={onPriorityFilterChange} />
                </div>

                {hasActive ? (
                    <AppButton isIconOnly compact variant="quiet" tooltip={t('tasks.filters.reset')} aria-label={t('tasks.filters.reset')} className="shrink-0" onPress={reset}>
                        <IconX size={13} />
                    </AppButton>
                ) : null}
            </Card.Content>

            {hasActive ? (
                <Card.Content className="flex flex-row flex-wrap items-center gap-1.5 border-t border-[var(--border)] px-3 py-1.5">
                    {filter !== 'all' ? <FilterChip label={t(activeFilter.key)} onRemove={() => onFilterChange('all')} /> : null}
                    {category !== 'all' ? <FilterChip label={t(activeCategory.key)} onRemove={() => onCategoryChange('all')} /> : null}
                    {priorityFilter !== 'all' ? <FilterChip label={t(activePriority.key)} onRemove={() => onPriorityFilterChange('all')} /> : null}
                    {query ? <FilterChip label={`"${query}"`} onRemove={() => onQueryChange('')} /> : null}
                </Card.Content>
            ) : null}
        </Card>
    );
}
