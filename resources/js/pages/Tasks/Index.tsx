import { Head, router } from '@inertiajs/react';
import { IconArrowsSort, IconArrowMoveRight, IconCalendarMonth, IconChevronDown, IconChevronLeft, IconChevronRight, IconChevronUp, IconClipboardList, IconColumns3, IconLayoutDashboard, IconList, IconPlus, IconTable, IconTimeline, IconUsersGroup } from '@tabler/icons-react';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { TabPanel } from 'react-aria-components';
import { Chip, Dropdown, ProgressBar, Tooltip } from '@heroui/react';
import { toast } from 'sonner';
import { AppShell } from '@/components/layout/AppShell';
import { AppButton } from '@/components/ui/AppButton';
import { AppWorkspaceTable, type AppWorkspaceTableColumn } from '@/components/ui/AppWorkspaceTable';
import { AppWorkspaceTabs, type AppWorkspaceTab } from '@/components/ui/AppWorkspaceTabs';
import { AvatarPill } from '@/components/ui/AvatarPill';
import { cn } from '@/lib/cn';
import { useTranslation, type AppLocale } from '@/lib/i18n';
import type { FormErrors } from '@/lib/formErrors';
import type { TaskRow, TaskStatus, UserOption, ViewMode } from '@/features/tasks/types';
import { COLUMNS, CATEGORY_COLORS, PRIORITY_COLORS, STATUS_COLORS, STATUS_DOT_COLORS } from '@/features/tasks/types';
import { TaskFilters } from '@/features/tasks/components/TaskFilters';
import { TaskBoard } from '@/features/tasks/components/TaskBoard';
import { TaskCalendar } from '@/features/tasks/components/TaskCalendar';
import { TaskListView } from '@/features/tasks/components/TaskListView';
import { TaskTimeline } from '@/features/tasks/components/TaskTimeline';
import { TaskOverview } from '@/features/tasks/components/TaskOverview';
import { TaskCreateDrawer } from '@/features/tasks/components/TaskCreateDrawer';
import { TaskDetailDrawer } from '@/features/tasks/components/TaskDetailDrawer';


type PageProps = {
    tasks: TaskRow[];
    users: UserOption[];
    currentUserId: number | null;
    activeFilter: string;
    activeCategory: string;
};

function isOpenTask(task: TaskRow) {
    return task.status !== 'completed' && task.status !== 'cancelled';
}

function isOverdue(task: TaskRow) {
    return Boolean(task.dueDate && new Date(task.dueDate) < new Date() && isOpenTask(task));
}

const dueFormatters = new Map<AppLocale, Intl.DateTimeFormat>();

function formatDueDate(date: string, locale: AppLocale): string {
    let formatter = dueFormatters.get(locale);

    if (!formatter) {
        formatter = new Intl.DateTimeFormat(locale === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'short' });
        dueFormatters.set(locale, formatter);
    }

    return formatter.format(new Date(`${date}T00:00:00`));
}

const PRIORITY_ORDER: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };

const VIEW_TABS: AppWorkspaceTab[] = [
    { id: 'overview', label: '', icon: IconLayoutDashboard },
    { id: 'board', label: '', icon: IconColumns3 },
    { id: 'list', label: '', icon: IconList },
    { id: 'table', label: '', icon: IconTable },
    { id: 'timeline', label: '', icon: IconTimeline },
    { id: 'calendar', label: '', icon: IconCalendarMonth },
];

function SortableLabel({ field, label, sortField, sortDir, onToggle }: { field: string; label: string; sortField: string; sortDir: 'asc' | 'desc'; onToggle: (field: string) => void }) {
    const active = sortField === field;
    return (
        <button type="button" onClick={() => onToggle(field)} className="inline-flex items-center gap-1.5 text-left transition hover:text-[var(--foreground)]">
            <span>{label}</span>
            {active
                ? sortDir === 'asc' ? <IconChevronUp size={11} className="text-[var(--accent)]" /> : <IconChevronDown size={11} className="text-[var(--accent)]" />
                : <IconArrowsSort size={11} className="text-[var(--text-muted)]" />}
        </button>
    );
}

function StatusMenu({ task, onStatusChange }: { task: TaskRow; onStatusChange: (task: TaskRow, status: string) => void }) {
    const { t } = useTranslation();
    return (
        <div onClick={(e) => e.stopPropagation()}>
            <Dropdown>
                <Dropdown.Trigger
                    aria-label={t('tasks.actions.moveTask')}
                    className="flex size-6 items-center justify-center rounded-md text-[var(--text-muted)] transition hover:bg-[var(--surface-3)] hover:text-[var(--foreground)]"
                >
                    <IconArrowMoveRight size={13} />
                </Dropdown.Trigger>
                <Dropdown.Popover placement="bottom end" className="min-w-40 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1 shadow-xl">
                    <Dropdown.Menu
                        aria-label={t('tasks.actions.moveTask')}
                        onAction={(key) => onStatusChange(task, String(key))}
                    >
                        {COLUMNS.filter((s) => s !== task.status).map((status) => (
                            <Dropdown.Item
                                key={status}
                                id={status}
                                textValue={t(`tasks.statuses.${status as TaskStatus}`)}
                                className="rounded-lg px-2 py-1.5 text-[11px] font-medium text-[var(--text)] outline-none transition data-[hovered]:bg-[var(--surface-2)]"
                            >
                                <span className="flex items-center gap-2">
                                    <span className={`size-2 rounded-full ${STATUS_DOT_COLORS[status]}`} />
                                    {t(`tasks.statuses.${status as TaskStatus}`)}
                                </span>
                            </Dropdown.Item>
                        ))}
                    </Dropdown.Menu>
                </Dropdown.Popover>
            </Dropdown>
        </div>
    );
}

export default function TasksIndex({ tasks, users, currentUserId, activeFilter, activeCategory }: PageProps) {
    const { t, locale } = useTranslation();
    const [localTasks, setLocalTasks] = useState<TaskRow[]>(tasks);
    const [query, setQuery] = useState('');
    const [filter, setFilter] = useState(activeFilter);
    const [category, setCategory] = useState(activeCategory);
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [viewMode, setViewMode] = useState<ViewMode>(() => {
        if (typeof window !== 'undefined') {
            return (localStorage.getItem('tasks_view') as ViewMode) || 'overview';
        }
        return 'overview';
    });
    const [selectedTask, setSelectedTask] = useState<TaskRow | null>(() => {
        if (typeof window === 'undefined') return null;

        const taskId = Number(new URLSearchParams(window.location.search).get('task'));

        return Number.isSafeInteger(taskId) && taskId > 0
            ? tasks.find((task) => task.id === taskId) ?? null
            : null;
    });
    const [createOpen, setCreateOpen] = useState(false);
    const [form, setForm] = useState({
        title: '', description: '', status: 'not_started' as string,
        priority: 'medium' as string, impact: 'normal' as string, type: 'general' as string,
        category: 'general_admin' as string,
        start_date: '', due_date: '', estimated_minutes: '', blocked_reason: '',
        assignee_ids: [] as number[], watcher_ids: [] as number[],
    });
    const [formErrors, setFormErrors] = useState<FormErrors>({});

    useEffect(() => {
        if (new URLSearchParams(window.location.search).get('command') !== 'create') return;
        setFormErrors({});
        setCreateOpen(true);
        window.history.replaceState({}, '', window.location.pathname);
    }, []);

    const filtered = useMemo(() => {
        let items = localTasks;
        if (query.trim()) {
            const q = query.toLowerCase();
            items = items.filter((t) =>
                t.title.toLowerCase().includes(q) ||
                t.taskNumber.toLowerCase().includes(q) ||
                (t.description && t.description.toLowerCase().includes(q)) ||
                (t.client && t.client.name.toLowerCase().includes(q)) ||
                (t.dossier && (t.dossier.number.toLowerCase().includes(q) || t.dossier.object.toLowerCase().includes(q))) ||
                t.category.toLowerCase().includes(q) ||
                t.status.toLowerCase().includes(q) ||
                t.priority.toLowerCase().includes(q)
            );
        }
        if (category !== 'all') {
            items = items.filter((t) => t.category === category);
        }
        if (priorityFilter !== 'all') {
            items = items.filter((t) => t.priority === priorityFilter);
        }
        if (filter === 'my') {
            /* client-side approximate */
        } else if (filter === 'overdue') {
            items = items.filter((t) => isOverdue(t));
        } else if (filter === 'due_today') {
            const today = new Date().toISOString().slice(0, 10);
            items = items.filter((t) => t.dueDate === today);
        } else if (filter === 'due_week') {
            const now = new Date(); const end = new Date(now); end.setDate(now.getDate() + (7 - now.getDay()));
            const endStr = end.toISOString().slice(0, 10);
            items = items.filter((t) => t.dueDate && t.dueDate <= endStr);
        } else if (filter === 'blocked') {
            items = items.filter((t) => t.status === 'blocked');
        } else if (filter === 'completed') {
            items = items.filter((t) => t.status === 'completed');
        } else if (filter === 'assigned_by_me') {
            /* server-side */
        } else if (filter === 'watching') {
            /* server-side */
        }
        return items;
    }, [localTasks, query, category, priorityFilter, filter]);

    const PAGE_SIZE = 50;
    const [page, setPage] = useState(1);

    useEffect(() => {
        setPage(1);
    }, [query, category, priorityFilter, filter]);

    const pageTasks = useMemo(() => {
        return filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    }, [filtered, page]);

    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    const showPagination = totalPages > 1 && (viewMode === 'table' || viewMode === 'list' || viewMode === 'timeline' || viewMode === 'calendar');

    const columns = useMemo(() => {
        const map: Record<string, TaskRow[]> = {};
        for (const col of COLUMNS) map[col] = [];
        for (const t of filtered) {
            if (map[t.status]) map[t.status].push(t);
        }
        return map;
    }, [filtered]);

    const pageColumns = useMemo(() => {
        const map: Record<string, TaskRow[]> = {};
        for (const col of COLUMNS) map[col] = [];
        for (const t of pageTasks) {
            if (map[t.status]) map[t.status].push(t);
        }
        return map;
    }, [pageTasks]);

    useEffect(() => {
        setFilter(activeFilter);
    }, [activeFilter]);

    useEffect(() => {
        setLocalTasks(tasks);
        setSelectedTask((current) => current ? tasks.find((task) => task.id === current.id) ?? current : null);
    }, [tasks]);

    useEffect(() => {
        localStorage.setItem('tasks_view', viewMode);
    }, [viewMode]);

    const handleCreate = useCallback((event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setFormErrors({});
        const payload = { ...form, estimated_minutes: form.estimated_minutes ? parseInt(form.estimated_minutes, 10) : null };
        router.post('/tasks', payload, {
            preserveScroll: true,
            onSuccess: () => {
                setCreateOpen(false);
                setForm({ title: '', description: '', status: 'not_started', priority: 'medium', impact: 'normal', type: 'general', category: 'general_admin', start_date: '', due_date: '', estimated_minutes: '', blocked_reason: '', assignee_ids: [], watcher_ids: [] });
                toast.success(t('tasks.toast.created'));
            },
            onError: (err) => {
                setFormErrors(err);
                toast.error(t('tasks.toast.formError'));
            },
        });
    }, [form, t]);

    const closeTaskDrawer = useCallback(() => {
        setSelectedTask(null);

        const url = new URL(window.location.href);
        url.searchParams.delete('task');
        window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
    }, []);

    const handleCreateInStatus = useCallback((status: string) => {
        setForm((prev) => ({ ...prev, status }));
        setCreateOpen(true);
    }, []);

    const replaceTask = useCallback((taskId: number, updater: (task: TaskRow) => TaskRow) => {
        setLocalTasks((current) => current.map((task) => task.id === taskId ? updater(task) : task));
        setSelectedTask((current) => current && current.id === taskId ? updater(current) : current);
    }, []);

    const updateStatus = useCallback((task: TaskRow, status: string) => {
        const previous = task;
        const nextStatus = status as TaskStatus;

        replaceTask(task.id, (current) => ({
            ...current,
            status: nextStatus,
            completedAt: nextStatus === 'completed' ? new Date().toISOString() : current.completedAt,
            progress: nextStatus === 'completed' ? 100 : current.progress,
        }));

        router.put(`/tasks/${task.id}/status`, { status }, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => toast.success(t('tasks.toast.statusUpdated')),
            onError: () => {
                replaceTask(task.id, () => previous);
                toast.error(t('tasks.toast.statusFailed'));
            },
        });
    }, [replaceTask, t]);

    const toggleChecklistItem = useCallback((taskId: number, itemId: number) => {
        const previous = localTasks.find((task) => task.id === taskId) ?? null;

        replaceTask(taskId, (task) => {
            const checklistItems = Array.isArray(task.checklistItems) ? task.checklistItems : [];
            const nextItems = checklistItems.map((item) => item.id === itemId ? { ...item, isDone: !item.isDone } : item);
            const progress = nextItems.length > 0 ? Math.round((nextItems.filter((item) => item.isDone).length / nextItems.length) * 100) : 0;
            return { ...task, checklistItems: nextItems, progress };
        });

        router.put(`/tasks/${taskId}/checklist/${itemId}/toggle`, {}, {
            preserveScroll: true,
            preserveState: true,
            onError: () => { if (previous) replaceTask(taskId, () => previous); toast.error(t('tasks.toast.checklistFailed')); },
        });
    }, [localTasks, replaceTask, t]);

    const addChecklistItem = useCallback((taskId: number, label: string) => {
        router.post(`/tasks/${taskId}/checklist`, { label }, { preserveScroll: true, onSuccess: () => toast.success(t('tasks.toast.checklistAdded')), onError: () => toast.error(t('tasks.toast.checklistFailed')) });
    }, [t]);

    const addComment = useCallback((taskId: number, body: string) => {
        router.post(`/tasks/${taskId}/comments`, { body, is_note: false }, { preserveScroll: true, onSuccess: () => toast.success(t('tasks.toast.commentAdded')), onError: () => toast.error(t('tasks.toast.commentFailed')) });
    }, [t]);

    const uploadAttachment = useCallback((taskId: number, file: File) => {
        router.post(`/tasks/${taskId}/attachments`, { file }, { forceFormData: true, preserveScroll: true, onSuccess: () => toast.success(t('tasks.toast.attachmentUploaded')), onError: () => toast.error(t('tasks.toast.attachmentFailed')) });
    }, [t]);

    const teamAvatars = useMemo(() => {
        const ids = new Set<number>();
        const avatars: { id: number; name: string }[] = [];
        for (const t of localTasks) {
            if (Array.isArray(t.assignees)) {
                for (const a of t.assignees) {
                    if (!ids.has(a.id)) { ids.add(a.id); avatars.push(a); if (avatars.length >= 6) break; }
                }
            }
            if (avatars.length >= 6) break;
        }
        return avatars;
    }, [localTasks]);

    const [tableSortField, setTableSortField] = useState('');
    const [tableSortDir, setTableSortDir] = useState<'asc' | 'desc'>('asc');

    function toggleTableSort(field: string) {
        if (tableSortField === field) setTableSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
        else { setTableSortField(field); setTableSortDir('asc'); }
    }

    const tableTasks = useMemo(() => {
        if (!tableSortField) return pageTasks;
        return [...pageTasks].sort((a, b) => {
            const aVal = a[tableSortField as keyof TaskRow];
            const bVal = b[tableSortField as keyof TaskRow];
            if (tableSortField === 'priority') {
                const ao = PRIORITY_ORDER[a.priority] ?? 99;
                const bo = PRIORITY_ORDER[b.priority] ?? 99;
                return tableSortDir === 'asc' ? ao - bo : bo - ao;
            }
            const aStr = aVal == null ? '' : String(aVal);
            const bStr = bVal == null ? '' : String(bVal);
            const cmp = aStr.localeCompare(bStr);
            return tableSortDir === 'asc' ? cmp : -cmp;
        });
    }, [pageTasks, tableSortField, tableSortDir]);

    const taskColumns: AppWorkspaceTableColumn<TaskRow>[] = [
        {
            id: 'task',
            label: <SortableLabel field="title" label={t('tasks.table.task')} sortField={tableSortField} sortDir={tableSortDir} onToggle={toggleTableSort} />,
            render: (task) => (
                <div className="min-w-0">
                    <p className="max-w-[220px] truncate text-sm font-semibold text-[var(--text)]">{task.title}</p>
                    <p className="text-[9px] text-[var(--text-muted)]">{task.taskNumber}</p>
                </div>
            ),
        },
        {
            id: 'assigned',
            label: t('tasks.table.assigned'),
            headerClassName: 'hidden md:table-cell',
            cellClassName: 'hidden md:table-cell',
            render: (task) => (
                Array.isArray(task.assignees) && task.assignees.length > 0 ? (
                    <div className="flex items-center -space-x-1">
                        {task.assignees.slice(0, 3).map((a) => (
                            <Tooltip key={a.id} delay={450}>
                                <Tooltip.Trigger className="flex">
                                    <AvatarPill name={a.name} size="sm" className="size-6 min-w-6 border-2 border-[var(--surface)] text-[8px]" />
                                </Tooltip.Trigger>
                                <Tooltip.Content className="border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] shadow-xl">{a.name}</Tooltip.Content>
                            </Tooltip>
                        ))}
                        {task.assignees.length > 3 ? (
                            <span className="flex size-6 min-w-6 items-center justify-center rounded-full border-2 border-[var(--surface)] bg-[var(--surface-2)] text-[8px] font-semibold text-[var(--text-muted)]">+{task.assignees.length - 3}</span>
                        ) : null}
                    </div>
                ) : <span className="text-xs text-[var(--text-muted)]">-</span>
            ),
        },
        {
            id: 'project',
            label: t('tasks.table.project'),
            headerClassName: 'hidden lg:table-cell',
            cellClassName: 'hidden lg:table-cell',
            render: (task) => <span className="text-xs text-[var(--text-muted)]">{task.dossier?.object || task.client?.name || '-'}</span>,
        },
        {
            id: 'category',
            label: <SortableLabel field="category" label={t('tasks.table.category')} sortField={tableSortField} sortDir={tableSortDir} onToggle={toggleTableSort} />,
            headerClassName: 'hidden xl:table-cell',
            cellClassName: 'hidden xl:table-cell',
            render: (task) => (
                <Chip size="sm" className={cn('h-5 whitespace-nowrap rounded-full border px-2 text-[9px] font-semibold', CATEGORY_COLORS[task.category])}>{t(`tasks.categories.${task.category}`)}</Chip>
            ),
        },
        {
            id: 'priority',
            label: <SortableLabel field="priority" label={t('tasks.table.priority')} sortField={tableSortField} sortDir={tableSortDir} onToggle={toggleTableSort} />,
            render: (task) => (
                <Chip size="sm" className={cn('h-5 whitespace-nowrap rounded-full border px-2 text-[9px] font-semibold', PRIORITY_COLORS[task.priority])}>{t(`tasks.priorities.${task.priority}`)}</Chip>
            ),
        },
        {
            id: 'progress',
            label: <SortableLabel field="progress" label={t('tasks.table.progress')} sortField={tableSortField} sortDir={tableSortDir} onToggle={toggleTableSort} />,
            headerClassName: 'hidden lg:table-cell',
            cellClassName: 'hidden lg:table-cell',
            render: (task) => (
                <div className="flex items-center gap-2">
                    <ProgressBar value={task.progress} aria-label={`${task.progress}%`} className="h-1.5 w-16">
                        <ProgressBar.Track className="h-full rounded-full bg-[var(--surface-3)]">
                            <ProgressBar.Fill className="rounded-full bg-[var(--accent)]" />
                        </ProgressBar.Track>
                    </ProgressBar>
                    <span className="text-[9px] text-[var(--text-muted)]">{task.progress}%</span>
                </div>
            ),
        },
        {
            id: 'status',
            label: <SortableLabel field="status" label={t('tasks.table.status')} sortField={tableSortField} sortDir={tableSortDir} onToggle={toggleTableSort} />,
            render: (task) => (
                <Chip size="sm" className={cn('h-5 whitespace-nowrap rounded-full border px-2 text-[9px] font-semibold', STATUS_COLORS[task.status])}>
                    <span className={`size-1.5 rounded-full ${STATUS_DOT_COLORS[task.status]}`} />
                    {t(`tasks.statuses.${task.status}`)}
                </Chip>
            ),
        },
        {
            id: 'dueDate',
            label: <SortableLabel field="dueDate" label={t('tasks.table.dueDate')} sortField={tableSortField} sortDir={tableSortDir} onToggle={toggleTableSort} />,
            render: (task) => (
                task.dueDate ? (
                    <Chip size="sm" className={cn('h-5 whitespace-nowrap rounded-full border px-2 text-[9px] font-semibold', isOverdue(task) ? 'bg-red-500/10 text-red-600 border-red-500/20' : 'border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-muted)]')}>
                        {formatDueDate(task.dueDate, locale)}
                    </Chip>
                ) : <span className="text-xs text-[var(--text-muted)]">-</span>
            ),
        },
        {
            id: 'actions',
            label: t('tasks.table.move'),
            headerClassName: 'w-10 text-right',
            reorderable: false,
            render: (task) => <div className="flex justify-end" onClick={(event) => event.stopPropagation()}><StatusMenu task={task} onStatusChange={updateStatus} /></div>,
        },
    ];

    return (
        <>
            <Head title={t('tasks.pageTitle')} />
            <AppShell>
                <div className="crm-page space-y-4">
                    <section className="flex flex-col gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex min-w-0 items-center gap-3">
                            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--accent)_15%,transparent)] text-[var(--accent)]"><IconClipboardList size={19} /></span>
                            <div className="min-w-0">
                                <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">{t('tasks.eyebrow')}</p>
                                <h1 className="mt-0.5 text-lg font-bold text-[var(--foreground)]">{t('tasks.pageTitle')}</h1>
                                <p className="mt-0.5 truncate text-xs text-[var(--text-muted)]">{t('tasks.pageSubtitle')}</p>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5">
                            <div className="hidden items-center -space-x-1.5 pr-1 sm:flex">
                                {teamAvatars.map((member) => (
                                    <Tooltip key={member.id} delay={450}>
                                        <Tooltip.Trigger>
                                            <AvatarPill name={member.name} size="sm" className="size-7 min-w-7 border-2 border-[var(--surface)] text-[9px]" />
                                        </Tooltip.Trigger>
                                        <Tooltip.Content className="border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] shadow-xl">{member.name}</Tooltip.Content>
                                    </Tooltip>
                                ))}
                            </div>
                            <AppButton isIconOnly compact variant="quiet" tooltip={t('tasks.toolbar.workload')} aria-label={t('tasks.toolbar.workload')} onPress={() => router.visit('/admin/users?tab=workload')}><IconUsersGroup size={14} /></AppButton>
                            <AppButton isIconOnly compact variant="solid" color="primary" tooltip={t('tasks.toolbar.newTask')} aria-label={t('tasks.toolbar.newTask')} onPress={() => { setFormErrors({}); setCreateOpen(true); }}><IconPlus size={14} /></AppButton>
                        </div>
                    </section>

                    <TaskFilters
                        filter={filter}
                        category={category}
                        priorityFilter={priorityFilter}
                        query={query}
                        onFilterChange={(f) => { setFilter(f); router.visit(`/tasks?filter=${f}&category=${category}`, { preserveState: true }); }}
                        onCategoryChange={(c) => { setCategory(c); router.visit(`/tasks?filter=${filter}&category=${c}`, { preserveState: true }); }}
                        onPriorityFilterChange={setPriorityFilter}
                        onQueryChange={setQuery}
                    />

                    <div className="mt-4">
                        <AppWorkspaceTabs tabs={VIEW_TABS.map((tab) => ({ ...tab, label: t(`tasks.tabs.${tab.id}`) }))} selectedKey={viewMode} onSelectionChange={(key) => setViewMode(key as ViewMode)}>
                            <TabPanel id="overview" className="outline-none">
                                <TaskOverview tasks={filtered} onTaskClick={setSelectedTask} userId={currentUserId} />
                            </TabPanel>
                            <TabPanel id="board" className="outline-none">
                                <TaskBoard columns={columns} onTaskClick={setSelectedTask} onCreateInStatus={handleCreateInStatus} onStatusChange={updateStatus} />
                            </TabPanel>
                            <TabPanel id="list" className="outline-none">
                                <TaskListView columns={pageColumns} onTaskClick={setSelectedTask} onStatusChange={updateStatus} />
                            </TabPanel>
                            <TabPanel id="table" className="outline-none">
                                <AppWorkspaceTable
                                    ariaLabel={t('tasks.pageTitle')}
                                    columns={taskColumns}
                                    columnOrderStorageKey="archilbo.tasks.table.columns.v1"
                                    columnOrderHint={t('tasks.table.reorderHint')}
                                    data={tableTasks}
                                    rowKey={(task) => task.id}
                                    minTableWidthClassName="min-w-[800px]"
                                    onRowPress={setSelectedTask}
                                    emptyContent={<p className="py-8 text-center text-sm text-[var(--text-muted)]">{t('tasks.empty.table')}</p>}
                                    toolbar={<div className="flex items-center justify-between px-3 py-2"><span className="text-[9px] text-[var(--text-muted)]">{pageTasks.length === 1 ? t('tasks.pagination.taskCountOne', { count: pageTasks.length }) : t('tasks.pagination.taskCountMany', { count: pageTasks.length })}</span></div>}
                                />
                            </TabPanel>
                            <TabPanel id="timeline" className="outline-none">
                                <TaskTimeline tasks={pageTasks} onTaskClick={setSelectedTask} />
                            </TabPanel>
                            <TabPanel id="calendar" className="outline-none">
                                <TaskCalendar tasks={pageTasks} onTaskClick={setSelectedTask} />
                            </TabPanel>
                        </AppWorkspaceTabs>
                    </div>

                    {showPagination ? (
                        <div className="mt-4 flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
                            <span className="text-xs text-[var(--text-muted)]">
                                {t('tasks.pagination.showing', { from: (page - 1) * PAGE_SIZE + 1, to: Math.min(page * PAGE_SIZE, filtered.length), total: filtered.length })}
                            </span>
                            <div className="flex items-center gap-1.5">
                                <AppButton isIconOnly compact size="sm" variant="quiet" tooltip={t('tasks.toolbar.previousPage')} aria-label={t('tasks.toolbar.previousPage')} isDisabled={page === 1} onPress={() => setPage((p) => Math.max(1, p - 1))}><IconChevronLeft size={14} /></AppButton>
                                <span className="min-w-10 text-center text-[9px] font-semibold tabular-nums text-[var(--text-muted)]">{page} / {totalPages}</span>
                                <AppButton isIconOnly compact size="sm" variant="quiet" tooltip={t('tasks.toolbar.nextPage')} aria-label={t('tasks.toolbar.nextPage')} isDisabled={page === totalPages} onPress={() => setPage((p) => Math.min(totalPages, p + 1))}><IconChevronRight size={14} /></AppButton>
                            </div>
                        </div>
                    ) : null}

                    <TaskCreateDrawer
                        isOpen={createOpen}
                        users={users}
                        form={form}
                        formErrors={formErrors}
                        onOpenChange={(o) => { setCreateOpen(o); if (!o) setFormErrors({}); }}
                        onFormChange={setForm}
                        onSubmit={handleCreate}
                    />

                    <TaskDetailDrawer
                        task={selectedTask}
                        onClose={closeTaskDrawer}
                        onComplete={(t) => updateStatus(t, 'completed')}
                        onChecklistToggle={toggleChecklistItem}
                        onChecklistAdd={addChecklistItem}
                        onCommentAdd={addComment}
                        onAttachmentUpload={uploadAttachment}
                    />

                </div>
            </AppShell>
        </>
    );
}
