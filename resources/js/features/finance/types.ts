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

export type FinanceDocType = 'quote' | 'invoice' | 'receipt';

export type FinanceDocStatus =
    | 'draft'
    | 'sent'
    | 'accepted'
    | 'rejected'
    | 'partially_paid'
    | 'paid'
    | 'overdue'
    | 'cancelled';

export type FinanceDocItemRow = {
    id: number;
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

export type PaymentRow = {
    id: number;
    paymentNumber: string;
    amount: number;
    method: string | null;
    reference: string | null;
    paidAt: string | null;
    notes: string | null;
    createdAt: string | null;
};

export type FinanceDocRow = {
    id: number;
    type: FinanceDocType;
    number: string;
    status: FinanceDocStatus;

    clientId: string;
    clientName: string;
    clientCin: string;

    dossierId: string;
    dossierNumber: string;
    projectObject: string;

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

    items: FinanceDocItemRow[];
    payments: PaymentRow[];

    excelPath: string | null;
    pdfPath: string | null;
    generatedAt: string | null;

    downloadUrl: string | null;
    pdfDownloadUrl: string | null;
    hasGeneratedFile: boolean;
    hasPdf: boolean;

    updatedAt: string | null;
    createdAt: string | null;
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
