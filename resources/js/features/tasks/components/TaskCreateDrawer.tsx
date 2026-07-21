import { X } from 'lucide-react';
import { FormEvent } from 'react';
import { Input, TextArea } from '@heroui/react';
import { AppDrawer } from '@/components/ui/AppDrawer';
import { AppButton } from '@/components/ui/AppButton';
import { DrawerField, DrawerSelect, DrawerSection, drawerStyles } from '@/components/drawers';
import { DateField } from '@/features/archives/components/DateField';
import { strToDate, dateToStr } from '@/lib/dateUtils';
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
            title="Nouvelle tâche" description="Remplissez les détails ci-dessous pour créer une nouvelle tâche."
            footer={<><AppButton variant="secondary" onPress={() => onOpenChange(false)}>Annuler</AppButton><AppButton variant="primary" type="submit" form="create-task-form">Créer la tâche</AppButton></>}>
            <form id="create-task-form" className="space-y-5" onSubmit={onSubmit}>
                <DrawerSection title="Informations générales">
                    <div className="flex flex-col gap-3">
                        <DrawerField label="Titre" error={firstError(formErrors, 'title')}>
                            <Input type="text" value={form.title} onChange={(e) => onFormChange({ ...form, title: e.target.value })}
                                placeholder="Saisir le titre de la tâche" className={drawerStyles.input} />
                        </DrawerField>
                        <DrawerField label="Description">
                            <TextArea value={form.description} onChange={(e) => onFormChange({ ...form, description: e.target.value })}
                                placeholder="Décrivez la tâche…" className={drawerStyles.textarea} />
                        </DrawerField>
                        <div className="grid grid-cols-2 gap-3">
                            <DrawerField label="Type" error={firstError(formErrors, 'type')}>
                                <DrawerSelect value={form.type} onChange={(v) => onFormChange({ ...form, type: v })}
                                    options={(['general', 'missing_document', 'client_follow_up', 'contract', 'authorization', 'finance', 'archive', 'review', 'internal_admin'] as TaskType[]).map((k) => ({ id: k, label: TYPE_LABELS[k] }))}
                                    placeholder="Sélectionner" />
                            </DrawerField>
                            <DrawerField label="Catégorie" error={firstError(formErrors, 'category')}>
                                <DrawerSelect value={form.category} onChange={(v) => onFormChange({ ...form, category: v })}
                                    options={(['documents', 'client_follow_up', 'contract', 'authorization', 'finance', 'archive', 'general_admin'] as TaskCategory[]).map((k) => ({ id: k, label: CATEGORY_LABELS[k] }))}
                                    placeholder="Sélectionner" />
                            </DrawerField>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            <DrawerField label="Statut" error={firstError(formErrors, 'status')}>
                                <DrawerSelect value={form.status} onChange={(v) => onFormChange({ ...form, status: v })}
                                    options={['not_started', 'in_progress', 'waiting_client', 'waiting_admin', 'blocked', 'in_review'].map((k) => ({ id: k, label: STATUS_LABELS[k as keyof typeof STATUS_LABELS] }))}
                                    placeholder="Sélectionner" />
                            </DrawerField>
                            <DrawerField label="Priorité" error={firstError(formErrors, 'priority')}>
                                <DrawerSelect value={form.priority} onChange={(v) => onFormChange({ ...form, priority: v })}
                                    options={(['low', 'medium', 'high', 'urgent'] as TaskPriority[]).map((k) => ({ id: k, label: PRIORITY_LABELS[k] }))}
                                    placeholder="Sélectionner" />
                            </DrawerField>
                            <DrawerField label="Impact" error={firstError(formErrors, 'impact')}>
                                <DrawerSelect value={form.impact} onChange={(v) => onFormChange({ ...form, impact: v })}
                                    options={(['low', 'normal', 'high', 'critical'] as TaskImpact[]).map((k) => ({ id: k, label: IMPACT_LABELS[k] }))}
                                    placeholder="Sélectionner" />
                            </DrawerField>
                        </div>
                    </div>
                </DrawerSection>

                <DrawerSection title="Participants">
                    <div className="flex flex-col gap-3">
                        <div>
                            <DrawerField label="Assignés">
                                <DrawerSelect value="" onChange={(v) => {
                                    if (v && !form.assignee_ids.includes(Number(v))) onFormChange({ ...form, assignee_ids: [...form.assignee_ids, Number(v)] });
                                }} options={users.map((u) => ({ id: String(u.id), label: u.name }))}
                                    placeholder="Ajouter un assigné…" />
                            </DrawerField>
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
                            <DrawerField label="Observateurs">
                                <DrawerSelect value="" onChange={(v) => {
                                    if (v && !form.watcher_ids.includes(Number(v))) onFormChange({ ...form, watcher_ids: [...form.watcher_ids, Number(v)] });
                                }} options={users.filter((u) => !form.assignee_ids.includes(u.id)).map((u) => ({ id: String(u.id), label: u.name }))}
                                    placeholder="Ajouter un observateur…" />
                            </DrawerField>
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
                </DrawerSection>

                <DrawerSection title="Dates">
                    <div className="grid grid-cols-2 gap-3">
                        <DateField label="Date de début" value={strToDate(form.start_date)} onChange={(d) => onFormChange({ ...form, start_date: dateToStr(d) })} />
                        <DateField label="Date d'échéance" value={strToDate(form.due_date)} onChange={(d) => onFormChange({ ...form, due_date: dateToStr(d) })} />
                    </div>
                </DrawerSection>

                <DrawerSection title="Plus">
                    <div className="flex flex-col gap-3">
                        <DrawerField label="Minutes estimées">
                            <Input type="number" value={form.estimated_minutes} onChange={(e) => onFormChange({ ...form, estimated_minutes: e.target.value })}
                                placeholder="ex: 120" className={drawerStyles.input} />
                        </DrawerField>
                        {form.status === 'blocked' ? (
                            <DrawerField label="Raison du blocage">
                                <TextArea value={form.blocked_reason} onChange={(e) => onFormChange({ ...form, blocked_reason: e.target.value })}
                                    placeholder="Pourquoi cette tâche est bloquée ?" className={drawerStyles.textarea} />
                            </DrawerField>
                        ) : null}
                    </div>
                </DrawerSection>
            </form>
        </AppDrawer>
    );
}
