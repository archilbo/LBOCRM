import type { DossierRow } from '@/features/dossiers/types';

export type SelectOption = {
    id: string;
    label: string;
};

export type DossierReadinessItem = {
    key: string;
    label: string;
    done: boolean;
};

export const dossierStatusOptions: SelectOption[] = [
    { id: 'opened', label: 'Opened' },
    { id: 'active', label: 'Active' },
    { id: 'paused', label: 'Paused' },
    { id: 'closed', label: 'Closed' },
    { id: 'archived', label: 'Archived' },
];

export const dossierWorkflowOptions: SelectOption[] = [
    { id: 'client', label: 'Client' },
    { id: 'bureau_etude', label: 'Bureau Etude' },
    { id: 'documents', label: 'Documents' },
    { id: 'contract', label: 'Contract' },
    { id: 'finance', label: 'Finance' },
    { id: 'archive', label: 'Archive' },
];

const dossierStatusClasses: Record<string, string> = {
    active: 'border-emerald-400/25 bg-emerald-400/10 text-emerald-300',
    opened: 'border-sky-400/25 bg-sky-400/10 text-sky-300',
    closed: 'border-zinc-500/30 bg-zinc-500/10 text-zinc-300',
    archived: 'border-violet-400/25 bg-violet-400/10 text-violet-300',
    paused: 'border-amber-400/25 bg-amber-400/10 text-amber-300',
};

function snakeToTitle(value: string) {
    return value
        .split('_')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
}

export function getDossierWorkflowLabel(value: string) {
    return snakeToTitle(value);
}

export function getDossierStatusClass(status: string) {
    return dossierStatusClasses[status] ?? dossierStatusClasses.paused;
}

// ── Archive statuses (single source of truth) ──

export type ArchiveStatusEntry = {
    key: string;
    label: string;
    dot: string;
    dotColor: string;
    pillColor: 'default' | 'primary' | 'success' | 'warning' | 'danger';
    listColor: string;
};

export const ARCHIVE_STATUS: Record<string, ArchiveStatusEntry> = {
    ready_to_archive: { key: 'ready_to_archive', label: 'Ready', dot: '○', dotColor: 'text-[var(--text-muted)]', pillColor: 'default', listColor: 'text-[var(--text-muted)]' },
    stored: { key: 'stored', label: 'Stored', dot: '●', dotColor: 'text-[var(--success)]', pillColor: 'success', listColor: 'text-[var(--success)]' },
    checked_out: { key: 'checked_out', label: 'Out', dot: '●', dotColor: 'text-[var(--warning)]', pillColor: 'warning', listColor: 'text-[var(--warning)]' },
    returned: { key: 'returned', label: 'Returned', dot: '●', dotColor: 'text-[var(--info)]', pillColor: 'warning', listColor: 'text-[var(--info)]' },
    lost: { key: 'lost', label: 'Lost', dot: '✕', dotColor: 'text-[var(--danger)]', pillColor: 'danger', listColor: 'text-[var(--danger)]' },
};

export function archiveVisualStatus(status: string, isOverdue: boolean): ArchiveStatusEntry {
    if (isOverdue) {
        return { key: 'overdue', label: 'Overdue', dot: '●', dotColor: 'text-[var(--danger)]', pillColor: 'danger', listColor: 'text-[var(--danger)]' };
    }
    return ARCHIVE_STATUS[status] ?? { key: status, label: status, dot: '○', dotColor: 'text-[var(--text-muted)]', pillColor: 'default', listColor: 'text-[var(--text-muted)]' };
}

export function defaultDue(days = 7): string {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
}

export function getDossierReadiness(dossier: DossierRow): DossierReadinessItem[] {
    return [
        { key: 'client', label: 'Client', done: true },
        { key: 'documents', label: 'Docs', done: dossier.documentsCount > 0 },
        { key: 'contract', label: 'Contract', done: dossier.hasContract },
        { key: 'finance', label: 'Finance', done: dossier.financeRecordsCount > 0 },
        { key: 'archive', label: 'Archive', done: dossier.hasArchiveRecord },
    ];
}
