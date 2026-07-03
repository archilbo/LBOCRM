export type DocumentStatus = 'uploaded' | 'verified' | 'missing' | 'rejected' | string;

export type DossierDocumentRow = {
    id: number;
    dossierId: number;
    dossierNumber: string | null;
    projectObject: string | null;
    clientName: string | null;
    templateName: string | null;
    documentType: string | null;
    documentNumber: string | null;
    status: DocumentStatus;
    originalFilename: string | null;
    mimeType?: string | null;
    sizeLabel?: string | null;
    uploadedAt: string | null;
    verifiedAt?: string | null;
    downloadUrl?: string | null;
    hasFile?: boolean;
    notes?: string | null;
};

export type DossierOption = {
    id: string;
    label: string;
};

export type DocumentTemplateOption = {
    id: string;
    label: string;
    type?: string | null;
};

export type DocumentUploadPayload = {
    dossierId: string;
    documentTemplateId: string;
    status: string;
    notes: string;
    file: File | null;
};

export type DocumentGroupStats = {
    documentsCount: number;
    uploadedCount: number;
    verifiedCount: number;
    missingCount: number;
    rejectedCount: number;
};

export type DocumentGroupRow = {
    id: number;
    dossierId: number;
    dossierNumber: string | null;
    projectObject: string | null;
    clientName: string | null;
    templateName: string | null;
    documentType: string | null;
    documentNumber: string | null;
    status: DocumentStatus;
    originalFilename: string | null;
    mimeType?: string | null;
    sizeLabel?: string | null;
    uploadedAt: string | null;
    verifiedAt?: string | null;
    downloadUrl?: string | null;
    hasFile?: boolean;
    notes?: string | null;
};

export type DocumentTypeGroup = {
    type: string;
    stats: DocumentGroupStats;
    documents: DocumentGroupRow[];
};

export type DocumentProjectGroup = {
    dossierNumber: string;
    projectObject: string | null;
    stats: DocumentGroupStats;
    types: DocumentTypeGroup[];
};

export type DocumentClientGroup = {
    clientName: string;
    stats: DocumentGroupStats;
    projects: DocumentProjectGroup[];
};

export type DocumentCommuneGroup = {
    commune: string;
    stats: DocumentGroupStats;
    clients: DocumentClientGroup[];
};

export type DocumentLocationGroup = {
    province: string;
    stats: DocumentGroupStats;
    communes: DocumentCommuneGroup[];
};