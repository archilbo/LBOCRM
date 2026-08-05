/**
 * URL helpers for the same-page document viewer.
 *
 * The viewer is represented by a single query parameter (preview_document)
 * that is added, replaced or removed without touching any other query
 * parameter or the hash. Helpers return relative path+search+hash strings
 * (origin-agnostic) so they can be passed directly to the History API.
 */

export const VIEWER_QUERY_KEY = 'preview_document';

/** Returns the preview_document id from a URL, or null when absent/blank. */
export function readViewerDocumentId(url: string): string | null {
    try {
        const parsed = new URL(url);
        const id = parsed.searchParams.get(VIEWER_QUERY_KEY);

        return id && id.trim().length > 0 ? id.trim() : null;
    } catch {
        return null;
    }
}

/** Adds or replaces preview_document, preserving every other parameter. */
export function buildViewerUrl(url: string, documentId: string): string {
    const parsed = new URL(url);

    parsed.searchParams.set(VIEWER_QUERY_KEY, documentId);

    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
}

/** Removes preview_document, preserving every other parameter. */
export function removeViewerParam(url: string): string {
    const parsed = new URL(url);

    parsed.searchParams.delete(VIEWER_QUERY_KEY);

    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
}
