import { FormEvent, useState } from 'react';
import { router } from '@inertiajs/react';
import { IconTrash, IconX, IconInfoCircle } from '@tabler/icons-react';

import { CalendarDateTime, getLocalTimeZone, today, type DateValue } from '@internationalized/date';
import { Calendar, Card, Checkbox, DateField, DatePicker, Input, TextArea } from '@heroui/react';
import { AppDrawer } from '@/components/ui/AppDrawer';
import { AppButton } from '@/components/ui/AppButton';
import { AppFormErrorSummary } from '@/components/ui/AppFormErrorSummary';
import { AppConfirmDialog } from '@/components/ui/AppConfirmDialog';
import { DrawerSection, DrawerField, DrawerSelect, drawerStyles } from '@/components/drawers';
import type { FormErrors } from '@/lib/formErrors';
import { firstError } from '@/lib/formErrors';
import { CalendarReminderForm } from '@/features/calendar/components/CalendarReminderForm';
import { useTranslation } from '@/lib/i18n';
import type {
    CalendarEventRow, CalendarEventType, CalendarEventPriority, CalendarEventStatus,
    CalendarVisibility,
} from '@/features/calendar/types';
import {
    EVENT_TYPE_CLASSES,
    EVENT_TYPE_COLORS,
} from '@/features/calendar/types';

type UserOption = { id: number; name: string; email: string };

type Props = {
    isOpen: boolean;
    onOpenChange: (o: boolean) => void;
    users: UserOption[];
    editEvent?: CalendarEventRow | null;
    defaultStart?: string;
    defaultType?: CalendarEventType;
    canManageAdminVisibility: boolean;
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
    if (/[zZ]|[+-]\d{2}:\d{2}$/.test(str)) {
        const date = new Date(str);
        if (!Number.isNaN(date.getTime())) {
            return new CalendarDateTime(date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes());
        }
    }

    const norm = str.replace(' ', 'T');
    const [datePart, timePart] = norm.split('T');
    const [y, m, d] = datePart.split('-').map(Number);
    const [hh, mm] = timePart ? timePart.split(':').map(Number) : [0, 0];
    return new CalendarDateTime(y, m, d, hh || 0, mm || 0);
}

function localDateTime(value = new Date()): string {
    return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}T${String(value.getHours()).padStart(2, '0')}:${String(value.getMinutes()).padStart(2, '0')}`;
}

function colorFor(type: CalendarEventType): string {
    return EVENT_TYPE_COLORS[type];
}

function fromCalendarDateTime(v: DateValue | null): string {
    if (!v) return '';
    const hh = 'hour' in v ? String(v.hour).padStart(2, '0') : '00';
    const mm = 'minute' in v ? String(v.minute).padStart(2, '0') : '00';
    return `${v.year}-${String(v.month).padStart(2, '0')}-${String(v.day).padStart(2, '0')}T${hh}:${mm}`;
}

type CalendarEventForm = ReturnType<typeof initForm>;

function toBackendPayload(f: CalendarEventForm) {
    return {
        type: f.type,
        title: f.title,
        description: f.description,
        status: f.status,
        priority: f.priority,
        color: f.color,
        starts_at: f.startsAt,
        ends_at: f.endsAt,
        all_day: f.allDay,
        timezone: f.timezone,
        visibility: f.visibility,
        owner_id: f.ownerId,
        client_id: f.clientId,
        dossier_id: f.dossierId,
        dossier_document_id: f.dossierDocumentId,
        finance_document_id: f.financeDocumentId,
        contract_id: f.contractId,
        archive_record_id: f.archiveRecordId,
        participant_ids: f.participantIds,
        reminder_offset: f.reminderOffset,
    };
}

export function CalendarEventDrawer({ isOpen, onOpenChange, users, editEvent, defaultStart, defaultType = 'task', canManageAdminVisibility }: Props) {
    const { t } = useTranslation();
    const isEdit = !!editEvent;
    const currentDate = today(getLocalTimeZone());
    const earliestDate = isEdit ? undefined : new CalendarDateTime(currentDate.year, currentDate.month, currentDate.day, 0, 0);
    const [form, setForm] = useState(() => initForm(editEvent, defaultStart, defaultType));
    const [formErrors, setFormErrors] = useState<FormErrors>({});
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

    const currentForm = form;

    function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setFormErrors({});

        if (isEdit && !editEvent?.capabilities.update) return;

        const payload = toBackendPayload(form);

        if (isEdit) {
            router.put(`/calendar/events/${editEvent!.id}`, payload, {
                preserveScroll: true,
                onSuccess: () => { onOpenChange(false); },
                onError: (err) => { setFormErrors(err); },
            });
        } else {
            router.post('/calendar/events', payload, {
                preserveScroll: true,
                onSuccess: () => { onOpenChange(false); resetForm(); },
                onError: (err) => { setFormErrors(err); },
            });
        }
    }

    function resetForm() {
        setForm(initForm(undefined, undefined, defaultType));
    }

    function handleClose(o: boolean) {
        if (!o) { resetForm(); setFormErrors({}); setDeleteConfirmOpen(false); }
        onOpenChange(o);
    }

    function handleDelete() {
        if (!editEvent?.capabilities.delete) return;

        router.delete(`/calendar/events/${editEvent.id}`, {
            preserveScroll: true,
            onSuccess: () => handleClose(false),
        });
    }

    const typeHint = currentForm.type === 'task'
        ? t('calendar.typeHints.task')
        : currentForm.type === 'note'
            ? t('calendar.typeHints.note')
            : currentForm.type === 'reminder'
                ? t('calendar.typeHints.reminder')
                : null;

    return (
        <>
        <AppDrawer
            isOpen={isOpen}
            onOpenChange={handleClose}
            size="lg"
            title={isEdit ? t('calendar.drawer.editTitle') : t('calendar.newEvent')}
            description={isEdit ? `#${editEvent?.eventNumber || ''}` : t('calendar.drawer.createDescription')}
            footer={
                <>
                    {isEdit && editEvent?.capabilities.delete ? (
                        <AppButton variant="danger-soft" className="mr-auto" onPress={() => setDeleteConfirmOpen(true)}>
                            <IconTrash size={15} /> Supprimer
                        </AppButton>
                    ) : null}
                    <AppButton variant="secondary" onPress={() => handleClose(false)}>{t('calendar.drawer.cancel')}</AppButton>
                    <AppButton variant="primary" type="submit" form="calendar-event-form" isDisabled={isEdit && !editEvent?.capabilities.update}>
                        {isEdit ? t('calendar.drawer.update') : t('calendar.drawer.create')}
                    </AppButton>
                </>
            }>
            <form id="calendar-event-form" className="space-y-5" onSubmit={handleSubmit}>
                <AppFormErrorSummary errors={formErrors} />

                <DrawerSection title={t('calendar.drawer.details')}>
                    <div className={drawerStyles.sectionGrid}>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <DrawerField label={t('calendar.drawer.fields.type')} error={firstError(formErrors, 'type')}>
                                <DrawerSelect
                                    value={currentForm.type}
                                    onChange={(v) => {
                                        const type = (v as CalendarEventType) || 'task';
                                        setForm((p) => ({ ...p, type, color: colorFor(type) }));
                                    }}
                                    options={Object.keys(EVENT_TYPE_CLASSES).map((id) => ({ id: id as CalendarEventType, label: t(`calendar.eventTypes.${id}`) }))}
                                    placeholder={t('calendar.drawer.fields.type')}
                                />
                            </DrawerField>
                            <DrawerField label={t('calendar.drawer.fields.priority')} error={firstError(formErrors, 'priority')}>
                                <DrawerSelect
                                    value={currentForm.priority}
                                    onChange={(v) => setForm((p) => ({ ...p, priority: (v as CalendarEventPriority) || 'medium' }))}
                                    options={(['low', 'medium', 'high', 'urgent'] as CalendarEventPriority[]).map((id) => ({ id, label: t(`calendar.priorities.${id}`) }))}
                                    placeholder={t('calendar.drawer.fields.priority')}
                                />
                            </DrawerField>
                        </div>

                        {typeHint && (
                            <Card className="flex items-start gap-2 border border-[color-mix(in_srgb,var(--accent)_28%,var(--border))] bg-[color-mix(in_srgb,var(--accent)_8%,var(--surface))] px-3 py-2 shadow-none">
                                <IconInfoCircle size={13} className="mt-0.5 shrink-0 text-[var(--crm-gold)]" />
                                <p className="text-[10px] text-[var(--crm-text-muted)]">{typeHint}</p>
                            </Card>
                        )}

                        <DrawerField label={t('calendar.drawer.fields.title')} error={firstError(formErrors, 'title')}>
                            <Input type="text" value={currentForm.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                                placeholder={t('calendar.drawer.fields.titlePlaceholder')} className={drawerStyles.input}
                                aria-invalid={!!firstError(formErrors, 'title')} />
                        </DrawerField>

                        <DrawerField label={t('calendar.drawer.fields.description')} error={firstError(formErrors, 'description')}>
                            <TextArea value={currentForm.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                                placeholder={t('calendar.drawer.fields.descriptionPlaceholder')} className={drawerStyles.textarea}
                                aria-invalid={!!firstError(formErrors, 'description')} />
                        </DrawerField>
                    </div>
                </DrawerSection>

                <DrawerSection title={t('calendar.drawer.schedule')}>
                    <div className={drawerStyles.sectionGrid}>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <DrawerField label={t('calendar.drawer.fields.start')} error={firstError(formErrors, 'starts_at')}>
                            <DatePicker
                                value={toCalendarDateTime(currentForm.startsAt)}
                                minValue={earliestDate}
                                onChange={(v) => setForm((p) => ({ ...p, startsAt: fromCalendarDateTime(v) }))}
                                granularity="minute"
                            >
                                <DateField.Group fullWidth className={drawerStyles.input}>
                                    <DateField.Input>
                                        {(segment) => <DateField.Segment segment={segment} />}
                                    </DateField.Input>
                                    <DateField.Suffix>
                                        <DatePicker.Trigger>
                                            <DatePicker.TriggerIndicator />
                                        </DatePicker.Trigger>
                                    </DateField.Suffix>
                                </DateField.Group>
                                <DatePicker.Popover className={drawerStyles.popover}>
                                    <Calendar aria-label={t('calendar.drawer.fields.startAria')} minValue={earliestDate}>
                                        <Calendar.Header>
                                            <Calendar.YearPickerTrigger>
                                                <Calendar.YearPickerTriggerHeading />
                                                <Calendar.YearPickerTriggerIndicator />
                                            </Calendar.YearPickerTrigger>
                                            <Calendar.NavButton slot="previous" />
                                            <Calendar.NavButton slot="next" />
                                        </Calendar.Header>
                                        <Calendar.Grid>
                                            <Calendar.GridHeader>
                                                {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
                                            </Calendar.GridHeader>
                                            <Calendar.GridBody>
                                                {(date) => <Calendar.Cell date={date} />}
                                            </Calendar.GridBody>
                                        </Calendar.Grid>
                                        <Calendar.YearPickerGrid>
                                            <Calendar.YearPickerGridBody>
                                                {({year}) => <Calendar.YearPickerCell year={year} />}
                                            </Calendar.YearPickerGridBody>
                                        </Calendar.YearPickerGrid>
                                    </Calendar>
                                </DatePicker.Popover>
                            </DatePicker>
                            </DrawerField>
                            <DrawerField label={t('calendar.drawer.fields.end')} error={firstError(formErrors, 'ends_at')}>
                            <DatePicker
                                value={toCalendarDateTime(currentForm.endsAt)}
                                minValue={earliestDate}
                                onChange={(v) => setForm((p) => ({ ...p, endsAt: fromCalendarDateTime(v) }))}
                                granularity="minute"
                            >
                                <DateField.Group fullWidth className={drawerStyles.input}>
                                    <DateField.Input>
                                        {(segment) => <DateField.Segment segment={segment} />}
                                    </DateField.Input>
                                    <DateField.Suffix>
                                        <DatePicker.Trigger>
                                            <DatePicker.TriggerIndicator />
                                        </DatePicker.Trigger>
                                    </DateField.Suffix>
                                </DateField.Group>
                                <DatePicker.Popover className={drawerStyles.popover}>
                                    <Calendar aria-label={t('calendar.drawer.fields.endAria')} minValue={earliestDate}>
                                        <Calendar.Header>
                                            <Calendar.YearPickerTrigger>
                                                <Calendar.YearPickerTriggerHeading />
                                                <Calendar.YearPickerTriggerIndicator />
                                            </Calendar.YearPickerTrigger>
                                            <Calendar.NavButton slot="previous" />
                                            <Calendar.NavButton slot="next" />
                                        </Calendar.Header>
                                        <Calendar.Grid>
                                            <Calendar.GridHeader>
                                                {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
                                            </Calendar.GridHeader>
                                            <Calendar.GridBody>
                                                {(date) => <Calendar.Cell date={date} />}
                                            </Calendar.GridBody>
                                        </Calendar.Grid>
                                        <Calendar.YearPickerGrid>
                                            <Calendar.YearPickerGridBody>
                                                {({year}) => <Calendar.YearPickerCell year={year} />}
                                            </Calendar.YearPickerGridBody>
                                        </Calendar.YearPickerGrid>
                                    </Calendar>
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
                                    {t('calendar.allDay')}
                                </Checkbox.Content>
                            </Checkbox>
                        </DrawerField>
                    </div>
                </DrawerSection>

                <DrawerSection title={t('calendar.drawer.statusVisibility')}>
                    <div className={drawerStyles.sectionGrid}>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <DrawerField label={t('calendar.drawer.fields.status')} error={firstError(formErrors, 'status')}>
                                <DrawerSelect
                                    value={currentForm.status}
                                    onChange={(v) => setForm((p) => ({ ...p, status: (v as CalendarEventStatus) || 'scheduled' }))}
                                    options={(['scheduled', 'in_progress', 'completed', 'cancelled', 'overdue'] as CalendarEventStatus[]).map((id) => ({ id, label: t(`calendar.statuses.${id}`) }))}
                                    placeholder={t('calendar.drawer.fields.status')}
                                />
                            </DrawerField>
                            <DrawerField label={t('calendar.drawer.fields.visibility')} error={firstError(formErrors, 'visibility')}>
                                <DrawerSelect
                                    value={currentForm.visibility}
                                    onChange={(v) => setForm((p) => ({ ...p, visibility: (v as CalendarVisibility) || 'assigned_users' }))}
                                    options={(['private', 'assigned_users', 'team', ...(canManageAdminVisibility ? ['admins'] : [])] as CalendarVisibility[]).map((id) => ({ id, label: t(`calendar.visibility.${id}`) }))}
                                    placeholder={t('calendar.drawer.fields.visibility')}
                                />
                            </DrawerField>
                        </div>
                    </div>
                </DrawerSection>

                <DrawerSection title={t('calendar.drawer.appearance')}>
                    <div className={drawerStyles.sectionGrid}>
                        <DrawerField label={t('calendar.drawer.fields.color')}>
                            <div className="flex flex-wrap gap-2">
                                {(Object.keys(EVENT_TYPE_CLASSES) as CalendarEventType[]).map((type) => {
                                    return (
                                        <AppButton
                                            key={type}
                                            type="button"
                                            isIconOnly
                                            variant="ghost"
                                            onPress={() => setForm((p) => ({ ...p, color: colorFor(type) }))}
                                            style={{ backgroundColor: colorFor(type) }}
                                            className={`flex size-9 min-w-9 items-center justify-center rounded-full border-2 border-transparent p-0 text-black shadow-sm transition hover:scale-105 focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] ${
                                                currentForm.color === colorFor(type) ? 'ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-[var(--surface)]' : ''
                                            }`}
                                            aria-label={t(`calendar.eventTypes.${type}`)}>
                                            <span className="text-[8px] font-bold opacity-60">{t(`calendar.eventTypes.${type}`).charAt(0)}</span>
                                        </AppButton>
                                    );
                                })}
                            </div>
                        </DrawerField>
                    </div>
                </DrawerSection>

                <DrawerSection title={t('calendar.drawer.assignees')}>
                    <div className={drawerStyles.sectionGrid}>
                        <DrawerField label={t('calendar.drawer.addUser')}>
                            <DrawerSelect
                                value=""
                                onChange={(v) => {
                                    if (v && !currentForm.participantIds.includes(Number(v)))
                                        setForm((p) => ({ ...p, participantIds: [...p.participantIds, Number(v)] }));
                                }}
                                options={users.filter((u) => !currentForm.participantIds.includes(u.id)).map((u) => ({ id: String(u.id), label: u.name }))}
                                placeholder={t('calendar.drawer.addUserPlaceholder')}
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
                                            <AppButton
                                                type="button"
                                                isIconOnly
                                                variant="ghost"
                                                size="sm"
                                                onPress={() => setForm((p) => ({ ...p, participantIds: p.participantIds.filter((x) => x !== id) }))}
                                                aria-label={t('calendar.drawer.removeUser', { name: u.name })}
                                                className="size-4 min-w-4 rounded p-0 text-[var(--crm-muted)] hover:text-red-400">
                                                <IconX size={12} />
                                            </AppButton>
                                        </span>
                                    ) : null;
                                })}
                            </div>
                        ) : null}
                    </div>
                </DrawerSection>

                <DrawerSection title={t('calendar.drawer.reminder')}>
                    <CalendarReminderForm
                        value={currentForm.reminderOffset}
                        onChange={(v) => setForm((p) => ({ ...p, reminderOffset: v }))}
                    />
                </DrawerSection>
            </form>
        </AppDrawer>
        <AppConfirmDialog
            isOpen={deleteConfirmOpen}
            title="Déplacer cet événement dans la corbeille ?"
            description={`L’événement « ${editEvent?.title ?? ''} » pourra être restauré depuis la corbeille.`}
            confirmLabel="Déplacer vers la corbeille"
            onConfirm={handleDelete}
            onCancel={() => setDeleteConfirmOpen(false)}
            variant="danger"
        />
        </>
    );
}

function normalizeList<T>(val: unknown): T[] {
    if (Array.isArray(val)) return val;
    if (val && typeof val === 'object' && 'data' in val && Array.isArray((val as { data: T[] }).data)) return (val as { data: T[] }).data;
    return [];
}

function initForm(edit?: CalendarEventRow | null, defaultStart?: string, defaultType: CalendarEventType = 'task') {
    if (edit) {
        const participants = normalizeList<{ userId: number }>(edit.participants);
        const reminders = normalizeList<{ offsetMinutes: number | null }>(edit.reminders);
        return {
            type: edit.type,
            title: edit.title,
            description: edit.description || '',
            status: edit.status,
            priority: edit.priority,
            color: /^#[0-9A-Fa-f]{6}$/.test(edit.color || '') ? edit.color! : colorFor(edit.type),
            startsAt: edit.startsAt ? fromCalendarDateTime(toCalendarDateTime(edit.startsAt)) : '',
            endsAt: edit.endsAt ? fromCalendarDateTime(toCalendarDateTime(edit.endsAt)) : '',
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
        type: defaultType,
        title: '',
        description: '',
        status: 'scheduled' as CalendarEventStatus,
        priority: 'medium' as CalendarEventPriority,
        color: colorFor(defaultType),
        startsAt: defaultStart ? fromCalendarDateTime(toCalendarDateTime(defaultStart)) : localDateTime(),
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
