import { Head, router } from '@inertiajs/react';
import { CalendarDays, Columns3, LayoutDashboard, List, Plus, Table2, Timeline } from 'lucide-react';
import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { AppShell } from '@/components/layout/AppShell';
import { AppButton } from '@/components/ui/AppButton';
import type { FormErrors } from '@/lib/formErrors';
import type { TaskRow, TaskStatus, UserOption, ViewMode } from '@/features/tasks/types';
import { COLUMNS } from '@/features/tasks/types';
import { TaskFilters } from '@/features/tasks/components/TaskFilters';
import { TaskBoard } from '@/features/tasks/components/TaskBoard';
import { TaskCalendar } from '@/features/tasks/components/TaskCalendar';
import { TaskListView } from '@/features/tasks/components/TaskListView';
import { TaskTable } from '@/features/tasks/components/TaskTable';
import { TaskTimeline } from '@/features/tasks/components/TaskTimeline';
import { TaskOverview } from '@/features/tasks/components/TaskOverview';
import { TaskCreateDrawer } from '@/features/tasks/components/TaskCreateDrawer';
import { TaskDetailDrawer } from '@/features/tasks/components/TaskDetailDrawer';
import { TaskRequestCreateDrawer, type TaskRequestOptions } from '@/features/tasks/components/TaskRequestCreateDrawer';

type PageProps = {
    tasks: TaskRow[];
    users: UserOption[];
    activeFilter: string;
    activeCategory: string;
    taskRequestTypes: string[];
    taskRequestTypeLabels: Record<string, string>;
    taskRequestOptions: TaskRequestOptions;
};

function isOpenTask(task: TaskRow) {
    return task.status !== 'completed' && task.status !== 'cancelled';
}

function isOverdue(task: TaskRow) {
    return Boolean(task.dueDate && new Date(task.dueDate) < new Date() && isOpenTask(task));
}

export default function TasksIndex({ tasks, users, activeFilter, activeCategory, taskRequestTypes, taskRequestTypeLabels, taskRequestOptions }: PageProps) {
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
    const [selectedTask, setSelectedTask] = useState<TaskRow | null>(null);
    const [createOpen, setCreateOpen] = useState(false);
    const [requestOpen, setRequestOpen] = useState(false);
    const [form, setForm] = useState({
        title: '', description: '', status: 'not_started' as string,
        priority: 'medium' as string, impact: 'normal' as string, type: 'general' as string,
        category: 'general_admin' as string,
        start_date: '', due_date: '', estimated_minutes: '', blocked_reason: '',
        assignee_ids: [] as number[], watcher_ids: [] as number[],
    });
    const [formErrors, setFormErrors] = useState<FormErrors>({});

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

    const columns = useMemo(() => {
        const map: Record<string, TaskRow[]> = {};
        for (const col of COLUMNS) map[col] = [];
        for (const t of filtered) {
            if (map[t.status]) map[t.status].push(t);
        }
        return map;
    }, [filtered]);

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
                toast.success('Task created.');
            },
            onError: (err) => {
                setFormErrors(err);
                toast.error('Please check form errors.');
            },
        });
    }, [form]);

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
            onSuccess: () => toast.success('Status updated.'),
            onError: () => {
                replaceTask(task.id, () => previous);
                toast.error('Status update failed.');
            },
        });
    }, [replaceTask]);

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
            onError: () => { if (previous) replaceTask(taskId, () => previous); toast.error('Checklist update failed.'); },
        });
    }, [localTasks, replaceTask]);

    const addChecklistItem = useCallback((taskId: number, label: string) => {
        router.post(`/tasks/${taskId}/checklist`, { label }, { preserveScroll: true, onSuccess: () => toast.success('Checklist item added.'), onError: () => toast.error('Checklist item could not be added.') });
    }, []);

    const addComment = useCallback((taskId: number, body: string) => {
        router.post(`/tasks/${taskId}/comments`, { body, is_note: false }, { preserveScroll: true, onSuccess: () => toast.success('Comment added.'), onError: () => toast.error('Comment could not be added.') });
    }, []);

    const uploadAttachment = useCallback((taskId: number, file: File) => {
        router.post(`/tasks/${taskId}/attachments`, { file }, { forceFormData: true, preserveScroll: true, onSuccess: () => toast.success('Attachment uploaded.'), onError: () => toast.error('Attachment upload failed.') });
    }, []);

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

    const viewSwitcher = (
        <div className="flex shrink-0 items-center gap-0.5 rounded-lg border border-[var(--crm-border)] bg-[var(--crm-surface)] p-0.5">
            {([
                { id: 'overview' as ViewMode, label: 'Overview', icon: LayoutDashboard },
                { id: 'board' as ViewMode, label: 'Board', icon: Columns3 },
                { id: 'list' as ViewMode, label: 'List', icon: List },
                { id: 'table' as ViewMode, label: 'Table', icon: Table2 },
                { id: 'timeline' as ViewMode, label: 'Timeline', icon: Timeline },
                { id: 'calendar' as ViewMode, label: 'Calendar', icon: CalendarDays },
            ]).map((tab) => {
                const Icon = tab.icon;
                return (
                    <button key={tab.id} type="button" onClick={() => setViewMode(tab.id)}
                        className={`inline-flex h-7 items-center gap-1 rounded-md px-2 text-[10px] font-semibold transition ${viewMode === tab.id ? 'bg-[var(--crm-gold)] text-black' : 'text-[var(--crm-text-muted)] hover:text-[var(--crm-text)]'}`}>
                        <Icon size={12} />
                        <span className="hidden md:inline">{tab.label}</span>
                    </button>
                );
            })}
        </div>
    );

    return (
        <>
            <Head title="Tasks" />
            <AppShell eyebrowKey="nav.tasks" titleKey="nav.tasks" subtitleKey="Tasks and workflow management"
                action={
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="hidden sm:flex -space-x-1.5 mr-1">
                            {teamAvatars.map((a) => (
                                <span key={a.id} className="flex size-7 items-center justify-center rounded-full border-2 border-[var(--crm-surface)] bg-[var(--crm-gold)] text-[9px] font-bold text-black" title={a.name}>
                                    {a.name.charAt(0)}
                                </span>
                            ))}
                        </div>
                        <AppButton variant="secondary" onPress={() => router.visit('/task-requests')}>Requests</AppButton>
                        <AppButton variant="secondary" onPress={() => setRequestOpen(true)}><Plus size={15} /> Request</AppButton>
                        <AppButton variant="secondary" onPress={() => router.visit('/workload')}>Workload</AppButton>
                        <AppButton variant="primary" onPress={() => { setFormErrors({}); setCreateOpen(true); }}><Plus size={15} /> Create</AppButton>
                    </div>
                }
            >
                <div className="crm-page">
                    {/* Premium page header */}
                    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <h1 className="text-lg font-bold text-[var(--crm-text)]">Tasks</h1>
                            <p className="mt-0.5 text-xs text-[var(--crm-muted)]">Track and organize all office operations in one place.</p>
                            <p className="mt-0.5 text-[10px] text-[var(--crm-muted)]">Last sync: just now &middot; {localTasks.length} tasks</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            {viewSwitcher}
                        </div>
                    </div>

                    <TaskFilters
                        filter={filter}
                        category={category}
                        priorityFilter={priorityFilter}
                        query={query}
                        viewMode={viewMode}
                        onFilterChange={(f) => { setFilter(f); router.visit(`/tasks?filter=${f}&category=${category}`, { preserveState: true }); }}
                        onCategoryChange={(c) => { setCategory(c); router.visit(`/tasks?filter=${filter}&category=${c}`, { preserveState: true }); }}
                        onPriorityFilterChange={setPriorityFilter}
                        onQueryChange={setQuery}
                        onViewModeChange={setViewMode}
                    />

                    <div className="mt-4">
                        {viewMode === 'overview' ? (
                            <TaskOverview tasks={filtered} onTaskClick={setSelectedTask} userId={undefined} />
                        ) : viewMode === 'board' ? (
                            <TaskBoard columns={columns} onTaskClick={setSelectedTask} onCreateInStatus={handleCreateInStatus} />
                        ) : viewMode === 'list' ? (
                            <TaskListView columns={columns} onTaskClick={setSelectedTask} onStatusChange={updateStatus} />
                        ) : viewMode === 'table' ? (
                            <TaskTable tasks={filtered} onTaskClick={setSelectedTask} onStatusChange={updateStatus} />
                        ) : viewMode === 'timeline' ? (
                            <TaskTimeline tasks={filtered} onTaskClick={setSelectedTask} />
                        ) : (
                            <TaskCalendar tasks={filtered} onTaskClick={setSelectedTask} />
                        )}
                    </div>

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
                        onClose={() => setSelectedTask(null)}
                        onComplete={(t) => updateStatus(t, 'completed')}
                        onChecklistToggle={toggleChecklistItem}
                        onChecklistAdd={addChecklistItem}
                        onCommentAdd={addComment}
                        onAttachmentUpload={uploadAttachment}
                    />

                    <TaskRequestCreateDrawer
                        isOpen={requestOpen}
                        requestTypes={taskRequestTypes}
                        requestTypeLabels={taskRequestTypeLabels}
                        options={taskRequestOptions}
                        onOpenChange={setRequestOpen}
                    />
                </div>
            </AppShell>
        </>
    );
}
