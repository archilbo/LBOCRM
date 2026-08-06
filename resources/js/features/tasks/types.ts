export type TaskStatus = 'backlog' | 'not_started' | 'in_progress' | 'waiting_client' | 'waiting_admin' | 'blocked' | 'in_review' | 'completed' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskImpact = 'low' | 'normal' | 'high' | 'critical';
export type TaskType = 'general' | 'missing_document' | 'client_follow_up' | 'contract' | 'finance' | 'archive' | 'review' | 'internal_admin' | 'calendar';
export type TaskCategory = 'documents' | 'client_follow_up' | 'contract' | 'finance' | 'archive' | 'general_admin';

export type TaskRow = {
    id: number;
    taskNumber: string;
    title: string;
    description: string | null;
    type: TaskType;
    status: TaskStatus;
    priority: TaskPriority;
    impact: TaskImpact;
    progress: number;
    category: TaskCategory;
    startDate: string | null;
    dueDate: string | null;
    completedAt: string | null;
    reviewedAt: string | null;
    blockedReason: string | null;
    estimatedMinutes: number | null;
    actualMinutes: number | null;
    recurrenceRule: string | null;
    createdBy: { id: number; name: string } | null;
    assignees: { id: number; name: string }[];
    watchers: { id: number; name: string }[];
    checklistItems: { id: number; label: string; isDone: boolean; position: number }[];
    commentsCount: number;
    attachmentsCount: number;
    dossierId: number | null;
    clientId: number | null;
    conversationId: number | null;
    dossier: { id: number; number: string; object: string } | null;
    client: { id: number; name: string } | null;
    createdAt: string;
    updatedAt: string;
    comments?: TaskCommentRow[];
    attachments?: TaskAttachmentRow[];
    activityLogs?: TaskActivityLogRow[];
};

export type UserOption = {
    id: number;
    name: string;
    email: string;
};

export const STATUS_LABELS: Record<TaskStatus, string> = {
    backlog: 'Backlog',
    not_started: 'Not started',
    in_progress: 'In progress',
    waiting_client: 'Waiting client',
    waiting_admin: 'Waiting admin',
    in_review: 'In review',
    completed: 'Completed',
    blocked: 'Blocked',
    cancelled: 'Cancelled',
};

export const IMPACT_LABELS: Record<TaskImpact, string> = {
    low: 'Low',
    normal: 'Normal',
    high: 'High',
    critical: 'Critical',
};

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    urgent: 'Urgent',
};

export const CATEGORY_LABELS: Record<TaskCategory, string> = {
    documents: 'Documents',
    client_follow_up: 'Client follow-up',
    contract: 'Contract',
    finance: 'Finance',
    archive: 'Archive',
    general_admin: 'General',
};

export const CATEGORY_COLORS: Record<TaskCategory, string> = {
    documents: 'text-blue-600 border-blue-600/20 bg-blue-600/10',
    client_follow_up: 'text-emerald-600 border-emerald-600/20 bg-emerald-600/10',
    contract: 'text-violet-600 border-violet-600/20 bg-violet-600/10',
    finance: 'text-rose-600 border-rose-600/20 bg-rose-600/10',
    archive: 'text-cyan-600 border-cyan-600/20 bg-cyan-600/10',
    general_admin: 'text-zinc-600 border-zinc-600/20 bg-zinc-600/10',
};

export const PRIORITY_COLORS: Record<TaskPriority, string> = {
    low: 'bg-zinc-500/10 text-zinc-600 border-zinc-500/25',
    medium: 'bg-blue-500/10 text-blue-600 border-blue-500/25',
    high: 'bg-amber-500/10 text-amber-600 border-amber-500/25',
    urgent: 'bg-red-500/10 text-red-600 border-red-500/25',
};

export const IMPACT_COLORS: Record<TaskImpact, string> = {
    low: 'bg-zinc-500/10 text-zinc-600 border-zinc-500/20',
    normal: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    high: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    critical: 'bg-red-500/10 text-red-600 border-red-500/20',
};

export const TYPE_LABELS: Record<TaskType, string> = {
    general: 'General',
    missing_document: 'Missing document',
    client_follow_up: 'Client follow-up',
    contract: 'Contract',
    finance: 'Finance',
    archive: 'Archive',
    review: 'Review',
    internal_admin: 'Internal admin',
    calendar: 'Calendar',
};

export const COLUMNS: TaskStatus[] = ['not_started', 'in_progress', 'waiting_client', 'waiting_admin', 'blocked', 'in_review', 'completed'];
export const BOARD_COLUMNS: TaskStatus[] = ['not_started', 'in_progress', 'waiting_client', 'waiting_admin', 'blocked', 'in_review', 'completed'];

export type ViewMode = 'overview' | 'board' | 'list' | 'table' | 'timeline' | 'calendar';

export const VIEW_OPTIONS: { id: ViewMode; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: 'LayoutDashboard' },
    { id: 'board', label: 'Board', icon: 'Columns3' },
    { id: 'list', label: 'List', icon: 'List' },
    { id: 'table', label: 'Table', icon: 'Table' },
    { id: 'timeline', label: 'Timeline', icon: 'CalendarDays' },
    { id: 'calendar', label: 'Calendar', icon: 'Calendar' },
];

export type TaskCommentRow = {
    id: number;
    body: string;
    isNote: boolean;
    user: { id: number; name: string } | null;
    createdAt: string;
    updatedAt: string;
};

export type TaskActivityLogRow = {
    id: number;
    action: string;
    description: string | null;
    user: { id: number; name: string } | null;
    createdAt: string;
};

export type TaskAttachmentRow = {
    id: number;
    originalFilename: string;
    filename: string;
    mimeType: string;
    size: number;
    sizeLabel: string | null;
    user: { id: number; name: string } | null;
    createdAt: string;
    downloadUrl: string | null;
};

export const STATUS_COLORS: Record<TaskStatus, string> = {
    backlog: 'bg-zinc-500/10 text-zinc-600 border-zinc-500/20',
    not_started: 'bg-zinc-500/10 text-zinc-600 border-zinc-500/20',
    in_progress: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    waiting_client: 'bg-violet-500/10 text-violet-600 border-violet-500/20',
    waiting_admin: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20',
    in_review: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    completed: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    blocked: 'bg-red-500/10 text-red-600 border-red-500/20',
    cancelled: 'bg-zinc-500/5 text-zinc-500 border-zinc-500/15',
};

export const STATUS_DOT_COLORS: Record<TaskStatus, string> = {
    backlog: 'bg-zinc-500',
    not_started: 'bg-zinc-500',
    in_progress: 'bg-blue-500',
    waiting_client: 'bg-violet-500',
    waiting_admin: 'bg-cyan-500',
    in_review: 'bg-amber-500',
    completed: 'bg-emerald-500',
    blocked: 'bg-red-500',
    cancelled: 'bg-zinc-500',
};

export const STATUS_BG_COLORS: Record<TaskStatus, string> = {
    backlog: 'bg-zinc-500/5',
    not_started: 'bg-zinc-500/5',
    in_progress: 'bg-blue-500/5',
    waiting_client: 'bg-violet-500/5',
    waiting_admin: 'bg-cyan-500/5',
    in_review: 'bg-amber-500/5',
    completed: 'bg-emerald-500/5',
    blocked: 'bg-red-500/5',
    cancelled: 'bg-zinc-500/3',
};
