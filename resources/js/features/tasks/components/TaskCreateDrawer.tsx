import { IconX } from '@tabler/icons-react';

import { FormEvent } from 'react';
import { Button, Chip, Input, TextArea } from '@heroui/react';
import { AppDrawer } from '@/components/ui/AppDrawer';
import { AppButton } from '@/components/ui/AppButton';
import { AvatarPill } from '@/components/ui/AvatarPill';
import { DrawerField, DrawerSelect, DrawerSection, drawerStyles } from '@/components/drawers';
import { DateField } from '@/features/archives/components/DateField';
import { strToDate, dateToStr } from '@/lib/dateUtils';
import { useTranslation } from '@/lib/i18n';
import type { FormErrors } from '@/lib/formErrors';
import { firstError } from '@/lib/formErrors';
import type { TaskCategory, TaskImpact, TaskPriority, TaskType, UserOption } from '@/features/tasks/types';

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
    const { t } = useTranslation();
    return (
        <AppDrawer isOpen={isOpen} onOpenChange={onOpenChange}
            title={t('tasks.create.newTitle')} description={t('tasks.create.subtitle')}
            footer={<><AppButton variant="secondary" onPress={() => onOpenChange(false)}>{t('tasks.create.cancel')}</AppButton><AppButton variant="primary" type="submit" form="create-task-form">{t('tasks.create.create')}</AppButton></>}>
            <form id="create-task-form" className="space-y-5" onSubmit={onSubmit}>
                <DrawerSection title={t('tasks.create.sections.main')}>
                    <div className="flex flex-col gap-3">
                        <DrawerField label={t('tasks.create.fields.title')} error={firstError(formErrors, 'title')}>
                            <Input type="text" value={form.title} onChange={(e) => onFormChange({ ...form, title: e.target.value })}
                                placeholder={t('tasks.create.fields.titlePlaceholder')} className={drawerStyles.input} />
                        </DrawerField>
                        <DrawerField label={t('tasks.create.fields.description')}>
                            <TextArea value={form.description} onChange={(e) => onFormChange({ ...form, description: e.target.value })}
                                placeholder={t('tasks.create.fields.descriptionPlaceholder')} className={drawerStyles.textarea} />
                        </DrawerField>
                        <div className="grid grid-cols-2 gap-3">
                            <DrawerField label={t('tasks.create.fields.type')} error={firstError(formErrors, 'type')}>
                                <DrawerSelect value={form.type} onChange={(v) => onFormChange({ ...form, type: v })}
                                    options={(['general', 'missing_document', 'client_follow_up', 'contract', 'finance', 'archive', 'review', 'internal_admin'] as TaskType[]).map((k) => ({ id: k, label: t(`tasks.types.${k}`) }))}
                                    placeholder={t('tasks.create.fields.selectPlaceholder')} />
                            </DrawerField>
                            <DrawerField label={t('tasks.create.fields.category')} error={firstError(formErrors, 'category')}>
                                <DrawerSelect value={form.category} onChange={(v) => onFormChange({ ...form, category: v })}
                                    options={(['documents', 'client_follow_up', 'contract', 'finance', 'archive', 'general_admin'] as TaskCategory[]).map((k) => ({ id: k, label: t(`tasks.categories.${k}`) }))}
                                    placeholder={t('tasks.create.fields.selectPlaceholder')} />
                            </DrawerField>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            <DrawerField label={t('tasks.create.fields.status')} error={firstError(formErrors, 'status')}>
                                <DrawerSelect value={form.status} onChange={(v) => onFormChange({ ...form, status: v })}
                                    options={['not_started', 'in_progress', 'waiting_client', 'waiting_admin', 'blocked', 'in_review'].map((k) => ({ id: k, label: t(`tasks.statuses.${k}`) }))}
                                    placeholder={t('tasks.create.fields.selectPlaceholder')} />
                            </DrawerField>
                            <DrawerField label={t('tasks.create.fields.priority')} error={firstError(formErrors, 'priority')}>
                                <DrawerSelect value={form.priority} onChange={(v) => onFormChange({ ...form, priority: v })}
                                    options={(['low', 'medium', 'high', 'urgent'] as TaskPriority[]).map((k) => ({ id: k, label: t(`tasks.priorities.${k}`) }))}
                                    placeholder={t('tasks.create.fields.selectPlaceholder')} />
                            </DrawerField>
                            <DrawerField label={t('tasks.create.fields.impact')} error={firstError(formErrors, 'impact')}>
                                <DrawerSelect value={form.impact} onChange={(v) => onFormChange({ ...form, impact: v })}
                                    options={(['low', 'normal', 'high', 'critical'] as TaskImpact[]).map((k) => ({ id: k, label: t(`tasks.impacts.${k}`) }))}
                                    placeholder={t('tasks.create.fields.selectPlaceholder')} />
                            </DrawerField>
                        </div>
                    </div>
                </DrawerSection>

                <DrawerSection title={t('tasks.create.sections.people')}>
                    <div className="flex flex-col gap-3">
                        <div>
                            <DrawerField label={t('tasks.create.fields.assignees')}>
                                <DrawerSelect value="" onChange={(v) => {
                                    if (v && !form.assignee_ids.includes(Number(v))) onFormChange({ ...form, assignee_ids: [...form.assignee_ids, Number(v)] });
                                }} options={users.map((u) => ({ id: String(u.id), label: u.name }))}
                                    placeholder={t('tasks.create.fields.addAssignee')} />
                            </DrawerField>
                            {form.assignee_ids.length > 0 ? (
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                    {form.assignee_ids.map((id) => {
                                        const u = users.find((x) => x.id === id);
                                        return u ? (
                                            <Chip key={id} size="sm" className="h-7 rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-2 text-xs text-[var(--text)]">
                                                <AvatarPill name={u.name} size="sm" className="size-4 min-w-4 text-[7px]" />
                                                {u.name}
                                                <Button isIconOnly size="sm" aria-label={t('tasks.create.fields.removeUser', { name: u.name })} onPress={() => onFormChange({ ...form, assignee_ids: form.assignee_ids.filter((x) => x !== id) })} className="size-4 min-w-4 p-0 text-[var(--text-muted)] hover:text-[var(--danger)]">
                                                    <IconX size={12} />
                                                </Button>
                                            </Chip>
                                        ) : null;
                                    })}
                                </div>
                            ) : null}
                        </div>
                        <div>
                            <DrawerField label={t('tasks.create.fields.watchers')}>
                                <DrawerSelect value="" onChange={(v) => {
                                    if (v && !form.watcher_ids.includes(Number(v))) onFormChange({ ...form, watcher_ids: [...form.watcher_ids, Number(v)] });
                                }} options={users.filter((u) => !form.assignee_ids.includes(u.id)).map((u) => ({ id: String(u.id), label: u.name }))}
                                    placeholder={t('tasks.create.fields.addWatcher')} />
                            </DrawerField>
                            {form.watcher_ids.length > 0 ? (
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                    {form.watcher_ids.map((id) => {
                                        const u = users.find((x) => x.id === id);
                                        return u ? (
                                            <Chip key={id} size="sm" className="h-7 rounded-full border border-[var(--border)] px-2 text-xs text-[var(--text-muted)]">
                                                {u.name}
                                                <Button isIconOnly size="sm" aria-label={t('tasks.create.fields.removeUser', { name: u.name })} onPress={() => onFormChange({ ...form, watcher_ids: form.watcher_ids.filter((x) => x !== id) })} className="size-4 min-w-4 p-0 text-[var(--text-muted)] hover:text-[var(--danger)]">
                                                    <IconX size={12} />
                                                </Button>
                                            </Chip>
                                        ) : null;
                                    })}
                                </div>
                            ) : null}
                        </div>
                    </div>
                </DrawerSection>

                <DrawerSection title={t('tasks.create.sections.dates')}>
                    <div className="grid grid-cols-2 gap-3">
                        <DateField label={t('tasks.create.fields.startDate')} value={strToDate(form.start_date)} onChange={(d) => onFormChange({ ...form, start_date: dateToStr(d) })} />
                        <DateField label={t('tasks.create.fields.dueDate')} value={strToDate(form.due_date)} onChange={(d) => onFormChange({ ...form, due_date: dateToStr(d) })} />
                    </div>
                </DrawerSection>

                <DrawerSection title={t('tasks.create.sections.more')}>
                    <div className="flex flex-col gap-3">
                        <DrawerField label={t('tasks.create.fields.estimatedMinutes')}>
                            <Input type="number" value={form.estimated_minutes} onChange={(e) => onFormChange({ ...form, estimated_minutes: e.target.value })}
                                placeholder={t('tasks.create.fields.estimatedPlaceholder')} className={drawerStyles.input} />
                        </DrawerField>
                        {form.status === 'blocked' ? (
                            <DrawerField label={t('tasks.create.fields.blockedReason')}>
                                <TextArea value={form.blocked_reason} onChange={(e) => onFormChange({ ...form, blocked_reason: e.target.value })}
                                    placeholder={t('tasks.create.fields.blockedReasonPlaceholder')} className={drawerStyles.textarea} />
                            </DrawerField>
                        ) : null}
                    </div>
                </DrawerSection>
            </form>
        </AppDrawer>
    );
}
