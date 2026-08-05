import type { ClientProjectDocument } from '@/features/clients/types';
import type { DocumentExplorerCapabilities } from './documentExplorerTypes';

/**
 * Source fields the backend resource currently exposes per document.
 * Only these fields drive capability normalization.
 */
type DocumentCapabilitySource = Pick<ClientProjectDocument, 'canPreview' | 'hasFile'>;

/**
 * Normalizes the backend-provided document data into the explorer capability
 * shape.
 *
 * Contract confirmed in Task 1 / Task 2:
 * - view and print actions are enabled when `canPreview` is true (backend
 *   aborts documents.view / documents.print with 422 otherwise);
 * - download is enabled when the file exists (`hasFile`).
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
        canPrint: canPreview,
        canReplace: false,
        canUpdateStatus: false,
        canDelete: false,
    };
}
