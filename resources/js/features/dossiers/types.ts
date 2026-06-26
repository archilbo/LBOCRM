export type DossierStatus = 'opened' | 'active' | 'closed' | 'archived' | string;

export type DossierRow = {
    id: number;
    clientId: string;
    clientName: string;
    clientNumber: string;
    clientCin: string;
    clientPhone: string;

    dossierNumber: string;
    projectObject: string;
    description: string | null;

    projectAddress: string | null;
    province: string | null;
    commune: string | null;

    landTitleNumber: string | null;
    landSurface: number | null;
    floorArea: number | null;

    status: DossierStatus;
    workflowStep: string;
    openedAt: string | null;
    closedAt: string | null;
    updatedAt: string | null;
    createdAt: string | null;
    notes: string | null;

    documentsCount: number;
    financeRecordsCount: number;
    hasContract: boolean;
    hasAuthorization: boolean;
    hasArchiveRecord: boolean;
};

export type ClientOption = {
    id: string;
    label: string;
};

export type DossierFormPayload = {
    clientId: string;
    projectObject: string;
    description: string;
    projectAddress: string;
    province: string;
    commune: string;
    landTitleNumber: string;
    landSurface: string;
    floorArea: string;
    status: string;
    workflowStep: string;
    notes: string;
};