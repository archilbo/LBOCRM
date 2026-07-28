import { FormEvent, useEffect, useMemo, useState } from 'react';
import { router } from '@inertiajs/react';
import { X, Info } from 'lucide-react';
import { CalendarDate, CalendarDateTime } from '@internationalized/date';
import { Calendar, CalendarYearPicker, Checkbox, DatePicker, Input, TextArea } from '@heroui/react';
import { AppDrawer } from '@/components/ui/AppDrawer';
import { AppButton } from '@/components/ui/AppButton';
import { AppFormErrorSummary } from '@/components/ui/AppFormErrorSummary';
import { DrawerSection, DrawerField, DrawerSelect, drawerStyles } from '@/components/drawers';
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

function toCalendarDateTime(str: string): CalendarDateTime | null {
    if (!str) return null;
    const [datePart, timePart] = str.split('T');
    const [y, m, d] = datePart.split('-').map(Number);
    const [hh, mm] = timePart ? timePart.split(':').map(Number) : [0, 0];
    return new CalendarDateTime(y, m, d, hh || 0, mm || 0);
}

function fromCalendarDateTime(v: CalendarDateTime | null): string {
    if (!v) return '';
    return `${v.year}-${String(v.month).padStart(2, '0')}-${String(v.day).padStart(2, '0')}T${String(v.hour).padStart(2, '0')}:${String(v.minute).padStart(2, '0')}`;
}

function formatDateTime(str: string): string {
    if (!str) return '';
    const [datePart, timePart] = str.split('T');
    const [y, m, d] = datePart.split('-').map(Number);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${d} ${months[m - 1]} ${y} ${timePart || '00:00'}`;
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

                <DrawerSection title="Details">
                    <div className={drawerStyles.sectionGrid}>
                        <div className="grid grid-cols-2 gap-2">
                            <DrawerField label="Type" error={firstError(formErrors, 'type')}>
                                <DrawerSelect
                                    value={currentForm.type}
                                    onChange={(v) => setForm((p) => ({ ...p, type: (v as CalendarEventType) || 'task', color: (v as CalendarEventType) || 'task' }))}
                                    options={Object.entries(EVENT_TYPE_LABELS).map(([id, label]) => ({ id: id as CalendarEventType, label }))}
                                    placeholder="Select"
                                />
                            </DrawerField>
                            <DrawerField label="Priority" error={firstError(formErrors, 'priority')}>
                                <DrawerSelect
                                    value={currentForm.priority}
                                    onChange={(v) => setForm((p) => ({ ...p, priority: (v as CalendarEventPriority) || 'medium' }))}
                                    options={Object.entries(EVENT_PRIORITY_LABELS).map(([id, label]) => ({ id: id as CalendarEventPriority, label }))}
                                    placeholder="Select"
                                />
                            </DrawerField>
                        </div>

                        {typeHint && (
                            <div className="flex items-start gap-2 rounded-lg border border-[var(--crm-gold)]/20 bg-[var(--crm-gold)]/8 px-3 py-2">
                                <Info size={13} className="mt-0.5 shrink-0 text-[var(--crm-gold)]" />
                                <p className="text-[11px] text-[var(--crm-text-muted)]">{typeHint}</p>
                            </div>
                        )}

                        <DrawerField label="Title" error={firstError(formErrors, 'title')}>
                            <Input type="text" value={currentForm.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                                placeholder="Event title" className={drawerStyles.input}
                                aria-invalid={!!firstError(formErrors, 'title')} />
                        </DrawerField>

                        <DrawerField label="Description" error={firstError(formErrors, 'description')}>
                            <TextArea value={currentForm.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                                placeholder="Event description" className={drawerStyles.textarea}
                                aria-invalid={!!firstError(formErrors, 'description')} />
                        </DrawerField>
                    </div>
                </DrawerSection>

                <DrawerSection title="Schedule">
                    <div className={drawerStyles.sectionGrid}>
                        <div className="grid grid-cols-2 gap-2">
                            <DrawerField label="Start" error={firstError(formErrors, 'starts_at')}>
                                <DatePicker
                                    value={toCalendarDateTime(currentForm.startsAt)}
                                    onChange={(v) => setForm((p) => ({ ...p, startsAt: fromCalendarDateTime(v as CalendarDateTime | null) }))}
                                    granularity="minute"
                                >
                                    <DatePicker.Trigger className={drawerStyles.trigger}>
                                        <span className="flex-1 text-left">{formatDateTime(currentForm.startsAt) || 'Select start'}</span>
                                        <DatePicker.TriggerIndicator />
                                    </DatePicker.Trigger>
                                    <DatePicker.Popover isNonModal className={drawerStyles.popover}>
                                        <Calendar.Root>
                                            <Calendar.Header>
                                                <CalendarYearPicker.Trigger>
                                                    <CalendarYearPicker.TriggerHeading />
                                                    <CalendarYearPicker.TriggerIndicator />
                                                </CalendarYearPicker.Trigger>
                                                <Calendar.NavButton slot="previous" />
                                                <Calendar.NavButton slot="next" />
                                            </Calendar.Header>
                                            <Calendar.Grid>
                                                <Calendar.GridHeader>
                                                    {(day: string) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
                                                </Calendar.GridHeader>
                                                <Calendar.GridBody>
                                                    {(date: CalendarDate) => <Calendar.Cell date={date}>{({ formattedDate }: { formattedDate: string }) => formattedDate}</Calendar.Cell>}
                                                </Calendar.GridBody>
                                            </Calendar.Grid>
                                        </Calendar.Root>
                                    </DatePicker.Popover>
                                </DatePicker>
                            </DrawerField>
                            <DrawerField label="End" error={firstError(formErrors, 'ends_at')}>
                                <DatePicker
                                    value={toCalendarDateTime(currentForm.endsAt)}
                                    onChange={(v) => setForm((p) => ({ ...p, endsAt: fromCalendarDateTime(v as CalendarDateTime | null) }))}
                                    granularity="minute"
                                >
                                    <DatePicker.Trigger className={drawerStyles.trigger}>
                                        <span className="flex-1 text-left">{formatDateTime(currentForm.endsAt) || 'Select end'}</span>
                                        <DatePicker.TriggerIndicator />
                                    </DatePicker.Trigger>
                                    <DatePicker.Popover isNonModal className={drawerStyles.popover}>
                                        <Calendar.Root>
                                            <Calendar.Header>
                                                <CalendarYearPicker.Trigger>
                                                    <CalendarYearPicker.TriggerHeading />
                                                    <CalendarYearPicker.TriggerIndicator />
                                                </CalendarYearPicker.Trigger>
                                                <Calendar.NavButton slot="previous" />
                                                <Calendar.NavButton slot="next" />
                                            </Calendar.Header>
                                            <Calendar.Grid>
                                                <Calendar.GridHeader>
                                                    {(day: string) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
                                                </Calendar.GridHeader>
                                                <Calendar.GridBody>
                                                    {(date: CalendarDate) => <Calendar.Cell date={date}>{({ formattedDate }: { formattedDate: string }) => formattedDate}</Calendar.Cell>}
                                                </Calendar.GridBody>
                                            </Calendar.Grid>
                                        </Calendar.Root>
                                    </DatePicker.Popover>
                                </DatePicker>
                            </DrawerField>
                        </div>

                        <DrawerField label="">
                            <Checkbox isSelected={currentForm.allDay} onChange={(v) => setForm((p) => ({ ...p, allDay: v }))}>
                                <Checkbox.Content>
                                    <Checkbox.Control>
                                        <Checkbox.Indicator />
                                    </Checkbox.Control>
                                    All day
                                </Checkbox.Content>
                            </Checkbox>
                        </DrawerField>
                    </div>
                </DrawerSection>

                <DrawerSection title="Status & Visibility">
                    <div className={drawerStyles.sectionGrid}>
                        <div className="grid grid-cols-2 gap-2">
                            <DrawerField label="Status" error={firstError(formErrors, 'status')}>
                                <DrawerSelect
                                    value={currentForm.status}
                                    onChange={(v) => setForm((p) => ({ ...p, status: (v as CalendarEventStatus) || 'scheduled' }))}
                                    options={Object.entries(EVENT_STATUS_LABELS).map(([id, label]) => ({ id: id as CalendarEventStatus, label }))}
                                    placeholder="Select"
                                />
                            </DrawerField>
                            <DrawerField label="Visibility" error={firstError(formErrors, 'visibility')}>
                                <DrawerSelect
                                    value={currentForm.visibility}
                                    onChange={(v) => setForm((p) => ({ ...p, visibility: (v as CalendarVisibility) || 'assigned_users' }))}
                                    options={Object.entries(VISIBILITY_LABELS).map(([id, label]) => ({ id: id as CalendarVisibility, label }))}
                                    placeholder="Select"
                                />
                            </DrawerField>
                        </div>
                    </div>
                </DrawerSection>

                <DrawerSection title="Appearance">
                    <div className={drawerStyles.sectionGrid}>
                        <DrawerField label="Color">
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
                        </DrawerField>
                    </div>
                </DrawerSection>

                <DrawerSection title="Assignees">
                    <div className={drawerStyles.sectionGrid}>
                        <DrawerField label="Add user">
                            <DrawerSelect
                                value=""
                                onChange={(v) => {
                                    if (v && !currentForm.participantIds.includes(Number(v)))
                                        setForm((p) => ({ ...p, participantIds: [...p.participantIds, Number(v)] }));
                                }}
                                options={users.filter((u) => !currentForm.participantIds.includes(u.id)).map((u) => ({ id: String(u.id), label: u.name }))}
                                placeholder="Add user..."
                            />
                        </DrawerField>
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
                </DrawerSection>

                <DrawerSection title="Reminder">
                    <CalendarReminderForm
                        value={currentForm.reminderOffset}
                        onChange={(v) => setForm((p) => ({ ...p, reminderOffset: v }))}
                    />
                </DrawerSection>
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
        archiveRecordId: null,
        participantIds: [] as number[],
        reminderOffset: null as number | null,
    };
}
