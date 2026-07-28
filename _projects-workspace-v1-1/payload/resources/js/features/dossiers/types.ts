export type DossierStatus = 'opened' | 'active' | 'closed' | 'archived' | string;

export type City = {
    id: number;
    name: string;
    code: string;
    color: string;
};

export type DossierRow = {
    id: number;
    clientId: string;
    clientName: string;
    clientNumber: string;
    clientCin: string;
    clientPhone: string;

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
    updatedAtIso: string | null;
    createdAt: string | null;
    notes: string | null;

    documentsCount: number;
    financeDocumentsCount: number;
    hasContract: boolean;
    hasArchiveRecord: boolean;
    city: City | null;
};

export type ClientOption = {
    id: string;
    label: string;
};

export type DossierFormPayload = {
    clientId: string;
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

export type ProjectMonthlyCount = {
    month: string;
    count: number;
};

export type ProjectDocumentSummary = {
    id: number;
    name: string;
    documentNumber: string | null;
    documentType: string | null;
    status: string;
    fileName: string | null;
    uploadedAt: string | null;
    verifiedAt: string | null;
    downloadUrl: string | null;
    notes: string | null;
};

export type ProjectContractSummary = {
    id: number;
    contractNumber: string;
    status: string;
    surface: number;
    pricePerSquareMeter: number;
    feeRatePercent: number;
    calculationMode: string;
    forfaitTtc: number;
    ht: number;
    tva: number;
    ttc: number;
    notes: string | null;
    generatedAt: string | null;
    signedAt: string | null;
    createdAt: string | null;
    hasGeneratedDoc: boolean;
    hasPdf: boolean;
} | null;

export type ProjectFinanceDocumentSummary = {
    id: number;
    type: string;
    number: string;
    status: string;
    issueDate: string | null;
    dueDate: string | null;
    totalTtc: number;
    paidTotal: number;
    remainingTotal: number;
    currency: string;
    generatedAt: string | null;
};

export type ProjectPaymentSummary = {
    id: number;
    paymentNumber: string;
    amount: number;
    method: string | null;
    reference: string | null;
    paidAt: string | null;
    documentNumber: string | null;
};

export type ProjectArchiveSummary = {
    id: number;
    archiveNumber: string;
    status: string;
    room: string | null;
    shelf: string | null;
    box: string | null;
    folder: string | null;
    inDate: string | null;
    outDate: string | null;
    returnedAt: string | null;
    requestedBy: string | null;
    notes: string | null;
    isOverdue: boolean;
    isLost: boolean;
    lostReason: string | null;
    locationLabel: string;
} | null;

export type ProjectActivityType =
    | 'project_created'
    | 'project_updated'
    | 'workflow_updated'
    | 'document_created'
    | 'document_updated'
    | 'contract_created'
    | 'contract_updated'
    | 'contract_generated'
    | 'contract_signed'
    | 'finance_document_created'
    | 'finance_document_updated'
    | 'payment_recorded'
    | 'archive_created'
    | 'archive_updated';

export type ProjectActivityItem = {
    id: string;
    type: ProjectActivityType;
    subject: string;
    status: string | null;
    amount: number | null;
    occurredAt: string;
    occurredAtLabel: string;
    href: string | null;
};
