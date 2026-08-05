import type { ClientProjectDocument } from '@/features/clients/types';
import type { DocumentStatus } from '@/features/documents/types';

/**
 * Classification of how a document can be rendered in the explorer viewer.
 * Based on the backend MIME type and the normalized filename extension
 * (see documentPreviewKinds.ts). Backend validation remains authoritative;
 * this is presentation metadata only.
 */
export type DocumentPreviewKind =
    | 'image'
    | 'pdf'
    | 'docx'
    | 'markdown'
    | 'text'
    | 'unsupported';

export type DocumentExplorerView =
    | 'grid'
    | 'list';

export type DocumentSortKey =
    | 'name'
    | 'updatedAt'
    | 'uploadedAt'
    | 'size'
    | 'type'
    | 'status';

export type DocumentSortDirection =
    | 'asc'
    | 'desc';

/**
 * Which section of the explorer is active. Mirrors the locale keys
 * documentsExplorer.locations.*
 */
export type DocumentExplorerLocation =
    | 'all'
    | 'shared'
    | 'projects';

/**
 * Filter state of the future explorer toolbar.
 * `status` reuses the existing document status union; `previewKind` reuses
 * DocumentPreviewKind; `location` reuses DocumentExplorerLocation.
 */
export type DocumentExplorerFilters = {
    query: string;
    status: DocumentStatus | 'all';
    previewKind: DocumentPreviewKind | 'all';
    location: DocumentExplorerLocation | 'all';
};

/**
 * Presentation-only capability flags for a document row.
 * Derived from backend-provided document data (documentExplorerCapabilities.ts).
 * Frontend capabilities control presentation only; backend policies and
 * route permissions remain authoritative.
 */
export type DocumentExplorerCapabilities = {
    canView: boolean;
    canPreview: boolean;
    canDownload: boolean;
    canPrint: boolean;
    canReplace: boolean;
    canUpdateStatus: boolean;
    canDelete: boolean;
};

/**
 * Explorer row: the existing backend document contract composed with
 * explorer-only derived fields. No backend fields are invented here.
 */
export type DocumentExplorerItem = ClientProjectDocument & {
    previewKind: DocumentPreviewKind;
    extension: string | null;
    capabilities: DocumentExplorerCapabilities;
};
