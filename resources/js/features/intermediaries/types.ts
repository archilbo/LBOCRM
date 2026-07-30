export type IntermediaryRow = {
    id: number;
    code: string;
    name: string;
    type: string;
    phone: string | null;
    email: string | null;
    notes: string | null;
    isActive: boolean;
    clientsCount: number;
    createdAt: string | null;
    updatedAt: string | null;
    capabilities: {
        view: boolean;
        update: boolean;
        delete: boolean;
    };
};

export type IntermediaryFormPayload = {
    name: string;
    type: string;
    phone: string;
    email: string;
    notes: string;
    isActive: boolean;
};

export type ClientBrief = {
    id: number;
    fullName: string;
    clientNumber: string;
    cin: string | null;
    phone: string | null;
    email: string | null;
    status: string;
    projectsCount: number;
    createdAt: string | null;
    updatedAt: string | null;
};

export type ProjectBrief = {
    id: number;
    dossierNumber: string;
    projectObject: string | null;
    clientName: string | null;
    status: string;
    workflowStep: string;
    commune: string | null;
    createdAt: string | null;
    updatedAt: string | null;
};

export type MonthlyCount = {
    month: string;
    count: number;
};

export type StatusCount = {
    status: string;
    count: number;
};

export type IntermediaryActivityType =
    | 'intermediary_updated'
    | 'client_created'
    | 'client_updated'
    | 'project_created'
    | 'project_updated';

export type IntermediaryActivityItem = {
    id: string;
    type: IntermediaryActivityType;
    subjectName: string;
    subjectCode: string | null;
    occurredAt: string;
    occurredAtHuman: string;
    href: string | null;
    causerName?: string | null;
};

export type IntermediaryShowMetrics = {
    totalClients: number;
    activeClients: number;
    inactiveClients: number;
    archivedClients: number;
    totalProjects: number;
    activeProjects: number;
    archivedProjects: number;
    blockedProjects: number;
    latestClientName: string | null;
    latestClientDate: string | null;
};

export type IntermediaryShowProps = {
    intermediary: IntermediaryRow;
    metrics: IntermediaryShowMetrics;
    monthlyClients: MonthlyCount[];
    monthlyProjects: MonthlyCount[];
    clientStatusBreakdown: StatusCount[];
    projectStatusBreakdown: StatusCount[];
    clients: ClientBrief[];
    projects: ProjectBrief[];
    activity: IntermediaryActivityItem[];
};
