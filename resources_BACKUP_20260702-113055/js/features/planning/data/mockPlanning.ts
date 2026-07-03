export type PlanningStatus = 'pending' | 'active' | 'completed' | 'blocked' | 'overdue';
export type PlanningPriority = 'low' | 'normal' | 'high' | 'urgent';

export type PlanningTaskType =
    | 'documents'
    | 'verification'
    | 'contract'
    | 'authorization'
    | 'siteVisit'
    | 'archive'
    | 'finance';

export type PlanningTaskRow = {
    id: number;
    title: string;
    type: PlanningTaskType;
    dossierNumber: string;
    projectObject: string;
    client: string;
    cin: string;
    assignee: string;
    priority: PlanningPriority;
    status: PlanningStatus;
    startsAt: string;
    dueDate: string;
    dayKey: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
    progress: number;
    updatedAt: string;
    nextAction: string;
};

export const planningTasks: PlanningTaskRow[] = [
    {
        id: 1,
        title: 'Collect missing cadastral plan',
        type: 'documents',
        dossierNumber: 'DOS-2026-0001',
        projectObject: 'Villa construction study',
        client: 'Mohamed Ouknin',
        cin: 'EE123456',
        assignee: 'Assistant',
        priority: 'high',
        status: 'active',
        startsAt: 'Today',
        dueDate: 'Today',
        dayKey: 'monday',
        progress: 45,
        updatedAt: 'Today',
        nextAction: 'Call client and request cadastral plan.',
    },
    {
        id: 2,
        title: 'Verify ownership certificate',
        type: 'verification',
        dossierNumber: 'DOS-2026-0001',
        projectObject: 'Villa construction study',
        client: 'Mohamed Ouknin',
        cin: 'EE123456',
        assignee: 'Architect',
        priority: 'normal',
        status: 'pending',
        startsAt: 'Today',
        dueDate: 'Tomorrow',
        dayKey: 'tuesday',
        progress: 10,
        updatedAt: 'Today',
        nextAction: 'Check property title number and document date.',
    },
    {
        id: 3,
        title: 'Prepare contract calculation',
        type: 'contract',
        dossierNumber: 'DOS-2026-0002',
        projectObject: 'Apartment renovation',
        client: 'Salma El Mansouri',
        cin: 'BK884210',
        assignee: 'Manager',
        priority: 'high',
        status: 'active',
        startsAt: 'Yesterday',
        dueDate: 'Wednesday',
        dayKey: 'wednesday',
        progress: 65,
        updatedAt: 'Yesterday',
        nextAction: 'Review HT/TVA/TTC and lock calculation.',
    },
    {
        id: 4,
        title: 'Follow authorization observations',
        type: 'authorization',
        dossierNumber: 'DOS-2026-0005',
        projectObject: 'Office extension',
        client: 'Youssef Ait Lahcen',
        cin: 'JB120045',
        assignee: 'Manager',
        priority: 'urgent',
        status: 'overdue',
        startsAt: 'Last week',
        dueDate: 'Yesterday',
        dayKey: 'thursday',
        progress: 35,
        updatedAt: 'Today',
        nextAction: 'Resolve blocked plan correction with architect.',
    },
    {
        id: 5,
        title: 'Site visit for riad restoration',
        type: 'siteVisit',
        dossierNumber: 'DOS-2026-0004',
        projectObject: 'Riad restoration',
        client: 'Nadia Amrani',
        cin: 'MA778845',
        assignee: 'Architect',
        priority: 'normal',
        status: 'pending',
        startsAt: 'Friday',
        dueDate: 'Friday',
        dayKey: 'friday',
        progress: 0,
        updatedAt: '4 days ago',
        nextAction: 'Confirm visit time with client.',
    },
    {
        id: 6,
        title: 'Archive closed housing permit',
        type: 'archive',
        dossierNumber: 'DOS-2026-0006',
        projectObject: 'Housing permit file',
        client: 'Khadija Bennani',
        cin: 'QW992341',
        assignee: 'Archive',
        priority: 'low',
        status: 'completed',
        startsAt: 'Saturday',
        dueDate: 'Saturday',
        dayKey: 'saturday',
        progress: 100,
        updatedAt: '2 days ago',
        nextAction: 'No action required.',
    },
];

export function getPlanningMetrics() {
    return {
        total: planningTasks.length,
        active: planningTasks.filter((task) => task.status === 'active').length,
        overdue: planningTasks.filter((task) => task.status === 'overdue').length,
        completed: planningTasks.filter((task) => task.status === 'completed').length,
    };
}
