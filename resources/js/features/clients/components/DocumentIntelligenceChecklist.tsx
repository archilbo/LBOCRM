import { AlertTriangle, CheckCircle2, Circle, Clock, FileText, ShieldAlert, UploadCloud } from 'lucide-react';
import { useMemo } from 'react';
import type { ClientProjectDocument, DossierWorkflowProgress } from '@/features/clients/types';

type ChecklistRequirement = {
    key: string;
    stepKey: string;
    stepLabel: string;
    label: string;
    done: boolean;
    manual: boolean;
    notes: string | null;
    checkedAt: string | null;
    checkedBy: string | null;
    actionLabel: string | null;
    matchedDocument: ClientProjectDocument | null;
    isExpired: boolean;
    isExpiringSoon: boolean;
};

const EXPIRY_THRESHOLD_DAYS = 30;
const EXPIRABLE_DOCS = ['cin', 'cni', 'certificat_propriete', 'recent_certificat_propriete'];

function checkExpiry(document: ClientProjectDocument | null, key: string): { isExpired: boolean; isExpiringSoon: boolean } {
    if (!document || !EXPIRABLE_DOCS.includes(key)) {
        return { isExpired: false, isExpiringSoon: false };
    }

    const dateStr = document.uploadedAt;
    if (!dateStr) {
        return { isExpired: false, isExpiringSoon: false };
    }

    const date = new Date(dateStr);
    const now = new Date();
    const monthsDiff = (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth());

    if (key === 'cin' || key === 'cni') {
        return { isExpired: monthsDiff > 120, isExpiringSoon: monthsDiff > 108 };
    }

    if (key === 'certificat_propriete' || key === 'recent_certificat_propriete') {
        return { isExpired: monthsDiff > 12, isExpiringSoon: monthsDiff > 11 };
    }

    return { isExpired: false, isExpiringSoon: false };
}

function findMatchedDocument(documents: ClientProjectDocument[], requirementKey: string, stepKey: string): ClientProjectDocument | null {
    const haystack = `${requirementKey} ${stepKey}`.toLowerCase();

    return documents.find((doc) => {
        const searchText = `${doc.name} ${doc.originalFilename ?? ''} ${doc.documentNumber ?? ''} ${doc.status ?? ''}`.toLowerCase();

        if (haystack.includes('cin') || haystack.includes('cni')) {
            return searchText.includes('cin') || searchText.includes('cni') || searchText.includes('carte nationale');
        }

        if (haystack.includes('certificat')) {
            return searchText.includes('certificat');
        }

        if (haystack.includes('terrain') || haystack.includes('cadastral') || haystack.includes('parcellaire')) {
            return searchText.includes('cadastral') || searchText.includes('parcellaire') || searchText.includes('contenance');
        }

        if (haystack.includes('energetique')) {
            return searchText.includes('energetique') || searchText.includes('efficacite');
        }

        if (haystack.includes('ingenieur')) {
            return searchText.includes('ingenieur') || searchText.includes('cahier');
        }

        if (haystack.includes('cahier') || haystack.includes('chantier')) {
            return searchText.includes('cahier');
        }

        if (haystack.includes('plan') || haystack.includes('beton')) {
            return searchText.includes('beton') || searchText.includes('plan ba');
        }

        if (haystack.includes('implantation') || haystack.includes('topographie')) {
            return searchText.includes('topographie') || searchText.includes('implantation');
        }

        if (haystack.includes('laboratoire') || haystack.includes('controle')) {
            return searchText.includes('laboratoire') || searchText.includes('controle');
        }

        if (haystack.includes('permis')) {
            return searchText.includes('permis');
        }

        if (haystack.includes('site') || haystack.includes('image') || haystack.includes('photo')) {
            return searchText.includes('photo') || searchText.includes('image');
        }

        return searchText.includes(haystack.split('_')[0]);
    }) ?? null;
}

export function DocumentIntelligenceChecklist({
    workflow,
    documents,
    onUploadDocument,
}: {
    workflow: DossierWorkflowProgress | null;
    documents: ClientProjectDocument[];
    onUploadDocument: () => void;
}) {
    const requirements = useMemo<ChecklistRequirement[]>(() => {
        if (!workflow) {
            return [];
        }

        const results: ChecklistRequirement[] = [];

        for (const step of workflow.steps) {
            for (const req of step.requirements) {
                const matched = findMatchedDocument(documents, req.key, step.key);
                const { isExpired, isExpiringSoon } = checkExpiry(matched, req.key);

                results.push({
                    key: req.key,
                    stepKey: step.key,
                    stepLabel: step.label,
                    label: req.label,
                    done: req.done,
                    manual: req.manual,
                    notes: req.notes,
                    checkedAt: req.checkedAt,
                    checkedBy: req.checkedBy,
                    actionLabel: req.actionLabel,
                    matchedDocument: matched,
                    isExpired,
                    isExpiringSoon,
                });
            }
        }

        return results;
    }, [workflow, documents]);

    const totals = useMemo(() => {
        const total = requirements.length;
        const done = requirements.filter((r) => r.done).length;
        const expired = requirements.filter((r) => r.isExpired).length;
        const expiring = requirements.filter((r) => r.isExpiringSoon).length;

        return { total, done, expired, expiring, percent: total > 0 ? Math.round((done / total) * 100) : 0 };
    }, [requirements]);

    if (requirements.length === 0) {
        return null;
    }

    const grouped = requirements.reduce<Record<string, ChecklistRequirement[]>>((acc, req) => {
        if (!acc[req.stepLabel]) {
            acc[req.stepLabel] = [];
        }
        acc[req.stepLabel].push(req);

        return acc;
    }, {});

    return (
        <div className="rounded-xl border border-[var(--crm-border)] bg-[var(--crm-elevated)] p-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <FileText size={15} className="text-[var(--crm-accent)]" />
                        <h3 className="text-sm font-black uppercase tracking-[0.14em] text-[var(--crm-muted)]">Document checklist</h3>
                    </div>
                    <p className="mt-2 text-xs text-[var(--crm-muted)]">
                        {totals.done}/{totals.total} requirements met
                        {totals.expired > 0 ? ` / ${totals.expired} expired` : ''}
                        {totals.expiring > 0 ? ` / ${totals.expiring} expiring soon` : ''}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {totals.expired > 0 ? (
                        <span className="flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-1 text-[11px] font-bold text-red-300">
                            <AlertTriangle size={12} />
                            {totals.expired} expired
                        </span>
                    ) : null}
                    <button type="button" className="crm-action-button border-[var(--crm-accent)] bg-[color-mix(in_srgb,var(--crm-accent)_14%,transparent)] text-[var(--crm-accent)]" onClick={onUploadDocument}>
                        <UploadCloud size={13} />
                        Upload missing
                    </button>
                </div>
            </div>

            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-black/20">
                <div
                    className="h-full rounded-full bg-[var(--crm-accent)]"
                    style={{ width: `${totals.percent}%` }}
                />
            </div>

            <div className="mt-4 grid gap-3">
                {Object.entries(grouped).map(([stepLabel, reqs]) => (
                    <div key={stepLabel}>
                        <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--crm-muted)]">{stepLabel}</p>
                        <div className="grid gap-2">
                            {reqs.map((req) => (
                                <div key={req.key} className="flex flex-wrap items-center gap-3 rounded-lg border border-[var(--crm-border)] bg-black/10 px-3 py-2 md:flex-nowrap md:justify-between">
                                    <div className="flex min-w-0 items-center gap-2">
                                        {req.isExpired ? (
                                            <ShieldAlert size={14} className="shrink-0 text-red-400" />
                                        ) : req.done ? (
                                            <CheckCircle2 size={14} className="shrink-0 text-emerald-400" />
                                        ) : (
                                            <Circle size={14} className="shrink-0 text-[var(--crm-muted)]" />
                                        )}
                                        <span className="truncate text-xs font-bold text-[var(--crm-text)]">{req.label}</span>
                                        {req.isExpired ? (
                                            <span className="shrink-0 rounded-full bg-red-500/10 px-1.5 py-0.5 text-[10px] font-bold text-red-300">Expired</span>
                                        ) : req.isExpiringSoon ? (
                                            <span className="shrink-0 rounded-full bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-bold text-amber-300">
                                                <Clock size={10} className="inline" /> Soon
                                            </span>
                                        ) : null}
                                    </div>
                                    <div className="flex shrink-0 items-center gap-2 text-[11px]">
                                        {req.notes ? (
                                            <span className="text-[var(--crm-muted)]">{req.notes}</span>
                                        ) : null}
                                        <span className={req.done ? 'text-emerald-400' : 'text-[var(--crm-muted)]'}>
                                            {req.done ? 'Done' : 'Missing'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
