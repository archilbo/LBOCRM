export type DashboardModuleTone = 'blue' | 'green' | 'amber' | 'red' | 'violet' | 'neutral';

export type DashboardKpi = {
    key: string;
    labelKey: string;
    value: string;
    description: string;
    href: string;
    tone: DashboardModuleTone;
};

export type WorkflowStep = {
    key: string;
    labelKey: string;
    value: number;
    href: string;
    tone: DashboardModuleTone;
};

export type UrgentItem = {
    id: number;
    title: string;
    description: string;
    href: string;
    tone: DashboardModuleTone;
};

export type ActivityItem = {
    id: number;
    title: string;
    description: string;
    time: string;
    tone: DashboardModuleTone;
};

export type ModuleOverview = {
    key: string;
    titleKey: string;
    description: string;
    href: string;
    statusKey: string;
    tone: DashboardModuleTone;
};

export const dashboardKpis: DashboardKpi[] = [
    {
        key: 'clients',
        labelKey: 'dashboardHome.kpi.clients',
        value: '5',
        description: 'Active client profiles',
        href: '/clients',
        tone: 'blue',
    },
    {
        key: 'projects',
        labelKey: 'dashboardHome.kpi.projects',
        value: '3',
        description: 'Open project files',
        href: '/dossiers',
        tone: 'violet',
    },
    {
        key: 'documents',
        labelKey: 'dashboardHome.kpi.documents',
        value: '6',
        description: 'Required files tracked',
        href: '/documents',
        tone: 'amber',
    },
    {
        key: 'finance',
        labelKey: 'dashboardHome.kpi.finance',
        value: '98,400 MAD',
        description: 'Prototype total TTC',
        href: '/finance',
        tone: 'green',
    },
];

export const workflowSteps: WorkflowStep[] = [
    {
        key: 'client',
        labelKey: 'dashboardHome.workflow.client',
        value: 5,
        href: '/clients',
        tone: 'blue',
    },
    {
        key: 'project',
        labelKey: 'dashboardHome.workflow.project',
        value: 3,
        href: '/dossiers',
        tone: 'violet',
    },
    {
        key: 'documents',
        labelKey: 'dashboardHome.workflow.documents',
        value: 6,
        href: '/documents',
        tone: 'amber',
    },
    {
        key: 'contract',
        labelKey: 'dashboardHome.workflow.contract',
        value: 3,
        href: '/contracts',
        tone: 'blue',
    },
    {
        key: 'authorization',
        labelKey: 'dashboardHome.workflow.authorization',
        value: 3,
        href: '/authorizations',
        tone: 'red',
    },
    {
        key: 'finance',
        labelKey: 'dashboardHome.workflow.finance',
        value: 4,
        href: '/finance',
        tone: 'green',
    },
    {
        key: 'archive',
        labelKey: 'dashboardHome.workflow.archive',
        value: 4,
        href: '/archives',
        tone: 'neutral',
    },
];

export const urgentItems: UrgentItem[] = [
    {
        id: 1,
        title: 'Missing cadastral plan',
        description: 'DOS-2026-0001 needs cadastral plan before contract generation.',
        href: '/documents',
        tone: 'red',
    },
    {
        id: 2,
        title: 'Authorization observations',
        description: 'Office extension has 2 open observations requiring correction.',
        href: '/authorizations',
        tone: 'amber',
    },
    {
        id: 3,
        title: 'Overdue invoice',
        description: 'INV-2026-0003 has 16,400 MAD remaining.',
        href: '/finance',
        tone: 'red',
    },
];

export const recentActivity: ActivityItem[] = [
    {
        id: 1,
        title: 'Client profile opened',
        description: 'Mohamed Ouknin profile was reviewed.',
        time: 'Today',
        tone: 'blue',
    },
    {
        id: 2,
        title: 'Contract calculation updated',
        description: 'CTR-2026-0001 calculation was prepared.',
        time: 'Today',
        tone: 'violet',
    },
    {
        id: 3,
        title: 'Document uploaded',
        description: 'Ownership certificate uploaded for DOS-2026-0001.',
        time: 'Yesterday',
        tone: 'green',
    },
    {
        id: 4,
        title: 'Archive record created',
        description: 'ARC-2026-0001 stored in Archive room A.',
        time: '2 days ago',
        tone: 'neutral',
    },
];

export const moduleOverview: ModuleOverview[] = [
    {
        key: 'clients',
        titleKey: 'nav.clients',
        description: 'Client CRM, identity, CIN, contact, and linked projects.',
        href: '/clients',
        statusKey: 'dashboardHome.health.ready',
        tone: 'blue',
    },
    {
        key: 'dossiers',
        titleKey: 'nav.dossiers',
        description: 'Project workspace from request to closure.',
        href: '/dossiers',
        statusKey: 'dashboardHome.health.ready',
        tone: 'violet',
    },
    {
        key: 'documents',
        titleKey: 'nav.documents',
        description: 'Required documents checklist, upload, verification, and preview.',
        href: '/documents',
        statusKey: 'dashboardHome.health.attention',
        tone: 'amber',
    },
    {
        key: 'contracts',
        titleKey: 'nav.contracts',
        description: 'Calculation, DOCX/PDF actions, and contract workflow.',
        href: '/contracts',
        statusKey: 'dashboardHome.health.active',
        tone: 'blue',
    },
    {
        key: 'authorizations',
        titleKey: 'nav.authorizations',
        description: 'Submission tracking, observations, and received authorization.',
        href: '/authorizations',
        statusKey: 'dashboardHome.health.attention',
        tone: 'red',
    },
    {
        key: 'finance',
        titleKey: 'nav.finance',
        description: 'Devis, invoices, payments, balances, and overdue follow-up.',
        href: '/finance',
        statusKey: 'dashboardHome.health.active',
        tone: 'green',
    },
    {
        key: 'archives',
        titleKey: 'nav.archives',
        description: 'Archive number, physical location, in/out dates, and retrieval.',
        href: '/archives',
        statusKey: 'dashboardHome.health.ready',
        tone: 'neutral',
    },
];
