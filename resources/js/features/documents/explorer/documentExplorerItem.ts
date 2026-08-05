import type { ClientProjectDocument } from '@/features/clients/types';
import { normalizeDocumentCapabilities } from './documentExplorerCapabilities';
import { normalizeDocumentExtension, resolveDocumentPreviewKind } from './documentPreviewKinds';
import type { DocumentExplorerItem } from './documentExplorerTypes';

/**
 * Pure adapter from the existing backend document contract to the explorer
 * row shape. Preserves the original document object, never mutates it, and
 * stays independent of React.
 */
export function toDocumentExplorerItem(document: ClientProjectDocument): DocumentExplorerItem {
    const extension = normalizeDocumentExtension(document.originalFilename);

    return {
        ...document,
        extension,
        previewKind: resolveDocumentPreviewKind(document.mimeType, extension),
        capabilities: normalizeDocumentCapabilities(document),
    };
}
