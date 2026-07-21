import type { ProjectDesignFile, ProjectDesignVersion, ProjectDesignActivity } from '../types/projectDesign';

export function formatProjectDesignLabel(
    item: ProjectDesignFile | ProjectDesignVersion | null | undefined,
): string {
    if (!item) return '-';
    if ('versionNumber' in item) return `v${item.versionNumber}`;
    return item.name || '-';
}

export function formatProjectDesignDate(date: string | null | undefined): string {
    if (!date) return '-';
    try {
        return new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
        return '-';
    }
}

export function formatProjectDesignFileSize(bytes: number | null | undefined): string {
    if (!bytes || bytes <= 0) return '-';
    const units = ['B', 'KB', 'MB', 'GB'];
    let i = 0;
    let size = bytes;
    while (size >= 1024 && i < units.length - 1) { size /= 1024; i++; }
    return `${size.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export function formatProjectDesignStatus(status: string | null | undefined): string {
    if (!status) return '-';
    return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function formatProjectDesignActivity(item: ProjectDesignActivity): string {
    const user = item.user?.name ?? 'System';
    const action = item.action.replace(/\./g, ' ').replace(/_/g, ' ');
    return `${user} ${action}`;
}

export const STATUS_BADGE: Record<string, string> = {
    active: 'bg-emerald-400/10 text-emerald-400',
    archived: 'bg-amber-400/10 text-amber-400',
    draft: 'bg-amber-400/10 text-amber-400',
    submitted: 'bg-blue-400/10 text-blue-400',
    approved: 'bg-emerald-400/10 text-emerald-400',
    rejected: 'bg-red-400/10 text-red-400',
    pending: 'bg-amber-400/10 text-amber-400',
    in_progress: 'bg-blue-400/10 text-blue-400',
    changes_requested: 'bg-purple-400/10 text-purple-400',
};

export const DISCIPLINE_COLORS: Record<string, string> = {
    architecture: 'bg-blue-400/10 text-blue-400',
    structure: 'bg-emerald-400/10 text-emerald-400',
    mep: 'bg-amber-400/10 text-amber-400',
    interior: 'bg-purple-400/10 text-purple-400',
    landscape: 'bg-rose-400/10 text-rose-400',
};

export const SEVERITY_STYLES: Record<string, string> = {
    critical: 'text-red-400 border-red-400/30 bg-red-400/10',
    major: 'text-orange-400 border-orange-400/30 bg-orange-400/10',
    normal: 'text-amber-400 border-amber-400/30 bg-amber-400/10',
    minor: 'text-blue-400 border-blue-400/30 bg-blue-400/10',
    information: 'text-[var(--text-muted)] border-[var(--border)] bg-[var(--surface-2)]',
};

export const REVIEW_STATUS_STYLES: Record<string, string> = {
    pending: 'bg-amber-400/10 text-amber-400',
    in_progress: 'bg-blue-400/10 text-blue-400',
    approved: 'bg-emerald-400/10 text-emerald-400',
    rejected: 'bg-red-400/10 text-red-400',
    changes_requested: 'bg-purple-400/10 text-purple-400',
};
