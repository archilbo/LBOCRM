import { router } from '@inertiajs/react';
import { IconFolder } from '@tabler/icons-react';

import type { ClientProjectSummary } from '@/features/clients/types';

const FORCE_CLIENT_PROJECTS_PANEL_53JC = true;

type ClientProjectsPanelProps = {
    clientId: number;
    projects: ClientProjectSummary[];
    selectedProjectId: number | null;
};

function money(value: number) {
    return `${Number(value || 0).toLocaleString('fr-MA')} MAD`;
}

export function ClientProjectsPanel({
    clientId,
    projects,
    selectedProjectId,
}: ClientProjectsPanelProps) {
    function selectProject(projectId: number) {
        router.visit(`/clients/${clientId}?dossier_id=${projectId}`, {
            preserveScroll: true,
            preserveState: true,
        });
    }

    return (
        <div className="grid gap-2" data-ui-marker={FORCE_CLIENT_PROJECTS_PANEL_53JC ? 'FORCE_CLIENT_PROJECTS_PANEL_53JC' : undefined}>
            {projects.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[var(--crm-border)] p-5 text-sm text-[var(--crm-muted)]">
                    No project linked to this client.
                </div>
            ) : null}

            {projects.map((project) => {
                const selected = selectedProjectId === project.id;

                return (
                    <button
                        key={project.id}
                        type="button"
                        onClick={() => selectProject(project.id)}
                        className={[
                            'w-full rounded-xl border p-3 text-left transition',
                            selected
                                ? 'border-[var(--crm-accent)] bg-[color-mix(in_srgb,var(--crm-accent)_14%,transparent)]'
                                : 'border-[var(--crm-border)] bg-[var(--crm-elevated)] hover:border-[color-mix(in_srgb,var(--crm-accent)_45%,var(--crm-border))]',
                        ].join(' ')}
                    >
                        <div className="flex items-start gap-3">
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--crm-accent)_16%,transparent)] text-[var(--crm-accent)]">
                                <IconFolder size={16} />
                            </div>

                            <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-2">
                                    <p className="truncate text-sm font-black text-[var(--crm-text)]">
                                        {project.projectObject || project.dossierNumber}
                                    </p>
                                    <span className="shrink-0 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-300">
                                        {project.status}
                                    </span>
                                </div>

                                <p className="mt-1 text-xs text-[var(--crm-muted)]">{project.dossierNumber}</p>
                                <p className="mt-2 line-clamp-2 text-xs text-[var(--crm-text-muted)]">
                                    {[project.province, project.commune, project.projectAddress].filter(Boolean).join(' / ') || 'No location'}
                                </p>

                                <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                                    <span className="rounded-lg border border-[var(--crm-border)] bg-black/15 px-2 py-1">
                                        Docs <b className="text-[var(--crm-text)]">{project.documentsCount}</b>
                                    </span>
                                    <span className="rounded-lg border border-[var(--crm-border)] bg-black/15 px-2 py-1">
                                        Finance <b className="text-[var(--crm-text)]">{project.financeDocumentsCount}</b>
                                    </span>
                                    <span className="rounded-lg border border-[var(--crm-border)] bg-black/15 px-2 py-1">
                                        Due <b className="text-[var(--crm-text)]">{money(project.remainingTotal)}</b>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </button>
                );
            })}
        </div>
    );
}