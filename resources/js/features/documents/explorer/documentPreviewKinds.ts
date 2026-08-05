import type { DocumentPreviewKind } from './documentExplorerTypes';

/**
 * Pure preview-kind resolution for explorer documents.
 *
 * Precedence (security-first):
 * 1. Explicit denials: HTML (text/html, .html, .htm) and script formats are
 *    never classified as safe rendered documents.
 * 2. Trusted backend MIME type wins over the extension when present.
 * 3. Unknown/absent MIME never becomes text automatically; the normalized
 *    extension is used only when no MIME type was provided at all.
 * 4. Everything else is `unsupported`.
 *
 * This resolver never fetches or inspects file content and never renders
 * anything. Backend validation remains authoritative.
 */

const IMAGE_MIME_TYPES = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
]);

const IMAGE_EXTENSIONS = new Set([
    'jpg',
    'jpeg',
    'png',
    'webp',
    'gif',
]);

const PDF_MIME_TYPE = 'application/pdf';

const DOCX_MIME_TYPE = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

const MARKDOWN_MIME_TYPE = 'text/markdown';

const TEXT_MIME_TYPES = new Set([
    'text/plain',
    'application/json',
    'application/xml',
    'text/xml',
    'text/csv',
    'application/yaml',
    'text/yaml',
]);

const TEXT_EXTENSIONS = new Set([
    'txt',
    'log',
    'json',
    'xml',
    'csv',
    'yaml',
    'yml',
    'ini',
]);

const DENIED_MIME_TYPES = new Set([
    'text/html',
    'text/javascript',
    'application/javascript',
    'application/x-javascript',
]);

const DENIED_EXTENSIONS = new Set([
    'html',
    'htm',
]);

/**
 * Extracts the lowercase extension of a filename, or lowercases a bare
 * extension passed directly.
 *
 * - 'REPORT.PDF' -> 'pdf'
 * - 'PDF'        -> 'pdf'
 * - 'archive.v2.docx' -> 'docx' (multi-dot: last segment wins)
 * - '.gitignore' -> null (dotfile: no extension)
 * - 'report.'    -> null (trailing dot)
 * - '' / null    -> null
 */
export function normalizeDocumentExtension(filename: string | null | undefined): string | null {
    if (!filename) {
        return null;
    }

    const trimmed = filename.trim();

    if (!trimmed) {
        return null;
    }

    const lastDot = trimmed.lastIndexOf('.');

    if (lastDot < 0) {
        return trimmed.toLowerCase();
    }

    if (lastDot === 0 || lastDot === trimmed.length - 1) {
        return null;
    }

    return trimmed.slice(lastDot + 1).toLowerCase();
}

export function isImagePreviewKind(kind: DocumentPreviewKind): boolean {
    return kind === 'image';
}

/** Markdown is a text-oriented format and is grouped with plain text. */
export function isTextPreviewKind(kind: DocumentPreviewKind): boolean {
    return kind === 'text' || kind === 'markdown';
}

export function resolveDocumentPreviewKind(
    mimeType: string | null | undefined,
    extension: string | null | undefined,
): DocumentPreviewKind {
    const mime = mimeType?.trim().toLowerCase() || '';
    const ext = normalizeDocumentExtension(extension);

    if (DENIED_MIME_TYPES.has(mime) || (ext !== null && DENIED_EXTENSIONS.has(ext))) {
        return 'unsupported';
    }

    if (mime) {
        if (IMAGE_MIME_TYPES.has(mime)) {
            return 'image';
        }

        if (mime === PDF_MIME_TYPE) {
            return 'pdf';
        }

        if (mime === DOCX_MIME_TYPE) {
            return 'docx';
        }

        if (mime === MARKDOWN_MIME_TYPE) {
            return 'markdown';
        }

        if (TEXT_MIME_TYPES.has(mime)) {
            return 'text';
        }

        // A MIME type was provided but is not trusted: never guess from the
        // extension (an unknown MIME must not become text automatically).
        return 'unsupported';
    }

    if (ext !== null) {
        if (IMAGE_EXTENSIONS.has(ext)) {
            return 'image';
        }

        if (ext === 'pdf') {
            return 'pdf';
        }

        if (ext === 'docx') {
            return 'docx';
        }

        if (ext === 'md' || ext === 'markdown') {
            return 'markdown';
        }

        if (TEXT_EXTENSIONS.has(ext)) {
            return 'text';
        }
    }

    return 'unsupported';
}
