export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    const k = 1024;
    const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), units.length - 1);
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${units[i]}`;
}

export function getFileExtension(filename: string): string {
    const parts = filename.split('.');
    return parts.length > 1 ? parts.pop()!.toUpperCase() : 'FILE';
}

export type FileAppearance = {
    icon: 'pdf' | 'image' | 'doc' | 'spreadsheet' | 'archive' | 'file';
    color: string;
    label: string;
};

export function getFileTypeAppearance(mimeType: string, filename?: string): FileAppearance {
    const ext = filename?.split('.').pop()?.toLowerCase() || '';
    if (mimeType.startsWith('image/')) return { icon: 'image', color: 'text-blue-400', label: 'Image' };
    if (mimeType === 'application/pdf' || ext === 'pdf') return { icon: 'pdf', color: 'text-red-400', label: 'PDF' };
    if (mimeType.includes('word') || ['doc', 'docx'].includes(ext)) return { icon: 'doc', color: 'text-blue-500', label: 'Document' };
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel') || ['xls', 'xlsx', 'csv'].includes(ext)) return { icon: 'spreadsheet', color: 'text-emerald-400', label: 'Tableur' };
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('tar') || ['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return { icon: 'archive', color: 'text-amber-400', label: 'Archive' };
    return { icon: 'file', color: 'text-[var(--text-muted)]', label: 'Fichier' };
}

export function canPreviewFile(mimeType: string): boolean {
    return mimeType.startsWith('image/') || mimeType === 'application/pdf';
}

export function getAttachmentDisplayName(attachment: { originalFilename?: string | null; filename?: string | null }): string {
    return attachment.originalFilename || attachment.filename || 'Fichier';
}

export function isImageAttachment(attachment: { mimeType?: string | null; thumbnailUrl?: string | null }): boolean {
    return !!attachment.mimeType?.startsWith('image/');
}

export function getAttachmentPreviewUrl(attachment: { id: number; url?: string | null }): string {
    return `/inbox/attachments/${attachment.id}/view`;
}

export function isPdfAttachment(attachment: { mimeType?: string | null }): boolean {
    return attachment.mimeType === 'application/pdf';
}

export function isPreviewableAttachment(attachment: { mimeType?: string | null }): boolean {
    return isImageAttachment(attachment) || isPdfAttachment(attachment);
}

export function isGenericFileAttachment(attachment: { mimeType?: string | null }): boolean {
    return !isImageAttachment(attachment) && !isPdfAttachment(attachment);
}
