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
 * Filter state of the explorer toolbar.
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
 * Backend-provided source of an explorer entry. Kept in sync with the
 * normalized ExplorerDocument shape: every backend scope (Client workspace,
 * Project workspace, future sources) exposes the same fields, so the frontend
 * normalization layer is a thin identity mapper.
 */
export type ExplorerDocumentPayload = {
    id: number;
    sourceType: ExplorerDocumentSourceType;
    sourceLabel: string | null;
    name: string;
    status: string;
    documentNumber: string | null;
    originalFilename: string | null;
    mimeType: string | null;
    sizeLabel: string | null;
    storageLocation: string | null;
    uploadedAt: string | null;
    hasFile: boolean;
    canPreview: boolean;
    viewUrl: string | null;
    contentUrl: string | null;
    printUrl: string | null;
    downloadUrl: string | null;
    /** Backend-authorized delete flag (presentation gate only). */
    canDelete?: boolean;
    /**
     * Backend-generated unique key for the entry. Sources exposing several
     * files from one row (contract DOCX + PDF, efficiency-sheet versions)
     * send explicit keys (contract:18:docx, efficiency_sheet:7:v2:pdf); the
     * fallback derives `${sourceType}:${id}`.
     */
    key?: string;
    /** True when the entry is a generated artifact (contract, efficiency sheet). */
    generated?: boolean;
    /** Generator version counter; null when the source has no versioning. */
    version?: number | null;
    /** Explicit file extension ('docx', 'pdf'); null lets the frontend derive it from the filename. */
    extension?: string | null;
    /**
     * Owning Project reference for Client-scope aggregation. Present on
     * entries exposed through a Client explorer (all of them are
     * Project-derived); null in the Project explorer where the scope is a
     * single Project. Never carries unrelated Project fields.
     */
    projectId?: number | null;
    /** Display label of the owning Project (badge/grouping). */
    projectLabel?: string | null;
    project?: {
        id: number;
        name: string | null;
        code: string | null;
    } | null;
};

/**
 * Backend-provided scope context of an explorer instance. The IDs are
 * context inputs for the UI only — backend route binding and relationships
 * remain authoritative for every query and action.
 */
export type ExplorerContext =
    | { type: 'project'; projectId: number }
    | { type: 'client'; clientId: number };

/**
 * Physical origin of an explorer entry. Used for source-aware keys and for
 * the config-driven tab filters ("Fichiers du projet" filters on 'project',
 * "Documents générés" on 'contract' | 'efficiency_sheet'). Extensible: a new
 * generated-document source only needs a new member here plus its adapter.
 */
export type ExplorerDocumentSourceType =
    | 'project'
    | 'contract'
    | 'efficiency_sheet'
    | 'client';

/**
 * Normalized explorer entry: the shared contract consumed by every explorer
 * component (cards, rows, grids, viewer, details panel). `key` is unique
 * within one explorer instance (backend-supplied, source-aware); `id` remains
 * the backend record id for actions (download, delete, …). `generated`,
 * `version` and `extension` are always present after normalization so no
 * consumer needs to handle their absence.
 */
export type ExplorerDocument = ExplorerDocumentPayload & {
    key: string;
    generated: boolean;
    version: number | null;
    extension: string | null;
};

/**
 * Explorer row: the normalized document composed with explorer-only derived
 * fields. No backend fields are invented here.
 */
export type DocumentExplorerItem = ExplorerDocument & {
    previewKind: DocumentPreviewKind;
    extension: string | null;
    capabilities: DocumentExplorerCapabilities;
};

/**
 * Which product surface renders the explorer. Drives tab defaults and, in
 * future, scope-specific toolbar options. The explorer itself is scope
 * agnostic: everything else is config-driven through props.
 */
export type DocumentExplorerScope =
    | 'client'
    | 'project';

/**
 * Config-driven tab of the explorer. Tabs always filter the normalized
 * ExplorerDocument[] — they never swap components. `label` is a ready-to-use
 * translated string. `emptyTitle` / `emptyDescription` optionally override
 * the empty state of this tab only.
 */
export type DocumentExplorerTab = {
    id: string;
    label: string;
    /** Returns true for the documents this tab shows; undefined shows all. */
    filter?: (document: ExplorerDocument) => boolean;
    emptyTitle?: string;
    emptyDescription?: string;
};

/**
 * Fallback source-aware key (`${sourceType}:${id}`), used only when the
 * backend payload carries no explicit `key`. Sources that expose several
 * files from one row (contract DOCX + PDF, efficiency-sheet versions) always
 * send explicit keys from the backend, so this stays a safe fallback.
 */
export function explorerDocumentKey(sourceType: ExplorerDocumentSourceType, id: number): string {
    return `${sourceType}:${id}`;
}
