export type CalendarEventType =
    | 'task' | 'note' | 'reminder' | 'meeting' | 'deadline'
    | 'client_follow_up' | 'finance_follow_up'
    | 'contract_follow_up' | 'archive_follow_up';

export type CalendarEventStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'overdue';
export type CalendarEventPriority = 'low' | 'medium' | 'high' | 'urgent';
export type CalendarVisibility = 'private' | 'assigned_users' | 'team' | 'admins';
export type ParticipantRole = 'owner' | 'assignee' | 'watcher' | 'guest';
export type ResponseStatus = 'pending' | 'accepted' | 'declined' | 'tentative';
export type ReminderStatus = 'pending' | 'sent' | 'dismissed' | 'snoozed' | 'failed';

export type CalendarUser = {
    id: number;
    name: string;
    email: string;
};

export type CalendarParticipant = {
    id: number;
    calendarEventId: number;
    user: CalendarUser | null;
    userId: number;
    role: ParticipantRole;
    responseStatus: ResponseStatus;
    lastReadAt: string | null;
};

export type CalendarReminder = {
    id: number;
    calendarEventId: number;
    userId: number | null;
    offsetMinutes: number | null;
    remindAt: string | null;
    channel: string;
    status: ReminderStatus;
    snoozedUntil: string | null;
    sentAt: string | null;
    createdAt: string | null;
};

export type CalendarActivity = {
    id: number;
    calendarEventId: number;
    userId: number | null;
    event: string;
    oldValue: unknown;
    newValue: unknown;
    metadata: unknown;
    createdAt: string | null;
};

export type CalendarEventRow = {
    id: number;
    key: string;
    sourceType: 'calendar_event';
    sourceId: number;
    eventNumber: string;
    type: CalendarEventType;
    title: string;
    description: string | null;
    status: CalendarEventStatus;
    priority: CalendarEventPriority;
    color: string | null;
    startsAt: string;
    endsAt: string | null;
    allDay: boolean;
    timezone: string;
    visibility: CalendarVisibility;
    createdBy: CalendarUser | null;
    owner: CalendarUser | null;
    task: unknown | null;
    taskId: number | null;
    clientId: number | null;
    dossierId: number | null;
    dossierDocumentId: number | null;
    financeDocumentId: number | null;
    contractId: number | null;
    archiveRecordId: number | null;
    participants: CalendarParticipant[];
    reminders: CalendarReminder[];
    activityLogs: CalendarActivity[];
    createdAt: string | null;
    updatedAt: string | null;
    capabilities: {
        update: boolean;
        delete: boolean;
    };
};

export type CalendarFormData = {
    type: CalendarEventType;
    title: string;
    description: string;
    status: CalendarEventStatus;
    priority: CalendarEventPriority;
    color: string;
    startsAt: string;
    endsAt: string;
    allDay: boolean;
    timezone: string;
    visibility: CalendarVisibility;
    ownerId: number | null;
    clientId: number | null;
    dossierId: number | null;
    dossierDocumentId: number | null;
    financeDocumentId: number | null;
    contractId: number | null;
    archiveRecordId: number | null;
    participantIds: number[];
    reminderOffset: number | null;
};

export const EVENT_TYPE_LABELS: Record<CalendarEventType, string> = {
    task: 'Task',
    note: 'Note',
    reminder: 'Reminder',
    meeting: 'Meeting',
    deadline: 'Deadline',
    client_follow_up: 'Client follow-up',
    finance_follow_up: 'Finance follow-up',
    contract_follow_up: 'Contract follow-up',
    archive_follow_up: 'Archive follow-up',
};

export const EVENT_STATUS_LABELS: Record<CalendarEventStatus, string> = {
    scheduled: 'Scheduled',
    in_progress: 'In progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
    overdue: 'Overdue',
};

export const EVENT_PRIORITY_LABELS: Record<CalendarEventPriority, string> = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    urgent: 'Urgent',
};

export const EVENT_TYPE_COLORS: Record<CalendarEventType, string> = {
    task: '#f5b342',
    note: '#3b82f6',
    reminder: '#a855f7',
    meeting: '#06b6d4',
    deadline: '#ef4444',
    client_follow_up: '#22c55e',
    finance_follow_up: '#10b981',
    contract_follow_up: '#8b5cf6',
    archive_follow_up: '#6b7280',
};

export const EVENT_TYPE_CLASSES: Record<CalendarEventType, string> = {
    task: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    note: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    reminder: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    meeting: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    deadline: 'bg-red-500/20 text-red-300 border-red-500/30',
    client_follow_up: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    finance_follow_up: 'bg-green-500/20 text-green-300 border-green-500/30',
    contract_follow_up: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
    archive_follow_up: 'bg-zinc-500/20 text-zinc-300 border-zinc-500/30',
};

export const VISIBILITY_LABELS: Record<CalendarVisibility, string> = {
    private: 'Private',
    assigned_users: 'Assigned users',
    team: 'Team',
    admins: 'Admins',
};
