import { useCallback, useMemo, useState } from 'react';
import { router } from '@inertiajs/react';
import { AlertCircle, ArrowLeft, ArrowRight, Check, Circle, CircleDot, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/cn';
import { AppModal } from '@/components/ui/AppModal';
import type { WorkflowData } from '@/types/workflow';
import { Button } from '@heroui/react';

export function WorkflowTab({ workflow, selectedStepKey, onSelectStep, dossierId, onOpenUpload, onOpenArchive }: {
    workflow: WorkflowData; selectedStepKey: string | null; onSelectStep: (key: string) => void; dossierId: number; onOpenUpload?: (stepKey: string, reqKey: string) => void; onOpenArchive?: () => void;
}) {
    const [modalState, setModalState] = useState<{
        stepKey: string; reqKey: string; isDone: boolean; notes: string;
    } | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const activeStep = useMemo(
        () => workflow.steps.find((step) => step.key === selectedStepKey) ?? workflow.steps[0] ?? null,
        [selectedStepKey, workflow.steps],
    );

    const activeIndex = activeStep ? workflow.steps.findIndex((s) => s.key === activeStep.key) : -1;
    const prevStep = activeIndex > 0 ? workflow.steps[activeIndex - 1] : null;
    const nextStep = activeIndex >= 0 ? workflow.steps[activeIndex + 1] : null;
    const isComplete = activeStep?.status === 'completed';

    if (!workflow || workflow.steps.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <CircleDot size={32} className="mb-3 text-[var(--text-subtle)]" />
                <p className="text-sm font-medium text-[var(--foreground)]">Aucun workflow defini</p>
                <p className="mt-1 text-xs text-[var(--text-muted)]">Ce projet n'a pas de workflow configure.</p>
            </div>
        );
    }

    function statusLabel(status: string) {
        if (status === 'completed') return { label: 'Termine', color: 'text-emerald-400' };
        if (status === 'in_progress') return { label: 'En cours', color: 'text-[var(--accent)]' };
        if (status === 'blocked') return { label: 'Bloque', color: 'text-red-400' };
        return { label: 'En attente', color: 'text-[var(--text-subtle)]' };
    }

    function StepIcon({ status }: { status: string }) {
        if (status === 'completed') return <Check size={14} strokeWidth={3} />;
        if (status === 'blocked') return <AlertCircle size={14} />;
        return <Circle size={14} />;
    }

    function openAction(url: string | null | undefined, isUpload: boolean = false, reqKey?: string, stepKey?: string, label?: string | null) {
        if (label === 'Creer la fiche d archive' && onOpenArchive) {
            onOpenArchive();
            return;
        }
        if (isUpload && onOpenUpload) {
            onOpenUpload(stepKey ?? activeStep.key, reqKey ?? '');
            return;
        }
        if (!url) return;
        router.visit(url, { preserveScroll: true });
    }

    const openRequirementModal = useCallback((stepKey: string, reqKey: string, isDone: boolean) => {
        setModalState({ stepKey, reqKey, isDone, notes: '' });
    }, []);

    const confirmRequirement = useCallback(() => {
        if (!modalState) return;
        setSubmitting(true);
        router.put(`/dossiers/${dossierId}/workflow-requirements`, {
            step_key: modalState.stepKey,
            requirement_key: modalState.reqKey,
            is_done: modalState.isDone,
            notes: modalState.notes,
        }, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                toast.success('Workflow mis a jour.');
                setModalState(null);
                setSubmitting(false);
            },
            onError: () => {
                toast.error('Erreur de mise a jour du workflow.');
                setSubmitting(false);
            },
        });
    }, [modalState, dossierId]);

    return (
        <div>
            {/* Mobile chips */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 sm:hidden">
                {workflow.steps.map((step) => {
                    const isActive = step.key === selectedStepKey;
                    const isCompleted = step.status === 'completed';
                    const isBlocked = step.status === 'blocked';
                    return (
                        <button key={step.key} type="button" onClick={() => onSelectStep(step.key)}
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

            <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch">
                {/* Step sidebar */}
                <div className="hidden shrink-0 sm:block sm:w-[260px] lg:w-[280px]">
                    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
                        <div className="mb-3">
                            <p className="text-[12px] font-semibold text-[var(--foreground)]">Avancement</p>
                            <p className="mt-0.5 text-[10px] text-[var(--text-muted)]">
                                Etape {workflow.completed + 1} sur {workflow.total}
                            </p>
                        </div>
                        <div className="relative mb-3 h-1 overflow-hidden rounded-full bg-[var(--surface-3)]">
                            <div className="h-full rounded-full bg-[var(--accent)] transition-all" style={{ width: `${workflow.percent}%` }} />
                        </div>
                        <p className="mb-4 text-right text-[10px] font-medium text-[var(--text-muted)]">{workflow.percent}%</p>
                        <div className="space-y-0">
                            {workflow.steps.map((step, idx) => {
                                const isActive = step.key === selectedStepKey;
                                const isCompleted = step.status === 'completed';
                                const isBlocked = step.status === 'blocked';
                                const s = statusLabel(step.status);
                                return (
                                    <div key={step.key}>
                                        <button type="button" onClick={() => onSelectStep(step.key)} className={cn(
                                            'group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all',
                                            isActive ? 'bg-[var(--accent)]/8 shadow-sm' : 'hover:bg-[var(--surface-2)]',
                                            isActive && 'ring-1 ring-[var(--accent)]/20',
                                        )}>
                                            <span className={cn(
                                                'flex size-7 shrink-0 items-center justify-center rounded-[7px] text-[10px] font-semibold transition-all',
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
                                                <span className={cn('block text-[10px]', s.color)}>
                                                    {s.label}
                                                </span>
                                            </div>
                                        </button>
                                        {idx < workflow.steps.length - 1 && (
                                            <div className="flex justify-center py-0.5">
                                                <div className={cn(
                                                    'w-px h-4',
                                                    step.status === 'completed' ? 'bg-emerald-400/30' : 'bg-[var(--border)]',
                                                )} />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Overview */}
                {/* Step detail */}
                {activeStep && (
                    <div className="flex-1 min-w-0">
                        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm h-full flex flex-col">
                            <div className="mb-5">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--text-subtle)]">
                                                ETAPE {activeStep.order}
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
                                    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)]/30 p-3">
                                        {activeStep.requirements.map((req) => (
                                            <div key={req.key} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0 border-b border-[var(--border)] last:border-0">
                                                <span className={cn(
                                                    'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full transition-colors',
                                                    req.done
                                                        ? 'bg-emerald-400/15 text-emerald-400'
                                                        : 'border border-[var(--border)] text-[var(--text-subtle)]',
                                                )}>
                                                    {req.done ? <Check size={11} strokeWidth={3} /> : <Circle size={10} />}
                                                </span>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <span className="text-[12px] text-[var(--foreground)]">{req.label}</span>
                                                        <div className="flex items-center gap-1.5 shrink-0">
                                                            {!req.done && req.actionUrl && (
                                                                 <button type="button" onClick={() => openAction(req.actionUrl, req.actionLabel === 'Televerser / ouvrir', req.key, activeStep.key, req.actionLabel)}
                                                                    className="flex items-center gap-1 h-7 rounded-md border border-[var(--border)] px-2.5 text-[10px] font-medium text-[var(--foreground)] transition hover:bg-[var(--surface-2)]">
                                                                    {req.actionLabel || 'Ouvrir'}
                                                                </button>
                                                            )}
                                                            {req.manual && (
                                                                <button type="button"
                                                                    onClick={() => openRequirementModal(activeStep.key, req.key, !req.done)}
                                                                    className={cn(
                                                                        'flex items-center gap-1 h-7 rounded-md border px-2.5 text-[10px] font-medium transition',
                                                                        req.done
                                                                            ? 'border-red-400/30 text-red-400 hover:bg-red-400/8'
                                                                            : 'border-emerald-400/30 text-emerald-400 hover:bg-emerald-400/8',
                                                                    )}>
                                                                    <Check size={12} />
                                                                    {req.done ? 'Annuler' : 'Fait'}
                                                                </button>
                                                            )}
                                                            {req.done && !req.manual && (
                                                                <button type="button" onClick={() => openRequirementModal(activeStep.key, req.key, false)}
                                                                    className="flex items-center gap-1 h-7 rounded-md border border-red-400/30 px-2.5 text-[10px] font-medium text-red-400 transition hover:bg-red-400/8">
                                                                    Annuler
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {req.notes && (
                                                        <p className="mt-0.5 text-[10px] text-[var(--text-muted)] line-clamp-2">{req.notes}</p>
                                                    )}
                                                    {(req.checkedBy || req.checkedAt) && (
                                                        <p className="mt-0.5 text-[9px] text-[var(--text-subtle)]">
                                                            {[req.checkedBy, req.checkedAt].filter(Boolean).join(' \u00B7 ')}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="mt-5 flex items-center justify-between border-t border-[var(--border)] pt-4">
                                <div>
                                    {prevStep && (
                                        <button type="button" onClick={() => onSelectStep(prevStep.key)}
                                            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-medium text-[var(--text-muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]">
                                            <ArrowLeft size={14} />
                                            Precedent
                                        </button>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    {isComplete && nextStep ? (
                                        <button type="button" onClick={() => onSelectStep(nextStep.key)}
                                            className="flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-4 py-1.5 text-[11px] font-semibold text-[var(--accent-foreground)] transition hover:brightness-110">
                                            Suivante
                                            <ArrowRight size={14} />
                                        </button>
                                    ) : null}
                                    {activeStep.primaryActionUrl && activeStep.key === 'archive' && onOpenArchive ? (
                                        <button type="button" onClick={onOpenArchive}
                                            className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-4 py-1.5 text-[11px] font-medium text-[var(--foreground)] transition hover:bg-[var(--surface-2)]">
                                            <ExternalLink size={13} />
                                            {activeStep.primaryActionLabel || 'Ouvrir'}
                                        </button>
                                    ) : activeStep.primaryActionUrl ? (
                                        <button type="button" onClick={() => openAction(activeStep.primaryActionUrl)}
                                            className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-4 py-1.5 text-[11px] font-medium text-[var(--foreground)] transition hover:bg-[var(--surface-2)]">
                                            <ExternalLink size={13} />
                                            {activeStep.primaryActionLabel || 'Ouvrir'}
                                        </button>
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Requirement modal */}
            <AppModal
                isOpen={!!modalState}
                onOpenChange={(open) => { if (!open) setModalState(null); }}
                title={modalState?.isDone ? 'Marquer comme fait' : 'Annuler'}
                size="sm"
            >
                <div className="space-y-4">
                    <p className="text-sm text-[var(--text-muted)]">
                        {modalState?.isDone
                            ? 'Confirmez que cette exigence est remplie.'
                            : 'Expliquez pourquoi cette exigence n\'est plus valide.'}
                    </p>
                    <textarea
                        value={modalState?.notes ?? ''}
                        onChange={(e) => setModalState((prev) => prev ? { ...prev, notes: e.target.value } : null)}
                        placeholder="Note optionnelle..."
                        rows={3}
                        className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-[12px] text-[var(--foreground)] placeholder:text-[var(--text-subtle)] outline-none transition focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] resize-none"
                    />
                    <div className="flex justify-end gap-2">
                        <Button variant="bordered" onPress={() => setModalState(null)} isDisabled={submitting}>
                            Annuler
                        </Button>
                        <Button
                            variant="solid"
                            color={modalState?.isDone ? 'primary' : 'danger'}
                            onPress={confirmRequirement}
                            isLoading={submitting}
                        >
                            Confirmer
                        </Button>
                    </div>
                </div>
            </AppModal>
        </div>
    );
}
