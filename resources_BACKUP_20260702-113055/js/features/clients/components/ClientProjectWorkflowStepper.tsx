import { router } from '@inertiajs/react';
import { ArrowRight, CheckCircle2, Circle, CircleDashed, ExternalLink, RotateCcw } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import type { DossierWorkflowProgress, DossierWorkflowRequirement, DossierWorkflowStep } from '@/features/clients/types';

type ClientProjectWorkflowStepperProps = {
    dossierId: number;
    workflow: DossierWorkflowProgress | null;
    onRequirementAction?: (context: WorkflowRequirementActionContext) => void;
    onStepAction?: (step: DossierWorkflowStep) => void;
};

export type WorkflowRequirementActionContext = {
    step: DossierWorkflowStep;
    requirement: DossierWorkflowRequirement;
};

function statusTone(status: string) {
    if (status === 'completed') return 'border-emerald-400/25 bg-emerald-400/10 text-emerald-300';
    if (status === 'in_progress') return 'border-amber-400/25 bg-amber-400/10 text-amber-300';
    if (status === 'blocked') return 'border-red-400/25 bg-red-400/10 text-red-300';

    return 'border-[var(--crm-border)] bg-black/15 text-[var(--crm-muted)]';
}

function StepIcon({ status }: { status: string }) {
    if (status === 'completed') return <CheckCircle2 size={15} />;
    if (status === 'in_progress') return <CircleDashed size={15} />;

    return <Circle size={15} />;
}

function updateRequirement(dossierId: number, stepKey: string, requirementKey: string, isDone: boolean) {
    const notes = window.prompt(
        isDone
            ? 'Note optionnelle pour cet element workflow'
            : 'Note optionnelle pour expliquer l annulation',
        '',
    );

    if (notes === null) {
        return;
    }

    router.put(`/dossiers/${dossierId}/workflow-requirements`, {
        step_key: stepKey,
        requirement_key: requirementKey,
        is_done: isDone,
        notes,
    }, {
        preserveScroll: true,
        preserveState: false,
        onSuccess: () => toast.success('Workflow mis a jour.'),
        onError: () => toast.error('Impossible de mettre a jour le workflow.'),
    });
}

function openAction(url: string | null | undefined) {
    if (!url) {
        toast.error('Action indisponible.');
        return;
    }

    router.visit(url, {
        preserveScroll: true,
    });
}

function RequirementRow({
    dossierId,
    step,
    requirement,
    onRequirementAction,
}: {
    dossierId: number;
    step: DossierWorkflowStep;
    requirement: DossierWorkflowRequirement;
    onRequirementAction?: (context: WorkflowRequirementActionContext) => void;
}) {
    function handleAction() {
        if (onRequirementAction) {
            onRequirementAction({ step, requirement });
            return;
        }

        openAction(requirement.actionUrl);
    }

    return (
        <div className="grid gap-3 rounded-xl border border-[var(--crm-border)] bg-black/10 p-3 md:grid-cols-[1fr_auto] md:items-center">
            <div className="min-w-0">
                <div className="flex items-center gap-2">
                    <span className={['flex size-6 shrink-0 items-center justify-center rounded-full border', requirement.done ? statusTone('completed') : statusTone('pending')].join(' ')}>
                        {requirement.done ? <CheckCircle2 size={13} /> : <Circle size={13} />}
                    </span>
                    <p className="truncate text-sm font-bold text-[var(--crm-text)]">{requirement.label}</p>
                </div>
                <p className="ml-8 mt-1 text-xs text-[var(--crm-muted)]">
                    {requirement.done ? 'Fait' : 'A faire'}{requirement.manual ? ' / validation manuelle' : ' / detection automatique possible'}
                </p>
                {requirement.notes ? (
                    <p className="ml-8 mt-1 line-clamp-2 text-xs text-[var(--crm-text-muted)]">{requirement.notes}</p>
                ) : null}
                {requirement.checkedBy || requirement.checkedAt ? (
                    <p className="ml-8 mt-1 text-[11px] text-[var(--crm-muted)]">
                        {[requirement.checkedBy, requirement.checkedAt].filter(Boolean).join(' / ')}
                    </p>
                ) : null}
            </div>

            <div className="flex flex-wrap gap-2 md:justify-end">
                {!requirement.done ? (
                    <button
                        type="button"
                        className="crm-action-button border-[var(--crm-accent)] bg-[color-mix(in_srgb,var(--crm-accent)_14%,transparent)] text-[var(--crm-accent)]"
                        onClick={handleAction}
                    >
                        <ExternalLink size={13} />
                        {requirement.actionLabel || 'Ouvrir'}
                    </button>
                ) : null}
                <button
                    type="button"
                    className={[
                        'crm-action-button',
                        requirement.done
                            ? 'border-red-400/20 bg-red-400/10 text-red-300'
                            : 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300',
                    ].join(' ')}
                    onClick={() => updateRequirement(dossierId, step.key, requirement.key, !requirement.done)}
                >
                    {requirement.done ? <RotateCcw size={13} /> : <CheckCircle2 size={13} />}
                    {requirement.done ? 'Annuler' : 'Marquer fait'}
                </button>
            </div>
        </div>
    );
}

function ActiveStepPanel({
    dossierId,
    step,
    onNext,
    hasNext,
    onStepAction,
    onRequirementAction,
}: {
    dossierId: number;
    step: DossierWorkflowStep;
    onNext: () => void;
    hasNext: boolean;
    onStepAction?: (step: DossierWorkflowStep) => void;
    onRequirementAction?: (context: WorkflowRequirementActionContext) => void;
}) {
    const missing = step.requirements.filter((requirement) => !requirement.done);
    const isComplete = step.status === 'completed';

    return (
        <div className="rounded-2xl border border-[var(--crm-border)] bg-[var(--crm-elevated)] p-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <span className={['flex size-9 shrink-0 items-center justify-center rounded-full border', statusTone(step.status)].join(' ')}>
                            <StepIcon status={step.status} />
                        </span>
                        <div>
                            <p className="text-xs font-black uppercase tracking-[0.14em] text-[var(--crm-muted)]">Etape {step.order}</p>
                            <h4 className="text-lg font-black text-[var(--crm-text)]">{step.label}</h4>
                        </div>
                    </div>
                    {step.description ? (
                        <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--crm-muted)]">{step.description}</p>
                    ) : null}
                </div>

                <div className="flex flex-wrap gap-2 lg:justify-end">
                    <button
                        type="button"
                        className="crm-action-button"
                        onClick={() => {
                            if (onStepAction) {
                                onStepAction(step);
                                return;
                            }

                            openAction(step.primaryActionUrl);
                        }}
                    >
                        <ExternalLink size={14} />
                        {step.primaryActionLabel || 'Ouvrir'}
                    </button>
                    <button
                        type="button"
                        className={[
                            'crm-action-button',
                            isComplete && hasNext
                                ? 'border-[var(--crm-accent)] bg-[color-mix(in_srgb,var(--crm-accent)_14%,transparent)] text-[var(--crm-accent)]'
                                : 'opacity-50',
                        ].join(' ')}
                        disabled={!isComplete || !hasNext}
                        onClick={onNext}
                    >
                        <ArrowRight size={14} />
                        Etape suivante
                    </button>
                </div>
            </div>

            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-black/20">
                <div
                    className="h-full rounded-full bg-[var(--crm-accent)]"
                    style={{ width: `${step.total > 0 ? Math.round((step.done / step.total) * 100) : 0}%` }}
                />
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-[var(--crm-muted)]">
                <span>{step.done} / {step.total}</span>
                <span>{missing.length ? `${missing.length} action(s) restante(s)` : 'Etape complete'}</span>
            </div>

            <div className="mt-4 grid gap-2">
                {step.requirements.map((requirement) => (
                    <RequirementRow
                        key={requirement.key}
                        dossierId={dossierId}
                        step={step}
                        requirement={requirement}
                        onRequirementAction={onRequirementAction}
                    />
                ))}
            </div>
        </div>
    );
}

export function ClientProjectWorkflowStepper({
    dossierId,
    workflow,
    onRequirementAction,
    onStepAction,
}: ClientProjectWorkflowStepperProps) {
    const [activeStepKey, setActiveStepKey] = useState<string | null>(workflow?.currentStep ?? null);

    useEffect(() => {
        setActiveStepKey(workflow?.currentStep ?? workflow?.steps[0]?.key ?? null);
    }, [workflow?.currentStep, workflow?.steps]);

    const activeStep = useMemo(
        () => workflow?.steps.find((step) => step.key === activeStepKey) ?? workflow?.steps[0] ?? null,
        [activeStepKey, workflow?.steps],
    );

    if (!workflow) {
        return null;
    }

    const activeIndex = activeStep ? workflow.steps.findIndex((step) => step.key === activeStep.key) : -1;
    const nextStep = activeIndex >= 0 ? workflow.steps[activeIndex + 1] : null;

    return (
        <section className="grid gap-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <p className="crm-eyebrow">Workflow dossier</p>
                    <h3 className="mt-1 text-base font-black text-[var(--crm-text)]">
                        Assistant etapes client / projet
                    </h3>
                    <p className="mt-1 text-xs text-[var(--crm-muted)]">
                        Terminez l etape active, puis passez a l etape suivante.
                    </p>
                </div>
                <div className="text-left md:text-right">
                    <p className="text-2xl font-black text-[var(--crm-accent)]">{workflow.percent}%</p>
                    <p className="text-xs text-[var(--crm-muted)]">{workflow.completed} / {workflow.total} etapes terminees</p>
                </div>
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-black/20">
                <div className="h-full rounded-full bg-[var(--crm-accent)]" style={{ width: `${workflow.percent}%` }} />
            </div>

            <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                {workflow.steps.map((step) => (
                    <button
                        key={step.key}
                        type="button"
                        onClick={() => setActiveStepKey(step.key)}
                        className={[
                            'flex min-w-[150px] items-center gap-2 rounded-xl border px-3 py-2 text-left transition',
                            activeStep?.key === step.key
                                ? 'border-[var(--crm-accent)] bg-[color-mix(in_srgb,var(--crm-accent)_14%,transparent)]'
                                : 'border-[var(--crm-border)] bg-black/10 hover:border-[color-mix(in_srgb,var(--crm-accent)_45%,var(--crm-border))]',
                        ].join(' ')}
                    >
                        <span className={['flex size-7 shrink-0 items-center justify-center rounded-full border', statusTone(step.status)].join(' ')}>
                            <StepIcon status={step.status} />
                        </span>
                        <span className="min-w-0">
                            <span className="block truncate text-xs font-black text-[var(--crm-text)]">{step.order}. {step.label}</span>
                            <span className="block text-[10px] text-[var(--crm-muted)]">{step.done}/{step.total}</span>
                        </span>
                    </button>
                ))}
            </div>

            {activeStep ? (
                <div className="mt-4">
                    <ActiveStepPanel
                        dossierId={dossierId}
                        step={activeStep}
                        hasNext={Boolean(nextStep)}
                        onStepAction={onStepAction}
                        onRequirementAction={onRequirementAction}
                        onNext={() => {
                            if (nextStep) {
                                setActiveStepKey(nextStep.key);
                            }
                        }}
                    />
                </div>
            ) : null}
        </section>
    );
}
