import { router } from '@inertiajs/react';
import { IconAlertCircle, IconArchive, IconArrowLeft, IconArrowRight, IconCircleCheck, IconCheck, IconCircle, IconExternalLink, IconFilePlus, IconFileUpload, IconRefresh, IconWand } from '@tabler/icons-react';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import type { DossierWorkflowProgress, DossierWorkflowRequirement, DossierWorkflowStep } from '@/features/clients/types';
import { cn } from '@/lib/cn';
import { useTranslation } from '@/lib/i18n';
import { getRequirementActionType, getStepActionType, getModuleRoute } from '@/features/clients/components/workflowActionTypes';

export type WorkflowRequirementActionContext = {
    step: DossierWorkflowStep;
    requirement: DossierWorkflowRequirement;
};

type Props = {
    dossierId: number;
    workflow: DossierWorkflowProgress | null;
    onRequirementAction?: (context: WorkflowRequirementActionContext) => void;
    onStepAction?: (step: DossierWorkflowStep) => void;
};

function statusLabel(status: string): { label: string; color: string } {
    if (status === 'completed') return { label: 'Completed', color: 'text-emerald-400' };
    if (status === 'in_progress') return { label: 'Current step', color: 'text-[var(--accent)]' };
    if (status === 'blocked') return { label: 'Needs attention', color: 'text-red-400' };
    return { label: 'Pending', color: 'text-[var(--text-subtle)]' };
}

function updateRequirement(dossierId: number, stepKey: string, requirementKey: string, isDone: boolean) {
    const notes = window.prompt(
        isDone
            ? 'Note optionnelle pour cet element workflow'
            : 'Note optionnelle pour expliquer l annulation',
        '',
    );
    if (notes === null) return;
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
    if (!url) { toast.error('Action indisponible.'); return; }
    router.visit(url, { preserveScroll: true });
}

function StepIcon({ status }: { status: string }) {
    if (status === 'completed') return <IconCheck size={14} strokeWidth={3} />;
    if (status === 'in_progress') return <IconCircle size={14} />;
    if (status === 'blocked') return <IconAlertCircle size={14} />;
    return <IconCircle size={14} />;
}

function StepConnector({ status }: { status: string }) {
    if (status === 'completed') return <div className="w-px flex-1 bg-emerald-400/30" />;
    return <div className="w-px flex-1 bg-[var(--border)]" />;
}

function VerticalStepItem({
    step,
    isActive,
    onClick,
}: {
    step: DossierWorkflowStep;
    isActive: boolean;
    onClick: () => void;
}) {
    const s = statusLabel(step.status);
    const isCompleted = step.status === 'completed';
    const isBlocked = step.status === 'blocked';

    return (
        <button type="button" onClick={onClick} className={cn(
            'group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all',
            isActive
                ? 'bg-[var(--accent)]/8 shadow-sm'
                : 'hover:bg-[var(--surface-2)]',
            isActive && 'ring-1 ring-[var(--accent)]/20',
        )}>
            <span className={cn(
                'flex size-7 shrink-0 items-center justify-center rounded-lg text-[10px] font-semibold transition-all',
                isCompleted && 'bg-emerald-400/15 text-emerald-400',
                isActive && !isCompleted && 'bg-[var(--accent)]/12 text-[var(--accent)]',
                !isCompleted && !isActive && 'bg-[var(--surface-3)] text-[var(--text-subtle)]',
                isBlocked && 'bg-red-400/12 text-red-400',
            )}>
                <StepIcon status={step.status} />
            </span>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className={cn(
                        'truncate text-[12px] font-medium',
                        isCompleted && 'text-emerald-400',
                        isActive && !isCompleted && 'text-[var(--foreground)]',
                        !isCompleted && !isActive && 'text-[var(--text-muted)]',
                        isBlocked && 'text-red-400',
                    )}>
                        {step.order}. {step.label}
                    </span>
                    {step.total > 0 && (
                        <span className="ml-auto shrink-0 text-[9px] font-medium text-[var(--text-subtle)]">
                            {step.done}/{step.total}
                        </span>
                    )}
                </div>
                <span className={cn(
                    'block text-[10px]',
                    s.color,
                )}>
                    {s.label}
                </span>
            </div>
        </button>
    );
}

const ACTION_ICONS: Record<string, React.ReactNode> = {
    upload_document: <IconFileUpload size={12} />,
    create_contract: <IconFilePlus size={12} />,
    generate_contract: <IconWand size={12} />,
    mark_signed: <IconCircleCheck size={12} />,
    mark_done: <IconCheck size={12} />,
    open_module: <IconExternalLink size={12} />,
    no_action: null,
};

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
    const actionType = getRequirementActionType(step.key, requirement.key);

    function handleAction() {
        if (onRequirementAction) { onRequirementAction({ step, requirement }); return; }
        openAction(requirement.actionUrl);
    }

    function handleManualToggle() {
        updateRequirement(dossierId, step.key, requirement.key, !requirement.done);
    }

    return (
        <div className="flex items-start gap-3 py-3 first:pt-0 last:pb-0 border-b border-[var(--border)] last:border-0">
            <span className={cn(
                'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full transition-colors',
                requirement.done
                    ? 'bg-emerald-400/15 text-emerald-400'
                    : 'border border-[var(--border)] text-[var(--text-subtle)]',
            )}>
                {requirement.done ? <IconCheck size={11} strokeWidth={3} /> : <IconCircle size={10} />}
            </span>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                    <span className="text-[12px] text-[var(--foreground)]">
                        {requirement.label}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                        {!requirement.done && actionType !== 'no_action' ? (
                            <button type="button" onClick={handleAction}
                                className="flex items-center gap-1 h-7 rounded-md border border-[var(--border)] px-2.5 text-[10px] font-medium text-[var(--foreground)] transition hover:bg-[var(--surface-2)]">
                                {ACTION_ICONS[actionType]}
                                {requirement.actionLabel || 'Open'}
                            </button>
                        ) : null}
                        {requirement.manual && (
                            <button type="button"
                                onClick={handleManualToggle}
                                className={cn(
                                    'flex items-center gap-1 h-7 rounded-md border px-2.5 text-[10px] font-medium transition',
                                    requirement.done
                                        ? 'border-red-400/30 text-red-400 hover:bg-red-400/8'
                                        : 'border-emerald-400/30 text-emerald-400 hover:bg-emerald-400/8',
                                )}>
                                <IconCheck size={12} />
                                {requirement.done ? 'Undo' : 'Done'}
                            </button>
                        )}
                    </div>
                </div>
                {requirement.notes && (
                    <p className="mt-0.5 text-[10px] text-[var(--text-muted)] line-clamp-2">{requirement.notes}</p>
                )}
                {(requirement.checkedBy || requirement.checkedAt) && (
                    <p className="mt-0.5 text-[9px] text-[var(--text-subtle)]">
                        {[requirement.checkedBy, requirement.checkedAt].filter(Boolean).join(' \u00B7 ')}
                    </p>
                )}
            </div>
        </div>
    );
}

function MobileStepChips({
    steps,
    activeKey,
    onSelect,
}: {
    steps: DossierWorkflowStep[];
    activeKey: string | null;
    onSelect: (key: string) => void;
}) {
    return (
        <div className="flex gap-1.5 overflow-x-auto pb-1 sm:hidden">
            {steps.map((step) => {
                const isActive = step.key === activeKey;
                const isCompleted = step.status === 'completed';
                const isBlocked = step.status === 'blocked';
                return (
                    <button key={step.key} type="button" onClick={() => onSelect(step.key)}
                        className={cn(
                            'flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium transition',
                            isActive && !isCompleted && 'bg-[var(--accent)]/10 text-[var(--accent)] ring-1 ring-[var(--accent)]/20',
                            isCompleted && 'bg-emerald-400/10 text-emerald-400',
                            isBlocked && 'bg-red-400/10 text-red-400',
                            !isActive && !isCompleted && !isBlocked && 'bg-[var(--surface-2)] text-[var(--text-muted)]',
                        )}>
                        <span className={cn(
                            'flex size-5 items-center justify-center rounded-full text-[9px]',
                            isCompleted && 'bg-emerald-400/20',
                            isActive && !isCompleted && 'bg-[var(--accent)]/20',
                            !isActive && !isCompleted && !isBlocked && 'bg-[var(--surface-3)]',
                            isBlocked && 'bg-red-400/20',
                        )}>
                            <StepIcon status={step.status} />
                        </span>
                        {step.label}
                    </button>
                );
            })}
        </div>
    );
}

export function AppWorkflowStepper({
    dossierId,
    workflow,
    onRequirementAction,
    onStepAction,
}: Props) {
    const { t } = useTranslation();
    const [activeStepKey, setActiveStepKey] = useState<string | null>(workflow?.currentStep ?? null);

    useEffect(() => {
        setActiveStepKey(workflow?.currentStep ?? workflow?.steps[0]?.key ?? null);
    }, [workflow?.currentStep, workflow?.steps]);

    const activeStep = useMemo(
        () => workflow?.steps.find((step) => step.key === activeStepKey) ?? workflow?.steps[0] ?? null,
        [activeStepKey, workflow?.steps],
    );

    if (!workflow) return null;

    const activeIndex = activeStep ? workflow.steps.findIndex((step) => step.key === activeStep.key) : -1;
    const prevStep = activeIndex > 0 ? workflow.steps[activeIndex - 1] : null;
    const nextStep = activeIndex >= 0 ? workflow.steps[activeIndex + 1] : null;
    const isComplete = activeStep?.status === 'completed';

    return (
        <div>
            <MobileStepChips
                steps={workflow.steps}
                activeKey={activeStepKey}
                onSelect={setActiveStepKey}
            />

            <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch">
                <div className="hidden shrink-0 sm:block sm:w-[260px] lg:w-[280px]">
                    <div className="rounded-[18px] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
                        <div className="mb-3">
                            <p className="text-[12px] font-semibold text-[var(--foreground)]">{t('clients.show.workflowProgress')}</p>
                            <p className="mt-0.5 text-[10px] text-[var(--text-muted)]">
                                Step {workflow.completed + 1} of {workflow.total}
                            </p>
                        </div>

                        <div className="relative mb-3 h-1 overflow-hidden rounded-full bg-[var(--surface-3)]">
                            <div className="h-full rounded-full bg-[var(--accent)] transition-all" style={{ width: `${workflow.percent}%` }} />
                        </div>
                        <p className="mb-4 text-right text-[10px] font-medium text-[var(--text-muted)]">{workflow.percent}%</p>

                        <div className="space-y-0">
                            {workflow.steps.map((step, idx) => (
                                <div key={step.key}>
                                    <VerticalStepItem
                                        step={step}
                                        isActive={step.key === activeStepKey}
                                        onClick={() => setActiveStepKey(step.key)}
                                    />
                                    {idx < workflow.steps.length - 1 && (
                                        <div className="flex justify-center py-0.5">
                                            <StepConnector status={step.status} />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {activeStep ? (
                    <div className="flex-1 min-w-0">
                        <div className="rounded-[18px] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm h-full flex flex-col">
                            <div className="mb-5">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--text-subtle)]">
                                                STEP {activeStep.order}
                                            </span>
                                            <span className={cn(
                                                'inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-semibold',
                                                isComplete && 'bg-emerald-400/12 text-emerald-400',
                                                activeStep.status === 'in_progress' && 'bg-[var(--accent)]/10 text-[var(--accent)]',
                                                activeStep.status === 'blocked' && 'bg-red-400/10 text-red-400',
                                                activeStep.status === 'pending' && 'bg-[var(--surface-3)] text-[var(--text-subtle)]',
                                            )}>
                                                {statusLabel(activeStep.status).label}
                                            </span>
                                        </div>
                                        <h3 className="text-[16px] font-semibold text-[var(--foreground)]">{activeStep.label}</h3>
                                        {activeStep.description && (
                                            <p className="mt-1 text-[12px] leading-relaxed text-[var(--text-muted)]">
                                                {activeStep.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {activeStep.requirements.length > 0 && (
                                <div className="flex-1">
                                    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)]/30 p-3">
                                        {activeStep.requirements.map((requirement) => (
                                            <RequirementRow
                                                key={requirement.key}
                                                dossierId={dossierId}
                                                step={activeStep}
                                                requirement={requirement}
                                                onRequirementAction={onRequirementAction}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="mt-5 flex items-center justify-between border-t border-[var(--border)] pt-4">
                                <div>
                                    {prevStep && (
                                        <button type="button" onClick={() => setActiveStepKey(prevStep.key)}
                                            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-medium text-[var(--text-muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]">
                                            <IconArrowLeft size={14} />
                                            Back
                                        </button>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    {isComplete && nextStep ? (
                                        <button type="button" onClick={() => setActiveStepKey(nextStep.key)}
                                            className="flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-4 py-1.5 text-[11px] font-semibold text-[var(--accent-foreground)] transition hover:brightness-110">
                                            Next step
                                            <IconArrowRight size={14} />
                                        </button>
                                    ) : null}
                                    {activeStep.primaryActionUrl && (
                                        <button type="button"
                                            onClick={() => {
                                                if (onStepAction) { onStepAction(activeStep); return; }
                                                openAction(activeStep.primaryActionUrl);
                                            }}
                                            className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-4 py-1.5 text-[11px] font-medium text-[var(--foreground)] transition hover:bg-[var(--surface-2)]">
                                            {ACTION_ICONS.open_module}
                                            {activeStep.primaryActionLabel || 'Open'}
                                            <IconExternalLink size={13} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
