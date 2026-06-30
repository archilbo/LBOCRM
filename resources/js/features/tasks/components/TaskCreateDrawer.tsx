import { X } from 'lucide-react';
import { FormEvent } from 'react';
import { AppDrawer } from '@/components/ui/AppDrawer';
import { AppButton } from '@/components/ui/AppButton';
import { AppFormErrorSummary } from '@/components/ui/AppFormErrorSummary';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppTextField } from '@/components/ui/AppTextField';
import { AppTextarea } from '@/components/ui/AppTextarea';
import type { FormErrors } from '@/lib/formErrors';
import { firstError } from '@/lib/formErrors';
import type { TaskCategory, TaskPriority, UserOption } from '@/features/tasks/types';
import { CATEGORY_LABELS, PRIORITY_LABELS } from '@/features/tasks/types';

type TaskForm = {
    title: string; description: string; status: string;
    priority: string; category: string;
    due_date: string; assignee_ids: number[]; watcher_ids: number[];
};

type Props = {
    isOpen: boolean;
    users: UserOption[];
    form: TaskForm;
    formErrors: FormErrors;
    onOpenChange: (o: boolean) => void;
    onFormChange: (f: TaskForm) => void;
    onSubmit: (e: FormEvent<HTMLFormElement>) => void;
};

export function TaskCreateDrawer({ isOpen, users, form, formErrors, onOpenChange, onFormChange, onSubmit }: Props) {
    return (
        <AppDrawer isOpen={isOpen} onOpenChange={onOpenChange}
            title="Create task" description="Create a new task with assignees and context."
            footer={<><AppButton variant="secondary" onPress={() => onOpenChange(false)}>Cancel</AppButton><AppButton variant="primary" type="submit" form="create-task-form">Create</AppButton></>}>
            <form id="create-task-form" className="space-y-5" onSubmit={onSubmit}>
                <AppFormErrorSummary errors={formErrors} />
                <AppTextField label="Title" placeholder="Task title" value={form.title} onChange={(v) => onFormChange({ ...form, title: v })} error={firstError(formErrors, 'title')} />
                <AppTextarea label="Description" placeholder="Task description" value={form.description} onChange={(v) => onFormChange({ ...form, description: v })} />
                <div className="grid grid-cols-2 gap-4">
                    <AppSelect label="Priority" placeholder="Select" selectedKey={form.priority} onSelectionChange={(v) => onFormChange({ ...form, priority: v ? String(v) : 'medium' })}
                        options={['low', 'medium', 'high', 'urgent'].map((k) => ({ id: k, label: PRIORITY_LABELS[k as TaskPriority] }))} />
                    <AppSelect label="Category" placeholder="Select" selectedKey={form.category} onSelectionChange={(v) => onFormChange({ ...form, category: v ? String(v) : 'general_admin' })}
                        options={['documents', 'client_follow_up', 'contract', 'authorization', 'finance', 'archive', 'general_admin'].map((k) => ({ id: k, label: CATEGORY_LABELS[k as TaskCategory] }))} />
                </div>
                <AppTextField label="Due date" type="date" value={form.due_date} onChange={(v) => onFormChange({ ...form, due_date: v })} />
                <AppSelect label="Assignee" placeholder="Select assignee" selectedKey={null} onSelectionChange={(v) => {
                    if (v && !form.assignee_ids.includes(Number(v))) onFormChange({ ...form, assignee_ids: [...form.assignee_ids, Number(v)] });
                }} options={users.map((u) => ({ id: String(u.id), label: u.name }))} />
                {form.assignee_ids.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                        {form.assignee_ids.map((id) => {
                            const u = users.find((x) => x.id === id);
                            return u ? <span key={id} className="inline-flex items-center gap-1 rounded-full border border-[var(--crm-border)] bg-[var(--crm-elevated)] px-2 py-0.5 text-xs">
                                {u.name}
                                <button type="button" onClick={() => onFormChange({ ...form, assignee_ids: form.assignee_ids.filter((x) => x !== id) })} className="text-[var(--crm-muted)] hover:text-red-400"><X size={12} /></button>
                            </span> : null;
                        })}
                    </div>
                ) : null}
            </form>
        </AppDrawer>
    );
}
