export type DossierStatus = 'opened' | 'active' | 'closed' | 'archived' | string;

export type City = {
    id: number;
    name: string;
    code: string;
    color: string;
};

export type DossierLocationOptions = {
    provinces: string[];
    communes: string[];
};

export type DossierRow = {
    id: number;
    /** Deprecated compatibility aliases for the primary client. */
    clientId: string;
    clientName: string;
    clientNumber: string;
    clientCin: string;
    clientPhone: string;
    clients: DossierClientSummary[];
    primaryClientId: string;
    intermediaryId: string;
    intermediaryName: string | null;

    dossierNumber: string;
    sequenceNumber: number | null;
    period: string | null;
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
    updatedAtSort: string | null;
    createdAt: string | null;
    notes: string | null;

    documentsCount: number;
    financeRecordsCount: number;
    hasContract: boolean;
    hasArchiveRecord: boolean;

    city: City | null;
};

export type DossierClientSummary = {
    id: string;
    fullName: string;
    clientNumber: string | null;
    cin: string | null;
    phone: string | null;
    isPrimary: boolean;
};

export type ClientOption = {
    id: string;
    label: string;
};

export type DossierFormPayload = {
    clientIds: string[];
    primaryClientId: string;
    intermediaryId: string;
    cityId: string;
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

export type DossierLocationStats = {
    projectsCount: number;
    openCount: number;
    closedCount: number;
    documentsCount: number;
    financeDocumentsCount: number;
    invoicesTotal: number;
    paidTotal: number;
    remainingTotal: number;
};

export type DossierLocationRow = {
    id: number;
    clientId: number;
    ownerName: string | null;
    clientNumber: string | null;
    dossierNumber: string;
    projectObject: string | null;
    projectAddress: string | null;
    province: string | null;
    commune: string | null;
    status: string;
    workflowStep: string;
    documentsCount: number;
    financeDocumentsCount: number;
    invoicesTotal: number;
    paidTotal: number;
    remainingTotal: number;
};

export type DossierCommuneGroup = {
    commune: string;
    stats: DossierLocationStats;
    dossiers: DossierLocationRow[];
};

export type DossierLocationGroup = {
    province: string;
    stats: DossierLocationStats;
    communes: DossierCommuneGroup[];
};
