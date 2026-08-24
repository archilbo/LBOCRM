export type ClientStatus = 'active' | 'inactive' | 'archived';
export type ClientType = 'person' | 'company';

export type ClientRow = {
    id: number;
    clientNumber: string;
    clientType: ClientType;
    civility: string;
    firstName: string | null;
    lastName: string | null;
    fullName: string;
    companyName: string | null;
    cin: string | null;
    ice: string | null;
    managers: string[];
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
    updatedAtSort: string | null;
    createdAt?: string | null;
    notes: string | null;
    capabilities: {
        view: boolean;
        update: boolean;
        delete: boolean;
        updateStatus: boolean;
    };
};

export type {
    CinScanResult,
    CinScannedField,
    CinFieldStatus,
    CinDocumentGeneration,
} from '@/features/clients/cin-scanner/types';

export type IntermediaryOption = {
    id: string;
    label: string;
};

export type ClientFormPayload = {
    clientType: ClientType;
    civility: string;
    firstName: string;
    lastName: string;
    companyName: string;
    cin: string;
    ice: string;
    managers: string[];
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
    expectedTotal: number;
    expectedPaidTotal: number;
    expectedRemainingTotal: number;
    invoicesTotal: number;
    paidTotal: number;
    remainingTotal: number;
    negotiatedPaymentLines: import('@/features/finance/types').NegotiatedPaymentLine[];
    updatedAt: string | null;
};

export type ClientProjectDocument = {
    id: number;
    name: string;
    status: string;
    documentNumber: string | null;
    originalFilename: string | null;
    mimeType: string | null;
    sizeLabel: string | null;
    storageLocation: string | null;
    uploadedAt: string | null;
    hasFile: boolean;
    canPreview: boolean;
    viewUrl: string | null;
    contentUrl: string | null;
    printUrl: string | null;
    downloadUrl: string | null;
};

export type ClientProjectFinanceDocument = import('@/features/finance/types').FinanceDocument;

export type ClientProjectPayment = {
    id: number;
    paymentNumber: string;
    paymentKind: 'invoice' | 'advance' | 'negotiated_advance' | string;
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
    hasFile: boolean;
    clientCins?: Array<{
        clientId: string;
        fullName: string;
        cin: string | null;
        isPrimary: boolean;
        hasFront: boolean;
        hasBack: boolean;
        complete: boolean;
    }>;
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

export type ClientContractSummary = {
    id: number;
    dossierId: string;
    dossierNumber: string;
    projectObject: string | null;
    contractNumber: string;
    status: string;
    surface: number | null;
    pricePerSquareMeter: number | null;
    feeRatePercent: number | null;
    calculationMode: string | null;
    forfaitTtc: number | null;
    ht: number;
    tva: number;
    ttc: number;
    financeTtc: number;
    customFinanceTtc: number | null;
    generatedAt: string | null;
    signedAt: string | null;
    createdAt: string | null;
    notes: string | null;
    hasGeneratedDocument: boolean;
    hasPdf: boolean;
    generatedDocumentDownloadUrl: string | null;
    pdfDownloadUrl: string | null;
    pdfPublicUrl: string | null;
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
    financeTtc: number;
    customFinanceTtc: number | null;
    notes: string | null;
    createdAt: string | null;
    generatedAt: string | null;
    signedAt: string | null;
};

export type ClientProjectArchiveRecord = {
    id: number;
    archiveNumber: string;
    status: string;
    city: {
        id: number;
        name: string;
        color: string;
    } | null;
    inDate: string | null;
    outDate: string | null;
    returnedAt: string | null;
};

export type DossierTimelineEvent = {
    date: string | null;
    type: 'document' | 'contract' | 'finance' | 'payment' | 'archive';
    action: 'documentUploaded' | 'contractCreated' | 'contractGenerated' | 'contractSigned' | 'financeDocumentCreated' | 'paymentRecorded' | 'archiveRecordCreated' | 'archiveFileStored';
    description: string;
    status: string;
    actorName?: string | null;
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
    cahier: {
        number: string;
        receivedAt: string;
        deliveredAt: string | null;
    } | null;
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
    contracts: ClientContractSummary[];
    /**
     * Client-scoped Document Explorer payload: all documents from ALL of the
     * Client's Projects (uploaded files + generated Contract/Fiche
     * artifacts), backend-scoped and source-deduplicated.
     */
    explorer: {
        context: import('@/features/documents/explorer/documentExplorerTypes').ExplorerContext;
        documents: import('@/features/documents/explorer/documentExplorerTypes').ExplorerDocumentPayload[];
    };
};
