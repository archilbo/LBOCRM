const STORAGE_KEY = 'archilbo_upload_batches';

interface PersistedBatch {
    batchId: string;
    clientUploadId: string;
    dossierId: number;
    dossierName?: string;
    operation: string;
    submissionIntent: string;
    uploadSessionId?: number;
    files: {
        clientFileUploadId: string;
        assetType: string;
        originalFilename: string;
        sizeBytes: number;
        mimeType?: string;
        transferStatus: string;
        processingStatus: string;
    }[];
    totalBytes: number;
    overallStatus: string;
    processingProgress: number;
    processingStage?: string;
    createdAt: string;
    errorCode?: string;
    errorMessage?: string;
}

export function persistBatches(batches: PersistedBatch[]): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(batches));
    } catch {
        // Storage full or unavailable
    }
}

export function loadPersistedBatches(): PersistedBatch[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        return JSON.parse(raw);
    } catch {
        return [];
    }
}

export function clearPersistedBatches(): void {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch {
        // ignore
    }
}
