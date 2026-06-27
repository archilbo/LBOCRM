export type ContractStatus = 'draft' | 'generated' | 'signed' | 'cancelled' | string;

export type ContractRow = {
    id: number;
    dossierId: string;
    dossierNumber: string;
    projectObject: string;
    clientName: string;
    clientCin: string;

    contractNumber: string;
    status: ContractStatus;

    surface: number;
    pricePerSquareMeter: number;
    feeRatePercent: number;
    ht: number;
    tva: number;
    ttc: number;

    generatedDocumentPath: string | null;
    pdfPath: string | null;
    generatedAt: string | null;
    signedAt: string | null;
    updatedAt: string | null;
    createdAt: string | null;
    notes: string | null;

    hasGeneratedDocument: boolean;
    hasPdf: boolean;
    generatedDocumentDownloadUrl: string | null;
    pdfDownloadUrl: string | null;
    generatedDocumentPublicUrl: string | null;
    pdfPublicUrl: string | null;
};

export type ContractDossierOption = {
    id: string;
    label: string;
    floorArea: number | null;
    hasContract: boolean;
};

export type ContractFormPayload = {
    dossierId: string;
    status: string;
    surface: string;
    pricePerSquareMeter: string;
    feeRatePercent: string;
    notes: string;
};