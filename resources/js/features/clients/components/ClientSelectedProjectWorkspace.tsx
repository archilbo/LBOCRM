import { router } from '@inertiajs/react';
import { IconArchive, IconCoin, IconCircleCheck, IconFileText, IconFolderOpen, IconBuildingBank, IconPlus, IconReceipt2, IconCloudUpload } from '@tabler/icons-react';

import { TabPanel } from 'react-aria-components';
import { AppCompactTabs } from '@/components/ui/AppCompactTabs';
import { ClientProjectWorkflowStepper, type WorkflowRequirementActionContext } from '@/features/clients/components/ClientProjectWorkflowStepper';
import { DocumentIntelligenceChecklist } from '@/features/clients/components/DocumentIntelligenceChecklist';
import { DossierTimeline } from '@/features/clients/components/DossierTimeline';
import type {
    ClientProjectDocument,
    ClientProjectFinanceDocument,
    ClientProjectPayment,
    ClientSelectedProjectWorkspace as SelectedProject,
    DossierWorkflowStep,
} from '@/features/clients/types';

const FORCE_CLIENT_SELECTED_WORKSPACE_53JC = true;

type ClientSelectedProjectWorkspaceProps = {
    project: SelectedProject | null;
    onCreateProject?: () => void;
    onUploadDocument?: (context?: ClientWorkflowActionContext) => void;
    onCreateContract?: (context?: ClientWorkflowActionContext) => void;
    onCreateFinanceDocument?: (type: string) => void;
    onCreateArchive?: () => void;
};

export type ClientWorkflowActionContext = {
    step?: DossierWorkflowStep;
    requirement?: WorkflowRequirementActionContext['requirement'];
};

function money(value: number, currency = 'MAD') {
    return `${Number(value || 0).toLocaleString('fr-MA')} ${currency}`;
}

function EmptyState({ title, description }: { title: string; description: string }) {
    return (
        <div className="rounded-xl border border-dashed border-[var(--crm-border)] bg-black/10 px-4 py-8 text-center">
            <p className="text-sm font-bold text-[var(--crm-text)]">{title}</p>
            <p className="mt-1 text-xs text-[var(--crm-muted)]">{description}</p>
        </div>
    );
}

function DocumentList({ documents }: { documents: ClientProjectDocument[] }) {
    if (documents.length === 0) {
        return <EmptyState title="No documents" description="Project documents will appear here." />;
    }

    return (
        <div className="grid gap-2">
            {documents.map((document) => (
                <div key={document.id} className="flex items-center justify-between gap-3 rounded-xl border border-[var(--crm-border)] bg-[var(--crm-elevated)] px-3 py-2">
                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{document.name}</p>
                        <p className="text-xs text-[var(--crm-muted)]">{document.documentNumber || document.originalFilename || '-'}</p>
                    </div>
                    <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-2 py-1 text-xs font-bold text-blue-300">
                        {document.status}
                    </span>
                </div>
            ))}
        </div>
    );
}

function FinanceList({ documents, currency }: { documents: ClientProjectFinanceDocument[]; currency: string }) {
    if (documents.length === 0) {
        return <EmptyState title="No finance documents" description="Quotes, invoices and receipts will appear here." />;
    }

    return (
        <div className="grid gap-2">
            {documents.map((document) => (
                <div key={document.id} className="grid gap-2 rounded-xl border border-[var(--crm-border)] bg-[var(--crm-elevated)] px-3 py-2 md:grid-cols-[1fr_auto] md:items-center">
                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{document.number}</p>
                        <p className="text-xs text-[var(--crm-muted)]">{document.type} / {document.status}</p>
                    </div>
                    <div className="text-sm font-black text-[var(--crm-accent)]">{money(document.totalTtc, currency)}</div>
                </div>
            ))}
        </div>
    );
}

function PaymentList({ payments, currency }: { payments: ClientProjectPayment[]; currency: string }) {
    if (payments.length === 0) {
        return <EmptyState title="No payments" description="Recorded payments will appear here." />;
    }

    return (
        <div className="grid gap-2">
            {payments.map((payment) => (
                <div key={payment.id} className="grid gap-2 rounded-xl border border-[var(--crm-border)] bg-[var(--crm-elevated)] px-3 py-2 md:grid-cols-[1fr_auto] md:items-center">
                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{payment.paymentNumber}</p>
                        <p className="text-xs text-[var(--crm-muted)]">{payment.documentNumber || '-'} / {payment.method || '-'}</p>
                    </div>
                    <div className="text-sm font-black text-emerald-300">{money(payment.amount, currency)}</div>
                </div>
            ))}
        </div>
    );
}

function StatTile({
    label,
    value,
    icon: Icon,
}: {
    label: string;
    value: string | number;
    icon: typeof IconFileText;
}) {
    return (
        <div className="rounded-xl border border-[var(--crm-border)] bg-[var(--crm-elevated)] p-3">
            <div className="flex items-center gap-2 text-xs text-[var(--crm-muted)]">
                <Icon size={14} className="text-[var(--crm-accent)]" />
                {label}
            </div>
            <p className="mt-2 text-base font-black text-[var(--crm-text)]">{value}</p>
        </div>
    );
}

export function ClientSelectedProjectWorkspace({
    project,
    onCreateProject,
    onUploadDocument,
    onCreateContract,
    onCreateFinanceDocument,
    onCreateArchive,
}: ClientSelectedProjectWorkspaceProps) {
    if (!project) {
        return (
            <section className="crm-panel p-6" data-ui-marker={FORCE_CLIENT_SELECTED_WORKSPACE_53JC ? 'FORCE_CLIENT_SELECTED_WORKSPACE_53JC' : undefined}>
                <div className="grid gap-4">
                    <EmptyState title="Select a project" description="Choose a project from the left column to see its documents, finance and workflow state." />
                    {onCreateProject ? (
                        <button
                            type="button"
                            className="crm-action-button justify-center border-[var(--crm-accent)] bg-[color-mix(in_srgb,var(--crm-accent)_14%,transparent)] py-3 text-[var(--crm-accent)]"
                            onClick={onCreateProject}
                        >
                            <IconPlus size={15} />
                            Create project for this client
                        </button>
                    ) : null}
                </div>
            </section>
        );
    }

    const currency = project.currency || 'MAD';
    const tabs = [
        { id: 'overview', label: 'Vue generale' },
        { id: 'workflow', label: 'Workflow' },
        { id: 'documents', label: `Documents (${project.documents.length})` },
        { id: 'finance', label: 'Finance' },
        { id: 'records', label: 'Suivi' },
    ];

    function handleWorkflowStepAction(step: DossierWorkflowStep) {
        if (step.key === 'contract') {
            onCreateContract?.({ step });
            return;
        }

        if (step.key === 'archive') {
            onCreateArchive?.();
            return;
        }

        onUploadDocument?.({ step });
    }

    function handleWorkflowRequirementAction({ step, requirement }: WorkflowRequirementActionContext) {
        if (step.key === 'contract') {
            onCreateContract?.({ step, requirement });
            return;
        }

        if (step.key === 'archive' && requirement.key === 'archive_created') {
            onCreateArchive?.();
            return;
        }

        onUploadDocument?.({ step, requirement });
    }

    return (
        <section className="grid gap-5" data-ui-marker={FORCE_CLIENT_SELECTED_WORKSPACE_53JC ? 'FORCE_CLIENT_SELECTED_WORKSPACE_53JC' : undefined}>
            <div className="crm-panel p-5">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <h2 className="truncate text-xl font-black text-[var(--crm-text)]">{project.projectObject || project.dossierNumber}</h2>
                            <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-xs font-bold text-emerald-300">
                                {project.status}
                            </span>
                            <span className="rounded-full border border-[var(--crm-border)] bg-black/20 px-2 py-1 text-xs font-bold text-[var(--crm-muted)]">
                                {project.workflowStep}
                            </span>
                        </div>
                        <p className="mt-1 text-sm text-[var(--crm-muted)]">{project.dossierNumber}</p>
                        <p className="mt-2 text-sm text-[var(--crm-text-muted)]">
                            {[project.province, project.commune, project.projectAddress].filter(Boolean).join(' / ') || 'No location'}
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <button type="button" className="crm-action-button border-[var(--crm-accent)] bg-[color-mix(in_srgb,var(--crm-accent)_14%,transparent)] text-[var(--crm-accent)]" onClick={() => onUploadDocument?.()}>
                            <IconCloudUpload size={15} />
                            Upload document
                        </button>
                        <button type="button" className="crm-action-button" onClick={() => onCreateContract?.()}>
                            <IconPlus size={15} />
                            Create contract
                        </button>
                        <button type="button" className="crm-action-button" onClick={() => router.visit(`/dossiers/${project.id}`)}>
                            <IconFolderOpen size={15} />
                            Open project
                        </button>
                        <button type="button" className="crm-action-button" onClick={() => router.visit('/finance')}>
                            <IconCoin size={15} />
                            Finance
                        </button>
                    </div>
                </div>
            </div>

            <AppCompactTabs tabs={tabs} defaultSelectedKey="workflow" className="crm-panel p-5">
                <TabPanel id="overview" className="outline-none">
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                        <StatTile label="Documents" value={project.documentsCount} icon={IconFileText} />
                        <StatTile label="Quotes" value={money(project.quotesTotal, currency)} icon={IconReceipt2} />
                        <StatTile label="Invoices" value={money(project.invoicesTotal, currency)} icon={IconBuildingBank} />
                        <StatTile label="Remaining" value={money(project.remainingTotal, currency)} icon={IconCoin} />
                    </div>

                    <div className="mt-5 grid gap-5 xl:grid-cols-3">
                        <div className="rounded-xl border border-[var(--crm-border)] bg-[var(--crm-elevated)] p-4">
                            <div className="flex items-center gap-2">
                                <IconCircleCheck size={15} className="text-emerald-300" />
                                <h3 className="text-sm font-black">Contract</h3>
                            </div>
                            <p className="mt-3 text-sm text-[var(--crm-muted)]">
                                {project.contract
                                    ? `${project.contract.number} / ${project.contract.status} / ${money(project.contract.ttc, currency)}`
                                    : 'No contract linked.'}
                            </p>
                        </div>

                        <div className="rounded-xl border border-[var(--crm-border)] bg-[var(--crm-elevated)] p-4">
                            <div className="flex items-center gap-2">
                                <IconArchive size={15} className="text-[var(--crm-accent)]" />
                                <h3 className="text-sm font-black">IconArchive</h3>
                            </div>
                            <p className="mt-3 text-sm text-[var(--crm-muted)]">
                                {project.archiveRecord
                                    ? `${project.archiveRecord.archiveNumber} / ${project.archiveRecord.status}`
                                    : 'No archive linked.'}
                            </p>
                        </div>
                    </div>
                </TabPanel>

                <TabPanel id="workflow" className="outline-none">
                    <ClientProjectWorkflowStepper
                        dossierId={project.id}
                        workflow={project.workflow}
                        onStepAction={handleWorkflowStepAction}
                        onRequirementAction={handleWorkflowRequirementAction}
                    />
                </TabPanel>

                <TabPanel id="documents" className="outline-none">
                    <div className="mb-4">
                        <DocumentIntelligenceChecklist
                            workflow={project.workflow}
                            documents={project.documents}
                            onUploadDocument={() => onUploadDocument?.()}
                        />
                    </div>
                    <div className="mb-3 flex justify-end">
                        <button type="button" className="crm-action-button border-[var(--crm-accent)] bg-[color-mix(in_srgb,var(--crm-accent)_14%,transparent)] text-[var(--crm-accent)]" onClick={() => onUploadDocument?.()}>
                            <IconCloudUpload size={15} />
                            Upload document
                        </button>
                    </div>
                    <DocumentList documents={project.documents} />
                </TabPanel>

                <TabPanel id="finance" className="outline-none">
                    <div className="mb-4 flex flex-wrap gap-2">
                        <button
                            type="button"
                            className="crm-action-button border-[var(--crm-accent)] bg-[color-mix(in_srgb,var(--crm-accent)_14%,transparent)] text-[var(--crm-accent)]"
                            onClick={() => onCreateFinanceDocument?.('quote')}
                        >
                            <IconReceipt2 size={14} />
                            New quote
                        </button>
                        <button
                            type="button"
                            className="crm-action-button border-amber-500/30 bg-amber-500/10 text-amber-300"
                            onClick={() => onCreateFinanceDocument?.('invoice')}
                        >
                            <IconBuildingBank size={14} />
                            New invoice
                        </button>
                        <button
                            type="button"
                            className="crm-action-button border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                            onClick={() => onCreateFinanceDocument?.('receipt')}
                        >
                            <IconCoin size={14} />
                            New receipt
                        </button>
                    </div>
                    <div className="grid gap-5 xl:grid-cols-2">
                        <div>
                            <div className="mb-3 flex items-center justify-between">
                                <h3 className="text-sm font-black">Quotes, invoices and receipts</h3>
                                <span className="rounded-full bg-violet-500/10 px-2 py-1 text-xs font-bold text-violet-300">{project.financeDocuments.length}</span>
                            </div>
                            <FinanceList documents={project.financeDocuments} currency={currency} />
                        </div>
                        <div>
                            <div className="mb-3 flex items-center justify-between">
                                <h3 className="text-sm font-black">Payments</h3>
                                <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-bold text-emerald-300">{project.payments.length}</span>
                            </div>
                            <PaymentList payments={project.payments} currency={currency} />
                        </div>
                    </div>
                </TabPanel>

                <TabPanel id="records" className="outline-none">
                    <div className="mb-5 grid gap-5 xl:grid-cols-3">
                        <div className="rounded-xl border border-[var(--crm-border)] bg-[var(--crm-elevated)] p-4">
                            <h3 className="text-sm font-black">IconArchive</h3>
                            <p className="mt-3 text-sm text-[var(--crm-muted)]">
                                {project.archiveRecord
                                    ? `${project.archiveRecord.archiveNumber} / ${project.archiveRecord.status}`
                                    : 'No archive linked.'}
                            </p>
                        </div>
                        <div className="rounded-xl border border-[var(--crm-border)] bg-[var(--crm-elevated)] p-4">
                            <h3 className="text-sm font-black">Project status</h3>
                            <p className="mt-3 text-sm text-[var(--crm-muted)]">{project.status} / {project.workflowStep}</p>
                        </div>
                    </div>
                    <h3 className="mb-2 text-sm font-black uppercase tracking-[0.14em] text-[var(--crm-muted)]">Activity timeline</h3>
                    <DossierTimeline events={project.timeline} />
                </TabPanel>
            </AppCompactTabs>
        </section>
    );
}
