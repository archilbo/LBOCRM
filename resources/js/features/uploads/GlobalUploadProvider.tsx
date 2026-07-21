import { createContext, useState, useCallback, useRef, useEffect, type ReactNode } from 'react';
import type Uppy from '@uppy/core';
import { createGlobalUppy } from './uploadManager';
import { createUploadSession, finalizeUploadSession, cancelUploadSession } from './uploadApi';
import { persistBatches, loadPersistedBatches } from './uploadPersistence';
import type { UploadBatch, UploadSessionFile, UploadOverallStatus, TransferStatus } from './uploadTypes';

export interface GlobalUploadContextValue {
    batches: UploadBatch[];
    isDockVisible: boolean;
    minimized: boolean;
    toggleMinimized: () => void;
    dockBadge: { active: number; pct: number };

    startBatch: (dossierId: number, sessionId: number, tusEndpoint: string, fileRefs: { id: string; file: File }[], meta: {
        clientUploadId: string; operation: string; submissionIntent: string; dossierName?: string;
        files: { clientFileUploadId: string; assetType: string; originalFilename: string; sizeBytes: number; }[];
    }) => void;

    pauseFile: (batchId: string, clientFileUploadId: string) => void;
    resumeFile: (batchId: string, clientFileUploadId: string) => void;
    cancelBatch: (dossierId: number, batchId: string) => Promise<void>;
    retryFile: (batchId: string, clientFileUploadId: string) => void;
    removeCompleted: (batchId: string) => void;

    updateProcessingProgress: (sessionId: number, stage: string, progress: number, message?: string) => void;
    openUploadCenter: () => void;
}

export const GlobalUploadContext = createContext<GlobalUploadContextValue | null>(null);

let uppyInstance: Uppy | null = null;

function getUppy(tusEndpoint: string): Uppy {
    if (!uppyInstance) {
        uppyInstance = createGlobalUppy(tusEndpoint);
    }
    return uppyInstance;
}

export function GlobalUploadProvider({ children, onOpenUploadCenter }: { children: ReactNode; onOpenUploadCenter?: () => void }) {
    const [batches, setBatches] = useState<UploadBatch[]>(() => loadPersistedBatches().map(restoreBatch));
    const [minimized, setMinimized] = useState(true);
    const pollTimers = useRef<Map<string, ReturnType<typeof setInterval>>>(new Map());

    useEffect(() => {
        persistBatches(batches.map(s => ({
            batchId: s.batchId,
            clientUploadId: s.clientUploadId,
            dossierId: s.dossierId,
            dossierName: s.dossierName,
            operation: s.operation,
            submissionIntent: s.submissionIntent,
            uploadSessionId: s.uploadSessionId,
            files: s.files.map(f => ({
                clientFileUploadId: f.clientFileUploadId,
                assetType: f.assetType,
                originalFilename: f.originalFilename,
                sizeBytes: f.sizeBytes,
                transferStatus: f.transferStatus,
                processingStatus: f.processingStatus,
            })),
            totalBytes: s.totalBytes,
            overallStatus: s.overallStatus,
            processingProgress: s.processingProgress,
            processingStage: s.processingStage,
            createdAt: s.createdAt,
            errorCode: s.errorCode,
            errorMessage: s.errorMessage,
        })));
    }, [batches]);

    const updateBatch = useCallback((batchId: string, updater: (b: UploadBatch) => UploadBatch) => {
        setBatches(prev => prev.map(b => b.batchId === batchId ? updater(b) : b));
    }, []);

    const updateFile = useCallback((batchId: string, clientFileUploadId: string, updater: (f: UploadSessionFile) => UploadSessionFile) => {
        setBatches(prev => prev.map(b => {
            if (b.batchId !== batchId) return b;
            return { ...b, files: b.files.map(f => f.clientFileUploadId === clientFileUploadId ? updater(f) : f) };
        }));
    }, []);

    const isDockVisible = batches.some(b =>
        b.overallStatus === 'queued' || b.overallStatus === 'uploading' || b.overallStatus === 'processing' || b.overallStatus === 'needs_attention'
    );

    const activeCount = batches.filter(b => b.overallStatus === 'uploading' || b.overallStatus === 'processing').length;
    const totalBytes = batches.reduce((s, b) => s + b.totalBytes, 0);
    const transferredBytes = batches.reduce((s, b) => s + b.transferredBytes, 0);
    const dockBadge = {
        active: activeCount,
        pct: totalBytes > 0 ? Math.round((transferredBytes / totalBytes) * 100) : 0,
    };

    const startBatch = useCallback((
        dossierId: number,
        sessionId: number,
        tusEndpoint: string,
        fileRefs: { id: string; file: File }[],
        meta: {
            clientUploadId: string; operation: string; submissionIntent: string; dossierName?: string;
            files: { clientFileUploadId: string; assetType: string; originalFilename: string; sizeBytes: number; }[];
        }
    ) => {
        const uppy = getUppy(tusEndpoint);

        const batch: UploadBatch = {
            batchId: meta.clientUploadId,
            clientUploadId: meta.clientUploadId,
            dossierId,
            dossierName: meta.dossierName,
            operation: meta.operation as any,
            submissionIntent: meta.submissionIntent as any,
            uploadSessionId: sessionId,
            files: meta.files.map(f => ({
                clientFileUploadId: f.clientFileUploadId,
                assetType: f.assetType as any,
                originalFilename: f.originalFilename,
                sizeBytes: f.sizeBytes,
                transferredBytes: 0,
                transferStatus: 'queued' as TransferStatus,
                processingStatus: 'waiting' as any,
            })),
            totalBytes: meta.files.reduce((s, f) => s + f.sizeBytes, 0),
            transferredBytes: 0,
            overallStatus: 'queued' as UploadOverallStatus,
            processingProgress: 0,
            createdAt: new Date().toISOString(),
        };

        setBatches(prev => [...prev, batch]);

        fileRefs.forEach(({ id, file }, _i) => {
            const fileMeta = meta.files.find(f => f.clientFileUploadId === id);
            if (!fileMeta) return;
            uppy.addFile({
                source: 'local',
                name: file.name,
                type: file.type || 'application/octet-stream',
                data: file,
                meta: {
                    clientFileUploadId: id,
                    clientUploadId: meta.clientUploadId,
                    dossierId: String(dossierId),
                    uploadSessionId: String(sessionId),
                    assetType: fileMeta.assetType,
                },
            });
        });

        uppy.on('progress', (_progress: number) => {
            const transferred = uppy.getFiles().reduce((s: number, f: any) => s + (f.progress?.bytesUploaded ?? 0), 0);
            updateBatch(meta.clientUploadId, b => ({ ...b, transferredBytes: transferred }));
            meta.files.forEach(mf => {
                const uf = uppy.getFiles().find((f: any) => f.meta?.clientFileUploadId === mf.clientFileUploadId);
                if (uf) {
                    updateFile(meta.clientUploadId, mf.clientFileUploadId, f => ({
                        ...f,
                        transferredBytes: (uf as any).progress?.bytesUploaded ?? 0,
                        transferStatus: ((uf as any).progress?.bytesUploaded ?? 0) > 0 ? 'uploading' : f.transferStatus,
                        speedBps: (uf as any).progress?.speed,
                        eta: (uf as any).progress?.eta,
                    }));
                }
            });
        });

        uppy.on('complete', (result: any) => {
            meta.files.forEach(mf => {
                updateFile(meta.clientUploadId, mf.clientFileUploadId, f => ({ ...f, transferStatus: 'transferred' }));
            });
            updateBatch(meta.clientUploadId, b => ({
                ...b,
                overallStatus: 'processing',
                transferredBytes: b.totalBytes,
                processingStage: 'finalizing',
            }));
            finalizeUploadSession(dossierId, sessionId).then(res => {
                if (res.ok) {
                    updateBatch(meta.clientUploadId, b => ({
                        ...b,
                        overallStatus: 'completed',
                        completedAt: new Date().toISOString(),
                    }));
                } else {
                    res.json().then(j => {
                        updateBatch(meta.clientUploadId, b => ({
                            ...b,
                            overallStatus: 'failed',
                            errorMessage: j.message || 'Finalization failed',
                        }));
                    });
                }
            });
        });

        uppy.on('upload-error', (_file: any, _error: any, _response: any) => {
            meta.files.forEach(mf => {
                const uf = uppy.getFiles().find((f: any) => f.meta?.clientFileUploadId === mf.clientFileUploadId);
                if (uf && (uf as any).error) {
                    updateFile(meta.clientUploadId, mf.clientFileUploadId, f => ({
                        ...f, transferStatus: 'failed', errorMessage: (uf as any).error,
                    }));
                }
            });
        });

        uppy.upload().catch(() => {});
    }, [updateBatch, updateFile]);

    const pauseFile = useCallback((batchId: string, clientFileUploadId: string) => {
        if (!uppyInstance) return;
        const file = uppyInstance.getFiles().find((f: any) => f.meta?.clientFileUploadId === clientFileUploadId);
        if (file) { (uppyInstance as any).pauseUpload?.(file.id); }
        updateFile(batchId, clientFileUploadId, f => ({ ...f, transferStatus: 'paused' }));
    }, [updateFile]);

    const resumeFile = useCallback((batchId: string, clientFileUploadId: string) => {
        if (!uppyInstance) return;
        const file = uppyInstance.getFiles().find((f: any) => f.meta?.clientFileUploadId === clientFileUploadId);
        if (file) { (uppyInstance as any).resumeUpload?.(file.id); }
        updateFile(batchId, clientFileUploadId, f => ({ ...f, transferStatus: 'uploading' }));
    }, [updateFile]);

    const cancelBatch = useCallback(async (dossierId: number, batchId: string) => {
        const batch = batches.find(b => b.batchId === batchId);
        if (batch?.uploadSessionId) {
            try { await cancelUploadSession(dossierId, batch.uploadSessionId); } catch {}
        }
        const up = uppyInstance;
        if (up) {
            batch?.files.forEach(f => {
                const file = up.getFiles().find((uf: any) => uf.meta?.clientFileUploadId === f.clientFileUploadId);
                if (file) up.removeFile(file.id);
            });
        }
        updateBatch(batchId, b => ({ ...b, overallStatus: 'canceled' }));
    }, [batches, updateBatch]);

    const retryFile = useCallback((batchId: string, clientFileUploadId: string) => {
        if (!uppyInstance) return;
        const file = uppyInstance.getFiles().find((f: any) => f.meta?.clientFileUploadId === clientFileUploadId);
        if (file) {
            uppyInstance.retryUpload(file.id);
            updateFile(batchId, clientFileUploadId, f => ({ ...f, transferStatus: 'uploading', errorMessage: undefined }));
        }
    }, [updateFile]);

    const removeCompleted = useCallback((batchId: string) => {
        setBatches(prev => prev.filter(b => b.batchId !== batchId));
    }, []);

    const updateProcessingProgress = useCallback((sessionId: number, stage: string, progress: number, message?: string) => {
        setBatches(prev => prev.map(b => {
            if (b.uploadSessionId !== sessionId) return b;
            return { ...b, processingStage: stage, processingProgress: progress, errorMessage: message };
        }));
    }, []);

    const value: GlobalUploadContextValue = {
        batches, isDockVisible, minimized, toggleMinimized: () => setMinimized(p => !p),
        dockBadge, startBatch, pauseFile, resumeFile, cancelBatch, retryFile, removeCompleted,
        updateProcessingProgress,
        openUploadCenter: () => onOpenUploadCenter?.(),
    };

    return (
        <GlobalUploadContext.Provider value={value}>
            {children}
        </GlobalUploadContext.Provider>
    );
}

function restoreBatch(data: any): UploadBatch {
    return {
        batchId: data.batchId,
        clientUploadId: data.clientUploadId,
        dossierId: data.dossierId,
        dossierName: data.dossierName,
        operation: data.operation,
        submissionIntent: data.submissionIntent,
        uploadSessionId: data.uploadSessionId,
        files: (data.files ?? []).map((f: any) => ({
            clientFileUploadId: f.clientFileUploadId,
            assetType: f.assetType,
            originalFilename: f.originalFilename,
            sizeBytes: f.sizeBytes,
            mimeType: f.mimeType,
            extension: f.extension,
            transferredBytes: 0,
            transferStatus: f.transferStatus ?? 'queued',
            processingStatus: f.processingStatus ?? 'waiting',
        })),
        totalBytes: data.totalBytes,
        transferredBytes: 0,
        overallStatus: data.overallStatus,
        processingProgress: data.processingProgress ?? 0,
        processingStage: data.processingStage,
        createdAt: data.createdAt,
        completedAt: data.completedAt,
        errorCode: data.errorCode,
        errorMessage: data.errorMessage,
    };
}
