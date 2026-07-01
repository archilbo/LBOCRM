import { FormEvent, useEffect, useMemo, useState } from 'react';
import { router } from '@inertiajs/react';
import { X, Info } from 'lucide-react';
import { AppDrawer } from '@/components/ui/AppDrawer';
import { AppButton } from '@/components/ui/AppButton';
import { AppFormErrorSummary } from '@/components/ui/AppFormErrorSummary';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppTextField } from '@/components/ui/AppTextField';
import { AppTextarea } from '@/components/ui/AppTextarea';
import type { FormErrors } from '@/lib/formErrors';
import { firstError } from '@/lib/formErrors';
import { CalendarReminderForm } from '@/features/calendar/components/CalendarReminderForm';
import type {
    CalendarEventRow, CalendarEventType, CalendarEventPriority, CalendarEventStatus,
    CalendarVisibility,
} from '@/features/calendar/types';
import {
    EVENT_TYPE_LABELS, EVENT_TYPE_CLASSES, EVENT_TYPE_COLORS, EVENT_PRIORITY_LABELS,
    EVENT_STATUS_LABELS, VISIBILITY_LABELS,
} from '@/features/calendar/types';

type UserOption = { id: number; name: string; email: string };

type Props = {
    isOpen: boolean;
    onOpenChange: (o: boolean) => void;
    users: UserOption[];
    editEvent?: CalendarEventRow | null;
    defaultStart?: string;
};

function initials(name: string): string {
    return name
        .split(' ')
        .map((p) => p[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

export function CalendarEventDrawer({ isOpen, onOpenChange, users, editEvent, defaultStart }: Props) {
    const isEdit = !!editEvent;
    const [form, setForm] = useState(() => initForm(editEvent, defaultStart));
    const [formErrors, setFormErrors] = useState<FormErrors>({});

    useEffect(() => {
        if (isOpen) {
            setForm(initForm(editEvent, defaultStart));
            setFormErrors({});
        }
    }, [isOpen, editEvent, defaultStart]);

    const currentForm = useMemo(() => {
        if (!isOpen) return form;
        return form;
    }, [form, isOpen]);

    function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setFormErrors({});

        if (isEdit) {
            router.put(`/calendar/events/${editEvent!.id}`, form, {
                preserveScroll: true,
                onSuccess: () => { onOpenChange(false); },
                onError: (err) => { setFormErrors(err); },
            });
        } else {
            router.post('/calendar/events', form, {
                preserveScroll: true,
                onSuccess: () => { onOpenChange(false); resetForm(); },
                onError: (err) => { setFormErrors(err); },
            });
        }
    }

    function resetForm() {
        setForm(initForm(undefined, undefined));
    }

    function handleClose(o: boolean) {
        if (!o) { resetForm(); setFormErrors({}); }
        onOpenChange(o);
    }

    const typeColor = EVENT_TYPE_COLORS[currentForm.type] || '#6b7280';
    const typeHint = currentForm.type === 'task'
        ? 'Assigned task will appear in Tasks.'
        : currentForm.type === 'note'
            ? 'Note events are visible on the calendar.'
            : currentForm.type === 'reminder'
                ? 'Reminder notifications will be sent at the scheduled time.'
                : null;

    return (
        <AppDrawer
            isOpen={isOpen}
            onOpenChange={handleClose}
            title={isEdit ? 'Edit event' : 'New event'}
            description={isEdit ? `#${editEvent?.eventNumber || ''}` : 'Create a new calendar event'}
            footer={
                <>
                    <AppButton variant="secondary" onPress={() => handleClose(false)}>Cancel</AppButton>
                    <AppButton variant="primary" type="submit" form="calendar-event-form">
                        {isEdit ? 'Update' : 'Create'}
                    </AppButton>
                </>
            }>
            <form id="calendar-event-form" className="space-y-5" onSubmit={handleSubmit}>
                <AppFormErrorSummary errors={formErrors} />

                {/* Type + Priority */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="mb-1 block text-xs font-semibold text-[var(--crm-text-muted)]">Type</label>
                        <div className="flex flex-wrap gap-1.5">
                            {(Object.entries(EVENT_TYPE_LABELS) as [CalendarEventType, string][]).map(([id, label]) => {
                                const c = EVENT_TYPE_COLORS[id];
                                const active = currentForm.type === id;
                                return (
                                    <button
                                        key={id}
                                        type="button"
                                        onClick={() => setForm((p) => ({ ...p, type: id, color: id }))}
                                        className={`rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition ${
                                            active
                                                ? 'text-white'
                                                : 'text-[var(--crm-text-muted)] hover:text-white'
                                        }`}
                                        style={{
                                            backgroundColor: active ? c + '28' : 'transparent',
                                            border: `1px solid ${active ? c + '50' : 'rgba(255,255,255,0.08)'}`,
                                        }}>
                                        {label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    <AppSelect
                        label="Priority"
                        placeholder="Select"
                        selectedKey={currentForm.priority}
                        onSelectionChange={(v) => setForm((p) => ({ ...p, priority: (v as CalendarEventPriority) || 'medium' }))}
                        options={Object.entries(EVENT_PRIORITY_LABELS).map(([id, label]) => ({ id, label }))}
                    />
                </div>

                {/* Type hint */}
                {typeHint && (
                    <div className="flex items-start gap-2 rounded-lg border border-[var(--crm-gold)]/20 bg-[var(--crm-gold)]/8 px-3 py-2">
                        <Info size={13} className="mt-0.5 shrink-0 text-[var(--crm-gold)]" />
                        <p className="text-[11px] text-[var(--crm-text-muted)]">{typeHint}</p>
                    </div>
                )}

                {/* Title */}
                <AppTextField
                    label="Title"
                    placeholder="Event title"
                    value={currentForm.title}
                    onChange={(v) => setForm((p) => ({ ...p, title: v }))}
                    error={firstError(formErrors, 'title')}
                />

                {/* Description */}
                <AppTextarea
                    label="Description"
                    placeholder="Event description"
                    value={currentForm.description}
                    onChange={(v) => setForm((p) => ({ ...p, description: v }))}
                />

                {/* Date/Time */}
                <div className="grid grid-cols-2 gap-4">
                    <AppTextField
                        label="Start"
                        type="datetime-local"
                        value={currentForm.startsAt}
                        onChange={(v) => setForm((p) => ({ ...p, startsAt: v }))}
                        error={firstError(formErrors, 'starts_at')}
                    />
                    <AppTextField
                        label="End"
                        type="datetime-local"
                        value={currentForm.endsAt}
                        onChange={(v) => setForm((p) => ({ ...p, endsAt: v }))}
                        error={firstError(formErrors, 'ends_at')}
                    />
                </div>

                {/* All day */}
                <label className="flex items-center gap-2 text-sm">
                    <input
                        type="checkbox"
                        checked={currentForm.allDay}
                        onChange={(e) => setForm((p) => ({ ...p, allDay: e.target.checked }))}
                        className="accent-[var(--crm-gold)]"
                    />
                    All day
                </label>

                {/* Status + Visibility */}
                <div className="grid grid-cols-2 gap-4">
                    <AppSelect
                        label="Status"
                        placeholder="Select"
                        selectedKey={currentForm.status}
                        onSelectionChange={(v) => setForm((p) => ({ ...p, status: (v as CalendarEventStatus) || 'scheduled' }))}
                        options={Object.entries(EVENT_STATUS_LABELS).map(([id, label]) => ({ id, label }))}
                    />
                    <AppSelect
                        label="Visibility"
                        placeholder="Select"
                        selectedKey={currentForm.visibility}
                        onSelectionChange={(v) => setForm((p) => ({ ...p, visibility: (v as CalendarVisibility) || 'assigned_users' }))}
                        options={Object.entries(VISIBILITY_LABELS).map(([id, label]) => ({ id, label }))}
                    />
                </div>

                {/* Color picker */}
                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[var(--crm-text-muted)]">Color</label>
                    <div className="flex flex-wrap gap-2">
                        {(Object.entries(EVENT_TYPE_CLASSES) as [CalendarEventType, string][]).map(([type, cls]) => {
                            const bgClass = cls.split(' ')[0];
                            const borderClass = cls.split(' ')[2];
                            return (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setForm((p) => ({ ...p, color: type }))}
                                    className={`flex size-8 items-center justify-center rounded-full border-2 transition ${
                                        currentForm.color === type ? 'ring-2 ring-[var(--crm-gold)] ring-offset-2 ring-offset-[var(--crm-elevated)]' : ''
                                    } ${borderClass || 'border-[var(--crm-border)]'} ${bgClass || 'bg-zinc-500/20'}`}
                                    title={EVENT_TYPE_LABELS[type]}>
                                    <span className="text-[8px] font-bold opacity-60">{EVENT_TYPE_LABELS[type].charAt(0)}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Assignees */}
                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[var(--crm-text-muted)]">Assignees</label>
                    <AppSelect
                        label=""
                        placeholder="Add user..."
                        selectedKey={null}
                        onSelectionChange={(v) => {
                            if (v && !currentForm.participantIds.includes(Number(v)))
                                setForm((p) => ({ ...p, participantIds: [...p.participantIds, Number(v)] }));
                        }}
                        options={users.filter((u) => !currentForm.participantIds.includes(u.id)).map((u) => ({ id: String(u.id), label: u.name }))}
                    />
                    {currentForm.participantIds.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                            {currentForm.participantIds.map((id) => {
                                const u = users.find((x) => x.id === id);
                                return u ? (
                                    <span
                                        key={id}
                                        className="inline-flex items-center gap-1.5 rounded-full border border-[var(--crm-border)] bg-[var(--crm-elevated)] px-1.5 py-0.5 text-xs">
                                        <span className="flex size-5 items-center justify-center rounded-full bg-[var(--crm-gold-soft)] text-[9px] font-bold text-[var(--crm-gold)]">
                                            {initials(u.name)}
                                        </span>
                                        {u.name}
                                        <button
                                            type="button"
                                            onClick={() => setForm((p) => ({ ...p, participantIds: p.participantIds.filter((x) => x !== id) }))}
                                            className="text-[var(--crm-muted)] hover:text-red-400">
                                            <X size={12} />
                                        </button>
                                    </span>
                                ) : null;
                            })}
                        </div>
                    ) : null}
                </div>

                {/* Reminder */}
                <CalendarReminderForm
                    value={currentForm.reminderOffset}
                    onChange={(v) => setForm((p) => ({ ...p, reminderOffset: v }))}
                />
            </form>
        </AppDrawer>
    );
}

function normalizeList<T>(val: unknown): T[] {
    if (Array.isArray(val)) return val;
    if (val && typeof val === 'object' && 'data' in val && Array.isArray((val as { data: T[] }).data)) return (val as { data: T[] }).data;
    return [];
}

function initForm(edit?: CalendarEventRow | null, defaultStart?: string) {
    if (edit) {
        const participants = normalizeList<{ userId: number }>(edit.participants);
        const reminders = normalizeList<{ offsetMinutes: number | null }>(edit.reminders);
        return {
            type: edit.type,
            title: edit.title,
            description: edit.description || '',
            status: edit.status,
            priority: edit.priority,
            color: edit.color || edit.type,
            startsAt: edit.startsAt?.slice(0, 16) || '',
            endsAt: edit.endsAt?.slice(0, 16) || '',
            allDay: edit.allDay,
            timezone: edit.timezone,
            visibility: edit.visibility,
            ownerId: (typeof edit.owner === 'object' && edit.owner && 'id' in edit.owner) ? (edit.owner as { id: number }).id : null,
            clientId: edit.clientId,
            dossierId: edit.dossierId,
            dossierDocumentId: edit.dossierDocumentId,
            financeDocumentId: edit.financeDocumentId,
            contractId: edit.contractId,
            authorizationId: edit.authorizationId,
            archiveRecordId: edit.archiveRecordId,
            participantIds: participants.map((p) => p.userId),
            reminderOffset: reminders[0]?.offsetMinutes ?? null,
        };
    }

    return {
        type: 'task' as CalendarEventType,
        title: '',
        description: '',
        status: 'scheduled' as CalendarEventStatus,
        priority: 'medium' as CalendarEventPriority,
        color: 'task',
        startsAt: defaultStart || new Date().toISOString().slice(0, 16),
        endsAt: '',
        allDay: false,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        visibility: 'assigned_users' as CalendarVisibility,
        ownerId: null,
        clientId: null,
        dossierId: null,
        dossierDocumentId: null,
        financeDocumentId: null,
        contractId: null,
        authorizationId: null,
        archiveRecordId: null,
        participantIds: [] as number[],
        reminderOffset: null as number | null,
    };
}
