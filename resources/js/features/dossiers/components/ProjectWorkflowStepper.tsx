import { Check } from 'lucide-react';
import { cn } from '@/lib/cn';

interface WorkflowStepData {
    key: string;
    order: number;
    label: string;
    status: string;
    done: number;
    total: number;
}

interface ProjectWorkflowStepperProps {
    steps: WorkflowStepData[];
    currentStep: string | null;
    completed: number;
    total: number;
    onStepClick: (key: string) => void;
}

const SHORT_LABELS: Record<string, string> = {
    documents: 'Documents',
    contract: 'Contract',
    cahier_chantier: 'Cahier',
    rokhas: 'Rokhas',
    bureau_etude: 'Bureau',
    permis_habiter: 'Permis',
    archive: 'Archive',
};

function shortLabel(key: string, fallback: string): string {
    return SHORT_LABELS[key] ?? fallback;
}

function statusText(status: string): string {
    if (status === 'completed') return 'Completed';
    if (status === 'in_progress') return 'In progress';
    if (status === 'blocked') return 'Needs attention';
    return 'Pending';
}

export function ProjectWorkflowStepper({ steps, currentStep, completed, total, onStepClick }: ProjectWorkflowStepperProps) {
    if (!steps || steps.length === 0) return null;

    return (
        <div className="flex items-center w-full overflow-x-auto">
            <div className="flex items-stretch flex-1 min-w-0 py-4 gap-0">
                {steps.map((step, idx) => {
                    const isCompleted = step.status === 'completed';
                    const isActive = step.key === currentStep;
                    const isBlocked = step.status === 'blocked';
                    const showConnector = idx < steps.length - 1;

                    let connectorColor: string;
                    if (isCompleted) {
                        connectorColor = 'bg-emerald-500';
                    } else if (isActive) {
                        connectorColor = 'bg-gradient-to-r from-[var(--accent)] to-[rgba(255,255,255,.14)]';
                    } else {
                        connectorColor = 'bg-[rgba(255,255,255,.14)]';
                    }

                    return (
                        <div key={step.key} className="flex-1 flex flex-col items-center relative min-w-[82px]">
                            <button type="button"
                                onClick={() => onStepClick(step.key)}
                                title={`${step.label} \u2014 ${statusText(step.status)}`}
                                className="group relative z-10 flex flex-col items-center gap-1.5 transition hover:opacity-90">
                                <span className={cn(
                                    'flex size-[34px] items-center justify-center rounded-full text-[12px] font-bold transition-all duration-200 border-2',
                                    'group-hover:scale-110 group-hover:shadow-md',
                                    isCompleted && 'border-emerald-500 bg-emerald-500 text-white shadow-lg shadow-emerald-500/20',
                                    isActive && !isCompleted && 'border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-foreground)] shadow-lg shadow-[var(--accent)]/20',
                                    isBlocked && !isActive && 'border-red-400/40 bg-red-400/10 text-red-400',
                                    !isCompleted && !isActive && !isBlocked && 'border-[rgba(255,255,255,.16)] bg-[rgba(255,255,255,.06)] text-[var(--text-muted)]',
                                )}>
                                    {isCompleted
                                        ? <Check size={16} strokeWidth={3} />
                                        : <span>{step.order}</span>
                                    }
                                </span>
                                <span className={cn(
                                    'text-[11px] font-medium text-center leading-tight max-w-[80px] truncate',
                                    isCompleted && 'text-emerald-400',
                                    isActive && !isCompleted && 'text-[var(--accent)] font-semibold',
                                    !isCompleted && !isActive && 'text-[var(--text-muted)]',
                                )}>
                                    {shortLabel(step.key, step.label)}
                                </span>
                                {step.total > 0 && (
                                    <span className={cn(
                                        'text-[10px] leading-none text-center',
                                        isCompleted && 'text-emerald-400/70',
                                        !isCompleted && 'text-[var(--text-subtle)]',
                                    )}>
                                        {step.done}/{step.total}
                                    </span>
                                )}
                            </button>
                            {showConnector && (
                                <div className={cn(
                                    'absolute top-[17px] h-[2.5px] z-0 rounded-full',
                                    connectorColor,
                                )} style={{
                                    left: 'calc(50% + 17px)',
                                    width: 'calc(100% - 34px)',
                                }} />
                            )}
                        </div>
                    );
                })}
            </div>
            <div className="shrink-0 flex items-center gap-2 pl-4 ml-4 border-l border-[var(--border)] self-stretch">
                <span className="text-[15px] font-bold text-[var(--accent)] leading-none">{completed}</span>
                <span className="text-[12px] text-[var(--text-muted)]">/ {total}</span>
            </div>
        </div>
    );
}
