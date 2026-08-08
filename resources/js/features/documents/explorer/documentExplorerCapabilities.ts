import type { DocumentExplorerCapabilities, DocumentPreviewKind } from './documentExplorerTypes';

/**
 * Source fields the backend resource currently exposes per document,
 * completed with the explorer's own preview classification.
 * Only these fields drive capability normalization.
 */
type DocumentCapabilitySource = {
    canPreview: boolean;
    hasFile: boolean;
    /** Backend-authorized delete flag; absent sources never expose delete. */
    canDelete?: boolean;
    previewKind: DocumentPreviewKind;
};

/**
 * Normalizes the backend-provided document data into the explorer capability
 * shape.
 *
 * Contract confirmed in Task 1 / Task 2:
 * - view and print actions are enabled when `canPreview` is true (backend
 *   aborts documents.view / documents.print with 422 otherwise);
 * - download is enabled when the file exists (`hasFile`);
 * - delete is enabled only when the backend explicitly authorizes it
 *   (presentation gate; the destroy route stays policy-guarded).
 *
 * Images are never printable: print is only offered for page-layout formats
 * (PDF/Word/…), even though images preview fine. The backend print route
 * stays permission-gated; this flag only controls presentation.
 *
 * Capabilities not exposed by the current backend resource default to false
 * here; nothing is inferred from role names or URL presence. Frontend
 * capabilities control presentation only — backend policies and route
 * permissions remain authoritative.
 */
export function normalizeDocumentCapabilities(
    document: DocumentCapabilitySource,
): DocumentExplorerCapabilities {
    const canPreview = document.canPreview === true;
    const hasFile = document.hasFile === true;

    return {
        canView: canPreview,
        canPreview,
        canDownload: hasFile,
        canPrint: canPreview && document.previewKind !== 'image',
        canReplace: false,
        canUpdateStatus: false,
        canDelete: document.canDelete === true,
    };
}
