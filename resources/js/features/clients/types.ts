export type ClientStatus = 'active' | 'inactive' | 'archived';

export type ClientRow = {
    id: number;
    clientNumber: string;
    civility: string;
    firstName: string | null;
    lastName: string | null;
    fullName: string;
    cin: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
    fatherName: string | null;
    motherName: string | null;
    cniExpirationDate: string | null;
    intermediaryId: string;
    intermediaryName: string;
    status: ClientStatus;
    projectsCount: number;
    updatedAt: string | null;
    createdAt?: string | null;
    notes: string | null;
};

export type CinScanResult = {
    document_type: string;
    recto: {
        cin_number: string | null;
        last_name: string | null;
        first_name: string | null;
        date_of_birth: string | null;
        place_of_birth: string | null;
        expiry_date: string | null;
        can_number: string | null;
    };
    verso: {
        sex: string | null;
        civil_status_number: string | null;
        filiation: string | null;
        address: string | null;
    };
};

export type IntermediaryOption = {
    id: string;
    label: string;
};

export type ClientFormPayload = {
    civility: string;
    firstName: string;
    lastName: string;
    cin: string;
    phone: string;
    email: string;
    address: string;
    fatherName: string;
    motherName: string;
    cniExpirationDate: string;
    intermediaryId: string;
    notes: string;
};

export type ClientProjectSummary = {
    id: number;
    clientId: number;
    clientName: string | null;
    dossierNumber: string;
    projectObject: string | null;
    projectAddress: string | null;
    province: string | null;
    commune: string | null;
    floorArea?: number | null;
    status: string;
    workflowStep: string;
    documentsCount: number;
    financeDocumentsCount: number;
    paymentsCount: number;
    quotesTotal: number;
    invoicesTotal: number;
    paidTotal: number;
    remainingTotal: number;
    updatedAt: string | null;
};

export type ClientProjectDocument = {
    id: number;
    name: string;
    status: string;
    documentNumber: string | null;
    originalFilename: string | null;
    mimeType: string | null;
    sizeLabel: string;
    storageLocation: string | null;
    uploadedAt: string | null;
    hasFile: boolean;
    canPreview: boolean;
    viewUrl: string | null;
    printUrl: string | null;
    downloadUrl: string | null;
};

export type ClientProjectFinanceDocument = import('@/features/finance/types').FinanceDocument;

export type ClientProjectPayment = {
    id: number;
    paymentNumber: string;
    paymentKind: 'invoice' | 'advance' | string;
    financeDocumentId: number | null;
    documentNumber: string | null;
    amount: number;
    method: string | null;
    paidAt: string | null;
    canDelete: boolean;
    deleteUrl: string | null;
};

export type DossierWorkflowRequirement = {
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

export type DossierWorkflowStep = {
    key: string;
    order: number;
    label: string;
    description: string | null;
    status: 'pending' | 'in_progress' | 'completed' | 'blocked' | string;
    statusLabel: string;
    done: number;
    total: number;
    requirements: DossierWorkflowRequirement[];
    primaryActionLabel: string | null;
    primaryActionUrl: string | null;
};

export type DossierWorkflowProgress = {
    completed: number;
    total: number;
    percent: number;
    currentStep: string | null;
    steps: DossierWorkflowStep[];
};

export type ClientProjectContract = {
    id: number;
    number: string;
    status: string;
    surface: number | null;
    pricePerSquareMeter: number | null;
    calculationMode: string | null;
    feeRatePercent: number | null;
    forfaitTtc: number | null;
    ttc: number;
    notes: string | null;
    createdAt: string | null;
    generatedAt: string | null;
    signedAt: string | null;
};

export type ClientProjectArchiveRecord = {
    id: number;
    archiveNumber: string;
    status: string;
    inDate: string | null;
    outDate: string | null;
    returnedAt: string | null;
};

export type DossierTimelineEvent = {
    date: string | null;
    type: 'document' | 'contract' | 'finance' | 'payment' | 'archive';
    label: string;
    description: string;
    status: string;
};

export type ClientSelectedProjectWorkspace = ClientProjectSummary & {
    currency: string;
    contract: ClientProjectContract | null;
    documents: ClientProjectDocument[];
    financeDocuments: ClientProjectFinanceDocument[];
    payments: ClientProjectPayment[];
    financeEligibility: {
        canCreateInvoice: boolean;
        canCreateQuote: boolean;
        canRecordAdvance: boolean;
        invoiceId: number | null;
        acceptedQuoteId: number | null;
        paymentReason: string | null;
    };
    archiveRecord: ClientProjectArchiveRecord | null;
    workflow: DossierWorkflowProgress | null;
    timeline: DossierTimelineEvent[];
};

export type ClientWorkspace = {
    client: {
        id: number;
        clientNumber: string;
        fullName: string;
        cin: string | null;
        phone: string | null;
        email: string | null;
        address: string | null;
        status: string;
        intermediaryName: string | null;
    };
    projects: ClientProjectSummary[];
    selectedProject: ClientSelectedProjectWorkspace | null;
};
