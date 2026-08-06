import { IconArchive, IconBell, IconCalendarCheck, IconClipboardList, IconCreditCard, IconFileText, IconHeartHandshake, IconUserPlus } from '@tabler/icons-react';
import type { Icon } from '@tabler/icons-react';

import type { EnrichedNotification, NotificationModule, NotificationRow, NotificationSeverity } from './types';

export const MODULE_ORDER: NotificationModule[] = ['tasks', 'requests', 'documents', 'contracts', 'finance', 'archives', 'calendar', 'system'];

// Note: These are translation keys, not translated strings
export const MODULE_LABELS: Record<NotificationModule, string> = {
    tasks: 'notifications.modules.tasks',
    requests: 'notifications.modules.requests',
    documents: 'notifications.modules.documents',
    contracts: 'notifications.modules.contracts',
    finance: 'notifications.modules.finance',
    archives: 'notifications.modules.archives',
    calendar: 'notifications.modules.calendar',
    system: 'notifications.modules.system',
};

// Note: These are translation keys, not translated strings
export const ACTION_LABELS: Record<string, string> = {
    assigned: 'notifications.actions.assigned',
    reassigned: 'notifications.actions.reassigned',
    completed: 'notifications.actions.completed',
    in_review: 'notifications.actions.in_review',
    blocked: 'notifications.actions.blocked',
    overdue: 'notifications.actions.overdue',
    due_tomorrow: 'notifications.actions.due_tomorrow',
    mentioned: 'notifications.actions.mentioned',
    status_changed: 'notifications.actions.status_changed',
    uploaded: 'notifications.actions.uploaded',
    status_updated: 'notifications.actions.status_updated',
    created: 'notifications.actions.created',
    updated: 'notifications.actions.updated',
    generated: 'notifications.actions.generated',
    signed: 'notifications.actions.signed',
    accepted: 'notifications.actions.accepted',
    rejected: 'notifications.actions.rejected',
    cancelled: 'notifications.actions.cancelled',
    converted: 'notifications.actions.converted',
    payment_received: 'notifications.actions.payment_received',
    checked_out: 'notifications.actions.checked_out',
    returned: 'notifications.actions.returned',
};

export function getNotificationModule(n: NotificationRow): NotificationModule {
    const type = n.type;
    const data = n.data;

    if (type === 'TaskNotification' || data.task_id || data.task_number) return 'tasks';
    if (type === 'CalendarEventNotification' || data.calendar_event_id || data.event_number) return 'calendar';
    if (type === 'DocumentNotification' || data.document_number) return 'documents';
    if (type === 'ContractNotification' || data.contract_number) return 'contracts';
    if (type === 'FinanceDocumentNotification' || data.finance_number) return 'finance';
    if (data.finance_document_id || data.finance_number) return 'finance';
    if (type === 'ArchiveOverdueNotification' || data.archive_record_id || data.archive_number) return 'archives';
    if (data.suggestion) return 'system';
    if (data.conversation_id || data.sender_id) return 'system';

    return 'system';
}

export function getNotificationSeverity(n: NotificationRow, module: NotificationModule): NotificationSeverity {
    const data = n.data;
    const action = data.action as string | undefined;

    if (action === 'overdue') return 'urgent';
    if (action === 'blocked') return 'warning';
    if (action === 'completed' || action === 'accepted') return 'success';
    if (action === 'payment_received') return 'success';
    if (action === 'generated') return 'success';
    if (action === 'signed') return 'success';
    if (action === 'returned') return 'success';
    if (module === 'finance' && (action === 'overdue' || data.type === 'overdue')) return 'urgent';
    if (module === 'archives' && action === 'overdue') return 'urgent';
    if (module === 'archives' && action === 'checked_out') return 'warning';
    if (module === 'system' && action === 'warning') return 'warning';
    if (action === 'failed' || action === 'rejected') return 'urgent';
    if (action === 'cancelled') return 'warning';

    return 'info';
}

export function getNotificationText(n: NotificationRow): { title: string; body: string | null } {
    const type = n.type;
    const data = n.data;
    const description = (data.description as string) || '';
    const title = (data.title as string) || '';
    const action = (data.action as string) || '';
    const body = (data.body as string) || '';

    const actionTitle = ACTION_LABELS[action];

    if (type === 'TaskNotification') {
        return {
            title: actionTitle || 'notifications.defaults.taskUpdate',
            body: description || title || null,
        };
    }

    if (type === 'ChatMessageNotification') {
        return {
            title: (data.sender_name as string) || 'notifications.defaults.newMessage',
            body: body || description || null,
        };
    }

    if (type === 'CalendarEventNotification') {
        return {
            title: actionTitle || 'notifications.defaults.calendarEvent',
            body: description || title || null,
        };
    }

    if (type === 'DocumentNotification') {
        return {
            title: actionTitle || 'notifications.defaults.documentUpdate',
            body: description || (data.original_filename as string) || null,
        };
    }

    if (type === 'ContractNotification') {
        return {
            title: actionTitle || 'notifications.defaults.contractUpdate',
            body: description || null,
        };
    }

    if (type === 'FinanceDocumentNotification') {
        return {
            title: actionTitle || 'notifications.defaults.financeUpdate',
            body: description || null,
        };
    }

    if (type === 'ArchiveOverdueNotification') {
        return {
            title: actionTitle || 'notifications.defaults.archiveUpdate',
            body: description || null,
        };
    }

    if (data.suggestion) {
        return {
            title: 'notifications.defaults.newSuggestion',
            body: description || null,
        };
    }

    return {
        title: actionTitle || description || type || 'notifications.defaults.notification',
        body: null,
    };
}

export function getNotificationEntity(n: NotificationRow): { label: string | null; type: string | null; id: number | null } {
    const data = n.data;
    const taskNumber = data.task_number as string | undefined;
    const eventNumber = data.event_number as string | undefined;
    const docNumber = data.document_number as string | undefined;
    const contractNumber = data.contract_number as string | undefined;
    const financeNumber = data.finance_number as string | undefined;

    const archiveNumber = data.archive_number as string | undefined;

    if (taskNumber) return { label: taskNumber, type: 'task', id: (data.task_id as number) || null };
    if (eventNumber) return { label: eventNumber, type: 'event', id: (data.calendar_event_id as number) || null };
    if (contractNumber) return { label: contractNumber, type: 'contract', id: (data.contract_id as number) || null };
    if (financeNumber) return { label: financeNumber, type: 'finance', id: (data.finance_document_id as number) || null };
    if (docNumber) return { label: docNumber, type: 'document', id: (data.document_id as number) || null };
    if (archiveNumber) return { label: archiveNumber, type: 'archive', id: (data.archive_record_id as number) || null };
    if (data.conversation_id) return { label: 'Conversation', type: 'chat', id: (data.conversation_id as number) || null };
    if (data.dossier_id) return { label: 'Dossier', type: 'dossier', id: (data.dossier_id as number) || null };

    return { label: null, type: null, id: null };
}

export function getNotificationIcon(module: NotificationModule): Icon {
    const icons: Record<NotificationModule, Icon> = {
        tasks: IconClipboardList,
        requests: IconUserPlus,
        documents: IconFileText,
        contracts: IconHeartHandshake,
        finance: IconCreditCard,
        archives: IconArchive,
        calendar: IconCalendarCheck,
        system: IconBell,
    };
    return icons[module];
}

export const SEVERITY_COLORS: Record<NotificationSeverity, { dot: string; bg: string; border: string }> = {
    info: { dot: 'bg-blue-400', bg: 'bg-blue-400/5', border: 'border-blue-400/15' },
    success: { dot: 'bg-emerald-400', bg: 'bg-emerald-400/5', border: 'border-emerald-400/15' },
    warning: { dot: 'bg-amber-400', bg: 'bg-amber-400/5', border: 'border-amber-400/15' },
    urgent: { dot: 'bg-red-400', bg: 'bg-red-400/5', border: 'border-red-400/15' },
};

export function formatNotificationTime(isoString: string, locale: string = 'en'): string {
    const now = Date.now();
    const date = new Date(isoString).getTime();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);

    if (locale === 'fr') {
        if (diffSec < 60) return 'à l\'instant';
        const diffMin = Math.floor(diffSec / 60);
        if (diffMin < 60) return `il y a ${diffMin} min`;
        const diffHours = Math.floor(diffMin / 60);
        if (diffHours < 24) return `il y a ${diffHours} h`;
        const diffDays = Math.floor(diffHours / 24);
        if (diffDays === 1) return 'hier';
        if (diffDays < 7) return `il y a ${diffDays} j`;
        return new Date(isoString).toLocaleDateString('fr', { month: 'short', day: 'numeric' });
    }

    if (diffSec < 60) return 'just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(isoString).toLocaleDateString('en', { month: 'short', day: 'numeric' });
}

export type TimeGroup = 'now' | 'today' | 'yesterday' | 'earlier';

// Note: These are translation keys, not translated strings
export const TIME_GROUP_LABELS: Record<TimeGroup, string> = {
    now: 'notifications.timeGroups.now',
    today: 'notifications.timeGroups.today',
    yesterday: 'notifications.timeGroups.yesterday',
    earlier: 'notifications.timeGroups.earlier',
};

export const TIME_GROUP_ORDER: TimeGroup[] = ['now', 'today', 'yesterday', 'earlier'];

export function groupNotificationsByTime(items: EnrichedNotification[]): Map<TimeGroup, EnrichedNotification[]> {
    const groups = new Map<TimeGroup, EnrichedNotification[]>();
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterdayStart = todayStart - 86400000;
    const twoDaysAgo = todayStart - 86400000;

    for (const item of items) {
        const createdAt = new Date(item.createdAt).getTime();
        let group: TimeGroup;
        if (createdAt >= todayStart) {
            group = now.getTime() - createdAt < 3600000 ? 'now' : 'today';
        } else if (createdAt >= yesterdayStart && createdAt < todayStart) {
            group = 'yesterday';
        } else {
            group = 'earlier';
        }
        if (!groups.has(group)) groups.set(group, []);
        groups.get(group)!.push(item);
    }

    return groups;
}

export function enrichNotification(n: NotificationRow): EnrichedNotification {
    const module = getNotificationModule(n);
    const severity = getNotificationSeverity(n, module);
    const { title, body } = getNotificationText(n);
    const entity = getNotificationEntity(n);
    return { ...n, module, severity, title, body, entityLabel: entity.label, entityType: entity.type, entityId: entity.id };
}
