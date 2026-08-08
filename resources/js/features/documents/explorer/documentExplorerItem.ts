import type { ClientProjectDocument } from '@/features/clients/types';
import { normalizeDocumentCapabilities } from './documentExplorerCapabilities';
import { normalizeDocumentExtension, resolveDocumentPreviewKind } from './documentPreviewKinds';
import type { DocumentExplorerItem, ExplorerDocument, ExplorerDocumentPayload } from './documentExplorerTypes';
import { explorerDocumentKey } from './documentExplorerTypes';

/**
 * Pure adapter from a backend explorer payload to the normalized
 * ExplorerDocument shape. The backend key (when present) is kept as-is;
 * otherwise the source-aware fallback is derived. New normalization fields
 * default to safe values so older payloads keep working unchanged.
 */
export function toExplorerDocument(payload: ExplorerDocumentPayload): ExplorerDocument {
    return {
        ...payload,
        key: payload.key ?? explorerDocumentKey(payload.sourceType, payload.id),
        generated: payload.generated ?? false,
        version: payload.version ?? null,
        extension: payload.extension ?? null,
    };
}

/**
 * Client workspace adapter: the selected project's documents are uploaded
 * project files, so every entry is stamped with the 'project' source.
 * `canDelete` is not exposed by the Client backend contract — delete stays
 * hidden there (mirrors the current explorer behavior).
 */
export function toClientExplorerDocument(document: ClientProjectDocument): ExplorerDocument {
    return toExplorerDocument({
        id: document.id,
        sourceType: 'project',
        sourceLabel: null,
        name: document.name,
        status: document.status,
        documentNumber: document.documentNumber,
        originalFilename: document.originalFilename,
        mimeType: document.mimeType,
        sizeLabel: document.sizeLabel,
        storageLocation: document.storageLocation,
        uploadedAt: document.uploadedAt,
        hasFile: document.hasFile,
        canPreview: document.canPreview,
        viewUrl: document.viewUrl,
        contentUrl: document.contentUrl,
        printUrl: document.printUrl,
        downloadUrl: document.downloadUrl,
    });
}

/**
 * Pure adapter from the normalized document to the explorer row shape.
 * Preserves the original document object, never mutates it, and stays
 * independent of React.
 */
export function toDocumentExplorerItem(document: ExplorerDocument): DocumentExplorerItem {
    const extension = document.extension ?? normalizeDocumentExtension(document.originalFilename);
    const previewKind = resolveDocumentPreviewKind(document.mimeType, extension);

    return {
        ...document,
        extension,
        previewKind,
        capabilities: normalizeDocumentCapabilities({
            canPreview: document.canPreview,
            hasFile: document.hasFile,
            canDelete: document.canDelete,
            previewKind,
        }),
    };
}
