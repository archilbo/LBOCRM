import type { LucideIcon } from 'lucide-react';
import {
    File as FileIcon,
    FileArchive as FileArchiveIcon,
    FileCode2 as FileCode2Icon,
    FileText as FileTextIcon,
    FileType2 as FileType2Icon,
    Image as ImageIcon,
    Sheet as SheetIcon,
} from 'lucide-react';

import type { DocumentPreviewKind } from './documentExplorerTypes';

/**
 * Pure formatting helpers for explorer metadata. No React, no side effects.
 * Date formatters are cached per locale so cards never create formatters.
 */

const BYTE_UNITS = ['B', 'KB', 'MB', 'GB'] as const;

/** Known archive extensions (unsupported preview kind → archive group). */
export const ARCHIVE_EXTENSIONS = new Set(['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz', 'iso']);

/** Known spreadsheet extensions (unsupported preview kind → spreadsheet group). */
export const SPREADSHEET_EXTENSIONS = new Set(['xls', 'xlsx', 'ods']);

/** Code-like extensions rendered with a code icon. */
const CODE_EXTENSIONS = new Set(['json', 'xml', 'yaml', 'yml', 'ini', 'html', 'htm']);

/** Statuses with a dedicated `documents.status.*` label; others render raw. */
const DOCUMENT_STATUS_KEYS = new Set(['uploaded', 'verified', 'missing', 'rejected', 'templates', 'generated', 'signed']);

/** Formats a numeric byte count (B, KB, MB, GB). Returns null when absent/invalid. */
export function formatBytes(bytes: number | null | undefined): string | null {
    if (bytes === null || bytes === undefined || !Number.isFinite(bytes) || bytes < 0) {
        return null;
    }

    if (bytes === 0) {
        return '0 B';
    }

    const unitIndex = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), BYTE_UNITS.length - 1);
    const value = bytes / 1024 ** unitIndex;
    const text = unitIndex === 0 ? String(value) : value.toFixed(1).replace(/\.0$/, '');

    return `${text} ${BYTE_UNITS[unitIndex]}`;
}

/**
 * Size display: numeric bytes when available, otherwise the backend-provided
 * localized size label. The label is never parsed for sorting.
 */
export function formatFileSize(
    bytes: number | null | undefined,
    sizeLabel: string | null | undefined,
): string | null {
    const formatted = formatBytes(bytes);

    if (formatted !== null) {
        return formatted;
    }

    return sizeLabel && sizeLabel.trim() !== '' && sizeLabel !== '-' ? sizeLabel : null;
}

const dateFormatters = new Map<string, Intl.DateTimeFormat>();

function getDateFormatter(locale: string): Intl.DateTimeFormat {
    const localeTag = locale === 'fr' ? 'fr-FR' : locale === 'en' ? 'en-US' : locale;
    let formatter = dateFormatters.get(localeTag);

    if (!formatter) {
        formatter = new Intl.DateTimeFormat(localeTag, { day: 'numeric', month: 'short', year: 'numeric' });
        dateFormatters.set(localeTag, formatter);
    }

    return formatter;
}

/** Formats a date for the current locale. Returns null when absent/invalid. */
export function formatDocumentDate(value: string | null | undefined, locale: string): string | null {
    if (!value) {
        return null;
    }

    // MySQL "YYYY-MM-DD HH:MM:SS" is not strictly ISO; normalize the separator.
    const time = Date.parse(value.trim().replace(' ', 'T'));

    return Number.isNaN(time) ? null : getDateFormatter(locale).format(new Date(time));
}

/** Locale key for the file-type label of a document. */
export function fileTypeLabelKey(kind: DocumentPreviewKind, extension: string | null): string {
    if (kind !== 'unsupported') {
        return `documentsExplorer.fileTypes.${kind}`;
    }

    if (extension) {
        if (ARCHIVE_EXTENSIONS.has(extension)) {
            return 'documentsExplorer.fileTypes.archive';
        }

        if (SPREADSHEET_EXTENSIONS.has(extension)) {
            return 'documentsExplorer.fileTypes.spreadsheet';
        }
    }

    return 'documentsExplorer.fileTypes.other';
}

/** Pure Lucide icon resolution from preview kind + normalized extension. */
export function resolveFileIcon(kind: DocumentPreviewKind, extension: string | null): LucideIcon {
    switch (kind) {
        case 'image':
            return ImageIcon;
        case 'pdf':
            return FileTextIcon;
        case 'docx':
            return FileType2Icon;
        case 'markdown':
            return FileCode2Icon;
        case 'text':
            return FileTextIcon;
        case 'unsupported':
            if (extension) {
                if (ARCHIVE_EXTENSIONS.has(extension)) {
                    return FileArchiveIcon;
                }

                if (SPREADSHEET_EXTENSIONS.has(extension)) {
                    return SheetIcon;
                }

                if (CODE_EXTENSIONS.has(extension)) {
                    return FileCode2Icon;
                }
            }

            return FileIcon;
    }
}

/** Localized status label; unknown statuses render their raw safe value. */
export function documentStatusLabel(t: (key: string) => string, status: string): string {
    return DOCUMENT_STATUS_KEYS.has(status) ? t(`documents.status.${status}`) : status;
}

/** "v2" chip text for generated artifacts; null when the source has no version. */
export function formatDocumentVersion(version: number | null | undefined): string | null {
    return version == null ? null : `v${version}`;
}
