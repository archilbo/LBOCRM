export type NotificationRow = {
    id: string;
    type: string;
    data: Record<string, unknown>;
    readAt: string | null;
    isRead: boolean;
    createdAt: string;
    createdAtHuman: string;
};
