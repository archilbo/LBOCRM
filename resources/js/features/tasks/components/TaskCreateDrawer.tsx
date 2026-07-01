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
import type { TaskCategory, TaskImpact, TaskPriority, TaskType, UserOption } from '@/features/tasks/types';
import { CATEGORY_LABELS, IMPACT_LABELS, PRIORITY_LABELS, STATUS_LABELS, TYPE_LABELS } from '@/features/tasks/types';

type TaskForm = {
    title: string; description: string; status: string;
    priority: string; impact: string; type: string; category: string;
    start_date: string; due_date: string; estimated_minutes: string; blocked_reason: string;
    assignee_ids: number[]; watcher_ids: number[];
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
            title="Create task" description="Fill in the details below to create a new task."
            footer={<><AppButton variant="secondary" onPress={() => onOpenChange(false)}>Cancel</AppButton><AppButton variant="primary" type="submit" form="create-task-form">Create task</AppButton></>}>
            <form id="create-task-form" className="space-y-5" onSubmit={onSubmit}>
                <AppFormErrorSummary errors={formErrors} />

                {/* Main */}
                <div>
                    <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--crm-muted)]">Main</p>
                    <div className="space-y-4">
                        <AppTextField label="Title" placeholder="Enter task title" value={form.title} onChange={(v) => onFormChange({ ...form, title: v })} error={firstError(formErrors, 'title')} />
                        <AppTextarea label="Description" placeholder="Describe the task..." value={form.description} onChange={(v) => onFormChange({ ...form, description: v })} />
                        <div className="grid grid-cols-2 gap-4">
                            <AppSelect label="Type" placeholder="Select" selectedKey={form.type} onSelectionChange={(v) => onFormChange({ ...form, type: v ? String(v) : 'general' })}
                                options={(['general', 'missing_document', 'client_follow_up', 'contract', 'authorization', 'finance', 'archive', 'review', 'internal_admin'] as TaskType[]).map((k) => ({ id: k, label: TYPE_LABELS[k] }))} />
                            <AppSelect label="Category" placeholder="Select" selectedKey={form.category} onSelectionChange={(v) => onFormChange({ ...form, category: v ? String(v) : 'general_admin' })}
                                options={(['documents', 'client_follow_up', 'contract', 'authorization', 'finance', 'archive', 'general_admin'] as TaskCategory[]).map((k) => ({ id: k, label: CATEGORY_LABELS[k] }))} />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <AppSelect label="Status" placeholder="Select" selectedKey={form.status} onSelectionChange={(v) => onFormChange({ ...form, status: v ? String(v) : 'not_started' })}
                                options={['not_started', 'in_progress', 'waiting_client', 'waiting_admin', 'blocked', 'in_review'].map((k) => ({ id: k, label: STATUS_LABELS[k as keyof typeof STATUS_LABELS] }))} />
                            <AppSelect label="Priority" placeholder="Select" selectedKey={form.priority} onSelectionChange={(v) => onFormChange({ ...form, priority: v ? String(v) : 'medium' })}
                                options={(['low', 'medium', 'high', 'urgent'] as TaskPriority[]).map((k) => ({ id: k, label: PRIORITY_LABELS[k] }))} />
                            <AppSelect label="Impact" placeholder="Select" selectedKey={form.impact} onSelectionChange={(v) => onFormChange({ ...form, impact: v ? String(v) : 'normal' })}
                                options={(['low', 'normal', 'high', 'critical'] as TaskImpact[]).map((k) => ({ id: k, label: IMPACT_LABELS[k] }))} />
                        </div>
                    </div>
                </div>

                {/* People */}
                <div>
                    <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--crm-muted)]">People</p>
                    <div className="space-y-3">
                        <div>
                            <AppSelect label="Assignees" placeholder="Add assignee..." selectedKey={null} onSelectionChange={(v) => {
                                if (v && !form.assignee_ids.includes(Number(v))) onFormChange({ ...form, assignee_ids: [...form.assignee_ids, Number(v)] });
                            }} options={users.map((u) => ({ id: String(u.id), label: u.name }))} />
                            {form.assignee_ids.length > 0 ? (
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                    {form.assignee_ids.map((id) => {
                                        const u = users.find((x) => x.id === id);
                                        return u ? (
                                            <span key={id} className="inline-flex items-center gap-1 rounded-full border border-[var(--crm-border)] bg-[var(--crm-elevated)] px-2 py-0.5 text-xs">
                                                <span className="flex size-4 items-center justify-center rounded-full bg-[var(--crm-gold)] text-[7px] font-bold text-black">{u.name.charAt(0)}</span>
                                                {u.name}
                                                <button type="button" onClick={() => onFormChange({ ...form, assignee_ids: form.assignee_ids.filter((x) => x !== id) })} className="text-[var(--crm-muted)] hover:text-red-400"><X size={12} /></button>
                                            </span>
                                        ) : null;
                                    })}
                                </div>
                            ) : null}
                        </div>
                        <div>
                            <AppSelect label="Watchers" placeholder="Add watcher..." selectedKey={null} onSelectionChange={(v) => {
                                if (v && !form.watcher_ids.includes(Number(v))) onFormChange({ ...form, watcher_ids: [...form.watcher_ids, Number(v)] });
                            }} options={users.filter((u) => !form.assignee_ids.includes(u.id)).map((u) => ({ id: String(u.id), label: u.name }))} />
                            {form.watcher_ids.length > 0 ? (
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                    {form.watcher_ids.map((id) => {
                                        const u = users.find((x) => x.id === id);
                                        return u ? (
                                            <span key={id} className="inline-flex items-center gap-1 rounded-full border border-[var(--crm-border)] bg-[var(--crm-elevated)] px-2 py-0.5 text-xs text-[var(--crm-text-muted)]">
                                                {u.name}
                                                <button type="button" onClick={() => onFormChange({ ...form, watcher_ids: form.watcher_ids.filter((x) => x !== id) })} className="text-[var(--crm-muted)] hover:text-red-400"><X size={12} /></button>
                                            </span>
                                        ) : null;
                                    })}
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>

                {/* Dates */}
                <div>
                    <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--crm-muted)]">Dates</p>
                    <div className="grid grid-cols-2 gap-4">
                        <AppTextField label="Start date" type="date" value={form.start_date} onChange={(v) => onFormChange({ ...form, start_date: v })} />
                        <AppTextField label="Due date" type="date" value={form.due_date} onChange={(v) => onFormChange({ ...form, due_date: v })} />
                    </div>
                </div>

                {/* More */}
                <div>
                    <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--crm-muted)]">More</p>
                    <div className="space-y-4">
                        <AppTextField label="Estimated minutes" type="number" value={form.estimated_minutes} onChange={(v) => onFormChange({ ...form, estimated_minutes: v })} placeholder="e.g. 120" />
                        {form.status === 'blocked' ? (
                            <AppTextarea label="Blocked reason" placeholder="Why is this task blocked?" value={form.blocked_reason} onChange={(v) => onFormChange({ ...form, blocked_reason: v })} />
                        ) : null}
                    </div>
                </div>
            </form>
        </AppDrawer>
    );
}
