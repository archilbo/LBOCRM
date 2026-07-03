export type DashboardTone = 'gold' | 'green' | 'red' | 'blue' | 'violet' | 'neutral';

export type DashboardIconKey =
    | 'projects'
    | 'documents'
    | 'authorizations'
    | 'invoices'
    | 'payments'
    | 'upload'
    | 'clients'
    | 'clock'
    | 'check'
    | 'tasks'
    | 'chat';

export type DashboardHero = {
    eyebrow: string;
    title: string;
    subtitle: string;
};

export type DashboardKpi = {
    key: string;
    label: string;
    value: string;
    helper: string;
    tone: DashboardTone;
    icon: DashboardIconKey;
    href: string;
};

export type DashboardAction = {
    id: string;
    title: string;
    subtitle: string;
    due: string;
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
    title: string;
    amount: string;
    subtitle: string;
    tone: DashboardTone;
    href: string;
};

export type DashboardActivity = {
    id: string;
    title: string;
    description: string;
    time: string;
    tone: DashboardTone;
    icon: DashboardIconKey;
};

export type DashboardQuickLink = {
    label: string;
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
    hero: DashboardHero;
    kpis: DashboardKpi[];
    nextActions: DashboardAction[];
    blockedDossiers: DashboardBlockedDossier[];
    workflowDistribution: DashboardWorkflowStepCount[];
    recentProjects: DashboardProject[];
    financeAlerts: DashboardAlert[];
    activityFeed: DashboardActivity[];
    urgentTaskList: DashboardUrgentTask[];
    recentMessageList: DashboardRecentMessage[];
    quickLinks: DashboardQuickLink[];
    systemHealth: DashboardSystemHealth[];
};