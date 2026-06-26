export type FinanceDocumentType = 'quote' | 'invoice' | 'receipt';

export type FinanceDocumentStatus =
    | 'draft'
    | 'sent'
    | 'accepted'
    | 'rejected'
    | 'converted'
    | 'issued'
    | 'partially_paid'
    | 'paid'
    | 'overdue'
    | 'cancelled';

export type FinanceDocumentItem = {
    id?: number;
    position: number;
    title: string;
    description: string | null;
    quantity: number;
    unit: string | null;
    unitPrice: number;
    discountRate: number;
    tvaRate: number;
    totalHt: number;
    totalTva: number;
    totalTtc: number;
};

export type FinanceDocument = {
    id: number;
    type: FinanceDocumentType;
    typeLabel: string;
    number: string;
    status: FinanceDocumentStatus;
    client: { id: number | string; name: string; cin?: string | null; address?: string | null } | null;
    dossier: {
        id: number | string;
        number: string;
        projectObject?: string | null;
        address?: string | null;
        floorArea?: number | string | null;
        landSurface?: number | string | null;
    } | null;
    sourceDocumentId: number | null;
    issueDate: string | null;
    dueDate: string | null;
    validUntil: string | null;
    currency: string;
    tvaRate: number;
    subtotalHt: number;
    discountTotal: number;
    taxTotal: number;
    totalTtc: number;
    paidTotal: number;
    remainingTotal: number;
    notes: string | null;
    terms: string | null;
    templateId: number | string | null;
    pdfPath: string | null;
    excelPath: string | null;
    generatedAt: string | null;
    items: FinanceDocumentItem[];
    payments?: Payment[];
    paymentsCount: number;
    createdAt?: string | null;
    updatedAt?: string | null;
    showUrl?: string | null;
    updateUrl?: string | null;
    deleteUrl?: string | null;
    acceptUrl?: string | null;
    rejectUrl?: string | null;
    cancelUrl?: string | null;
    convertToInvoiceUrl?: string | null;
    generateUrl?: string | null;
    downloadUrl?: string | null;
    pdfDownloadUrl?: string | null;
    paymentUrl?: string | null;
};

export type FinanceSettings = {
    defaultTvaRate: number;
    defaultCurrency: string;
    defaultPaymentTermsDays: number;
    defaultQuoteValidityDays: number;
    defaultUnitPriceM2: number;
    defaultArchitectRate: number;
    companyInfo: Record<string, string | null>;
    bankInfo: Record<string, string | null>;
};

export type ClientOption = {
    id: string;
    label: string;
    cin?: string | null;
    address?: string | null;
};

export type DossierOption = {
    id: string;
    label: string;
    clientId: string;
    projectObject?: string | null;
    address?: string | null;
    floorArea?: number | string | null;
    landSurface?: number | string | null;
};

export type TemplateOption = {
    id: string;
    label: string;
    type: FinanceDocumentType | string;
};

export type Payment = {
    id: number;
    paymentNumber: string;
    amount: number;
    method: string | null;
    reference: string | null;
    paidAt: string | null;
    notes: string | null;
    document?: { id: number; number: string; type: string } | null;
    client?: { id: number; name: string } | null;
    dossier?: { id: number; number: string } | null;
    receiptDocumentId?: number | null;
    createdAt?: string | null;
};

export type FinanceRecordType = 'devis' | 'invoice' | 'payment' | string;

export type FinanceRecordStatus =
    | 'draft'
    | 'sent'
    | 'paid'
    | 'partially_paid'
    | 'overdue'
    | 'cancelled'
    | string;

export type FinanceRecordRow = {
    id: number;
    dossierId: string;
    clientId: string;
    dossierNumber: string;
    projectObject: string;
    clientName: string;
    clientCin: string;
    recordNumber: string;
    type: FinanceRecordType;
    status: FinanceRecordStatus;
    ht: number;
    tva: number;
    totalTtc: number;
    paid: number;
    remaining: number;
    issuedAt: string | null;
    dueDate: string | null;
    paidAt: string | null;
    notes: string | null;
    updatedAt: string | null;
    createdAt: string | null;
    generatedFilePath: string | null;
    generatedPdfPath: string | null;
    generatedAt: string | null;
    downloadUrl: string;
    pdfDownloadUrl: string;
    hasGeneratedFile: boolean;
    hasPdf: boolean;
};

export type FinanceDossierOption = {
    id: string;
    label: string;
    clientName: string;
};

export type FinanceFormPayload = {
    dossierId: string;
    type: string;
    status: string;
    ht: string;
    tva: string;
    totalTtc: string;
    paid: string;
    issuedAt: string;
    dueDate: string;
    paidAt: string;
    notes: string;
};
