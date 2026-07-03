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
    { id: 'documents', label: 'Documents' },
    { id: 'contract', label: 'Contract' },
    { id: 'authorization', label: 'Authorization' },
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

export function getDossierWorkflowLabel(value: string) {
    return dossierWorkflowOptions.find((option) => option.id === value)?.label ?? value;
}

export function getDossierStatusClass(status: string) {
    return dossierStatusClasses[status] ?? dossierStatusClasses.paused;
}

export function getDossierReadiness(dossier: DossierRow): DossierReadinessItem[] {
    return [
        { key: 'client', label: 'Client', done: true },
        { key: 'documents', label: 'Docs', done: dossier.documentsCount > 0 },
        { key: 'contract', label: 'Contract', done: dossier.hasContract },
        { key: 'authorization', label: 'Auth', done: dossier.hasAuthorization },
        { key: 'finance', label: 'Finance', done: dossier.financeRecordsCount > 0 },
        { key: 'archive', label: 'Archive', done: dossier.hasArchiveRecord },
    ];
}
