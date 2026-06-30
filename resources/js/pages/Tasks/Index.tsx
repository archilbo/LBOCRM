import { Head, router } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { AppShell } from '@/components/layout/AppShell';
import { AppButton } from '@/components/ui/AppButton';
import type { FormErrors } from '@/lib/formErrors';
import type { TaskRow, UserOption } from '@/features/tasks/types';
import { COLUMNS } from '@/features/tasks/types';
import { TaskFilters } from '@/features/tasks/components/TaskFilters';
import { TaskBoard } from '@/features/tasks/components/TaskBoard';
import { TaskCalendar } from '@/features/tasks/components/TaskCalendar';
import { TaskList } from '@/features/tasks/components/TaskList';
import { TaskCreateDrawer } from '@/features/tasks/components/TaskCreateDrawer';
import { TaskDetailDrawer } from '@/features/tasks/components/TaskDetailDrawer';

type PageProps = {
    tasks: TaskRow[];
    users: UserOption[];
    activeFilter: string;
    activeCategory: string;
};

export default function TasksIndex({ tasks, users, activeFilter, activeCategory }: PageProps) {
    const [query, setQuery] = useState('');
    const [filter, setFilter] = useState(activeFilter);
    const [category, setCategory] = useState(activeCategory);
    const [viewMode, setViewMode] = useState<'board' | 'list' | 'calendar'>('board');
    const [selectedTask, setSelectedTask] = useState<TaskRow | null>(null);
    const [createOpen, setCreateOpen] = useState(false);
    const [form, setForm] = useState({
        title: '', description: '', status: 'not_started' as string,
        priority: 'medium' as string, category: 'general_admin' as string,
        due_date: '', assignee_ids: [] as number[], watcher_ids: [] as number[],
    });
    const [formErrors, setFormErrors] = useState<FormErrors>({});

    const filtered = useMemo(() => {
        let items = tasks;
        if (query.trim()) {
            const q = query.toLowerCase();
            items = items.filter((t) => t.title.toLowerCase().includes(q) || t.taskNumber.toLowerCase().includes(q));
        }
        if (category !== 'all') {
            items = items.filter((t) => t.category === category);
        }
        return items;
    }, [tasks, query, category]);

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

    const handleCreate = useCallback((event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setFormErrors({});
        router.post('/tasks', form, {
            preserveScroll: true,
            onSuccess: () => {
                setCreateOpen(false);
                setForm({ title: '', description: '', status: 'not_started', priority: 'medium', category: 'general_admin', due_date: '', assignee_ids: [], watcher_ids: [] });
                toast.success('Task created.');
            },
            onError: (err) => {
                setFormErrors(err);
                toast.error('Please check form errors.');
            },
        });
    }, [form]);

    const updateStatus = useCallback((task: TaskRow, status: string) => {
        router.put(`/tasks/${task.id}/status`, { status }, {
            preserveScroll: true,
            onSuccess: () => toast.success('Status updated.'),
        });
    }, []);

    return (
        <>
            <Head title="Tasks" />
            <AppShell eyebrowKey="nav.tasks" titleKey="nav.tasks" subtitleKey="Tasks and workflow management"
                action={
                    <AppButton variant="primary" onPress={() => { setFormErrors({}); setCreateOpen(true); }}>
                        <Plus size={16} /> Create task
                    </AppButton>
                }
            >
                <div className="crm-page">
                    <TaskFilters
                        filter={filter}
                        category={category}
                        query={query}
                        viewMode={viewMode}
                        onFilterChange={(f) => { setFilter(f); router.visit(`/tasks?filter=${f}&category=${category}`, { preserveState: true }); }}
                        onCategoryChange={(c) => { setCategory(c); router.visit(`/tasks?filter=${filter}&category=${c}`, { preserveState: true }); }}
                        onQueryChange={setQuery}
                        onViewModeChange={setViewMode}
                    />

                    {viewMode === 'board' ? (
                        <TaskBoard columns={columns} onTaskClick={setSelectedTask} />
                    ) : viewMode === 'calendar' ? (
                        <TaskCalendar tasks={filtered} onTaskClick={setSelectedTask} />
                    ) : (
                        <TaskList tasks={filtered} columns={columns} onTaskClick={setSelectedTask} onStatusChange={updateStatus} />
                    )}

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
                        onChecklistToggle={(taskId, itemId) => {
                            router.put(`/tasks/${taskId}/checklist/${itemId}/toggle`, {}, { preserveScroll: true });
                        }}
                    />
                </div>
            </AppShell>
        </>
    );
}
