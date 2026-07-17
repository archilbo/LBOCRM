export type WorkflowRequirement = {
    key: string;
    label: string;
    done: boolean;
    manual: boolean;
    notes: string | null;
    checkedAt: string | null;
    checkedBy: string | null;
    actionLabel: string | null;
    actionUrl: string | null;
};

export type WorkflowStep = {
    key: string;
    order: number;
    label: string;
    description: string | null;
    status: 'pending' | 'in_progress' | 'completed' | 'blocked' | string;
    statusLabel: string;
    done: number;
    total: number;
    requirements: WorkflowRequirement[];
    primaryActionLabel: string | null;
    primaryActionUrl: string | null;
};

export type WorkflowData = {
    completed: number;
    total: number;
    percent: number;
    currentStep: string | null;
    steps: WorkflowStep[];
};
