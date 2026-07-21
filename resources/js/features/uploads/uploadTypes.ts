export type UploadOperation = 'new_file' | 'new_version' | 'add_review_asset' | 'add_supporting_asset';

export type AssetType = 'source' | 'review_pdf' | 'image' | 'ifc' | 'supporting';

export type TransferStatus = 'queued' | 'preparing' | 'uploading' | 'paused' | 'retrying' | 'transferred' | 'canceled' | 'failed';

export type ProcessingStatus = 'waiting' | 'validating' | 'checksum' | 'scanning' | 'finalizing' | 'generating_preview' | 'ready' | 'failed';

export type UploadOverallStatus = 'queued' | 'uploading' | 'processing' | 'completed' | 'needs_attention' | 'canceled' | 'failed';

export type ErrorCode = 'network_disconnected' | 'upload_expired' | 'permission_denied' | 'file_too_large' | 'unsupported_type' | 'mime_mismatch' | 'server_storage_full' | 'checksum_failed' | 'scan_failed' | 'finalization_failed' | 'preview_failed' | 'session_expired' | 'unknown';

export interface UploadSessionFile {
    clientFileUploadId: string;
    assetType: AssetType;
    originalFilename: string;
    sizeBytes: number;
    mimeType?: string;
    extension?: string;
    tusUploadId?: string;
    transferredBytes: number;
    transferStatus: TransferStatus;
    processingStatus: ProcessingStatus;
    errorCode?: ErrorCode;
    errorMessage?: string;
    speedBps?: number;
    eta?: number;
}

export interface UploadBatch {
    batchId: string;
    clientUploadId: string;
    dossierId: number;
    dossierName?: string;
    operation: UploadOperation;
    submissionIntent: 'draft' | 'submit';
    uploadSessionId?: number;
    tusEndpoint?: string;
    files: UploadSessionFile[];
    totalBytes: number;
    transferredBytes: number;
    overallStatus: UploadOverallStatus;
    processingProgress: number;
    processingStage?: string;
    createdAt: string;
    completedAt?: string;
    errorCode?: ErrorCode;
    errorMessage?: string;
}

export interface UploadSessionResponse {
    uploadSessionId: number;
    uuid: string;
    clientUploadId: string;
    tusEndpoint: string;
    expiresAt: string;
    maximumSize: number;
    allowedAssetTypes: string[];
    files: {
        clientFileUploadId: string;
        assetType: AssetType;
        originalFilename: string;
        sizeBytes: number;
    }[];
}

export interface ProcessingProgressEvent {
    eventId: string;
    uploadSessionId: number;
    projectId: number;
    stage: string;
    progress: number;
    message?: string;
    assetId?: string;
    versionId?: string;
    occurredAt: string;
}
