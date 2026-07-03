import {
    Bell,
    CalendarCheck,
    ClipboardList,
    CreditCard,
    FileText,
    Handshake,
    type LucideIcon,
    UserPlus,
} from 'lucide-react';
import type { EnrichedNotification, NotificationModule, NotificationRow, NotificationSeverity } from './types';

export const MODULE_ORDER: NotificationModule[] = ['tasks', 'requests', 'documents', 'contracts', 'finance', 'calendar', 'system'];

export const MODULE_LABELS: Record<NotificationModule, string> = {
    tasks: 'Tasks',
    requests: 'Requests',
    documents: 'Documents',
    contracts: 'Contracts',
    finance: 'Finance',
    calendar: 'Calendar',
    system: 'System',
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
    if (module === 'finance' && (action === 'overdue' || data.type === 'overdue')) return 'urgent';
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

    const actionLabels: Record<string, string> = {
        assigned: 'Task assigned',
        reassigned: 'Task reassigned',
        completed: 'Task completed',
        in_review: 'Ready for review',
        blocked: 'Task is blocked',
        overdue: 'Task overdue',
        due_tomorrow: 'Due tomorrow',
        mentioned: 'You were mentioned',
        status_changed: 'Status changed',
        uploaded: 'Document uploaded',
        status_changed: 'Status updated',
        created: 'Created',
        updated: 'Updated',
        generated: 'Document generated',
        signed: 'Contract signed',
        accepted: 'Quote accepted',
        rejected: 'Quote rejected',
        cancelled: 'Cancelled',
        converted: 'Converted to invoice',
        payment_received: 'Payment received',
    };

    const actionTitle = actionLabels[action];

    if (type === 'TaskNotification') {
        return {
            title: actionTitle || 'Task update',
            body: description || title || null,
        };
    }

    if (type === 'ChatMessageNotification') {
        return {
            title: (data.sender_name as string) || 'New message',
            body: body || description || null,
        };
    }

    if (type === 'CalendarEventNotification') {
        return {
            title: actionTitle || 'Calendar event',
            body: description || title || null,
        };
    }

    if (type === 'DocumentNotification') {
        return {
            title: actionTitle || 'Document update',
            body: description || (data.original_filename as string) || null,
        };
    }

    if (type === 'ContractNotification') {
        return {
            title: actionTitle || 'Contract update',
            body: description || null,
        };
    }

    if (type === 'FinanceDocumentNotification') {
        return {
            title: actionTitle || 'Finance update',
            body: description || null,
        };
    }

    if (data.suggestion) {
        return {
            title: 'New suggestion',
            body: description || null,
        };
    }

    return {
        title: actionTitle || description || type || 'Notification',
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

    if (taskNumber) return { label: taskNumber, type: 'task', id: (data.task_id as number) || null };
    if (eventNumber) return { label: eventNumber, type: 'event', id: (data.calendar_event_id as number) || null };
    if (contractNumber) return { label: contractNumber, type: 'contract', id: (data.contract_id as number) || null };
    if (financeNumber) return { label: financeNumber, type: 'finance', id: (data.finance_document_id as number) || null };
    if (docNumber) return { label: docNumber, type: 'document', id: (data.document_id as number) || null };
    if (data.conversation_id) return { label: 'Conversation', type: 'chat', id: (data.conversation_id as number) || null };
    if (data.dossier_id) return { label: 'Dossier', type: 'dossier', id: (data.dossier_id as number) || null };

    return { label: null, type: null, id: null };
}

export function getNotificationIcon(module: NotificationModule): LucideIcon {
    const icons: Record<NotificationModule, LucideIcon> = {
        tasks: ClipboardList,
        requests: UserPlus,
        documents: FileText,
        contracts: Handshake,
        finance: CreditCard,
        calendar: CalendarCheck,
        system: Bell,
    };
    return icons[module];
}

export const SEVERITY_COLORS: Record<NotificationSeverity, { dot: string; bg: string; border: string }> = {
    info: { dot: 'bg-blue-400', bg: 'bg-blue-400/5', border: 'border-blue-400/15' },
    success: { dot: 'bg-emerald-400', bg: 'bg-emerald-400/5', border: 'border-emerald-400/15' },
    warning: { dot: 'bg-amber-400', bg: 'bg-amber-400/5', border: 'border-amber-400/15' },
    urgent: { dot: 'bg-red-400', bg: 'bg-red-400/5', border: 'border-red-400/15' },
};

export function formatNotificationTime(isoString: string): string {
    const now = Date.now();
    const date = new Date(isoString).getTime();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
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

export const TIME_GROUP_LABELS: Record<TimeGroup, string> = {
    now: 'Now',
    today: 'Today',
    yesterday: 'Yesterday',
    earlier: 'Earlier',
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
