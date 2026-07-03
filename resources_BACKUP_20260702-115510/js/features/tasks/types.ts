export type TaskStatus = 'backlog' | 'not_started' | 'in_progress' | 'waiting_client' | 'waiting_admin' | 'blocked' | 'in_review' | 'completed' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskImpact = 'low' | 'normal' | 'high' | 'critical';
export type TaskType = 'general' | 'missing_document' | 'client_follow_up' | 'contract' | 'authorization' | 'finance' | 'archive' | 'review' | 'internal_admin';
export type TaskCategory = 'documents' | 'client_follow_up' | 'contract' | 'authorization' | 'finance' | 'archive' | 'general_admin';

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
    authorization: 'Authorization',
    finance: 'Finance',
    archive: 'Archive',
    general_admin: 'General',
};

export const CATEGORY_COLORS: Record<TaskCategory, string> = {
    documents: 'text-blue-400 border-blue-400/20 bg-blue-400/10',
    client_follow_up: 'text-emerald-400 border-emerald-400/20 bg-emerald-400/10',
    contract: 'text-violet-400 border-violet-400/20 bg-violet-400/10',
    authorization: 'text-amber-400 border-amber-400/20 bg-amber-400/10',
    finance: 'text-rose-400 border-rose-400/20 bg-rose-400/10',
    archive: 'text-cyan-400 border-cyan-400/20 bg-cyan-400/10',
    general_admin: 'text-zinc-400 border-zinc-400/20 bg-zinc-400/10',
};

export const PRIORITY_COLORS: Record<TaskPriority, string> = {
    low: 'bg-zinc-500/20 text-zinc-300 border-zinc-500/25',
    medium: 'bg-blue-500/20 text-blue-300 border-blue-500/25',
    high: 'bg-amber-500/20 text-amber-300 border-amber-500/25',
    urgent: 'bg-red-500/20 text-red-300 border-red-500/25',
};

export const IMPACT_COLORS: Record<TaskImpact, string> = {
    low: 'bg-zinc-500/15 text-zinc-300 border-zinc-500/20',
    normal: 'bg-blue-500/15 text-blue-300 border-blue-500/20',
    high: 'bg-amber-500/15 text-amber-300 border-amber-500/20',
    critical: 'bg-red-500/15 text-red-300 border-red-500/20',
};

export const TYPE_LABELS: Record<TaskType, string> = {
    general: 'General',
    missing_document: 'Missing document',
    client_follow_up: 'Client follow-up',
    contract: 'Contract',
    authorization: 'Authorization',
    finance: 'Finance',
    archive: 'Archive',
    review: 'Review',
    internal_admin: 'Internal admin',
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
    backlog: 'bg-zinc-500/15 text-zinc-300 border-zinc-500/20',
    not_started: 'bg-zinc-500/15 text-zinc-300 border-zinc-500/20',
    in_progress: 'bg-blue-500/15 text-blue-300 border-blue-500/20',
    waiting_client: 'bg-violet-500/15 text-violet-300 border-violet-500/20',
    waiting_admin: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/20',
    in_review: 'bg-amber-500/15 text-amber-300 border-amber-500/20',
    completed: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
    blocked: 'bg-red-500/15 text-red-300 border-red-500/20',
    cancelled: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/15',
};

export const STATUS_DOT_COLORS: Record<TaskStatus, string> = {
    backlog: 'bg-zinc-400',
    not_started: 'bg-zinc-400',
    in_progress: 'bg-blue-400',
    waiting_client: 'bg-violet-400',
    waiting_admin: 'bg-cyan-400',
    in_review: 'bg-amber-400',
    completed: 'bg-emerald-400',
    blocked: 'bg-red-400',
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
