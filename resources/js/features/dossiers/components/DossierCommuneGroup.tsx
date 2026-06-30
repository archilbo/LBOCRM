import { router } from '@inertiajs/react';
import { BadgeDollarSign, ChevronDown, Eye, FileCheck2, FolderKanban, MapPin } from 'lucide-react';
import { useState } from 'react';
import { AppButton } from '@/components/ui/AppButton';
import type { DossierCommuneGroup as DossierCommuneGroupType } from '@/features/dossiers/types';
import { DossierLocationStats } from './DossierLocationStats';

type Props = {
    group: DossierCommuneGroupType;
};

function money(value: number) {
    return new Intl.NumberFormat('fr-MA', {
        style: 'currency',
        currency: 'MAD',
        maximumFractionDigits: 0,
    }).format(value || 0);
}

function statusClass(status: string) {
    if (status === 'active') return 'border-emerald-400/25 bg-emerald-400/10 text-emerald-300';
    if (status === 'opened') return 'border-sky-400/25 bg-sky-400/10 text-sky-300';
    if (status === 'closed') return 'border-zinc-500/30 bg-zinc-500/10 text-zinc-300';
    if (status === 'archived') return 'border-violet-400/25 bg-violet-400/10 text-violet-300';

    return 'border-amber-400/25 bg-amber-400/10 text-amber-300';
}

function workflowLabel(value: string) {
    const labels: Record<string, string> = {
        client: 'Client',
        documents: 'Documents',
        contract: 'Contract',
        authorization: 'Authorization',
        finance: 'Finance',
        archive: 'Archive',
    };

    return labels[value] ?? value;
}

export function DossierCommuneGroup({ group }: Props) {
    const [open, setOpen] = useState(true);

    return (
        <div className="crm-panel-flat overflow-hidden">
            <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                className="flex w-full items-center justify-between gap-3 border-b border-[var(--crm-border)] px-4 py-3 text-left transition hover:bg-[var(--crm-surface-hover)]"
            >
                <span className="flex min-w-0 items-center gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[var(--crm-gold-soft)] text-[var(--crm-gold)]">
                        <MapPin size={16} />
                    </span>
                    <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-[var(--crm-text)]">{group.commune}</span>
                        <span className="text-xs text-[var(--crm-text-muted)]">{group.stats.projectsCount} project(s)</span>
                    </span>
                </span>

                <ChevronDown size={16} className={open ? 'shrink-0 transition' : 'shrink-0 -rotate-90 transition'} />
            </button>

            {open ? (
                <div className="space-y-3 p-4">
                    <DossierLocationStats stats={group.stats} compact />

                    <div className="app-scrollbar overflow-x-auto">
                        <table className="crm-table min-w-[960px]">
                            <thead>
                                <tr>
                                    <th>Project</th>
                                    <th>Client</th>
                                    <th>Workflow</th>
                                    <th>Documents</th>
                                    <th>Finance</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {group.dossiers.map((dossier) => (
                                    <tr key={dossier.id}>
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[var(--crm-gold-soft)] text-[var(--crm-gold)]">
                                                    <FolderKanban size={15} />
                                                </span>
                                                <div className="min-w-0">
                                                    <p className="max-w-[260px] truncate font-semibold text-[var(--crm-text)]">{dossier.projectObject || dossier.dossierNumber}</p>
                                                    <p className="text-xs text-[var(--crm-text-muted)]">{dossier.dossierNumber}</p>
                                                    <p className="max-w-[260px] truncate text-xs text-[var(--crm-text-soft)]">{dossier.projectAddress || '-'}</p>
                                                </div>
                                            </div>
                                        </td>

                                        <td>
                                            <p className="max-w-[180px] truncate font-medium text-[var(--crm-text)]">{dossier.ownerName || '-'}</p>
                                            <p className="text-xs text-[var(--crm-text-muted)]">{dossier.clientNumber || '-'}</p>
                                        </td>

                                        <td>
                                            <span className="rounded-full border border-[var(--crm-border)] bg-[var(--crm-surface-2)] px-2 py-1 text-[11px] font-semibold text-[var(--crm-gold)]">
                                                {workflowLabel(dossier.workflowStep)}
                                            </span>
                                        </td>

                                        <td>
                                            <span className="inline-flex items-center gap-1 rounded-full border border-sky-400/20 bg-sky-400/10 px-2 py-1 text-[11px] font-semibold text-sky-300">
                                                <FileCheck2 size={12} />
                                                {dossier.documentsCount} docs
                                            </span>
                                        </td>

                                        <td>
                                            <div className="space-y-1">
                                                <span className="inline-flex items-center gap-1 rounded-full border border-violet-400/20 bg-violet-400/10 px-2 py-1 text-[11px] font-semibold text-violet-300">
                                                    <BadgeDollarSign size={12} />
                                                    {dossier.financeDocumentsCount} finance
                                                </span>
                                                <p className="text-xs text-[var(--crm-text-muted)]">Remaining: {money(dossier.remainingTotal)}</p>
                                            </div>
                                        </td>

                                        <td>
                                            <span className={`inline-flex rounded-full border px-2 py-1 text-[11px] font-semibold ${statusClass(dossier.status)}`}>
                                                {dossier.status}
                                            </span>
                                        </td>

                                        <td>
                                            <div className="flex justify-end gap-2">
                                                <AppButton variant="secondary" size="sm" onPress={() => router.visit(`/dossiers/${dossier.id}`)}>
                                                    <Eye size={14} />
                                                    Open
                                                </AppButton>

                                                <button
                                                    type="button"
                                                    className="crm-action-button"
                                                    title="Documents"
                                                    onClick={() => router.visit(`/documents?search=${encodeURIComponent(dossier.dossierNumber)}`)}
                                                >
                                                    <FileCheck2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : null}
        </div>
    );
}