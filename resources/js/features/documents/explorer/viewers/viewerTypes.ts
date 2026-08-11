import type { DocumentExplorerItem } from '../documentExplorerTypes';

/** Shared header slot used by format viewers for their contextual controls. */
export const DOCUMENT_VIEWER_TOOLBAR_HOST_ID = 'document-viewer-toolbar';

/**
 * Shared props for the dedicated preview viewers. The resolved authorized
 * document is passed down (never a raw URL) so viewers can render localized
 * metadata and capability-gated Download actions; the modal already resolved
 * `viewUrl` and permission checks before rendering these components.
 */
export type DocumentViewerProps = {
    document: DocumentExplorerItem;
    /** Capability-gated download handler (no-op guard lives in the modal). */
    onDownload: (document: DocumentExplorerItem) => void;
};
