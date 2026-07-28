export type DashboardTone = 'gold' | 'green' | 'red' | 'blue' | 'violet' | 'neutral';

export type DashboardIconKey =
    | 'projects'
    | 'documents'
    | 'invoices'
    | 'payments'
    | 'upload'
    | 'clients'
    | 'clock'
    | 'check'
    | 'tasks'
    | 'chat';

export type DashboardKpi = {
    key: string;
    value: string;
    helperKey: string;
    helperValues?: Record<string, string | number>;
    tone: DashboardTone;
    icon: DashboardIconKey;
    href: string;
};

export type DashboardAction = {
    id: string;
    kind: string;
    context: string | null;
    dueKey: string;
    tone: DashboardTone;
    icon: DashboardIconKey;
    href: string;
};

export type DashboardProject = {
    id: string;
    dossierNumber: string;
    project: string;
    client: string;
    location: string;
    step: string;
    status: string;
    missingDocs: number;
    remaining: string;
    href: string;
};

export type DashboardAlert = {
    id: string;
    amount: string;
    count?: number;
    tone: DashboardTone;
    href: string;
};

export type DashboardActivity = {
    id: string;
    kind: string;
    description: string;
    time: string;
    tone: DashboardTone;
    icon: DashboardIconKey;
};

export type DashboardQuickLink = {
    key: string;
    href: string;
    icon: DashboardIconKey;
};

export type DashboardSystemHealth = {
    label: string;
    value: string;
    icon: DashboardIconKey;
    tone: DashboardTone;
};

export type DashboardBlockedDossier = {
    id: string;
    dossierNumber: string;
    project: string;
    client: string;
    step: string;
    stepKey: string;
    daysStuck: number;
    missingDocs: number;
    href: string;
};

export type DashboardWorkflowStepCount = {
    key: string;
    label: string;
    count: number;
};

export type DashboardFinanceTrendPoint = {
    key: string;
    label: string;
    invoiced: number;
    collected: number;
};

export type DashboardUrgentTask = {
    id: number;
    title: string;
    taskNumber: string;
    status: string;
    priority: string;
    dueDate: string | null;
    isOverdue: boolean;
};

export type DashboardRecentMessage = {
    id: number;
    conversationId: number;
    sender: string;
    body: string;
    createdAt: string;
    unread: boolean;
};

export type DashboardCommandCenter = {
    kpis: DashboardKpi[];
    nextActions: DashboardAction[];
    blockedDossiers: DashboardBlockedDossier[];
    workflowDistribution: DashboardWorkflowStepCount[];
    financeTrend: DashboardFinanceTrendPoint[];
    recentProjects: DashboardProject[];
    financeAlerts: DashboardAlert[];
    activityFeed: DashboardActivity[];
    urgentTaskList: DashboardUrgentTask[];
    recentMessageList: DashboardRecentMessage[];
    quickLinks: DashboardQuickLink[];
    systemHealth: DashboardSystemHealth[];
};
