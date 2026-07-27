export type ProjectDesignRemarkFilter = 'all' | 'open' | 'assigned' | 'in_progress' | 'resolved';
export type ProjectDesignRemarkStatus =
    | 'open'
    | 'assigned'
    | 'in_progress'
    | 'addressed'
    | 'verified'
    | 'resolved'
    | 'reopened'
    | 'rejected';

export const PROJECT_DESIGN_REMARK_FILTERS: ReadonlyArray<{
    id: ProjectDesignRemarkFilter;
    label: string;
}> = [
    { id: 'all', label: 'All' },
    { id: 'open', label: 'Open' },
    { id: 'assigned', label: 'Assigned' },
    { id: 'in_progress', label: 'In progress' },
    { id: 'resolved', label: 'Resolved' },
];

const CLOSED_REMARK_STATUSES = new Set(['resolved', 'verified', 'rejected']);

export const PROJECT_DESIGN_REMARK_STATUS_LABELS: Readonly<Record<ProjectDesignRemarkStatus, string>> = {
    open: 'Open',
    assigned: 'Assigned',
    in_progress: 'In progress',
    addressed: 'Addressed',
    verified: 'Verified',
    resolved: 'Resolved',
    reopened: 'Reopened',
    rejected: 'Rejected',
};

export const PROJECT_DESIGN_REMARK_WORKFLOW_ACTIONS: Readonly<Partial<Record<ProjectDesignRemarkStatus, {
    status: ProjectDesignRemarkStatus;
    label: string;
}>>> = {
    open: { status: 'in_progress', label: 'Start work' },
    assigned: { status: 'in_progress', label: 'Start work' },
    in_progress: { status: 'addressed', label: 'Mark addressed' },
    addressed: { status: 'verified', label: 'Verify' },
    verified: { status: 'resolved', label: 'Resolve' },
    resolved: { status: 'reopened', label: 'Reopen' },
    rejected: { status: 'reopened', label: 'Reopen' },
};

export function isProjectDesignRemarkOpen(status: string): boolean {
    return !CLOSED_REMARK_STATUSES.has(status.toLowerCase());
}

export function matchesProjectDesignRemarkFilter(status: string, filter: ProjectDesignRemarkFilter): boolean {
    const normalized = status.toLowerCase();

    if (filter === 'all') return true;
    if (filter === 'open') return isProjectDesignRemarkOpen(normalized);
    return normalized === filter;
}

export function getProjectDesignRemarkWorkflowAction(status: string) {
    return PROJECT_DESIGN_REMARK_WORKFLOW_ACTIONS[status.toLowerCase() as ProjectDesignRemarkStatus] ?? null;
}
