export type NotificationRow = {
    id: string;
    type: string;
    data: Record<string, unknown>;
    readAt: string | null;
    isRead: boolean;
    createdAt: string;
    createdAtHuman: string;
    actionUrl: string | null;
};

export type NotificationModule = 'tasks' | 'requests' | 'documents' | 'contracts' | 'finance' | 'archives' | 'calendar' | 'system';

export type NotificationSeverity = 'info' | 'success' | 'warning' | 'urgent';

export type EnrichedNotification = NotificationRow & {
    module: NotificationModule;
    severity: NotificationSeverity;
    title: string;
    body: string | null;
    values: Record<string, string | number>;
    entityLabel: string | null;
    entityType: string | null;
    entityId: number | null;
};
