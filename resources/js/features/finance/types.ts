
export type FinanceDocumentLockState = {
    isLocked: boolean;
    lockedAt: string | null;
    lockedAtFormatted: string | null;
    message: string;
    blockedFields: string[];
    canEditNumberFields: boolean;
    canRegenerateExports: boolean;
    canGeneratePdf: boolean;
    canGenerateExcel: boolean;
};
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

export type FinanceDocumentLock = {
    isLocked: boolean;
    lockedAt: string | null;
    lockedAtFormatted: string | null;
    message: string;
    blockedFields: string[];
    canEditNumberFields: boolean;
    canRegenerateExports: boolean;
    canGeneratePdf: boolean;
    canGenerateExcel: boolean;
};

export type FinanceDocumentItem = {
    id?: number;
    position: number;
    title: string;
    description: string | null;
    quantity: number;
    unit: string | null;
    unitPrice: number;
    totalHt: number;
    totalTva: number;
    totalTtc: number;
};

export type FinanceDocument = {
    id: number;
    type: FinanceDocumentType;
    typeLabel: string;
    number: string;
    numberLocked?: boolean;
    numberLockedAt?: string | null;
    lock?: FinanceDocumentLock | null;
    status: FinanceDocumentStatus;
    statusLabel?: string;
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
    convertedToDocumentId?: number | null;
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
    receivable?: {
        total: number;
        paid: number;
        outstanding: number;
        dueState: 'paid' | 'upcoming' | 'due_today' | 'overdue';
        daysOverdue: number;
        agingBucket: 'current' | '1_7' | '8_30' | '31_60' | '61_plus';
        nextPaymentDue: string | null;
    } | null;
    paymentScheduleItems?: Array<{ id: number; label: string; amount: number; paid: number; outstanding: number; dueDate: string; position: number; status: 'paid' | 'upcoming' | 'overdue'; daysOverdue: number }>;
    paymentPromises?: Array<{ id: number; amount: number; promisedFor: string | null; status: 'active' | 'fulfilled' | 'broken' | 'cancelled'; note: string | null }>;
    notes: string | null;
    terms: string | null;
    templateId: number | string | null;
    issuedAt?: string | null;
    snapshotHash?: string | null;
    generatedAt: string | null;
    items: FinanceDocumentItem[];
    payments?: Payment[];
    paymentsCount: number;
    createdAt?: string | null;
    updatedAt?: string | null;
    showUrl?: string | null;
    viewUrl?: string | null;
    viewPdfUrl?: string | null;
    printUrl?: string | null;
    updateUrl?: string | null;
    deleteUrl?: string | null;
    acceptUrl?: string | null;
    rejectUrl?: string | null;
    cancelUrl?: string | null;
    convertToInvoiceUrl?: string | null;
    hasPdf?: boolean;
    hasExcel?: boolean;
    generateUrl?: string | null;
    generatePdfUrl?: string | null;
    generateExcelUrl?: string | null;
    downloadUrl?: string | null;
    excelDownloadUrl?: string | null;
    pdfDownloadUrl?: string | null;
    revealFilesUrl?: string | null;
    paymentUrl?: string | null;
};

export type DocumentTemplate = {
    id: number;
    type: FinanceDocumentType;
    typeLabel: string;
    name: string;
    slug: string;
    isDefault: boolean;
    paperSize: 'A4' | 'A5' | 'Letter' | string;
    orientation: 'portrait' | 'landscape' | string;
    headerHtml: string;
    bodyHtml: string;
    footerHtml: string;
    css: string;
    settings: Record<string, unknown>;
    logoPath: string;
    createdAt?: string | null;
    updatedAt?: string | null;
    urls: {
        update: string;
        rename: string;
        delete: string;
        duplicate: string;
        setDefault: string;
        preview: string;
        versions?: string;
        snapshot?: string;
    };
};

export type TemplatePlaceholder = {
    group: string;
    items: string[];
};

export type TemplatePreviewData = {
    html: string;
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
    /** Primary client kept for old consumers; clientIds is the membership source of truth. */
    clientId: string;
    clientIds?: string[];
    projectObject?: string | null;
    financeTtc?: number | null;
    address?: string | null;
    floorArea?: number | string | null;
    landSurface?: number | string | null;
    negotiatedPaymentLines?: NegotiatedPaymentLine[];
};

export type NegotiatedPaymentLine = {
    id: string;
    designation: string;
    negotiatedAmount: number;
    paidAmount: number;
    remainingAmount: number;
    payments: Array<{
        id: string;
        amount: number;
        method: string | null;
        paidAt: string | null;
        reference: string | null;
    }>;
};

export type TemplateOption = {
    id: string;
    label: string;
    type: FinanceDocumentType | string;
    slug?: string;
    isDefault?: boolean;
    updatedAt?: string | null;
    renameUrl?: string;
    editorUrl?: string;
};

export type PaymentReceiptUrls = {
    show: string | null;
    view: string | null;
    print: string | null;
    download: string | null;
    pdf: string | null;
    excel: string | null;
    generatePdf: string | null;
    generateExcel: string | null;
};

export type PaymentReceipt = {
    id: number;
    number: string;
    type: 'receipt' | string;
    status: FinanceDocumentStatus | string;
    issueDate: string | null;
    amount: number;
    urls: PaymentReceiptUrls;
};

export type Payment = {
    id: number;
    paymentNumber: string;
    paymentKind?: 'invoice' | 'advance' | 'negotiated_advance' | string;
    financeDocumentId?: number | null;
    dossierNegotiatedPaymentLineId?: number | null;
    amount: number;
    method: string | null;
    reference: string | null;
    paidAt: string | null;
    notes: string | null;
    document?: {
        id: number;
        number: string;
        type: string;
        status?: string;
        totalTtc?: number;
        paidTotal?: number;
        remainingTotal?: number;
    } | null;
    client?: { id: number; name: string } | null;
    dossier?: { id: number; number: string } | null;
    negotiatedPaymentLine?: { id: number; designation: string; negotiatedAmount: number } | null;
    receiptDocumentId?: number | null;
    receipt?: PaymentReceipt | null;
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
    clientId?: string;
    clientIds?: string[];
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

export type FinanceMonthDocumentRow = {
    id: number;
    type: FinanceDocumentType | string;
    number: string;
    status: FinanceDocumentStatus | string;
    clientName: string | null;
    dossierNumber: string | null;
    province: string | null;
    commune: string | null;
    issueDate: string | null;
    totalTtc: number;
    paidTotal: number;
    remainingTotal: number;
};

export type FinanceMonthPaymentRow = {
    id: number;
    paymentNumber: string;
    documentNumber: string | null;
    clientName: string | null;
    dossierNumber: string | null;
    province: string | null;
    commune: string | null;
    amount: number;
    method: string | null;
    paidAt: string | null;
};

export type Expense = {
    id: number;
    category: string;
    vendor: string | null;
    amount: number;
    currency: string;
    expenseDate: string;
    paymentMethod: string | null;
    notes: string | null;
    dossier: { id: number; number: string } | null;
    createdBy: string | null;
    createdAt: string | null;
};

export type FinanceMonthSummary = {
    year: number;
    month: number;
    key: string;
    label: string;
    currency: string;
    quotesCount: number;
    invoicesCount: number;
    receiptsCount: number;
    paymentsCount: number;
    quotesTotalTtc: number;
    invoicesTotalTtc: number;
    receiptsTotalTtc: number;
    paidTotal: number;
    expensesTotal: number;
    expensesCount: number;
    remainingTotal: number;
    overdueTotal: number;
    subtotalHt: number;
    taxTotal: number;
    totalTtc: number;
    documents: FinanceMonthDocumentRow[];
    payments: FinanceMonthPaymentRow[];
};
