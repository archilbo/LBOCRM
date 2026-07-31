export type CinDocumentGeneration =
    | 'old_2008'
    | 'new_2020'
    | 'unknown';

export type CinFieldStatus =
    | 'verified'
    | 'review'
    | 'unreadable';

export type CinFieldSource =
    | 'front_printed'
    | 'back_printed'
    | 'mrz'
    | 'barcode'
    | 'arabic_crosscheck'
    | 'multiple'
    | 'unknown';

export type CinScannedField = {
    value: string | null;
    status: CinFieldStatus;
    confidence: number;
    sources: CinFieldSource[];
    warnings: string[];
};

export type CinImageQuality = {
    score: number;
    isReadable: boolean;
    width: number;
    height: number;
    problems: string[];
};

export type CinMrzResult = {
    detected: boolean;
    valid: boolean;
    lines: string[];
    documentType: string | null;
    issuingCountry: string | null;
    documentNumber: string | null;
    personalNumber: string | null;
    birthDate: string | null;
    sex: string | null;
    expiryDate: string | null;
    nationality: string | null;
    lastName: string | null;
    firstName: string | null;
    checks: {
        documentNumber: boolean;
        birthDate: boolean;
        expiryDate: boolean;
        composite: boolean;
    };
    warnings: string[];
};

export type CinScanResult = {
    success: true;
    scanId: string;
    document: {
        type: 'moroccan_cin';
        generation: CinDocumentGeneration;
        frontDetected: boolean;
        backDetected: boolean;
        imagesSwapped: boolean;
        sameCard: boolean;
        sameCardConfidence: number;
        confidence: number;
    };
    quality: {
        front: CinImageQuality;
        back: CinImageQuality;
    };
    mrz: CinMrzResult;
    fields: {
        cinNumber: CinScannedField;
        documentNumber: CinScannedField;
        canNumber: CinScannedField;
        firstName: CinScannedField;
        lastName: CinScannedField;
        birthDate: CinScannedField;
        birthPlace: CinScannedField;
        expiryDate: CinScannedField;
        sex: CinScannedField;
        civilStatusNumber: CinScannedField;
        fatherName: CinScannedField;
        motherName: CinScannedField;
        address: CinScannedField;
    };
    warnings: string[];
};

export type CinScanErrorResponse = {
    success?: false;
    error?: string;
    message?: string;
    scanId?: string;
    errors?: Record<string, string[]>;
};
