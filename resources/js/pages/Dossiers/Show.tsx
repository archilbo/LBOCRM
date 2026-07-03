import { Head, router } from '@inertiajs/react';
import {
    AlertCircle,
    Archive,
    ArrowLeft,
    ArrowRight,
    BadgeDollarSign,
    Building2,
    Check,
    Circle,
    CircleDot,
    ExternalLink,
    FileCheck2,
    FileText,
    FolderKanban,
    Landmark,
    MapPin,
    Pencil,
    ReceiptText,
    ShieldCheck,
    UserRound,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { AppShell } from '@/components/layout/AppShell';
import { AppButton } from '@/components/ui/AppButton';
import { StatusPill } from '@/components/ui/StatusPill';
import { cn } from '@/lib/cn';
import { ProjectWorkflowStepper } from '@/features/dossiers/components/ProjectWorkflowStepper';
import type { DossierRow } from '@/features/dossiers/types';

type DocSummary = {
    id: number; name: string; status: string; fileName: string | null; uploadedAt: string | null;
};
type ContractSummary = {
    id: number; contractNumber: string; status: string; ttc: number;
} | null;
type AuthorizationSummary = {
    id: number; submissionNumber: string | null; authorizationNumber: string | null; authorityName: string | null; status: string;
} | null;
type FinanceSummary = {
    id: number; recordNumber: string; type: string; status: string; totalTtc: number; paid: number; remaining: number;
};
type ArchiveSummary = {
    id: number; archiveNumber: string; status: string; room: string | null; shelf: string | null; box: string | null; folder: string | null;
} | null;

type WorkflowRequirement = {
    key: string; label: string; done: boolean; manual: boolean; notes: string | null;
    checkedAt: string | null; checkedBy: string | null; actionLabel: string; actionUrl: string;
};
type WorkflowStep = {
    key: string; order: number; label: string; description: string | null;
    status: string; statusLabel: string; done: number; total: number;
    requirements: WorkflowRequirement[]; primaryActionLabel: string; primaryActionUrl: string;
};
type WorkflowData = {
    completed: number; total: number; percent: number; currentStep: string | null; steps: WorkflowStep[];
};

type PageProps = {
    dossier: DossierRow;
    workflow: WorkflowData;
    documents: DocSummary[];
    contract: ContractSummary;
    authorization: AuthorizationSummary;
    financeRecords: FinanceSummary[];
    archiveRecord: ArchiveSummary;
};

type TabId = 'overview' | 'workflow' | 'documents' | 'contract' | 'finance' | 'authorizations' | 'notes' | 'activity';

const TABS: { id: TabId; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'workflow', label: 'Workflow' },
    { id: 'documents', label: 'Documents' },
    { id: 'contract', label: 'Contract' },
    { id: 'finance', label: 'Finance' },
    { id: 'authorizations', label: 'Authorizations' },
    { id: 'notes', label: 'Notes' },
    { id: 'activity', label: 'Activity' },
];

function money(value: number) {
    return `${Number(value || 0).toLocaleString('fr-MA')} MAD`;
}

function surface(value: number | null) {
    return value ? `${value} m2` : '-';
}

function stepStatusColor(status: string) {
    if (['completed', 'signed', 'approved', 'paid', 'stored', 'done'].includes(status)) return 'success';
    if (['in_progress', 'active', 'uploaded', 'generated', 'issued', 'submitted'].includes(status)) return 'primary';
    if (['draft', 'pending', 'missing', 'blocked'].includes(status)) return 'warning';
    return 'default';
}

function dossierStatusColor(status: string) {
    if (status === 'active') return 'success';
    if (status === 'opened') return 'primary';
    if (status === 'closed') return 'default';
    if (status === 'archived' || status === 'paused') return 'warning';
    return 'default';
}

function workflowLabel(value: string) {
    const labels: Record<string, string> = {
        documents: 'Documents',
        contract: 'Contract',
        cahier_chantier: 'Cahier de chantier',
        rokhas: 'Rokhas',
        bureau_etude: "Bureau d'etude",
        permis_habiter: "Permis d'habiter",
        archive: 'Archive',
    };
    return labels[value] ?? value;
}

export default function DossierShow({
    dossier, workflow, documents, contract, authorization, financeRecords, archiveRecord,
}: PageProps) {
    const [activeTab, setActiveTab] = useState<TabId>('overview');
    const [selectedStepKey, setSelectedStepKey] = useState(workflow.currentStep ?? workflow.steps[0]?.key ?? null);
    const tabsRef = useRef<HTMLDivElement>(null);

    const totalFinance = financeRecords.reduce((s, r) => s + r.totalTtc, 0);
    const paidFinance = financeRecords.reduce((s, r) => s + r.paid, 0);
    const remainingFinance = financeRecords.reduce((s, r) => s + r.remaining, 0);

    const selectedStep = useMemo(
        () => workflow.steps.find((s) => s.key === selectedStepKey) ?? null,
        [workflow.steps, selectedStepKey],
    );

    const quickActions = [
        { label: 'Edit', icon: <Pencil size={14} />, action: () => router.visit(`/dossiers/${dossier.id}`) },
        { label: 'Documents', icon: <FileCheck2 size={14} />, action: () => router.visit(`/documents?search=${encodeURIComponent(dossier.dossierNumber)}`) },
        { label: 'Contract', icon: <FileText size={14} />, action: () => router.visit('/contracts') },
        { label: 'Finance', icon: <BadgeDollarSign size={14} />, action: () => router.visit('/finance') },
    ];

    return (
        <>
            <Head title={dossier.dossierNumber} />

            <AppShell>
                {/* ── Page header ── */}
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <button type="button" onClick={() => router.visit('/dossiers')}
                            className="mb-2 inline-flex items-center gap-1 text-[11px] font-medium text-[var(--text-muted)] hover:text-[var(--foreground)]">
                            <ArrowLeft size={13} />
                            Back to Projects
                        </button>
                        <h1 className="text-2xl font-bold tracking-[-0.02em] text-[var(--foreground)]">
                            {dossier.projectObject || dossier.dossierNumber}
                        </h1>
                        <p className="mt-0.5 text-sm text-[var(--text-muted)]">
                            {dossier.dossierNumber} / {dossier.clientName}
                        </p>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-1.5">
                        {quickActions.map((a) => (
                            <AppButton key={a.label} variant="bordered" size="sm" className="h-8 text-[11px]" onPress={a.action}>
                                {a.icon} {a.label}
                            </AppButton>
                        ))}
                    </div>
                </div>

                {/* ── Hero summary card ── */}
                <div className="mb-5 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
                    <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex min-w-0 items-start gap-3.5">
                            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--accent)_15%,transparent)] text-[var(--accent)]">
                                <FolderKanban size={20} />
                            </div>
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-1.5">
                                    <StatusPill label={dossier.status} color={dossierStatusColor(dossier.status)} size="sm" />
                                    <StatusPill label={workflowLabel(selectedStep?.key ?? dossier.workflowStep)} color="primary" size="sm" />
                                </div>
                                <p className="mt-1.5 text-[13px] text-[var(--foreground)]">
                                    {dossier.clientName} · {dossier.dossierNumber}
                                </p>
                            </div>
                        </div>
                        <div className="grid gap-x-6 gap-y-1 text-[12px] text-[var(--text-muted)] sm:grid-cols-2 sm:text-right">
                            <span>{dossier.clientNumber} / {dossier.clientCin}</span>
                            <span>{[dossier.province, dossier.commune].filter(Boolean).join(', ') || '-'}</span>
                            <span>Opened: {dossier.openedAt || '-'}</span>
                            <span>Updated: {dossier.updatedAt || '-'}</span>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 border-t border-[var(--border)] px-4 py-2.5">
                        <AppButton variant="bordered" size="sm" className="h-7 text-[11px]" onPress={() => router.visit(`/clients/${dossier.clientId}`)}>
                            <UserRound size={13} /> Open client
                        </AppButton>
                        <AppButton variant="bordered" size="sm" className="h-7 text-[11px]" onPress={() => router.visit(`/dossiers/${dossier.id}/edit`)}>
                            <Pencil size={13} /> Edit
                        </AppButton>
                        <AppButton variant="bordered" size="sm" className="h-7 text-[11px]" onPress={() => router.visit(`/contracts?dossier_id=${dossier.id}`)}>
                            <FileText size={13} /> Contract
                        </AppButton>
                        <AppButton variant="bordered" size="sm" className="h-7 text-[11px]" onPress={() => router.visit(`/documents?dossier_id=${dossier.id}`)}>
                            <FileCheck2 size={13} /> Documents
                        </AppButton>
                    </div>
                </div>

                {/* ── Workflow stepper ── */}
                <div className="mb-5 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
                    <div className="px-4 sm:px-5">
                        <ProjectWorkflowStepper
                            steps={workflow.steps}
                            currentStep={workflow.currentStep}
                            completed={workflow.completed}
                            total={workflow.total}
                            onStepClick={(key) => { setSelectedStepKey(key); setActiveTab('workflow'); }}
                        />
                    </div>
                </div>

                {/* ── Metrics row ── */}
                <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
                    <MetricCard label="Documents" value={documents.length} hint="Linked files" icon={FileCheck2} />
                    <MetricCard label="Finance total" value={money(totalFinance)} hint="All records" icon={BadgeDollarSign} color="text-[var(--foreground)]" />
                    <MetricCard label="Paid" value={money(paidFinance)} hint="Collected" icon={ReceiptText} color="text-emerald-500" />
                    <MetricCard label="Remaining" value={money(remainingFinance)} hint="Still due" icon={Landmark} color="text-amber-500" />
                    <MetricCard label="Contract" value={contract ? contract.status : 'None'} hint={contract ? `${money(contract.ttc)}` : '-'} icon={FileText} />
                    <MetricCard label="Authorization" value={authorization ? authorization.status : 'None'} hint={authorization?.authorityName || '-'} icon={ShieldCheck} />
                </div>

                {/* ── Tabs ── */}
                <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
                    <div ref={tabsRef} className="flex overflow-x-auto border-b border-[var(--border)]">
                        {TABS.map((tab) => (
                            <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    'relative flex items-center justify-center px-4 py-2.5 text-[13px] font-medium outline-none transition whitespace-nowrap',
                                    activeTab === tab.id
                                        ? 'text-[var(--accent)] after:absolute after:bottom-0 after:left-2 after:right-2 after:h-0.5 after:rounded-full after:bg-[var(--accent)]'
                                        : 'text-[var(--text-muted)] hover:text-[var(--foreground)]',
                                )}>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                    <div className="p-4 sm:p-5">
                        {activeTab === 'overview' && (
                            <OverviewTab dossier={dossier} workflow={workflow} contract={contract}
                                authorization={authorization} archiveRecord={archiveRecord} />
                        )}
                        {activeTab === 'workflow' && (
                            <WorkflowTab workflow={workflow} selectedStepKey={selectedStepKey} onSelectStep={setSelectedStepKey} dossierId={dossier.id} />
                        )}
                        {activeTab === 'documents' && <DocumentsTab documents={documents} dossierNumber={dossier.dossierNumber} />}
                        {activeTab === 'contract' && <ContractTab contract={contract} dossierId={dossier.id} />}
                        {activeTab === 'finance' && <FinanceTab records={financeRecords} total={totalFinance} paid={paidFinance} remaining={remainingFinance} />}
                        {activeTab === 'authorizations' && <AuthorizationsTab authorization={authorization} dossierId={dossier.id} dossierNumber={dossier.dossierNumber} />}
                        {activeTab === 'notes' && <NotesTab dossier={dossier} />}
                        {activeTab === 'activity' && <ActivityTab />}
                    </div>
                </div>
            </AppShell>
        </>
    );
}

function MetricCard({ label, value, hint, icon: Icon, color = 'text-[var(--foreground)]' }: {
    label: string; value: string | number; hint: string; icon: LucideIcon; color?: string;
}) {
    return (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-sm">
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                    <p className="text-[11px] font-medium text-[var(--text-muted)]">{label}</p>
                    <p className={cn('mt-0.5 text-base font-semibold truncate', color)}>{value}</p>
                </div>
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-2)] text-[var(--text-muted)]">
                    <Icon size={14} />
                </div>
            </div>
            <p className="mt-0.5 text-[10px] text-[var(--text-subtle)]">{hint}</p>
        </div>
    );
}

function InfoField({ label, value }: { label: string; value: string | number | null | undefined }) {
    return (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2">
            <p className="text-[10px] font-medium text-[var(--text-muted)]">{label}</p>
            <p className="mt-0.5 truncate text-[13px] font-semibold text-[var(--foreground)]">{value || '-'}</p>
        </div>
    );
}

function SideCard({ icon: Icon, title, children, color = 'text-[var(--accent)]' }: {
    icon: LucideIcon; title: string; children: React.ReactNode; color?: string;
}) {
    return (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3.5">
            <div className="flex items-center gap-2 mb-2">
                <Icon size={14} className={color} />
                <p className="text-[12px] font-semibold text-[var(--foreground)]">{title}</p>
            </div>
            {children}
        </div>
    );
}

function CompactEmpty({ icon: Icon, title, description }: { icon: LucideIcon; title: string; description: string }) {
    return (
        <div className="flex flex-col items-center gap-1.5 py-6 text-center">
            <Icon size={20} className="text-[var(--text-muted)]/40" />
            <p className="text-[12px] font-medium text-[var(--foreground)]">{title}</p>
            <p className="text-[10px] text-[var(--text-muted)]">{description}</p>
        </div>
    );
}

/* ── Overview tab ── */
function OverviewTab({ dossier, workflow, contract, authorization, archiveRecord }: {
    dossier: DossierRow; workflow: WorkflowData; contract: ContractSummary;
    authorization: AuthorizationSummary; archiveRecord: ArchiveSummary;
}) {
    return (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_280px]">
            <div>
                <h3 className="mb-3 text-sm font-semibold text-[var(--foreground)]">Project information</h3>
                <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                    <InfoField label="Client" value={dossier.clientName} />
                    <InfoField label="Dossier number" value={dossier.dossierNumber} />
                    <InfoField label="Workflow step" value={workflowLabel(dossier.workflowStep)} />
                    <InfoField label="Province" value={dossier.province} />
                    <InfoField label="Commune" value={dossier.commune} />
                    <InfoField label="Land title" value={dossier.landTitleNumber} />
                    <InfoField label="Land surface" value={surface(dossier.landSurface)} />
                    <InfoField label="Floor area" value={surface(dossier.floorArea)} />
                    <InfoField label="Opened at" value={dossier.openedAt} />
                    <InfoField label="Status" value={dossier.status} />
                    <InfoField label="Address" value={dossier.projectAddress} />
                    <InfoField label="Description" value={dossier.description} />
                </div>
            </div>
            <div className="grid gap-3 content-start">
                <SideCard icon={FileText} title="Contract">
                    {contract ? (
                        <div>
                            <p className="text-[13px] font-semibold text-[var(--foreground)]">{contract.contractNumber}</p>
                            <p className="text-[11px] text-[var(--text-muted)]">{contract.status} · {money(contract.ttc)}</p>
                        </div>
                    ) : <p className="text-[12px] text-[var(--text-muted)]">No contract yet.</p>}
                </SideCard>
                <SideCard icon={ShieldCheck} title="Authorization" color="text-sky-500">
                    {authorization ? (
                        <div>
                            <p className="text-[13px] font-semibold text-[var(--foreground)]">{authorization.submissionNumber || authorization.authorizationNumber || '-'}</p>
                            <p className="text-[11px] text-[var(--text-muted)]">{authorization.status}</p>
                        </div>
                    ) : <p className="text-[12px] text-[var(--text-muted)]">No authorization yet.</p>}
                </SideCard>
                <SideCard icon={Archive} title="Archive" color="text-violet-500">
                    {archiveRecord ? (
                        <div>
                            <p className="text-[13px] font-semibold text-[var(--foreground)]">{archiveRecord.archiveNumber}</p>
                            <p className="text-[11px] text-[var(--text-muted)]">{archiveRecord.status}</p>
                        </div>
                    ) : <p className="text-[12px] text-[var(--text-muted)]">Not archived yet.</p>}
                </SideCard>
                <SideCard icon={ArrowLeft} title="Quick navigation">
                    <div className="grid gap-1.5">
                        <AppButton variant="bordered" size="sm" className="justify-start h-8 text-[11px]" onPress={() => router.visit('/documents')}>
                            <FileCheck2 size={13} /> Documents
                        </AppButton>
                        <AppButton variant="bordered" size="sm" className="justify-start h-8 text-[11px]" onPress={() => router.visit('/finance')}>
                            <BadgeDollarSign size={13} /> Finance
                        </AppButton>
                        <AppButton variant="bordered" size="sm" className="justify-start h-8 text-[11px]" onPress={() => router.visit('/dossiers')}>
                            <ArrowLeft size={13} /> Back to projects
                        </AppButton>
                    </div>
                </SideCard>
            </div>
        </div>
    );
}

/* ── Workflow tab ── */
function WorkflowTab({ workflow, selectedStepKey, onSelectStep, dossierId }: {
    workflow: WorkflowData; selectedStepKey: string | null; onSelectStep: (key: string) => void; dossierId: number;
}) {
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
            <CompactEmpty icon={CircleDot} title="No workflow defined"
                description="This project does not have a workflow configured." />
        );
    }

    function statusLabel(status: string) {
        if (status === 'completed') return { label: 'Completed', color: 'text-emerald-400' };
        if (status === 'in_progress') return { label: 'Current step', color: 'text-[var(--accent)]' };
        if (status === 'blocked') return { label: 'Needs attention', color: 'text-red-400' };
        return { label: 'Pending', color: 'text-[var(--text-subtle)]' };
    }

    function StepIcon({ status }: { status: string }) {
        if (status === 'completed') return <Check size={14} strokeWidth={3} />;
        if (status === 'blocked') return <AlertCircle size={14} />;
        return <Circle size={14} />;
    }

    function openAction(url: string | null | undefined) {
        if (!url) return;
        router.visit(url, { preserveScroll: true });
    }

    function updateRequirement(stepKey: string, requirementKey: string, isDone: boolean) {
        const notes = window.prompt(
            isDone ? 'Optional note for this requirement' : 'Optional note to explain cancellation',
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
            onSuccess: () => toast.success('Workflow updated.'),
            onError: () => toast.error('Failed to update workflow.'),
        });
    }

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
                                'flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium transition',
                                isActive && !isCompleted && 'bg-[var(--accent)]/10 text-[var(--accent)] ring-1 ring-[var(--accent)]/20',
                                isCompleted && 'bg-emerald-400/10 text-emerald-400',
                                isBlocked && 'bg-red-400/10 text-red-400',
                                !isActive && !isCompleted && !isBlocked && 'bg-[var(--surface-2)] text-[var(--text-muted)]',
                            )}>
                            <span className={cn(
                                'flex size-5 items-center justify-center rounded-full text-[10px]',
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
                            <p className="text-[13px] font-semibold text-[var(--foreground)]">Workflow Progress</p>
                            <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">
                                Step {workflow.completed + 1} of {workflow.total}
                            </p>
                        </div>
                        <div className="relative mb-3 h-1 overflow-hidden rounded-full bg-[var(--surface-3)]">
                            <div className="h-full rounded-full bg-[var(--accent)] transition-all" style={{ width: `${workflow.percent}%` }} />
                        </div>
                        <p className="mb-4 text-right text-[11px] font-medium text-[var(--text-muted)]">{workflow.percent}%</p>
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
                                                'flex size-7 shrink-0 items-center justify-center rounded-[7px] text-[11px] font-semibold transition-all',
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
                                                        'truncate text-[13px] font-medium',
                                                        isCompleted && 'text-emerald-400',
                                                        isActive && !isCompleted && 'text-[var(--foreground)]',
                                                        !isCompleted && !isActive && 'text-[var(--text-muted)]',
                                                        isBlocked && 'text-red-400',
                                                    )}>
                                                        {step.order}. {step.label}
                                                    </span>
                                                    {step.total > 0 && (
                                                        <span className="ml-auto shrink-0 text-[10px] font-medium text-[var(--text-subtle)]">
                                                            {step.done}/{step.total}
                                                        </span>
                                                    )}
                                                </div>
                                                <span className={cn('block text-[11px]', s.color)}>
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

                {/* Step detail */}
                <div className="flex-1 min-w-0">
                    {activeStep ? (
                        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm h-full flex flex-col">
                            <div className="mb-5">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--text-subtle)]">
                                                STEP {activeStep.order}
                                            </span>
                                            <span className={cn(
                                                'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold',
                                                isComplete && 'bg-emerald-400/12 text-emerald-400',
                                                activeStep.status === 'in_progress' && 'bg-[var(--accent)]/10 text-[var(--accent)]',
                                                activeStep.status === 'blocked' && 'bg-red-400/10 text-red-400',
                                                activeStep.status === 'pending' && 'bg-[var(--surface-3)] text-[var(--text-subtle)]',
                                            )}>
                                                {statusLabel(activeStep.status).label}
                                            </span>
                                        </div>
                                        <h3 className="text-[17px] font-semibold text-[var(--foreground)]">{activeStep.label}</h3>
                                        {activeStep.description && (
                                            <p className="mt-1 text-[13px] leading-relaxed text-[var(--text-muted)]">
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
                                                        <span className="text-[13px] text-[var(--foreground)]">{req.label}</span>
                                                        <div className="flex items-center gap-1.5 shrink-0">
                                                            {!req.done && req.actionUrl && (
                                                                <button type="button" onClick={() => openAction(req.actionUrl)}
                                                                    className="flex items-center gap-1 h-7 rounded-md border border-[var(--border)] px-2.5 text-[11px] font-medium text-[var(--foreground)] transition hover:bg-[var(--surface-2)]">
                                                                    {req.actionLabel || 'Open'}
                                                                </button>
                                                            )}
                                                            {req.manual && (
                                                                <button type="button"
                                                                    onClick={() => updateRequirement(activeStep.key, req.key, !req.done)}
                                                                    className={cn(
                                                                        'flex items-center gap-1 h-7 rounded-md border px-2.5 text-[11px] font-medium transition',
                                                                        req.done
                                                                            ? 'border-red-400/30 text-red-400 hover:bg-red-400/8'
                                                                            : 'border-emerald-400/30 text-emerald-400 hover:bg-emerald-400/8',
                                                                    )}>
                                                                    <Check size={12} />
                                                                    {req.done ? 'Undo' : 'Done'}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {req.notes && (
                                                        <p className="mt-0.5 text-[11px] text-[var(--text-muted)] line-clamp-2">{req.notes}</p>
                                                    )}
                                                    {(req.checkedBy || req.checkedAt) && (
                                                        <p className="mt-0.5 text-[10px] text-[var(--text-subtle)]">
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
                                            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-medium text-[var(--text-muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]">
                                            <ArrowLeft size={14} />
                                            Back
                                        </button>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    {isComplete && nextStep ? (
                                        <button type="button" onClick={() => onSelectStep(nextStep.key)}
                                            className="flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-4 py-1.5 text-[12px] font-semibold text-[var(--accent-foreground)] transition hover:brightness-110">
                                            Next step
                                            <ArrowRight size={14} />
                                        </button>
                                    ) : null}
                                    {activeStep.primaryActionUrl && (
                                        <button type="button" onClick={() => openAction(activeStep.primaryActionUrl)}
                                            className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-4 py-1.5 text-[12px] font-medium text-[var(--foreground)] transition hover:bg-[var(--surface-2)]">
                                            <ExternalLink size={13} />
                                            {activeStep.primaryActionLabel || 'Open'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-10 shadow-sm flex items-center justify-center">
                            <CompactEmpty icon={CircleDot} title="No step selected" description="Select a step from the sidebar to view details." />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ── Documents tab ── */
function DocumentsTab({ documents, dossierNumber }: { documents: DocSummary[]; dossierNumber: string }) {
    return (
        <div>
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-semibold text-[var(--foreground)]">Project documents</h3>
                    <p className="text-xs text-[var(--text-muted)]">{documents.length} document(s)</p>
                </div>
                <AppButton variant="bordered" size="sm" onPress={() => router.visit(`/documents?search=${encodeURIComponent(dossierNumber)}`)}>
                    <FileCheck2 size={14} /> Open documents
                </AppButton>
            </div>
            {documents.length > 0 ? (
                <div className="grid gap-2">
                    {documents.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3.5 py-2.5">
                            <div className="min-w-0">
                                <p className="truncate text-[13px] font-medium text-[var(--foreground)]">{doc.name}</p>
                                <p className="text-[11px] text-[var(--text-muted)]">{doc.fileName || 'No file'} · {doc.uploadedAt || '-'}</p>
                            </div>
                            <StatusPill label={doc.status} color={stepStatusColor(doc.status)} size="sm" />
                        </div>
                    ))}
                </div>
            ) : (
                <CompactEmpty icon={FileCheck2} title="No documents yet" description="Upload documents to track project requirements." />
            )}
        </div>
    );
}

/* ── Contract tab ── */
function ContractTab({ contract, dossierId }: { contract: ContractSummary; dossierId: number }) {
    return (
        <div>
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-semibold text-[var(--foreground)]">Contract</h3>
                    <p className="text-xs text-[var(--text-muted)]">Contract status and actions</p>
                </div>
                <AppButton variant="bordered" size="sm" onPress={() => router.visit(`/contracts?dossier_id=${dossierId}`)}>
                    <FileText size={14} /> Open contracts
                </AppButton>
            </div>
            {contract ? (
                <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-4">
                    <p className="text-base font-semibold text-[var(--foreground)]">{contract.contractNumber}</p>
                    <div className="mt-2 flex flex-wrap gap-4 text-[12px] text-[var(--text-muted)]">
                        <span>Status: <strong className="text-[var(--foreground)]">{contract.status}</strong></span>
                        <span>Amount: <strong className="text-[var(--foreground)]">{money(contract.ttc)}</strong></span>
                    </div>
                </div>
            ) : (
                <CompactEmpty icon={FileText} title="No contract yet" description="Create a contract to start tracking." />
            )}
        </div>
    );
}

/* ── Finance tab ── */
function FinanceTab({ records, total, paid, remaining }: {
    records: FinanceSummary[]; total: number; paid: number; remaining: number;
}) {
    return (
        <div>
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-semibold text-[var(--foreground)]">Finance</h3>
                    <p className="text-xs text-[var(--text-muted)]">{records.length} record(s)</p>
                </div>
                <AppButton variant="bordered" size="sm" onPress={() => router.visit('/finance')}>
                    <BadgeDollarSign size={14} /> Open finance
                </AppButton>
            </div>
            <div className="mb-4 grid gap-3 sm:grid-cols-3">
                <InfoField label="Total TTC" value={money(total)} />
                <InfoField label="Paid" value={money(paid)} />
                <InfoField label="Remaining" value={money(remaining)} />
            </div>
            {records.length > 0 ? (
                <div className="grid gap-2">
                    {records.map((record) => (
                        <div key={record.id} className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3.5 py-2.5">
                            <div className="min-w-0">
                                <p className="truncate text-[13px] font-medium text-[var(--foreground)]">{record.recordNumber}</p>
                                <p className="text-[11px] text-[var(--text-muted)]">{record.type} · {record.status}</p>
                            </div>
                            <span className="text-sm font-semibold text-[var(--accent)]">{money(record.totalTtc)}</span>
                        </div>
                    ))}
                </div>
            ) : (
                <CompactEmpty icon={BadgeDollarSign} title="No finance records" description="Create finance records to track payments." />
            )}
        </div>
    );
}

/* ── Authorizations tab ── */
function AuthorizationsTab({ authorization, dossierId, dossierNumber }: {
    authorization: AuthorizationSummary; dossierId: number; dossierNumber: string;
}) {
    return (
        <div>
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-semibold text-[var(--foreground)]">Authorizations</h3>
                    <p className="text-xs text-[var(--text-muted)]">Rokhas and authorization tracking</p>
                </div>
                <AppButton variant="bordered" size="sm" onPress={() => router.visit(`/authorizations?dossier_id=${dossierId}`)}>
                    <ShieldCheck size={14} /> Open authorizations
                </AppButton>
            </div>
            {authorization ? (
                <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-4">
                    <p className="text-base font-semibold text-[var(--foreground)]">
                        {authorization.submissionNumber || authorization.authorizationNumber || '-'}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-4 text-[12px] text-[var(--text-muted)]">
                        <span>Authority: <strong className="text-[var(--foreground)]">{authorization.authorityName || '-'}</strong></span>
                        <span>Status: <strong className="text-[var(--foreground)]">{authorization.status}</strong></span>
                    </div>
                </div>
            ) : (
                <CompactEmpty icon={ShieldCheck} title="No authorization" description="Submit authorization files through Rokhas to start tracking." />
            )}
        </div>
    );
}

/* ── Notes tab ── */
function NotesTab({ dossier }: { dossier: DossierRow }) {
    return (
        <div>
            <h3 className="mb-1 text-sm font-semibold text-[var(--foreground)]">Notes</h3>
            <p className="mb-4 text-xs text-[var(--text-muted)]">Internal comments related to this project.</p>
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-4">
                <p className="text-[13px] leading-6 text-[var(--text-muted)]">{dossier.notes || 'No notes saved.'}</p>
            </div>
        </div>
    );
}

/* ── Activity tab ── */
function ActivityTab() {
    return (
        <CompactEmpty icon={CircleDot} title="No recent activity" description="Activity will appear as the project progresses." />
    );
}
