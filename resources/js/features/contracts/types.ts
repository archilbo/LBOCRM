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
    architectFeeOptionId: string | null;
    architectFeeLabel: string | null;
    contractTemplateKey: string | null;
    forfaitTtc: number | null;
    ht: number;
    tva: number;
    ttc: number;
    financeTtc: number;
    customFinanceTtc: number | null;

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

export type ArchitectFeeOption = {
    id: string;
    name: string;
    calculationType: 'percentage' | 'forfait';
    percentageRate: string | null;
    flatAmount: string | null;
    contractTemplateKey: string;
    contractTemplateName: string;
    isDefault: boolean;
    isActive: boolean;
};

export type ContractDossierOption = {
    id: string;
    label: string;
    floorArea?: number | string;
    hasContract: boolean;
    clients: ContractDossierClient[];
};

export type ContractDossierClient = {
    id: string;
    civility: string;
    fullName: string;
    cin: string;
    address: string;
    isPrimary: boolean;
};

export type ContractClientOption = {
    id: string;
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
    architect_fee_option_id: string;
    fee_rate_percent: string;
    forfait_ttc: string;
    finance_ttc: string;
    notes: string;
};
