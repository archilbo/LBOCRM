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
    calculationMode: 'percentage' | 'forfait' | string;
    feeRatePercent: number;
    forfaitTtc: number | null;
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

export type ContractClientOption = {
    id: number;
    fullName: string;
    cin: string;
    dossiers: ContractDossierOption[];
};

export type ContractFormPayload = {
    dossier_id: string;
    status: string;
    surface: string;
    price_per_square_meter: string;
    calculation_mode: string;
    fee_rate_percent: string;
    forfait_ttc: string;
    notes: string;
};
